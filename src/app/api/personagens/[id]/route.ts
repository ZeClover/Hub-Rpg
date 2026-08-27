import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { podeAcessarPersonagem } from "@/lib/dono-personagem";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Uma ficha específica: ler, salvar e apagar.

  Em qualquer um dos três verbos, a mesma pergunta é feita primeiro — o
  personagem existe e é desta pessoa? — antes de tocar em qualquer dado.
  Devolvemos 404 tanto para "não existe" quanto para "não é seu": dizer
  "403, mas existe" revelaria que a ficha de outra pessoa está ali.
*/
async function buscarSeFoiDono(id: string, idDoUsuario: string) {
  const personagem = await banco.personagem.findUnique({ where: { id } });
  if (!personagem || !podeAcessarPersonagem(idDoUsuario, personagem)) return null;
  return personagem;
}

export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const personagem = await buscarSeFoiDono(id, usuario.id);
  if (!personagem) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ personagem });
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarSeFoiDono(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  if (!corpo || typeof corpo.dados !== "object" || corpo.dados === null) {
    return NextResponse.json({ erro: "dados é obrigatório" }, { status: 400 });
  }

  // O nome da ficha segue o que a pessoa digitou dentro dela — não precisa
  // de um campo de nome separado em nenhuma tela do Hub.
  const nomeDentroDaFicha = corpo.dados?.perfil?.nome;
  const nome =
    typeof nomeDentroDaFicha === "string" && nomeDentroDaFicha.trim()
      ? nomeDentroDaFicha.trim()
      : existente.nome;

  const personagem = await banco.personagem.update({
    where: { id },
    data: { dados: corpo.dados, nome },
    select: { id: true, nome: true, atualizadoEm: true },
  });

  return NextResponse.json({ personagem });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarSeFoiDono(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.personagem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
