import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";
import { CONTEUDOS_HOGWARTS_1_ANO, SLUGS_CONTEUDOS_HOGWARTS_1_ANO } from "@/lib/hogwarts/conteudos-primeiro-ano";

type Contexto = { params: Promise<{ id: string }> };
type Dados = Record<string, unknown> & { conteudosConhecidos?: Record<string, string>; pericias?: Record<string, number> };

export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  const p = await banco.personagem.findUnique({ where: { id }, include: { sistema: { select: { chave: true } } } });
  if (!p || p.sistema.chave !== "hogwarts-rpg" || p.donoId !== usuario.id) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  const dados = p.dados as Dados;
  const curriculo = p.campanhaId ? await banco.curriculoHogwarts.findMany({ where: { campanhaId: p.campanhaId } }) : [];
  const estados = new Map(curriculo.map((c) => [c.slug, c.estado]));
  const conteudos = CONTEUDOS_HOGWARTS_1_ANO.flatMap((c) => {
    const salvo = dados.conteudosConhecidos?.[c.slug];
    const liberado = estados.get(c.slug) === "LIBERADO";
    if (!salvo && !liberado) return [];
    const cumpre = Number(dados.pericias?.[c.pericia] ?? 0) >= c.requisito_pericia;
    const estado = salvo && !["oculto", "descoberto", "bloqueado", "disponivel"].includes(salvo)
      ? salvo : liberado && cumpre ? "disponivel" : "bloqueado";
    return [{ ...c, estado }];
  });
  return NextResponse.json({ conteudos });
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
  if (slugs.length < 1 || slugs.length > 4 || slugs.some((s) => !SLUGS_CONTEUDOS_HOGWARTS_1_ANO.has(s))) {
    return NextResponse.json({ erro: "escolha de 1 a 4 conteúdos válidos" }, { status: 400 });
  }
  const dados = p.dados as Dados;
  const atuais = { ...(dados.conteudosConhecidos ?? {}) };
  const iniciais = Object.values(atuais).filter((e) => e === "formacao-inicial").length;
  if (iniciais + slugs.filter((s) => !atuais[s]).length > 4) return NextResponse.json({ erro: "limite de 4 conteúdos iniciais" }, { status: 400 });
  if (p.campanhaId) {
    const liberados = await banco.curriculoHogwarts.findMany({
      where: { campanhaId: p.campanhaId, slug: { in: slugs }, estado: "LIBERADO" }, select: { slug: true },
    });
    const autorizados = new Set(liberados.map((c) => c.slug));
    if (slugs.some((slug) => !autorizados.has(slug))) {
      return NextResponse.json({ erro: "o Mestre ainda não autorizou um dos conteúdos escolhidos" }, { status: 403 });
    }
  }
  for (const slug of slugs) {
    const c = CONTEUDOS_HOGWARTS_1_ANO.find((x) => x.slug === slug)!;
    if (Number(dados.pericias?.[c.pericia] ?? 0) < c.requisito_pericia) return NextResponse.json({ erro: `requisito não atendido: ${c.nome}` }, { status: 400 });
    atuais[slug] = "formacao-inicial";
  }
  await banco.personagem.update({ where: { id }, data: { dados: { ...dados, conteudosConhecidos: atuais } } });
  return NextResponse.json({ ok: true, estado: "formacao-inicial" });
}
