"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoverJogador({
  campanhaId,
  usuarioId,
  nome,
}: {
  campanhaId: string;
  usuarioId: string;
  nome: string;
}) {
  const roteador = useRouter();
  const [removendo, setRemovendo] = useState(false);

  async function remover() {
    if (!confirm(`Tirar ${nome} desta campanha? A ficha dele não é apagada, só solta.`)) return;

    setRemovendo(true);
    const resposta = await fetch(`/api/campanhas/${campanhaId}/jogadores/${usuarioId}`, {
      method: "DELETE",
    });
    if (resposta.ok) {
      roteador.refresh();
    } else {
      alert("Não consegui remover agora. Tenta de novo.");
      setRemovendo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remover}
      disabled={removendo}
      className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-segredo disabled:opacity-50"
    >
      {removendo ? "Removendo…" : "Remover"}
    </button>
  );
}
