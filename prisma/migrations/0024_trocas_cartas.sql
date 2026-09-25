-- Decisão #163: Troca de carta de Sapo de Chocolate entre dois
-- personagens da mesma campanha.
--
-- Mesma convenção das migrações 0018/0019/0023: cada instrução numa
-- linha só. Seguro rodar mais de uma vez.

CREATE TABLE IF NOT EXISTS "trocas_cartas" ("id" uuid NOT NULL, "campanhaId" uuid NOT NULL, "personagemOfertaId" uuid NOT NULL, "cartaOferecidaId" text NOT NULL, "cartaDesejadaId" text NOT NULL, "estado" text NOT NULL DEFAULT 'aberta', "personagemAceitouId" uuid, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), "atualizadoEm" timestamp(3) NOT NULL, CONSTRAINT "trocas_cartas_pkey" PRIMARY KEY ("id"));

ALTER TABLE "trocas_cartas" ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS "trocas_cartas_campanhaId_idx" ON "trocas_cartas" ("campanhaId");
CREATE INDEX IF NOT EXISTS "trocas_cartas_personagemOfertaId_idx" ON "trocas_cartas" ("personagemOfertaId");

DO $$ BEGIN ALTER TABLE "trocas_cartas" ADD CONSTRAINT "trocas_cartas_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "trocas_cartas" ADD CONSTRAINT "trocas_cartas_personagemOfertaId_fkey" FOREIGN KEY ("personagemOfertaId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
