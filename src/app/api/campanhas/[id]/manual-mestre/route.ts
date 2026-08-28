import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Salva o texto do Manual do Mestre. Só existe PATCH aqui de propósito: a
  leitura já vem junto com a página da campanha (que só busca esta coluna
  quando quem pede é mestre — decisão #13), não precisa de uma rota GET
  própria.
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  if (typeof corpo?.texto !== "string") {
    return NextResponse.json({ erro: "texto é obrigatório" }, { status: 400 });
  }

  await banco.campanha.update({
    where: { id: campanhaId },
    data: { manualMestre: corpo.texto },
  });

  return NextResponse.json({ ok: true });
}
