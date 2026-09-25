import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

async function buscarComoMestre(lojaId: string, usuarioId: string) {
  const loja = await banco.loja.findUnique({ where: { id: lojaId } });
  if (!loja) return null;
  if (!(await ehMestreOuAuxiliar(loja.campanhaId, usuarioId))) return null;
  return loja;
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarComoMestre(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const temNome = typeof corpo?.nome === "string" && corpo.nome.trim();
  const temDescricao = typeof corpo?.descricao === "string" || corpo?.descricao === null;
  const temAberta = typeof corpo?.aberta === "boolean";
  if (!temNome && !temDescricao && !temAberta) {
    return NextResponse.json({ erro: "nome, descricao ou aberta é obrigatório" }, { status: 400 });
  }

  const loja = await banco.loja.update({
    where: { id },
    data: {
      ...(temNome ? { nome: corpo.nome.trim() } : {}),
      ...(temDescricao ? { descricao: corpo.descricao ? String(corpo.descricao).trim() || null : null } : {}),
      ...(temAberta ? { aberta: corpo.aberta } : {}),
    },
    include: { itens: { orderBy: { criadoEm: "asc" } } },
  });

  return NextResponse.json({ loja });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarComoMestre(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.loja.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
