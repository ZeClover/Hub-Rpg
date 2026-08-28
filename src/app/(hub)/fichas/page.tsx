import { banco } from "@/lib/banco";
import { ROTULO_SITUACAO, SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { CriarFicha } from "./criar-ficha";
import { BotaoExcluir } from "./excluir-ficha";

export default async function Fichas() {
  // O layout do Hub já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;

  const personagens = await banco.personagem.findMany({
    where: { donoId: usuario.id },
    orderBy: { atualizadoEm: "desc" },
    select: {
      id: true,
      nome: true,
      sistema: { select: { chave: true, nome: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Fichas</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-texto-suave">
        Uma ficha por sistema de regras. Cada uma conhece as regras do seu
        sistema e calcula os números sozinha.
      </p>

      {personagens.length > 0 && (
        <ul className="mt-10 space-y-3">
          {personagens.map((personagem) => {
            const sistema = SISTEMAS.find((s) => s.chave === personagem.sistema.chave);
            const url = sistema?.ficha ? `${sistema.ficha}?id=${personagem.id}` : null;
            const conteudo = (
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-titulo text-lg">{personagem.nome}</p>
                <span className="shrink-0 text-xs text-texto-suave">
                  {personagem.sistema.nome}
                </span>
              </div>
            );
            return (
              <li
                key={personagem.id}
                className="flex items-start gap-3 rounded-lg border border-borda bg-superficie p-5 transition hover:border-ambar/40"
              >
                {url ? (
                  <a href={url} className="min-w-0 flex-1">
                    {conteudo}
                  </a>
                ) : (
                  <div className="min-w-0 flex-1 opacity-60">{conteudo}</div>
                )}
                <BotaoExcluir id={personagem.id} nome={personagem.nome} />
              </li>
            );
          })}
        </ul>
      )}

      <CriarFicha />

      <h2 className="mt-14 font-titulo text-xl">Sistemas do Hub</h2>
      <ul className="mt-4 space-y-3">
        {SISTEMAS.map((sistema) => (
          <li
            key={sistema.chave}
            className="rounded-lg border border-borda bg-superficie p-5 opacity-80"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-titulo text-lg">{sistema.nome}</p>
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
            <p className="mt-1 text-sm text-texto-suave">{sistema.descricao}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm leading-relaxed text-texto-suave">
        Cada ficha criada aqui salva sozinha na sua conta — sem botão de
        salvar, e ela te segue em qualquer aparelho.
      </p>
    </main>
  );
}
