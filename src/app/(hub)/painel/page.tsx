import Link from "next/link";

import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

export default async function Painel() {
  // O layout já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;
  const primeiroNome = usuario.nome?.split(" ")[0] ?? "mestre";
  const prontas = SISTEMAS.filter((s) => s.ficha).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Bem-vindo, {primeiroNome}.</h1>

      <section className="mt-10 rounded-lg border border-borda bg-superficie p-6">
        <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Fichas disponíveis
        </p>
        <p className="mt-3 font-titulo text-4xl text-ambar-forte">{prontas}</p>
        <Link
          href="/fichas"
          className="mt-4 inline-block text-sm text-texto-suave underline decoration-borda underline-offset-4 transition hover:text-texto"
        >
          Abrir uma ficha
        </Link>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-texto-suave">
        Seus personagens ainda vivem no navegador de cada aparelho. Trazê-los
        para o Hub, com login e banco, é o próximo passo.
      </p>
    </main>
  );
}
