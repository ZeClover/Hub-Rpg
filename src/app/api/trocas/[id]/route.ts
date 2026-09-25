import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/// Cancelar uma oferta aberta — só quem ofertou (dono da ficha) ou o
/// mestre da campanha (limpar oferta velha/errada da mesa).
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const troca = await banco.trocaCarta.findUnique({
    where: { id },
    include: { personagemOferta: { select: { donoId: true } } },
  });
  if (!troca || troca.estado !== "aberta") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const souOfertante = troca.personagemOferta.donoId === usuario.id;
  if (!souOfertante && !(await ehMestreOuAuxiliar(troca.campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.trocaCarta.update({ where: { id }, data: { estado: "cancelada" } });
  return NextResponse.json({ ok: true });
}
