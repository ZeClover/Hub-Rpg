import { TipoCampoPersonalizado } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

const TIPOS_VALIDOS = Object.values(TipoCampoPersonalizado);

/*
  Criar um campo personalizado da campanha (decisão #140) — só o mestre.
  Sem GET: a lista chega junto da página da campanha, mesmo padrão de
  Sessões/Avisos/Enquetes.
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
  const tipoBruto = corpo?.tipo;
  if (
    !nome ||
    typeof tipoBruto !== "string" ||
    !TIPOS_VALIDOS.includes(tipoBruto as TipoCampoPersonalizado)
  ) {
    return NextResponse.json({ erro: "nome e tipo são obrigatórios" }, { status: 400 });
  }
  const tipo = tipoBruto as TipoCampoPersonalizado;

  const campo = await banco.campoPersonalizado.create({
    data: {
      campanhaId,
      nome,
      tipo,
      // Valor inicial "vazio" de cada tipo — a pessoa edita depois.
      valorTexto: tipo === "TEXTO" ? "" : null,
      valorNumero: tipo === "NUMERO" || tipo === "CONTADOR" ? 0 : null,
      valorBooleano: tipo === "BOOLEANO" ? false : null,
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

  return NextResponse.json({ campo }, { status: 201 });
}
