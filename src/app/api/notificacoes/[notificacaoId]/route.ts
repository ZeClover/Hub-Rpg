import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ notificacaoId: string }> };

/* Marcar uma notificação como lida — só o dono dela. */
export async function PATCH(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { notificacaoId } = await params;
  const notificacao = await banco.notificacao.findUnique({ where: { id: notificacaoId } });
  if (!notificacao || notificacao.usuarioId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.notificacao.update({ where: { id: notificacaoId }, data: { lida: true } });
  return NextResponse.json({ ok: true });
}
