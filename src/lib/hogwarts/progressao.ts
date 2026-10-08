import { CONTEUDOS_HOGWARTS_1_ANO } from "./conteudos-primeiro-ano.ts";
import type { DadosCriacaoHogwarts } from "./criacao.ts";

const MARCOS = new Set([5, 10, 15, 20, 25, 30, 35]);
const CUSTOS_UNICOS: Record<string, number> = Object.fromEntries([
  "animagia-1", "legilimencia-1", "oclumencia-1", "sem-varinha-1", "criador-1",
  "metamorfomagia-1", "vidente-1", "ofidioglossia", "heranca-1", "vinculo-criatura",
  "vinculo-reliquia", "vinculo-hogwarts", "vinculo-espiritual",
].map((id) => [id, 2]));
for (const prefixo of ["animagia", "legilimencia", "oclumencia", "sem-varinha", "criador"]) {
  for (let ordem = 2; ordem <= 4; ordem++) CUSTOS_UNICOS[`${prefixo}-${ordem}`] = 1;
}
for (const prefixo of ["metamorfomagia", "vidente", "heranca"]) {
  for (let ordem = 2; ordem <= 3; ordem++) CUSTOS_UNICOS[`${prefixo}-${ordem}`] = 1;
}
Object.assign(CUSTOS_UNICOS, { "patrono-corporeo": 1, "guardiao-patronal": 1, "maestria-patrono": 1 });

export type EscolhasProgressaoHogwarts = {
  pericia?: string;
  conteudos?: string[];
  atributo?: string;
  unicos?: string[];
};

function limitePericia(nivel: number) {
  const ano = Math.max(1, Math.min(7, Math.ceil(nivel / 5)));
  return ano <= 2 ? 2 : ano <= 4 ? 3 : ano === 5 ? 4 : 5;
}

export function aplicarProgressaoHogwarts(dados: DadosCriacaoHogwarts, escolhas: EscolhasProgressaoHogwarts) {
  if (dados.academico?.criacaoFinalizada !== true) throw new Error("Conclua a criação antes de evoluir.");
  const nivelAtual = Number(dados.nivel ?? 1);
  if (!Number.isInteger(nivelAtual) || nivelAtual < 1 || nivelAtual >= 35) throw new Error("Nível atual inválido.");
  const proximo = nivelAtual + 1;
  const novo: DadosCriacaoHogwarts = structuredClone(dados);

  if (MARCOS.has(proximo)) {
    const atributo = escolhas.atributo ?? "";
    const atual = Number(novo.atributos?.[atributo] ?? NaN);
    if (!Number.isInteger(atual) || atual < 0 || atual >= 5) throw new Error("Escolha um Atributo válido abaixo de 5.");
    const unicos = [...new Set(escolhas.unicos ?? [])];
    const jaPossui = (novo.unicosAdquiridos ?? {}) as Record<string, boolean>;
    if (!unicos.length || unicos.some((id) => !CUSTOS_UNICOS[id] || jaPossui[id])) throw new Error("Escolha Conteúdos Únicos válidos e ainda não adquiridos.");
    if (unicos.reduce((total, id) => total + CUSTOS_UNICOS[id], 0) !== 2) throw new Error("Use exatamente 2 pontos de Conteúdos Únicos.");
    novo.atributos = { ...(novo.atributos ?? {}), [atributo]: atual + 1 };
    novo.unicosAdquiridos = { ...jaPossui, ...Object.fromEntries(unicos.map((id) => [id, true])) };
  } else {
    const pericia = escolhas.pericia ?? "";
    const atual = Number(novo.pericias?.[pericia] ?? NaN);
    if (!Number.isInteger(atual) || atual < 0 || atual >= limitePericia(proximo)) throw new Error("Escolha uma Perícia válida dentro do limite do ano.");
    const conteudos = [...new Set(escolhas.conteudos ?? [])];
    if (conteudos.length !== 2) throw new Error("Escolha exatamente 2 Conteúdos disponíveis.");
    const estados = { ...((novo.conteudosConhecidos ?? {}) as Record<string, string>) };
    for (const slug of conteudos) {
      const conteudo = CONTEUDOS_HOGWARTS_1_ANO.find((item) => item.slug === slug);
      if (!conteudo || estados[slug] !== "disponivel") throw new Error("Um dos Conteúdos não está disponível para evolução.");
      if (Number(novo.pericias?.[conteudo.pericia] ?? 0) < conteudo.requisito_pericia) throw new Error(`Requisito não atendido: ${conteudo.nome}.`);
      estados[slug] = "conhecido";
    }
    novo.pericias = { ...(novo.pericias ?? {}), [pericia]: atual + 1 };
    novo.conteudosConhecidos = estados;
  }
  novo.nivel = proximo;
  return novo;
}
