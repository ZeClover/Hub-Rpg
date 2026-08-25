"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { criarUniverso, type ResultadoDoFormulario } from "./acoes";

function BotaoCriar() {
  // Enquanto o servidor processa, o botão se desabilita — sem isso, um clique
  // duplo apressado cria dois universos iguais.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-ambar/40 bg-ambar/10 px-5 py-2.5 font-titulo text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Criando…" : "Criar universo"}
    </button>
  );
}

export function FormularioNovoUniverso() {
  const [resultado, acao] = useActionState<ResultadoDoFormulario, FormData>(
    criarUniverso,
    {},
  );

  return (
    <form action={acao} className="space-y-4">
      <div>
        <label
          htmlFor="nome"
          className="block font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave"
        >
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          autoComplete="off"
          placeholder="Darkrem"
          className="mt-2 w-full rounded-lg border border-borda bg-superficie-alta px-4 py-2.5 text-texto outline-none transition focus:border-ambar/60"
        />
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="block font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave"
        >
          Descrição <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          maxLength={2000}
          placeholder="Em duas linhas: que lugar é esse?"
          className="mt-2 w-full resize-y rounded-lg border border-borda bg-superficie-alta px-4 py-2.5 text-texto outline-none transition focus:border-ambar/60"
        />
      </div>

      {resultado.erro && (
        <p
          role="alert"
          className="rounded-lg border border-segredo/50 bg-segredo/10 px-4 py-3 text-sm text-texto"
        >
          {resultado.erro}
        </p>
      )}

      <BotaoCriar />
    </form>
  );
}
