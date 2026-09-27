-- Biblioteca do 1º ano de Hogwarts. O catálogo é sincronizado por
-- (sistemaId, slug), portanto executar a sincronização mais de uma vez não
-- duplica registros. Customizações de campanha vivem separadas.

CREATE TABLE IF NOT EXISTS "conteudos_sistema" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sistemaId" uuid NOT NULL, "slug" text NOT NULL, "nome" text NOT NULL, "categoria" text NOT NULL, "pericia" text NOT NULL, "atributoPadrao" text NOT NULL, "requisitoPericia" integer NOT NULL, "custo" integer NOT NULL, "anoNormal" integer NOT NULL, "descricao" text NOT NULL, "efeito" text NOT NULL, "tags" text[] NOT NULL DEFAULT ARRAY[]::text[], "fonte" text NOT NULL, "restrito" boolean NOT NULL DEFAULT false, "secreto" boolean NOT NULL DEFAULT false, "atualizadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "conteudos_sistema_pkey" PRIMARY KEY ("id"));
ALTER TABLE "conteudos_sistema" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS "conteudos_sistema_sistemaId_slug_key" ON "conteudos_sistema" ("sistemaId", "slug");
CREATE INDEX IF NOT EXISTS "conteudos_sistema_sistemaId_anoNormal_idx" ON "conteudos_sistema" ("sistemaId", "anoNormal");
DO $$ BEGIN ALTER TABLE "conteudos_sistema" ADD CONSTRAINT "conteudos_sistema_sistemaId_fkey" FOREIGN KEY ("sistemaId") REFERENCES "sistemas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "curriculo_hogwarts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "campanhaId" uuid NOT NULL, "slug" text NOT NULL, "estado" text NOT NULL DEFAULT 'PREVISTO', "override" jsonb, "atualizadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "curriculo_hogwarts_pkey" PRIMARY KEY ("id"));
ALTER TABLE "curriculo_hogwarts" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS "curriculo_hogwarts_campanhaId_slug_key" ON "curriculo_hogwarts" ("campanhaId", "slug");
CREATE INDEX IF NOT EXISTS "curriculo_hogwarts_campanhaId_estado_idx" ON "curriculo_hogwarts" ("campanhaId", "estado");
DO $$ BEGIN ALTER TABLE "curriculo_hogwarts" ADD CONSTRAINT "curriculo_hogwarts_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
