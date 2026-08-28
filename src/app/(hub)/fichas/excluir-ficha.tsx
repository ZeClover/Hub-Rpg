"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Excluir é definitivo — a confirmação do navegador (confirm()) é de
  propósito simples aqui: não tem rascunho, nem lixeira, nem desfazer.
  `router.refresh()` busca a lista de novo do servidor sem recarregar a
  página inteira nem perder a rolagem.
*/
export function BotaoExcluir({ id, nome }: { id: string; nome: string }) {
  const roteador = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir(evento: React.MouseEvent) {
    evento.preventDefault();
    if (!confirm(`Excluir "${nome}"? Não dá para desfazer.`)) return;

    setExcluindo(true);
    const resposta = await fetch(`/api/personagens/${id}`, { method: "DELETE" });
    if (resposta.ok) {
      roteador.refresh();
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
      className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-segredo disabled:opacity-50"
    >
      {excluindo ? "Excluindo…" : "Excluir"}
    </button>
  );
}
