CREATE TABLE IF NOT EXISTS "hogwarts_familias" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "campanhaId" UUID NOT NULL,
  "chave" TEXT NOT NULL, "nome" TEXT NOT NULL, "tipo" TEXT NOT NULL,
  "condicaoFinanceira" TEXT NOT NULL, "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "conteudoFamiliar" TEXT NOT NULL, "acessoFamiliar" TEXT NOT NULL,
  "herancas" JSONB NOT NULL DEFAULT '[]', "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hogwarts_familias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hogwarts_familias_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "hogwarts_familias_campanhaId_chave_key" ON "hogwarts_familias"("campanhaId", "chave");
CREATE INDEX IF NOT EXISTS "hogwarts_familias_campanhaId_nome_idx" ON "hogwarts_familias"("campanhaId", "nome");

CREATE TABLE IF NOT EXISTS "hogwarts_familias_membros" (
  "familiaId" UUID NOT NULL, "personagemId" UUID NOT NULL, "ligadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hogwarts_familias_membros_pkey" PRIMARY KEY ("familiaId", "personagemId"),
  CONSTRAINT "hogwarts_familias_membros_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "hogwarts_familias"("id") ON DELETE CASCADE,
  CONSTRAINT "hogwarts_familias_membros_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "hogwarts_familias_membros_personagemId_key" ON "hogwarts_familias_membros"("personagemId");

CREATE TABLE IF NOT EXISTS "hogwarts_familias_segredos" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "familiaId" UUID NOT NULL, "nome" TEXT NOT NULL,
  "descricao" TEXT NOT NULL, "reveladoEm" TIMESTAMP(3), "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hogwarts_familias_segredos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hogwarts_familias_segredos_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "hogwarts_familias"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "hogwarts_familias_segredos_familiaId_reveladoEm_idx" ON "hogwarts_familias_segredos"("familiaId", "reveladoEm");

CREATE TABLE IF NOT EXISTS "hogwarts_herancas_personagens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "personagemId" UUID NOT NULL, "familiaId" UUID NOT NULL,
  "nivel" INTEGER NOT NULL DEFAULT 0, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hogwarts_herancas_personagens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hogwarts_herancas_personagens_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE CASCADE,
  CONSTRAINT "hogwarts_herancas_personagens_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "hogwarts_familias"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "hogwarts_herancas_personagens_personagemId_key" ON "hogwarts_herancas_personagens"("personagemId");
CREATE INDEX IF NOT EXISTS "hogwarts_herancas_personagens_familiaId_nivel_idx" ON "hogwarts_herancas_personagens"("familiaId", "nivel");
