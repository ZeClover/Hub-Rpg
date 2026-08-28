"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SairDaCampanha({
  campanhaId,
  usuarioId,
}: {
  campanhaId: string;
  usuarioId: string;
}) {
  const roteador = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (!confirm("Sair desta campanha? Sua ficha não é apagada, só solta.")) return;

    setSaindo(true);
    const resposta = await fetch(`/api/campanhas/${campanhaId}/jogadores/${usuarioId}`, {
      method: "DELETE",
    });
    if (resposta.ok) {
      roteador.push("/campanhas");
    } else {
      alert("Não consegui sair agora. Tenta de novo.");
      setSaindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="mt-3 text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-segredo disabled:opacity-50"
    >
      {saindo ? "Saindo…" : "Sair da campanha"}
    </button>
  );
}
