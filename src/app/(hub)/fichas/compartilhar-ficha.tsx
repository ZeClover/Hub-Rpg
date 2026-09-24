"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { QrCode } from "../qr-code";

/*
  Compartilhamento da ficha (decisão #46) e QR Code do link (decisão #149,
  ideia #132) — reunidos aqui, na página geral do personagem, em vez de
  duplicados dentro de cada uma das ~10 fichas de sistema (cada uma é um
  HTML solto, sem nenhum jeito de compartilhar componente React entre elas
  — decisão #17 continua valendo: nada de regra de sistema aqui, isto é só
  o link de leitura, que já existia por fora de qualquer sistema).
*/
export function CompartilharFicha({
  personagemId,
  link,
  compartilhadoInicial,
}: {
  personagemId: string;
  link: string;
  compartilhadoInicial: boolean;
}) {
  const roteador = useRouter();
  const [compartilhado, setCompartilhado] = useState(compartilhadoInicial);
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    const novoValor = !compartilhado;
    setCompartilhado(novoValor);
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/personagens/${personagemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compartilhado: novoValor }),
      });
      if (resposta.ok) {
        roteador.refresh();
      } else {
        setCompartilhado(!novoValor);
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-borda bg-superficie p-6">
      <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
        Compartilhamento
      </p>
      <label className="mt-3 flex items-center gap-2 text-sm text-texto">
        <input
          type="checkbox"
          checked={compartilhado}
          onChange={alternar}
          disabled={salvando}
        />
        Qualquer pessoa com o link abre esta ficha em modo leitura
      </label>

      {compartilhado && (
        <>
          <p className="mt-3 break-all rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto">
            {link}
          </p>
          <QrCode valor={link} />
        </>
      )}
    </section>
  );
}
