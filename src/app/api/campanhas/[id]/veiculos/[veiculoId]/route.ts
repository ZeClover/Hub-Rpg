import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; veiculoId: string }> };

/// Editar ou apagar um veículo — só o mestre (decisão #147, ideia #57).
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, veiculoId } = await params;
  const veiculo = await banco.veiculo.findUnique({ where: { id: veiculoId } });
  if (!veiculo || veiculo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : null;
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() : null;
  const capacidade = Number.isInteger(corpo?.capacidade) ? corpo.capacidade : null;
  const donoId = typeof corpo?.donoId === "string" ? corpo.donoId : null;

  if (donoId) {
    const dono = await banco.personagem.findUnique({ where: { id: donoId } });
    if (!dono || dono.campanhaId !== campanhaId) {
      return NextResponse.json({ erro: "ficha não é desta campanha" }, { status: 400 });
    }
  }

  const atualizado = await banco.veiculo.update({
    where: { id: veiculoId },
    data: {
      ...(nome !== null ? { nome } : {}),
      ...(descricao !== null ? { descricao } : {}),
      ...(capacidade !== null ? { capacidade } : {}),
      ...(donoId !== null ? { donoId } : {}),
    },
    select: { id: true, nome: true, descricao: true, capacidade: true, donoId: true },
  });

  return NextResponse.json({ veiculo: atualizado });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, veiculoId } = await params;
  const veiculo = await banco.veiculo.findUnique({ where: { id: veiculoId } });
  if (!veiculo || veiculo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.veiculo.delete({ where: { id: veiculoId } });
  return NextResponse.json({ ok: true });
}
