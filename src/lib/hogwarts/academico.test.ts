import assert from 'node:assert/strict';
import test from 'node:test';
import { atualizarAcademico, type DadosAcademicos } from './academico.ts';
const contexto = { notaId: 'nota-1', agora: 100, conteudo: { slug: 'sonorus', pericia: 'Feitiços', requisito_pericia: 1 }, disponivel: true };
const ficha: DadosAcademicos = { nivel: 1, pericias: { Feitiços: 1 }, academico: { materias: { Feitiços: { cursando: true, progresso: 2 } }, notas: [], criacaoFinalizada: true }, aparencia: { tema: 'floresta' } };
test('extra consome 2 progressos, concede conteúdo e preserva ficha original e estilo', () => {
  const novo = atualizarAcademico(ficha, { acao: 'extra', materia: 'Feitiços' }, contexto);
  assert.equal(novo.conteudosConhecidos?.sonorus, 'conhecido');
  assert.equal(novo.academico?.materias?.Feitiços.progresso, 0);
  assert.equal(novo.academico?.extrasPorAno?.['1'], 1);
  assert.deepEqual(novo.aparencia, ficha.aparencia);
  assert.equal(ficha.academico?.materias?.Feitiços.progresso, 2);
});
test('extra exige progresso, disponibilidade, perícia e limite anual', () => {
  assert.throws(() => atualizarAcademico(ficha, { acao: 'extra', materia: 'Feitiços' }, { ...contexto, disponivel: false }), /disponível/);
  assert.throws(() => atualizarAcademico({ ...ficha, pericias: {} }, { acao: 'extra', materia: 'Feitiços' }, contexto), /perícia/);
  assert.throws(() => atualizarAcademico({ ...ficha, academico: { ...ficha.academico, extrasPorAno: { '1': 2 } } }, { acao: 'extra', materia: 'Feitiços' }, contexto), /limite/);
  const concedida = atualizarAcademico(ficha, { acao: 'extra', materia: 'Feitiços' }, contexto);
  assert.throws(() => atualizarAcademico(concedida, { acao: 'extra', materia: 'Feitiços' }, contexto), /2 progressos/);
});
test('progresso não fica negativo e eletivas aguardam 3º ano', () => {
  const novo = atualizarAcademico({ ...ficha, academico: {} }, { acao: 'progresso', materia: 'Feitiços', delta: -1 }, contexto);
  assert.equal(novo.academico?.materias?.Feitiços.progresso, 0);
  assert.throws(() => atualizarAcademico(ficha, { acao: 'matricula', materia: 'Aritmancia', cursando: true }, contexto), /3º ano/);
});
test('notas validam escala, ano do exame e mantêm registros anteriores', () => {
  const corpo = { acao: 'nota', materia: 'Feitiços', tipo: 'Prova', nota: 'Ótimo', comentario: 'Muito bem' };
  const novo = atualizarAcademico(ficha, corpo, contexto);
  assert.equal(novo.academico?.notas?.[0].id, 'nota-1');
  assert.throws(() => atualizarAcademico(ficha, { ...corpo, tipo: 'N.O.M.' }, contexto), /ano atual/);
  assert.equal(atualizarAcademico(novo, { acao: 'remover-nota', notaId: 'nota-1' }, contexto).academico?.notas?.length, 0);
});
