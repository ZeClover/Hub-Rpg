"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { adicionarCampo, type Resultado } from "./acoes";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-borda px-4 py-2 text-sm text-texto-suave transition hover:border-ambar/40 hover:text-ambar-forte disabled:opacity-50"
    >
      {pending ? "Salvando…" : "Adicionar campo"}
    </button>
  );
}

export function FormularioCampo({
  slugUniverso,
  slugEntidade,
}: {
  slugUniverso: string;
  slugEntidade: string;
}) {
  const [resultado, acao] = useActionState<Resultado, FormData>(
    adicionarCampo,
    {},
  );

  return (
    <form action={acao} className="space-y-3">
      <input type="hidden" name="universo" value={slugUniverso} />
      <input type="hidden" name="entidade" value={slugEntidade} />

      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <input
          name="chave"
          required
          maxLength={60}
          autoComplete="off"
          placeholder="População"
          aria-label="Nome do campo"
          className="rounded-lg border border-borda bg-superficie-alta px-4 py-2.5 text-sm text-texto outline-none transition focus:border-ambar/60"
        />
        <input
          name="valor"
          required
          maxLength={2000}
          autoComplete="off"
          placeholder="cerca de 4 mil almas"
          aria-label="Conteúdo do campo"
          className="rounded-lg border border-borda bg-superficie-alta px-4 py-2.5 text-sm text-texto outline-none transition focus:border-ambar/60"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-texto-suave">
        <input
          type="checkbox"
          name="segredo"
          className="size-4 accent-[var(--cor-segredo)]"
        />
        Só o mestre vê este campo
      </label>

      {resultado.erro && (
        <p role="alert" className="text-sm text-texto">
          {resultado.erro}
        </p>
      )}

      <Botao />
    </form>
  );
}
