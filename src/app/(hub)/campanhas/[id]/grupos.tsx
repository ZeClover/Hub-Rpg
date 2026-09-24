"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Grupos/equipes dentro da campanha (decisão #147, ideia #58) — só
  organizacional ("esquadrão A", "os que ficaram na cidade"), não muda
  regra de sistema nenhuma. Só o mestre cria/renomeia/apaga grupos e
  adiciona/remove fichas; qualquer participante lê.
*/

export type GrupoView = {
  id: string;
  nome: string;
  membros: { personagemId: string; nome: string }[];
  itens: { id: string; nome: string; descricao: string | null; quantidade: number }[];
};

export function Grupos({
  campanhaId,
  grupos,
  fichasDaCampanha,
  souMestre,
}: {
  campanhaId: string;
  grupos: GrupoView[];
  fichasDaCampanha: { id: string; nome: string }[];
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [publicando, setPublicando] = useState(false);

  async function criar() {
    if (!nome.trim()) return;
    setPublicando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/grupos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      });
      if (resposta.ok) {
        setNome("");
        setCriando(false);
        roteador.refresh();
      }
    } finally {
      setPublicando(false);
    }
  }

  if (grupos.length === 0 && !souMestre) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-xl">Grupos</h2>
        {souMestre && !criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Novo grupo
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-borda bg-fundo p-3">
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome do grupo (ex.: Esquadrão A)"
            className="min-w-[160px] flex-1 rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          <button
            type="button"
            onClick={criar}
            disabled={publicando || !nome.trim()}
            className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
          >
            {publicando ? "Criando…" : "Criar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCriando(false);
              setNome("");
            }}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
          >
            Cancelar
          </button>
        </div>
      )}

      {grupos.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhum grupo criado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {grupos.map((grupo) => (
            <GrupoItem
              key={grupo.id}
              campanhaId={campanhaId}
              grupo={grupo}
              fichasDaCampanha={fichasDaCampanha}
              souMestre={souMestre}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function GrupoItem({
  campanhaId,
  grupo,
  fichasDaCampanha,
  souMestre,
}: {
  campanhaId: string;
  grupo: GrupoView;
  fichasDaCampanha: { id: string; nome: string }[];
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [renomeando, setRenomeando] = useState(false);
  const [nome, setNome] = useState(grupo.nome);
  const [adicionando, setAdicionando] = useState(false);
  const [novaFicha, setNovaFicha] = useState("");
  const [processando, setProcessando] = useState(false);

  const idsMembros = new Set(grupo.membros.map((m) => m.personagemId));
  const fichasDisponiveis = fichasDaCampanha.filter((f) => !idsMembros.has(f.id));

  async function renomear() {
    if (!nome.trim()) return;
    setProcessando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/grupos/${grupo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim() }),
      });
      if (resposta.ok) {
        setRenomeando(false);
        roteador.refresh();
      }
    } finally {
      setProcessando(false);
    }
  }

  async function excluir() {
    if (!confirm(`Excluir o grupo "${grupo.nome}"? Os itens do inventário compartilhado voltam pro cofre da campanha.`)) return;
    const resposta = await fetch(`/api/campanhas/${campanhaId}/grupos/${grupo.id}`, {
      method: "DELETE",
    });
    if (resposta.ok) roteador.refresh();
  }

  async function adicionarMembro() {
    if (!novaFicha) return;
    setProcessando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/grupos/${grupo.id}/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personagemId: novaFicha }),
      });
      if (resposta.ok) {
        setNovaFicha("");
        setAdicionando(false);
        roteador.refresh();
      }
    } finally {
      setProcessando(false);
    }
  }

  async function removerMembro(personagemId: string) {
    const resposta = await fetch(
      `/api/campanhas/${campanhaId}/grupos/${grupo.id}/membros/${personagemId}`,
      { method: "DELETE" },
    );
    if (resposta.ok) roteador.refresh();
  }

  return (
    <li className="rounded-lg border border-borda bg-superficie p-4">
      <div className="flex items-center justify-between gap-3">
        {renomeando ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              className="flex-1 rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto"
            />
            <button
              type="button"
              onClick={renomear}
              disabled={processando}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setRenomeando(false);
                setNome(grupo.nome);
              }}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <span className="font-titulo text-base">{grupo.nome}</span>
        )}

        {souMestre && !renomeando && (
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setRenomeando(true)}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
            >
              Renomear
            </button>
            <button
              type="button"
              onClick={excluir}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {grupo.membros.length === 0 ? (
        <p className="mt-2 text-sm text-texto-suave">Nenhuma ficha neste grupo.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {grupo.membros.map((membro) => (
            <li
              key={membro.personagemId}
              className="flex items-center gap-2 rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
            >
              {membro.nome}
              {souMestre && (
                <button
                  type="button"
                  onClick={() => removerMembro(membro.personagemId)}
                  className="text-texto-suave hover:text-segredo"
                  aria-label={`Remover ${membro.nome} do grupo`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {souMestre &&
        (adicionando ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={novaFicha}
              onChange={(evento) => setNovaFicha(evento.target.value)}
              className="rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto"
            >
              <option value="">Escolher ficha…</option>
              {fichasDisponiveis.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={adicionarMembro}
              disabled={processando || !novaFicha}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => setAdicionando(false)}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        ) : (
          fichasDisponiveis.length > 0 && (
            <button
              type="button"
              onClick={() => setAdicionando(true)}
              className="mt-3 text-xs text-ambar-forte underline underline-offset-2"
            >
              + Adicionar ficha
            </button>
          )
        ))}
    </li>
  );
}
