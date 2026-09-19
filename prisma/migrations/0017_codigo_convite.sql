-- Código curto de convite (decisão #138) — mesma porta que o link de
-- convite (o UUID da campanha), só mais fácil de digitar ou falar em voz
-- alta. Toda campanha já existente precisa ganhar um código só dela antes
-- da trava de unicidade entrar, então a coluna nasce sem NOT NULL, é
-- preenchida pra quem ainda não tem, e só então a trava é ligada.
--
-- É seguro rodar mais de uma vez: campanha que já tem código não é
-- tocada, e as duas últimas linhas são no-op se já tiverem rodado antes.

ALTER TABLE "campanhas"
  ADD COLUMN IF NOT EXISTS "codigoConvite" text;

DO $$
DECLARE
  linha RECORD;
  candidato text;
BEGIN
  FOR linha IN SELECT id FROM "campanhas" WHERE "codigoConvite" IS NULL LOOP
    LOOP
      -- Alfabeto sem 0/O/1/I: pra não confundir na hora de digitar o
      -- código de novo, olhando pra tela de outra pessoa.
      candidato := (
        SELECT string_agg(
          substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1),
          ''
        )
        FROM generate_series(1, 6)
      );
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "campanhas" WHERE "codigoConvite" = candidato
      );
    END LOOP;
    UPDATE "campanhas" SET "codigoConvite" = candidato WHERE id = linha.id;
  END LOOP;
END $$;

ALTER TABLE "campanhas"
  ALTER COLUMN "codigoConvite" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "campanhas_codigoConvite_key"
  ON "campanhas" ("codigoConvite");
