-- Garante a linha do Sistema Thrylikí Chelóna na tabela `sistemas`.
--
-- Mesmo motivo da migração 0007 (SAO): `src/lib/sistemas.ts` já lista o
-- Thrylikí Chelóna, mas essa lista é só do código, não do banco. A ação
-- "+ Criar ficha" busca a linha correspondente por `chave`
-- (`banco.sistema.findUnique({where:{chave:'thryliki-chelona'}})`) antes de
-- criar o personagem; sem essa linha, escolher o sistema falharia com
-- "sistema desconhecido" mesmo já aparecendo na lista.
--
-- ON CONFLICT DO NOTHING: seguro rodar mais de uma vez, e não sobrescreve
-- nome/descrição se a linha já tiver sido criada por outro caminho.

INSERT INTO "sistemas" ("id", "chave", "nome", "descricao", "ativo")
VALUES (
  gen_random_uuid(),
  'thryliki-chelona',
  'Thrylikí Chelóna',
  'Homebrew do Zé sobre uma escola de heróis — atributos por Grau, Ano e Nível como progressões separadas, dezesseis Áreas de Estudo.',
  true
)
ON CONFLICT ("chave") DO NOTHING;
