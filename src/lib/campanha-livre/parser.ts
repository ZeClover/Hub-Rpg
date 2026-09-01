/*
  Parser do protocolo HUB_UPDATE (ver pacote de especificação entregue pelo
  Zé — 02_HUB_UPDATE_SPEC_v1.md é a fonte de verdade).

  Fecha o v1.0 do protocolo: temporary_modifiers, conditions, spells_add,
  spells_update, spell_discoveries, research_add, research_update,
  achievements_add, reputation, image_requests, school — além das 24
  operações anteriores (xp, resources, items_add, items_remove,
  notes_add, level, attributes, items_update, equipment, currency,
  missions_add, missions_update, npcs_add, npcs_update, relationships,
  notes_update, notes_remove, discoveries_add, discoveries_update,
  codex_add, locations_add, locations_update, bestiary_add, journal).
  Snapshots (regra #45) não são uma operação de HUB_UPDATE — são um botão
  manual na ficha (ver `criarSnapshot`/`restaurarSnapshot` em
  aplicar.ts), por isso não aparecem aqui.

  Regra central do protocolo: o parser só entende o texto colado. Nada é
  salvo aqui — isto devolve uma lista de mudanças propostas, pra tela de
  revisão decidir o que aplicar (regras #1 e #2 da especificação).

  Regra central do protocolo: o parser só entende o texto colado. Nada é
  salvo aqui — isto devolve uma lista de mudanças propostas, pra tela de
  revisão decidir o que aplicar (regras #1 e #2 da especificação).
*/
import { parse as parseYaml } from "yaml";

import type { ObjetivoMissao, StatusDescoberta, StatusDescobertaMagia, StatusMissao, TipoDuracao } from "./tipos.ts";

export type NivelAlerta = "info" | "warning" | "error";
export type Alerta = { nivel: NivelAlerta; mensagem: string };

type Base = { id: string; alertas: Alerta[] };

export type MudancaXp = Base & {
  tipo: "xp";
  operacao: "add" | "remove" | "set";
  valor: number;
  motivo?: string;
};

export type MudancaRecurso = Base & {
  tipo: "recurso";
  nome: string;
  operacao: "change" | "set";
  valor: number;
  motivo?: string;
};

export type MudancaItemAdd = Base & {
  tipo: "item_add";
  nome: string;
  quantidade: number;
  categoria?: string;
  descricao?: string;
  raridade?: string;
  origem?: string;
  tags?: string[];
  /** `generate_image: true` (spec §32/§13) — só marca a fila, a geração em si nunca acontece durante a importação. */
  imagemSolicitada?: boolean;
  promptImagem?: string;
};

export type MudancaItemRemove = Base & {
  tipo: "item_remove";
  nome: string;
  quantidade: number;
  motivo?: string;
};

export type MudancaNotaAdd = Base & {
  tipo: "nota_add";
  titulo: string;
  categoria?: string;
  texto: string;
  tags?: string[];
  flags?: Record<string, boolean>;
};

export type MudancaNivel = Base & {
  tipo: "nivel";
  operacao: "change" | "set";
  valor: number;
  motivo?: string;
};

export type MudancaAtributo = Base & {
  tipo: "atributo";
  nome: string;
  operacao: "change" | "set";
  valor: number;
  motivo?: string;
};

export type CamposItemUpdate = {
  descricao?: string;
  categoria?: string;
  raridade?: string;
  origem?: string;
  notas?: string;
  quantidade?: number;
  equipado?: boolean;
};

export type MudancaItemUpdate = Base & {
  tipo: "item_update";
  nome: string;
  campos: CamposItemUpdate;
};

export type MudancaEquipamento = Base & {
  tipo: "equipamento";
  acao: "equipar" | "desequipar";
  nome: string;
  slot?: string;
};

export type MudancaMoeda = Base & {
  tipo: "moeda";
  nome: string;
  operacao: "change" | "set";
  valor: number;
  motivo?: string;
};

export type AcaoMissaoUpdate =
  | "add_objective"
  | "complete_objective"
  | "fail_objective"
  | "reopen_objective"
  | "set_status"
  | "append_note"
  | "add_reward"
  | "reveal_reward";

export type MudancaMissaoAdd = Base & {
  tipo: "missao_add";
  nome: string;
  descricao?: string;
  status: StatusMissao;
  objetivos: ObjetivoMissao[];
};

export type MudancaMissaoUpdate = Base & {
  tipo: "missao_update";
  nome: string;
  acao: AcaoMissaoUpdate;
  objetivo?: string;
  status?: StatusMissao;
  nota?: string;
  recompensa?: string;
};

export type MudancaNpcAdd = Base & {
  tipo: "npc_add";
  nome: string;
  descricao?: string;
  primeiroEncontro?: string;
  tags?: string[];
};

export type MudancaNpcUpdate = Base & {
  tipo: "npc_update";
  nome: string;
  conhecimentoNovo: string[];
};

export type MudancaRelacao = Base & {
  tipo: "relacao";
  npc: string;
  stat: string;
  valor: number;
  motivo?: string;
};

export type MudancaNotaUpdate = Base & {
  tipo: "nota_update";
  titulo: string;
  acrescimo: string;
};

export type MudancaNotaRemove = Base & {
  tipo: "nota_remove";
  titulo?: string;
  idNota?: string;
  motivo?: string;
};

export type MudancaDescobertaAdd = Base & {
  tipo: "descoberta_add";
  titulo: string;
  categoria?: string;
  status: StatusDescoberta;
  descricao?: string;
  evidencias: string[];
};

export type MudancaDescobertaUpdate = Base & {
  tipo: "descoberta_update";
  titulo: string;
  status?: StatusDescoberta;
  evidenciasNovas: string[];
};

export type MudancaCodexAdd = Base & {
  tipo: "codex_add";
  titulo: string;
  categoria?: string;
  texto: string;
};

export type MudancaLocalAdd = Base & {
  tipo: "local_add";
  nome: string;
  descricao?: string;
  descoberto: boolean;
};

export type MudancaLocalUpdate = Base & {
  tipo: "local_update";
  nome: string;
  conhecimentoNovo: string[];
};

export type MudancaCriaturaAdd = Base & {
  tipo: "criatura_add";
  nome: string;
  categoria?: string;
  descricao?: string;
  tracosConhecidos: string[];
};

export type MudancaDiarioAdd = Base & {
  tipo: "diario_add";
  titulo: string;
  resumo?: string;
  eventos: string[];
};

export type DuracaoBruta = { tipo: TipoDuracao; valor?: number; descricao?: string };

export type MudancaModificadorAdd = Base & {
  tipo: "modificador_add";
  nome: string;
  alvo: string;
  valor: number;
  duracao: DuracaoBruta;
};

export type MudancaModificadorRemove = Base & {
  tipo: "modificador_remove";
  nome: string;
};

export type MudancaCondicaoAdd = Base & {
  tipo: "condicao_add";
  nome: string;
  descricao?: string;
  duracao?: DuracaoBruta;
};

export type MudancaCondicaoRemove = Base & {
  tipo: "condicao_remove";
  nome: string;
};

