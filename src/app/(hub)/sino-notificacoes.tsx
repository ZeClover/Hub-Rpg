"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/*
  Sino de notificações internas (decisão #136) — mora no layout porque
  cobre qualquer campanha, não só a que está aberta. Sem push nem e-mail
  (custo zero, decisão #5): só essa lista, com polling simples enquanto a
  aba estiver aberta.
*/

type Notificacao = {
  id: string;
  tipo: "SESSAO_MARCADA" | "AVISO_NOVO" | "ENQUETE_NOVA";
  texto: string;
  lida: boolean;
  criadoEm: string;
  campanhaId: string;
  campanha: { nome: string };
};

const INTERVALO_MS = 30000;

const ICONE_TIPO: Record<Notificacao["tipo"], string> = {
  SESSAO_MARCADA: "🗓️",
  AVISO_NOVO: "📌",
  ENQUETE_NOVA: "🗳️",
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function SinoNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      const resposta = await fetch("/api/notificacoes");
      if (!resposta.ok || cancelado) return;
      const dados = await resposta.json();
      setNotificacoes(dados.notificacoes);
    }

    buscar();
    const intervalo = setInterval(buscar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  async function marcarLida(id: string) {
    setNotificacoes((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    await fetch(`/api/notificacoes/${id}`, { method: "PATCH" });
  }

  async function marcarTodasLidas() {
    setNotificacoes((atual) => atual.map((n) => ({ ...n, lida: true })));
    await fetch("/api/notificacoes/marcar-todas-lidas", { method: "POST" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="relative text-texto-suave transition hover:text-texto"
        aria-label="Notificações"
      >
        🔔
        {naoLidas > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ambar px-1 text-[10px] font-bold text-fundo">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-borda bg-superficie shadow-lg">
          <div className="flex items-center justify-between border-b border-borda px-3 py-2">
            <p className="font-titulo text-xs uppercase tracking-wide text-texto-suave">
              Notificações
            </p>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={marcarTodasLidas}
                className="text-xs text-ambar-forte underline underline-offset-2"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <p className="px-3 py-4 text-sm text-texto-suave">Nenhuma notificação ainda.</p>
            ) : (
              <ul>
                {notificacoes.map((notificacao) => (
                  <li key={notificacao.id} className="border-b border-borda last:border-0">
                    <Link
                      href={`/campanhas/${notificacao.campanhaId}`}
                      onClick={() => {
                        if (!notificacao.lida) marcarLida(notificacao.id);
                        setAberto(false);
                      }}
                      className={
                        notificacao.lida
                          ? "block px-3 py-2 text-sm text-texto-suave hover:bg-fundo"
                          : "block bg-ambar/5 px-3 py-2 text-sm text-texto hover:bg-ambar/10"
                      }
                    >
                      <span className="text-xs text-texto-suave">
                        {ICONE_TIPO[notificacao.tipo]} {notificacao.campanha.nome} ·{" "}
                        {formatarData(notificacao.criadoEm)}
                      </span>
                      <br />
                      {notificacao.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
