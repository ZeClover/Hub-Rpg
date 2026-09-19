import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

const LIMITE_MENSAGENS = 200;

/*
  Chat simples da campanha (decisão #136) — sem edição nem exclusão de
  mensagem, é um histórico de conversa. Qualquer participante (mestre ou
  jogador já ligado à campanha) lê e escreve; quem só tem o link e ainda
  não entrou não vê nada, mesma regra de "precisa ser participante" que já
  vale pra confirmação de presença.

  GET existe aqui (diferente de Sessões) porque o chat é lido por
  polling do cliente — teria que existir de qualquer jeito, então a
  página da campanha também não busca mensagem nenhuma no primeiro
  carregamento; a tela pede pra essa mesma rota assim que monta.
*/
async function souParticipante(campanhaId: string, usuarioId: string) {
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
  return participacao !== null;
}

export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await souParticipante(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const mensagens = await banco.mensagemChat.findMany({
    where: { campanhaId },
    orderBy: { criadoEm: "desc" },
    take: LIMITE_MENSAGENS,
    select: {
      id: true,
      texto: true,
      criadoEm: true,
      autorId: true,
      autor: { select: { nome: true, email: true } },
    },
  });

  return NextResponse.json({ mensagens: mensagens.reverse() });
}

export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await souParticipante(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const texto = typeof corpo?.texto === "string" ? corpo.texto.trim() : "";
  if (!texto) {
    return NextResponse.json({ erro: "texto é obrigatório" }, { status: 400 });
  }

  const mensagem = await banco.mensagemChat.create({
    data: { campanhaId, autorId: usuario.id, texto },
    select: {
      id: true,
      texto: true,
      criadoEm: true,
      autorId: true,
      autor: { select: { nome: true, email: true } },
    },
  });

  return NextResponse.json({ mensagem }, { status: 201 });
}
