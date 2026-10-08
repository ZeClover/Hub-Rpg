import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import type { DadosCriacaoHogwarts } from "@/lib/hogwarts/criacao";
import { aplicarProgressaoHogwarts, type EscolhasProgressaoHogwarts } from "@/lib/hogwarts/progressao";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const personagem = await banco.personagem.findUnique({
    where: { id }, include: { sistema: { select: { chave: true } } },
  });
  if (!personagem || personagem.donoId !== usuario.id || personagem.sistema.chave !== "hogwarts-rpg" || personagem.ehMonstro) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  const corpo = await req.json().catch(() => null);
  const escolhas = (corpo?.escolhas && typeof corpo.escolhas === "object" ? corpo.escolhas : {}) as EscolhasProgressaoHogwarts;
  const dadosAtuais = personagem.dados as DadosCriacaoHogwarts;
  const dadosParaEvoluir = dadosAtuais.academico?.criacaoVersao == null
    ? { ...dadosAtuais, academico: { ...(dadosAtuais.academico ?? {}), criacaoVersao: 0, criacaoFinalizada: true } }
    : dadosAtuais;
  let novos: DadosCriacaoHogwarts;
  try {
    novos = aplicarProgressaoHogwarts(dadosParaEvoluir, escolhas);
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Escolhas inválidas." }, { status: 400 });
  }
  if (personagem.campanhaId) await garantirFundacaoHogwarts();
  const alterado = await banco.$transaction(async (tx) => {
    const resultado = await tx.personagem.updateMany({
      where: { id, atualizadoEm: personagem.atualizadoEm },
      data: { dados: novos as Prisma.InputJsonValue },
    });
    if (resultado.count !== 1) return false;
    if (personagem.campanhaId) await tx.eventoAuditoriaHogwarts.create({ data: {
      campanhaId: personagem.campanhaId, personagemId: id, atorId: usuario.id,
      modulo: "progressao", acao: "nivel.avancar",
      resumo: `${personagem.nome} avançou para o nível ${String(novos.nivel)}`,
      detalhes: {
        nivelAnterior: Number((personagem.dados as DadosCriacaoHogwarts | null)?.nivel ?? 1),
        nivelNovo: Number(novos.nivel),
        escolhas: escolhas as Prisma.InputJsonObject,
      },
    } });
    return true;
  });
  if (!alterado) return NextResponse.json({ erro: "A ficha mudou durante a evolução. Reabra o guia e revise as escolhas." }, { status: 409 });
  return NextResponse.json({ ok: true, dados: novos });
}
