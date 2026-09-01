/*
  Aplica mudanças já revisadas e confirmadas a uma ficha Campanha Livre.

  Função pura de propósito (regra #37 do protocolo: "usar transação quando
  possível" — sem banco aqui, a "transação" é só nunca gravar um resultado
  parcial: quem chama recebe o objeto novo inteiro e decide se salva). Não
  aplica nenhuma mudança que ainda tenha alerta de erro (`temErro`), mesmo
  que tenha vindo marcada — a tela de revisão já devia ter desabilitado o
  checkbox, isto é o cinto de segurança.
*/
import { temErro } from "./validar.ts";
import type { Mudanca } from "./parser.ts";
import type { PersonagemLivre } from "./tipos.ts";

function gerarId(): string {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type ResultadoAplicacao = {
  dados: PersonagemLivre;
  /** Uma linha por mudança aplicada, pronta pra mostrar num toast/histórico. */
  resumos: string[];
};

export function aplicarMudancas(atual: PersonagemLivre, selecionadas: Mudanca[]): ResultadoAplicacao {
  const dados: PersonagemLivre = {
    ...atual,
    recursos: { ...atual.recursos },
    inventario: atual.inventario.map((item) => ({ ...item })),
    notas: [...atual.notas],
  };
  const resumos: string[] = [];

  for (const mudanca of selecionadas) {
    if (temErro(mudanca)) continue;

    if (mudanca.tipo === "xp") {
      const antes = dados.xp;
      const depois = mudanca.operacao === "add" ? antes + mudanca.valor : mudanca.operacao === "remove" ? antes - mudanca.valor : mudanca.valor;
      dados.xp = depois;
      resumos.push(`XP: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }

    if (mudanca.tipo === "recurso") {
      const existente = dados.recursos[mudanca.nome] ?? { atual: 0, maximo: null };
      const antes = existente.atual;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
      dados.recursos[mudanca.nome] = { ...existente, atual: depois };
      resumos.push(`${mudanca.nome}: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }

    if (mudanca.tipo === "item_add") {
      const existente = dados.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (existente) {
        existente.quantidade += mudanca.quantidade;
        resumos.push(`+${mudanca.quantidade} ${mudanca.nome} (agora ${existente.quantidade})`);
      } else {
        dados.inventario.push({
          id: gerarId(),
          nome: mudanca.nome,
          quantidade: mudanca.quantidade,
          categoria: mudanca.categoria,
          descricao: mudanca.descricao,
          raridade: mudanca.raridade,
          origem: mudanca.origem,
          tags: mudanca.tags,
        });
        resumos.push(`+${mudanca.quantidade} ${mudanca.nome} (novo item)`);
      }
      continue;
    }

    if (mudanca.tipo === "item_remove") {
      const existente = dados.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      existente.quantidade = Math.max(0, existente.quantidade - mudanca.quantidade);
      dados.inventario = dados.inventario.filter((item) => item.quantidade > 0);
      resumos.push(`-${mudanca.quantidade} ${mudanca.nome}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }

    if (mudanca.tipo === "nota_add") {
      dados.notas.push({
        id: gerarId(),
        titulo: mudanca.titulo,
        categoria: mudanca.categoria,
        texto: mudanca.texto,
        tags: mudanca.tags,
        flags: mudanca.flags,
        criadaEm: Date.now(),
      });
      resumos.push(`Nova colinha: ${mudanca.titulo}`);
      continue;
    }
  }

  return { dados, resumos };
}
