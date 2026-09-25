"use client";

import { useEffect, useState } from "react";

/*
  Gerenciar lojas da campanha direto na página, sem depender do Modo Sessão
  externo (decisão #168) — o mestre pedia acesso explícito: listar, criar,
  abrir/fechar, adicionar/remover item e ajustar estoque, tudo aqui. Usa as
  MESMAS rotas que o Modo Sessão e a ficha já usam
  (/api/campanhas/[id]/lojas, /api/lojas/[id], /api/lojas/[id]/itens) — a
  trava de permissão continua sendo o servidor, não esta tela.

  Só aparece quando o sistema da campanha declara "loja" em
  `modulosFicha` (hoje só o Hogwarts RPG) — pra qualquer outro sistema o
  recurso nem existe na ficha, então não faz sentido oferecer aqui.
*/

type Item = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number | null;
};

type Loja = {
  id: string;
  nome: string;
  descricao: string | null;
  aberta: boolean;
  itens: Item[];
};

export function PainelLojas({ campanhaId }: { campanhaId: string }) {
  const [lojas, setLojas] = useState<Loja[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [novaLojaNome, setNovaLojaNome] = useState("");
  const [criando, setCriando] = useState(false);

  async function recarregar() {
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/lojas`);
      if (!resposta.ok) throw new Error("falhou");
      const { lojas: dados } = await resposta.json();
      setLojas(dados);
      setErro(null);
    } catch {
      setErro("Não consegui carregar as lojas agora.");
    }
  }

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const resposta = await fetch(`/api/campanhas/${campanhaId}/lojas`);
        if (!resposta.ok || cancelado) return;
        const { lojas: dados } = await resposta.json();
        if (!cancelado) setLojas(dados);
      } catch {
        if (!cancelado) setErro("Não consegui carregar as lojas agora.");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [campanhaId]);

  async function criarLoja() {
    const nome = novaLojaNome.trim();
    if (!nome) return;
    setCriando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/lojas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      if (!resposta.ok) throw new Error("falhou");
      setNovaLojaNome("");
      await recarregar();
    } catch {
      setErro("Não consegui criar a loja agora.");
    } finally {
      setCriando(false);
    }
  }

  if (lojas === null && !erro) {
    return <p className="mt-3 text-sm text-texto-suave">Carregando lojas…</p>;
  }

  return (
    <div className="mt-3">
      {erro && <p className="mb-3 text-sm text-segredo">{erro}</p>}

      {lojas && lojas.length === 0 && (
        <p className="text-sm text-texto-suave">
          Nenhuma loja ainda. Toda loja nasce fechada — dá pra montar o estoque
          em paz antes de abrir pros jogadores.
        </p>
      )}

      {lojas && lojas.length > 0 && (
        <ul className="space-y-4">
          {lojas.map((loja) => (
            <LojaItemLinha key={loja.id} loja={loja} onMudou={recarregar} />
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={novaLojaNome}
          onChange={(evento) => setNovaLojaNome(evento.target.value)}
          placeholder="Nome da nova loja, ex.: Gemialidades Weasley"
          className="min-w-56 flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto"
        />
        <button
          type="button"
          onClick={criarLoja}
          disabled={criando || !novaLojaNome.trim()}
          className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20 disabled:opacity-50"
        >
          {criando ? "Criando…" : "+ Nova loja"}
        </button>
      </div>
    </div>
  );
}

function LojaItemLinha({
  loja,
  onMudou,
}: {
  loja: Loja;
  onMudou: () => void;
}) {
  const [processando, setProcessando] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState("");
  const [novoItemPreco, setNovoItemPreco] = useState("");
  const [novoItemEstoque, setNovoItemEstoque] = useState("");

  async function alternarAberta() {
    setProcessando(true);
    try {
      await fetch(`/api/lojas/${loja.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aberta: !loja.aberta }),
      });
      onMudou();
    } finally {
      setProcessando(false);
    }
  }

  async function excluirLoja() {
    if (!confirm(`Excluir "${loja.nome}" e todo o estoque dela? Não dá pra desfazer.`)) return;
    setProcessando(true);
    try {
      await fetch(`/api/lojas/${loja.id}`, { method: "DELETE" });
      onMudou();
    } finally {
      setProcessando(false);
    }
  }

  async function removerItem(itemId: string) {
    await fetch(`/api/lojas/${loja.id}/itens/${itemId}`, { method: "DELETE" });
    onMudou();
  }

  async function adicionarItem() {
    const nome = novoItemNome.trim();
    const preco = Number(novoItemPreco);
    if (!nome || !Number.isInteger(preco) || preco < 0) return;
    const estoqueTexto = novoItemEstoque.trim();
    const estoque = estoqueTexto === "" ? null : Number(estoqueTexto);
    if (estoque !== null && (!Number.isInteger(estoque) || estoque < 0)) return;

    setProcessando(true);
    try {
      await fetch(`/api/lojas/${loja.id}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, preco, estoque }),
      });
      setNovoItemNome("");
      setNovoItemPreco("");
      setNovoItemEstoque("");
      onMudou();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <li className="rounded-lg border border-borda bg-superficie p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex-1 font-titulo text-base">{loja.nome}</h3>
        <button
          type="button"
          onClick={alternarAberta}
          disabled={processando}
          className={
            loja.aberta
              ? "rounded border border-ambar/40 bg-ambar/10 px-3 py-1 text-xs text-ambar-forte disabled:opacity-50"
              : "rounded border border-borda bg-fundo px-3 py-1 text-xs text-texto-suave disabled:opacity-50"
          }
        >
          {loja.aberta ? "🟢 Aberta — clique pra fechar" : "⚪ Fechada — clique pra abrir"}
        </button>
        <button
          type="button"
          onClick={excluirLoja}
          disabled={processando}
          className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo disabled:opacity-50"
        >
          Excluir loja
        </button>
      </div>

      {loja.itens.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Sem itens ainda.</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {loja.itens.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1">
                {item.nome} — {item.preco} Galeões{" "}
                {item.estoque !== null ? (
                  <span className="text-texto-suave">({item.estoque} em estoque)</span>
                ) : (
                  <span className="text-texto-suave">(infinito)</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => removerItem(item.id)}
                className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={novoItemNome}
          onChange={(evento) => setNovoItemNome(evento.target.value)}
          placeholder="Nome do item"
          className="min-w-40 flex-1 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto"
        />
        <input
          value={novoItemPreco}
          onChange={(evento) => setNovoItemPreco(evento.target.value)}
          type="number"
          min={0}
          placeholder="Preço"
          className="w-24 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto"
        />
        <input
          value={novoItemEstoque}
          onChange={(evento) => setNovoItemEstoque(evento.target.value)}
          type="number"
          min={0}
          placeholder="Estoque (vazio = infinito)"
          className="w-44 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto"
        />
        <button
          type="button"
          onClick={adicionarItem}
          disabled={processando || !novoItemNome.trim() || novoItemPreco.trim() === ""}
          className="rounded border border-borda bg-fundo px-3 py-1.5 text-xs text-texto-suave transition hover:text-texto disabled:opacity-50"
        >
          + Item
        </button>
      </div>
    </li>
  );
}
