import { isQualif, isContact, isCurious, isLead, isFechado, isNaoQuer, isInterno, VENDEDORES } from "./status";
import { parseDataBR } from "./csv";

// ─── Métricas por COORTE ──────────────────────────────────────
// `allRows`  = TODO o histórico (não filtrado).
// `inCohort` = fn(dataStr) → true se a data de criação cai no período.
export function calcMetrics(allRows, inCohort) {
  // Ponte crmRecordId → telefone (mudanças de vendedor vêm sem telefone).
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

  // 1. Coorte = leads criados dentro do período
  const criados = new Set();
  allRows.filter(d => d.evento === "Lead Criado" && inCohort(d.data))
         .forEach(d => { const k = keyOf(d); if (k) criados.add(k); });

  // 2. Status ATUAL de cada contato — histórico inteiro, ordem cronológica
  const latestStatus = {};
  const sorted = [...allRows].sort((a, b) => parseDataBR(a.data) - parseDataBR(b.data));
  sorted.forEach((d) => {
    const k = keyOf(d);
    if (!k) return;
    if (d.evento === "Lead Criado") latestStatus[k] = "lead";
    if (d.statusNovo.trim()) latestStatus[k] = d.statusNovo.trim().toLowerCase();
  });

  // Remove contatos internos (não são leads reais).
  const leadsSet = new Set([...criados].filter(k => !isInterno(latestStatus[k])));
  const leads = leadsSet.size;

  // 3. Status atual — só da coorte
  const cohortStatuses = [...leadsSet].map(k => latestStatus[k]).filter(Boolean);
  const stillLead   = cohortStatuses.filter(isLead).length;
  const nowContact  = cohortStatuses.filter(isContact).length;
  const nowCurious  = cohortStatuses.filter(isCurious).length;
  const qualifAtual = cohortStatuses.filter(isQualif).length;   // qualificados AGORA (funil)
  const fechado     = cohortStatuses.filter(isFechado).length;  // clientes finalizados
  const naoQuer     = cohortStatuses.filter(isNaoQuer).length;  // perdidos

  // 4. QUALIFICADOS (KPI) = coorte que qualificou em ALGUM momento
  const everQualifSet = new Set(
    allRows.filter(d => isQualif(d.statusNovo))
     .map(d => keyOf(d))
     .filter(k => k && leadsSet.has(k))
  );
  const nowQualif = everQualifSet.size;
  const rate      = leads > 0 ? Math.round((nowQualif / leads) * 100) : 0;

  // 5. Origem por contato (histórico inteiro), só da coorte
  const origemByKey = {};
  allRows.forEach((d) => {
    const k = keyOf(d);
    if (!k || !leadsSet.has(k)) return;
    if (origemByKey[k]) return;
    const o = normOrigem(d.origem);
    if (o) origemByKey[k] = o;
  });
  const byOrigem = {
    meta:       { leads: 0, qualif: 0 },
    google:     { leads: 0, qualif: 0 },
    indefinido: { leads: 0, qualif: 0 },
  };
  leadsSet.forEach((k) => {
    const o = origemByKey[k] || "indefinido";
    byOrigem[o].leads++;
    if (everQualifSet.has(k)) byOrigem[o].qualif++;
  });

  // 6. Vendedores + aguardando — status ATUAL da coorte
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const byVendedor = {};
  let comVendedor = 0;
  let aguardando  = 0;
  cohortStatuses.forEach((s) => {
    if (VENDEDORES.includes(s)) { byVendedor[cap(s)] = (byVendedor[cap(s)] || 0) + 1; comVendedor++; }
    else if (s === "responder") { aguardando++; }
  });

  return {
    leads, stillLead, contact: nowContact, curious: nowCurious,
    qualif: nowQualif, qualifAtual, rate, fechado, naoQuer,
    latestStatus, leadsSet, byOrigem, byVendedor, comVendedor, aguardando,
  };
}

// Aceita rótulos variados ("Meta Ads", "meta", "google", …) → 3 chaves.
function normOrigem(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("meta") || v.includes("face") || v.includes("insta")) return "meta";
  if (v.includes("google") || v.includes("ads") && !v.includes("meta")) return "google";
  return "";
}
