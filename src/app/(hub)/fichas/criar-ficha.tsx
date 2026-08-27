"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SISTEMAS } from "@/lib/sistemas";

// Só faz sentido criar ficha de um sistema que já tem arquivo pra abrir.
const sistemasComFicha = SISTEMAS.filter(
  (sistema): sistema is typeof sistema & { ficha: string } => sistema.ficha !== null,
);

/*
  Botão "+ Criar ficha" da decisão #43: escolhe o sistema, cria a linha no
  banco e já abre a ficha em branco pronta pra editar.
*/
export function CriarFicha() {
  const roteador = useRouter();
  const [sistemaChave, setSistemaChave] = useState(sistemasComFicha[0]?.chave ?? "");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar() {
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/personagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sistemaChave }),
      });
      if (!resposta.ok) throw new Error("falhou");

      const { personagem } = (await resposta.json()) as { personagem: { id: string } };
      const sistema = sistemasComFicha.find((s) => s.chave === sistemaChave)!;
      roteador.push(`${sistema.ficha}?id=${personagem.id}`);
    } catch {
      setErro("Não consegui criar a ficha agora. Tenta de novo.");
      setCriando(false);
    }
  }

  if (!sistemasComFicha.length) return null;

  return (
    <div className="mt-8 rounded-lg border border-borda bg-superficie p-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sistemaChave}
          onChange={(evento) => setSistemaChave(evento.target.value)}
          className="rounded border border-borda bg-fundo px-3 py-2 text-sm"
        >
          {sistemasComFicha.map((sistema) => (
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
          {criando ? "Criando…" : "+ Criar ficha"}
        </button>
      </div>
      {erro && <p className="mt-3 text-sm text-segredo">{erro}</p>}
    </div>
  );
}
