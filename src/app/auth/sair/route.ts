import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/*
  Sair do Hub.

  É POST, e não GET, de propósito: um link GET de logout pode ser disparado sem
  a pessoa querer (por um pré-carregamento do navegador ou uma imagem numa
  página qualquer), derrubando a sessão dela no meio do jogo.
*/
export async function POST(requisicao: NextRequest) {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", requisicao.url), { status: 303 });
}
