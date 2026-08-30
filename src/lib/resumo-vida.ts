/*
  Leitura/escrita do resumo de vida que toda ficha de personagem passou a
  espelhar em `dados.resumoVida` a cada salvamento (decisão #46) — pra o
  Painel de Vida da Mesa ao Vivo conseguir mostrar "quanto de vida cada um
  tem" sem o Hub precisar conhecer a fórmula de nenhum sistema (decisão
  #17: regra de sistema fica no módulo, não espalhada pelo resto do
  código). O Hub só lê e, pra inimigo, ajusta este número — nunca calcula
  vida máxima sozinho.
*/

export type ResumoVida = {
  atual: number;
  maxima: number;
  rotulo: string;
};

/*
  `dados` é um JSON livre (decisão #17) — antes de confiar no que tem
  dentro de `resumoVida`, confere que os três campos existem e são do tipo
  certo. Uma ficha nunca aberta, ou salva antes desta decisão, não tem
  este campo: devolve `null`, e quem chama trata como "vida desconhecida".
*/
export function lerResumoVida(dados: unknown): ResumoVida | null {
  if (typeof dados !== "object" || dados === null) return null;
  const resumo = (dados as Record<string, unknown>).resumoVida;
  if (typeof resumo !== "object" || resumo === null) return null;
  const { atual, maxima, rotulo } = resumo as Record<string, unknown>;
  if (typeof atual !== "number" || typeof maxima !== "number" || typeof rotulo !== "string") {
    return null;
  }
  return { atual, maxima, rotulo };
}

/// Aplica um ajuste (positivo ou negativo) sem deixar a vida sair de [0, máxima].
export function vidaComDelta(resumo: ResumoVida, delta: number): number {
  return Math.max(0, Math.min(resumo.maxima, resumo.atual + delta));
}

/*
  Escreve um valor num caminho aninhado dentro de `dados` — o "campo de
  verdade" que a ficha de inimigo daquele sistema lê ao abrir (ver
  `campoVidaInimigo` em `sistemas.ts`). Cria os objetos intermediários que
  faltarem: uma ficha de inimigo nova, criada pelo botão "+ Adicionar
  ficha de inimigo" mas nunca aberta, ainda não tem `atual: {}`.
*/
export function escreverNoCaminho(
  dados: Record<string, unknown>,
  caminho: string[],
  valor: number,
): void {
  let alvo: Record<string, unknown> = dados;
  for (let i = 0; i < caminho.length - 1; i++) {
    const chave = caminho[i];
    if (typeof alvo[chave] !== "object" || alvo[chave] === null) {
      alvo[chave] = {};
    }
    alvo = alvo[chave] as Record<string, unknown>;
  }
  alvo[caminho[caminho.length - 1]] = valor;
}
