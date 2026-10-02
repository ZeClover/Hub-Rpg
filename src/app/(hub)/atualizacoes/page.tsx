import type { Metadata } from "next";
import { atualizacoes } from "@/lib/atualizacoes";
import { HistoricoAtualizacoes } from "./historico-atualizacoes";

export const metadata: Metadata = { title: "Atualizações | Hub RPG" };

export default function PaginaAtualizacoes() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <p className="font-titulo text-xs uppercase tracking-[0.25em] text-ambar">O que mudou no Hub</p>
      <h1 className="mt-3 font-titulo text-3xl">Atualizações</h1>
      <p className="mt-4 text-texto-suave">Novas ferramentas, melhorias e correções, explicadas para quem joga e para quem mestra.</p>
      <p className="mt-2 text-sm text-texto-suave">As datas seguem o registro das mudanças no projeto. Mudanças do mesmo dia estão agrupadas; a entrada no ar pode ter ocorrido depois.</p>
      <HistoricoAtualizacoes atualizacoes={atualizacoes} />
    </main>
  );
}
