# Decisões do Hub RPG

Registro das decisões tomadas na sessão de organização inicial (24/08/2026).
Este arquivo é a fonte da verdade. Toda decisão nova entra aqui.

## 1. O que o Hub é

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Natureza | Aplicação web interativa (não é só um repositório de arquivos) |
| 2 | Plataforma | Site na web, usável no celular e no PC |
| 3 | Público | Zé (mestre) + jogadores |
| 4 | Acesso | Login com Google, aberto a qualquer conta Google |
| 5 | Custo | Zero — apenas planos gratuitos |
| 6 | Escala | Até ~10 pessoas |
| 7 | Identidade | Nome "Hub RPG", tema escuro (dark fantasy: fundo escuro, tipografia com peso, detalhes em âmbar/dourado) |

## 2. Escopo de conteúdo

| # | Decisão | Escolha |
|---|---------|---------|
| 8 | Universos | Darkrem, Ometion, sistema SAO, Thrylikí Chelóna — **e todos os futuros** |
| 9 | Universo x Sistema | **Separados.** Universo = mundo (lore, lugares, NPCs). Sistema = regras (atributos, dados, perícias). Uma campanha combina um universo + um sistema |
| 10 | Campanhas | Várias mesas em paralelo. Cada uma com seu universo, sistema, jogadores e fichas |
| 11 | Entidades cadastráveis | Personagens, NPCs, lugares, facções, itens, magias, criaturas, divindades, eventos históricos, famílias, registros de sessão |
| 12 | Dungeon do Dia | **Fora do Hub.** Continua nas skills e documentos |

## 3. Permissões e segredos

| # | Decisão | Escolha |
|---|---------|---------|
| 13 | Segredo do mestre | **Campo a campo.** Qualquer campo de qualquer ficha pode ser marcado como "só mestre" |
| 14 | Jogadores podem | Editar a própria ficha + contribuir com lore (diários de personagem, notas de sessão, teorias) |
| 15 | Criação de personagem | Assistente passo a passo, com validação das regras do sistema |

## 4. Motor de regras

| # | Decisão | Escolha |
|---|---------|---------|
| 16 | Profundidade | **Motor de regras completo.** O Hub conhece as regras: valida criação, aplica status, calcula dano, controla progressão |
| 17 | Sistemas novos | **Cada sistema é um módulo de código sob medida.** Zé recusou o modelo híbrido (arquivo de configuração) porque quer fidelidade máxima às regras de cada sistema |
| 18 | Consequência aceita | Todo sistema novo exige uma sessão de desenvolvimento. Mitigação: uma interface de módulo bem definida, para que escrever um sistema novo seja previsível e rápido |
| 19 | Primeiro sistema | **Fabula Ultima** |
| 20 | Rolagem de dados | Dentro do Hub, com log compartilhado ao vivo — mas **sem pressa**, entra numa fase posterior |

## 5. Operação

| # | Decisão | Escolha |
|---|---------|---------|
| 21 | Mesas | **Online** (Discord). O Hub precisa de estado compartilhado ao vivo no painel de sessão |
| 22 | Imagens | Upload é importante: retratos, mapas, brasões. Compressão automática por causa do plano gratuito |
| 23 | IA dentro do app | **Não.** A Claude constrói o Hub e ajuda a popular conteúdo por fora (Claude Code). O site em si não tem IA — sem chave de API, sem custo |
| 24 | Conteúdo existente | Está espalhado. Duas frentes: (a) Zé envia os arquivos e a Claude migra; (b) o Hub ganha uma tela de importação (colar texto / subir arquivo → vira ficha) |
| 25 | Ordem de construção | Cadastro base → Fichas → Wiki de lore → Painel de mesa |
| 26 | Ritmo | Fatias usáveis, uma por vez. Cada etapa vai pro ar funcionando antes da próxima começar |
| 27 | Nível técnico do Zé | Não programa, mas **quer aprender no caminho.** Código comentado em português, explicações sem jargão |
| 28 | Sistema de login | **Supabase Auth**, em vez de um login montado à mão. Ele cuida de sessão, expiração e segurança de token — as partes que dão errado feio quando são feitas do zero. A credencial no Google Cloud Console continua sendo necessária |

