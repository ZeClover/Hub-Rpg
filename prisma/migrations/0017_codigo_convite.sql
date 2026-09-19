-- Código curto de convite (decisão #138) — mesma porta que o link de
-- convite (o UUID da campanha), só mais fácil de digitar ou falar em voz
-- alta. Toda campanha já existente precisa ganhar um código só dela antes
-- da trava de unicidade entrar, então a coluna nasce sem NOT NULL, é
-- preenchida pra quem ainda não tem, e só então a trava é ligada.
--
-- É seguro rodar mais de uma vez: campanha com código único não é
-- tocada, e as duas últimas alterações são no-op se já tiverem rodado
-- antes.

ALTER TABLE "campanhas"
  ADD COLUMN IF NOT EXISTS "codigoConvite" text;

-- Um código aleatório de 6 caracteres pra quem está sem, ou cujo código
-- colidiu com o de outra campanha (alfabeto sem 0/O/1/I, pra não
-- confundir na hora de digitar de novo). O valor é montado por seis
-- `substr` concatenados direto na cláusula, sem passar por nenhuma
-- subconsulta: uma subconsulta sem referência à linha de fora vira um
-- "initplan" no Postgres e é calculada UMA VEZ só pra todo o UPDATE, não
-- uma vez por linha — foi exatamente esse o defeito da primeira versão
-- desta migração, que deu a campanhas diferentes o mesmo código
-- ("JFGE5Y" duplicado) e travou a criação do índice único lá embaixo.
UPDATE "campanhas"
SET "codigoConvite" =
  substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1) ||
  substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1) ||
  substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1) ||
  substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1) ||
  substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1) ||
  substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1)
WHERE "codigoConvite" IS NULL
   OR "codigoConvite" IN (
     SELECT "codigoConvite" FROM "campanhas" GROUP BY "codigoConvite" HAVING count(*) > 1
   );

ALTER TABLE "campanhas"
  ALTER COLUMN "codigoConvite" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "campanhas_codigoConvite_key"
  ON "campanhas" ("codigoConvite");
