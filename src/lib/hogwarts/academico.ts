export const MATERIAS_HOGWARTS = ['Feitiços', 'Transfiguração', 'Poções', 'Herbologia', 'Defesa Contra as Artes das Trevas', 'História da Magia', 'Astronomia', 'Voo'] as const;
export const ELETIVAS_HOGWARTS = ['Aritmancia', 'Runas Antigas', 'Adivinhação', 'Trato das Criaturas Mágicas', 'Estudos dos Trouxas'] as const;
const NOTAS = ['Ótimo', 'Excede Expectativas', 'Aceitável', 'Péssimo', 'Deplorável', 'Trasgo'];
const TIPOS = ['Trabalho', 'Prova', 'N.O.M.', 'N.I.E.M.', 'Outro'];
type Nota = { id: string; materia: string; tipo: string; nota: string; comentario: string; data: number };
export type DadosAcademicos = Record<string, unknown> & {
  nivel?: number; pericias?: Record<string, number>; conteudosConhecidos?: Record<string, string>;
  academico?: Record<string, unknown> & { materias?: Record<string, { cursando: boolean; progresso: number }>; notas?: Nota[]; extrasPorAno?: Record<string, number> };
};
export function anoAcademico(nivel: number = 1) { return Math.max(1, Math.min(7, Math.ceil(nivel / 5))); }
export function atualizarAcademico(dados: DadosAcademicos, corpo: Record<string, unknown>, contexto: { notaId: string; agora: number; conteudo?: { slug: string; pericia: string; requisito_pericia: number }; disponivel?: boolean }) {
  const novo = structuredClone(dados), academico = novo.academico ?? {};
  novo.academico = academico;
  const ano = anoAcademico(dados.nivel), materia = String(corpo.materia ?? '');
  if (corpo.acao === 'remover-nota') {
    if (!(academico.notas ?? []).some(n => n.id === corpo.notaId)) throw new Error('Nota não encontrada.');
    academico.notas = (academico.notas ?? []).filter(n => n.id !== corpo.notaId);
    return novo;
  }
  if (![...MATERIAS_HOGWARTS, ...ELETIVAS_HOGWARTS].includes(materia as never)) throw new Error('Matéria inválida.');
  if (ELETIVAS_HOGWARTS.includes(materia as never) && ano < 3) throw new Error('Eletivas começam no 3º ano.');
  const materias = academico.materias ??= {};
  const anterior = materias[materia] ?? { cursando: MATERIAS_HOGWARTS.includes(materia as never), progresso: 0 };
  const m = materias[materia] = { ...anterior };
  if (corpo.acao === 'matricula') {
    if (typeof corpo.cursando !== 'boolean') throw new Error('Informe a matrícula.');
    m.cursando = corpo.cursando;
  } else if (corpo.acao === 'progresso') {
    if (corpo.delta !== 1 && corpo.delta !== -1) throw new Error('Progresso aceita apenas +1 ou −1.');
    if (!m.cursando) throw new Error('Matricule o aluno nesta matéria antes de registrar progresso.');
    m.progresso = Math.max(0, m.progresso + corpo.delta);
  } else if (corpo.acao === 'nota') {
    if (!TIPOS.includes(String(corpo.tipo)) || !NOTAS.includes(String(corpo.nota))) throw new Error('Tipo ou nota inválidos.');
    if (corpo.tipo === 'N.O.M.' && ano !== 5 || corpo.tipo === 'N.I.E.M.' && ano !== 7) throw new Error('Este exame não pertence ao ano atual.');
    academico.notas = [...(academico.notas ?? []), { id: contexto.notaId, materia, tipo: String(corpo.tipo), nota: String(corpo.nota), comentario: String(corpo.comentario ?? '').trim().slice(0, 500), data: contexto.agora }];
  } else if (corpo.acao === 'extra') {
    const c = contexto.conteudo, usados = academico.extrasPorAno ??= {};
    if (!c || c.pericia !== materia || !contexto.disponivel) throw new Error('Escolha um conteúdo disponível desta matéria.');
    if (!m.cursando || m.progresso < 2) throw new Error('São necessários 2 progressos nesta matéria.');
    if (Number(usados[String(ano)] ?? 0) >= 2) throw new Error('O limite é 2 extras acadêmicos por ano.');
    if (Number(dados.pericias?.[materia] ?? 0) < c.requisito_pericia) throw new Error('O aluno ainda não cumpre o requisito de perícia.');
    const conhecidos = novo.conteudosConhecidos ??= {};
    if (['formacao-inicial', 'conhecido', 'dominado', 'assinatura'].includes(conhecidos[c.slug])) throw new Error('Este conteúdo já é conhecido.');
    conhecidos[c.slug] = 'conhecido'; m.progresso -= 2; usados[String(ano)] = Number(usados[String(ano)] ?? 0) + 1;
  } else throw new Error('Ação acadêmica inválida.');
  return novo;
}
