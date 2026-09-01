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
  /** null = a campanha ainda não definiu um piso pra este recurso (o Hub ainda avisa se ficar negativo, mas não bloqueia). */
  minimo: number | null;
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
  /** `generate_image: true` no HUB_UPDATE (regra #32 do protocolo) — só marca a fila, nunca gera a imagem sozinho. */
  imagemPendente?: boolean;
  promptImagem?: string;
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

export type TipoDuracao = "rounds" | "turns" | "scenes" | "sessions" | "until_rest" | "until_removed" | "custom";

export type DuracaoEfeito = {
  tipo: TipoDuracao;
  /** Só faz sentido pra rounds/turns/scenes/sessions; custom usa `descricao` em vez de número. */
  valor?: number;
  descricao?: string;
};

export type ModificadorTemporario = {
  id: string;
  nome: string;
  /** Nome livre do que é afetado — atributo, recurso, o que a campanha usar. */
  alvo: string;
  valor: number;
  duracao: DuracaoEfeito;
  criadoEm: number;
};

export type CondicaoLivre = {
  id: string;
  nome: string;
  descricao?: string;
  duracao?: DuracaoEfeito;
  criadaEm: number;
};

export type StatusDescobertaMagia = "teoria" | "testando" | "parcial" | "confirmada";

export type DescobertaMagia = {
  id: string;
  titulo: string;
  descricao?: string;
  status: StatusDescobertaMagia;
  criadaEm: number;
};

export type MagiaLivre = {
  id: string;
  nome: string;
  descricao?: string;
  afinidade?: string;
  /** Custo livre — mana, estamina, o que a campanha usar (regra: "não assumir que toda campanha usa mana"). */
  custo?: Record<string, number>;
  statusConhecimento?: string;
  progressoConhecimento?: number;
  tags?: string[];
  /** `spells_update.discoveries_add` — anotações simples, texto corrido. */
  descobertasSimples: string[];
  /** `spell_discoveries` — descobertas com título/descrição/status própria. */
  descobertas: DescobertaMagia[];
  criadaEm: number;
};

export type PesquisaLivre = {
  id: string;
  titulo: string;
  /** Livre (a especificação não fecha uma lista de valores pra pesquisa, diferente de missão/descoberta). */
  status: string;
  progresso: number;
  objetivos: string[];
  evidencias: string[];
  notas: string[];
  tags?: string[];
  criadaEm: number;
};

export type ConquistaLivre = {
  id: string;
  nome: string;
  descricao?: string;
  criadaEm: number;
};

export type SolicitacaoImagem = {
  id: string;
  /** Livre — item, npc, local, criatura, o que a campanha pedir (regra: "não hardcode categorias"). */
  tipoEntidade: string;
  nomeEntidade: string;
  promptSugerido?: string;
  prioridade?: string;
  atendida: boolean;
  criadaEm: number;
};

export type EntradaEscola = {
  id: string;
  materia: string;
  topico?: string;
  notas: string[];
  criadaEm: number;
};

/*
  Snapshot — regra #45 do protocolo. Guarda o estado inteiro da ficha num
  momento, exceto os próprios snapshots (senão cada snapshot cresceria
  incluindo todos os anteriores, sem limite). Não é gerado por HUB_UPDATE —
  é um botão manual na ficha, então não passa pelo sistema de Mudanca/
  evento; `restaurarSnapshot` troca o estado inteiro, mas isso só acontece
  depois de a pessoa confirmar num preview na tela (nunca sozinho).
*/
export type OrigemSnapshot = "manual" | "inicio_sessao" | "fim_sessao" | "antes_importacao";

export type SnapshotLivre = {
  id: string;
  titulo: string;
  criadoEm: number;
  origem: OrigemSnapshot;
  estado: Omit<PersonagemLivre, "snapshots">;
};

export type ImportacaoAplicada = {
  id: string;
  hash: string;
  updateId: string | null;
  aplicadoEm: number;
  resumo: string[];
};

/*
  Event log por mudança (regras #12/#41/#44/#45 do protocolo): cada mudança
  aplicada de uma importação vira um evento com o que a entidade era
  ANTES daquela mudança específica — nunca um diff de campo a campo. Isso
  cobre toda mudança de tipos hoje suportados sem precisar de um caso
  especial por operação: "raiz" pra XP/Nível, "mapa" pra recursos/
  atributos/moedas (chave = nome), "lista" pra tudo que é uma entidade com
  identidade própria (item, colinha, missão, NPC, descoberta, local,
  criatura, codex, diário). `antes: null` significa "não existia" — desfazer
  vira remover a entidade. Desfazer nunca apaga o evento original (regra
  #12), só marca `revertido: true`.
*/
export type AlvoEventoRaiz = { forma: "raiz"; campo: "xp" | "nivel"; antes: number };

