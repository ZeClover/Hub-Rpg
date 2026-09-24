import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; grupoId: string }> };

/// Adicionar uma ficha da campanha a um grupo — só o mestre (decisão #147).
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, grupoId } = await params;
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

  const corpo = await requisicao.json().catch(() => null);
  const personagemId = typeof corpo?.personagemId === "string" ? corpo.personagemId : "";
  if (!personagemId) {
    return NextResponse.json({ erro: "personagemId é obrigatório" }, { status: 400 });
  }

  const personagem = await banco.personagem.findUnique({ where: { id: personagemId } });
  if (!personagem || personagem.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "ficha não é desta campanha" }, { status: 400 });
  }

  const membro = await banco.grupoMembro.upsert({
    where: { grupoId_personagemId: { grupoId, personagemId } },
    create: { grupoId, personagemId },
    update: {},
    select: { id: true, personagemId: true },
  });

  return NextResponse.json({ membro }, { status: 201 });
}