export type MudancaCondicaoUpdate = Base & {
  tipo: "condicao_update";
  nome: string;
  descricao?: string;
  duracao?: DuracaoBruta;
};

export type MudancaMagiaAdd = Base & {
  tipo: "magia_add";
  nome: string;
  descricao?: string;
  afinidade?: string;
  custo?: Record<string, number>;
  statusConhecimento?: string;
  progressoConhecimento?: number;
  tags?: string[];
};

export type MudancaMagiaUpdate = Base & {
  tipo: "magia_update";
  nome: string;
  descobertasSimplesNovas: string[];
  progressoConhecimentoDelta?: number;
};

export type MudancaMagiaDescoberta = Base & {
  tipo: "magia_descoberta";
  magia: string;
  titulo: string;
  descricao?: string;
  status: StatusDescobertaMagia;
};

export type MudancaPesquisaAdd = Base & {
  tipo: "pesquisa_add";
  titulo: string;
  status: string;
  progresso: number;
  objetivos: string[];
};

export type MudancaPesquisaUpdate = Base & {
  tipo: "pesquisa_update";
  titulo: string;
  status?: string;
  progressoDelta?: number;
  evidenciasNovas: string[];
  objetivosNovos: string[];
  notasNovas: string[];
};

export type MudancaConquistaAdd = Base & {
  tipo: "conquista_add";
  nome: string;
  descricao?: string;
};

export type MudancaReputacao = Base & {
  tipo: "reputacao";
  alvo: string;
  operacao: "change" | "set";
  valor: number;
  motivo?: string;
};

export type MudancaImagemPedido = Base & {
  tipo: "imagem_pedido";
  tipoEntidade: string;
  nomeEntidade: string;
  promptSugerido?: string;
  prioridade?: string;
};

export type MudancaEscolaAdd = Base & {
  tipo: "escola_add";
  materia: string;
  topico?: string;
  notas: string[];
};

export type Mudanca =
  | MudancaXp
  | MudancaRecurso
  | MudancaItemAdd
  | MudancaItemRemove
  | MudancaNotaAdd
  | MudancaNivel
  | MudancaAtributo
  | MudancaItemUpdate
  | MudancaEquipamento
  | MudancaMoeda
  | MudancaMissaoAdd
  | MudancaMissaoUpdate
  | MudancaNpcAdd
  | MudancaNpcUpdate
  | MudancaRelacao
  | MudancaNotaUpdate
  | MudancaNotaRemove
  | MudancaDescobertaAdd
  | MudancaDescobertaUpdate
  | MudancaCodexAdd
  | MudancaLocalAdd
  | MudancaLocalUpdate
  | MudancaCriaturaAdd
  | MudancaDiarioAdd
  | MudancaModificadorAdd
  | MudancaModificadorRemove
  | MudancaCondicaoAdd
  | MudancaCondicaoRemove
  | MudancaCondicaoUpdate
  | MudancaMagiaAdd
  | MudancaMagiaUpdate
  | MudancaMagiaDescoberta
  | MudancaPesquisaAdd
  | MudancaPesquisaUpdate
  | MudancaConquistaAdd
  | MudancaReputacao
  | MudancaImagemPedido
  | MudancaEscolaAdd;

export type CabecalhoHubUpdate = {
  version: number;
  updateId: string | null;
  campanha: string | null;
  personagem: string | null;
};

export type ResultadoParse =
  | { ok: false; erro: string }
  | {
      ok: true;
      cabecalho: CabecalhoHubUpdate;
      mudancas: Mudanca[];
      camposDesconhecidos: string[];
      hash: string;
    };

/** Acha o bloco `[HUB_UPDATE]...[/HUB_UPDATE]` dentro de um texto maior (regra #3). */
export function extrairBlocoHubUpdate(textoColado: string): string | null {
  const casamento = textoColado.match(/\[HUB_UPDATE\]([\s\S]*?)\[\/HUB_UPDATE\]/);
  return casamento ? casamento[1] : null;
}

