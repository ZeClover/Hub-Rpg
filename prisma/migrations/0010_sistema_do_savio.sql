-- Garante a linha do Sistema do Sávio na tabela `sistemas`.
--
-- Mesmo motivo das migrações 0007 (SAO) e 0008 (Thrylikí Chelóna):
-- `src/lib/sistemas.ts` já lista o Sistema do Sávio, mas essa lista é só
-- do código, não do banco. A ação "+ Criar ficha" busca a linha
-- correspondente por `chave`
-- (`banco.sistema.findUnique({where:{chave:'sistema-do-savio'}})`) antes de
-- criar o personagem; sem essa linha, escolher o sistema falha com
-- "sistema desconhecido" — é exatamente o erro que apareceu na tela
-- ("Não consegui criar a ficha agora. Tenta de novo.").
--
-- ON CONFLICT DO NOTHING: seguro rodar mais de uma vez, e não sobrescreve
-- nome/descrição se a linha já tiver sido criada por outro caminho.

INSERT INTO "sistemas" ("id", "chave", "nome", "descricao", "ativo")
VALUES (
  gen_random_uuid(),
  'sistema-do-savio',
  'Sistema do Sávio',
  'Homebrew de um amigo do Zé — Habilidades livres desenhadas pelo próprio jogador, com tabela de bônus por Nível como guia.',
  true
)
ON CONFLICT ("chave") DO NOTHING;
