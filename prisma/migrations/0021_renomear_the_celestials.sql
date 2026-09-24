-- Troca de nome do "Sistema do Sávio" pra "The Celestials" (pedido do Zé).
-- A chave interna ('sistema-do-savio') não muda — é só a etiqueta que
-- aparece pra quem usa o Hub; mudar a chave quebraria o vínculo com as
-- campanhas e fichas que já existem.
--
-- É seguro rodar mais de uma vez.

UPDATE "sistemas" SET "nome" = 'The Celestials' WHERE "chave" = 'sistema-do-savio';
