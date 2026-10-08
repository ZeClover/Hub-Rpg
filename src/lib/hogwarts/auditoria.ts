import type { Prisma } from "@prisma/client";
import { banco } from "@/lib/banco";

let fundacaoPronta: Promise<void> | null = null;

/**
 * O executor de migrations não alcança o Supabase no build da Vercel, mas o
 * cliente da aplicação alcança. Esta criação idempotente mantém o deploy
 * seguro até a conexão direta voltar a estar disponível.
 */
export function garantirFundacaoHogwarts(): Promise<void> {
  if (!fundacaoPronta) {
    fundacaoPronta = (async () => {
      await banco.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "eventos_auditoria_hogwarts" (
          "id" UUID NOT NULL DEFAULT gen_random_uuid(), "campanhaId" UUID NOT NULL,
          "personagemId" UUID, "atorId" UUID, "modulo" TEXT NOT NULL,
          "acao" TEXT NOT NULL, "resumo" TEXT NOT NULL, "detalhes" JSONB,
          "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "eventos_auditoria_hogwarts_pkey" PRIMARY KEY ("id")
        );
        CREATE INDEX IF NOT EXISTS "eventos_auditoria_hogwarts_campanhaId_criadoEm_idx"
          ON "eventos_auditoria_hogwarts"("campanhaId", "criadoEm");
        CREATE INDEX IF NOT EXISTS "eventos_auditoria_hogwarts_personagemId_criadoEm_idx"
          ON "eventos_auditoria_hogwarts"("personagemId", "criadoEm");
      `);
      await banco.$executeRawUnsafe(`
        DO $$ BEGIN ALTER TABLE "eventos_auditoria_hogwarts"
          ADD CONSTRAINT "eventos_auditoria_hogwarts_campanhaId_fkey"
          FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN ALTER TABLE "eventos_auditoria_hogwarts"
          ADD CONSTRAINT "eventos_auditoria_hogwarts_personagemId_fkey"
          FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN ALTER TABLE "eventos_auditoria_hogwarts"
          ADD CONSTRAINT "eventos_auditoria_hogwarts_atorId_fkey"
          FOREIGN KEY ("atorId") REFERENCES "usuarios"("id") ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `);
    })().catch((erro) => {
      fundacaoPronta = null;
      throw erro;
    });
  }
  return fundacaoPronta;
}

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
  return garantirFundacaoHogwarts().then(() => banco.eventoAuditoriaHogwarts.create({
    data: {
      campanhaId: evento.campanhaId,
      personagemId: evento.personagemId ?? null,
      atorId: evento.atorId ?? null,
      modulo: evento.modulo,
      acao: evento.acao,
      resumo: evento.resumo,
      ...(evento.detalhes === undefined ? {} : { detalhes: evento.detalhes }),
    },
  }));
}
