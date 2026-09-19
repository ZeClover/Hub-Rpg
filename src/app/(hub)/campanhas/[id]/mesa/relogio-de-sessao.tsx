"use client";

import { useEffect, useState } from "react";

type EstadoRelogio = { rodando: boolean; inicioEpoch: number | null; acumuladoMs: number };

const ESTADO_VAZIO: EstadoRelogio = { rodando: false, inicioEpoch: null, acumuladoMs: 0 };

/*
  Relógio simples de tempo de sessão (decisão #137) — quanto tempo de
  verdade já passou jogando, sem nenhuma relação com "rodada" da
  iniciativa (aquilo é tempo de ficção, isto é tempo de relógio de
  parede). Só o mestre vê, só neste navegador (mesmo padrão de
  localStorage do `RastreadorDeIniciativa`) — não precisa de sincronismo
  com jogador nenhum, então não pede rota nova nem gasta banco (custo
  zero, decisão #5).
*/
function chaveArmazenamento(campanhaId: string) {
  return `mesa-relogio:${campanhaId}`;
}

function lerEstadoSalvo(campanhaId: string): EstadoRelogio {
  if (typeof window === "undefined") return ESTADO_VAZIO;
  try {
    const salvo = localStorage.getItem(chaveArmazenamento(campanhaId));
    if (!salvo) return ESTADO_VAZIO;
    const estado = JSON.parse(salvo);
    return {
      rodando: estado.rodando ?? false,
      inicioEpoch: estado.inicioEpoch ?? null,
      acumuladoMs: estado.acumuladoMs ?? 0,
    };
  } catch {
    return ESTADO_VAZIO;
  }
}

function formatarDuracao(ms: number) {
  const segundosTotais = Math.floor(ms / 1000);
  const h = Math.floor(segundosTotais / 3600);
  const m = Math.floor((segundosTotais % 3600) / 60);
  const s = segundosTotais % 60;
  const par = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${par(h)}:${par(m)}:${par(s)}` : `${par(m)}:${par(s)}`;
}

export function RelogioDeSessao({ campanhaId }: { campanhaId: string }) {
  const [estado, setEstado] = useState<EstadoRelogio>(() => lerEstadoSalvo(campanhaId));
  // Data.now() não pode ser lido durante o render (react-hooks/purity) —
  // por isso mora num estado à parte, atualizado só de dentro de efeitos.
  const [agoraMs, setAgoraMs] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(chaveArmazenamento(campanhaId), JSON.stringify(estado));
    } catch {
      // Mesma tolerância do rastreador de iniciativa: sem localStorage, o
      // relógio ainda funciona na tela, só não sobrevive a um recarregar.
    }
  }, [campanhaId, estado]);

  useEffect(() => {
    const marcar = () => setAgoraMs(Date.now());
    // `setTimeout(marcar, 0)` em vez de chamar `marcar()` direto: assim o
    // `setState` acontece fora do corpo síncrono do efeito, sem disparar o
    // aviso de "cascading renders" (react-hooks/set-state-in-effect).
    const primeiraMarcacao = setTimeout(marcar, 0);
    if (!estado.rodando) return () => clearTimeout(primeiraMarcacao);
    const intervalo = setInterval(marcar, 1000);
    return () => {
      clearTimeout(primeiraMarcacao);
      clearInterval(intervalo);
    };
  }, [estado.rodando]);

  const decorridoMs =
    estado.acumuladoMs +
    (estado.rodando && estado.inicioEpoch && agoraMs !== null ? agoraMs - estado.inicioEpoch : 0);

  function iniciar() {
    setEstado((e) => ({ ...e, rodando: true, inicioEpoch: Date.now() }));
  }

  function pausar() {
    setEstado((e) => ({
      rodando: false,
      inicioEpoch: null,
      acumuladoMs: e.acumuladoMs + (e.inicioEpoch ? Date.now() - e.inicioEpoch : 0),
    }));
  }

  function reiniciar() {
    setEstado(ESTADO_VAZIO);
  }

  return (
    <section className="mt-10">
      <h2 className="font-titulo text-xl">Relógio de sessão</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Tempo real de mesa, sem relação com a rodada de combate.
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className="font-titulo text-2xl tabular-nums">{formatarDuracao(decorridoMs)}</span>
        {estado.rodando ? (
          <button
            type="button"
            onClick={pausar}
            className="rounded border border-borda px-3 py-1 text-xs text-texto transition hover:border-ambar/50 hover:text-ambar-forte"
          >
            Pausar
          </button>
        ) : (
          <button
            type="button"
            onClick={iniciar}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1 text-xs text-ambar-forte transition hover:bg-ambar/20"
          >
            {decorridoMs > 0 ? "Continuar" : "Começar"}
          </button>
        )}
        {decorridoMs > 0 && (
          <button
            type="button"
            onClick={reiniciar}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
          >
            Zerar
          </button>
        )}
      </div>
    </section>
  );
}
