import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; grupoId: string; personagemId: string }> };

/// Remover uma ficha de um grupo — só o mestre (decisão #147).
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, grupoId, personagemId } = await params;
  const grupo = await banco.grupo.findUnique({ where: { id: grupoId } });
  if (!grupo || grupo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.grupoMembro.deleteMany({ where: { grupoId, personagemId } });
  return NextResponse.json({ ok: true });
}
