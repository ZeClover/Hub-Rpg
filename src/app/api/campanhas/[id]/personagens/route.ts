import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  O mestre cria uma ficha de PERSONAGEM completa direto na campanha — mesma
  ficha de jogador do sistema, útil pra um NPC importante (aliado, mentor)
  que precisa das regras completas, não só de um bestiário.

  Rota irmã de `inimigos/route.ts`: mesmo `Personagem`, mesmo módulo de
  sistema, só muda o nome padrão e `ehMonstro` fica desligado.
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
      nome: "Novo Personagem",
      dados: {},
      ehMonstro: false,
    },
    select: { id: true },
  });

  return NextResponse.json({ personagem }, { status: 201 });
}
