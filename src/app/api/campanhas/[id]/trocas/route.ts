import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Trocas de carta de Sapo de Chocolate (decisão #163) — completa a coleção
  da fatia 7, que já tinha comprar/abrir/colecionar, mas não trocar.

  Não passa por checagem de mestre: é ação de jogador pra jogador, só
  precisa estar participando da campanha. Toda troca visível (abertas)
  aparece pra qualquer um da mesa, não só pro dono da ficha ofertante —
  é assim que outro jogador descobre que existe uma oferta pra aceitar.
*/
export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const participo = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (!participo) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const trocas = await banco.trocaCarta.findMany({
    where: { campanhaId, estado: "aberta" },
    orderBy: { criadoEm: "desc" },
    include: { personagemOferta: { select: { id: true, nome: true, donoId: true } } },
  });

  return NextResponse.json({ trocas });
}

export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const corpo = await requisicao.json().catch(() => null);
  const personagemId = typeof corpo?.personagemId === "string" ? corpo.personagemId : null;
  const cartaOferecidaId = typeof corpo?.cartaOferecidaId === "string" ? corpo.cartaOferecidaId.trim() : "";
  const cartaDesejadaId = typeof corpo?.cartaDesejadaId === "string" ? corpo.cartaDesejadaId.trim() : "";
  if (!personagemId || !cartaOferecidaId || !cartaDesejadaId) {
    return NextResponse.json(
      { erro: "personagemId, cartaOferecidaId e cartaDesejadaId são obrigatórios" },
      { status: 400 },
    );
  }
  if (cartaOferecidaId === cartaDesejadaId) {
    return NextResponse.json({ erro: "não dá pra trocar uma carta por ela mesma" }, { status: 400 });
  }

  const personagem = await banco.personagem.findUnique({
    where: { id: personagemId },
    select: { id: true, donoId: true, campanhaId: true, dados: true },
  });
  if (!personagem || personagem.donoId !== usuario.id || personagem.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const album = (personagem.dados as Record<string, unknown> | null)?.album as
    | Record<string, number>
    | undefined;
  const quantidade = album?.[cartaOferecidaId] ?? 0;
  if (quantidade < 1) {
    return NextResponse.json({ erro: "você não tem essa carta pra oferecer" }, { status: 409 });
  }

  const troca = await banco.trocaCarta.create({
    data: { campanhaId, personagemOfertaId: personagemId, cartaOferecidaId, cartaDesejadaId },
    include: { personagemOferta: { select: { id: true, nome: true, donoId: true } } },
  });

  return NextResponse.json({ troca }, { status: 201 });
}
