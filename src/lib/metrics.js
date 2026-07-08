import { isQualif, isContact, isCurious, isLead, VENDEDORES } from "./status";
import { parseDataBR } from "./csv";

// ─── Métricas por COORTE ──────────────────────────────────────
// `allRows`  = TODO o histórico (não filtrado).
// `inCohort` = fn(dataStr) → true se a data de criação cai no período.
//
// A data do filtro define QUANDO o lead entrou (coorte). O status/qualificação
// é lido do histórico INTEIRO — então um lead que entrou em junho e fechou em
// julho conta como qualificado na coorte de junho. Isso dá a taxa real de
// conversão (períodos recentes ficam "em maturação", o que é honesto).
export function calcMetrics(allRows, inCohort) {
  const key = (d) => (d.numero || "").trim() || (d.nome || "").trim();

  // 1. Coorte = leads criados dentro do período
  const leadsSet = new Set();
  allRows.filter(d => d.evento === "Lead Criado" && inCohort(d.data))
         .forEach(d => { if (key(d)) leadsSet.add(key(d)); });
  const leads = leadsSet.size;

  // 2. Status ATUAL de cada contato — calculado sobre o HISTÓRICO INTEIRO
  const latestStatus = {};
  const sorted = [...allRows].sort((a, b) => parseDataBR(a.data) - parseDataBR(b.data));
  sorted.forEach((d) => {
    const k = key(d);
    if (!k) return;
    if (d.evento === "Lead Criado") latestStatus[k] = "lead";
    if (d.statusNovo.trim()) latestStatus[k] = d.statusNovo.trim().toLowerCase();
  });

  // 3. Status atual — só da coorte
  const cohortStatuses = [...leadsSet].map(k => latestStatus[k]).filter(Boolean);
  const stillLead  = cohortStatuses.filter(isLead).length;
  const nowContact = cohortStatuses.filter(isContact).length;
  const nowCurious = cohortStatuses.filter(isCurious).length;

  // 4. QUALIFICADOS: leads da coorte que em ALGUM MOMENTO qualificaram (todo o histórico)
  const everQualifSet = new Set(
    allRows.filter(d => isQualif(d.statusNovo))
     .map(d => key(d))
     .filter(k => k && leadsSet.has(k))
  );
  const nowQualif = everQualifSet.size;
  const rate      = leads > 0 ? Math.round((nowQualif / leads) * 100) : 0;

  // 5. Origem por contato (histórico inteiro), só da coorte
  const origemByKey = {};
  allRows.forEach((d) => {
    const k = key(d);
    if (!k || !leadsSet.has(k)) return;
    if (origemByKey[k]) return;          // mantém a primeira origem vista
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
    leads, stillLead, contact: nowContact, curious: nowCurious, qualif: nowQualif, rate,
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
