import assert from "node:assert/strict";
import test from "node:test";
import { aplicarProgressaoHogwarts } from "./progressao.ts";

function base(nivel = 1) {
  return {
    nivel,
    atributos: { Arcano: 3, Engenho: 2, Pulso: 2, Presença: 1, Fibra: 0 },
    pericias: { "Feitiços": 1, "Herbologia": 1, "Voo": 1 },
    conteudosConhecidos: { "reparo": "disponivel", "cultivo-basico": "disponivel" },
    unicosAdquiridos: {},
    academico: { criacaoFinalizada: true },
  };
}

test("nível comum concede exatamente perícia e dois Conteúdos", () => {
  const novo = aplicarProgressaoHogwarts(base(), { pericia: "Feitiços", conteudos: ["reparo", "cultivo-basico"] });
  assert.equal(novo.nivel, 2);
  assert.equal(novo.pericias?.["Feitiços"], 2);
  assert.equal(novo.conteudosConhecidos?.reparo, "conhecido");
  assert.equal(novo.conteudosConhecidos?.["cultivo-basico"], "conhecido");
});

test("nível 5 concede atributo e dois pontos Únicos sem pacote comum", () => {
  const antigo = base(4);
  const novo = aplicarProgressaoHogwarts(antigo, { atributo: "Fibra", unicos: ["patrono-corporeo", "guardiao-patronal"] });
  assert.equal(novo.nivel, 5);
  assert.equal(novo.atributos?.Fibra, 1);
  assert.equal((novo.unicosAdquiridos as Record<string, boolean>)["patrono-corporeo"], true);
  assert.deepEqual(novo.pericias, antigo.pericias);
});

test("falha sem aplicar pacote incompleto ou conteúdo indisponível", () => {
  assert.throws(() => aplicarProgressaoHogwarts(base(), { pericia: "Feitiços", conteudos: ["reparo"] }), /2 Conteúdos/);
  assert.throws(() => aplicarProgressaoHogwarts(base(), { pericia: "Feitiços", conteudos: ["reparo", "lumos-nox"] }), /não está disponível/);
});