/*
  Hash simples (cyrb53) do bloco normalizado — não é criptográfico, só
  precisa detectar "colei a mesma coisa de novo" (regras #7 e #43). Espaços
  nas pontas não contam como uma importação diferente.
*/
export function calcularHash(blocoBruto: string): string {
  const texto = blocoBruto.trim().replace(/\s+/g, " ");
  let h1 = 0xdeadbeef ^ texto.length;
  let h2 = 0x41c6ce57 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    const codigo = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ codigo, 2654435761);
    h2 = Math.imul(h2 ^ codigo, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

const CAMPOS_CONHECIDOS = new Set([
  "version",
  "update_id",
  "campaign",
  "character",
  "session",
  "xp",
  "resources",
  "items_add",
  "items_remove",
  "notes_add",
  "level",
  "attributes",
  "items_update",
  "equipment",
  "currency",
  "missions_add",
  "missions_update",
  "npcs_add",
  "npcs_update",
  "relationships",
  "notes_update",
  "notes_remove",
  "discoveries_add",
  "discoveries_update",
  "codex_add",
  "locations_add",
  "locations_update",
  "bestiary_add",
  "journal",
  "temporary_modifiers",
  "conditions",
  "spells_add",
  "spells_update",
  "spell_discoveries",
  "research_add",
  "research_update",
  "achievements_add",
  "reputation",
  "image_requests",
  "school",
]);

const TIPOS_DURACAO = new Set<TipoDuracao>(["rounds", "turns", "scenes", "sessions", "until_rest", "until_removed", "custom"]);

const STATUS_DESCOBERTA_MAGIA_MAP: Record<string, StatusDescobertaMagia> = {
  theory: "teoria",
  testing: "testando",
  partial: "parcial",
  confirmed: "confirmada",
};

const STATUS_DESCOBERTA_MAP: Record<string, StatusDescoberta> = {
  unknown: "desconhecido",
  suspicion: "suspeita",
  theory: "teoria",
  testing: "testando",
  partial: "parcial",
  confirmed: "confirmada",
  disproved: "refutada",
};

const STATUS_MISSAO_MAP: Record<string, StatusMissao> = {
  available: "disponivel",
  active: "ativa",
  completed: "concluida",
  failed: "falhou",
  abandoned: "abandonada",
  hidden: "oculta",
};

const STATUS_OBJETIVO_MAP: Record<string, ObjetivoMissao["status"]> = {
  pending: "pendente",
  completed: "concluido",
  failed: "falhou",
};

const ACOES_MISSAO_UPDATE = new Set<AcaoMissaoUpdate>([
  "add_objective",
  "complete_objective",
  "fail_objective",
  "reopen_objective",
  "set_status",
  "append_note",
  "add_reward",
  "reveal_reward",
]);

let contadorId = 0;
function proximoId(): string {
  contadorId += 1;
  return `mud-${Date.now().toString(36)}-${contadorId}`;
}

export function interpretarHubUpdate(textoColado: string): ResultadoParse {
  const bloco = extrairBlocoHubUpdate(textoColado);
  if (!bloco) {
    return { ok: false, erro: "Nenhuma atualização do Hub foi encontrada neste texto." };
  }

  let doc: unknown;
  try {
    doc = parseYaml(bloco);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    return { ok: false, erro: `O bloco não é um YAML válido: ${mensagem}` };
  }

  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
    return { ok: false, erro: "O bloco HUB_UPDATE está vazio ou não é uma lista de campos." };
  }
  const raiz = doc as Record<string, unknown>;

  if (raiz.version === undefined) {
    return { ok: false, erro: "Campo 'version' é obrigatório." };
  }
  if (typeof raiz.version !== "number") {
    return { ok: false, erro: `'version' precisa ser numérico (veio "${String(raiz.version)}").` };
  }
  if (raiz.version !== 1) {
    return {
      ok: false,
      erro: `Versão ${raiz.version} do protocolo não é suportada por este Hub (só a versão 1). Nada foi lido.`,
    };
  }

  const mudancas: Mudanca[] = [];

  // --- xp (spec §7) ---
  if (raiz.xp !== undefined) {
    mudancas.push(interpretarXp(raiz.xp));
  }

  // --- resources (spec §9) ---
  if (raiz.resources !== undefined && typeof raiz.resources === "object" && raiz.resources !== null) {
    for (const [nome, def] of Object.entries(raiz.resources as Record<string, unknown>)) {
      mudancas.push(interpretarRecurso(nome, def));
    }
  }

  // --- items_add (spec §13) ---
  if (Array.isArray(raiz.items_add)) {
    for (const item of raiz.items_add) mudancas.push(interpretarItemAdd(item));
  }

  // --- items_remove (spec §14) ---
  if (Array.isArray(raiz.items_remove)) {
    for (const item of raiz.items_remove) mudancas.push(interpretarItemRemove(item));
  }

  // --- notes_add (spec §18) ---
  if (Array.isArray(raiz.notes_add)) {
    for (const nota of raiz.notes_add) mudancas.push(interpretarNotaAdd(nota));
  }

  // --- level (spec §8) ---
  if (raiz.level !== undefined) {
    mudancas.push(interpretarLevel(raiz.level));
  }

  // --- attributes (spec §10) ---
  if (Array.isArray(raiz.attributes)) {
    for (const atributo of raiz.attributes) mudancas.push(interpretarAtributo(atributo));
  }

  // --- items_update (spec §15) ---
  if (Array.isArray(raiz.items_update)) {
    for (const item of raiz.items_update) mudancas.push(interpretarItemUpdate(item));
  }

  // --- equipment (spec §16) ---
  if (typeof raiz.equipment === "object" && raiz.equipment !== null) {
    const equipamento = raiz.equipment as Record<string, unknown>;
    if (Array.isArray(equipamento.equip)) {
      for (const item of equipamento.equip) mudancas.push(interpretarEquipamento("equipar", item));
    }
    if (Array.isArray(equipamento.unequip)) {
      for (const item of equipamento.unequip) mudancas.push(interpretarEquipamento("desequipar", item));
    }
  }

  // --- currency (spec §17) ---
  if (typeof raiz.currency === "object" && raiz.currency !== null) {
    for (const [nome, def] of Object.entries(raiz.currency as Record<string, unknown>)) {
      mudancas.push(interpretarMoeda(nome, def));
    }
  }

  // --- missions_add (spec §20) ---
  if (Array.isArray(raiz.missions_add)) {
    for (const missao of raiz.missions_add) mudancas.push(interpretarMissaoAdd(missao));
  }

  // --- missions_update (spec §20) ---
  if (Array.isArray(raiz.missions_update)) {
    for (const missao of raiz.missions_update) mudancas.push(interpretarMissaoUpdate(missao));
  }

  // --- npcs_add (spec §21) ---
  if (Array.isArray(raiz.npcs_add)) {
    for (const npc of raiz.npcs_add) mudancas.push(interpretarNpcAdd(npc));
  }

  // --- npcs_update (spec §21) ---
  if (Array.isArray(raiz.npcs_update)) {
    for (const npc of raiz.npcs_update) mudancas.push(interpretarNpcUpdate(npc));
  }

  // --- relationships (spec §22) ---
  if (Array.isArray(raiz.relationships)) {
    for (const relacao of raiz.relationships) mudancas.push(interpretarRelacao(relacao));
  }

  // --- notes_update (spec §18) ---
  if (Array.isArray(raiz.notes_update)) {
    for (const nota of raiz.notes_update) mudancas.push(interpretarNotaUpdate(nota));
  }

  // --- notes_remove (spec §18) ---
  if (Array.isArray(raiz.notes_remove)) {
    for (const nota of raiz.notes_remove) mudancas.push(interpretarNotaRemove(nota));
  }

  // --- discoveries_add (spec §23) ---
  if (Array.isArray(raiz.discoveries_add)) {
    for (const descoberta of raiz.discoveries_add) mudancas.push(interpretarDescobertaAdd(descoberta));
  }

  // --- discoveries_update (spec §23) ---
  if (Array.isArray(raiz.discoveries_update)) {
    for (const descoberta of raiz.discoveries_update) mudancas.push(interpretarDescobertaUpdate(descoberta));
  }

  // --- codex_add (spec §26) ---
  if (Array.isArray(raiz.codex_add)) {
    for (const entrada of raiz.codex_add) mudancas.push(interpretarCodexAdd(entrada));
  }

  // --- locations_add (spec §24) ---
  if (Array.isArray(raiz.locations_add)) {
    for (const local of raiz.locations_add) mudancas.push(interpretarLocalAdd(local));
  }

  // --- locations_update (spec §24) ---
  if (Array.isArray(raiz.locations_update)) {
    for (const local of raiz.locations_update) mudancas.push(interpretarLocalUpdate(local));
  }

  // --- bestiary_add (spec §25) ---
  if (Array.isArray(raiz.bestiary_add)) {
    for (const criatura of raiz.bestiary_add) mudancas.push(interpretarCriaturaAdd(criatura));
  }

  // --- journal (spec §27) ---
  if (typeof raiz.journal === "object" && raiz.journal !== null) {
    const journal = raiz.journal as Record<string, unknown>;
    if (journal.add !== undefined) mudancas.push(interpretarDiarioAdd(journal.add));
  }

  // --- temporary_modifiers (spec §11) ---
  if (typeof raiz.temporary_modifiers === "object" && raiz.temporary_modifiers !== null) {
    const mods = raiz.temporary_modifiers as Record<string, unknown>;
    if (Array.isArray(mods.add)) {
      for (const m of mods.add) mudancas.push(interpretarModificadorAdd(m));
    }
    if (Array.isArray(mods.remove)) {
      for (const m of mods.remove) mudancas.push(interpretarModificadorRemove(m));
    }
  }

  // --- conditions (spec §12) ---
  if (typeof raiz.conditions === "object" && raiz.conditions !== null) {
    const conds = raiz.conditions as Record<string, unknown>;
    if (Array.isArray(conds.add)) {
      for (const c of conds.add) mudancas.push(interpretarCondicaoAdd(c));
    }
    if (Array.isArray(conds.remove)) {
      for (const c of conds.remove) mudancas.push(interpretarCondicaoRemove(c));
    }
    if (Array.isArray(conds.update)) {
      for (const c of conds.update) mudancas.push(interpretarCondicaoUpdate(c));
    }
  }

  // --- spells_add (spec §19) ---
  if (Array.isArray(raiz.spells_add)) {
    for (const magia of raiz.spells_add) mudancas.push(interpretarMagiaAdd(magia));
  }

  // --- spells_update (spec §19) ---
  if (Array.isArray(raiz.spells_update)) {
    for (const magia of raiz.spells_update) mudancas.push(interpretarMagiaUpdate(magia));
  }

  // --- spell_discoveries (spec §19) ---
  if (Array.isArray(raiz.spell_discoveries)) {
    for (const descoberta of raiz.spell_discoveries) mudancas.push(interpretarMagiaDescoberta(descoberta));
  }

  // --- research_add (spec §30) ---
  if (Array.isArray(raiz.research_add)) {
    for (const pesquisa of raiz.research_add) mudancas.push(interpretarPesquisaAdd(pesquisa));
  }

  // --- research_update (spec §30) ---
  if (Array.isArray(raiz.research_update)) {
    for (const pesquisa of raiz.research_update) mudancas.push(interpretarPesquisaUpdate(pesquisa));
  }

  // --- achievements_add (spec §29) ---
  if (Array.isArray(raiz.achievements_add)) {
    for (const conquista of raiz.achievements_add) mudancas.push(interpretarConquistaAdd(conquista));
  }

  // --- reputation (spec §28) ---
  if (Array.isArray(raiz.reputation)) {
    for (const rep of raiz.reputation) mudancas.push(interpretarReputacao(rep));
  }

  // --- image_requests (spec §32) ---
  if (Array.isArray(raiz.image_requests)) {
    for (const pedido of raiz.image_requests) mudancas.push(interpretarImagemPedido(pedido));
  }

  // --- school (opcional na spec, implementado a pedido do Zé — só lessons_add tem formato definido) ---
  if (typeof raiz.school === "object" && raiz.school !== null) {
    const school = raiz.school as Record<string, unknown>;
    if (Array.isArray(school.lessons_add)) {
      for (const aula of school.lessons_add) mudancas.push(interpretarEscolaAdd(aula));
    }
  }

  const camposDesconhecidos = Object.keys(raiz).filter((chave) => !CAMPOS_CONHECIDOS.has(chave));

  if (mudancas.length === 0) {
    return {
      ok: false,
      erro:
        camposDesconhecidos.length > 0
          ? `Nenhuma operação reconhecida nesta fatia do Hub (só campo(s) desconhecido(s): ${camposDesconhecidos.join(", ")}).`
          : "O bloco não contém nenhuma operação reconhecida.",
    };
  }

  return {
    ok: true,
    cabecalho: {
      version: raiz.version,
      updateId: typeof raiz.update_id === "string" ? raiz.update_id : null,
      campanha: typeof raiz.campaign === "string" ? raiz.campaign : null,
      personagem: typeof raiz.character === "string" ? raiz.character : null,
    },
    mudancas,
    camposDesconhecidos,
    hash: calcularHash(bloco),
  };
}

