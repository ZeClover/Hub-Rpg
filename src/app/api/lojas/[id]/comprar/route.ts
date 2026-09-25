import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

class FalhaDeCompra extends Error {
  codigo: "esgotado" | "sem-galeoes";
  constructor(codigo: "esgotado" | "sem-galeoes") {
    super(codigo);
    this.codigo = codigo;
  }
}

/*
  Comprar um item da Loja (decisão #162) — a peça que "Item" (decisão
  #147) não resolvia: aqui existe preço, estoque e concorrência real.

  Fala a língua específica do Hogwarts RPG (decisão #17: nenhum sistema
  empresta a forma do `dados` de outro) — `dados.galeoes` e `dados.itens`
  são o formato daquela ficha. Um segundo sistema com loja precisaria de
  uma rota própria, ou de uma convenção reservada nova (como `_mestre` já
  é pra segredo) se um dia isso valer a pena generalizar.

  Duas condições precisam estar OK ao mesmo tempo pra compra passar:
  estoque (se não for infinito) e Galeões suficientes. As duas são
  aplicadas como UPDATE condicional direto no Postgres (WHERE ... >= ...),
  não como "ler, conferir em JavaScript, escrever" — é isso que faz dois
  jogadores comprando a última unidade ao mesmo tempo resultarem em UMA
  compra só, não duas (a segunda tentativa vê 0 linhas afetadas e falha
  com clareza, em vez de as duas passarem e o estoque ir negativo).
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: lojaId } = await params;
  const corpo = await requisicao.json().catch(() => null);
  const itemId = typeof corpo?.itemId === "string" ? corpo.itemId : null;
  const personagemId = typeof corpo?.personagemId === "string" ? corpo.personagemId : null;
  if (!itemId || !personagemId) {
    return NextResponse.json({ erro: "itemId e personagemId são obrigatórios" }, { status: 400 });
  }

  const loja = await banco.loja.findUnique({ where: { id: lojaId } });
  if (!loja || !loja.aberta) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const item = await banco.lojaItem.findUnique({ where: { id: itemId } });
  if (!item || item.lojaId !== lojaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  // Só o dono da ficha compra por ela, e ela precisa ser desta campanha —
  // as mesmas duas condições que já valem pra editar a ficha (decisão
  // #131 dá o mesmo direito ao mestre, mas comprar é ação de jogador; o
  // mestre entrega item pelo Modo Sessão ou editando a ficha direto).
  const personagem = await banco.personagem.findUnique({
    where: { id: personagemId },
    select: { id: true, donoId: true, campanhaId: true },
  });
  if (!personagem || personagem.donoId !== usuario.id || personagem.campanhaId !== loja.campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  try {
    const dados = await banco.$transaction(async (tx) => {
      if (item.estoque !== null) {
        const linhas = await tx.$executeRaw`
          UPDATE loja_itens SET estoque = estoque - 1
          WHERE id = ${itemId}::uuid AND estoque > 0
        `;
        // Falhou a condição do WHERE (estoque já era 0) — joga um erro em
        // vez de compensar manualmente: o `$transaction` desfaz sozinho
        // TUDO que essa função já tiver feito até aqui, então não existe
        // "estoque reservado que ficou pendurado" pra desfazer na mão.
        if (linhas === 0) throw new FalhaDeCompra("esgotado");
      }

      const novoItem = JSON.stringify([
        {
          id: randomUUID(),
          nome: item.nome,
          raridade: "Comum",
          local: "Carregado",
          quantidade: 1,
          descricao: item.descricao ?? "",
          confiscado: false,
          confiscadoPor: "",
          confiscadoMotivo: "",
        },
      ]);

      const linhas = await tx.$queryRaw<{ dados: Prisma.JsonValue }[]>`
        UPDATE personagens
        SET dados = jsonb_set(
          jsonb_set(
            COALESCE(dados, '{}'::jsonb),
            '{galeoes}',
            to_jsonb(COALESCE((dados->>'galeoes')::int, 0) - ${item.preco})
          ),
          '{itens}',
          COALESCE(dados->'itens', '[]'::jsonb) || ${novoItem}::jsonb
        )
        WHERE id = ${personagemId}::uuid
          AND COALESCE((dados->>'galeoes')::int, 0) >= ${item.preco}
        RETURNING dados
      `;
      if (linhas.length === 0) throw new FalhaDeCompra("sem-galeoes");

      await tx.lojaCompra.create({
        data: { lojaId, lojaItemId: itemId, personagemId, nomeItem: item.nome, preco: item.preco },
      });

      return linhas[0].dados;
    });

    return NextResponse.json({ dados });
  } catch (e) {
    if (e instanceof FalhaDeCompra) {
      const mensagem = e.codigo === "esgotado" ? "esgotado — alguém levou a última unidade" : "Galeões insuficientes";
      return NextResponse.json({ erro: mensagem }, { status: 409 });
    }
    console.error("Falha ao comprar item da loja", e);
    return NextResponse.json({ erro: "falha ao processar a compra" }, { status: 500 });
  }
}
