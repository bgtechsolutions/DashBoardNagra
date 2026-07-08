import { isQualif, isContact, isCurious, isLead, VENDEDORES } from "./status";

// ─── Calcular métricas por contatos únicos ────────────────────
// Retorna objeto com todos os KPIs calculados corretamente
export function calcMetrics(f) {
  // 1. Chave única por contato = número de telefone ou nome
  const key = (d) => (d.numero || "").trim() || (d.nome || "").trim();

  // 2. Leads criados no período (únicos)
  const leadsSet = new Set();
  f.filter(d => d.evento === "Lead Criado").forEach(d => { if (key(d)) leadsSet.add(key(d)); });
  const leads = leadsSet.size;

  // 3. Rastrear o status ATUAL de cada contato (para breakdown de status atual)
  const latestStatus = {};
  const sorted = [...f].sort((a, b) => a.data.localeCompare(b.data));
  sorted.forEach((d) => {
    const k = key(d);
    if (!k) return;
    if (d.evento === "Lead Criado") latestStatus[k] = "lead";
    if (d.statusNovo.trim()) latestStatus[k] = d.statusNovo.trim().toLowerCase();
  });

  // 4. Status atual — apenas contatos que vieram de "Lead Criado"
  // isContact inclui "responder" (aguardando resposta = ainda em andamento)
  // isCurious inclui "proposal" (= curioso conforme cliente)
  const statuses = Object.entries(latestStatus)
    .filter(([k]) => leadsSet.has(k))
    .map(([, s]) => s);

  const stillLead  = statuses.filter(s => isLead(s)).length;
  const nowContact = statuses.filter(s => isContact(s)).length;
  const nowCurious = statuses.filter(s => isCurious(s)).length;

  // QUALIFICADOS: conta contatos que em ALGUM MOMENTO tiveram statusNovo = qualified/qualificado
  // O número NUNCA diminui — mesmo que o lead vá para giovani/murilo/etc depois
  const everQualifSet = new Set(
    f.filter(d => isQualif(d.statusNovo))
     .map(d => key(d))
     .filter(k => k && leadsSet.has(k))
  );
  const nowQualif = everQualifSet.size;
  const rate      = leads > 0 ? Math.round((nowQualif / leads) * 100) : 0;

  // 5. Origem por contato (Meta / Google / Indefinido) — vem da coluna
  // "Origem" gravada na linha de "Lead Criado". Cruza com qualificado.
  const origemByKey = {};
  f.forEach((d) => {
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

  // 6. Vendedores humanos — status ATUAL vira o nome de quem recebeu o lead.
  // Bate com as colunas do kanban (Giovani, Alessandro, Murilo).
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const byVendedor = {};
  let comVendedor = 0;
  let aguardando  = 0;
  Object.values(latestStatus).forEach((s) => {
    if (VENDEDORES.includes(s)) { byVendedor[cap(s)] = (byVendedor[cap(s)] || 0) + 1; comVendedor++; }
    else if (s === "responder") { aguardando++; }
  });

  return {
    leads, stillLead, contact: nowContact, curious: nowCurious, qualif: nowQualif, rate,
    latestStatus, leadsSet, byOrigem, byVendedor, comVendedor, aguardando,
  };
}

// Aceita rótulos variados da planilha ("Meta Ads", "meta", "google", …)
// e reduz para as três chaves canônicas.
function normOrigem(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("meta") || v.includes("face") || v.includes("insta")) return "meta";
  if (v.includes("google") || v.includes("ads") && !v.includes("meta")) return "google";
  return "";
}
