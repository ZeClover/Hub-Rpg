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

/*
  A mesma trava, aplicada ao `dados` de um Personagem (decisão #159).

  Cada sistema (Fabula Ultima, Hogwarts RPG, SAO...) guarda a ficha inteira
  num único campo `dados` (JSON livre — decisão #17: o Hub não conhece a
  forma de cada sistema). Isso não dava pra reaproveitar `filtrarCampos`
  direto, que espera uma lista de campos com `visibilidade` já separados.

  A convenção: se o sistema quiser guardar algo que só o Mestre pode ver
  (notas do Mestre, propriedade oculta de Varinha, Segredo Familiar,
  informação real de um Dom Latente...), ele guarda dentro de uma chave
  reservada `dados._mestre` — o Hub não precisa saber o que tem lá dentro,
  só que essa chave nunca sai do servidor pra quem não é confirmadamente o
  Mestre daquela campanha. É a mesma regra da decisão #13, só que a unidade
  filtrada agora é "uma chave dentro do JSON" em vez de "um campo de
  Entidade".

  Não é responsabilidade desta função decidir QUEM é mestre — isso já é
  resolvido por `podeAcessarPersonagem`/quem chama a rota. Esta função só
  aplica o corte, de um jeito genérico o bastante pra qualquer sistema usar
  sem o Hub precisar conhecer sua estrutura interna.
*/
export function semSegredosDeMestre(dados: unknown): unknown {
  if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
    return dados;
  }
  if (!("_mestre" in dados)) return dados;
  return Object.fromEntries(
    Object.entries(dados as Record<string, unknown>).filter(([chave]) => chave !== "_mestre"),
  );
}
