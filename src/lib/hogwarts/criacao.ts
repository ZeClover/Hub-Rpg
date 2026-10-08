import { erroNaSelecaoInicial } from "./formacao-inicial.ts";

export const TRADICOES_POR_CASA = {
  "Grifinória": ["Sangue Frio", "Entrar na Frente", "Primeiro a Agir"],
  "Sonserina": ["Sempre um Passo à Frente", "Sangue Frio Social", "Recursos"],
  "Corvinal": ["Perspectiva Incomum", "Curiosidade Arcana", "Memória Acadêmica"],
  "Lufa-Lufa": ["Persistência", "Mãos Cuidadosas", "Juntos Somos Melhores"],
} as const;

export const ATRIBUTOS_HOGWARTS = ["Arcano", "Engenho", "Pulso", "Presença", "Fibra"] as const;

type Registro = Record<string, unknown>;
export type DadosCriacaoHogwarts = Registro & {
  perfil?: Registro & { nome?: string; casa?: string; tradicao?: string };
  atributos?: Record<string, number>;
  pericias?: Record<string, number>;
  conteudosConhecidos?: Record<string, string>;
  academico?: Registro & { criacaoVersao?: number; criacaoFinalizada?: boolean; formacaoInicialConcluida?: boolean };
};

export function errosCriacaoHogwarts(dados: DadosCriacaoHogwarts): string[] {
  const erros: string[] = [];
  if (!dados.perfil?.nome?.trim()) erros.push("Informe o nome do personagem.");

  const valores = ATRIBUTOS_HOGWARTS.map((nome) => Number(dados.atributos?.[nome] ?? NaN)).sort((a, b) => a - b);
  if (valores.some((valor) => !Number.isInteger(valor)) || valores.join(",") !== "0,1,2,2,3") {
    erros.push("Distribua os Atributos exatamente como 3, 2, 2, 1 e 0.");
  }

  const treinamentos = Object.values(dados.pericias ?? {});
  if (treinamentos.some((valor) => !Number.isInteger(valor) || valor < 0 || valor > 2)
      || treinamentos.reduce((total, valor) => total + valor, 0) !== 3) {
    erros.push("Distribua exatamente 3 treinamentos de Perícia, com limite 2 no 1º ano.");
  }

  const casa = dados.perfil?.casa as keyof typeof TRADICOES_POR_CASA | undefined;
  if (!casa || !(casa in TRADICOES_POR_CASA)) erros.push("Escolha uma Casa válida.");
  else if (!(TRADICOES_POR_CASA[casa] as readonly string[]).includes(dados.perfil?.tradicao ?? "")) {
    erros.push("Escolha exatamente uma Tradição da Casa selecionada.");
  }

  const iniciais = Object.entries(dados.conteudosConhecidos ?? {})
    .filter(([, estado]) => estado === "formacao-inicial")
    .map(([slug]) => slug);
  const erroConteudos = erroNaSelecaoInicial(iniciais, dados.pericias);
  if (erroConteudos) erros.push(erroConteudos);
  return erros;
}

export function finalizarCriacaoHogwarts(dados: DadosCriacaoHogwarts): DadosCriacaoHogwarts {
  const erros = errosCriacaoHogwarts(dados);
  if (erros.length) throw new Error(erros.join(" "));
  return {
    ...dados,
    nivel: 1,
    periciasOverride: false,
    academico: {
      ...(dados.academico ?? {}),
      criacaoVersao: 1,
      criacaoFinalizada: true,
      formacaoInicialConcluida: true,
    },
  };
}

/** Campos de progressão deixam de ser editáveis pelo PATCH genérico. */
export function preservarEstadoAutoritativoHogwarts(antes: DadosCriacaoHogwarts, depois: DadosCriacaoHogwarts) {
  // Somente o rascunho criado pelo assistente novo continua livre. Fichas
  // legadas já existiam como personagens completos e também devem passar
  // pelas rotas específicas de progressão, sem migração destrutiva.
  if (antes.academico?.criacaoVersao === 1 && antes.academico?.criacaoFinalizada !== true) return depois;
  return {
    ...depois,
    nivel: antes.nivel,
    atributos: antes.atributos,
    pericias: antes.pericias,
    periciasOverride: antes.periciasOverride,
    galeoes: antes.galeoes,
    bestiarioConhecido: antes.bestiarioConhecido,
    unicosAdquiridos: antes.unicosAdquiridos,
    varinha: antes.varinha,
    academico: antes.academico,
  };
}
