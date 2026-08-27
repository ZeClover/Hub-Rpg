/*
  Página inicial pública. É a porta de entrada de quem ainda não entrou.
*/

import { ROTULO_SITUACAO, SISTEMAS } from "@/lib/sistemas";

const etapas = [
  {
    nome: "Kaizoku no Sho",
    resumo:
      "Ficha completa: 7 atributos, 22 perícias, Akuma no Mi, Haki, Budô.",
    situacao: "pronta" as const,
  },
  {
    nome: "Fabula Ultima",
    resumo:
      "Atributos, classes e condições já calculam. Poderes, feitiços e equipamento em construção.",
    situacao: "em-construcao" as const,
  },
  {
    nome: "Fichas ligadas ao Hub",
    resumo:
      "Personagem salvo na sua conta, acessível de qualquer aparelho, e compartilhado com a mesa.",
    situacao: "planejada" as const,
  },
];



export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <header>
        <p className="font-titulo text-xs uppercase tracking-[0.35em] text-ambar">
          Hub RPG
        </p>
        <h1 className="mt-5 font-titulo text-4xl leading-tight sm:text-5xl">
          As fichas dos seus sistemas —{" "}
          <span className="text-ambar-forte">num lugar só</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-texto-suave">
          Uma ficha por sistema de regras, cada uma sabendo fazer as contas
          do sistema dela. Sem planilha, sem calculadora ao lado.
        </p>
      </header>

      <section className="mt-14">
        <h2 className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Sistemas
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SISTEMAS.map((sistema) => (
            <li
              key={sistema.chave}
              className="rounded-lg border border-borda bg-superficie px-4 py-3"
            >
              <p className="font-titulo text-base">{sistema.nome}</p>
              <p className="mt-0.5 text-sm text-texto-suave">
                {ROTULO_SITUACAO[sistema.situacao]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Construção
        </h2>
        <ol className="mt-5 space-y-3">
          {etapas.map((etapa) => (
            <li
              key={etapa.nome}
              className="rounded-lg border border-borda bg-superficie p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-titulo text-lg">{etapa.nome}</h3>
                <span
                  className={
                    etapa.situacao === "pronta"
                      ? "shrink-0 rounded-full border border-ambar/40 bg-ambar/10 px-3 py-0.5 text-xs text-ambar-forte"
                      : "shrink-0 rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
                  }
                >
                  {ROTULO_SITUACAO[etapa.situacao]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                {etapa.resumo}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16">
        <a
          href="/entrar"
          className="inline-block rounded-lg border border-ambar/40 bg-ambar/10 px-5 py-3 font-titulo text-base text-ambar-forte transition hover:bg-ambar/20"
        >
          Entrar com Google
        </a>
      </div>

      <footer className="mt-16 border-t border-borda pt-6 text-sm text-texto-suave">
        As decisões do projeto estão em{" "}
        <code className="text-texto">docs/DECISOES.md</code>.
      </footer>
    </main>
  );
}

