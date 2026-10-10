import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";
import { CONTEUDOS_HOGWARTS_1_ANO, SLUGS_CONTEUDOS_HOGWARTS_1_ANO } from "@/lib/hogwarts/conteudos-primeiro-ano";
import { estadoAposAula } from "@/lib/hogwarts/curriculo";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";

type Contexto = { params: Promise<{ id: string }> };
type DadosFicha = Record<string, unknown> & { conteudosConhecidos?: Record<string, string>; pericias?: Record<string, number> };

async function mestreDaCampanha(campanhaId: string) {
  const usuario = await usuarioAtual();
  return usuario && await ehMestreOuAuxiliar(campanhaId, usuario.id) ? usuario : null;
}

export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  if (!await mestreDaCampanha(id)) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  const campanha = await banco.campanha.findUnique({ where: { id }, include: { sistema: { select: { chave: true } } } });
  if (!campanha || campanha.sistema.chave !== "hogwarts-rpg") return NextResponse.json({ erro: "campanha não é Hogwarts RPG" }, { status: 400 });

  const [estados, personagens] = await Promise.all([
    banco.curriculoHogwarts.findMany({ where: { campanhaId: id } }),
    banco.personagem.findMany({ where: { campanhaId: id, ehMonstro: false }, select: { id: true, nome: true, dados: true } }),
  ]);
  const porSlug = new Map(estados.map((e) => [e.slug, e]));
  const conteudos = CONTEUDOS_HOGWARTS_1_ANO.map((base) => {
    const registro = porSlug.get(base.slug);
    const custom = (registro?.override && typeof registro.override === "object" ? registro.override : {}) as Partial<typeof base>;
    const conhecidoPor: string[] = [];
    const disponivelPara: string[] = [];
    for (const p of personagens) {
      const dados = p.dados as DadosFicha;
      const estado = dados.conteudosConhecidos?.[base.slug];
      if (["formacao-inicial", "conhecido", "dominado", "assinatura"].includes(estado ?? "")) conhecidoPor.push(p.id);
      if (estado === "disponivel") disponivelPara.push(p.id);
    }
    return { ...base, ...custom, estadoCurricular: registro?.estado ?? "PREVISTO", conhecidoPor, disponivelPara };
  });
  return NextResponse.json({ conteudos, personagens: personagens.map((p) => ({ id: p.id, nome: p.nome })) });
}

