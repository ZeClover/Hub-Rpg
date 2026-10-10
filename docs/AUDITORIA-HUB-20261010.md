# Auditoria do Hub inteiro — 10/10/2026

Base preservada: `b41d4c7`. Branch de trabalho:
`recovery/auditoria-hub-completo-20261010`. A árvore estava limpa no início;
checkpoint e evidências anteriores às correções estão fora do repositório,
em `/workspace/artifacts/auditoria-hub-20261010`.

## Inventário inicial, antes das correções

| Gravidade | Sistema/componente | Problema ou investigação | Evidência e última versão | Correção necessária |
| --- | --- | --- | --- | --- |
| Crítica | D&D, SAO, Fabula Ultima, Kaizoku, The Celestials, Thrylikí e quatro fichas de NPC | Dois PATCH simultâneos permitem que o salvamento antigo termine depois e sobrescreva a última edição | Reproduzido nas dez fichas em `b41d4c7`, com respostas de rede atrasadas; não se trata de perda de função no histórico | Serializar salvamentos e enviar a edição mais recente pendente |
| Alta | Aparência/abas de SAO, Fabula, Kaizoku, Celestials, Thrylikí e NPC Celestials | Preferências locais com JSON válido mas formato inválido podem interromper a inicialização; todas as abas ocultas podem tornar recursos inacessíveis | `carregarPreferenciaAbas` presume um array e chama `.map`; reproduzido com `null` | Normalizar entradas, manter ordem válida, remover duplicatas e garantir uma aba visível |
| Alta | Campanha Livre | Mestre autorizado recebe `podeEditar: true`, mas a ficha usa `ehDono` e bloqueia sua edição | Reproduzido em navegador com o componente real de `b41d4c7`; contrato de edição pelo Mestre já existe na API | Usar a permissão de edição confirmada pelo servidor |
| Alta | Campanha Livre | PATCH imediatos e debounce do nome podem salvar dados antigos sobre edições posteriores | Fluxos de salvamento e captura de `dados` examinados | Serializar gravações e preservar o estado mais recente ao salvar o nome |
| Alta | Hogwarts legado | Flag de salvamento protege a atualização periódica, mas não serializa gravações | `salvarNoHub` examinado; deve manter o controle de versão existente | Enfileirar a última edição sem perder a proteção de versão |
| Média | D&D, Fabula, Kaizoku, Celestials e NPC Celestials | Tabelas ou linhas de controles transbordam em várias abas a 320/390 px | Reproduzido em navegador, com identificação dos elementos que ultrapassam a tela | Permitir rolagem dentro das tabelas e adaptação das linhas, sem cortar conteúdo |
| Investigação | Declarar iniciativa | No histórico disponível, o envio à Mesa aparece apenas no Pathfinder; outros sistemas têm cálculos locais ou ordem manual do Mestre | Busca `git log --all -S/-G`, branches remotas e rotas; primeiro envio em `ef63356` | Testar separadamente o fluxo existente e corrigir falhas comprovadas, sem inventar regras universais |
| Verificado | Estilo das fichas antigas | Painéis de aparência existem em cinco sistemas e NPC Celestials | Abertura real e navegação, desktop/celular; decisões #107/#116 | Testar cada controle e persistência, preservando a identidade de cada sistema |
| Decisão preservada | D&D, Campanha Livre e alguns NPCs | Não há painel completo de aparência no histórico disponível | D&D mantém painel de Token; decisões #168 e histórico distinguem sistemas sem Aparência | Não apresentar como remoção comprovada ou inventar implementação antiga |
| Decisão preservada | Pathfinder | Funções de rolagem foram removidas após a proibição de rolar dados no Hub | Histórico e instrução explícita do usuário | Preservar registro de resultados externos e recursos corretos; não restaurar rolagens |
| Decisão preservada | Cadastro de lore/universos | Páginas antigas foram removidas intencionalmente | `132ca3c`: reorganização documentada em torno das fichas | Não ressuscitar o produto anterior |

## Abrangência e método

Sistemas registrados: Pathfinder 2e Remaster, Kaizoku no Sho, Fabula Ultima,
SAO, D&D 5e, Campanha Livre, The Celestials, Wands & Wizards, Hogwarts legado
e Thrylikí Chelóna. Cada um é tratado separadamente. Também estão no escopo
as fichas de NPC, grimórios, escudos do Mestre, páginas do Hub, campanhas,
Mesa ao Vivo, navegação, autenticação, autorização, APIs e componentes comuns.

Todas as branches remotas foram consultadas, sem substituir branches locais.
O repositório possui histórico completo, não um clone raso. A primeira varredura
comparou funções em mais de 200 versões de nove fichas/controladores. Ausências
foram investigadas junto aos diffs e às decisões de produto; nomes de funções
substituídas não equivalem automaticamente a funcionalidades perdidas.

Foram inventariadas 69 rotas de API. Todas chamam `usuarioAtual`; isso é uma
verificação estrutural, e não prova suficiente de autorização. Os testes devem
verificar respostas, permissões, concorrência e fluxo de integração.

O relatório será complementado com resultados por sistema, correções, arquivos,
commits, publicação e limites efetivamente verificados.