function paraNumero(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  if (typeof valor === "string" && valor.trim() !== "" && Number.isFinite(Number(valor))) return Number(valor);
  return null;
}

function interpretarXp(bruto: unknown): MudancaXp {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const operacoesPresentes = (["add", "remove", "set"] as const).filter((op) => objeto[op] !== undefined);

  if (operacoesPresentes.length === 0) {
    alertas.push({ nivel: "error", mensagem: "xp precisa de 'add', 'remove' ou 'set'." });
  } else if (operacoesPresentes.length > 1) {
    alertas.push({
      nivel: "error",
      mensagem: `xp usa duas operações ao mesmo tempo (${operacoesPresentes.join(", ")}) — escolha só uma.`,
    });
  }
  const operacao = operacoesPresentes[0] ?? "add";
  const valorBruto = objeto[operacao];
  const valor = paraNumero(valorBruto);
  if (operacoesPresentes.length === 1 && valor === null) {
    alertas.push({ nivel: "error", mensagem: `xp.${operacao} precisa ser numérico (veio "${String(valorBruto)}").` });
  }
  if (operacao === "set") {
    alertas.push({ nivel: "warning", mensagem: "Uso de 'set' substitui o XP direto — prefira 'add'/'remove'." });
  }

  return {
    id: proximoId(),
    tipo: "xp",
    operacao,
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarRecurso(nome: string, bruto: unknown): MudancaRecurso {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const temChange = objeto.change !== undefined;
  const temSet = objeto.set !== undefined;

  if (!temChange && !temSet) {
    alertas.push({ nivel: "error", mensagem: `resources.${nome} precisa de 'change' ou 'set'.` });
  } else if (temChange && temSet) {
    alertas.push({ nivel: "error", mensagem: `resources.${nome} usa 'change' e 'set' ao mesmo tempo — escolha só um.` });
  }
  const operacao: "change" | "set" = temSet ? "set" : "change";
  const valorBruto = objeto[operacao];
  const valor = paraNumero(valorBruto);
  if ((temChange || temSet) && valor === null) {
    alertas.push({ nivel: "error", mensagem: `resources.${nome}.${operacao} precisa ser numérico.` });
  }
  if (temSet) {
    alertas.push({ nivel: "warning", mensagem: `Uso de 'set' substitui ${nome} direto — prefira 'change'.` });
  }

  return {
    id: proximoId(),
    tipo: "recurso",
    nome,
    operacao,
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarItemAdd(bruto: unknown): MudancaItemAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : typeof objeto.id === "string" ? objeto.id : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em items_add sem 'name' nem 'id'." });

  const quantidadeBruta = objeto.quantity ?? 1;
  const quantidade = paraNumero(quantidadeBruta);
  if (quantidade === null || quantidade <= 0) {
    alertas.push({ nivel: "error", mensagem: `Quantidade inválida para "${nome ?? "?"}" (veio "${String(quantidadeBruta)}").` });
  }

  return {
    id: proximoId(),
    tipo: "item_add",
    nome: nome ?? "(sem nome)",
    quantidade: quantidade && quantidade > 0 ? quantidade : 1,
    categoria: typeof objeto.category === "string" ? objeto.category : undefined,
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    raridade: typeof objeto.rarity === "string" ? objeto.rarity : undefined,
    origem: typeof objeto.origin === "string" ? objeto.origin : undefined,
    tags: Array.isArray(objeto.tags) ? objeto.tags.filter((t): t is string => typeof t === "string") : undefined,
    imagemSolicitada: objeto.generate_image === true,
    promptImagem: typeof objeto.image_prompt === "string" ? objeto.image_prompt : undefined,
    alertas,
  };
}

function interpretarItemRemove(bruto: unknown): MudancaItemRemove {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : typeof objeto.id === "string" ? objeto.id : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em items_remove sem 'name' nem 'id'." });

  const quantidadeBruta = objeto.quantity ?? 1;
  const quantidade = paraNumero(quantidadeBruta);
  if (quantidade === null || quantidade <= 0) {
    alertas.push({ nivel: "error", mensagem: `Quantidade inválida para "${nome ?? "?"}" (veio "${String(quantidadeBruta)}").` });
  }

  return {
    id: proximoId(),
    tipo: "item_remove",
    nome: nome ?? "(sem nome)",
    quantidade: quantidade && quantidade > 0 ? quantidade : 1,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarNotaAdd(bruto: unknown): MudancaNotaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Colinha em notes_add sem 'title'." });
  const texto = typeof objeto.text === "string" ? objeto.text : null;
  if (!texto) alertas.push({ nivel: "error", mensagem: `Colinha "${titulo ?? "?"}" sem 'text'.` });

  const flagsBruto = objeto.flags;
  let flags: Record<string, boolean> | undefined;
  if (typeof flagsBruto === "object" && flagsBruto !== null) {
    flags = Object.fromEntries(
      Object.entries(flagsBruto as Record<string, unknown>).filter(([, v]) => typeof v === "boolean"),
    ) as Record<string, boolean>;
  }

  return {
    id: proximoId(),
    tipo: "nota_add",
    titulo: titulo ?? "(sem título)",
    categoria: typeof objeto.category === "string" ? objeto.category : undefined,
    texto: texto ?? "",
    tags: Array.isArray(objeto.tags) ? objeto.tags.filter((t): t is string => typeof t === "string") : undefined,
    flags,
    alertas,
  };
}

function interpretarLevel(bruto: unknown): MudancaNivel {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const temChange = objeto.change !== undefined;
  const temSet = objeto.set !== undefined;

  if (!temChange && !temSet) {
    alertas.push({ nivel: "error", mensagem: "level precisa de 'change' ou 'set'." });
  } else if (temChange && temSet) {
    alertas.push({ nivel: "error", mensagem: "level usa 'change' e 'set' ao mesmo tempo — escolha só um." });
  }
  const operacao: "change" | "set" = temSet ? "set" : "change";
  const valorBruto = objeto[operacao];
  const valor = paraNumero(valorBruto);
  if ((temChange || temSet) && valor === null) {
    alertas.push({ nivel: "error", mensagem: `level.${operacao} precisa ser numérico.` });
  }

  return {
    id: proximoId(),
    tipo: "nivel",
    operacao,
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarAtributo(bruto: unknown): MudancaAtributo {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.attribute === "string" ? objeto.attribute : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em attributes sem 'attribute'." });

  const temChange = objeto.change !== undefined;
  const temSet = objeto.set !== undefined;
  if (!temChange && !temSet) {
    alertas.push({ nivel: "error", mensagem: `attributes.${nome ?? "?"} precisa de 'change' ou 'set'.` });
  } else if (temChange && temSet) {
    alertas.push({ nivel: "error", mensagem: `attributes.${nome ?? "?"} usa 'change' e 'set' ao mesmo tempo — escolha só um.` });
  }
  const operacao: "change" | "set" = temSet ? "set" : "change";
  const valorBruto = objeto[operacao];
  const valor = paraNumero(valorBruto);
  if ((temChange || temSet) && valor === null) {
    alertas.push({ nivel: "error", mensagem: `attributes.${nome ?? "?"}.${operacao} precisa ser numérico.` });
  }

  return {
    id: proximoId(),
    tipo: "atributo",
    nome: nome ?? "(sem nome)",
    operacao,
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarItemUpdate(bruto: unknown): MudancaItemUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : typeof objeto.id === "string" ? objeto.id : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em items_update sem 'name' nem 'id'." });

  const mudancasBruto = typeof objeto.changes === "object" && objeto.changes !== null ? (objeto.changes as Record<string, unknown>) : {};
  const campos: CamposItemUpdate = {};
  if (typeof mudancasBruto.description === "string") campos.descricao = mudancasBruto.description;
  if (typeof mudancasBruto.category === "string") campos.categoria = mudancasBruto.category;
  if (typeof mudancasBruto.rarity === "string") campos.raridade = mudancasBruto.rarity;
  if (typeof mudancasBruto.origin === "string") campos.origem = mudancasBruto.origin;
  if (typeof mudancasBruto.notes === "string") campos.notas = mudancasBruto.notes;
  if (typeof mudancasBruto.equipped === "boolean") campos.equipado = mudancasBruto.equipped;
  const quantidade = paraNumero(mudancasBruto.quantity);
  if (mudancasBruto.quantity !== undefined && quantidade !== null) campos.quantidade = quantidade;

  if (Object.keys(campos).length === 0) {
    alertas.push({ nivel: "error", mensagem: `items_update para "${nome ?? "?"}" não tem nenhum campo reconhecido em 'changes'.` });
  }

  return {
    id: proximoId(),
    tipo: "item_update",
    nome: nome ?? "(sem nome)",
    campos,
    alertas,
  };
}

function interpretarEquipamento(acao: "equipar" | "desequipar", bruto: unknown): MudancaEquipamento {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.item === "string" ? objeto.item : null;
  if (!nome) {
    alertas.push({ nivel: "error", mensagem: `Item em equipment.${acao === "equipar" ? "equip" : "unequip"} sem 'item'.` });
  }

  return {
    id: proximoId(),
    tipo: "equipamento",
    acao,
    nome: nome ?? "(sem nome)",
    slot: typeof objeto.slot === "string" ? objeto.slot : undefined,
    alertas,
  };
}

function interpretarMoeda(nome: string, bruto: unknown): MudancaMoeda {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const temChange = objeto.change !== undefined;
  const temSet = objeto.set !== undefined;

  if (!temChange && !temSet) {
    alertas.push({ nivel: "error", mensagem: `currency.${nome} precisa de 'change' ou 'set'.` });
  } else if (temChange && temSet) {
    alertas.push({ nivel: "error", mensagem: `currency.${nome} usa 'change' e 'set' ao mesmo tempo — escolha só um.` });
  }
  const operacao: "change" | "set" = temSet ? "set" : "change";
  const valorBruto = objeto[operacao];
  const valor = paraNumero(valorBruto);
  if ((temChange || temSet) && valor === null) {
    alertas.push({ nivel: "error", mensagem: `currency.${nome}.${operacao} precisa ser numérico.` });
  }
  if (temSet) {
    alertas.push({ nivel: "warning", mensagem: `Uso de 'set' substitui ${nome} direto — prefira 'change'.` });
  }

  return {
    id: proximoId(),
    tipo: "moeda",
    nome,
    operacao,
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarMissaoAdd(bruto: unknown): MudancaMissaoAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Missão em missions_add sem 'name'." });

  const statusBruto = typeof objeto.status === "string" ? objeto.status : "active";
  const status = STATUS_MISSAO_MAP[statusBruto];
  if (!status) alertas.push({ nivel: "error", mensagem: `Status de missão desconhecido: "${statusBruto}".` });

  const objetivosBruto = Array.isArray(objeto.objectives) ? objeto.objectives : [];
  const objetivos: ObjetivoMissao[] = objetivosBruto.map((itemBruto) => {
    const o = typeof itemBruto === "object" && itemBruto !== null ? (itemBruto as Record<string, unknown>) : {};
    const texto = typeof o.text === "string" ? o.text : "(sem texto)";
    const statusObjBruto = typeof o.status === "string" ? o.status : "pending";
    return { texto, status: STATUS_OBJETIVO_MAP[statusObjBruto] ?? "pendente" };
  });

  return {
    id: proximoId(),
    tipo: "missao_add",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    status: status ?? "ativa",
    objetivos,
    alertas,
  };
}

function interpretarMissaoUpdate(bruto: unknown): MudancaMissaoUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em missions_update sem 'name'." });

  const acaoBruta = typeof objeto.action === "string" ? objeto.action : null;
  if (!acaoBruta || !ACOES_MISSAO_UPDATE.has(acaoBruta as AcaoMissaoUpdate)) {
    alertas.push({ nivel: "error", mensagem: `Ação desconhecida em missions_update: "${String(acaoBruta)}".` });
  }
  const acao: AcaoMissaoUpdate =
    acaoBruta && ACOES_MISSAO_UPDATE.has(acaoBruta as AcaoMissaoUpdate) ? (acaoBruta as AcaoMissaoUpdate) : "append_note";

  const objetivo = typeof objeto.objective === "string" ? objeto.objective : undefined;
  if (["add_objective", "complete_objective", "fail_objective", "reopen_objective"].includes(acao) && !objetivo) {
    alertas.push({ nivel: "error", mensagem: `Ação "${acao}" precisa de 'objective'.` });
  }

  let status: StatusMissao | undefined;
  if (acao === "set_status") {
    const statusBruto = typeof objeto.status === "string" ? objeto.status : null;
    status = statusBruto ? STATUS_MISSAO_MAP[statusBruto] : undefined;
    if (!status) alertas.push({ nivel: "error", mensagem: `set_status precisa de 'status' válido (veio "${String(statusBruto)}").` });
  }

  let nota: string | undefined;
  if (acao === "append_note") {
    nota = typeof objeto.note === "string" ? objeto.note : undefined;
    if (!nota) alertas.push({ nivel: "error", mensagem: "append_note precisa de 'note'." });
  }

  // reveal_reward não tem estado de "oculto/visível" nesta fatia — trata igual a add_reward.
  let recompensa: string | undefined;
  if (acao === "add_reward" || acao === "reveal_reward") {
    recompensa = typeof objeto.reward === "string" ? objeto.reward : undefined;
    if (!recompensa) alertas.push({ nivel: "error", mensagem: `${acao} precisa de 'reward'.` });
  }

  return {
    id: proximoId(),
    tipo: "missao_update",
    nome: nome ?? "(sem nome)",
    acao,
    objetivo,
    status,
    nota,
    recompensa,
    alertas,
  };
}

function interpretarNpcAdd(bruto: unknown): MudancaNpcAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "NPC em npcs_add sem 'name'." });

  return {
    id: proximoId(),
    tipo: "npc_add",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    primeiroEncontro: typeof objeto.first_met === "string" ? objeto.first_met : undefined,
    tags: Array.isArray(objeto.tags) ? objeto.tags.filter((t): t is string => typeof t === "string") : undefined,
    alertas,
  };
}

function interpretarNpcUpdate(bruto: unknown): MudancaNpcUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em npcs_update sem 'name'." });

  const conhecimentoNovo = Array.isArray(objeto.known_information_add)
    ? objeto.known_information_add.filter((t): t is string => typeof t === "string")
    : [];
  if (conhecimentoNovo.length === 0) {
    alertas.push({ nivel: "error", mensagem: `npcs_update para "${nome ?? "?"}" não tem 'known_information_add'.` });
  }

  return {
    id: proximoId(),
    tipo: "npc_update",
    nome: nome ?? "(sem nome)",
    conhecimentoNovo,
    alertas,
  };
}

function interpretarRelacao(bruto: unknown): MudancaRelacao {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const npc = typeof objeto.npc === "string" ? objeto.npc : null;
  if (!npc) alertas.push({ nivel: "error", mensagem: "Item em relationships sem 'npc'." });
  const stat = typeof objeto.stat === "string" ? objeto.stat : null;
  if (!stat) alertas.push({ nivel: "error", mensagem: `relationships para "${npc ?? "?"}" sem 'stat'.` });

  const valor = paraNumero(objeto.change);
  if (objeto.change === undefined) {
    alertas.push({ nivel: "error", mensagem: `relationships.${stat ?? "?"} precisa de 'change'.` });
  } else if (valor === null) {
    alertas.push({ nivel: "error", mensagem: `relationships.${stat ?? "?"} precisa ser numérico.` });
  }

  return {
    id: proximoId(),
    tipo: "relacao",
    npc: npc ?? "(sem nome)",
    stat: stat ?? "(sem stat)",
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarNotaUpdate(bruto: unknown): MudancaNotaUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Item em notes_update sem 'title'." });
  const acrescimo = typeof objeto.append === "string" ? objeto.append : null;
  if (!acrescimo) alertas.push({ nivel: "error", mensagem: `notes_update para "${titulo ?? "?"}" sem 'append'.` });

  return {
    id: proximoId(),
    tipo: "nota_update",
    titulo: titulo ?? "(sem título)",
    acrescimo: acrescimo ?? "",
    alertas,
  };
}

function interpretarNotaRemove(bruto: unknown): MudancaNotaRemove {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  // O protocolo usa 'id' (ex: "note-001"), mas quem cria a colinha é o Hub — o ChatGPT
  // não conhece esse id. Na prática ele referencia pelo 'title' que ele mesmo deu.
  const titulo = typeof objeto.title === "string" ? objeto.title : undefined;
  const idNota = typeof objeto.id === "string" ? objeto.id : undefined;
  if (!titulo && !idNota) {
    alertas.push({ nivel: "error", mensagem: "Item em notes_remove sem 'title' nem 'id'." });
  }

  return {
    id: proximoId(),
    tipo: "nota_remove",
    titulo,
    idNota,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarDescobertaAdd(bruto: unknown): MudancaDescobertaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Item em discoveries_add sem 'title'." });

  const statusBruto = typeof objeto.status === "string" ? objeto.status : "theory";
  const status = STATUS_DESCOBERTA_MAP[statusBruto];
  if (!status) alertas.push({ nivel: "error", mensagem: `Status de descoberta desconhecido: "${statusBruto}".` });

  return {
    id: proximoId(),
    tipo: "descoberta_add",
    titulo: titulo ?? "(sem título)",
    categoria: typeof objeto.category === "string" ? objeto.category : undefined,
    status: status ?? "teoria",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    evidencias: Array.isArray(objeto.evidence) ? objeto.evidence.filter((e): e is string => typeof e === "string") : [],
    alertas,
  };
}

function interpretarDescobertaUpdate(bruto: unknown): MudancaDescobertaUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Item em discoveries_update sem 'title'." });

  let status: StatusDescoberta | undefined;
  if (objeto.status !== undefined) {
    const statusBruto = typeof objeto.status === "string" ? objeto.status : "";
    status = STATUS_DESCOBERTA_MAP[statusBruto];
    if (!status) alertas.push({ nivel: "error", mensagem: `Status de descoberta desconhecido: "${statusBruto}".` });
  }

  const evidenciasNovas = Array.isArray(objeto.evidence_add)
    ? objeto.evidence_add.filter((e): e is string => typeof e === "string")
    : [];

  return {
    id: proximoId(),
    tipo: "descoberta_update",
    titulo: titulo ?? "(sem título)",
    status,
    evidenciasNovas,
    alertas,
  };
}

function interpretarCodexAdd(bruto: unknown): MudancaCodexAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Item em codex_add sem 'title'." });
  const texto = typeof objeto.text === "string" ? objeto.text : null;
  if (!texto) alertas.push({ nivel: "error", mensagem: `codex_add "${titulo ?? "?"}" sem 'text'.` });

  return {
    id: proximoId(),
    tipo: "codex_add",
    titulo: titulo ?? "(sem título)",
    categoria: typeof objeto.category === "string" ? objeto.category : undefined,
    texto: texto ?? "",
    alertas,
  };
}

function interpretarLocalAdd(bruto: unknown): MudancaLocalAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em locations_add sem 'name'." });

  return {
    id: proximoId(),
    tipo: "local_add",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    descoberto: objeto.discovered !== false,
    alertas,
  };
}

function interpretarLocalUpdate(bruto: unknown): MudancaLocalUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em locations_update sem 'name'." });

  const conhecimentoNovo = Array.isArray(objeto.known_information_add)
    ? objeto.known_information_add.filter((t): t is string => typeof t === "string")
    : [];
  if (conhecimentoNovo.length === 0) {
    alertas.push({ nivel: "error", mensagem: `locations_update para "${nome ?? "?"}" não tem 'known_information_add'.` });
  }

  return {
    id: proximoId(),
    tipo: "local_update",
    nome: nome ?? "(sem nome)",
    conhecimentoNovo,
    alertas,
  };
}

function interpretarCriaturaAdd(bruto: unknown): MudancaCriaturaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em bestiary_add sem 'name'." });

  return {
    id: proximoId(),
    tipo: "criatura_add",
    nome: nome ?? "(sem nome)",
    categoria: typeof objeto.category === "string" ? objeto.category : undefined,
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    tracosConhecidos: Array.isArray(objeto.known_traits)
      ? objeto.known_traits.filter((t): t is string => typeof t === "string")
      : [],
    alertas,
  };
}

