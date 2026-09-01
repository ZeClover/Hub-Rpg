import assert from "node:assert/strict";
import { test } from "node:test";

import { calcularHash, extrairBlocoHubUpdate, interpretarHubUpdate } from "./parser.ts";

function bloco(corpo: string): string {
  return `[HUB_UPDATE]\nversion: 1\nupdate_id: teste-001\ncampaign: academia-magica\ncharacter: ze\n\n${corpo}\n[/HUB_UPDATE]`;
}

test("detecta ausência de bloco", () => {
  const r = interpretarHubUpdate("Você recolhe o fragmento do chão. Nada mais acontece.");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.erro, /Nenhuma atualização/);
});

test("extrai o bloco de dentro de uma resposta maior, ignorando narrativa", () => {
  const texto = `Você recolhe o fragmento do chão. Lina começa a anotar.\n\n${bloco("xp:\n  add: 5")}\n\nMais texto depois.`;
  const r = interpretarHubUpdate(texto);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.mudancas.length, 1);
    assert.equal(r.mudancas[0].tipo, "xp");
  }
});

test("YAML inválido gera erro de parse, nada é aplicado", () => {
  const texto = "[HUB_UPDATE]\nversion: 1\ncampaign academia-magica\nxp:\n add banana\n[/HUB_UPDATE]";
  const r = interpretarHubUpdate(texto);
  assert.equal(r.ok, false);
});

test("exige version", () => {
  const r = interpretarHubUpdate("[HUB_UPDATE]\ncampaign: academia-magica\nxp:\n  add: 5\n[/HUB_UPDATE]");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.erro, /version/);
});

test("recusa versão desconhecida sem converter silenciosamente", () => {
  const r = interpretarHubUpdate("[HUB_UPDATE]\nversion: 2\nxp:\n  add: 5\n[/HUB_UPDATE]");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.erro, /ersão 2/);
});

test("bloco mínimo sem update_id é aceito", () => {
  const r = interpretarHubUpdate("[HUB_UPDATE]\nversion: 1\ncampaign: academia-magica\ncharacter: ze\n\nxp:\n  add: 5\n[/HUB_UPDATE]");
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.cabecalho.updateId, null);
});

test("xp: add válido", () => {
  const r = interpretarHubUpdate(bloco("xp:\n  add: 25\n  reason: Aula concluída"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "xp");
    if (m.tipo === "xp") {
      assert.equal(m.operacao, "add");
      assert.equal(m.valor, 25);
      assert.equal(m.motivo, "Aula concluída");
      assert.equal(m.alertas.length, 0);
    }
  }
});

test("xp: set gera warning", () => {
  const r = interpretarHubUpdate(bloco("xp:\n  set: 30"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.ok(m.alertas.some((a) => a.nivel === "warning"));
  }
});

test("xp: valor não numérico gera error", () => {
  const r = interpretarHubUpdate(bloco('xp:\n  add: "banana"'));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.ok(m.alertas.some((a) => a.nivel === "error"));
  }
});

test("resources: mana negativa (gasto) e positiva (recuperação)", () => {
  const r = interpretarHubUpdate(bloco("resources:\n  mana:\n    change: -4\n    reason: Uso de magia"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "recurso");
    if (m.tipo === "recurso") {
      assert.equal(m.nome, "mana");
      assert.equal(m.operacao, "change");
      assert.equal(m.valor, -4);
    }
  }
});

test("resources: recurso customizado não quebra o parser", () => {
  const r = interpretarHubUpdate(bloco("resources:\n  sanidade:\n    change: -2\n  corrupcao:\n    change: 1"));
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.mudancas.length, 2);
});

test("resources: set gera warning", () => {
  const r = interpretarHubUpdate(bloco("resources:\n  mana:\n    set: 35"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "warning"));
});

test("items_add: com quantidade", () => {
  const r = interpretarHubUpdate(bloco("items_add:\n  - name: Fragmento Arcano\n    quantity: 2\n    category: material"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "item_add");
    if (m.tipo === "item_add") {
      assert.equal(m.nome, "Fragmento Arcano");
      assert.equal(m.quantidade, 2);
      assert.equal(m.categoria, "material");
    }
  }
});