## Correções concluídas

- `7f8e5e7`: salvamentos serializados em dez fichas clássicas/NPCs e Hogwarts legado; recuperação das preferências de abas em seis fichas; tabelas completas com rolagem interna e linhas adaptáveis. Nenhuma fórmula, catálogo, escolha de personagem ou regra foi substituída.
- `d76499a`: Campanha Livre respeita `podeEditar` do servidor, serializa gravações e mantém os dados mais recentes durante o debounce do nome. Controles se adaptam ao celular. A Mesa recupera preferências inválidas e a API rejeita rodada/índice de turno inválidos.
- Os scripts Node em CommonJS receberam a declaração de lint correspondente ao formato que já utilizavam. O teste antigo da API Pathfinder foi atualizado para carregar as dependências reais de Hogwarts/Wands & Wizards agora importadas pela rota compartilhada. Não foram simuladas as regras dos outros sistemas.

### Causas e histórico comprovável

`dd138fd` introduziu as preferências de abas que presumiam um array válido. A correção tolera formato inválido, IDs antigos, entradas repetidas e todas as abas ocultas; preserva a ordem válida e as novas abas existentes.

`046bbfc` incorporou edição pelo Mestre ao contrato de autorização compartilhado. A Campanha Livre continuou usando propriedade da ficha em vez de permissão de edição: uma integração incompleta, e não remoção comprovada de um botão. A correção usa o contrato atual.

Os salvamentos paralelos já existiam em `b41d4c7` e em versões anteriores das fichas. Foram reproduzidos com uma primeira requisição lenta e uma segunda rápida: antes, dez fichas terminavam com a edição antiga; depois, as dez mantêm a última edição, com no máximo uma gravação em curso. Não foi identificado um único merge que tenha removido uma implementação anterior correta.

A Mesa confiava no formato do JSON local e aceitava índices/rodadas sem limites. Testes específicos cobrem recuperação de preferências corrompidas e rejeição de números inválidos sem gravação.

Também foram diagnosticados e corrigidos controles estreitos na Campanha Livre e tabelas largas em oito grimórios/escudos. As correções não ocultam conteúdo nem aplicam `overflow:hidden` à página.

## Resultado por sistema

| Sistema | Testes funcionais realizados | Resultado |
| --- | --- | --- |
| D&D 5e | Ficha nova a partir de dados vazios, sete abas, guia com avanço/retorno, dano/PV, salvar/reabrir, nome/título, concorrência, Mestre/leitor, 320/390/1280 px | Passou. Painel completo de aparência ausente também no histórico; painel de Token preservado |
| SAO | Onze abas, aparência/cor/fonte/layout, recuperação de abas, guia, evolução/cancelamento, dano/PV, persistência, concorrência e permissões | Passou |
| Fabula Ultima | Sete abas, aparência, guia, evolução/cancelamento, dano/PV, persistência, concorrência e permissões | Passou |
| Kaizoku no Sho | Treze abas, aparência, guia, evolução/cancelamento, vitalidade, persistência, concorrência, permissões e tabelas no layout compacto | Passou |
| The Celestials | Treze abas, aparência, guia, evolução/cancelamento, dano/PV, persistência, concorrência e permissões | Passou |
| Thrylikí Chelóna | Seis abas, aparência, guia, progresso de nível/evolução/cancelamento, impacto/Vida, persistência, concorrência e permissões | Passou |
| Campanha Livre | Nome e XP intercalados, recursos, fila de gravação, salvar/reabrir, dono/Mestre/leitor, 320/390/1280 px, parser/aplicação nas unidades | Passou |
| Pathfinder 2e Remaster | 22 cenários de interface: guias, versão, falhas, escolhas, aparência por ficha, magias, equipamento, sessão, leitura, impressão e iniciativa declarada; nove testes da API; classes reais; compatibilidade de bestiário e grimório | Passou. Registro de resultado externo preservado; sem restaurar rolagens |
| Wands & Wizards | Criação completa, pausa/retomada/descarte, evolução 2–4 e escolhas do 6; seis escolas 1–18; recursos, grimório, varinha, sincronização das quatro Casas; 84 verificações do Acervo e 20 do painel do Mestre | Passou. Visual, modelos e animações preservados |
| Hogwarts legado | Cinco fluxos de acadêmico/varinha/família, Mestre e jogador, aparência, celular e nova regressão de salvamento concorrente | Passou. Fichas existentes preservadas; não recolocado no catálogo de criação |

As quatro fichas de NPC foram testadas separadamente: Fabula, SAO, Celestials e Thrylikí. Em todas: nome, recursos/derivados manuais ou dano, gravação/reabertura, concorrência, Mestre autorizado e leitura bloqueada. As que possuem abas foram percorridas em três larguras; NPC Celestials mantém aparência e guia. Não foram inventados guias de NPC inexistentes.

A bateria clássica percorreu **80 abas em três larguras**. Nenhuma dessas páginas terminou com erro JavaScript ou transbordamento horizontal da página. As tabelas largas continuam navegáveis dentro de seus próprios contêineres.

## Componentes compartilhados, segurança e publicação

