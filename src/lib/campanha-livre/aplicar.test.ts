import assert from "node:assert/strict";
import { test } from "node:test";

import {
  aplicarMudancas as aplicarMudancasComImportId,
  criarSnapshot,
  desfazerEvento,
  desfazerImportacao,
  eventosConflitantes,
  restaurarSnapshot,
} from "./aplicar.ts";
import { interpretarHubUpdate, type Mudanca } from "./parser.ts";
import { novoPersonagemLivre, type PersonagemLivre } from "./tipos.ts";
import { temErro, validarContraPersonagem } from "./validar.ts";

/** Testes não se importam com o importId — usa um fixo. */
function aplicarMudancas(atual: PersonagemLivre, selecionadas: Mudanca[]) {
  return aplicarMudancasComImportId(atual, selecionadas, "import-teste");
}

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
  assert.deepEqual(dados.recursos.mana, { atual: 10, maximo: null, minimo: null });
});

test("aplica recurso change num recurso existente, preservando o máximo e o mínimo", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 35, maximo: 40, minimo: 0 };
  const { dados } = aplicarMudancas(ficha, mudancasDe("resources:\n  mana:\n    change: -5"));
  assert.deepEqual(dados.recursos.mana, { atual: 30, maximo: 40, minimo: 0 });
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

test("aplica item_add com generate_image marca imagemPendente no item novo", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados, resumos } = aplicarMudancas(
    ficha,
    mudancasDe("items_add:\n  - name: Fragmento Azul\n    generate_image: true\n    image_prompt: Um fragmento azul brilhante."),
  );
  assert.equal(dados.inventario[0].imagemPendente, true);
  assert.equal(dados.inventario[0].promptImagem, "Um fragmento azul brilhante.");
  assert.match(resumos[0], /imagem pendente/);
});

test("aplica item_add sem generate_image não marca imagemPendente", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("items_add:\n  - name: Poção Comum"));
  assert.equal(dados.inventario[0].imagemPendente, undefined);
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

test("aplica notes_update acrescentando ao texto existente", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.notas.push({ id: "n1", titulo: "Coesão", texto: "texto original", criadaEm: 1 });
  const { dados } = aplicarMudancas(ficha, mudancasDe("notes_update:\n  - title: Coesão\n    append: Mais uma linha."));
  assert.equal(dados.notas[0].texto, "texto original\nMais uma linha.");
});

test("aplica notes_remove por title", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.notas.push({ id: "n1", titulo: "Coesão", texto: "texto", criadaEm: 1 });
  const { dados, resumos } = aplicarMudancas(ficha, mudancasDe("notes_remove:\n  - title: Coesão\n    reason: Errado"));
  assert.equal(dados.notas.length, 0);
  assert.match(resumos[0], /removida/);
});

test("aplica discoveries_add e discoveries_update", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados: d1 } = aplicarMudancas(ficha, mudancasDe("discoveries_add:\n  - title: Relação X\n    status: partial\n    evidence:\n      - Evidência 1"));
  assert.equal(d1.descobertas.length, 1);
  assert.equal(d1.descobertas[0].status, "parcial");

  const { dados: d2 } = aplicarMudancas(d1, mudancasDe("discoveries_update:\n  - title: Relação X\n    status: confirmed\n    evidence_add:\n      - Evidência 2"));
  assert.equal(d2.descobertas[0].status, "confirmada");
  assert.deepEqual(d2.descobertas[0].evidencias, ["Evidência 1", "Evidência 2"]);
});

test("discoveries_add não duplica descoberta com mesmo título", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancas(ficha, mudancasDe("discoveries_add:\n  - title: Relação X"));
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe("discoveries_add:\n  - title: Relação X"));
  assert.equal(segundo.dados.descobertas.length, 1);
});

test("aplica codex_add", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("codex_add:\n  - title: Catalisadores\n    text: Auxiliam na estabilização."));
  assert.equal(dados.codex.length, 1);
  assert.equal(dados.codex[0].titulo, "Catalisadores");
});

