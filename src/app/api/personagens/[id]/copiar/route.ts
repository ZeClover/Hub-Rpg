import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Copiar uma ficha (decisão #139, ideia #26 do pedido original) — cria uma
  ficha NOVA com os mesmos dados, pro mesmo sistema; a original continua
  intacta. Só o dono copia (é ele que nasce dono da cópia também) — mesma
  trava estrita do DELETE, nunca o mestre por aqui.

  `campanhaId` no corpo é opcional: null cria a cópia avulsa; um id de
  campanha do MESMO sistema já liga ela lá (e cria a Participacao se
  faltar, igual `POST /campanhas/[id]/entrar` já faz) — nunca converte
  pra outro sistema, exatamente como o pedido original marcou.

  `quantidade` no corpo é opcional (decisão #142, ideia #69 — "contador
  de grupos de inimigos iguais"): cria várias cópias de uma vez, útil pra
  botar "5 goblins iguais" na campanha sem repetir a ação cinco vezes.
  Cada monstro continua sendo uma ficha própria, com PV independente — só
  o nome vira "Nome (cópia N)", pra o Painel de Vida da Mesa ao Vivo
  conseguir agrupar visualmente quem tem o mesmo nome base.

  `compartilhado` e `status` não são copiados: a cópia nasce fechada
  (ninguém tem o link dela ainda) e ativa, começando do zero nesses dois
  pontos organizacionais em vez de herdar da original.
*/
const QUANTIDADE_MAXIMA = 20;

export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const original = await banco.personagem.findUnique({ where: { id } });
  if (!original || original.donoId !== usuario.id) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const campanhaId = typeof corpo?.campanhaId === "string" ? corpo.campanhaId : null;
  const quantidadeBruta = typeof corpo?.quantidade === "number" ? corpo.quantidade : 1;
  if (!Number.isInteger(quantidadeBruta) || quantidadeBruta < 1 || quantidadeBruta > QUANTIDADE_MAXIMA) {
    return NextResponse.json(
      { erro: `quantidade precisa ser um número inteiro entre 1 e ${QUANTIDADE_MAXIMA}` },
      { status: 400 },
    );
  }
  const quantidade = quantidadeBruta;

  if (campanhaId) {
    const campanha = await banco.campanha.findUnique({ where: { id: campanhaId } });
    if (!campanha) {
      return NextResponse.json({ erro: "campanha não encontrada" }, { status: 404 });
    }
    if (campanha.sistemaId !== original.sistemaId) {
      return NextResponse.json(
        { erro: "essa campanha é de outro sistema de regras" },
        { status: 400 },
      );
    }
  }

  const nomeCopia = (indice: number) =>
    quantidade === 1 ? `${original.nome} (cópia)` : `${original.nome} (cópia ${indice})`;

  // As criações vêm sempre primeiro no array — o upsert de participação
  // (quando existe) é sempre o último resultado, por isso `slice(0,
  // quantidade)` pega só as cópias de verdade, nunca o resultado dele.
  const resultados = await banco.$transaction([
    ...Array.from({ length: quantidade }, (_, indice) =>
      banco.personagem.create({
        data: {
          sistemaId: original.sistemaId,
          donoId: usuario.id,
          campanhaId,
          nome: nomeCopia(indice + 1),
          dados: original.dados as Prisma.InputJsonValue,
          ehMonstro: original.ehMonstro,
          avatarUrl: original.avatarUrl,
          bannerUrl: original.bannerUrl,
        },
        select: { id: true, nome: true },
      }),
    ),
    ...(campanhaId
      ? [
          banco.participacao.upsert({
            where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
            create: { campanhaId, usuarioId: usuario.id, papel: "JOGADOR" as const },
            update: {},
          }),
        ]
      : []),
  ]);
  const copias = resultados.slice(0, quantidade) as { id: string; nome: string }[];

  return NextResponse.json(
    quantidade === 1 ? { personagem: copias[0] } : { personagens: copias },
    { status: 201 },
  );
}
