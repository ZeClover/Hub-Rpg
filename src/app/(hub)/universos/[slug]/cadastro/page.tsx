import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { banco } from "@/lib/banco";
import { TIPOS, ehTipoValido, rotuloDoTipo } from "@/lib/tipos-entidade";
import { usuarioAtual } from "@/lib/usuario";

import { FormularioNovaEntidade } from "./formulario-nova";

export default async function Cadastro({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string; busca?: string }>;
}) {
  const { slug } = await params;
  const { tipo: tipoFiltro, busca } = await searchParams;
  const usuario = (await usuarioAtual())!;

  const universo = await banco.universo.findFirst({
    where: { slug, donoId: usuario.id },
    select: { id: true, nome: true },
  });
  if (!universo) notFound();

  const termo = busca?.trim();
  const filtros: Prisma.EntidadeWhereInput = { universoId: universo.id };
  if (tipoFiltro && ehTipoValido(tipoFiltro)) filtros.tipo = tipoFiltro;
  if (termo) {
    filtros.OR = [
      { nome: { contains: termo, mode: "insensitive" } },
      { resumo: { contains: termo, mode: "insensitive" } },
    ];
  }

  const entidades = await banco.entidade.findMany({
    where: filtros,
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      nome: true,
      slug: true,
      tipo: true,
      resumo: true,
      _count: { select: { campos: true } },
    },
  });

  const base = `/universos/${slug}/cadastro`;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href={`/universos/${slug}`}
        className="text-sm text-texto-suave transition hover:text-texto"
      >
        ← {universo.nome}
      </Link>

      <h1 className="mt-4 font-titulo text-3xl">Cadastro</h1>

      <form method="get" className="mt-8 flex flex-wrap gap-3">
        <input
          type="search"
          name="busca"
          defaultValue={termo ?? ""}
          placeholder="Buscar por nome ou resumo"
          className="min-w-48 flex-1 rounded-lg border border-borda bg-superficie-alta px-4 py-2 text-sm text-texto outline-none transition focus:border-ambar/60"
        />
        <select
          name="tipo"
          defaultValue={tipoFiltro ?? ""}
          className="rounded-lg border border-borda bg-superficie-alta px-3 py-2 text-sm text-texto outline-none transition focus:border-ambar/60"
        >
          <option value="">Todos os tipos</option>
          {TIPOS.map((tipo) => (
            <option key={tipo.valor} value={tipo.valor}>
              {tipo.plural}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-borda px-4 py-2 text-sm text-texto-suave transition hover:border-texto-suave hover:text-texto"
        >
          Filtrar
        </button>
      </form>

      {entidades.length === 0 ? (
        <p className="mt-10 text-sm text-texto-suave">
          {termo || tipoFiltro
            ? "Nada encontrado com esse filtro."
            : "O cadastro está vazio. Crie a primeira ficha abaixo."}
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {entidades.map((entidade) => (
            <li key={entidade.id}>
              <Link
                href={`${base}/${entidade.slug}`}
                className="flex items-baseline gap-3 rounded-lg border border-borda bg-superficie px-5 py-4 transition hover:border-ambar/40"
              >
                <span className="shrink-0 rounded border border-borda px-2 py-0.5 text-xs text-texto-suave">
                  {rotuloDoTipo(entidade.tipo)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-titulo text-base">
                    {entidade.nome}
                  </span>
                  {entidade.resumo && (
                    <span className="mt-0.5 block truncate text-sm text-texto-suave">
                      {entidade.resumo}
                    </span>
                  )}
                </span>
                {entidade._count.campos > 0 && (
                  <span className="shrink-0 text-xs text-texto-suave">
                    {entidade._count.campos} campo
                    {entidade._count.campos === 1 ? "" : "s"}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 rounded-lg border border-borda bg-superficie p-6">
        <h2 className="font-titulo text-lg">Nova ficha</h2>
        <div className="mt-6">
          <FormularioNovaEntidade slugUniverso={slug} />
        </div>
      </section>
    </main>
  );
}
