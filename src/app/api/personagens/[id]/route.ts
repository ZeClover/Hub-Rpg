import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { podeAcessarPersonagem } from "@/lib/dono-personagem";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Uma ficha específica: ler, salvar e apagar.

  Em qualquer um dos três verbos, a mesma pergunta é feita primeiro — o
  personagem existe e é desta pessoa? — antes de tocar em qualquer dado.
  Devolvemos 404 tanto para "não existe" quanto para "não é seu": dizer
  "403, mas existe" revelaria que a ficha de outra pessoa está ali.
*/
async function buscarSeFoiDono(id: string, idDoUsuario: string) {
  const personagem = await banco.personagem.findUnique({ where: { id } });
  if (!personagem || !podeAcessarPersonagem(idDoUsuario, personagem)) return null;
  return personagem;
}

/*
  Ler não exige ser o dono, por dois motivos possíveis:

  1. A ficha está com "compartilhado" ligado — quem tem o link entra em modo
     leitura, com ou sem conta (o id, um UUID, é o segredo do link, igual
     "qualquer um com o link" do Google Docs).
  2. Quem pergunta é o mestre da campanha à qual esta ficha está ligada —
     por isso busca as campanhas onde a pessoa é mestre só quando ela não é
     a dona: a leitura mais comum (dono abrindo a própria ficha) não paga
     essa consulta extra.

  Fora esses dois casos, vale a regra de sempre: só o dono, e 404 tanto pra
  "não existe" quanto pra "não é seu nem compartilhada nem sua campanha",
  pra não vazar que a ficha de outra pessoa existe.
*/
export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const personagem = await banco.personagem.findUnique({ where: { id } });
  if (!personagem) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  // `ehDono` (o que a ficha usa pra decidir se edita ou só lê) é sempre
  // estrito: só a própria dona é dona, mestre nenhum entra aqui. A pergunta
  // "dá pra ler mesmo assim?" é separada, e é ela que decide o 404.
  const usuario = await usuarioAtual();
  const ehDono = usuario ? personagem.donoId === usuario.id : false;

  const campanhasComoMestre =
    usuario && !ehDono && personagem.campanhaId
      ? (
          await banco.participacao.findMany({
            where: { usuarioId: usuario.id, papel: "MESTRE" },
            select: { campanhaId: true },
          })
        ).map((c) => c.campanhaId)
      : [];

  const podeLer = usuario
    ? podeAcessarPersonagem(usuario.id, personagem, campanhasComoMestre)
    : false;

  if (!podeLer && !personagem.compartilhado) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    personagem: {
      id: personagem.id,
      nome: personagem.nome,
      dados: personagem.dados,
      compartilhado: personagem.compartilhado,
      ehDono,
    },
  });
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarSeFoiDono(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const temDados = corpo && typeof corpo.dados === "object" && corpo.dados !== null;
  const temCompartilhado = corpo && typeof corpo.compartilhado === "boolean";
  if (!temDados && !temCompartilhado) {
    return NextResponse.json({ erro: "dados ou compartilhado é obrigatório" }, { status: 400 });
  }

  // O nome da ficha segue o que a pessoa digitou dentro dela — não precisa
  // de um campo de nome separado em nenhuma tela do Hub. A maioria das
  // fichas de jogador guarda o nome em `perfil.nome`; ficha de inimigo/NPC
  // (sem "perfil", só um `nome` solto — Fabula Ultima e Sistema SAO) cai
  // no `??` de baixo.
  const nomeDentroDaFicha = temDados ? (corpo.dados?.perfil?.nome ?? corpo.dados?.nome) : null;
  const nome =
    typeof nomeDentroDaFicha === "string" && nomeDentroDaFicha.trim()
      ? nomeDentroDaFicha.trim()
      : existente.nome;

  const personagem = await banco.personagem.update({
    where: { id },
    data: {
      ...(temDados ? { dados: corpo.dados, nome } : {}),
      ...(temCompartilhado ? { compartilhado: corpo.compartilhado } : {}),
    },
    select: { id: true, nome: true, compartilhado: true, atualizadoEm: true },
  });

  return NextResponse.json({ personagem });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existente = await buscarSeFoiDono(id, usuario.id);
  if (!existente) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.personagem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
