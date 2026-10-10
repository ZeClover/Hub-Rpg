import test from "node:test";
import assert from "node:assert/strict";
import { SISTEMAS, SISTEMAS_CATALOGO, SISTEMAS_COM_HUB } from "./sistemas.ts";

test("Wands & Wizards substitui Hogwarts no catálogo sem perder os caminhos antigos", () => {
  assert.equal(SISTEMAS_CATALOGO.filter(s => s.chave === "wands-wizards").length, 1);
  assert.equal(SISTEMAS_CATALOGO.some(s => s.chave === "hogwarts-rpg"), false);
  const anterior = SISTEMAS.find(s => s.chave === "hogwarts-rpg");
  assert.equal(anterior?.ficha, "/hogwarts-rpg.html");
  assert.equal(anterior?.modoSessao, "/hogwarts-rpg-mestre.html");
  assert.equal(anterior?.grimorio, "/hogwarts-rpg-grimorio.html");
});
test("criação na conta não oferece versões antigas e oferece a prévia Wands & Wizards", () => {
  assert.equal(SISTEMAS_COM_HUB.some(s => s.chave === "hogwarts-rpg"), false);
  assert.equal(SISTEMAS_COM_HUB.some(s => s.chave === "wands-wizards"), true);
  assert.ok(SISTEMAS_COM_HUB.every(s => s.ficha && s.salvaNoHub && !s.legado));
});
