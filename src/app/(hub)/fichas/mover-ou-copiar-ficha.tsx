"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Mover ou copiar uma ficha pra outra campanha do MESMO sistema (decisão
  #139, ideias #26/#27 do pedido original) — nunca converte entre
  sistemas. "Mover" reaproveita a mesma rota que já liga uma ficha a uma
  campanha (`POST /campanhas/[id]/entrar`): ligar de novo troca pra onde
  ela aponta, então não precisou de rota nova. "Copiar" é rota própria —
  cria uma ficha nova com os mesmos dados, a original nunca muda.

  Só aparece quando existe alguma campanha candidata: outra campanha do
  mesmo sistema onde a própria pessoa já participa (mestre ou jogador).
*/
export function MoverOuCopiarFicha({
  personagemId,
  campanhaAtualNome,
  candidatas,
}: {
  personagemId: string;
  campanhaAtualNome: string | null;
  candidatas: { id: string; nome: string }[];
}) {
  const roteador = useRouter();
  const [campanhaId, setCampanhaId] = useState(candidatas[0]?.id ?? "");
  const [processando, setProcessando] = useState<"mover" | "copiar" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function mover() {
    if (!campanhaId) return;
    setProcessando("mover");
    setErro(null);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/entrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personagemId }),
      });
      if (!resposta.ok) throw new Error("falhou");
      roteador.refresh();
    } catch {
      setErro("Não consegui mover essa ficha agora. Tenta de novo.");
    } finally {
      setProcessando(null);
    }
  }

  async function copiar() {
    if (!campanhaId) return;
    setProcessando("copiar");
    setErro(null);
    try {
      const resposta = await fetch(`/api/personagens/${personagemId}/copiar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campanhaId }),
      });
      if (!resposta.ok) throw new Error("falhou");
      roteador.refresh();
    } catch {
      setErro("Não consegui copiar essa ficha agora. Tenta de novo.");
    } finally {
      setProcessando(null);
    }
  }

  if (candidatas.length === 0) {
    return campanhaAtualNome ? (
      <span className="text-xs text-texto-suave">Em {campanhaAtualNome}</span>
    ) : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {campanhaAtualNome && (
        <span className="text-xs text-texto-suave">Em {campanhaAtualNome} —</span>
      )}
      <select
        value={campanhaId}
        onChange={(evento) => setCampanhaId(evento.target.value)}
        className="rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto"
      >
        {candidatas.map((campanha) => (
          <option key={campanha.id} value={campanha.id}>
            {campanha.nome}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={mover}
        disabled={processando !== null}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto disabled:opacity-50"
      >
        {processando === "mover" ? "Movendo…" : "Mover"}
      </button>
      <button
        type="button"
        onClick={copiar}
        disabled={processando !== null}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto disabled:opacity-50"
      >
        {processando === "copiar" ? "Copiando…" : "Copiar"}
      </button>
      {erro && <span className="w-full text-xs text-segredo">{erro}</span>}
    </div>
  );
}
