/*
  Transforma um nome em "slug" — a versão dele que aparece no endereço do
  navegador. "Darkrem, o Véu Partido" vira "darkrem-o-veu-partido".

  Por que não usar o nome direto no endereço: acento e espaço viram códigos
  ilegíveis (%C3%A9), e o link fica impossível de ler ou mandar pra alguém.
*/
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD") // separa a letra do acento: "é" vira "e" + "´"
    .replace(/[\u0300-\u036f]/g, "") // joga o acento fora
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // tudo que não é letra ou número vira hífen
    .replace(/^-+|-+$/g, "") // tira hífen sobrando nas pontas
    .slice(0, 60);
}
