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

ALTER TABLE "sessoes_presencas"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mensagens_chat"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "avisos"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enquetes"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enquetes_votos"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notificacoes"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campos_personalizados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conquistas_campanha"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grupos"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grupos_membros"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "itens"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companheiros"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "veiculos"              ENABLE ROW LEVEL SECURITY;
