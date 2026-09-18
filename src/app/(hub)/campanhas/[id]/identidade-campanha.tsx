"use client";

import { useEffect, useRef, useState } from "react";

/*
  Identidade da campanha (decisão #134): capa, descrição e tags — só o
  mestre edita, mas os três aparecem pra qualquer participante (a exibição
  fica na própria página, fora deste componente). Mesmo padrão de salvar
  sozinho com debounce do Manual do Mestre, só que em três campos.
*/
export function IdentidadeCampanha({
  campanhaId,
  capaUrlInicial,
  descricaoInicial,
  tagsIniciais,
}: {
  campanhaId: string;
  capaUrlInicial: string;
  descricaoInicial: string;
  tagsIniciais: string;
}) {
  const [capaUrl, setCapaUrl] = useState(capaUrlInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [tags, setTags] = useState(tagsIniciais);
  const [erro, setErro] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  function salvar(corpo: Record<string, unknown>) {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const resposta = await fetch(`/api/campanhas/${campanhaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        });
        setErro(!resposta.ok);
      } catch {
        setErro(true);
      }
    }, 600);
  }

  return (
    <section className="mt-8 rounded-lg border border-borda bg-superficie p-6">
      <h2 className="font-titulo text-xl">Identidade da campanha</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Capa, descrição e tags aparecem pra todo mundo que já vê esta campanha.
      </p>

      <label className="mt-4 block text-xs text-texto-suave" htmlFor="c-capa-url">
        URL da capa (opcional — imagem hospedada em outro lugar)
      </label>
      <input
        id="c-capa-url"
        type="url"
        value={capaUrl}
        onChange={(evento) => {
          setCapaUrl(evento.target.value);
          salvar({ capaUrl: evento.target.value || null });
        }}
        placeholder="https://…"
        className="mt-1 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto focus:border-ambar/60 focus:outline-none"
      />

      <label className="mt-4 block text-xs text-texto-suave" htmlFor="c-descricao">
        Descrição
      </label>
      <textarea
        id="c-descricao"
        value={descricao}
        onChange={(evento) => {
          setDescricao(evento.target.value);
          salvar({ descricao: evento.target.value || null });
        }}
        rows={3}
        placeholder="Do que se trata esta mesa…"
        className="mt-1 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto focus:border-ambar/60 focus:outline-none"
      />

      <label className="mt-4 block text-xs text-texto-suave" htmlFor="c-tags">
        Tags (separadas por vírgula)
      </label>
      <input
        id="c-tags"
        value={tags}
        onChange={(evento) => {
          setTags(evento.target.value);
          const lista = evento.target.value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          salvar({ tags: lista });
        }}
        placeholder="terror, horror cósmico, sessão zero"
        className="mt-1 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto focus:border-ambar/60 focus:outline-none"
      />

      {erro && (
        <p className="mt-2 text-sm text-segredo">
          Não consegui salvar agora. Confira sua internet.
        </p>
      )}
    </section>
  );
}
