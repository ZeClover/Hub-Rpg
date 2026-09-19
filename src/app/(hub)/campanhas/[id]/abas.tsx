"use client";

import { useState } from "react";

/*
  Abas genéricas da página da campanha (decisão #144, ideia #134 do
  pedido original: "abas conforme os módulos forem existindo, não criar
  seção vazia à toa"). Só reorganiza apresentação — cada seção continua
  sendo exatamente o mesmo componente de sempre, só que agrupado; nenhum
  dado novo, nenhuma rota nova.

  Só a aba ativa é montada (não é CSS escondendo as outras): assim o Chat
  e o Painel — que fazem polling sozinhos — não ficam pedindo dado à toa
  pras abas que ninguém está olhando.
*/
export function Abas({
  abas,
}: {
  abas: { id: string; rotulo: string; conteudo: React.ReactNode }[];
}) {
  const [ativa, setAtiva] = useState(abas[0]?.id);

  return (
    <div className="mt-8">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-borda">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={ativa === aba.id}
            onClick={() => setAtiva(aba.id)}
            className={
              ativa === aba.id
                ? "rounded-t border border-b-0 border-borda bg-superficie px-4 py-2 text-sm text-ambar-forte"
                : "rounded-t border border-b-0 border-transparent px-4 py-2 text-sm text-texto-suave transition hover:text-texto"
            }
          >
            {aba.rotulo}
          </button>
        ))}
      </div>
      <div className="mt-2">{abas.find((a) => a.id === ativa)?.conteudo}</div>
    </div>
  );
}