function interpretarDiarioAdd(bruto: unknown): MudancaDiarioAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "journal.add sem 'title'." });

  return {
    id: proximoId(),
    tipo: "diario_add",
    titulo: titulo ?? "(sem título)",
    resumo: typeof objeto.summary === "string" ? objeto.summary : undefined,
    eventos: Array.isArray(objeto.events) ? objeto.events.filter((e): e is string => typeof e === "string") : [],
    alertas,
  };
}

/** Compartilhado por temporary_modifiers e conditions — mesmo formato de `duration` nos dois. */
function interpretarDuracao(bruto: unknown, contexto: string): { duracao: DuracaoBruta | undefined; alertas: Alerta[] } {
  const alertas: Alerta[] = [];
  if (bruto === undefined) return { duracao: undefined, alertas };
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const tipoBruto = typeof objeto.type === "string" ? objeto.type : null;
  const tipo = tipoBruto && TIPOS_DURACAO.has(tipoBruto as TipoDuracao) ? (tipoBruto as TipoDuracao) : null;
  if (!tipo) {
    alertas.push({ nivel: "error", mensagem: `${contexto}: tipo de duração desconhecido ("${String(tipoBruto)}").` });
    return { duracao: undefined, alertas };
  }
  const valor = paraNumero(objeto.value);
  return {
    duracao: { tipo, valor: valor ?? undefined, descricao: typeof objeto.description === "string" ? objeto.description : undefined },
    alertas,
  };
}

