import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; companheiroId: string }> };

/// Desfazer o vínculo de companheiro — só o dono das duas fichas.
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: personagemId, companheiroId } = await params;
  const dono = await banco.personagem.findUnique({ where: { id: personagemId } });
  if (!dono || dono.donoId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.companheiro.deleteMany({ where: { personagemId, companheiroId } });
  return NextResponse.json({ ok: true });
}
