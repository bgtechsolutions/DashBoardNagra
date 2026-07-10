import {
  isQualif, isContact, isCurious, isFechado, isNaoQuer,
  isAguard, isVendedor, isInterno, VENDEDORES,
} from "./status";
import { parseDataBR } from "./csv";

// ─── Métricas por DATA DO EVENTO ──────────────────────────────
// `allRows`  = TODO o histórico (não filtrado).
// `inRange`  = fn(dataStr) → true se a data DO EVENTO cai no período.
//
// Regra: cada métrica conta o que ACONTECEU dentro do período (a data da
// linha na planilha), e não a data de entrada do lead. Ex.: um lead que
// entrou em 25/06 e foi entregue a um vendedor em 07/07 conta em 07/07.
export function calcMetrics(allRows, inRange) {
  // Ponte crmRecordId → telefone (mudanças de status/vendedor vêm sem telefone).
  const recToPhone = {};
  allRows.forEach((d) => {
    const nome = (d.nome || "").trim();
    const num  = (d.numero || "").trim();
    if (nome && num && !recToPhone[nome]) recToPhone[nome] = num;
  });
  const keyOf = (d) => {
    const num = (d.numero || "").trim();
    if (num) return num;
    const nome = (d.nome || "").trim();
    return recToPhone[nome] || nome;
  };

  // Contatos internos (em qualquer momento do histórico) — nunca contam.
  const internoKeys = new Set();
  allRows.forEach((d) => { if (isInterno(d.statusNovo)) { const k = keyOf(d); if (k) internoKeys.add(k); } });
  const notInterno = (k) => k && !internoKeys.has(k);

  // Eventos DENTRO do período (data do evento).
  const rowsIn = allRows.filter((d) => inRange(d.data));

  // Chaves distintas cujo evento no período satisfaz o predicado.
  const distinct = (pred) => {
    const s = new Set();
    rowsIn.forEach((d) => { if (pred(d)) { const k = keyOf(d); if (notInterno(k)) s.add(k); } });
    return s;
  };

  // 1. Leads recebidos = "Lead Criado" no período
  const createdSet = distinct((d) => d.evento === "Lead Criado");
  const leads = createdSet.size;

  // 2. Buckets por transição ocorrida no período (contato distinto)
  const contactSet = distinct((d) => isContact(d.statusNovo));
  const curiousSet = distinct((d) => isCurious(d.statusNovo));
  const qualifSet  = distinct((d) => isQualif(d.statusNovo));
  const fechadoSet = distinct((d) => isFechado(d.statusNovo));
  const naoQuerSet = distinct((d) => isNaoQuer(d.statusNovo));
  const aguardSet  = distinct((d) => isAguard(d.statusNovo));
  const vendSet    = distinct((d) => isVendedor(d.statusNovo));

  const nowContact = contactSet.size;
  const nowCurious = curiousSet.size;
  const nowQualif  = qualifSet.size;
  const fechado    = fechadoSet.size;
  const naoQuer    = naoQuerSet.size;
  const aguardando = aguardSet.size;
  const comVendedor = vendSet.size;

  // 3. Taxa = qualificações no período ÷ leads recebidos no período.
  //    (Pode passar de 100% em dias com muita qualificação de leads antigos.)
  const rate = leads > 0 ? Math.round((nowQualif / leads) * 100) : 0;

  // 4. Por vendedor — chaves distintas entregues a cada um no período.
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const byVendedor = {};
  VENDEDORES.forEach((v) => {
    const s = new Set();
    rowsIn.forEach((d) => {
      if ((d.statusNovo || "").trim().toLowerCase() === v) { const k = keyOf(d); if (notInterno(k)) s.add(k); }
    });
    if (s.size) byVendedor[cap(v)] = s.size;
  });

  // 5. "Ainda como Lead" (funil): recebidos no período que não avançaram
  //    para nenhum outro estágio dentro do período.
  const advanced = new Set([
    ...contactSet, ...curiousSet, ...qualifSet,
    ...vendSet, ...fechadoSet, ...naoQuerSet, ...aguardSet,
  ]);
  const stillLead = [...createdSet].filter((k) => !advanced.has(k)).length;

  // 5b. Tempo até qualificação (dos leads qualificados NO período).
  //     Duração = 1ª qualificação no período − data de entrada do lead.
  const createdAt = {};
  allRows.forEach((d) => {
    if (d.evento !== "Lead Criado") return;
    const k = keyOf(d); const t = parseDataBR(d.data).getTime();
    if (k && (createdAt[k] == null || t < createdAt[k])) createdAt[k] = t;
  });
  const firstAnyAt = {};
  allRows.forEach((d) => {
    const k = keyOf(d); const t = parseDataBR(d.data).getTime();
    if (k && (firstAnyAt[k] == null || t < firstAnyAt[k])) firstAnyAt[k] = t;
  });
  const qualifAtInPeriod = {};
  rowsIn.forEach((d) => {
    if (!isQualif(d.statusNovo)) return;
    const k = keyOf(d); if (!notInterno(k)) return;
    const t = parseDataBR(d.data).getTime();
    if (qualifAtInPeriod[k] == null || t < qualifAtInPeriod[k]) qualifAtInPeriod[k] = t;
  });
  const durs = [];
  Object.keys(qualifAtInPeriod).forEach((k) => {
    const base = createdAt[k] ?? firstAnyAt[k];
    if (base == null) return;
    const dt = qualifAtInPeriod[k] - base;
    if (dt >= 0) durs.push(dt);
  });
  durs.sort((a, b) => a - b);
  const tempoQualif = durs.length ? {
    avgMs:    durs.reduce((s, x) => s + x, 0) / durs.length,
    medianMs: durs[Math.floor(durs.length / 2)],
    n:        durs.length,
  } : null;

  // 6. Origem — leads recebidos no período, pela origem do "Lead Criado".
  const origemByKey = {};
  rowsIn.forEach((d) => {
    if (d.evento !== "Lead Criado") return;
    const k = keyOf(d);
    if (!notInterno(k) || origemByKey[k]) return;
    origemByKey[k] = normOrigem(d.origem) || "indefinido";
  });
  const byOrigem = {
    meta:       { leads: 0, qualif: 0 },
    google:     { leads: 0, qualif: 0 },
    indefinido: { leads: 0, qualif: 0 },
  };
  createdSet.forEach((k) => {
    const o = origemByKey[k] || "indefinido";
    byOrigem[o].leads++;
    if (qualifSet.has(k)) byOrigem[o].qualif++;
  });

  return {
    leads, stillLead, contact: nowContact, curious: nowCurious,
    qualif: nowQualif, qualifAtual: nowQualif, rate, fechado, naoQuer,
    leadsSet: createdSet, byOrigem, byVendedor, comVendedor, aguardando,
    tempoQualif,
  };
}

// Aceita rótulos variados ("Meta Ads", "meta", "google", …) → 3 chaves.
function normOrigem(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("meta") || v.includes("face") || v.includes("insta")) return "meta";
  if (v.includes("google") || v.includes("ads") && !v.includes("meta")) return "google";
  return "";
}
