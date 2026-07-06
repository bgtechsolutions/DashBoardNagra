import { isQualif, isContact, isCurious, isLead } from "./status";

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

  return { leads, stillLead, contact: nowContact, curious: nowCurious, qualif: nowQualif, rate, latestStatus, leadsSet };
}
