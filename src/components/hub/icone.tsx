import type { SVGProps } from "react";

const caminhos = {
  sino: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  dados: "m12 2 9 5v10l-9 5-9-5V7Zm0 0v20M3 7l9 5 9-5M3 17l9-5 9 5",
  painel: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  personagem:
    "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  campanha: "m3 3 7 3 4-3 7 3v15l-7-3-4 3-7-3Zm7 3v15M14 3v15",
  livro:
    "M12 5c-3-2-7-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v15",
  bolsa: "M6 7h12l3 14H3ZM9 7V5a3 3 0 0 1 6 0v2",
  novidades: "M4 3h16v18H4Zm4 4h8M8 11h8M8 15h5",
  busca: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  filtro: "M3 4h18l-7 8v7l-4 2V12Z",
  mais: "M5 11v2M12 11v2M19 11v2",
  seta: "M5 12h14m-6-6 6 6-6 6",
  voltar: "M19 12H5m6-6-6 6 6 6",
  grade: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  lista: "M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1",
  calendario: "M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16",
  escudo: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z",
  estrela: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
  imagem: "M3 3h18v18H3Zm0 14 6-6 4 4 3-3 5 5M9 7h.01",
  enviar: "M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6",
  fechar: "m6 6 12 12M6 18 18 6",
  coroa: "m2 7 5 3 5-7 5 7 5-3-3 13H5Z",
  sol: "M12 3V1M12 23v-2M3 12H1m22 0h-2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  magia: "m3 21 12-12M14 5l5 5M5 3v4M3 5h4M19 15v6m-3-3h6M17 1v4m-2-2h4",
  ancora:
    "M12 3v18M3 12c0 5 4 9 9 9s9-4 9-9M3 12l-2 3M21 12l2 3M7 8h10M14 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
} as const;

export type NomeIcone = keyof typeof caminhos;
export function Icone({
  nome,
  ...props
}: SVGProps<SVGSVGElement> & { nome: NomeIcone }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={caminhos[nome]} />
    </svg>
  );
}
