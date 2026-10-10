-- Adição narrativa: nenhuma alteração nas fichas ou nas aquisições existentes.
ALTER TABLE "colecionaveis" ADD COLUMN IF NOT EXISTS "silhuetaArquivo" BYTEA;
ALTER TABLE "concessoes_colecionaveis" ADD COLUMN IF NOT EXISTS "revelacaoVistaEm" TIMESTAMP(3);
-- Concessões antigas já foram entregues. Não reproduzir retrospectivamente uma campanha inteira.
-- Executada uma única vez: repetir o preparo não pode consumir novas revelações pendentes.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='concessoes_revelacoes_pendentes_idx') THEN
  UPDATE "concessoes_colecionaveis" SET "revelacaoVistaEm"="criadoEm" WHERE "revelacaoVistaEm" IS NULL;
  CREATE INDEX "concessoes_revelacoes_pendentes_idx" ON "concessoes_colecionaveis"("personagemId","campanhaId","criadoEm") WHERE "revelacaoVistaEm" IS NULL AND "tipo"='conceder';
 END IF;
END $$;
