"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Sessões da campanha (decisão #135) — número, data/horário, resumo,
  mudanças importantes e confirmação de presença (Vou/Talvez/Não vou).
  O modelo `Sessao` já existia no schema desde o início do projeto, mas
  nenhuma rota ou tela usava ele antes desta fatia.

  Mesmo padrão do resto da página: cada ação chama a API e usa
  `router.refresh()` pra buscar o estado novo do servidor, em vez de
  duplicar lógica de sincronização de estado no cliente.
*/

export type SessaoView = {
  id: string;
  numero: number;
  data: string;
  resumoPublico: string | null;
  mudancasImportantes: string | null;
  notasMestre: string | null;
  presencas: { usuarioId: string; resposta: "VOU" | "TALVEZ" | "NAO_VOU" }[];
};

type Pessoa = { usuarioId: string; nome: string };

const ROTULO_RESPOSTA: Record<string, string> = {
  VOU: "Vou",
  TALVEZ: "Talvez",
  NAO_VOU: "Não vou",
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

// `datetime-local` não entende timezone — value precisa vir sem os
// segundos/timezone do ISO completo.
function paraDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function Sessoes({
  campanhaId,
  sessoes,
  souMestre,
  meuUsuarioId,
  pessoas,
  agoraMs,
}: {
  campanhaId: string;
  sessoes: SessaoView[];
  souMestre: boolean;
  meuUsuarioId: string;
  pessoas: Pessoa[];
  // Calculado no Server Component (page.tsx), não aqui — Date.now() é uma
  // chamada impura, e o React não permite isso durante o render de um
  // Client Component (react-hooks/purity).
  agoraMs: number;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const agora = agoraMs;
  const proximas = sessoes
    .filter((s) => new Date(s.data).getTime() >= agora)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  const passadas = sessoes
    .filter((s) => new Date(s.data).getTime() < agora)
    .sort((a, b) => b.numero - a.numero);

  async function criarSessao() {
    if (!novaData) return;
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/sessoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: new Date(novaData).toISOString() }),
      });
      if (!resposta.ok) throw new Error("falhou");
      setNovaData("");
      roteador.refresh();
    } catch {
      setErro("Não consegui marcar a sessão agora. Tenta de novo.");
    } finally {
      setCriando(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Sessões</h2>

      {souMestre && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="datetime-local"
            value={novaData}
            onChange={(evento) => setNovaData(evento.target.value)}
            className="rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto"
          />
          <button
            type="button"
            onClick={criarSessao}
            disabled={criando || !novaData}
            className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
          >
            {criando ? "Marcando…" : "Marcar sessão"}
          </button>
          {erro && <p className="w-full text-sm text-segredo">{erro}</p>}
        </div>
      )}

      {sessoes.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhuma sessão marcada ainda.</p>
      ) : (
        <>
          {proximas.length > 0 && (
            <div className="mt-4 space-y-3">
              {proximas.map((sessao) => (
                <SessaoItem
                  key={sessao.id}
                  campanhaId={campanhaId}
                  sessao={sessao}
                  souMestre={souMestre}
                  meuUsuarioId={meuUsuarioId}
                  pessoas={pessoas}
                  futura
                />
              ))}
            </div>
          )}
          {passadas.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-texto-suave hover:text-texto">
                Sessões passadas ({passadas.length})
              </summary>
              <div className="mt-3 space-y-3">
                {passadas.map((sessao) => (
                  <SessaoItem
                    key={sessao.id}
                    campanhaId={campanhaId}
                    sessao={sessao}
                    souMestre={souMestre}
                    meuUsuarioId={meuUsuarioId}
                    pessoas={pessoas}
                    futura={false}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}

function SessaoItem({
  campanhaId,
  sessao,
  souMestre,
  meuUsuarioId,
  pessoas,
  futura,
}: {
  campanhaId: string;
  sessao: SessaoView;
  souMestre: boolean;
  meuUsuarioId: string;
  pessoas: Pessoa[];
  futura: boolean;
}) {
  const roteador = useRouter();
  const [editando, setEditando] = useState(false);
  const [respondendo, setRespondendo] = useState(false);

  const minhaResposta = sessao.presencas.find((p) => p.usuarioId === meuUsuarioId)?.resposta;

  async function responder(resposta: "VOU" | "TALVEZ" | "NAO_VOU") {
    setRespondendo(true);
    try {
      const resp = await fetch(
        `/api/campanhas/${campanhaId}/sessoes/${sessao.id}/presenca`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resposta }),
        },
      );
      if (resp.ok) roteador.refresh();
    } finally {
      setRespondendo(false);
    }
  }

  async function excluir() {
    if (!confirm(`Excluir a sessão ${sessao.numero}? Não dá para desfazer.`)) return;
    const resp = await fetch(`/api/campanhas/${campanhaId}/sessoes/${sessao.id}`, {
      method: "DELETE",
    });
    if (resp.ok) roteador.refresh();
  }

  return (
    <div className="rounded-lg border border-borda bg-superficie p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-titulo text-base">Sessão {sessao.numero}</p>
        <span className="text-xs text-texto-suave">{formatarData(sessao.data)}</span>
      </div>

      {sessao.resumoPublico && (
        <p className="mt-2 text-sm text-texto-suave">{sessao.resumoPublico}</p>
      )}
      {sessao.mudancasImportantes && (
        <p className="mt-2 rounded border border-ambar/30 bg-ambar/5 px-3 py-2 text-sm text-texto">
          <span className="font-titulo text-xs uppercase tracking-wide text-ambar-forte">
            Mudanças importantes
          </span>
          <br />
          {sessao.mudancasImportantes}
        </p>
      )}

      {futura && (
        <div className="mt-3">
          <p className="text-xs text-texto-suave">Você vai?</p>
          <div className="mt-1 flex gap-2">
            {(["VOU", "TALVEZ", "NAO_VOU"] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => responder(opcao)}
                disabled={respondendo}
                className={
                  minhaResposta === opcao
                    ? "rounded border border-ambar/50 bg-ambar/15 px-3 py-1 text-xs text-ambar-forte disabled:opacity-50"
                    : "rounded border border-borda px-3 py-1 text-xs text-texto-suave transition hover:border-ambar/40 disabled:opacity-50"
                }
              >
                {ROTULO_RESPOSTA[opcao]}
              </button>
            ))}
          </div>
        </div>
      )}

      {souMestre && sessao.presencas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
          {(["VOU", "TALVEZ", "NAO_VOU"] as const).map((opcao) => {
            const gente = sessao.presencas
              .filter((p) => p.resposta === opcao)
              .map((p) => pessoas.find((pe) => pe.usuarioId === p.usuarioId)?.nome ?? "alguém");
            if (gente.length === 0) return null;
            return (
              <span key={opcao}>
                <strong className="text-texto">{ROTULO_RESPOSTA[opcao]}:</strong>{" "}
                {gente.join(", ")}
              </span>
            );
          })}
        </div>
      )}

      {souMestre && (
        <div className="mt-3">
          {editando ? (
            <EditorSessao
              campanhaId={campanhaId}
              sessao={sessao}
              onFechar={() => setEditando(false)}
            />
          ) : (
            <div className="flex gap-3">
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
        </div>
      )}
    </div>
  );
}

function EditorSessao({
  campanhaId,
  sessao,
  onFechar,
}: {
  campanhaId: string;
  sessao: SessaoView;
  onFechar: () => void;
}) {
  const roteador = useRouter();
  const [data, setData] = useState(paraDatetimeLocal(sessao.data));
  const [resumo, setResumo] = useState(sessao.resumoPublico ?? "");
  const [mudancas, setMudancas] = useState(sessao.mudancasImportantes ?? "");
  const [notas, setNotas] = useState(sessao.notasMestre ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/sessoes/${sessao.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: new Date(data).toISOString(),
          resumoPublico: resumo || null,
          mudancasImportantes: mudancas || null,
          notasMestre: notas || null,
        }),
      });
      if (resposta.ok) {
        roteador.refresh();
        onFechar();
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-borda bg-fundo p-3">
      <label className="text-xs text-texto-suave">
        Data e horário
        <input
          type="datetime-local"
          value={data}
          onChange={(evento) => setData(evento.target.value)}
          className="mt-1 block w-full rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
        />
      </label>
      <label className="text-xs text-texto-suave">
        Resumo (público)
        <textarea
          value={resumo}
          onChange={(evento) => setResumo(evento.target.value)}
          rows={2}
          className="mt-1 block w-full rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
        />
      </label>
      <label className="text-xs text-texto-suave">
        Mudanças importantes (público)
        <textarea
          value={mudancas}
          onChange={(evento) => setMudancas(evento.target.value)}
          rows={2}
          className="mt-1 block w-full rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
        />
      </label>
      <label className="text-xs text-texto-suave">
        Notas do mestre (só você vê)
        <textarea
          value={notas}
          onChange={(evento) => setNotas(evento.target.value)}
          rows={2}
          className="mt-1 block w-full rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
        />
      </label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onFechar}
          className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
