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

  // Não remova: é esta chamada que dispara a renovação do cookie.
  await supabase.auth.getUser();

  return resposta;
}

export const config = {
  // Pula arquivos estáticos e imagens — eles não precisam de sessão.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
