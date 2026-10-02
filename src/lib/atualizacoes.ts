export type Atualizacao = {
  data: string;
  titulo: string;
  novidades: string[];
};

/* Histórico editorial baseado nos commits e nas decisões do projeto.
   As datas indicam o registro da mudança, não uma data de publicação confirmada.
   Acrescente novas entradas aqui, explicando o efeito para mestre e jogadores. */
export const atualizacoes: Atualizacao[] = [
  {
    data: "2026-08-24", titulo: "O começo do Hub RPG",
    novidades: [
      "O Hub ganhou sua primeira versão, com tema escuro e detalhes em dourado.",
      "Entrada com uma conta Google e preparação para guardar as informações da conta.",
    ],
  },
  {
    data: "2026-08-25", titulo: "Primeiros cadastros",
    novidades: [
      "Primeiras telas para cadastrar universos e informações do mundo. Essa organização foi substituída pelo foco em fichas em 27 de agosto.",
      "Informações reservadas ao mestre passaram a ter proteção de acesso.",
    ],
  },
  {
    data: "2026-08-27", titulo: "Fichas no centro do Hub e chegada de Fabula Ultima",
    novidades: [
      "O Hub passou a se concentrar nas fichas de personagem, substituindo o cadastro geral de mundos. Também ganhou edição e exclusão de fichas.",
      "Fabula Ultima ganhou ficha, poderes das 15 classes do Livro Básico e das classes dos Atlas, incluindo o Mercador.",
      "Equipamento com armas, armaduras e escudos; afinidades de dano, cálculo de dano recebido e Poderes Heroicos.",
      "Calculadora de rituais para as seis disciplinas mágicas.",
      "As fichas de Fabula Ultima passaram a ficar ligadas à conta, permitindo acessá-las por outros aparelhos.",
      "Correções na conexão com o banco para permitir carregar e salvar os dados com segurança.",
    ],
  },
  {
    data: "2026-08-28", titulo: "Campanhas, compartilhamento e Sistema SAO",
    novidades: [
      "Compartilhamento da ficha por link de leitura e opção de excluir fichas na lista. A opção de compartilhar passou a respeitar a confirmação de quem é o dono.",
      "Campanhas para reunir mestre, jogadores e fichas do mesmo sistema; opções de excluir campanha, remover jogador e sair da mesa preservando as fichas.",
      "Kaizoku no Sho passou a salvar fichas na conta e participar das campanhas do Hub.",
      "Fabula Ultima ganhou inventário com projetos, acessórios e engenhocas, culinária do Gourmet e veículo pessoal do Piloto.",
      "Ficha própria de inimigo e NPC em Fabula Ultima, com catálogo de 108 inimigos e vilões.",
      "Anotações privadas do mestre na campanha e Escudo do Mestre, uma página para consultar regras durante a sessão.",
      "Sistema SAO chegou com classes, poderes, golpes, magias, equipamento, raridade e desgaste dos itens.",
      "SAO também ganhou criação de itens por receita, moedas de ouro e prata, ficha de inimigo, Chefes de Andar e recursos de mundo e mesa.",
      "SAO: registro do corpo real, morte permanente opcional e acompanhamento da falha do chefe. Fichas e campanhas conectadas à conta.",
      "Página de privacidade e liberação do login para qualquer conta Google.",
    ],
  },
  {
    data: "2026-08-29", titulo: "Thrylikí Chelóna e primeiras ferramentas de mesa",
    novidades: [
      "Thrylikí Chelóna chegou com ficha e catálogo de Ramos, as especializações das Áreas de conhecimento.",
      "Recursos de combate para Corpo e Cinética, Simbologia Arcana, Robótica e Engenharia, Botânica e Biomancia, Arte e Expressão, Zoologia e Etologia e outras dez Áreas.",
      "Criação de fórmulas mágicas e poderes livres, técnicas prontas dos 117 Ramos e conjunto inicial de combate para o primeiro ano.",
      "Ficha de inimigo com fases de chefe; Escudo do Mestre com cálculo para montar encontros e apoio às interações sociais.",
      "Inventário, projetos de criação, melhoria e reparo; acompanhamento de pontos de evolução, marcos e ascensões.",
      "Progressão de nível, portfólio, recesso, vida editável, dano e recuperação.",
      "Catálogos opcionais de doenças, demi-humanos e místicos; componentes de robótica, bestiário e metassímbolos para fórmulas mágicas.",
      "Mesa ao Vivo ganhou painel de vida e ordem de iniciativa, para acompanhar quem age em cada turno.",
    ],
  },
  {
    data: "2026-08-30", titulo: "Kaizoku no Sho: encontrar aptidões e subir de nível",
    novidades: ["Busca de aptidões na ficha de Kaizoku no Sho.", "Botão para subir de nível sem precisar procurar todos os campos manualmente."],
  },
  {
    data: "2026-08-31", titulo: "Kaizoku no Sho: ataques prontos",
    novidades: ["Nova aba de ataques prontos.", "Sugestões de ataques a partir das técnicas de Poder do personagem."],
  },
  {
    data: "2026-09-01", titulo: "Chegada da Campanha Livre",
    novidades: [
      "Campanha Livre permite importar atualizações preparadas no ChatGPT e acompanhar personagem e nível.",
      "Abas para missões, personagens do mundo, descobertas, locais, bestiário, conhecimentos, diário e lembretes de regras.",
      "Histórico das mudanças e opção de desfazer, incluindo desfazer uma importação inteira.",
      "Correções na importação para aplicar as informações com mais consistência.",
    ],
  },
  {
    data: "2026-09-03", titulo: "Manuais de regras e criação guiada",
    novidades: [
      "Busca em cada aba da Campanha Livre.",
      "Grimórios de Thrylikí Chelóna, Fabula Ultima e Kaizoku no Sho: manuais de consulta com explicações das regras.",
      "Thrylikí Chelóna ganhou exemplos, caminhos prontos de personagem e links dos campos da ficha para a explicação correspondente no manual.",
      "Criação guiada em Thrylikí Chelóna, SAO, Fabula Ultima e Kaizoku no Sho, com ajuda para preencher a ficha.",
      "Evolução guiada e resumo em página própria para conferir as mudanças ao subir de nível nos quatro sistemas.",
    ],
  },
  {
    data: "2026-09-04", titulo: "Sistema do Sávio e início de D&D",
    novidades: [
      "Sistema do Sávio chegou ao Hub. Mais tarde, recebeu o nome The Celestials.",
      "Ficha com Ascensão, Imersão Espiritual, Invocações, Elemental e evolução guiada.",
      "Cálculos de pontos de atributo, habilidades, perícias e efeitos passivos; correções nos totais e nos bônus aplicados.",
      "Personalização do tema e melhorias nas animações do Sistema do Sávio.",
      "Correção ao criar ficha do Sistema do Sávio pela conta.",
      "D&D 5ª Edição ganhou sua primeira ficha no Hub.",
      "Evolução guiada passou a funcionar em etapas, com mais explicações e escolhas de poderes.",
      "Animações nas quatro fichas anteriores e campos numéricos mais legíveis no Kaizoku no Sho.",
    ],
  },
  {
    data: "2026-09-05", titulo: "Mais opções em D&D e ajustes no Sistema do Sávio",
    novidades: [
      "D&D 5ª Edição ganhou as classes restantes, talentos, antecedentes e subclasses das 12 classes.",
      "Sistema do Sávio: tema aplicado também ao fundo e habilidades sustentadas passaram a aplicar o aumento de dois níveis corretamente.",
      "Avisos para habilidades sustentadas sem dano ou cura, habilidades na aba Combate e ajustes de Fluxo após a Ascensão.",
      "Elemental ganhou escolha de atributo e perícia para seus recursos.",
    ],
  },
  {
    data: "2026-09-06", titulo: "Temas e recursos de navio no Kaizoku no Sho",
    novidades: [
      "Temas personalizáveis em SAO, Fabula Ultima, Thrylikí Chelóna e Kaizoku no Sho.",
      "Kaizoku: aptidões adquiridas com Pontos de Poder e suporte a mais de um Budô ou Akuma no Mi.",
      "Escudo do Mestre do Kaizoku ganhou calculadora de suprimentos e reparo do navio, preços ajustados e estoque com compra e consumo de recursos.",
    ],
  },
  {
    data: "2026-09-08", titulo: "Magias de D&D",
    novidades: ["D&D 5ª Edição ganhou um catálogo de magias para consultar e usar na ficha."],
  },
  {
    data: "2026-09-09", titulo: "D&D guiado e Academia Mágica",
    novidades: [
      "D&D 5ª Edição passou a aparecer como pronto na lista de sistemas e ganhou criação guiada com explicações dos termos do jogo.",
      "Sistema do Sávio ganhou painel de aparência, ajuste do tamanho da fonte e indicação de salvamento.",
      "Academia Mágica na Campanha Livre: compromissos, mural, calendário, horários e tela Agora para acompanhar o momento atual da história.",
      "Locais com mapa revelado por descobertas, oportunidades, relações descritas em palavras e caderno escolar.",
      "Melhorias visuais no quadro de recursos da Campanha Livre e nas animações das fichas de SAO, Fabula Ultima, Thrylikí Chelóna e Kaizoku.",
    ],
  },
  {
    data: "2026-09-10", titulo: "Mais ajuda para preencher as fichas",
    novidades: [
      "Painel de aparência com tema, fonte e indicação de salvamento em SAO, Fabula Ultima, Thrylikí Chelóna e Kaizoku no Sho.",
      "Criação guiada ampliada: poderes e equipamento em Fabula Ultima; habilidades e passivas no Sistema do Sávio; primeiro poder em SAO; fórmulas e poderes em Thrylikí Chelóna; perícias e poder no Kaizoku.",
      "Tutoriais por aba nesses cinco sistemas.",
      "Grimórios do Sistema SAO e da Campanha Livre.",
      "Campanha Livre: importação passou a registrar a Casa dos personagens do mundo e mudanças descritivas nas relações.",
    ],
  },
  {
    data: "2026-09-11", titulo: "Fichas mais personalizáveis e consistentes",
    novidades: [
      "Escolha da fonte dos títulos, disposição compacta e opção de reorganizar ou esconder abas.",
      "Ajustes na ficha padrão de SAO, Sistema do Sávio e Kaizoku para facilitar o uso dos campos de vida e recursos.",
      "Padronização dos recursos de iniciativa, condições, inventário e ataques, incluindo Fabula Ultima, D&D e Campanha Livre.",
    ],
  },
  {
    data: "2026-09-12", titulo: "Correções de perícias e evolução no Sistema do Sávio",
    novidades: [
      "Habilidades podem aplicar bônus de dado ou soma a uma perícia e mostrar sua descrição no Combate.",
      "Correção dos pontos de energia máximos do Combatente para 10 mais 5 por nível.",
      "Correção dos níveis que concedem passivas: 5, 10, 15 e 20.",
    ],
  },
  {
    data: "2026-09-13", titulo: "Sistema do Sávio: combate, monstros e inventário",
    novidades: [
      "Vantagem e desvantagem podem afetar várias perícias; criação guiada inclui perícias e invocação; habilidades podem ser recolhidas para facilitar a leitura.",
      "Ajustes nos traços do Combatente e remoção dos pontos de energia do Elemental. Traços de especialização passaram a ser aplicados automaticamente.",
      "Efeitos de dano, cura, movimento e redução de dano separados; vantagem disponível nos três tipos de habilidade e invocações até nível 7.",
      "Inventário passou a acompanhar peso, e o mestre ganhou criação de fichas de personagem e monstro na campanha.",
      "Ajustes no Arquétipo para evitar atributo repetido, traço de arma do Mestre das Armas e aba Regras.",
      "Valor de Movimento e ficha de monstro com quatro dificuldades.",
      "Custo de energia por nível, nível próprio das passivas, bônus avulsos em perícias e efeitos separados para passivas. Capangas passaram a respeitar a restrição de passivas.",
    ],
  },
  {
    data: "2026-09-17", titulo: "Efeitos personalizados no Sistema do Sávio",
    novidades: [
      "Correções nos cálculos de habilidades, passivas e evolução de nível.",
      "Efeitos personalizados, vida e energia extras, vantagem aplicada ao dano e itens com bônus de perícia ou dano.",
    ],
  },
  {
    data: "2026-09-18", titulo: "Um painel mais útil e sessões organizadas",
    novidades: [
      "O mestre passou a poder editar as fichas dos jogadores de sua campanha.",
      "Cada jogador pode ter duas ou mais fichas na mesma campanha.",
      "Painel inicial com campanhas e fichas recentes, próxima sessão e atalhos.",
      "Campanhas com identidade própria, personagens com imagem e estado, e sistemas favoritos.",
      "Agendamento de sessões e confirmação de presença dos participantes.",
      "Sistema do Sávio: dano desarmado do Combatente, bônus geral de dano e habilidade inata.",
    ],
  },
  {
    data: "2026-09-19", titulo: "Comunicação e Mesa ao Vivo compartilhada",
    novidades: [
      "Chat, avisos, enquetes e notificações para a campanha.",
      "Mesa ao Vivo compartilhada entre os participantes e atalhos de teclado para facilitar o uso.",
      "Convites com código curto e QR Code; correções para evitar problemas na criação desses códigos.",
      "Opções de mover ou copiar personagens entre campanhas de sistemas compatíveis.",
      "Campos personalizados e conquistas da campanha.",
      "Página própria de Sistemas e organização da campanha em abas.",
      "Contador para grupos de inimigos iguais, biblioteca pessoal de personagens do mundo e monstros, e modelos reutilizáveis de ficha.",
      "Cartões de personagem e campanha para compartilhar.",
    ],
  },
  {
    data: "2026-09-24", titulo: "PDF, acesso sem internet e The Celestials",
    novidades: [
      "Grupos, itens, companheiros e veículos passaram a ter recursos próprios no Hub.",
      "Papel de mestre auxiliar para ajudar a administrar a campanha.",
      "Página geral do personagem com QR Code para abrir a ficha.",
      "Opção de instalar o Hub como aplicativo e consultar telas recentes sem internet.",
      "Exportação de ficha em PDF.",
      "Espaço de teste de ficha e combate e prévia das mudanças ao subir de nível.",
      "Sistema do Sávio passou a se chamar The Celestials e ganhou Grimório e quadro de dano padrão dos ataques.",
      "SAO ganhou criação de classe própria, poder livre e seção Seus Itens.",
      "Correções na preparação do banco e reforço da proteção de acesso aos dados.",
    ],
  },
  {
    data: "2026-09-25", titulo: "Chegada de Hogwarts RPG",
    novidades: [
      "Hogwarts RPG chegou com ficha e opções de Casa, Família, origem e varinha.",
      "Bestiário com conhecimento separado por personagem; poções com preparo automático; currículo, progresso escolar e exames N.O.M.s e N.I.E.M.s.",
      "Inventário, itens, relíquias, Galeões e coleção de cartas de Sapos de Chocolate.",
      "Caminhos raros, dons latentes, relações, companheiros, projetos e reputação.",
      "Cultivo de Herbologia, cargos e disciplina.",
      "Modo Sessão do Mestre para acompanhar a mesa. As informações reservadas ao mestre receberam proteção adicional.",
      "Recursos de loja compartilhada e trocas de cartas entre jogadores. O registro do projeto ainda aponta configuração pendente para essas duas funções.",
      "Correções no funcionamento da ficha de Hogwarts, no carregamento das páginas e no acesso do mestre às fichas dos jogadores.",
      "The Celestials: habilidades até nível 7 e bônus de Ascensão que podem se acumular.",
    ],
  },
  {
    data: "2026-09-26", titulo: "Identidade das fichas e transferência de personagem",
    novidades: [
      "Nome e imagem do personagem na aba do navegador, em todos os sistemas.",
      "Novo ícone de dado de vinte lados para o Hub e para o aplicativo instalado.",
      "The Celestials ganhou contador de Guaras, a moeda do sistema, no inventário.",
      "The Celestials: vantagem de habilidade imediata usa um nível acima; passivas podem dar bônus ao dano; bônus de dano do Combatente passa a valer para seus ataques em geral.",
      "Transferência de ficha para outra pessoa da mesma campanha, feita pelo dono ou por um mestre com permissão para editar.",
    ],
  },
  {
    data: "2026-09-27", titulo: "Grimório de Hogwarts e conteúdos do primeiro ano",
    novidades: [
      "Grimório de Hogwarts com 20 seções, exemplos e trilha para iniciantes, acessível pela ficha e pelas páginas de Sistemas e Campanha.",
      "Currículo do primeiro ano ligado à ficha, com catálogo de conteúdos para aprender.",
      "Recursos para o jogador acompanhar seus conteúdos e para o mestre administrar o currículo.",
      "Proteção da progressão para impedir alterações que o jogador não tem permissão para fazer.",
    ],
  },
  {
    data: "2026-09-29", titulo: "Hogwarts: formação inicial mais confiável",
    novidades: [
      "Correção da escolha de conteúdos na formação inicial: a seleção aparece e os quatro conteúdos iniciais são salvos.",
      "A conclusão da formação inicial é preservada ao voltar à ficha.",
      "Aviso quando o currículo não pode ser carregado, em vez de deixar a falha sem explicação.",
      "Ajuste para evitar alterações desnecessárias nos conteúdos ao abrir a ficha.",
    ],
  },
  {
    data: "2026-10-02", titulo: "Uma aba para acompanhar as atualizações",
    novidades: [
      "Nova aba Atualizações no menu do Hub, com o histórico desde o começo do projeto.",
      "Novidades organizadas por data e explicadas em linguagem simples.",
      "Busca por assunto e opção de ler das mais recentes às mais antigas ou desde o começo.",
    ],
  },
];
