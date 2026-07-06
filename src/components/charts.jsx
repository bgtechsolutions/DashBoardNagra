import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line, AreaChart,
} from "recharts";
import { T } from "../theme";

// ─── Sparkline ───────────────────────────────────────────────
export function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const gradId = `sg${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#${gradId})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Trend chart ─────────────────────────────────────────────
export function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
        <defs>
          <linearGradient id="tgLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={T.blue} stopOpacity={0.2} />
            <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: T.muted }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: T.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 10, fontSize: 12 }}
          cursor={{ stroke: T.border2, strokeWidth: 1 }} />
        <Area type="monotone" dataKey="leads" stroke={T.blue} strokeWidth={2} fill="url(#tgLeads)" dot={false} name="Leads" />
        <Line type="monotone" dataKey="qualif" stroke={T.green} strokeWidth={2}
          dot={{ fill: T.green, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} name="Qualificados" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── Bar tooltip ─────────────────────────────────────────────
export function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.bg3, border: `1px solid ${T.border2}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.text, boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{payload[0].payload.name}</div>
      <div style={{ color: T.muted2, fontFamily: "'JetBrains Mono',monospace" }}>{payload[0].value} leads</div>
    </div>
  );
}
