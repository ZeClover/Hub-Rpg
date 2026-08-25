import { gerarSlug } from "@/lib/texto";

/*
  Garante que o slug não colida com um já existente.

  Se "porto-cinza" já existe, tenta "porto-cinza-2", depois "porto-cinza-3", e
  assim por diante. O `jaExiste` é passado de fora porque cada tabela consulta
  um lugar diferente.
*/
export async function slugUnico(
  nome: string,
  jaExiste: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = gerarSlug(nome) || "sem-nome";

  if (!(await jaExiste(base))) return base;

  for (let sufixo = 2; sufixo <= 50; sufixo++) {
    const tentativa = `${base}-${sufixo}`;
    if (!(await jaExiste(tentativa))) return tentativa;
  }

  // Saída de emergência: improvável, mas melhor que travar o cadastro.
  return `${base}-${Date.now().toString(36)}`;
}
