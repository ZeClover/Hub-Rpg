import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const R = require('../../../public/js/pathfinder-regras.js') as typeof import('../../../public/js/pathfinder-regras.js');
const catalogo = require('./catalogo-validacao.json');
function personagem() {
  const p = R.criar();
  Object.assign(p, { nivel: 9, ancestralidadeId: 'humano', classeId: 'guerreiro', atributoChave: 'for', armaduraId: 'couro', armaduraInvestida: true,
    runasEquipamento: { armadura: { potencia: 'runa-potencia-armadura-2', propriedade1: 'runa-sombra-maior' } } });
  p.pericias.furtividade = 1;
  return p;
}
function semPropriedades(p: ReturnType<typeof personagem>) {
  return { ...p, runasEquipamento: { armadura: { potencia: 'runa-potencia-armadura-2' } } };
}
test('sombra aplica o bônus de item correto com armadura compatível investida', () => {
  const p = personagem();
  assert.equal(R.calcular(p, catalogo).pericias.furtividade - R.calcular(semPropriedades(p), catalogo).pericias.furtividade, 2);
  assert.equal(R.calcular(p, catalogo).ca, R.calcular(semPropriedades(p), catalogo).ca);
});
test('sombra não concede bônus sem investimento ou em armadura pesada', () => {
  for (const patch of [{ armaduraInvestida: false }, { armaduraId: 'armadura-completa' }]) {
    const p = Object.assign(personagem(), patch);
    assert.equal(R.calcular(p, catalogo).pericias.furtividade, R.calcular(semPropriedades(p), catalogo).pericias.furtividade);
  }
  assert(R.validar(Object.assign(personagem(), { armaduraId: 'armadura-completa' }), catalogo).erros.some(e => e.includes('categoria de armadura')));
});
test('propriedades sem potência ou em excesso não são aplicadas silenciosamente', () => {
  const p = personagem();
  p.runasEquipamento = { armadura: { propriedade1: 'runa-sombra' } };
  assert(R.validar(p, catalogo).erros.some(e => e.includes('excede a potência')));
  const sem = { ...p, runasEquipamento: {} };
  assert.equal(R.calcular(p, catalogo).pericias.furtividade, R.calcular(sem, catalogo).pericias.furtividade);
});
test('versões da mesma propriedade não se acumulam nem ocupam vagas como diferentes', () => {
  const p = personagem();
  p.runasEquipamento = { armadura: { potencia: 'runa-potencia-armadura-2', propriedade1: 'runa-sombra', propriedade2: 'runa-sombra-maior' } };
  assert(R.validar(p, catalogo).erros.some(e => e.includes('mesma propriedade')));
  assert.equal(R.calcular(p, catalogo).pericias.furtividade, R.calcular(semPropriedades(p), catalogo).pericias.furtividade);
});
test('bônus de item da propriedade não acumula com outro bônus de item maior', () => {
  const p = personagem();
  p.bonusAprovadosPeloMestre = true;
  p.bonus = [{ alvo: 'pericia:furtividade', tipo: 'item', valor: 3 }];
  assert.equal(R.calcular(p, catalogo).pericias.furtividade, R.calcular(semPropriedades(p), catalogo).pericias.furtividade);
});
