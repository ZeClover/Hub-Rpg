/*
  Segunda passada de validação: o parser (parser.ts) só olha pro texto —
  não sabe se "Poção Pequena" existe no inventário deste personagem. Esta
  função cruza as mudanças já interpretadas com a ficha atual, adicionando
  os alertas que dependem de estado (exemplos #26 e #27 do pacote de
  exemplos: mana insuficiente vira warning, remover item inexistente vira
  error e não é aplicado).

  Não muta as mudanças recebidas — devolve uma cópia com alertas extras.
*/
import type { Mudanca } from "./parser.ts";
import type { PersonagemLivre } from "./tipos.ts";

export function validarContraPersonagem(mudancas: Mudanca[], atual: PersonagemLivre): Mudanca[] {
  return mudancas.map((mudanca) => {
    if (mudanca.tipo === "item_remove") {
      const existente = atual.inventario.find(
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
      if (existente) {
        const depois = existente.atual + mudanca.valor;
        if (depois < 0) {
          return {
            ...mudanca,
            alertas: [
              ...mudanca.alertas,
              {
                nivel: "warning" as const,
                mensagem: `Vai ficar negativo: ${existente.atual} ${mudanca.valor >= 0 ? "+" : ""}${mudanca.valor} = ${depois}.`,
              },
            ],
          };
        }
        if (existente.maximo != null && depois > existente.maximo) {
          return {
            ...mudanca,
            alertas: [
              ...mudanca.alertas,
              {
                nivel: "warning" as const,
                mensagem: `Passa do máximo (${existente.maximo}): ficaria em ${depois}.`,
              },
            ],
          };
        }
      }
    }

    if (mudanca.tipo === "item_update") {
      const existente = atual.inventario.find(
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
      const existente = atual.inventario.find(
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

    return mudanca;
  });
}

/** Uma mudança com alerta de erro nunca deve ser aplicada, mesmo marcada. */
export function temErro(mudanca: Mudanca): boolean {
  return mudanca.alertas.some((a) => a.nivel === "error");
}
