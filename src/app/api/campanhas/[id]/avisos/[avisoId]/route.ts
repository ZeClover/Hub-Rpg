import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; avisoId: string }> };

async function souMestreDaCampanha(campanhaId: string, usuarioId: string) {
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
  return participacao?.papel === "MESTRE";
}

/*
  Editar (texto e/ou fixado — fixar/desfixar é só um PATCH de `fixado`) ou
  apagar um aviso. Só o mestre da campanha, mesma checagem nas duas rotas.
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, avisoId } = await params;
  const aviso = await banco.aviso.findUnique({ where: { id: avisoId } });
  if (!aviso || aviso.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await souMestreDaCampanha(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const texto = typeof corpo?.texto === "string" ? corpo.texto.trim() : null;
  const fixado = typeof corpo?.fixado === "boolean" ? corpo.fixado : null;
  if (texto === null && fixado === null) {
    return NextResponse.json({ erro: "texto ou fixado é obrigatório" }, { status: 400 });
  }
  if (texto === "") {
    return NextResponse.json({ erro: "texto não pode ficar vazio" }, { status: 400 });
  }

  const atualizado = await banco.aviso.update({
    where: { id: avisoId },
    data: {
      ...(texto !== null ? { texto } : {}),
      ...(fixado !== null ? { fixado } : {}),
    },
    select: { id: true, texto: true, fixado: true, criadoEm: true, atualizadoEm: true },
  });

  return NextResponse.json({ aviso: atualizado });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, avisoId } = await params;
  const aviso = await banco.aviso.findUnique({ where: { id: avisoId } });
  if (!aviso || aviso.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await souMestreDaCampanha(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.aviso.delete({ where: { id: avisoId } });
  return NextResponse.json({ ok: true });
}
