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

test("items_update em item inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("items_update:\n  - name: Item Que Não Existe\n    changes:\n      equipped: true"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("items_update em item existente não gera erro", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Luva Catalisadora", quantidade: 1 });
  const r = interpretarHubUpdate(bloco("items_update:\n  - name: Luva Catalisadora\n    changes:\n      equipped: true"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), false);
});

test("equipar item inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("equipment:\n  equip:\n    - item: Luva Catalisadora\n      slot: hand"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("moeda ficando negativa vira warning, não bloqueia", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.moedas.berries = 100;
  const r = interpretarHubUpdate(bloco("currency:\n  berries:\n    change: -500"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.ok(validadas[0].alertas.some((a) => a.nivel === "warning"));
  assert.equal(temErro(validadas[0]), false);
});

test("missions_update em missão inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("missions_update:\n  - name: Missão Fantasma\n    action: set_status\n    status: completed"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("complete_objective em objetivo inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.missoes.push({
    id: "m1",
    nome: "Pesquisa",
    status: "ativa",
    objetivos: [{ texto: "Testar coesão", status: "pendente" }],
    recompensas: [],
    anotacoes: [],
    criadaEm: 1,
  });
  const r = interpretarHubUpdate(bloco("missions_update:\n  - name: Pesquisa\n    action: complete_objective\n    objective: Objetivo que não existe"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("complete_objective em objetivo existente não gera erro", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.missoes.push({
    id: "m1",
    nome: "Pesquisa",
    status: "ativa",
    objetivos: [{ texto: "Testar coesão", status: "pendente" }],
    recompensas: [],
    anotacoes: [],
    criadaEm: 1,
  });
  const r = interpretarHubUpdate(bloco("missions_update:\n  - name: Pesquisa\n    action: complete_objective\n    objective: Testar coesão"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), false);
});

test("npcs_update em NPC inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("npcs_update:\n  - name: Lina\n    known_information_add:\n      - Algo novo."));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("relationships com NPC inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("relationships:\n  - npc: Lina\n    stat: trust\n    change: 1"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("relationships com NPC existente não gera erro", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.npcs.push({ id: "n1", nome: "Lina", conhecimento: [], relacoes: {}, criadoEm: 1 });
  const r = interpretarHubUpdate(bloco("relationships:\n  - npc: Lina\n    stat: trust\n    change: 1"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), false);
});
