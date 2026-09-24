import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehPapelDeMestre } from "@/lib/permissao-mestre";
import { lerResumoVida } from "@/lib/resumo-vida";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Lista de vida da campanha, pro Painel de Vida da Mesa ao Vivo. Qualquer
  participante lê (decisão #137 abriu isto pra jogador também, em modo
  espectador — antes era só o mestre); quem não é participante nem chega
  a existir pra esta rota (404, não 403, decisão #13). A resposta nunca
  teve nada de privado dentro — só `{id, nome, resumoVida}` — então abrir
  a leitura pro jogador não vaza nada que o mestre não quisesse mostrar.

  Monstros só aparecem pra quem é o mestre-dono deles (continuam fora da
  visão do jogador, é informação de mestre por natureza, não por regra
  nova); jogador vê só o grupo "jogadores".

  Uma ficha de PERSONAGEM criada pelo mestre (`ehMonstro` desligado) entra
  no grupo de jogadores, não no de monstros — ela usa a mesma ficha de
  jogador, então o ajuste rápido de vida (que grava no formato da ficha de
  monstro, ver `campoVidaInimigo`) não se aplica a ela.
*/
export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (!participacao) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  const souMestre = ehPapelDeMestre(participacao.papel);

  const personagens = await banco.personagem.findMany({
    where: { campanhaId },
    select: { id: true, nome: true, donoId: true, ehMonstro: true, dados: true },
  });

  const jogadores = personagens
    .filter((p) => !(p.ehMonstro && (souMestre ? p.donoId === usuario.id : true)))
    .map((p) => ({ id: p.id, nome: p.nome, resumoVida: lerResumoVida(p.dados) }));

  const inimigos = souMestre
    ? personagens
        .filter((p) => p.donoId === usuario.id && p.ehMonstro)
        .map((p) => ({ id: p.id, nome: p.nome, resumoVida: lerResumoVida(p.dados) }))
    : [];

  return NextResponse.json({ jogadores, inimigos });
}