function interpretarModificadorAdd(bruto: unknown): MudancaModificadorAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em temporary_modifiers.add sem 'name'." });
  const alvo = typeof objeto.target === "string" ? objeto.target : null;
  if (!alvo) alertas.push({ nivel: "error", mensagem: `temporary_modifiers.add "${nome ?? "?"}" sem 'target'.` });
  const valor = paraNumero(objeto.value);
  if (valor === null) alertas.push({ nivel: "error", mensagem: `temporary_modifiers.add "${nome ?? "?"}" precisa de 'value' numérico.` });

  const { duracao, alertas: alertasDuracao } = interpretarDuracao(objeto.duration, `temporary_modifiers.add "${nome ?? "?"}"`);
  alertas.push(...alertasDuracao);
  if (objeto.duration === undefined) {
    alertas.push({ nivel: "error", mensagem: `temporary_modifiers.add "${nome ?? "?"}" precisa de 'duration'.` });
  }

  return {
    id: proximoId(),
    tipo: "modificador_add",
    nome: nome ?? "(sem nome)",
    alvo: alvo ?? "(sem alvo)",
    valor: valor ?? 0,
    duracao: duracao ?? { tipo: "until_removed" },
    alertas,
  };
}

function interpretarModificadorRemove(bruto: unknown): MudancaModificadorRemove {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em temporary_modifiers.remove sem 'name'." });
  return { id: proximoId(), tipo: "modificador_remove", nome: nome ?? "(sem nome)", alertas };
}

