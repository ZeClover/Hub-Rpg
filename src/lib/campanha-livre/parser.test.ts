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

test("missions_add: com objetivos e status", () => {
  const r = interpretarHubUpdate(
    bloco(
      "missions_add:\n  - name: Pesquisa sobre Coesão\n    description: Investigar a relação.\n    status: active\n    objectives:\n      - text: Testar coesão\n        status: pending",
    ),
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "missao_add");
    if (m.tipo === "missao_add") {
      assert.equal(m.nome, "Pesquisa sobre Coesão");
      assert.equal(m.status, "ativa");
      assert.deepEqual(m.objetivos, [{ texto: "Testar coesão", status: "pendente" }]);
    }
  }
});

test("missions_add: status desconhecido gera error", () => {
  const r = interpretarHubUpdate(bloco("missions_add:\n  - name: Missão X\n    status: not_a_real_status"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("missions_update: complete_objective com objective", () => {
  const r = interpretarHubUpdate(bloco("missions_update:\n  - name: Pesquisa sobre Coesão\n    action: complete_objective\n    objective: Testar coesão"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "missao_update");
    if (m.tipo === "missao_update") {
      assert.equal(m.acao, "complete_objective");
      assert.equal(m.objetivo, "Testar coesão");
      assert.equal(m.alertas.length, 0);
    }
  }
});

test("missions_update: ação desconhecida gera error", () => {
  const r = interpretarHubUpdate(bloco("missions_update:\n  - name: Missão X\n    action: dance"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("missions_update: complete_objective sem objective gera error", () => {
  const r = interpretarHubUpdate(bloco("missions_update:\n  - name: Missão X\n    action: complete_objective"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("npcs_add: com tags e first_met", () => {
  const r = interpretarHubUpdate(bloco("npcs_add:\n  - name: Lina\n    description: Estudante.\n    first_met: Entrada\n    tags:\n      - estudante"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "npc_add");
    if (m.tipo === "npc_add") {
      assert.equal(m.nome, "Lina");
      assert.equal(m.primeiroEncontro, "Entrada");
      assert.deepEqual(m.tags, ["estudante"]);
    }
  }
});

test("npcs_add: sem name gera error", () => {
  const r = interpretarHubUpdate(bloco("npcs_add:\n  - description: Sem nome"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("npcs_update: known_information_add", () => {
  const r = interpretarHubUpdate(bloco("npcs_update:\n  - name: Lina\n    known_information_add:\n      - Faz muitas anotações."));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "npc_update");
    if (m.tipo === "npc_update") assert.deepEqual(m.conhecimentoNovo, ["Faz muitas anotações."]);
  }
});

test("npcs_update: sem known_information_add gera error", () => {
  const r = interpretarHubUpdate(bloco("npcs_update:\n  - name: Lina"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("relationships: change válido", () => {
  const r = interpretarHubUpdate(bloco("relationships:\n  - npc: Lina\n    stat: trust\n    change: 1\n    reason: Trabalharam juntos."));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "relacao");
    if (m.tipo === "relacao") {
      assert.equal(m.npc, "Lina");
      assert.equal(m.stat, "trust");
      assert.equal(m.valor, 1);
    }
  }
});

test("relationships: sem change gera error", () => {
  const r = interpretarHubUpdate(bloco("relationships:\n  - npc: Lina\n    stat: trust"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("notes_update: com append válido", () => {
  const r = interpretarHubUpdate(bloco("notes_update:\n  - title: Coesão\n    append: Coesão insuficiente pode causar colapso."));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "nota_update");
    if (m.tipo === "nota_update") {
      assert.equal(m.titulo, "Coesão");
      assert.equal(m.acrescimo, "Coesão insuficiente pode causar colapso.");
      assert.equal(m.alertas.length, 0);
    }
  }
});

test("notes_update: sem append gera error", () => {
  const r = interpretarHubUpdate(bloco("notes_update:\n  - title: Coesão"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("notes_remove: por title", () => {
  const r = interpretarHubUpdate(bloco("notes_remove:\n  - title: Coesão\n    reason: Informação incorreta"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "nota_remove");
    if (m.tipo === "nota_remove") {
      assert.equal(m.titulo, "Coesão");
      assert.equal(m.motivo, "Informação incorreta");
    }
  }
});

test("notes_remove: sem title nem id gera error", () => {
  const r = interpretarHubUpdate(bloco("notes_remove:\n  - reason: Sem referência"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("discoveries_add: com evidence e status", () => {
  const r = interpretarHubUpdate(
    bloco(
      "discoveries_add:\n  - title: Relação entre Coesão e Estabilidade\n    category: teoria-magica\n    status: partial\n    evidence:\n      - Magia permaneceu estável por mais tempo.",
    ),
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "descoberta_add");
    if (m.tipo === "descoberta_add") {
      assert.equal(m.status, "parcial");
      assert.deepEqual(m.evidencias, ["Magia permaneceu estável por mais tempo."]);
    }
  }
});

test("discoveries_add: status desconhecido gera error", () => {
  const r = interpretarHubUpdate(bloco("discoveries_add:\n  - title: X\n    status: not_a_status"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("discoveries_update: status e evidence_add", () => {
  const r = interpretarHubUpdate(
    bloco("discoveries_update:\n  - title: Relação entre Coesão e Estabilidade\n    status: confirmed\n    evidence_add:\n      - Segundo teste reproduziu o resultado."),
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "descoberta_update");
    if (m.tipo === "descoberta_update") {
      assert.equal(m.status, "confirmada");
      assert.deepEqual(m.evidenciasNovas, ["Segundo teste reproduziu o resultado."]);
    }
  }
});

test("codex_add: com category e text", () => {
  const r = interpretarHubUpdate(bloco("codex_add:\n  - title: Catalisadores\n    category: teoria\n    text: Catalisadores auxiliam na estabilização da magia."));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "codex_add");
    if (m.tipo === "codex_add") assert.equal(m.categoria, "teoria");
  }
});

test("codex_add: sem text gera error", () => {
  const r = interpretarHubUpdate(bloco("codex_add:\n  - title: Catalisadores"));
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.mudancas[0].alertas.some((a) => a.nivel === "error"));
});

test("locations_add: discovered default true", () => {
  const r = interpretarHubUpdate(bloco("locations_add:\n  - name: Jardim Norte\n    description: Região usada para coleta."));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "local_add");
    if (m.tipo === "local_add") assert.equal(m.descoberto, true);
  }
});

test("locations_add: discovered false respeitado", () => {
  const r = interpretarHubUpdate(bloco("locations_add:\n  - name: Jardim Oculto\n    discovered: false"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    if (m.tipo === "local_add") assert.equal(m.descoberto, false);
  }
});

test("locations_update: known_information_add", () => {
  const r = interpretarHubUpdate(bloco("locations_update:\n  - name: Jardim Norte\n    known_information_add:\n      - Algumas plantas reagem à presença de mana."));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "local_update");
    if (m.tipo === "local_update") assert.deepEqual(m.conhecimentoNovo, ["Algumas plantas reagem à presença de mana."]);
  }
});

test("bestiary_add: com known_traits", () => {
  const r = interpretarHubUpdate(bloco("bestiary_add:\n  - name: Besouro Luminoso\n    category: criatura-magica\n    known_traits:\n      - Luminescência"));
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "criatura_add");
    if (m.tipo === "criatura_add") assert.deepEqual(m.tracosConhecidos, ["Luminescência"]);
  }
});

test("journal.add: com summary e events", () => {
  const r = interpretarHubUpdate(
    bloco("journal:\n  add:\n    title: Aula de Fundamentos\n    summary: Houve uma aula prática.\n    events:\n      - Teste de manifestação."),
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    const [m] = r.mudancas;
    assert.equal(m.tipo, "diario_add");
    if (m.tipo === "diario_add") {
      assert.equal(m.resumo, "Houve uma aula prática.");
      assert.deepEqual(m.eventos, ["Teste de manifestação."]);
    }
  }
});

test("journal sem 'add' não gera mudança", () => {
  const r = interpretarHubUpdate(bloco("journal:\n  other_field: x\n\nxp:\n  add: 5"));
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.mudancas.length, 1);
});
