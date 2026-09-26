/*
  A trava do projeto (decisão #13), aplicada a personagens.

  Assim como `visibilidade.ts` decide o que sai de dentro de uma ficha, esta
  função decide quem pode ver OU EDITAR a ficha inteira. O dono sempre pode
  tudo. Além dele, o mestre de uma campanha também pode ler e editar a ficha
  de um personagem ligado àquela campanha (decisão #131 revogou a #50: antes
  o mestre só lia) — por isso a função só recebe a lista de campanhas onde
  quem pergunta é mestre, em vez de consultar o banco ela mesma: fica pura e
  fácil de testar, e quem chama decide quando vale a pena buscar essa lista
  (a maioria dos acessos é do próprio dono, e nem precisa dela). Quem pode
  ficar de fora — nunca o mestre — é excluir a ficha: isso continua exigindo
  ser o dono (rota DELETE usa uma checagem própria, mais estrita).
*/

export type PersonagemComDono = { donoId: string; campanhaId?: string | null };

export function podeAcessarPersonagem(
  idDoUsuario: string,
  personagem: PersonagemComDono,
  idsDeCampanhasOndeSouMestre: string[] = [],
): boolean {
  if (personagem.donoId === idDoUsuario) return true;
  return (
    personagem.campanhaId != null &&
    idsDeCampanhasOndeSouMestre.includes(personagem.campanhaId)
  );
}

/*
  Trocar o dono de uma ficha (decisão #172): o mestre (titular ou auxiliar)
  pode passar qualquer ficha da campanha pra qualquer participante dela, e o
  próprio dono pode passar a sua pra outro participante — jogador pra
  jogador tanto faz, é a mesma regra. `podeAcessarPersonagem` já decide QUEM
  pode pedir a troca (dono ou mestre); esta função decide se o DESTINO é
  válido: só existe uma lista de "gente que pode receber" quando a ficha
  está numa campanha (é a lista de participações dela) — ficha avulsa não
  tem pra quem passar, então nunca troca de dono aqui.
*/
export function podeReceberFicha(
  personagem: PersonagemComDono,
  novoDonoId: string,
  idsDosParticipantesDaCampanha: string[],
): boolean {
  if (personagem.campanhaId == null) return false;
  return idsDosParticipantesDaCampanha.includes(novoDonoId);
}