export type AlvoEventoMapa = {
  forma: "mapa";
  mapa: "recursos" | "atributos" | "moedas" | "reputacao";
  chave: string;
  antes: RecursoLivre | number | null;
};

export type NomeLista =
  | "inventario"
  | "notas"
  | "missoes"
  | "npcs"
  | "descobertas"
  | "codex"
  | "locais"
  | "criaturas"
  | "diario"
  | "modificadoresTemporarios"
  | "condicoes"
  | "magias"
  | "pesquisas"
  | "conquistas"
  | "filaImagens"
  | "escola";

export type AlvoEventoLista =
  | { forma: "lista"; lista: "inventario"; identificador: string; antes: ItemLivre | null }
  | { forma: "lista"; lista: "notas"; identificador: string; antes: NotaLivre | null }
  | { forma: "lista"; lista: "missoes"; identificador: string; antes: MissaoLivre | null }
  | { forma: "lista"; lista: "npcs"; identificador: string; antes: NpcLivre | null }
  | { forma: "lista"; lista: "descobertas"; identificador: string; antes: DescobertaLivre | null }
  | { forma: "lista"; lista: "codex"; identificador: string; antes: CodexLivre | null }
  | { forma: "lista"; lista: "locais"; identificador: string; antes: LocalLivre | null }
  | { forma: "lista"; lista: "criaturas"; identificador: string; antes: CriaturaLivre | null }
  | { forma: "lista"; lista: "diario"; identificador: string; antes: EntradaDiario | null }
  | { forma: "lista"; lista: "modificadoresTemporarios"; identificador: string; antes: ModificadorTemporario | null }
  | { forma: "lista"; lista: "condicoes"; identificador: string; antes: CondicaoLivre | null }
  | { forma: "lista"; lista: "magias"; identificador: string; antes: MagiaLivre | null }
  | { forma: "lista"; lista: "pesquisas"; identificador: string; antes: PesquisaLivre | null }
  | { forma: "lista"; lista: "conquistas"; identificador: string; antes: ConquistaLivre | null }
  | { forma: "lista"; lista: "filaImagens"; identificador: string; antes: SolicitacaoImagem | null }
  | { forma: "lista"; lista: "escola"; identificador: string; antes: EntradaEscola | null };

export type AlvoEvento = AlvoEventoRaiz | AlvoEventoMapa | AlvoEventoLista;

export type EventoAplicado = {
  id: string;
  importId: string;
  /** Reaproveita o `tipo` da Mudanca que gerou o evento — só pra exibição, não pra lógica de desfazer. */
  tipo: string;
  resumo: string;
  criadoEm: number;
  revertido: boolean;
  alvo: AlvoEvento;
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
  modificadoresTemporarios: ModificadorTemporario[];
  condicoes: CondicaoLivre[];
  magias: MagiaLivre[];
  pesquisas: PesquisaLivre[];
  conquistas: ConquistaLivre[];
  /** Reputação com facções, cidades, casas, NPCs — qualquer alvo nomeado pela campanha. */
  reputacao: Record<string, number>;
  filaImagens: SolicitacaoImagem[];
  escola: EntradaEscola[];
  snapshots: SnapshotLivre[];
  historicoImportacoes: ImportacaoAplicada[];
  eventos: EventoAplicado[];
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
    modificadoresTemporarios: [],
    condicoes: [],
    magias: [],
    pesquisas: [],
    conquistas: [],
    reputacao: {},
    filaImagens: [],
    escola: [],
    snapshots: [],
    historicoImportacoes: [],
    eventos: [],
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
    modificadoresTemporarios: Array.isArray(d.modificadoresTemporarios) ? d.modificadoresTemporarios : [],
    condicoes: Array.isArray(d.condicoes) ? d.condicoes : [],
    magias: Array.isArray(d.magias) ? d.magias : [],
    pesquisas: Array.isArray(d.pesquisas) ? d.pesquisas : [],
    conquistas: Array.isArray(d.conquistas) ? d.conquistas : [],
    reputacao: d.reputacao && typeof d.reputacao === "object" ? d.reputacao : {},
    filaImagens: Array.isArray(d.filaImagens) ? d.filaImagens : [],
    escola: Array.isArray(d.escola) ? d.escola : [],
    snapshots: Array.isArray(d.snapshots) ? d.snapshots : [],
    // Fichas de antes desta fatia guardam importações sem `id` (regra #12/#41
    // do protocolo vieram só nesta fatia) — completa com um id sintético pra
    // não quebrar a tela de histórico.
    historicoImportacoes: Array.isArray(d.historicoImportacoes)
      ? d.historicoImportacoes.map((h, i) => ({ ...h, id: h.id ?? `import-legado-${i}` }))
      : [],
    eventos: Array.isArray(d.eventos) ? d.eventos : [],
  };
}
