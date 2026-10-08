import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import { sincronizarFamiliasHogwarts, validarFamiliaCustom } from "@/lib/hogwarts/familias";
import { ehPapelDeMestre } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

async function carregar(personagemId: string, usuarioId: string) {
  const personagem = await banco.personagem.findUnique({
    where: { id: personagemId },
    include: {
      sistema: { select: { chave: true } },
      familiaHogwartsMembro: { include: { familia: { include: { segredos: true } } } },
      herancaHogwarts: true,
    },
  });
  if (!personagem?.campanhaId || personagem.sistema.chave !== "hogwarts-rpg" || personagem.ehMonstro) return null;
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId: personagem.campanhaId, usuarioId } }, select: { papel: true },
  });
  const ehMestre = !!participacao && ehPapelDeMestre(participacao.papel);
  if (personagem.donoId !== usuarioId && !ehMestre) return null;
  return { personagem, ehMestre };
}

export async function GET(_req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  await garantirFundacaoHogwarts();
  const ctx = await carregar(id, usuario.id);
  if (!ctx) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  await sincronizarFamiliasHogwarts(banco, ctx.personagem.campanhaId!);
  // Liga escolhas legadas ao catálogo sem substituir o JSON da ficha.
  if (!ctx.personagem.familiaHogwartsMembro) {
    const dados = ctx.personagem.dados as { perfil?: { familiaId?: string }; familiasCustom?: Array<Record<string, unknown>> };
    const chave = dados.perfil?.familiaId;
    if (chave) {
      let legada = await banco.hogwartsFamilia.findUnique({ where: { campanhaId_chave: { campanhaId: ctx.personagem.campanhaId!, chave } } });
      const propria = dados.familiasCustom?.find((familia) => familia.id === chave);
      if (!legada && propria) {
        try {
          const validada = validarFamiliaCustom(propria);
          // O ID legado preserva versões distintas; só o Mestre decide unificar.
          legada = await banco.hogwartsFamilia.upsert({ where: { campanhaId_chave: { campanhaId: ctx.personagem.campanhaId!, chave } }, update: {}, create: { campanhaId: ctx.personagem.campanhaId!, ...validada, chave } });
        } catch { /* Dados incompletos continuam preservados na ficha original. */ }
      }
      if (legada) await banco.hogwartsFamiliaMembro.upsert({ where: { personagemId: id }, update: {}, create: { personagemId: id, familiaId: legada.id } });
    }
  }
  const familias = await banco.hogwartsFamilia.findMany({
    where: { campanhaId: ctx.personagem.campanhaId! }, orderBy: { nome: "asc" },
    select: { id: true, chave: true, nome: true, tipo: true, condicaoFinanceira: true, tags: true, conteudoFamiliar: true, acessoFamiliar: true, herancas: true },
  });
  const membro = await banco.hogwartsFamiliaMembro.findUnique({ where: { personagemId: id }, include: { familia: { include: { segredos: { where: ctx.ehMestre ? {} : { reveladoEm: { not: null } } } } } } });
  const familia = membro?.familia;
  return NextResponse.json({
    familias,
    familia: familia ? { ...familia, segredos: familia.segredos.filter((segredo) => ctx.ehMestre || segredo.reveladoEm) } : null,
    herancaNivel: ctx.personagem.herancaHogwarts?.nivel ?? 0,
    ehMestre: ctx.ehMestre,
  });
}

