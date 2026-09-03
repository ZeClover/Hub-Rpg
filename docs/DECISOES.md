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

## 30. Thrylikí Chelóna — calculadora de Orçamento de Encontro (29/08/2026)

Última peça do lado do mestre: `criaturas-e-encontros-v6.1.md` define
`Orçamento = Força do Grupo × multiplicador da dificuldade` e Pontos de
Ameaça por Porte (Capanga 0,25, Padrão 1, Elite 2, Fase de Chefe 2),
mas isso é conta, não referência de leitura — cabia melhor como
ferramenta interativa do que mais uma tabela estática.

Virou a primeira parte com `<script>` do
`thryliki-chelona-escudo-mestre.html`, que até aqui era só HTML/CSS
estático (igual o `sao-escudo-mestre.html`). Decisão consciente: **sem
persistência** — nem localStorage, nem Modo Hub. É uma conta rápida
pra usar durante a preparação ou a sessão, não uma ficha; reiniciar ao
recarregar a página é o comportamento certo, não uma lacuna.

- Campos: Força do Grupo (número) e Dificuldade (fácil ×0,6, comum ×1,
  difícil ×1,4, clímax ×1,8) calculam o Orçamento ao vivo
- Botões "+ Capanga/Padrão/Elite/Fase de Chefe" acumulam uma
  composição planejada, cada porte com seus Pontos de Ameaça; um "-1"
  por linha remove, e "Limpar composição" zera tudo
- Total gasto comparado ao Orçamento mostra quanto sobra (dentro do
  orçamento) ou quanto passou (acima do orçamento — encontro mais
  difícil que o planejado)

Com isso, os quatro documentos de mestre de `criaturas-e-encontros-v6.1.md`
que fazem sentido numa ficha ou ferramenta (cartão de mesa, Defesa por
Categoria, Fases de Chefe, orçamento de encontro) estão todos no Hub —
o que sobra do documento (funções táticas, divisão de ação por função,
construção rápida passo a passo) é texto de preparação de mesa, não
número pra calcular, e fica como está no material do Zé.

Testado com Playwright: Orçamento reagindo a Força e Dificuldade,
Total gasto somando por Porte corretamente, status mudando entre
"dentro" e "acima" do orçamento, remover uma unidade da composição, e
Limpar composição. `tsc` e `lint` limpos (o arquivo é HTML solto, sem
efeito neles, mas a checagem roda mesmo assim por hábito).

## 32. Thrylikí Chelóna — Construtor de Fórmula (Simbologia Arcana) (29/08/2026)

