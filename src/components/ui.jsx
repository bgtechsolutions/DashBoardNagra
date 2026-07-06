import { T } from "../theme";

// ─── Badge ───────────────────────────────────────────────────
export function Badge({ label, color, dim }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 99,
      fontSize: 10, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase",
      color, background: dim, border: `1px solid ${color}33` }}>
      {label}
    </span>
  );
}

// ─── Glass card ──────────────────────────────────────────────
export function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${glow ? glow + "33" : T.border}`,
      borderRadius: 16, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      boxShadow: glow ? `0 0 32px ${glow}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Section label ───────────────────────────────────────────
export function SLabel({ icon: IconComp, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
      {IconComp && <IconComp size={13} color={T.muted} />}
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: T.muted }}>
        {children}
      </span>
    </div>
  );
}
