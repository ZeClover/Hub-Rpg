# Estado e recuperação — 6 de outubro de 2026

O executor voltou após a falha de configuração. O ambiente trouxe um checkout limpo do Git remoto, HEAD f827c95; os arquivos locais anteriores de Pathfinder não estavam no snapshot. Agentes reconstruíram suas áreas a partir do contexto e das fontes reenviadas. Código e dados ficam agora separados por módulo, com geradores e testes recuperáveis.

D&D continua pausado. Não há alegação de recuperação das traduções anteriores de D&D; o checkout e o site consultado usam a versão antiga. Não substituir esse fato por uma porcentagem inventada. Antes de qualquer publicação, comparar novamente o Git remoto e o site atual para preservar trabalho de outros chats.

## Cobertura confirmada da reconstrução

- Player Core: 8 classes, 8 ancestralidades e 45 heranças, 40 biografias, 470 páginas de texto nativo em português. Índices de 879 talentos e 488 magias; somente a seleção individual revisada é mecanicamente selecionável.
- Player Core 2: 8 classes, 8 ancestralidades e 54 heranças, 73 talentos e 141 seções em português. Não é tradução integral das 322 páginas.
- GM Core: 36 guias, 13 tabelas e 120 equipamentos, incluindo 5 artefatos. Não é tradução integral das 338 páginas.
- Monster Core: 411 referências, com 14 blocos completos revisados e 397 ainda como referências; não importáveis como modelos jogáveis.

As quantidades revisadas de Player Core podem aumentar; conferir diretamente `somenteConsulta` e `revisao` no JSON atual. Contagem de páginas ou entradas não mede porcentagem de tradução integral. PDFs e originais OCR ficam fora de public. Grimório é nativo, não um visualizador PDF.

## Automação

O usuário exige cálculos automáticos. Escolher classe, perícia, equipamento ou opção pertence à pessoa; somar atributos, proficiências, CA, ataques, PV, recursos e ganhos pertence à ficha. Uma lacuna não pode ser apresentada como automação completa ou resolvida pedindo ao jogador para calcular à mão. Módulos ainda pendentes são declarados como pendentes; referências não revisadas não concedem efeitos automáticos.

## Verificação e publicação

Testes de navegador e API usam dados isolados e não alteram campanhas reais. A rodada de 6/10 passou em 458 testes unitários, 9 cenários isolados da API de ficha e 7 da declaração de iniciativa. O build passou. Navegador confirmou os 14 blocos revisados, bloqueio das 397 referências, compatibilidade dos dados salvos, 13 tabelas e 120 equipamentos. Alterações posteriores precisam de nova rodada; esses resultados não validam a automação integral dos livros. HTTPS de Supabase Auth respondeu 200. A consulta somente leitura SELECT 1 expirou no executor, inclusive na tentativa fora da restrição; persistência real neste ambiente ainda não foi validada.

A sessão CLI da Vercel não sobreviveu à troca de executor. `whoami` confirmou Logged out com diretórios de configuração permitidos. Será necessário novo login para publicar no projeto existente. Não criar outro projeto ou promover um build sem os testes. Não executar migrações: o novo registro do sistema é idempotente na criação autenticada.

Backup deve incluir commit local e bundle revisável; não presumir que alterações locais ou credenciais sobrevivem a outra troca do ambiente. Salvar configuração do ambiente e publicar o site são operações diferentes.

Cópia de segurança incremental fora do checkout: `/workspace/artifacts/hub-pathfinder-trabalho-2026-10-06.tar.gz` e patch das alterações rastreadas. Não contém autenticação nem PDFs.

## Rodada final da integração

414/414 cenários de criação/evolução inicial passaram com as opções de classe e deidade da bateria (níveis 1 e 2), após conferir ganhos obrigatórios. Esse percentual não equivale à tradução ou automação integral dos livros, nem cobre todos os níveis/combinações de talentos. Acesso a preparação concedido por divindade não cria magia conhecida ou espaço extra; referências pendentes continuam impedidas de executar efeitos.

Login da Vercel renovado pelo usuário, projeto existente `zezin2/hub-rpg` confirmado e vinculado. Publicação só é considerada concluída após verificação do deployment e domínio.

## Ampliação seguinte

Player Core recebeu 65 textos individuais de talentos de ancestralidade para consulta. Player Core 2 recebeu 37 talentos de classe e suas descrições individuais; efeitos sem executor permanecem somenteConsulta. Monster Core possui agora 52 blocos revisados. GM Core possui 39 guias e 19 tabelas, com as três runas de sombra executáveis no motor. Propriedades de armadura respeitam categoria, investimento, capacidade por potência e incompatibilidade entre versões. Não corresponde à conclusão dos livros.
