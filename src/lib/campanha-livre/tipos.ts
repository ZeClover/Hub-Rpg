/*
  Formato de `dados` para o sistema Campanha Livre (decisão #17: cada
  sistema é dono do formato da própria ficha, o banco só guarda JSON).

  Diferente dos outros quatro sistemas do Hub, aqui não existe um livro de
  regras fechado — a ficha é XP, Nível, recursos e inventário livres,
  editados principalmente colando um bloco HUB_UPDATE que o ChatGPT
  escreveu (ver `parser.ts`). Nomes de recurso (mana, sanidade, o que a
  mesa usar) são o que a campanha decidir, por isso `recursos` é um mapa,
  não uma lista fixa de campos.
*/

export type RecursoLivre = {
  atual: number;
  /** null = a campanha ainda não definiu um teto pra este recurso. */
  maximo: number | null;
};

export type ItemLivre = {
  id: string;
  nome: string;
  quantidade: number;
  categoria?: string;
  descricao?: string;
  raridade?: string;
  origem?: string;
  tags?: string[];
  notas?: string;
  equipado?: boolean;
  /** Onde está equipado (ex: "mão", "cabeça") — só faz sentido se `equipado` for true. */
  slot?: string;
};

export type NotaLivre = {
  id: string;
  titulo: string;
  categoria?: string;
  texto: string;
  tags?: string[];
  flags?: Record<string, boolean>;
  criadaEm: number;
};

export type StatusMissao = "disponivel" | "ativa" | "concluida" | "falhou" | "abandonada" | "oculta";
export type StatusObjetivo = "pendente" | "concluido" | "falhou";

export type ObjetivoMissao = {
  texto: string;
  status: StatusObjetivo;
};

export type MissaoLivre = {
  id: string;
  nome: string;
  descricao?: string;
  status: StatusMissao;
  objetivos: ObjetivoMissao[];
  recompensas: string[];
  anotacoes: string[];
  criadaEm: number;
};

export type NpcLivre = {
  id: string;
  nome: string;
  descricao?: string;
  primeiroEncontro?: string;
  tags?: string[];
  /** Só o que o jogador já sabe sobre o NPC — nunca segredo de mestre (regra #55 do protocolo). */
  conhecimento: string[];
  /** Nomes livres (trust, proximity, o que a campanha usar) — igual a `atributos`. */
  relacoes: Record<string, number>;
  criadoEm: number;
};

export type StatusDescoberta = "desconhecido" | "suspeita" | "teoria" | "testando" | "parcial" | "confirmada" | "refutada";

export type DescobertaLivre = {
  id: string;
  titulo: string;
  categoria?: string;
  status: StatusDescoberta;
  descricao?: string;
  evidencias: string[];
  criadaEm: number;
};

export type CodexLivre = {
  id: string;
  titulo: string;
  categoria?: string;
  texto: string;
  criadoEm: number;
};

export type LocalLivre = {
  id: string;
  nome: string;
  descricao?: string;
  descoberto: boolean;
  conhecimento: string[];
  criadoEm: number;
};

export type CriaturaLivre = {
  id: string;
  nome: string;
  categoria?: string;
  descricao?: string;
  tracosConhecidos: string[];
  criadaEm: number;
};

export type EntradaDiario = {
  id: string;
  titulo: string;
  resumo?: string;
  eventos: string[];
  criadaEm: number;
};

/*
  Registro mínimo de importações já aplicadas — só o suficiente pra avisar
  "isso já foi importado antes" (regra #7 do protocolo). Um event log de
  verdade, com undo por evento, fica pra uma fatia futura (decisão #26).
*/
export type ImportacaoAplicada = {
  hash: string;
  updateId: string | null;
  aplicadoEm: number;
  resumo: string[];
};

export type PersonagemLivre = {
  perfil: { nome: string };
  xp: number;
  nivel: number;
  recursos: Record<string, RecursoLivre>;
  /** Nomes livres, definidos pela campanha (ex: FOR, INT) — igual a `recursos`, mas sem teto. */
  atributos: Record<string, number>;
  /** Moedas da campanha (ex: berries, ouro) — só um total, sem teto. */
  moedas: Record<string, number>;
  inventario: ItemLivre[];
  notas: NotaLivre[];
  missoes: MissaoLivre[];
  npcs: NpcLivre[];
  descobertas: DescobertaLivre[];
  codex: CodexLivre[];
  locais: LocalLivre[];
  criaturas: CriaturaLivre[];
  diario: EntradaDiario[];
  historicoImportacoes: ImportacaoAplicada[];
};

export function novoPersonagemLivre(nome: string): PersonagemLivre {
  return {
    perfil: { nome: nome?.trim() || "Novo Personagem" },
    xp: 0,
    nivel: 1,
    recursos: {},
    atributos: {},
    moedas: {},
    inventario: [],
    notas: [],
    missoes: [],
    npcs: [],
    descobertas: [],
    codex: [],
    locais: [],
    criaturas: [],
    diario: [],
    historicoImportacoes: [],
  };
}

/*
  Uma ficha nunca aberta guarda `dados: {}` (ver POST /api/personagens).
  Fichas migradas de uma fatia futura vão ganhar mais campos aqui — por
  isso todo campo é preenchido com `??`, nunca assumido presente.
*/
export function normalizarPersonagemLivre(dados: unknown): PersonagemLivre {
  const d = (typeof dados === "object" && dados !== null ? dados : {}) as Partial<PersonagemLivre>;
  return {
    perfil: { nome: d.perfil?.nome?.trim() || "Novo Personagem" },
    xp: typeof d.xp === "number" ? d.xp : 0,
    nivel: typeof d.nivel === "number" ? d.nivel : 1,
    recursos: d.recursos && typeof d.recursos === "object" ? d.recursos : {},
    atributos: d.atributos && typeof d.atributos === "object" ? d.atributos : {},
    moedas: d.moedas && typeof d.moedas === "object" ? d.moedas : {},
    inventario: Array.isArray(d.inventario) ? d.inventario : [],
    notas: Array.isArray(d.notas) ? d.notas : [],
    missoes: Array.isArray(d.missoes) ? d.missoes : [],
    npcs: Array.isArray(d.npcs) ? d.npcs : [],
    descobertas: Array.isArray(d.descobertas) ? d.descobertas : [],
    codex: Array.isArray(d.codex) ? d.codex : [],
    locais: Array.isArray(d.locais) ? d.locais : [],
    criaturas: Array.isArray(d.criaturas) ? d.criaturas : [],
    diario: Array.isArray(d.diario) ? d.diario : [],
    historicoImportacoes: Array.isArray(d.historicoImportacoes) ? d.historicoImportacoes : [],
  };
}
