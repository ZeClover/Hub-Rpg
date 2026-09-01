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
  inventario: ItemLivre[];
  notas: NotaLivre[];
  historicoImportacoes: ImportacaoAplicada[];
};

export function novoPersonagemLivre(nome: string): PersonagemLivre {
  return {
    perfil: { nome: nome?.trim() || "Novo Personagem" },
    xp: 0,
    nivel: 1,
    recursos: {},
    inventario: [],
    notas: [],
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
    inventario: Array.isArray(d.inventario) ? d.inventario : [],
    notas: Array.isArray(d.notas) ? d.notas : [],
    historicoImportacoes: Array.isArray(d.historicoImportacoes) ? d.historicoImportacoes : [],
  };
}
