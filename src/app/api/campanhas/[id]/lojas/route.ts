import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Lojas de uma campanha (decisão #162). Mestre vê todas (inclusive
  fechadas, pra montar estoque em paz); jogador só vê as abertas — e só
  precisa estar logado e ter uma ficha nesta campanha, não precisa ser
  mestre. `itens` sempre vai junto: a tela de loja não pede item por item.
*/
export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const souMestre = await ehMestreOuAuxiliar(campanhaId, usuario.id);

  if (!souMestre) {
    const participo = await banco.participacao.findUnique({
      where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
    });
    if (!participo) {
      return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
    }
  }

  const lojas = await banco.loja.findMany({
    where: { campanhaId, ...(souMestre ? {} : { aberta: true }) },
    orderBy: { criadoEm: "asc" },
    include: { itens: { orderBy: { criadoEm: "asc" } } },
  });

  return NextResponse.json({ lojas });
}

export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  if (!nome) {
    return NextResponse.json({ erro: "nome é obrigatório" }, { status: 400 });
  }
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() || null : null;

  const loja = await banco.loja.create({
    data: { campanhaId, nome, descricao },
    include: { itens: true },
  });

  return NextResponse.json({ loja }, { status: 201 });
}
