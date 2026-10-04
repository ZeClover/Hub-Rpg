import type { Metadata } from "next";
import { atualizacoes } from "@/lib/atualizacoes";
import { HistoricoAtualizacoes } from "./historico-atualizacoes";

export const metadata: Metadata = { title: "Atualizações | Hub RPG" };

export default function PaginaAtualizacoes() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <header className="hub-page-heading"><div><p className="hub-eyebrow">O Hub continua crescendo</p><h1>Atualizações</h1><p>Novas ferramentas, melhorias e correções para quem joga e para quem mestra.</p></div></header>
      <HistoricoAtualizacoes atualizacoes={atualizacoes} />
    </main>
  );
}
