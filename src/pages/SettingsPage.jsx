import { useState } from "react";
import { Database, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { T } from "../theme";
import { parseCSV } from "../lib/csv";
import { DEFAULT_URL, DEFAULT_CUSTOS_URL, getUrl, getCustosUrl, getInterval } from "../lib/config";
import { Card } from "../components/ui";

// ─── Settings page ───────────────────────────────────────────
export function SettingsPage({ onSaved }) {
  const [url,     setUrl]     = useState(getUrl());
  const [custosUrl, setCustosUrl] = useState(getCustosUrl());
  const [intv,    setIntv]    = useState(getInterval());
  const [testing, setTesting] = useState(false);
  const [result,  setResult]  = useState(null);
  const [saved,   setSaved]   = useState(false);

  const SUGGESTED = DEFAULT_URL;

  const salvar = () => {
    localStorage.setItem("nagra_url", url.trim());
    localStorage.setItem("nagra_custos_url", custosUrl.trim());
    localStorage.setItem("nagra_interval", intv);
    setSaved(true); setTimeout(() => setSaved(false), 2500);
    onSaved();
  };

  const testar = async () => {
    if (!url.trim()) return;
    setTesting(true); setResult(null);
    try {
      const res = await fetch(url.trim() + (url.includes("?") ? "&" : "?") + "t=" + Date.now());
      if (!res.ok) throw new Error("HTTP " + res.status);
      const rows = parseCSV(await res.text()).length;
      setResult({ ok: true, msg: `Conectado — ${rows} registros encontrados` });
    } catch (e) {
      setResult({ ok: false, msg: e.message });
    } finally { setTesting(false); }
  };

  const inpStyle = (state) => ({
    width: "100%", padding: "11px 16px", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${state === "err" ? T.red + "66" : state === "ok" ? T.green + "66" : T.border2}`,
    borderRadius: 10, fontSize: 13, color: T.text, outline: "none",
    fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "border-color .2s", boxSizing: "border-box",
  });
  const lbl = { display: "block", fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 8 };

  return (
    <div style={{ animation: "fadeUp .35s ease both" }}>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-.02em" }}>Configurações</h2>
        <p style={{ fontSize: 13, color: T.muted2 }}>Gerencie a fonte de dados e o comportamento do relatório.</p>
      </div>

      <Card style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Database size={16} color={T.blue} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Fonte de dados — Google Sheets</span>
        </div>
        <p style={{ fontSize: 12, color: T.muted2, lineHeight: 1.7, marginBottom: 24 }}>Cole a URL de exportação CSV da planilha para conectar os dados em tempo real.</p>
        {["Clique em Compartilhar → Qualquer pessoa com o link → Visualizador","Copie o ID da planilha da URL (parte entre /d/ e /edit)","Cole a URL no formato abaixo no campo"].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.blueDim, border: `1px solid ${T.blue}44`, color: T.blue, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <span style={{ fontSize: 12, color: T.muted2, lineHeight: 1.7 }}>{s}</span>
          </div>
        ))}
        <div onClick={() => setUrl(SUGGESTED)} title="Clique para usar" style={{ background: "rgba(59,130,246,0.06)", border: `1px solid ${T.blue}33`, borderRadius: 10, padding: "12px 16px", margin: "20px 0", fontSize: 11, color: T.blue2, wordBreak: "break-all", lineHeight: 1.8, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>
          <span style={{ color: T.muted, fontSize: 9, display: "block", marginBottom: 4, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>URL sugerida — clique para usar</span>
          {SUGGESTED}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>URL da planilha (CSV Export)</label>
          <input style={inpStyle(result ? (result.ok ? "ok" : "err") : undefined)} value={url} onChange={(e) => { setUrl(e.target.value); setResult(null); }} placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0" />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>A planilha precisa estar compartilhada como "Qualquer pessoa com o link pode visualizar".</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>URL da aba de custos (opcional)</label>
          <input style={inpStyle(undefined)} value={custosUrl} onChange={(e) => setCustosUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=<gid_da_aba_custos>" />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.6 }}>
            Aba com colunas <b style={{ color: T.muted2 }}>Data, Custo</b> (uma linha por dia), alimentada pelo n8n a partir da Costs API da OpenAI. Deixe em branco se ainda não tiver.
          </div>
        </div>
        {result && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "11px 14px", borderRadius: 10, background: result.ok ? T.greenDim : "rgba(239,68,68,.1)", border: `1px solid ${result.ok ? T.green + "44" : T.red + "44"}`, fontSize: 12, color: result.ok ? T.green2 : T.red }}>
            {result.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {result.msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={salvar} style={{ padding: "10px 20px", background: T.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: `0 0 20px ${T.blue}44` }}>
            {saved ? "✓ Salvo!" : "Salvar e conectar"}
          </button>
          <button onClick={testar} disabled={!url.trim() || testing} style={{ padding: "10px 20px", background: "transparent", color: T.muted2, border: `1px solid ${T.border2}`, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: !url.trim() || testing ? 0.4 : 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {testing && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            Testar conexão
          </button>
        </div>
      </Card>

      <Card style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Clock size={16} color={T.violet} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Atualização automática</span>
        </div>
        <p style={{ fontSize: 12, color: T.muted2, lineHeight: 1.7, marginBottom: 24 }}>O dashboard buscará novos dados da planilha a cada intervalo definido.</p>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Intervalo (segundos)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input type="number" min="10" max="3600" style={{ ...inpStyle(undefined), width: 110 }} value={intv} onChange={(e) => setIntv(e.target.value)} />
            <span style={{ fontSize: 12, color: T.muted }}>segundos · mín. 10s · recomendado: 60s</span>
          </div>
        </div>
        <button onClick={salvar} style={{ padding: "10px 20px", background: T.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: `0 0 20px ${T.blue}44` }}>
          {saved ? "✓ Salvo!" : "Salvar"}
        </button>
      </Card>
    </div>
  );
}
