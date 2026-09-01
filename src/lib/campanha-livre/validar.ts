/*
  Segunda passada de validação: o parser (parser.ts) só olha pro texto —
  não sabe se "Poção Pequena" existe no inventário deste personagem. Esta
  função cruza as mudanças já interpretadas com a ficha atual, adicionando
  os alertas que dependem de estado (exemplos #26 e #27 do pacote de
  exemplos: mana insuficiente vira warning, remover item inexistente vira
  error e não é aplicado).

  Não muta as mudanças recebidas — devolve uma cópia com alertas extras.

  `projetado` (opcional, default = `atual`): resolve dependências dentro do
  MESMO bloco HUB_UPDATE — ex. `npcs_add: Mira` seguido de
  `relationships: npc: Mira` no mesmo import. Quem chama monta esse estado
  projetado aplicando (via `aplicarMudancas`) só as mudanças atualmente
  selecionadas no preview; como isso é reativo ao que está marcado, marcar/
  desmarcar o "Novo NPC: Mira" muda `projetado` e portanto revalida a
  dependência automaticamente — ver `ImportarDoChat` em
  `src/app/campanha-livre/importar-do-chat.tsx`. Checagens de existência
  usam `projetado`; checagens numéricas (recurso indo negativo, etc.) usam
  `atual`, porque são sobre o efeito da PRÓPRIA mudança, não sobre o que
  outras mudanças do lote criaram.
*/
import type { Mudanca } from "./parser.ts";
import type { PersonagemLivre } from "./tipos.ts";

