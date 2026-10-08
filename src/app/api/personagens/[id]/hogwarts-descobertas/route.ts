import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

async function fichaDoUsuario(id: string, usuarioId: string) {
  const personagem = await banco.personagem.findUnique({
    where: { id },
    select: { donoId: true, ehMonstro: true, campanhaId: true, sistema: { select: { chave: true } } },
  });
  return personagem?.donoId === usuarioId
    && personagem.sistema.chave === "hogwarts-rpg"
    && !personagem.ehMonstro
    && personagem.campanhaId
    ? personagem
    : null;
}

/**
 * Caixa pública do próprio personagem. O evento só informa que algo mudou;
 * detalhes protegidos continuam sendo consultados nas rotas de cada módulo.
 */
export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const personagem = await fichaDoUsuario(id, usuario.id);
  if (!personagem) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  await garantirFundacaoHogwarts();

  const eventos = await banco.eventoAuditoriaHogwarts.findMany({
    where: { personagemId: id, campanhaId: personagem.campanhaId! },
    orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
    take: 30,
    select: {
      id: true, modulo: true, acao: true, resumo: true, criadoEm: true,
      leituras: { where: { usuarioId: usuario.id }, select: { lidoEm: true }, take: 1 },
    },
  });
  return NextResponse.json({
    eventos: eventos.map(({ leituras, ...evento }) => ({ ...evento, lido: leituras.length > 0 })),
    revisao: eventos[0]?.id ?? null,
  });
}

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const personagem = await fichaDoUsuario(id, usuario.id);
  if (!personagem) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  const corpo = await req.json().catch(() => null);
  const recebidos: unknown[] = Array.isArray(corpo?.ids) ? corpo.ids : [];
  const ids: string[] = [...new Set(recebidos.filter((valor): valor is string => typeof valor === "string"))].slice(0, 50);
  if (!ids.length) return NextResponse.json({ erro: "informe ao menos um evento" }, { status: 400 });
  await garantirFundacaoHogwarts();
  const permitidos = await banco.eventoAuditoriaHogwarts.findMany({
    where: { id: { in: ids }, personagemId: id, campanhaId: personagem.campanhaId! },
    select: { id: true },
  });
  await banco.leituraEventoHogwarts.createMany({
    data: permitidos.map((evento) => ({ eventoId: evento.id, usuarioId: usuario.id })),
    skipDuplicates: true,
  });
  return NextResponse.json({ ok: true, marcados: permitidos.length });
}
