import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; personagemId: string }> };

/*
  Soltar UMA ficha específica da campanha, sem sair da campanha inteira e
  sem apagar a ficha (decisão #133: um jogador pode ter duas ou mais fichas
  na mesma campanha, então "sair" e "soltar uma ficha" viraram ações
  diferentes — antes só existia a primeira, via
  `DELETE /campanhas/[id]/jogadores/[usuarioId]`, que solta TODAS as fichas
  do jogador de uma vez).

  Quem pode: o próprio dono da ficha, ou o mestre da campanha (mesma
  extensão de permissão da decisão #131 — o mestre já edita a ficha do
  jogador, faz sentido também poder tirá-la da mesa). Sempre 404 pra quem
  não pode, nunca 403 (decisão #13).
*/
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, personagemId } = await params;
  const personagem = await banco.personagem.findUnique({ where: { id: personagemId } });
  if (!personagem || personagem.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const souODono = personagem.donoId === usuario.id;
  const souMestre = souODono ? false : await ehMestreOuAuxiliar(campanhaId, usuario.id);
  if (!souODono && !souMestre) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.personagem.update({
    where: { id: personagemId },
    data: { campanhaId: null },
  });

  return NextResponse.json({ ok: true });
}
