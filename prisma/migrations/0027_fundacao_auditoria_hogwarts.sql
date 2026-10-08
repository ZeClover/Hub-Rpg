-- Fundação aditiva para a reforma Hogwarts. Não transforma nem remove dados
-- de fichas existentes e pode ser revertida descartando somente esta tabela.
CREATE TABLE "eventos_auditoria_hogwarts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "campanhaId" UUID NOT NULL,
  "personagemId" UUID,
  "atorId" UUID,
  "modulo" TEXT NOT NULL,
  "acao" TEXT NOT NULL,
  "resumo" TEXT NOT NULL,
  "detalhes" JSONB,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "eventos_auditoria_hogwarts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "eventos_auditoria_hogwarts_campanhaId_criadoEm_idx"
  ON "eventos_auditoria_hogwarts"("campanhaId", "criadoEm");
CREATE INDEX "eventos_auditoria_hogwarts_personagemId_criadoEm_idx"
  ON "eventos_auditoria_hogwarts"("personagemId", "criadoEm");

ALTER TABLE "eventos_auditoria_hogwarts"
  ADD CONSTRAINT "eventos_auditoria_hogwarts_campanhaId_fkey"
  FOREIGN KEY ("campanhaId") REFERENCES "campanhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "eventos_auditoria_hogwarts"
  ADD CONSTRAINT "eventos_auditoria_hogwarts_personagemId_fkey"
  FOREIGN KEY ("personagemId") REFERENCES "personagens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "eventos_auditoria_hogwarts"
  ADD CONSTRAINT "eventos_auditoria_hogwarts_atorId_fkey"
  FOREIGN KEY ("atorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "hogwarts_conteudos_detalhes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "conteudoId" UUID NOT NULL,
  "faseCurricular" TEXT NOT NULL DEFAULT 'NORMAL',
  "permitidoCriacao" BOOLEAN NOT NULL DEFAULT true,
  "acao" TEXT,
  "alcance" TEXT,
  "area" TEXT,
  "duracao" TEXT,
  "concentracao" BOOLEAN,
  "dano" INTEGER,
  "natureza" TEXT,
  "sucesso" TEXT,
  "elevado" TEXT,
  "excepcional" TEXT,
  "termino" TEXT,
  CONSTRAINT "hogwarts_conteudos_detalhes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hogwarts_conteudos_detalhes_conteudoId_key"
  ON "hogwarts_conteudos_detalhes"("conteudoId");
ALTER TABLE "hogwarts_conteudos_detalhes"
  ADD CONSTRAINT "hogwarts_conteudos_detalhes_conteudoId_fkey"
  FOREIGN KEY ("conteudoId") REFERENCES "conteudos_sistema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "conteudos_sistema" (
  "sistemaId", "slug", "nome", "categoria", "pericia", "atributoPadrao",
  "requisitoPericia", "custo", "anoNormal", "descricao", "efeito", "tags", "fonte"
)
SELECT "id", 'incendio', 'Incendio', 'Feitiço', 'Feitiços', 'Arcano', 1, 1, 1,
  'Dispara fogo contra um alvo a até 6 m. Causa dano e pode provocar Em Chamas.',
  'Sucesso: 1 dano. Elevado: 1 dano + Em Chamas. Excepcional: 2 dano + Em Chamas.',
  ARRAY['Fogo', 'Perigosa', 'Fim de Ano', 'Opcional'], 'Currículo de Hogwarts — 1º Ano'
FROM "sistemas" WHERE "chave" = 'hogwarts-rpg'
ON CONFLICT ("sistemaId", "slug") DO UPDATE SET
  "nome" = EXCLUDED."nome", "descricao" = EXCLUDED."descricao", "efeito" = EXCLUDED."efeito",
  "tags" = EXCLUDED."tags", "atualizadoEm" = now();

INSERT INTO "hogwarts_conteudos_detalhes" (
  "conteudoId", "faseCurricular", "permitidoCriacao", "acao", "alcance", "area",
  "duracao", "concentracao", "dano", "natureza", "sucesso", "elevado", "excepcional", "termino"
)
SELECT cs."id", 'FIM', false, '1 Ação', '6 m', 'Alvo único', 'Instantânea', false, 1,
  'Fogo / Perigosa', '1 dano.', '1 dano + Em Chamas.', '2 dano + Em Chamas.',
  'Em Chamas causa 1 dano no começo do próximo turno; fogo superficial comum então termina.'
FROM "conteudos_sistema" cs
JOIN "sistemas" s ON s."id" = cs."sistemaId"
WHERE s."chave" = 'hogwarts-rpg' AND cs."slug" = 'incendio'
ON CONFLICT ("conteudoId") DO UPDATE SET
  "faseCurricular" = EXCLUDED."faseCurricular", "permitidoCriacao" = EXCLUDED."permitidoCriacao",
  "acao" = EXCLUDED."acao", "alcance" = EXCLUDED."alcance", "area" = EXCLUDED."area",
  "duracao" = EXCLUDED."duracao", "concentracao" = EXCLUDED."concentracao", "dano" = EXCLUDED."dano",
  "natureza" = EXCLUDED."natureza", "sucesso" = EXCLUDED."sucesso", "elevado" = EXCLUDED."elevado",
  "excepcional" = EXCLUDED."excepcional", "termino" = EXCLUDED."termino";
