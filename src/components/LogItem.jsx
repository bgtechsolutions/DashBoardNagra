import { ArrowRight } from "lucide-react";
import { T } from "../theme";
import { getStatus } from "../lib/status";
import { Badge } from "./ui";

// ─── Log item ────────────────────────────────────────────────
export function LogItem({ d, i }) {
  const isCr = d.evento === "Lead Criado";
  const sN   = getStatus(d.statusNovo);
  const sA   = getStatus(d.statusAnterior);
  const nome = (d.nome || "—").length > 30 ? (d.nome || "—").slice(0, 30) + "…" : d.nome || "—";
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${T.border}`, animation: `fadeUp .35s ease ${i * 45}ms both` }}>
      <div style={{ marginTop: 4, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isCr ? T.blue : sN.color, boxShadow: `0 0 8px ${isCr ? T.blue : sN.color}` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{nome}</span>
          {isCr
            ? <Badge label="novo lead" color={T.blue} dim={T.blueDim} />
            : <><Badge label={sA.label} color={sA.color} dim={sA.dim} /><ArrowRight size={10} color={T.muted} /><Badge label={sN.label} color={sN.color} dim={sN.dim} /></>
          }
        </div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>
          {d.data}  ·  {d.numero || "sem número"}
        </div>
      </div>
    </div>
  );
}
