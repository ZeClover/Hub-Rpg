import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";
import { CONTEUDOS_HOGWARTS_1_ANO } from "@/lib/hogwarts/conteudos-primeiro-ano";
import { catalogoDaFormacaoInicial, erroNaSelecaoInicial, formacaoInicialConcluida } from "@/lib/hogwarts/formacao-inicial";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";

type Contexto = { params: Promise<{ id: string }> };
type Dados = Record<string, unknown> & {
  conteudosConhecidos?: Record<string, string>;
  pericias?: Record<string, number>;
  academico?: Record<string, unknown> & { formacaoInicialConcluida?: boolean };
};

export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const p = await banco.personagem.findUnique({ where: { id }, include: { sistema: { select: { chave: true } } } });
  if (!p || p.sistema.chave !== "hogwarts-rpg" || p.donoId !== usuario.id) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  const dados = p.dados as Dados;
  const atuais = dados.conteudosConhecidos ?? {};
  const selecaoConcluida = formacaoInicialConcluida(dados);

  // Durante a criação, todo o catálogo do 1º ano fica visível. Requisito
  // insuficiente só bloqueia a escolha; não esconde o conteúdo. Depois da
  // confirmação atômica dos quatro iniciais, volta a valer o currículo
  // progressivo da campanha e os demais somem até o Mestre liberá-los.
  if (!selecaoConcluida) {
    const conteudos = catalogoDaFormacaoInicial(dados);
    return NextResponse.json({
      conteudos,
      selecaoInicialPendente: true,
      selecionadosIniciais: Object.entries(atuais).filter(([, estado]) => estado === "formacao-inicial").map(([slug]) => slug),
    });
  }

  const curriculo = p.campanhaId ? await banco.curriculoHogwarts.findMany({ where: { campanhaId: p.campanhaId } }) : [];
  const estados = new Map(curriculo.map((c) => [c.slug, c.estado]));
  const conteudos = CONTEUDOS_HOGWARTS_1_ANO.flatMap((c) => {
    const salvo = atuais[c.slug];
    const liberado = estados.get(c.slug) === "LIBERADO";
    if (!salvo && !liberado) return [];
    const cumpre = Number(dados.pericias?.[c.pericia] ?? 0) >= c.requisito_pericia;
    const estado = salvo && !["oculto", "descoberto", "bloqueado", "disponivel"].includes(salvo)
      ? salvo : liberado && cumpre ? "disponivel" : "bloqueado";
    return [{ ...c, estado }];
  });
  return NextResponse.json({ conteudos, selecaoInicialPendente: false, selecionadosIniciais: [] });
}

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const p = await banco.personagem.findUnique({ where: { id }, include: { sistema: { select: { chave: true } } } });
  if (!p || p.sistema.chave !== "hogwarts-rpg" || p.donoId !== usuario.id) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  const corpo = await req.json().catch(() => null);
  const slugs: string[] = Array.isArray(corpo?.slugs)
    ? [...new Set<string>(corpo.slugs.filter((s: unknown): s is string => typeof s === "string"))]
    : [];
  const dados = p.dados as Dados;
  if (formacaoInicialConcluida(dados)) {
    return NextResponse.json({ erro: "a formação inicial deste personagem já foi concluída" }, { status: 409 });
  }

  const erroSelecao = erroNaSelecaoInicial(slugs, dados.pericias);
  if (erroSelecao) return NextResponse.json({ erro: erroSelecao }, { status: 400 });

  const atuais = Object.fromEntries(
    Object.entries(dados.conteudosConhecidos ?? {}).filter(([, estado]) => estado !== "formacao-inicial"),
  );
  for (const slug of slugs) atuais[slug] = "formacao-inicial";
  if (p.campanhaId) await garantirFundacaoHogwarts();
  await banco.$transaction(async (tx) => {
    await tx.personagem.update({
      where: { id },
      data: {
        dados: {
          ...dados,
          conteudosConhecidos: atuais,
          academico: { ...(dados.academico ?? {}), formacaoInicialConcluida: true },
        },
      },
    });
    if (p.campanhaId) {
      await tx.eventoAuditoriaHogwarts.create({
        data: {
          campanhaId: p.campanhaId,
          personagemId: p.id,
          atorId: usuario.id,
          modulo: "criacao",
          acao: "formacao.confirmada",
          resumo: `${p.nome} concluiu a Formação Inicial`,
          detalhes: { conteudos: slugs },
        },
      });
    }
  });
  return NextResponse.json({ ok: true, estado: "formacao-inicial" });
}
