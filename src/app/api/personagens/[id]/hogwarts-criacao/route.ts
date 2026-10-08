import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import { errosCriacaoHogwarts, finalizarCriacaoHogwarts, type DadosCriacaoHogwarts } from "@/lib/hogwarts/criacao";
import { usuarioAtual } from "@/lib/usuario";
import type { Prisma } from "@prisma/client";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const personagem = await banco.personagem.findUnique({
    where: { id },
    include: { sistema: { select: { chave: true } } },
  });
  if (!personagem || personagem.donoId !== usuario.id || personagem.sistema.chave !== "hogwarts-rpg" || personagem.ehMonstro) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  const atuais = personagem.dados as DadosCriacaoHogwarts;
  if (atuais.academico?.criacaoFinalizada === true) {
    return NextResponse.json({ erro: "a criação deste personagem já foi concluída" }, { status: 409 });
  }
  const corpo = await req.json().catch(() => null);
  const recebidos = (corpo?.dados && typeof corpo.dados === "object" ? corpo.dados : {}) as DadosCriacaoHogwarts;
  const perfilRecebido = recebidos.perfil ?? {};
  const dados: DadosCriacaoHogwarts = {
    ...atuais,
    perfil: {
      ...(atuais.perfil ?? {}),
      nome: perfilRecebido.nome,
      casa: perfilRecebido.casa,
      tradicao: perfilRecebido.tradicao,
    },
    atributos: recebidos.atributos,
    pericias: recebidos.pericias,
  };
  const erros = errosCriacaoHogwarts(dados);
  if (erros.length) return NextResponse.json({ erro: "Revise a criação.", erros }, { status: 400 });
  const finalizados = finalizarCriacaoHogwarts(dados);
  if (personagem.campanhaId) await garantirFundacaoHogwarts();
  const salvo = await banco.$transaction(async (tx) => {
    const atualizado = await tx.personagem.update({
      where: { id },
      data: { nome: String(finalizados.perfil?.nome), dados: finalizados as Prisma.InputJsonValue },
      select: { dados: true },
    });
    if (personagem.campanhaId) await tx.eventoAuditoriaHogwarts.create({ data: {
      campanhaId: personagem.campanhaId,
      personagemId: id,
      atorId: usuario.id,
      modulo: "criacao",
      acao: "personagem.finalizado",
      resumo: `${String(finalizados.perfil?.nome)} concluiu a criação guiada`,
      detalhes: { casa: finalizados.perfil?.casa, tradicao: finalizados.perfil?.tradicao },
    } });
    return atualizado;
  });
  return NextResponse.json({ ok: true, dados: salvo.dados });
}
