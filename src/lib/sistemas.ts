/*
  Os sistemas de regras do Hub (decisão #35).

  Cada um aponta para a ficha que já existe. Hoje as fichas são páginas
  autônomas que salvam no navegador; a migração para dentro do Hub, com login
  e banco, é o passo seguinte (decisão #38).
*/
export type Sistema = {
  chave: string;
  nome: string;
  descricao: string;
  ficha: string | null;
  situacao: "pronta" | "em-construcao" | "planejada";
  /*
    Se o arquivo da ficha entende o `?id=` da URL e salva sozinho na conta
    (o "Modo Hub" que o Fabula Ultima ganhou primeiro, e o Kaizoku no Sho
    ganhou em seguida). Sem isso, criar uma linha no banco pra esse sistema
    resultaria numa ficha que nunca salva nada ali — por isso ele não entra
    nem em "+ Criar ficha" nem como opção de campanha.
  */
  salvaNoHub: boolean;
  /*
    Arquivo da ficha de INIMIGO/NPC desse sistema, bem diferente da ficha de
    jogador (sem classes nem poderes de catálogo — nível/espécie, atributos,
    e ataques/feitiços/regras como texto livre, igual o Bestiário do livro).
    null pra sistema que ainda não tem essa ficha própria; o botão "+
    Adicionar ficha de inimigo" da campanha só aparece quando isto existe.
  */
  fichaInimigo: string | null;
  /*
    Página de referência rápida de regras (o Escudo do Mestre) — ações do
    conflito, níveis de dificuldade, testes em grupo/opostos, oportunidades.
    Mesmo conteúdo pra qualquer campanha do sistema, por isso é estático e
    não muda por campanha. null pra sistema sem essa referência ainda.
  */
  escudoMestre: string | null;
  /*
    Onde, dentro do `dados` de uma ficha de INIMIGO deste sistema, mora o
    número de vida atual "de verdade" — o mesmo que a ficha lê ao abrir.
    Cada ficha já espelha vida atual/máxima num campo genérico `resumoVida`
    a cada salvamento (decisão #46), e é só nele que o Painel de Vida da
    Mesa ao Vivo lê. Mas ajustar vida ali sem escrever também no campo de
    verdade deixaria a ficha aberta depois mostrando um número velho — por
    isso o Hub, quando o mestre ajusta um inimigo pelo painel, escreve nos
    dois lugares. null pra sistema sem ficha de inimigo própria.
  */
  campoVidaInimigo: string[] | null;
  /*
    Grimório — manual do jogador explicando o sistema inteiro (o que cada
    peça faz, como funciona, como aprender). Mesmo conteúdo pra qualquer
    campanha do sistema, por isso é estático como o Escudo do Mestre.
    null pra sistema que ainda não tem grimório (decisão #26: uma fatia
    por vez — cada sistema ganha o dele quando for a vez dele).
  */
  grimorio: string | null;
  /*
    Modo Sessão do Mestre (decisão #161) — painel próprio do sistema pra
    ações em lote na campanha inteira (aplicar condição em vários
    personagens de uma vez, por exemplo), lido via `?campanha=<id>` (mesmo
    padrão do `?id=` da ficha). Diferente de Escudo do Mestre/Grimório,
    que são estáticos: este painel busca e edita fichas de verdade da
    campanha, então só é oferecido a quem já é mestre dela (checado no
    próprio HTML pelas mesmas rotas que a ficha usa). null pra sistema sem
    esse painel ainda.
  */
  modoSessao: string | null;
  /*
    Módulos da ficha que merecem link direto na página da campanha —
    decisão #168. Sem isto, mestre e jogador só alcançam Conteúdos,
    Acadêmico, Inventário etc. abrindo a ficha e clicando manualmente na
    aba certa; com isto, a campanha mostra um atalho por módulo que já
    abre direto nela (`?id=<personagem>&aba=<id>`, que a ficha precisa
    entender). `id` tem que bater exatamente com o `data-aba` que a
    própria ficha usa — não tem checagem cruzada automática entre os
    dois arquivos, então ao renomear uma aba na ficha, atualize aqui
    também. undefined/[] pra sistema sem esse recorte ainda (fica só
    com o link de abrir a ficha inteira, como sempre foi).
  */
  modulosFicha?: { id: string; rotulo: string }[];
};

