import assert from 'node:assert/strict';
import test from 'node:test';
import { estadoAposAula } from './curriculo.ts';
test('aula libera para aptos e bloqueia inaptos sem conceder conhecimento', () => {
  assert.equal(estadoAposAula(undefined, 'ensinar', true), 'disponivel');
  assert.equal(estadoAposAula(undefined, 'ensinar', false), 'bloqueado');
});
test('liberação e concessão preservam domínio, assinatura e formação', () => {
  for (const estado of ['dominado', 'assinatura', 'formacao-inicial']) {
    assert.equal(estadoAposAula(estado, 'liberar', false), estado);
    assert.equal(estadoAposAula(estado, 'conceder', true), estado);
  }
});
test('promoção exige conhecimento e avança até assinatura', () => {
  assert.throws(() => estadoAposAula('disponivel', 'promover', true), /conhecido/);
  assert.equal(estadoAposAula('conhecido', 'promover', true), 'dominado');
  assert.equal(estadoAposAula('dominado', 'promover', true), 'assinatura');
  assert.equal(estadoAposAula('assinatura', 'promover', true), 'assinatura');
});