test("items_add: sem name nem id gera error", () => {
  const r = interpretarHubUpdate(bloco("items_add:\n  - quantity: 2"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("items_remove: motivo e quantidade", () => {
  const r = interpretarHubUpdate(bloco("items_remove:\n  - name: Poção Pequena\n    quantity: 1\n    reason: Consumida"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "item_remove");
    if (m.tipo === "item_remove") assert.equal(m.motivo, "Consumida");
  }
});

test("notes_add: com tags e flags", () => {
  const r = interpretarHubUpdate(
    bloco(
      "notes_add:\n  - title: Coesão\n    category: Fundamentos\n    text: Coesão mantém a estrutura.\n    tags:\n      - magia\n    flags:\n      important: true",
    ),
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "nota_add");
    if (m.tipo === "nota_add") {
      assert.deepEqual(m.tags, ["magia"]);
      assert.deepEqual(m.flags, { important: true });
    }
  }
});

test("notes_add: sem title nem text gera erros", () => {
  const r = interpretarHubUpdate(bloco("notes_add:\n  - category: Pesquisa"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const erros = r.mudancas[0].alertas.filter((a) => a.nivel === "error");
    assert.equal(erros.length, 2);
  }
});

test("múltiplas mudanças no mesmo bloco", () => {
  const r = interpretarHubUpdate(
    bloco(
      "xp:\n  add: 25\n\nresources:\n  mana:\n    change: -6\n\nitems_add:\n  - name: Fragmento Arcano\n    quantity: 2\n\nnotes_add:\n  - title: Fragmentos\n    text: Conservam resíduo mágico.",
    ),
  );
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.mudancas.length, 4);
});

test("campo desconhecido não crasha e não invalida os demais", () => {
  const r = interpretarHubUpdate(bloco("dragon_friendship:\n  change: 10\n\nxp:\n  add: 5"));
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.mudancas.length, 1);
    assert.deepEqual(r.camposDesconhecidos, ["dragon_friendship"]);
  }
});

test("hash é estável para o mesmo conteúdo e ignora espaços nas pontas", () => {
  const a = calcularHash("xp:\n  add: 5");
  const b = calcularHash("  xp:\n  add: 5  ");
  assert.equal(a, b);
});

test("hash muda quando o conteúdo muda", () => {
  const a = calcularHash("xp:\n  add: 5");
  const b = calcularHash("xp:\n  add: 6");
  assert.notEqual(a, b);
});

test("extrairBlocoHubUpdate devolve null sem delimitadores", () => {
  assert.equal(extrairBlocoHubUpdate("sem bloco nenhum aqui"), null);
});

test("level: change válido", () => {
  const r = interpretarHubUpdate(bloco("level:\n  change: 1\n  reason: Progressão"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "nivel");
    if (m.tipo === "nivel") {
      assert.equal(m.operacao, "change");
      assert.equal(m.valor, 1);
      assert.equal(m.motivo, "Progressão");
      assert.equal(m.alertas.length, 0);
    }
  }
});

test("level: sem change nem set gera error", () => {
  const r = interpretarHubUpdate(bloco("level:\n  reason: Progressão"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("attributes: change com reason", () => {
  const r = interpretarHubUpdate(bloco("attributes:\n  - attribute: INT\n    change: 1\n    reason: Evolução permanente"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "atributo");
    if (m.tipo === "atributo") {
      assert.equal(m.nome, "INT");
      assert.equal(m.operacao, "change");
      assert.equal(m.valor, 1);
    }
  }
});

test("attributes: sem 'attribute' gera error", () => {
  const r = interpretarHubUpdate(bloco("attributes:\n  - change: 1"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("items_update: changes reconhecidos", () => {
  const r = interpretarHubUpdate(
    bloco("items_update:\n  - name: Luva Catalisadora\n    changes:\n      equipped: true\n      description: Catalisador principal."),
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "item_update");
    if (m.tipo === "item_update") {
      assert.equal(m.nome, "Luva Catalisadora");
      assert.equal(m.campos.equipado, true);
      assert.equal(m.campos.descricao, "Catalisador principal.");
    }
  }
});

test("items_update: sem nenhum campo reconhecido em changes gera error", () => {
  const r = interpretarHubUpdate(bloco("items_update:\n  - name: Luva\n    changes:\n      unknown_field: 1"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("equipment: equip com slot", () => {
  const r = interpretarHubUpdate(bloco("equipment:\n  equip:\n    - item: Luva Catalisadora\n      slot: hand"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "equipamento");
    if (m.tipo === "equipamento") {
      assert.equal(m.acao, "equipar");
      assert.equal(m.nome, "Luva Catalisadora");
      assert.equal(m.slot, "hand");
    }
  }
});

test("equipment: unequip", () => {
  const r = interpretarHubUpdate(bloco("equipment:\n  unequip:\n    - item: Luva Catalisadora"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "equipamento");
    if (m.tipo === "equipamento") assert.equal(m.acao, "desequipar");
  }
});

test("equipment: sem 'item' gera error", () => {
  const r = interpretarHubUpdate(bloco("equipment:\n  equip:\n    - slot: hand"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("currency: change válido", () => {
  const r = interpretarHubUpdate(bloco("currency:\n  berries:\n    change: 500000\n    reason: Recompensa"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "moeda");
    if (m.tipo === "moeda") {
      assert.equal(m.nome, "berries");
      assert.equal(m.valor, 500000);
    }
  }
});

test("currency: set gera warning", () => {
  const r = interpretarHubUpdate(bloco("currency:\n  berries:\n    set: 1000"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "warning"));
});
