-- Link de leitura para personagens.
--
-- Uma coluna só: quando "compartilhado" está ligado, qualquer pessoa com a
-- URL da ficha (o id, um UUID, é o segredo do link) consegue abrir em modo
-- leitura, mesmo sem conta e mesmo não sendo o dono. Nunca dá direito de
-- editar — isso continua exigindo ser o dono logado, igual sempre foi.
--
-- É o caminho mais simples para "o mestre ver a ficha de um jogador":
-- em vez de um sistema de campanha inteiro (mesa, convite, papéis), o
-- jogador ativa o compartilhamento e manda o link.
--
-- É seguro rodar mais de uma vez.

ALTER TABLE "personagens"
  ADD COLUMN IF NOT EXISTS "compartilhado" boolean NOT NULL DEFAULT false;
