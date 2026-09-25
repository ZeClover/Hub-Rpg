/*
  Atalhos pra abrir uma ficha direto num módulo específico (decisão #168)
  — ex.: "Acadêmico" já abre a ficha na aba de Acadêmico, sem o mestre ou
  o jogador precisar abrir a ficha inteira e clicar na aba manualmente.
  Só existe quando o sistema declara `modulosFicha` (hoje só o Hogwarts
  RPG); pra qualquer outro sistema isso continua exatamente como sempre
  foi — um único link pra ficha inteira.
*/
export function ModulosFicha({
  ficha,
  personagemId,
  modulos,
}: {
  ficha: string;
  personagemId: string;
  modulos: { id: string; rotulo: string }[];
}) {
  if (modulos.length === 0) return null;

  return (
    <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
      {modulos.map((modulo) => (
        <li key={modulo.id}>
          <a
            href={`${ficha}?id=${personagemId}&aba=${modulo.id}`}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-2 hover:text-ambar-forte"
          >
            {modulo.rotulo}
          </a>
        </li>
      ))}
    </ul>
  );
}
