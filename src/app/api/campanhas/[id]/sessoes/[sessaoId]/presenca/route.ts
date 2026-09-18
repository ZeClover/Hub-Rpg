import { RespostaPresenca } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; sessaoId: string }> };

const RESPOSTAS_VALIDAS = Object.values(RespostaPresenca);

/*
  Confirmar presença numa sessão (decisão #135) — Vou/Talvez/Não vou.
  Qualquer participante da campanha responde pela própria conta só (nunca
  pela de outra pessoa — não existe campo `usuarioId` no corpo, é sempre
  quem está logado). `upsert` porque a pessoa pode mudar de ideia depois.
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, sessaoId } = await params;
  const sessao = await banco.sessao.findUnique({ where: { id: sessaoId } });
  if (!sessao || sessao.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (!participacao) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const respostaBruta = corpo?.resposta;
  if (
    typeof respostaBruta !== "string" ||
    !RESPOSTAS_VALIDAS.includes(respostaBruta as RespostaPresenca)
  ) {
    return NextResponse.json({ erro: "resposta inválida" }, { status: 400 });
  }
  const resposta = respostaBruta as RespostaPresenca;

  const presenca = await banco.sessaoPresenca.upsert({
    where: { sessaoId_usuarioId: { sessaoId, usuarioId: usuario.id } },
    create: { sessaoId, usuarioId: usuario.id, resposta },
    update: { resposta },
    select: { resposta: true, respondidoEm: true },
  });

  return NextResponse.json({ presenca });
}
