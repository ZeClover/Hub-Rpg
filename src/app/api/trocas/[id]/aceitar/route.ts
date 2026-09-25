import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

class FalhaDeTroca extends Error {
  codigo: "sem-carta-ofertante" | "sem-carta-aceitante";
  constructor(codigo: "sem-carta-ofertante" | "sem-carta-aceitante") {
    super(codigo);
    this.codigo = codigo;
  }
}

/*
  Aceitar uma troca (decisão #163) — move uma carta de cada álbum pro
  outro, atomicamente. Mesmo desenho da compra na Loja (decisão #162):
  cada lado da troca é um UPDATE condicionado ("só desconta se ainda
  tiver a carta"), não "ler em JS, decidir, escrever" — evita a mesma
  ficha aceitar duas trocas ao mesmo tempo e ficar com o álbum negativo,
  ou o ofertante já ter gastado a carta noutra troca enquanto esta ainda
  aparecia como aberta pra outro jogador.

  Os dois `jsonb_set` aninhados existem porque o caminho tem dois níveis
  (`album.<idDaCarta>`) — `jsonb_set` só cria automaticamente o ÚLTIMO
  elemento do caminho; se `album` ainda não existisse dentro de `dados`,
  o `jsonb_set` de fora garante que ele existe antes do de dentro mexer
  numa carta específica.
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: trocaId } = await params;
  const corpo = await requisicao.json().catch(() => null);
  const personagemId = typeof corpo?.personagemId === "string" ? corpo.personagemId : null;
  if (!personagemId) {
    return NextResponse.json({ erro: "personagemId é obrigatório" }, { status: 400 });
  }

  const troca = await banco.trocaCarta.findUnique({ where: { id: trocaId } });
  if (!troca || troca.estado !== "aberta") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (troca.personagemOfertaId === personagemId) {
    return NextResponse.json({ erro: "não dá pra aceitar a própria oferta" }, { status: 400 });
  }

  const personagem = await banco.personagem.findUnique({
    where: { id: personagemId },
    select: { id: true, donoId: true, campanhaId: true },
  });
  if (!personagem || personagem.donoId !== usuario.id || personagem.campanhaId !== troca.campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  try {
    await banco.$transaction(async (tx) => {
      const decOfertante = await tx.$executeRaw`
        UPDATE personagens
        SET dados = jsonb_set(
          jsonb_set(dados, '{album}', COALESCE(dados->'album', '{}'::jsonb)),
          ARRAY['album', ${troca.cartaOferecidaId}]::text[],
          to_jsonb(COALESCE((dados->'album'->>${troca.cartaOferecidaId})::int, 0) - 1)
        )
        WHERE id = ${troca.personagemOfertaId}::uuid
          AND COALESCE((dados->'album'->>${troca.cartaOferecidaId})::int, 0) >= 1
      `;
      if (decOfertante === 0) throw new FalhaDeTroca("sem-carta-ofertante");

      const decAceitante = await tx.$executeRaw`
        UPDATE personagens
        SET dados = jsonb_set(
          jsonb_set(dados, '{album}', COALESCE(dados->'album', '{}'::jsonb)),
          ARRAY['album', ${troca.cartaDesejadaId}]::text[],
          to_jsonb(COALESCE((dados->'album'->>${troca.cartaDesejadaId})::int, 0) - 1)
        )
        WHERE id = ${personagemId}::uuid
          AND COALESCE((dados->'album'->>${troca.cartaDesejadaId})::int, 0) >= 1
      `;
      if (decAceitante === 0) throw new FalhaDeTroca("sem-carta-aceitante");

      await tx.$executeRaw`
        UPDATE personagens
        SET dados = jsonb_set(
          jsonb_set(dados, '{album}', COALESCE(dados->'album', '{}'::jsonb)),
          ARRAY['album', ${troca.cartaDesejadaId}]::text[],
          to_jsonb(COALESCE((dados->'album'->>${troca.cartaDesejadaId})::int, 0) + 1)
        )
        WHERE id = ${troca.personagemOfertaId}::uuid
      `;
      await tx.$executeRaw`
        UPDATE personagens
        SET dados = jsonb_set(
          jsonb_set(dados, '{album}', COALESCE(dados->'album', '{}'::jsonb)),
          ARRAY['album', ${troca.cartaOferecidaId}]::text[],
          to_jsonb(COALESCE((dados->'album'->>${troca.cartaOferecidaId})::int, 0) + 1)
        )
        WHERE id = ${personagemId}::uuid
      `;

      await tx.trocaCarta.update({
        where: { id: trocaId },
        data: { estado: "aceita", personagemAceitouId: personagemId },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof FalhaDeTroca) {
      const mensagem =
        e.codigo === "sem-carta-ofertante"
          ? "quem ofertou não tem mais essa carta — a oferta já era"
          : "você não tem a carta que essa troca pede";
      return NextResponse.json({ erro: mensagem }, { status: 409 });
    }
    console.error("Falha ao aceitar troca", e);
    return NextResponse.json({ erro: "falha ao processar a troca" }, { status: 500 });
  }
}
