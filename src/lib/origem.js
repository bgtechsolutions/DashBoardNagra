// ─── Atribuição de origem do lead (Meta Ads vs Google Ads) ───
// Detecta a origem pela PRIMEIRA mensagem do cliente, comparando com os
// textos padrão que cada anúncio pré-preenche no WhatsApp.
//
// Limitação conhecida: se o cliente apagar/editar muito a mensagem padrão,
// a origem fica "indefinido". Por isso o resultado é uma AMOSTRAGEM, não
// uma contagem exata — mas cobre a maioria dos leads que mantêm o texto.
//
// Esta função é a fonte única da verdade: usada na dashboard e também
// pode ser colada num node Code do n8n para gravar a coluna "Origem".

// Normaliza: minúsculas, sem acento, sem pontuação, espaços colapsados.
export function normalizar(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Frases distintivas (alta confiança) — trechos que praticamente só
// aparecem no texto padrão de cada canal.
const SINAIS_GOOGLE = ["quero saber mais sobre a ng"];
const SINAIS_META = [
  "fazem entrega para todo o brasil",
  "interesse em comprar uma mini escavadeira",
];
// Sinal fraco: genérico, um cliente poderia digitar sozinho → baixa confiança.
const SINAIS_META_FRACO = ["tenho interesse em comprar"];

// Templates completos para similaridade (tolera edições leves).
const TEMPLATES = [
  { origem: "google", texto: "ola quero saber mais sobre a ng" },
  { origem: "meta",   texto: "tenho interesse em comprar voces fazem entrega para todo o brasil" },
  { origem: "meta",   texto: "ola tenho interesse em comprar uma mini escavadeira e quero mais informacoes" },
];

// Coeficiente de Dice sobre bigramas — 0 (nada a ver) a 1 (idêntico).
function similaridade(a, b) {
  const big = (s) => {
    const t = s.replace(/\s/g, "");
    const set = new Set();
    for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2));
    return set;
  };
  const A = big(a), B = big(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size);
}

// Retorna { origem: 'meta'|'google'|'indefinido', confianca: 'alta'|'media'|'baixa' }
export function classificarOrigem(texto) {
  const t = normalizar(texto);
  if (!t) return { origem: "indefinido", confianca: "baixa" };

  if (SINAIS_GOOGLE.some((p) => t.includes(p))) return { origem: "google", confianca: "alta" };
  if (SINAIS_META.some((p)   => t.includes(p))) return { origem: "meta",   confianca: "alta" };

  // Similaridade contra os templates completos (pega edições leves).
  let melhor = { origem: "indefinido", sim: 0 };
  for (const tpl of TEMPLATES) {
    const s = similaridade(t, tpl.texto);
    if (s > melhor.sim) melhor = { origem: tpl.origem, sim: s };
  }
  if (melhor.sim >= 0.72) return { origem: melhor.origem, confianca: "media" };

  if (SINAIS_META_FRACO.some((p) => t.includes(p))) return { origem: "meta", confianca: "baixa" };

  return { origem: "indefinido", confianca: "baixa" };
}

// Normaliza o rótulo de origem da planilha ("Meta Ads", "google"…) para chave.
export function origemKey(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("meta") || v.includes("face") || v.includes("insta")) return "meta";
  if (v.includes("google")) return "google";
  return "indefinido";
}

// Rótulos e cores para a UI.
export const ORIGEM_META = {
  meta:       { label: "Meta Ads",   color: "#3b82f6" },
  google:     { label: "Google Ads", color: "#f59e0b" },
  indefinido: { label: "Indefinido", color: "#64748b" },
};
