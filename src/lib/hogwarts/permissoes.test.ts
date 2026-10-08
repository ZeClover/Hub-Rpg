import assert from "node:assert/strict";
import test from "node:test";
import { podeExecutarAcaoHogwarts } from "./permissoes.ts";

test("mestre e auxiliar executam ações autoritativas", () => {
  for (const papel of ["MESTRE", "MESTRE_AUXILIAR"] as const) {
    assert.equal(podeExecutarAcaoHogwarts(papel, "progressao.aplicar"), true);
    assert.equal(podeExecutarAcaoHogwarts(papel, "bestiario.revelar"), true);
  }
});

test("jogador só edita o próprio perfil, usa recursos e confirma formação", () => {
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "perfil.editar", { ehDono: true }), true);
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "recurso.usar", { ehDono: true }), true);
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "formacao.confirmar", { ehDono: true }), true);
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "economia.gerenciar", { ehDono: true }), false);
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "academico.gerenciar", { ehDono: true }), false);
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "segredo.ler", { ehDono: true }), false);
});

test("visitante e jogador de outra ficha não alteram estado", () => {
  assert.equal(podeExecutarAcaoHogwarts(null, "perfil.editar", { ehDono: true }), false);
  assert.equal(podeExecutarAcaoHogwarts("JOGADOR", "perfil.editar", { ehDono: false }), false);
});
