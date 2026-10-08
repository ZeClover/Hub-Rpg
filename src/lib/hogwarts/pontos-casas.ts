export const CASAS_HOGWARTS = ["Grifinória", "Sonserina", "Corvinal", "Lufa-Lufa"] as const;
export type CasaHogwarts = typeof CASAS_HOGWARTS[number];

export type EventoPontoCasa = { casa: string; delta: number };

export function validarEventoPontoCasa(casa: unknown, delta: unknown, motivo: unknown) {
  if (!CASAS_HOGWARTS.includes(casa as CasaHogwarts)) throw new Error("Casa inválida.");
  const pontos = Number(delta);
  if (!Number.isInteger(pontos) || pontos === 0 || Math.abs(pontos) > 1000) {
    throw new Error("Informe uma quantidade inteira entre -1000 e 1000, diferente de zero.");
  }
  const justificativa = String(motivo ?? "").trim();
  if (justificativa.length < 3 || justificativa.length > 240) {
    throw new Error("O motivo deve ter entre 3 e 240 caracteres.");
  }
  return { casa: casa as CasaHogwarts, delta: pontos, motivo: justificativa };
}

export function somarPontosCasas(eventos: EventoPontoCasa[]) {
  const totais = Object.fromEntries(CASAS_HOGWARTS.map((casa) => [casa, 0])) as Record<CasaHogwarts, number>;
  for (const evento of eventos) if (CASAS_HOGWARTS.includes(evento.casa as CasaHogwarts)) totais[evento.casa as CasaHogwarts] += evento.delta;
  return totais;
}
