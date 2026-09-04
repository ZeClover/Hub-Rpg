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

- [x] **Mesa ao Vivo — Painel de Vida e Ordem de Iniciativa** (29/08/2026)
      — decisão #46. Página nova (`/campanhas/[id]/mesa`, só pro mestre)
      pra usar durante a sessão, separada da tela de organização.
  - Painel de Vida: vida de jogadores acompanhada sozinha (busca a cada
    8s um campo `resumoVida` que toda ficha — dos quatro sistemas —
    passou a espelhar a cada salvamento) e vida de inimigos ajustável
    ali mesmo, com botões -5/-1/+1/+5, sem abrir a ficha
  - Ordem de iniciativa: nome, condição livre, mover, marcar de quem é
    a vez, contador de rodada — só no navegador do mestre (localStorage)
  - Deixado de fora, de propósito: tempo real de verdade (pediria abrir
    política de leitura em `personagens`, hoje travada — decisão #31),
    editar vida de jogador pelo painel, rolador de dados
  - Testado: 9 testes automáticos novos de `resumo-vida.ts` (25 no
    total do projeto), 1 teste de Playwright novo cobrindo as 7 fichas,
    e os 41 testes de Thrylikí Chelóna sem regressão. `tsc`, `next
    build` e lint limpos. Sem acesso a Supabase/login nesta sessão — a
    tela em si fica pro Zé confirmar visualmente na primeira sessão

- [x] **Campanha Livre — núcleo mínimo de importação do ChatGPT**
      (01/09/2026) — decisão #47. Sistema novo (5º do Hub), pra quem
      joga campanha solo com o ChatGPT de mestre.
  - Página `/campanha-livre` (primeira ficha do Hub em Next.js/React em
    vez de HTML estático), com Modo Hub (`?id=`, `/api/personagens/[id]`)
  - Colar o bloco `[HUB_UPDATE]` → interpretar → revisar cada mudança
    numa lista com checkbox e "antes → depois" editável → confirmar →
    salva. Só 5 operações desta fatia: `xp`, `resources`, `items_add`,
    `items_remove`, `notes_add` — o resto do pacote (undo, snapshot,
    event log, as outras ~15 operações) fica documentado pra depois
    (decisão #26)
  - Detecção de duplicidade por `update_id`/hash, mudança com erro nunca
    aplicável mesmo marcada, campo desconhecido ignorado com aviso sem
    quebrar o resto do bloco, modo leitura pra quem só tem acesso
    compartilhado
  - Testado: 62 testes automáticos (`node --test`), 2 testes de
    Playwright novos (fluxo completo de importação + modo leitura).
    `tsc`, `next build` e lint limpos
  - Pendência: rodar `0009_sistema_campanha_livre.sql` no Supabase antes
    de criar a primeira ficha (mesma situação das migrações 0007/0008) —
    **feito pelo Zé em 01/09/2026**

- [x] **Campanha Livre — segunda fatia: Nível e ficha** (01/09/2026) —
      decisão #48. Mais 5 operações do protocolo HUB_UPDATE: `level`,
      `attributes`, `items_update`, `equipment`, `currency`.
  - Campos novos na ficha: `atributos` (FOR, INT, sem teto) e `moedas`
    (berries, sem teto) — mapas de nome livre, mesmo estilo de
    `recursos`. Item ganhou `equipado`/`slot`
  - `items_update` mostra antes → depois de cada campo mudado;
    `equipment.equip`/`unequip` fazem a mesma coisa com nome de slot
  - Tudo também editável direto na ficha, sem o ChatGPT: seções
    Atributos e Moedas, caixinha "Equipado" + slot no Inventário
  - Testado: 20 testes automáticos novos (82 no total), 1 teste de
    Playwright novo com as 5 operações combinadas + edição manual; os 2
    testes de Playwright da fatia anterior sem regressão. `tsc`, `next
    build` e lint limpos

- [x] **Campanha Livre — terceira fatia: Missões e NPCs** (01/09/2026)
      — decisão #49. Mais 5 operações do protocolo HUB_UPDATE:
      `missions_add`, `missions_update`, `npcs_add`, `npcs_update`,
      `relationships`.
  - Campos novos: `missoes` (nome, status, objetivos, recompensas,
    anotações) e `npcs` (descrição, conhecimento — só o que o jogador
    sabe, regra #55 — e `relacoes`, mapa livre igual a Atributos)
  - Toda referência a missão/NPC exige que ele já exista na ficha —
    senão vira erro bloqueante, mesma regra de `items_remove`/
    `items_update`
  - Tudo também editável direto na ficha: seletor de status por
    missão/objetivo, relações como números editáveis, "+ Missão"/"+
    NPC"/"+ Objetivo"/"+ Conhecimento" manuais
  - Testado: 23 testes automáticos novos (105 no total), 1 teste de
    Playwright novo com duas importações em sequência + edição manual;
    os 3 testes de Playwright das fatias anteriores sem regressão.
    `tsc`, `next build` e lint limpos

- [x] **Campanha Livre — quarta fatia: Conhecimento e mundo**
      (01/09/2026) — decisão #50. Mais 9 operações do protocolo
      HUB_UPDATE: `notes_update`, `notes_remove`, `discoveries_add`,
      `discoveries_update`, `codex_add`, `locations_add`,
      `locations_update`, `bestiary_add`, `journal`.
  - Cinco listas novas: `descobertas` (status em 7 graus), `codex`
    (lore só de leitura, sem update/remove), `locais` (descoberto +
    conhecimento acumulado), `criaturas` (bestiário) e `diario`
  - Remover uma colinha (`notes_remove`) vem sempre desmarcado por
    padrão na revisão — única mudança destrutiva do protocolo até
    agora, sem precisar de um 4º nível de alerta
  - Toda atualização exige que a entidade já exista, mesma regra das
    fatias anteriores; toda criação evita duplicar pelo nome/título
  - Testado: 28 testes automáticos novos (133 no total), 1 teste de
    Playwright novo com três importações em sequência + edição manual;
    os 4 testes de Playwright das fatias anteriores sem regressão.
    `tsc`, `next build` e lint limpos

- [x] **Campanha Livre — quinta e última fatia: Desfazer e histórico**
      (01/09/2026) — decisão #51. Sem operação nova: desfazer por
      mudança individual + log de eventos (regras #12/#41/#44/#45).
  - Cada evento guarda a entidade inteira como estava antes daquela
    mudança específica (ou `null` = não existia) — mesma lógica de
    desfazer pros 24 tipos de operação, sem caso especial por tipo
  - Desfazer nunca apaga o evento original, só marca `revertido: true`
    — a linha fica riscada no Histórico com "(desfeito)"
  - Escopo: só mudanças de importação têm undo; edição manual na ficha
    continua sem, já que é diretamente editável a qualquer momento
  - Testado: 9 testes automáticos novos (142 no total), 1 teste de
    Playwright novo (desfaz XP sem afetar mana/item, desfaz criação de
    item); os 5 testes de Playwright das fatias anteriores sem
    regressão. `tsc`, `next build` e lint limpos
  - **Protocolo HUB_UPDATE completo** — cinco fatias (decisões #47 a
    #51), cada uma no ar antes da próxima começar (decisão #26)

- [x] **Campanha Livre — Missões/NPCs/Descobertas/Locais/Bestiário/
      Codex/Diário/Colinhas em abas** (01/09/2026) — decisão #52.
      Ajuste visual: essas 8 seções, que estavam empilhadas na
      vertical, viraram abas (uma visível por vez). Recursos/
      Atributos/Moedas/Inventário continuam sempre visíveis. Nenhuma
      lógica de dados mudou — testado com os 142 testes automáticos
      (inalterados) e 1 teste de Playwright novo pra confirmar troca
      de aba sem perda de dado.

- [x] **Campanha Livre — Desfazer importação inteira + 3 correções do
      núcleo** (01/09/2026) — decisão #53.
  - Botão "Desfazer importação inteira" por import no Histórico, com
    preview ("Serão revertidas N alterações") antes de confirmar;
    reverte na ordem certa (mais recente primeiro), pula eventos já
    desfeitos individualmente, avisa se outra importação mexeu na
    mesma coisa depois (`eventosConflitantes`)
  - Corrigido: dependência dentro do mesmo bloco HUB_UPDATE (ex:
    `npcs_add` + `relationships` pro mesmo NPC) agora resolve via
    estado projetado, recalculado a cada mudança de seleção no preview
  - Corrigido: recurso indo negativo não avisava quando ainda não
    existia na ficha; aproveitado pra dar mínimo configurável
    (`RecursoLivre.minimo`, mesmo modelo do máximo)
  - Corrigido: `generate_image: true` em `items_add` não aparecia em
    lugar nenhum — agora mostra "Imagem solicitada — pendente" no
    preview e fica marcado no item salvo, sem gerar nada de verdade
  - Testado: 16 testes automáticos novos (158 no total), 1 teste de
    Playwright novo reproduzindo o cenário relatado pelo Zé de ponta a
    ponta; os 7 testes de Playwright das fatias anteriores sem
    regressão. `tsc`, `next build` e lint limpos

- [x] **Campanha Livre — fecha o HUB_UPDATE v1.0** (01/09/2026) —
      decisão #54. As 11 operações que faltavam: `temporary_modifiers`,
      `conditions`, `spells_add`/`spells_update`/`spell_discoveries`,
      `research_add`/`research_update`, `achievements_add`,
      `reputation`, `image_requests` (própria, distinta do
      `generate_image` de item), e `school.lessons_add` (fora da
      especificação, pedido explícito do Zé pra campanhas escolares).
  - Mesmo fluxo das 24 operações anteriores em todas — sem atalho por
    módulo; estado projetado (decisão #53) generalizado pra cobrir as
    novas dependências dentro do mesmo bloco (`spell_discoveries` de
    uma magia criada no mesmo import, `research_update` de uma pesquisa
    criada no mesmo import, etc.)
  - Condições e modificadores temporários ganharam seção própria
    **sempre visível** (fora de aba); Magias/Pesquisas/Conquistas/
    Reputação/Imagens/Escola viraram 6 abas novas em `AbasMundo`
  - Snapshots (`criarSnapshot`/`restaurarSnapshot`) — cópia manual da
    ficha inteira, fora do pipeline de Mudanca; restaurar sempre mostra
    preview e tira backup automático antes, nunca destrutivo em silêncio
  - Simplificações documentadas (não inventadas): relações de pesquisa
    com magia/NPC/local/item ficaram de fora (especificação não definiu
    formato); gatilhos automáticos de snapshot não implementados (Hub
    não tem conceito de "sessão" como evento de sistema); `school`
    restrito a `lessons_add` (único formato com exemplo concreto)
  - Testado: 50 testes automáticos novos (208 no total), incluindo um
    teste unitário combinando 8 das novas operações no mesmo bloco
    HUB_UPDATE; 2 testes de Playwright novos (fluxo combinado de ponta
    a ponta na interface, e snapshot manual com preview/backup). `tsc`,
    `next build` e lint limpos
  - **HUB_UPDATE v1.0 completo** — decisões #47 a #54

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
- [x] **Thrylikí Chelóna — combate de Botânica, Arte e Zoologia** (29/08/2026)
      — decisão #25. Três Áreas de uma vez, construídas em paralelo por três
      agentes (primeira vez usando subagentes neste projeto), cada um num
      worktree isolado. Fecha o grupo das seis Áreas originais com combate
      de verdade — restam as dez novas.
  - **Botânica e Biomancia:** Seiva (0–5) + até três Cultivos com estágio
    Broto/Floração/Maturação (mesma trilha de clock das Consequências)
  - **Zoologia e Etologia:** Dados de Campo (0–3) + campo de texto livre
    "Perfil Ativo" (a grade completa de Perfis/Traços fica pra depois)
  - **Arte e Expressão:** Ressonância (0–3), Apresentação Forte e Clímax
    (que zera a Ressonância inteira) + até três Motivos + Obra Principal
  - Merge manual necessário: os três agentes partiram do mesmo commit e
    mexeram nos mesmos pontos de extensão do arquivo — sempre inserções
    independentes competindo pelo mesmo lugar, nunca mudança incompatível.
    Resolvido concatenando as três adições, com sintaxe/CJK/testes
    reconferidos depois de cada merge
  - Testado com os testes de cada agente revalidados contra o arquivo já
    mesclado com as três Áreas juntas, mais os seis testes das fatias
    anteriores pra garantir que nada quebrou
- [x] **Thrylikí Chelóna — combate das dez Áreas novas** (29/08/2026) —
      decisão #26. Alquimia, Astronomia, Matemática, Psicologia, Medicina,
      Geologia, História, Tanatologia, Direito e Filosofia de uma vez —
      **fecha as 16 Áreas com combate jogável**.
  - As dez compartilham a mesma forma de recurso (0–3, ganha 1 por regra
    própria, ação forte gasta 2 pra ir de 1 pra 1,5 Impacto), confirmado
    contra `automation/novas-areas.json`. Em vez de dez funções quase
    idênticas, um único `painelNovaArea(p)` dirigido pela tabela
    `RECURSOS_NOVAS_AREAS` (gerada do JSON) serve pras dez — sem agentes
    nem risco de merge desta vez, já que virou um problema mecânico de
    dados, não uma decisão de design por Área
  - Alquimia e Química quebra o padrão simétrico (a ação forte *gera* 3
    do recurso em vez de gastar 2) — tratado como exceção explícita na
    tabela, não como parsing de texto
  - Estado por Área num dicionário (`p.recursosNovaArea`, chaveado por
    `areaId`), mesmo padrão usado nos IDs de Ramo — trocar de Área não
    faz uma herdar o valor da outra
  - Testado com Playwright: painel ausente sem Área, caso padrão
    (Astronomia) completo, caso especial (Alquimia) com o delta de +3
    ainda clampado em 3, estado independente entre Áreas, persistência
    após recarregar, e varredura das outras oito Áreas pra pegar erro de
    escape de texto. Os nove testes das fatias anteriores continuam
    passando
- [x] **Thrylikí Chelóna — ficha de inimigo** (29/08/2026) — decisão #27.
      O maior buraco que sobrava depois das 16 Áreas: Fabula Ultima e SAO
      já tinham ficha de inimigo, Thrylikí Chelóna não.
  - **`public/thryliki-chelona-inimigo.html`** novo, com Modo Hub desde o
    início: nome, Categoria (I-V), Porte, Função tática, Defesa fixa por
    canal (com tabela de referência e "Recalcular pela fórmula" que marca
    canais Forte/Fraco e ainda deixa sobrepor com valor manual), Vida,
    deslocamento, condições, resistências especiais, Ações Características
    (lista livre) e Reação — só o "Cartão de mesa" do documento de
    criaturas; orçamento de encontro e fases de Chefe ficam pra depois
  - **`src/lib/sistemas.ts`**: `fichaInimigo` aponta pro arquivo novo
  - Testado com Playwright: valores iniciais, Defesa-base por Categoria,
    marcar Forte/Fraco recalculando o canal certo, valor manual sobrepondo
    o cálculo, condições, Ações Características, persistência após
    recarregar, e Modo Hub completo mockado. Os testes da ficha de
    jogador continuam passando
- [x] **Thrylikí Chelóna — Escudo do Mestre** (29/08/2026) — decisão #28.
      Página de referência rápida, mesmo formato do SAO e do Fabula
      Ultima — fecha o trio ficha de jogador + ficha de inimigo + Escudo
      do Mestre que os outros dois sistemas completos já tinham.
  - **`public/thryliki-chelona-escudo-mestre.html`**: página estática
    (sem script, sem localStorage), transcrita fielmente de
    `referencia-rapida-v6.1.md` — teste e graus de resultado, turno,
    escala de Impacto, Patamares, condições, Vida zero e Pacto,
    Recuperação, Cena de Desafio, referência rápida de criatura e os
    lembretes de mesa
  - **`src/lib/sistemas.ts`**: `escudoMestre` aponta pro arquivo novo
  - Testado com Playwright: página carrega sem erro de console e as
    seções principais aparecem no texto renderizado
- [x] **Thrylikí Chelóna — Fases de Chefe** (29/08/2026) — decisão #29.
      Continuação direta da ficha de inimigo, mesmo ritmo do Chefe de
      Andar do SAO: ficha básica primeiro, fases depois, numa fatia à
      parte.
  - Nova aba "Fases de Chefe" em `thryliki-chelona-inimigo.html`,
    relevante quando Porte é "Fase de Chefe": cada fase tem os sete
    campos do documento de criaturas (nome, Gatilho, Sinal, Objetivo,
    Ação normal, Ação de Fase, Transição) mais os canais marcados Forte
    naquela fase especificamente, e um card de referência da Economia
    do Chefe (1 turno, 1 Reação, 1 Ação de Fase, no máximo 1 Impossível
    por rodada)
  - Ficha salva antes desta fatia recebe `fasesChefe: []` automaticamente
    na primeira leitura, sem quebrar
  - Testado com Playwright: aviso condicional ao Porte, adicionar/
    remover fases, marcar canais Forte por fase, persistência após
    recarregar (inclusive ficha antiga sem o campo). Os testes
    anteriores da ficha de inimigo continuam passando
- [x] **Thrylikí Chelóna — calculadora de Orçamento de Encontro** (29/08/2026)
      — decisão #30. Última peça do lado do mestre: Força do Grupo ×
      dificuldade vira Orçamento, e o mestre soma Pontos de Ameaça por
      Porte pra comparar.
  - Primeira parte interativa de `thryliki-chelona-escudo-mestre.html`
    (até aqui só HTML/CSS estático) — sem persistência de propósito, é
    conta rápida de sessão, não ficha
  - Campos Força/Dificuldade calculam o Orçamento ao vivo; botões por
    Porte (Capanga/Padrão/Elite/Fase de Chefe) acumulam uma composição
    planejada, com remover por linha e Limpar tudo; Total gasto compara
    com o Orçamento e avisa se passou
  - Testado com Playwright: Orçamento reagindo aos dois campos, soma por
    Porte, status dentro/acima do orçamento, remover e limpar
- [x] **Thrylikí Chelóna — Construtor de Fórmula (Simbologia Arcana)**
      (29/08/2026) — decisão #32. Calculadora de Fórmula que a decisão
      #23 tinha deixado pendente: Verbo + Potência + Essência + Alcance +
      Alvo + Duração + Cláusulas viram Impacto/Mana/Tomos ao vivo.
  - Matriz de Tomo (por Ano) trava "Salvar Fórmula" quando a combinação
    não cabe; Fórmulas salvas entram numa lista com nome editável e
    botão Manifestar que desconta a Mana do pool
  - Rascunho do construtor não persiste (mesmo padrão do Orçamento de
    Encontro) — só "Salvar Fórmula preparada" grava de verdade
  - Testado com Playwright: cálculo ao vivo, aviso e trava ao estourar a
    Matriz, salvar/renomear/Manifestar, persistência após recarregar
- [x] **Thrylikí Chelóna — Construtor Livre de Poder** (29/08/2026) —
      decisão #33. A gramática genérica de criação livre que vale pras
      quinze Áreas sem Fórmula própria (só Simbologia Arcana foge dela).
  - Cartão universal (Nome, Intenção, Acesso, Âncora, Forma, Potência,
    Resultados, Custo, Teste/Resistência, Contrajogo, Resíduo); Potência
    dá o orçamento de Impacto, Resultados (Átomos de Impacto) dividem
    esse orçamento; Custo vem de uma tabela por Área
  - Gated por Ano: 1º e 2º mostram só um aviso (Poderes Prontos /
    Modificação Guiada); construtor completo libera no 3º
  - Sem botão de gastar recurso — o custo por Área é texto, não número
    único; o poder salvo é registro de referência, o gasto de verdade
    continua no painel de recurso que a própria Área já tem
  - Testado com Playwright: gating por Ano, orçamento de Impacto ao
    vivo, aviso/trava ao estourar, salvar/renomear/remover, persistência
    após recarregar, e Simbologia Arcana mostrando nota em vez do
    construtor genérico
- [x] **Thrylikí Chelóna — Técnicas prontas dos 117 Ramos** (29/08/2026)
      — decisão #34. As 351 técnicas de Pressão/Sobrevivência/Tática do
      plano de conclusão do autor, que a decisão #21 (catálogo de Ramos)
      tinha deixado de fora — só rótulo de progressão tinha entrado.
  - Extraídas dos JSONs `tecnicas-prontas-areas-originais.json` (37
    Ramos) e `tecnicas-prontas-novas-areas.json` (80 Ramos) do próprio
    pacote do Zé, cruzadas por posição com os Ramos já cadastrados no
    Hub — 117/117 batendo, 351/351 técnicas
  - Aparecem no card de Ramo já existente ao escolher um Ramo (2º Ano+):
    três técnicas nomeadas, prontas pra jogar sem precisar de criação
    livre
  - Testado com Playwright: ausência sem Ramo, técnicas certas ao
    escolher, troca ao mudar de Ramo, Ramo de Área nova, persistência
- [x] **Thrylikí Chelóna — Kit de Combate do 1º Ano** (29/08/2026) —
      decisão #35. As opções nomeadas que um personagem de 1º Ano usa
      pra combater antes de ter Ramo ou criação livre — "o Ramo não
      desbloqueia o direito de combater, isso já existe no kit da Área".
  - `KITS_COMBATE_ANO1`: Entrada pronta + 3 a 5 opções (Ação/Custo/
    Impacto/Uso) + Turno sugerido, por Área — só as seis originais (as
    dez novas já têm o próprio kit nas "ações comuns")
  - Fica visível em qualquer Ano, não some ao escolher Ramo
  - Testado com Playwright: presença/ausência por Área, opções certas,
    continua visível após subir de Ano, dez Áreas novas sem duplicar
- [x] Todas as dezesseis Áreas de Estudo têm recurso de combate, criação
      livre, técnicas de Ramo e Kit de Combate do 1º Ano dentro do Hub
- [x] **Thrylikí Chelóna — Interação Social no Escudo do Mestre**
      (29/08/2026) — decisão #36. Painel de figura social (Desejo/
      Objeção/Limite/Posição) e as cinco Posições, reaproveitando a
      Cena de Desafio que a decisão #28 já tinha trazido.
- [x] **Thrylikí Chelóna — Inventário** (29/08/2026) — decisão #37.
      Nova aba de jogador: Carga Pronta (`6 + Força`) e Cartão universal
      de item (Categoria/Tipo/Tamanho/Perfil/Traços/Âncora/Estado/
      Acesso), com Munição em armas e Guarda em proteções.
  - Fabricação/melhoria de item e conversão automática de Guarda em
    Vida ficam de fora — a primeira é processo, não dado de
    personagem; a segunda não tem fluxo de "aplicar dano" em nenhum
    outro lugar da ficha pra se conectar
  - Testado com Playwright: Carga Pronta batendo com a fórmula, campos
    condicionais por tipo, soma de Carga por Tamanho, Sobrecarregado,
    Guarda subindo/descendo, remover item, persistência
- [x] **Thrylikí Chelóna — Projetos de Criação, Melhoria e Reparo**
      (29/08/2026) — decisão #38. A gramática genérica de item (o par
      da decisão #33 do lado de itens em vez de poderes) mais um botão
      Reparar nos itens que a decisão #37 já tinha criado.
  - Sete campos de Projeto, Escala, quatro Categorias calculando a
    Categoria Operacional (a menor) ao vivo, capacidade de Traços por
    Categoria, Fase (só na Escala Projeto, limitada pela Categoria) e
    Faixa de Custo; "Concluir Projeto" cria o item e trava
  - Cena de Desafio por fase e Viradas de projeto ficam de fora —
    julgamento de mesa, não automação
  - Testado com Playwright: Categoria Operacional, capacidade de
    Traços, aviso/trava de excesso, Fases por Categoria, criar item e
    travar, Reparar, persistência
- [x] Sistema Thrylikí Chelóna fecha a lista de fatias do plano de
      conclusão do autor: chassi, dezesseis Áreas com combate e criação
      livre, Ramos com técnicas prontas, Kit de 1º Ano, ficha de
      inimigo com Fases de Chefe, Escudo do Mestre completo e
      Inventário com criação/melhoria/reparo
- [x] **Thrylikí Chelóna — Economia de PE, Marcos da Área e Ascensões**
      (29/08/2026) — decisão #39. PE não tinha onde ser gasto; agora
      compra Grau de Atributo, degrau de Treinamento, Talentos, Recursos/
      Eletivas, e Fórmulas/Poderes além das duas primeiras gratuitas.
  - Nova aba Progressão: livro-razão de compras, Marcos da Área
    (registra o que cada Marco escolheu) e Ascensões (registra o eixo)
  - Testado com Playwright: travas de PE/Categoria/Ano, compras
    refletindo no Grau/Treinamento real, Marcos/Ascensões por Nível,
    remover devolve PE, persistência
- [x] **Thrylikí Chelóna — Doenças, Demi-humanos e Místicos** (29/08/2026)
      — decisão #40. Catálogo opcional de 23 Pares (Pró/Contra/Âncora)
      em 9 criaturas — Comuns, Demi-humanos e Místicos.
  - Até seis Pares ativos por personagem, dois grátis, os demais a
    2 PE cada (usa a economia da decisão #39)
  - Testado com Playwright: Pares grátis, trava de PE no terceiro,
    liberação ao subir de Nível, remover devolve PE, persistência
- [x] **Thrylikí Chelóna — Progresso de Nível, Portfólio e Recesso**
      (29/08/2026) — decisão #41. Última peça de `campanha-escolar-v6.1.md`
      que cabia em ficha de personagem (o resto é procedimento de mesa).
  - Progresso de Nível por Ritmo (trilha de duas caixas no Padrão, botão
    direto nos outros dois); Portfólio de Prova de Passagem (4 itens,
    não muda o Ano sozinho — isso é julgamento do Mestre); Recesso (até
    duas Atividades das seis do documento)
  - Testado com Playwright: trilha/botão subindo o Nível de verdade,
    aviso de Portfólio completo, "Novo Ano"/"Novo Recesso" limpando,
    trava de duas Atividades, persistência
- [x] Varredura completa dos 60 documentos de design de Thrylikí Chelóna
      fechada — todo conteúdo mecânico de personagem está na ficha
- [x] **Thrylikí Chelóna — Vida editável, dano e Recuperação** (29/08/2026)
      — decisão #42. O buraco mais básico da ficha: Vida nunca tinha
      ficado editável, só exibida.
  - Sofrer Impacto/Curar convertendo pela fórmula de combate-v6.1.md
    (1 Impacto ≈ 22% da Vida máxima); desconto manual de Guarda;
    Primeiros Socorros (1x por cena); as quatro escalas de Recuperação
    (Respiro/Intervalo/Repouso/Descanso completo), Intervalo com
    contador de até dois por Descanso completo
  - Testado com Playwright: conversão de dano/cura, Guarda anulando
    dano, Primeiros Socorros travando/liberando, Intervalo contando e
    travando, Descanso completo enchendo Vida e reduzindo Consequência
- [x] **Thrylikí Chelóna — Chassi, Núcleo de Consciência e Módulos**
      (29/08/2026) — decisão #43. Peça de Robótica e Engenharia que a
      decisão #24 tinha deixado pra depois.
  - Chassi (8 tipos + Categoria/escala), Núcleo de Consciência (5
    níveis), Sistema Principal/Apoio, e Módulos (9 Famílias, Categoria,
    Ação, Custo, Impacto, Âncora, Contrajogo) travados pelo teto de
    Módulos por Ano (2/3/4/6/8)
  - Testado com Playwright: descrições de Chassi/Núcleo, limites de
    Apoio e Módulos por Ano, Módulo salvo com os campos certos,
    remover, persistência
- [x] **Thrylikí Chelóna — Bestiário: Perfis e Traços de Zoologia**
      (29/08/2026) — decisão #44. Última peça deixada de fora pela
      decisão #25 (só tinha um campo de texto livre).
  - Até três Perfis preparados, cada um com até três Traços
    (Família + descrição), um marcado como Ativo por rádio
  - Testado com Playwright: adicionar/remover Perfil e Traço com os
    tetos certos, rádio de Ativo, persistência
- [x] **Thrylikí Chelóna — Metassímbolo de Simbologia Arcana** (29/08/2026)
      — decisão #45. O "+1 Metassímbolo" do 5º Ano, citado desde a
      decisão #23 mas nunca com campo pra escrever o que ele é.
  - Campo de texto livre, visível só no 5º Ano (sem fórmula numérica —
    o documento não dá uma; é uma exceção autoral nomeada)
  - Testado com Playwright: ausente antes do 5º Ano, aparece ao subir,
    persiste após recarregar
- [x] Levantamento de peças conscientemente deixadas de fora ao longo
      da sessão está fechado — nenhuma lacuna conhecida entre os
      documentos de design de Thrylikí Chelóna e a ficha
- [x] **Grimório de Thrylikí Chelóna** (01/09/2026) — decisão #55.
      Manual do jogador em página própria (`thryliki-chelona-grimorio.html`),
      linkada da ficha, da ficha de inimigo e do Escudo do Mestre.
  - 22 seções cobrindo o sistema inteiro: conceito, atributos/perícias,
    teste, as 26 Origens, as 16 Áreas e os 117 Ramos, combate de cada
    Área (6 originais + 10 novas), Construtor de Fórmula e Construtor
    Livre de Poder, Técnicas de Ramo, Interação Social, Inventário,
    Projetos, PE/Marcos/Ascensões, Doenças, Nível/Portfólio/Recesso,
    Vida/dano/Recuperação, Chassi/Núcleo/Módulos, Bestiário de Zoologia,
    Metassímbolo, e uma seção só pro Mestre
  - Conteúdo levantado das decisões #20–#45 e do código-fonte antes de
    escrever — nada inventado; listas fechadas (Origens, custo por
    Área) conferidas direto no código
  - Fabula Ultima fica de fora desta fatia — o Zé escreve o texto de
    regras dessa ficha (é sistema comercial, o Hub só codifica mecânica)
  - Testado com Playwright: sumário sem link quebrado, `<details>`
    abrindo, sem erro de JS. `tsc` e lint (só HTML estático) sem impacto
- [x] **Thrylikí Chelóna — grimório conectado ao Hub, exemplos e
      Caminhos Prontos** (01/09/2026) — decisão #56.
  - Campo `grimorio` novo em `Sistema` (`src/lib/sistemas.ts`), preenchido
    só pro Thrylikí Chelóna; link "📖 Abrir Grimório" na página da
    campanha, pro mestre e pro jogador (mesmo padrão do Escudo do Mestre)
  - Exemplos (`placeholder`) nos campos mais abertos da ficha: os 7 campos
    do Construtor Livre de Poder (um poder de exemplo coerente inteiro,
    "Investida da Alcateia"), 4 campos de Projeto, Perfil de item,
    Aparência do personagem
  - **Caminhos Prontos**: 16 arquétipos prontos, um por Área de Estudo,
    cada um com Origem + distribuição de Atributos + dica da primeira
    ação — card na aba Status, "Aplicar" preenche Origem/Atributos/
    Treinamentos do personagem atual (com confirmação se já tinha algo
    escolhido), sem criar ficha nova nem mexer em outra aba
  - Testado com Playwright: 16 opções, prévia reativa, aplicação correta,
    confirmação ao sobrescrever, placeholders no lugar certo, sem erro de
    JS. `tsc`, lint e os 208 testes automáticos continuam limpos
- [x] **Thrylikí Chelóna — exemplos na aba Progressão** (01/09/2026) —
      decisão #57. Os 6 campos de texto livre que faltavam (Descrição de
      Talento, de Recurso/Eletiva, de Marco, de Ascensão, Recuperação do
      Portfólio, Anotações do Recesso) ganharam `placeholder` de exemplo
      concreto, mesmo padrão da decisão #56. Testado com Playwright
      (personagem 5º Ano/Nível 20 pra ter Marco e Ascensão disponíveis);
      `tsc`, lint e os 208 testes automáticos continuam limpos
- [x] **Thrylikí Chelóna — links da ficha pro Grimório** (01/09/2026) —
      decisão #58. Função `linkGrim(ancora, texto)` espalhada em 26
      pontos da ficha — cada card/painel (Origem, Área, Ramo, Doenças,
      Atributos, Teste, PE/Talentos/Recursos/Marcos/Ascensões, Progresso
      de Nível/Portfólio/Recesso, cada Área de combate original, as Áreas
      novas, os dois Construtores, Kit de Combate, Bestiário, Vida,
      Inventário, Projetos) linka pra âncora exata da seção correspondente
      do Grimório, sempre em nova aba. Testado com Playwright (âncoras
      conferidas contra os ids reais do Grimório, sem link quebrado);
      `tsc`, lint e os 208 testes automáticos continuam limpos
- [x] **Thrylikí Chelóna — Grimório mais bonito e fácil de entender**
      (03/09/2026) — decisão #59. Emoji temático nas 22 seções do
      sumário e dos títulos; caixa `.exemplo` nova (verde, com números
      calculados em destaque) com 10 cenas jogadas (Maya, Kaito, Aurora,
      Diane) cobrindo teste/Patamares, Corpo e Cinética, Simbologia
      Arcana, Construtor de Fórmula, Construtor Livre de Poder (mesmo
      texto dos placeholders da ficha), PE, Vida, uma Área nova
      (Psicologia e Noética) e Projetos; caixa `.resumo` nova (uma frase
      em linguagem simples) nas três seções mais densas. Testado com
      Playwright (sumário íntegro, caixas novas no DOM, sem erro de JS);
      `tsc`, lint e os testes automáticos continuam limpos
- [x] **Thrylikí Chelóna — botão de Subir de Nível com resumo**
      (03/09/2026) — decisão #60. Mesmo padrão do Level Up do Kaizoku no
      Sho: clicar mostra um painel comparando antes/depois — Vida
      Máxima, PE ganho/disponível, Categoria, Ciclo, Nível no Ciclo — e
      avisa quando um Marco da Área ou uma Ascensão foi liberado.
      Diferença do Kaizoku: Nível não tem teto, então o botão nunca
      trava. Testado com Playwright (resumo aparece com os deltas
      certos, sobrevive a trocar de aba, some ao Fechar, Nível sobe de
      verdade, sem travar num segundo Level Up); `tsc`, lint e os 208
      testes automáticos continuam limpos
- [x] **Grimório de Fabula Ultima e botão de Subir de Nível** (03/09/2026)
      — decisão #61. Grimório novo (19 seções) só de mecânica universal
      (Atributos/Perfis, Teste, Classes/Multiclasse, Poderes e NP,
      PV/PM/PI/Crise, Defesa, Equipamento, Condições/Afinidades, Pontos
      de Fabula, Zenit, Rituais, Projetos, Habilidades Heroicas, Laços,
      panorama dos subsistemas por Atlas) — mais enxuto que o de
      Thrylikí Chelóna de propósito, por ser sistema comercial (aviso
      no topo da página). Conectado ao Hub via `sistemas.ts` e linkado
      na ficha. Botão "⭐ +1 Nível" por linha de classe (multiclasse, sem
      um Nível único de personagem pra subir) com resumo antes/depois e
      aviso de "classe dominada" no Nível 10. Testado com Playwright
      (âncoras do Grimório íntegras, botão habilita só com classe
      escolhida, resumo com deltas corretos, trava em Nível 10); `tsc`,
      lint e os 208 testes automáticos continuam limpos
- [x] **Thrylikí Chelóna — Modo Guiado, tooltips e trilha de aprendizado**
      (03/09/2026) — decisão #62. Pedido do Zé pra facilitar o
      aprendizado/uso sem simplificar a mecânica. Modo Guiado: criação em
      3 passos (Nome+Caminho Pronto → Atributos/Treinamentos → resumo),
      todo personagem novo entra nele direto, botão na barra alterna a
      qualquer momento. Tooltips "?" nos 4 números sempre visíveis do
      topo. Trilha de aprendizado nova no Grimório (5 Lições em ordem +
      convite pro Modo Guiado), separada do Sumário de referência.
      Testado com Playwright (fluxo completo do Modo Guiado, Caminho
      preenche Atributos, resumo final, volta pra ficha completa com
      dado persistido; trilha do Grimório sem âncora quebrada); `tsc`,
      lint e os 208 testes automáticos continuam limpos
- [x] **Fabula Ultima, Sistema SAO e Thrylikí Chelóna marcados como
      prontos** (03/09/2026) — decisão #63. Badge "Pronta" em vez de "Em
      construção" na página de Sistemas — só rótulo, junto do Kaizoku no
      Sho que já estava assim. Campanha Livre continua "Em construção"
- [x] **Grimório de Kaizoku no Sho** (03/09/2026) — decisão #64. 14
      seções, paleta própria (navy/latão/pergaminho, igual a ficha):
      conceito, ordem de preenchimento das 13 abas, Atributos e pontos
      por NC, Teste/Ataque (2d8 + Combate vs Esquiva, Grau de Dano ×1 a
      ×4 pelo bruto dos mesmos dados), Perícias, Vitalidade/Estamina,
      Espécies, Profissões (graduações por nível de Perícia
      Profissional), as duas Fontes de Poder (Budô e o construtor por
      orçamento de Akuma no Mi), Haki, Qualidades/Defeitos e
      Equipamento, fechando com o botão de Level Up que já existia.
      Sem aviso de IP comercial (é homebrew do Zé, não um livro de
      terceiros) e sem seção "Para o Mestre" (o sistema ainda não tem
      Escudo do Mestre nem ficha de Inimigo). Conectado ao Hub via
      `sistemas.ts` e linkado no cabeçalho da ficha. Testado com
      Playwright (sumário íntegro, sem erro de JS); `tsc`, lint e os
      208 testes automáticos continuam limpos
- [ ] Grimório dos outros 2 sistemas (SAO, Campanha Livre) — uma fatia
      por vez, a pedido do Zé
- [x] **Modo Guiado em Sistema SAO, Fabula Ultima e Kaizoku no Sho**
      (03/09/2026) — decisão #65. Mesmo padrão de 3 passos (identidade
      → atributos/classe → resumo) já usado em Thrylikí Chelóna
      (decisão #62), reusando os campos da ficha normal em cada
      sistema — sem Campanha Livre, que não tem etapa de criação.
      Personagem novo entra direto nele; botão pra alternar a qualquer
      momento. Dois bugs de reuso de código corrigidos durante a
      validação (Kaizoku: `bindAtributos` chamava uma função que
      dependia da tela normal; `<aside>` reusado com `position:sticky`
      sobrepunha o botão de Concluir fora da grade original). Testado
      com Playwright nos três; `tsc`, lint e os 208 testes automáticos
      continuam limpos
- [x] **Modo Guiado de Evolução no botão de Level Up** (03/09/2026) —
      decisão #66. O resumo do Level Up passa a embutir as escolhas
      liberadas naquele degrau, prontas pra aplicar ali mesmo: Thrylikí
      Chelóna (formulário de Marco/Ascensão + compra de Grau/
      Treinamento), Fabula Ultima (Poder novo da classe + Habilidade
      Heroica ao dominar), Kaizoku no Sho (Atributos/Perícias
      embutidos). SAO fica de fora — ainda não tem botão de Level Up.
      Testado com Playwright nos três (dados realmente gravam no
      personagem, sem duplicar formulário/id); `tsc`, lint e os 208
      testes automáticos continuam limpos
- [x] **Level Up no Sistema SAO + resumo "mostra tudo" nos outros três**
      (03/09/2026) — decisão #67. SAO ganhou o botão "+1 Nível" por
      classe com o mesmo resumo guiado dos outros sistemas (Poder novo
      embutido). Auditoria completa: Thrylikí Chelóna passou a embutir
      também Talentos e Recursos/Eletivas no resumo (antes só Grau de
      Atributo); Kaizoku no Sho passou a embutir o "Nível do Poder"
      (antes só Atributos/Perícias) — o resto de Poderes (Budô/Akuma no
      Mi/Haki) continua de fora por ser grande e stateful demais. Fabula
      Ultima reauditado e mantido sem mudança (nada mais fica pendente
      fora do resumo). Testado com Playwright nos quatro sistemas; `tsc`,
      lint e os 208 testes automáticos continuam limpos
- [x] **Resumo do Level Up guiado vira página separada** (03/09/2026) —
      decisão #68. O resumo do Level Up (que ficava misturado no meio
      dos cards da aba normal, deixando a tela "esquisita") passa a
      substituir a ficha inteira por uma tela própria, igual o Modo
      Guiado de criação já faz — nas quatro fichas. Kaizoku no Sho
      precisou de um ajuste extra em `renderPanel()` pra continuar
      reusando os binds de Atributos/Perícias/Nível do Poder fora de
      qualquer aba, e ganhou de brinde o reset de `levelUpResumo` ao
      trocar/criar/apagar/importar personagem (buraco que tinha ficado
      da decisão #66). Testado com Playwright nos quatro sistemas; `tsc`,
      lint e os 208 testes automáticos continuam limpos
- [x] **Animações leves nas quatro fichas** (03/09/2026) — decisão #69.
      Botões com feedback de clique, cards com hover, e transição de
      fade+deslize ao trocar de tela (aba, Modo Guiado, Level Up) — sem
      animar a cada tecla digitada, só em troca de tela de verdade. No
      caminho, achei e corrigi uma race real do Chromium
      (`NotFoundError` de `innerHTML`+blur) que uma div extra tinha
      exposto — resolvido animando o contêiner que já existe (`#app`/
      `#appRoot`) em vez de criar um novo. Testado com Playwright nos
      quatro sistemas, mais o script que reproduzia o bug do Chromium;
      `tsc`, lint e os 208 testes automáticos continuam limpos
- [x] **Level Up guiado em passos, com mais explicação e poderes reais**
      (04/09/2026) — decisão #70. O resumo do Level Up virou um wizard
      de verdade (um passo de cada vez, com Voltar/Próximo) nas quatro
      fichas, em vez de tudo empilhado numa tela só. Kaizoku no Sho
      ganhou o passo de Poder embutindo o painel de Poderes inteiro
      (Fonte de Poder, Budô/Akuma no Mi de verdade — reverte parte da
      exclusão da decisão #68). Fabula Ultima passou a mostrar o teto de
      Nível 10 por classe. Sistema SAO ganhou pistas mais claras de que
      o Level Up mora na aba Classes. Testado com Playwright nos quatro
      sistemas; `tsc`, lint e os 208 testes automáticos continuam limpos
- [ ] **Customização visual** (ideia registrada, não implementada) — tema/
      cor por sistema, fonte do título, reordenar ou esconder abas,
      layout compacto vs. espaçoso. Fica pra quando o Zé quiser puxar
      essa fatia
- [x] **Sistema do Sávio — chassi e ficha jogável básica** (04/09/2026) —
      decisão #71. Quinto sistema do Hub, homebrew de um amigo do Zé (a
      partir do PDF "SISTEMA_DO_SAVIO" e da planilha original). Traço
      central: Habilidades são livres — o jogador desenha a própria,
      usando a tabela de bônus por Nível (1-5) como referência, em vez de
      escolher de um catálogo fechado. `public/sistema-do-savio.html`
      ganhou Perfil, Atributos (com limiares de 5/10), Perícias,
      Especialização (as 4 classes com traços fixos: Suporte, Combatente,
      Mestre das Armas, Guerreiro Mágico), Habilidades/Passivas como
      lista livre com tabela de referência, Arma e Fluxo. Registrado em
      `sistemas.ts` como `sistema-do-savio`, `salvaNoHub: true`.
      Invocações, Elementais, Ascensão (Arquétipos) e Imersão Espiritual
      ficam para fatias futuras. Testado com Playwright (Modo Guiado,
      cálculo de PV por Especialização, limiares de Atributo, Perícias,
      Habilidades/Passivas, persistência); `tsc`, lint e os 208 testes
      automáticos continuam limpos
- [x] **Sistema do Sávio — Ascensão e Imersão Espiritual** (04/09/2026) —
      decisão #72. Nova aba Ascensão: Primeira Ascensão (escolha de um dos
      4 Arquétipos — Esforçado, Prodígio, Estudioso, Inato — cada um com
      bônus fixo e Passiva de uso único por sessão; Embate de Fluxo como
      referência) e Segunda Ascensão (Imersão Espiritual liberada,
      Habilidades Nível ≤3 custam metade do PE, teto de Atributo sobe de
      10 pra 15, evolução além do Nível 20, "ascender" uma Habilidade a
      cada 3 Níveis pós-20). Imersão Espiritual ganhou card próprio: nome,
      um dos 5 Tipos com exemplo, Bônus contínuo e ajuste de força
      -3/+3, com PV calculado (Nível × Sabedoria). Invocações e Elementais
      ficam para fatias futuras. Testado com Playwright (teto de Atributo
      dinâmico, bônus de Arquétipo aplicado nos Atributos, Imersão criada
      e persistida, custo de PE de Habilidade pela metade); `tsc`, lint e
      os 208 testes automáticos continuam limpos
- [x] **Sistema do Sávio — Invocações** (04/09/2026) — decisão #73. Nova
      aba Invocações: gasta uma Habilidade (o Nível dela decide o tier,
      1-5) pra trazer um aliado ao combate, com pool próprio de pontos de
      Atributo, PV calculado, dado de dano/cura e Perícias escolhidas por
      tier. Enxame (múltiplas invocações do mesmo Nível somando rolagens)
      mostrado como aviso. Elementais ficam para fatia futura. Testado com
      Playwright (referência do tier, cálculo de PV e pool de Atributo,
      Enxame, Perícia da invocação e persistência); `tsc`, lint e os 208
      testes automáticos continuam limpos
- [x] **Sistema do Sávio — Elemental** (04/09/2026) — decisão #74. Nova aba
      Elemental: o companheiro/fonte da Bênção, com ficha própria
      reaproveitando Atributos/Especialização/Perícias já existentes —
      Categoria (Primordial, Inato, Comum, Mítico), Nível e Especialização
      próprios, PV/PE/Sanidade pelas mesmas fórmulas do personagem
      principal, e card de mecânica (Ajuda Elemental = Nível do
      personagem ÷ 2 vezes por cena, Troca). Fecha o Sistema do Sávio:
      chassi, Habilidades/Passivas livres, Especializações, Ascensão
      (Arquétipos + Imersão Espiritual), Invocações e Elemental — todo o
      material do PDF/planilha original. Testado com Playwright (liga o
      Elemental, Categoria Mítico com aviso, PV calculado, Ajuda Elemental
      calculada, persistência); `tsc`, lint e os 208 testes automáticos
      continuam limpos
- [x] **Sistema do Sávio — Level Up guiado, Pontos de Atributo e
      Habilidades automáticas** (04/09/2026) — decisão #76. Botão "⭐ Subir
      de Nível" na aba Perfil, com tela de resumo mostrando PV/PE/Reações/
      Pontos de Atributo/dano de Sanidade antes→depois e a vaga nova de
      Habilidade (todo Nível) ou Passiva (a cada 5) já pronta pra
      preencher ali. Aba Atributos ganhou o card "Pontos de Atributo"
      (começa em 6, +2 a cada 2 Níveis) que faltava. Cada Habilidade agora
      tem caixas de marcar pros efeitos (Dano/Cura/Movimento/RD, Alcance,
      Duração, Vantagem) — a ficha calcula o bônus certo pro Nível sozinha,
      em vez de precisar cruzar a tabela de referência à mão, e já avisa
      quando combinar mais de um efeito reduz o Nível efetivo. Testado com
      Playwright (Pontos de Atributo, Level Up completo, cálculo de bônus
      por efeito, redução de Nível efetivo, persistência); `tsc`, lint e
      os 208 testes automáticos continuam limpos
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
