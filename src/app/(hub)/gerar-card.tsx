"use client";

import { useState } from "react";

/*
  Card compartilhável (decisão #146, ideias #87/#88 do pedido original) —
  gera uma imagem PNG resumindo um personagem ou uma campanha, pra
  compartilhar fora do Hub. Feito com a Canvas API do próprio navegador
  (sem lib nova, custo zero, decisão #5) — só campos já públicos entram
  aqui (nome, sistema, o que já aparece pra qualquer participante), nunca
  nada de mestre ou dado interno da ficha.

  Imagem de fundo (avatar/capa) é opcional e vem de link externo — se o
  servidor de onde ela vem não manda cabeçalho CORS, o navegador "suja"
  o canvas e recusa gerar a imagem final com um erro de segurança; nesse
  caso o card é gerado de novo, só sem a imagem, em vez de falhar pro
  usuário sem explicação.
*/
const CORES = {
  fundo: "#0b0a08",
  superficie: "#15120d",
  borda: "#2c2519",
  texto: "#f3ede2",
  textoSuave: "#a1937d",
  ambarForte: "#f5bf5c",
};

const LARGURA = 640;
const ALTURA = 800;
const ALTURA_IMAGEM = 340;

function carregarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("falhou ao carregar imagem"));
    img.src = url;
  });
}

function quebrarTexto(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  larguraMax: number,
  altLinha: number,
): number {
  const palavras = texto.split(" ");
  let linha = "";
  let linhaY = y;
  for (const palavra of palavras) {
    const teste = linha ? `${linha} ${palavra}` : palavra;
    if (ctx.measureText(teste).width > larguraMax && linha) {
      ctx.fillText(linha, x, linhaY);
      linha = palavra;
      linhaY += altLinha;
    } else {
      linha = teste;
    }
  }
  if (linha) ctx.fillText(linha, x, linhaY);
  return linhaY;
}

async function desenharCard(
  { titulo, subtitulo, linhas, imagemUrl }: DadosCard,
  comImagem: boolean,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sem contexto 2d");

  ctx.fillStyle = CORES.fundo;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  let imagemDesenhada = false;
  if (comImagem && imagemUrl) {
    try {
      const img = await carregarImagem(imagemUrl);
      const escala = Math.max(LARGURA / img.width, ALTURA_IMAGEM / img.height);
      const larguraImg = img.width * escala;
      const alturaImg = img.height * escala;
      ctx.drawImage(
        img,
        (LARGURA - larguraImg) / 2,
        (ALTURA_IMAGEM - alturaImg) / 2,
        larguraImg,
        alturaImg,
      );
      imagemDesenhada = true;
    } catch {
      // Sem imagem — o card sai só com o bloco de texto, sem quebrar nada.
    }
  }

  const topoTexto = imagemDesenhada ? ALTURA_IMAGEM : 0;
  ctx.fillStyle = CORES.superficie;
  ctx.fillRect(0, topoTexto, LARGURA, ALTURA - topoTexto);
  ctx.strokeStyle = CORES.borda;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, LARGURA - 2, ALTURA - 2);

  ctx.fillStyle = CORES.texto;
  ctx.font = "bold 38px sans-serif";
  const fimTitulo = quebrarTexto(ctx, titulo, 40, topoTexto + 60, LARGURA - 80, 44);

  ctx.fillStyle = CORES.ambarForte;
  ctx.font = "22px sans-serif";
  ctx.fillText(subtitulo, 40, fimTitulo + 44);

  ctx.fillStyle = CORES.textoSuave;
  ctx.font = "18px sans-serif";
  let y = fimTitulo + 88;
  for (const linha of linhas) {
    y = quebrarTexto(ctx, linha, 40, y, LARGURA - 80, 26) + 30;
  }

  ctx.fillStyle = CORES.textoSuave;
  ctx.font = "14px sans-serif";
  ctx.fillText("Hub RPG", 40, ALTURA - 30);

  // `toDataURL` lança um erro de segurança se a imagem desenhada acima
  // "sujou" o canvas (link externo sem cabeçalho CORS) — é aqui, não no
  // carregamento da imagem, que esse problema aparece de verdade.
  return canvas.toDataURL("image/png");
}

type DadosCard = {
  titulo: string;
  subtitulo: string;
  linhas: string[];
  imagemUrl: string | null;
};

export function GerarCard({
  dados,
  nomeArquivo,
}: {
  dados: DadosCard;
  nomeArquivo: string;
}) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [urlGerada, setUrlGerada] = useState<string | null>(null);

  async function gerar() {
    setGerando(true);
    setErro(null);
    setUrlGerada(null);
    try {
      let url: string;
      try {
        url = await desenharCard(dados, true);
      } catch {
        url = await desenharCard(dados, false);
      }
      setUrlGerada(url);
    } catch {
      setErro("Não consegui gerar a imagem agora. Tenta de novo.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={gerar}
        disabled={gerando}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto disabled:opacity-50"
      >
        {gerando ? "Gerando…" : "Gerar card"}
      </button>
      {erro && <p className="mt-2 text-xs text-segredo">{erro}</p>}
      {urlGerada && (
        <div className="mt-2 flex flex-col items-start gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- prévia de uma imagem gerada em canvas no próprio navegador, não um asset otimizável pelo Next. */}
          <img
            src={urlGerada}
            alt="Prévia do card"
            className="w-40 rounded border border-borda"
          />
          <a
            href={urlGerada}
            download={`${nomeArquivo}.png`}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            Baixar imagem
          </a>
        </div>
      )}
    </div>
  );
}
