"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Promover um jogador a mestre auxiliar, ou devolvê-lo a jogador comum
  (decisão #148, ideia #115) — só aparece pra quem é mestre titular, nunca
  pra um mestre auxiliar promover outro.
*/
export function MestreAuxiliar({
  campanhaId,
  usuarioId,
  ehAuxiliar,
}: {
  campanhaId: string;
  usuarioId: string;
  ehAuxiliar: boolean;
}) {
  const roteador = useRouter();
  const [processando, setProcessando] = useState(false);

  async function alternar() {
    setProcessando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/jogadores/${usuarioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papel: ehAuxiliar ? "JOGADOR" : "MESTRE_AUXILIAR" }),
      });
      if (resposta.ok) roteador.refresh();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={processando}
      className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-ambar-forte disabled:opacity-50"
    >
      {processando ? "…" : ehAuxiliar ? "Tirar mestre auxiliar" : "Tornar mestre auxiliar"}
    </button>
  );
}
