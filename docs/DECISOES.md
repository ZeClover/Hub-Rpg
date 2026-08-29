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

## 17. Sistema SAO — mundo e mesa (28/08/2026)

Parte C: o que o mestre precisa pra rodar uma sessão — ficha de inimigo,
chefe de andar, andares, PvP, reputação e guilda.

| # | Decisão | Escolha |
|---|---------|---------|
| 79 | Ficha de Inimigo | **Agora, arquivo próprio local** (`public/sao-inimigo.html`) — mesmo caminho do jogador, sem Modo Hub ainda. Não reaproveita a ficha de jogador (mesma decisão do Fabula Ultima, #54) |
| 80 | Chefes de Andar | **Mecânica robusta**: Fases (gatilho + mudança de comportamento), Ataques de Área separados, e um Relógio de Batalha (clock de segmentos pro objetivo do grupo na cena) |
| 81 | Andares/Mapa | **Campo simples**: andar atual + Zona (Segura/Masmorra) na ficha de jogador, sem virar um sistema de progresso de campanha à parte |
| 82 | PvP, Reputação e Guilda | **Tudo**: Duelo formal, Títulos com "como o resto do jogo vê" (Admirado/Neutro/Malvisto), e um cartão de sócio de Guilda (rank, papel, benefício) — ainda sem registro compartilhado entre fichas (isso pede Modo Hub) |

Saiu desta fatia: `public/sao-inimigo.html` (categoria Comum/Elite/Chefe de
Andar com multiplicador ×1/×2/×3 de PV/PM, igual o Fabula Ultima faz com
soldado/elite/campeão) e `public/sao-escudo-mestre.html` (referência
estática, sem JS, cobrindo tudo do sistema numa página só). `src/lib/
sistemas.ts` já aponta pros dois — ficam inertes até o SAO ganhar Modo Hub
e campanha própria (decisão #52), mas prontos pra esse dia.

## 18. Sistema SAO — corpo real, permadeath e falha de chefe (28/08/2026)

Parte D: a camada que mais separa este sistema de um RPG comum — "o
personagem sabe que está num jogo" (o pedido original do Zé pra este
sistema inteiro) implica que existe alguém de carne e osso plugado nele.

Sem pergunta nova em aberto desta vez — o desenho já tinha saído definido
quando o Zé aprovou a lista de fatias, então fui direto pra implementação.

O que entrou:

- **Corpo Real** — card na aba Mundo: onde o corpo está, quem cuidaria
  dele, e um interruptor "em risco agora" que dá ao mestre uma alavanca de
  tensão fora do jogo (alguém mexendo no equipamento, um apagão) sem
  precisar arriscar o personagem dentro dele
- **Permadeath opcional por mesa** — a decisão #64 já tinha fixado "sem
  permadeath" como padrão do sistema, registrando que cada mesa podia
  decidir diferente. Virou um interruptor de verdade no card de
  Penalidade de Morte: ligado, troca completamente o card (aviso forte +
  "personagem morreu" + como aconteceu) em vez de mostrar XP/item de
  penalidade — é por personagem, não por campanha, porque campanha ainda
  não existe pro SAO (decisão #40)
- **Falha do Chefe** — o golpe do Shangri-La Frontier, na ficha de
  inimigo: uma fraqueza específica (como descobrir, como explorar,
  descrição, se já foi descoberta), pensada pra combinar com o poder
  Detectar Falha do Batedor (Parte A) — recompensa estudar o encontro em
  vez de só bater mais forte

Testado de ponta a ponta com Playwright: Corpo Real persistindo, o card de
Penalidade trocando de conteúdo ao ligar/desligar permadeath (e o campo
padrão sumindo/voltando da tela), morte permanente registrando a causa,
Falha do Chefe salvando e sobrevivendo a um recarregamento de página.

## 19. Sistema SAO — Modo Hub (28/08/2026)

Última fatia do Sistema SAO: salvar na conta, aparecer em `/fichas`, e
campanha de verdade — o mesmo caminho que o Fabula Ultima e o Kaizoku no
Sho já tinham percorrido (decisão #40). Sem pergunta nova em aberto: o
mecanismo já estava definido por precedente, então fui direto pra
implementação, só adaptando pros nomes de `public/sao.html` e
`public/sao-inimigo.html`.

`public/sao.html` ganhou exatamente o que o Fabula Ultima tem: detecta
`?id=` na URL, busca/salva via `/api/personagens/[id]`, modo leitura pra
quem não é dono, interruptor de Compartilhar (decisão #46). `public/
sao-inimigo.html` ganhou o mesmo mecanismo, sem o interruptor de
Compartilhar — inimigo não tem link de leitura, só o mestre da campanha
mexe nele. Os dois continuam funcionando 100% em modo local sem o
parâmetro, exatamente como as fatias anteriores deixaram. `src/lib/
sistemas.ts`: `salvaNoHub` virou `true`, e o SAO já aparece em "+ Criar
ficha" e na criação de campanha.

**Bug encontrado e corrigido no caminho:** a rota `/api/personagens/[id]`
só lia `dados.perfil.nome` pra atualizar o nome da ficha mostrado nas
listas do Hub. Ficha de inimigo/NPC não tem `perfil` — guarda o nome
solto em `dados.nome` (Fabula Ultima já fazia isso, e o Sistema SAO
seguiu o mesmo formato). Sem o ajuste, todo inimigo criado por qualquer
mestre ficaria pra sempre listado como "Novo Inimigo" na campanha, não
importa o que fosse escrito na ficha depois — um bug que já existia
silenciosamente no Fabula Ultima também. Um `??` a mais
(`corpo.dados?.perfil?.nome ?? corpo.dados?.nome`) resolve pros dois
sistemas de uma vez, sem mudar nada pra quem já tinha `perfil.nome`
(Fabula Ultima de jogador e Kaizoku no Sho).

Testado com Playwright mockando as respostas de `/api/personagens/*`
(sem credenciais do Supabase neste ambiente pra testar contra o banco de
verdade): ficha de jogador e de inimigo carregando do Hub, edição
disparando o PATCH certo depois do debounce duplo, Compartilhar, ficha
alheia/apagada (404), modo leitura travando todo campo enquanto Exportar
segue disponível, e o modo local intacto.

## 20. Thrylikí Chelóna — descoberta e chassi (29/08/2026)

O Zé mandou três arquivos sem nenhuma mensagem junto: um .zip
(`HBEscolinhaV6.1SistemaCompleto.zip`), um .md
(`HBEscolinhaV6.1SistemaLivro.md`) e um .txt
(`HBEscolinhaV6.1Homebrewery.txt`). Perguntei o que fazer com eles em vez
de supor — o Zé escolheu "Trazer pro Hub RPG como um sistema novo".

Abrindo o material, descobri que não era um sistema novo sendo inventado
agora: é o **Thrylikí Chelóna**, o 4º sistema que `src/lib/sistemas.ts`
já registrava como "planejada" sem nenhuma ficha — e o design já estava
inteiramente fechado (fila de execução no material do Zé mostra os 12
itens da versão jogável marcados "concluído", só faltando playtest de
mesa, que ele mesmo adiou). Isso muda o tipo de tarefa: não é desenhar
mecânica do zero como o SAO, é **codificar fielmente** um sistema já
pronto, do jeito que o Fabula Ultima foi.

O sistema é uma escola de heróis. Estrutura confirmada com o Zé antes de
começar a fatia:

- **Grau (0-5)** como escala de atributo (Força, Agilidade, Constituição,
  Inteligência, Presença), com Treinamento em perícia por cima
  (Nada/Treinado/Perito/Expert = +0/+5/+10/+15)
- Teste = `1d20 + Grau + Treinamento + situação (-5/0/+5)`
- **Ano (1-5, currículo) e Nível (força) são eixos independentes** — uma
  campanha pode combiná-los como quiser, e o Ano decide quais marcos
  curriculares (Ramo, Assinatura, Especialização, Maestria, Tese) o
  personagem já recebeu
- Derivados: `Vida = 35 + Constituição×5 + piso(Nível/2)`,
  `Deslocamento = 9 + 2×Agilidade`, `Carga Pronta = 6 + Força` — conferidos
  contra os exemplos do material do Zé antes de codificar
- Progressão sem teto: Ciclo (a cada 20 Níveis), Categoria (I-V dentro do
  ciclo) e Ascensão, com PE ganho igual ao Nível
- 26 Origens (2 Treinamentos fixos + Permissão narrativa) e 16 Áreas de
  Estudo (o "curso" do personagem)
- Condições por eixo, condições graves, e três trilhas de Consequência
  (Ferimento/Exaustão/Instabilidade) em vez de morte instantânea
- Pacto com a Realidade: sacrificar uma parte do corpo ou canalização
  para escapar da morte, registrado como dívida permanente

**Escopo desta fatia (uma fatia por vez, decisão #26):** só o chassi —
os sete campos acima, seleção de Origem e de Área (Área como categoria,
sem Ramos/poderes ainda), condições e Pacto como registro. Ramos (117),
poderes de Área, combate detalhado e Impacto ficam para fatias
seguintes, do mesmo jeito que o Fabula Ultima e o SAO cresceram aos
poucos.

`public/thryliki-chelona.html` nasceu com Modo Hub desde o primeiro
commit (URL `?id=`, `/api/personagens/[id]`, modo leitura, Compartilhar)
em vez de ganhar isso só numa fatia posterior como o SAO — o padrão já
estava maduro o suficiente pra copiar de uma vez. `src/lib/sistemas.ts`
passou a apontar pra ele (`situacao: "em-construcao"`,
`salvaNoHub: true`), e a migração `0008_sistema_thryliki_chelona.sql`
garante a linha correspondente na tabela `sistemas`, espelhando a
`0007_sistema_sao.sql`.

Testado com Playwright: criação de personagem em modo local, os cinco
Graus e as fórmulas derivadas batendo com os valores esperados,
seleção de Origem/Área mostrando os detalhes certos, condições e as
trilhas de Consequência clicáveis sem erro de JS, persistência após
recarregar a página, e Modo Hub completo mockando `/api/personagens/*`
(carregar do Hub, editar disparando PATCH, ficha escondendo seletor e
botão de novo personagem).

## 21. Thrylikí Chelóna — catálogo de Ramos (29/08/2026)

Depois do chassi (decisão #20), o Zé pediu pra trazer os Ramos e poderes
das Áreas. Olhando o material de novo, cada uma das 16 Áreas tem seu
próprio recurso (Esforço, Mana, Pontos de Comando...) e seu próprio
mini-sistema de combate — não é só uma lista de poderes. Trazer tudo isso
pras 16 Áreas de uma vez seria uma fatia grande demais pra revisar
direito, então perguntei como fatiar. O Zé escolheu **catálogo dos Ramos
primeiro**: nome de cada Ramo (117) + o texto de Assinatura (2º Ano),
Especialização (3º Ano), Maestria (4º Ano) e Tese (5º Ano) como
referência na ficha, ligado ao Ano do personagem — sem o recurso e o
combate únicos de cada Área ainda, isso vem depois, Área por Área.

Os 117 Ramos (37 das seis Áreas originais + 80 das dez novas) vieram dos
documentos de design que o Zé mandou. Extrair à mão seria lento e
arriscado — escrevi um script Python que lê os `.md` de cada Área e
monta os dados. A fonte usa três formatos de marcação ligeiramente
diferentes entre si (ex: `**2º — Nome:** texto` numa Área, `2º — **Nome:**
texto` noutra, `2º: **Nome**, texto` numa terceira) — o parser precisou
tratar os três, e o resultado foi conferido campo a campo até bater
117/117 sem nenhuma etapa faltando e sem sobra de marcação (`**`) no
texto final.

Três nomes de Ramo se repetem em Áreas diferentes (Toxicologia existe em
Botânica e em Alquimia; Paradoxos em Matemática e em Filosofia;
Identidade em Psicologia e em Filosofia). Sem cuidado, trocar de Área
podia deixar selecionado um Ramo de nome igual mas de Área errada — os
IDs viraram `<área>__<ramo>` pra isso nunca acontecer, independente da
ordem em que os campos são trocados na tela.

**Erro cometido e corrigido no caminho:** minha primeira tentativa de
inserir o bloco de dados no arquivo usou uma expressão regular pra
achar onde ele terminava — e essa expressão bateu no lugar errado,
apagando um trecho grande do meio do arquivo (de `MODO_HUB` até
`const estado`) sem que o teste de sintaxe acusasse nada, porque o
resultado continuava sendo JavaScript válido, só que quebrado em tempo
de execução. Percebido pelo primeiro teste Playwright (`MODO_HUB is not
defined`), não pela checagem de sintaxe. Reconstruí a partir da versão
já commitada no Git e reinseri por posição de linha, sem regex sobre o
conteúdo.

Testado com Playwright: card de Ramo ausente sem Área escolhida, aviso
"a partir do 2º Ano" no 1º Ano em vez do seletor, seletor com as opções
certas a partir do 2º Ano, etapas aparecendo progressivamente conforme
o Ano sobe (só Assinatura no 2º, todas as quatro no 5º), e a troca de
Área não carregando por engano um Ramo de nome igual de outra Área.

## 22. Thrylikí Chelóna — combate de Corpo e Cinética (29/08/2026)

Depois do catálogo de Ramos (decisão #21), perguntei qual Área trazer
primeiro com recurso e combate de verdade — o Zé escolheu **Corpo e
Cinética**, a mais simples das 16 (recurso Esforço 0–5, sem tabela de
fórmulas), pra servir de molde nas próximas 15.

Mecânica trazida, fiel ao documento `corpo-e-cinetica-v6.1.md`:

- **Esforço (0–5):** começa em 2 no início de um conflito relevante;
  sobe 1 por ação física sob risco, ou 1 a mais com "Forçar o Corpo"
  (Ação Parcial que também aplica a condição Exposto — reaproveitando a
  condição que já existia na ficha, em vez de duplicar o campo)
- **Rastro:** até duas marcas visíveis (Impulso, Guarda, Golpe,
  Controle, Alteração) acumuladas antes de Romper
- **Romper:** encerra o Rastro e gasta 1/2/3 de Esforço por Manobra,
  Técnica forte (~1,5 Impacto) ou Ápice telegrafado (~2,5 Impactos) — os
  botões ficam desabilitados quando o personagem não tem Esforço
  suficiente para a opção

O painel só aparece na aba Combate, e só quando `perfil.areaId ===
'corpo-cinetica'` — nenhuma outra Área ganha um card vazio. Impulsos
Somáticos, Alterações Corporais, Votos Somáticos e Quebra de Padrão
entraram como texto de referência (não são medidores próprios, são
manobras que já usam Esforço e Rastro).

Ficha salva antes desta fatia não tinha o campo `corpoCinetica` —
`render()` preenche o valor padrão (Esforço 2, Rastro vazio) na
primeira leitura, então uma ficha antiga não quebra ao abrir.

Testado com Playwright: painel ausente sem a Área escolhida e fora da
aba Combate, Esforço subindo com os três gatilhos (ação sob risco,
Forçar o Corpo aplicando Exposto automaticamente, correção manual),
Rastro enchendo até duas marcas e travando o resto dos botões, Romper
gastando o Esforço certo e limpando o Rastro, botão de Romper mais caro
desabilitado sem Esforço suficiente, "Novo conflito" resetando pra 2, e
persistência depois de recarregar a página.

## 23. Thrylikí Chelóna — combate de Simbologia Arcana (29/08/2026)

Depois de Corpo e Cinética (decisão #22), o Zé disse "continue" — segui
pra próxima Área sem perguntar de novo qual, já que o padrão (uma Área
por vez, seguindo a ordem da lista) estava estabelecido.

Simbologia Arcana é bem mais complexa que Corpo e Cinética: a Fórmula
mágica tem gramática própria (Verbo + Essência + Moldura + Cláusulas),
cada peça com peso em Mana e em Tomos, junto de uma tabela de Potência,
pesos adicionais, dispersão por número de alvos etc. — construir a
calculadora de Fórmula completa seria uma fatia por si só (do tamanho
da calculadora de Rituais que o Fabula Ultima ganhou). Por isso esta
fatia trouxe só o que dá pra jogar sem essa calculadora: o **pool de
Mana**.

- `Mana Máxima = 6 + 2×Grau de Inteligência + 2×Grau de Treinamento em
  Simbologia + Reservatório` — Treinamento aqui usa a escala 0-3
  (Nada/Treinado/Perito/Expert), diferente do bônus +0/+5/+10/+15 que
  o mesmo Treinamento dá no teste de d20; criei `grauTreinamento()`
  como uma segunda leitura do mesmo dado, sem duplicar o campo.
  Reservatório é melhoria comprada à parte (0–4), campo novo
- Botões de gastar/corrigir Mana, **Concentrar** (Ação Principal, +2
  Mana, uma vez por cena — trava sozinho e "Nova cena" libera de novo)
  e Descanso completo (recupera tudo)
- Verbo/Essência/Moldura/Cláusulas entraram como texto de referência,
  não como calculadora

Igual ao Esforço, `render()` preenche o campo `simbologiaArcana` padrão
numa ficha salva antes desta fatia. A Mana atual é sempre recalculada
contra o máximo (`Math.min`) — importante porque o máximo pode diminuir
se o jogador baixar o Reservatório ou o Treinamento, e o valor
guardado não pode ficar acima do novo teto.

Testado com Playwright: painel gated por Área e aba, fórmula de Mana
Máxima batendo ao mudar Inteligência e Reservatório, gasto e correção
manual, Concentrar somando 2 e travando até "Nova cena", Descanso
completo recuperando tudo, a Mana atual sendo cortada pro novo máximo
quando o Reservatório cai, e persistência após recarregar.

## 24. Thrylikí Chelóna — combate de Robótica e Engenharia (29/08/2026)

Terceira Área, seguindo a mesma ordem (o Zé mandou "continue"). Robótica
tem três recursos que o próprio documento chama de "não intercambiáveis"
— Pontos de Comando, Carga e Vitalícia — em vez de um só como as duas
Áreas anteriores. O Sistema/Chassi/Módulo completo (Encaixes,
Integridade, Configuração) fica pra fatia futura, do mesmo jeito que a
calculadora de Fórmula ficou de fora de Simbologia.

- **Pontos de Comando:** 1 no 1º/2º Ano, 2 no 3º/4º, 3 no 5º — "renova
  no início do turno", modelado como um botão "Novo turno" em vez de um
  contador de rodada de verdade (a ficha não tem tracker de iniciativa)
- **Carga:** base 4, com Melhorias compráveis (0–4) até o teto de 8;
  Recarga (+2) uma vez por cena, mesmo padrão do Concentrar de Mana
- **Vitalícia:** mesma fórmula estrutural da Mana (`6 + 2×Inteligência +
  2×Treinamento + Reservatório`), mas lendo o Treinamento em
  **Conhecimentos** em vez de Simbologia, e só recuperando com Descanso
  completo — sem Concentrar equivalente, porque o documento não prevê um

Descanso completo nesta Área restaura as três reservas de uma vez
(Vitalícia, Carga e PC) — diferente de Simbologia, que só tinha uma
reserva pra descansar.

Testado com Playwright: painel gated por Área e aba, PC mudando de teto
conforme o Ano sobe (1→2→3) e resetando com "Novo turno", Carga subindo
de teto com Melhorias e sendo restaurada por Recarga (travando até
"Nova cena" — só reabre se ainda faltar Carga pra recarregar, não é
gratuito), Vitalícia reagindo ao Reservatório, Descanso completo
recuperando as três reservas juntas, e persistência após recarregar.

## 25. Thrylikí Chelóna — combate de Botânica, Arte e Zoologia (29/08/2026)

O Zé disse "continue, use agentes pfv" — a primeira vez que pediu
explicitamente pra usar subagentes neste projeto. Fechei o grupo das
seis Áreas originais (as que já tinham Ramos completos desde a versão
V6) disparando três agentes em paralelo, cada um num worktree Git
isolado (cópia própria do repositório), um pra cada Área restante:
Botânica e Biomancia, Zoologia e Etologia, Arte e Expressão.

Cada agente recebeu o mesmo nível de detalhe que eu mesmo uso: a
mecânica já extraída dos documentos de design (não "leia e resolva
sozinho"), os trechos de código das três Áreas já prontas como molde
literal, e a mesma disciplina de escopo (só o resumo do recurso e um
rastreador leve — nada de calculadora de poder). Cada um rodou os
próprios testes Playwright, `node --check`, varredura de CJK, `tsc` e
`lint`, e comitou sozinho — sem tocar documentação nem fazer merge,
isso ficou comigo.

- **Botânica e Biomancia:** Seiva (0–5, mesmo formato do Esforço) +
  até três Cultivos, cada um com nome livre e um estágio Broto→
  Floração→Maturação usando a mesma trilha de clock das Consequências;
  Colher remove o Cultivo e o rótulo do botão já mostra o teto de
  Impacto do estágio atual
- **Zoologia e Etologia:** Dados de Campo (0–3) com os quatro gastos
  do documento, mais um único campo de texto livre "Perfil Ativo" — a
  grade completa de três Perfis × três Traços ficou de fora, é
  complexidade de construtor, não de recurso
- **Arte e Expressão:** Ressonância (0–3) com Apresentação Forte (2,
  subtrai) e Clímax (3, zera a Ressonância inteira, não só subtrai 3),
  mais até três Motivos em texto livre e um campo de Obra Principal

**Trabalhar em paralelo tem um custo previsível: merge manual.** Os
três agentes partiram do mesmo commit em worktrees isolados, então
todos mexeram nos mesmos pontos de extensão do arquivo — a lista de
campos em `novoPersonagem()`, a normalização em `render()`, a
concatenação em `abaCombate()` e o fim de `ligarEventos()` — e ao
juntar os três de volta na branch de trabalho, cada merge sucessivo
gerou conflito nesses mesmos pontos. Nenhum era um conflito de
verdade (mudanças incompatíveis); eram sempre duas inserções
independentes competindo pelo mesmo lugar no arquivo. Resolvi cada um
concatenando as duas adições lado a lado, sem perder conteúdo de
nenhum agente, e reconferi sintaxe/CJK/testes depois de cada merge.

Testado com os testes que cada agente já tinha escrito, revalidados
contra o arquivo final já mesclado com as três Áreas juntas (não só
contra a versão isolada de cada agente) — mais os seis testes das
fatias anteriores, pra garantir que juntar as três não quebrou nada
que já funcionava. `tsc` e `lint` limpos.

## 26. Thrylikí Chelóna — combate das dez Áreas novas (29/08/2026)

Ia continuar disparando agentes um por Área, como nas seis originais,
mas ao ler o documento de design de Astronomia percebi que as dez Áreas
novas (Alquimia, Astronomia, Matemática, Psicologia, Medicina,
Geologia, História, Tanatologia, Direito, Filosofia) foram desenhadas
com a **mesma forma de recurso**: 0 a 3, sobe 1 quando uma regra
específica da Área acontece, e uma ação forte gasta 2 pra ir de 1 pra
1,5 Impacto. Conferi isso contra `automation/novas-areas.json` — dado
já estruturado que o próprio autor gerou pras dez, com o recurso, as
três "ações comuns" e o contrajogo de cada Área em JSON.

Com o padrão confirmado, gerar dez funções quase idênticas (como as
seis originais, que precisaram de merge manual porque cada agente
mexeu nos mesmos pontos do arquivo) seria pior que um único painel
genérico dirigido por dados — menos código, sem risco de merge, e mais
fácil de manter se algum número dessas Áreas mudar depois. Por isso
esta fatia não usou agentes: escrevi um script que lê o JSON e gera a
tabela `RECURSOS_NOVAS_AREAS` (nome do recurso, rótulo e delta do
ganho, rótulo e delta do gasto, geração, limite, recuperação,
contrajogo e as três ações comuns), e uma função `painelNovaArea(p)`
única que lê a Área atual do personagem nessa tabela.

**Uma das dez quebra o padrão simétrico:** Alquimia e Química não
"ganha 1, gasta 2" — a Reação Volátil (a ação forte) *gera* 3
Instabilidade em vez de custar pontos, e uma ação separada
(Estabilização de Emergência) reduz 2. É economia de acúmulo de risco,
não de gasto de reserva. A tabela trata isso como uma exceção
explícita (delta de ganho +3 em vez de +1), não como parsing de texto
livre — mais seguro que tentar inferir a mecânica automaticamente a
partir da string de custo.

O estado de cada Área fica num dicionário por `areaId`
(`p.recursosNovaArea`), o mesmo padrão usado pros IDs de Ramo — troca
de Área não faz uma herdar ou perder o valor da outra.

Testado com Playwright: painel ausente sem Área escolhida, o caso
padrão (Astronomia) com ganho/gasto/teto/reset corretos, o caso
especial (Alquimia, +3 em vez de +1, ainda clampado em 3), estado
independente entre Áreas diferentes mesmo trocando de uma pra outra, e
persistência após recarregar — mais uma varredura renderizando as
outras oito Áreas pra pegar problema de escape de texto. Os nove
testes das fatias anteriores continuam passando. `tsc` e `lint`
limpos.

## 27. Thrylikí Chelóna — ficha de inimigo (29/08/2026)

Com as 16 Áreas jogáveis, o maior buraco que sobrou era não ter ficha
de inimigo — Fabula Ultima e o SAO já tinham a deles, Thrylikí Chelóna
não. Segui o mesmo caminho dos dois: `public/thryliki-chelona-inimigo.html`,
arquivo próprio (inimigo não usa Ramo nem Treinamento por perícia, é
número direto e texto livre), com Modo Hub desde o primeiro commit.

Modela só o **"Cartão de mesa"** que `criaturas-e-encontros-v6.1.md`
define — o que aparece na mesa durante o jogo: nome, Categoria e
função; Defesa fixa por canal e resistências especiais; Vida atual e
total; deslocamento; ação característica; Reação; condição atual;
comportamento atual.

- **Defesa por canal:** `8 + Grau + Treinamento`, com uma tabela de
  referência por Categoria (I a V) e um Porte (Capanga/Padrão/Elite/
  Fase de Chefe) que decide quantos canais marcar como Forte (+5) ou
  Fraco (−5) — o mestre marca qual canal é qual com dois botões por
  canal, e um "Recalcular pela fórmula" preenche os cinco de uma vez;
  digitar um número por cima sempre sobrepõe o cálculo, mesmo padrão
  do "Recalcular" do SAO e do Fabula Ultima
- **Vida:** máximo digitado à mão — o documento dá Impactos de
  referência por Porte (Capanga 0,5, Padrão 2,5, Elite 5, Chefe 7) mas
  não uma fórmula fixa de conversão pra Vida numérica, então a ficha
  só mostra a referência como texto em vez de inventar uma fórmula
- **Função** (Agressor/Bruto/Defensor/Controlador/Escaramuçador/
  Suporte) é só rótulo de mesa, não mexe em nenhum número sozinha

**Fora desta fatia, de propósito:** orçamento de encontro (Pontos de
Ameaça, composição de grupo), fases de Chefe e Ação de Fase — essa
peça só chegou pro SAO depois que a ficha básica de inimigo já
existia (decisão #64+), e aqui repete o mesmo ritmo.

`src/lib/sistemas.ts`: `fichaInimigo` do Thrylikí Chelóna deixou de
ser `null` e aponta pro arquivo novo — o botão "+ Adicionar ficha de
inimigo" da campanha passa a funcionar pra esse sistema.

Testado com Playwright: valores iniciais (Categoria I, Vida 20/20),
Defesa-base mudando com a Categoria, marcar Forte/Fraco e recalcular
alterando o canal certo, digitar valor manual sobrepondo o cálculo,
condições marcando e persistindo, Ação Característica sendo
adicionada e preenchida, tudo sobrevivendo a um recarregamento de
página, e Modo Hub completo mockando `/api/personagens/*` (carregar
do Hub, editar disparando PATCH). Os sete testes da ficha de jogador
continuam passando. `tsc` e `lint` limpos.

## 28. Thrylikí Chelóna — Escudo do Mestre (29/08/2026)

Depois da ficha de inimigo, faltava o último par que o Fabula Ultima e
o SAO já tinham: uma página de referência rápida pra mesa. O material
do Zé já tinha exatamente isso pronto em
`referencia-rapida-v6.1.md` — não precisou inventar nada, só
transcrever fielmente pro layout que o Hub já usa (mesmo `.cartao`,
mesma paleta, mesmas tabelas).

`public/thryliki-chelona-escudo-mestre.html` é **página estática**,
sem `<script>`, sem localStorage, sem Modo Hub — o mesmo formato do
`sao-escudo-mestre.html`: teste, dificuldade/Defesa fixa e os cinco
graus de resultado; turno e as quatro ações; a escala de Impacto
(0,5/1/1,5/2,5); Patamares (multiplicador por diferença de Categoria);
as seis condições com saída comum; Vida zero e Pacto; as quatro
escalas de Recuperação; Cena de Desafio (Progresso/Pressão); um card
de referência rápida de criatura (Defesa fixa por canal, Vida em
Impactos por Porte) que resume o que a ficha de inimigo já modela; e
os cinco lembretes de mesa do documento original.

`src/lib/sistemas.ts`: `escudoMestre` deixou de ser `null` — Thrylikí
Chelóna agora tem os três arquivos que os outros dois sistemas
completos já tinham (ficha de jogador, ficha de inimigo, Escudo do
Mestre).

Testado com Playwright: a página carrega sem erro de console, o título
e as seções principais aparecem no texto renderizado. Sem teste mais
profundo porque não há interatividade nenhuma pra testar — é
conteúdo estático fiel à fonte. `tsc` e `lint` limpos (o arquivo não
tem JS que os afete, mas a mudança em `sistemas.ts` sim).

## 29. Thrylikí Chelóna — Fases de Chefe (29/08/2026)

Continuação direta da ficha de inimigo (decisão #27), que tinha
deixado "orçamento de encontro e fases de Chefe" explicitamente de
fora. Com as outras três peças fechadas (16 Áreas, ficha de inimigo,
Escudo do Mestre), essa era a continuação mais natural: estender o
arquivo que já existe em vez de abrir uma frente nova.

O SAO seguiu o mesmo ritmo: ficha básica de inimigo primeiro, Chefe
de Andar (com Fases, Ataques de Área e Relógio de Batalha) só depois,
numa fatia separada.

Nova aba "Fases de Chefe" em `public/thryliki-chelona-inimigo.html`,
só relevante quando Porte é "Fase de Chefe" (mostra um aviso, não
trava, se não for). Cada fase registra exatamente os sete campos que
`criaturas-e-encontros-v6.1.md` define: nome, Gatilho (geralmente um
limiar de Vida), Sinal (como o grupo percebe a mudança), Objetivo (que
não seja só remover Vida), Ação normal, Ação de Fase (até 0,5 Impacto)
e Transição — mais os canais marcados como Forte nesta fase
especificamente (reaproveitando a lista `CANAIS` já usada na aba
Combate). Um card de "Economia do Chefe" fecha a aba com a referência
fixa do documento (1 turno, 1 Reação, 1 Ação de Fase, no máximo 1 ação
Impossível por rodada).

Ficha de inimigo salva antes desta fatia não tinha `fasesChefe` —
`render()` preenche `[]` na primeira leitura, mesmo padrão já usado
várias vezes na ficha de jogador.

Testado com Playwright: aviso aparecendo/sumindo conforme o Porte,
adicionar/remover fases, marcar canais Forte por fase, e tudo
sobrevivendo a um recarregamento de página — inclusive uma ficha sem
o campo novo carregando sem quebrar. Os testes anteriores da ficha de
inimigo (local e Modo Hub) continuam passando. `tsc` e `lint` limpos.

## 30. Restrições registradas

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
