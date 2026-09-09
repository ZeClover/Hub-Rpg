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

/** Regra #15/#120 do pedido: mapa por descoberta, nunca revela tudo de graça. */
export type EstadoDescobertaLocal = "ouviu_falar" | "conhecido" | "visitado";

export type LocalLivre = {
  id: string;
  nome: string;
  descricao?: string;
  estadoDescoberta: EstadoDescobertaLocal;
  /** Nomes livres de outros locais conhecidos que ligam com este — sem coordenadas nem mapa gráfico (regra: começar simples). */
  conexoesConhecidas: string[];
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

export type StatusCompromisso = "pendente" | "cumprido" | "cancelado" | "atrasado";
export type OrigemCompromisso = "prometeu" | "combinou" | "convite" | "lembrete";

/** "Coisas para lembrar" (promessas/combinados) — regra: nunca vira "concluído" sozinho só porque o tempo passou, só o Mestre confirma via compromisso_update. */
export type CompromissoLivre = {
  id: string;
  descricao: string;
  npc?: string;
  origem?: OrigemCompromisso;
  /** Livre — "dia 5", uma data real, o que a campanha usar; sem calendário nesta fatia, então o código não interpreta isso ainda. */
  data?: string;
  status: StatusCompromisso;
  criadoEm: number;
};

export type CategoriaMural = "anuncio" | "evento" | "resultado" | "comunicado" | "outro";

/** Informação pública da campanha (regra: só o que Zé pode legitimamente saber — nunca plot de mestre). */
export type EntradaMural = {
  id: string;
  titulo: string;
  categoria?: CategoriaMural;
  resumo?: string;
  origem?: string;
  data?: string;
  expiracao?: string;
  criadaEm: number;
};

export type DiaSemana = "domingo" | "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado";

/** Um horário fixo da grade semanal (ex: "toda segunda, 08:00-09:45, Mana"). Raramente muda — pensado pra ser configurado uma vez. */
export type BlocoGrade = {
  id: string;
  diaSemana: DiaSemana;
  inicio: string;
  fim: string;
  rotulo: string;
  local?: string;
  criadoEm: number;
};

export type TipoExcecaoCalendario = "cancelado" | "alterado" | "adicionado";

/**
 * Exceção pontual num dia específico (regra #85 do pedido: BASE + exceções, nunca reescrever
 * a grade inteira pra representar uma exceção de um dia só). "cancelado"/"alterado" casam com
 * um bloco da grade base pelo `rotuloAlvo`; "adicionado" cria um bloco extra que não está na grade.
 */
export type ExcecaoCalendario = {
  id: string;
  dia: number;
  tipo: TipoExcecaoCalendario;
  rotuloAlvo?: string;
  novoInicio?: string;
  novoFim?: string;
  novoRotulo?: string;
  motivo?: string;
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
export type AlvoEventoRaiz =
  | { forma: "raiz"; campo: "xp" | "nivel" | "diaAtual"; antes: number }
  | { forma: "raiz"; campo: "horaAtual" | "diaSemanaDoDia1"; antes: string }
  | { forma: "raiz"; campo: "localAtual" | "atividadeAtual"; antes: string | null };

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
  | "escola"
  | "compromissos"
  | "mural"
  | "gradeHoraria"
  | "excecoesCalendario";

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
  | { forma: "lista"; lista: "escola"; identificador: string; antes: EntradaEscola | null }
  | { forma: "lista"; lista: "compromissos"; identificador: string; antes: CompromissoLivre | null }
  | { forma: "lista"; lista: "mural"; identificador: string; antes: EntradaMural | null }
  | { forma: "lista"; lista: "gradeHoraria"; identificador: string; antes: BlocoGrade | null }
  | { forma: "lista"; lista: "excecoesCalendario"; identificador: string; antes: ExcecaoCalendario | null };

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
  compromissos: CompromissoLivre[];
  mural: EntradaMural[];
  /** Que dia da semana é o "dia 1" da campanha — todo o resto (dia atual, grade) deriva daqui por módulo 7. */
  diaSemanaDoDia1: DiaSemana;
  diaAtual: number;
  horaAtual: string;
  /** Onde Zé está agora — nome livre, sem coordenadas (mesma filosofia de `locais`). Null = não registrado ainda. */
  localAtual: string | null;
  /** O que Zé está fazendo AGORA quando não há bloco da grade cobrindo o horário — regra #88: nem tudo é calculável pela agenda. */
  atividadeAtual: string | null;
  gradeHoraria: BlocoGrade[];
  excecoesCalendario: ExcecaoCalendario[];
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
    compromissos: [],
    mural: [],
    diaSemanaDoDia1: "segunda",
    diaAtual: 1,
    horaAtual: "08:00",
    localAtual: null,
    atividadeAtual: null,
    gradeHoraria: [],
    excecoesCalendario: [],
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
    // Fichas de antes desta fatia guardavam `descoberto: boolean` em vez do
    // estado de 3 valores — migra sem perder a informação (true -> visitado,
    // false -> ouviu falar) e completa `conexoesConhecidas` ausente.
    locais: Array.isArray(d.locais)
      ? d.locais.map((l) => {
          const bruto = l as unknown as { estadoDescoberta?: EstadoDescobertaLocal; descoberto?: boolean; conexoesConhecidas?: string[] };
          return {
            ...l,
            estadoDescoberta: bruto.estadoDescoberta ?? (bruto.descoberto === false ? "ouviu_falar" : "visitado"),
            conexoesConhecidas: Array.isArray(bruto.conexoesConhecidas) ? bruto.conexoesConhecidas : [],
          };
        })
      : [],
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
    compromissos: Array.isArray(d.compromissos) ? d.compromissos : [],
    mural: Array.isArray(d.mural) ? d.mural : [],
    diaSemanaDoDia1: d.diaSemanaDoDia1 ?? "segunda",
    diaAtual: typeof d.diaAtual === "number" ? d.diaAtual : 1,
    horaAtual: typeof d.horaAtual === "string" ? d.horaAtual : "08:00",
    localAtual: typeof d.localAtual === "string" ? d.localAtual : null,
    atividadeAtual: typeof d.atividadeAtual === "string" ? d.atividadeAtual : null,
    gradeHoraria: Array.isArray(d.gradeHoraria) ? d.gradeHoraria : [],
    excecoesCalendario: Array.isArray(d.excecoesCalendario) ? d.excecoesCalendario : [],
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