export async function PATCH(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const mestre = await mestreDaCampanha(id);
  if (!mestre) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  const campanha = await banco.campanha.findUnique({ where: { id }, select: { sistema: { select: { chave: true } } } });
  if (campanha?.sistema.chave !== "hogwarts-rpg") return NextResponse.json({ erro: "campanha não é Hogwarts RPG" }, { status: 400 });
  const corpo = await req.json().catch(() => null);
  const slug = typeof corpo?.slug === "string" ? corpo.slug : "";
  const acao = typeof corpo?.acao === "string" ? corpo.acao : "";
  if (!SLUGS_CONTEUDOS_HOGWARTS_1_ANO.has(slug)) return NextResponse.json({ erro: "conteúdo inválido" }, { status: 400 });
  const base = CONTEUDOS_HOGWARTS_1_ANO.find((c) => c.slug === slug)!;
  await garantirFundacaoHogwarts();

  try {
  if (acao === "ensinar" || acao === "ocultar") {
    await banco.$transaction(async (tx) => {
      await tx.curriculoHogwarts.upsert({
        where: { campanhaId_slug: { campanhaId: id, slug } },
        create: { campanhaId: id, slug, estado: acao === "ensinar" ? "LIBERADO" : "OCULTO" },
        update: { estado: acao === "ensinar" ? "LIBERADO" : "OCULTO" },
      });
      if (acao === "ensinar") {
        const personagens = await tx.personagem.findMany({ where: { campanhaId: id, ehMonstro: false } });
        await Promise.all(personagens.map(async (p) => {
        const dados = p.dados as DadosFicha;
        const atuais = { ...(dados.conteudosConhecidos ?? {}) };
        atuais[slug] = estadoAposAula(atuais[slug], acao, Number(dados.pericias?.[base.pericia] ?? 0) >= base.requisito_pericia);
          const salvo = await tx.personagem.updateMany({ where: { id: p.id, atualizadoEm: p.atualizadoEm }, data: { dados: { ...dados, conteudosConhecidos: atuais } } });
        if (salvo.count !== 1) throw new Error(`A ficha de ${p.nome} mudou. Recarregue antes de tentar novamente.`);
        await tx.eventoAuditoriaHogwarts.create({ data: { campanhaId: id, personagemId: p.id, atorId: mestre.id, modulo: "conteudo", acao: `curriculo.${acao}`, resumo: `${base.nome}: currículo atualizado para ${p.nome}`, detalhes: { slug } } });
        }));
      }
      await tx.eventoAuditoriaHogwarts.create({ data: {
        campanhaId: id, atorId: mestre.id, modulo: "conteudos", acao: `curriculo.${acao}`,
        resumo: `${base.nome} foi ${acao === "ensinar" ? "ensinado à turma" : "ocultado do currículo"}`,
        detalhes: { slug },
      } });
    });
    return NextResponse.json({ ok: true });
  }

  if (["liberar", "conceder", "promover"].includes(acao)) {
    const ids = Array.isArray(corpo?.personagemIds) ? corpo.personagemIds.filter((x: unknown): x is string => typeof x === "string") : [];
    const personagens = await banco.personagem.findMany({ where: { id: { in: ids }, campanhaId: id, ehMonstro: false } });
    if (!personagens.length) return NextResponse.json({ erro: "Selecione ao menos um aluno desta campanha." }, { status: 400 });
    await banco.$transaction(async (tx) => {
      await Promise.all(personagens.map(async (p) => {
        const dados = p.dados as DadosFicha;
        const atuais = { ...(dados.conteudosConhecidos ?? {}) };
        const cumpre = Number(dados.pericias?.[base.pericia] ?? 0) >= base.requisito_pericia;
        atuais[slug] = estadoAposAula(atuais[slug], acao, corpo?.override === true || cumpre);
        const salvo = await tx.personagem.updateMany({ where: { id: p.id, atualizadoEm: p.atualizadoEm }, data: { dados: { ...dados, conteudosConhecidos: atuais } } });
        if (salvo.count !== 1) throw new Error(`A ficha de ${p.nome} mudou. Recarregue antes de tentar novamente.`);
        await tx.eventoAuditoriaHogwarts.create({ data: { campanhaId: id, personagemId: p.id, atorId: mestre.id, modulo: "conteudo", acao: `curriculo.${acao}`, resumo: `${base.nome}: currículo atualizado para ${p.nome}`, detalhes: { slug } } });
      }));
      await tx.eventoAuditoriaHogwarts.create({ data: {
        campanhaId: id, atorId: mestre.id, modulo: "conteudos", acao: `personagem.${acao}`,
        resumo: `${base.nome}: ${acao} aplicado a ${personagens.length} personagem(ns)`,
        detalhes: { slug, personagemIds: personagens.map((p) => p.id) },
      } });
    });
    return NextResponse.json({ ok: true, alterados: personagens.length });
  }

  if (acao === "editar" && corpo?.override && typeof corpo.override === "object") {
    const permitido = Object.fromEntries(["nome", "descricao", "efeito", "tags"].filter((k) => k in corpo.override).map((k) => [k, corpo.override[k]]));
    await banco.$transaction([
      banco.curriculoHogwarts.upsert({
        where: { campanhaId_slug: { campanhaId: id, slug } },
        create: { campanhaId: id, slug, override: permitido }, update: { override: permitido },
      }),
      banco.eventoAuditoriaHogwarts.create({ data: {
        campanhaId: id, atorId: mestre.id, modulo: "conteudos", acao: "curriculo.editar",
        resumo: `${base.nome} teve sua apresentação personalizada`, detalhes: { slug, campos: Object.keys(permitido) },
      } }),
    ]);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ erro: "ação inválida" }, { status: 400 });
  } catch (e) { return NextResponse.json({ erro: e instanceof Error ? e.message : "Não foi possível atualizar o currículo." }, { status: 400 }); }
}
