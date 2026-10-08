CREATE TABLE IF NOT EXISTS "hogwarts_casa_pontos_eventos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "campanhaId" UUID NOT NULL,
  "atorId" UUID,
  "casa" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "motivo" TEXT NOT NULL,
  "sessao" TEXT,
  "reversaoDeId" UUID,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hogwarts_casa_pontos_eventos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hogwarts_casa_pontos_eventos_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE,
  CONSTRAINT "hogwarts_casa_pontos_eventos_atorId_fkey" FOREIGN KEY ("atorId") REFERENCES "usuarios"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "hogwarts_casa_pontos_eventos_reversaoDeId_key"
  ON "hogwarts_casa_pontos_eventos"("reversaoDeId");
CREATE INDEX IF NOT EXISTS "hogwarts_casa_pontos_eventos_campanhaId_casa_criadoEm_idx"
  ON "hogwarts_casa_pontos_eventos"("campanhaId", "casa", "criadoEm");