export async function POST(req: NextRequest, { params }: Contexto) {
  const { id } = await params;
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  await garantirFundacaoHogwarts();
  const ctx = await carregar(id, usuario.id);
  if (!ctx) return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  await sincronizarFamiliasHogwarts(banco, ctx.personagem.campanhaId!);
  const corpo = await req.json().catch(() => null);
  try {
    if (corpo?.acao === "escolher") {
      const estadoFicha = ctx.personagem.dados as { academico?: { criacaoFinalizada?: boolean; criacaoVersao?: number } };
      const emCriacao = estadoFicha.academico?.criacaoVersao === 1 && !estadoFicha.academico.criacaoFinalizada;
      if (!ctx.ehMestre && !emCriacao) return NextResponse.json({ erro: "Depois da criação, somente o Mestre altera a família." }, { status: 403 });
      const familia = await banco.hogwartsFamilia.findFirst({ where: { id: String(corpo.familiaId ?? ""), campanhaId: ctx.personagem.campanhaId! } });
      if (!familia) throw new Error("Família não encontrada.");
      const dados = structuredClone(ctx.personagem.dados) as Record<string, unknown>;
      const perfil = (dados.perfil && typeof dados.perfil === "object" ? dados.perfil : {}) as Record<string, unknown>;
      perfil.familiaId = familia.chave; dados.perfil = perfil;
      await banco.$transaction(async (tx) => {
        const salvo = await tx.personagem.updateMany({ where: { id, atualizadoEm: ctx.personagem.atualizadoEm }, data: { dados: dados as Prisma.InputJsonValue } });
        if (salvo.count !== 1) throw new Error("A ficha mudou. Recarregue antes de trocar a família.");
        await tx.hogwartsFamiliaMembro.upsert({ where: { personagemId: id }, update: { familiaId: familia.id }, create: { familiaId: familia.id, personagemId: id } });
        await tx.hogwartsHerancaPersonagem.deleteMany({ where: { personagemId: id, familiaId: { not: familia.id } } });
        await tx.eventoAuditoriaHogwarts.create({ data: { campanhaId: ctx.personagem.campanhaId!, personagemId: id, atorId: usuario.id, modulo: "familia", acao: "familia.escolher", resumo: `${ctx.personagem.nome} passou a integrar a família ${familia.nome}`, detalhes: { familiaId: familia.id } } });
      });
    } else if (corpo?.acao === "avancar-heranca") {
      if (!ctx.ehMestre) return NextResponse.json({ erro: "somente o Mestre avança uma Herança" }, { status: 403 });
      const membro = await banco.hogwartsFamiliaMembro.findUnique({ where: { personagemId: id }, include: { familia: true } });
      if (!membro) throw new Error("Escolha uma família primeiro.");
      const opcoes = Array.isArray(membro.familia.herancas) ? membro.familia.herancas : [];
      if (!opcoes.length) throw new Error("Esta família ainda não possui uma trilha de Herança definida.");
      const atual = await banco.hogwartsHerancaPersonagem.findUnique({ where: { personagemId: id } });
      const nivel = (atual?.nivel ?? 0) + 1;
      if (nivel > Math.min(3, opcoes.length)) throw new Error("A Herança já alcançou o estágio máximo disponível.");
      const adquiridos = (ctx.personagem.dados as { unicosAdquiridos?: Record<string, boolean> }).unicosAdquiridos ?? {};
      if (!Array.from({ length: nivel }, (_, i) => adquiridos[`heranca-${i + 1}`]).every(Boolean)) throw new Error("Adquira os estágios de Herança com pontos de Conteúdos Únicos na evolução antes da confirmação pelo Mestre.");
      await banco.$transaction(async (tx) => {
        // Serialize advancement with family changes and sheet edits.
        const ficha = await tx.personagem.updateMany({ where: { id, atualizadoEm: ctx.personagem.atualizadoEm }, data: { atualizadoEm: new Date() } });
        if (ficha.count !== 1) throw new Error("A ficha mudou. Recarregue antes de avançar a Herança.");
        if (atual) {
          const resultado = await tx.hogwartsHerancaPersonagem.updateMany({ where: { id: atual.id, nivel: atual.nivel, atualizadoEm: atual.atualizadoEm }, data: { familiaId: membro.familiaId, nivel } });
          if (resultado.count !== 1) throw new Error("A Herança mudou. Recarregue antes de confirmar outro estágio.");
        } else await tx.hogwartsHerancaPersonagem.create({ data: { personagemId: id, familiaId: membro.familiaId, nivel } });
        await tx.eventoAuditoriaHogwarts.create({ data: { campanhaId: ctx.personagem.campanhaId!, personagemId: id, atorId: usuario.id, modulo: "familia", acao: "heranca.avancar", resumo: `A Herança de ${ctx.personagem.nome} avançou para o estágio ${nivel}`, detalhes: { familiaId: membro.familiaId, nivel } } });
      });
    } else throw new Error("Ação de família inválida.");
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível atualizar a família." }, { status: 400 });
  }
}