test("aplica locations_add e locations_update", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados: d1 } = aplicarMudancas(ficha, mudancasDe("locations_add:\n  - name: Jardim Norte\n    description: Região de coleta."));
  assert.equal(d1.locais.length, 1);
  assert.equal(d1.locais[0].descoberto, true);

  const { dados: d2 } = aplicarMudancas(d1, mudancasDe("locations_update:\n  - name: Jardim Norte\n    known_information_add:\n      - Reage à mana."));
  assert.deepEqual(d2.locais[0].conhecimento, ["Reage à mana."]);
});

test("aplica bestiary_add", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("bestiary_add:\n  - name: Besouro Luminoso\n    known_traits:\n      - Luminescência"));
  assert.equal(dados.criaturas.length, 1);
  assert.deepEqual(dados.criaturas[0].tracosConhecidos, ["Luminescência"]);
});

test("aplica journal.add", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados, resumos } = aplicarMudancas(ficha, mudancasDe("journal:\n  add:\n    title: Aula de Fundamentos\n    summary: Aula prática."));
  assert.equal(dados.diario.length, 1);
  assert.equal(dados.diario[0].titulo, "Aula de Fundamentos");
  assert.match(resumos[0], /Novo diário/);
});

test("toda mudança aplicada gera um evento no log", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados } = aplicarMudancas(ficha, mudancasDe("xp:\n  add: 25"));
  assert.equal(dados.eventos.length, 1);
  assert.equal(dados.eventos[0].tipo, "xp");
  assert.equal(dados.eventos[0].revertido, false);
  assert.equal(dados.eventos[0].importId, "import-teste");
});

test("desfazer xp (campo raiz) restaura o valor de antes e marca revertido", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados } = aplicarMudancas(ficha, mudancasDe("xp:\n  add: 25"));
  assert.equal(dados.xp, 35);
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.xp, 10);
  assert.equal(desfeito.eventos[0].revertido, true);
  assert.equal(desfeito.eventos.length, 1, "desfazer nunca apaga o evento original");
});

test("desfazer recurso (mapa) que não existia antes remove a chave", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("resources:\n  mana:\n    change: 10"));
  assert.deepEqual(dados.recursos.mana, { atual: 10, maximo: null, minimo: null });
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.recursos.mana, undefined);
});

test("desfazer recurso (mapa) que já existia restaura o valor antigo, preservando máximo e mínimo", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.recursos.mana = { atual: 35, maximo: 40, minimo: 0 };
  const { dados } = aplicarMudancas(ficha, mudancasDe("resources:\n  mana:\n    change: -5"));
  assert.equal(dados.recursos.mana.atual, 30);
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.deepEqual(desfeito.recursos.mana, { atual: 35, maximo: 40, minimo: 0 });
});

test("desfazer item_add (lista, criação) remove o item inteiro", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 1"));
  assert.equal(dados.inventario.length, 1);
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.inventario.length, 0);
});

test("desfazer item_add (lista, empilhado) restaura a quantidade anterior sem remover o item", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.inventario.push({ id: "i1", nome: "Cristal", quantidade: 1 });
  const { dados } = aplicarMudancas(ficha, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 2"));
  assert.equal(dados.inventario[0].quantidade, 3);
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.inventario.length, 1);
  assert.equal(desfeito.inventario[0].quantidade, 1);
});

test("desfazer missao_update restaura a missão inteira (objetivos, status, anotações)", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancas(ficha, mudancasDe("missions_add:\n  - name: Pesquisa\n    objectives:\n      - text: Testar coesão"));
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe("missions_update:\n  - name: Pesquisa\n    action: complete_objective\n    objective: Testar coesão"));
  assert.equal(segundo.dados.missoes[0].objetivos[0].status, "concluido");

  const eventoUpdate = segundo.dados.eventos.find((e) => e.tipo === "missao_update")!;
  const desfeito = desfazerEvento(segundo.dados, eventoUpdate.id);
  assert.equal(desfeito.missoes[0].objetivos[0].status, "pendente");
  assert.equal(desfeito.missoes.length, 1, "desfazer o update não deveria remover a missão");
});

test("desfazer não afeta o objeto original nem outros eventos", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados } = aplicarMudancas(ficha, mudancasDe("xp:\n  add: 25"));
  const antesDoDesfazer = JSON.parse(JSON.stringify(dados));
  desfazerEvento(dados, dados.eventos[0].id);
  assert.deepEqual(dados, antesDoDesfazer);
});

