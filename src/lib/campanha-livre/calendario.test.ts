import assert from "node:assert/strict";
import { test } from "node:test";

import { blocoAtual, blocosDoDia, diaSemanaDoDia, paraMinutos, proximoBloco } from "./calendario.ts";
import { novoPersonagemLivre, type BlocoGrade, type PersonagemLivre } from "./tipos.ts";

function comGrade(blocos: Omit<BlocoGrade, "id" | "criadoEm">[]): PersonagemLivre {
  const ficha = novoPersonagemLivre("Zé");
  ficha.gradeHoraria = blocos.map((b, i) => ({ ...b, id: `bloco-${i}`, criadoEm: 1 }));
  return ficha;
}

test("paraMinutos converte HH:MM em minutos desde meia-noite", () => {
  assert.equal(paraMinutos("00:00"), 0);
  assert.equal(paraMinutos("08:00"), 480);
  assert.equal(paraMinutos("14:40"), 880);
});

test("diaSemanaDoDia deriva pelo módulo 7 a partir de diaSemanaDoDia1", () => {
  const ficha = novoPersonagemLivre("Zé");
  ficha.diaSemanaDoDia1 = "segunda";
  assert.equal(diaSemanaDoDia(ficha, 1), "segunda");
  assert.equal(diaSemanaDoDia(ficha, 2), "terca");
  assert.equal(diaSemanaDoDia(ficha, 7), "domingo");
  assert.equal(diaSemanaDoDia(ficha, 8), "segunda");
  assert.equal(diaSemanaDoDia(ficha, 15), "segunda");
});

// Cenário exato do pedido (PARTE 84): segunda tem Mana 08:00, Teoria 09:45,
// Prática 12:30, História 14:15-15:45. Hora atual 14:40 -> aula atual é História.
test("blocoAtual: 14:40 numa segunda com grade cheia -> História em andamento", () => {
  const ficha = comGrade([
    { diaSemana: "segunda", inicio: "08:00", fim: "09:45", rotulo: "Mana" },
    { diaSemana: "segunda", inicio: "09:45", fim: "12:30", rotulo: "Teoria" },
    { diaSemana: "segunda", inicio: "12:30", fim: "14:15", rotulo: "Prática" },
    { diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" },
  ]);
  ficha.diaAtual = 1; // dia 1 = segunda (padrão)
  ficha.horaAtual = "14:40";
  const bloco = blocoAtual(ficha);
  assert.ok(bloco);
  assert.equal(bloco!.rotulo, "História");
});

test("blocoAtual: 15:46 (depois do fim de todas as aulas do dia) -> nenhum bloco atual", () => {
  const ficha = comGrade([{ diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" }]);
  ficha.diaAtual = 1;
  ficha.horaAtual = "15:46";
  assert.equal(blocoAtual(ficha), null);
});

test("proximoBloco: 15:46 numa segunda sem mais nada hoje -> próxima aula regular de terça", () => {
  const ficha = comGrade([
    { diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" },
    { diaSemana: "terca", inicio: "08:00", fim: "09:45", rotulo: "Runas" },
  ]);
  ficha.diaAtual = 1;
  ficha.horaAtual = "15:46";
  const proximo = proximoBloco(ficha);
  assert.ok(proximo);
  assert.equal(proximo!.rotulo, "Runas");
  assert.equal(proximo!.dia, 2);
});

test("proximoBloco: ainda há bloco mais tarde no mesmo dia -> não pula pro dia seguinte", () => {
  const ficha = comGrade([
    { diaSemana: "segunda", inicio: "08:00", fim: "09:45", rotulo: "Mana" },
    { diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" },
  ]);
  ficha.diaAtual = 1;
  ficha.horaAtual = "10:00";
  const proximo = proximoBloco(ficha);
  assert.ok(proximo);
  assert.equal(proximo!.rotulo, "História");
  assert.equal(proximo!.dia, 1);
});

test("grade vazia -> blocoAtual e proximoBloco null, sem travar", () => {
  const ficha = novoPersonagemLivre("Zé");
  assert.equal(blocoAtual(ficha), null);
  assert.equal(proximoBloco(ficha), null);
});

// Exceções (regra #85): BASE + exceção, nunca reescrever a grade inteira.
test("exceção 'cancelado' remove o bloco daquele dia específico, sem afetar outras semanas", () => {
  const ficha = comGrade([{ diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" }]);
  ficha.excecoesCalendario = [
    { id: "e1", dia: 1, tipo: "cancelado", rotuloAlvo: "História", criadaEm: 1 },
  ];
  assert.equal(blocosDoDia(ficha, 1).length, 0, "dia 1 (cancelado) não deveria ter o bloco");
  assert.equal(blocosDoDia(ficha, 8).length, 1, "dia 8 (outra segunda) continua com o bloco normal");
});

test("exceção 'alterado' muda horário/rótulo só naquele dia", () => {
  const ficha = comGrade([{ diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" }]);
  ficha.excecoesCalendario = [
    { id: "e1", dia: 1, tipo: "alterado", rotuloAlvo: "História", novoInicio: "16:00", novoFim: "17:00", motivo: "professor atrasou", criadaEm: 1 },
  ];
  const [bloco] = blocosDoDia(ficha, 1);
  assert.equal(bloco.inicio, "16:00");
  assert.equal(bloco.fim, "17:00");
  assert.equal(bloco.rotulo, "História", "sem novoRotulo, mantém o rótulo original");
  assert.equal(bloco.deExcecao, true);

  const [blocoOutraSemana] = blocosDoDia(ficha, 8);
  assert.equal(blocoOutraSemana.inicio, "14:15", "outra segunda continua no horário normal");
});

test("exceção 'adicionado' cria um bloco extra só naquele dia, sem tocar a grade base", () => {
  const ficha = comGrade([{ diaSemana: "segunda", inicio: "08:00", fim: "09:45", rotulo: "Mana" }]);
  ficha.excecoesCalendario = [
    { id: "e1", dia: 1, tipo: "adicionado", novoInicio: "18:00", novoFim: "19:00", novoRotulo: "Clube de Duelos", criadaEm: 1 },
  ];
  const blocos = blocosDoDia(ficha, 1);
  assert.equal(blocos.length, 2);
  assert.ok(blocos.some((b) => b.rotulo === "Clube de Duelos" && b.deExcecao));
  assert.equal(blocosDoDia(ficha, 8).length, 1, "outra segunda não ganha o bloco extra");
});

test("blocosDoDia ordena por horário de início mesmo com exceção adicionada fora de ordem", () => {
  const ficha = comGrade([{ diaSemana: "segunda", inicio: "14:15", fim: "15:45", rotulo: "História" }]);
  ficha.excecoesCalendario = [
    { id: "e1", dia: 1, tipo: "adicionado", novoInicio: "08:00", novoFim: "09:00", novoRotulo: "Reforço", criadaEm: 1 },
  ];
  const blocos = blocosDoDia(ficha, 1);
  assert.equal(blocos[0].rotulo, "Reforço");
  assert.equal(blocos[1].rotulo, "História");
});
