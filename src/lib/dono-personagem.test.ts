import assert from "node:assert/strict";
import { test } from "node:test";

import { podeAcessarPersonagem } from "./dono-personagem.ts";

/*
  O teste que a decisão #13 exige, agora para personagens: tentar ler a ficha
  de outra pessoa precisa falhar.
*/

const fichaDoZe = { donoId: "usuario-ze" };

test("dono acessa a própria ficha", () => {
  assert.equal(podeAcessarPersonagem("usuario-ze", fichaDoZe), true);
});

test("outro usuário não acessa a ficha alheia", () => {
  assert.equal(podeAcessarPersonagem("usuario-intruso", fichaDoZe), false);
});
