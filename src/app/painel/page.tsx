import Image from "next/image";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/usuario";

/*
  Primeira tela protegida do Hub. Por enquanto ela prova uma coisa só, mas a
  mais importante: o Hub sabe quem você é, e essa identidade veio conferida com
  o servidor — não é um cookie que dá para forjar.
*/
export default async function Painel() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");

  const primeiroNome = usuario.nome?.split(" ")[0] ?? "mestre";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="font-titulo text-xs uppercase tracking-[0.35em] text-ambar">
        Hub RPG
      </p>
      <h1 className="mt-4 font-titulo text-3xl">Bem-vindo, {primeiroNome}.</h1>

      <section className="mt-10 flex items-center gap-4 rounded-lg border border-borda bg-superficie p-5">
        {usuario.avatarUrl && (
          <Image
            src={usuario.avatarUrl}
            alt=""
            width={56}
            height={56}
            className="rounded-full"
            unoptimized
          />
        )}
        <div className="min-w-0">
          <p className="font-titulo text-lg">{usuario.nome ?? "Sem nome"}</p>
          <p className="truncate text-sm text-texto-suave">{usuario.email}</p>
        </div>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-texto-suave">
        Sua conta está registrada no Hub. As telas de universos, campanhas e
        cadastro chegam em seguida — esta é a primeira parte da Fatia 1.
      </p>

      <form action="/auth/sair" method="post" className="mt-10">
        <button
          type="submit"
          className="rounded-lg border border-borda px-4 py-2 text-sm text-texto-suave transition hover:border-texto-suave hover:text-texto"
        >
          Sair
        </button>
      </form>
    </main>
  );
}
