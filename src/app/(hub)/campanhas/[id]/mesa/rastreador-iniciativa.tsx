"use client";

import { useEffect, useRef, useState } from "react";

type Combatente = { id: string; nome: string; condicao: string };
type EstadoIniciativa = { combatentes: Combatente[]; vezDe: number; rodada: number };

const ESTADO_VAZIO: EstadoIniciativa = { combatentes: [], vezDe: 0, rodada: 1 };

/*
  Ordem de turno da cena. Continua controlada só pelo navegador do mestre
  (localStorage) — o mestre não perde nada disso mudando de máquina no meio
  da sessão porque isso nunca foi pensado pra isso, é a mesma limitação de
  sempre. A novidade da decisão #137 é espelhar (debounced, "best effort":
  se falhar, o mestre nem percebe, a ordem local continua valendo) pro
  servidor a cada mudança, só pra jogador conseguir ver a mesma ordem em
  modo leitura (`VisaoEspectadorMesa`) — nunca o contrário, o servidor
  nunca manda estado de volta pra cá.
*/
function chaveArmazenamento(campanhaId: string) {
  return `mesa-iniciativa:${campanhaId}`;
}

// Só roda no primeiro render de cada campanha (via useState preguiçoso, não
// um efeito): ler o estado salvo é montar o estado inicial, não sincronizar
// com algo que muda por fora — não precisa de useEffect pra isso.
function lerEstadoSalvo(campanhaId: string): EstadoIniciativa {
  if (typeof window === "undefined") return ESTADO_VAZIO;
  try {
    const salvo = localStorage.getItem(chaveArmazenamento(campanhaId));
    if (!salvo) return ESTADO_VAZIO;
    const estado = JSON.parse(salvo);
    return {
      combatentes: estado.combatentes ?? [],
      vezDe: estado.vezDe ?? 0,
      rodada: estado.rodada ?? 1,
    };
  } catch {
    return ESTADO_VAZIO;
  }
}

