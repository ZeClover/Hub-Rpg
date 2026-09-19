"use client";

import { useEffect, useRef, useState } from "react";

/*
  Chat simples da campanha (decisão #136). Diferente do resto da página,
  não recebe as mensagens como prop do Server Component — busca sozinho
  (GET) assim que monta e depois fica repetindo a cada alguns segundos
  (polling simples com `setInterval`, sem WebSocket nem processo à parte:
  custo zero, decisão #5). `router.refresh()` não serviria aqui porque
  recarregaria a página inteira a cada mensagem nova de qualquer um.
*/

type Mensagem = {
  id: string;
  texto: string;
  criadoEm: string;
  autorId: string;
  autor: { nome: string | null; email: string };
};

const INTERVALO_MS = 6000;

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function Chat({ campanhaId, meuUsuarioId }: { campanhaId: string; meuUsuarioId: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/chat`);
      if (!resposta.ok || cancelado) return;
      const dados = await resposta.json();
      setMensagens(dados.mensagens);
      setCarregado(true);
    }

    buscar();
    const intervalo = setInterval(buscar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [campanhaId]);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight });
  }, [mensagens]);

  async function enviar() {
    const valor = texto.trim();
    if (!valor) return;
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: valor }),
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setMensagens((atual) => [...atual, dados.mensagem]);
        setTexto("");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Chat</h2>

      <div
        ref={listaRef}
        className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border border-borda bg-superficie p-4"
      >
        {!carregado ? (
          <p className="text-sm text-texto-suave">Carregando…</p>
        ) : mensagens.length === 0 ? (
          <p className="text-sm text-texto-suave">Nenhuma mensagem ainda. Comece a conversa.</p>
        ) : (
          mensagens.map((mensagem) => (
            <p key={mensagem.id} className="text-sm text-texto">
              <span className="font-titulo text-xs text-ambar-forte">
                {mensagem.autorId === meuUsuarioId
                  ? "Você"
                  : (mensagem.autor.nome ?? mensagem.autor.email)}
              </span>{" "}
              <span className="text-xs text-texto-suave">{formatarHora(mensagem.criadoEm)}</span>
              <br />
              {mensagem.texto}
            </p>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <input
          type="text"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") enviar();
          }}
          placeholder="Escreva uma mensagem…"
          className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </section>
  );
}
