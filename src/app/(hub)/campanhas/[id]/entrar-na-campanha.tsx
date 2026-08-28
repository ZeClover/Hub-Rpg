"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Ligar uma ficha (sua) a esta campanha. Serve tanto pra entrar pela
  primeira vez quanto pra trocar depois: a API sempre solta qualquer ficha
  anterior sua nesta campanha antes de ligar a nova.
*/
export function EntrarNaCampanha({
  campanhaId,
  ficha,
  minhasFichas,
  personagemAtualId,
}: {
  campanhaId: string;
  ficha: string;
  minhasFichas: { id: string; nome: string }[];
  personagemAtualId: string | null;
}) {
  const roteador = useRouter();
  const [personagemId, setPersonagemId] = useState(
    personagemAtualId ?? minhasFichas[0]?.id ?? "",
  );
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    if (!personagemId) return;
    setEntrando(true);
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
      setEntrando(false);
    }
  }

  if (!minhasFichas.length) {
    return (
      <p className="mt-3 text-sm text-texto-suave">
        Você ainda não tem nenhuma ficha desse sistema.{" "}
        <Link href="/fichas" className="text-ambar-forte underline underline-offset-2">
          Cria uma em Fichas
        </Link>{" "}
        e volta aqui pra ligar ela à campanha.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <select
        value={personagemId}
        onChange={(evento) => setPersonagemId(evento.target.value)}
        className="rounded border border-borda bg-fundo px-3 py-2 text-sm"
      >
        {minhasFichas.map((personagem) => (
          <option key={personagem.id} value={personagem.id}>
            {personagem.nome}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={entrar}
        disabled={entrando || personagemId === personagemAtualId}
        className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
      >
        {entrando
          ? "Ligando…"
          : personagemAtualId
            ? "Trocar ficha"
            : "Entrar com esta ficha"}
      </button>
      {personagemAtualId && (
        <a
          href={`${ficha}?id=${personagemAtualId}`}
          className="text-sm text-texto-suave underline underline-offset-2 hover:text-texto"
        >
          Abrir minha ficha
        </a>
      )}
      {erro && <p className="w-full text-sm text-segredo">{erro}</p>}
    </div>
  );
}
