import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: lojaId } = await params;
  const loja = await banco.loja.findUnique({ where: { id: lojaId } });
  if (!loja || !(await ehMestreOuAuxiliar(loja.campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  const preco = Number.isInteger(corpo?.preco) && corpo.preco >= 0 ? corpo.preco : null;
  if (!nome || preco === null) {
    return NextResponse.json({ erro: "nome e preco (inteiro, >= 0) são obrigatórios" }, { status: 400 });
  }
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() || null : null;
  // null = estoque infinito; qualquer outro valor precisa ser inteiro >= 0.
  const estoque =
    corpo?.estoque === null || corpo?.estoque === undefined
      ? null
      : Number.isInteger(corpo.estoque) && corpo.estoque >= 0
        ? corpo.estoque
        : undefined;
  if (estoque === undefined) {
    return NextResponse.json({ erro: "estoque precisa ser inteiro >= 0, ou null pra infinito" }, { status: 400 });
  }

  const item = await banco.lojaItem.create({
    data: { lojaId, nome, descricao, preco, estoque },
  });

  return NextResponse.json({ item }, { status: 201 });
}
