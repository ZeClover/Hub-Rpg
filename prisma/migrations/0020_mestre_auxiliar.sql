-- Decisão #148: papel de "mestre auxiliar" (ideia #115) — mesmo poder do
-- mestre, exceto excluir a campanha ou mexer em quem é mestre.
--
-- É seguro rodar mais de uma vez.

ALTER TYPE "Papel" ADD VALUE IF NOT EXISTS 'MESTRE_AUXILIAR';
