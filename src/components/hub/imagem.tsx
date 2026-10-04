"use client";

import Image from "next/image";
import { useState } from "react";
import { MINIATURAS } from "@/lib/miniaturas-imagens";
import { Icone } from "./icone";

export function ImagemHub({
  src,
  fallback,
  alt = "",
  className = "",
  posicao = "center",
  ajuste = "cover",
  destaque = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw",
}: {
  src?: string | null;
  fallback?: string;
  alt?: string;
  className?: string;
  posicao?: string;
  ajuste?: "cover" | "contain";
  destaque?: boolean;
  sizes?: string;
}) {
  const [falhas, setFalhas] = useState<string[]>([]);
  const imagem = src && !falhas.includes(src) ? src : fallback;
  const versoes = imagem ? MINIATURAS[imagem.split("#")[0]] : undefined;
  return (
    <span className={`hub-imagem ${className}`}>
      <span className="hub-imagem-fallback">
        <Icone nome="imagem" width={36} height={36} />
      </span>
      {imagem && !falhas.includes(imagem) && (
        <Image
          key={imagem}
          src={imagem}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized={!versoes}
          loader={versoes ? ({ src: origem, width }) => {
            const largura = Object.keys(versoes).map(Number).sort((a, b) => a - b)
              .find((n) => n >= width);
            return largura ? versoes[largura] : origem.split("#")[0];
          } : undefined}
          loading={destaque ? "eager" : "lazy"}
          style={{
            objectFit: ajuste,
            objectPosition:
              imagem.match(/#hub-pos=(top|center|bottom)$/)?.[1] ?? posicao,
          }}
          onError={() => setFalhas((atual) => [...atual, imagem])}
        />
      )}
    </span>
  );
}
