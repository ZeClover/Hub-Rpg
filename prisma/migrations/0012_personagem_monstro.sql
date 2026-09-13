-- Fichas de monstro e de personagem criadas pelo mestre dentro da campanha.
--
-- Antes desta coluna, toda ficha que o mestre criava direto na campanha
-- ("+ Adicionar ficha de inimigo") era tratada como bestiário — não tinha
-- outra opção. Agora o mestre também pode criar uma ficha de PERSONAGEM
-- completa (mesmo módulo de sistema, mesma ficha de jogador — útil pra um
-- aliado importante, por exemplo). "ehMonstro" marca qual das duas é.
--
-- O backfill preserva o comportamento de antes: toda ficha já existente
-- cujo dono é o mestre daquela campanha continua contando como monstro,
-- porque era a única coisa que podia ser.
--
-- É seguro rodar mais de uma vez.

ALTER TABLE "personagens"
  ADD COLUMN IF NOT EXISTS "ehMonstro" boolean NOT NULL DEFAULT false;

UPDATE "personagens" AS pj
SET "ehMonstro" = true
FROM "participacoes" AS pt
WHERE pt."campanhaId" = pj."campanhaId"
  AND pt."usuarioId" = pj."donoId"
  AND pt."papel" = 'MESTRE'
  AND pj."ehMonstro" = false;