test("desfazer um evento já revertido não faz nada", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados } = aplicarMudancas(ficha, mudancasDe("xp:\n  add: 25"));
  const primeiraVez = desfazerEvento(dados, dados.eventos[0].id);
  const segundaVez = desfazerEvento(primeiraVez, primeiraVez.eventos[0].id);
  assert.equal(segundaVez.xp, primeiraVez.xp);
});

test("desfazerImportacao reverte todas as mudanças ativas de uma importação", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados } = aplicarMudancasComImportId(
    ficha,
    mudancasDe("xp:\n  add: 25\n\nresources:\n  mana:\n    change: 10\n\nitems_add:\n  - name: Cristal\n    quantity: 1"),
    "import-1",
  );
  assert.equal(dados.xp, 35);
  assert.equal(dados.recursos.mana.atual, 10);
  assert.equal(dados.inventario.length, 1);

  const desfeito = desfazerImportacao(dados, "import-1");
  assert.equal(desfeito.xp, 10);
  assert.equal(desfeito.recursos.mana, undefined);
  assert.equal(desfeito.inventario.length, 0);
  assert.ok(desfeito.eventos.every((e) => e.revertido), "todos os eventos da importação devem ficar marcados como revertidos");
  assert.equal(desfeito.eventos.length, 3, "desfazer a importação não apaga nenhum evento");
});

test("desfazerImportacao reverte na ordem certa quando dois eventos mexem na mesma entidade", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancasComImportId(
    ficha,
    mudancasDe("items_add:\n  - name: Luva\n    quantity: 1\n\nitems_update:\n  - name: Luva\n    changes:\n      equipped: true"),
    "import-1",
  );
  assert.equal(dados.inventario.length, 1);
  assert.equal(dados.inventario[0].equipado, true);

  const desfeito = desfazerImportacao(dados, "import-1");
  assert.equal(desfeito.inventario.length, 0, "desfazer os dois eventos (na ordem certa) deveria remover o item que a importação criou");
});

test("desfazerImportacao pula eventos já desfeitos individualmente", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const { dados } = aplicarMudancasComImportId(
    ficha,
    mudancasDe("xp:\n  add: 25\n\nresources:\n  mana:\n    change: 10"),
    "import-1",
  );
  const eventoXp = dados.eventos.find((e) => e.tipo === "xp")!;
  const parcialmenteDesfeito = desfazerEvento(dados, eventoXp.id);
  assert.equal(parcialmenteDesfeito.xp, 10);
  assert.equal(parcialmenteDesfeito.recursos.mana.atual, 10);

  const desfeitoCompleto = desfazerImportacao(parcialmenteDesfeito, "import-1");
  assert.equal(desfeitoCompleto.xp, 10, "xp já tinha sido desfeito, não deveria mudar de novo");
  assert.equal(desfeitoCompleto.recursos.mana, undefined, "mana ainda estava ativo, deveria ser desfeito agora");
});

test("desfazerImportacao não mexe em entidades independentes de outra importação", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const primeiro = aplicarMudancasComImportId(ficha, mudancasDe("xp:\n  add: 25"), "import-1");
  const segundo = aplicarMudancasComImportId(primeiro.dados, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 1"), "import-2");
  assert.equal(segundo.dados.inventario.length, 1);

  const desfeito = desfazerImportacao(segundo.dados, "import-1");
  assert.equal(desfeito.xp, 10, "import-1 deveria ter sido desfeito");
  assert.equal(desfeito.inventario.length, 1, "desfazer import-1 não deveria mexer no item criado por import-2");
  assert.ok(!desfeito.eventos.find((e) => e.importId === "import-2")!.revertido, "evento de import-2 não deveria ser marcado como revertido");
});

