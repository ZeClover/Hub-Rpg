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
    escudoMestre: null,
    campoVidaInimigo: null,
    grimorio: "/kaizoku-no-sho-grimorio.html",
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
    grimorio: null,
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
    grimorio: null,
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
  },
];

// Sistemas onde dá pra criar ficha pela conta (usada em "+ Criar ficha" e na
// criação de campanha) — precisa ter arquivo de ficha E saber salvar no Hub.
export const SISTEMAS_COM_HUB = SISTEMAS.filter(
  (sistema): sistema is Sistema & { ficha: string } =>
    sistema.ficha !== null && sistema.salvaNoHub,
);

export const ROTULO_SITUACAO: Record<Sistema["situacao"], string> = {
  pronta: "Pronta",
  "em-construcao": "Em construção",
  planejada: "Planejada",
};