export const SISTEMAS: Sistema[] = [
  {
    chave: "kaizoku-no-sho",
    nome: "Kaizoku no Sho",
    descricao:
      "Homebrew de One Piece, adaptação do Shinobi no Sho. Livro Base e Expansão.",
    ficha: "/kaizoku-no-sho.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: null,
    escudoMestre: "/kaizoku-no-sho-escudo-mestre.html",
    campoVidaInimigo: null,
    grimorio: "/kaizoku-no-sho-grimorio.html",
    modoSessao: null,
  },
  {
    chave: "fabula-ultima",
    nome: "Fabula Ultima",
    descricao:
      "TTJRPG inspirado em JRPGs. Livro Básico e os três Atlas.",
    ficha: "/fabula-ultima.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: "/fabula-ultima-inimigo.html",
    escudoMestre: "/fabula-ultima-escudo-mestre.html",
    campoVidaInimigo: ["pvAtual"],
    grimorio: "/fabula-ultima-grimorio.html",
    modoSessao: null,
  },
  {
    chave: "sao",
    nome: "Sistema SAO",
    descricao:
      "Homebrew original inspirado em Sword Art Online, Overgeared e Shangri-La Frontier — o personagem sabe que está num jogo.",
    ficha: "/sao.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: "/sao-inimigo.html",
    escudoMestre: "/sao-escudo-mestre.html",
    campoVidaInimigo: ["atual", "pv"],
    grimorio: "/sao-grimorio.html",
    modoSessao: null,
  },
  {
    chave: "dnd-5e",
    nome: "D&D 5ª Edição",
    descricao:
      "O TTRPG mais tradicional. As 12 classes completas com arquétipos, 9 raças, talentos, antecedentes e catálogo de magias — falta ficha de inimigo e Escudo do Mestre.",
    ficha: "/dnd-5e.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: null,
    escudoMestre: null,
    campoVidaInimigo: null,
    grimorio: null,
    modoSessao: null,
  },
  {
    chave: "campanha-livre",
    nome: "Campanha Livre",
    descricao:
      "Campanhas narradas livremente (ChatGPT como Mestre, geralmente solo) — sem um livro de regras fechado. Editada principalmente colando o que o ChatGPT escreveu.",
    ficha: "/campanha-livre",
    situacao: "em-construcao",
    salvaNoHub: true,
    fichaInimigo: null,
    escudoMestre: null,
    campoVidaInimigo: null,
    grimorio: "/campanha-livre-grimorio.html",
    modoSessao: null,
  },
  {
    chave: "sistema-do-savio",
    nome: "The Celestials",
    descricao:
      "Homebrew de um amigo do Zé — Habilidades livres desenhadas pelo próprio jogador, com tabela de bônus por Nível como guia.",
    ficha: "/sistema-do-savio.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: "/sistema-do-savio-inimigo.html",
    escudoMestre: null,
    campoVidaInimigo: ["atual", "pv"],
    grimorio: "/sistema-do-savio-grimorio.html",
    modoSessao: null,
  },
  {
    chave: "hogwarts-rpg",
    nome: "Hogwarts RPG",
    descricao:
      "Homebrew do Zé sem classes: Atributos + Perícias + Conteúdos + Casa + Família + Origem + Varinha. Chassi completo: ficha, Modo Sessão do Mestre e Loja ao vivo.",
    ficha: "/hogwarts-rpg.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: null,
    escudoMestre: null,
    campoVidaInimigo: null,
    grimorio: null,
    modoSessao: "/hogwarts-rpg-mestre.html",
    modulosFicha: [
      { id: "familia", rotulo: "Casa & Família" },
      { id: "conteudos", rotulo: "Conteúdos" },
      { id: "academico", rotulo: "Acadêmico" },
      { id: "criaturas", rotulo: "Bestiário" },
      { id: "pocoes", rotulo: "Poções" },
      { id: "inventario", rotulo: "Inventário & Relíquias" },
      { id: "social", rotulo: "Relações & Projetos" },
      { id: "colecao", rotulo: "Sapos de Chocolate & Trocas" },
      { id: "loja", rotulo: "Loja" },
    ],
  },
  {
    chave: "thryliki-chelona",
    nome: "Thrylikí Chelóna",
    descricao:
      "Homebrew do Zé sobre uma escola de heróis — atributos por Grau, Ano e Nível como progressões separadas, dezesseis Áreas de Estudo.",
    ficha: "/thryliki-chelona.html",
    situacao: "pronta",
    salvaNoHub: true,
    fichaInimigo: "/thryliki-chelona-inimigo.html",
    escudoMestre: "/thryliki-chelona-escudo-mestre.html",
    campoVidaInimigo: ["atual", "pv"],
    grimorio: "/thryliki-chelona-grimorio.html",
    modoSessao: null,
  },
];

// Sistemas onde dá pra criar ficha pela conta (usada em "+ Criar ficha" e na
// criação de campanha) — precisa ter arquivo de ficha E saber salvar no Hub.
export const SISTEMAS_COM_HUB = SISTEMAS.filter(
  (sistema): sistema is Sistema & { ficha: string } =>
    sistema.ficha !== null && sistema.salvaNoHub,
);

// Sistemas onde dá pra criar ficha de NPC/monstro AVULSA pela conta (decisão
// #143, ideias #64/#65/#66 — biblioteca pessoal e templates reutilizáveis) —
// precisa ter arquivo de ficha de inimigo E saber salvar no Hub, mesma
// exigência de `SISTEMAS_COM_HUB` só que pro bestiário.
export const SISTEMAS_COM_BESTIARIO = SISTEMAS.filter(
  (sistema): sistema is Sistema & { fichaInimigo: string } =>
    sistema.fichaInimigo !== null && sistema.salvaNoHub,
);

export const ROTULO_SITUACAO: Record<Sistema["situacao"], string> = {
  pronta: "Pronta",
  "em-construcao": "Em construção",
  planejada: "Planejada",
};
