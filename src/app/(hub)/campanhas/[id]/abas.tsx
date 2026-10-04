"use client";
import { useId, useRef, useState } from "react";

// Somente a aba ativa é montada, para não multiplicar consultas do chat.
export function Abas({
  abas,
}: {
  abas: { id: string; rotulo: string; conteudo: React.ReactNode }[];
}) {
  const [ativa, setAtiva] = useState(abas[0]?.id);
  const id = useId();
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Seções da campanha"
        className="hub-tabs hub-campaign-tabs"
      >
        {abas.map((aba, i) => (
          <button
            key={aba.id}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            id={`${id}-${aba.id}`}
            type="button"
            role="tab"
            aria-selected={ativa === aba.id}
            aria-controls={`${id}-painel`}
            tabIndex={ativa === aba.id ? 0 : -1}
            onClick={() => setAtiva(aba.id)}
            onKeyDown={(e) => {
              let proximo = i;
              if (e.key === "ArrowRight") proximo = (i + 1) % abas.length;
              else if (e.key === "ArrowLeft")
                proximo = (i - 1 + abas.length) % abas.length;
              else if (e.key === "Home") proximo = 0;
              else if (e.key === "End") proximo = abas.length - 1;
              else return;
              e.preventDefault();
              setAtiva(abas[proximo].id);
              botoes.current[proximo]?.focus();
            }}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>
      <div
        id={`${id}-painel`}
        role="tabpanel"
        aria-labelledby={`${id}-${ativa}`}
        className="mt-5"
      >
        {abas.find((a) => a.id === ativa)?.conteudo}
      </div>
    </div>
  );
}