export function validarContraPersonagem(mudancas: Mudanca[], atual: PersonagemLivre, projetado: PersonagemLivre = atual): Mudanca[] {
  return mudancas.map((mudanca) => {
    if (mudanca.tipo === "item_remove") {
      const existente = projetado.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (!existente) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `"${mudanca.nome}" não está no inventário — não dá pra remover.` },
          ],
        };
      }
      if (existente.quantidade < mudanca.quantidade) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "warning" as const,
              mensagem: `Só há ${existente.quantidade}x "${mudanca.nome}" — a remoção vai zerar o item, não deixar negativo.`,
            },
          ],
        };
      }
    }

    if (mudanca.tipo === "recurso" && mudanca.operacao === "change") {
      const existente = atual.recursos[mudanca.nome];
      const antes = existente?.atual ?? 0;
      const depois = antes + mudanca.valor;
      const minimo = existente?.minimo ?? null;
      const maximo = existente?.maximo ?? null;
      // Sem mínimo configurado pela campanha, o Hub ainda avisa se ficar negativo — só não bloqueia.
      if (minimo != null && depois < minimo) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "warning" as const,
              mensagem: `Abaixo do mínimo (${minimo}): ${antes} ${mudanca.valor >= 0 ? "+" : ""}${mudanca.valor} = ${depois}.`,
            },
          ],
        };
      }
      if (minimo == null && depois < 0) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "warning" as const,
              mensagem: `Vai ficar negativo: ${antes} ${mudanca.valor >= 0 ? "+" : ""}${mudanca.valor} = ${depois}.`,
            },
          ],
        };
      }
      if (maximo != null && depois > maximo) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "warning" as const,
              mensagem: `Passa do máximo (${maximo}): ficaria em ${depois}.`,
            },
          ],
        };
      }
    }

    if (mudanca.tipo === "item_update") {
      const existente = projetado.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (!existente) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `"${mudanca.nome}" não está no inventário — não dá pra atualizar.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "equipamento") {
      const existente = projetado.inventario.find(
        (item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase(),
      );
      if (!existente) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "error" as const,
              mensagem: `"${mudanca.nome}" não está no inventário — não dá pra ${mudanca.acao === "equipar" ? "equipar" : "desequipar"}.`,
            },
          ],
        };
      }
    }

    if (mudanca.tipo === "missao_update") {
      const missao = projetado.missoes.find((m) => m.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!missao) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Missão "${mudanca.nome}" não existe — crie com missions_add primeiro.` },
          ],
        };
      }
      if (
        ["complete_objective", "fail_objective", "reopen_objective"].includes(mudanca.acao) &&
        mudanca.objetivo &&
        !missao.objetivos.some((o) => o.texto.trim().toLowerCase() === mudanca.objetivo!.trim().toLowerCase())
      ) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Objetivo "${mudanca.objetivo}" não existe na missão "${mudanca.nome}".` },
          ],
        };
      }
    }

    if (mudanca.tipo === "npc_update") {
      const existe = projetado.npcs.some((n) => n.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `NPC "${mudanca.nome}" não existe — crie com npcs_add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "relacao") {
      const existe = projetado.npcs.some((n) => n.nome.trim().toLowerCase() === mudanca.npc.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `NPC "${mudanca.npc}" não existe — crie com npcs_add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "nota_update" || mudanca.tipo === "nota_remove") {
      const titulo = mudanca.titulo;
      const idNota = mudanca.tipo === "nota_remove" ? mudanca.idNota : undefined;
      const existente = titulo
        ? projetado.notas.find((n) => n.titulo.trim().toLowerCase() === titulo.trim().toLowerCase())
        : idNota
          ? projetado.notas.find((n) => n.id === idNota)
          : undefined;
      if (!existente) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Colinha "${titulo ?? idNota}" não existe.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "descoberta_update") {
      const existe = projetado.descobertas.some((d) => d.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Descoberta "${mudanca.titulo}" não existe — crie com discoveries_add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "local_update") {
      const existe = projetado.locais.some((l) => l.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Local "${mudanca.nome}" não existe — crie com locations_add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "moeda" && mudanca.operacao === "change") {
      const antes = atual.moedas[mudanca.nome] ?? 0;
      const depois = antes + mudanca.valor;
      if (depois < 0) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "warning" as const,
              mensagem: `Vai ficar negativo: ${antes} ${mudanca.valor >= 0 ? "+" : ""}${mudanca.valor} = ${depois}.`,
            },
          ],
        };
      }
    }

    if (mudanca.tipo === "modificador_remove") {
      const existe = projetado.modificadoresTemporarios.some((m) => m.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Modificador "${mudanca.nome}" não existe.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "condicao_remove" || mudanca.tipo === "condicao_update") {
      const existe = projetado.condicoes.some((c) => c.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Condição "${mudanca.nome}" não existe — crie com conditions.add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "magia_update" || mudanca.tipo === "magia_descoberta") {
      const nomeMagia = mudanca.tipo === "magia_update" ? mudanca.nome : mudanca.magia;
      const existe = projetado.magias.some((m) => m.nome.trim().toLowerCase() === nomeMagia.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Magia "${nomeMagia}" não existe — crie com spells_add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "pesquisa_update") {
      const existe = projetado.pesquisas.some((p) => p.titulo.trim().toLowerCase() === mudanca.titulo.trim().toLowerCase());
      if (!existe) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            { nivel: "error" as const, mensagem: `Pesquisa "${mudanca.titulo}" não existe — crie com research_add primeiro.` },
          ],
        };
      }
    }

    if (mudanca.tipo === "reputacao" && mudanca.operacao === "change") {
      const antes = atual.reputacao[mudanca.alvo] ?? 0;
      const depois = antes + mudanca.valor;
      if (depois < 0) {
        return {
          ...mudanca,
          alertas: [
            ...mudanca.alertas,
            {
              nivel: "warning" as const,
              mensagem: `Vai ficar negativa: ${antes} ${mudanca.valor >= 0 ? "+" : ""}${mudanca.valor} = ${depois}.`,
            },
          ],
        };
      }
    }

    return mudanca;
  });
}

/** Uma mudança com alerta de erro nunca deve ser aplicada, mesmo marcada. */
export function temErro(mudanca: Mudanca): boolean {
  return mudanca.alertas.some((a) => a.nivel === "error");
}
