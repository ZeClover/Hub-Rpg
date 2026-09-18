"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

/*
  Ligar fichas (suas) a esta campanha. Decisão #133: um jogador pode ter
  duas ou mais fichas na mesma campanha (ex.: personagem principal + um
  companion) — cada ficha linkada aparece na lista com um jeito de soltar
  ela sozinha, e o seletor de baixo só oferece fichas do sistema certo que
  ainda não estão nesta campanha.
*/
export function EntrarNaCampanha({
  campanhaId,
  ficha,
  minhasFichas,
  meusPersonagens,
}: {
  campanhaId: string;
  ficha: string;
  minhasFichas: { id: string; nome: string }[];
  meusPersonagens: { id: string; nome: string }[];
}) {
  const roteador = useRouter();
  const idsJaLigados = new Set(meusPersonagens.map((p) => p.id));
  const fichasDisponiveis = minhasFichas.filter((f) => !idsJaLigados.has(f.id));

  const [personagemId, setPersonagemId] = useState(fichasDisponiveis[0]?.id ?? "");
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function adicionar() {
    if (!personagemId) return;
    setProcessando("adicionar");
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
      setErro("Não consegui ligar essa ficha agora. Tenta de novo.");
    } finally {
      setProcessando(null);
    }
  }

  async function soltar(idParaSoltar: string) {
    setProcessando(idParaSoltar);
    setErro(null);
    try {
      const resposta = await fetch(
        `/api/campanhas/${campanhaId}/personagens/${idParaSoltar}`,
        { method: "DELETE" },
      );
      if (!resposta.ok) throw new Error("falhou");
      roteador.refresh();
    } catch {
      setErro("Não consegui soltar essa ficha agora. Tenta de novo.");
    } finally {
      setProcessando(null);
    }
  }

  return (
    <div className="mt-3">
      {meusPersonagens.length > 0 && (
        <ul className="space-y-2">
          {meusPersonagens.map((personagem) => (
            <li
              key={personagem.id}
              className="flex items-center justify-between gap-3 rounded border border-borda bg-fundo px-3 py-2"
            >
              <a
                href={`${ficha}?id=${personagem.id}`}
                className="text-sm text-ambar-forte underline underline-offset-2"
              >
                {personagem.nome}
              </a>
              <button
                type="button"
                onClick={() => soltar(personagem.id)}
                disabled={processando === personagem.id}
                className="text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-segredo disabled:opacity-50"
              >
                {processando === personagem.id ? "Soltando…" : "Soltar"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {fichasDisponiveis.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={personagemId}
            onChange={(evento) => setPersonagemId(evento.target.value)}
            className="rounded border border-borda bg-fundo px-3 py-2 text-sm"
          >
            {fichasDisponiveis.map((personagem) => (
              <option key={personagem.id} value={personagem.id}>
                {personagem.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={adicionar}
            disabled={processando === "adicionar"}
            className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
          >
            {processando === "adicionar"
              ? "Ligando…"
              : meusPersonagens.length > 0
                ? "Adicionar outra ficha"
                : "Entrar com esta ficha"}
          </button>
        </div>
      ) : minhasFichas.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">
          Você ainda não tem nenhuma ficha desse sistema.{" "}
          <Link href="/fichas" className="text-ambar-forte underline underline-offset-2">
            Cria uma em Fichas
          </Link>{" "}
          e volta aqui pra ligar ela à campanha.
        </p>
      ) : (
        <p className="mt-3 text-sm text-texto-suave">
          Todas as suas fichas deste sistema já estão nesta campanha.{" "}
          <Link href="/fichas" className="text-ambar-forte underline underline-offset-2">
            Cria outra em Fichas
          </Link>{" "}
          se quiser adicionar mais uma.
        </p>
      )}

      {erro && <p className="mt-2 text-sm text-segredo">{erro}</p>}
    </div>
  );
}