## 6. Como o cadastro se organiza

Decidido em 27/08/2026, depois da primeira versão do cadastro se mostrar rasa
demais na prática.

| # | Decisão | Escolha |
|---|---------|---------|
| 29 | Organização | **Pastas criadas pelo Zé**, e **pasta dentro de pasta**, sem limite de profundidade. Não é lista plana |
| 30 | Pasta x modelo | **Convivem.** O *modelo* diz quais campos a ficha tem (Cidade tem população e governo); a *pasta* diz onde ela está guardada. Um NPC pode morar na pasta "Porto Cinza" e outro na "Corte do Norte" |
| 31 | Onde a ficha mora | **Uma pasta só**, como arquivo no computador, mais **etiquetas livres** que cruzam pastas. Um NPC na pasta "Porto Cinza" com etiqueta "culto do Véu" aparece nas duas buscas, sem cópia |
| 32 | Origem dos modelos | Desenhados em conversa com a Claude usando a skill `criador-de-fichas`, e depois cadastrados no Hub. Editáveis pelo Zé |
| 33 | Tipos de campo | Texto curto, texto longo, número, lista de opções, **ligação com outra ficha** e imagem |
| 34 | Ligação entre fichas | Campo que aponta para outra ficha ("Fica em", "Lidera"). É o que transforma o cadastro em wiki navegável, e não uma lista de textos soltos |

## 7. Virada de escopo (27/08/2026)

Depois da primeira versão do cadastro se mostrar rasa demais, o Zé mudou o
rumo do projeto. As decisões abaixo **substituem** o que conflitar com as
seções anteriores.

| # | Decisão | Escolha |
|---|---------|---------|
| 35 | O que o Hub é | **Fichas de personagem** nos sistemas do Zé. Deixa de ser um cadastro de lore |
| 36 | Cadastro de lore | **Sai do projeto.** As telas de universo e cadastro e as tabelas de lore serão removidas. Isso anula, na prática, as decisões #9, #11, #29 a #34 |
| 37 | Kaizoku no Sho | Sistema homebrew de One Piece (adaptação do *Shinobi no Sho*). Ficha completa já existe em `ZeClover/Ficha-Op`, como arquivo único com armazenamento no navegador |
| 38 | Destino do Kaizoku | **Migra para o Hub**, com login e banco, aproveitando o motor de regras que já funciona. Resolve a limitação que o próprio README dele admite: ficha presa a um aparelho |
| 39 | Próximo sistema | **Fabula Ultima** |
| 40 | Método de construção | **Arquivo único primeiro**, para acertar as regras rápido; migração para o Hub depois. Foi o caminho que o Kaizoku seguiu sem querer, e funcionou |
| 41 | Fonte das regras | Os PDFs da biblioteca do Zé no Google Drive (edições brasileiras da Jambô) |

