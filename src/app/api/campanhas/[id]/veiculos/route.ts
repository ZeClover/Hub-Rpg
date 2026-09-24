import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Veículo genérico da campanha (decisão #147, ideia #57) — deliberadamente
  simples (nome/descrição/capacidade), só pra organizar "quem tem o quê".
  Não duplica mecânica de sistema nenhum (decisão #17): o Veículo Pessoal
  do Piloto de Fabula Ultima, por exemplo, continua vivendo só no `dados`
  da ficha daquele sistema. Só o mestre cria.
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
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

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : "";
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() : null;
  const capacidade = Number.isInteger(corpo?.capacidade) ? corpo.capacidade : null;
  const donoId = typeof corpo?.donoId === "string" ? corpo.donoId : "";
  if (!nome || !donoId) {
    return NextResponse.json({ erro: "nome e dono são obrigatórios" }, { status: 400 });
  }

  const dono = await banco.personagem.findUnique({ where: { id: donoId } });
  if (!dono || dono.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "ficha não é desta campanha" }, { status: 400 });
  }

  const veiculo = await banco.veiculo.create({
    data: { campanhaId, donoId, nome, descricao, capacidade },
    select: { id: true, nome: true, descricao: true, capacidade: true, donoId: true },
  });

  return NextResponse.json({ veiculo }, { status: 201 });
}
