import assert from "node:assert/strict";
import test from "node:test";
import { somarPontosCasas, validarEventoPontoCasa } from "./pontos-casas.ts";

test("total é sempre a soma do ledger, inclusive correções", () => {
  assert.deepEqual(somarPontosCasas([
    { casa: "Grifinória", delta: 10 }, { casa: "Grifinória", delta: -5 },
    { casa: "Lufa-Lufa", delta: 15 }, { casa: "Casa inventada", delta: 999 },
  ]), { "Grifinória": 5, "Sonserina": 0, "Corvinal": 0, "Lufa-Lufa": 15 });
});

test("evento exige casa, pontos inteiros e motivo útil", () => {
  assert.deepEqual(validarEventoPontoCasa("Corvinal", "20", "Excelente resposta"), { casa: "Corvinal", delta: 20, motivo: "Excelente resposta" });
  assert.throws(() => validarEventoPontoCasa("Durmstrang", 10, "Teste"), /Casa inválida/);
  assert.throws(() => validarEventoPontoCasa("Corvinal", 0, "Teste"), /diferente de zero/);
  assert.throws(() => validarEventoPontoCasa("Corvinal", 1.5, "Teste"), /inteira/);
  assert.throws(() => validarEventoPontoCasa("Corvinal", 10, "x"), /motivo/);
});
