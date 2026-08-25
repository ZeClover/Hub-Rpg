import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { filtrarCampos, podeVerSegredosDoUniverso } from "@/lib/permissao";
import { rotuloDoTipo } from "@/lib/tipos-entidade";
import { usuarioAtual } from "@/lib/usuario";

import { FormularioCampo } from "../formulario-campo";
import { removerCampo } from "../acoes";

export default async function Ficha({
  params,
}: {
  params: Promise<{ slug: string; entidade: string }>;
}) {
  const { slug, entidade: slugEntidade } = await params;
  const usuario = (await usuarioAtual())!;

  const universo = await banco.universo.findFirst({
    where: { slug, donoId: usuario.id },
    select: { id: true, nome: true },
  });
  if (!universo) notFound();

  const ficha = await banco.entidade.findFirst({
    where: { slug: slugEntidade, universoId: universo.id },
    select: {
      nome: true,
      tipo: true,
      resumo: true,
      corpo: true,
      campos: {
        orderBy: { ordem: "asc" },
        select: { id: true, chave: true, valor: true, visibilidade: true },
      },
    },
  });
  if (!ficha) notFound();

  /*
    Aqui está a decisão #13 em ação. Os campos saem do banco completos e passam
    pela única função autorizada a decidir o que segue adiante. O que ela corta
    nunca chega ao navegador — não é escondido na tela, é descartado antes.
  */
  const podeVerSegredos = await podeVerSegredosDoUniverso(
    universo.id,
    usuario.id,
  );
  const camposVisiveis = filtrarCampos(ficha.campos, podeVerSegredos);

  const base = `/universos/${slug}/cadastro`;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href={base}
        className="text-sm text-texto-suave transition hover:text-texto"
      >
        ← Cadastro de {universo.nome}
      </Link>

      <p className="mt-5 font-titulo text-xs uppercase tracking-[0.25em] text-ambar">
        {rotuloDoTipo(ficha.tipo)}
      </p>
      <h1 className="mt-2 font-titulo text-3xl">{ficha.nome}</h1>

      {ficha.resumo && (
        <p className="mt-3 text-base text-texto-suave">{ficha.resumo}</p>
      )}

      {ficha.corpo && (
        <p className="mt-8 whitespace-pre-line leading-relaxed">{ficha.corpo}</p>
      )}

      <section className="mt-12">
        <h2 className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Campos
        </h2>

        {camposVisiveis.length === 0 ? (
          <p className="mt-4 text-sm text-texto-suave">
            Nenhum campo ainda.
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-borda overflow-hidden rounded-lg border border-borda bg-superficie">
            {camposVisiveis.map((campo) => {
              const ehSegredo = campo.visibilidade === "MESTRE";
              return (
                <div
                  key={campo.id}
                  className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4 ${
                    ehSegredo ? "border-l-2 border-l-segredo" : ""
                  }`}
                >
                  <dt className="w-40 shrink-0 text-sm text-texto-suave">
                    {campo.chave}
                    {ehSegredo && (
                      <span className="ml-2 rounded border border-segredo/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-segredo">
                        mestre
                      </span>
                    )}
                  </dt>
                  <dd className="min-w-0 flex-1 text-sm">{campo.valor}</dd>
                  <form action={removerCampo} className="shrink-0">
                    <input type="hidden" name="universo" value={slug} />
                    <input type="hidden" name="entidade" value={slugEntidade} />
                    <input type="hidden" name="campoId" value={campo.id} />
                    <button
                      type="submit"
                      aria-label={`Remover o campo ${campo.chave}`}
                      className="text-xs text-texto-suave transition hover:text-segredo"
                    >
                      remover
                    </button>
                  </form>
                </div>
              );
            })}
          </dl>
        )}

        <div className="mt-6 rounded-lg border border-borda bg-superficie p-5">
          <FormularioCampo slugUniverso={slug} slugEntidade={slugEntidade} />
        </div>
      </section>
    </main>
  );
}
