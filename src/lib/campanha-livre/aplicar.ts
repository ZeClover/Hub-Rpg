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
    atributos: { ...atual.atributos },
    moedas: { ...atual.moedas },
    inventario: atual.inventario.map((item) => ({ ...item })),
    notas: [...atual.notas],
    missoes: atual.missoes.map((m) => ({ ...m, objetivos: m.objetivos.map((o) => ({ ...o })), recompensas: [...m.recompensas], anotacoes: [...m.anotacoes] })),
    npcs: atual.npcs.map((n) => ({ ...n, conhecimento: [...n.conhecimento], relacoes: { ...n.relacoes } })),
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

    if (mudanca.tipo === "nivel") {
      const antes = dados.nivel;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
      dados.nivel = depois;
      resumos.push(`Nível: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }

    if (mudanca.tipo === "atributo") {
      const antes = dados.atributos[mudanca.nome] ?? 0;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
      dados.atributos[mudanca.nome] = depois;
      resumos.push(`${mudanca.nome}: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }

    if (mudanca.tipo === "item_update") {
      const existente = dados.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      Object.assign(existente, mudanca.campos);
      resumos.push(`${mudanca.nome} atualizado`);
      continue;
    }

    if (mudanca.tipo === "equipamento") {
      const existente = dados.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      if (mudanca.acao === "equipar") {
        existente.equipado = true;
        existente.slot = mudanca.slot;
        resumos.push(`${mudanca.nome} equipado${mudanca.slot ? ` (${mudanca.slot})` : ""}`);
      } else {
        existente.equipado = false;
        existente.slot = undefined;
        resumos.push(`${mudanca.nome} desequipado`);
      }
      continue;
    }

    if (mudanca.tipo === "moeda") {
      const antes = dados.moedas[mudanca.nome] ?? 0;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
      dados.moedas[mudanca.nome] = depois;
      resumos.push(`${mudanca.nome}: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }

    if (mudanca.tipo === "missao_add") {
      const existente = dados.missoes.find((m) => m.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        resumos.push(`Missão "${mudanca.nome}" já existia — ignorada`);
        continue;
      }
      dados.missoes.push({
        id: gerarId(),
        nome: mudanca.nome,
        descricao: mudanca.descricao,
        status: mudanca.status,
        objetivos: mudanca.objetivos,
        recompensas: [],
        anotacoes: [],
        criadaEm: Date.now(),
      });
      resumos.push(`Nova missão: ${mudanca.nome} (${mudanca.status})`);
      continue;
    }

    if (mudanca.tipo === "missao_update") {
      const missao = dados.missoes.find((m) => m.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!missao) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      if (mudanca.objetivo && ["add_objective", "complete_objective", "fail_objective", "reopen_objective"].includes(mudanca.acao)) {
        if (mudanca.acao === "add_objective") {
          missao.objetivos.push({ texto: mudanca.objetivo, status: "pendente" });
          resumos.push(`${mudanca.nome}: novo objetivo "${mudanca.objetivo}"`);
        } else {
          const objetivo = missao.objetivos.find((o) => o.texto.trim().toLowerCase() === mudanca.objetivo!.trim().toLowerCase());
          if (objetivo) {
            objetivo.status = mudanca.acao === "complete_objective" ? "concluido" : mudanca.acao === "fail_objective" ? "falhou" : "pendente";
            resumos.push(`${mudanca.nome}: "${mudanca.objetivo}" → ${objetivo.status}`);
          }
        }
      } else if (mudanca.acao === "set_status" && mudanca.status) {
        missao.status = mudanca.status;
        resumos.push(`${mudanca.nome}: status → ${mudanca.status}`);
      } else if (mudanca.acao === "append_note" && mudanca.nota) {
        missao.anotacoes.push(mudanca.nota);
        resumos.push(`${mudanca.nome}: anotação adicionada`);
      } else if ((mudanca.acao === "add_reward" || mudanca.acao === "reveal_reward") && mudanca.recompensa) {
        missao.recompensas.push(mudanca.recompensa);
        resumos.push(`${mudanca.nome}: recompensa — ${mudanca.recompensa}`);
      }
      continue;
    }

    if (mudanca.tipo === "npc_add") {
      const existente = dados.npcs.find((n) => n.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        resumos.push(`NPC "${mudanca.nome}" já existia — ignorado`);
        continue;
      }
      dados.npcs.push({
        id: gerarId(),
        nome: mudanca.nome,
        descricao: mudanca.descricao,
        primeiroEncontro: mudanca.primeiroEncontro,
        tags: mudanca.tags,
        conhecimento: [],
        relacoes: {},
        criadoEm: Date.now(),
      });
      resumos.push(`Novo NPC: ${mudanca.nome}`);
      continue;
    }

    if (mudanca.tipo === "npc_update") {
      const npc = dados.npcs.find((n) => n.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!npc) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      npc.conhecimento.push(...mudanca.conhecimentoNovo);
      resumos.push(`${mudanca.nome}: +${mudanca.conhecimentoNovo.length} informação(ões) conhecida(s)`);
      continue;
    }

    if (mudanca.tipo === "relacao") {
      const npc = dados.npcs.find((n) => n.nome.trim().toLowerCase() === mudanca.npc.trim().toLowerCase());
      if (!npc) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = npc.relacoes[mudanca.stat] ?? 0;
      const depois = antes + mudanca.valor;
      npc.relacoes[mudanca.stat] = depois;
      resumos.push(`${mudanca.npc}.${mudanca.stat}: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`);
      continue;
    }
  }

  return { dados, resumos };
}
