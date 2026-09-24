"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Sandbox de ficha temporário (decisão #152, ideia #121) — "e se eu
  tivesse pego essa perícia em vez daquela?" sem arriscar a ficha de
  verdade. Reaproveita a mesma cópia da decisão #139 (uma ficha nova, com
  os mesmos dados, dona continua sendo a mesma pessoa) — só marcada
  "(sandbox)" em vez de "(cópia)" e sempre avulsa, nunca numa campanha.
  Testar é abrir o sandbox e mexer à vontade; terminar é "Excluir",
  igual qualquer outra ficha — não tem limpeza automática.
*/
export function CriarSandbox({ personagemId }: { personagemId: string }) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar() {
    setCriando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/personagens/${personagemId}/copiar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sandbox: true }),
      });
      if (!resposta.ok) throw new Error("falhou");
      const { personagem } = await resposta.json();
      roteador.push(`/fichas/${personagem.id}`);
    } catch {
      setErro("Não consegui criar o sandbox agora. Tenta de novo.");
      setCriando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={criar}
        disabled={criando}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto disabled:opacity-50"
      >
        {criando ? "Criando…" : "🧪 Criar sandbox pra testar"}
      </button>
      {erro && <p className="mt-1 text-xs text-segredo">{erro}</p>}
    </div>
  );
}
