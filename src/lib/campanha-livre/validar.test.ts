import assert from "node:assert/strict";
import { test } from "node:test";

import { aplicarMudancas } from "./aplicar.ts";
import { interpretarHubUpdate } from "./parser.ts";
import { novoPersonagemLivre } from "./tipos.ts";
import { temErro, validarContraPersonagem } from "./validar.ts";

function bloco(corpo: string): string {
  return `[HUB_UPDATE]\nversion: 1\n\n${corpo}\n[/HUB_UPDATE]`;
}

test("mana insuficiente vira warning, não bloqueia", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 3, maximo: 30, minimo: 0 };
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
  ficha.recursos.mana = { atual: 28, maximo: 30, minimo: null };
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

test("notes_update em colinha inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("notes_update:\n  - title: Colinha Fantasma\n    append: Mais texto."));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("notes_update em colinha existente não gera erro", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.notas.push({ id: "n1", titulo: "Coesão", texto: "texto original", criadaEm: 1 });
  const r = interpretarHubUpdate(bloco("notes_update:\n  - title: Coesão\n    append: Mais texto."));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), false);
});

test("notes_remove em colinha inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("notes_remove:\n  - title: Colinha Fantasma"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("discoveries_update em descoberta inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("discoveries_update:\n  - title: Descoberta Fantasma\n    status: confirmed"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("locations_update em local inexistente vira error", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("locations_update:\n  - name: Local Fantasma\n    known_information_add:\n      - Algo."));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(temErro(validadas[0]), true);
});

test("recurso indo negativo AVISA mesmo quando ainda não existe na ficha (bug relatado: mana 0 → -3 sem warning)", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("resources:\n  mana:\n    change: -3"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.ok(validadas[0].alertas.some((a) => a.nivel === "warning"), "deveria avisar que mana vai ficar negativa");
  assert.equal(temErro(validadas[0]), false);
});

test("recurso com mínimo configurado abaixo do mínimo gera warning específico", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 2, maximo: 30, minimo: 0 };
  const r = interpretarHubUpdate(bloco("resources:\n  mana:\n    change: -5"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.ok(validadas[0].alertas.some((a) => a.nivel === "warning" && a.mensagem.includes("mínimo")));
});

test("recurso sem mínimo configurado não avisa se ficar negativo mas dentro de um mínimo customizado negativo", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.corrupcao = { atual: 2, maximo: null, minimo: -10 };
  const r = interpretarHubUpdate(bloco("resources:\n  corrupcao:\n    change: -5"));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const validadas = validarContraPersonagem(r.mudancas, ficha);
  assert.equal(validadas[0].alertas.length, 0, "-3 está acima do mínimo -10 configurado, não deveria avisar");
});

test("projetado resolve dependência: relationships pra um NPC criado no mesmo lote não gera erro", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(bloco("npcs_add:\n  - name: Mira Teste\n\nrelationships:\n  - npc: Mira Teste\n    stat: trust\n    change: 1"));
  assert.equal(r.ok, true);
  if (!r.ok) return;

  // sem projetado (comportamento antigo): a relação erra, porque Mira Teste só existe depois do npcs_add
  const semProjecao = validarContraPersonagem(r.mudancas, ficha);
  const relacaoSemProjecao = semProjecao.find((m) => m.tipo === "relacao")!;
  assert.equal(temErro(relacaoSemProjecao), true);

  // com projetado incluindo o npcs_add selecionado: a relação passa a ser válida
  const npcAdd = r.mudancas.find((m) => m.tipo === "npc_add")!;
  const { dados: projetado } = aplicarMudancas(ficha, [npcAdd], "preview");
  const comProjecao = validarContraPersonagem(r.mudancas, ficha, projetado);
  const relacaoComProjecao = comProjecao.find((m) => m.tipo === "relacao")!;
  assert.equal(temErro(relacaoComProjecao), false);
});

test("projetado resolve dependência: items_update pra um item criado no mesmo lote não gera erro", () => {
  const ficha = novoPersonagemLivre("Zé");
  const r = interpretarHubUpdate(
    bloco("items_add:\n  - name: Fragmento Azul\n    quantity: 1\n\nitems_update:\n  - name: Fragmento Azul\n    changes:\n      equipped: true"),
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;

  const itemAdd = r.mudancas.find((m) => m.tipo === "item_add")!;
  const { dados: projetado } = aplicarMudancas(ficha, [itemAdd], "preview");
  const validadas = validarContraPersonagem(r.mudancas, ficha, projetado);
  const update = validadas.find((m) => m.tipo === "item_update")!;
  assert.equal(temErro(update), false);
});
