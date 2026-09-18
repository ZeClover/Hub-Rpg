"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/*
  Organização da ficha (decisão #134) — status e avatar/banner. Nenhum dos
  dois mexe em nada dentro da ficha em si (a aba do sistema continua sendo
  a fonte de verdade das regras); é só o que ajuda a separar, na lista, quem
  ainda está em jogo de quem não está mais, e dar uma cara pra cada ficha.
*/
const ROTULO_STATUS: Record<string, string> = {
  ATIVO: "Ativo",
  RESERVA: "Reserva",
  APOSENTADO: "Aposentado",
  MORTO: "Morto",
  ARQUIVADO: "Arquivado",
};

export function StatusFicha({ id, statusInicial }: { id: string; statusInicial: string }) {
  const roteador = useRouter();
  const [status, setStatus] = useState(statusInicial);
  const [salvando, setSalvando] = useState(false);

  async function mudar(novoStatus: string) {
    setStatus(novoStatus);
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/personagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (resposta.ok) roteador.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(evento) => mudar(evento.target.value)}
      disabled={salvando}
      className="rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto-suave disabled:opacity-50"
    >
      {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
        <option key={valor} value={valor}>
          {rotulo}
        </option>
      ))}
    </select>
  );
}

export function AvatarFicha({ nome, avatarUrl }: { nome: string; avatarUrl: string | null }) {
  if (!avatarUrl) {
    return (
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-borda bg-fundo text-xs text-texto-suave"
      >
        {nome.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- avatar é uma URL externa qualquer, não um asset otimizável pelo Next.
    <img
      src={avatarUrl}
      alt=""
      className="h-10 w-10 shrink-0 rounded-full border border-borda object-cover"
    />
  );
}

/*
  Editor de imagem — fica escondido atrás de um "Imagem" pra não poluir a
  lista por padrão. Mesma ideia de link externo do avatar da conta Google
  (`Usuario.avatarUrl`): o Hub não hospeda arquivo nenhum.
*/
export function EditarImagemFicha({
  id,
  avatarUrlInicial,
  bannerUrlInicial,
}: {
  id: string;
  avatarUrlInicial: string | null;
  bannerUrlInicial: string | null;
}) {
  const roteador = useRouter();
  const [aberto, setAberto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(avatarUrlInicial ?? "");
  const [bannerUrl, setBannerUrl] = useState(bannerUrlInicial ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/personagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatarUrl || null, bannerUrl: bannerUrl || null }),
      });
      if (resposta.ok) {
        roteador.refresh();
        setAberto(false);
      }
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
      >
        Imagem
      </button>
    );
  }

  return (
    <form
      onSubmit={salvar}
      className="mt-2 flex flex-1 flex-col gap-2 rounded border border-borda bg-fundo p-3"
    >
      <input
        value={avatarUrl}
        onChange={(evento) => setAvatarUrl(evento.target.value)}
        placeholder="URL do avatar"
        className="rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto"
      />
      <input
        value={bannerUrl}
        onChange={(evento) => setBannerUrl(evento.target.value)}
        placeholder="URL do banner (opcional)"
        className="rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="text-xs text-ambar-forte underline underline-offset-2 disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-xs text-texto-suave underline decoration-borda underline-offset-4"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
