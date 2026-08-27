-- Remove o cadastro de lore do banco (decisão #36).
--
-- O Hub deixou de ser um cadastro de mundo e passou a ser sobre fichas de
-- personagem. Estas tabelas não têm mais uso.
--
-- ATENÇÃO: isto APAGA dados. Se você chegou a cadastrar algum universo ou
-- ficha de lugar/NPC no Hub, esse conteúdo se perde. Se quiser guardar antes,
-- rode a consulta abaixo e salve o resultado:
--
--   SELECT * FROM "universos";
--   SELECT * FROM "entidades";
--   SELECT * FROM "campos_entidade";
--
-- A ordem importa: quem aponta para os outros sai primeiro.

DROP TABLE IF EXISTS "vinculos";
DROP TABLE IF EXISTS "campos_entidade";

-- personagens apontava para entidades; a coluna some junto com o lore.
ALTER TABLE "personagens" DROP COLUMN IF EXISTS "entidadeId";

DROP TABLE IF EXISTS "entidades";
DROP TYPE  IF EXISTS "TipoEntidade";

-- campanhas apontava para um universo; agora aponta só para um sistema.
ALTER TABLE "campanhas" DROP CONSTRAINT IF EXISTS "campanhas_universoId_fkey";
DROP INDEX IF EXISTS "campanhas_universoId_idx";
ALTER TABLE "campanhas" DROP COLUMN IF EXISTS "universoId";

DROP TABLE IF EXISTS "universos";

-- Ajustes na tabela de fichas para o novo formato (decisão #35).
ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "sistemaId"   UUID;
ALTER TABLE "personagens" ADD COLUMN IF NOT EXISTS "versaoFicha" INTEGER NOT NULL DEFAULT 1;

-- campanhaId passa a ser opcional: ficha avulsa, fora de mesa nenhuma.
ALTER TABLE "personagens" ALTER COLUMN "campanhaId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "personagens_sistemaId_idx" ON "personagens"("sistemaId");

-- A ligação com sistemas só é exigida depois que as fichas existentes (se
-- houver) receberem um sistema. Com a tabela vazia, pode ser criada agora.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "personagens" WHERE "sistemaId" IS NULL) THEN
    ALTER TABLE "personagens" ALTER COLUMN "sistemaId" SET NOT NULL;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'personagens_sistemaId_fkey'
    ) THEN
      ALTER TABLE "personagens"
        ADD CONSTRAINT "personagens_sistemaId_fkey"
        FOREIGN KEY ("sistemaId") REFERENCES "sistemas"("id") ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

-- Cadastra os sistemas do Zé, para as fichas terem onde se apoiar.
INSERT INTO "sistemas" ("id","chave","nome","descricao","ativo") VALUES
  (gen_random_uuid(),'fabula-ultima','Fabula Ultima','TTJRPG inspirado em JRPGs, da Need Games. Edição brasileira da Jambô',true),
  (gen_random_uuid(),'kaizoku-no-sho','Kaizoku no Sho','Homebrew de One Piece, adaptação do Shinobi no Sho',true),
  (gen_random_uuid(),'sao','Sistema SAO','Homebrew inspirado em Sword Art Online',true),
  (gen_random_uuid(),'thryliki-chelona','Thrylikí Chelóna','Homebrew do Zé',true)
ON CONFLICT ("chave") DO NOTHING;
