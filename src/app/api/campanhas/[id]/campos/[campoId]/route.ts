import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string; campoId: string }> };

/*
  Editar (nome e/ou valor, conforme o tipo) ou apagar um campo
  personalizado — só o mestre, mesma checagem nas duas rotas. `delta` é um
  atalho só pra CONTADOR (+1/-1 rápido, sem mandar o valor final calculado
  do cliente).
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, campoId } = await params;
  const campo = await banco.campoPersonalizado.findUnique({ where: { id: campoId } });
  if (!campo || campo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const nome = typeof corpo?.nome === "string" ? corpo.nome.trim() : null;
  const valorTexto = typeof corpo?.valorTexto === "string" ? corpo.valorTexto : null;
  const valorBooleano = typeof corpo?.valorBooleano === "boolean" ? corpo.valorBooleano : null;
  const valorNumero = typeof corpo?.valorNumero === "number" ? corpo.valorNumero : null;
  const delta = typeof corpo?.delta === "number" ? corpo.delta : null;

  if (nome === null && valorTexto === null && valorBooleano === null && valorNumero === null && delta === null) {
    return NextResponse.json({ erro: "nada pra atualizar" }, { status: 400 });
  }
  if (delta !== null && campo.tipo !== "CONTADOR") {
    return NextResponse.json({ erro: "delta só vale pra campo do tipo contador" }, { status: 400 });
  }

  const novoValorNumero =
    delta !== null ? (campo.valorNumero ?? 0) + delta : (valorNumero ?? undefined);

  const atualizado = await banco.campoPersonalizado.update({
    where: { id: campoId },
    data: {
      ...(nome !== null ? { nome } : {}),
      ...(valorTexto !== null ? { valorTexto } : {}),
      ...(valorBooleano !== null ? { valorBooleano } : {}),
      ...(novoValorNumero !== undefined ? { valorNumero: novoValorNumero } : {}),
    },
    select: {
      id: true,
      nome: true,
      tipo: true,
      valorTexto: true,
      valorNumero: true,
      valorBooleano: true,
    },
  });

  return NextResponse.json({ campo: atualizado });
}

export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId, campoId } = await params;
  const campo = await banco.campoPersonalizado.findUnique({ where: { id: campoId } });
  if (!campo || campo.campanhaId !== campanhaId) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.campoPersonalizado.delete({ where: { id: campoId } });
  return NextResponse.json({ ok: true });
}
