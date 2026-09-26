"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Trocar o dono de uma ficha (decisão #172) — o mestre (titular ou
  auxiliar) pode passar qualquer ficha da campanha pra qualquer
  participante dela, e o próprio dono pode passar a sua pra outro
  participante (jogador pra jogador tanto faz, é a mesma regra e o mesmo
  componente). A rota (`PATCH /api/personagens/[id]` com `{donoId}`) já
  garante isso no servidor — aqui só filtra quem já é dono da lista de
  candidatos, e confirma antes de trocar porque quem perde a posse perde
  o direito de editar essa ficha.
*/
export function TransferirDono({
  personagemId,
  nomeFicha,
  donoAtualId,
  candidatos,
}: {
  personagemId: string;
  nomeFicha: string;
  donoAtualId: string;
  candidatos: { usuarioId: string; nome: string }[];
}) {
  const roteador = useRouter();
  const outros = candidatos.filter((c) => c.usuarioId !== donoAtualId);
  const [novoDonoId, setNovoDonoId] = useState(outros[0]?.usuarioId ?? "");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (outros.length === 0) return null;

  async function trocar() {
    const novoDono = outros.find((c) => c.usuarioId === novoDonoId);
    if (!novoDono) return;
    if (
      !confirm(
        `Trocar o dono de "${nomeFicha}" para ${novoDono.nome}? Quem é dono hoje deixa de poder editar essa ficha.`,
      )
    ) {
      return;
    }

    setProcessando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/personagens/${personagemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId: novoDonoId }),
      });
      if (!resposta.ok) throw new Error("falhou");
      roteador.refresh();
    } catch {
      setErro("Não consegui trocar o dono agora. Tenta de novo.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={novoDonoId}
        onChange={(evento) => setNovoDonoId(evento.target.value)}
        className="rounded border border-borda bg-fundo px-2 py-0.5 text-xs text-texto"
      >
        {outros.map((c) => (
          <option key={c.usuarioId} value={c.usuarioId}>
            {c.nome}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={trocar}
        disabled={processando}
        className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-ambar-forte disabled:opacity-50"
      >
        {processando ? "Trocando…" : "Trocar dono"}
      </button>
      {erro && <span className="text-xs text-segredo">{erro}</span>}
    </div>
  );
}
