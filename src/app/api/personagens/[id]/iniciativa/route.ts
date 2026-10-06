import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { adicionarDeclaracao } from '@/lib/iniciativa-declarada';
import { atualizarIniciativaAtomica } from '@/lib/atualizar-iniciativa-atomica';

type Contexto = { params: Promise<{ id: string }> };
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: 'não autenticado' }, { status: 401 });
  const { id } = await params;
  const p = await banco.personagem.findUnique({ where: { id }, select: { id: true, nome: true, dados: true, donoId: true, campanhaId: true, ehMonstro: true } });
  if (!p || p.donoId !== usuario.id || p.ehMonstro || !p.campanhaId) return NextResponse.json({ erro: 'não encontrado' }, { status: 404 });
  const participacao = await banco.participacao.findUnique({ where: { campanhaId_usuarioId: { campanhaId: p.campanhaId, usuarioId: usuario.id } }, select: { usuarioId: true } });
  if (!participacao) return NextResponse.json({ erro: 'não encontrado' }, { status: 404 });
  const corpo = await requisicao.json().catch(() => null);
  if (!Number.isInteger(corpo?.resultado) || Math.abs(corpo.resultado) > 1000) return NextResponse.json({ erro: 'Resultado de iniciativa inválido.' }, { status: 400 });
  // Nome vem da própria ficha, não de campanha/NPC nem de um corpo forjado.
  const dados = p.dados && typeof p.dados === 'object' && !Array.isArray(p.dados) ? p.dados as Record<string, unknown> : {};
  const nome = typeof dados.nome === 'string' && dados.nome.trim() ? dados.nome.trim().slice(0, 200) : p.nome;
  const declaracao = { id: randomUUID(), personagemId: p.id, nome, resultado: corpo.resultado };
  const ok = await atualizarIniciativaAtomica(p.campanhaId, atual => adicionarDeclaracao(atual, declaracao));
  if (!ok) return NextResponse.json({ erro: 'A iniciativa mudou durante o envio. Tente novamente.' }, { status: 409 });
  return NextResponse.json({ ok: true, declaracao: { nome, resultado: corpo.resultado } });
}
