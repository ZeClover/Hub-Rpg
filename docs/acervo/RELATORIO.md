# Inventário livre e extração segura do Acervo

Branch independente: `feat/inventario-livre-exportacao-acervo`, partindo de `d86abb2`. O PR de expansões Wands & Wizards permanece separado; nenhuma opção pendente foi integrada. Não houve publicação, alteração de dados de produção ou migração destrutiva.

## Inventário

- Nome, imagem por HTTPS, categoria livre, descrição extensa, quantidade, peso, propriedades mágicas, raridade, história/origem, efeitos descritos e anotações.
- Criar, editar, duplicar, filtrar, mover acima e remover; controles de leitura e edição seguem dono/Mestre/auxiliar.
- Wands & Wizards mantém os itens na estrutura `dados.inventario`, com rascunho, salvamento e descarte existentes. Os frascos e embalagens ilustrados, inspeção e consumo continuam funcionando. O consumo não concede figurinhas.
- Nas demais fichas, a seção “Inventário livre” usa as colunas independentes `inventarioLivre` e `versaoInventario` do personagem. Equipamentos do livro, inventários anteriores e seus motores de regras continuam intactos. A seção está disponível nas oito fichas HTML restantes, nas fichas de NPC que possuem página própria e em Campanha Livre.
- As colunas separadas evitam sobrescrever inventários com formatos distintos e não invalidam a versão de salvamento da ficha. Cada escrita verifica uma versão própria: duas janelas concorrentes resultam em sucesso e conflito, preservando a primeira gravação. A cópia/sandbox do personagem inclui seus itens livres.
- Os itens livres das outras fichas são salvos diretamente na conta e têm seu próprio botão “Exportar inventário”. Os botões de rascunho/descarte da ficha original continuam tratando seus dados originais. No Wands & Wizards, o inventário continua no fluxo de rascunho da ficha.
- Efeitos personalizados não são interpretados pelo motor de regras. Não há bônus, dano, CA, magias, recursos ou rolagens automáticas novos.
- Limites técnicos: 200 itens, nome de até 200 caracteres e categoria de até 10 mil (compatível com os registros anteriores), descrição/história/anotações de até 20 mil caracteres, propriedades/efeitos de até 10 mil caracteres. Quantidades inteiras de 0 a 9999 e peso por unidade de 0 a 100000. Imagens usam URLs HTTPS; não foi criado serviço de upload.

## Acervo desativado e preservado

A aba Colecionáveis, a montagem da galeria e das vitrines, as revelações automáticas e a administração comum da campanha/ficha foram retiradas da experiência ativa. A URL antiga de administração devolve página não encontrada.

Os oito métodos das sete rotas antigas devolvem HTTP 410, sem carregar banco, autenticação ou lógica de concessão. Seus handlers originais estão em arquivos `legado.ts` ao lado das rotas. Integrações originais da ficha e campanha estão em `arquivo/acervo-integracoes`. Os estilos, ilustrações, animações, categorias, modelos Prisma, migrações e lógica de silhuetas/revelação permanecem no repositório.

Exclusões definitivas de fichas/campanhas Wands & Wizards com catálogo, descobertas ou histórico são bloqueadas com HTTP 409 durante a migração. Isto evita a cascata dos FKs antigos. Arquivar a ficha continua permitido; fichas/campanhas sem Acervo e os demais sistemas mantêm sua exclusão normal. A proteção deve ser retirada somente após validar a migração futura. Exclusões diretas no banco continuam sendo responsabilidade administrativa e não devem ser executadas durante a preservação.

As tabelas `colecionaveis`, `acervos_colecionaveis` e `concessoes_colecionaveis`, incluindo os dados cosméticos antigos das fichas, não são apagadas nem atualizadas pela desativação. O prebuild não executa mais a preparação do banco do Acervo; passa a preparar o pacote privado de código.

## Download completo e privacidade

Na página da campanha Wands & Wizards, **somente o Mestre titular** encontra o detalhe “Backup privado do Acervo” e o botão **Baixar Acervo_Magico_Exportacao_Completa.zip**. O endpoint confere sessão e participação no servidor; jogadores, visitantes, auxiliares e Mestres de outra campanha são recusados. Cada pacote contém apenas os dados da campanha autorizada.

O ZIP contém:

- Código completo e dependências do Hub para reconstruir o legado, incluindo as integrações anteriores, frontend, backend, CSS, temas, animações, recursos e mídias locais, package-lock, esquema e migrações.
- Snapshot JSON consistente em transação RepeatableRead: catálogo com segredos, descobertas, quantidades, edições/variantes, referências de personagem/campanha, histórico inteiro de concessões/retiradas e coleções cosméticas antigas.
- JSON e CSV portáveis por conjunto, máscaras binárias em PNG, categorias, instruções de migração e manifesto SHA-256. O JSON é canônico; textos CSV que poderiam ser interpretados como fórmulas recebem apóstrofo de proteção.
- Relatório preciso de URLs externas e referências locais ausentes. Mídias externas não são baixadas por requisições arbitrárias do servidor. URLs e autoria/créditos existentes são preservados; disponibilidade e autorização da origem precisam ser verificadas no destino.

