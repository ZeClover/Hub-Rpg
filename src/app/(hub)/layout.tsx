import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { usuarioAtual } from "@/lib/usuario";

/*
  Moldura de tudo que exige estar logado.

  A pasta se chama "(hub)" entre parênteses: isso agrupa páginas sob um mesmo
  layout sem virar um pedaço do endereço. A tela do painel continua em /painel,
  não em /hub/painel.

  A checagem de login mora aqui, num lugar só. Cada página nova que entrar nesta
  pasta já nasce protegida, sem ninguém precisar lembrar de repetir a
  verificação.
*/
export default async function LayoutDoHub({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");

  return (
    <>
      <header className="border-b border-borda">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-6 py-4">
          <Link
            href="/painel"
            className="font-titulo text-xs uppercase tracking-[0.3em] text-ambar"
          >
            Hub RPG
          </Link>

          <nav className="flex gap-4 text-sm text-texto-suave">
            <Link href="/fichas" className="transition hover:text-texto">
              Fichas
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {usuario.avatarUrl && (
              <Image
                src={usuario.avatarUrl}
                alt=""
                width={28}
                height={28}
                className="rounded-full"
                unoptimized
              />
            )}
            <form action="/auth/sair" method="post">
              <button
                type="submit"
                className="text-sm text-texto-suave transition hover:text-texto"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </>
  );
}
