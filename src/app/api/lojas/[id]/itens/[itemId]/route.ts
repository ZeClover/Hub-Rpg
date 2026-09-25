import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; itemId: string }> };

async function buscarItemComoMestre(lojaId: string, itemId: string, usuarioId: string) {
  const item = await banco.lojaItem.findUnique({ where: { id: itemId } });
  if (!item || item.lojaId !== lojaId) return null;
  const loja = await banco.loja.findUnique({ where: { id: lojaId } });
  if (!loja || !(await ehMestreOuAuxiliar(loja.campanhaId, usuarioId))) return null;
  return item;
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: lojaId, itemId } = await params;
  const existente = await buscarItemComoMestre(lojaId, itemId, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const temNome = typeof corpo?.nome === "string" && corpo.nome.trim();
  const temDescricao = typeof corpo?.descricao === "string" || corpo?.descricao === null;
  const temPreco = Number.isInteger(corpo?.preco) && corpo.preco >= 0;
  const temEstoque = corpo?.estoque === null || (Number.isInteger(corpo?.estoque) && corpo.estoque >= 0);
  const mudouAlgumEstoque = "estoque" in (corpo ?? {});
  if (!temNome && !temDescricao && !temPreco && !mudouAlgumEstoque) {
    return NextResponse.json({ erro: "nada pra atualizar" }, { status: 400 });
  }
  if (mudouAlgumEstoque && !temEstoque) {
    return NextResponse.json({ erro: "estoque precisa ser inteiro >= 0, ou null" }, { status: 400 });
  }

  const item = await banco.lojaItem.update({
    where: { id: itemId },
    data: {
      ...(temNome ? { nome: corpo.nome.trim() } : {}),
      ...(temDescricao ? { descricao: corpo.descricao ? String(corpo.descricao).trim() || null : null } : {}),
      ...(temPreco ? { preco: corpo.preco } : {}),
      ...(mudouAlgumEstoque ? { estoque: corpo.estoque } : {}),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: lojaId, itemId } = await params;
  const existente = await buscarItemComoMestre(lojaId, itemId, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.lojaItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
