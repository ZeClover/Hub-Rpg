import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Grupos/equipes dentro da campanha (decisão #147, ideia #58) — só
  organizacional ("esquadrão A", "os que ficaram na cidade"), não muda
  regra de sistema nenhuma. Só o mestre cria; qualquer participante lê
  (a lista de grupos chega junto da página da campanha).
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
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
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  if (!nome) {
    return NextResponse.json({ erro: "nome é obrigatório" }, { status: 400 });
  }

  const grupo = await banco.grupo.create({
    data: { campanhaId, nome },
    select: { id: true, nome: true },
  });

  return NextResponse.json({ grupo }, { status: 201 });
}
