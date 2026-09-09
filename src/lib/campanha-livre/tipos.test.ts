import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizarPersonagemLivre } from "./tipos.ts";

test("normalizarPersonagemLivre migra local com 'descoberto: boolean' (formato antigo) pra 'estadoDescoberta'", () => {
  const antigo = {
    perfil: { nome: "Zé" },
    locais: [
      { id: "l1", nome: "Jardim Norte", descoberto: true, conhecimento: [], criadoEm: 1 },
      { id: "l2", nome: "Jardim Oculto", descoberto: false, conhecimento: [], criadoEm: 1 },
    ],
  };
  const normalizado = normalizarPersonagemLivre(antigo);
  assert.equal(normalizado.locais[0].estadoDescoberta, "visitado");
  assert.equal(normalizado.locais[1].estadoDescoberta, "ouviu_falar");
  assert.deepEqual(normalizado.locais[0].conexoesConhecidas, [], "ficha antiga não tinha conexões — completa com lista vazia");
});

test("normalizarPersonagemLivre preserva 'estadoDescoberta' quando a ficha já é do formato novo", () => {
  const novo = {
    perfil: { nome: "Zé" },
    locais: [{ id: "l1", nome: "Torre Velha", estadoDescoberta: "conhecido", conexoesConhecidas: ["Biblioteca"], conhecimento: [], criadoEm: 1 }],
  };
  const normalizado = normalizarPersonagemLivre(novo);
  assert.equal(normalizado.locais[0].estadoDescoberta, "conhecido");
  assert.deepEqual(normalizado.locais[0].conexoesConhecidas, ["Biblioteca"]);
});

test("normalizarPersonagemLivre completa campos de calendário/compromissos/mural ausentes numa ficha bem antiga", () => {
  const bemAntigo = { perfil: { nome: "Zé" } };
  const normalizado = normalizarPersonagemLivre(bemAntigo);
  assert.equal(normalizado.diaAtual, 1);
  assert.equal(normalizado.horaAtual, "08:00");
  assert.equal(normalizado.diaSemanaDoDia1, "segunda");
  assert.deepEqual(normalizado.gradeHoraria, []);
  assert.deepEqual(normalizado.excecoesCalendario, []);
  assert.deepEqual(normalizado.compromissos, []);
  assert.deepEqual(normalizado.mural, []);
});

test("normalizarPersonagemLivre lida com `dados: {}` (ficha nunca aberta)", () => {
  const normalizado = normalizarPersonagemLivre({});
  assert.equal(normalizado.perfil.nome, "Novo Personagem");
  assert.equal(normalizado.xp, 0);
  assert.deepEqual(normalizado.locais, []);
});
