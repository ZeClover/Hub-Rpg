import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

/*
  Lista e cria personagens da conta logada.

  A ficha (arquivo único em /public) fala com estas rotas por `fetch`, do
  mesmo jeito que qualquer página do Hub falaria — mesma origem, mesmo
  cookie de sessão. Nenhum dado de outra pessoa passa por aqui: toda consulta
  já nasce filtrada por `donoId: usuario.id` (decisão #13).
*/

export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const personagens = await banco.personagem.findMany({
    where: { donoId: usuario.id },
    orderBy: { atualizadoEm: "desc" },
    select: {
      id: true,
      nome: true,
      atualizadoEm: true,
      sistema: { select: { chave: true, nome: true } },
    },
  });

  return NextResponse.json({ personagens });
}

export async function POST(requisicao: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const sistemaChave = corpo?.sistemaChave;
  if (typeof sistemaChave !== "string") {
    return NextResponse.json({ erro: "sistemaChave é obrigatório" }, { status: 400 });
  }

  const sistema = await banco.sistema.findUnique({ where: { chave: sistemaChave } });
  if (!sistema) {
    return NextResponse.json({ erro: "sistema desconhecido" }, { status: 404 });
  }

  const personagem = await banco.personagem.create({
    data: {
      sistemaId: sistema.id,
      donoId: usuario.id,
      nome: "Novo Personagem",
      dados: {},
    },
    select: { id: true, nome: true, dados: true },
  });

  return NextResponse.json({ personagem }, { status: 201 });
}
