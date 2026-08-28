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
  },
  {
    chave: "fabula-ultima",
    nome: "Fabula Ultima",
    descricao:
      "TTJRPG inspirado em JRPGs. Livro Básico e os três Atlas.",
    ficha: "/fabula-ultima.html",
    situacao: "em-construcao",
    salvaNoHub: true,
  },
  {
    chave: "sao",
    nome: "Sistema SAO",
    descricao: "Homebrew inspirado em Sword Art Online.",
    ficha: null,
    situacao: "planejada",
    salvaNoHub: false,
  },
  {
    chave: "thryliki-chelona",
    nome: "Thrylikí Chelóna",
    descricao: "Homebrew do Zé.",
    ficha: null,
    situacao: "planejada",
    salvaNoHub: false,
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
