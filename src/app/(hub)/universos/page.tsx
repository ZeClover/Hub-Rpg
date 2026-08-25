import Link from "next/link";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

import { FormularioNovoUniverso } from "./formulario-novo";

export default async function Universos() {
  const usuario = (await usuarioAtual())!;

  const universos = await banco.universo.findMany({
    where: { donoId: usuario.id },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      slug: true,
      descricao: true,
      _count: { select: { entidades: true, campanhas: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Universos</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-texto-suave">
        Um universo é um mundo: seus lugares, povos, facções e história. As
        regras de jogo ficam de fora dele — assim o mesmo mundo serve para
        qualquer sistema.
      </p>

      {universos.length > 0 && (
        <ul className="mt-10 space-y-3">
          {universos.map((universo) => (
            <li key={universo.id}>
              <Link
                href={`/universos/${universo.slug}`}
                className="block rounded-lg border border-borda bg-superficie p-5 transition hover:border-ambar/40"
              >
                <p className="font-titulo text-lg">{universo.nome}</p>
                {universo.descricao && (
                  <p className="mt-1 line-clamp-2 text-sm text-texto-suave">
                    {universo.descricao}
                  </p>
                )}
                <p className="mt-3 text-xs text-texto-suave">
                  {universo._count.entidades} no cadastro ·{" "}
                  {universo._count.campanhas} campanha
                  {universo._count.campanhas === 1 ? "" : "s"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 rounded-lg border border-borda bg-superficie p-6">
        <h2 className="font-titulo text-lg">
          {universos.length === 0 ? "Crie seu primeiro universo" : "Novo universo"}
        </h2>
        <div className="mt-6">
          <FormularioNovoUniverso />
        </div>
      </section>
    </main>
  );
}