test("desfazerImportacao numa entidade que outra importação também tocou depois segue o alvo.antes registrado (por isso eventosConflitantes existe para avisar)", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const primeiro = aplicarMudancasComImportId(ficha, mudancasDe("xp:\n  add: 25"), "import-1");
  const segundo = aplicarMudancasComImportId(primeiro.dados, mudancasDe("xp:\n  add: 5"), "import-2");
  assert.equal(segundo.dados.xp, 40);

  const conflitos = eventosConflitantes(segundo.dados, "import-1");
  assert.equal(conflitos.length, 1, "o evento de xp de import-1 deveria ser sinalizado como conflitante");

  const desfeito = desfazerImportacao(segundo.dados, "import-1");
  assert.equal(desfeito.xp, 10, "sem merge automático: desfazer restaura o valor de antes de import-1, ignorando o +5 de import-2");
});

test("eventosConflitantes detecta quando uma importação posterior mexeu na mesma entidade", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancasComImportId(ficha, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 1"), "import-1");
  const segundo = aplicarMudancasComImportId(primeiro.dados, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 2"), "import-2");

  const conflitos = eventosConflitantes(segundo.dados, "import-1");
  assert.equal(conflitos.length, 1);
  assert.equal(conflitos[0].tipo, "item_add");
});

test("eventosConflitantes não acusa nada quando não há mudança posterior na mesma entidade", () => {
  const ficha = novoPersonagemLivre("Zé");
  const primeiro = aplicarMudancasComImportId(ficha, mudancasDe("xp:\n  add: 25"), "import-1");
  const segundo = aplicarMudancasComImportId(primeiro.dados, mudancasDe("items_add:\n  - name: Cristal\n    quantity: 1"), "import-2");

  const conflitos = eventosConflitantes(segundo.dados, "import-1");
  assert.equal(conflitos.length, 0);
});

/* ---------- novas operações (fecha o v1.0): aplicar, duplicar, desfazer ---------- */

test("aplica temporary_modifiers.add e ignora duplicata pelo nome", () => {
  const ficha = novoPersonagemLivre("Zé");
  const bloco1 = "temporary_modifiers:\n  add:\n    - name: Bênção\n      target: força\n      value: 2\n      duration:\n        type: scenes\n        value: 1";
  const primeiro = aplicarMudancas(ficha, mudancasDe(bloco1));
  assert.equal(primeiro.dados.modificadoresTemporarios.length, 1);
  assert.equal(primeiro.dados.modificadoresTemporarios[0].alvo, "força");

  const segundo = aplicarMudancas(primeiro.dados, mudancasDe(bloco1));
  assert.equal(segundo.dados.modificadoresTemporarios.length, 1, "duplicata pelo nome deveria ser ignorada");
  assert.match(segundo.resumos[0], /já existia/);
});

test("aplica temporary_modifiers.remove e desfaz devolvendo o modificador removido", () => {
  const ficha = novoPersonagemLivre("Zé");
  const criado = aplicarMudancas(
    ficha,
    mudancasDe("temporary_modifiers:\n  add:\n    - name: Bênção\n      target: força\n      value: 2\n      duration:\n        type: scenes\n        value: 1"),
  );
  const removido = aplicarMudancas(criado.dados, mudancasDe("temporary_modifiers:\n  remove:\n    - name: Bênção"));
  assert.equal(removido.dados.modificadoresTemporarios.length, 0);

  const eventoRemove = removido.dados.eventos.find((e) => e.tipo === "modificador_remove")!;
  const desfeito = desfazerEvento(removido.dados, eventoRemove.id);
  assert.equal(desfeito.modificadoresTemporarios.length, 1);
  assert.equal(desfeito.modificadoresTemporarios[0].nome, "Bênção");
});

test("desfazer temporary_modifiers.add (criação) remove o modificador inteiro", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(
    ficha,
    mudancasDe("temporary_modifiers:\n  add:\n    - name: Bênção\n      target: força\n      value: 2\n      duration:\n        type: scenes\n        value: 1"),
  );
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.modificadoresTemporarios.length, 0);
});

