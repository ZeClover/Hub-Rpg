"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Excluir é definitivo — a confirmação do navegador é de propósito simples
  aqui, igual excluir uma ficha. As fichas ligadas a esta campanha não são
  apagadas, só voltam a ser fichas avulsas.
*/
export function ExcluirCampanha({ campanhaId, nome }: { campanhaId: string; nome: string }) {
  const roteador = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (
      !confirm(
        `Excluir a campanha "${nome}"? Não dá para desfazer. As fichas ligadas a ela não são apagadas — voltam a ser fichas avulsas.`,
      )
    )
      return;

    setExcluindo(true);
    const resposta = await fetch(`/api/campanhas/${campanhaId}`, { method: "DELETE" });
    if (resposta.ok) {
      roteador.push("/campanhas");
    } else {
      alert("Não consegui excluir agora. Tenta de novo.");
      setExcluindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={excluindo}
      className="mt-3 text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-segredo disabled:opacity-50"
    >
      {excluindo ? "Excluindo…" : "Excluir campanha"}
    </button>
  );
}
