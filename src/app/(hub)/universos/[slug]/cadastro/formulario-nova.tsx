"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { TIPOS } from "@/lib/tipos-entidade";

import { criarEntidade, type Resultado } from "./acoes";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-ambar/40 bg-ambar/10 px-5 py-2.5 font-titulo text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Criando…" : "Criar ficha"}
    </button>
  );
}

const rotulo =
  "block font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave";
const campo =
  "mt-2 w-full rounded-lg border border-borda bg-superficie-alta px-4 py-2.5 text-texto outline-none transition focus:border-ambar/60";

export function FormularioNovaEntidade({
  slugUniverso,
}: {
  slugUniverso: string;
}) {
  const [resultado, acao] = useActionState<Resultado, FormData>(
    criarEntidade,
    {},
  );

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="universo" value={slugUniverso} />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="nome" className={rotulo}>
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Porto Cinza"
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="tipo" className={rotulo}>
            Tipo
          </label>
          <select id="tipo" name="tipo" defaultValue="NPC" className={campo}>
            {TIPOS.map((tipo) => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="resumo" className={rotulo}>
          Resumo{" "}
          <span className="normal-case tracking-normal">(uma linha)</span>
        </label>
        <input
          id="resumo"
          name="resumo"
          maxLength={300}
          autoComplete="off"
          placeholder="Porto pesqueiro que vive do que o mar devolve"
          className={campo}
        />
      </div>

      <div>
        <label htmlFor="corpo" className={rotulo}>
          Descrição{" "}
          <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id="corpo"
          name="corpo"
          rows={4}
          maxLength={20000}
          className={`${campo} resize-y`}
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

      <Botao />
    </form>
  );
}
