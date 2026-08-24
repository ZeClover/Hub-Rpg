import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/*
  Para onde o Google devolve a pessoa depois que ela autoriza o login.

  Ele manda um código de uso único; nós trocamos esse código pela sessão e
  gravamos nos cookies. Só então a pessoa está de fato logada no Hub.
*/
export async function GET(requisicao: NextRequest) {
  const { searchParams, origin } = new URL(requisicao.url);
  const codigo = searchParams.get("code");
  const erroDoGoogle = searchParams.get("error");

  if (erroDoGoogle) {
    // Caso mais comum: a pessoa clicou em "cancelar" na tela do Google.
    return NextResponse.redirect(`${origin}/entrar?erro=recusado`);
  }

  if (!codigo) {
    return NextResponse.redirect(`${origin}/entrar?erro=sem-codigo`);
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(codigo);

  if (error) {
    return NextResponse.redirect(`${origin}/entrar?erro=falhou`);
  }

  return NextResponse.redirect(`${origin}/painel`);
}
