-- Decisão #162: Loja ao vivo — estoque compartilhado, com concorrência
-- real (dois jogadores comprando a última unidade ao mesmo tempo). Usada
-- hoje pelo módulo do Hogwarts RPG.
--
-- Mesma convenção das migrações 0018/0019: cada instrução numa linha só,
-- pra colar no SQL Editor do Supabase sem risco de perder quebra de linha
-- no meio de um CREATE TABLE. Seguro rodar mais de uma vez.

CREATE TABLE IF NOT EXISTS "lojas" ("id" uuid NOT NULL, "campanhaId" uuid NOT NULL, "nome" text NOT NULL, "descricao" text, "aberta" boolean NOT NULL DEFAULT false, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "lojas_pkey" PRIMARY KEY ("id"));

ALTER TABLE "lojas" ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS "lojas_campanhaId_idx" ON "lojas" ("campanhaId");

DO $$ BEGIN ALTER TABLE "lojas" ADD CONSTRAINT "lojas_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "loja_itens" ("id" uuid NOT NULL, "lojaId" uuid NOT NULL, "nome" text NOT NULL, "descricao" text, "preco" integer NOT NULL, "estoque" integer, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "loja_itens_pkey" PRIMARY KEY ("id"));

ALTER TABLE "loja_itens" ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS "loja_itens_lojaId_idx" ON "loja_itens" ("lojaId");

DO $$ BEGIN ALTER TABLE "loja_itens" ADD CONSTRAINT "loja_itens_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "loja_compras" ("id" uuid NOT NULL, "lojaId" uuid NOT NULL, "lojaItemId" uuid NOT NULL, "personagemId" uuid NOT NULL, "nomeItem" text NOT NULL, "preco" integer NOT NULL, "criadoEm" timestamp(3) NOT NULL DEFAULT now(), CONSTRAINT "loja_compras_pkey" PRIMARY KEY ("id"));

ALTER TABLE "loja_compras" ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS "loja_compras_lojaId_idx" ON "loja_compras" ("lojaId");
CREATE INDEX IF NOT EXISTS "loja_compras_personagemId_idx" ON "loja_compras" ("personagemId");

DO $$ BEGIN ALTER TABLE "loja_compras" ADD CONSTRAINT "loja_compras_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "loja_compras" ADD CONSTRAINT "loja_compras_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;
