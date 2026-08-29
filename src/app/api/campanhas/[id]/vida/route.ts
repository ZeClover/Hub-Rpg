import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { lerResumoVida } from "@/lib/resumo-vida";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Lista de vida da campanha, pro Painel de Vida da Mesa ao Vivo — só o
  mestre lê (mesma trava de sempre: 404 pra quem não é mestre, não 403,
  decisão #13). Jogadores entram como leitura (é a própria ficha de cada
  um que decide o número, o mestre só acompanha); inimigos entram também
  com o `dados` inteiro, porque são do próprio mestre e o painel precisa
  disso pra montar o ajuste de vida sem outra ida ao servidor.
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
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const personagens = await banco.personagem.findMany({
    where: { campanhaId },
    select: { id: true, nome: true, donoId: true, dados: true },
  });

  const jogadores = personagens
    .filter((p) => p.donoId !== usuario.id)
    .map((p) => ({ id: p.id, nome: p.nome, resumoVida: lerResumoVida(p.dados) }));

  const inimigos = personagens
    .filter((p) => p.donoId === usuario.id)
    .map((p) => ({ id: p.id, nome: p.nome, resumoVida: lerResumoVida(p.dados) }));

  return NextResponse.json({ jogadores, inimigos });
}
