import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/usuario";
import { Icone } from "@/components/hub/icone";
import { NavegacaoHub } from "@/components/hub/navegacao";
import { SinoNotificacoes } from "./sino-notificacoes";

export default async function LayoutDoHub({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");
  return (
    <div className="hub-shell">
      <a href="#conteudo-hub" className="hub-skip">
        Ir para o conteúdo
      </a>
      <aside className="hub-sidebar sem-impressao">
        <Link href="/painel" className="hub-brand">
          <span className="hub-brand-icon">
            <Icone nome="dados" width={29} height={29} />
          </span>
          <span>
            Hub RPG<small>Suas histórias, reunidas.</small>
          </span>
        </Link>
        <p className="hub-eyebrow mt-10 mb-4">Sua biblioteca</p>
        <NavegacaoHub />
        <div className="hub-sidebar-bottom">
          <Link href="/creditos">Créditos das imagens</Link>
          <span className="text-xs text-texto-suave">
            Um lugar para cada aventura.
          </span>
        </div>
      </aside>
      <div className="hub-workspace">
        <header className="hub-topbar sem-impressao">
          <Link href="/painel" className="hub-mobile-brand">
            <Icone nome="dados" />
            Hub RPG
          </Link>
          <span className="hub-topbar-caption">
            Entre mundos, escolha sua próxima história.
          </span>
          <div className="ml-auto flex items-center gap-4">
            <SinoNotificacoes />
            {usuario.avatarUrl && (
              <Image
                src={usuario.avatarUrl}
                alt=""
                width={32}
                height={32}
                unoptimized
                className="rounded-full"
              />
            )}
            <span className="hub-account-name">
              {usuario.nome?.split(" ")[0] ?? "Sua conta"}
            </span>
            <form
              action="/auth/sair"
              method="post"
              className="hub-desktop-signout"
            >
              <button
                type="submit"
                className="text-sm text-texto-suave hover:text-texto"
              >
                Sair
              </button>
            </form>
          </div>
        </header>
        <div id="conteudo-hub">{children}</div>
      </div>
      <NavegacaoHub mobile />
    </div>
  );
}
