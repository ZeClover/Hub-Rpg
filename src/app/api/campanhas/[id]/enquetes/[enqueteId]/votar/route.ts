import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; enqueteId: string }> };

/*
  Votar numa enquete (decisão #136) — qualquer participante, uma vez por
  enquete (`upsert`: votar de novo troca a resposta, não soma outro voto).
  Fechada não aceita voto novo nem troca.
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
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
  if (!participacao) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  if (enquete.encerrada) {
    return NextResponse.json({ erro: "enquete encerrada" }, { status: 400 });
  }

  const opcaoIndex = corpoParaIndice(await requisicao.json().catch(() => null), enquete.opcoes.length);
  if (opcaoIndex === null) {
    return NextResponse.json({ erro: "opcaoIndex inválido" }, { status: 400 });
  }

  const voto = await banco.enqueteVoto.upsert({
    where: { enqueteId_usuarioId: { enqueteId, usuarioId: usuario.id } },
    create: { enqueteId, usuarioId: usuario.id, opcaoIndex },
    update: { opcaoIndex },
    select: { opcaoIndex: true },
  });

  return NextResponse.json({ voto });
}

function corpoParaIndice(corpo: unknown, totalOpcoes: number): number | null {
  const bruto = (corpo as { opcaoIndex?: unknown } | null)?.opcaoIndex;
  if (typeof bruto !== "number" || !Number.isInteger(bruto)) return null;
  if (bruto < 0 || bruto >= totalOpcoes) return null;
  return bruto;
}
