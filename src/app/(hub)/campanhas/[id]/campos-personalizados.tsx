"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/*
  Campos personalizados da campanha (decisão #140) — algo que a mesa
  precisa acompanhar e não tem casa própria no Hub (clima da cena, ouro
  do grupo, "modo hardcore ligado"). Só o mestre cria/edita/apaga;
  qualquer participante lê, igual a Identidade da campanha.
*/

export type CampoView = {
  id: string;
  nome: string;
  tipo: "TEXTO" | "NUMERO" | "CONTADOR" | "BOOLEANO";
  valorTexto: string | null;
  valorNumero: number | null;
  valorBooleano: boolean | null;
};

const ROTULO_TIPO: Record<CampoView["tipo"], string> = {
  TEXTO: "Texto",
  NUMERO: "Número",
  CONTADOR: "Contador",
  BOOLEANO: "Sim/Não",
};

export function CamposPersonalizados({
  campanhaId,
  campos,
  souMestre,
}: {
  campanhaId: string;
  campos: CampoView[];
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<CampoView["tipo"]>("TEXTO");
  const [publicando, setPublicando] = useState(false);

  async function criar() {
    if (!nome.trim()) return;
    setPublicando(true);
    try {
      const resposta = await fetch(`/api/campanhas/${campanhaId}/campos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), tipo }),
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

  if (campos.length === 0 && !souMestre) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-xl">Campos da campanha</h2>
        {souMestre && !criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="text-xs text-ambar-forte underline underline-offset-2"
          >
            + Novo campo
          </button>
        )}
      </div>

      {criando && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-borda bg-fundo p-3">
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Nome do campo (ex.: Ouro do grupo)"
            className="min-w-[160px] flex-1 rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          />
          <select
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value as CampoView["tipo"])}
            className="rounded border border-borda bg-superficie px-2 py-1 text-sm text-texto"
          >
            {Object.entries(ROTULO_TIPO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
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

      {campos.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">Nenhum campo criado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {campos.map((campo) => (
            <CampoItem key={campo.id} campanhaId={campanhaId} campo={campo} souMestre={souMestre} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CampoItem({
  campanhaId,
  campo,
  souMestre,
}: {
  campanhaId: string;
  campo: CampoView;
  souMestre: boolean;
}) {
  const roteador = useRouter();
  const [texto, setTexto] = useState(campo.valorTexto ?? "");
  const [numero, setNumero] = useState(String(campo.valorNumero ?? 0));
  const [processando, setProcessando] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function salvar(corpo: Record<string, unknown>) {
    const resposta = await fetch(`/api/campanhas/${campanhaId}/campos/${campo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    if (resposta.ok) roteador.refresh();
  }

  function salvarComDebounce(corpo: Record<string, unknown>) {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => salvar(corpo), 600);
  }

  async function ajustarContador(delta: number) {
    setProcessando(true);
    try {
      await salvar({ delta });
    } finally {
      setProcessando(false);
    }
  }

  async function excluir() {
    if (!confirm(`Excluir o campo "${campo.nome}"? Não dá para desfazer.`)) return;
    const resposta = await fetch(`/api/campanhas/${campanhaId}/campos/${campo.id}`, {
      method: "DELETE",
    });
    if (resposta.ok) roteador.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
      <span className="font-titulo text-sm">{campo.nome}</span>

      <div className="flex items-center gap-2">
        {campo.tipo === "TEXTO" &&
          (souMestre ? (
            <input
              value={texto}
              onChange={(evento) => {
                setTexto(evento.target.value);
                salvarComDebounce({ valorTexto: evento.target.value });
              }}
              className="rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto"
            />
          ) : (
            <span className="text-sm text-texto-suave">{campo.valorTexto || "—"}</span>
          ))}

        {campo.tipo === "NUMERO" &&
          (souMestre ? (
            <input
              type="number"
              value={numero}
              onChange={(evento) => {
                setNumero(evento.target.value);
                const valor = Number(evento.target.value);
                if (Number.isFinite(valor)) salvarComDebounce({ valorNumero: valor });
              }}
              className="w-24 rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto"
            />
          ) : (
            <span className="text-sm text-texto-suave">{campo.valorNumero ?? 0}</span>
          ))}

        {campo.tipo === "CONTADOR" && (
          <div className="flex items-center gap-2">
            {souMestre && (
              <button
                type="button"
                onClick={() => ajustarContador(-1)}
                disabled={processando}
                className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-ambar/50 disabled:opacity-50"
              >
                −1
              </button>
            )}
            <span className="min-w-6 text-center text-sm text-texto">{campo.valorNumero ?? 0}</span>
            {souMestre && (
              <button
                type="button"
                onClick={() => ajustarContador(1)}
                disabled={processando}
                className="rounded border border-borda px-2 py-1 text-xs text-texto transition hover:border-ambar/50 disabled:opacity-50"
              >
                +1
              </button>
            )}
          </div>
        )}

        {campo.tipo === "BOOLEANO" &&
          (souMestre ? (
            <button
              type="button"
              onClick={() => salvar({ valorBooleano: !campo.valorBooleano })}
              className={
                campo.valorBooleano
                  ? "rounded border border-ambar/50 bg-ambar/15 px-3 py-1 text-xs text-ambar-forte"
                  : "rounded border border-borda px-3 py-1 text-xs text-texto-suave"
              }
            >
              {campo.valorBooleano ? "Sim" : "Não"}
            </button>
          ) : (
            <span className="text-sm text-texto-suave">{campo.valorBooleano ? "Sim" : "Não"}</span>
          ))}

        {souMestre && (
          <button
            type="button"
            onClick={excluir}
            className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
          >
            Excluir
          </button>
        )}
      </div>
    </li>
  );
}