O que **continua valendo** das decisões anteriores: custo zero (#5), login com
Google (#4, #28), tema escuro (#7), permissão de campo no servidor (#13),
cada sistema como módulo de código (#17), uma fatia por vez (#26) e código
explicado em português (#27).

## 8. Como as fichas vivem dentro do Hub (28/08/2026)

| # | Decisão | Escolha |
|---|---------|---------|
| 42 | Onde ver os personagens | **Só em `/fichas`.** Vira a lista de todos os seus personagens, de todos os sistemas. Abrir um leva direto pra ficha dele, sem seletor por dentro |
| 43 | Criar personagem | Botão **"+ Criar ficha"** em `/fichas` → escolhe o sistema → abre a ficha em branco daquele sistema, pronta pra editar |
| 44 | Salvamento | Cada campo salva no banco sozinho, sem botão de salvar. Substitui o exportar/importar JSON de hoje, que era o jeito de contornar não ter conta |
| 45 | Navegação | Ficha aberta ganha um "← Fichas" no topo, voltando pra lista |

## 9. Mestre vendo a ficha do jogador (28/08/2026)

O Zé perguntou como veria a ficha de um jogador sem montar um sistema de
campanha inteiro (mesa, convite, papel de mestre/jogador) — só isso ainda
não existe no Hub.

| # | Decisão | Escolha |
|---|---------|---------|
| 46 | Como compartilhar | **Link de leitura**, não campanha. O dono liga um interruptor "Compartilhar" na própria ficha; a partir daí, qualquer um com a URL dela (o id, um UUID, é o segredo do link — como "qualquer um com o link" do Google Docs) abre em modo leitura, **sem precisar de conta**. Nunca dá direito de editar: isso continua exigindo estar logado como dono |
| 47 | Por que não campanha ainda | Campanha (mesa, convite, mestre/jogador) é depois — o link resolve o caso de uso de hoje ("me manda a ficha") com uma coluna no banco, em vez de três tabelas novas |

## 10. Campanhas básicas (28/08/2026)

Chegou a hora da campanha que a decisão #47 tinha adiado. O Zé descreveu o
fluxo que queria: ele cria a campanha, manda um link, o jogador escolhe qual
ficha dele entra ali (só as do sistema certo aparecem), e só o mestre vê a
ficha do jogador — nunca o contrário. Ele também apontou, sem eu ter
perguntado, que o Kaizoku no Sho não tem a base técnica (o "Modo Hub") que o
Fabula Ultima tem, então campanha daquele sistema ainda não funcionaria de
verdade — e preferiu seguir com a campanha básica em vez de parar pra
consertar isso agora.

| # | Decisão | Escolha |
|---|---------|---------|
| 48 | Convite | O próprio endereço da campanha (`/campanhas/[id]`, um UUID) é o convite — mesma lógica da decisão #46. Não existe senha nem código de convite separado |
| 49 | Quem é mestre | Uma `Participacao` com papel MESTRE, não um campo "dono" na campanha — o schema já tinha essa tabela pronta, sem nunca ter sido usada |
| 50 | O que o mestre vê | Lista de jogadores com a ficha que cada um ligou, e pode criar fichas de inimigo/NPC (mesmo `Personagem`, dono = o mestre). Nunca pode editar a ficha de um jogador — só ler |
| 51 | O que o jogador vê | Só a própria ficha nesta campanha, filtrada por sistema. Nunca vê a ficha de outro jogador nem os inimigos do mestre |
| 52 | Kaizoku fica de fora por agora | Sem "Modo Hub" (não entende `?id=`, só salva no navegador), criar ficha dele pela conta hoje resultaria numa ficha morta. Novo campo `salvaNoHub` em `src/lib/sistemas.ts` esconde Kaizoku de "+ Criar ficha" e de "Criar campanha" até ele ganhar essa base — fatia própria, futura |
| 53 | Catálogo de monstros | Fora de escopo por agora. O Bestiário de Fabula Ultima é livro à parte, com ficha de criatura diferente da de personagem — bem maior que esta fatia. Enquanto isso, inimigo é ficha comum, preenchida à mão |

**Decisão #52 revertida no mesmo dia:** o Zé tinha uma campanha de Kaizoku
pra narrar, então a base ("Modo Hub") que a decisão #52 tinha adiado virou
prioridade imediata em vez de fatia futura. Kaizoku no Sho ganhou o mesmo
mecanismo do Fabula Ultima (`?id=` na URL, salvar/ler via
`/api/personagens/[id]`, modo leitura, Compartilhar) e `salvaNoHub` virou
`true` pra ele. Já entra em "+ Criar ficha" e em "Criar campanha" de novo.

**Decisão #53 também revertida, no mesmo dia:** o Zé mandou 4 PDFs (o
capítulo de criação de NPC e o Bestiário do Livro Básico, mais os
capítulos de Antagonistas dos três Atlas) e pediu o catálogo pronto.

## 11. Ficha de Inimigo/NPC e catálogo (28/08/2026)

| # | Decisão | Escolha |
|---|---------|---------|
| 54 | Ficha própria, não reaproveitada | Um inimigo não tem classes nem poderes de catálogo — é sobretudo texto livre (Ataques, Feitiços, Outras Ações, Regras Especiais), igual o Bestiário do livro apresenta. Por isso ganhou arquivo próprio, `fabula-ultima-inimigo.html`, em vez de virar mais uma aba da ficha de jogador |
| 55 | Só em Modo Hub | Sem roster local avulso — só existe ligada a uma campanha, criada pelo botão "+ Adicionar ficha de inimigo". Não faz sentido um inimigo existir fora de mesa nenhuma |
| 56 | Extração do catálogo por agentes em paralelo | Os 4 PDFs foram processados por 4 agentes ao mesmo tempo (um por livro), cada um com a mesma instrução: extrair só MECÂNICA (números, fórmulas, custos, alvo/duração, afinidades, nomes de ataque/feitiço/regra) e nunca prosa (história, táticas, falas entre aspas, traços de personalidade) — a mesma linha já seguida no resto da ficha desde o início do projeto, agora testada em escala (108 fichas) |
| 57 | Números calculados, mas editáveis | Um botão "Recalcular pela fórmula do livro" (pág. 303) preenche PV/PM/Iniciativa/Defesa/Defesa Mágica a partir do nível, espécie/papel e atributos — mas os campos continuam número solto, editável à mão, porque o próprio livro trata a criação de NPC como processo com julgamento do mestre, não uma fórmula pura (vilões “na mão” fogem do padrão de propósito) |

## 12. Manual do Mestre e Escudo do Mestre (28/08/2026)

| # | Decisão | Escolha |
|---|---------|---------|
| 58 | Manual do Mestre é um campo, não uma tabela | Uma coluna de texto livre na própria `Campanha`, não uma lista de "entradas" estruturadas — o pedido era "criar quando precisar", e um bloco de anotações já resolve isso. Fica pra depois virar algo mais estruturado, se precisar |
| 59 | Permissão por ausência de consulta | Igual o resto do Hub filtra por dono, aqui a proteção é não buscar o campo: a página só consulta `manualMestre` depois de confirmar (com outra consulta já feita) que quem está olhando é mestre da campanha. Pra jogador, essa segunda consulta nunca roda |
| 60 | Escudo do Mestre é estático e por sistema, não por campanha | O conteúdo (como fazer um teste, tabela de Dificuldade, ações de conflito) é igual pra qualquer mesa do mesmo sistema — não precisa de banco, é uma página HTML de referência só. Cada sistema aponta pra sua própria página em `src/lib/sistemas.ts` (`escudoMestre`), do mesmo jeito que já aponta pra ficha de jogador e de inimigo |

## 13. Excluir campanha, remover e sair (28/08/2026)

O Zé pediu para poder excluir uma campanha, tirar um jogador dela, e o
próprio jogador poder sair.

| # | Decisão | Escolha |
|---|---------|---------|
| 61 | Bug de banco encontrado antes de mexer | A migração 0001 tinha criado o vínculo `personagens.campanhaId → campanhas.id` como `ON DELETE CASCADE`, contradizendo o `schema.prisma`, que sempre disse `SetNull`. Do jeito que estava no banco, excluir uma campanha **apagaria de verdade** as fichas de personagem ligadas a ela — inclusive fichas de jogador. Corrigido pela migração `0006_corrigir_delecao_personagem_campanha.sql`, que recria a constraint como `ON DELETE SET NULL`. Precisou ser corrigido antes de ligar o botão de excluir |
| 62 | Excluir campanha apaga a campanha, não as fichas | As fichas ligadas (de jogador ou de inimigo) só soltam — `campanhaId` volta a `null`, viram fichas avulsas de novo. Só quem é mestre pode excluir |
| 63 | Remover jogador e sair usam a mesma rota | `DELETE /api/campanhas/[id]/jogadores/[usuarioId]` serve tanto para o mestre remover alguém quanto para o próprio jogador sair — a permissão dentro da rota é "sou eu mesmo, ou sou o mestre desta campanha". A ficha do jogador removido também só solta, nunca é apagada. O mestre nunca pode ser removido por essa rota — pra encerrar a mesa de vez, é "Excluir campanha" |

## 14. Sistema SAO — chassi (28/08/2026)

O Zé pediu pra estudar Sword Art Online, Overgeared e Shangri-La Frontier
antes de desenhar o sistema, porque o traço que ele quer no homebrew é o
personagem **saber que está dentro de um jogo** — enxergar PV, nível e nome
de golpe na própria tela, do mesmo jeito que o jogo mostra. Depois da
pesquisa, as decisões abaixo fecharam o chassi (as sete perguntas de
`ARQUITETURA.md`), decisão #17.

| # | Decisão | Escolha |
|---|---------|---------|
| 64 | Morte | **Penalidade forte, sem permadeath** (estilo Overgeared/Satisfy). Chegar a 0 PV não mata de vez: o personagem "renasce" num ponto de respawn, perde XP na proporção do nível, e há chance de derrubar um item equipado no lugar onde caiu |
| 65 | Combate | **Híbrido.** Golpes assistidos pelo sistema (Sword Skills, estilo SAO) conseguem mais dano mas deixam a condição "Vulnerável (pós-motion)" depois de usados; ataque livre usa só o atributo, sem bônus e sem essa vulnerabilidade — igual o SAO original permite os dois |
| 66 | Resolução de teste | **Reaproveita o estilo do Fabula Ultima**: dois dados (d6 a d12, um por atributo) somados contra uma Dificuldade. Duplo 6+ é sucesso crítico, duplo 1 é falha crítica — familiar pra quem já tem ficha nesse sistema |
| 67 | Magia | **Existe**, ao contrário do SAO original (que não tem magia) — atributo Mente cobre magia e PM, junto de Força/Agilidade/Vontade |
| 68 | Classes | **Multiclasse sem limite** (estilo Overgeared): o personagem acumula quantas classes quiser, cada uma numa de três categorias (Combate, Produção, Outras). O Nível geral do personagem é a soma dos níveis de todas as classes |
| 69 | Progressão de skill | **Sobe com o uso**, não por escolha em lista (estilo Overgeared): cada skill tem um estágio (Iniciante → Intermediário → Avançado → Mestre) com 10 níveis internos, avançados um a um conforme aparece em jogo |
| 70 | Habilidades Únicas | **Entram, como recurso raro.** Campo separado na ficha, começa vazio — não é escolha normal de criação, só o mestre libera quando fizer sentido na história, igual as 10 do SAO original |

O chassi (`public/sao.html`) ficou pronto com essas sete respostas, um
catálogo-semente de 7 classes (sem poderes próprios ainda) e o painel de
status (PV/PM/Defesa/Nível) sempre visível. Fica de fora desta fatia, pra
fatias futuras: catálogo real de poderes por classe, golpes/magias de
referência prontos pra escolher (hoje é tudo texto livre), inventário e o
Modo Hub (arquivo único primeiro, decisão #40).

## 15. Sistema SAO — ficha jogável (28/08/2026)

Zé pediu pra completar de uma vez o que o chassi tinha deixado de esqueleto:
poderes de classe de verdade, mais classes, catálogo de golpes e magias, o
Switch, e equipamento com raridade e durabilidade.

| # | Decisão | Escolha |
|---|---------|---------|
| 71 | Tamanho do catálogo de classes | **Catálogo grande agora (12+).** Cresceu das 7 iniciais pra 12: Espadachim, Arcanista, Batedor, Lanceiro, Arqueiro (Combate); Ferreiro, Alquimista, Encantador, Cozinheiro (Produção); Mercador, Domador, Curandeiro (Outras) |
| 72 | Durabilidade de equipamento | **N usos até quebrar.** Cada item tem uma durabilidade máxima; "Usar" desconta 1, "Reparar" volta ao máximo. Durabilidade máxima 0 = item que não desgasta |
| 73 | Raridade de item | **6 níveis, estilo Overgeared:** Comum, Incomum, Raro, Épico, Lendário, Único — cada um com uma sugestão de bônus, mas o bônus de verdade continua sendo o que a pessoa digitar no item |
| 74 | XP e nível | **Continua manual**, como no chassi — o mestre decide o ritmo, sem tabela de XP fixa por enquanto |

Com essas respostas, `public/sao.html` ganhou: 60 poderes de classe (5 por
classe, comprados com pontos de poder = nível investido nela, mesma lógica
do Fabula Ultima); um catálogo de 13 Golpes por tipo de arma e 12 Magias
por escola, ambos com botão "+ Do catálogo" que preenche a linha sozinha
sem travar quem preferir digitar a própria; um card de Switch (parceiro,
papel, combo ativo); e uma aba de Equipamento com peso ligado à Força,
raridade e durabilidade — item equipado e não quebrado soma sozinho no
derivado certo (Defesa, Defesa Mágica, Iniciativa, PV ou PM máximos), igual
os acessórios automáticos do Fabula Ultima.

## 16. Sistema SAO — crafting e economia (28/08/2026)

Parte B: Ferreiro, Alquimista, Encantador e Cozinheiro ganham crafting de
verdade, e entra a economia (moeda e loja).

| # | Decisão | Escolha |
|---|---------|---------|
| 75 | Nome da moeda | **Ouro e Prata, do Overgeared** (100 Prata = 1 Ouro) — termo genérico o bastante (qualquer MMO de fantasia usa) pra não esbarrar em direito autoral, só a proporção exata é a mesma do livro |
| 76 | Profundidade do crafting | **Receita com materiais nomeados** — "2 Couro de Lobo, 1 Minério de Ferro", não um "ponto de material" genérico |
| 77 | Estoque de materiais | **Lista de materiais nomeados com quantidade**, separada do inventário de equipamento |
| 78 | Loja | **Tela de comprar/vender** — desconta/soma da carteira sozinho, em vez de só carteira + preço pro mestre resolver na mesa |

No meio da sessão, o Zé pediu mais uma coisa: além do catálogo de receitas
prontas, um jeito de **criar a própria receita e deixar salva** — não só
usar as 8 do sistema. Virou o card "Suas Receitas": mesmo formato de dado
de uma receita de catálogo (nome, classe dona, lista de materiais, item que
sai), só que escrito pelo jogador e mantido na ficha dele.

Dois bugs de verdade apareceram nos testes automatizados e foram corrigidos
antes de fechar a fatia: o botão "Fabricar" não reagia à quantidade de
material digitada até trocar de aba (mesma causa do bug de peso da fatia
anterior — o campo salvava sem redesenhar a tela); e a função de gastar
Prata zerava o Ouro *antes* de reler o total da carteira, corrompendo a
conta toda vez que uma compra descontava dinheiro.

## 17. Restrições registradas

**Fabula Ultima é um sistema comercial de terceiros.** O Hub codifica as *mecânicas* (fórmulas, nomes de atributos, lógica de dados, condições de status). O Hub **não** reproduz o texto do livro — descrições de classe, texto de habilidades, ilustrações. Conteúdo descritivo no Hub é o que Zé escrever. Isso vale especialmente porque o acesso é aberto a qualquer conta Google.

**As tabelas estão trancadas para acesso externo.** O Supabase publica uma API
sobre as tabelas do banco, e a chave pública do projeto fica visível no
navegador de qualquer visitante. A migração `0002_fechar_tabelas.sql` ligou a
trava de linha (RLS) sem cadastrar nenhuma permissão e revogou o acesso dos
perfis públicos — o banco recusa todo acesso por esse caminho. O Hub continua
funcionando porque o servidor conecta direto no Postgres, como dono. Executada
em 27/08/2026.

**Permissão de campo é do servidor, não da tela.** Um campo marcado como "só mestre" nunca pode ser enviado ao navegador de quem não é mestre daquela campanha. Esconder na interface não é suficiente.

**Plano gratuito é uma restrição de projeto, não um detalhe.** Imagens comprimidas na subida, banco enxuto, nada que exija processo rodando 24h.
