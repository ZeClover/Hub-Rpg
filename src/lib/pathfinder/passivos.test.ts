import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import regras from '../../../public/js/pathfinder-regras.js';

type Registro = { id: string; [chave: string]: unknown };

const playerCore = JSON.parse(
  readFileSync(new URL('../../../public/pathfinder/player-core.json', import.meta.url), 'utf8'),
) as { talentos: Registro[] };

const idsPassivos = [
  'vitalidade',
  'duro-de-matar',
  'carregador-robusto',
  'iniciativa-incrivel',
  'improvisacao-destreinada',
  'epitome-da-ancestralidade',
  'perspicacia-astuta',
];

const catalogo = {
  classes: [{
    id: 'guerreiro', nome: 'Guerreiro', pv: 10, atributoChave: ['for'], periciasTreinadas: 3,
    periciasFixas: [], percepcao: 1, salvaguardas: { fortitude: 1, reflexos: 1, vontade: 1 },
    armaduras: { sem: 1 }, armas: { simples: 1, desarmados: 1 }, cdClasse: 1,
  }],
  ancestralidades: [{ id: 'humano', nome: 'Humano', pv: 8, deslocamento: 7.5, herancas: [] }],
  biografias: [],
  talentos: [
    ...playerCore.talentos.filter(t => idsPassivos.includes(t.id)),
    { id: 'ancestral-1', nome: 'Talento ancestral de 1º', nivel: 1, tipo: 'ancestralidade', ancestralidade: 'humano' },
    { id: 'ancestral-5', nome: 'Talento ancestral de 5º', nivel: 5, tipo: 'ancestralidade', ancestralidade: 'humano' },
  ],
  magias: [],
  equipamentos: [{ id: 'carga-dez', nome: 'Carga de teste', tipo: 'equipamento', volume: 10 }],
};

function ficha(nivel = 1) {
  const p = regras.criar();
  Object.assign(p, {
    nome: 'Teste de passivos', nivel, classeId: 'guerreiro', ancestralidadeId: 'humano',
    atributoChave: 'for', atributos: { for: 4, des: 2, con: 2, int: 0, sab: 1, car: 0 },
  });
  return p;
}

function adicionarTalento(p: ReturnType<typeof ficha>, id: string, nivel: number, tipo: string, origem?: string) {
  p.talentos.push({ id, nivel, tipo, ...(origem ? { origem } : {}) });
}

test('Vitalidade concede PV por nível e reduz apenas a CD de recuperação', () => {
  const p = ficha(7);
  const base = regras.calcular(p, catalogo);
  adicionarTalento(p, 'vitalidade', 1, 'geral');
  const comVitalidade = regras.calcular(p, catalogo);

  assert.equal(comVitalidade.pvMaximos, base.pvMaximos + 7);
  assert.equal(base.cdRecuperacaoAjuste, 0);
  assert.equal(comVitalidade.cdRecuperacaoAjuste, -1);
  assert.equal(comVitalidade.limiteMorrendo, base.limiteMorrendo);
});

test('Duro de Matar aumenta o limite de morrendo de 4 para 5, sem acumular duplicatas', () => {
  const p = ficha();
  assert.equal(regras.calcular(p, catalogo).limiteMorrendo, 4);
  adicionarTalento(p, 'duro-de-matar', 1, 'geral');
  adicionarTalento(p, 'duro-de-matar', 1, 'geral');
  assert.equal(regras.calcular(p, catalogo).limiteMorrendo, 5);
});

test('Carregador Robusto desloca ambos os limites de carga e evita sobrecarga no novo intervalo', () => {
  const p = ficha();
  p.equipamentos = [{ id: 'carga-dez', quantidade: 1 }];
  const base = regras.calcular(p, catalogo);
  assert.deepEqual(
    { sobrecarga: base.carga.limiteSobrecarga, maximo: base.carga.limiteMaximo, sobrecarregado: base.carga.sobrecarregado },
    { sobrecarga: 9, maximo: 14, sobrecarregado: true },
  );

  adicionarTalento(p, 'carregador-robusto', 1, 'pericia');
  const robusto = regras.calcular(p, catalogo);
  assert.deepEqual(
    { sobrecarga: robusto.carga.limiteSobrecarga, maximo: robusto.carga.limiteMaximo, sobrecarregado: robusto.carga.sobrecarregado },
    { sobrecarga: 11, maximo: 16, sobrecarregado: false },
  );
});

test('Iniciativa Incrível mantém Percepção intacta e expõe +2 somente para iniciativa', () => {
  const p = ficha();
  const base = regras.calcular(p, catalogo);
  adicionarTalento(p, 'iniciativa-incrivel', 1, 'geral');
  const incrivel = regras.calcular(p, catalogo);

  assert.equal(incrivel.bonusIniciativa, 2);
  assert.equal(incrivel.percepcao, base.percepcao);
  assert.equal(incrivel.pericias.furtividade, base.pericias.furtividade);
});

test('Improvisação Destreinada aplica os três patamares sem tornar a perícia treinada', () => {
  const esperados = [[3, 1], [5, 4], [7, 7]] as const;
  for (const [nivel, bonus] of esperados) {
    const p = ficha(nivel);
    adicionarTalento(p, 'improvisacao-destreinada', 3, 'geral');
    const calculo = regras.calcular(p, catalogo);
    assert.equal(calculo.grausPericias.arcanismo, 0, `graduação no nível ${nivel}`);
    assert.equal(calculo.pericias.arcanismo, bonus, `bônus no nível ${nivel}`);
  }
});

test('Epítome cria slot no nível de aquisição, mas limita a escolha a talento ancestral de 1º', () => {
  const p = ficha(3);
  adicionarTalento(p, 'ancestral-1', 1, 'ancestralidade');
  adicionarTalento(p, 'epitome-da-ancestralidade', 3, 'geral');
  const origem = 'geral:epitome-da-ancestralidade';

  const slot = regras.escolhasTalentos(p, catalogo).find(s => s.origem === origem);
  assert.deepEqual(slot, { tipo: 'ancestralidade', nivel: 3, origem, quantidade: 1, nivelMaximoTalento: 1 });

  adicionarTalento(p, 'ancestral-1', 3, 'ancestralidade', origem);
  assert.doesNotMatch(regras.validar(p, catalogo).erros.join(' '), /excede o nível máximo/);

  p.talentos[p.talentos.length - 1].id = 'ancestral-5';
  assert.match(regras.validar(p, catalogo).erros.join(' '), /excede o nível máximo permitido/);
});

test('Perspicácia Astuta melhora apenas a defesa escolhida e progride a mestre no 17º', () => {
  for (const [nivel, grauFortitude] of [[1, 2], [17, 3]] as const) {
    const p = ficha(nivel);
    adicionarTalento(p, 'perspicacia-astuta', 1, 'geral');
    p.escolhasClasse = { 'defesa-perspicacia': 'fortitude' };
    const proficiencias = regras.calcular(p, catalogo).proficiencias as {
      percepcao: number;
      salvaguardas: Record<string, number>;
    };

    assert.equal(proficiencias.salvaguardas.fortitude, grauFortitude, `Fortitude no nível ${nivel}`);
    assert.equal(proficiencias.salvaguardas.reflexos, 1, `Reflexos no nível ${nivel}`);
    assert.equal(proficiencias.salvaguardas.vontade, 1, `Vontade no nível ${nivel}`);
    assert.equal(proficiencias.percepcao, 1, `Percepção no nível ${nivel}`);
  }
});