O service worker não cacheia a exportação, APIs do Acervo/inventário livre ou a administração antiga. Sua ativação remove somente os caches antigos dessas rotas; o cache offline dos demais sistemas permanece. Sem rede, o ZIP não é servido por cache após trocar de conta.

Não inclui `.env`, credenciais, cookies, contas ou e-mails. Não exporta a ficha mecânica completa nem os dados de outras campanhas. Nomes e identificadores dos personagens são dados privados administrativos: guarde o ZIP em local restrito. O concedente permanece como identificador opaco para mapear no destino.

O código comprimido é gerado em `private/acervo/`, fora de `public/` e do Git. A rota usa download por stream e inclui esses arquivos no empacotamento da função Next. Backups locais de validação também ficam fora do Git. **Os ZIPs gerados nos testes contêm dados sintéticos; não são um backup dos dados de produção.** O pacote com dados reais é produzido no download administrativo após disponibilizar este PR num ambiente com o banco adequado.

## Verificações

- 608 testes de regras existentes e dois testes novos de retenção passaram.
- Novo teste de campos/limites/imagens e persistência Wands & Wizards.
- PostgreSQL real descartável: migração aditiva exata sobre personagem existente, preservação do inventário anterior, escrita concorrente 200/409, versão da ficha intacta, cópia/sandbox, reabertura por outra conexão, permissões administrativas, bloqueio da exclusão em cascata, isolamento entre campanhas e reconstrução de catálogo/descobertas/histórico a partir do JSON/PNG exportado.
- Histórico sintético com 125 eventos: exportação sem o limite de 100 da antiga tela administrativa. Segredos e quantidade de três exemplares preservados.
- Reconstrução do código extraído do ZIP numa cópia temporária isolada: integrações e handlers legados repostos apenas na cópia, seis testes de regras e 84 verificações de navegador do Acervo passaram (cinco coleções, quatro Casas e celular).
- Validação dos ZIPs externo e interno, CRC, hashes, JSON, CSV, referências, máscaras e mídias locais. Cópia privada adicional do pacote validado.
- Navegador Chromium em desktop/celular: criação, edição extensa, duplicação, ordenação, remoção, salvar/reabrir, descarte Wands & Wizards, modo leitura, nenhuma consulta a colecionáveis e ausência de overflow. Botões voltam a funcionar após salvar.
- Campanha Livre: componente React executado no build real do Next, com criação, salvamento, reabertura e modo leitura em 390px; respostas de personagem/inventário sintéticas e service worker bloqueado somente no teste para preservar a interceptação.
- Servidor do build real: ficha e módulo públicos HTTP 200, acesso inválido ao inventário HTTP 404, rota antiga do Acervo HTTP 410 e exportação administrativa sem sessão HTTP 404. Os dois arquivos privados foram conferidos no manifesto de empacotamento da função Next.
- Regressões dos guias de criação/evolução, Grimório com 144 textos, modelos/animações/persistência das varinhas, paletas das cinco identidades e iniciativa nos dez sistemas.
- Cache offline verificado: download e APIs privadas sem armazenamento/fallback, remoção das respostas antigas e preservação do cache de outras fichas.
- Auditoria de autenticação: 97 handlers em 71 rotas; rotas aposentadas retornam 410 sem consultas. Tipos, lint e build de produção verificados.

Capturas: [desktop](capturas/inventario-desktop.png), [celular](capturas/inventario-mobile.png), [editor no celular](capturas/editor-mobile.png).

Os testes de banco usam somente `postgresql://hub_test@127.0.0.1:55439/hub_inventario`; o script recusa outros endereços. A redução do schema para simular uma ficha anterior ocorre exclusivamente nesse banco sintético descartável. Nenhuma tabela ou registro do banco real foi removido.

## Implantação e migração futura

1. Revisar o PR e validar a prévia em staging, usando uma cópia autorizada do banco.
2. Aplicar a migração **0035_inventario_livre** antes de executar a aplicação nova: são duas colunas aditivas em `personagens`, sem transformação dos itens anteriores. A numeração deixa a migração 0034 reservada ao PR separado de expansões. Não aplicar schema de desenvolvimento sobre produção.
3. O prebuild prepara o ZIP privado de código automaticamente. Se executar diretamente fora do build, usar `node scripts/preparar-exportacao-acervo.mjs`.
4. O Mestre titular baixa um pacote por campanha e guarda duas cópias privadas. Conferir com `python scripts/validar-exportacao-acervo.py caminho/do/Acervo_Magico_Exportacao_Completa.zip`.
5. Seguir [MIGRACAO.md](MIGRACAO.md) para o projeto futuro. Este PR não cria site/repositório novo nem desativa ou apaga as tabelas históricas.

A prévia não foi testada com sessão real de produção. O download administrativo foi exercitado pelo handler real com sessão sintética e PostgreSQL isolado. Mídias remotas e autenticação externa não são reproduzidas automaticamente pelo pacote.
