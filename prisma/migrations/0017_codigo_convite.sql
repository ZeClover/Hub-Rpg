-- Código curto de convite (decisão #138) — mesma porta que o link de
-- convite (o UUID da campanha), só mais fácil de digitar ou falar em voz
-- alta. Toda campanha já existente precisa ganhar um código só dela antes
-- da trava de unicidade entrar, então a coluna nasce sem NOT NULL, é
-- preenchida pra quem ainda não tem, e só então a trava é ligada.
--
-- É seguro rodar mais de uma vez: campanha que já tem código não é
-- tocada, e as duas últimas alterações são no-op se já tiverem rodado
-- antes.

ALTER TABLE "campanhas"
  ADD COLUMN IF NOT EXISTS "codigoConvite" text;

-- Um código aleatório de 6 caracteres por linha que ainda não tem
-- (alfabeto sem 0/O/1/I, pra não confundir na hora de digitar de novo).
-- Sem laço: com o tamanho de campanha que este projeto tem, a chance de
-- duas caírem no mesmo código por acaso é desprezível (32^6, mais de 1
-- bilhão de combinações) — se acontecer mesmo assim, a trava UNIQUE logo
-- abaixo recusa na hora, avisando bem alto em vez de deixar passar.
UPDATE "campanhas"
SET "codigoConvite" = (
  SELECT string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1),
    ''
  )
  FROM generate_series(1, 6)
)
WHERE "codigoConvite" IS NULL;

ALTER TABLE "campanhas"
  ALTER COLUMN "codigoConvite" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "campanhas_codigoConvite_key"
  ON "campanhas" ("codigoConvite");
