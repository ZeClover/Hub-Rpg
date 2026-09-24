import Link from "next/link";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

import { CriarCampanha } from "./criar-campanha";
import { EntrarComCodigo } from "./entrar-com-codigo";

export default async function Campanhas() {
  // O layout do Hub já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;

  const participacoes = await banco.participacao.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { criadoEm: "desc" },
    select: {
      papel: true,
      campanha: {
        select: {
          id: true,
          nome: true,
          capaUrl: true,
          descricao: true,
          tags: true,
          sistema: { select: { nome: true } },
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Campanhas</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-texto-suave">
        Uma mesa por campanha. Você cria, manda o link pra galera, e cada
        jogador liga uma ficha dele à campanha — só do sistema certo.
      </p>

      {participacoes.length > 0 && (
        <ul className="mt-10 space-y-3">
          {participacoes.map(({ campanha, papel }) => (
            <li
              key={campanha.id}
              className="rounded-lg border border-borda bg-superficie p-5 transition hover:border-ambar/40"
            >
              <Link href={`/campanhas/${campanha.id}`} className="flex gap-4">
                {campanha.capaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- capa é uma URL externa qualquer, não um asset otimizável pelo Next.
                  <img
                    src={campanha.capaUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-titulo text-lg">{campanha.nome}</p>
                    <span className="shrink-0 text-xs text-texto-suave">
                      {campanha.sistema.nome}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-texto-suave">
                    {papel === "MESTRE"
                      ? "Você é o mestre"
                      : papel === "MESTRE_AUXILIAR"
                        ? "Você é mestre auxiliar"
                        : "Você é jogador"}
                  </p>
                  {campanha.descricao && (
                    <p className="mt-1 truncate text-xs text-texto-suave">{campanha.descricao}</p>
                  )}
                  {campanha.tags.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {campanha.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-borda px-2 py-0.5 text-[10px] text-texto-suave"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CriarCampanha />
      <EntrarComCodigo />
    </main>
  );
}
