import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { normalizarLocal, podeGerenciarLocal } from "@/lib/itens";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ itemId: string }> };

/*
  Editar (nome/descrição/quantidade), transferir (mudar de local) ou apagar
  um item (decisão #147, ideias #59/#60/#61/#63). "Transferir" é só trocar
  qual dos quatro campos de local está preenchido — nunca toca no `dados`
  de nenhuma ficha (decisão #17).
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { itemId } = await params;
  const item = await banco.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await podeGerenciarLocal(item, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : null;
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() : null;
  const quantidade = Number.isInteger(corpo?.quantidade) ? corpo.quantidade : null;
  const moverBruto = corpo?.mover;

  const dados: Record<string, unknown> = {};
  if (nome !== null) dados.nome = nome;
  if (descricao !== null) dados.descricao = descricao;
  if (quantidade !== null) dados.quantidade = Math.max(0, quantidade);

  if (moverBruto && typeof moverBruto === "object") {
    const destino = normalizarLocal({
      donoId: typeof moverBruto.donoId === "string" ? moverBruto.donoId : null,
      personagemId: typeof moverBruto.personagemId === "string" ? moverBruto.personagemId : null,
      grupoId: typeof moverBruto.grupoId === "string" ? moverBruto.grupoId : null,
      campanhaId: typeof moverBruto.campanhaId === "string" ? moverBruto.campanhaId : null,
    });
    if (!destino.donoId && !destino.personagemId && !destino.grupoId && !destino.campanhaId) {
      return NextResponse.json({ erro: "destino inválido" }, { status: 400 });
    }
    if (destino.donoId && destino.donoId !== usuario.id) {
      return NextResponse.json({ erro: "só dá pra mandar pra sua própria biblioteca" }, { status: 400 });
    }
    if (!(await podeGerenciarLocal(destino, usuario.id))) {
      return NextResponse.json({ erro: "sem permissão no destino" }, { status: 403 });
    }
    Object.assign(dados, destino);
  }

  if (Object.keys(dados).length === 0) {
    return NextResponse.json({ erro: "nada pra atualizar" }, { status: 400 });
  }

  const atualizado = await banco.item.update({
    where: { id: itemId },
    data: dados,
    select: {
      id: true,
      nome: true,
      descricao: true,
      quantidade: true,
      donoId: true,
      personagemId: true,
      grupoId: true,
      campanhaId: true,
    },
  });

  return NextResponse.json({ item: atualizado });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { itemId } = await params;
  const item = await banco.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await podeGerenciarLocal(item, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.item.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
