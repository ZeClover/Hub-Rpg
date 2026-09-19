import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

/*
  Resolve um código curto de convite (decisão #138) pro id da campanha —
  mesma segurança do link de convite de sempre: quem tem o código consegue
  exatamente o que quem tem o link consegue (decisão #46). Não é preciso
  já ser participante pra perguntar, só pra logado: é assim que alguém
  entra numa campanha pela primeira vez.
*/
export async function POST(requisicao: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const codigo = typeof corpo?.codigo === "string" ? corpo.codigo.trim().toUpperCase() : "";
  if (!codigo) {
    return NextResponse.json({ erro: "código é obrigatório" }, { status: 400 });
  }

  const campanha = await banco.campanha.findUnique({
    where: { codigoConvite: codigo },
    select: { id: true },
  });
  if (!campanha) {
    return NextResponse.json({ erro: "código não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ campanhaId: campanha.id });
}
