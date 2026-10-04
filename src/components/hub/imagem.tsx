"use client";

import Image from "next/image";
import { useState } from "react";
import { Icone } from "./icone";

export function ImagemHub({
  src,
  fallback,
  alt = "",
  className = "",
  posicao = "center",
  ajuste = "cover",
  destaque = false,
}: {
  src?: string | null;
  fallback?: string;
  alt?: string;
  className?: string;
  posicao?: string;
  ajuste?: "cover" | "contain";
  destaque?: boolean;
}) {
  const [falhas, setFalhas] = useState<string[]>([]);
  const imagem = src && !falhas.includes(src) ? src : fallback;
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
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          unoptimized
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
