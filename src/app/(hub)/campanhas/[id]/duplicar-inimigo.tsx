"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Duplicar um monstro N vezes na mesma campanha (decisão #142, ideia #69
  — "contador de grupos de inimigos iguais") — reaproveita a rota de
  copiar ficha que já existia (decisão #139), só passando `quantidade`.
  Cada cópia continua sendo uma ficha própria, com PV independente; o
  Painel de Vida da Mesa ao Vivo agrupa quem tem o mesmo nome base.
*/
export function DuplicarInimigo({
  campanhaId,
  personagemId,
}: {
  campanhaId: string;
  personagemId: string;
}) {
  const roteador = useRouter();
  const [quantidade, setQuantidade] = useState("1");
  const [duplicando, setDuplicando] = useState(false);

  async function duplicar() {
    const n = Number(quantidade);
    if (!Number.isInteger(n) || n < 1) return;
    setDuplicando(true);
    try {
      const resposta = await fetch(`/api/personagens/${personagemId}/copiar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campanhaId, quantidade: n }),
      });
      if (resposta.ok) roteador.refresh();
    } finally {
      setDuplicando(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        min={1}
        max={20}
        value={quantidade}
        onChange={(evento) => setQuantidade(evento.target.value)}
        className="w-12 rounded border border-borda bg-fundo px-1 py-0.5 text-xs text-texto"
      />
      <button
        type="button"
        onClick={duplicar}
        disabled={duplicando}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto disabled:opacity-50"
      >
        {duplicando ? "Duplicando…" : "Duplicar"}
      </button>
    </span>
  );
}
