-- Código curto de convite (decisão #138) — mesma porta que o link de
-- convite (o UUID da campanha), só mais fácil de digitar ou falar em voz
-- alta. Toda campanha já existente precisa ganhar um código só dela antes
-- da trava de unicidade entrar, então a coluna nasce sem NOT NULL, é
-- preenchida pra quem ainda não tem, e só então a trava é ligada.
--
-- É seguro rodar mais de uma vez: campanha com código único não é
-- tocada, e as duas últimas alterações são no-op se já tiverem rodado
-- antes.

ALTER TABLE "campanhas" ADD COLUMN IF NOT EXISTS "codigoConvite" text;

-- Um código por linha, hash do id de cada campanha misturado com dois
-- valores que mudam a cada execução (random(), clock_timestamp()) — como
-- o `id` de cada campanha entra na conta, o Postgres não tem como tratar
-- isto como uma conta só pra todo o UPDATE (o defeito das duas tentativas
-- anteriores). Tudo numa linha só de propósito, pra sobreviver a
-- qualquer editor que corte ou quebre a query em pontos inesperados.
UPDATE "campanhas" SET "codigoConvite" = upper(substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 6)) WHERE "codigoConvite" IS NULL OR "codigoConvite" IN (SELECT "codigoConvite" FROM "campanhas" GROUP BY "codigoConvite" HAVING count(*) > 1);

ALTER TABLE "campanhas" ALTER COLUMN "codigoConvite" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "campanhas_codigoConvite_key" ON "campanhas" ("codigoConvite");
