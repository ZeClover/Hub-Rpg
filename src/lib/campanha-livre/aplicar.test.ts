import assert from "node:assert/strict";
import { test } from "node:test";

import { aplicarMudancas } from "./aplicar.ts";
import { interpretarHubUpdate, type Mudanca } from "./parser.ts";
import { novoPersonagemLivre } from "./tipos.ts";
import { validarContraPersonagem } from "./validar.ts";

function bloco(corpo: string): string {
  return `[HUB_UPDATE]\nversion: 1\n\n${corpo}\n[/HUB_UPDATE]`;
}

function mudancasDe(corpo: string): Mudanca[] {
  const r = interpretarHubUpdate(bloco(corpo));
  if (!r.ok) throw new Error(r.erro);
  return r.mudancas;
}

test("aplica xp add", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados, resumos } = aplicarMudancas(ficha, mudancasDe("xp:\n  add: 25"));
  assert.equal(dados.xp, 35);
  assert.match(resumos[0], /10 → 35/);
});

test("aplica xp remove e set", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 50;
  assert.equal(aplicarMudancas(ficha, mudancasDe("xp:\n  remove: 20")).dados.xp, 30);
  assert.equal(aplicarMudancas(ficha, mudancasDe("xp:\n  set: 5")).dados.xp, 5);
});

test("aplica recurso change criando o recurso se não existir", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("resources:\n  mana:\n    change: 10"));
  assert.deepEqual(dados.recursos.mana, { atual: 10, maximo: null });
});

test("aplica recurso change num recurso existente, preservando o máximo", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 35, maximo: 40 };
  const { dados } = aplicarMudancas(ficha, mudancasDe("resources:\n  mana:\n    change: -5"));
  assert.deepEqual(dados.recursos.mana, { atual: 30, maximo: 40 });
});

test("aplica item_add novo e empilha em item existente", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancas(ficha, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 1"));
  assert.equal(primeiro.dados.inventario.length, 1);
  assert.equal(primeiro.dados.inventario[0].quantidade, 1);

  const segundo = aplicarMudancas(primeiro.dados, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 2"));
  assert.equal(segundo.dados.inventario.length, 1);
  assert.equal(segundo.dados.inventario[0].quantidade, 3);
});

test("aplica item_remove reduzindo e removendo do inventário ao zerar", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Poção Pequena", quantidade: 2 });
  const { dados } = aplicarMudancas(ficha, mudancasDe("items_remove:\n  - name: Poção Pequena\n    quantity: 1"));
  assert.equal(dados.inventario[0].quantidade, 1);

  const { dados: dados2 } = aplicarMudancas(dados, mudancasDe("items_remove:\n  - name: Poção Pequena\n    quantity: 1"));
  assert.equal(dados2.inventario.length, 0);
});

test("nunca aplica mudança com erro, mesmo que venha selecionada", () => {
  const ficha = novoPersonagemLivre("Zé");
  const mudancas = mudancasDe("items_remove:\n  - name: Item Inexistente\n    quantity: 1");
  const validadas = validarContraPersonagem(mudancas, ficha);
  const { dados, resumos } = aplicarMudancas(ficha, validadas);
  assert.equal(dados.inventario.length, 0);
  assert.equal(resumos.length, 0);
});

test("aplica notes_add", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("notes_add:\n  - title: Coesão\n    text: Mantém a estrutura."));
  assert.equal(dados.notas.length, 1);
  assert.equal(dados.notas[0].titulo, "Coesão");
});

test("aplicação parcial: mudanças válidas aplicam mesmo com uma inválida no lote", () => {
  const ficha = novoPersonagemLivre("Zé");
  const mudancas = mudancasDe("xp:\n  add: 10\n\nitems_remove:\n  - name: Item Inexistente\n    quantity: 1");
  const validadas = validarContraPersonagem(mudancas, ficha);
  const { dados, resumos } = aplicarMudancas(ficha, validadas);
  assert.equal(dados.xp, 10);
  assert.equal(resumos.length, 1);
});

test("não muta o objeto original", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Poção", quantidade: 1 });
  const congelado = JSON.parse(JSON.stringify(ficha));
  aplicarMudancas(ficha, mudancasDe("items_add:\n  - name: Poção\n    quantity: 1"));
  assert.deepEqual(ficha, congelado);
});

test("aplica level change e set", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.nivel = 3;
  assert.equal(aplicarMudancas(ficha, mudancasDe("level:\n  change: 1")).dados.nivel, 4);
  assert.equal(aplicarMudancas(ficha, mudancasDe("level:\n  set: 10")).dados.nivel, 10);
});

test("aplica attributes criando o atributo se não existir e somando se já existir", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancas(ficha, mudancasDe("attributes:\n  - attribute: INT\n    change: 1"));
  assert.equal(primeiro.dados.atributos.INT, 1);
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe("attributes:\n  - attribute: INT\n    change: 2"));
  assert.equal(segundo.dados.atributos.INT, 3);
});

