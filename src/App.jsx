import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, Activity, Zap } from "lucide-react";
import { T } from "./theme";
import { parseCSV, parseCustosCSV } from "./lib/csv";
import { getUrl, getCustosUrl, getInterval } from "./lib/config";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";

// ─── App root ────────────────────────────────────────────────
export default function App() {
  const [tab,        setTab]        = useState("dashboard");
  const [dados,      setDados]      = useState([]);
  const [custos,     setCustos]     = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [status,     setStatus]     = useState({ ok: false, loading: true, msg: "Inicializando..." });
  const timerRef = useRef(null);

  const buscarDados = useCallback(async () => {
    const url = getUrl();
    setRefreshing(true);
    setStatus({ ok: false, loading: true, msg: "Buscando dados..." });
    const bust = (u) => u + (u.includes("?") ? "&" : "?") + "t=" + Date.now();
    try {
      const res  = await fetch(bust(url));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = parseCSV(await res.text());
      setDados(rows);
      setStatus({ ok: true, loading: false, msg: `Conectado · ${rows.length} registros · ${new Date().toLocaleTimeString("pt-BR", { timeStyle: "short" })}` });
    } catch (e) {
      setStatus({ ok: false, loading: false, msg: "Erro: " + e.message });
    } finally { setRefreshing(false); }

    // Custos (opcional) — falha silenciosa: nunca derruba a dashboard.
    const urlCustos = getCustosUrl();
    if (urlCustos) {
      try {
        const res = await fetch(bust(urlCustos));
        if (res.ok) setCustos(parseCustosCSV(await res.text()));
      } catch { /* ignora — o card só mostra o que houver */ }
    } else {
      setCustos([]);
    }
  }, []);

  const iniciarTimer = useCallback(() => {
    clearInterval(timerRef.current);
    const ms = parseInt(getInterval()) * 1000;
    timerRef.current = setInterval(buscarDados, ms);
  }, [buscarDados]);

  useEffect(() => {
    buscarDados();
    iniciarTimer();
    return () => clearInterval(timerRef.current);
  }, [buscarDados, iniciarTimer]);

  const onSaved = () => { buscarDados(); iniciarTimer(); };

  const navTabs = [
    { id: "dashboard", icon: Activity, label: "Dashboard"     },
    { id: "settings",  icon: Settings, label: "Configurações" },
  ];

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,13,18,.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 32px", height: 54, gap: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-.01em", marginRight: 36, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.blueDim, border: `1px solid ${T.blue}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} color={T.blue} fill={T.blue} />
          </div>
          Nagra <span style={{ color: T.blue2 }}>IA</span>
        </div>
        {navTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 18px", height: "100%", background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? T.blue : "transparent"}`, color: tab === t.id ? "#fff" : T.muted, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", transition: "all .15s", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <t.icon size={13} color={tab === t.id ? T.blue : T.muted} strokeWidth={tab === t.id ? 2 : 1.5} />
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.muted }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", background: status.ok ? T.green : status.loading ? T.blue : T.red, boxShadow: status.ok ? `0 0 8px ${T.green}` : "none", animation: status.ok ? "pulse 2.5s ease infinite" : "none" }} />
          {status.ok ? "Ao vivo" : status.loading ? "Carregando..." : "Offline"}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>
        {tab === "dashboard"
          ? <DashboardPage dados={dados} custos={custos} status={status} onRefresh={buscarDados} refreshing={refreshing} />
          : <SettingsPage onSaved={onSaved} />
        }
      </div>
    </>
  );
}
