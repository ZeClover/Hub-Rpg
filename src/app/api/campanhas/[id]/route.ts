import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Excluir a campanha inteira. Só o mestre pode.

  As fichas ligadas a ela (de jogador ou de inimigo) não são apagadas —
  ficam soltas, campanhaId volta a null, exatamente como qualquer ficha
  nasce fora de campanha nenhuma (migração 0006 corrigiu o vínculo do
  banco pra isso funcionar assim). Participações e sessões da campanha,
  essas sim, somem junto — não fazem sentido sem a campanha.
*/
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
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

  await banco.campanha.delete({ where: { id: campanhaId } });
  return NextResponse.json({ ok: true });
}
