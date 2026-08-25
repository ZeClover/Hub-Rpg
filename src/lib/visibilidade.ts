/*
  A TRAVA DO PROJETO (decisão #13), em forma pura.

  Este arquivo não importa nada — nem banco, nem framework. É de propósito:
  a regra que decide o que sai do servidor precisa ser simples o bastante para
  caber na cabeça e ser testada sozinha, sem subir aplicação nenhuma.

  Todo campo de ficha carrega uma etiqueta: público ou só-mestre. Esta é a
  única função do Hub autorizada a decidir o que sai. Nenhuma tela filtra por
  conta própria.

  Por que não esconder na tela: o dado já teria saído do servidor. Qualquer
  pessoa consegue abrir as ferramentas do navegador e ler o que a página
  recebeu, mesmo que ela não desenhe aquilo na tela. Esconder não é proteger.
*/

export type Visibilidade = "PUBLICO" | "MESTRE";

export function filtrarCampos<T extends { visibilidade: Visibilidade }>(
  campos: readonly T[],
  podeVerSegredos: boolean,
): T[] {
  if (podeVerSegredos) return [...campos];
  return campos.filter((campo) => campo.visibilidade === "PUBLICO");
}
