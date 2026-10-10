> A versão atual está descrita em [Acervo Mágico](ACERVO-MAGICO.md). As categorias e a administração abaixo documentam a primeira versão, substituída sem perder aquisições.

# Gabinete de Curiosidades

Acesso exclusivamente pela aba Colecionáveis da ficha Wands & Wizards. A demonstração sem personagem, os links compartilhados sem autorização e personagens de outros sistemas não abrem o acervo. Não há rota de coleção independente nem entrada na navegação principal do Hub.

O proprietário pode consultar sua própria coleção se participa da campanha. Mestres e auxiliares podem consultar personagens de suas campanhas. O servidor filtra o catálogo: objetos ainda não concedidos têm apenas identificador, categoria e estado bloqueado. Nome, descrição, imagem e data só aparecem após a descoberta. `localizacaoMestre` nunca é serializada na resposta do jogador, inclusive para descobertas adquiridas. Respostas privadas usam `private, no-store`.

## Administração

Na página de uma campanha Wands & Wizards, o Mestre abre “Gabinete de Curiosidades · administrar coleção”, cadastra os objetos, suas categorias, descrição, ilustração, localização secreta e possibilidade de repetição. Retratos de Sapos de Chocolate aceitam arquivos animados; a moldura também tem uma animação breve, desativada com movimento reduzido.

Concessões exigem personagem pertencente à campanha e papel MESTRE ou MESTRE_AUXILIAR. A quantidade e o registro da operação são gravados numa transação, com locks do objeto e personagem. Operações repetidas têm UUID persistido durante a tentativa do cliente; reenviar a mesma tentativa não duplica exemplares. Objetos únicos não admitem uma segunda aquisição. Quantidades repetidas não alteram o progresso de objetos distintos.

Na ficha, entrar novamente na aba ou usar Atualizar coleção consulta as descobertas recentes. As cinco categorias possuem progresso, busca entre descobertas e filtro para mostrar somente encontrados. Inspeção funciona como diálogo acessível, com fechamento por Escape e retorno do foco.

## Persistência e limites

Três tabelas aditivas: `colecionaveis`, `acervos_colecionaveis` e `concessoes_colecionaveis`. Coleções permanecem vinculadas ao personagem e à campanha original mesmo se ele mudar de campanha. O seletor mostra campanhas atuais/históricas que o usuário continua autorizado a consultar. Não há modificação de `Personagem.dados`, de atributos, regras, recursos, inventário ou versões da ficha durante concessões.

O antigo campo cosmético `colecaoFigurinhas` é preservado nos dados existentes; não é importado como descoberta concedida pelo Mestre e não é mostrado como um segundo álbum no inventário. Sapos de Chocolate continuam consumíveis, mas seu consumo na ficha não gera automaticamente uma aquisição do Gabinete.

A migração 0031 é idempotente e adiciona somente as novas tabelas, constraints, índices e RLS. Os papéis públicos Supabase não podem acessar diretamente essas tabelas. O script `preparar-gabinete.mjs` aplica a migração transacionalmente no build Vercel usando a conexão existente do projeto; fora da publicação não acessa o banco remoto. Uma falha bloqueia o novo deploy e preserva a versão anterior.

## Verificação

- `node --test --experimental-strip-types src/lib/colecionaveis/regras.test.ts`
- `node scripts/testar-gabinete-api.cjs` — handlers reais com sessão e banco isolados.
- `node scripts/testar-gabinete-banco.cjs` — PostgreSQL local via PGlite, constraints, RLS e persistência após reabrir.
- `node scripts/testar-gabinete-browser.cjs` — ficha real, dados controlados, navegação, inspeção, filtros, recarga, erros, movimento reduzido e telas 320/390/768 px.
- `node scripts/testar-gabinete-mestre.cjs` — componente administrativo real com APIs simuladas, cadastro, edição e recuperação de concessão depois de falha de rede.

Capturas em `artifacts/wands-wizards/gabinete`. Os dados das capturas são de teste; nenhuma descoberta é concedida a personagens reais pelos testes.