test("aplica conditions.add/update/remove e desfaz cada um", () => {
  const ficha = novoPersonagemLivre("Zé");
  const criada = aplicarMudancas(ficha, mudancasDe("conditions:\n  add:\n    - name: Envenenado\n      description: Perde vida."));
  assert.equal(criada.dados.condicoes.length, 1);

  const atualizada = aplicarMudancas(criada.dados, mudancasDe("conditions:\n  update:\n    - name: Envenenado\n      description: Piorou."));
  assert.equal(atualizada.dados.condicoes[0].descricao, "Piorou.");
  const eventoUpdate = atualizada.dados.eventos.find((e) => e.tipo === "condicao_update")!;
  const desfeitoUpdate = desfazerEvento(atualizada.dados, eventoUpdate.id);
  assert.equal(desfeitoUpdate.condicoes[0].descricao, "Perde vida.");

  const removida = aplicarMudancas(atualizada.dados, mudancasDe("conditions:\n  remove:\n    - name: Envenenado"));
  assert.equal(removida.dados.condicoes.length, 0);
  const eventoRemove = removida.dados.eventos.find((e) => e.tipo === "condicao_remove")!;
  const desfeitoRemove = desfazerEvento(removida.dados, eventoRemove.id);
  assert.equal(desfeitoRemove.condicoes.length, 1);
});

test("aplica spells_add e ignora duplicata pelo nome", () => {
  const ficha = novoPersonagemLivre("Zé");
  const bloco1 = "spells_add:\n  - name: Bola de Fogo\n    affinity: fogo";
  const primeiro = aplicarMudancas(ficha, mudancasDe(bloco1));
  assert.equal(primeiro.dados.magias.length, 1);
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe(bloco1));
  assert.equal(segundo.dados.magias.length, 1, "magia duplicada pelo nome deveria ser ignorada");
});

test("aplica spells_update (discoveries_add e knowledge.change) e desfaz restaurando a magia inteira", () => {
  const ficha = novoPersonagemLivre("Zé");
  const criada = aplicarMudancas(ficha, mudancasDe("spells_add:\n  - name: Bola de Fogo"));
  const atualizada = aplicarMudancas(
    criada.dados,
    mudancasDe("spells_update:\n  - name: Bola de Fogo\n    discoveries_add:\n      - Funciona na água.\n    knowledge:\n      change: 20"),
  );
  assert.deepEqual(atualizada.dados.magias[0].descobertasSimples, ["Funciona na água."]);
  assert.equal(atualizada.dados.magias[0].progressoConhecimento, 20);

  const eventoUpdate = atualizada.dados.eventos.find((e) => e.tipo === "magia_update")!;
  const desfeito = desfazerEvento(atualizada.dados, eventoUpdate.id);
  assert.deepEqual(desfeito.magias[0].descobertasSimples, []);
  assert.equal(desfeito.magias[0].progressoConhecimento, undefined);
});

test("aplica spell_discoveries dentro da magia correspondente e desfaz", () => {
  const ficha = novoPersonagemLivre("Zé");
  const criada = aplicarMudancas(ficha, mudancasDe("spells_add:\n  - name: Bola de Fogo"));
  const comDescoberta = aplicarMudancas(
    criada.dados,
    mudancasDe("spell_discoveries:\n  - spell: Bola de Fogo\n    title: Reação com água\n    status: confirmed"),
  );
  assert.equal(comDescoberta.dados.magias[0].descobertas.length, 1);
  assert.equal(comDescoberta.dados.magias[0].descobertas[0].status, "confirmada");

  const evento = comDescoberta.dados.eventos.find((e) => e.tipo === "magia_descoberta")!;
  const desfeito = desfazerEvento(comDescoberta.dados, evento.id);
  assert.equal(desfeito.magias[0].descobertas.length, 0);
});

test("aplica research_add e research_update, desfazendo o update sem apagar a pesquisa", () => {
  const ficha = novoPersonagemLivre("Zé");
  const criada = aplicarMudancas(ficha, mudancasDe("research_add:\n  - title: Origem do Véu\n    progress: 0"));
  const atualizada = aplicarMudancas(
    criada.dados,
    mudancasDe("research_update:\n  - title: Origem do Véu\n    progress_change: 10\n    evidence_add:\n      - Pergaminho"),
  );
  assert.equal(atualizada.dados.pesquisas[0].progresso, 10);
  assert.deepEqual(atualizada.dados.pesquisas[0].evidencias, ["Pergaminho"]);

  const eventoUpdate = atualizada.dados.eventos.find((e) => e.tipo === "pesquisa_update")!;
  const desfeito = desfazerEvento(atualizada.dados, eventoUpdate.id);
  assert.equal(desfeito.pesquisas.length, 1, "desfazer o update não deveria remover a pesquisa");
  assert.equal(desfeito.pesquisas[0].progresso, 0);
});

