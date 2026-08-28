-- Manual do Mestre: anotações livres por campanha.
--
-- Uma coluna de texto só, guardada na própria campanha. Fica de fora de
-- qualquer consulta feita para quem não é mestre daquela campanha — a
-- rota que devolve os dados da campanha para jogadores nem seleciona esta
-- coluna (decisão #13).
--
-- É seguro rodar mais de uma vez.

ALTER TABLE "campanhas"
  ADD COLUMN IF NOT EXISTS "manualMestre" text;
