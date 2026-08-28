import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; usuarioId: string }> };

/*
  Tirar um jogador da campanha — usada tanto pelo mestre removendo alguém
  quanto pelo próprio jogador saindo por conta própria (mesma rota, dois
  jeitos de chegar nela).

  O mestre nunca pode ser removido por aqui: quem quiser encerrar a mesa
  de vez usa "Excluir campanha". A ficha do jogador removido não é
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
  let souMestre = false;
  if (!souOAlvo) {
    const minhaParticipacao = await banco.participacao.findUnique({
      where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
    });
    souMestre = minhaParticipacao?.papel === "MESTRE";
  }
  if (!souOAlvo && !souMestre) {
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
