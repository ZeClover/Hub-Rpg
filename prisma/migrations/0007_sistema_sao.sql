-- Garante a linha do Sistema SAO na tabela `sistemas`.
--
-- `src/lib/sistemas.ts` sempre listou o SAO (é o que desenha o card em
-- /fichas, mesmo antes de ter ficha) — mas essa lista é só do código, não
-- do banco. A ação "+ Criar ficha" busca a linha correspondente por
-- `chave` (`banco.sistema.findUnique({where:{chave:'sao'}})`) antes de
-- criar o personagem; sem essa linha, escolher Sistema SAO falharia com
-- "sistema desconhecido" mesmo já aparecendo na lista.
--
-- ON CONFLICT DO NOTHING: seguro rodar mais de uma vez, e não sobrescreve
-- nome/descrição se a linha já tiver sido criada por outro caminho.

INSERT INTO "sistemas" ("id", "chave", "nome", "descricao", "ativo")
VALUES (
  gen_random_uuid(),
  'sao',
  'Sistema SAO',
  'Homebrew original inspirado em Sword Art Online, Overgeared e Shangri-La Frontier — o personagem sabe que está num jogo.',
  true
)
ON CONFLICT ("chave") DO NOTHING;
