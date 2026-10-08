import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import { CASAS_HOGWARTS, somarPontosCasas, validarEventoPontoCasa } from "@/lib/hogwarts/pontos-casas";
import { ehPapelDeMestre } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

async function contexto(campanhaId: string, usuarioId: string) {
  const [campanha, participacao] = await Promise.all([
    banco.campanha.findUnique({ where: { id: campanhaId }, select: { sistema: { select: { chave: true } } } }),
    banco.participacao.findUnique({ where: { campanhaId_usuarioId: { campanhaId, usuarioId } }, select: { papel: true } }),
  ]);
  if (!campanha || campanha.sistema.chave !== "hogwarts-rpg" || !participacao) return null;
  return { ehMestre: ehPapelDeMestre(participacao.papel) };
}

export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const acesso = await contexto(id, usuario.id);
  if (!acesso) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  await garantirFundacaoHogwarts();
  const [grupos, eventos] = await Promise.all([
    banco.hogwartsCasaPontoEvento.groupBy({ by: ["casa"], where: { campanhaId: id }, _sum: { delta: true } }),
    banco.hogwartsCasaPontoEvento.findMany({
      where: { campanhaId: id }, orderBy: { criadoEm: "desc" }, take: 60,
      select: { id: true, casa: true, delta: true, motivo: true, sessao: true, reversaoDeId: true, criadoEm: true, ator: { select: { nome: true } } },
    }),
  ]);
  const totais = somarPontosCasas(grupos.map((grupo) => ({ casa: grupo.casa, delta: grupo._sum.delta ?? 0 })));
  return NextResponse.json({ casas: CASAS_HOGWARTS, totais, eventos, ehMestre: acesso.ehMestre });
}

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const acesso = await contexto(id, usuario.id);
  if (!acesso?.ehMestre) return NextResponse.json({ erro: "somente o Mestre altera Pontos das Casas" }, { status: 403 });
  const corpo = await req.json().catch(() => null);
  await garantirFundacaoHogwarts();
  try {
    if (corpo?.acao === "estornar") {
      const original = await banco.hogwartsCasaPontoEvento.findFirst({ where: { id: String(corpo.eventoId ?? ""), campanhaId: id } });
      if (!original || original.reversaoDeId) return NextResponse.json({ erro: "evento não pode ser estornado" }, { status: 400 });
      const jaEstornado = await banco.hogwartsCasaPontoEvento.findUnique({ where: { reversaoDeId: original.id } });
      if (jaEstornado) return NextResponse.json({ erro: "evento já foi estornado" }, { status: 409 });
      await banco.$transaction([
        banco.hogwartsCasaPontoEvento.create({ data: { campanhaId: id, atorId: usuario.id, casa: original.casa, delta: -original.delta, motivo: `Correção: ${original.motivo}`, sessao: original.sessao, reversaoDeId: original.id } }),
        banco.eventoAuditoriaHogwarts.create({ data: { campanhaId: id, atorId: usuario.id, modulo: "casa", acao: "pontos.estornar", resumo: `${original.casa}: evento de ${original.delta > 0 ? "+" : ""}${original.delta} pontos corrigido`, detalhes: { casa: original.casa, delta: -original.delta, eventoId: original.id } } }),
      ]);
    } else {
      const validado = validarEventoPontoCasa(corpo?.casa, corpo?.delta, corpo?.motivo);
      const sessao = String(corpo?.sessao ?? "").trim().slice(0, 80) || null;
      await banco.$transaction([
        banco.hogwartsCasaPontoEvento.create({ data: { campanhaId: id, atorId: usuario.id, ...validado, sessao } }),
        banco.eventoAuditoriaHogwarts.create({ data: { campanhaId: id, atorId: usuario.id, modulo: "casa", acao: "pontos.adicionar", resumo: `${validado.casa} recebeu ${validado.delta > 0 ? "+" : ""}${validado.delta} pontos`, detalhes: { casa: validado.casa, delta: validado.delta, motivo: validado.motivo, sessao } } }),
      ]);
    }
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível registrar os pontos." }, { status: 400 });
  }
}