export function RastreadorDeIniciativa({ campanhaId }: { campanhaId: string }) {
  const [estado, setEstado] = useState<EstadoIniciativa>(() => lerEstadoSalvo(campanhaId));
  const [nomeNovo, setNomeNovo] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [condicaoEmMassa, setCondicaoEmMassa] = useState("");
  const temporizadorSync = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { combatentes, vezDe, rodada } = estado;

  useEffect(() => {
    try {
      localStorage.setItem(chaveArmazenamento(campanhaId), JSON.stringify(estado));
    } catch {
      // localStorage indisponível (aba privada, navegador restrito) — a
      // sessão continua, só não persiste entre recarregamentos.
    }
  }, [campanhaId, estado]);

  // Espelha pro servidor 1.2s depois da última mudança, pra não mandar uma
  // requisição por tecla digitada na condição — só a foto final da pausa.
  useEffect(() => {
    if (temporizadorSync.current) clearTimeout(temporizadorSync.current);
    temporizadorSync.current = setTimeout(() => {
      fetch(`/api/campanhas/${campanhaId}/iniciativa`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estado),
      }).catch(() => {
        // Best effort — jogador só deixa de ver a ordem atualizada por um
        // instante, a Mesa ao Vivo do mestre não depende disso pra nada.
      });
    }, 1200);
    return () => {
      if (temporizadorSync.current) clearTimeout(temporizadorSync.current);
    };
  }, [campanhaId, estado]);

  function adicionar() {
    const nome = nomeNovo.trim();
    if (!nome) return;
    setEstado((e) => ({
      ...e,
      combatentes: [...e.combatentes, { id: crypto.randomUUID(), nome, condicao: "" }],
    }));
    setNomeNovo("");
  }

  function remover(id: string) {
    setEstado((e) => {
      const indice = e.combatentes.findIndex((c) => c.id === id);
      const nova = e.combatentes.filter((c) => c.id !== id);
      const vez =
        indice !== -1 && indice < e.vezDe
          ? Math.max(0, e.vezDe - 1)
          : nova.length > 0
            ? e.vezDe % nova.length
            : 0;
      return { ...e, combatentes: nova, vezDe: vez };
    });
    setSelecionados((atual) => {
      if (!atual.has(id)) return atual;
      const nova = new Set(atual);
      nova.delete(id);
      return nova;
    });
  }

  function mover(id: string, direcao: -1 | 1) {
    setEstado((e) => {
      const indice = e.combatentes.findIndex((c) => c.id === id);
      const alvo = indice + direcao;
      if (indice === -1 || alvo < 0 || alvo >= e.combatentes.length) return e;
      const nova = [...e.combatentes];
      [nova[indice], nova[alvo]] = [nova[alvo], nova[indice]];
      return { ...e, combatentes: nova };
    });
  }

  function condicao(id: string, texto: string) {
    setEstado((e) => ({
      ...e,
      combatentes: e.combatentes.map((c) => (c.id === id ? { ...c, condicao: texto } : c)),
    }));
  }

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  function aplicarCondicaoEmMassa() {
    if (selecionados.size === 0) return;
    setEstado((e) => ({
      ...e,
      combatentes: e.combatentes.map((c) =>
        selecionados.has(c.id) ? { ...c, condicao: condicaoEmMassa } : c,
      ),
    }));
    setCondicaoEmMassa("");
    setSelecionados(new Set());
  }

  function proximo() {
    setEstado((e) => {
      if (e.combatentes.length === 0) return e;
      const proxima = (e.vezDe + 1) % e.combatentes.length;
      return { ...e, vezDe: proxima, rodada: proxima === 0 ? e.rodada + 1 : e.rodada };
    });
  }

  function limpar() {
    setEstado(ESTADO_VAZIO);
    setSelecionados(new Set());
  }

  return (
    <section className="mt-10">
      <h2 className="font-titulo text-xl">Ordem de iniciativa</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Controlada aqui, no seu navegador — os jogadores só acompanham em
        modo leitura, você continua no comando.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-texto-suave">Rodada {rodada}</span>
        <button
          type="button"
          onClick={proximo}
          disabled={combatentes.length === 0}
          className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1 text-xs text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
        >
          Próximo turno →
        </button>
        {combatentes.length > 0 && (
          <button
            type="button"
            onClick={limpar}
            className="ml-auto text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {combatentes.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-borda bg-fundo p-3">
          <span className="text-xs text-texto-suave">
            {selecionados.size === 0
              ? "Marque quem foi atingido por um efeito em grupo…"
              : `${selecionados.size} selecionado(s):`}
          </span>
          <input
            value={condicaoEmMassa}
            onChange={(e) => setCondicaoEmMassa(e.target.value)}
            placeholder="condição pra todos os selecionados"
            disabled={selecionados.size === 0}
            className="min-w-0 flex-1 rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto focus:border-ambar/60 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={aplicarCondicaoEmMassa}
            disabled={selecionados.size === 0}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1 text-xs text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
          >
            Aplicar a todos
          </button>
        </div>
      )}

      {combatentes.length === 0 ? (
        <p className="mt-4 text-sm text-texto-suave">Ninguém na ordem ainda.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {combatentes.map((c, indice) => (
            <li
              key={c.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border p-3 ${
                indice === vezDe ? "border-ambar/60 bg-ambar/10" : "border-borda bg-superficie"
              }`}
            >
              {combatentes.length > 1 && (
                <input
                  type="checkbox"
                  checked={selecionados.has(c.id)}
                  onChange={() => alternarSelecao(c.id)}
                  aria-label={`Selecionar ${c.nome} pra condição em massa`}
                  className="h-4 w-4"
                />
              )}
              <span className="w-6 text-center text-xs text-texto-suave">{indice + 1}</span>
              <span className="font-titulo text-sm">{c.nome}</span>
              <input
                value={c.condicao}
                onChange={(e) => condicao(c.id, e.target.value)}
                placeholder="condição (opcional)"
                className="min-w-0 flex-1 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto focus:border-ambar/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => mover(c.id, -1)}
                disabled={indice === 0}
                className="rounded border border-borda px-2 py-1 text-xs text-texto-suave transition hover:text-texto disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => mover(c.id, 1)}
                disabled={indice === combatentes.length - 1}
                className="rounded border border-borda px-2 py-1 text-xs text-texto-suave transition hover:text-texto disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remover(c.id)}
                className="rounded border border-borda px-2 py-1 text-xs text-segredo transition hover:bg-segredo/10"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex gap-2">
        <input
          value={nomeNovo}
          onChange={(e) => setNomeNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") adicionar();
          }}
          placeholder="Nome de quem entra na ordem"
          className="min-w-0 flex-1 rounded border border-borda bg-superficie px-3 py-2 text-sm text-texto focus:border-ambar/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={adicionar}
          className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20"
        >
          + Adicionar
        </button>
      </div>
    </section>
  );
}
