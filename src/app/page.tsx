/*
  Página inicial provisória.
  Ela existe para o Hub já ter uma cara enquanto a Fatia 1 é construída, e
  para deixar visível a decisão que estrutura tudo: universo e sistema são
  coisas separadas (decisão #9).
*/

const universos = [
  { nome: "Darkrem", situacao: "Universo principal" },
  { nome: "Ometion", situacao: "Em criação" },
];

const sistemas = [
  { nome: "Fabula Ultima", situacao: "Primeiro a ganhar motor" },
  { nome: "Sistema SAO", situacao: "Homebrew do Zé" },
  { nome: "Thrylikí Chelóna", situacao: "Homebrew do Zé" },
];

const fatias = [
  {
    numero: 1,
    nome: "Fundação e porta de entrada",
    resumo:
      "Login com Google, universos, campanhas e o cadastro base com segredos de mestre.",
    situacao: "em-construcao" as const,
  },
  {
    numero: 2,
    nome: "Fichas e motor de regras",
    resumo:
      "Módulo de Fabula Ultima e o assistente de criação de personagem passo a passo.",
    situacao: "planejada" as const,
  },
  {
    numero: 3,
    nome: "Wiki de lore",
    resumo:
      "Vínculos entre fichas, mapas clicáveis, linha do tempo e importação do conteúdo antigo.",
    situacao: "planejada" as const,
  },
  {
    numero: 4,
    nome: "Painel de mesa ao vivo",
    resumo:
      "Iniciativa, HP dos inimigos e rolagem de dados compartilhada em tempo real.",
    situacao: "planejada" as const,
  },
];

const rotulos = {
  "em-construcao": "Em construção",
  planejada: "Planejada",
};

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <header>
        <p className="font-titulo text-xs uppercase tracking-[0.35em] text-ambar">
          Hub RPG
        </p>
        <h1 className="mt-5 font-titulo text-4xl leading-tight sm:text-5xl">
          Os mundos, as mesas e as fichas —{" "}
          <span className="text-ambar-forte">num lugar só</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-texto-suave">
          O Hub separa o <strong className="text-texto">mundo</strong> — lugares,
          NPCs, facções, história — das <strong className="text-texto">regras</strong>{" "}
          usadas para jogar nele. Uma campanha combina os dois, então o mesmo
          lore serve para qualquer sistema.
        </p>
      </header>

      <section className="mt-14 grid gap-8 sm:grid-cols-2">
        <Coluna titulo="Universos" itens={universos} />
        <Coluna titulo="Sistemas" itens={sistemas} />
      </section>

      <section className="mt-16">
        <h2 className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Construção
        </h2>
        <ol className="mt-5 space-y-3">
          {fatias.map((fatia) => (
            <li
              key={fatia.numero}
              className="rounded-lg border border-borda bg-superficie p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-titulo text-lg">
                  <span className="text-texto-suave">Fatia {fatia.numero} · </span>
                  {fatia.nome}
                </h3>
                <span
                  className={
                    fatia.situacao === "em-construcao"
                      ? "shrink-0 rounded-full border border-ambar/40 bg-ambar/10 px-3 py-0.5 text-xs text-ambar-forte"
                      : "shrink-0 rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
                  }
                >
                  {rotulos[fatia.situacao]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                {fatia.resumo}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-16 border-t border-borda pt-6 text-sm text-texto-suave">
        Nada aqui ainda é usável — esta página é só o esqueleto no ar. As
        decisões do projeto estão em{" "}
        <code className="text-texto">docs/DECISOES.md</code>.
      </footer>
    </main>
  );
}

function Coluna({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { nome: string; situacao: string }[];
}) {
  return (
    <div>
      <h2 className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
        {titulo}
      </h2>
      <ul className="mt-4 space-y-2">
        {itens.map((item) => (
          <li
            key={item.nome}
            className="rounded-lg border border-borda bg-superficie px-4 py-3"
          >
            <p className="font-titulo text-base">{item.nome}</p>
            <p className="mt-0.5 text-sm text-texto-suave">{item.situacao}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
