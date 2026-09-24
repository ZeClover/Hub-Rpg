import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; grupoId: string }> };

async function souMestreDaCampanha(campanhaId: string, usuarioId: string) {
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
  return participacao?.papel === "MESTRE";
}

/// Renomear ou apagar um grupo — só o mestre (decisão #147, ideia #58).
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, grupoId } = await params;
  const grupo = await banco.grupo.findUnique({ where: { id: grupoId } });
  if (!grupo || grupo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await souMestreDaCampanha(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  if (!nome) {
    return NextResponse.json({ erro: "nome é obrigatório" }, { status: 400 });
  }

  const atualizado = await banco.grupo.update({
    where: { id: grupoId },
    data: { nome },
    select: { id: true, nome: true },
  });

  return NextResponse.json({ grupo: atualizado });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, grupoId } = await params;
  const grupo = await banco.grupo.findUnique({ where: { id: grupoId } });
  if (!grupo || grupo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await souMestreDaCampanha(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  // Apagar o grupo solta os itens do inventário compartilhado de volta pro
  // cofre da campanha em vez de apagá-los junto (decisão #147) — o grupo é
  // só uma organização, não é dono de verdade dos itens.
  await banco.$transaction([
    banco.item.updateMany({
      where: { grupoId },
      data: { grupoId: null, campanhaId },
    }),
    banco.grupo.delete({ where: { id: grupoId } }),
  ]);

  return NextResponse.json({ ok: true });
}
