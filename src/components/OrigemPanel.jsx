import { TrendingUp } from "lucide-react";
import { T } from "../theme";
import { ORIGEM_META } from "../lib/origem";
import { Card, SLabel } from "./ui";

// ─── Painel de origem dos leads (Meta vs Google) ─────────────
// Amostragem: mostra a distribuição de origem detectada pela mensagem
// e, para cada origem, quantos leads já ficaram qualificados no kanban.
export function OrigemPanel({ byOrigem, totalLeads }) {
  const ordem = ["meta", "google", "indefinido"];
  const identificados = byOrigem.meta.leads + byOrigem.google.leads;
  const cobertura = totalLeads > 0 ? Math.round((identificados / totalLeads) * 100) : 0;

  return (
    <Card style={{ padding: 28, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SLabel icon={TrendingUp}>Origem dos leads — amostragem por mensagem × qualificação</SLabel>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>
          {cobertura}% identificados
        </span>
      </div>

      {/* Barra proporcional */}
      <div style={{ display: "flex", height: 6, borderRadius: 99, overflow: "hidden", marginBottom: 24, gap: 2 }}>
        {ordem.filter((o) => byOrigem[o].leads > 0).map((o) => (
          <div key={o} style={{
            height: "100%",
            width: `${totalLeads > 0 ? (byOrigem[o].leads / totalLeads * 100) : 0}%`,
            background: ORIGEM_META[o].color, boxShadow: `0 0 8px ${ORIGEM_META[o].color}88`,
            borderRadius: 99, transition: "width 1s ease",
          }} />
        ))}
      </div>

      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 8px", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.muted }}>
        <span style={{ width: 8, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>Origem</span>
        <span style={{ width: 60, textAlign: "right" }}>Leads</span>
        <span style={{ width: 44, textAlign: "right" }}>%</span>
        <span style={{ width: 70, textAlign: "right" }}>Qualif.</span>
        <span style={{ width: 60, textAlign: "right" }}>Taxa</span>
      </div>

      {ordem.map((o, i) => {
        const row = byOrigem[o];
        const meta = ORIGEM_META[o];
        const pct = totalLeads > 0 ? Math.round((row.leads / totalLeads) * 100) : 0;
        const taxa = row.leads > 0 ? Math.round((row.qualif / row.leads) * 100) : 0;
        return (
          <div key={o} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
            borderBottom: i < ordem.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: meta.color, flexShrink: 0, boxShadow: `0 0 8px ${meta.color}` }} />
            <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 500 }}>{meta.label}</span>
            <span style={{ width: 60, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace" }}>{row.leads}</span>
            <span style={{ width: 44, textAlign: "right", fontSize: 12, fontWeight: 600, color: meta.color, fontFamily: "'JetBrains Mono',monospace" }}>{pct}%</span>
            <span style={{ width: 70, textAlign: "right", fontSize: 13, fontWeight: 700, color: T.violet, fontFamily: "'JetBrains Mono',monospace" }}>{row.qualif}</span>
            <span style={{ width: 60, textAlign: "right", fontSize: 12, fontWeight: 600, color: T.violet, fontFamily: "'JetBrains Mono',monospace" }}>{taxa}%</span>
          </div>
        );
      })}

      {identificados === 0 && (
        <div style={{ marginTop: 16, padding: "11px 14px", borderRadius: 10, background: T.blueDim, border: `1px solid ${T.blue}33`, fontSize: 12, color: T.muted2, lineHeight: 1.6 }}>
          Nenhuma origem identificada ainda. A coluna <b style={{ color: T.text }}>Origem</b> da planilha
          precisa ser preenchida pelo n8n (classificando a 1ª mensagem do cliente) para esta amostragem aparecer.
        </div>
      )}
    </Card>
  );
}
