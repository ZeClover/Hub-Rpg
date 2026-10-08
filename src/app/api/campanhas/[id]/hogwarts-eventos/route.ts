import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario || !await ehMestreOuAuxiliar(id, usuario.id)) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const campanha = await banco.campanha.findUnique({
    where: { id },
    select: { sistema: { select: { chave: true } } },
  });
  if (!campanha || campanha.sistema.chave !== "hogwarts-rpg") {
    return NextResponse.json({ erro: "campanha não é Hogwarts RPG" }, { status: 400 });
  }

  const limitePedido = Number(req.nextUrl.searchParams.get("limite") ?? 50);
  const limite = Number.isFinite(limitePedido) ? Math.min(100, Math.max(1, Math.trunc(limitePedido))) : 50;
  const eventos = await banco.eventoAuditoriaHogwarts.findMany({
    where: { campanhaId: id },
    orderBy: { criadoEm: "desc" },
    take: limite,
    select: {
      id: true,
      personagemId: true,
      modulo: true,
      acao: true,
      resumo: true,
      detalhes: true,
      criadoEm: true,
      ator: { select: { nome: true } },
      personagem: { select: { nome: true } },
    },
  });
  return NextResponse.json({ eventos });
}
