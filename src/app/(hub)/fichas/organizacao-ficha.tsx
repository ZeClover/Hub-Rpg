"use client";

import { SeletorImagem } from "@/components/hub/seletor-imagem";
import { ImagemHub } from "@/components/hub/imagem";
import { Icone } from "@/components/hub/icone";
import { retratoPadrao } from "@/lib/visual";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

/*
  Organização da ficha (decisão #134) — status e avatar/banner. Nenhum dos
  dois mexe em nada dentro da ficha em si (a aba do sistema continua sendo
  a fonte de verdade das regras); é só o que ajuda a separar, na lista, quem
  ainda está em jogo de quem não está mais, e dar uma cara pra cada ficha.
*/
export const ROTULO_STATUS: Record<string, string> = {
  ATIVO: "Ativo",
  RESERVA: "Reserva",
  APOSENTADO: "Aposentado",
  MORTO: "Morto",
  ARQUIVADO: "Arquivado",
};

export function StatusFicha({
  id,
  statusInicial,
}: {
  id: string;
  statusInicial: string;
}) {
  const roteador = useRouter();
  const [status, setStatus] = useState(statusInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(false);
  async function mudar(novoStatus: string) {
    const anterior = status;
    setStatus(novoStatus);
    setSalvando(true);
    setErro(false);
    try {
      const resposta = await fetch(`/api/personagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!resposta.ok) throw new Error("falhou");
      roteador.refresh();
    } catch {
      setStatus(anterior);
      setErro(true);
    } finally {
      setSalvando(false);
    }
  }
  return (
    <span>
      <select
        aria-label="Status do personagem"
        value={status}
        onChange={(e) => mudar(e.target.value)}
        disabled={salvando}
        className="rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto-suave disabled:opacity-50"
      >
        {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </select>
      {erro && (
        <span role="alert" className="mt-2 block text-xs text-segredo">
          Não consegui mudar o status. Tente novamente.
        </span>
      )}
    </span>
  );
}

export function AvatarFicha({
  nome,
  avatarUrl,
}: {
  nome: string;
  avatarUrl: string | null;
}) {
  return (
    <ImagemHub
      src={avatarUrl}
      fallback={retratoPadrao(nome)}
      className="h-12 w-12 shrink-0 rounded-full border border-borda"
    />
  );
}

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
  const dialogo = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const [aberto, setAberto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(avatarUrlInicial ?? "");
  const [bannerUrl, setBannerUrl] = useState(bannerUrlInicial ?? "");
  const [preparando, setPreparando] = useState(false);
  const [campo, setCampo] = useState("retrato");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const resposta = await fetch(`/api/personagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: avatarUrl || null,
          bannerUrl: bannerUrl || null,
        }),
      });
      if (!resposta.ok)
        throw new Error(
          "Não consegui salvar as imagens. Confira os links e tente novamente.",
        );
      roteador.refresh();
      dialogo.current?.close();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Confira sua conexão e tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="hub-button"
        onClick={() => {
          setAvatarUrl(avatarUrlInicial ?? "");
          setBannerUrl(bannerUrlInicial ?? "");
          setErro("");
          setAberto(true);
          dialogo.current?.showModal();
        }}
      >
        <Icone nome="imagem" /> Personalizar imagens
      </button>
      <dialog
        ref={dialogo}
        className="hub-dialog"
        aria-labelledby={tituloId}
        onClose={() => setAberto(false)}
        onCancel={(e) => {
          if (salvando || preparando) e.preventDefault();
        }}
      >
        {aberto && <>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={tituloId} className="font-titulo text-2xl">
            Imagens do personagem
          </h2>
          <button
            type="button"
            aria-label="Fechar editor"
            className="hub-icon-button"
            disabled={salvando || preparando}
            onClick={() => dialogo.current?.close()}
          >
            <Icone nome="fechar" />
          </button>
        </div>
        <form onSubmit={salvar}>
          <fieldset disabled={salvando || preparando}>
            <div className="hub-tabs mb-5">
              <button
                type="button"
                aria-pressed={campo === "retrato"}
                onClick={() => setCampo("retrato")}
              >
                Retrato
              </button>
              <button
                type="button"
                aria-pressed={campo === "banner"}
                onClick={() => setCampo("banner")}
              >
                Banner
              </button>
            </div>
            <SeletorImagem
              aoPreparar={setPreparando}
              key={campo}
              tipo={campo === "retrato" ? "retrato" : "banner"}
              rotulo={campo === "retrato" ? "Retrato" : "Banner"}
              valor={campo === "retrato" ? avatarUrl : bannerUrl}
              aoMudar={campo === "retrato" ? setAvatarUrl : setBannerUrl}
            />
          </fieldset>
          {erro && (
            <p className="hub-error mt-4" role="alert">
              {erro}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              className="hub-button hub-button-primary"
              disabled={salvando || preparando}
            >
              {salvando ? "Salvando…" : "Salvar imagens"}
            </button>
            <button
              type="button"
              className="hub-button"
              disabled={salvando || preparando}
              onClick={() => dialogo.current?.close()}
            >
              Cancelar
            </button>
          </div>
        </form>
        </>}
      </dialog>
    </>
  );
}
