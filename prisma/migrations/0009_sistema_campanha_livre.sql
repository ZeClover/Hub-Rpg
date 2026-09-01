-- Garante a linha do Sistema "Campanha Livre" na tabela `sistemas`.
--
-- Campanha Livre é o 5º sistema do Hub: campanhas narradas livremente (hoje,
-- principalmente solo no ChatGPT), sem um livro de regras fechado. A ficha
-- não usa classes/perícias de catálogo como os outros quatro — é XP, Nível,
-- recursos configuráveis (mana, sanidade, o que a mesa usar), inventário e
-- colinhas, editados sobretudo pelo protocolo HUB_UPDATE (colar o que o
-- ChatGPT escreveu e revisar antes de salvar).
--
-- ON CONFLICT DO NOTHING: seguro rodar mais de uma vez, e não sobrescreve
-- nome/descrição se a linha já tiver sido criada por outro caminho.

INSERT INTO "sistemas" ("id", "chave", "nome", "descricao", "ativo")
VALUES (
  gen_random_uuid(),
  'campanha-livre',
  'Campanha Livre',
  'Campanhas narradas livremente (ChatGPT como Mestre, geralmente solo) — XP, recursos e inventário configuráveis, editados principalmente pelo protocolo HUB_UPDATE.',
  true
)
ON CONFLICT ("chave") DO NOTHING;
