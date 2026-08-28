import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  O mestre cria uma ficha de inimigo/NPC direto na campanha.

  É uma ficha comum (mesmo `Personagem`, mesmo módulo de sistema, mesma
  tela de edição) — só nasce já com `campanhaId` preenchido e dono sendo o
  próprio mestre. Não existe um "tipo: inimigo" novo no banco: o que separa
  uma ficha de jogador de uma de inimigo, dentro de uma campanha, é só quem
  é a dona dela.
*/
export async function POST(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const campanha = await banco.campanha.findUnique({ where: { id: campanhaId } });
  if (!campanha) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const personagem = await banco.personagem.create({
    data: {
      sistemaId: campanha.sistemaId,
      donoId: usuario.id,
      campanhaId,
      nome: "Novo Inimigo",
      dados: {},
    },
    select: { id: true },
  });

  return NextResponse.json({ personagem }, { status: 201 });
}
