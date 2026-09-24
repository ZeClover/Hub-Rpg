-- Campos personalizados da campanha + conquistas da campanha (decisão
-- #140) — extras que o mestre gerencia, visíveis a qualquer participante.
--
-- Só tabelas novas — nada muda no comportamento de campanha, ficha ou
-- sessão existente.
--
-- Cada instrução numa linha só, de propósito: um CREATE TABLE quebrado em
-- várias linhas já mostrou (migração 0017) que o caminho de colar no SQL
-- Editor do Supabase pode perder a quebra de linha no meio da instrução e
-- gerar "CREATE TABLE ... (;" — sintaxe quebrada sem nenhuma coluna.
--
-- É seguro rodar mais de uma vez.

DO $$ BEGIN CREATE TYPE "TipoCampoPersonalizado" AS ENUM ('TEXTO', 'NUMERO', 'CONTADOR', 'BOOLEANO'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "campos_personalizados" ("id" uuid NOT NULL, "campanhaId" uuid NOT NULL, "nome" text NOT NULL, "tipo" "TipoCampoPersonalizado" NOT NULL, "valorTexto" text, "valorNumero" double precision, "valorBooleano" boolean, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), "atualizadoEm" timestamp(3) NOT NULL, CONSTRAINT "campos_personalizados_pkey" PRIMARY KEY ("id"));

ALTER TABLE "campos_personalizados" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN ALTER TABLE "campos_personalizados" ADD CONSTRAINT "campos_personalizados_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "campos_personalizados_campanhaId_idx" ON "campos_personalizados" ("campanhaId");

CREATE TABLE IF NOT EXISTS "conquistas_campanha" ("id" uuid NOT NULL, "campanhaId" uuid NOT NULL, "titulo" text NOT NULL, "descricao" text, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "conquistas_campanha_pkey" PRIMARY KEY ("id"));

ALTER TABLE "conquistas_campanha" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN ALTER TABLE "conquistas_campanha" ADD CONSTRAINT "conquistas_campanha_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "conquistas_campanha_campanhaId_idx" ON "conquistas_campanha" ("campanhaId");
