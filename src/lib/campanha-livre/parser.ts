/*
  Parser do protocolo HUB_UPDATE (ver pacote de especificação entregue pelo
  Zé — 02_HUB_UPDATE_SPEC_v1.md é a fonte de verdade).

  Segunda fatia: mais 5 operações de personagem/inventário — level,
  attributes, items_update, equipment, currency — além das 5 da fatia
  mínima (xp, resources, items_add, items_remove, notes_add). O resto do
  protocolo (missions, npcs, discoveries, undo, snapshots, event log em
  tabela própria...) fica pra fatias futuras (decisão #26) — mas o formato
  do bloco e as regras de segurança abaixo já seguem a especificação
  inteira, pra não ter que reescrever quando essas fatias chegarem.

  Regra central do protocolo: o parser só entende o texto colado. Nada é
  salvo aqui — isto devolve uma lista de mudanças propostas, pra tela de
  revisão decidir o que aplicar (regras #1 e #2 da especificação).
*/
import { parse as parseYaml } from "yaml";

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
  | MudancaMoeda;

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

  const camposDesconhecidos = Object.keys(raiz).filter((chave) => !CAMPOS_CONHECIDOS.has(chave));

  if (mudancas.length === 0) {
    return {
      ok: false,
      erro:
        camposDesconhecidos.length > 0
          ? `Nenhuma operação reconhecida nesta fatia do Hub (só campo(s) desconhecido(s): ${camposDesconhecidos.join(", ")}).`
          : "O bloco não contém nenhuma operação reconhecida (xp, resources, items_add, items_remove, notes_add, level, attributes, items_update, equipment ou currency).",
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