function interpretarCondicaoAdd(bruto: unknown): MudancaCondicaoAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em conditions.add sem 'name'." });
  const { duracao, alertas: alertasDuracao } = interpretarDuracao(objeto.duration, `conditions.add "${nome ?? "?"}"`);
  alertas.push(...alertasDuracao);

  return {
    id: proximoId(),
    tipo: "condicao_add",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    duracao,
    alertas,
  };
}

function interpretarCondicaoRemove(bruto: unknown): MudancaCondicaoRemove {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em conditions.remove sem 'name'." });
  return { id: proximoId(), tipo: "condicao_remove", nome: nome ?? "(sem nome)", alertas };
}

function interpretarCondicaoUpdate(bruto: unknown): MudancaCondicaoUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em conditions.update sem 'name'." });
  const { duracao, alertas: alertasDuracao } = interpretarDuracao(objeto.duration, `conditions.update "${nome ?? "?"}"`);
  alertas.push(...alertasDuracao);

  return {
    id: proximoId(),
    tipo: "condicao_update",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    duracao,
    alertas,
  };
}

function interpretarMagiaAdd(bruto: unknown): MudancaMagiaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em spells_add sem 'name'." });

  let custo: Record<string, number> | undefined;
  if (typeof objeto.cost === "object" && objeto.cost !== null) {
    custo = {};
    for (const [chave, valorBruto] of Object.entries(objeto.cost as Record<string, unknown>)) {
      const numero = paraNumero(valorBruto);
      if (numero !== null) custo[chave] = numero;
    }
  }

  const knowledge = typeof objeto.knowledge === "object" && objeto.knowledge !== null ? (objeto.knowledge as Record<string, unknown>) : {};

  return {
    id: proximoId(),
    tipo: "magia_add",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    afinidade: typeof objeto.affinity === "string" ? objeto.affinity : undefined,
    custo,
    statusConhecimento: typeof knowledge.status === "string" ? knowledge.status : undefined,
    progressoConhecimento: paraNumero(knowledge.progress) ?? undefined,
    tags: Array.isArray(objeto.tags) ? objeto.tags.filter((t): t is string => typeof t === "string") : undefined,
    alertas,
  };
}

