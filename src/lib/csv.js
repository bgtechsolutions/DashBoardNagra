// ─── CSV parser ──────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const cols = []; let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cols.push(cur.trim());
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
