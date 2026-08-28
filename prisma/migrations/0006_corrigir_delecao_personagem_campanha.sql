-- Corrige o vínculo de Personagem → Campanha pra SET NULL, não CASCADE.
--
-- A migração 0001 criou esse vínculo como CASCADE por engano (o
-- schema.prisma sempre disse SetNull): do jeito que estava, apagar uma
-- campanha apagaria de verdade as fichas de personagem ligadas a ela —
-- inclusive fichas de jogador, que alguém pode ter investido horas
-- preenchendo. O certo é a ficha ficar "solta" (campanhaId volta a null),
-- do mesmo jeito que qualquer ficha nasce fora de campanha nenhuma.
--
-- Precisa ser corrigido ANTES de existir um botão de "Excluir campanha".
--
-- É seguro rodar mais de uma vez.

ALTER TABLE "personagens" DROP CONSTRAINT IF EXISTS "personagens_campanhaId_fkey";
ALTER TABLE "personagens" ADD CONSTRAINT "personagens_campanhaId_fkey"
  FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
