/*
  A trava do projeto (decisão #13), aplicada a personagens.

  Assim como `visibilidade.ts` decide o que sai de dentro de uma ficha, esta
  função decide quem pode ver ou editar a ficha inteira. O dono sempre pode
  tudo. Além dele, o mestre de uma campanha pode LER (nunca editar) a ficha
  de um personagem ligado àquela campanha — por isso a função só recebe a
  lista de campanhas onde quem pergunta é mestre, em vez de consultar o banco
  ela mesma: fica pura e fácil de testar, e quem chama decide quando vale a
  pena buscar essa lista (a maioria das leituras é do próprio dono, e nem
  precisa dela).
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
