-- Garante a linha do Sistema Hogwarts RPG na tabela `sistemas`.
--
-- BUG encontrado no smoke test de validação (decisão #164): mesmo motivo
-- das migrações 0007-0011 (SAO, Thrylikí Chelóna, Campanha Livre, The
-- Celestials, D&D 5e) — `src/lib/sistemas.ts` já lista o Hogwarts RPG
-- desde a decisão #157, mas essa lista é só do código, não do banco.
-- "+ Criar campanha"/"+ Criar ficha" buscam a linha correspondente por
-- `chave` (`banco.sistema.findUnique({where:{chave:'hogwarts-rpg'}})`)
-- antes de criar; sem essa linha, escolher o sistema falhava com "sistema
-- desconhecido" mesmo já aparecendo na lista — ninguém conseguia criar
-- uma campanha Hogwarts de verdade, apesar de toda a ficha/Loja/Modo
-- Sessão já estarem prontos. Faltou esta migração desde a decisão #157.
--
-- ON CONFLICT DO NOTHING: seguro rodar mais de uma vez, e não sobrescreve
-- nome/descrição se a linha já tiver sido criada por outro caminho.

INSERT INTO "sistemas" ("id", "chave", "nome", "descricao", "ativo")
VALUES (
  gen_random_uuid(),
  'hogwarts-rpg',
  'Hogwarts RPG',
  'Homebrew do Zé sem classes: Atributos + Perícias + Conteúdos + Casa + Família + Origem + Varinha. Chassi completo: ficha, Modo Sessão do Mestre e Loja ao vivo.',
  true
)
ON CONFLICT ("chave") DO NOTHING;