A decisão #23 tinha deixado a calculadora de Fórmula de fora de propósito,
prometendo que viria como fatia própria — igual a calculadora de Rituais
que o Fabula Ultima ganhou. Com o Zé mandando "seguir" depois das
ferramentas de mestre (decisões #27 a #30), essa era a "criação livre"
mais natural pra construir a seguir: é a peça que mais faltava do lado do
jogador de Simbologia Arcana.

Seguindo a gramática de `simbologia-arcana-v6.1.md` (Verbo + Potência +
Essência + Moldura + Cláusulas), o construtor virou um formulário vivo
dentro da aba Combate, só quando `perfil.areaId === 'simbologia-arcana'`:

- Seis campos (Verbo, Potência, Essência, Alcance, Alvo, Duração) mais um
  grupo de seis Cláusulas opcionais, cada um com seu custo de Mana e de
  Tomos tirado direto das tabelas do documento
- Impacto/Mana/Tomos calculados ao vivo (`calculoFormula`) a cada troca,
  sem precisar apertar botão nenhum pra ver o resultado
- **Matriz de Tomo** (capacidade que cresce por Ano: 4/8/14/20/20) trava
  o "Salvar Fórmula" quando os Tomos da combinação atual excedem o limite,
  com aviso "Não cabe na Matriz" — não deixa salvar uma Fórmula inválida
- Fórmulas salvas entram numa lista própria (até 4/5/6, conforme o Ano),
  cada uma com nome editável, um resumo de uma linha e um botão
  "Manifestar" que desconta a Mana da Fórmula do pool — desabilitado
  quando a Mana atual não é suficiente

**Rascunho do construtor não é dado de personagem.** As seleções em
andamento (`estado.construtorFormula`) ficam só na memória da aba aberta,
não gravam no personagem nem sobrevivem a um recarregamento — só "Salvar
Fórmula preparada" grava de verdade. Mesma lógica da calculadora de
Orçamento de Encontro (decisão #30): é bancada de trabalho, não ficha.

**Fora desta fatia, de propósito:** Metassímbolos (5º Ano) e regras de
combinação mais avançadas do documento (interação entre Cláusulas,
restrições de Verbo por Essência) — o construtor cobre a gramática base
que gera o custo em Mana e Tomos, que é o que decide se uma Fórmula cabe
na Matriz e quanto custa manifestar.

Testado com Playwright: card ausente sem a Área escolhida, cálculo
padrão batendo, subir Potência/Alcance/marcar uma Cláusula somando
Mana e Tomos corretamente, aviso de "não cabe" e botão de Salvar
desabilitado ao estourar a Matriz do 1º Ano, reduzir a seleção
reabilitando o botão, salvar uma Fórmula com nome e ela aparecendo na
lista (contador 1/4), Manifestar descontando a Mana certa do pool, e
tudo — Fórmula salva e Mana gasta — sobrevivendo a um recarregamento de
página. Os catorze testes das fatias anteriores de Thrylikí Chelóna
continuam passando. `tsc` e `lint` limpos.

## 33. Thrylikí Chelóna — Construtor Livre de Poder (29/08/2026)

O Zé disse "continue, tudo que precisa continuar até esse sistema estar
dentro do hub, não pare" — mandato pra fechar sozinho o que ainda faltava
de "criação livre" em vez de perguntar Área por Área. Reli
`construtor-livre-de-poderes-v6.1.md` inteiro antes de continuar e
descobri que ele **não é** um construtor específico de Robótica ou de
Zoologia (que era minha suposição anterior, registrada no fim da decisão
#32): é a **gramática genérica que vale pras quinze Áreas que não têm
gramática própria** — só Simbologia Arcana foge dela, com a Fórmula que
já tinha ganhado construtor na decisão #32. Isso muda o que "terminar
criação livre" significa: não são vários construtores por Área, é um
construtor só, com tradução por Área.

O documento também deixou claro **quando** a criação livre existe: "Ano
libera a gramática" — 1º Ano usa poder pronto do Ramo, 2º Ano só altera 1
campo de uma técnica pronta (Modificação Guiada), e só do 3º Ano em
diante existe criação livre de verdade (Criação Avançada no 4º, Ruptura
conceitual no 5º). `liberacaoPorAno(p)` codifica essa tabela.

- **Cartão universal**, fiel aos catorze campos do documento: Nome,
  Intenção, Acesso, Âncora, Forma, Potência, Ação (derivada da Potência),
  Resultados (Impacto), Custo (derivado da Área), Teste ou Resistência,
  Contrajogo, Resíduo
- **Potência → orçamento de Impacto** (Menor 0,5, Básica 1, Forte 1,5,
  Ápice 2,5) e **Átomos de Impacto** (Dano/Cura 1, Proteção 1, Marca
  0,25, Exposto 0,25, Retirar Ação Menor 0,5, Interromper Sustentação
  0,5, Retirar Principal 1, Incapacitar 2) — o jogador marca quais
  resultados o poder causa, e a soma não pode passar do orçamento da
  Potência. É a mesma regra da Fórmula ("um poder com vários resultados
  divide o Impacto, não soma resultado cheio mais efeitos de graça"),
  só que genérica em vez de ligada às cinco peças da gramática de
  Simbologia
- **Tabela `PODER_CUSTO_AREA`**: as quinze Áreas (todas menos Simbologia)
  têm sua tradução própria de quanto cada Potência custa nela — extraída
  linha a linha da "Tradução por Área" do documento, incluindo a "regra
  própria" de cada uma (ex: Alquimia gera Instabilidade em vez de gastar;
  Zoologia limita ganho de informação a 1x por rodada)
- **Sem botão de "Manifestar"**: ao contrário da Fórmula (que tem um
  custo numérico único, a Mana), o custo aqui é texto ("0 ou 1 Esforço,
  conforme a propriedade", "Colher em Floração", "1 Garantia") — não dá
  pra descontar de um recurso genérico sem inventar uma conversão que o
  documento não define. O poder salvo vira **registro de referência**; o
  jogador gasta o recurso de verdade no painel que a Área já tem (Esforço
  em Corpo e Cinética, Carga em Robótica, Ressonância em Arte, etc.),
  igual sempre funcionou

Simbologia Arcana, ao abrir o Construtor Livre de Poder, mostra uma nota
curta explicando que ela usa a própria gramática (Fórmula, decisão #32)
em vez do card genérico — evita ter dois construtores concorrentes na
mesma Área.

Testado com Playwright: card ausente sem Área escolhida; aviso "Poderes
Prontos" no 1º Ano e "Modificação Guiada" no 2º sem o construtor
completo aparecer; construtor completo liberado no 3º Ano; orçamento de
Impacto reagindo à Potência; marcar Resultados somando certo; aviso e
Salvar desabilitado ao estourar o orçamento; Salvar reabilitando ao
desmarcar; salvar um poder com nome/Intenção/Contrajogo e ele aparecendo
na lista com o resumo certo; renomear e remover; persistência após
recarregar; e Simbologia Arcana mostrando a nota em vez do construtor
genérico. Os dezesseis testes das fatias anteriores de Thrylikí Chelóna
continuam passando. `tsc` e `lint` limpos.

Com isso, todas as dezesseis Áreas têm recurso de combate e criação
livre (nativa ou via este construtor) dentro do Hub — o alvo que o Zé
pediu pra "esse sistema estar dentro do hub".

## 34. Thrylikí Chelóna — Técnicas prontas dos 117 Ramos (29/08/2026)

Ainda dentro do mandato "continue até esse sistema estar dentro do
hub" — depois do Construtor Livre de Poder (decisão #33), reli
`plano-versao-jogavel-v6.1.md` (o próprio checklist de conclusão do
autor) pra achar o que ainda faltava, e o item 5 ("Conteúdo pronto:
opções de Pressão, Sobrevivência e Tática pra jogar sem criação livre,
351 técnicas") não tinha entrado no Hub — a decisão #21 só trouxe
Assinatura/Especialização/Maestria/Tese (o *rótulo* de progressão do
Ramo), não essas três técnicas nomeadas e jogáveis que todo Ramo ganha
a partir do 2º Ano.

Isso é conteúdo grande demais pra copiar à mão sem erro (351 técnicas,
117 Ramos), mas o próprio pacote do Zé já tinha os dados prontos em
JSON: `tecnicas-prontas-areas-originais.json` (37 Ramos das seis Áreas
originais) e `tecnicas-prontas-novas-areas.json` (80 Ramos das dez
novas) — cada um com Função (Pressão/Sobrevivência/Tática), Nome e
Efeito por Ramo. Um script Python cruzou os dois arquivos com o `RAMOS`
que já existe na ficha:

- Os IDs internos dos dois arquivos não batem com os do Hub (o JSON das
  seis originais usa codinomes tipo `lutador`/`simbolista` pra Área e
  `artes_marciais` pra Ramo; o das dez novas usa nome por extenso). O
  cruzamento foi por **posição dentro de cada Área** — a ordem dos
  Ramos é a mesma nos dois lados — e o script conferiu a contagem antes
  de aceitar (37+80 = 117 Ramos, 3×117 = 351 técnicas, batendo exato
  com o que o plano promete)
- `TECNICAS_RAMO`, dicionário por id de Ramo (`corpo-cinetica__artes-marciais`
  etc.), cada um com as três técnicas ({funcao, nome, efeito})
- Aparecem dentro do card de Ramo já existente, só quando um Ramo está
  escolhido — Ação Principal, até 1 Impacto, usando o recurso normal da
  Área, exatamente como o "Contrato comum" do documento define

Com isso, um personagem de 2º Ano (que ainda não tem criação livre,
liberada só no 3º pela decisão #33) já tem três técnicas nomeadas e
prontas pra jogar assim que escolhe o Ramo — não fica sem nada até
poder criar poder próprio.

Testado com Playwright: técnicas ausentes sem Ramo escolhido,
aparecendo com nome/função corretos ao escolher um Ramo original,
trocando (e não acumulando) ao trocar de Ramo, um Ramo de uma das dez
Áreas novas mostrando sua própria técnica, e persistência após
recarregar. Os dezoito testes das fatias anteriores de Thrylikí Chelóna
continuam passando. `tsc` e `lint` limpos.

## 35. Thrylikí Chelóna — Kit de Combate do 1º Ano (29/08/2026)

Última peça encontrada relendo `kits-de-combate-ano1-v6.1.md` durante o
mesmo mandato "continue até esse sistema estar dentro do hub": o
próprio texto que já vivia no Hub desde o chassi (decisão #20) — "no
1º Ano o personagem só tem a Área e o Kit de Combate dela" — descrevia
uma peça que nunca tinha sido construída de verdade. Um personagem de
1º Ano tinha o recurso da Área (Esforço, Mana...) mas nenhuma opção
nomeada e pronta pra usar esse recurso em combate.

O documento confirma que o kit **não é exclusivo do 1º Ano** — "o Ramo
escolhido no 2º Ano muda a pergunta tática do personagem; ele não
desbloqueia o direito de combater, isso já existe no kit da Área" — por
isso o card fica visível em qualquer Ano, não só quando `p.ano === 1`.

- `KITS_COMBATE_ANO1`, transcrito à mão do documento (sem JSON pronto
  pra essas seis Áreas, ao contrário das técnicas de Ramo da decisão
  #34) — cada uma com a Entrada pronta, de três a cinco opções
  nomeadas (Ação, Custo, Impacto, Uso em batalha) e um Turno simples
  sugerido
- Só as **seis Áreas originais** ganham este card — as dez novas já
  têm o próprio kit dentro de `RECURSOS_NOVAS_AREAS.acoes` (decisão
  #26), vindo da mesma fonte (`automation/novas-areas.json`), e o
  documento é explícito que não duplica esse conteúdo
- Aparece dentro da aba Combate, logo depois do painel de recurso da
  Área

**Bug de teste encontrado no caminho:** o teste já existente de Arte e
Expressão (`test-arte.js`) contava `h2:has-text("Arte e Expressão")`
esperando exatamente 1 — o novo card "Kit de Combate — Arte e
Expressão" também bate nesse texto (`has-text` é substring), quebrando
a contagem. Não é bug de produto: o seletor do teste era frágil demais
(dependia do nome da Área aparecer só uma vez na tela). Corrigido pra
mirar no título específico do card de recurso ("Ressonância e
Motivos") em vez do nome da Área.

Testado com Playwright: card ausente sem Área escolhida, presente com
as quatro opções nomeadas de Corpo e Cinética, continua visível depois
de subir de Ano, troca corretamente ao mudar de Área (Simbologia
mostra o próprio kit), e as dez Áreas novas não ganham esse card
duplicado (continuam só com as próprias ações comuns). Os vinte testes
das fatias anteriores de Thrylikí Chelóna continuam passando, incluindo
o de Arte e Expressão já corrigido. `tsc` e `lint` limpos.

Com Kit de Combate, Técnicas de Ramo, Construtor Livre de Poder e a
Fórmula de Simbologia Arcana, todo personagem tem conteúdo jogável em
qualquer Ano — pronto no 1º, técnicas nomeadas no 2º, criação livre a
partir do 3º. Essa era a lacuna que restava do mandato "esse sistema
estar dentro do hub".

## 36. Thrylikí Chelóna — Interação Social no Escudo do Mestre (29/08/2026)

Fechando a varredura dos documentos de design que ainda não tinham
virado nada no Hub (mesmo mandato das decisões #33 a #35):
`social-e-investigacao-v6.1.md` descreve um motor pra conversas
importantes (Painel de figura social: Desejo/Objeção/Limite/Posição) e
reaproveita a mesma Cena de Desafio (Progresso/Pressão) que já
tinha entrado no Escudo do Mestre (decisão #28) — mas nunca tinha
ganhado a própria referência.

Igual a Cena de Desafio, isso é **conteúdo de mestre sem número pra
calcular** (a Posição vai de −2 a +2 e o resto é texto de julgamento na
mesa) — cabia como mais um card estático no Escudo do Mestre, não como
ferramenta interativa nova. Adicionado `thryliki-chelona-escudo-mestre.html`:
o Painel de figura, a tabela de cinco Posições com o que cada uma
permite pedir, e um parágrafo cobrindo negociação em relógio e Dívidas/
Promessas como frase registrada (não uma barra numérica nova).

Deixado de fora, de propósito: as tabelas de Grau de resultado social e
de abordagens por perícia — são reafirmação do motor de teste padrão
(as mesmas cinco Graus de resultado e a mesma lógica de perícia por
abordagem já cobertas em outras partes do Escudo), não informação nova
pro mestre consultar na mesa.

Testado com Playwright: a calculadora de Orçamento de Encontro (única
parte com `<script>` desta página) continua funcionando sem regressão.
Sem teste mais profundo — é conteúdo estático, mesmo padrão da decisão
#28. `tsc` e `lint` limpos (arquivo HTML solto, sem efeito neles).

## 37. Thrylikí Chelóna — Inventário (29/08/2026)

Último buraco de peso encontrado na varredura dos documentos de design
(mesmo mandato das decisões #33 a #36): `equipamentos-v6.1.md` define
um sistema inteiro de itens (Cartão universal, Carga Pronta, Guarda de
proteção, munição controlada) e a ficha de jogador não tinha
**nenhuma** noção de inventário — nem uma aba, nem um campo. Fabula
Ultima e o Sistema SAO já tinham o próprio há muitas fatias; Thrylikí
Chelóna nunca tinha ganhado o dele.

Nova aba "Inventário" em `public/thryliki-chelona.html`, fiel ao
Cartão universal do documento:

- **Carga Pronta** = `6 + Grau de Força` (fórmula que já existia desde o
  chassi, decisão #20, só nunca tinha sido usada em lugar nenhum) —
  card mostrando Carga usada/máxima, com aviso de Sobrecarregado quando
  a soma dos itens marcados como "Pronto" passa do limite
- Cada item declara os oito campos do documento: nome, Categoria (I–V),
  tipo (arma/proteção/ferramenta/foco/consumível/veículo/criação),
  Tamanho (que define o custo em Carga: mínimo 1/3, leve 1, volumoso 2,
  pesado 3, transporte 0 — precisa de veículo), Perfil, Traços, Âncora
  e fonte, Estado (Íntegro/Danificado/Quebrado) e Acesso (Comum/
  Controlado/Raro/Único)
- **Munição controlada** (Cheia/Baixa/Vazia) aparece só em itens tipo
  Arma; **Guarda por cena** (com +/- e clamp automático ao máximo)
  aparece só em itens tipo Proteção — o documento define os dois como
  mecânicas específicas desses tipos, não campos universais
- Item guardado fora da Carga Pronta (checkbox "Pronto" desmarcado)
  continua existindo na lista, só não conta pro limite — fiel à
  distinção do documento entre o que está pronto e o que precisa de
  Ação Principal pra recuperar

**Deixado de fora, de propósito:** conversão automática de Guarda em
Vida ao sofrer dano — o documento descreve isso como automatizado, mas
nenhum outro lugar do Hub tem um fluxo de "aplicar dano" pra Thrylikí
Chelóna (nem Vida, nem Consequências); Guarda fica como reserva
rastreada manualmente, igual todo o resto da ficha trata os próprios
recursos. Fabricação/melhoria de item (`criacao-itens-v6.1.md`) também
fica de fora — é um processo (sete campos, orçamento de Impacto),
não um dado de personagem, mais parecido com o Construtor Livre de
Poder do que com o Inventário.

**Bug de padrão encontrado e corrigido antes de fechar:** o campo
"Guarda por cena (máx)" começou ligado a `mudarSemRedesenhar` (sem
redesenho imediato), igual os campos de nome/texto livre da ficha. Mas
os botões +/- de Guarda logo abaixo dependem do novo máximo já
refletido no redesenho pra saber se travam ou não — outros campos
numéricos da ficha (Reservatório de Mana, Melhorias de Carga de
Robótica) já resolvem isso com `onchange` + redesenho imediato, e o
Inventário devia ter seguido o mesmo padrão desde o início. Corrigido
antes de considerar a fatia pronta.

Testado com Playwright: aba abre vazia, Carga Pronta batendo com a
fórmula, item mudando de tipo mostra/esconde Munição e Guarda
corretamente, Carga usada somando certo por Tamanho, desmarcar
"Pronto" tirando o item da conta, aviso de Sobrecarregado ao passar do
limite, Guarda subindo/descendo com o botão corrigido, remover item, e
persistência após recarregar. Os vinte e dois testes das fatias
anteriores de Thrylikí Chelóna continuam passando. `tsc` e `lint`
limpos.

## 38. Thrylikí Chelóna — Projetos de Criação, Melhoria e Reparo (29/08/2026)

O Zé mandou "continue" depois da aba Inventário (decisão #37), que
tinha deixado `criacao-itens-v6.1.md` de fora de propósito — a peça
que faltava pra fechar o par completo (ter item vs. criar/consertar
item). Igual o Construtor Livre de Poder (decisão #33) é a gramática
genérica de poder pras quinze Áreas, este documento é a gramática
genérica de item: "forjar uma espada, montar um robô, inscrever um
tomo, cultivar um preparado, registrar um bestiário ou produzir uma
obra usam o mesmo esqueleto."

Dois pedaços, os dois dentro da aba Inventário (mesmo lugar dos itens
que eles afetam):

- **Reparar (no item já existente):** botão que aparece só quando o
  Estado não é Íntegro, e volta direto pra Íntegro — a tabela de Reparo
  do documento trata Danificado e Quebrado como dois caminhos
  (Intervalo vs. Repouso/fase de Projeto) que convergem no mesmo
  resultado, "restaura o Traço perdido"/"restaura o Perfil principal";
  não modelei os dois como um caminho Quebrado→Danificado→Íntegro
  porque o documento não descreve assim
- **Projetos de Criação e Melhoria:** os sete campos do "Projeto"
  (Intenção, Base, Traços, Fonte e Âncora, Materiais e oficina, Falha
  interessante) mais Escala (Improviso/Fabricação/Projeto), as quatro
  Categorias (Projeto/Criador/Material/Oficina) calculando a
  **Categoria Operacional** (a menor das quatro, ao vivo), a
  capacidade de Traços por Categoria (I:1 até V:5, com aviso quando o
  texto de Traços declarado excede), Fase (só quando Escala é
  "Projeto", com as opções limitadas à capacidade da Categoria
  Operacional — I libera só Conceito, III libera as três primeiras,
  V libera as cinco) e Faixa de Custo (0–5). Um botão "Concluir
  Projeto" — desabilitado enquanto os Traços excedem a capacidade —
  cria um item novo no Inventário usando Nome/Categoria Operacional/
  Base→Perfil/Traços/Acesso do projeto, e trava (`concluido: true`)
  pra não duplicar o item num segundo clique

**Bug de padrão pego antes de fechar, igual a decisão #37:** o campo
de Traços começou ligado a `oninput`/`mudarSemRedesenhar` (mesmo
padrão de campo de texto livre) — mas a contagem de Traços, o aviso de
excesso e o botão de Concluir dependem do valor atualizado no mesmo
redesenho. Trocado pra `onchange`/`mudar` (atualiza ao sair do campo,
não a cada tecla), mesma solução já usada pra Guarda máxima na
decisão #37 — texto explicando isso foi acrescentado sob o campo.

**Deixado de fora, de propósito:** a Cena de Desafio (Progresso/
Pressão) que cada fase de Projeto usa — já é referência estática no
Escudo do Mestre (decisões #28 e #36); modelar um clock vivo por fase
de projeto seria uma ferramenta nova, não uma correção de lacuna.
Viradas de projeto (a lista de consequências ao encher Pressão) também
ficam como julgamento de mesa, não um sorteio automatizado — o
documento já trata isso como escolha do mestre, não tabela de rolagem.

Testado com Playwright: Categoria Operacional reagindo corretamente
(fica na menor mesmo com só uma das quatro subindo, sobe quando todas
sobem), capacidade de Traços mudando com a Categoria, aviso e trava do
Concluir com excesso de Traços, seletor de Fase aparecendo só na
Escala Projeto com as opções certas por Categoria, Concluir Projeto
criando o item com os dados certos e travando depois, Reparar
revertendo Estado pra Íntegro e o botão sumindo depois, remover um
projeto sem afetar o item que ele já tinha gerado, e persistência após
recarregar. Os vinte e quatro testes das fatias anteriores de
Thrylikí Chelóna continuam passando. `tsc` e `lint` limpos.

Com Projetos de Criação, a lista de fatias identificadas na varredura
de `plano-versao-jogavel-v6.1.md` está fechada: chassi, todas as
dezesseis Áreas com recurso de combate, criação livre (nativa ou
genérica) e conteúdo pronto (Ramos + Kit de 1º Ano), ficha de inimigo
com Fases de Chefe, Escudo do Mestre completo (referência + Orçamento
de Encontro + Interação Social), e agora Inventário com criação/
melhoria/reparo de item.

## 39. Thrylikí Chelóna — Economia de PE, Marcos da Área e Ascensões (29/08/2026)

O Zé disse "cara, português por favor" (eu tinha respondido em inglês por
engano) e depois "coloca tudo isso na ficha, nada pode estar de fora" —
mandato pra fechar toda lacuna que restava nos documentos de design, sem
mais perguntar antes de cada uma. Reli o material inteiro (60 documentos)
procurando o que ainda não tinha virado ficha, e a maior lacuna encontrada
foi esta: o comentário do próprio código já confessava "o que ainda não
tem é ONDE gastar" — Ponto de Evolução (PE) só acumulava, nunca comprava
nada. Isso também destravou `custos-e-economia-de-pe-v6.1.md` e
`progressao-sem-teto-v6.1.md`, que descrevem a mesma engrenagem.

- **Livro-razão de compras** (`p.compras`), não um contador solto: cada
  compra de Grau de Atributo, degrau de Treinamento, Talento ou Recurso/
  Eletiva vira uma linha com descrição e custo — "mostra a origem de cada
  bônus" é a própria filosofia do núcleo do sistema (`nucleo-v6.1.md`), e
  ela some se o PE for só um número
- **Atributos e Treinamentos**: botão "+1 Grau (N PE)"/"+1 Treinamento
  (N PE)" ao lado de cada seletor já existente (que continua editável à
  mão, sem travar correções). Custo e Categoria mínima batem com
  `regras-base.json` (a versão canônica que o próprio pacote do Zé já
  trazia, evitando reinventar os números): Grau 2 PE/3/4/5, Treinado 2
  PE (Categoria I), Perito 3 PE (II), Expert 4 PE (III)
  Grau também trava pelo teto de Categoria (I:3, II:4, III:5)
- **Fórmulas e Poderes Livres** (Simbologia e as outras quinze Áreas)
  passam a custar PE pela Potência (Menor 1/Básica 2/Forte 3/Ápice 5),
  exceto as **duas primeiras** técnicas ou poderes do personagem — o
  pacote inicial gratuito do próprio `regras-base.json`
  (`tecnicasOuPoderesBasicosDaArea: 2`). "Salvar" nos dois construtores
  (decisões #32 e #33) agora também trava sem PE suficiente, e mostra o
  custo antes de salvar
- **Talentos** (Refinamento 1 PE / Padrão 2 PE / Maior 4 PE) e
  **Recursos/Eletivas** (5 tipos, incluindo "Componente persistente",
  travado até o 4º Ano) — compras livres com descrição, aba Progressão
  nova
- **Marcos da Área**: `marcosRecebidos(p)` já calculava a contagem desde
  o chassi (decisão #20), mas nada registrava o que cada Marco escolheu.
  Agora um card na aba Progressão deixa registrar até a contagem
  recebida, com as cinco opções do documento (Repertório/Reserva/
  Preparação/Refinamento/Talento) — não gasta PE, só documenta a escolha
- **Ascensões**: mesma lógica pro contador `ascensoesConcluidas(p)` —
  registra o eixo escolhido (Massa e Volume/Alcance e Área/Quantidade/
  Duração e Resistência/Profundidade Conceitual, esta travada até o 5º
  Ano) por Ascensão concluída

Nova aba "Progressão" entre Atributos e Combate, concentrando tudo isso —
os botões de compra de Grau/Treinamento ficam na própria aba Atributos,
ao lado do que compram, mas o resto (Talentos, Recursos, Marcos,
Ascensões, e o histórico de compras) fica junto, sem espalhar a economia
inteira pela ficha.

**Bug pego e corrigido antes de fechar:** a primeira versão só empurrava
os botões de Grau/Treinamento pro estado do personagem sem registrar
uma compra — `peGastoTotal` continuava lendo só Talentos/Recursos/
Fórmulas/Poderes, então comprar Grau ou Treinamento não descontava PE
nenhum. Não dava pra "derivar" o custo olhando só o Grau atual, porque o
pacote inicial gratuito já distribui os atributos de forma livre entre
Grau 1 e 3 — não existe uma linha de base fixa pra comparar. Corrigido
fazendo essas duas compras também empurrarem uma linha no livro-razão,
igual Talentos e Recursos.

Testado com Playwright: compra de Grau travada com PE insuficiente no
1º Nível, liberada ao subir de Nível, Grau e Treinamento realmente
mudando após a compra, PE Ganho/Gasto/Disponível corretos no
livro-razão (incluindo as compras de Grau/Treinamento), Talento e
Recurso aparecendo na lista com a descrição certa, Recurso "persistente"
travado sem o 4º Ano, Marcos e Ascensões mostrando a contagem esperada
pra um Nível específico, registrar e ver a contagem subir, formulário
sumindo ao completar a cota, remover uma compra devolvendo o PE, e tudo
persistindo após recarregar. Os vinte e seis testes das fatias
anteriores de Thrylikí Chelóna continuam passando (incluindo Fórmula e
Poder, que agora gastam PE mas continuam livres pra alguém testando do
zero, dentro do pacote inicial de duas técnicas gratuitas). `tsc` e
`lint` limpos.

## 40. Thrylikí Chelóna — Doenças, Demi-humanos e Místicos (29/08/2026)

Continuação do mandato "nada pode estar de fora": `doencas-e-demi-humanos-v6.1.md`
era o outro item que eu tinha nomeado como deixado de fora na última
mensagem. É **opcional** por definição do próprio documento — a mesa
decide se entra na campanha, e nenhum jogador precisa aceitar uma
manifestação corporal que não queira interpretar — mas "opcional" não é
"fora do Hub": vira mais um catálogo que a mesa liga ou não, igual as
Origens ou as Áreas já são catálogo sem serem obrigatórias.

- **`DOENCAS_CATALOGO`**: as 23 combinações Pró/Contra/Âncora do
  documento, 9 criaturas em 3 classificações (Comuns: Lobo, Raposa,
  Coelho; Demi-humanos: Vampiro, Demônio, Orc; Místicos: Dragão Negro,
  Wendigo, Medusa) — transcrito à mão (o documento não tinha JSON
  próprio, ao contrário dos outros catálogos grandes desta sessão)
- Novo card na aba Status, logo depois do Ramo: até **seis Pares
  ativos**, os dois primeiros gratuitos, cada um a partir do terceiro
  custando **2 PE** — encaixa direto na economia da decisão #39
  (`peGastoTotal` já soma `p.doencas.pares`, não precisou mudar nada lá)
- Cada Par escolhido guarda só o `id` do catálogo (mesmo padrão de Ramos
  e Origens: uma referência, não uma cópia dos dados) — troca de
  Classificação já filtra a lista de Pares disponíveis, e a prévia do
  Pró/Contra/Âncora aparece antes de confirmar

Testado com Playwright: card presente, dois Pares grátis adicionando
sem exigir PE, terceiro Par travado sem PE suficiente (nível 1),
liberando ao subir de Nível, PE gasto refletindo a compra e voltando
ao remover, e persistência do catálogo e da prévia após recarregar. Os
vinte e sete testes das fatias anteriores de Thrylikí Chelóna continuam
passando. `tsc` e `lint` limpos.

## 41. Thrylikí Chelóna — Progresso de Nível, Portfólio e Recesso (29/08/2026)

Última peça de `campanha-escolar-v6.1.md` que cabia na ficha (o resto —
recompensas, Facções, Sessão Zero — é procedimento de campanha/mestre,
fora do escopo de "ficha de personagem", igual `manualMestre` já é
texto livre em vez de campo estruturado, decisão #58). Três pedaços:

- **Progresso de Nível**: a campanha escolhe um Ritmo (Acelerado/
  Padrão/Contemplativo) na sessão zero. Só o Padrão usa a trilha de
  duas caixas do documento ("marca uma ao concluir uma sessão com
  decisão significativa; ao preencher duas, sobe de Nível e zera");
  os outros dois ritmos usam um botão direto ("concluiu a sessão/o
  Semestre → sobe de Nível"), porque o documento não descreve caixa
  nenhuma pra eles
- **Portfólio de Prova de Passagem**: os quatro itens (Domínio/Criação/
  Cooperação/Consequência) mais um campo de Recuperação. **Não muda o
  Ano sozinho** — o documento é explícito que a Prova é julgada pelo
  Mestre (Preparação/Aplicação/Reflexão), então o Portfólio completo só
  mostra um aviso; subir de Ano continua sendo o seletor que já existia
  desde o chassi. "Novo Ano" limpa o Portfólio pro próximo ciclo
- **Recesso**: até duas Atividades (das seis do documento) por Recesso,
  com anotações livres — trava a terceira, "Novo Recesso" limpa

Testado com Playwright: os três cards aparecem, trilha de Progresso
travando/liberando o botão de subir, Nível realmente mudando pelos dois
caminhos (trilha e botão direto), Portfólio completo mostrando o aviso,
"Novo Ano" limpando Portfólio e Recuperação, terceira Atividade de
Recesso travada com duas já marcadas, "Novo Recesso" limpando, e
persistência de tudo após recarregar. Os trinta testes das fatias
anteriores de Thrylikí Chelóna continuam passando. `tsc` e `lint`
limpos.

Com isso a varredura dos 60 documentos de design está fechada: tudo que
tinha conteúdo mecânico de personagem virou ficha; o que sobrou
(aventura pronta, glossário puro de vocabulário de campanha, pontos de
playtest, notas de auditoria do próprio autor) é material de mestre ou
meta-processo, não dado de personagem — mesma linha que já valia pra
Fabula Ultima (decisão #36) desde o início do projeto.

## 42. Thrylikí Chelóna — Vida editável, dano e Recuperação (29/08/2026)

Enquanto revisava o que restava depois da varredura da decisão #41,
encontrei o buraco mais básico de todos: **Vida nunca tinha ficado
editável.** `painelDerivados` só lia `p.atual.pv` pra exibir — não
existia um único botão, campo ou fluxo em `public/thryliki-chelona.html`
que escrevesse nesse valor. Um personagem literalmente não conseguia
tomar dano nem se curar na ficha. Comparado a isso, os itens que eu
ainda tinha na lista (Metassímbolo, Chassi/Módulo de Robótica, Perfis/
Traços de Zoologia) são refinamento sobre sistemas que já funcionam;
este era o alicerce faltando.

- **Conversão Impacto ↔ Vida**, do próprio `combate-v6.1.md`: "um
  Impacto é a unidade interna equivalente a aproximadamente 22% da Vida
  máxima" — `regras-base.json` fecha esse número em `0,22`, o mesmo que
  usei. Sofrer Impacto e Curar viram a mesma conta nos dois sentidos
- **Guarda como desconto manual, não automação cega**: o campo "Guarda
  gasta agora" reduz o Impacto bruto (0,25 por ponto) antes de
  converter pra Vida — mas não decrementa sozinho o item de Proteção
  específico na aba Inventário (decisão #37), porque com mais de uma
  Proteção equipada não há como saber qual delas gastar sem perguntar.
  O card mostra a Guarda total disponível como referência e pede pro
  jogador descontar no item certo
- **Primeiros Socorros** (0,5 Impacto de cura, uma vez por cena — Respiro
  libera de novo) e as **quatro escalas de Recuperação**
  (`recuperacao-v6.1.md`): Respiro (não recupera Vida), Intervalo (+25%,
  até dois por Descanso completo, com contador próprio), Repouso (+50%),
  Descanso completo (Vida cheia, zera os dois Intervalos, e reduz cada
  Consequência em 1 — usando a trilha que já existia desde o chassi)
- Percentuais de Recuperação **arredondados pra cima**, exatamente como
  o texto do documento pede; a conversão de dano usa arredondamento
  comum, porque só a Recuperação é explícita sobre a direção

**Deixado de fora, de propósito:** os recursos por Área ("Respiro
devolve Esforço ao valor inicial 2", "Intervalo recupera metade da
Mana"...) já têm os próprios botões de reset em cada painel de Área
desde as fatias #22-#26 — não recriei isso num botão global, porque um
"Respiro" único mexendo em sete estruturas de dados diferentes seria
frágil sem ganhar nada que os botões que já existem não resolvem.

Testado com Playwright: Vida inicial batendo com a fórmula, sofrer
Impacto descontando a conversão certa, Guarda anulando o dano quando
gasta o suficiente, Curar e o ajuste manual +1/-1, Primeiros Socorros
curando e travando até o próximo Respiro, Intervalo recuperando 25% e
contando até dois, travando no terceiro, e Descanso completo enchendo a
Vida, zerando os Intervalos e reduzindo Ferimento em 1. Os trinta e três
testes das fatias anteriores de Thrylikí Chelóna continuam passando.
`tsc` e `lint` limpos.

## 43. Thrylikí Chelóna — Chassi, Núcleo de Consciência e Módulos (29/08/2026)

Voltando à lista de peças deixadas de fora nas fatias de combate
originais (decisão #24: "Sistema/Chassi/Módulos completos (com
Encaixes, Integridade e Configuração) são fatia futura"). De todo o
material de Robótica e Engenharia, esta era a peça que mais faltava —
o resto (Pontos de Comando, Carga, Vitalícia) já funcionava desde a
decisão #24.

- **Chassi**: os oito tipos do documento (Drone/Formação, Autômato
  Humanoide, Exotraje/Mecha, PCHR, Utilitário, Animal Robótico, Arma,
  Veículo/Estrutura) mais a Categoria (I-V), que define a escala
  (Pessoal/Pesado/Colossal/Monumental/absurda com Ascensões)
- **Núcleo de Consciência**: os cinco níveis (Sem Núcleo/Programa/IA/
  Eco Mnêmico/Alma Vinculada), com o lembrete que nenhum concede turno
  próprio — reaproveitado da nota que já existia no painel de recurso
- **Sistemas**: campo de texto pro Sistema Principal, mais Sistemas de
  Apoio com o limite do próprio documento (1 no 1º Ano, até 2 do 2º em
  diante)
- **Módulos**: cartão com Família (das nove do documento: Locomoção/
  Sensor/Ferramenta/Proteção/Armamento/Suporte/Núcleo/Interface/
  Estrutural), Categoria, Ação, Custo (texto livre — PC/Carga/
  Vitalícia variam por Módulo), Impacto (reaproveitando a escala de
  Potência do Construtor Livre de Poder), Âncora e Contrajogo — travado
  pelo teto de Módulos ativos por Ano (2/3/4/6/8, a mesma progressão
  2→8 do documento original)

**Deixado de fora, de propósito:** Encaixe e compatibilidade por Módulo
(o documento pede que cada Módulo declare Encaixe e compatibilidade
específicos do Chassi, mas sem uma lista fechada de Encaixes por tipo
de Chassi pra validar contra, isso viraria texto livre disfarçado de
campo obrigatório); Configuração como estado separado de "ativo/
inativo" por Módulo (o documento já limita quantos Módulos existem
pelo teto — não modelei uma segunda camada de "quais estão ligados
agora" sem um gatilho de jogo claro pra trocar isso em cena).

Testado com Playwright: card aparece só na Área certa, descrição do
Chassi e do Núcleo escolhidos aparecendo, limite de Sistemas de Apoio
por Ano, teto de Módulos por Ano travando o formulário, Módulo salvo
mostrando Família/Impacto/Custo corretos, teto subindo ao trocar de
Ano, remover Módulo, e persistência do Chassi/Núcleo/Módulos após
recarregar. Os trinta e sete testes das fatias anteriores de Thrylikí
Chelóna continuam passando. `tsc` e `lint` limpos.

## 44. Thrylikí Chelóna — Bestiário: Perfis e Traços de Zoologia (29/08/2026)

Última peça deixada de fora nas fatias de combate originais: a decisão
#25 tinha trazido Zoologia e Etologia com "um único campo de texto
livre 'Perfil Ativo' — a grade completa de três Perfis × três Traços
ficou de fora, é complexidade de construtor, não de recurso". Com o
Construtor Livre de Poder, o Inventário e a Robótica já provando que
esses construtores cabem na ficha, essa lacuna também fecha.

- Até **três Perfis preparados**, cada um com nome e até **três
  Traços** — cada Traço escolhe uma Família (das sete do documento:
  Sentido/Locomoção/Defesa/Ataque/Camuflagem/Cooperação/Contramedida) e
  uma descrição livre
- Um rádio marca qual Perfil é o **Ativo** — remover o Perfil ativo
  desmarca, sem travar em referência quebrada
- O campo de texto livre "Perfil Ativo" que a decisão #25 tinha criado
  **continua existindo**, agora relabelado "Nota rápida" — vira um
  resumo de mesa opcional em vez do único lugar pra registrar o Perfil,
  sem quebrar o teste que já dependia dele

Testado com Playwright: card aparece só na Área certa, Perfil e Traço
sendo adicionados/removidos com os tetos de 3/3 certos, rádio de Ativo
mudando e limpando ao remover o Perfil marcado, e persistência do nome
do Perfil e da contagem após recarregar. Os quarenta testes das fatias
anteriores de Thrylikí Chelóna continuam passando, incluindo o teste
original de Zoologia (decisão #25) que ainda depende do campo de texto
livre. `tsc` e `lint` limpos.

Com Perfis e Traços, o levantamento de peças conscientemente deixadas
de fora ao longo da sessão — Fórmula de Simbologia, Construtor Livre de
Poder, Kit de Combate, Inventário, PE, Doenças, Vida editável, Chassi
de Robótica — está fechado. Não há mais nenhuma lacuna conhecida entre
os documentos de design e a ficha.

## 45. Thrylikí Chelóna — Metassímbolo de Simbologia Arcana (29/08/2026)

A decisão #44 declarou o levantamento fechado cedo demais — faltava
ainda o Metassímbolo, citado desde a decisão #23 ("5º Ano: 20 + 1
Metassímbolo") e sempre referenciado no texto do Construtor de
Fórmula, mas nunca com um lugar pra escrever o que ele é.

O documento não dá uma fórmula numérica pro Metassímbolo — só "a
capacidade não aumenta dano, Mana ou d20" e "Tese e exceção autoral
precisa" (Linguagem Conceitual, 5º Ano). Por isso não virou mais um
componente da Fórmula com custo em Tomos/Mana: é um campo de texto
livre, visível só no 5º Ano, pra registrar a exceção nomeada — mesmo
tratamento que Tese já recebe em outros Ramos.

Testado com Playwright: campo ausente antes do 5º Ano, aparece ao
subir de Ano, e persiste após recarregar. Os quarenta e um testes das
fatias anteriores de Thrylikí Chelóna continuam passando. `tsc` e
`lint` limpos.

Agora sim: não há mais lacuna conhecida entre os documentos de design
de Thrylikí Chelóna e a ficha.

## 46. Mesa ao Vivo — Painel de Vida e Ordem de Iniciativa (29/08/2026)

Primeira fatia fora de Thrylikí Chelóna desde a virada de escopo: o Zé
pediu uma forma de acompanhar a vida dos jogadores e dos inimigos
durante a sessão, e um "hub de mestre" com o que se usa numa mesa.
Vale pros quatro sistemas do Hub (Kaizoku no Sho, Fabula Ultima,
Sistema SAO, Thrylikí Chelóna), não só o que estava em construção.

**Vida dos jogadores: acompanhada sozinha, mas só de leitura.** Cada
ficha (jogador e inimigo, dos quatro sistemas) passou a espelhar, a
cada salvamento, um campo genérico `dados.resumoVida = {atual, maxima,
rotulo}` — calculado com a fórmula que já existia naquele sistema (PV
do Fabula Ultima e do SAO, Vida de Thrylikí Chelóna, Vitalidade do
Kaizoku no Sho). É só um espelho: o Hub nunca calcula vida sozinho,
só lê o que a ficha já calculou (decisão #17 — regra de sistema fica
no módulo). O Painel de Vida da Mesa ao Vivo busca esse campo a cada 8
segundos enquanto a tela do mestre estiver aberta — não é tempo real
de verdade (isso pediria Supabase Realtime com política de leitura em
`personagens`, hoje travada por completo, decisão #31), é a versão de
custo zero: o navegador do mestre pergunta de novo sozinho. Na prática
o mestre vê a vida de cada jogador atualizar sozinha em poucos
segundos depois de qualquer mudança na ficha dele — não instantâneo,
mas automático.

Deliberado não deixar o mestre editar a vida do jogador por aqui:
esse número é da ficha do jogador (decisão #13 vale também ao
contrário — o mestre acompanha, não sobrescreve).

**Vida dos inimigos: acompanhada e ajustável, sem abrir a ficha.**
Como o mestre é dono das fichas de inimigo (mesma regra desde
`AdicionarInimigo`), o Painel de Vida tem botões de -5/-1/+1/+5 que
ajustam a vida ali mesmo. Pra ficha de inimigo, aberta depois, não
mostrar um número velho, o ajuste escreve em dois lugares: o espelho
`resumoVida.atual` e o campo "de verdade" daquele sistema — o caminho
de cada um está em `campoVidaInimigo`, um mapa novo em `sistemas.ts`
(`pvAtual` no Fabula Ultima; `atual.pv` no SAO e em Thrylikí Chelóna;
Kaizoku no Sho não tem ficha de inimigo própria, fica de fora). Uma
ficha de inimigo criada mas nunca aberta ainda não tem `resumoVida`
calculado — o painel avisa "abra a ficha uma vez" em vez de adivinhar
um número.

**Ordem de iniciativa.** Lista simples — nome, condição em texto
livre, mover pra cima/baixo, marcar de quem é a vez, contador de
rodada. Fica só no navegador do mestre, por `localStorage`, sem rota
nova nem gasto de banco: não é informação de personagem, é só o
estado da cena de agora.

**Deixado de fora, de propósito:** rolador de dados virtual (as
próprias fichas já assumem "o dado é rolado na mesa", comentário do
Kaizoku no Sho); qualquer coisa em tempo real de verdade (pediria
abrir política de leitura no banco pra tabela `personagens`, hoje
fechada por completo — decisão #31 — e duplicar em SQL a mesma
verificação de permissão que já existe em `podeAcessarPersonagem`);
editar a vida do jogador pelo painel do mestre.

Testado: nove testes automáticos novos (`resumo-vida.test.ts`) para a
leitura, o ajuste com delta e a escrita no caminho aninhado — os 25
testes de `node --test` do projeto continuam passando. Um teste de
Playwright novo confirma que as 7 fichas (4 de jogador, 3 de inimigo)
mandam `resumoVida` válido no PATCH pro Hub a cada salvamento; os
quarenta e um testes das fatias anteriores de Thrylikí Chelóna
continuam passando, sem nenhuma regressão. `tsc --noEmit`, `npm run
build` e `npm run lint` limpos nas duas branches.

**Limite desta verificação:** esta sessão não tem acesso ao Supabase
nem ao login real, então a tela da Mesa ao Vivo e as duas rotas novas
(`/api/campanhas/[id]/vida` e `/api/campanhas/[id]/vida/[personagemId]`)
foram conferidas por `tsc`, `next build` (compila todas as rotas) e
lint — não por um clique de verdade no navegador com uma campanha e
jogadores reais. Fica pro Zé confirmar visualmente na primeira sessão
em que usar.

## 47. Campanha Livre — sistema novo para importar do ChatGPT (01/09/2026)

O Zé trouxe um pacote de especificação (`HUB_UPDATE`) para as campanhas
de mesa solo, onde o ChatGPT faz de mestre: ele responde com um bloco
`[HUB_UPDATE]...[/HUB_UPDATE]` em YAML (XP, recursos, itens, etc.) que
o jogador cola no Hub, revisa e confirma.

**Virou um sistema novo, "Campanha Livre", em vez de entrar num dos
quatro sistemas existentes.** O vocabulário do pacote (XP genérico,
"recursos" de nome livre, missões, NPCs, bestiário próprio) não é regra
de nenhum sistema de RPG específico — é o formato que o ChatGPT usa
como mestre livre. Colocar isso dentro do Kaizoku ou do Fabula Ultima
teria espalhado uma coisa genérica dentro de um módulo de sistema
específico, contra a decisão #17. Perguntei ao Zé antes de começar; ele
confirmou sistema novo.

**Primeira fatia: só o núcleo mínimo** (decisão #26 — o pacote descreve
quase vinte tipos de operação, undo, snapshot, event log; isso tudo
fica documentado no pacote pra depois). O que está no ar agora: colar
o texto → interpretar o bloco YAML → revisar cada mudança numa lista
com checkbox (com o "antes → depois" de cada valor, editável antes de
confirmar) → confirmar → salva na ficha. Cinco operações: `xp`,
`resources`, `items_add`, `items_remove`, `notes_add`.

Regras que vieram do pacote e foram mantidas: `version: 1` obrigatório
no cabeçalho; delta (`add`/`remove`/`change`) é preferido a valor
absoluto (`set` dá aviso); detecção de duplicidade por `update_id` ou
hash do bloco colado, bloqueando confirmação de novo até a pessoa
escolher "Importar mesmo assim"; mudança com erro (ex.: remover item
que não existe no inventário) nunca é aplicável, mesmo marcada; um
campo que o Hub ainda não entende é ignorado com aviso, nunca quebra o
resto do bloco.

**Ficha nova, arquitetura nova pro Hub.** É o primeiro dos cinco
sistemas que não é um HTML estático em `/public` — é uma página
Next.js normal (`/campanha-livre`), porque o fluxo de revisão em
etapas (colar → interpretar → editar antes de confirmar → histórico)
pedia estado de componente que dava mais trabalho em JS puro do que em
React. O contrato com o resto do Hub continua o mesmo: `?id=` na URL,
ler/salvar por `/api/personagens/[id]`, mesma checagem de permissão de
sempre (decisão #13) — só quem é dono edita ou importa; quem só tem
acesso compartilhado vê tudo em modo leitura.

Testado: 62 testes automáticos (`node --test`) cobrindo o parser, a
validação contra o estado atual da ficha e a aplicação das mudanças.
Dois testes de Playwright novos: um fluxo completo (colar bloco com as
cinco operações, conferir contas de antes/depois no preview, confirmar,
conferir o PATCH final, reabrir com o mesmo bloco e confirmar que trava
por duplicidade) e um do modo leitura (confirma que os botões de editar
e o de importar somem, campos ficam desabilitados). `tsc --noEmit`,
`npm run build` (rota aparece prerenderizada) e `npm run lint` limpos.

**Pendência de banco:** a migração `0009_sistema_campanha_livre.sql`
cadastra o sistema na tabela `sistemas` — sem rodar ela no Supabase,
criar uma ficha de Campanha Livre falha com "sistema desconhecido",
mesma situação já vista nas migrações 0007/0008. **Rodada pelo Zé em
01/09/2026** — confirmada com "Success. No rows returned."

## 48. Campanha Livre — segunda fatia: Nível e ficha (01/09/2026)

Segunda fatia do protocolo HUB_UPDATE, escolhida pelo Zé entre quatro
opções (a outras três — missões/NPCs, conhecimento/mundo, desfazer com
event log — ficam documentadas no pacote original pra depois, decisão
#26). Cobre o grupo "Personagem/Inventário" que faltava da
especificação: `level`, `attributes`, `items_update`, `equipment`,
`currency`.

**Dois campos novos na ficha, no mesmo formato de `recursos`** (mapa de
nome livre, decidido pela campanha, não uma lista fixa): `atributos`
(ex: FOR, INT — sem teto, diferente de `recursos` que tem `maximo`) e
`moedas` (ex: berries — só um total). `nivel` já existia desde a fatia
mínima; agora o protocolo pode alterá-lo via `level.change`/`level.set`
além de editar direto no cabeçalho da ficha.

**Item ganhou `equipado` e `slot`.** `items_update.changes` aceita um
subconjunto de campos do item (descrição, categoria, raridade, origem,
notas, quantidade, e o booleano `equipped`) e mostra antes → depois de
cada campo mudado no preview (regra #15 do protocolo). `equipment.equip`
e `equipment.unequip` fazem a mesma coisa de forma mais específica — com
o nome do slot (ex: "hand"). As duas formas convivem porque o pacote
define os dois jeitos de mexer no mesmo estado; ambas passam pela mesma
validação (item precisa existir no inventário, senão vira erro
bloqueante, igual a `items_remove` desde a fatia mínima).

Todos os campos novos também dá pra editar direto na ficha, sem passar
pelo ChatGPT: seções "Atributos" e "Moedas" (adicionar/remover/editar,
igual a Recursos) e uma caixinha "Equipado" com campo de slot em cada
item do Inventário.

Testado: 20 testes automáticos novos (82 no total do projeto) cobrindo
parser, validação e aplicação das 5 operações. Um teste de Playwright
novo cobre o fluxo completo de importação com as 5 operações
combinadas (nível, atributo, item atualizado, item equipado, moeda) e a
edição manual de Atributos/Moedas/Equipado; os dois testes de Playwright
da fatia anterior continuam passando sem regressão. `tsc --noEmit`,
`npm run build` e `npm run lint` limpos.

## 49. Campanha Livre — terceira fatia: Missões e NPCs (01/09/2026)

Terceira fatia do protocolo HUB_UPDATE, escolhida pelo Zé entre três
opções restantes (conhecimento/mundo e desfazer-com-event-log ficam
documentadas no pacote original pra depois, decisão #26). Cobre o
grupo "Missões" e "NPC" da especificação: `missions_add`,
`missions_update`, `npcs_add`, `npcs_update`, `relationships`.

**Dois campos novos na ficha, ambos listas** (diferente de
`recursos`/`atributos`/`moedas`, que são mapas de nome livre — aqui
cada missão e cada NPC precisa de identidade própria, então é lista de
objetos com `id`): `missoes` e `npcs`.

**Missão** guarda nome, descrição, status (disponível/ativa/concluída/
falhou/abandonada/oculta — tradução direta dos seis valores do
protocolo), uma lista de objetivos (texto + pendente/concluído/falhou)
e duas listas de texto livre (recompensas, anotações). `missions_update`
tem 8 ações possíveis (regra do protocolo): 6 mexem em objetivo/status/
anotação/recompensa da missão, e `reveal_reward` foi simplificada pra
se comportar igual a `add_reward` — esta fatia não modela recompensa
oculta vs. revelada como dois estados, só uma lista de recompensas
conhecidas, então "revelar" e "adicionar" dão no mesmo.

**NPC** guarda nome, descrição, onde foi conhecido, tags, uma lista de
"conhecimento" (regra #55 do protocolo: só o que o jogador já sabe,
nunca segredo de mestre ainda não revelado) e `relacoes` — um mapa de
nome livre (trust, proximity, o que a campanha usar), no mesmo estilo
de `atributos`.

**Toda mudança que referencia uma missão/NPC exige que ele já exista**
na ficha atual (checado contra o estado de antes da importação, não
contra outras mudanças do mesmo lote) — senão vira erro bloqueante,
mesma regra já usada em `items_remove`/`items_update` desde fatias
anteriores. Na prática: um `missions_update` pra uma missão criada no
mesmo bloco de `missions_add` é rejeitado — o ChatGPT deve colocar os
objetivos iniciais direto dentro de `missions_add.objectives`, não
como uma atualização separada no mesmo bloco.

Tudo também editável direto na ficha: seções "Missões" (com seletor de
status por missão e por objetivo, e "+ Objetivo"/"+ Missão" manuais) e
"NPCs" (relações como números editáveis igual a Atributos, "+
Conhecimento"/"+ NPC" manuais).

Testado: 23 testes automáticos novos (105 no total do projeto)
cobrindo parser, validação e aplicação das 5 operações. Um teste de
Playwright novo cobre duas importações em sequência (a primeira cria
missão/NPC/relação, a segunda atualiza a missão já existente — provando
na prática por que a mesma importação não funciona) mais a edição
manual de status de objetivo/criação de missão/NPC; os três testes de
Playwright das fatias anteriores continuam passando sem regressão.
`tsc --noEmit`, `npm run build` e `npm run lint` limpos.

**Nota técnica:** durante a verificação desta fatia, o servidor de
produção rodando nesta sessão (`npm run start`) começou a servir
arquivos estáticos com hash de um build anterior — cache incremental do
Turbopack ficando incoerente entre builds sucessivos na mesma sessão de
terminal, não um bug do código. Resolvido apagando `.next` e
reconstruindo do zero; não afeta o Zé (cada deploy no Vercel já parte
de um build limpo).

## 50. Campanha Livre — quarta fatia: Conhecimento e mundo (01/09/2026)

Quarta fatia do protocolo HUB_UPDATE, escolhida pelo Zé entre as duas
opções restantes (desfazer-com-event-log fica documentada no pacote
original pra depois, decisão #26). Cobre o grupo "Conhecimento" e
"Mundo" da especificação: `notes_update`, `notes_remove`,
`discoveries_add`, `discoveries_update`, `codex_add`, `locations_add`,
`locations_update`, `bestiary_add`, `journal`.

**Cinco campos novos na ficha, todos listas** (mesmo padrão de
`missoes`/`npcs`): `descobertas` (título, status em sete graus —
desconhecido/suspeita/teoria/testando/parcial/confirmada/refutada —,
evidências), `codex` (lore de referência, só `titulo`+`texto`, sem
update/remove — o protocolo só define `codex_add`), `locais`
(descoberto ou não, conhecimento acumulado), `criaturas` (bestiário,
com traços conhecidos) e `diario` (entradas com resumo e lista de
eventos).

**Regra #40 do protocolo — "remover é perigoso"** — implementada sem
inventar um quarto nível de alerta (o Hub só tem
info/warning/error desde a primeira fatia): `notes_remove` continua
igual às outras mudanças na tela de revisão, mas **não vem marcado por
padrão** como todas as outras — a pessoa precisa marcar a caixa
ativamente pra confirmar a remoção. Mais simples que adicionar um nível
"perigo" à interface inteira, e cumpre a mesma função.

**`notes_remove` referencia por `title`, não por `id`.** O protocolo
sugere `id: note-001`, mas esse id é conceitual do lado do ChatGPT — as
colinhas do Hub têm um id interno gerado no servidor que o ChatGPT
nunca vê. Na prática ele só conhece o título que ele mesmo deu na
colinha (via `notes_add`), então a resolução é por título — mesmo
padrão já usado em toda mudança que referencia algo por nome (item,
missão, NPC). Aceita `id` como alternativa, se algum dia o protocolo
mandar um.

Toda mudança que atualiza uma descoberta ou local exige que ele já
exista (mesma regra de `items_remove`/`missions_update`/`npcs_update`
das fatias anteriores). `discoveries_add`/`codex_add`/`locations_add`/
`bestiary_add` não duplicam entrada com o mesmo título/nome — reimportar
o mesmo bloco não cria cópias.

Tudo também editável direto na ficha: cinco seções novas (Descobertas,
Locais, Bestiário, Codex, Diário), cada uma com adicionar/remover
manual; Descobertas ganha seletor de status, Locais ganha checkbox de
"descoberto" e campo de conhecimento adicional.

Testado: 28 testes automáticos novos (133 no total do projeto)
cobrindo parser, validação e aplicação das 9 operações. Um teste de
Playwright novo cobre três importações em sequência (criar
descoberta/local/criatura/codex/diário e acrescentar numa colinha
existente; atualizar descoberta/local já existentes; remover uma
colinha confirmando que vem desmarcada por padrão) mais a criação
manual de descoberta e local; os 4 testes de Playwright das fatias
anteriores continuam passando sem regressão. `tsc --noEmit`, `npm run
build` e `npm run lint` limpos.

## 51. Campanha Livre — quinta e última fatia: Desfazer e histórico (01/09/2026)

Última fatia do protocolo HUB_UPDATE. Não adiciona operação nova —
implementa as regras #12/#41/#44/#45 que ficaram de fora desde a fatia
mínima: desfazer por mudança individual (não só "desfazer a importação
inteira") e um log de eventos que registra o que cada mudança fez.

**Como o desfazer funciona, tecnicamente.** Em vez de guardar "que
operação foi essa e como inverter matematicamente" (o que pediria um
caso especial pra cada uma das 24 operações), cada evento guarda como a
entidade inteira estava **antes** daquela mudança específica — ou
`null` se a entidade não existia (ou seja, a mudança criou ela).
Desfazer é sempre a mesma lógica, não importa o tipo de mudança:
- Campo do personagem (XP, Nível): volta pro número de antes
- Mapa de nome livre (recursos, atributos, moedas): restaura o valor
  antigo, ou remove a chave se ela não existia antes
- Entidade com identidade própria (item, colinha, missão, NPC,
  descoberta, local, criatura, codex, diário): substitui a entidade
  inteira pela versão de antes, ou remove ela se não existia

Essa generalização significa que desfazer um `missions_update` (que
mexeu só num objetivo, por exemplo) restaura a missão inteira de uma
vez — sem precisar saber qual dos 8 tipos de ação (`complete_objective`,
`set_status`, etc.) gerou aquele evento.

**Desfazer nunca apaga o evento original** (regra #12/#44) — só marca
`revertido: true`. A linha continua na tela do Histórico, riscada, com
"(desfeito)" no lugar do botão.

**Escopo:** o event log e o desfazer valem só pra mudanças vindas de
uma importação do ChatGPT — edições manuais na ficha (Recursos,
Inventário, etc.) continuam sem undo dedicado, porque são diretamente
editáveis pela própria pessoa a qualquer momento; não fazia sentido
duplicar esse controle. Isso bate com o próprio modelo do protocolo
(§41), que é especificamente sobre eventos de importação.

**Migração de dados:** fichas já existentes (das quatro fatias
anteriores) têm `historicoImportacoes` sem `id` — `normalizarPersonagemLivre`
completa com um id sintético (`import-legado-N`) na leitura, então o
Histórico continua funcionando pra importações antigas, só sem a lista
de eventos individuais pra desfazer (mostra o resumo em texto puro,
como era antes).

Testado: 9 testes automáticos novos (142 no total do projeto) cobrindo
geração de evento por mudança, desfazer em cada uma das três formas
(campo raiz, mapa, lista — criação e atualização), imutabilidade do
desfazer e proteção contra desfazer duas vezes o mesmo evento. Um teste
de Playwright novo: importa um bloco com 3 mudanças, desfaz só o XP
(confere que mana e item não são afetados), confere que a tela mostra
"(desfeito)" e que o botão some pra esse evento, desfaz também a
criação de um item (some do inventário sem afetar os outros). Os 5
testes de Playwright das fatias anteriores continuam passando sem
regressão. `tsc --noEmit`, `npm run build` e `npm run lint` limpos.

**O protocolo HUB_UPDATE está completo** nas suas ~24 operações e nas
regras de segurança do pacote original (v1), construído em cinco fatias
ao longo do dia (decisões #47 a #51), cada uma no ar e usável antes da
próxima começar (decisão #26).

## 52. Campanha Livre — Missões/NPCs/Descobertas/Locais/Bestiário/Codex/Diário/Colinhas em abas (01/09/2026)

Ajuste de interface pedido pelo Zé depois que o protocolo HUB_UPDATE
ficou completo: a página estava crescendo muito na vertical com oito
seções empilhadas (cada uma podendo ter várias entradas). Viraram abas
— só uma seção visível por vez, trocando com um clique — dentro de um
único bloco na ficha, sem mexer em Recursos/Atributos/Moedas/Inventário
(que continuam sempre visíveis, por serem consultados com mais
frequência durante a sessão).

Puramente visual: nenhuma lógica de dados mudou, só como a página
organiza o que já existia. Cada seção perdeu seu próprio `<h2>` (o nome
da aba já cumpre esse papel) e virou o conteúdo interno de uma aba;
trocar de aba não perde nada do que foi digitado nas outras — é só
`useState` escolhendo qual seção renderizar, os dados continuam vindo
do mesmo objeto `dados` de sempre.

Testado: os 142 testes automáticos (inalterados, já que nenhuma lógica
mudou) continuam passando. Um teste de Playwright novo confirma que as
8 abas aparecem, que só a primeira mostra conteúdo por padrão, que
clicar em cada uma mostra a entidade certa, e que trocar de aba não
apaga o que foi criado manualmente em outra. Os 6 testes de Playwright
das fatias anteriores precisaram de pequenos ajustes (clicar na aba
certa antes de preencher um campo que só existe nela) e continuam
passando. `tsc --noEmit`, `npm run build` e `npm run lint` limpos.

## 53. Campanha Livre — desfazer importação inteira e três correções do teste pesado (01/09/2026)

Duas rodadas do Zé no mesmo dia. Primeiro ele pediu "desfazer importação
inteira" além do desfazer individual (já existente desde a decisão
#51); testando essa fatia, ele achou três problemas reais no núcleo do
protocolo que vinham desde as fatias mais antigas.

**Desfazer importação inteira.** Cada import no Histórico ganhou um
botão que abre um preview — "Serão revertidas N alterações:" com uma
linha por mudança ainda ativa, no sentido do desfazer (`XP 5 → 0`,
`remover item "X"`, `reverter colinha "Y"`) — e só desfaz de verdade ao
clicar Confirmar. Tecnicamente, reverte na ordem inversa de aplicação
(mais recente primeiro): se duas mudanças da mesma importação mexeram
na mesma entidade (ex: `items_add` seguido de `items_update` no mesmo
item), desfazer fora de ordem reintroduziria um estado intermediário
que nunca existiu de verdade. Só mexe em eventos ainda `revertido:
false` — se parte da importação já foi desfeita individualmente antes,
esses eventos são pulados. Nova função `eventosConflitantes` detecta
quando uma OUTRA importação, depois desta, mexeu na mesma célula de
dado, e mostra um aviso no preview — sem bloquear nem tentar mesclar
automaticamente (isso pediria um sistema de merge que o protocolo não
descreve); quem decide se desfaz mesmo assim é a pessoa.

**Bug 1 — dependência dentro do mesmo bloco não era resolvida.**
`npcs_add: Mira Teste` seguido de `relationships: npc: Mira Teste` no
MESMO HUB_UPDATE fazia a relação ser rejeitada, porque a validação só
olhava pro estado já salvo (`atual`), nunca pro que as outras mudanças
do mesmo lote iam criar. Corrigido com um terceiro parâmetro opcional
em `validarContraPersonagem`: um estado **projetado** — a ficha atual
com as criações atualmente marcadas no preview já aplicadas por cima,
só em memória (a função `aplicarMudancas` de sempre, chamada com um
importId descartável). Checagens de existência (item, NPC, missão,
colinha, descoberta, local) passaram a usar esse projetado; checagens
numéricas (recurso indo negativo) continuam usando o estado real, já
que são sobre o efeito da própria mudança, não sobre dependências.
Como o projetado é recalculado a cada mudança de seleção, marcar/
desmarcar o checkbox de "Novo NPC" revalida a relação na hora — sem
salvar nada, o preview continua 100% local até o Confirmar.

**Bug 2 — recurso indo negativo sem aviso quando ainda não existia.**
`mana: 0 → -3` não gerava warning porque o código só checava limites
"se o recurso já existir" — um recurso sendo criado agora (primeira
referência no HUB_UPDATE) pulava a checagem inteira. Corrigido removendo
essa guarda. Aproveitado pra também dar à campanha um **mínimo
configurável** (`RecursoLivre.minimo`, mesmo modelo do `maximo` que já
existia) — sem mínimo configurado, o Hub ainda avisa se ficar negativo
(comportamento de sempre), mas quem quiser um piso diferente (ou nenhum
piso, permitindo negativo de propósito) configura na ficha. Nunca
bloqueia — regra do protocolo é avisar, não corrigir sozinho.

**Bug 3 — `generate_image: true` não aparecia em lugar nenhum.**
`items_add` já aceitava o campo (regra §32 do protocolo) mas o preview
não mostrava nada e o item salvo não guardava a informação. Agora o
preview mostra "Imagem solicitada — pendente" e o item criado guarda
`imagemPendente: true` e `promptImagem` (visível também na ficha depois
de salvo). A geração em si nunca acontece — fica só marcado, pendente,
sem gerar imagem nem bloquear a importação, exatamente como o Zé pediu.

Testado: 16 testes automáticos novos (158 no total do projeto) cobrindo
desfazer importação inteira (ordem certa, pula eventos já desfeitos,
não mexe em outra importação), `eventosConflitantes`, o bug do recurso
recém-criado, o mínimo configurável, a resolução de dependência via
projetado (com e sem ela, pra provar a diferença) e `generate_image`.
Um teste de Playwright novo reproduz o cenário exato relatado pelo Zé
de ponta a ponta: aviso de mínimo, dependência resolvida E reativa
(desmarcar o NPC invalida a relação, remarcar revalida), imagem
pendente no preview e na ficha salva, e desfazer a importação inteira
revertendo tudo. Os 7 testes de Playwright das fatias anteriores
continuam passando sem regressão. `tsc --noEmit`, `npm run build` e
`npm run lint` limpos.

## 54. Campanha Livre — fecha o HUB_UPDATE v1.0 (01/09/2026)

Última rodada do protocolo: as 11 operações que faltavam pra fechar a
especificação v1.0. Todas seguem exatamente o mesmo fluxo das 24 já
existentes (parse → validação → resolução de referências → estado
projetado → preview → checkbox/edit → confirmação → gravação → event
log → histórico → undo) — nenhum atalho novo por módulo.

**`temporary_modifiers`** (add/remove) — nome, alvo livre, valor e
duração obrigatória (`rounds`/`turns`/`scenes`/`sessions`/`until_rest`/
`until_removed`/`custom`). **`conditions`** (add/remove/update) — igual,
mas duração é opcional (uma condição pode não ter prazo definido).
Ambos ficam numa seção "Condições e modificadores" **sempre visível**,
fora de qualquer aba — é informação relevante durante a sessão, esconder
atrás de um clique atrapalharia.

**`spells_add`/`spells_update`/`spell_discoveries`** — magia com custo
genérico (`Record<string, number>`, nunca assumindo "mana"), afinidade e
tags livres. `spells_update.discoveries_add` (texto solto) e
`spell_discoveries` (título/descrição/status: teoria/testando/parcial/
confirmada) guardam em dois campos separados da mesma magia
(`descobertasSimples` vs `descobertas`) — são coisas diferentes na
especificação, mesmo com nome parecido.

**`research_add`/`research_update`** — status como texto livre (a
especificação não fecha uma lista, diferente de missão), progresso,
objetivos/evidências/notas acumulados por `_add`. **`achievements_add`**
— conquista simples, com proteção contra duplicação pelo nome.
**`reputation`** — alvo livre (facção, NPC, cidade, o que a mesa usar),
modelado como mapa `Record<string, number>` igual `moedas` — mesmo
mecanismo de undo, sem precisar de estrutura nova.

**`image_requests`** — operação própria, diferente do
`generate_image: true` de item (decisão #53): vira uma fila
(`filaImagens`) vinculada à entidade, nunca gera nada sozinha, nunca
bloqueia a importação. Tem sua própria aba, com botão pra marcar como
atendida manualmente — preparado pra uma futura integração de geração de
imagem, mas essa integração em si está fora de escopo (decisão #23 veta
IA dentro do app).

**`school`** — pedido explícito do Zé, fora da especificação, porque vai
usar em campanhas escolares. Implementado só `lessons_add` (matéria,
tópico, notas), porque foi o único formato que ele deu um exemplo
concreto — presença, trabalhos, provas e calendário ficaram de fora por
não terem forma definida ainda (nada foi inventado). Estrutura genérica
(`materia`/`topico`/`notas`), não hardcoded pra "Academia Mágica".

**Estado projetado generalizado.** A resolução de dependências dentro do
mesmo import (decisão #53) agora cobre as novas criações: `spell
_discoveries` pra uma magia criada no mesmo bloco, `research_update`
pra uma pesquisa criada no mesmo bloco, `conditions.update` pra uma
condição criada no mesmo bloco — tudo reage ao checkbox exatamente como
`npcs_add` + `relationships` já reagia.

**Snapshots** — cópia da ficha inteira num momento (`criarSnapshot`/
`restaurarSnapshot` em `aplicar.ts`), fora do pipeline de Mudanca:
não é uma operação de HUB_UPDATE, é um botão manual na ficha. Restaurar
nunca é destrutivo em silêncio — sempre mostra preview com XP/nível/
inventário do snapshot antes de confirmar, e tira um backup automático
do estado atual antes de trocar, pra não perder nada se a pessoa se
arrepender. Só o gatilho manual foi implementado — os gatilhos
automáticos que a especificação sugere (início/fim de sessão, antes de
importação grande) não têm o que os disparar, porque o Hub não tem
conceito de "sessão" como evento de sistema; ficam documentados como não
implementados, não inventados.

**Simplificações documentadas** (a especificação permite marcar como
opcional quando não há forma definida): relações de pesquisa com magia/
NPC/local/item não ganharam sistema de referência íntegra — o campo não
foi implementado, porque a especificação não definiu o formato; os
gatilhos automáticos de snapshot (acima); e `school` restrito a
`lessons_add` (acima).

Testado: 50 testes automáticos novos (208 no total do projeto) cobrindo
parse/validação/aplicação/desfazer/duplicação/referência-ausente/
dependência-mesmo-import de cada uma das 11 operações, mais um teste
unitário combinando 8 delas (condition + temporary_modifier + spell +
spell_discovery + research + achievement + reputation + image_request)
no mesmo bloco HUB_UPDATE, aplicando e desfazendo a importação inteira
de uma vez. Dois testes de Playwright novos: um reproduz o bloco
combinado de ponta a ponta na interface (preview, reatividade do
checkbox de `research_update` dependendo de `research_add` no mesmo
lote, confirmação, as 6 abas novas, desfazer individual e desfazer
importação inteira) e outro cobre o fluxo de snapshot manual (criar,
restaurar com preview, backup automático). `tsc --noEmit`, `npm run
build` e `npm run lint` limpos.

Com esta decisão, o HUB_UPDATE v1.0 está completo: as 24 operações
anteriores mais estas 11 cobrem toda a especificação, com as três
simplificações acima documentadas em vez de inventadas.

## 55. Grimório de Thrylikí Chelóna (01/09/2026)

Pedido do Zé: "grimórios nas fichas, que explicam explicitamente todo o
conteúdo do sistema, como ele funciona e como aprender o sistema" — um
manual do jogador por sistema. Como isso toca as 5 fichas do Hub e uma
delas (Fabula Ultima) é comercial, a decisão de escopo/formato foi
tomada em conversa antes de escrever:

- **Por onde começar**: Thrylikí Chelóna primeiro — é homebrew original
  do Zé, sem a restrição de direito autoral que trava Fabula Ultima.
- **Fabula Ultima**: fica de fora desta fatia. O Hub só pode codificar
  mecânica (regra já registrada nesta lista de decisões — nunca copiar
  texto/descrição do livro, já que o Hub é aberto a qualquer conta
  Google); pra um grimório de FU que "explica todo o conteúdo", o Zé
  vai escrever o texto de regras ele mesmo e eu só formato.
- **Formato**: página HTML nova (`public/thryliki-chelona-grimorio.html`),
  linkada a partir da ficha, da ficha de inimigo e do Escudo do Mestre
  (botão "📖 Grimório", abre em nova aba pra não perder o estado da
  ficha) — não uma seção dentro da própria ficha.

**Conteúdo**: 22 seções cobrindo tudo que o sistema faz — conceito geral
(Ano ≠ Nível, Áreas como mini-sistemas de combate, Impacto como régua
universal), Atributos e as 24 Perícias, o Teste (`1d20 + Grau +
Treinamento`) com graus de resultado e Patamares, as 26 Origens
completas, as 16 Áreas e a estrutura dos 117 Ramos, o combate específico
de cada uma das 6 Áreas originais e das 10 novas (recurso, geração,
limite, recuperação, contrajogo, ações), o Construtor de Fórmula de
Simbologia Arcana e o Construtor Livre de Poder das outras 15 Áreas
(com a tabela de custo por Área), Técnicas de Ramo e o Kit de Combate
do 1º Ano das 6 Áreas originais, Interação Social, Inventário, Projetos
de criação/melhoria/reparo, a economia de PE/Marcos/Ascensões/
Categoria, Doenças/Demi-humanos/Místicos, Nível/Portfólio/Recesso,
Vida/dano/Recuperação, Chassi/Núcleo de Consciência/Módulos, o
Bestiário de Zoologia, o Metassímbolo do 5º Ano, e uma seção só pro
Mestre (Ficha de Inimigo, Fases de Chefe, Orçamento de Encontro).

Antes de escrever uma linha, um agente de pesquisa leu as decisões #20
a #45 inteiras e o código-fonte das três fichas do sistema (ficha de
jogador, de inimigo, Escudo do Mestre) pra extrair fórmulas exatas,
listas fechadas e textos já escritos — nada no grimório foi inventado;
onde uma decisão só resumia algo em prosa, o número exato ou a lista
completa foi conferido direto no código antes de entrar no grimório
(ex.: as 26 Origens com o texto integral de cada Permissão, a tabela de
custo em Mana/Tomos de cada peça de Fórmula, a tabela `PODER_CUSTO_AREA`
completa das 15 Áreas).

Página estática, mesma paleta visual da ficha (fundo escuro, destaque
âmbar) — sumário fixo com âncoras pras 22 seções, `<details>` pra listas
longas (as 26 Origens, o detalhamento de cada uma das 10 Áreas novas, a
tabela de custo por Área do Construtor Livre) ficarem fechadas por
padrão sem obrigar rolagem gigante. Sem JavaScript — é conteúdo, não
ferramenta interativa.

Testado com Playwright: as 22 entradas do sumário apontam pra âncoras
que existem, os `<details>` abrem ao clicar, sem erro de JS/console.
`tsc --noEmit` e `npm run lint` continuam limpos (a mudança é só HTML
estático em `public/`, não toca em código TypeScript).

**Pendência explícita**: os outros 4 sistemas (Fabula Ultima, SAO,
Kaizoku no Sho, Campanha Livre) ainda não têm grimório — decisão #26
("uma fatia por vez") se aplica aqui também: cada um vira sua própria
fatia quando o Zé pedir.

## 56. Thrylikí Chelóna — grimório conectado ao Hub, exemplos e Caminhos Prontos (01/09/2026)

Três pedidos do Zé na sequência da decisão #55.

**Grimório conectado ao Hub.** A pergunta "mas tá conectado ao hub?"
revelou que o grimório só era alcançável pelos links manuais colados nas
próprias páginas HTML — não aparecia em lugar nenhum do Next.js. Corrigido
do mesmo jeito que o Escudo do Mestre já funciona: novo campo `grimorio`
em `Sistema` (`src/lib/sistemas.ts`), preenchido só pro Thrylikí Chelóna
(`null` nos outros 4, mesma lógica de "uma fatia por vez"). A página da
campanha (`/campanhas/[id]`) agora mostra um link "📖 Abrir Grimório"
tanto pro mestre (ao lado do Escudo do Mestre) quanto pro jogador (perto
de escolher a ficha) — o jogador precisa aprender o sistema tanto quanto
o mestre, então o link não ficou só do lado do mestre.

**Exemplos na ficha.** Os campos de texto mais abertos da ficha — onde
"a folha em branco" mais trava um jogador novo — ganharam `placeholder`
com exemplo concreto: os 7 campos do Construtor Livre de Poder (Intenção,
Acesso, Âncora, Forma, Teste/Resistência, Contrajogo, Resíduo, todos
coerentes entre si — um único poder de exemplo, "Investida da Alcateia"),
4 campos de Projeto (Intenção, Base, Materiais e oficina, Falha
interessante), Perfil de item, e Aparência do personagem. Só
`placeholder` — não são valores pré-preenchidos, somem ao digitar.

**Caminhos Prontos.** Um atalho de criação por Área — 16 arquétipos
(`CAMINHOS_PRONTOS` em `thryliki-chelona.html`), um por Área de Estudo,
cada um com uma Origem cujos Treinamentos fixos fazem sentido pra Área,
a mesma distribuição de 5 pontos livres da criação normal (base Grau 1,
teto Grau 3), e uma dica citando a primeira ação do Kit/ações comuns
daquela Área pro primeiro turno. Card novo "Caminho pronto" no topo da
aba Status: escolher no seletor atualiza a prévia (pitch + dica) sem
salvar nada; "Aplicar este Caminho" preenche Origem/Atributos/
Treinamentos do personagem atual de uma vez (pede confirmação se Origem
ou Área já estiverem escolhidas, pra não sobrescrever em silêncio) — não
cria ficha nova nem mexe em Ano, Nível, Inventário ou qualquer outra aba.

Os pares Área↔Origem foram escolhidos pela sobreposição real de
Treinamento com a Perícia mais usada por aquela Área (ex.: Simbologia
Arcana com a Origem "Estudante de Simbologia", que já treina Simbologia
e Conhecimentos) — não são arbitrários.

Testado com Playwright: as 16 opções do seletor aparecem, trocar a opção
atualiza a prévia sem gravar, "Aplicar" preenche Origem/Área/Atributos/
Treinamentos corretamente, reaplicar por cima de uma escolha já feita
pede confirmação, e os placeholders novos aparecem nos campos certos —
sem erro de JS. `tsc --noEmit`, `npm run lint` e os 208 testes
automáticos (inalterados — mudança é HTML estático + um campo opcional
em `Sistema`) continuam limpos.

## 57. Thrylikí Chelóna — exemplos na aba Progressão (01/09/2026)

Continuação direta do pedido de exemplos da decisão #56, agora cobrindo
a aba inteira de Progressão: os 6 campos de texto livre que ainda não
tinham `placeholder` de exemplo concreto ganharam um — Talento (Descrição,
antes só repetia a regra "ligado ao motor da Área", agora com um exemplo
de verdade), Recursos e Eletivas (Descrição), Marco (Descrição), Ascensão
(Descrição), Recuperação do Portfólio, e Anotações do Recesso.

Mesmo padrão das decisões #55/#56: exemplos são só `placeholder`, somem
ao digitar, não são valores pré-preenchidos nem inventam mecânica nova —
cada exemplo referencia algo que já existe no próprio sistema (a técnica
Golpe Fundamental, o recurso Esforço de Corpo e Cinética, etc.).

Testado com Playwright: personagem no 5º Ano/Nível 20 (pra ter Marco e
Ascensão disponíveis), os 6 campos confirmados com o placeholder certo,
sem erro de JS. `tsc --noEmit`, `npm run lint` e os 208 testes
automáticos continuam limpos (mudança é só HTML estático).

## 58. Thrylikí Chelóna — links da ficha pro Grimório (01/09/2026)

Pedido do Zé: além do exemplo em cada campo, um link direto pra seção do
Grimório que explica aquele pedaço específico da mecânica — não só um
link genérico no topo da página (que já existia desde a decisão #55/#56).

Função `linkGrim(ancora, texto)` nova em `thryliki-chelona.html`: gera um
link `📖 <texto>` pra `/thryliki-chelona-grimorio.html#<ancora>`, sempre
em nova aba (nunca perde o que está sendo preenchido). Espalhado em
**26 pontos** por toda a ficha, cobrindo praticamente todo painel que
tem uma seção correspondente no Grimório:

- **Status**: Caminho pronto → `#aprender`; Origem → `#origens`; Área de
  Estudo → `#areas`; Ramo → `#tecnicas`; Doenças → `#doencas`
- **Atributos**: Atributos → `#atributos`; Perícias/Treinamentos →
  `#teste`
- **Progressão**: Pontos de Evolução, Talentos, Recursos/Eletivas, Marcos
  e Ascensões → `#progressao` (5 links, um por card, mesma âncora — a
  seção do Grimório cobre a tabela de custo inteira); Progresso de
  Nível, Portfólio e Recesso → `#nivel` (3 links)
- **Combate**: cada painel de Área original (Corpo e Cinética, Simbologia
  Arcana, Robótica, Botânica, Arte, Zoologia) → `#originais`; Metassímbolo
  → `#metassimbolo`; Construtor de Fórmula → `#formula`; painel das Áreas
  novas → `#novas`; Construtor Livre de Poder → `#poder-livre`; Kit de
  Combate do 1º Ano → `#tecnicas`; Bestiário de Zoologia → `#bestiario`;
  Vida → `#vida`
- **Inventário**: Carga Pronta/Itens → `#inventario`; Projetos →
  `#projetos`

Cada âncora foi conferida contra os `id` reais do Grimório antes de
entrar na ficha — nenhum link quebrado.

Testado com Playwright: personagem com Caminho Pronto de Robótica e
Engenharia aplicado (pra exercitar os painéis específicos dessa Área) e
5º Ano — 22 links do Grimório visíveis nas 5 abas nesse cenário (o total
varia por Área, já que cada painel de Área original e o Metassímbolo só
aparecem quando aquela Área está selecionada), todos com âncora válida e
`target="_blank"`, sem erro de JS. `tsc --noEmit`, `npm run lint` e os
208 testes automáticos continuam limpos (mudança é só HTML estático).

## 59. Thrylikí Chelóna — Grimório mais bonito e fácil de entender (03/09/2026)

Pedido do Zé: melhorar os exemplos do Grimório e deixar a explicação
"mais bonitinha e bem fácil de entender". Três mudanças, todas só
visuais/de conteúdo — nenhuma mecânica do sistema mudou:

**Emoji em cada seção.** Os 22 itens do sumário e os 22 títulos `<h2>`
ganharam um emoji temático (🎲 atributos, ⚔️ teste, 📚 áreas, 🔮 fórmula,
❤️ vida, etc.) — ajuda a "escanear" o sumário visualmente em vez de ler
22 títulos parecidos.

**Caixa `.exemplo` nova.** Componente visual (borda e fundo verdes,
número calculado destacado em `.conta`) diferente da `.dica` (âmbar) e
do `.aviso` (vermelho) que já existiam — sinaliza "isto é uma cena
jogada ilustrando a regra acima", não mais uma regra. Adicionadas 10
caixas com exemplos nomeados (Maya, Kaito, Aurora, Diane) cobrindo: teste
básico e Patamares/Categoria (seção Teste), Esforço/Romper de Corpo e
Cinética e Mana de Simbologia Arcana (seção Áreas originais), fórmula
completa "Lança de Fogo Curta" (Construtor de Fórmula), poder completo
"Investida da Alcateia" — usando de propósito o mesmo texto que já
preenche os placeholders do Construtor de Poder na ficha, pra ligar os
dois (Construtor Livre de Poder), compra de PE até travar num
Treinamento (Progressão), dano e recuperação de Vida (Vida), ciclo
ganho→gasto de Insight em Psicologia e Noética (Áreas novas) e um
Projeto de Categoria Operacional travada pelo Material (Projetos).

**Caixa `.resumo` nova.** Uma frase em linguagem simples antes da parte
mais densa das três seções mais técnicas — Construtor de Fórmula,
Construtor Livre de Poder e economia de PE — pra quem só quer o "TL;DR"
antes de mergulhar na tabela.

Testado com Playwright: as 22 âncoras do sumário resolvem pra uma seção
`id` existente, 10 caixas `.exemplo` e 3 `.resumo` presentes no DOM, os
novos exemplos (Diane em Psicologia, Kaito no Projeto do braço mecânico)
aparecem no texto renderizado, sem erro de JS/console. `tsc --noEmit`,
`npm run lint` e a suíte de testes automáticos continuam limpos (mudança
é só HTML/CSS estático, sem tocar em código TypeScript).

## 60. Thrylikí Chelóna — botão de Subir de Nível com resumo (03/09/2026)

Pedido do Zé: fazer pro Thrylikí Chelóna o mesmo botão de Level Up já
existente no Kaizoku no Sho (decisão anterior, sem número nesta lista
por ter sido feita fora deste bloco de decisões — commit "Adiciona botão
de Level Up na ficha do Kaizoku no Sho"). A ficha já tinha botões que
subiam o Nível em 1 (`btSubirNivelPadrao`/`btSubirNivelDireto`, aba
Progressão), mas sem mostrar o que isso desbloqueava.

Mesmo padrão do Kaizoku, adaptado à diferença de sistema: lá o "Level
Up" sobe o NC (trava em 20); aqui **Nível não tem teto**, então o botão
nunca desabilita — só muda o rótulo pro próximo Nível (`⭐ Subir para
Nível N`).

Ao clicar, `subirDeNivel(p, zerarProgresso)` tira uma fotografia
(`snapshotNivel`) antes e depois de incrementar o Nível — Vida Máxima,
PE ganho, PE disponível, Categoria, Ciclo, Nível no Ciclo, Marcos da
Área recebidos e Ascensões concluídas — e guarda o par em
`estado.nivelUpResumo` (rascunho de tela, não é salvo na ficha). O
painel de resumo (`.resumo-nivel`, CSS novo) mostra só as linhas que
mudaram (`antes → depois`, delta em âmbar) e, quando o Nível cruza uma
posição de Marco (1/5/9/13/17 do ciclo) ou completa 20 Níveis
(Ascensão), avisa onde ir escolher — aponta pros cards "Marcos da Área"
e "Ascensões" que já existem mais acima na mesma aba. O resumo continua
visível ao trocar de aba (só some ao clicar "Fechar" ou ao trocar de
personagem/importar/criar novo/excluir, onde é limpo por segurança pra
não vazar de um personagem pro outro).

Testado com Playwright: personagem novo com Caminho Pronto de Robótica
e Engenharia, ritmo Acelerado — clicar "Subir para Nível 2" mostra o
resumo com Vida Máxima e PE ganho corretos, o resumo sobrevive a trocar
de aba (Status → Progressão) e some ao clicar "Fechar"; o Nível real
mudou de 1 para 2 na aba Status; um segundo clique sobe de 2 para 3 sem
travar (confirma que não há teto, ao contrário do NC do Kaizoku); sem
erro de JS. `tsc --noEmit`, `npm run lint` e os 208 testes automáticos
continuam limpos (mudança é só HTML/JS estático da ficha).

## 61. Grimório de Fabula Ultima e botão de Subir de Nível (03/09/2026)

Pedido do Zé: "faz o grimório do Fabula Ultima e o botão de level up" —
mesmo tratamento que Thrylikí Chelóna (decisão #55) e o mesmo botão que
Kaizoku no Sho e Thrylikí Chelóna já tinham (decisão #60), agora pro
segundo sistema homebrew/comercial da lista de fatias do roadmap.

**Grimório novo** (`public/fabula-ultima-grimorio.html`, 19 seções,
mesmo layout/paleta dos outros Grimórios): Atributos e Perfis de
criação, como fazer um Teste (par de dados, sucesso crítico, Rolagem
Alta), Classes/Multiclasse/Benefícios, Poderes e NP, PV/PM/PI/Crise,
Defesa/Defesa Mágica/Iniciativa, Equipamento, Condições e Afinidades,
Pontos de Fabula, Zenit, Rituais, Projetos, Habilidades Heroicas, Laços,
um panorama curto dos subsistemas por Atlas (Culinária, Veículo,
Engenhocas, Magisferas) e uma seção explicando o botão de Level Up novo.
Diferença importante da decisão #55: Fabula Ultima é um sistema
**comercial** (© Need Games/Rooster Games, edição brasileira © Jambô),
então este Grimório é deliberadamente mais enxuto que o de Thrylikí
Chelóna — só a mecânica universal (fórmulas, escala de dados, o que
cada número faz), nunca o texto de Poderes/feitiços/Habilidades
específicas de cada uma das 25 classes, que já mora só na ficha (que
sempre codificou mecânica sem citar o livro, ver decisão registrada em
"Restrições registradas" abaixo). Um aviso no topo da página deixa isso
explícito, e os personagens de exemplo (Rowan, Yuki, Bram) são
inventados, não vêm do livro. Conectado ao Hub via campo `grimorio` em
`src/lib/sistemas.ts` (mesmo mecanismo da decisão #56) e linkado direto
na barra da ficha.

**Botão de Subir de Nível** (`public/fabula-ultima.html`): como Fabula
Ultima usa multiclasse (várias classes, cada uma com Nível 0-10, e o
Nível total é a soma), o botão não é um único "Level Up" como no
Kaizoku/Thrylikí — é um "⭐ +1 Nível" em cada linha de classe da aba
Atributos e Classes, desabilitado sem classe escolhida ou já no teto 10.
`snapshotNivel`/`subirNivelClasse` tiram uma fotografia antes/depois
(PV/PM/PI máximos, Crise, Nível total, lista de classes dominadas) e o
resumo (`estado.nivelUpResumo`, mesmo padrão transitório das decisões
#56/#60) mostra os deltas e avisa quando a classe acabou de ser
**dominada** (Nível 10 — libera Habilidade Heroica).

Testado com Playwright: (1) Grimório — as 19 âncoras do sumário resolvem
pra uma seção existente, 5 caixas `.exemplo` e 4 `.resumo` no DOM, sem
erro de JS; ficha linka pro Grimório na barra do topo. (2) Botão de
Nível — desabilitado sem classe escolhida, habilita ao escolher Furioso,
mostra o resumo com delta de PV correto, resumo sobrevive a trocar de
aba, some ao "Fechar", sobe até Nível 10 sem passar do teto e avisa
"Classe dominada" ao chegar lá. `tsc --noEmit`, `npm run lint` e os 208
testes automáticos continuam limpos (mudança é só HTML/JS estático).

## 62. Thrylikí Chelóna — Modo Guiado, tooltips e trilha de aprendizado (03/09/2026)

Pedido do Zé: "tem como deixar mais fácil o sistema de Thrylikí Chelóna,
gostei de ser difícil, mas torne mais fácil" — ou seja, não simplificar a
*mecânica* (ele gosta da profundidade), e sim reduzir o atrito de
aprender e usar. Perguntei o que pesava mais e ele escolheu três frentes:
ficha mais guiada, mais ajuda dentro da ficha, e Grimório mais didático.

**Modo Guiado** (`public/thryliki-chelona.html`): tela alternativa de
criação em 3 passos — (1) Nome + Caminho Pronto (ou Origem/Área manuais
num `<details>` escondido por padrão), (2) Atributos e Treinamentos
pré-preenchidos pelo Caminho, revisáveis, (3) resumo (painelDerivados) +
"Concluir — ver ficha completa". Todo personagem **novo** entra direto
nela; um botão na barra do topo (`🧭 Modo Guiado` / `📋 Ver ficha
completa`) alterna a qualquer momento, pra quem já conhece o sistema
pular direto pra ficha inteira. `telaGuiada(p)` reusa os mesmos campos
com os mesmos `id`/`data-*` da ficha normal (`blocoAtributos`/
`blocoTreinamentos`, extraídos de `abaAtributos` pra virar uma única
fonte de verdade) — `ligarEventos()` liga tudo de novo a cada `render()`,
então nenhum binding duplicado foi necessário. `estado.modoGuiado` é só
de tela (não é salvo no personagem) e é zerado ao trocar/excluir/
importar ficha, pra nunca vazar de um personagem pro outro.

**Mais ajuda dentro da ficha**: função `ajuda(texto)` — um "?" com
`title` nativo do navegador, sem JS extra — nos quatro números sempre
visíveis do topo (Vida, Categoria, Deslocamento, PE disponível),
explicando em uma frase o que cada um significa e pra que serve.

**Grimório mais didático**: bloco novo "🧭 Primeira vez aqui? Siga esta
trilha" logo abaixo do cabeçalho do Grimório, antes do Sumário de
referência — 5 Lições em ordem (conceito → como aprender → atributos e
Teste → escolher uma Área → progressão) mais um passo final convidando a
abrir a ficha e clicar no Modo Guiado novo, fechando o ciclo entre os
dois documentos. Reusa o componente visual `.etapas`/`.etapa` que já
existia no Grimório (nenhum CSS novo).

Testado com Playwright: personagem novo entra direto no Passo 1 do Modo
Guiado; aplicar um Caminho Pronto no Passo 1 preenche os Atributos
visíveis no Passo 2; Voltar/Próximo navegam corretamente; Passo 3 mostra
o resumo; Concluir volta pra ficha completa com o nome preenchido
persistido; o botão da barra alterna label e volta a funcionar depois;
tooltip de PE presente. No Grimório: a trilha aparece com pelo menos 6
lições, nenhuma âncora quebrada, e menciona o Modo Guiado. `tsc
--noEmit`, `npm run lint` e os 208 testes automáticos continuam limpos
(mudança é só HTML/CSS/JS estático).

## 63. Fabula Ultima, Sistema SAO e Thrylikí Chelóna marcados como prontos (03/09/2026)

Pedido do Zé: marcar os três como "Pronta" na página de Sistemas do Hub
(`src/lib/sistemas.ts`, campo `situacao`), junto com o Kaizoku no Sho que
já estava. Só a Campanha Livre continua "Em construção". É uma mudança
só de rótulo/selo visual (`ROTULO_SITUACAO`, badge em `/fichas` e na
Home) — não altera nenhuma lógica: nenhum outro código do Hub decide
comportamento a partir de `situacao`, só estilo do badge.

Testado com `tsc --noEmit`, `npm run lint` e os 208 testes automáticos —
sem impacto (mudança é três valores de enum num arquivo de dados).

## 31. Restrições registradas

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
