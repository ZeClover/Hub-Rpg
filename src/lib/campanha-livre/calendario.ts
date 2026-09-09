/*
  Motor de calendário — deriva o bloco atual e o próximo bloco a partir da
  grade semanal recorrente + exceções pontuais + "agora" da campanha
  (dia/hora). Só matemática determinística sobre dados já recebidos via
  HUB_UPDATE — nunca inventa aula/evento que não está na grade (regras
  #83/#84/#125 do pedido da Academia Mágica).

  Regra #85 do pedido: BASE + exceções, nunca reescrever a grade inteira
  pra representar uma exceção de um dia só — por isso `blocosDoDia` aplica
  as exceções daquele dia por cima da grade recorrente, sem mutar nada.
*/
import type { BlocoGrade, DiaSemana, PersonagemLivre } from "./tipos.ts";

export const DIAS_SEMANA: DiaSemana[] = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export const ROTULOS_DIA_SEMANA: Record<DiaSemana, string> = {
  domingo: "Domingo",
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
};

/** "HH:MM" -> minutos desde meia-noite, pra comparar/ordenar horários sem depender de string lexicográfica. */
export function paraMinutos(horaMinuto: string): number {
  const [h, m] = horaMinuto.split(":").map((parte) => Number(parte));
  return (h || 0) * 60 + (m || 0);
}

/** Deriva o dia da semana de um dia absoluto da campanha — dia 1 é `diaSemanaDoDia1`, e daí por diante por módulo 7. */
export function diaSemanaDoDia(personagem: PersonagemLivre, dia: number): DiaSemana {
  const indiceBase = DIAS_SEMANA.indexOf(personagem.diaSemanaDoDia1);
  const deslocamento = (((dia - 1) % 7) + 7) % 7;
  return DIAS_SEMANA[(indiceBase + deslocamento) % 7];
}

export type BlocoEfetivo = {
  inicio: string;
  fim: string;
  rotulo: string;
  local?: string;
  /** true quando veio de uma exceção (cancelado/alterado/adicionado) em vez da grade base. */
  deExcecao: boolean;
};

/** Blocos efetivos de um dia específico: grade base daquele dia da semana, com as exceções daquele dia aplicadas por cima. */
export function blocosDoDia(personagem: PersonagemLivre, dia: number): BlocoEfetivo[] {
  const semana = diaSemanaDoDia(personagem, dia);
  let resultado: BlocoEfetivo[] = personagem.gradeHoraria
    .filter((b: BlocoGrade) => b.diaSemana === semana)
    .map((b) => ({ inicio: b.inicio, fim: b.fim, rotulo: b.rotulo, local: b.local, deExcecao: false }));

  const excecoesDoDia = personagem.excecoesCalendario.filter((e) => e.dia === dia);
  for (const excecao of excecoesDoDia) {
    if (excecao.tipo === "cancelado") {
      resultado = resultado.filter((b) => b.rotulo !== excecao.rotuloAlvo);
    } else if (excecao.tipo === "alterado") {
      resultado = resultado.map((b) =>
        b.rotulo === excecao.rotuloAlvo
          ? {
              inicio: excecao.novoInicio ?? b.inicio,
              fim: excecao.novoFim ?? b.fim,
              rotulo: excecao.novoRotulo ?? b.rotulo,
              local: b.local,
              deExcecao: true,
            }
          : b,
      );
    } else if (excecao.tipo === "adicionado" && excecao.novoInicio && excecao.novoFim && excecao.novoRotulo) {
      resultado = [...resultado, { inicio: excecao.novoInicio, fim: excecao.novoFim, rotulo: excecao.novoRotulo, deExcecao: true }];
    }
  }

  return resultado.slice().sort((a, b) => paraMinutos(a.inicio) - paraMinutos(b.inicio));
}

/** O bloco rolando agora mesmo (dia atual + hora atual dentro de [início, fim)), ou null se a hora está livre. */
export function blocoAtual(personagem: PersonagemLivre): BlocoEfetivo | null {
  const agora = paraMinutos(personagem.horaAtual);
  const blocos = blocosDoDia(personagem, personagem.diaAtual);
  return blocos.find((b) => paraMinutos(b.inicio) <= agora && agora < paraMinutos(b.fim)) ?? null;
}

export type ProximoBloco = BlocoEfetivo & { dia: number };

/**
 * Próximo bloco a partir de agora: olha o resto do dia atual primeiro, senão avança dia a dia.
 * `limiteDias` evita loop longo numa grade vazia — 14 dias é mais que suficiente pra cobrir uma
 * semana cheia de exceções.
 */
export function proximoBloco(personagem: PersonagemLivre, limiteDias = 14): ProximoBloco | null {
  const agora = paraMinutos(personagem.horaAtual);
  const restoDeHoje = blocosDoDia(personagem, personagem.diaAtual).find((b) => paraMinutos(b.inicio) > agora);
  if (restoDeHoje) return { ...restoDeHoje, dia: personagem.diaAtual };

  for (let i = 1; i <= limiteDias; i++) {
    const dia = personagem.diaAtual + i;
    const [primeiro] = blocosDoDia(personagem, dia);
    if (primeiro) return { ...primeiro, dia };
  }
  return null;
}
