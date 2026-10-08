import assert from "node:assert/strict";
import test from "node:test";
import { FAMILIAS_HOGWARTS, validarFamiliaCustom } from "./familias.ts";

test("catálogo compartilhado inclui Scamander e seus três estágios de Herança", () => {
  const scamander = FAMILIAS_HOGWARTS.find((familia) => familia.chave === "scamander");
  assert.ok(scamander);
  assert.match(scamander.conteudoFamiliar, /Olho de Criador/);
  assert.match(scamander.acessoFamiliar, /Rede de Criadores/);
  assert.deepEqual(scamander.herancas, ["Legado dos Criadores", "Confiança Conquistada", "Guardião de Criaturas"]);
});

test("família própria recebe chave estável e campos limitados", () => {
  const familia = validarFamiliaCustom({ nome: "  Flores do Vale ", tipo: "Original", condicaoFinanceira: "Modesta", tags: [" Botânica ", ""], conteudoFamiliar: "Conhece plantas raras", acessoFamiliar: "Tem contato com herbologistas", herancas: ["Semente", "Raiz"] });
  assert.equal(familia.chave, "custom-flores-do-vale");
  assert.deepEqual(familia.tags, ["Botânica"]);
  assert.deepEqual(familia.herancas, ["Semente", "Raiz"]);
  assert.throws(() => validarFamiliaCustom({ nome: "X", conteudoFamiliar: "ok", acessoFamiliar: "ok" }), /nome/);
});
