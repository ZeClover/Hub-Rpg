"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { ROTULO_SITUACAO, type Sistema } from "@/lib/sistemas";
import { capaCatalogo, CAPAS_VERTICAIS, visualSistema } from "@/lib/visual";
import { Icone } from "./icone";
import { ImagemHub } from "./imagem";

export function VitrineSistemas({ sistemas }: { sistemas: Sistema[] }) {
  const [indice, setIndice] = useState(0);
  const inicio = useRef<number | null>(null);
  const arrastou = useRef(false);
  const selecionado = sistemas[indice];
  if (!selecionado) return null;
  const visual = visualSistema(selecionado.chave);
  function passar(delta: number) {
    setIndice((atual) => (atual + delta + sistemas.length) % sistemas.length);
  }
  return (
    <section
      className="hub-vitrine"
      aria-label="Vitrine de sistemas"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          passar(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          passar(-1);
        }
        if (e.key === "Home") {
          e.preventDefault();
          setIndice(0);
        }
        if (e.key === "End") {
          e.preventDefault();
          setIndice(sistemas.length - 1);
        }
      }}
    >
      <div className="hub-section-heading">
        <p className="hub-eyebrow">Escolha seu universo</p>
        <span className="text-xs text-texto-suave">
          {indice + 1} / {sistemas.length}
        </span>
      </div>
      <div
        className="hub-vitrine-palco"
        onPointerDown={(e) => {
          arrastou.current = false;
          if (e.pointerType !== "mouse") {
            inicio.current = e.clientX;
          }
        }}
        onPointerUp={(e) => {
          if (inicio.current === null) return;
          const delta = e.clientX - inicio.current;
          inicio.current = null;
          if (Math.abs(delta) > 40) {
            arrastou.current = true;
            passar(delta < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => {
          inicio.current = null;
        }}
      >
        <div className="hub-vitrine-halo" />
        {sistemas.map((s, i) => {
          let distancia = (i - indice + sistemas.length) % sistemas.length;
          if (distancia > sistemas.length / 2) distancia -= sistemas.length;
          const ativo = distancia === 0;
          return (
            <button
              key={s.chave}
              type="button"
              className="hub-vitrine-card"
              aria-label={`Selecionar ${s.nome}`}
              aria-pressed={ativo}
              tabIndex={Math.abs(distancia) <= 1 ? 0 : -1}
              aria-hidden={Math.abs(distancia) > 2 ? true : undefined}
              style={
                {
                  "--distancia": distancia,
                  "--inclinacao": `${ativo ? 0 : distancia > 0 ? -28 : 28}deg`,
                  "--escala": ativo ? 1 : 0.84,
                  "--profundidade": ativo ? 0 : -Math.abs(distancia) * 120,
                  zIndex: 10 - Math.abs(distancia),
                  visibility: Math.abs(distancia) > 2 ? "hidden" : "visible",
                } as CSSProperties
              }
              onClick={() => {
                if (!arrastou.current) setIndice(i);
                arrastou.current = false;
              }}
            >
              <ImagemHub
                src={capaCatalogo(s.chave)}
                ajuste={CAPAS_VERTICAIS.has(s.chave) ? "contain" : "cover"}
                alt=""
                className="hub-vitrine-capa"
                destaque={ativo}
              />
              <span className="hub-vitrine-nome">{s.nome}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="hub-vitrine-seta is-left hub-icon-button"
          aria-label="Sistema anterior"
          onClick={() => passar(-1)}
        >
          <Icone nome="voltar" />
        </button>
        <button
          type="button"
          className="hub-vitrine-seta is-right hub-icon-button"
          aria-label="Próximo sistema"
          onClick={() => passar(1)}
        >
          <Icone nome="seta" />
        </button>
      </div>
      <div className="hub-vitrine-informacao">
        <div className="hub-vitrine-emblema" key={selecionado.chave}>
          <Icone nome={visual.icone} width={29} height={29} />
        </div>
        <div aria-live="polite" aria-atomic="true">
          <p className="hub-eyebrow">{visual.tema}</p>
          <h2 className="font-titulo text-2xl sm:text-3xl">
            {selecionado.nome}
          </h2>
          <p className="mt-2 text-sm text-texto-suave">{visual.frase}</p>
          <span className="hub-badge mt-3">
            {ROTULO_SITUACAO[selecionado.situacao]}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={`/sistemas/${selecionado.chave}`}
            className="hub-button hub-button-primary"
          >
            Explorar sistema <Icone nome="seta" />
          </Link>
          {selecionado.salvaNoHub && (
            <Link
              href={`/fichas?sistema=${selecionado.chave}#criar-personagem`}
              className="hub-button"
            >
              Criar personagem
            </Link>
          )}
        </div>
      </div>
      <div className="hub-vitrine-pontos" aria-label="Selecionar sistema">
        {sistemas.map((s, i) => (
          <button
            key={s.chave}
            type="button"
            aria-label={`Ir para ${s.nome}`}
            aria-pressed={i === indice}
            onClick={() => setIndice(i)}
          >
            <span />
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-texto-suave">
        Use as setas, clique nas capas ou deslize para explorar.
      </p>
    </section>
  );
}
