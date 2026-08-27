import { ROTULO_SITUACAO, SISTEMAS } from "@/lib/sistemas";

export default function Fichas() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Fichas</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-texto-suave">
        Uma ficha por sistema de regras. Cada uma conhece as regras do seu
        sistema e calcula os números sozinha.
      </p>

      <ul className="mt-10 space-y-3">
        {SISTEMAS.map((sistema) => {
          const conteudo = (
            <>
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
              <p className="mt-1 text-sm text-texto-suave">
                {sistema.descricao}
              </p>
            </>
          );

          return (
            <li key={sistema.chave}>
              {sistema.ficha ? (
                <a
                  href={sistema.ficha}
                  className="block rounded-lg border border-borda bg-superficie p-5 transition hover:border-ambar/40"
                >
                  {conteudo}
                </a>
              ) : (
                <div className="rounded-lg border border-borda bg-superficie p-5 opacity-60">
                  {conteudo}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-sm leading-relaxed text-texto-suave">
        Por enquanto cada ficha guarda os personagens no navegador deste
        aparelho. Ligá-las ao Hub — para a ficha te seguir em qualquer
        aparelho e seus jogadores acessarem as delas — é o próximo passo.
      </p>
    </main>
  );
}