test("aplica achievements_add e ignora duplicata pelo nome", () => {
  const ficha = novoPersonagemLivre("Zé");
  const bloco1 = "achievements_add:\n  - name: Primeira Invocação";
  const primeiro = aplicarMudancas(ficha, mudancasDe(bloco1));
  assert.equal(primeiro.dados.conquistas.length, 1);
  const segundo = aplicarMudancas(primeiro.dados, mudancasDe(bloco1));
  assert.equal(segundo.dados.conquistas.length, 1, "conquista duplicada pelo nome deveria ser ignorada, sem duplicação silenciosa");
});

test("desfazer achievements_add remove a conquista", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("achievements_add:\n  - name: Primeira Invocação"));
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.conquistas.length, 0);
});

test("aplica reputation (mapa, igual moedas) criando e ajustando, e desfaz", () => {
  const ficha = novoPersonagemLivre("Zé");
  const criada = aplicarMudancas(ficha, mudancasDe("reputation:\n  - target: Guilda dos Ferreiros\n    change: 5"));
  assert.equal(criada.dados.reputacao["Guilda dos Ferreiros"], 5);

  const ajustada = aplicarMudancas(criada.dados, mudancasDe("reputation:\n  - target: Guilda dos Ferreiros\n    change: 3"));
  assert.equal(ajustada.dados.reputacao["Guilda dos Ferreiros"], 8);

  const eventoAjuste = ajustada.dados.eventos.filter((e) => e.tipo === "reputacao").at(-1)!;
  const desfeito = desfazerEvento(ajustada.dados, eventoAjuste.id);
  assert.equal(desfeito.reputacao["Guilda dos Ferreiros"], 5);
});

test("desfazer reputation (mapa) que não existia antes remove a chave", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("reputation:\n  - target: Casa Verde\n    set: 10"));
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.reputacao["Casa Verde"], undefined);
});

test("aplica image_requests, marca fila pendente (nunca gera sozinho) e ignora duplicata pendente", () => {
  const ficha = novoPersonagemLivre("Zé");
  const bloco1 = "image_requests:\n  - entity_type: npc\n    entity_name: Mira\n    prompt_hint: Cabelos prateados.";
  const primeiro = aplicarMudancas(ficha, mudancasDe(bloco1));
  assert.equal(primeiro.dados.filaImagens.length, 1);
  assert.equal(primeiro.dados.filaImagens[0].atendida, false);

  const segundo = aplicarMudancas(primeiro.dados, mudancasDe(bloco1));
  assert.equal(segundo.dados.filaImagens.length, 1, "pedido pendente igual deveria ser ignorado");
});

test("desfazer image_requests (criação) remove o pedido da fila", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("image_requests:\n  - entity_type: npc\n    entity_name: Mira"));
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.filaImagens.length, 0);
});

test("aplica school.lessons_add e desfaz removendo a aula", () => {
  const ficha = novoPersonagemLivre("Zé");
  const { dados } = aplicarMudancas(ficha, mudancasDe("school:\n  lessons_add:\n    - subject: Runas\n      topic: Proteção"));
  assert.equal(dados.escola.length, 1);
  assert.equal(dados.escola[0].materia, "Runas");
  const desfeito = desfazerEvento(dados, dados.eventos[0].id);
  assert.equal(desfeito.escola.length, 0);
});

