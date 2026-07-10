import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { T } from "../theme";
import { Card } from "./ui";

// ─── Guia rápido para o dono da empresa ──────────────────────
const ITENS = [
  { k: "Leads recebidos",       v: "Pessoas novas que chamaram no WhatsApp no período." },
  { k: "Em andamento",          v: "A IA está conversando com o lead agora." },
  { k: "Curiosos",              v: "Só queriam tirar dúvidas ou saber informações, sem intenção real de compra." },
  { k: "Qualificados",          v: "A IA confirmou que é um lead bom, com interesse real de compra." },
  { k: "Taxa qualificação",     v: "% dos leads recebidos que a IA conseguiu qualificar." },
  { k: "Entregues ao time",     v: "Um vendedor pegou o card do lead qualificado e assumiu o atendimento no lugar da IA." },
  { k: "Aguardando resposta",   v: "Estão esperando o time responder — fique de olho para não esfriar." },
  { k: "Meta Ads / Google Ads", v: "De qual anúncio o lead veio, quando dá para identificar." },
  { k: "Funil de conversão",    v: "Mostra onde cada lead está agora, do 'Novo' até o vendedor." },
  { k: "Por vendedor",          v: "Quantos leads cada vendedor (Giovani, Alessandro, Murilo) pegou para atender." },
];

export function HelpPanel() {
  const [open, setOpen] = useState(() => localStorage.getItem("nagra_help") !== "0");
  const toggle = () => { const n = !open; setOpen(n); localStorage.setItem("nagra_help", n ? "1" : "0"); };

  return (
    <Card glow={open ? T.blue : undefined} style={{ padding: open ? 24 : "16px 24px", marginBottom: 16 }}>
      <div onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
        <HelpCircle size={16} color={T.blue} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", flex: 1 }}>Como ler esta dashboard</span>
        <ChevronDown size={16} color={T.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </div>

      {open && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: T.muted2, lineHeight: 1.7, marginBottom: 18 }}>
            Aqui você acompanha, <b style={{ color: T.text }}>em tempo real</b>, os leads que a IA atende no seu
            WhatsApp — do primeiro contato até a entrega para o time de vendas. A tela se atualiza sozinha.
            No <b style={{ color: T.text }}>filtro de data</b> (canto superior), escolha o período: ele conta os
            leads que <b style={{ color: T.text }}>entraram</b> naquele período, mesmo que fechem depois.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px" }}>
            {ITENS.map((it) => (
              <div key={it.k} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.blue, marginTop: 7, flexShrink: 0, boxShadow: `0 0 6px ${T.blue}` }} />
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{it.k}</span>
                  <span style={{ color: T.muted2 }}> — {it.v}</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            💡 Quando aparecer o aviso <b style={{ color: T.amber }}>"período em maturação"</b>, é porque os leads
            ainda são recentes e podem fechar mais tarde — a taxa tende a subir com o tempo.
          </p>
        </div>
      )}
    </Card>
  );
}
