"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Entrar com o código curto de convite (decisão #138) — alternativa ao
  link completo pra quem recebeu o código de viva voz ou por mensagem
  curta. Resolve o código pro id da campanha e manda direto pra lá; a
  própria página da campanha decide o que fazer a partir daí (mostrar
  convite, escolher ficha, etc.), igual já faz pra quem abre o link.
*/
export function EntrarComCodigo() {
  const roteador = useRouter();
  const [codigo, setCodigo] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    const valor = codigo.trim();
    if (!valor) return;
    setEntrando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/campanhas/codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: valor }),
      });
      if (!resposta.ok) {
        setErro("Código não encontrado. Confere se digitou certo.");
        return;
      }
      const { campanhaId } = (await resposta.json()) as { campanhaId: string };
      roteador.push(`/campanhas/${campanhaId}`);
    } catch {
      setErro("Não consegui procurar o código agora. Tenta de novo.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-borda bg-superficie p-5">
      <p className="font-titulo text-sm text-texto-suave">Tem um código de convite?</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") entrar();
          }}
          placeholder="Ex.: 7K3PQR"
          maxLength={6}
          className="min-w-[140px] flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm uppercase tracking-widest"
        />
        <button
          type="button"
          onClick={entrar}
          disabled={entrando || !codigo.trim()}
          className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
        >
          {entrando ? "Procurando…" : "Entrar"}
        </button>
      </div>
      {erro && <p className="mt-3 text-sm text-segredo">{erro}</p>}
    </div>
  );
}
