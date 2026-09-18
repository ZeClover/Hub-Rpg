-- Etapa 2 das melhorias organizacionais do Hub (decisão #135): interface
-- de verdade pro modelo Sessao (que já existia no schema, mas nenhuma rota
-- ou tela usava) e confirmação de presença (Vou/Talvez/Não vou).
--
-- Nada aqui muda o comportamento de nenhuma campanha existente — são só
-- colunas/tabela novas, e a tabela "sessoes" já existia vazia (nenhuma
-- linha foi criada nela até hoje, sem interface pra isso).
--
-- É seguro rodar mais de uma vez.

DO $$ BEGIN
  CREATE TYPE "RespostaPresenca" AS ENUM ('VOU', 'TALVEZ', 'NAO_VOU');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "sessoes"
  ADD COLUMN IF NOT EXISTS "mudancasImportantes" text;

CREATE TABLE IF NOT EXISTS "sessoes_presencas" (
  "id" uuid NOT NULL,
  "sessaoId" uuid NOT NULL,
  "usuarioId" uuid NOT NULL,
  "resposta" "RespostaPresenca" NOT NULL,
  "respondidoEm" timestamp(3) NOT NULL,
  CONSTRAINT "sessoes_presencas_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "sessoes_presencas"
    ADD CONSTRAINT "sessoes_presencas_sessaoId_fkey"
    FOREIGN KEY ("sessaoId") REFERENCES "sessoes"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "sessoes_presencas"
    ADD CONSTRAINT "sessoes_presencas_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "sessoes_presencas_sessaoId_usuarioId_key"
  ON "sessoes_presencas" ("sessaoId", "usuarioId");

CREATE INDEX IF NOT EXISTS "sessoes_presencas_usuarioId_idx"
  ON "sessoes_presencas" ("usuarioId");
