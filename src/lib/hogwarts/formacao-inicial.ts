import { CONTEUDOS_HOGWARTS_1_ANO, SLUGS_CONTEUDOS_HOGWARTS_1_ANO } from "./conteudos-primeiro-ano.ts";

export type DadosFormacaoInicial = {
  conteudosConhecidos?: Record<string, string>;
  pericias?: Record<string, number>;
  academico?: Record<string, unknown> & { formacaoInicialConcluida?: boolean };
};

const ESTADOS_ADQUIRIDOS = ["formacao-inicial", "conhecido", "dominado", "assinatura"];

export function formacaoInicialConcluida(dados: DadosFormacaoInicial) {
  return dados.academico?.formacaoInicialConcluida === true
    || Object.values(dados.conteudosConhecidos ?? {}).filter((estado) => estado === "formacao-inicial").length >= 4;
}

export function catalogoDaFormacaoInicial(dados: DadosFormacaoInicial) {
  const atuais = dados.conteudosConhecidos ?? {};
  return CONTEUDOS_HOGWARTS_1_ANO.filter((conteudo) => conteudo.permitido_criacao).map((conteudo) => {
    const salvo = atuais[conteudo.slug];
    const cumpre = Number(dados.pericias?.[conteudo.pericia] ?? 0) >= conteudo.requisito_pericia;
    return {
      ...conteudo,
      estado: salvo && ESTADOS_ADQUIRIDOS.includes(salvo) ? salvo : cumpre ? "disponivel" : "bloqueado",
    };
  });
}

export function erroNaSelecaoInicial(slugs: string[], pericias: Record<string, number> = {}) {
  if (slugs.length !== 4 || new Set(slugs).size !== 4 || slugs.some((slug) => !SLUGS_CONTEUDOS_HOGWARTS_1_ANO.has(slug))) {
    return "escolha exatamente 4 conteúdos iniciais válidos";
  }
  for (const slug of slugs) {
    const conteudo = CONTEUDOS_HOGWARTS_1_ANO.find((item) => item.slug === slug)!;
    if (!conteudo.permitido_criacao) return `${conteudo.nome} não faz parte da Formação Inicial`;
    if (Number(pericias[conteudo.pericia] ?? 0) < conteudo.requisito_pericia) {
      return `requisito não atendido: ${conteudo.nome}`;
    }
  }
  return null;
}
