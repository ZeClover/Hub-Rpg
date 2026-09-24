-- Decisão #147: grupos/equipes dentro da campanha, itens genéricos
-- (biblioteca pessoal / inventário de grupo / cofre da campanha),
-- companheiros/pets como vínculo entre fichas, e veículos genéricos.
--
-- Cada instrução numa linha só, de propósito (mesmo motivo da migração
-- 0018): um CREATE TABLE quebrado em várias linhas já mostrou que colar
-- no SQL Editor do Supabase pode perder a quebra de linha no meio da
-- instrução e gerar "CREATE TABLE ... (;" — sintaxe quebrada, sem
-- nenhuma coluna.
--
-- É seguro rodar mais de uma vez.

CREATE TABLE IF NOT EXISTS "grupos" ("id" uuid NOT NULL, "campanhaId" uuid NOT NULL, "nome" text NOT NULL, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "grupos_pkey" PRIMARY KEY ("id"));

CREATE INDEX IF NOT EXISTS "grupos_campanhaId_idx" ON "grupos" ("campanhaId");

DO $$ BEGIN ALTER TABLE "grupos" ADD CONSTRAINT "grupos_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "grupos_membros" ("id" uuid NOT NULL, "grupoId" uuid NOT NULL, "personagemId" uuid NOT NULL, CONSTRAINT "grupos_membros_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX IF NOT EXISTS "grupos_membros_grupoId_personagemId_key" ON "grupos_membros" ("grupoId", "personagemId");

CREATE INDEX IF NOT EXISTS "grupos_membros_personagemId_idx" ON "grupos_membros" ("personagemId");

DO $$ BEGIN ALTER TABLE "grupos_membros" ADD CONSTRAINT "grupos_membros_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "grupos_membros" ADD CONSTRAINT "grupos_membros_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "itens" ("id" uuid NOT NULL, "nome" text NOT NULL, "descricao" text, "quantidade" integer NOT NULL DEFAULT 1, "donoId" uuid, "personagemId" uuid, "grupoId" uuid, "campanhaId" uuid, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "itens_pkey" PRIMARY KEY ("id"));

CREATE INDEX IF NOT EXISTS "itens_donoId_idx" ON "itens" ("donoId");
CREATE INDEX IF NOT EXISTS "itens_personagemId_idx" ON "itens" ("personagemId");
CREATE INDEX IF NOT EXISTS "itens_grupoId_idx" ON "itens" ("grupoId");
CREATE INDEX IF NOT EXISTS "itens_campanhaId_idx" ON "itens" ("campanhaId");

DO $$ BEGIN ALTER TABLE "itens" ADD CONSTRAINT "itens_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "usuarios"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "itens" ADD CONSTRAINT "itens_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "itens" ADD CONSTRAINT "itens_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "itens" ADD CONSTRAINT "itens_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "companheiros" ("id" uuid NOT NULL, "personagemId" uuid NOT NULL, "companheiroId" uuid NOT NULL, CONSTRAINT "companheiros_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX IF NOT EXISTS "companheiros_personagemId_companheiroId_key" ON "companheiros" ("personagemId", "companheiroId");

CREATE INDEX IF NOT EXISTS "companheiros_companheiroId_idx" ON "companheiros" ("companheiroId");

DO $$ BEGIN ALTER TABLE "companheiros" ADD CONSTRAINT "companheiros_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "companheiros" ADD CONSTRAINT "companheiros_companheiroId_fkey" FOREIGN KEY ("companheiroId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "veiculos" ("id" uuid NOT NULL, "campanhaId" uuid NOT NULL, "donoId" uuid NOT NULL, "nome" text NOT NULL, "descricao" text, "capacidade" integer, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id"));

CREATE INDEX IF NOT EXISTS "veiculos_campanhaId_idx" ON "veiculos" ("campanhaId");
CREATE INDEX IF NOT EXISTS "veiculos_donoId_idx" ON "veiculos" ("donoId");

DO $$ BEGIN ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
