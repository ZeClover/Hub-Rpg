import Link from "next/link";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

/*
  Primeira tela de quem entra. Hoje mostra um resumo curto; conforme as fatias
  avançarem, é aqui que entram as campanhas em andamento e a próxima sessão.
*/
export default async function Painel() {
  // O layout já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;

  const quantosUniversos = await banco.universo.count({
    where: { donoId: usuario.id },
  });

  const primeiroNome = usuario.nome?.split(" ")[0] ?? "mestre";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Bem-vindo, {primeiroNome}.</h1>

      <section className="mt-10 rounded-lg border border-borda bg-superficie p-6">
        <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Seus universos
        </p>
        <p className="mt-3 font-titulo text-4xl text-ambar-forte">
          {quantosUniversos}
        </p>
        <Link
          href="/universos"
          className="mt-4 inline-block text-sm text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-texto"
        >
          {quantosUniversos === 0
            ? "Criar o primeiro"
            : "Ver todos os universos"}
        </Link>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-texto-suave">
        Campanhas, fichas e o cadastro do mundo chegam nos próximos passos da
        Fatia 1.
      </p>
    </main>
  );
}
