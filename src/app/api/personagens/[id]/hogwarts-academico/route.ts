import type { Prisma } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { ehPapelDeMestre } from '@/lib/permissao-mestre';
import { garantirFundacaoHogwarts } from '@/lib/hogwarts/auditoria';
import { atualizarAcademico, type DadosAcademicos } from '@/lib/hogwarts/academico';
import { CONTEUDOS_HOGWARTS_1_ANO } from '@/lib/hogwarts/conteudos-primeiro-ano';
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: 'não autenticado' }, { status: 401 });
  const p = await banco.personagem.findUnique({ where: { id }, include: { sistema: { select: { chave: true } } } });
  if (!p?.campanhaId || p.ehMonstro || p.sistema.chave !== 'hogwarts-rpg') return NextResponse.json({ erro: 'não encontrado' }, { status: 404 });
  const participacao = await banco.participacao.findUnique({ where: { campanhaId_usuarioId: { campanhaId: p.campanhaId, usuarioId: usuario.id } } });
  if (!participacao || !ehPapelDeMestre(participacao.papel)) return NextResponse.json({ erro: 'Somente o Mestre gerencia notas e progresso.' }, { status: 403 });
  const corpo = await req.json().catch(() => null);
  if (!corpo || typeof corpo !== 'object') return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 });
  try {
    const dados = p.dados as DadosAcademicos;
    const conteudo = CONTEUDOS_HOGWARTS_1_ANO.find(c => c.slug === corpo.slug);
    const curricular = conteudo ? await banco.curriculoHogwarts.findUnique({ where: { campanhaId_slug: { campanhaId: p.campanhaId, slug: conteudo.slug } } }) : null;
    const novo = atualizarAcademico(dados, corpo, { notaId: crypto.randomUUID(), agora: Date.now(), conteudo, disponivel: !!conteudo && (dados.conteudosConhecidos?.[conteudo.slug] === 'disponivel' || curricular?.estado === 'LIBERADO') });
    await garantirFundacaoHogwarts();
    await banco.$transaction(async tx => {
      const salvo = await tx.personagem.updateMany({ where: { id, atualizadoEm: p.atualizadoEm }, data: { dados: novo as Prisma.InputJsonValue } });
      if (salvo.count !== 1) throw new Error('A ficha mudou. Recarregue antes de registrar novamente.');
      await tx.eventoAuditoriaHogwarts.create({ data: { campanhaId: p.campanhaId!, personagemId: id, atorId: usuario.id, modulo: 'academico', acao: `academico.${corpo.acao}`, resumo: `${p.nome}: registro acadêmico atualizado${corpo.materia ? ` em ${corpo.materia}` : ''}`, detalhes: { acao: corpo.acao, materia: corpo.materia ?? null, slug: conteudo?.slug ?? null } } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ erro: e instanceof Error ? e.message : 'Não foi possível atualizar.' }, { status: 400 }); }
}
