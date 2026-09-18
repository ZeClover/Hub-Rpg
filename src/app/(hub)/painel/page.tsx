import Link from "next/link";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

/*
  Painel — ponto de entrada do Hub depois do login. Antes desta versão só
  mostrava uma contagem de fichas prontas e um parágrafo desatualizado
  dizendo que os personagens ainda viviam no navegador (não vivem mais
  desde a decisão #42). Continua sendo o MESMO painel, só mostrando o que
  já existe na conta: campanhas recentes (com o papel em cada uma),
  fichas recentes, a próxima sessão marcada (quando existir — decisão
  #134) e atalhos pras duas listas principais.
*/
export default async function Painel() {
  // O layout já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;
  const primeiroNome = usuario.nome?.split(" ")[0] ?? "mestre";

  const [participacoes, fichasRecentes, proximaSessao] = await Promise.all([
    banco.participacao.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { criadoEm: "desc" },
      take: 5,
      select: {
        papel: true,
        campanha: { select: { id: true, nome: true, sistema: { select: { nome: true } } } },
      },
    }),
    banco.personagem.findMany({
      where: { donoId: usuario.id },
      orderBy: { atualizadoEm: "desc" },
      take: 5,
      select: { id: true, nome: true, sistema: { select: { nome: true } } },
    }),
    banco.sessao.findFirst({
      where: {
        data: { gte: new Date() },
        campanha: { participacoes: { some: { usuarioId: usuario.id } } },
      },
      orderBy: { data: "asc" },
      select: {
        numero: true,
        data: true,
        campanha: { select: { id: true, nome: true } },
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Bem-vindo, {primeiroNome}.</h1>

      {proximaSessao && (
        <section className="mt-8 rounded-lg border border-ambar/40 bg-ambar/10 p-5">
          <p className="font-titulo text-xs uppercase tracking-[0.25em] text-ambar-forte">
            Próxima sessão
          </p>
          <p className="mt-2 text-sm text-texto">
            Sessão {proximaSessao.numero} de{" "}
            <Link
              href={`/campanhas/${proximaSessao.campanha.id}`}
              className="underline decoration-borda underline-offset-4 hover:text-ambar-forte"
            >
              {proximaSessao.campanha.nome}
            </Link>{" "}
            —{" "}
            {proximaSessao.data.toLocaleString("pt-BR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </section>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-borda bg-superficie p-6">
          <div className="flex items-baseline justify-between">
            <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
              Suas campanhas
            </p>
            <Link
              href="/campanhas"
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
            >
              Ver todas
            </Link>
          </div>
          {participacoes.length === 0 ? (
            <p className="mt-3 text-sm text-texto-suave">
              Nenhuma ainda.{" "}
              <Link href="/campanhas" className="text-ambar-forte underline underline-offset-2">
                Criar ou entrar numa campanha
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {participacoes.map(({ campanha, papel }) => (
                <li key={campanha.id}>
                  <Link
                    href={`/campanhas/${campanha.id}`}
                    className="flex items-baseline justify-between gap-3 text-sm text-texto hover:text-ambar-forte"
                  >
                    <span className="truncate">{campanha.nome}</span>
                    <span className="shrink-0 text-xs text-texto-suave">
                      {papel === "MESTRE" ? "mestre" : "jogador"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-borda bg-superficie p-6">
          <div className="flex items-baseline justify-between">
            <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
              Fichas recentes
            </p>
            <Link
              href="/fichas"
              className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
            >
              Ver todas
            </Link>
          </div>
          {fichasRecentes.length === 0 ? (
            <p className="mt-3 text-sm text-texto-suave">
              Nenhuma ainda.{" "}
              <Link href="/fichas" className="text-ambar-forte underline underline-offset-2">
                Criar ficha
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {fichasRecentes.map((personagem) => (
                <li key={personagem.id} className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-texto">{personagem.nome}</span>
                  <span className="shrink-0 text-xs text-texto-suave">
                    {personagem.sistema.nome}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/fichas"
          className="rounded border border-borda bg-superficie px-4 py-2 text-sm text-texto transition hover:border-ambar/40 hover:text-ambar-forte"
        >
          + Criar ficha
        </Link>
        <Link
          href="/campanhas"
          className="rounded border border-borda bg-superficie px-4 py-2 text-sm text-texto transition hover:border-ambar/40 hover:text-ambar-forte"
        >
          + Criar campanha
        </Link>
      </section>
    </main>
  );
}
