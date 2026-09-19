import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import {
  escreverNoCaminho,
  lerResumoVida,
  vidaComDelta,
  vidaDefinida,
  type ResumoVida,
} from "@/lib/resumo-vida";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; personagemId: string }> };

/*
  Ajusta a vida de um MONSTRO pelo Painel de Vida da Mesa ao Vivo, sem
  precisar abrir a ficha inteira. Só funciona em cima de fichas de monstro
  (`ehMonstro` ligado, e o mestre é o dono delas) — vida de jogador, e
  também de ficha de PERSONAGEM que o mestre criou (mesma estrutura de
  ficha de jogador), o mestre só acompanha, nunca edita por aqui (decisão
  #46). É por isso: o "campo de verdade" que este ajuste escreve
  (`campoVidaInimigo`) segue o formato da ficha de monstro, que não é o
  mesmo formato da ficha de jogador/personagem.

  Aceita quatro formatos de corpo (decisão #137 acrescentou os três
  últimos ao `delta` que já existia — "aplicar dano"/"cura" continuam
  sendo só um delta positivo ou negativo, não precisou de ação própria):
  `{ delta }` (ajuste relativo), `{ definir }` (valor absoluto, travado em
  [0, máxima]), `{ zerar: true }`, `{ restaurar: true }`. `{ derrotado }`
  é ortogonal a esses quatro — só liga/desliga a marca, sem mexer no
  número de vida (tem sistema que trata "derrotado" e "zero" como coisas
  diferentes) — pode vir sozinho ou junto de um dos quatro acima.

  Escreve em dois lugares: `dados.resumoVida` (o espelho genérico que este
  painel lê) e, quando o número de vida muda, o campo "de verdade" daquele
  sistema (via `campoVidaInimigo`, em `sistemas.ts`) — pra quem abrir a
  ficha de inimigo depois ver o mesmo número, não um valor desatualizado.
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
  const acao = interpretarAcao(corpo);
  if (!acao) {
    return NextResponse.json(
      { erro: "delta, definir, zerar, restaurar ou derrotado é obrigatório" },
      { status: 400 },
    );
  }

  const personagem = await banco.personagem.findUnique({
    where: { id: personagemId },
    select: { id: true, campanhaId: true, donoId: true, ehMonstro: true, sistemaId: true, dados: true },
  });
  // Um monstro só é ajustável por aqui se pertencer a esta campanha, ao
  // mestre que está pedindo, e for mesmo do tipo monstro — as mesmas
  // condições que valem pra "+ Criar ficha de monstro" criar uma. Uma
  // ficha de personagem do mestre (`ehMonstro` desligado) cai fora daqui.
  if (
    !personagem ||
    personagem.campanhaId !== campanhaId ||
    personagem.donoId !== usuario.id ||
    !personagem.ehMonstro
  ) {
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

  const novoAtual = acao.mudaNumero ? acao.calcular(resumoAtual) : resumoAtual.atual;
  const novoResumo: ResumoVida = {
    ...resumoAtual,
    atual: novoAtual,
    ...(acao.derrotado !== undefined ? { derrotado: acao.derrotado } : {}),
  };

  const dados = { ...(personagem.dados as Record<string, unknown>) };
  dados.resumoVida = novoResumo;
  if (acao.mudaNumero && caminho) escreverNoCaminho(dados, caminho, novoAtual);

  await banco.personagem.update({
    where: { id: personagemId },
    data: { dados: dados as Prisma.InputJsonObject },
  });

  return NextResponse.json({ resumoVida: novoResumo });
}

type Acao =
  | { mudaNumero: true; calcular: (resumo: ResumoVida) => number; derrotado?: boolean }
  | { mudaNumero: false; derrotado?: boolean };

function interpretarAcao(corpo: unknown): Acao | null {
  const c = (corpo ?? {}) as Record<string, unknown>;
  const derrotado = typeof c.derrotado === "boolean" ? c.derrotado : undefined;

  if (typeof c.delta === "number" && Number.isFinite(c.delta)) {
    const delta = c.delta;
    return { mudaNumero: true, calcular: (resumo) => vidaComDelta(resumo, delta), derrotado };
  }
  if (typeof c.definir === "number" && Number.isFinite(c.definir)) {
    const valor = c.definir;
    return { mudaNumero: true, calcular: (resumo) => vidaDefinida(resumo, valor), derrotado };
  }
  if (c.zerar === true) {
    return { mudaNumero: true, calcular: (resumo) => vidaDefinida(resumo, 0), derrotado };
  }
  if (c.restaurar === true) {
    return { mudaNumero: true, calcular: (resumo) => vidaDefinida(resumo, resumo.maxima), derrotado };
  }
  if (derrotado !== undefined) {
    return { mudaNumero: false, derrotado };
  }
  return null;
}
