import { ChevronRight } from "lucide-react";
import { T } from "../theme";
import { useCounter } from "../hooks/useCounter";
import { Card } from "./ui";
import { Sparkline } from "./charts";

// ─── KPI card ────────────────────────────────────────────────
export function KpiCard({ icon, label, value, suffix = "", color, dim, delay = 0, sparkData }) {
  const IconEl = icon;
  const d = useCounter(value);
  return (
    <Card glow={color} style={{ padding: 24, animation: `fadeUp .5s ease ${delay}ms both`, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: dim, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconEl size={17} color={color} strokeWidth={1.8} />
        </div>
        <ChevronRight size={14} color={T.muted} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-.04em", lineHeight: 1, marginBottom: 4, textShadow: `0 0 24px ${color}60` }}>
        {d}{suffix}
      </div>
      <div style={{ fontSize: 12, color: T.muted2, fontWeight: 500, marginBottom: sparkData ? 12 : 0 }}>{label}</div>
      {sparkData && sparkData.length >= 2 && <Sparkline data={sparkData} color={color} />}
    </Card>
  );
}
