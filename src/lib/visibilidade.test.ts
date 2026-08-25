import assert from "node:assert/strict";
import { test } from "node:test";

import { filtrarCampos } from "./visibilidade.ts";

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
