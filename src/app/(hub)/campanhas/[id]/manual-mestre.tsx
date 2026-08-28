"use client";

import { useEffect, useRef, useState } from "react";

/*
  Anotações livres do mestre — plano de sessão, NPCs, segredos do enredo.
  Salva sozinho, com debounce, igual as fichas de personagem já fazem: sem
  botão de salvar, só um aviso discreto se alguma vez falhar.
*/
export function ManualDoMestre({
  campanhaId,
  textoInicial,
}: {
  campanhaId: string;
  textoInicial: string;
}) {
  const [texto, setTexto] = useState(textoInicial);
  const [erro, setErro] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  function aoDigitar(novoTexto: string) {
    setTexto(novoTexto);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const resposta = await fetch(`/api/campanhas/${campanhaId}/manual-mestre`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: novoTexto }),
        });
        setErro(!resposta.ok);
      } catch {
        setErro(true);
      }
    }, 600);
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Manual do Mestre</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Só você vê isso. Plano de sessão, segredos, NPCs — o que quiser
        anotar sobre esta campanha.
      </p>
      <textarea
        value={texto}
        onChange={(evento) => aoDigitar(evento.target.value)}
        rows={10}
        placeholder="Comece a escrever…"
        className="mt-4 w-full rounded-lg border border-borda bg-superficie p-4 text-sm text-texto focus:border-ambar/60 focus:outline-none"
      />
      {erro && (
        <p className="mt-2 text-sm text-segredo">
          Não consegui salvar agora. Confira sua internet.
        </p>
      )}
    </section>
  );
}
