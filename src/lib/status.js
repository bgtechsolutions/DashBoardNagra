import { T } from "../theme";

// ─── Status helpers ──────────────────────────────────────────
// Regras de negócio:
// • qualified/qualificado  → Qualificado (conta para sempre — ever)
// • contacted + responder  → Em andamento ("responder" = aguardando resposta, ainda ativo)
// • curious/curioso/proposal → Curioso (proposal = curioso conforme cliente)
// • new/lead               → Lead
// • giovani/murilo/etc     → vendedor humano (lead entregue ao time)
const QUALIF_STATUSES  = new Set(["qualified", "qualificado"]);
const CONTACT_STATUSES = new Set(["contacted", "em andamento", "responder"]);
const CURIOUS_STATUSES = new Set(["curious", "curioso", "proposal"]);
const LEAD_STATUSES    = new Set(["new", "lead"]);

// Vendedores humanos: o status vira o nome de quem recebeu o lead.
export const VENDEDORES = ["giovani", "murilo", "alessandro"];

export const isQualif   = (s) => QUALIF_STATUSES.has((s || "").toLowerCase());
export const isContact  = (s) => CONTACT_STATUSES.has((s || "").toLowerCase());
export const isCurious  = (s) => CURIOUS_STATUSES.has((s || "").toLowerCase());
export const isLead     = (s) => LEAD_STATUSES.has((s || "").toLowerCase());
export const isVendedor = (s) => VENDEDORES.includes((s || "").toLowerCase());
export const isAguard   = (s) => (s || "").toLowerCase() === "responder";

// Badge label/color por status
const STATUS_BADGE = {
  new:          { label: "Lead",         color: T.blue,   dim: T.blueDim   },
  lead:         { label: "Lead",         color: T.blue,   dim: T.blueDim   },
  contacted:    { label: "Em andamento", color: T.green,  dim: T.greenDim  },
  "em andamento":{ label: "Em andamento",color: T.green,  dim: T.greenDim  },
  curious:      { label: "Curioso",      color: T.amber,  dim: T.amberDim  },
  curioso:      { label: "Curioso",      color: T.amber,  dim: T.amberDim  },
  qualified:    { label: "Qualificado",  color: T.violet, dim: T.violetDim },
  qualificado:  { label: "Qualificado",  color: T.violet, dim: T.violetDim },
  giovani:      { label: "Giovani",      color: T.cyan,   dim: T.cyanDim   },
  murilo:       { label: "Murilo",       color: T.cyan,   dim: T.cyanDim   },
  alessandro:   { label: "Alessandro",   color: T.cyan,   dim: T.cyanDim   },
  negotiation:  { label: "Negociação",   color: T.violet, dim: T.violetDim },
  responder:    { label: "Aguardando",   color: T.amber,  dim: T.amberDim  },
  proposal:     { label: "Curioso",      color: T.amber,  dim: T.amberDim  },
};

export const getStatus = (s) =>
  STATUS_BADGE[(s || "").toLowerCase()] ||
  { label: s || "—", color: T.muted, dim: "rgba(100,116,139,.12)" };
