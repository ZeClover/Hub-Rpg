-- Etapa 1 das melhorias organizacionais do Hub (decisão #134):
-- identidade da campanha (capa/descrição/tags), status do personagem
-- (Ativo/Reserva/Aposentado/Morto/Arquivado), avatar/banner do
-- personagem e sistemas favoritos por usuário.
--
-- Nada aqui muda o comportamento de nenhuma ficha existente — são só
-- colunas novas, com default que preserva o estado atual (toda campanha
-- sem tag/descrição/capa continua exatamente como está; todo personagem
-- nasce com status ATIVO).
--
-- É seguro rodar mais de uma vez.

DO $$ BEGIN
  CREATE TYPE "StatusPersonagem" AS ENUM ('ATIVO', 'RESERVA', 'APOSENTADO', 'MORTO', 'ARQUIVADO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "campanhas"
  ADD COLUMN IF NOT EXISTS "capaUrl" text,
  ADD COLUMN IF NOT EXISTS "descricao" text,
  ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT '{}';

ALTER TABLE "personagens"
  ADD COLUMN IF NOT EXISTS "status" "StatusPersonagem" NOT NULL DEFAULT 'ATIVO',
  ADD COLUMN IF NOT EXISTS "avatarUrl" text,
  ADD COLUMN IF NOT EXISTS "bannerUrl" text;

ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "sistemasFavoritos" text[] NOT NULL DEFAULT '{}';
