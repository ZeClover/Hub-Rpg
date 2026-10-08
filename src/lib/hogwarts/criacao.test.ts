import assert from "node:assert/strict";
import test from "node:test";
import { errosCriacaoHogwarts, finalizarCriacaoHogwarts, preservarEstadoAutoritativoHogwarts } from "./criacao.ts";

function valida() {
  return {
    perfil: { nome: "Eiris", casa: "Grifinória", tradicao: "Primeiro a Agir" },
    atributos: { Arcano: 3, Engenho: 2, Pulso: 2, Presença: 1, Fibra: 0 },
    pericias: { "Feitiços": 1, "Voo": 2 },
    conteudosConhecidos: {
      "lumos-nox": "formacao-inicial", "wingardium-leviosa": "formacao-inicial",
      "reparo": "formacao-inicial", "montagem-pouso-seguro": "formacao-inicial",
    },
    academico: { criacaoVersao: 1 },
  };
}

test("criação válida exige pacote completo e finaliza no nível 1", () => {
  assert.deepEqual(errosCriacaoHogwarts(valida()), []);
  const final = finalizarCriacaoHogwarts(valida());
  assert.equal(final.nivel, 1);
  assert.equal(final.academico?.criacaoFinalizada, true);
});

test("recusa distribuição, treinamentos e tradição inválidos", () => {
  const dados = valida();
  dados.atributos.Arcano = 2;
  dados.pericias.Voo = 1;
  dados.perfil.tradicao = "Tradição inventada";
  const erros = errosCriacaoHogwarts(dados);
  assert.ok(erros.some((erro) => erro.includes("Atributos")));
  assert.ok(erros.some((erro) => erro.includes("3 treinamentos")));
  assert.ok(erros.some((erro) => erro.includes("Tradição")));
});

test("PATCH genérico preserva progressão depois da criação", () => {
  const antes = finalizarCriacaoHogwarts(valida());
  const depois = { ...antes, nivel: 9, galeoes: 999, atributos: { Arcano: 5 } };
  const protegido = preservarEstadoAutoritativoHogwarts(antes, depois);
  assert.equal(protegido.nivel, 1);
  assert.deepEqual(protegido.atributos, antes.atributos);
  assert.equal(protegido.galeoes, antes.galeoes);
});

test("PATCH genérico também protege ficha legada sem exigir migração", () => {
  const antes = { ...valida(), nivel: 7, academico: {} };
  const protegido = preservarEstadoAutoritativoHogwarts(antes, { ...antes, nivel: 30 });
  assert.equal(protegido.nivel, 7);
});
