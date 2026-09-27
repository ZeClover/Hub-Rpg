import assert from "node:assert/strict";
import test from "node:test";
import { CONTEUDOS_HOGWARTS_1_ANO, MATERIAS_HOGWARTS_1_ANO } from "./conteudos-primeiro-ano.ts";

test("catálogo do 1º ano contém 59 slugs únicos", () => {
  assert.equal(CONTEUDOS_HOGWARTS_1_ANO.length, 59);
  assert.equal(new Set(CONTEUDOS_HOGWARTS_1_ANO.map((c) => c.slug)).size, 59);
});

test("distribuição acadêmica e geral corresponde ao documento", () => {
  const esperado: Record<string, number> = {
    "Feitiços": 9, "Transfiguração": 6, "Poções": 6, "Herbologia": 7,
    "Defesa Contra as Artes das Trevas": 7, "História da Magia": 6,
    "Astronomia": 6, "Voo": 6, "Investigação": 2, "Furtividade": 2, "Influência": 2,
  };
  for (const [pericia, total] of Object.entries(esperado)) {
    assert.equal(CONTEUDOS_HOGWARTS_1_ANO.filter((c) => c.pericia === pericia).length, total, pericia);
  }
  assert.equal(CONTEUDOS_HOGWARTS_1_ANO.filter((c) => MATERIAS_HOGWARTS_1_ANO.includes(c.pericia as never)).length, 53);
});

test("itens pedidos no aceite existem e todo item tem campos mínimos", () => {
  for (const slug of ["colheita-segura", "controle-de-caldeirao", "pesquisa-arquivistica", "recuperacao-aerea", "negociacao"]) {
    assert.ok(CONTEUDOS_HOGWARTS_1_ANO.some((c) => c.slug === slug), slug);
  }
  for (const c of CONTEUDOS_HOGWARTS_1_ANO) {
    assert.ok(c.nome && c.categoria && c.pericia && c.atributo_padrao && c.descricao && c.efeito && c.fonte);
    assert.equal(c.ano_normal, 1);
  }
});
