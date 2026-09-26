import assert from "node:assert/strict";
import { test } from "node:test";

import { podeAcessarPersonagem, podeReceberFicha } from "./dono-personagem.ts";

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

const fichaNaCampanha = { donoId: "usuario-jogador", campanhaId: "campanha-1" };

test("mestre da campanha lê a ficha do jogador", () => {
  assert.equal(
    podeAcessarPersonagem("usuario-mestre", fichaNaCampanha, ["campanha-1"]),
    true,
  );
});

test("mestre de outra campanha não lê a ficha", () => {
  assert.equal(
    podeAcessarPersonagem("usuario-mestre", fichaNaCampanha, ["campanha-2"]),
    false,
  );
});

test("sem lista de campanhas, ninguém além do dono acessa", () => {
  assert.equal(podeAcessarPersonagem("usuario-mestre", fichaNaCampanha), false);
});

test("ficha fora de campanha não abre pra ninguém como mestre", () => {
  const fichaAvulsa = { donoId: "usuario-jogador", campanhaId: null };
  assert.equal(
    podeAcessarPersonagem("usuario-mestre", fichaAvulsa, ["campanha-1"]),
    false,
  );
});

test("troca de dono: quem participa da campanha pode virar dono", () => {
  assert.equal(
    podeReceberFicha(fichaNaCampanha, "usuario-outro-jogador", [
      "usuario-jogador",
      "usuario-outro-jogador",
      "usuario-mestre",
    ]),
    true,
  );
});

test("troca de dono: quem não participa da campanha não pode virar dono", () => {
  assert.equal(
    podeReceberFicha(fichaNaCampanha, "usuario-intruso", [
      "usuario-jogador",
      "usuario-mestre",
    ]),
    false,
  );
});

test("troca de dono: ficha avulsa (fora de campanha) nunca troca de dono", () => {
  const fichaAvulsa = { donoId: "usuario-jogador", campanhaId: null };
  assert.equal(
    podeReceberFicha(fichaAvulsa, "usuario-qualquer", ["usuario-qualquer"]),
    false,
  );
});
