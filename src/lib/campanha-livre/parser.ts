/*
  Parser do protocolo HUB_UPDATE (ver pacote de especificação entregue pelo
  Zé — 02_HUB_UPDATE_SPEC_v1.md é a fonte de verdade).

  Fatia atual (núcleo mínimo): só 5 operações — xp, resources, items_add,
  items_remove, notes_add. O resto do protocolo (missions, npcs,
  discoveries, undo, snapshots, event log em tabela própria...) fica pra
  fatias futuras (decisão #26) — mas o formato do bloco e as regras de
  segurança abaixo já seguem a especificação inteira, pra não ter que
  reescrever quando essas fatias chegarem.

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

export type Mudanca = MudancaXp | MudancaRecurso | MudancaItemAdd | MudancaItemRemove | MudancaNotaAdd;

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

  const camposDesconhecidos = Object.keys(raiz).filter((chave) => !CAMPOS_CONHECIDOS.has(chave));

  if (mudancas.length === 0) {
    return {
      ok: false,
      erro:
        camposDesconhecidos.length > 0
          ? `Nenhuma operação reconhecida nesta fatia do Hub (só campo(s) desconhecido(s): ${camposDesconhecidos.join(", ")}).`
          : "O bloco não contém nenhuma operação (xp, resources, items_add, items_remove ou notes_add).",
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
