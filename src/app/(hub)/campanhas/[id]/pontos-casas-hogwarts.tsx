"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const CASAS = ["Grifinória", "Sonserina", "Corvinal", "Lufa-Lufa"] as const;
const CORES: Record<string, string> = {
  "Grifinória": "border-red-500/40 bg-red-950/25", "Sonserina": "border-emerald-500/40 bg-emerald-950/25",
  "Corvinal": "border-blue-500/40 bg-blue-950/25", "Lufa-Lufa": "border-yellow-500/40 bg-yellow-950/20",
};
type Evento = { id: string; casa: string; delta: number; motivo: string; sessao: string | null; reversaoDeId: string | null; criadoEm: string; ator: { nome: string | null } | null };
type Resposta = { totais: Record<string, number>; eventos: Evento[]; ehMestre: boolean };

export function PontosCasasHogwarts({ campanhaId, ehMestre }: { campanhaId: string; ehMestre: boolean }) {
  const [dados, setDados] = useState<Resposta | null>(null), [erro, setErro] = useState(""), [enviando, setEnviando] = useState(false);
  const [casa, setCasa] = useState<(typeof CASAS)[number]>("Grifinória"), [delta, setDelta] = useState("10"), [motivo, setMotivo] = useState(""), [sessao, setSessao] = useState("");
  const carregar = useCallback(async () => {
    setErro("");
    try { const r = await fetch(`/api/campanhas/${campanhaId}/hogwarts-pontos`, { cache: "no-store" }); const c = await r.json(); if (!r.ok) throw new Error(c.erro || "Não foi possível carregar."); setDados(c); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível carregar os Pontos das Casas."); }
  }, [campanhaId]);
  useEffect(() => { const inicio = window.setTimeout(() => void carregar(), 0); return () => window.clearTimeout(inicio); }, [carregar]);
  const estornados = useMemo(() => new Set(dados?.eventos.map((e) => e.reversaoDeId).filter(Boolean)), [dados]);
  async function enviar(corpo: object) {
    setEnviando(true); setErro("");
    try { const r = await fetch(`/api/campanhas/${campanhaId}/hogwarts-pontos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) }); const c = await r.json(); if (!r.ok) throw new Error(c.erro || "Não foi possível salvar."); setMotivo(""); await carregar(); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível salvar."); } finally { setEnviando(false); }
  }
  return <section className="border-t border-ambar/25 px-4 py-5">
    <div className="flex flex-wrap items-end justify-between gap-2"><div><h3 className="font-titulo text-lg text-texto">Taça das Casas</h3><p className="text-xs text-texto-suave">Os totais são calculados pelo histórico; ninguém precisa somar manualmente.</p></div><button onClick={() => void carregar()} className="rounded border border-ambar/30 px-3 py-1.5 text-xs text-texto-suave hover:border-ambar">Atualizar</button></div>
    {!dados && !erro && <p className="mt-4 text-sm text-texto-suave">Carregando Pontos das Casas…</p>}
    {erro && <div role="alert" className="mt-4 rounded border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-100">{erro}</div>}
    {dados && <>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{CASAS.map((nome) => <div key={nome} className={`rounded-lg border p-3 ${CORES[nome]}`}><span className="block text-xs text-texto-suave">{nome}</span><strong className="mt-1 block font-titulo text-2xl text-texto">{dados.totais[nome] ?? 0}</strong></div>)}</div>
      {ehMestre && <form className="mt-4 grid gap-2 rounded-lg border border-ambar/25 bg-fundo/50 p-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void enviar({ casa, delta: Number(delta), motivo, sessao }); }}>
        <label className="text-xs text-texto-suave">Casa<select value={casa} onChange={(e) => setCasa(e.target.value as typeof casa)} className="mt-1 w-full rounded border border-ambar/30 bg-fundo px-3 py-2 text-texto">{CASAS.map((nome) => <option key={nome}>{nome}</option>)}</select></label>
        <label className="text-xs text-texto-suave">Pontos — use negativo para retirar<input required type="number" min="-1000" max="1000" value={delta} onChange={(e) => setDelta(e.target.value)} className="mt-1 w-full rounded border border-ambar/30 bg-fundo px-3 py-2 text-texto" /></label>
        <label className="text-xs text-texto-suave">Motivo<input required minLength={3} maxLength={240} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: excelente resposta em aula" className="mt-1 w-full rounded border border-ambar/30 bg-fundo px-3 py-2 text-texto" /></label>
        <label className="text-xs text-texto-suave">Sessão ou referência — opcional<input maxLength={80} value={sessao} onChange={(e) => setSessao(e.target.value)} placeholder="Ex.: Sessão 7" className="mt-1 w-full rounded border border-ambar/30 bg-fundo px-3 py-2 text-texto" /></label>
        <button disabled={enviando || !motivo.trim() || Number(delta) === 0} className="rounded border border-ambar/60 bg-ambar/15 px-4 py-2 text-sm text-ambar-forte disabled:opacity-50 sm:col-span-2">{enviando ? "Registrando…" : "Registrar no histórico"}</button>
      </form>}
      <details className="mt-4"><summary className="cursor-pointer text-sm text-ambar-forte">Ver histórico ({dados.eventos.length})</summary><div className="mt-2 max-h-80 space-y-2 overflow-auto pr-1">{dados.eventos.length === 0 ? <p className="text-sm text-texto-suave">Nenhum ponto registrado ainda.</p> : dados.eventos.map((evento) => <article key={evento.id} className="flex gap-3 rounded border border-ambar/20 bg-fundo/45 p-3 text-sm"><strong className={evento.delta >= 0 ? "text-emerald-300" : "text-red-300"}>{evento.delta > 0 ? "+" : ""}{evento.delta}</strong><div className="min-w-0 flex-1"><div className="text-texto"><b>{evento.casa}</b> — {evento.motivo}</div><div className="mt-1 text-xs text-texto-suave">{evento.ator?.nome || "Mestre"}{evento.sessao ? ` · ${evento.sessao}` : ""} · {new Date(evento.criadoEm).toLocaleString("pt-BR")}</div></div>{ehMestre && !evento.reversaoDeId && !estornados.has(evento.id) && <button disabled={enviando} onClick={() => void enviar({ acao: "estornar", eventoId: evento.id })} className="self-start rounded border border-red-400/30 px-2 py-1 text-xs text-red-200">Corrigir</button>}</article>)}</div></details>
    </>}
  </section>;
}