/* ---------- teste combinado grande: as 8 novas operações citadas explicitamente no mesmo bloco HUB_UPDATE ---------- */
test("bloco HUB_UPDATE combinando condition + temporary_modifier + spell + spell_discovery + research + achievement + reputation + image_request", () => {
  const ficha = novoPersonagemLivre("Zé");
  const combinado = mudancasDe(
    [
      "conditions:",
      "  add:",
      "    - name: Envenenado",
      "      description: Perde 1 de vida por turno.",
      "      duration:",
      "        type: turns",
      "        value: 3",
      "temporary_modifiers:",
      "  add:",
      "    - name: Bênção",
      "      target: força",
      "      value: 2",
      "      duration:",
      "        type: scenes",
      "        value: 1",
      "spells_add:",
      "  - name: Bola de Fogo",
      "    affinity: fogo",
      "spell_discoveries:",
      "  - spell: Bola de Fogo",
      "    title: Reação com água",
      "    status: confirmed",
      "research_add:",
      "  - title: Origem do Véu",
      "achievements_add:",
      "  - name: Primeira Invocação",
      "reputation:",
      "  - target: Guilda dos Ferreiros",
      "    change: 5",
      "image_requests:",
      "  - entity_type: npc",
      "    entity_name: Mira",
    ].join("\n"),
  );

  // A descoberta da magia depende da própria magia, criada no mesmo bloco — sem projeção ela erraria.
  const magiaAdd = combinado.find((m) => m.tipo === "magia_add")!;
  const { dados: projetado } = aplicarMudancas(ficha, [magiaAdd]);
  const validadas = validarContraPersonagem(combinado, ficha, projetado);
  assert.ok(validadas.every((m) => !temErro(m)), "nenhuma das 8 mudanças combinadas deveria ter erro de validação");

  const { dados } = aplicarMudancasComImportId(ficha, validadas, "import-combo");
  assert.equal(dados.condicoes.length, 1);
  assert.equal(dados.modificadoresTemporarios.length, 1);
  assert.equal(dados.magias.length, 1);
  assert.equal(dados.magias[0].descobertas.length, 1);
  assert.equal(dados.pesquisas.length, 1);
  assert.equal(dados.conquistas.length, 1);
  assert.equal(dados.reputacao["Guilda dos Ferreiros"], 5);
  assert.equal(dados.filaImagens.length, 1);
  assert.equal(dados.eventos.length, 8);

  // Desfazer a importação inteira reverte as 8 de uma vez, sem apagar o log.
  const desfeito = desfazerImportacao(dados, "import-combo");
  assert.equal(desfeito.condicoes.length, 0);
  assert.equal(desfeito.modificadoresTemporarios.length, 0);
  assert.equal(desfeito.magias.length, 0);
  assert.equal(desfeito.pesquisas.length, 0);
  assert.equal(desfeito.conquistas.length, 0);
  assert.equal(desfeito.reputacao["Guilda dos Ferreiros"], undefined);
  assert.equal(desfeito.filaImagens.length, 0);
  assert.equal(desfeito.eventos.length, 8, "desfazer a importação não apaga nenhum evento");
  assert.ok(desfeito.eventos.every((e) => e.revertido));
});

/* ---------- snapshots: fora do pipeline de Mudanca, nunca restaura destrutivamente em silêncio ---------- */
test("criarSnapshot guarda uma cópia do estado atual sem incluir os próprios snapshots", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 42;
  ficha.inventario.push({ id: "i1", nome: "Cristal", quantidade: 1 });
  const comSnapshot = criarSnapshot(ficha, "Antes da masmorra", "manual");
  assert.equal(comSnapshot.snapshots.length, 1);
  assert.equal(comSnapshot.snapshots[0].titulo, "Antes da masmorra");
  assert.equal(comSnapshot.snapshots[0].origem, "manual");
  assert.equal(comSnapshot.snapshots[0].estado.xp, 42);
  assert.equal((comSnapshot.snapshots[0].estado as Partial<PersonagemLivre>).snapshots, undefined);
});

test("restaurarSnapshot volta ao estado salvo mas nunca é destrutivo: cria um backup automático do estado atual antes", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const comSnapshot = criarSnapshot(ficha, "Início da sessão", "inicio_sessao");
  const depoisDeXp = { ...comSnapshot, xp: 99 };

  const restaurado = restaurarSnapshot(depoisDeXp, comSnapshot.snapshots[0].id);
  assert.equal(restaurado.xp, 10, "deveria voltar ao xp salvo no snapshot");
  assert.equal(restaurado.snapshots.length, 2, "o snapshot original deveria continuar existindo, mais um novo backup automático");
  assert.equal(restaurado.snapshots[0].estado.xp, 99, "o backup automático deveria ter guardado o xp de antes de restaurar (99)");
});

test("restaurarSnapshot com id inexistente não muda nada", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.xp = 10;
  const resultado = restaurarSnapshot(ficha, "id-que-nao-existe");
  assert.equal(resultado, ficha);
});
