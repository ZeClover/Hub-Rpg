import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Entrar numa campanha usando uma ficha que já é sua.

  O link de convite é só a URL da campanha (`/campanhas/[id]`) — não existe
  segredo separado, porque entrar não abre nada sozinho: exige estar logado
  e escolher uma ficha que seja realmente sua e do sistema certo. Isso é bem
  mais estrito que o link de leitura das fichas (decisão #46), que é
  propositalmente "qualquer um com o link".

  Só um personagem seu fica ligado à campanha por vez: entrar de novo com
  outra ficha troca qual delas está lá, em vez de acumular.
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const campanha = await banco.campanha.findUnique({ where: { id: campanhaId } });
  if (!campanha) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const personagemId = corpo?.personagemId;
  if (typeof personagemId !== "string") {
    return NextResponse.json({ erro: "personagemId é obrigatório" }, { status: 400 });
  }

  const personagem = await banco.personagem.findUnique({ where: { id: personagemId } });
  if (!personagem || personagem.donoId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (personagem.sistemaId !== campanha.sistemaId) {
    return NextResponse.json(
      { erro: "essa ficha é de outro sistema de regras" },
      { status: 400 },
    );
  }

  await banco.$transaction([
    banco.participacao.upsert({
      where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
      create: { campanhaId, usuarioId: usuario.id, papel: "JOGADOR" },
      update: {},
    }),
    // Solta qualquer outra ficha sua que estivesse ligada a esta campanha —
    // só uma por jogador de cada vez.
    banco.personagem.updateMany({
      where: { campanhaId, donoId: usuario.id, id: { not: personagemId } },
      data: { campanhaId: null },
    }),
    banco.personagem.update({
      where: { id: personagemId },
      data: { campanhaId },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
