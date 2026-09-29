import assert from "node:assert/strict";
import test from "node:test";
import { catalogoDaFormacaoInicial, erroNaSelecaoInicial, formacaoInicialConcluida } from "./formacao-inicial.ts";

test("antes da confirmação mostra os 59 conteúdos", () => {
  assert.equal(catalogoDaFormacaoInicial({ pericias: {} }).length, 59);
});

test("requisitos bloqueiam a escolha sem esconder o conteúdo", () => {
  const catalogo = catalogoDaFormacaoInicial({ pericias: { "Defesa Contra as Artes das Trevas": 1 } });
  assert.equal(catalogo.find((c) => c.slug === "expelliarmus")?.estado, "bloqueado");
  assert.equal(catalogo.find((c) => c.slug === "rictusempra")?.estado, "disponivel");
});

test("exige quatro escolhas distintas e com requisito atendido", () => {
  const validos = ["lumos-nox", "wingardium-leviosa", "reparo", "scourgify"];
  assert.equal(erroNaSelecaoInicial(validos), null);
  assert.match(erroNaSelecaoInicial(validos.slice(0, 3))!, /exatamente 4/);
  assert.match(erroNaSelecaoInicial([validos[0], validos[0], validos[2], validos[3]])!, /exatamente 4/);
  assert.match(erroNaSelecaoInicial(["expelliarmus", ...validos.slice(0, 3)], { "Defesa Contra as Artes das Trevas": 1 })!, /Expelliarmus/);
});

test("a conclusão fica permanente mesmo se o Mestre promover um dos quatro", () => {
  assert.equal(formacaoInicialConcluida({ academico: { formacaoInicialConcluida: true }, conteudosConhecidos: { "lumos-nox": "conhecido" } }), true);
  assert.equal(formacaoInicialConcluida({ conteudosConhecidos: { a: "formacao-inicial", b: "formacao-inicial", c: "formacao-inicial", d: "formacao-inicial" } }), true);
});
