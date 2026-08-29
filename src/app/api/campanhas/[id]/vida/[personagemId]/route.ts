import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { escreverNoCaminho, lerResumoVida, vidaComDelta } from "@/lib/resumo-vida";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; personagemId: string }> };

/*
  Ajusta a vida de um INIMIGO pelo Painel de Vida da Mesa ao Vivo, sem
  precisar abrir a ficha inteira. Só funciona em cima de fichas de inimigo
  (o mestre é o dono delas) — vida de jogador o mestre só acompanha, nunca
  edita por aqui (decisão #46).

  Escreve em dois lugares: `dados.resumoVida.atual` (o espelho genérico que
  este painel lê) e o campo "de verdade" daquele sistema (via
  `campoVidaInimigo`, em `sistemas.ts`) — pra quem abrir a ficha de inimigo
  depois ver o mesmo número, não um valor desatualizado.
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, personagemId } = await params;
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const delta = corpo?.delta;
  if (typeof delta !== "number" || !Number.isFinite(delta)) {
    return NextResponse.json({ erro: "delta é obrigatório" }, { status: 400 });
  }

  const personagem = await banco.personagem.findUnique({
    where: { id: personagemId },
    select: { id: true, campanhaId: true, donoId: true, sistemaId: true, dados: true },
  });
  // Um inimigo só é ajustável por aqui se pertencer a esta campanha e ao
  // mestre que está pedindo — as duas mesmas condições que valem pra
  // "+ Adicionar ficha de inimigo" criar uma.
  if (!personagem || personagem.campanhaId !== campanhaId || personagem.donoId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const resumoAtual = lerResumoVida(personagem.dados);
  if (!resumoAtual) {
    return NextResponse.json(
      { erro: "esta ficha ainda não tem vida configurada — abra-a uma vez pra calcular" },
      { status: 409 },
    );
  }

  const sistema = await banco.sistema.findUnique({ where: { id: personagem.sistemaId } });
  const definicao = SISTEMAS.find((s) => s.chave === sistema?.chave);
  const caminho = definicao?.campoVidaInimigo ?? null;

  const novoAtual = vidaComDelta(resumoAtual, delta);
  const dados = { ...(personagem.dados as Record<string, unknown>) };
  dados.resumoVida = { ...resumoAtual, atual: novoAtual };
  if (caminho) escreverNoCaminho(dados, caminho, novoAtual);

  await banco.personagem.update({
    where: { id: personagemId },
    data: { dados: dados as Prisma.InputJsonObject },
  });

  return NextResponse.json({ resumoVida: dados.resumoVida });
}
