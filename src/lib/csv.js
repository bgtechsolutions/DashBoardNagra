// ─── CSV parser ──────────────────────────────────────────────
function splitLine(line) {
  const cols = []; let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  cols.push(cur.trim());
  return cols;
}

export function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const cols = splitLine(line);
    return {
      data: cols[0] || "", evento: cols[1] || "", nome: cols[2] || "",
      numero: cols[3] || "", statusAnterior: cols[4] || "", statusNovo: cols[5] || "",
      // Coluna opcional "Origem" (Meta Ads / Google Ads / Indefinido).
      // Populada pelo n8n; ausente = tratada como indefinido.
      origem: cols[6] || "",
    };
  }).filter((d) => d.data && d.data !== "Data");
}

export function parseDataBR(str) {
  const [d, t] = str.trim().split(" ");
  const [dd, mm, yyyy] = d.split("/");
  return new Date(`${yyyy}-${mm}-${dd}T${t || "00:00"}:00`);
}

// ─── Aba de custos (Data, Custo) ─────────────────────────────
// Alimentada pelo n8n a partir da Costs API da OpenAI: uma linha por dia.
// Aceita valor em dólar (12.34) ou reais (R$ 12,34) — detecta a moeda.
export function parseCustosCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const cols = splitLine(line);
    const raw = cols[1] || "";
    return { data: cols[0] || "", custo: parseValor(raw), brl: /r\$/i.test(raw) };
  }).filter((d) => d.data && d.data.toLowerCase() !== "data");
}

// "R$ 1.234,56" → 1234.56 · "12.34" → 12.34 · "12,34" → 12.34
function parseValor(raw) {
  let s = (raw || "").replace(/[^0-9.,-]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
