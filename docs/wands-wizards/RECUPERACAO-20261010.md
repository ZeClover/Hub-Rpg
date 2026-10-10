# Recuperação e sincronização — 10/10/2026

## Diagnóstico comprovado

A publicação existente e o GitHub não representavam a mesma versão. Antes da
recuperação, o HEAD local era `c65397e`, enquanto a branch padrão remota,
`claude/hub-rpg-organization-x1tbpd`, estava em `f827c958`. Havia 18 commits
locais posteriores, além de alterações sem commit. A branch padrão não se chama
`main`; nenhuma branch foi renomeada ou substituída à força.

Os componentes atuais de Wands & Wizards não estavam preservados no histórico
Git anterior ao checkpoint. Esse é o defeito de sincronização confirmado:
uma publicação feita a partir do GitHub antigo não continha a implementação
avançada que estava no ambiente e na publicação manual.

A comparação por SHA-256 com a publicação `dpl_3G1bqGbg6PPQtCDXK8VAsvFJ73uo`
confirmou que HTML da ficha, CSS principal, renderizador de varinhas, caixa e
grimório já eram idênticos aos arquivos locais. `ficha.js` e `gabinete.js`
continham diferenças correspondentes ao trabalho recente de criaturas ainda
pendente de publicação. Não foi identificado um commit que tenha apagado o
tema atual. Não houve rollback visual nem reconstrução dos componentes.

## Preservação e mudanças

- Criada a branch `recovery/hogwarts-estabilidade-20261010` antes das alterações.
- Backup externo ao repositório: patch binário dos arquivos rastreados, arquivo
  dos arquivos não commitados, status inicial e checkpoint do HEAD.
- Commit `63f20ae`: preserva 153 arquivos de trabalho local, incluindo ficha,
  Casas, brasões, varinhas, formação, grimório, Acervo e suas APIs e migrações.
- Mantidos todos os commits anteriores, personagens e sistemas antigos.
- `scripts/testar-wands-wizards-visual.cjs`: inspeção e pausa da animação em
  uma única avaliação do navegador, evitando que o efeito termine entre duas
  chamadas sob carga. O teste continua exigindo animação em execução e
  interpolação real; não foi afrouxado para aceitar ausência do efeito.
- `.gitignore`: exclui capturas, vídeos de testes e caches Python dos próximos
  commits. Os assets públicos efetivamente usados pela ficha permanecem
  rastreados. Não foram incluídos segredos nem arquivos `.env`.

O checkpoint também preserva o trabalho anterior em Pathfinder e no Hogwarts
legado. As alterações de autorização acadêmica, versões de salvamento e cadastro
de sistemas foram revisadas. A recuperação não cria novas funcionalidades.

## Verificações realizadas

| Área | Resultado |
| --- | --- |
| Testes unitários do repositório | 606 passaram, nenhuma falha ou teste ignorado |
| Casas e identidade | Neutro e quatro Casas; cores estruturais distintas, brasões, contraste, estilo individual, descarte e persistência |
| Troca mágica | Linha, brasão e cores iniciam no mesmo quadro, com duração de 1,8 s e curva sincronizada; interpolação durante o percurso, trocas rápidas e cancelamento |
| Varinhas | Três madeiras, núcleos, comprimento curto/longo, flexibilidade, cabo, geometria intermediária, ausência de cortes e persistência |
| Primeira revelação | Cinco fases, estado salvo, abertura única, interrupção, pular, outro dispositivo e movimento reduzido |
| Grimório | 144 textos em português; índice e pergaminho, pesquisa e filtros, Minhas Magias/Índice Completo, contadores, Truques/Magias Regulares e salvar/reabrir |
| Criação e evolução | Guias na página, pausa/retomada, revisão com atalhos, escolhas e recursos de progressão, descarte, salvamento e somente leitura |
| Acervo | 84 verificações: cinco coleções, vazio, inspeção, filtros, Casa, permissões, recarga e celular |
| Criaturas | 26 verificações de navegador: silhuetas reais, quatro fases, fila, outra aba, offline, variantes, revogação e dois dispositivos |
| Administração | 20 verificações: cadastro, edição, busca, versão, histórico, recorte e concessão múltipla com repetição segura |
| APIs e banco de criaturas | 62 verificações de handlers e 10 verificações de SQL/migração em PGlite; autorização, consumo atômico e proteção contra duplicidade |
| Pathfinder | 22 cenários de navegador, incluindo criação/evolução, estilo, consulta, escolhas e ausência de rolagens no Hub |
| Hogwarts legado | Cinco fluxos: acadêmico, varinha, família/Herança, estilo e controles do Mestre |
| Compilação | TypeScript, lint dos componentes de criaturas e build Next.js passaram |

As verificações usam os componentes e handlers reais com contas e respostas de
teste. Não concedem itens nem alteram fichas reais. A persistência foi exercitada
com salvar/reabrir, descarte e retomada; transações foram verificadas em PGlite.
Isso não equivale a um teste autenticado na conta real do usuário em produção.

Capturas locais estão em `artifacts/wands-wizards/`, especialmente nas pastas
`paletas`, `casas`, `grimorio`, `acervo` e `criaturas`. Foram verificadas telas
de 320, 390, 768 e 1280 px ou superiores, conforme a seção, sem sobreposição ou
rolagem horizontal indevida. As suítes de navegador verificam erros JavaScript.

Uma execução concorrente do teste visual encontrou uma corrida no próprio teste;
a execução isolada e a versão corrigida passaram. A gravação de vídeo também
exigiu configurar o caminho local do FFmpeg instalado. Nenhuma dessas falhas
exigiu substituir o visual da ficha.

## Limites preservados

- Criaturas sem recorte transparente cadastrado mostram bloqueio e `???`;
  não recebem uma silhueta inventada. O Mestre pode adicionar o recorte da
  mesma ilustração. O catálogo não foi preenchido automaticamente.
- Descobertas são consultadas periodicamente enquanto a ficha está aberta;
  não se trata de uma conexão WebSocket instantânea.
- A revelação é reservada atomicamente antes de abrir: evita repetição entre
  dispositivos, mas uma interrupção abrupta após a reserva pode impedir a
  apresentação naquela concessão.
- Publicação e comparação dos arquivos publicados serão registradas no
  relatório de validação da publicação junto aos artefatos da recuperação.

## Procedimento de integração

Publicar primeiro a branch de recuperação. Atualizar a branch padrão somente
por avanço direto após nova consulta ao remoto; nunca usar force-push, reset
destrutivo ou apagar outras branches. Publicar a versão commitada no projeto
Vercel existente e comparar os arquivos servidos com os arquivos Git.
Executar novamente os testes do grimório e da transição de Casas usando os
assets realmente publicados, e verificar a recusa de acesso anônimo às APIs
protegidas. Registrar o SHA final, deployment e os resultados.
