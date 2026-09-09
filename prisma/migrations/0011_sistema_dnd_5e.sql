-- Garante a linha do Sistema D&D 5ª Edição na tabela `sistemas`.
--
-- Mesmo motivo das migrações 0007-0010: `src/lib/sistemas.ts` já lista o
-- D&D 5ª Edição, mas essa lista é só do código, não do banco. A ação
-- "+ Criar ficha" busca a linha correspondente por `chave`
-- (`banco.sistema.findUnique({where:{chave:'dnd-5e'}})`) antes de
-- criar o personagem; sem essa linha, escolher o sistema falharia com
-- "sistema desconhecido" mesmo já aparecendo na lista.
--
-- ON CONFLICT DO NOTHING: seguro rodar mais de uma vez, e não sobrescreve
-- nome/descrição se a linha já tiver sido criada por outro caminho.

INSERT INTO "sistemas" ("id", "chave", "nome", "descricao", "ativo")
VALUES (
  gen_random_uuid(),
  'dnd-5e',
  'D&D 5ª Edição',
  'O TTRPG mais tradicional. Chassi inicial: atributos, 9 raças, 4 classes-base (Guerreiro, Ladino, Clérigo, Mago) e combate — mais classes a caminho.',
  true
)
ON CONFLICT ("chave") DO NOTHING;
