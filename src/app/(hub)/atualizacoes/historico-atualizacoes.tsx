"use client";

import { useState } from "react";
import type { Atualizacao } from "@/lib/atualizacoes";

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function dataLegivel(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function HistoricoAtualizacoes({ atualizacoes }: { atualizacoes: Atualizacao[] }) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const termo = normalizar(busca.trim());
  const visiveis = atualizacoes
    .map((atualizacao) => ({
      ...atualizacao,
      novidades: normalizar(`${atualizacao.titulo} ${dataLegivel(atualizacao.data)} ${atualizacao.data}`).includes(termo)
        ? atualizacao.novidades
        : atualizacao.novidades.filter((novidade) => normalizar(novidade).includes(termo)),
    }))
    .filter((atualizacao) => atualizacao.novidades.length > 0)
    .sort((a, b) => ordem === "recentes" ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data));

  return (
    <>
      <div className="mt-8 grid gap-4 rounded-lg border border-borda bg-superficie p-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="busca-atualizacoes" className="text-sm text-texto-suave">Buscar nas atualizações</label>
          <input id="busca-atualizacoes" type="search" value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Ex.: Hogwarts, fichas, inventário…" className="mt-2 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ambar" />
        </div>
        <div>
          <label htmlFor="ordem-atualizacoes" className="text-sm text-texto-suave">Ordem de leitura</label>
          <select id="ordem-atualizacoes" value={ordem} onChange={(evento) => setOrdem(evento.target.value)} className="mt-2 block w-full rounded border border-borda bg-fundo px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ambar">
            <option value="recentes">Mais recentes primeiro</option>
            <option value="antigas">Desde o começo</option>
          </select>
        </div>
      </div>
      <p role="status" className="mt-4 text-sm text-texto-suave">{visiveis.length} de {atualizacoes.length} datas{termo ? " encontradas" : " no histórico"}.</p>
      {visiveis.length === 0 ? (
        <div className="mt-6 rounded-lg border border-borda bg-superficie p-6">
          <p>Nenhuma atualização encontrada para essa busca.</p>
          <button type="button" onClick={() => setBusca("")} className="mt-3 text-sm text-ambar-forte underline underline-offset-4">Limpar busca</button>
        </div>
      ) : (
        <ol className="mt-6 space-y-6" aria-label="Histórico de atualizações">
          {visiveis.map((atualizacao) => (
            <li key={atualizacao.data}>
              <article className="rounded-lg border border-borda bg-superficie p-5 sm:p-6" aria-labelledby={`titulo-${atualizacao.data}`}>
                <time dateTime={atualizacao.data} className="text-sm font-medium text-ambar-forte">{dataLegivel(atualizacao.data)}</time>
                <h2 id={`titulo-${atualizacao.data}`} className="mt-2 font-titulo text-xl">{atualizacao.titulo}</h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-texto">
                  {atualizacao.novidades.map((novidade) => <li key={novidade}>{novidade}</li>)}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
