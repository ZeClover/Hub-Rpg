CREATE TABLE IF NOT EXISTS "colecionaveis" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "campanhaId" UUID NOT NULL REFERENCES "campanhas"("id") ON DELETE CASCADE,
 "categoria" TEXT NOT NULL CHECK ("categoria" IN ('sapos','paginas','reliquias','criaturas','curiosidades')),
 "nome" TEXT NOT NULL, "descricao" TEXT NOT NULL, "imagemUrl" TEXT,
 "retratoAnimado" BOOLEAN NOT NULL DEFAULT false, "repetivel" BOOLEAN NOT NULL DEFAULT false,
 "localizacaoMestre" TEXT NOT NULL DEFAULT '', "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "colecionaveis_id_campanhaId_key" UNIQUE ("id","campanhaId")
);
CREATE INDEX IF NOT EXISTS "colecionaveis_campanhaId_criadoEm_idx" ON "colecionaveis"("campanhaId","criadoEm");
CREATE TABLE IF NOT EXISTS "acervos_colecionaveis" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "personagemId" UUID NOT NULL REFERENCES "personagens"("id") ON DELETE CASCADE,
 "colecionavelId" UUID NOT NULL, "campanhaId" UUID NOT NULL REFERENCES "campanhas"("id") ON DELETE CASCADE,
 "quantidade" INTEGER NOT NULL DEFAULT 1 CHECK ("quantidade" BETWEEN 1 AND 999),
 "descobertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "acervos_colecionaveis_item_campanha_fkey" FOREIGN KEY ("colecionavelId","campanhaId") REFERENCES "colecionaveis"("id","campanhaId") ON DELETE CASCADE,
 CONSTRAINT "acervos_colecionaveis_personagemId_colecionavelId_key" UNIQUE ("personagemId","colecionavelId")
);
CREATE INDEX IF NOT EXISTS "acervos_colecionaveis_campanhaId_personagemId_idx" ON "acervos_colecionaveis"("campanhaId","personagemId");
CREATE TABLE IF NOT EXISTS "concessoes_colecionaveis" (
 "operacaoId" UUID PRIMARY KEY, "personagemId" UUID NOT NULL REFERENCES "personagens"("id") ON DELETE CASCADE,
 "colecionavelId" UUID NOT NULL, "campanhaId" UUID NOT NULL REFERENCES "campanhas"("id") ON DELETE CASCADE,
 "quantidade" INTEGER NOT NULL CHECK ("quantidade" BETWEEN 1 AND 99), "concedidoPorId" UUID NOT NULL,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "concessoes_colecionaveis_item_campanha_fkey" FOREIGN KEY ("colecionavelId","campanhaId") REFERENCES "colecionaveis"("id","campanhaId") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "concessoes_colecionaveis_campanhaId_personagemId_criadoEm_idx" ON "concessoes_colecionaveis"("campanhaId","personagemId","criadoEm");
ALTER TABLE "colecionaveis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "acervos_colecionaveis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "concessoes_colecionaveis" ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON "colecionaveis","acervos_colecionaveis","concessoes_colecionaveis" FROM anon; END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON "colecionaveis","acervos_colecionaveis","concessoes_colecionaveis" FROM authenticated; END IF;
END $$;
