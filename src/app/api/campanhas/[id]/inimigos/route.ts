import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  O mestre cria uma ficha de monstro (bestiário) direto na campanha.

  É uma ficha comum (mesmo `Personagem`, mesmo módulo de sistema, mesma
  tela de edição) — só nasce já com `campanhaId` preenchido, dono sendo o
  próprio mestre e `ehMonstro` ligado (é isso que diferencia dela de uma
  ficha de personagem também criada pelo mestre — ver a rota irmã
  `personagens/route.ts`).
*/
export async function POST(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const campanha = await banco.campanha.findUnique({ where: { id: campanhaId } });
  if (!campanha) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const personagem = await banco.personagem.create({
    data: {
      sistemaId: campanha.sistemaId,
      donoId: usuario.id,
      campanhaId,
      nome: "Novo Monstro",
      dados: {},
      ehMonstro: true,
    },
    select: { id: true },
  });

  return NextResponse.json({ personagem }, { status: 201 });
}
