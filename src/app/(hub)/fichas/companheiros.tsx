"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Companheiros/pets como vínculo entre fichas já existentes (decisão #147,
  ideia #56) — não é um tipo de ficha novo, só uma marcação de "esta ficha é
  companheira daquela". As duas continuam sendo fichas comuns, cada uma
  com sua própria página no sistema dela.
*/
export function Companheiros({
  personagemId,
  companheiros,
  candidatas,
}: {
  personagemId: string;
  companheiros: { id: string; nome: string }[];
  candidatas: { id: string; nome: string }[];
}) {
  const roteador = useRouter();
  const [adicionando, setAdicionando] = useState(false);
  const [escolha, setEscolha] = useState("");
  const [processando, setProcessando] = useState(false);

  const idsLigados = new Set(companheiros.map((c) => c.id));
  const disponiveis = candidatas.filter((c) => !idsLigados.has(c.id));

  async function adicionar() {
    if (!escolha) return;
    setProcessando(true);
    try {
      const resposta = await fetch(`/api/personagens/${personagemId}/companheiros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companheiroId: escolha }),
      });
      if (resposta.ok) {
        setEscolha("");
        setAdicionando(false);
        roteador.refresh();
      }
    } finally {
      setProcessando(false);
    }
  }

  async function remover(companheiroId: string) {
    const resposta = await fetch(
      `/api/personagens/${personagemId}/companheiros/${companheiroId}`,
      { method: "DELETE" },
    );
    if (resposta.ok) roteador.refresh();
  }

  if (companheiros.length === 0 && disponiveis.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {companheiros.map((c) => (
        <span
          key={c.id}
          className="flex items-center gap-1 rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
        >
          🐾 {c.nome}
          <button
            type="button"
            onClick={() => remover(c.id)}
            className="text-texto-suave hover:text-segredo"
            aria-label={`Desfazer vínculo com ${c.nome}`}
          >
            ×
          </button>
        </span>
      ))}
      {disponiveis.length > 0 &&
        (adicionando ? (
          <span className="flex items-center gap-1">
            <select
              value={escolha}
              onChange={(evento) => setEscolha(evento.target.value)}
              className="rounded border border-borda bg-fundo px-1 py-0.5 text-xs text-texto"
            >
              <option value="">Escolher ficha…</option>
              {disponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={adicionar}
              disabled={processando || !escolha}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              Ligar
            </button>
            <button
              type="button"
              onClick={() => setAdicionando(false)}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
          >
            + Companheiro
          </button>
        ))}
    </div>
  );
}
