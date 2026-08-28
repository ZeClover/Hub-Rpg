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

### Outros sistemas
- [ ] Sistema SAO
- [ ] Thrylikí Chelóna
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
