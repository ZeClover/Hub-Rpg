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

  `compartilhado` e `status` não são copiados: a cópia nasce fechada
  (ninguém tem o link dela ainda) e ativa, começando do zero nesses dois
  pontos organizacionais em vez de herdar da original.
*/
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

  const [copia] = await banco.$transaction([
    banco.personagem.create({
      data: {
        sistemaId: original.sistemaId,
        donoId: usuario.id,
        campanhaId,
        nome: `${original.nome} (cópia)`,
        dados: original.dados as Prisma.InputJsonValue,
        ehMonstro: original.ehMonstro,
        avatarUrl: original.avatarUrl,
        bannerUrl: original.bannerUrl,
      },
      select: { id: true, nome: true },
    }),
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

  return NextResponse.json({ personagem: copia }, { status: 201 });
}
