"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Veículos genéricos da campanha (decisão #147, ideia #57) — nome,
  descrição livre e capacidade, ligados a uma ficha dona. Deliberadamente
  simples: não é um sistema de perseguição nem duplica mecânica de veículo
  de sistema nenhum (decisão #17). Só o mestre cria/edita/apaga; qualquer
  participante lê.
*/

export type VeiculoView = {
  id: string;
  nome: string;
  descricao: string | null;
  capacidade: number | null;
  donoId: string;
};

export function Veiculos({
  campanhaId,
  veiculos,
  fichasDaCampanha,
  souMestre,
}: {
  campanhaId: string;
  veiculos: VeiculoView[];
  fichasDaCampanha: { id: string; nome: string }[];
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [donoId, setDonoId] = useState(fichasDaCampanha[0]?.id ?? "");
  const [publicando, setPublicando] = useState(false);

  async function criar() {
    if (!nome.trim() || !donoId) return;
    setPublicando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/veiculos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), donoId }),
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

  async function excluir(veiculoId: string, nomeVeiculo: string) {
    if (!confirm(`Excluir "${nomeVeiculo}"?`)) return;
    const resposta = await fetch(`/api/campanhas/${campanhaId}/veiculos/${veiculoId}`, {
      method: "DELETE",
    });
    if (resposta.ok) roteador.refresh();
  }

  const nomePorFicha = new Map(fichasDaCampanha.map((f) => [f.id, f.nome]));

  if (veiculos.length === 0 && !souMestre) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-xl">Veículos</h2>
        {souMestre && !criando && fichasDaCampanha.length > 0 && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Novo veículo
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-borda bg-fundo p-3">
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome do veículo"
            className="min-w-[140px] flex-1 rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          <select
            value={donoId}
            onChange={(evento) => setDonoId(evento.target.value)}
            className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          >
            {fichasDaCampanha.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
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

      {veiculos.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhum veículo cadastrado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {veiculos.map((veiculo) => (
            <li
              key={veiculo.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borda bg-superficie p-4"
            >
              <div>
                <span className="font-titulo text-sm">{veiculo.nome}</span>
                <span className="ml-2 text-xs text-texto-suave">
                  de {nomePorFicha.get(veiculo.donoId) ?? "—"}
                  {veiculo.capacidade !== null && ` · capacidade ${veiculo.capacidade}`}
                </span>
              </div>
              {souMestre && (
                <button
                  type="button"
                  onClick={() => excluir(veiculo.id, veiculo.nome)}
                  className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                >
                  Excluir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
