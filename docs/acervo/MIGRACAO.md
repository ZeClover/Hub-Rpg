# Preservação e migração do Acervo Mágico

O Hub não cria um site novo. O legado permanece versionado, com integrações originais em `arquivo/acervo-integracoes/`. As tabelas colecionaveis, acervos_colecionaveis e concessoes_colecionaveis não são apagadas nem modificadas pela desativação. Os colecionáveis antigos em dados.colecaoFigurinhas também são preservados.

## Exportação privada

O Mestre **titular** da campanha encontra “Backup privado do Acervo” na página da campanha Wands & Wizards. O download usa GET /api/campanhas/{id}/acervo-exportacao, conferindo sessão e papel no servidor. Jogadores, visitantes, Mestres de outras campanhas e auxiliares não exportam o conjunto administrativo. Não existe exportação global irrestrita nem ZIP privado em public/.

Cada ZIP contém código e mídias locais num ZIP interno, JSON e CSV do catálogo completo (incluindo segredos), descobertas, variantes/edições, quantidades, concessões e retiradas sem truncamento, máscaras de silhueta do banco, categorias e manifestos SHA-256. Os nomes dos personagens são dados pessoais: compartilhe somente com administradores autorizados. Contas, e-mails, senhas, tokens, configurações .env e dados mecânicos das fichas não são exportados.

## Reconstrução isolada

1. Guarde duas cópias privadas do ZIP, em locais diferentes, e confira os hashes dos manifestos.
2. Extraia o ZIP interno: inclui código TypeScript/JavaScript, estilos, animações, mídia local, esquema Prisma, migrações e package-lock.json. O manifesto informa os arquivos presentes. O código compartilhado do Hub acompanha para permitir examinar as dependências; não é um aplicativo independente pronto para publicar.
3. Use Node 24 e `npm ci`. Provisione PostgreSQL isolado e autenticação própria. Configure as variáveis de banco e Supabase no serviço de destino; nenhuma credencial acompanha a exportação.
4. Gere o cliente Prisma. Aplique o schema num banco vazio ou adapte somente os três modelos do Acervo e suas relações (campanha, personagem e usuário). Nunca execute db push contra o banco original para reconstruir o destino.
5. Reimporte dados/snapshot.json em transação, na ordem: referências de campanha/personagem, catálogo, descobertas, histórico. Preserve IDs, timestamps, operações idempotentes, edição e quantidade. silhuetaArquivo referencia PNG binário no pacote; converter para Bytes na importação. O catálogo não possui uma tabela independente de variantes: edições são entradas do próprio catálogo.
6. Substitua usuarioAtual, banco, acessoCampanha/acessoPersonagem, links da ficha e API base pelo controle de acesso do novo site. concedidoPorId precisa ser associado a uma identidade administrativa no destino; não crie contas públicas automaticamente. As funções legadas mantêm regras de concessão, retirada, segredo e revelação.
7. Consulte arquivo/acervo-integracoes para restaurar a montagem do Gabinete e seus estilos apenas no destino. As rotas legadas desativadas no Hub precisam ser conectadas aos handlers preservados; o relatório de separação explica o mecanismo.
8. Imagens locais estão no ZIP interno sob codigo/public. URLs externas são mantidas literalmente e registradas em PENDENCIAS.json; dependem da disponibilidade/licença da origem. Não se afirma que um link externo esteja incorporado. Não executar fetch do servidor para URLs arbitrárias cadastradas por usuários (SSRF).
9. Valide catálogo, contagens, máscaras, referências, visibilidade por jogador, duplicatas e o histórico inteiro antes de encerrar a migração.

Não há garantia de restauração das contas externas ou dos serviços de autenticação. Também não se transfere autorização de uso de imagens; preserve créditos presentes nos arquivos e confira a origem. Um backup de código sem dados deve ser identificado como tal. O ZIP completo com dados reais é produzido apenas numa sessão administrativa autorizada.

## Comandos de validação

`python scripts/validar-exportacao-acervo.py /caminho/Acervo_Magico_Exportacao_Completa.zip` verifica CRC dos dois ZIPs, hashes dos manifestos, JSON/CSV e vínculos entre campanha, personagens e itens, sem imprimir dados secretos.

Para reativar os handlers no **projeto de destino**, copie cada `src/app/api/**/colecionaveis/**/legado.ts` sobre seu `route.ts` correspondente; reponha somente as integrações necessárias de `arquivo/acervo-integracoes`. Não faça isso no Hub já separado. O novo site precisa manter autenticação e autorização antes de servir os dados do snapshot.

O CSV protege textos que planilhas poderiam executar como fórmulas com um apóstrofo. Use JSON para uma reimportação sem transformação de strings.

Durante a separação, o Hub recusa exclusões definitivas de fichas/campanhas Wands & Wizards que possuam Acervo ou histórico legado, para impedir a cascata dos FKs atuais. Após validar a migração completa, retirar essa proteção de forma explícita no Hub. Arquivar uma ficha permanece disponível. Coleções cosméticas antigas de personagens avulsos continuam no JSON da ficha e podem ser guardadas pelo dono com o botão de exportação já existente; não são agregadas automaticamente ao pacote de uma campanha à qual não pertencem.

## Execução assistida da migração 0035 em staging

Configure `STAGING_DATABASE_URL` nas variáveis secretas do ambiente, apontando para um PostgreSQL **isolado**, com a estrutura anterior do Hub. Não envie o endereço com senha por chat. O comando não usa `POSTGRES_PRISMA_URL` como alternativa: essa variável é lida somente para recusar o mesmo alvo de produção, inclusive aliases diretos/pooler conhecidos do Supabase.

```bash
node scripts/preparar-inventario-staging.mjs --verificar
node scripts/preparar-inventario-staging.mjs --aplicar
node scripts/preparar-inventario-staging.mjs --verificar
```

`--verificar` é o padrão e abre uma transação somente leitura. Retorna código 2 quando faltam colunas, código 0 quando a migração está pronta e código 1 para erro/configuração incompatível. Não imprime conexão, credenciais ou conteúdo das fichas.

`--aplicar` usa uma transação com lock de migração, aplica a SQL 0035 quando nenhuma das duas colunas existe, completa um estado parcial compatível e aceita repetição. Não converte tipos incompatíveis nem apaga dados. Confere contagens de personagens e das três tabelas históricas. Bancos remotos usam TLS com validação de certificado; a conexão sem TLS fica restrita ao teste local em loopback.

O operador continua responsável por apontar para um banco isolado: o comando reconhece alvos iguais e aliases conhecidos, mas não descobre todos os possíveis roteamentos externos. A aplicação de staging deve usar esse mesmo banco já preparado. Este comando não configura serviços remotos nem publica ou faz merge do PR.
