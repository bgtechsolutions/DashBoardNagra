import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  RefreshCw, Wifi, WifiOff, Loader2, TrendingUp,
  Users, MessageCircle, Star, ArrowRight, Activity, Clock, Zap,
  UserCheck, Megaphone, CheckCircle2,
} from "lucide-react";
import { T } from "../theme";
import { parseDataBR } from "../lib/csv";
import { isQualif, isContact, isCurious } from "../lib/status";
import { calcMetrics } from "../lib/metrics";
import { Card, SLabel } from "../components/ui";
import { TrendChart, BarTooltip } from "../components/charts";
import { KpiCard } from "../components/KpiCard";
import { HelpPanel } from "../components/HelpPanel";
import { BreakdownPanel } from "../components/BreakdownPanel";
import { OrigemPanel } from "../components/OrigemPanel";
import { VendedorPanel } from "../components/VendedorPanel";
import { LogItem } from "../components/LogItem";

// ─── Dashboard page ──────────────────────────────────────────
export function DashboardPage({ dados, status, onRefresh, refreshing }) {
  const today = new Date().toISOString().split("T")[0];
  const [start, setStart] = useState(today.slice(0, 8) + "01");
  const [end,   setEnd]   = useState(today);

  const inRange = (ds) => {
    try { const dt = parseDataBR(ds); return dt >= new Date(start + "T00:00:00") && dt <= new Date(end + "T23:59:59"); }
    catch { return false; }
  };
  const f = dados.filter((d) => inRange(d.data));   // atividade no período (tendência/recentes)

  // KPIs por COORTE: a data = quando o lead ENTROU; status/conversão do histórico inteiro
  const m = calcMetrics(dados, inRange);
  const { leads, contact, curious, qualif, qualifAtual, rate, stillLead, byOrigem, byVendedor, comVendedor, aguardando, fechado, naoQuer } = m;
  const emMaturacao = new Date(end + "T23:59:59") >= new Date(Date.now() - 7 * 864e5);

  // Sparklines por dia (baseados em eventos únicos diários)
  const byDay = {};
  f.forEach((d) => {
    const day = d.data.split(" ")[0];
    if (!byDay[day]) byDay[day] = { lead: 0, contact: 0, qualif: 0 };
    if (d.evento === "Lead Criado") byDay[day].lead++;
    if (isContact(d.statusNovo))  byDay[day].contact++;
    if (isQualif(d.statusNovo))   byDay[day].qualif++;
    if (isCurious(d.statusNovo))  byDay[day].curious = (byDay[day].curious || 0) + 1;
  });
  const days      = Object.keys(byDay).sort();
  const spLeads   = days.map((d) => ({ v: byDay[d].lead }));
  const spContact = days.map((d) => ({ v: byDay[d].contact }));
  const spQualif  = days.map((d) => ({ v: byDay[d].qualif }));
  const spCurious = days.map((d) => ({ v: byDay[d].curious || 0 }));
  const trendData = days.map((d) => ({ name: d.split("/").slice(0, 2).join("/"), leads: byDay[d].lead, qualif: byDay[d].qualif }));

  // Funil = onde cada contato ESTÁ AGORA (status atual único)
  const funnelData = [
    { name: "Ainda Lead",   value: stillLead,   color: T.blue   },
    { name: "Em andamento", value: contact,     color: T.green  },
    { name: "Curioso",      value: curious,     color: T.amber  },
    { name: "Qualificado",  value: qualifAtual, color: T.violet },
    { name: "Com vendedor", value: comVendedor, color: T.cyan   },
    { name: "Fechado",      value: fechado,     color: T.green2  },
    { name: "Não quer",     value: naoQuer,     color: T.red     },
  ];

  const recentes = [...f].reverse().slice(0, 6);
  const dInp = { padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border2}`, borderRadius: 8, fontSize: 12, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none" };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block", boxShadow: `0 0 8px ${T.green}`, animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: T.muted }}>Relatório de performance</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", lineHeight: 1.1 }}>Nagra Máquinas</h1>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1, color: T.blue2, textShadow: `0 0 32px ${T.blue}66` }}>Atendimento IA</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={dInp} />
            <ArrowRight size={14} color={T.muted} />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={dInp} />
            <button onClick={onRefresh} disabled={refreshing} style={{ padding: "8px 18px", background: T.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: refreshing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: refreshing ? 0.5 : 1, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: `0 0 16px ${T.blue}44` }}>
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              Atualizar
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            {status.ok
              ? <><Wifi size={12} color={T.green} /><span style={{ color: T.green }}>{status.msg}</span></>
              : status.loading
                ? <><Loader2 size={12} color={T.blue} style={{ animation: "spin 1s linear infinite" }} /><span style={{ color: T.muted2 }}>{status.msg}</span></>
                : <><WifiOff size={12} color={T.red} /><span style={{ color: T.red }}>{status.msg}</span></>
            }
          </div>
        </div>
      </div>

      {/* Guia rápido para o dono */}
      <HelpPanel />

      {/* Aviso de coorte em maturação */}
      {emMaturacao && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 16, borderRadius: 10, background: T.amberDim, border: `1px solid ${T.amber}33`, fontSize: 12, color: T.muted2 }}>
          <Clock size={13} color={T.amber} />
          Período recente ainda em maturação — leads que entraram agora podem fechar depois, então a taxa tende a subir com o tempo.
        </div>
      )}

      {/* KPI grid — os 5 originais (contatos únicos) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 16 }}>
        <KpiCard icon={Users}         label="Leads recebidos"   value={leads}   color={T.blue}   dim={T.blueDim}   delay={0}   sparkData={spLeads}   />
        <KpiCard icon={MessageCircle} label="Em andamento"      value={contact} color={T.green}  dim={T.greenDim}  delay={70}  sparkData={spContact} />
        <KpiCard icon={Star}          label="Curiosos"          value={curious} color={T.amber}  dim={T.amberDim}  delay={140} sparkData={spCurious}  />
        <KpiCard icon={Star}          label="Qualificados"      value={qualif}  color={T.violet} dim={T.violetDim} delay={210} sparkData={spQualif}  />
        <KpiCard icon={TrendingUp}    label="Taxa qualificação" value={rate}    color={T.amber}  dim={T.amberDim}  delay={280} suffix="%"            />
      </div>

      {/* KPI grid — novos quadrados */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 16 }}>
        <KpiCard icon={UserCheck}    label="Entregues ao time"  value={comVendedor}          color={T.cyan}   dim={T.cyanDim}  delay={0}   />
        <KpiCard icon={CheckCircle2} label="Clientes fechados"  value={fechado}              color={T.green2} dim={T.greenDim} delay={70}  />
        <KpiCard icon={Clock}        label="Aguardando resposta" value={aguardando}          color={T.amber}  dim={T.amberDim} delay={140} />
        <KpiCard icon={Megaphone}    label="Meta Ads"           value={byOrigem.meta.leads}   color={T.blue}   dim={T.blueDim}  delay={210} />
        <KpiCard icon={Megaphone}    label="Google Ads"         value={byOrigem.google.leads} color={T.amber}  dim={T.amberDim} delay={280} />
      </div>

      {/* Breakdown */}
      <BreakdownPanel leads={leads} stillLead={stillLead} contact={contact} curious={curious} qualif={qualifAtual} comVendedor={comVendedor} fechado={fechado} naoQuer={naoQuer} />

      {/* Origem dos leads (Meta vs Google) × qualificação */}
      <OrigemPanel byOrigem={byOrigem} totalLeads={leads} />

      {/* Leads entregues ao time — por vendedor */}
      <div style={{ marginBottom: 16 }}>
        <VendedorPanel byVendedor={byVendedor} />
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 28 }}>
          <SLabel icon={Activity}>Funil de conversão</SLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} barSize={30} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {funnelData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelData.map((fk) => (
              <div key={fk.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: fk.color, flexShrink: 0, boxShadow: `0 0 8px ${fk.color}` }} />
                <span style={{ fontSize: 12, color: T.muted2, flex: 1 }}>{fk.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace" }}>{fk.value}</span>
                <span style={{ fontSize: 11, color: fk.color, width: 40, textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
                  {leads > 0 ? Math.round((fk.value / leads) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {trendData.length >= 2 && (
            <Card style={{ padding: 24 }}>
              <SLabel icon={Zap}>Tendência diária</SLabel>
              <TrendChart data={trendData} />
              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                {[{ c: T.blue, l: "Leads" }, { c: T.green, l: "Qualificados" }].map((x) => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 2, borderRadius: 1, background: x.c, boxShadow: `0 0 6px ${x.c}` }} />
                    <span style={{ fontSize: 10, color: T.muted }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card style={{ padding: 24, flex: 1 }}>
            <SLabel icon={Clock}>Últimos eventos</SLabel>
            {recentes.length === 0
              ? <div style={{ fontSize: 13, color: T.muted, padding: "8px 0" }}>Nenhum evento no período.</div>
              : recentes.map((d, i) => <LogItem key={i} d={d} i={i} />)
            }
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>
          Powered by <span style={{ color: T.blue }}>BGTECH</span> Solutions
        </span>
        <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>
          {dados.length} registros · auto‑refresh {localStorage.getItem("nagra_interval") || 60}s
        </span>
      </div>
    </div>
  );
}