test("aplica items_update trocando só os campos enviados", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Luva Catalisadora", quantidade: 1, categoria: "equipamento" });
  const { dados, resumos } = aplicarMudancas(
    ficha,
    mudancasDe("items_update:\n  - name: Luva Catalisadora\n    changes:\n      equipped: true\n      description: Catalisador principal."),
  );
  assert.equal(dados.inventario[0].equipado, true);
  assert.equal(dados.inventario[0].descricao, "Catalisador principal.");
  assert.equal(dados.inventario[0].categoria, "equipamento");
  assert.match(resumos[0], /atualizado/);
});

test("aplica equipment.equip e equipment.unequip", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Luva Catalisadora", quantidade: 1 });
  const { dados } = aplicarMudancas(ficha, mudancasDe("equipment:\n  equip:\n    - item: Luva Catalisadora\n      slot: hand"));
  assert.equal(dados.inventario[0].equipado, true);
  assert.equal(dados.inventario[0].slot, "hand");

  const { dados: dados2 } = aplicarMudancas(dados, mudancasDe("equipment:\n  unequip:\n    - item: Luva Catalisadora"));
  assert.equal(dados2.inventario[0].equipado, false);
  assert.equal(dados2.inventario[0].slot, undefined);
});

test("aplica currency change criando a moeda se não existir", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("currency:\n  berries:\n    change: 500000"));
  assert.equal(dados.moedas.berries, 500000);
});

test("aplica missions_add com objetivos", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados, resumos } = aplicarMudancas(
    ficha,
    mudancasDe("missions_add:\n  - name: Pesquisa\n    status: active\n    objectives:\n      - text: Testar coesão"),
  );
  assert.equal(dados.missoes.length, 1);
  assert.equal(dados.missoes[0].nome, "Pesquisa");
  assert.equal(dados.missoes[0].status, "ativa");
  assert.deepEqual(dados.missoes[0].objetivos, [{ texto: "Testar coesão", status: "pendente" }]);
  assert.match(resumos[0], /Nova missão/);
});

test("missions_add não duplica missão com mesmo nome", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancas(ficha, mudancasDe("missions_add:\n  - name: Pesquisa"));
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe("missions_add:\n  - name: Pesquisa"));
  assert.equal(segundo.dados.missoes.length, 1);
});

test("aplica missions_update: complete_objective, set_status, append_note, add_reward", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados: d1 } = aplicarMudancas(ficha, mudancasDe("missions_add:\n  - name: Pesquisa\n    objectives:\n      - text: Testar coesão"));

  const { dados: d2 } = aplicarMudancas(d1, mudancasDe("missions_update:\n  - name: Pesquisa\n    action: complete_objective\n    objective: Testar coesão"));
  assert.equal(d2.missoes[0].objetivos[0].status, "concluido");

  const { dados: d3 } = aplicarMudancas(d2, mudancasDe("missions_update:\n  - name: Pesquisa\n    action: set_status\n    status: completed"));
  assert.equal(d3.missoes[0].status, "concluida");

  const { dados: d4 } = aplicarMudancas(d3, mudancasDe("missions_update:\n  - name: Pesquisa\n    action: append_note\n    note: Concluída com sucesso."));
  assert.deepEqual(d4.missoes[0].anotacoes, ["Concluída com sucesso."]);

  const { dados: d5 } = aplicarMudancas(d4, mudancasDe("missions_update:\n  - name: Pesquisa\n    action: add_reward\n    reward: 100 berries"));
  assert.deepEqual(d5.missoes[0].recompensas, ["100 berries"]);
});

test("aplica npcs_add e npcs_update", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados: d1 } = aplicarMudancas(ficha, mudancasDe("npcs_add:\n  - name: Lina\n    description: Estudante."));
  assert.equal(d1.npcs.length, 1);
  assert.equal(d1.npcs[0].nome, "Lina");

  const { dados: d2 } = aplicarMudancas(d1, mudancasDe("npcs_update:\n  - name: Lina\n    known_information_add:\n      - Faz muitas anotações."));
  assert.deepEqual(d2.npcs[0].conhecimento, ["Faz muitas anotações."]);
});

test("npcs_add não duplica NPC com mesmo nome", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancas(ficha, mudancasDe("npcs_add:\n  - name: Lina"));
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe("npcs_add:\n  - name: Lina"));
  assert.equal(segundo.dados.npcs.length, 1);
});

test("aplica relationships somando ao stat existente", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.npcs.push({ id: "n1", nome: "Lina", conhecimento: [], relacoes: { trust: 2 }, criadoEm: 1 });
  const { dados, resumos } = aplicarMudancas(ficha, mudancasDe("relationships:\n  - npc: Lina\n    stat: trust\n    change: 1"));
  assert.equal(dados.npcs[0].relacoes.trust, 3);
  assert.match(resumos[0], /2 → 3/);
});
