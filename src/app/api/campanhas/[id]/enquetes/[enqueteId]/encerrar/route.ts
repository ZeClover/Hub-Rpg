import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; enqueteId: string }> };

/* Encerrar uma enquete (decisão #136) — só o mestre (ou auxiliar), e é uma via só: não existe reabrir. */
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

  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const atualizada = await banco.enquete.update({
    where: { id: enqueteId },
    data: { encerrada: true },
    select: { id: true, encerrada: true },
  });

  return NextResponse.json({ enquete: atualizada });
}
