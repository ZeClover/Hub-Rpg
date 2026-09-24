import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar, ehMestreTitular } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; usuarioId: string }> };

/*
  Tirar um jogador da campanha — usada tanto pelo mestre (ou auxiliar)
  removendo alguém quanto pelo próprio jogador saindo por conta própria
  (mesma rota, dois jeitos de chegar nela).

  O mestre titular nunca pode ser removido por aqui: quem quiser encerrar
  a mesa de vez usa "Excluir campanha". Um mestre auxiliar só é removido
  pelo mestre titular (decisão #148) — outro auxiliar não pode tirar
  auxiliar, só o dono da campanha. A ficha do jogador removido não é
  apagada — só solta da campanha (campanhaId volta a null), pra ele
  continuar existindo como ficha avulsa.
*/
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, usuarioId: usuarioAlvo } = await params;

  const participacaoAlvo = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuarioAlvo } },
  });
  if (!participacaoAlvo) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (participacaoAlvo.papel === "MESTRE") {
    return NextResponse.json(
      { erro: "não dá pra remover o mestre da campanha" },
      { status: 400 },
    );
  }

  const souOAlvo = usuario.id === usuarioAlvo;
  let podeRemover = souOAlvo;
  if (!podeRemover) {
    podeRemover =
      participacaoAlvo.papel === "MESTRE_AUXILIAR"
        ? await ehMestreTitular(campanhaId, usuario.id)
        : await ehMestreOuAuxiliar(campanhaId, usuario.id);
  }
  if (!podeRemover) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.$transaction([
    banco.participacao.delete({
      where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuarioAlvo } },
    }),
    banco.personagem.updateMany({
      where: { campanhaId, donoId: usuarioAlvo },
      data: { campanhaId: null },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

/*
  Promover um jogador a mestre auxiliar, ou devolvê-lo a jogador comum
  (decisão #148) — só o mestre titular decide isso, nunca outro auxiliar.
  Nunca mexe em quem já é mestre (o alvo precisa já ser jogador ou
  auxiliar).
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, usuarioId: usuarioAlvo } = await params;
  if (!(await ehMestreTitular(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const participacaoAlvo = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuarioAlvo } },
  });
  if (!participacaoAlvo || participacaoAlvo.papel === "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const papel = corpo?.papel;
  if (papel !== "MESTRE_AUXILIAR" && papel !== "JOGADOR") {
    return NextResponse.json(
      { erro: "papel precisa ser MESTRE_AUXILIAR ou JOGADOR" },
      { status: 400 },
    );
  }

  const atualizada = await banco.participacao.update({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuarioAlvo } },
    data: { papel },
    select: { usuarioId: true, papel: true },
  });

  return NextResponse.json({ participacao: atualizada });
}
