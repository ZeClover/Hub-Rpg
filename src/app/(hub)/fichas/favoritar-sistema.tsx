"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Favoritar sistema (decisão #134) — preferência da conta, não do
  navegador (por isso vai pro banco, não localStorage). Favoritos aparecem
  primeiro na lista de sistemas (ordenados na própria página, servidor).
*/
export function FavoritarSistema({
  chave,
  favoritoInicial,
}: {
  chave: string;
  favoritoInicial: boolean;
}) {
  const roteador = useRouter();
  const [favorito, setFavorito] = useState(favoritoInicial);
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    const novoValor = !favorito;
    setFavorito(novoValor);
    setSalvando(true);
    try {
      const resposta = await fetch("/api/usuario/favoritos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave, favorito: novoValor }),
      });
      if (resposta.ok) {
        roteador.refresh();
      } else {
        setFavorito(!novoValor);
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={salvando}
      title={favorito ? "Remover dos favoritos" : "Favoritar"}
      className={
        favorito
          ? "text-ambar-forte disabled:opacity-50"
          : "text-texto-suave hover:text-ambar-forte disabled:opacity-50"
      }
    >
      {favorito ? "★" : "☆"}
    </button>
  );
}
