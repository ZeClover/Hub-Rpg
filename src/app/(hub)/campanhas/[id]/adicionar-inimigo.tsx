"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Botão do mestre pra criar uma ficha de inimigo/NPC direto nesta campanha.
  Abre a ficha em branco na hora, pronta pra preencher — igual "+ Criar
  ficha" de /fichas, só que já nasce ligada à mesa.
*/
export function AdicionarInimigo({
  campanhaId,
  ficha,
}: {
  campanhaId: string;
  ficha: string;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function adicionar() {
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/inimigos`, {
        method: "POST",
      });
      if (!resposta.ok) throw new Error("falhou");

      const { personagem } = (await resposta.json()) as { personagem: { id: string } };
      roteador.push(`${ficha}?id=${personagem.id}`);
    } catch {
      setErro("Não consegui criar a ficha agora. Tenta de novo.");
      setCriando(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={adicionar}
        disabled={criando}
        className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
      >
        {criando ? "Criando…" : "+ Adicionar ficha de inimigo"}
      </button>
      {erro && <p className="mt-2 text-sm text-segredo">{erro}</p>}
    </div>
  );
}
