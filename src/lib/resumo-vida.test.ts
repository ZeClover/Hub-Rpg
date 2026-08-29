import assert from "node:assert/strict";
import { test } from "node:test";

import { escreverNoCaminho, lerResumoVida, vidaComDelta } from "./resumo-vida.ts";

test("lê um resumoVida válido", () => {
  const dados = { resumoVida: { atual: 12, maxima: 20, rotulo: "PV" } };
  assert.deepEqual(lerResumoVida(dados), { atual: 12, maxima: 20, rotulo: "PV" });
});

test("ficha sem resumoVida devolve null", () => {
  assert.equal(lerResumoVida({}), null);
  assert.equal(lerResumoVida(null), null);
});

test("resumoVida malformado devolve null", () => {
  assert.equal(lerResumoVida({ resumoVida: { atual: "12", maxima: 20, rotulo: "PV" } }), null);
  assert.equal(lerResumoVida({ resumoVida: { atual: 12 } }), null);
});

test("vidaComDelta soma sem passar da máxima", () => {
  const resumo = { atual: 18, maxima: 20, rotulo: "PV" };
  assert.equal(vidaComDelta(resumo, 5), 20);
});

test("vidaComDelta subtrai sem passar de zero", () => {
  const resumo = { atual: 3, maxima: 20, rotulo: "PV" };
  assert.equal(vidaComDelta(resumo, -10), 0);
});

test("vidaComDelta dentro da faixa aplica o delta cheio", () => {
  const resumo = { atual: 10, maxima: 20, rotulo: "PV" };
  assert.equal(vidaComDelta(resumo, -4), 6);
});

test("escreverNoCaminho grava num campo já existente", () => {
  const dados: Record<string, unknown> = { atual: { pv: 8 } };
  escreverNoCaminho(dados, ["atual", "pv"], 3);
  assert.deepEqual(dados, { atual: { pv: 3 } });
});

test("escreverNoCaminho cria objetos intermediários que faltarem", () => {
  const dados: Record<string, unknown> = {};
  escreverNoCaminho(dados, ["atual", "pv"], 7);
  assert.deepEqual(dados, { atual: { pv: 7 } });
});

test("escreverNoCaminho com caminho de um campo só", () => {
  const dados: Record<string, unknown> = { pvAtual: 30 };
  escreverNoCaminho(dados, ["pvAtual"], 15);
  assert.deepEqual(dados, { pvAtual: 15 });
});
