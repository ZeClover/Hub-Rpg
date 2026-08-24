"use client";

import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

/*
  Único pedaço da tela de login que roda no navegador: o clique precisa abrir a
  janela do Google, e isso só acontece do lado de cá.
*/
export function BotaoGoogle() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrarComGoogle() {
    setCarregando(true);
    setErro(null);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErro("Não foi possível abrir a tela do Google. Tente de novo.");
      setCarregando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={entrarComGoogle}
        disabled={carregando}
        className="mt-8 rounded-lg border border-ambar/40 bg-ambar/10 px-5 py-3 font-titulo text-base text-ambar-forte transition hover:bg-ambar/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? "Abrindo o Google…" : "Entrar com Google"}
      </button>

      {erro && (
        <p role="alert" className="mt-4 text-sm text-texto-suave">
          {erro}
        </p>
      )}
    </>
  );
}
