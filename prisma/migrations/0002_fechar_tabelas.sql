-- Fecha as tabelas do Hub para acesso vindo de fora do nosso servidor.
--
-- POR QUE ISTO EXISTE
--
-- O Supabase publica automaticamente uma API sobre as tabelas do banco. A
-- chave pública do projeto fica visível no navegador de qualquer visitante,
-- e com ela seria possível ler e escrever direto nas tabelas, passando por
-- fora do Hub. Isso furaria a decisão #13 (permissão é do servidor).
--
-- Ligar o "Row Level Security" sem cadastrar nenhuma permissão faz o banco
-- recusar todo acesso vindo por esse caminho. O Hub continua funcionando
-- porque o servidor conecta direto no Postgres, como dono do banco, e o dono
-- não passa por essa trava.
--
-- É seguro rodar mais de uma vez.

ALTER TABLE "usuarios"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "universos"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sistemas"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campanhas"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participacoes"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entidades"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campos_entidade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vinculos"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "personagens"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessoes"         ENABLE ROW LEVEL SECURITY;

-- Cinto e suspensório: além da trava acima, tiramos explicitamente a
-- permissão dos dois perfis que a API pública usa.
REVOKE ALL ON ALL TABLES    IN SCHEMA "public" FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA "public" FROM anon, authenticated;

-- E garantimos que tabelas criadas no futuro já nasçam fechadas.
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
