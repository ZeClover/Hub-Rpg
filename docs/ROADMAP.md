# Roadmap do Hub RPG

Reescrito em 27/08/2026 pela virada de escopo (decisões #35 a #41). O Hub é
sobre **fichas de personagem** nos sistemas do Zé.

Ritmo (decisão #26): uma etapa usável por vez.

---

## Pronto

- [x] Contas: Vercel, banco Supabase em São Paulo, login com Google
- [x] Tabelas trancadas contra acesso vindo de fora do servidor
- [x] Entrar no Hub com a conta Google
- [x] Catálogo de fichas em /fichas
- [x] Cadastro de lore removido do código e do banco (decisão #36)
- [x] **Kaizoku no Sho** — ficha completa, acessível pelo Hub
- [x] **Fabula Ultima** — chassi: atributos, classes, condições e derivados

---

## Etapa atual — Fabula Ultima completa

Fonte: os PDFs da biblioteca do Zé (Livro Básico + todos os Atlas).

**Limite técnico encontrado e contornado (27-28/08/2026):** a ferramenta de
leitura do Google Drive só extrai o começo de um PDF grande — parou na
página 193 de 360 do Livro Básico, e baixar o arquivo puro não dava (limite
de 10 MB, livro com 37 MB). O Zé recortou o PDF nas páginas com as 11
classes restantes e mandou como anexo, o que permitiu ler o livro inteiro
por página com `pdftotext` local (sem limite de tamanho). Esse caminho —
recorte por capítulo, mandado como anexo no chat — se confirmou também para
os três Atlas: High Fantasy, Techno Fantasy e Natural Fantasy vieram cada um
num PDF recortado e foram lidos inteiros.

- [x] Poderes das 15 classes do Livro Básico — **completo.** Todas com os
      cinco poderes conferidos linha a linha no livro, contador de NP e
      benefícios iniciais automáticos. Entropista, Espiritualista e
      Elementalista com catálogo de feitiços; Quimerista com aviso de que os
      dele vêm de observar criaturas em jogo, sem catálogo fixo
- [x] **Atlas High Fantasy** — Comandante, Dançarino, Simbolista e Virtuoso
      completos (poderes, benefícios iniciais, catálogos de Dança e Símbolos)
- [x] **Atlas Techno Fantasy** — Esper, Mutante e Piloto completos (poderes,
      benefícios, catálogos de Dons Psíquicos e Teriomorfose). Veículo
      Pessoal do Piloto descrito no texto do poder, sem painel próprio
      (ver "Fora de escopo por agora" abaixo)
- [x] **Atlas Natural Fantasy** — **completo.** Floralista, Gourmet, Invocador
      e Mercador (poderes, benefícios, catálogo de Magissementes, bloco de
      referência de Mananciais e Invocações). Mercador entrou depois, com um
      segundo recorte de página 158-159
- [x] ~~Herdeiros da Supernova~~ — **não é um Atlas de classes.** É uma
      campanha pronta (10 aventuras, 30 monstros novos, vilã, mascote, fichas
      de local) para o mestre narrar — sem nenhuma classe, poder ou mecânica
      de personagem nova. Livro inteiro lido (16 partes, via anexo + pdftotext)
      e conferido: zero conteúdo de ficha. Fica de fora por ser conteúdo de
      mestre/aventura, igual à decisão #36 de não guardar lore no Hub
- [x] **Feitiços e rituais, com as seis disciplinas** — feitiços já vinham dos
      catálogos de cada classe (Elementalista, Entropista, Espiritualista,
      Simbolista, Dançarino etc.). Faltava só o ritual — que não é uma lista
      fixa, é uma calculadora (potência × área → custo em PM, ND do teste,
      seções do relógio em conflito). Card "Rituais" novo na aba Poderes,
      aparece sozinho por personagem, com uma calculadora por disciplina que
      o personagem já destravou (Arcanismo, Elementalismo, Entropismo,
      Espiritualismo, Quimerismo, Ritualismo — essa última vem de poderes
      pontuais dos Atlas: Miragem, Canto da Sereia, Navegador, Influência
      Verdejante, cada um com sua restrição de escopo)
- [x] **Equipamento: armas, armaduras, escudos, e o efeito nos números** —
      card "Equipamento" novo na aba Atributos e Classes: escolhe armadura,
      mão principal e mão secundária (escudo ou segunda arma de uma mão),
      com as tabelas básicas do livro (9 armaduras, 2 escudos, 20 armas).
      Defesa/Defesa Mágica/Iniciativa passam a vir do equipamento de verdade
      em vez de números digitados à mão; item marcial (🔒) fica bloqueado
      até o personagem ter uma classe que libere aquele tipo (usa o mesmo
      `marcial` das classes que já gerava o texto "Pode equipar..."); arma de
      duas mãos anula o que estiver na secundária. "Outros bônus" continua
      existindo, mas só para o que a ficha ainda não modela (acessórios,
      poderes que somam Defesa/Iniciativa direto). **Acessórios não
      entraram** — o livro só dá um exemplo (Elmo de Crista) e remete a uma
      lista nas págs. 285-287 que não foi lida ainda
- [x] **Combate: dano, tipos de dano, afinidades elementais** — os nove
      tipos de dano do livro (Físico, Ar, Fogo, Gelo, Luz, Raio, Terra,
      Trevas, Veneno) e os quatro graus de Afinidade (Vulnerável, Resistente,
      Imune, Absorve) viraram um card "Afinidades" na aba Recursos, com um
      seletor por tipo. Junto veio um "Sofrer dano": digita a quantidade
      bruta e o tipo, e o cálculo já aplica a Afinidade certa antes de
      descontar de PV (Vulnerável dobra, Resistente divide e arredonda pra
      baixo, Imune zera, Absorve vira cura) — sem passar de PV máximo nem
      de zero
- [x] **Poderes Heroicos** — última peça da fatia, página 232-243 do Livro
      Básico (recorte novo, mandado depois de eu confirmar o intervalo pelo
      sumário). Ao levar uma classe ao nível 10 ("dominar"), o personagem
      ganha o direito de escolher uma Habilidade Heroica — por isso o total
      de escolhas é o número de classes dominadas, não um valor fixo. Aba
      "Heroico" nova, com as 31 habilidades do livro (5 abertas a todo
      mundo, 26 que pedem uma classe específica dominada — três delas
      também pedem um poder daquela classe já comprado: Companheiro
      Heroico/Companheiro Fiel, Mira Perfeita/Tiro de Aviso, Pilhagem/Roubo
      de Alma). PV Extra, PM Extra e PI Extra já somam sozinhos nos totais
      da ficha, com o mesmo automatismo dos benefícios de classe; o resto
      fica como texto de referência fiel ao livro

Todas as classes de Fabula Ultima estão prontas: as 15 do Livro Básico e as
10 dos três Atlas (High Fantasy, Techno Fantasy, Natural Fantasy) — 25 no
total. Não existe uma 26ª classe faltando: Herdeiros da Supernova não traz
nenhuma. Com os Poderes Heroicos, a fatia "Fabula Ultima completa" está
fechada — falta só ligar a ficha à conta do Hub (ver "Depois" abaixo).

- [x] **Aba Inventário, Projetos, Acessórios e Engenhocas completos** — depois
      do Zé mandar o livro básico inteiro (19 partes em PDF) e apontar que eu
      tinha pulado itens que estavam lá, uma varredura completa fechou tudo
      que ainda faltava:
  - **Projetos** (pág. 133-137): calculadora do Inventor — Potência × Área ×
    Uso (consumível ou permanente) dá o custo em zênites e o progresso
    necessário, com desconto de 25% se negociar um defeito. Só aparece com
    nível no Inventor (não precisa de poder específico)
  - **Acessórios** (pág. 126 e 283-287): catálogo com as 29 amostras
    nomeadas e as 17 qualidades genéricas do livro, mais campo pra digitar
    um acessório fora da lista. Os que dão bônus fixo em Defesa, Defesa
    Mágica, Iniciativa ou PV/PM máximos somam sozinhos nos números do topo
    enquanto estiverem marcados como equipados; o resto fica como texto de
    referência (mesma regra já usada nos Poderes Heroicos: só automatiza o
    que é um número sempre visível na ficha)
  - **Engenhocas do Inventor** (pág. 210-215), a peça que antes só tinha
    texto de referência: cada compra do poder Engenhocas libera um nível pra
    investir em Alquimia, Infusões ou Tecnomagia. Alquimia ganhou o primeiro
    minigame de dados da ficha (rola 2 a 4d20 conforme o nível da mistura e
    deixa escolher um resultado pra alvo e um pra efeito, com as opções
    "sempre disponíveis" do livro incluídas); Infusões é catálogo por nível;
    Tecnomagia soma Sobrecarga Tecnomágica, Magicanhão e Magisferas — estas
    últimas reaproveitam os catálogos de feitiço que já existiam na ficha
    (Elementalista/Entropista/Espiritualista) em vez de duplicar dados
  - **Luta com duas armas** (pág. 69): nota que aparece sozinha embaixo do
    equipamento quando as duas mãos têm arma da mesma Categoria (ou
    categorias diferentes, se a heroica Ambidestro estiver marcada)
  - **Culinária do Gourmet** (Atlas Natural Fantasy, pág. 149-152): cinco
    sabores de ingrediente (Amargo, Salgado, Azedo, Doce, Umami) com
    estoque próprio; as 15 combinações possíveis de sabor viram uma "ficha
    de receitas" — rola 1d12 a primeira vez que combinar dois sabores e o
    efeito fica travado pra sempre depois disso, exatamente como no livro.
    Preparar uma iguaria gasta 2-3 ingredientes do estoque e aplica o
    efeito de cada combinação formada, rolando na hora qualquer combinação
    ainda não descoberta
  - **Veículo Pessoal do Piloto** (Atlas Techno Fantasy, pág. 158-169): o
    último item que faltava, fechado depois do Zé mandar as páginas que
    tinham ficado de fora (167-169, a tabela de Módulos de Suporte). Escolhe
    uma Estrutura fixa (Exoesqueleto/Mecha/Montaria), adiciona módulos de
    Armadura/Arma/Suporte até o limite que o poder Veículo Pessoal permite,
    e ativa até o limite de módulos simultâneos da estrutura — com Precisão
    e Dano calculados pros módulos de arma (reaproveitando as mesmas
    fórmulas do equipamento normal) e a regra de "exclusivo" (alguns módulos
    de arma travam qualquer outro) aplicada automaticamente. Os números só
    valem enquanto pilota, por isso ficam de referência, sem entrar na
    Defesa/Precisão normais da ficha (que valem o tempo todo)

Com isso, as 25 classes de Fabula Ultima (Livro Básico + três Atlas) estão
com todos os poderes automatizados ou documentados fielmente — não sobrou
nenhum "mecânica não modelada" pendente.

---

## Depois

### Fichas ligadas ao Hub
Tirar os personagens do navegador e colocar na conta: acessíveis de qualquer
aparelho, e compartilhados com a mesa. Vale para todas as fichas de uma vez.

- [x] **Salvar e carregar personagem pela conta** — `/api/personagens` (listar,
      criar) e `/api/personagens/[id]` (ler, salvar, apagar), sempre filtrando
      por dono (decisão #13, função `podeAcessarPersonagem` testada). `/fichas`
      virou a lista de verdade (decisão #42) com o botão "+ Criar ficha"
      (decisão #43: escolhe o sistema, cria a linha, abre a ficha em branco).
      A ficha entende `?id=` na URL: com ele, troca o seletor/+Novo/Excluir
      por um "← Fichas" (decisão #45) e cada campo salva sozinho na conta,
      sem botão (decisão #44). Sem o parâmetro, continua 100% igual —
      localStorage, sem conta, arquivo único de sempre
- [x] **Importar os personagens que já estão no navegador** — não precisou de
      ferramenta própria: como a ficha em modo Hub reaproveita o mesmo
      Exportar/Importar de sempre, migrar é abrir a ficha local, Exportar,
      criar uma ficha nova em `/fichas`, e Importar o arquivo nela
- [x] **Excluir ficha** — botão em `/fichas`, chama o `DELETE` que já
      existia na API desde o começo desta fatia
- [x] **Mestre vê a ficha de um jogador — por link, sem campanha** (decisão
      #46): interruptor "Compartilhar (link de leitura)" na própria ficha,
      só visível pro dono. Ligado, qualquer um com a URL (`?id=`, um UUID —
      o próprio segredo do link) abre em **modo leitura**: todo campo e
      botão desabilitado (menos as abas, pra dar pra navegar e ver tudo),
      um aviso "Modo leitura — você está vendo a ficha de X" no topo, sem
      precisar login nenhum. Editar continua exigindo ser o dono logado,
      sempre — o link nunca dá escrita. Migração `0004_compartilhar_personagem.sql`
      (uma coluna booleana só)
- [x] **Campanhas básicas: juntar mestre e jogadores numa mesa** (28/08/2026)
      — usa `Campanha` e `Participacao`, que já existiam no schema desde o
      início mas nunca tinham sido usados. Fluxo:
  - Mestre cria a campanha em `/campanhas` (escolhe sistema + nome) e já
    nasce mestre dela via `Participacao{papel: MESTRE}` — não existe um
    campo "dono" separado na campanha, de propósito, porque o schema já
    previa mais de um mestre
  - O convite é o próprio endereço da campanha (`/campanhas/[id]`, um UUID
    — mesma lógica do link de leitura da decisão #46: o segredo é o link
    em si). Quem abre precisa estar logado no Hub, mas não precisa já ser
    participante: a tela mostra "você foi convidado" e deixa escolher uma
    ficha seguinte
  - O jogador só vê fichas **dele mesmo** e **do sistema da campanha** —
    filtro por `sistemaId` na consulta, não por confiar no que a tela
    manda. Escolher uma ficha cria a `Participacao{papel: JOGADOR}` e liga
    `personagem.campanhaId`; escolher outra depois troca, nunca acumula
  - **Permissão nova em `podeAcessarPersonagem`** (decisão #13): além do
    dono, o mestre de uma campanha pode **ler** (nunca editar) a ficha de
    um personagem ligado a ela. A função continua pura e testada — quem
    chama é que busca a lista de campanhas onde a pessoa é mestre, e só
    quando precisa (dono lendo a própria ficha não paga essa consulta).
    4 testes novos em `dono-personagem.test.ts`
  - Mestre vê, na página da campanha: o link de convite, a lista de
    jogadores com a ficha que cada um ligou (ou "ainda não escolheu"), e
    pode criar **fichas de inimigo/NPC** direto ali (mesmo `Personagem`,
    só que dono = o próprio mestre) — os jogadores não veem essa lista.
    Isso cobre a parte de "organizar inimigos" sem precisar de nenhum
    catálogo de monstros
  - **Catálogo de monstros dos livros**: fora de escopo por agora — o
    Bestiário de Fabula Ultima é um livro à parte, com ficha de criatura
    bem diferente da de personagem. Enquanto não existir, o mestre digita
    o inimigo à mão, na mesma ficha de sempre

- [x] **Kaizoku no Sho ganhou o Modo Hub** (28/08/2026) — o Zé estava com
      uma campanha de Kaizoku pra narrar, e a ficha dele tinha ficado de
      fora da fatia de Campanhas por não entender `?id=` nem salvar na
      conta. Mesmo mecanismo que o Fabula Ultima já usa, portado pros nomes
      e formato de estado próprios do Kaizoku (`state`/`renderAll`/
      `persistir`/`onFieldChange`, em vez de `estado`/`render`/`salvar`/
      `mudar`): detecta `?id=`, busca/salva via `/api/personagens/[id]`,
      modo leitura pra quem não é dono (usado tanto pelo link de leitura
      quanto pelo mestre de campanha), interruptor de Compartilhar, "←
      Fichas" no lugar do seletor/Novo/Duplicar/Apagar. Campo `salvaNoHub`
      de `src/lib/sistemas.ts` virou `true` pra ele — reaparece em "+ Criar
      ficha" e na criação de campanha. Testado com Playwright mockando
      `/api/personagens/*` (ficha nova, ficha existente, 404, link de
      leitura, modo local intacto) e um passeio por todas as abas em modo
      local pra garantir que nada quebrou

**Confirmado em produção (28/08/2026):** o Zé testou ao vivo em
`hub-rpg-eight.vercel.app` — criou a ficha "Zé" pelo Fabula Ultima, editou,
recarregou, viu ela listada em `/fichas` com o nome certo, rodou a migração
0004 e testou o link de leitura ponta a ponta: marcou "Compartilhar", abriu
o mesmo link num navegador sem login (Brave) e viu a ficha em modo leitura;
desmarcado, o mesmo link volta a dar "Ficha não encontrada".

Testado com Playwright mockando as respostas de `/api/personagens/*` (não dá
pra testar contra o banco de verdade neste ambiente, sem as credenciais do
Supabase): ficha nova carrega com o perfil padrão, ficha existente carrega os
dados salvos, editar um campo dispara o PATCH certo depois do debounce, ficha
alheia/apagada (404) mostra mensagem e link de volta, o modo local sem `?id=`
continua idêntico ao de antes, o dono vê e liga o interruptor de
compartilhar, e quem abre um link compartilhado vê tudo travado com o aviso
de modo leitura e nenhuma chamada de escrita disparada. Um bug de CSS achado
no caminho: a regra própria `label{display:block}` do arquivo vencia o
`[hidden]` do navegador por ser do autor da página — corrigido escondendo
por `style.display` direto, que sempre tem prioridade. `npm run build`, lint
e os 12 testes automatizados (dois novos, de `podeAcessarPersonagem`)
passando.

### Campanhas — próximas peças

- [x] **Ficha de Inimigo/Vilão + catálogo de 108** (28/08/2026) — nova
      página `fabula-ultima-inimigo.html`, bem diferente da ficha de
      jogador: sem classes nem poderes de catálogo, é sobretudo texto
      livre, igual o Bestiário do livro. Cabeçalho (nome/nível/espécie/
      papel soldado-elite-campeão), 4 atributos em dado, PV/PM/Iniciativa/
      Defesa/Defesa Mágica editáveis com um botão "Recalcular pela fórmula
      do livro" (pág. 303: PV = 2×nível + 5×dado de Vigor, etc., já
      considerando o dobro/multiplicador de elite e campeão), as mesmas
      Afinidades e Condições da ficha de jogador, e quatro listas de texto
      livre (Ataques Básicos, Feitiços, Outras Ações, Regras Especiais)
      com um editor genérico só (mesmo código pras quatro).
      O catálogo tem **108 inimigos** — o Bestiário inteiro do Livro
      Básico (59, incluindo os dois exemplos de chefe do capítulo de
      Design de Batalhas) mais os vilões e aliados dos três Atlas (16 High
      Fantasy + 17 Techno Fantasy + 16 Natural Fantasy) — extraídos dos 4
      PDFs que o Zé mandou por 4 agentes em paralelo, cada um seguindo a
      mesma regra: só mecânica (números, fórmulas, efeitos de regra,
      nomes) nunca prosa (história, táticas, falas, traços de
      personalidade) — igual toda a ficha já respeita. Escolher um
      inimigo do catálogo preenche a ficha inteira; dá pra editar tudo
      depois. Só existe em Modo Hub, sempre nascida de "+ Adicionar ficha
      de inimigo" numa campanha — sistema ganhou um `fichaInimigo`
      separado do `ficha` de jogador em `src/lib/sistemas.ts`.
      Testado com Playwright: os cenários de sempre (ficha nova, 404,
      modo leitura) mais uma varredura carregando as 108 fichas do
      catálogo uma a uma, conferindo zero erro de JavaScript e nenhum
      campo virando `undefined`/`NaN`
- [x] **Manual do Mestre dentro da campanha** (28/08/2026) — seção nova na
      página da campanha, visível só pro mestre: um bloco de texto livre
      que salva sozinho (debounce, sem botão), pra anotar plano de sessão,
      NPCs, segredos do enredo. Migração `0005_manual_mestre.sql` (uma
      coluna de texto na campanha). A leitura respeita a decisão #13 de
      um jeito direto: a consulta que busca esse campo só roda quando
      quem pede já é confirmadamente mestre — pra jogador, a coluna nem
      chega a ser buscada, não é só escondida na tela. "Usar prontas" (o
      Guia do Mestre em PDF) continua pendente — fica pra quando o Zé
      mandar esse material
- [x] **Página de Escudo do Mestre** (28/08/2026) — referência estática
      (`fabula-ultima-escudo-mestre.html`, sem JS, só consulta) com o que
      mais se usa numa mesa: como fazer um teste, sucesso/falha crítica,
      Níveis de Dificuldade, Teste Aberto, Teste Oposto, Teste em Grupo,
      as 11 Oportunidades, as 10 ações de conflito, Condições e Afinidades
      de dano. Linkada a partir da campanha (sistema ganhou um
      `escudoMestre` em `src/lib/sistemas.ts`, só preenchido pro Fabula
      Ultima por enquanto)

- [x] **Excluir campanha, remover jogador e sair** (28/08/2026) — três
      ações novas na página da campanha:
  - "Excluir campanha", só pro mestre: apaga a `Campanha`, mas as fichas
    ligadas (de jogador ou de inimigo) só soltam — `campanhaId` volta a
    `null`, ficam avulsas de novo, nunca são apagadas junto
  - "Remover" ao lado de cada jogador, só pro mestre, e "Sair da
    campanha" pro próprio jogador — mesma rota
    (`DELETE /api/campanhas/[id]/jogadores/[usuarioId]`) pros dois casos,
    a permissão dentro dela é "sou eu mesmo, ou sou o mestre". O mestre
    nunca pode ser removido por aqui
  - **Bug de banco corrigido antes de ligar isso** (decisão #61): a
    migração 0001 tinha criado o vínculo ficha→campanha como
    `ON DELETE CASCADE` por engano — excluir uma campanha ia apagar as
    fichas de verdade, em vez de só soltar. Corrigido pela migração
    `0006_corrigir_delecao_personagem_campanha.sql`
  - `npm run build`, lint e os 16 testes automatizados passando

### Outros sistemas
- [x] **Sistema SAO — chassi** (28/08/2026) — homebrew original (decisão
      #64), inspirado em Sword Art Online, Overgeared e Shangri-La
      Frontier: o personagem enxerga a própria ficha como uma Janela de
      Status de jogo (PV, PM, nível, nome de golpe), não uma abstração
      escondida da mesa. `public/sao.html`, arquivo único com localStorage
      (decisão #40, Modo Hub fica pra depois). O que o chassi cobre:
  - 4 atributos em dado (d6-d12), mesmo estilo de teste do Fabula Ultima
    (dois dados somados vs Dificuldade, duplo 6+ crítico, duplo 1 falha)
  - Multiclasse sem limite (estilo Overgeared): 3 categorias (Combate,
    Produção, Outras), catálogo-semente de 7 classes, nível por classe
    somado vira o Nível geral
  - PV/PM/Defesa/Iniciativa calculados por fórmula própria (números de
    partida, editáveis à mão — mesma filosofia da decisão #57)
  - Golpes assistidos pelo sistema (Sword Skills) convivendo com ataque
    livre: golpe registrado dá a condição "Vulnerável (pós-motion)"
    depois de usado; golpe "Original" marca quando o jogador aprendeu a
    fazer sem ajuda do sistema
  - Skills que sobem de ESTÁGIO com o uso em jogo (iniciante → mestre,
    10 níveis internos cada), não por escolha em lista — estilo Overgeared
  - Morte não é permanente (estilo Overgeared): card de Penalidade de
    Morte com perda de XP (botão calcula 10% do XP atual) e chance de
    item cair no chão, em vez de matar o personagem de vez
  - Cursor colorido (verde/laranja/vermelho) como flag de PK visível pra
    todo mundo, igual o SAO original
  - Habilidade Única: campo raro, começa vazio, só o mestre libera
  - Ainda falta pra fatia ficar completa: catálogo real de classes com
    poderes próprios (hoje é só a categoria), catálogo de golpes/magias
    de referência, inventário/equipamento, e o Modo Hub
- [x] **Sistema SAO — ficha jogável** (28/08/2026) — decisões #71-#74,
      completando o que o chassi tinha deixado como esqueleto:
  - **Catálogo de 12 classes** com **5 poderes próprios cada** (60 no
    total), comprados com os níveis investidos naquela classe — igual o
    Fabula Ultima, mas sem teto de "3 classes": os pontos de poder de uma
    classe são o nível dela, e cada poder tem um "-"/"+ Comprar" próprio,
    travado quando os pontos acabam. Aba "Poderes" nova. Classes:
    Espadachim, Arcanista, Batedor, Lanceiro e Arqueiro (Combate);
    Ferreiro, Alquimista, Encantador e Cozinheiro (Produção); Mercador,
    Domador e Curandeiro (Outras)
  - **Catálogo de Golpes (Sword Skills)** — 13 golpes prontos, por tipo de
    arma (espada de uma/duas mãos, lança, arco, adaga, cajado), com um
    seletor "+ Do catálogo" que preenche nome/dano/pós-motion sozinho; o
    "+ Golpe em branco" de sempre continua existindo pra golpe homebrew
  - **Catálogo de Magias (Grimório)** — 12 feitiços, 2 por escola (Fogo,
    Gelo, Raio, Luz, Trevas, Suporte), mesmo esquema de catálogo+em branco
  - **Switch** — card novo na aba Combate: parceiro, papel atual
    (Ataque/Suporte) e se o combo está ativo. Registro pra lembrar da
    mecânica na mesa; o bônus de verdade combina com o mestre
  - **Equipamento e inventário** — aba nova: item com tipo, uma das
    **6 raridades estilo Overgeared** (Comum a Único, com sugestão de
    bônus por degrau), peso, e **durabilidade por usos** ("Usar" gasta 1,
    "Reparar" volta ao máximo — combina com o poder Reparo de Campo do
    Ferreiro). Item equipado e não quebrado soma sozinho no derivado que
    o campo "Efeito" apontar (Defesa, Defesa Mágica, Iniciativa, PV ou PM
    máximos) — mesma lógica dos acessórios automáticos do Fabula Ultima
  - **Capacidade de carga** — novo derivado ligado à Força (10 + Força×2),
    soma o peso de tudo na mochila, equipado ou não
  - XP e nível **continuam manuais** (decisão da conversa: o mestre decide
    o ritmo, sem tabela fixa por enquanto)
  - Testado de ponta a ponta com Playwright num navegador real: comprar e
    devolver poder respeitando o teto de pontos, golpe e magia vindo do
    catálogo, item equipado somando e um item quebrado deixando de somar
    no derivado, reparo devolvendo o bônus, peso somando certo, e tudo
    isso sobrevivendo a um recarregamento de página. Zero erro de
    JavaScript
- [x] **Sistema SAO — crafting e economia** (28/08/2026) — decisões
      #75-#78, a "Parte B": Ferreiro, Alquimista, Encantador e Cozinheiro
      passam a fabricar de verdade, e o Mercador ganha uma loja:
  - **Moeda Ouro/Prata** (100 Prata = 1 Ouro, mesma proporção do
    Overgeared/Satisfy — pedido explícito do Zé) — card "Carteira" na aba
    Loja nova, sempre normalizada (editar Prata acima de 100 já vira Ouro
    sozinho)
  - **Materiais nomeados com estoque** — aba Crafting nova, lista tipo
    "3× Minério de Ferro" que as receitas consultam
  - **8 receitas de catálogo**, 2 por classe de Produção (Ferreiro,
    Alquimista, Encantador, Cozinheiro), cada uma pedindo materiais
    específicos e só liberada pra quem tem ao menos 1 nível na classe dona
  - **"Suas Receitas"** — pedido do Zé no meio da sessão: um editor
    completo pra criar receita própria (nome, classe, lista de materiais,
    e o item que sai fabricado) e fica salva na ficha, com o mesmo botão
    "Fabricar" das receitas prontas
  - **Loja**: 5 itens genéricos de aventureiro comprados com Prata, e
    "Vender" em qualquer item do inventário (preço automático pela
    raridade — Único fica de fora, esse negocia com o mestre). O poder
    Faro pra Barganha do Mercador desconta 10% sozinho no preço de compra
  - **Dois bugs de verdade corrigidos no caminho, achados pelos próprios
    testes**: o botão "Fabricar" não reagia à digitação da quantidade de
    material até trocar de aba (mesma causa do bug de peso corrigido na
    fatia anterior — resolvido do mesmo jeito, com redesenho imediato); e
    `gastarPrata` zerava o Ouro antes de reler o total da carteira,
    corrompendo a conta ao comprar algo
  - Testado de ponta a ponta com Playwright: receita travada sem
    material, destravando ao completar o estoque sem precisar trocar de
    aba, material sendo descontado, item saindo certo no inventário,
    receita própria funcionando igual à de catálogo, compra e venda
    acertando a carteira, normalização de Prata em Ouro, tudo
    sobrevivendo a um recarregamento de página. Zero erro de JavaScript
- [x] **Sistema SAO — mundo e mesa** (28/08/2026) — decisões #79-#82, a
      "Parte C": o que o mestre precisa pra rodar uma sessão de verdade.
  - **Ficha de Inimigo/Monstro própria** — `public/sao-inimigo.html`,
    arquivo local igual a do jogador (sem Modo Hub ainda). Não reaproveita
    a ficha de jogador (mesma decisão do Fabula Ultima): sem classe nem
    poder de catálogo, é atributo em dado + derivados + texto livre
    (Ataques, Feitiços, Outras Ações, Regras Especiais)
  - **Categoria com multiplicador de PV/PM** — Comum (×1), Elite (×2),
    Chefe de Andar (×3). Defesa/Defesa Mágica/Iniciativa não escalam por
    categoria (isso é destreza, não resistência) — só o "tanque" de dano
    cresce. Botão "Recalcular pela fórmula" preenche os derivados, mas
    continuam editáveis à mão (vilão fora do padrão é o normal)
  - **Chefe de Andar, com mecânica robusta**: Fases (gatilho + o que
    muda — geralmente um limiar de PV), Ataques de Área separados dos
    ataques comuns pra achar rápido na mesa, e um **Relógio de Batalha**
    (clock de segmentos clicáveis pro objetivo do grupo na cena, tipo
    "destruir os cristais" — clicar um segmento enche até ali, clicar de
    novo no mesmo esvazia, igual um clock de PbtA/FitD)
  - **Andar e Zona** na ficha de jogador — card na aba Mundo, nova: andar
    atual + Segura (cidade/base) ou Masmorra (zona de risco)
  - **Guilda estruturada** — cartão de sócio (rank, papel, benefício),
    separado do nome de guilda que já existia no Status. Ainda não é um
    registro compartilhado entre fichas (isso pede Modo Hub)
  - **Reputação e Títulos** — lista de títulos com "como o resto do jogo
    vê" (Admirado/Neutro/Malvisto): o ponto do "Beater" do SAO original é
    que nem toda fama é bem-vinda
  - **Duelo** — desafio formal entre jogadores, registrado à parte do
    Cursor (só ataque não combinado conta como PK)
  - **Escudo do Mestre** — `public/sao-escudo-mestre.html`, referência
    estática (sem JS) cobrindo teste, golpe/pós-motion, Penalidade de
    Morte, Cursor/PvP/Duelo, classes/poderes/skills, crafting/economia,
    Chefe de Andar e condições — tudo numa página só, pra ter aberta
    durante a sessão
  - `src/lib/sistemas.ts` atualizado com os dois arquivos novos
    (`fichaInimigo`, `escudoMestre`) — inertes por enquanto, porque
    campanha só existe pra sistema com Modo Hub (decisão #52), mas já
    prontos pro dia que o SAO ganhar o dele
  - Testado de ponta a ponta com Playwright nas três páginas: aba Mundo
    persistindo, multiplicador de categoria calculando certo, Recalcular
    e edição manual dos derivados, condição marcando, listas de ação
    salvando, fase e ataque de área registrando, Relógio mudando de
    tamanho e preenchendo/esvaziando por clique, tudo sobrevivendo a um
    recarregamento de página, e o Escudo do Mestre carregando sem erro.
    Zero erro de JavaScript
- [x] **Sistema SAO — corpo real, permadeath e falha de chefe** (28/08/2026)
      — docs/DECISOES.md seção 18, a "Parte D": a camada que mais separa
      este sistema de um RPG comum. Sem pergunta nova em aberto desta vez
      — o desenho já tinha saído definido quando o Zé aprovou a lista de
      fatias.
  - **Corpo Real** — card na aba Mundo: onde o corpo está, quem cuidaria
    dele, e um interruptor "em risco agora" pro mestre criar tensão fora
    do jogo sem arriscar o personagem dentro dele
  - **Permadeath opcional por mesa** — interruptor no card de Penalidade
    de Morte que troca o card inteiro quando ligado: aviso forte, "este
    personagem morreu" e como aconteceu, no lugar de XP/item de
    penalidade. Por personagem (campanha ainda não existe pro SAO)
  - **Falha do Chefe** — na ficha de inimigo: uma fraqueza específica
    (como descobrir, como explorar, se já foi descoberta), pensada pra
    combinar com o poder Detectar Falha do Batedor da Parte A — o golpe
    do Shangri-La Frontier de recompensar quem estuda o encontro
  - Escudo do Mestre atualizado com as três peças
  - Testado de ponta a ponta com Playwright: Corpo Real e Falha
    persistindo, card de Penalidade trocando de conteúdo certo ao
    ligar/desligar permadeath, morte permanente registrando a causa.
    Zero erro de JavaScript
- [x] **Sistema SAO — Modo Hub** (28/08/2026) — a última fatia: salvar na
      conta, aparecer em `/fichas`, e campanha de verdade. Fecha o
      Sistema SAO como sistema completo do Hub, no mesmo pé que o Fabula
      Ultima e o Kaizoku no Sho.
  - **`public/sao.html` e `public/sao-inimigo.html`** ganharam o mesmo
    mecanismo de Modo Hub dos outros dois sistemas: com `?id=` na URL a
    ficha vive na conta (busca/salva via `/api/personagens/[id]`, modo
    leitura pra quem não é dono, interruptor de Compartilhar só na de
    jogador — inimigo não tem link de leitura, só o mestre mexe). Sem o
    parâmetro, os dois continuam 100% iguais — localStorage, sem conta,
    exatamente como as fatias anteriores deixaram
  - **`src/lib/sistemas.ts`**: `salvaNoHub` virou `true` pro SAO — já
    aparece em "+ Criar ficha" (`/fichas`) e na criação de campanha,
    igual os outros dois sistemas
  - **Bug de nome corrigido no caminho**: a rota `/api/personagens/[id]`
    só lia `dados.perfil.nome` pra atualizar o nome mostrado na lista —
    mas ficha de inimigo/NPC (Fabula Ultima e agora SAO) guarda o nome
    solto em `dados.nome`, sem `perfil`. Sem o ajuste, todo inimigo
    ficaria pra sempre listado como "Novo Inimigo" na campanha, não
    importa o que o mestre escrevesse na ficha. Um `??` a mais na rota
    resolve pros dois sistemas, sem mudar nada pra quem já funcionava
    (Fabula Ultima e Kaizoku no Sho sempre tiveram `perfil.nome`)
  - Testado com Playwright mockando `/api/personagens/*` (não dá pra
    testar contra o banco de verdade neste ambiente, sem as credenciais
    do Supabase): ficha de jogador e de inimigo carregando do Hub,
    editar campo disparando o PATCH certo depois do debounce duplo
    (mudarSemRedesenhar + salvarNoHub), interruptor de Compartilhar,
    ficha alheia/apagada (404), modo leitura travando todo campo da
    ficha enquanto Exportar continua disponível (mesmo padrão do Fabula
    Ultima), e o modo local sem `?id=` continuando idêntico ao de antes
- [x] **Thrylikí Chelóna — chassi** (29/08/2026) — decisão #20. O Zé mandou o
      material do sistema já pronto (design fechado, só faltando playtest de
      mesa); esta fatia traz o chassi jogável, não o sistema inteiro.
  - **`public/thryliki-chelona.html`** — atributos por Grau (0-5) com
    Treinamento em perícia por cima, teste `1d20 + Grau + Treinamento +
    situação`, Vida/Deslocamento/Carga Pronta derivados, Ano e Nível como
    progressões independentes, seleção de Origem (26) e Área de Estudo (16,
    só como categoria — sem Ramos/poderes ainda), condições, três trilhas de
    Consequência, e registro do Pacto com a Realidade. Nasceu com Modo Hub
    desde o primeiro commit, copiando o padrão já maduro do Fabula Ultima e
    do SAO em vez de ganhar isso numa fatia posterior
  - **`src/lib/sistemas.ts`**: `situacao` virou `"em-construcao"` e
    `salvaNoHub` virou `true` — já aparece em "+ Criar ficha" e na criação
    de campanha
  - **`prisma/migrations/0008_sistema_thryliki_chelona.sql`** — garante a
    linha do sistema na tabela `sistemas`, espelhando a `0007_sistema_sao.sql`
  - Testado com Playwright: criação em modo local, fórmulas derivadas
    batendo com os valores esperados, Origem/Área mostrando os detalhes
    certos, condições e trilhas de Consequência clicáveis, persistência
    após recarregar, e Modo Hub completo mockando `/api/personagens/*`.
    Ramos, poderes de Área e combate detalhado ficam para as próximas
    fatias
- [x] **Thrylikí Chelóna — catálogo de Ramos** (29/08/2026) — decisão #21.
      Cada uma das 16 Áreas tem recurso e mini-sistema de combate próprios
      (Esforço, Mana, Pontos de Comando...) — trazer isso tudo de uma vez
      seria fatia grande demais, então esta trouxe só o catálogo dos 117
      Ramos como referência; o recurso e o combate de cada Área ficam pra
      fatias seguintes, Área por Área.
  - **`public/thryliki-chelona.html`**: novo card "Ramo" na aba Status,
    abaixo de Área de Estudo — aparece só quando o personagem já tem Área
    escolhida; abaixo do 2º Ano mostra um aviso em vez do seletor (Ramo é
    conteúdo curricular, não existe antes disso). Uma vez escolhido, mostra
    Assinatura/Especialização/Maestria/Tese e o Contrajogo, mas só as
    etapas que o Ano do personagem já teria cursado
  - Os 117 Ramos (37 das seis Áreas originais + 80 das dez novas) foram
    extraídos por script dos documentos de design de cada Área — a fonte
    usa três formatos de marcação ligeiramente diferentes entre si; o
    parser foi ajustado e o resultado conferido campo a campo até bater
    117/117 sem nenhum texto faltando. IDs de Ramo viraram
    `<área>__<ramo>` porque três nomes se repetem em Áreas diferentes
    (ex: "Toxicologia" existe em Botânica e em Alquimia) — sem o prefixo,
    trocar de Área podia deixar o Ramo errado marcado como selecionado
  - Testado com Playwright: catálogo ausente sem Área escolhida, aviso de
    "a partir do 2º Ano" no 1º Ano, seletor com as opções certas a partir
    do 2º, etapas aparecendo progressivamente conforme o Ano sobe até
    mostrar todas as quatro no 5º, e a troca de Área não carregando um
    Ramo de nome igual mas de Área diferente
- [x] **Thrylikí Chelóna — combate de Corpo e Cinética** (29/08/2026) —
      decisão #22. Primeira Área com recurso e combate de verdade
      (Esforço, Rastro, Romper), servindo de molde pras outras 15.
  - Card novo na aba Combate, só quando a Área escolhida é Corpo e
    Cinética: Esforço (0–5, sobe por ação sob risco ou Forçar o Corpo —
    que também aplica Exposto, reaproveitando a condição já existente),
    Rastro (até duas marcas: Impulso/Guarda/Golpe/Controle/Alteração), e
    Romper (gasta 1/2/3 de Esforço por Manobra/Técnica forte/Ápice,
    desabilitado quando falta Esforço)
  - Ficha salva antes desta fatia recebe o valor padrão do novo campo
    automaticamente na primeira leitura, sem quebrar
  - Testado com Playwright: painel gated por Área e por aba, Esforço
    subindo pelos três gatilhos, Rastro travando em duas marcas, Romper
    gastando o Esforço certo e limpando o Rastro, botão caro demais
    desabilitado, reset de conflito, e persistência após recarregar
- [x] **Thrylikí Chelóna — combate de Simbologia Arcana** (29/08/2026) —
      decisão #23. Segunda Área com recurso de verdade: pool de Mana.
  - Card novo na aba Combate, só quando a Área é Simbologia Arcana:
    Mana Máxima calculada (Inteligência, Treinamento em Simbologia e
    Reservatório comprado 0–4), gastar/corrigir, Concentrar (+2, uma
    vez por cena) e Descanso completo. A calculadora de Fórmula
    (Verbo + Essência + Moldura + Cláusulas com custo por peça) é fatia
    própria futura — grande demais pra entrar junto, do tamanho da
    calculadora de Rituais do Fabula Ultima
  - Testado com Playwright: painel gated por Área e aba, fórmula da
    Mana Máxima batendo ao mudar Inteligência/Reservatório, gasto e
    correção, Concentrar travando até nova cena, Descanso completo, a
    Mana atual sendo cortada pro novo máximo se o Reservatório cai, e
    persistência após recarregar
- [x] **Thrylikí Chelóna — combate de Robótica e Engenharia** (29/08/2026) —
      decisão #24. Terceira Área — três recursos "não intercambiáveis":
      Pontos de Comando, Carga e Vitalícia.
  - Card novo na aba Combate, só quando a Área é Robótica e Engenharia:
    PC (teto sobe com o Ano: 1→2→3, botão "Novo turno" pra resetar),
    Carga (base 4, Melhorias 0–4 até o teto 8, Recarga +2 uma vez por
    cena) e Vitalícia (mesma fórmula da Mana, mas lendo Treinamento em
    Conhecimentos). Descanso completo recupera as três juntas. Sistema/
    Chassi/Módulo completos ficam pra fatia futura
  - Testado com Playwright: painel gated por Área e aba, PC mudando de
    teto pelo Ano e resetando por turno, Carga subindo de teto com
    Melhorias e voltando por Recarga (travada até nova cena, e só se
    ainda faltar Carga), Vitalícia reagindo ao Reservatório, Descanso
    completo nas três reservas de uma vez, e persistência após
    recarregar
- [ ] Ometion

---

## Fora de escopo

- **Cadastro de lore** (#36) — cidades, NPCs, facções. Saiu do projeto
- **IA dentro do app** (#23) — a Claude constrói e ajuda por fora
- **Dungeon do Dia** (#12)
- **Qualquer coisa paga** (#5)

---

## Pendência de configuração

- [x] **Login aberto a qualquer conta Google** (28/08/2026) — o app do
      Google estava em modo "Testando": só entravam contas cadastradas na
      lista de até 100, em *Google Cloud → Público-alvo*, contrariando a
      decisão #4. Precisava de duas URLs que faltavam no Branding (página
      inicial e Política de Privacidade) pra liberar o botão de publicar —
      criada a página `/privacidade` (pública, sem exigir login) só pra
      isso. Como o Hub só pede escopos não-sensíveis (nome, email, foto) e
      não tem logotipo nem mais de 10 domínios, o Google não pediu
      verificação: status virou **"Em produção"** direto. Confirmado pelo
      Zé com print do painel do Google Cloud
