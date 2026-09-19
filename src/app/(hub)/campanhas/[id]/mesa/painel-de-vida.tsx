"use client";

import { useEffect, useRef, useState } from "react";

type ResumoVida = { atual: number; maxima: number; rotulo: string; derrotado?: boolean } | null;
type Personagem = { id: string; nome: string; resumoVida: ResumoVida };
type Resposta = { jogadores: Personagem[]; inimigos: Personagem[] };
type CorpoAjuste =
  | { delta: number }
  | { definir: number }
  | { zerar: true }
  | { restaurar: true }
  | { derrotado: boolean };

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

  Em modo espectador (decisão #137, jogador olhando a Mesa ao Vivo) a API
  já nem devolve os inimigos — `mostrarInimigos` só decide se a seção
  aparece (escondida, não "nenhuma ficha ainda", que seria enganoso: pode
  muito bem existir inimigo, só que é informação de mestre).
*/
export function PainelDeVida({
  campanhaId,
  fichaJogador,
  fichaInimigo,
  mostrarInimigos = true,
}: {
  campanhaId: string;
  fichaJogador: string | null;
  fichaInimigo: string | null;
  mostrarInimigos?: boolean;
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

  async function ajustar(personagemId: string, corpo: CorpoAjuste) {
    if (ajustando.current.has(personagemId)) return;
    ajustando.current.add(personagemId);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/vida/${personagemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
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
          {mostrarInimigos && (
            <GrupoDeCartoes
              titulo="Inimigos"
              vazio="Nenhuma ficha de inimigo criada ainda."
              personagens={dados.inimigos}
              ficha={fichaInimigo}
              onAjustar={ajustar}
            />
          )}
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
  onAjustar?: (personagemId: string, corpo: CorpoAjuste) => void;
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
                <div className="flex items-center gap-2">
                  {p.resumoVida?.derrotado && (
                    <span className="rounded-full border border-segredo/40 px-2 py-0.5 text-xs text-segredo">
                      Derrotado
                    </span>
                  )}
                  {p.resumoVida && (
                    <span className="text-sm text-texto-suave">
                      {p.resumoVida.rotulo} {p.resumoVida.atual}/{p.resumoVida.maxima}
                    </span>
                  )}
                </div>
              </div>

              {p.resumoVida ? (
                <BarraDeVida resumo={p.resumoVida} />
              ) : (
                <p className="mt-2 text-xs text-texto-suave">
                  Vida ainda não calculada — abra a ficha uma vez pra preencher.
                </p>
              )}

              {onAjustar && p.resumoVida && (
                <AjusteRapido
                  personagemId={p.id}
                  derrotado={p.resumoVida.derrotado ?? false}
                  onAjustar={onAjustar}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AjusteRapido({
  personagemId,
  derrotado,
  onAjustar,
}: {
  personagemId: string;
  derrotado: boolean;
  onAjustar: (personagemId: string, corpo: CorpoAjuste) => void;
}) {
  const [maisOpcoes, setMaisOpcoes] = useState(false);
  const [valor, setValor] = useState("");

  const numero = Number(valor);
  const valorValido = valor.trim() !== "" && Number.isFinite(numero) && numero >= 0;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {[-5, -1, 1, 5].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onAjustar(personagemId, { delta })}
            className="rounded border border-borda px-3 py-1 text-xs text-texto transition hover:border-ambar/50 hover:text-ambar-forte"
          >
            {delta > 0 ? `+${delta}` : delta}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMaisOpcoes((v) => !v)}
          className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
        >
          {maisOpcoes ? "Menos opções" : "Mais opções"}
        </button>
      </div>

      {maisOpcoes && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded border border-borda bg-fundo p-2">
          <input
            type="number"
            min={0}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="valor"
            className="w-20 rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto"
          />
          <button
            type="button"
            disabled={!valorValido}
            onClick={() => onAjustar(personagemId, { delta: -numero })}
            className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-segredo/50 hover:text-segredo disabled:opacity-40"
          >
            Aplicar dano
          </button>
          <button
            type="button"
            disabled={!valorValido}
            onClick={() => onAjustar(personagemId, { delta: numero })}
            className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-ambar/50 hover:text-ambar-forte disabled:opacity-40"
          >
            Curar
          </button>
          <button
            type="button"
            disabled={!valorValido}
            onClick={() => onAjustar(personagemId, { definir: numero })}
            className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-ambar/50 hover:text-ambar-forte disabled:opacity-40"
          >
            Definir
          </button>
          <button
            type="button"
            onClick={() => onAjustar(personagemId, { zerar: true })}
            className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-segredo/50 hover:text-segredo"
          >
            Zerar
          </button>
          <button
            type="button"
            onClick={() => onAjustar(personagemId, { restaurar: true })}
            className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-ambar/50 hover:text-ambar-forte"
          >
            Restaurar
          </button>
          <button
            type="button"
            onClick={() => onAjustar(personagemId, { derrotado: !derrotado })}
            className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-segredo/50 hover:text-segredo"
          >
            {derrotado ? "Reviver" : "Marcar derrotado"}
          </button>
        </div>
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
