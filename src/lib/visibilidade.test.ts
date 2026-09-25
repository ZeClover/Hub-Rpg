import assert from "node:assert/strict";
import { test } from "node:test";

import { filtrarCampos, semSegredosDeMestre } from "./visibilidade.ts";

/*
  O teste que a decisão #13 exige: tentar ler um segredo como quem não é
  mestre precisa falhar. Se alguém, um dia, "simplificar" a filtragem, é aqui
  que a mudança para de pé.
*/

const campos = [
  { chave: "População", valor: "cerca de 4 mil", visibilidade: "PUBLICO" as const },
  { chave: "Quem manda de verdade", valor: "o culto do Véu", visibilidade: "MESTRE" as const },
  { chave: "Clima", valor: "frio e úmido", visibilidade: "PUBLICO" as const },
];

test("jogador não recebe campo de mestre", () => {
  const vistos = filtrarCampos(campos, false);

  assert.equal(vistos.length, 2);
  assert.ok(
    vistos.every((campo) => campo.visibilidade === "PUBLICO"),
    "nenhum campo de mestre pode sobrar",
  );

  // A prova direta: o texto do segredo não pode aparecer em lugar nenhum.
  const tudoQueSaiu = JSON.stringify(vistos);
  assert.ok(
    !tudoQueSaiu.includes("culto do Véu"),
    "o valor do segredo vazou para quem não é mestre",
  );
  assert.ok(
    !tudoQueSaiu.includes("Quem manda de verdade"),
    "até o nome do campo secreto vaza informação e não pode sair",
  );
});

test("mestre recebe todos os campos", () => {
  const vistos = filtrarCampos(campos, true);
  assert.equal(vistos.length, 3);
});

test("filtrar não altera a lista original", () => {
  filtrarCampos(campos, false);
  assert.equal(campos.length, 3, "a lista de origem foi modificada");
});

test("lista vazia não quebra", () => {
  assert.deepEqual(filtrarCampos([], false), []);
  assert.deepEqual(filtrarCampos([], true), []);
});

/*
  `semSegredosDeMestre` — a mesma trava aplicada ao `dados` livre de um
  Personagem (decisão #159), que qualquer sistema usa guardando segredos
  em `dados._mestre`.
*/

const dadosComSegredo = {
  perfil: { nome: "Bruxo" },
  varinha: { madeira: "Carvalho" },
  _mestre: { notasPersonagem: "é filho perdido do vilão", varinha: { lealdade: "Incerta" } },
};

test("chave _mestre some quando filtrada", () => {
  const filtrado = semSegredosDeMestre(dadosComSegredo) as Record<string, unknown>;
  assert.ok(!("_mestre" in filtrado), "_mestre não pode sobrar no objeto filtrado");

  // A prova direta, igual ao teste de filtrarCampos: o segredo não pode
  // aparecer em lugar nenhum do que seria enviado pro navegador.
  const tudoQueSaiu = JSON.stringify(filtrado);
  assert.ok(
    !tudoQueSaiu.includes("filho perdido"),
    "o conteúdo de _mestre vazou pra quem não é mestre",
  );
  assert.ok(!tudoQueSaiu.includes("Incerta"));

  // O resto dos dados continua normal.
  assert.deepEqual(filtrado.perfil, { nome: "Bruxo" });
  assert.deepEqual(filtrado.varinha, { madeira: "Carvalho" });
});

test("não filtrar mantém _mestre intacto", () => {
  // Passar `dadosComSegredo` direto (sem chamar a função) é o caminho do
  // Mestre — não precisa de função nenhuma, só não filtrar.
  const paraOMestre = dadosComSegredo;
  assert.ok("_mestre" in paraOMestre);
});

test("_mestre não altera o objeto original", () => {
  semSegredosDeMestre(dadosComSegredo);
  assert.ok("_mestre" in dadosComSegredo, "o objeto de origem foi modificado");
});

test("dados sem _mestre passam direto", () => {
  const semSegredo = { perfil: { nome: "Bruxo" } };
  assert.deepEqual(semSegredosDeMestre(semSegredo), semSegredo);
});

test("dados nulos, arrays e primitivos não quebram", () => {
  assert.equal(semSegredosDeMestre(null), null);
  assert.deepEqual(semSegredosDeMestre([1, 2, 3]), [1, 2, 3]);
  assert.equal(semSegredosDeMestre("texto solto"), "texto solto");
  assert.equal(semSegredosDeMestre(undefined), undefined);
});
