import { NextResponse } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

/* Marcar todas as notificações não lidas da própria conta como lidas de uma vez. */
export async function POST() {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  await banco.notificacao.updateMany({
    where: { usuarioId: usuario.id, lida: false },
    data: { lida: true },
  });

  return NextResponse.json({ ok: true });
}