function interpretarMagiaUpdate(bruto: unknown): MudancaMagiaUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em spells_update sem 'name'." });

  const descobertasSimplesNovas = Array.isArray(objeto.discoveries_add)
    ? objeto.discoveries_add.filter((t): t is string => typeof t === "string")
    : [];

  const knowledge = typeof objeto.knowledge === "object" && objeto.knowledge !== null ? (objeto.knowledge as Record<string, unknown>) : {};
  const progressoConhecimentoDelta = paraNumero(knowledge.change) ?? undefined;

  if (descobertasSimplesNovas.length === 0 && progressoConhecimentoDelta === undefined) {
    alertas.push({ nivel: "error", mensagem: `spells_update "${nome ?? "?"}" não tem 'discoveries_add' nem 'knowledge.change'.` });
  }

  return {
    id: proximoId(),
    tipo: "magia_update",
    nome: nome ?? "(sem nome)",
    descobertasSimplesNovas,
    progressoConhecimentoDelta,
    alertas,
  };
}

function interpretarMagiaDescoberta(bruto: unknown): MudancaMagiaDescoberta {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const magia = typeof objeto.spell === "string" ? objeto.spell : null;
  if (!magia) alertas.push({ nivel: "error", mensagem: "Item em spell_discoveries sem 'spell'." });
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: `spell_discoveries de "${magia ?? "?"}" sem 'title'.` });

  const statusBruto = typeof objeto.status === "string" ? objeto.status : "theory";
  const status = STATUS_DESCOBERTA_MAGIA_MAP[statusBruto];
  if (!status) alertas.push({ nivel: "error", mensagem: `Status de descoberta de magia desconhecido: "${statusBruto}".` });

  return {
    id: proximoId(),
    tipo: "magia_descoberta",
    magia: magia ?? "(sem nome)",
    titulo: titulo ?? "(sem título)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    status: status ?? "teoria",
    alertas,
  };
}

function interpretarPesquisaAdd(bruto: unknown): MudancaPesquisaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Item em research_add sem 'title'." });

  return {
    id: proximoId(),
    tipo: "pesquisa_add",
    titulo: titulo ?? "(sem título)",
    status: typeof objeto.status === "string" ? objeto.status : "active",
    progresso: paraNumero(objeto.progress) ?? 0,
    objetivos: Array.isArray(objeto.objectives) ? objeto.objectives.filter((o): o is string => typeof o === "string") : [],
    alertas,
  };
}

function interpretarPesquisaUpdate(bruto: unknown): MudancaPesquisaUpdate {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const titulo = typeof objeto.title === "string" ? objeto.title : null;
  if (!titulo) alertas.push({ nivel: "error", mensagem: "Item em research_update sem 'title'." });

  const progressoDelta = paraNumero(objeto.progress_change) ?? undefined;
  const evidenciasNovas = Array.isArray(objeto.evidence_add) ? objeto.evidence_add.filter((e): e is string => typeof e === "string") : [];
  const objetivosNovos = Array.isArray(objeto.objectives_add) ? objeto.objectives_add.filter((o): o is string => typeof o === "string") : [];
  const notasNovas = Array.isArray(objeto.notes_add) ? objeto.notes_add.filter((n): n is string => typeof n === "string") : [];
  const status = typeof objeto.status === "string" ? objeto.status : undefined;

  if (!status && progressoDelta === undefined && evidenciasNovas.length === 0 && objetivosNovos.length === 0 && notasNovas.length === 0) {
    alertas.push({ nivel: "error", mensagem: `research_update "${titulo ?? "?"}" não tem nenhuma mudança reconhecida.` });
  }

  return {
    id: proximoId(),
    tipo: "pesquisa_update",
    titulo: titulo ?? "(sem título)",
    status,
    progressoDelta,
    evidenciasNovas,
    objetivosNovos,
    notasNovas,
    alertas,
  };
}

function interpretarConquistaAdd(bruto: unknown): MudancaConquistaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const nome = typeof objeto.name === "string" ? objeto.name : null;
  if (!nome) alertas.push({ nivel: "error", mensagem: "Item em achievements_add sem 'name'." });
  return {
    id: proximoId(),
    tipo: "conquista_add",
    nome: nome ?? "(sem nome)",
    descricao: typeof objeto.description === "string" ? objeto.description : undefined,
    alertas,
  };
}

function interpretarReputacao(bruto: unknown): MudancaReputacao {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const alvo = typeof objeto.target === "string" ? objeto.target : null;
  if (!alvo) alertas.push({ nivel: "error", mensagem: "Item em reputation sem 'target'." });

  const temChange = objeto.change !== undefined;
  const temSet = objeto.set !== undefined;
  if (!temChange && !temSet) {
    alertas.push({ nivel: "error", mensagem: `reputation "${alvo ?? "?"}" precisa de 'change' ou 'set'.` });
  } else if (temChange && temSet) {
    alertas.push({ nivel: "error", mensagem: `reputation "${alvo ?? "?"}" usa 'change' e 'set' ao mesmo tempo — escolha só um.` });
  }
  const operacao: "change" | "set" = temSet ? "set" : "change";
  const valorBruto = objeto[operacao];
  const valor = paraNumero(valorBruto);
  if ((temChange || temSet) && valor === null) {
    alertas.push({ nivel: "error", mensagem: `reputation.${operacao} precisa ser numérico.` });
  }

  return {
    id: proximoId(),
    tipo: "reputacao",
    alvo: alvo ?? "(sem alvo)",
    operacao,
    valor: valor ?? 0,
    motivo: typeof objeto.reason === "string" ? objeto.reason : undefined,
    alertas,
  };
}

function interpretarImagemPedido(bruto: unknown): MudancaImagemPedido {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const tipoEntidade = typeof objeto.entity_type === "string" ? objeto.entity_type : null;
  if (!tipoEntidade) alertas.push({ nivel: "error", mensagem: "Item em image_requests sem 'entity_type'." });
  const nomeEntidade = typeof objeto.entity_name === "string" ? objeto.entity_name : null;
  if (!nomeEntidade) alertas.push({ nivel: "error", mensagem: "Item em image_requests sem 'entity_name'." });

  return {
    id: proximoId(),
    tipo: "imagem_pedido",
    tipoEntidade: tipoEntidade ?? "(desconhecido)",
    nomeEntidade: nomeEntidade ?? "(sem nome)",
    promptSugerido: typeof objeto.prompt_hint === "string" ? objeto.prompt_hint : undefined,
    prioridade: typeof objeto.priority === "string" ? objeto.priority : undefined,
    alertas,
  };
}

function interpretarEscolaAdd(bruto: unknown): MudancaEscolaAdd {
  const alertas: Alerta[] = [];
  const objeto = typeof bruto === "object" && bruto !== null ? (bruto as Record<string, unknown>) : {};
  const materia = typeof objeto.subject === "string" ? objeto.subject : null;
  if (!materia) alertas.push({ nivel: "error", mensagem: "Item em school.lessons_add sem 'subject'." });

  return {
    id: proximoId(),
    tipo: "escola_add",
    materia: materia ?? "(sem matéria)",
    topico: typeof objeto.topic === "string" ? objeto.topic : undefined,
    notas: Array.isArray(objeto.notes) ? objeto.notes.filter((n): n is string => typeof n === "string") : [],
    alertas,
  };
}
