import { Users } from "lucide-react";
import { T } from "../theme";
import { Card, SLabel } from "./ui";

// ─── Breakdown panel ─────────────────────────────────────────
export function BreakdownPanel({ leads, stillLead, contact, curious, qualif, rate }) {
  const rows = [
    { label: "Total recebidos", value: leads,     color: T.muted2, pct: 100,  bold: true },
    { label: "Ainda como Lead", value: stillLead, color: T.blue,   pct: leads > 0 ? Math.round(stillLead / leads * 100) : 0 },
    { label: "Em andamento",    value: contact,   color: T.green,  pct: leads > 0 ? Math.round(contact   / leads * 100) : 0 },
    { label: "Curioso",         value: curious,   color: T.amber,  pct: leads > 0 ? Math.round(curious   / leads * 100) : 0 },
    { label: "Qualificado",     value: qualif,    color: T.violet, pct: rate,  bold: true },
  ];

  return (
    <Card style={{ padding: 28, marginBottom: 16 }}>
      <SLabel icon={Users}>Distribuição de leads — contatos únicos por status atual</SLabel>

      {/* Barra proporcional */}
      <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", marginBottom: 24, gap: 2 }}>
        {[
          { v: stillLead, c: T.blue   },
          { v: contact,   c: T.green  },
          { v: curious,   c: T.amber  },
          { v: qualif,    c: T.violet },
        ].filter(x => x.v > 0).map((x, i) => (
          <div key={i} style={{
            height: "100%",
            width: `${leads > 0 ? (x.v / leads * 100) : 0}%`,
            background: x.c, boxShadow: `0 0 8px ${x.c}88`,
            borderRadius: 99, transition: "width 1s ease",
          }} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0",
            borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: r.bold ? 2 : "50%",
              background: r.color, flexShrink: 0,
              boxShadow: r.bold ? `0 0 8px ${r.color}` : "none",
              opacity: r.bold ? 1 : 0.7,
            }} />
            <span style={{ flex: 1, fontSize: 13, color: r.bold ? T.text : T.muted2, fontWeight: r.bold ? 600 : 400 }}>
              {r.label}
            </span>
            {!r.bold && (
              <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 99, transition: "width 1s ease" }} />
              </div>
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: r.bold ? "#fff" : T.text, fontFamily: "'JetBrains Mono',monospace", minWidth: 32, textAlign: "right" }}>
              {r.value}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.color, fontFamily: "'JetBrains Mono',monospace", minWidth: 44, textAlign: "right" }}>
              {r.pct}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
