import type { TipoEntidade } from "@prisma/client";

/*
  Os tipos do cadastro base (decisão #11), com o nome que aparece na tela.

  A lista é fixa no banco em vez de texto livre para que a busca e os filtros
  não dependam de o Zé escrever "facção" sempre do mesmo jeito.
*/
export const TIPOS: { valor: TipoEntidade; rotulo: string; plural: string }[] = [
  { valor: "PERSONAGEM", rotulo: "Personagem", plural: "Personagens" },
  { valor: "NPC", rotulo: "NPC", plural: "NPCs" },
  { valor: "LUGAR", rotulo: "Lugar", plural: "Lugares" },
  { valor: "FACCAO", rotulo: "Facção", plural: "Facções" },
  { valor: "ITEM", rotulo: "Item", plural: "Itens" },
  { valor: "MAGIA", rotulo: "Magia", plural: "Magias" },
  { valor: "CRIATURA", rotulo: "Criatura", plural: "Criaturas" },
  { valor: "DIVINDADE", rotulo: "Divindade", plural: "Divindades" },
  { valor: "EVENTO", rotulo: "Evento", plural: "Eventos" },
  { valor: "FAMILIA", rotulo: "Família", plural: "Famílias" },
  { valor: "OUTRO", rotulo: "Outro", plural: "Outros" },
];

const porValor = new Map(TIPOS.map((tipo) => [tipo.valor, tipo]));

export function rotuloDoTipo(tipo: TipoEntidade): string {
  return porValor.get(tipo)?.rotulo ?? "Outro";
}

export function ehTipoValido(valor: string): valor is TipoEntidade {
  return porValor.has(valor as TipoEntidade);
}
