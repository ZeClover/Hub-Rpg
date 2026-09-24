import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Companheiro/pet como vínculo entre fichas já existentes (decisão #147,
  ideia #56) — não cria um tipo de ficha novo, só liga duas fichas que já
  existem. Por simplicidade e segurança, as duas fichas do vínculo
  precisam ser suas: dá pra ligar uma ficha de campanha diferente ou de
  outro sistema, contanto que ambas sejam sua propriedade.
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: personagemId } = await params;
  const corpo = await requisicao.json().catch(() => null);
  const companheiroId = typeof corpo?.companheiroId === "string" ? corpo.companheiroId : "";
  if (!companheiroId || companheiroId === personagemId) {
    return NextResponse.json({ erro: "companheiroId inválido" }, { status: 400 });
  }

  const [dono, companheiro] = await Promise.all([
    banco.personagem.findUnique({ where: { id: personagemId } }),
    banco.personagem.findUnique({ where: { id: companheiroId } }),
  ]);
  if (!dono || dono.donoId !== usuario.id || !companheiro || companheiro.donoId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const vinculo = await banco.companheiro.upsert({
    where: { personagemId_companheiroId: { personagemId, companheiroId } },
    create: { personagemId, companheiroId },
    update: {},
    select: { id: true, companheiroId: true },
  });

  return NextResponse.json({ vinculo }, { status: 201 });
}
