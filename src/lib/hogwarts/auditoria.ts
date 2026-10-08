import type { Prisma } from "@prisma/client";
import { banco } from "@/lib/banco";

export type NovoEventoHogwarts = {
  campanhaId: string;
  personagemId?: string | null;
  atorId?: string | null;
  modulo: string;
  acao: string;
  resumo: string;
  detalhes?: Prisma.InputJsonValue;
};

/** Registra somente metadados seguros; segredos de Mestre ficam fora daqui. */
export function registrarEventoHogwarts(evento: NovoEventoHogwarts) {
  return banco.eventoAuditoriaHogwarts.create({
    data: {
      campanhaId: evento.campanhaId,
      personagemId: evento.personagemId ?? null,
      atorId: evento.atorId ?? null,
      modulo: evento.modulo,
      acao: evento.acao,
      resumo: evento.resumo,
      ...(evento.detalhes === undefined ? {} : { detalhes: evento.detalhes }),
    },
  });
}
