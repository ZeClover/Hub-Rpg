"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Conquistas da campanha (decisão #140) — marcos que o mestre declara
  ("o grupo derrotou o Dragão Vermelho"). Sem relação nenhuma com as
  conquistas de Campanha Livre (aquelas vivem no `dados` json da própria
  ficha daquele sistema, e não são mexidas aqui). Só o mestre publica/
  edita/apaga; qualquer participante lê.
*/

export type ConquistaView = {
  id: string;
  titulo: string;
  descricao: string | null;
  criadoEm: string;
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { dateStyle: "long" });
}

export function Conquistas({
  campanhaId,
  conquistas,
  souMestre,
}: {
  campanhaId: string;
  conquistas: ConquistaView[];
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [publicando, setPublicando] = useState(false);

  const ordenadas = [...conquistas].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );

  if (ordenadas.length === 0 && !souMestre) return null;

  async function publicar() {
    if (!titulo.trim()) return;
    setPublicando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/conquistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo.trim(), descricao: descricao.trim() }),
      });
      if (resposta.ok) {
        setTitulo("");
        setDescricao("");
        setCriando(false);
        roteador.refresh();
      }
    } finally {
      setPublicando(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-xl">Conquistas</h2>
        {souMestre && !criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Nova conquista
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-3 flex flex-col gap-2 rounded border border-borda bg-fundo p-3">
          <input
            type="text"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            placeholder="O que o grupo conquistou?"
            className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          <textarea
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            rows={2}
            placeholder="Detalhes (opcional)"
            className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={publicar}
              disabled={publicando || !titulo.trim()}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              {publicando ? "Publicando…" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCriando(false);
                setTitulo("");
                setDescricao("");
              }}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {ordenadas.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhuma conquista registrada ainda.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {ordenadas.map((conquista) => (
            <ConquistaItem
              key={conquista.id}
              campanhaId={campanhaId}
              conquista={conquista}
              souMestre={souMestre}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ConquistaItem({
  campanhaId,
  conquista,
  souMestre,
}: {
  campanhaId: string;
  conquista: ConquistaView;
  souMestre: boolean;
}) {
  const roteador = useRouter();

  async function excluir() {
    if (!confirm(`Excluir a conquista "${conquista.titulo}"? Não dá para desfazer.`)) return;
    const resposta = await fetch(`/api/campanhas/${campanhaId}/conquistas/${conquista.id}`, {
      method: "DELETE",
    });
    if (resposta.ok) roteador.refresh();
  }

  return (
    <li className="rounded-lg border border-ambar/30 bg-ambar/5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-titulo text-base">🏆 {conquista.titulo}</p>
        <span className="text-xs text-texto-suave">{formatarData(conquista.criadoEm)}</span>
      </div>
      {conquista.descricao && (
        <p className="mt-1 text-sm text-texto-suave">{conquista.descricao}</p>
      )}
      {souMestre && (
        <button
          type="button"
          onClick={excluir}
          className="mt-2 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
        >
          Excluir
        </button>
      )}
    </li>
  );
}
