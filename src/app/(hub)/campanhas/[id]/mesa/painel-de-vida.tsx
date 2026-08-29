"use client";

import { useEffect, useRef, useState } from "react";

type ResumoVida = { atual: number; maxima: number; rotulo: string } | null;
type Personagem = { id: string; nome: string; resumoVida: ResumoVida };
type Resposta = { jogadores: Personagem[]; inimigos: Personagem[] };

// 8 segundos: rápido o bastante pra sentir "automático" olhando a tela
// entre uma rodada e outra, sem virar um monte de requisição por segundo.
// Não é tempo real de verdade (isso pediria Supabase Realtime com RLS
// escrita pra `personagens` — hoje travada por completo, ver decisão #31);
// é a versão de custo zero: o navegador do mestre pergunta de novo sozinho.
const INTERVALO_MS = 8000;

/*
  Painel de Vida: acompanha os PJs (só leitura — a vida de cada um é a
  própria ficha do jogador que decide, o mestre só olha) e os inimigos
  (o mestre é dono, então dá pra ajustar aqui sem abrir a ficha).
*/
export function PainelDeVida({
  campanhaId,
  fichaJogador,
  fichaInimigo,
}: {
  campanhaId: string;
  fichaJogador: string | null;
  fichaInimigo: string | null;
}) {
  const [dados, setDados] = useState<Resposta | null>(null);
  const [erro, setErro] = useState(false);
  const ajustando = useRef(new Set<string>());

  useEffect(() => {
    let cancelado = false;
    async function buscar() {
      try {
        const resposta = await fetch(`/api/campanhas/${campanhaId}/vida`);
        if (!resposta.ok) throw new Error("falhou");
        const corpo = await resposta.json();
        if (cancelado) return;
        setDados(corpo);
        setErro(false);
      } catch {
        if (!cancelado) setErro(true);
      }
    }
    buscar();
    const intervalo = setInterval(buscar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [campanhaId]);

  async function ajustar(personagemId: string, delta: number) {
    if (ajustando.current.has(personagemId)) return;
    ajustando.current.add(personagemId);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/vida/${personagemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (resposta.ok) {
        const { resumoVida } = await resposta.json();
        setDados((atual) =>
          atual
            ? {
                ...atual,
                inimigos: atual.inimigos.map((i) =>
                  i.id === personagemId ? { ...i, resumoVida } : i,
                ),
              }
            : atual,
        );
      }
    } finally {
      ajustando.current.delete(personagemId);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="font-titulo text-xl">Painel de Vida</h2>
      {erro && (
        <p className="mt-2 text-sm text-segredo">
          Não consegui atualizar agora. A última leitura continua na tela.
        </p>
      )}
      {!dados ? (
        <p className="mt-3 text-sm text-texto-suave">Carregando…</p>
      ) : (
        <>
          <GrupoDeCartoes
            titulo="Jogadores"
            vazio="Ninguém escolheu ficha nesta campanha ainda."
            personagens={dados.jogadores}
            ficha={fichaJogador}
          />
          <GrupoDeCartoes
            titulo="Inimigos"
            vazio="Nenhuma ficha de inimigo criada ainda."
            personagens={dados.inimigos}
            ficha={fichaInimigo}
            onAjustar={ajustar}
          />
        </>
      )}
    </section>
  );
}

function GrupoDeCartoes({
  titulo,
  vazio,
  personagens,
  ficha,
  onAjustar,
}: {
  titulo: string;
  vazio: string;
  personagens: Personagem[];
  ficha: string | null;
  onAjustar?: (personagemId: string, delta: number) => void;
}) {
  return (
    <div className="mt-4">
      <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
        {titulo}
      </p>
      {personagens.length === 0 ? (
        <p className="mt-2 text-sm text-texto-suave">{vazio}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {personagens.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-borda bg-superficie p-4"
            >
              <div className="flex items-center justify-between gap-3">
                {ficha ? (
                  <a
                    href={`${ficha}?id=${p.id}`}
                    className="font-titulo text-base text-texto underline decoration-borda underline-offset-2 hover:text-ambar-forte"
                  >
                    {p.nome}
                  </a>
                ) : (
                  <span className="font-titulo text-base">{p.nome}</span>
                )}
                {p.resumoVida && (
                  <span className="text-sm text-texto-suave">
                    {p.resumoVida.rotulo} {p.resumoVida.atual}/{p.resumoVida.maxima}
                  </span>
                )}
              </div>

              {p.resumoVida ? (
                <BarraDeVida resumo={p.resumoVida} />
              ) : (
                <p className="mt-2 text-xs text-texto-suave">
                  Vida ainda não calculada — abra a ficha uma vez pra preencher.
                </p>
              )}

              {onAjustar && p.resumoVida && (
                <div className="mt-3 flex gap-2">
                  {[-5, -1, 1, 5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => onAjustar(p.id, delta)}
                      className="rounded border border-borda px-3 py-1 text-xs text-texto transition hover:border-ambar/50 hover:text-ambar-forte"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BarraDeVida({ resumo }: { resumo: { atual: number; maxima: number } }) {
  const fracao = resumo.maxima > 0 ? Math.max(0, Math.min(1, resumo.atual / resumo.maxima)) : 0;
  const cor = fracao <= 0.25 ? "bg-segredo" : fracao <= 0.5 ? "bg-ambar" : "bg-ambar-forte";
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-fundo">
      <div className={`h-full ${cor} transition-all`} style={{ width: `${fracao * 100}%` }} />
    </div>
  );
}
