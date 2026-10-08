type Registro = Record<string, unknown>;

export const CAMPOS_SECRETOS_VARINHA = ["tendencia", "propriedade", "peculiaridade", "lealdade"] as const;
export type CampoSecretoVarinha = typeof CAMPOS_SECRETOS_VARINHA[number];
const ROTULOS_SECRETOS: Record<CampoSecretoVarinha, string> = { tendencia: "Tendência", propriedade: "Propriedade", peculiaridade: "Peculiaridade", lealdade: "Lealdade" };

export type DadosVarinhaHogwarts = Registro & {
  varinha?: Registro & {
    madeira?: string;
    nucleo?: string;
    comprimento?: string;
    flexibilidade?: string;
    sintonia?: number;
    entregue?: boolean;
    revelados?: string[];
  };
  _mestre?: Registro & { varinha?: Registro };
};

export type EntregaVarinha = {
  madeira: string;
  nucleo: string;
  comprimento: string;
  flexibilidade: string;
  tendencia?: string;
  propriedade?: string;
  peculiaridade?: string;
  lealdade?: string;
};

function texto(valor: unknown, nome: string, obrigatorio = false) {
  if (valor !== undefined && typeof valor !== "string") throw new Error(`${nome} inválido.`);
  const limpo = String(valor ?? "").trim();
  if (obrigatorio && !limpo) throw new Error(`Informe ${nome.toLowerCase()}.`);
  if (limpo.length > 160) throw new Error(`${nome} é muito longo.`);
  return limpo;
}

export function entregarVarinha(dados: DadosVarinhaHogwarts, entrega: EntregaVarinha): DadosVarinhaHogwarts {
  const madeira = texto(entrega.madeira, "Madeira", true);
  const nucleo = texto(entrega.nucleo, "Núcleo", true);
  const comprimento = texto(entrega.comprimento, "Comprimento", true);
  const flexibilidade = texto(entrega.flexibilidade, "Flexibilidade", true);
  const mestreAtual = dados._mestre ?? {};
  const segredosAtuais = mestreAtual.varinha ?? {};
  const segredos = Object.fromEntries(CAMPOS_SECRETOS_VARINHA.map((campo) => [campo, texto(entrega[campo], ROTULOS_SECRETOS[campo])]));
  return {
    ...dados,
    varinha: { ...dados.varinha, madeira, nucleo, comprimento, flexibilidade, sintonia: 1, entregue: true, revelados: [] },
    _mestre: { ...mestreAtual, varinha: { ...segredosAtuais, ...segredos } },
  };
}

export function avancarSintoniaVarinha(dados: DadosVarinhaHogwarts): DadosVarinhaHogwarts {
  if (dados.varinha?.entregue !== true) throw new Error("Entregue a varinha antes de avançar a Sintonia.");
  const atual = Number(dados.varinha.sintonia ?? 1);
  if (!Number.isInteger(atual) || atual < 1 || atual > 4) throw new Error("Sintonia inválida.");
  if (atual === 4) throw new Error("A varinha já alcançou Sintonia IV.");
  return { ...dados, varinha: { ...dados.varinha, sintonia: atual + 1 } };
}

export function revelarCampoVarinha(dados: DadosVarinhaHogwarts, campo: CampoSecretoVarinha): DadosVarinhaHogwarts {
  if (!CAMPOS_SECRETOS_VARINHA.includes(campo)) throw new Error("Campo de revelação inválido.");
  if (dados.varinha?.entregue !== true) throw new Error("Entregue a varinha antes de revelar propriedades.");
  const valor = texto(dados._mestre?.varinha?.[campo], ROTULOS_SECRETOS[campo], true);
  const revelados = [...new Set([...(dados.varinha.revelados ?? []), campo])];
  return { ...dados, varinha: { ...dados.varinha, [campo]: valor, revelados } };
}
