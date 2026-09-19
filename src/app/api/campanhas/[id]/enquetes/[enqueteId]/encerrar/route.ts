import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; enqueteId: string }> };

/* Encerrar uma enquete (decisão #136) — só o mestre, e é uma via só: não existe reabrir. */
export async function PATCH(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, enqueteId } = await params;
  const enquete = await banco.enquete.findUnique({ where: { id: enqueteId } });
  if (!enquete || enquete.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const atualizada = await banco.enquete.update({
    where: { id: enqueteId },
    data: { encerrada: true },
    select: { id: true, encerrada: true },
  });

  return NextResponse.json({ enquete: atualizada });
}