- **608 testes de unidade**, zero falhas.
- **Oito testes da iniciativa**, incluindo concorrência na fila, autorização, limites e confirmação de declarações sem apagar resultados novos.
- **69 rotas / 94 handlers**: acesso sem sessão recusado com 401/404 antes de consultar o banco privado; resposta sem dados pessoais. A ficha compartilhada é a exceção pública intencional, testada separadamente.
- Para os dez sistemas, os handlers reais também foram testados com dono, Mestre, visitante e terceiro: compartilhamento em leitura, segredos exclusivos do Mestre, escrita negada a terceiros, criação de PJ/NPC com vínculo ao usuário correto.
- Os mesmos **94 handlers** foram consultados por HTTP contra o **servidor Next real** e recusaram acesso sem sessão. Páginas do Hub protegidas redirecionaram para `/entrar`; início, login, privacidade e créditos responderam normalmente.
- Mesa: declaração incorporada sem apagar condições, avanço/rodada, atalho que ignora campos de texto, sandbox sem publicação, recuperação de JSON inválido. Espectador sem controles de escrita. Painel de Vida consultando PJ/NPC e ajustando inimigo. Navegação de campanha por teclado, montando somente a aba ativa.
- **15 páginas de referência**: biblioteca Wands & Wizards, grimórios, bestiário e escudos do Mestre; abertura, busca disponível, ausência de assets faltantes/erro JavaScript e layout em 320/390/1280 px.
- `npm run lint`, `npm run build` e verificação de diffs passaram. O build não substituiu os testes de navegador.

### Limites e pendências explícitas

Não foi possível comprovar, no histórico disponível, uma declaração de iniciativa para a Mesa anteriormente existente fora do Pathfinder. Não foi criada uma regra universal nova como suposta “restauração”. Sistemas que não possuíam aparência completa também não receberam uma implementação inventada nesta auditoria.

Os fluxos autenticados foram exercitados com componentes e handlers reais, isolando sessão, rede de conta e banco em fixtures. Não houve login OAuth com a conta do usuário nem alterações em personagens/campanhas reais. A persistência foi verificada em reaberturas e respostas atrasadas; isso não equivale a executar todo CRUD autenticado contra o banco de produção. Novas migrações, alterações destrutivas e alterações de regras ficaram fora das correções.

## Arquivos e evidências

Arquivos de produto: as onze fichas HTML clássicas/legado, oito grimórios/escudos com tabelas largas, `src/app/campanha-livre/ficha-cliente.tsx`, o rastreador da Mesa, a rota de iniciativa e `src/lib/iniciativa-declarada.ts`.

Testes de regressão reutilizáveis: `scripts/testar-hub-fichas.cjs`, `testar-hub-react.cjs`, `testar-hub-autenticacao.cjs`, `testar-hub-referencias.cjs`, testes de iniciativa e o teste Hogwarts expandido. Os scripts de navegador aceitam `PLAYWRIGHT_CORE`; os testes React/API aceitam `ESBUILD`, para informar instalações locais dessas dependências.

Resultados: [fichas](auditoria-hub-20261010/fichas.json), [componentes React](auditoria-hub-20261010/react.json), [referências](auditoria-hub-20261010/referencias.json), [autenticação](auditoria-hub-20261010/autenticacao.json), [permissões/criação](auditoria-hub-20261010/permissoes-fichas.json), [HTTP real](auditoria-hub-20261010/apis-servidor.json).

Capturas comparáveis, com dados de teste:

- Kaizoku no celular: [antes](auditoria-hub-20261010/kaizoku-no-sho-grimorio.html-antes.png) / [depois](auditoria-hub-20261010/kaizoku-no-sho-grimorio.html-depois.png).
- Grimório Campanha Livre no celular: [antes](auditoria-hub-20261010/campanha-livre-grimorio.html-antes.png) / [depois](auditoria-hub-20261010/campanha-livre-grimorio.html-depois.png).
- Campanha Livre: [celular](auditoria-hub-20261010/campanha-livre-390.png) / [desktop](auditoria-hub-20261010/campanha-livre-1280.png).

Capturas adicionais de cada ficha e página de consulta estão em `artifacts/hub-auditoria`; capturas Wands & Wizards e Hogwarts permanecem nos diretórios de artefatos dos testes correspondentes. O checkpoint, inventário de funções/histórico e provas anteriores às correções permanecem em `/workspace/artifacts/auditoria-hub-20261010`.

## GitHub e Vercel

Branch de recuperação: `recovery/auditoria-hub-completo-20261010`.
Branch padrão existente: `claude/hub-rpg-organization-x1tbpd`.
Repositório: https://github.com/ZeClover/Hub-Rpg.
Site: https://hub-rpg-eight.vercel.app.

A integração utiliza avanço direto somente se a branch padrão ainda for ancestral da recuperação; nenhum histórico é sobrescrito. A verificação final de publicação confere `githubCommitSha`, estado Ready, alias de produção e conteúdo dos arquivos publicados contra o checkout. O registro dessa conferência ficará em `artifacts/hub-auditoria/publicacao.json` e será informado na entrega.
