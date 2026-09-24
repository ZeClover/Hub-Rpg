-- Fecha, pra acesso vindo de fora do nosso servidor, todas as tabelas
-- criadas desde a migração 0002 — decisão #2 ("cinto e suspensório":
-- Row Level Security ligada sem nenhuma permissão cadastrada, mais a
-- revogação de privilégio já cadastrada em 0002 pros perfis públicos
-- do Supabase).
--
-- Por que isto precisou existir: a migração 0002 já garantia (via ALTER
-- DEFAULT PRIVILEGES) que tabela nova nasce sem privilégio nenhum pra
-- "anon"/"authenticated" — isso sozinho já bloqueia esse caminho de
-- acesso. Mas RLS é a segunda trava do "cinto e suspensório" da própria
-- 0002, e as migrações 0014 e 0015 (sessões/presença, chat/avisos/
-- enquetes/notificações) criaram tabela sem repetir essa segunda trava —
-- um esquecimento nas migrações daquela época, achado quando o Supabase
-- avisou sozinho ("Potential issue detected") ao rodar uma tabela mais
-- recente que tinha o mesmo problema.
--
-- ENABLE ROW LEVEL SECURITY não tem efeito nenhum se já estiver ligada
-- (nem erro, nem mudança) — seguro rodar mais de uma vez, e seguro rodar
-- mesmo nas tabelas que já tiverem essa trava (0018/0019 já nasceram com
-- ela, corrigidas antes deste arquivo).
--
-- Esta migração pode rodar antes da 0018/0019 terem sido aplicadas por
-- inteiro (ordem de quem já rodou o quê no Supabase varia), e "itens"/
-- "grupos"/etc. daquelas migrações ainda podem não existir. "ALTER TABLE
-- IF EXISTS" já deveria bastar pra isso sozinho, mas na prática ainda deu
-- erro "relation ... does not exist" — por segurança, cada linha abaixo
-- confere a existência da tabela em information_schema antes de tentar
-- ligar a trava, então nenhuma ordem de execução quebra o script.

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sessoes_presencas') THEN EXECUTE 'ALTER TABLE "sessoes_presencas" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='mensagens_chat') THEN EXECUTE 'ALTER TABLE "mensagens_chat" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='avisos') THEN EXECUTE 'ALTER TABLE "avisos" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='enquetes') THEN EXECUTE 'ALTER TABLE "enquetes" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='enquetes_votos') THEN EXECUTE 'ALTER TABLE "enquetes_votos" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notificacoes') THEN EXECUTE 'ALTER TABLE "notificacoes" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='campos_personalizados') THEN EXECUTE 'ALTER TABLE "campos_personalizados" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='conquistas_campanha') THEN EXECUTE 'ALTER TABLE "conquistas_campanha" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='grupos') THEN EXECUTE 'ALTER TABLE "grupos" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='grupos_membros') THEN EXECUTE 'ALTER TABLE "grupos_membros" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='itens') THEN EXECUTE 'ALTER TABLE "itens" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='companheiros') THEN EXECUTE 'ALTER TABLE "companheiros" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='veiculos') THEN EXECUTE 'ALTER TABLE "veiculos" ENABLE ROW LEVEL SECURITY'; END IF; END $$;
