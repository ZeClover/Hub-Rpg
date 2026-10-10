"use client";

import { useState, type FormEvent } from "react";

export function DeclararIniciativa({ id, permitido, pendente }: {
  id: string; permitido: boolean; pendente: () => boolean;
}) {
  const [resultado, setResultado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!permitido || enviando) return;
    const valor = Number(resultado);
    if (!resultado.trim() || !Number.isInteger(valor) || Math.abs(valor) > 1000) {
      setMensagem("Informe um resultado final inteiro entre -1000 e 1000."); return;
    }
    if (pendente()) { setMensagem("Aguarde a ficha ser salva antes de enviar a iniciativa."); return; }
    setEnviando(true);
    setMensagem("Enviando iniciativa…");
    try {
      const resposta = await fetch(`/api/personagens/${encodeURIComponent(id)}/iniciativa`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resultado: valor }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro || "Não foi possível enviar. Tente novamente.");
      setMensagem(`Iniciativa enviada: ${corpo.declaracao.nome} — ${corpo.declaracao.resultado}`);
    } catch (erro) { setMensagem(erro instanceof Error ? erro.message : "Não foi possível enviar. Tente novamente."); }
    finally { setEnviando(false); }
  }
  return <details className="sem-impressao mt-6 rounded-lg border border-borda bg-superficie p-4">
    <summary className="cursor-pointer font-semibold">Declarar iniciativa na Mesa</summary>
    <p className="my-3 text-sm text-texto-suave">Informe o resultado final obtido fora do Hub, incluindo os modificadores da sua ficha.</p>
    <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
      <label className="text-sm">Resultado final
        <input type="number" step="1" min="-1000" max="1000" required value={resultado}
          onChange={e => setResultado(e.target.value)} disabled={!permitido || enviando}
          className="block min-h-11 max-w-full rounded border border-borda bg-fundo px-3 py-2" />
      </label>
      <button disabled={!permitido || enviando} className="min-h-11 rounded border border-borda px-3 py-2 disabled:opacity-50">Enviar iniciativa</button>
    </form>
    <p role="status" aria-live="polite" className="mt-3 text-sm">{permitido ? mensagem : "Disponível para sua própria ficha vinculada a uma campanha."}</p>
  </details>;
}
