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
};

export const SISTEMAS: Sistema[] = [
  {
    chave: "kaizoku-no-sho",
    nome: "Kaizoku no Sho",
    descricao:
      "Homebrew de One Piece, adaptação do Shinobi no Sho. Livro Base e Expansão.",
    ficha: "/kaizoku-no-sho.html",
    situacao: "pronta",
  },
  {
    chave: "fabula-ultima",
    nome: "Fabula Ultima",
    descricao:
      "TTJRPG inspirado em JRPGs. Livro Básico e os três Atlas.",
    ficha: "/fabula-ultima.html",
    situacao: "em-construcao",
  },
  {
    chave: "sao",
    nome: "Sistema SAO",
    descricao: "Homebrew inspirado em Sword Art Online.",
    ficha: null,
    situacao: "planejada",
  },
  {
    chave: "thryliki-chelona",
    nome: "Thrylikí Chelóna",
    descricao: "Homebrew do Zé.",
    ficha: null,
    situacao: "planejada",
  },
];

export const ROTULO_SITUACAO: Record<Sistema["situacao"], string> = {
  pronta: "Pronta",
  "em-construcao": "Em construção",
  planejada: "Planejada",
};
