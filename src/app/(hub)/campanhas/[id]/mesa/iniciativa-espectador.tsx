"use client";

import { useEffect, useState } from "react";

type Combatente = { id: string; nome: string; condicao: string };
type EstadoIniciativa = { combatentes: Combatente[]; vezDe: number; rodada: number };

const INTERVALO_MS = 6000;

/*
  Espelho em modo leitura da ordem de iniciativa (decisão #137) — quem
  controla continua sendo o mestre, no `RastreadorDeIniciativa` da própria
  tela dele. Este componente só busca (`GET /api/campanhas/[id]/iniciativa`)
  e repete por polling, igual o Chat da campanha.
*/
export function IniciativaEspectador({ campanhaId }: { campanhaId: string }) {
  const [estado, setEstado] = useState<EstadoIniciativa | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/iniciativa`);
      if (!resposta.ok || cancelado) return;
      const dados = await resposta.json();
      setEstado(dados.iniciativa);
      setCarregado(true);
    }

    buscar();
    const intervalo = setInterval(buscar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [campanhaId]);

  return (
    <section className="mt-10">
      <h2 className="font-titulo text-xl">Ordem de iniciativa</h2>
      <p className="mt-2 text-sm text-texto-suave">
        O mestre controla a ordem — aqui é só acompanhar.
      </p>

      {!carregado ? (
        <p className="mt-4 text-sm text-texto-suave">Carregando…</p>
      ) : !estado || estado.combatentes.length === 0 ? (
        <p className="mt-4 text-sm text-texto-suave">Ninguém na ordem ainda.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-texto-suave">Rodada {estado.rodada}</p>
          <ul className="mt-3 space-y-2">
            {estado.combatentes.map((c, indice) => (
              <li
                key={c.id}
                className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 ${
                  indice === estado.vezDe
                    ? "border-ambar/60 bg-ambar/10"
                    : "border-borda bg-superficie"
                }`}
              >
                <span className="w-6 text-center text-xs text-texto-suave">{indice + 1}</span>
                <span className="font-titulo text-sm">{c.nome}</span>
                {c.condicao && (
                  <span className="text-xs text-texto-suave">— {c.condicao}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
