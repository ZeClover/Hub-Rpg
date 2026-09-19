"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Enquete simples (decisão #136) — só o mestre pergunta, qualquer
  participante vota (pode trocar até fechar), só o mestre encerra.
  Contagem de votos sempre visível: não é informação de mestre (decisão
  #13 não se aplica aqui), é o resultado que todo mundo está votando.
*/

export type EnqueteView = {
  id: string;
  pergunta: string;
  opcoes: string[];
  encerrada: boolean;
  criadoEm: string;
  votos: { usuarioId: string; opcaoIndex: number }[];
};

export function Enquetes({
  campanhaId,
  enquetes,
  souMestre,
  meuUsuarioId,
}: {
  campanhaId: string;
  enquetes: EnqueteView[];
  souMestre: boolean;
  meuUsuarioId: string;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState(["", ""]);
  const [publicando, setPublicando] = useState(false);

  const ordenadas = [...enquetes].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );

  async function publicar() {
    const opcoesValidas = opcoes.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!pergunta.trim() || opcoesValidas.length < 2) return;
    setPublicando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/enquetes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: pergunta.trim(), opcoes: opcoesValidas }),
      });
      if (resposta.ok) {
        setPergunta("");
        setOpcoes(["", ""]);
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
        <h2 className="font-titulo text-xl">Enquetes</h2>
        {souMestre && !criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Nova enquete
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-3 flex flex-col gap-2 rounded border border-borda bg-fundo p-3">
          <input
            type="text"
            value={pergunta}
            onChange={(evento) => setPergunta(evento.target.value)}
            placeholder="Pergunta…"
            className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          {opcoes.map((opcao, indice) => (
            <input
              key={indice}
              type="text"
              value={opcao}
              onChange={(evento) => {
                const novas = [...opcoes];
                novas[indice] = evento.target.value;
                setOpcoes(novas);
              }}
              placeholder={`Opção ${indice + 1}`}
              className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
            />
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpcoes([...opcoes, ""])}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              + Opção
            </button>
            <button
              type="button"
              onClick={publicar}
              disabled={publicando}
              className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
            >
              {publicando ? "Publicando…" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCriando(false);
                setPergunta("");
                setOpcoes(["", ""]);
              }}
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {ordenadas.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhuma enquete ainda.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {ordenadas.map((enquete) => (
            <EnqueteItem
              key={enquete.id}
              campanhaId={campanhaId}
              enquete={enquete}
              souMestre={souMestre}
              meuUsuarioId={meuUsuarioId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EnqueteItem({
  campanhaId,
  enquete,
  souMestre,
  meuUsuarioId,
}: {
  campanhaId: string;
  enquete: EnqueteView;
  souMestre: boolean;
  meuUsuarioId: string;
}) {
  const roteador = useRouter();
  const [votando, setVotando] = useState(false);
  const [encerrando, setEncerrando] = useState(false);

  const meuVoto = enquete.votos.find((v) => v.usuarioId === meuUsuarioId)?.opcaoIndex;
  const totalVotos = enquete.votos.length;

  async function votar(opcaoIndex: number) {
    setVotando(true);
    try {
      const resposta = await fetch(
        `/api/campanhas/${campanhaId}/enquetes/${enquete.id}/votar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opcaoIndex }),
        },
      );
      if (resposta.ok) roteador.refresh();
    } finally {
      setVotando(false);
    }
  }

  async function encerrar() {
    if (!confirm("Encerrar esta enquete? Não dá para reabrir.")) return;
    setEncerrando(true);
    try {
      const resposta = await fetch(
        `/api/campanhas/${campanhaId}/enquetes/${enquete.id}/encerrar`,
        { method: "PATCH" },
      );
      if (resposta.ok) roteador.refresh();
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <div className="rounded-lg border border-borda bg-superficie p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-titulo text-base">{enquete.pergunta}</p>
        {enquete.encerrada && (
          <span className="text-xs text-texto-suave">Encerrada</span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {enquete.opcoes.map((opcao, indice) => {
          const votosDaOpcao = enquete.votos.filter((v) => v.opcaoIndex === indice).length;
          const porcentagem = totalVotos > 0 ? Math.round((votosDaOpcao / totalVotos) * 100) : 0;
          const escolhida = meuVoto === indice;
          return (
            <button
              key={indice}
              type="button"
              onClick={() => votar(indice)}
              disabled={votando || enquete.encerrada}
              className="block w-full rounded border border-borda p-2 text-left text-sm transition disabled:cursor-default"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={escolhida ? "text-ambar-forte" : "text-texto"}>
                  {escolhida ? "● " : ""}
                  {opcao}
                </span>
                <span className="text-xs text-texto-suave">
                  {votosDaOpcao} ({porcentagem}%)
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-fundo">
                <div
                  className="h-full rounded-full bg-ambar/60"
                  style={{ width: `${porcentagem}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-texto-suave">
        {totalVotos} {totalVotos === 1 ? "voto" : "votos"}
      </p>

      {souMestre && !enquete.encerrada && (
        <button
          type="button"
          onClick={encerrar}
          disabled={encerrando}
          className="mt-3 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto disabled:opacity-50"
        >
          Encerrar enquete
        </button>
      )}
    </div>
  );
}
