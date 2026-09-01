/*
  Aplica mudanças já revisadas e confirmadas a uma ficha Campanha Livre.

  Função pura de propósito (regra #37 do protocolo: "usar transação quando
  possível" — sem banco aqui, a "transação" é só nunca gravar um resultado
  parcial: quem chama recebe o objeto novo inteiro e decide se salva). Não
  aplica nenhuma mudança que ainda tenha alerta de erro (`temErro`), mesmo
  que tenha vindo marcada — a tela de revisão já devia ter desabilitado o
  checkbox, isto é o cinto de segurança.

  Cada mudança aplicada também vira um `EventoAplicado` (regras #12/#41 do
  protocolo): guarda como a entidade estava ANTES daquela mudança
  específica, pra dar pra desfazer (`desfazerEvento`) sem precisar de um
  campo "reverter" por tipo de operação — ver o comentário de `AlvoEvento`
  em tipos.ts.
*/
import { temErro } from "./validar.ts";
import type { Mudanca } from "./parser.ts";
import type { AlvoEvento, EventoAplicado, PersonagemLivre } from "./tipos.ts";

function gerarId(): string {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Cópia profunda via JSON — seguro aqui porque toda entidade da ficha é dado simples (string/número/booleano/array/objeto). */
function copiar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor));
}

export type ResultadoAplicacao = {
  dados: PersonagemLivre;
  /** Uma linha por mudança aplicada, pronta pra mostrar num toast/histórico. */
  resumos: string[];
};

