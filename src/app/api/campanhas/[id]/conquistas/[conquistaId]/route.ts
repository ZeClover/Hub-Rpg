import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; conquistaId: string }> };

/* Editar ou apagar uma conquista da campanha — só o mestre, mesma checagem nas duas rotas. */
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, conquistaId } = await params;
  const conquista = await banco.conquista.findUnique({ where: { id: conquistaId } });
  if (!conquista || conquista.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const titulo = typeof corpo?.titulo === "string" ? corpo.titulo.trim() : null;
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() : null;
  if (titulo === null && descricao === null) {
    return NextResponse.json({ erro: "título ou descrição é obrigatório" }, { status: 400 });
  }
  if (titulo === "") {
    return NextResponse.json({ erro: "título não pode ficar vazio" }, { status: 400 });
  }

  const atualizada = await banco.conquista.update({
    where: { id: conquistaId },
    data: {
      ...(titulo !== null ? { titulo } : {}),
      ...(descricao !== null ? { descricao: descricao || null } : {}),
    },
    select: { id: true, titulo: true, descricao: true, criadoEm: true },
  });

  return NextResponse.json({ conquista: atualizada });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, conquistaId } = await params;
  const conquista = await banco.conquista.findUnique({ where: { id: conquistaId } });
  if (!conquista || conquista.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.conquista.delete({ where: { id: conquistaId } });
  return NextResponse.json({ ok: true });
}
