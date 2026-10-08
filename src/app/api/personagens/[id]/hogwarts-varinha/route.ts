import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import { avancarSintoniaVarinha, CAMPOS_SECRETOS_VARINHA, entregarVarinha, revelarCampoVarinha, type CampoSecretoVarinha, type DadosVarinhaHogwarts, type EntregaVarinha } from "@/lib/hogwarts/varinha";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const personagem = await banco.personagem.findUnique({
    where: { id },
    include: { sistema: { select: { chave: true } }, campanha: { select: { id: true } } },
  });
  if (!personagem?.campanhaId || personagem.sistema.chave !== "hogwarts-rpg" || personagem.ehMonstro) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId: personagem.campanhaId, usuarioId: usuario.id } },
    select: { papel: true },
  });
  if (!participacao || !["MESTRE", "MESTRE_AUXILIAR"].includes(participacao.papel)) {
    return NextResponse.json({ erro: "somente o Mestre entrega ou revela uma varinha" }, { status: 403 });
  }
  const corpo = await req.json().catch(() => null);
  const acao = corpo?.acao;
  const atuais = personagem.dados as DadosVarinhaHogwarts;
  let novos: DadosVarinhaHogwarts;
  let resumo: string;
  let detalhes: Prisma.InputJsonObject;
  try {
    if (acao === "entregar") {
      novos = entregarVarinha(atuais, (corpo?.varinha ?? {}) as EntregaVarinha);
      resumo = `${personagem.nome} recebeu uma varinha`;
      detalhes = { madeira: String(novos.varinha?.madeira), nucleo: String(novos.varinha?.nucleo), sintonia: 1 };
    } else if (acao === "avancar-sintonia") {
      novos = avancarSintoniaVarinha(atuais);
      resumo = `A Sintonia da varinha de ${personagem.nome} avançou para ${String(novos.varinha?.sintonia)}`;
      detalhes = { sintonia: Number(novos.varinha?.sintonia) };
    } else if (acao === "revelar") {
      const campo = corpo?.campo as CampoSecretoVarinha;
      if (!CAMPOS_SECRETOS_VARINHA.includes(campo)) throw new Error("Campo de revelação inválido.");
      novos = revelarCampoVarinha(atuais, campo);
      resumo = `Uma propriedade da varinha de ${personagem.nome} foi revelada`;
      detalhes = { campo };
    } else throw new Error("Ação de varinha inválida.");
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível atualizar a varinha." }, { status: 400 });
  }
  await garantirFundacaoHogwarts();
  const alterado = await banco.$transaction(async (tx) => {
    const resultado = await tx.personagem.updateMany({
      where: { id, atualizadoEm: personagem.atualizadoEm },
      data: { dados: novos as Prisma.InputJsonValue },
    });
    if (resultado.count !== 1) return false;
    await tx.eventoAuditoriaHogwarts.create({ data: {
      campanhaId: personagem.campanhaId!, personagemId: id, atorId: usuario.id,
      modulo: "varinha", acao: `varinha.${String(acao)}`, resumo, detalhes,
    } });
    return true;
  });
  if (!alterado) return NextResponse.json({ erro: "A ficha mudou durante a operação. Recarregue e tente novamente." }, { status: 409 });
  return NextResponse.json({ ok: true, varinha: novos.varinha });
}
