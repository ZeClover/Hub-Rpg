import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

// Cinzel nos títulos dá o ar de inscrição em pedra sem virar fonte
// "medieval de festa junina"; Inter no corpo mantém a leitura fácil no
// celular, que é onde o Hub vai ser mais usado.
const fonteTitulo = Cinzel({
  variable: "--fonte-titulo",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const fonteCorpo = Inter({
  variable: "--fonte-corpo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub RPG",
  description:
    "Os universos, as mesas e as fichas do Zé — Darkrem, Ometion e o que vier.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTitulo.variable} ${fonteCorpo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
