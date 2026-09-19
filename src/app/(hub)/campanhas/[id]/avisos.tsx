"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Mural de avisos (decisão #136) — só o mestre publica/edita/apaga/fixa;
  jogador só lê. Mesmo padrão do resto da página: props vindas do Server
  Component, cada ação chama a API e usa `router.refresh()`.
*/

export type AvisoView = {
  id: string;
  texto: string;
  fixado: boolean;
  criadoEm: string;
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function Avisos({
  campanhaId,
  avisos,
  souMestre,
}: {
  campanhaId: string;
  avisos: AvisoView[];
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [novoTexto, setNovoTexto] = useState("");
  const [publicando, setPublicando] = useState(false);

  const ordenados = [...avisos].sort((a, b) => {
    if (a.fixado !== b.fixado) return a.fixado ? -1 : 1;
    return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
  });

  async function publicar() {
    const valor = novoTexto.trim();
    if (!valor) return;
    setPublicando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/avisos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: valor }),
      });
      if (resposta.ok) {
        setNovoTexto("");
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
        <h2 className="font-titulo text-xl">Avisos</h2>
        {souMestre && !criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Novo aviso
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-3 flex flex-col gap-2 rounded border border-borda bg-fundo p-3">
          <textarea
            value={novoTexto}
            onChange={(evento) => setNovoTexto(evento.target.value)}
            rows={2}
            placeholder="Texto do aviso…"
            className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={publicar}
              disabled={publicando || !novoTexto.trim()}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              {publicando ? "Publicando…" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCriando(false);
                setNovoTexto("");
              }}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {ordenados.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhum aviso publicado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {ordenados.map((aviso) => (
            <AvisoItem key={aviso.id} campanhaId={campanhaId} aviso={aviso} souMestre={souMestre} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AvisoItem({
  campanhaId,
  aviso,
  souMestre,
}: {
  campanhaId: string;
  aviso: AvisoView;
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(aviso.texto);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const valor = texto.trim();
    if (!valor) return;
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/avisos/${aviso.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: valor }),
      });
      if (resposta.ok) {
        setEditando(false);
        roteador.refresh();
      }
    } finally {
      setSalvando(false);
    }
  }

  async function alternarFixado() {
    const resposta = await fetch(`/api/campanhas/${campanhaId}/avisos/${aviso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixado: !aviso.fixado }),
    });
    if (resposta.ok) roteador.refresh();
  }

  async function excluir() {
    if (!confirm("Excluir este aviso? Não dá para desfazer.")) return;
    const resposta = await fetch(`/api/campanhas/${campanhaId}/avisos/${aviso.id}`, {
      method: "DELETE",
    });
    if (resposta.ok) roteador.refresh();
  }

  return (
    <li
      className={
        aviso.fixado
          ? "rounded-lg border border-ambar/40 bg-ambar/5 p-4"
          : "rounded-lg border border-borda bg-superficie p-4"
      }
    >
      {aviso.fixado && (
        <p className="font-titulo text-xs uppercase tracking-wide text-ambar-forte">📌 Fixado</p>
      )}

      {editando ? (
        <div className="mt-1 flex flex-col gap-2">
          <textarea
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            rows={2}
            className="rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setTexto(aviso.texto);
              }}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-sm text-texto">{aviso.texto}</p>
      )}

      <p className="mt-2 text-xs text-texto-suave">{formatarData(aviso.criadoEm)}</p>

      {souMestre && !editando && (
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={alternarFixado}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
          >
            {aviso.fixado ? "Desfixar" : "Fixar"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
          >
            Editar
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
    </li>
  );
}
