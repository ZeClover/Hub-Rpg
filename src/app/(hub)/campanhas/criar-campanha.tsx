"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SISTEMAS_COM_HUB } from "@/lib/sistemas";

/*
  Criar campanha: escolhe o sistema e dá um nome pra mesa. Quem cria já
  nasce mestre dela (a API decide isso, não esta tela).
*/
export function CriarCampanha() {
  const roteador = useRouter();
  const [sistemaChave, setSistemaChave] = useState(SISTEMAS_COM_HUB[0]?.chave ?? "");
  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar() {
    if (!nome.trim()) {
      setErro("Dá um nome pra campanha primeiro.");
      return;
    }
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sistemaChave, nome: nome.trim() }),
      });
      if (!resposta.ok) throw new Error("falhou");

      const { campanha } = (await resposta.json()) as { campanha: { id: string } };
      roteador.push(`/campanhas/${campanha.id}`);
    } catch {
      setErro("Não consegui criar a campanha agora. Tenta de novo.");
      setCriando(false);
    }
  }

  if (!SISTEMAS_COM_HUB.length) return null;

  return (
    <div className="mt-8 rounded-lg border border-borda bg-superficie p-5">
      <p className="font-titulo text-sm text-texto-suave">Criar campanha</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Nome da mesa"
          className="min-w-[180px] flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm"
        />
        <select
          value={sistemaChave}
          onChange={(evento) => setSistemaChave(evento.target.value)}
          className="rounded border border-borda bg-fundo px-3 py-2 text-sm"
        >
          {SISTEMAS_COM_HUB.map((sistema) => (
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
          {criando ? "Criando…" : "+ Criar campanha"}
        </button>
      </div>
      {erro && <p className="mt-3 text-sm text-segredo">{erro}</p>}
    </div>
  );
}
