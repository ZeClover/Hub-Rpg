"use client";

import { useId, useState } from "react";
import { IMAGENS_PRONTAS } from "@/lib/visual";
import { Icone } from "./icone";
import { ImagemHub } from "./imagem";

async function comprimir(
  arquivo: File,
  tipo: "retrato" | "banner",
): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (arquivo.size > 10 * 1024 * 1024)
    throw new Error("A imagem pode ter até 10 MB.");
  const bitmap = await createImageBitmap(arquivo);
  try {
    const limite = tipo === "retrato" ? 720 : 1280;
    const escala = Math.min(1, limite / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * escala));
    canvas.height = Math.max(1, Math.round(bitmap.height * escala));
    const contexto = canvas.getContext("2d");
    if (!contexto)
      throw new Error("Este navegador não conseguiu preparar a imagem.");
    contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const qualidade of [0.82, 0.68, 0.5, 0.35]) {
      const url = canvas.toDataURL("image/webp", qualidade);
      // Um arquivo pequeno cabe nos campos de imagem atuais, sem serviço pago.
      if (url.length <= 220_000) return url;
    }
    throw new Error(
      "Esta imagem tem muitos detalhes. Escolha uma versão menor.",
    );
  } finally {
    bitmap.close();
  }
}

export function SeletorImagem({
  valor,
  aoMudar,
  tipo,
  rotulo,
  aoPreparar,
}: {
  valor: string;
  aoMudar: (url: string) => void;
  tipo: "retrato" | "banner";
  rotulo: string;
  aoPreparar?: (preparando: boolean) => void;
}) {
  const id = useId();
  const [aba, setAba] = useState("biblioteca");
  const [erro, setErro] = useState("");
  const [preparando, setPreparando] = useState(false);
  const base = valor.replace(/#hub-pos=(top|center|bottom)$/, "");
  const foco = valor.match(/#hub-pos=(top|center|bottom)$/)?.[1] ?? "center";
  return (
    <section>
      <h3 className="font-titulo text-lg">{rotulo}</h3>
      <ImagemHub
        src={valor}
        alt={`Prévia de ${rotulo.toLowerCase()}`}
        sizes={tipo === "retrato" ? "170px" : "640px"}
        className={`hub-image-preview ${tipo === "retrato" ? "is-portrait" : ""}`}
      />
      <div
        className="hub-tabs my-4"
        role="group"
        aria-label={`Origem de ${rotulo.toLowerCase()}`}
      >
        {[
          ["biblioteca", "Biblioteca"],
          ["arquivo", "Enviar imagem"],
          ["link", "Usar link"],
        ].map(([chave, nome]) => (
          <button
            key={chave}
            type="button"
            aria-pressed={aba === chave}
            onClick={() => {
              setAba(chave);
              setErro("");
            }}
          >
            {nome}
          </button>
        ))}
      </div>
      {aba === "biblioteca" && (
        <div className="hub-image-options">
          {IMAGENS_PRONTAS.filter((i) => i.tipo === tipo).map((i) => (
            <button
              key={i.url}
              type="button"
              aria-pressed={base === i.url}
              onClick={() => aoMudar(i.url)}
            >
              <ImagemHub src={i.url} className="aspect-square" sizes="120px" />
              <span>{i.nome}</span>
            </button>
          ))}
        </div>
      )}
      {aba === "arquivo" && (
        <div className="hub-upload-zone">
          <Icone nome="enviar" />
          <label htmlFor={id}>Escolha uma imagem do seu aparelho</label>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={preparando}
            onChange={async (e) => {
              const arquivo = e.target.files?.[0];
              if (!arquivo) return;
              setErro("");
              setPreparando(true);
              aoPreparar?.(true);
              try {
                aoMudar(await comprimir(arquivo, tipo));
              } catch (e) {
                setErro(
                  e instanceof Error ? e.message : "Não consegui ler a imagem.",
                );
              } finally {
                setPreparando(false);
                aoPreparar?.(false);
              }
            }}
          />
          <p className="text-xs text-texto-suave">
            JPG, PNG ou WebP, até 10 MB.{" "}
            {preparando
              ? "Preparando imagem…"
              : "A imagem é reduzida automaticamente."}
          </p>
        </div>
      )}
      {aba === "link" && (
        <label className="block text-sm text-texto-suave">
          Link da imagem
          <input
            className="hub-input mt-2 w-full"
            type="url"
            placeholder="https://…"
            value={base.startsWith("data:") || base.startsWith("/") ? "" : base}
            onChange={(e) => aoMudar(e.target.value)}
          />
          <span className="mt-2 block text-xs">
            Use um endereço direto da imagem.
          </span>
        </label>
      )}
      {valor && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-xs text-texto-suave" htmlFor={`${id}-foco`}>
            Enquadramento
          </label>
          <select
            id={`${id}-foco`}
            className="hub-input !w-auto"
            value={foco}
            onChange={(e) =>
              aoMudar(
                base +
                  (e.target.value === "center"
                    ? ""
                    : `#hub-pos=${e.target.value}`),
              )
            }
          >
            <option value="top">Parte superior</option>
            <option value="center">Centro</option>
            <option value="bottom">Parte inferior</option>
          </select>
          <button
            type="button"
            className="text-xs text-texto-suave underline"
            onClick={() => aoMudar("")}
          >
            Remover imagem
          </button>
        </div>
      )}
      {erro && (
        <p className="hub-error mt-3" role="alert">
          {erro}
        </p>
      )}
    </section>
  );
}
