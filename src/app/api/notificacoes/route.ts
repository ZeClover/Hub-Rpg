import { NextResponse } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

const LIMITE = 30;

/*
  Notificações internas (decisão #136) — globais, não por campanha, porque
  o sino mora no layout do Hub (aparece em qualquer tela). Lista as mais
  recentes; não lida vem primeiro pra não precisar rolar até achar.
*/
export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const notificacoes = await banco.notificacao.findMany({
    where: { usuarioId: usuario.id },
    orderBy: [{ lida: "asc" }, { criadoEm: "desc" }],
    take: LIMITE,
    select: {
      id: true,
      tipo: true,
      texto: true,
      lida: true,
      criadoEm: true,
      campanhaId: true,
      campanha: { select: { nome: true } },
    },
  });

  return NextResponse.json({ notificacoes });
}
