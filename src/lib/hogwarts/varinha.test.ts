import assert from "node:assert/strict";
import test from "node:test";
import { avancarSintoniaVarinha, entregarVarinha, revelarCampoVarinha } from "./varinha.ts";

const entrega = { madeira: "Azevinho", nucleo: "Pena de fênix", comprimento: "28 cm", flexibilidade: "Flexível", tendencia: "Protetora", propriedade: "Luz firme", peculiaridade: "Aquece", lealdade: "Leal" };

test("Mestre entrega varinha com campos públicos e segredos separados", () => {
  const dados = entregarVarinha({ perfil: { nome: "Eiris" }, _mestre: { nota: "preservar" } }, entrega);
  assert.deepEqual(dados.varinha, { madeira: "Azevinho", nucleo: "Pena de fênix", comprimento: "28 cm", flexibilidade: "Flexível", sintonia: 1, entregue: true, revelados: [] });
  assert.equal(dados._mestre?.varinha?.tendencia, "Protetora");
  assert.equal(dados._mestre?.nota, "preservar");
});

test("Sintonia avança uma etapa e respeita o teto IV", () => {
  let dados = entregarVarinha({}, entrega);
  dados = avancarSintoniaVarinha(dados);
  assert.equal(dados.varinha?.sintonia, 2);
  dados = avancarSintoniaVarinha(avancarSintoniaVarinha(dados));
  assert.equal(dados.varinha?.sintonia, 4);
  assert.throws(() => avancarSintoniaVarinha(dados), /Sintonia IV/);
});

test("revelação copia somente o campo escolhido para a visão pública", () => {
  const dados = revelarCampoVarinha(entregarVarinha({}, entrega), "tendencia");
  assert.equal(dados.varinha?.tendencia, "Protetora");
  assert.equal(dados.varinha?.propriedade, undefined);
  assert.deepEqual(dados.varinha?.revelados, ["tendencia"]);
  assert.throws(() => revelarCampoVarinha(entregarVarinha({}, { ...entrega, tendencia: "" }), "tendencia"), /Informe tendência/);
});

test("varinha incompleta e avanço antes da entrega são recusados", () => {
  assert.throws(() => entregarVarinha({}, { ...entrega, madeira: "" }), /madeira/);
  assert.throws(() => avancarSintoniaVarinha({}), /Entregue/);
});
