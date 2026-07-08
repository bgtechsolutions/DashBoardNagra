import { UserCheck } from "lucide-react";
import { T } from "../theme";
import { Card, SLabel } from "./ui";

const CORES = [T.cyan, T.violet, T.green, T.amber, T.blue2];

// ─── Leads entregues ao time — placar por vendedor ───────────
export function VendedorPanel({ byVendedor }) {
  const entries = Object.entries(byVendedor).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  return (
    <Card style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SLabel icon={UserCheck}>Entregues ao time — por vendedor</SLabel>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>{total} no total</span>
      </div>

      {entries.length === 0 ? (
        <div style={{ fontSize: 13, color: T.muted, padding: "4px 0" }}>Nenhum lead entregue a vendedor no período.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {entries.map(([nome, v], i) => {
            const c = CORES[i % CORES.length];
            const pct = total > 0 ? Math.round((v / total) * 100) : 0;
            return (
              <div key={nome} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < entries.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: c + "1f", border: `1px solid ${c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c, flexShrink: 0 }}>
                  {nome.slice(0, 1).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 500 }}>{nome}</span>
                <div style={{ width: 100, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 99, boxShadow: `0 0 8px ${c}88`, transition: "width 1s ease" }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace", minWidth: 36, textAlign: "right" }}>{v}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: c, fontFamily: "'JetBrains Mono',monospace", minWidth: 44, textAlign: "right" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