export function aplicarMudancas(atual: PersonagemLivre, selecionadas: Mudanca[], importId: string): ResultadoAplicacao {
  const dados: PersonagemLivre = {
    ...atual,
    recursos: { ...atual.recursos },
    atributos: { ...atual.atributos },
    moedas: { ...atual.moedas },
    inventario: atual.inventario.map((item) => ({ ...item })),
    notas: [...atual.notas],
    missoes: atual.missoes.map((m) => ({ ...m, objetivos: m.objetivos.map((o) => ({ ...o })), recompensas: [...m.recompensas], anotacoes: [...m.anotacoes] })),
    npcs: atual.npcs.map((n) => ({ ...n, conhecimento: [...n.conhecimento], relacoes: { ...n.relacoes } })),
    descobertas: atual.descobertas.map((d) => ({ ...d, evidencias: [...d.evidencias] })),
    codex: [...atual.codex],
    locais: atual.locais.map((l) => ({ ...l, conhecimento: [...l.conhecimento] })),
    criaturas: atual.criaturas.map((c) => ({ ...c, tracosConhecidos: [...c.tracosConhecidos] })),
    diario: atual.diario.map((e) => ({ ...e, eventos: [...e.eventos] })),
    eventos: [...atual.eventos],
  };
  const resumos: string[] = [];

  function registrar(tipo: string, resumo: string, alvo: AlvoEvento) {
    resumos.push(resumo);
    const evento: EventoAplicado = { id: gerarId(), importId, tipo, resumo, criadoEm: Date.now(), revertido: false, alvo };
    dados.eventos.push(evento);
  }

  for (const mudanca of selecionadas) {
    if (temErro(mudanca)) continue;

    if (mudanca.tipo === "xp") {
      const antes = dados.xp;
      const depois = mudanca.operacao === "add" ? antes + mudanca.valor : mudanca.operacao === "remove" ? antes - mudanca.valor : mudanca.valor;
      dados.xp = depois;
      registrar(mudanca.tipo, `XP: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, { forma: "raiz", campo: "xp", antes });
      continue;
    }

    if (mudanca.tipo === "nivel") {
      const antes = dados.nivel;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
      dados.nivel = depois;
      registrar(mudanca.tipo, `Nível: ${antes} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, { forma: "raiz", campo: "nivel", antes });
      continue;
    }

    if (mudanca.tipo === "recurso") {
      const antes = dados.recursos[mudanca.nome] ?? null;
      const base = antes ?? { atual: 0, maximo: null };
      const depois = mudanca.operacao === "set" ? mudanca.valor : base.atual + mudanca.valor;
      dados.recursos[mudanca.nome] = { ...base, atual: depois };
      registrar(mudanca.tipo, `${mudanca.nome}: ${base.atual} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, {
        forma: "mapa",
        mapa: "recursos",
        chave: mudanca.nome,
        antes: antes ? copiar(antes) : null,
      });
      continue;
    }

    if (mudanca.tipo === "atributo") {
      const existiaAntes = dados.atributos[mudanca.nome] !== undefined;
      const antesValor = dados.atributos[mudanca.nome] ?? 0;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antesValor + mudanca.valor;
      dados.atributos[mudanca.nome] = depois;
      registrar(mudanca.tipo, `${mudanca.nome}: ${antesValor} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, {
        forma: "mapa",
        mapa: "atributos",
        chave: mudanca.nome,
        antes: existiaAntes ? antesValor : null,
      });
      continue;
    }

    if (mudanca.tipo === "moeda") {
      const existiaAntes = dados.moedas[mudanca.nome] !== undefined;
      const antesValor = dados.moedas[mudanca.nome] ?? 0;
      const depois = mudanca.operacao === "set" ? mudanca.valor : antesValor + mudanca.valor;
      dados.moedas[mudanca.nome] = depois;
      registrar(mudanca.tipo, `${mudanca.nome}: ${antesValor} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, {
        forma: "mapa",
        mapa: "moedas",
        chave: mudanca.nome,
        antes: existiaAntes ? antesValor : null,
      });
      continue;
    }

    if (mudanca.tipo === "item_add") {
      const existente = dados.inventario.find((item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        const antes = copiar(existente);
        existente.quantidade += mudanca.quantidade;
        registrar(mudanca.tipo, `+${mudanca.quantidade} ${mudanca.nome} (agora ${existente.quantidade})`, {
          forma: "lista",
          lista: "inventario",
          identificador: existente.nome,
          antes,
        });
      } else {
        const novoItem = {
          id: gerarId(),
          nome: mudanca.nome,
          quantidade: mudanca.quantidade,
          categoria: mudanca.categoria,
          descricao: mudanca.descricao,
          raridade: mudanca.raridade,
          origem: mudanca.origem,
          tags: mudanca.tags,
        };
        dados.inventario.push(novoItem);
        registrar(mudanca.tipo, `+${mudanca.quantidade} ${mudanca.nome} (novo item)`, {
          forma: "lista",
          lista: "inventario",
          identificador: novoItem.nome,
          antes: null,
        });
      }
      continue;
    }

    if (mudanca.tipo === "item_remove") {
      const existente = dados.inventario.find((item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(existente);
      existente.quantidade = Math.max(0, existente.quantidade - mudanca.quantidade);
      dados.inventario = dados.inventario.filter((item) => item.quantidade > 0);
      registrar(mudanca.tipo, `-${mudanca.quantidade} ${mudanca.nome}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, {
        forma: "lista",
        lista: "inventario",
        identificador: antes.nome,
        antes,
      });
      continue;
    }

    if (mudanca.tipo === "item_update") {
      const existente = dados.inventario.find((item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(existente);
      Object.assign(existente, mudanca.campos);
      registrar(mudanca.tipo, `${mudanca.nome} atualizado`, { forma: "lista", lista: "inventario", identificador: antes.nome, antes });
      continue;
    }

    if (mudanca.tipo === "equipamento") {
      const existente = dados.inventario.find((item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(existente);
      let resumo: string;
      if (mudanca.acao === "equipar") {
        existente.equipado = true;
        existente.slot = mudanca.slot;
        resumo = `${mudanca.nome} equipado${mudanca.slot ? ` (${mudanca.slot})` : ""}`;
      } else {
        existente.equipado = false;
        existente.slot = undefined;
        resumo = `${mudanca.nome} desequipado`;
      }
      registrar(mudanca.tipo, resumo, { forma: "lista", lista: "inventario", identificador: antes.nome, antes });
      continue;
    }

    if (mudanca.tipo === "nota_add") {
      const nova = {
        id: gerarId(),
        titulo: mudanca.titulo,
        categoria: mudanca.categoria,
        texto: mudanca.texto,
        tags: mudanca.tags,
        flags: mudanca.flags,
        criadaEm: Date.now(),
      };
      dados.notas.push(nova);
      registrar(mudanca.tipo, `Nova colinha: ${mudanca.titulo}`, { forma: "lista", lista: "notas", identificador: nova.titulo, antes: null });
      continue;
    }

    if (mudanca.tipo === "nota_update") {
      const nota = dados.notas.find((n) => n.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase());
      if (!nota) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(nota);
      nota.texto = `${nota.texto}\n${mudanca.acrescimo}`;
      registrar(mudanca.tipo, `Colinha "${mudanca.titulo}" atualizada`, { forma: "lista", lista: "notas", identificador: antes.titulo, antes });
      continue;
    }

    if (mudanca.tipo === "nota_remove") {
      const existente = dados.notas.find(
        (n) => (mudanca.idNota && n.id === mudanca.idNota) || (mudanca.titulo && n.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase()),
      );
      if (!existente) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(existente);
      dados.notas = dados.notas.filter((n) => n.id !== existente.id);
      registrar(mudanca.tipo, `Colinha removida${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, {
        forma: "lista",
        lista: "notas",
        identificador: antes.titulo,
        antes,
      });
      continue;
    }

    if (mudanca.tipo === "missao_add") {
      const existente = dados.missoes.find((m) => m.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        resumos.push(`Missão "${mudanca.nome}" já existia — ignorada`);
        continue;
      }
      const nova = {
        id: gerarId(),
        nome: mudanca.nome,
        descricao: mudanca.descricao,
        status: mudanca.status,
        objetivos: mudanca.objetivos,
        recompensas: [],
        anotacoes: [],
        criadaEm: Date.now(),
      };
      dados.missoes.push(nova);
      registrar(mudanca.tipo, `Nova missão: ${mudanca.nome} (${mudanca.status})`, { forma: "lista", lista: "missoes", identificador: nova.nome, antes: null });
      continue;
    }

    if (mudanca.tipo === "missao_update") {
      const missao = dados.missoes.find((m) => m.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!missao) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(missao);
      let resumo: string | null = null;
      if (mudanca.objetivo && ["add_objective", "complete_objective", "fail_objective", "reopen_objective"].includes(mudanca.acao)) {
        if (mudanca.acao === "add_objective") {
          missao.objetivos.push({ texto: mudanca.objetivo, status: "pendente" });
          resumo = `${mudanca.nome}: novo objetivo "${mudanca.objetivo}"`;
        } else {
          const objetivo = missao.objetivos.find((o) => o.texto.trim().toLowerCase() === mudanca.objetivo!.trim().toLowerCase());
          if (objetivo) {
            objetivo.status = mudanca.acao === "complete_objective" ? "concluido" : mudanca.acao === "fail_objective" ? "falhou" : "pendente";
            resumo = `${mudanca.nome}: "${mudanca.objetivo}" → ${objetivo.status}`;
          }
        }
      } else if (mudanca.acao === "set_status" && mudanca.status) {
        missao.status = mudanca.status;
        resumo = `${mudanca.nome}: status → ${mudanca.status}`;
      } else if (mudanca.acao === "append_note" && mudanca.nota) {
        missao.anotacoes.push(mudanca.nota);
        resumo = `${mudanca.nome}: anotação adicionada`;
      } else if ((mudanca.acao === "add_reward" || mudanca.acao === "reveal_reward") && mudanca.recompensa) {
        missao.recompensas.push(mudanca.recompensa);
        resumo = `${mudanca.nome}: recompensa — ${mudanca.recompensa}`;
      }
      if (resumo) registrar(mudanca.tipo, resumo, { forma: "lista", lista: "missoes", identificador: antes.nome, antes });
      continue;
    }

    if (mudanca.tipo === "npc_add") {
      const existente = dados.npcs.find((n) => n.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        resumos.push(`NPC "${mudanca.nome}" já existia — ignorado`);
        continue;
      }
      const novo = {
        id: gerarId(),
        nome: mudanca.nome,
        descricao: mudanca.descricao,
        primeiroEncontro: mudanca.primeiroEncontro,
        tags: mudanca.tags,
        conhecimento: [],
        relacoes: {},
        criadoEm: Date.now(),
      };
      dados.npcs.push(novo);
      registrar(mudanca.tipo, `Novo NPC: ${mudanca.nome}`, { forma: "lista", lista: "npcs", identificador: novo.nome, antes: null });
      continue;
    }

    if (mudanca.tipo === "npc_update") {
      const npc = dados.npcs.find((n) => n.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!npc) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(npc);
      npc.conhecimento.push(...mudanca.conhecimentoNovo);
      registrar(mudanca.tipo, `${mudanca.nome}: +${mudanca.conhecimentoNovo.length} informação(ões) conhecida(s)`, {
        forma: "lista",
        lista: "npcs",
        identificador: antes.nome,
        antes,
      });
      continue;
    }

    if (mudanca.tipo === "relacao") {
      const npc = dados.npcs.find((n) => n.nome.trim().toLowerCase() === mudanca.npc.trim().toLowerCase());
      if (!npc) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(npc);
      const antesValor = npc.relacoes[mudanca.stat] ?? 0;
      const depois = antesValor + mudanca.valor;
      npc.relacoes[mudanca.stat] = depois;
      registrar(mudanca.tipo, `${mudanca.npc}.${mudanca.stat}: ${antesValor} → ${depois}${mudanca.motivo ? ` (${mudanca.motivo})` : ""}`, {
        forma: "lista",
        lista: "npcs",
        identificador: antes.nome,
        antes,
      });
      continue;
    }

    if (mudanca.tipo === "descoberta_add") {
      const existente = dados.descobertas.find((d) => d.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase());
      if (existente) {
        resumos.push(`Descoberta "${mudanca.titulo}" já existia — ignorada`);
        continue;
      }
      const nova = {
        id: gerarId(),
        titulo: mudanca.titulo,
        categoria: mudanca.categoria,
        status: mudanca.status,
        descricao: mudanca.descricao,
        evidencias: mudanca.evidencias,
        criadaEm: Date.now(),
      };
      dados.descobertas.push(nova);
      registrar(mudanca.tipo, `Nova descoberta: ${mudanca.titulo} (${mudanca.status})`, {
        forma: "lista",
        lista: "descobertas",
        identificador: nova.titulo,
        antes: null,
      });
      continue;
    }

    if (mudanca.tipo === "descoberta_update") {
      const descoberta = dados.descobertas.find((d) => d.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase());
      if (!descoberta) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(descoberta);
      if (mudanca.status) descoberta.status = mudanca.status;
      if (mudanca.evidenciasNovas.length > 0) descoberta.evidencias.push(...mudanca.evidenciasNovas);
      registrar(mudanca.tipo, `Descoberta "${mudanca.titulo}" atualizada${mudanca.status ? ` → ${mudanca.status}` : ""}`, {
        forma: "lista",
        lista: "descobertas",
        identificador: antes.titulo,
        antes,
      });
      continue;
    }

    if (mudanca.tipo === "codex_add") {
      const existente = dados.codex.find((c) => c.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase());
      if (existente) {
        resumos.push(`Codex "${mudanca.titulo}" já existia — ignorado`);
        continue;
      }
      const novo = { id: gerarId(), titulo: mudanca.titulo, categoria: mudanca.categoria, texto: mudanca.texto, criadoEm: Date.now() };
      dados.codex.push(novo);
      registrar(mudanca.tipo, `Novo codex: ${mudanca.titulo}`, { forma: "lista", lista: "codex", identificador: novo.titulo, antes: null });
      continue;
    }

    if (mudanca.tipo === "local_add") {
      const existente = dados.locais.find((l) => l.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        resumos.push(`Local "${mudanca.nome}" já existia — ignorado`);
        continue;
      }
      const novo = {
        id: gerarId(),
        nome: mudanca.nome,
        descricao: mudanca.descricao,
        descoberto: mudanca.descoberto,
        conhecimento: [],
        criadoEm: Date.now(),
      };
      dados.locais.push(novo);
      registrar(mudanca.tipo, `Novo local: ${mudanca.nome}`, { forma: "lista", lista: "locais", identificador: novo.nome, antes: null });
      continue;
    }

    if (mudanca.tipo === "local_update") {
      const local = dados.locais.find((l) => l.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!local) continue; // validar.ts já marcou isso como erro — não deveria chegar aqui
      const antes = copiar(local);
      local.conhecimento.push(...mudanca.conhecimentoNovo);
      registrar(mudanca.tipo, `${mudanca.nome}: +${mudanca.conhecimentoNovo.length} informação(ões)`, {
        forma: "lista",
        lista: "locais",
        identificador: antes.nome,
        antes,
      });
      continue;
    }

    if (mudanca.tipo === "criatura_add") {
      const existente = dados.criaturas.find((c) => c.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (existente) {
        resumos.push(`Criatura "${mudanca.nome}" já existia — ignorada`);
        continue;
      }
      const nova = {
        id: gerarId(),
        nome: mudanca.nome,
        categoria: mudanca.categoria,
        descricao: mudanca.descricao,
        tracosConhecidos: mudanca.tracosConhecidos,
        criadaEm: Date.now(),
      };
      dados.criaturas.push(nova);
      registrar(mudanca.tipo, `Nova criatura no bestiário: ${mudanca.nome}`, {
        forma: "lista",
        lista: "criaturas",
        identificador: nova.nome,
        antes: null,
      });
      continue;
    }

    if (mudanca.tipo === "diario_add") {
      const nova = { id: gerarId(), titulo: mudanca.titulo, resumo: mudanca.resumo, eventos: mudanca.eventos, criadaEm: Date.now() };
      dados.diario.push(nova);
      registrar(mudanca.tipo, `Novo diário: ${mudanca.titulo}`, { forma: "lista", lista: "diario", identificador: nova.id, antes: null });
      continue;
    }
  }

  return { dados, resumos };
}

/*
  Desfaz um evento específico (regra #44: undo cria o efeito inverso, nunca
  apaga o evento original — regra #12). Não faz nada se o evento não existir
  ou já tiver sido revertido; a UI já deveria esconder o botão nesse caso,
  isto é o cinto de segurança.
*/
export function desfazerEvento(atual: PersonagemLivre, eventoId: string): PersonagemLivre {
  const evento = atual.eventos.find((e) => e.id === eventoId);
  if (!evento || evento.revertido) return atual;

  const dados: PersonagemLivre = {
    ...atual,
    eventos: atual.eventos.map((e) => (e.id === eventoId ? { ...e, revertido: true } : e)),
  };

  const alvo = evento.alvo;

  if (alvo.forma === "raiz") {
    dados[alvo.campo] = alvo.antes;
    return dados;
  }

  if (alvo.forma === "mapa") {
    const mapa = { ...dados[alvo.mapa] } as Record<string, unknown>;
    if (alvo.antes === null) delete mapa[alvo.chave];
    else mapa[alvo.chave] = alvo.antes;
    if (alvo.mapa === "recursos") dados.recursos = mapa as PersonagemLivre["recursos"];
    else if (alvo.mapa === "atributos") dados.atributos = mapa as PersonagemLivre["atributos"];
    else dados.moedas = mapa as PersonagemLivre["moedas"];
    return dados;
  }

  // forma === "lista"
  const identificadorNormalizado = alvo.identificador.trim().toLowerCase();

  if (alvo.lista === "inventario") {
    const lista = [...dados.inventario];
    const idx = lista.findIndex((i) => i.nome.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.inventario = lista;
  } else if (alvo.lista === "notas") {
    const lista = [...dados.notas];
    const idx = lista.findIndex((n) => n.titulo.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.notas = lista;
  } else if (alvo.lista === "missoes") {
    const lista = [...dados.missoes];
    const idx = lista.findIndex((m) => m.nome.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.missoes = lista;
  } else if (alvo.lista === "npcs") {
    const lista = [...dados.npcs];
    const idx = lista.findIndex((n) => n.nome.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.npcs = lista;
  } else if (alvo.lista === "descobertas") {
    const lista = [...dados.descobertas];
    const idx = lista.findIndex((d) => d.titulo.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.descobertas = lista;
  } else if (alvo.lista === "codex") {
    const lista = [...dados.codex];
    const idx = lista.findIndex((c) => c.titulo.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.codex = lista;
  } else if (alvo.lista === "locais") {
    const lista = [...dados.locais];
    const idx = lista.findIndex((l) => l.nome.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.locais = lista;
  } else if (alvo.lista === "criaturas") {
    const lista = [...dados.criaturas];
    const idx = lista.findIndex((c) => c.nome.trim().toLowerCase() === identificadorNormalizado);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.criaturas = lista;
  } else {
    // diario — identidade é o próprio id gerado, não um nome/título de campanha
    const lista = [...dados.diario];
    const idx = lista.findIndex((e) => e.id === alvo.identificador);
    if (alvo.antes === null) {
      if (idx >= 0) lista.splice(idx, 1);
    } else if (idx >= 0) lista[idx] = alvo.antes;
    else lista.push(alvo.antes);
    dados.diario = lista;
  }

  return dados;
}
