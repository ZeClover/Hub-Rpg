export type CombatenteDeclarado = { id: string; nome: string; condicao: string; resultado?: number; personagemId?: string; declaracaoId?: string };
export type DeclaracaoIniciativa = { id: string; personagemId: string; nome: string; resultado: number };
export type EstadoComDeclaracoes = { combatentes: CombatenteDeclarado[]; vezDe: number; rodada: number; declaracoesProcessadas?: string[]; declaracoes?: DeclaracaoIniciativa[] };
// Preferências antigas ou corrompidas não podem derrubar a Mesa ao Vivo.
export function normalizarEstadoIniciativa(valor: unknown): EstadoComDeclaracoes {
  const estado = valor && typeof valor === 'object' && !Array.isArray(valor) ? valor as Record<string, unknown> : {};
  const combatentes = Array.isArray(estado.combatentes) ? estado.combatentes.filter((c): c is CombatenteDeclarado =>
    !!c && typeof c === 'object' && typeof c.id === 'string' && typeof c.nome === 'string' && typeof c.condicao === 'string') : [];
  const vezDe = Number.isInteger(estado.vezDe) && Number(estado.vezDe) >= 0 && Number(estado.vezDe) < combatentes.length ? Number(estado.vezDe) : 0;
  const rodada = Number.isInteger(estado.rodada) && Number(estado.rodada) >= 1 ? Number(estado.rodada) : 1;
  return { combatentes, vezDe, rodada, declaracoesProcessadas: Array.isArray(estado.declaracoesProcessadas) ? estado.declaracoesProcessadas.filter((id): id is string => typeof id === 'string').slice(-100) : [] };
}
export function declaracoesValidas(valor: unknown): DeclaracaoIniciativa[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((d): d is DeclaracaoIniciativa => !!d && typeof d === 'object' && typeof d.id === 'string' && typeof d.personagemId === 'string' && typeof d.nome === 'string' && Number.isFinite(d.resultado)).slice(-100);
}
export function adicionarDeclaracao(valor: unknown, nova: DeclaracaoIniciativa): Record<string, unknown> & { declaracoes: DeclaracaoIniciativa[] } {
  const atual = valor && typeof valor === 'object' && !Array.isArray(valor) ? valor as Record<string, unknown> : {};
  const fila = declaracoesValidas(atual.declaracoes).filter(d => d.personagemId !== nova.personagemId);
  return { ...atual, declaracoes: [...fila, nova].slice(-100) };
}
export function preservarDeclaracoes(recebido: Record<string, unknown>, atual: unknown) {
  const servidor = atual && typeof atual === 'object' ? atual as Record<string, unknown> : {};
  const processados = Array.isArray(recebido.declaracoesProcessadas) ? recebido.declaracoesProcessadas.filter((id): id is string => typeof id === 'string').slice(-100) : [];
  return { ...recebido, declaracoesProcessadas: processados, declaracoes: declaracoesValidas(servidor.declaracoes).filter(d => !processados.includes(d.id)) };
}
export function incorporarDeclaracoes(estado: EstadoComDeclaracoes, recebidas: unknown): EstadoComDeclaracoes {
  const antigas = estado.declaracoesProcessadas ?? [];
  const novas = declaracoesValidas(recebidas).filter(d => !antigas.includes(d.id));
  if (!novas.length) return estado;
  const ativo = estado.combatentes[estado.vezDe]?.id;
  let combatentes = [...estado.combatentes];
  for (const d of novas) {
    const i = combatentes.findIndex(c => c.personagemId === d.personagemId);
    if (i >= 0) combatentes[i] = { ...combatentes[i], nome: d.nome, resultado: d.resultado, declaracaoId: d.id };
    else combatentes.push({ id: `personagem:${d.personagemId}`, personagemId: d.personagemId, declaracaoId: d.id, nome: d.nome, resultado: d.resultado, condicao: '' });
  }
  combatentes = combatentes.sort((a, b) => (b.resultado ?? 0) - (a.resultado ?? 0));
  return { ...estado, combatentes, vezDe: ativo ? Math.max(0, combatentes.findIndex(c => c.id === ativo)) : 0, declaracoesProcessadas: [...antigas, ...novas.map(d => d.id)].slice(-100) };
}
