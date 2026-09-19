import Link from "next/link";

import { banco } from "@/lib/banco";
import { ROTULO_SITUACAO, SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { FavoritarSistema } from "../fichas/favoritar-sistema";

/*
  Página própria dos sistemas de regras (decisão #141) — antes só existia
  a lista compacta dentro de `/fichas` (favoritar e ver a situação, sem
  link nenhum pro Grimório ou Escudo do Mestre — aqueles só apareciam de
  dentro de uma campanha já criada). Esta página não substitui aquela
  lista: `/fichas` continua servindo pra favoritar rápido enquanto navega
  as próprias fichas; aqui é o lugar de referência pra conhecer um
  sistema antes de criar campanha ou ficha nele.
*/
export default async function Sistemas() {
  // O layout do Hub já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;

  const dadosUsuario = await banco.usuario.findUnique({
    where: { id: usuario.id },
    select: { sistemasFavoritos: true },
  });
  const favoritos = new Set(dadosUsuario?.sistemasFavoritos ?? []);

  const sistemasOrdenados = [...SISTEMAS].sort((a, b) => {
    const aFav = favoritos.has(a.chave) ? 0 : 1;
    const bFav = favoritos.has(b.chave) ? 0 : 1;
    return aFav - bFav;
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Sistemas</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-texto-suave">
        Os sistemas de regras que o Hub conhece — cada um com sua própria
        ficha, calculando os números sozinho.
      </p>

      <ul className="mt-10 space-y-4">
        {sistemasOrdenados.map((sistema) => (
          <li key={sistema.chave} className="rounded-lg border border-borda bg-superficie p-5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <FavoritarSistema
                  chave={sistema.chave}
                  favoritoInicial={favoritos.has(sistema.chave)}
                />
                <p className="font-titulo text-lg">{sistema.nome}</p>
              </div>
              <span
                className={
                  sistema.situacao === "pronta"
                    ? "shrink-0 rounded-full border border-ambar/40 bg-ambar/10 px-3 py-0.5 text-xs text-ambar-forte"
                    : "shrink-0 rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
                }
              >
                {ROTULO_SITUACAO[sistema.situacao]}
              </span>
            </div>
            <p className="mt-2 text-sm text-texto-suave">{sistema.descricao}</p>

            {(sistema.grimorio || sistema.escudoMestre || (sistema.ficha && sistema.salvaNoHub)) && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {sistema.ficha && sistema.salvaNoHub && (
                  <Link
                    href="/fichas"
                    className="text-sm text-ambar-forte underline underline-offset-2"
                  >
                    + Criar ficha
                  </Link>
                )}
                {sistema.grimorio && (
                  <a
                    href={sistema.grimorio}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ambar-forte underline underline-offset-2"
                  >
                    📖 Grimório
                  </a>
                )}
                {sistema.escudoMestre && (
                  <a
                    href={sistema.escudoMestre}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-ambar-forte underline underline-offset-2"
                  >
                    Escudo do Mestre
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
