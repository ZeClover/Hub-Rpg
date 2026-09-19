"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SISTEMAS_COM_BESTIARIO } from "@/lib/sistemas";

/*
  "+ Criar NPC/Monstro" (decisão #143, ideias #64/#65/#66) — irmão de
  CriarFicha, só que pro bestiário: nasce avulsa (sem campanha), pronta
  pra servir de template. Pra usar de verdade numa mesa, é só "Copiar"
  (decisão #139) pra dentro da campanha quando a hora chegar — a original
  continua limpa, reaproveitável de novo depois.
*/
export function CriarNpc() {
  const roteador = useRouter();
  const [sistemaChave, setSistemaChave] = useState(SISTEMAS_COM_BESTIARIO[0]?.chave ?? "");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar() {
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/personagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sistemaChave, ehMonstro: true }),
      });
      if (!resposta.ok) throw new Error("falhou");

      const { personagem } = (await resposta.json()) as { personagem: { id: string } };
      const sistema = SISTEMAS_COM_BESTIARIO.find((s) => s.chave === sistemaChave)!;
      roteador.push(`${sistema.fichaInimigo}?id=${personagem.id}`);
    } catch {
      setErro("Não consegui criar a ficha agora. Tenta de novo.");
      setCriando(false);
    }
  }

  if (!SISTEMAS_COM_BESTIARIO.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-borda bg-superficie p-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sistemaChave}
          onChange={(evento) => setSistemaChave(evento.target.value)}
          className="rounded border border-borda bg-fundo px-3 py-2 text-sm"
        >
          {SISTEMAS_COM_BESTIARIO.map((sistema) => (
            <option key={sistema.chave} value={sistema.chave}>
              {sistema.nome}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={criar}
          disabled={criando}
          className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
        >
          {criando ? "Criando…" : "+ Criar NPC/Monstro"}
        </button>
      </div>
      {erro && <p className="mt-3 text-sm text-segredo">{erro}</p>}
    </div>
  );
}
