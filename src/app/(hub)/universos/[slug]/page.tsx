import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

export default async function Universo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const usuario = (await usuarioAtual())!;

  /*
    O `donoId` entra na busca, não numa conferência depois. Se este universo
    for de outra pessoa, a consulta simplesmente não acha nada e a página vira
    "não encontrado" — em vez de carregar o conteúdo e só então esconder.
    Buscar já filtrado é o que impede o vazamento (decisão #13).
  */
  const universo = await banco.universo.findFirst({
    where: { slug, donoId: usuario.id },
    select: {
      nome: true,
      descricao: true,
      criadoEm: true,
      _count: { select: { entidades: true, campanhas: true } },
    },
  });

  if (!universo) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href="/universos"
        className="text-sm text-texto-suave transition hover:text-texto"
      >
        ← Universos
      </Link>

      <h1 className="mt-4 font-titulo text-3xl">{universo.nome}</h1>

      {universo.descricao && (
        <p className="mt-4 max-w-xl whitespace-pre-line text-base leading-relaxed text-texto-suave">
          {universo.descricao}
        </p>
      )}

      <dl className="mt-10 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-borda bg-superficie p-5">
          <dt className="font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave">
            No cadastro
          </dt>
          <dd className="mt-2 font-titulo text-3xl text-ambar-forte">
            {universo._count.entidades}
          </dd>
        </div>
        <div className="rounded-lg border border-borda bg-superficie p-5">
          <dt className="font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave">
            Campanhas
          </dt>
          <dd className="mt-2 font-titulo text-3xl text-ambar-forte">
            {universo._count.campanhas}
          </dd>
        </div>
      </dl>

      <Link
        href={`/universos/${slug}/cadastro`}
        className="mt-10 inline-block rounded-lg border border-ambar/40 bg-ambar/10 px-5 py-2.5 font-titulo text-sm text-ambar-forte transition hover:bg-ambar/20"
      >
        Abrir o cadastro
      </Link>
    </main>
  );
}
