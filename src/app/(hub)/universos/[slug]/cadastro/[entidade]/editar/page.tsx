import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

import { excluirEntidade } from "../../acoes";
import { FormularioEditar } from "./formulario";

export default async function Editar({
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
    select: { nome: true, tipo: true, resumo: true, corpo: true },
  });
  if (!ficha) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href={`/universos/${slug}/cadastro/${slugEntidade}`}
        className="text-sm text-texto-suave transition hover:text-texto"
      >
        ← {ficha.nome}
      </Link>

      <h1 className="mt-4 font-titulo text-3xl">Editar ficha</h1>

      <div className="mt-10">
        <FormularioEditar
          slugUniverso={slug}
          slugEntidade={slugEntidade}
          ficha={ficha}
        />
      </div>

      <section className="mt-16 rounded-lg border border-segredo/40 bg-segredo/5 p-5">
        <h2 className="font-titulo text-base">Excluir esta ficha</h2>
        <p className="mt-2 text-sm leading-relaxed text-texto-suave">
          Apaga <strong className="text-texto">{ficha.nome}</strong> e todos os
          campos dela, inclusive os de mestre. Não dá para desfazer.
        </p>
        <form action={excluirEntidade} className="mt-4">
          <input type="hidden" name="universo" value={slug} />
          <input type="hidden" name="entidade" value={slugEntidade} />
          <button
            type="submit"
            className="rounded-lg border border-segredo/60 px-4 py-2 text-sm text-segredo transition hover:bg-segredo/10"
          >
            Excluir definitivamente
          </button>
        </form>
      </section>
    </main>
  );
}
