// ─── Configuração padrão ─────────────────────────────────────
// Fontes de dados embutidas: funcionam em qualquer navegador/dispositivo
// sem precisar configurar. O que estiver salvo em Configurações
// (localStorage) tem prioridade e sobrescreve estes padrões.
const SHEET_ID = "193J6IGsRoNQMfuUq08zXergSKYtGtDmKZw9Jlyp-A6U";
const csvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

export const DEFAULT_URL        = csvUrl("0");            // aba Leads
export const DEFAULT_CUSTOS_URL = csvUrl("1842463183");  // aba Custos
export const DEFAULT_INTERVAL   = "60";                   // segundos

// Valor efetivo: o salvo pelo usuário ou, na ausência, o padrão embutido.
export const getUrl       = () => localStorage.getItem("nagra_url")        || DEFAULT_URL;
export const getCustosUrl = () => localStorage.getItem("nagra_custos_url") || DEFAULT_CUSTOS_URL;
export const getInterval  = () => localStorage.getItem("nagra_interval")   || DEFAULT_INTERVAL;
