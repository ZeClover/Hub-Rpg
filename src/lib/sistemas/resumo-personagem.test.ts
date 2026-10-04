import { test } from "node:test";
import assert from "node:assert/strict";
import { resumirPersonagem } from "./resumo-personagem.ts";

test("cada sistema apresenta apenas a identidade pública no seu formato", () => {
  assert.equal(
    resumirPersonagem("kaizoku-no-sho", { nc: 4 }).progressao,
    "NC 4",
  );
  assert.deepEqual(
    resumirPersonagem("dnd-5e", { nivel: 3, perfil: { classeId: "bardo" } })
      .identidade,
    ["Bardo"],
  );
  assert.equal(
    resumirPersonagem("fabula-ultima", {
      classes: [
        { classeId: "guardiao", nivel: 3 },
        { classeId: "arcanista", nivel: 2 },
      ],
    }).progressao,
    "Nível 5",
  );
  assert.deepEqual(
    resumirPersonagem("sao", {
      classes: [{ classeId: "custom", nivel: 2 }],
      classesCustom: [{ id: "custom", nome: "Cartógrafo" }],
    }).identidade,
    ["Cartógrafo"],
  );
  assert.deepEqual(
    resumirPersonagem("hogwarts-rpg", {
      nivel: 2,
      perfil: { casa: "Corvinal", anoEscolar: 1 },
    }).identidade,
    ["Corvinal", "1º ano"],
  );
  assert.equal(
    resumirPersonagem("thryliki-chelona", { nivel: 0, ano: 2 }).progressao,
    "Nível 0",
  );
  assert.equal(
    resumirPersonagem("sistema-do-savio", { nivel: 6 }).progressao,
    "Nível 6",
  );
  assert.equal(
    resumirPersonagem("campanha-livre", { nivel: 9 }).progressao,
    null,
  );
});

test("resumos não expõem segredos, inventário, história ou fórmulas de vida", () => {
  const dados = {
    perfil: { nome: "Ana", historia: "privado" },
    _mestre: { varinha: "SEGREDO", nivel: 99 },
    vida: { atual: 5, maxima: 10 },
  };
  const resumo = resumirPersonagem("hogwarts-rpg", dados);
  assert.equal(resumo.vida, null);
  assert.equal(JSON.stringify(resumo).includes("SEGREDO"), false);
  assert.equal(JSON.stringify(resumo).includes("privado"), false);
  assert.deepEqual(dados._mestre, { varinha: "SEGREDO", nivel: 99 });
});

test("fichas vazias, antigas e números inválidos não inventam progressão", () => {
  for (const dados of [
    null,
    [],
    "errado",
    { nivel: "3" },
    { nivel: Infinity },
    { nivel: -1 },
  ])
    assert.equal(resumirPersonagem("dnd-5e", dados).progressao, null);
  assert.equal(
    resumirPersonagem("fabula-ultima", {
      classes: [{ classeId: "guardiao", nivel: NaN }],
    }).progressao,
    null,
  );
  assert.equal(
    resumirPersonagem("sao", { classes: [{ classeId: "", nivel: 20 }] })
      .progressao,
    null,
  );
  assert.equal(
    resumirPersonagem("dnd-5e", {
      resumoVida: { atual: NaN, maxima: 12, rotulo: "PV" },
    }).vida,
    null,
  );
  assert.equal(
    resumirPersonagem("dnd-5e", {
      resumoVida: { atual: 0, maxima: 0, rotulo: "PV" },
    }).vida,
    null,
  );
});

test("zero de vida e NPC usam dados salvos sem refazer os cálculos", () => {
  const r = resumirPersonagem(
    "fabula-ultima",
    {
      nivel: 4,
      especie: "Constructo",
      classes: [{ classeId: "guardiao", nivel: 9 }],
      resumoVida: { atual: 0, maxima: 20, rotulo: "PV", derrotado: true },
    },
    true,
  );
  assert.equal(r.progressao, "Nível 4");
  assert.deepEqual(r.identidade, ["Constructo"]);
  assert.equal(r.vida?.atual, 0);
  assert.equal(r.vida?.derrotado, true);
});
