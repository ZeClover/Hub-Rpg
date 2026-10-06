/* eslint-disable @typescript-eslint/no-require-imports -- Verificação executável CommonJS no Node. */
// Integra catálogo real ao motor: criação, evolução sem mutação e bloqueio de referências.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const R = require(path.join(root, 'public/js/pathfinder-regras.js'));
const c = JSON.parse(fs.readFileSync(path.join(root, 'public/pathfinder/player-core.json')));
for (const collection of ['classes', 'ancestralidades', 'biografias', 'talentos', 'magias', 'equipamentos']) {
  assert.equal(new Set(c[collection].map(r => r.id)).size, c[collection].length, `IDs duplicados: ${collection}`);
}
for (const r of [...c.talentos, ...c.magias].filter(r => r.somenteConsulta)) {
  assert.equal(r.revisao, 'material-indexado');
  assert.ok(r.secoes.length && r.descricao.includes('referência'));
  assert.ok(!r.requisitos, 'Referência não pode inferir pré-requisitos');
}
assert.equal(c.secoes.length, 470);
const magiasPorId = Object.fromEntries(c.magias.map(m => [m.id, m]));
for (const escola of c.classes.find(c => c.id === 'mago').opcoes) {
  if (escola.id === 'teoria-magica-unificada') continue;
  assert.equal(escola.magiasCurriculo.length, 10);
  for (const r of escola.magiasCurriculo) assert.ok(r.magias.every(id => magiasPorId[id]), 'Currículo sem referência canônica: ' + escola.id);
  for (const [ranque, quantidade] of [[0, 1], [1, 2]]) {
    const r = escola.magiasCurriculo.find(r => r.ranque === ranque);
    assert.ok(r.magias.filter(id => !magiasPorId[id].somenteConsulta).length >= quantidade, 'Currículo inicial sem opções revisadas: ' + escola.id);
  }
}

assert.ok(c.classes.every(r => r.progressao.length === 20));
function base() {
  const p = R.criar();
  Object.assign(p, { nome: 'Teste real do catálogo', ancestralidadeId: 'humano', herancaId: 'humano-perito', biografiaId: 'acrobata', escolhasHeranca: { pericia: 'furtividade' } });
  p.talentos = [{ id: 'humano-ambicao-natural', tipo: 'ancestralidade', nivel: 1 }, { id: 'equilibrio-estavel', tipo: 'pericia', nivel: 1, origem: 'biografia' }];
  return p;
}
const p = base();
Object.assign(p, { classeId: 'guerreiro', atributoChave: 'for', escolhasClasse: { periciaInicial: 'atletismo' }, armaduraId: 'cota-de-escamas', armaId: 'espada-longa' });
p.incrementos = { ancestralidade: ['for', 'con'], biografia: ['for', 'des'], classe: ['for'], livres: ['for', 'con', 'int', 'des'], nivel: {} };
for (const s of ['furtividade', 'intimidacao', 'sociedade', 'medicina', 'sobrevivencia']) p.pericias[s] = 1;
p.talentos.push({ id: 'guerreiro-investida-subita', tipo: 'classe', nivel: 1 }, { id: 'guerreiro-corte-duplo', tipo: 'classe', nivel: 1, origem: 'ancestralidade:humano-ambicao-natural' });
assert.deepEqual(R.validar(p, c), { valido: true, erros: [], avisos: [], pendencias: [] });
const before = JSON.stringify(p);
const q = R.evoluir(p, 2, c);
q.talentos.push({ id: 'guerreiro-aparagem-de-duelo', tipo: 'classe', nivel: 2 }, { id: 'queda-do-gato', tipo: 'pericia', nivel: 2 });
assert.equal(R.validar(q, c).valido, true, JSON.stringify(R.validar(q, c)));
assert.equal(JSON.stringify(p), before, 'Evolução não pode alterar a ficha anterior');
assert.equal(R.calcular(q, c).pvMaximos - R.calcular(p, c).pvMaximos, 12);
const b = base();
Object.assign(b, { classeId: 'bardo', opcaoClasseId: 'enigma', atributoChave: 'car' });
b.incrementos = { ancestralidade: ['car', 'con'], biografia: ['des', 'car'], classe: ['car'], livres: ['car', 'des', 'con', 'int'], nivel: {} };
for (const s of ['furtividade', 'atletismo', 'intimidacao', 'sociedade', 'medicina', 'sobrevivencia']) b.pericias[s] = 1;
// Perícia Natural ocupa a escolha de ancestralidade, sem criar um talento extra de classe.
b.talentos = b.talentos.filter(t => t.id !== 'humano-ambicao-natural');
b.talentos.push({ id: 'humano-pericia-natural', tipo: 'ancestralidade', nivel: 1 });
b.pericias.arcanismo = 1; b.pericias.ladroagem = 1;
b.magias = ['detectar-magia', 'luz', 'mao-telecinetica', 'escudo-mistico', 'prestidigitacao', 'medo', 'abrandar'].map(id => ({ id }));
assert.equal(R.validar(b, c).valido, true, JSON.stringify(R.validar(b, c)));
const consult = c.magias.find(m => m.somenteConsulta);
b.magias.push({ id: consult.id });
assert.ok(R.validar(b, c).erros.some(s => s.includes('apenas para consulta')));
console.log('Catálogo real: Guerreiro 1→2, Bardo 1, evolução sem mutação, 470 páginas e bloqueio de índices passaram.');
