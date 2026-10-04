import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
  Roda antes de cada página. Serve para uma coisa só: renovar a sessão de quem
  está logado.

  A sessão do Supabase vence de tempos em tempos. Se ninguém renovar, a pessoa
  é deslogada no meio da sessão de jogo. Como Server Components não podem
  escrever cookies, essa renovação precisa acontecer aqui.
*/
export async function proxy(requisicao: NextRequest) {
  let resposta = NextResponse.next({ request: requisicao });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requisicao.cookies.getAll();
        },
        setAll(novosCookies) {
          for (const { name, value } of novosCookies) {
            requisicao.cookies.set(name, value);
          }
          resposta = NextResponse.next({ request: requisicao });
          for (const { name, value, options } of novosCookies) {
            resposta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Renova a sessão e verifica a assinatura do token. Com chaves assimétricas,
  // reaproveita a chave pública; as páginas e APIs continuam conferindo a
  // conta com getUser() em usuarioAtual(), antes de aplicar permissões.
  await supabase.auth.getClaims();

  return resposta;
}

export const config = {
  // As fichas HTML e seus recursos são públicos; os dados privados são
  // protegidos nas APIs. Não atrasamos estes arquivos com uma consulta de sessão.
  matcher: [
    "/((?!_next/static|_next/image|fontes/|favicon.ico|manifest.json|sw.js|.*\\.(?:html|js|css|woff2?|ico|svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
