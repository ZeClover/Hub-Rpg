import type { NomeIcone } from "@/components/hub/icone";

export type VisualSistema = {
  imagem: string;
  icone: NomeIcone;
  tema: string;
  frase: string;
};
export const VISUAIS: Record<string, VisualSistema> = {
  "kaizoku-no-sho": {
    imagem: "kaizoku",
    icone: "ancora",
    tema: "Mar e aventura",
    frase: "Trace sua rota. Encontre sua tripulação.",
  },
  "fabula-ultima": {
    imagem: "fabula",
    icone: "magia",
    tema: "Fantasia e JRPG",
    frase: "Grandes jornadas começam com um vínculo.",
  },
  sao: {
    imagem: "sao",
    icone: "escudo",
    tema: "Fantasia digital",
    frase: "Um novo andar. Uma nova conquista.",
  },
  "dnd-5e": {
    imagem: "dnd",
    icone: "dados",
    tema: "Fantasia medieval",
    frase: "Heróis, ruínas e histórias para contar.",
  },
  "campanha-livre": {
    imagem: "livre",
    icone: "campanha",
    tema: "Narrativa livre",
    frase: "Seu mundo. Suas escolhas. Sua história.",
  },
  "sistema-do-savio": {
    imagem: "celestials",
    icone: "estrela",
    tema: "Poderes e ascensão",
    frase: "Dê forma ao seu poder.",
  },
  "hogwarts-rpg": {
    imagem: "hogwarts",
    icone: "magia",
    tema: "Escola de magia",
    frase: "Toda descoberta começa com curiosidade.",
  },
  "thryliki-chelona": {
    imagem: "thryliki",
    icone: "coroa",
    tema: "Academia de heróis",
    frase: "Aprenda. Transforme-se. Deixe sua marca.",
  },
};
export function visualSistema(chave: string): VisualSistema {
  return VISUAIS[chave] ?? VISUAIS["campanha-livre"];
}
export function capaSistema(chave: string) {
  return `/imagens/sistemas/${visualSistema(chave).imagem}.webp`;
}
export type ImagemPronta = {
  url: string;
  nome: string;
  tipo: "retrato" | "banner";
  sistema?: string;
};
export const IMAGENS_PRONTAS: ImagemPronta[] = [
  ...Object.entries(VISUAIS).map(([sistema, v]) => ({
    url: capaSistema(sistema),
    nome: v.tema,
    tipo: "banner" as const,
    sistema,
  })),
  ...[
    "Exploradora da chuva",
    "Feiticeira do lago",
    "Guerreiro do crepúsculo",
    "Rainha celeste",
    "Aventureira arcana",
    "Viajante da cidade",
    "Maga solar",
    "Dragão viajante",
  ].map((nome, i) => ({
    url: `/imagens/retratos/retrato-${i + 1}.webp`,
    nome,
    tipo: "retrato" as const,
  })),
];
const RETRATOS_ARTISTAS = [
  {
    url: "/imagens/retratos/revoy-1.webp",
    nome: "Pepper · David Revoy",
    tipo: "retrato" as const,
  },
  {
    url: "/imagens/retratos/revoy-2.webp",
    nome: "Shichimi · David Revoy",
    tipo: "retrato" as const,
  },
  {
    url: "/imagens/retratos/revoy-3.webp",
    nome: "Rainha do Fogo · David Revoy",
    tipo: "retrato" as const,
  },
  {
    url: "/imagens/retratos/revoy-4.webp",
    nome: "Rainha do Caos · David Revoy",
    tipo: "retrato" as const,
  },
];
IMAGENS_PRONTAS.push(...RETRATOS_ARTISTAS);

export function retratoPadrao(nome: string) {
  const indice =
    Array.from(nome).reduce((n, letra) => n + (letra.codePointAt(0) ?? 0), 0) %
    8;
  return `/imagens/retratos/retrato-${indice + 1}.webp`;
}
export const ROTULOS_PAPEL: Record<string, string> = {
  MESTRE: "Mestre",
  MESTRE_AUXILIAR: "Mestre auxiliar",
  JOGADOR: "Jogador",
};

export const CAPAS_VERTICAIS = new Set(["fabula-ultima", "dnd-5e", "sao"]);
export const CAPAS_ORIGINAIS: Record<string, string> = {
  sao: "/imagens/capas/sao.webp",
  "hogwarts-rpg": "/imagens/capas/hogwarts.webp",
  "fabula-ultima": "/imagens/capas/fabula-ultima.webp",
  "dnd-5e": "/imagens/capas/dnd-5e.webp",
  "kaizoku-no-sho": "/imagens/capas/kaizoku-no-sho.webp",
};
export function capaCatalogo(chave: string) {
  return CAPAS_ORIGINAIS[chave] ?? capaSistema(chave);
}
