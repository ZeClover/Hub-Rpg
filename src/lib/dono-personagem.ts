/*
  A trava do projeto (decisão #13), aplicada a personagens.

  Assim como `visibilidade.ts` decide o que sai de dentro de uma ficha, esta
  função decide quem pode ver ou editar a ficha inteira. Hoje a regra é a mais
  simples possível — só o dono acessa — porque campanhas (mestre enxergando a
  ficha da mesa) ainda não existem no Hub. Quando existirem, é aqui que a
  exceção entra, num lugar só, testado.
*/

export type PersonagemComDono = { donoId: string };

export function podeAcessarPersonagem(
  idDoUsuario: string,
  personagem: PersonagemComDono,
): boolean {
  return personagem.donoId === idDoUsuario;
}
