import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; sessaoId: string }> };

/*
  Editar/apagar uma sessão — só o mestre da campanha (mesma checagem nas
  duas rotas). `notasMestre` é o único campo que nunca deveria chegar ao
  navegador de um jogador (decisão #13) — como quem edita já é
  necessariamente o mestre, não precisa de filtro extra na resposta.
*/
async function souMestreDaCampanha(campanhaId: string, usuarioId: string) {
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
  return participacao?.papel === "MESTRE";
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, sessaoId } = await params;
  const sessao = await banco.sessao.findUnique({ where: { id: sessaoId } });
  if (!sessao || sessao.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await souMestreDaCampanha(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const data = typeof corpo?.data === "string" ? new Date(corpo.data) : null;
  const temData = data !== null && !Number.isNaN(data.getTime());
  const temResumo = typeof corpo?.resumoPublico === "string" || corpo?.resumoPublico === null;
  const temMudancas =
    typeof corpo?.mudancasImportantes === "string" || corpo?.mudancasImportantes === null;
  const temNotas = typeof corpo?.notasMestre === "string" || corpo?.notasMestre === null;
  if (!temData && !temResumo && !temMudancas && !temNotas) {
    return NextResponse.json(
      { erro: "data, resumoPublico, mudancasImportantes ou notasMestre é obrigatório" },
      { status: 400 },
    );
  }

  const atualizada = await banco.sessao.update({
    where: { id: sessaoId },
    data: {
      ...(temData ? { data: data as Date } : {}),
      ...(temResumo ? { resumoPublico: corpo.resumoPublico } : {}),
      ...(temMudancas ? { mudancasImportantes: corpo.mudancasImportantes } : {}),
      ...(temNotas ? { notasMestre: corpo.notasMestre } : {}),
    },
    select: {
      id: true,
      numero: true,
      data: true,
      resumoPublico: true,
      mudancasImportantes: true,
      notasMestre: true,
    },
  });

  return NextResponse.json({ sessao: atualizada });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, sessaoId } = await params;
  const sessao = await banco.sessao.findUnique({ where: { id: sessaoId } });
  if (!sessao || sessao.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await souMestreDaCampanha(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.sessao.delete({ where: { id: sessaoId } });
  return NextResponse.json({ ok: true });
}
