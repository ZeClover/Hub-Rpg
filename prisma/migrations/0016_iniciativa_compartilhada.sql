-- Etapa 4 das melhorias organizacionais do Hub (decisão #137): espelho da
-- ordem de iniciativa da Mesa ao Vivo, pra jogador conseguir ver em modo
-- leitura. O mestre continua controlando tudo do próprio navegador
-- (localStorage) — esta coluna só existe pra sincronizar o que ele já faz.
--
-- Coluna nova com valor padrão nulo — nenhuma campanha existente muda de
-- comportamento.
--
-- É seguro rodar mais de uma vez.

ALTER TABLE "campanhas"
  ADD COLUMN IF NOT EXISTS "iniciativaAtual" jsonb;
