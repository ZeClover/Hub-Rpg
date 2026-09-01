import assert from "node:assert/strict";
import { test } from "node:test";

import { interpretarHubUpdate } from "./parser.ts";
import { novoPersonagemLivre } from "./tipos.ts";
import { temErro, validarContraPersonagem } from "./validar.ts";

function bloco(corpo: string): string {
  return `[HUB_UPDATE]\nversion: 1\n\n${corpo}\n[/HUB_UPDATE]`;
}

test("mana insuficiente vira warning, não bloqueia", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 3, maximo: 30 };
  const r = interpretarHubUpdate(bloco("resources:\n  mana:\n    change: -10"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.ok(validadas[0].alertas.some((a) => a.nivel === "warning"));
  assert.equal(temErro(validadas[0]), false);
});

test("remover item inexistente vira error e não é aplicável", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("items_remove:\n  - name: Item Que Não Existe\n    quantity: 1"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("remover mais do que existe vira warning (zera, não deixa negativo)", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Poção Pequena", quantidade: 1 });
  const r = interpretarHubUpdate(bloco("items_remove:\n  - name: Poção Pequena\n    quantity: 5"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), false);
  assert.ok(validadas[0].alertas.some((a) => a.nivel === "warning"));
});

test("recurso passando do máximo vira warning", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 28, maximo: 30 };
  const r = interpretarHubUpdate(bloco("resources:\n  mana:\n    change: 8"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.ok(validadas[0].alertas.some((a) => a.nivel === "warning"));
});

test("remover item existente em quantidade exata não gera alerta extra", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Poção Pequena", quantidade: 1 });
  const r = interpretarHubUpdate(bloco("items_remove:\n  - name: Poção Pequena\n    quantity: 1"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(validadas[0].alertas.length, 0);
});
