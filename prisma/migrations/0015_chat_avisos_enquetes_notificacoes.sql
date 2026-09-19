-- Etapa 3 das melhorias organizacionais do Hub (decisão #136): chat simples
-- da campanha, avisos fixados, enquetes e notificações internas.
--
-- Só tabelas novas — nada muda no comportamento de campanha, ficha ou
-- sessão existente.
--
-- É seguro rodar mais de uma vez.

DO $$ BEGIN
  CREATE TYPE "TipoNotificacao" AS ENUM ('SESSAO_MARCADA', 'AVISO_NOVO', 'ENQUETE_NOVA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "mensagens_chat" (
  "id" uuid NOT NULL,
  "campanhaId" uuid NOT NULL,
  "autorId" uuid NOT NULL,
  "texto" text NOT NULL,
  "criadoEm" timestamp(3) NOT NULL DEFAULT now(),
  CONSTRAINT "mensagens_chat_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "mensagens_chat"
    ADD CONSTRAINT "mensagens_chat_campanhaId_fkey"
    FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "mensagens_chat"
    ADD CONSTRAINT "mensagens_chat_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "mensagens_chat_campanhaId_criadoEm_idx"
  ON "mensagens_chat" ("campanhaId", "criadoEm");

CREATE TABLE IF NOT EXISTS "avisos" (
  "id" uuid NOT NULL,
  "campanhaId" uuid NOT NULL,
  "autorId" uuid NOT NULL,
  "texto" text NOT NULL,
  "fixado" boolean NOT NULL DEFAULT false,
  "criadoEm" timestamp(3) NOT NULL DEFAULT now(),
  "atualizadoEm" timestamp(3) NOT NULL,
  CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "avisos"
    ADD CONSTRAINT "avisos_campanhaId_fkey"
    FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "avisos"
    ADD CONSTRAINT "avisos_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "avisos_campanhaId_idx" ON "avisos" ("campanhaId");

CREATE TABLE IF NOT EXISTS "enquetes" (
  "id" uuid NOT NULL,
  "campanhaId" uuid NOT NULL,
  "autorId" uuid NOT NULL,
  "pergunta" text NOT NULL,
  "opcoes" text[] NOT NULL,
  "encerrada" boolean NOT NULL DEFAULT false,
  "criadoEm" timestamp(3) NOT NULL DEFAULT now(),
  CONSTRAINT "enquetes_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "enquetes"
    ADD CONSTRAINT "enquetes_campanhaId_fkey"
    FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "enquetes"
    ADD CONSTRAINT "enquetes_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "enquetes_campanhaId_idx" ON "enquetes" ("campanhaId");

CREATE TABLE IF NOT EXISTS "enquetes_votos" (
  "id" uuid NOT NULL,
  "enqueteId" uuid NOT NULL,
  "usuarioId" uuid NOT NULL,
  "opcaoIndex" integer NOT NULL,
  CONSTRAINT "enquetes_votos_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "enquetes_votos"
    ADD CONSTRAINT "enquetes_votos_enqueteId_fkey"
    FOREIGN KEY ("enqueteId") REFERENCES "enquetes"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "enquetes_votos"
    ADD CONSTRAINT "enquetes_votos_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "enquetes_votos_enqueteId_usuarioId_key"
  ON "enquetes_votos" ("enqueteId", "usuarioId");

CREATE TABLE IF NOT EXISTS "notificacoes" (
  "id" uuid NOT NULL,
  "usuarioId" uuid NOT NULL,
  "campanhaId" uuid NOT NULL,
  "tipo" "TipoNotificacao" NOT NULL,
  "texto" text NOT NULL,
  "lida" boolean NOT NULL DEFAULT false,
  "criadoEm" timestamp(3) NOT NULL DEFAULT now(),
  CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "notificacoes"
    ADD CONSTRAINT "notificacoes_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "notificacoes"
    ADD CONSTRAINT "notificacoes_campanhaId_fkey"
    FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "notificacoes_usuarioId_lida_idx"
  ON "notificacoes" ("usuarioId", "lida");
