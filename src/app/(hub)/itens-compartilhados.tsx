"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Gerenciador genérico de itens (decisão #147, ideias #59/#60/#61/#63) —
  usado tanto pro cofre da campanha quanto pro inventário de um grupo quanto
  pra biblioteca pessoal e pros itens de uma ficha. Sempre a mesma
  interface: criar, ajustar quantidade, apagar, mover pra outro local. Nunca
  sabe nada sobre o formato de ficha de sistema nenhum (decisão #17).
*/

export type ItemView = {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
};

export type LocalItem = {
  donoId?: string;
  personagemId?: string;
  grupoId?: string;
  campanhaId?: string;
};

export function GerenciadorItens({
  titulo,
  itens,
  criarLocal,
  destinos,
  podeGerenciar,
}: {
  titulo: string;
  itens: ItemView[];
  criarLocal: LocalItem;
  destinos: { rotulo: string; local: LocalItem }[];
  podeGerenciar: boolean;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [publicando, setPublicando] = useState(false);

  async function criar() {
    if (!nome.trim()) return;
    setPublicando(true);
    try {
      const resposta = await fetch("/api/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), ...criarLocal }),
      });
      if (resposta.ok) {
        setNome("");
        setCriando(false);
        roteador.refresh();
      }
    } finally {
      setPublicando(false);
    }
  }

  if (itens.length === 0 && !podeGerenciar) return null;

  return (
    <div className="rounded-lg border border-borda bg-superficie p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-titulo text-sm">{titulo}</h3>
        {podeGerenciar && !criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Item
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome do item"
            className="min-w-[140px] flex-1 rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto"
          />
          <button
            type="button"
            onClick={criar}
            disabled={publicando || !nome.trim()}
            className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
          >
            {publicando ? "Criando…" : "Criar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCriando(false);
              setNome("");
            }}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
          >
            Cancelar
          </button>
        </div>
      )}

      {itens.length === 0 ? (
        <p className="mt-2 text-sm text-texto-suave">Vazio.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {itens.map((item) => (
            <ItemLinha
              key={item.id}
              item={item}
              destinos={destinos}
              podeGerenciar={podeGerenciar}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemLinha({
  item,
  destinos,
  podeGerenciar,
}: {
  item: ItemView;
  destinos: { rotulo: string; local: LocalItem }[];
  podeGerenciar: boolean;
}) {
  const roteador = useRouter();
  const [processando, setProcessando] = useState(false);
  const [movendo, setMovendo] = useState(false);

  async function ajustarQuantidade(delta: number) {
    setProcessando(true);
    try {
      const resposta = await fetch(`/api/itens/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: Math.max(0, item.quantidade + delta) }),
      });
      if (resposta.ok) roteador.refresh();
    } finally {
      setProcessando(false);
    }
  }

  async function excluir() {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    const resposta = await fetch(`/api/itens/${item.id}`, { method: "DELETE" });
    if (resposta.ok) roteador.refresh();
  }

  async function mover(local: LocalItem) {
    setProcessando(true);
    try {
      const resposta = await fetch(`/api/itens/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mover: local }),
      });
      if (resposta.ok) {
        setMovendo(false);
        roteador.refresh();
      }
    } finally {
      setProcessando(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded border border-borda bg-fundo px-3 py-2">
      <span className="text-sm text-texto">
        {item.nome}
        {item.quantidade !== 1 && <span className="text-texto-suave"> ×{item.quantidade}</span>}
      </span>

      {podeGerenciar && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => ajustarQuantidade(-1)}
            disabled={processando}
            className="rounded border border-borda px-1.5 text-xs text-texto hover:border-ambar/50 disabled:opacity-50"
          >
            −1
          </button>
          <button
            type="button"
            onClick={() => ajustarQuantidade(1)}
            disabled={processando}
            className="rounded border border-borda px-1.5 text-xs text-texto hover:border-ambar/50 disabled:opacity-50"
          >
            +1
          </button>
          {destinos.length > 0 &&
            (movendo ? (
              <select
                autoFocus
                defaultValue=""
                onChange={(evento) => {
                  const destino = destinos[Number(evento.target.value)];
                  if (destino) mover(destino.local);
                }}
                onBlur={() => setMovendo(false)}
                className="rounded border border-borda bg-superficie px-1 py-0.5 text-xs text-texto"
              >
                <option value="" disabled>
                  Mover pra…
                </option>
                {destinos.map((destino, indice) => (
                  <option key={destino.rotulo} value={indice}>
                    {destino.rotulo}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setMovendo(true)}
                className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
              >
                Mover
              </button>
            ))}
          <button
            type="button"
            onClick={excluir}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
          >
            Excluir
          </button>
        </div>
      )}
    </li>
  );
}
