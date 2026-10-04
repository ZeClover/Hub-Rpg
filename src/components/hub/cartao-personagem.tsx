import Link from "next/link";
import type { ReactNode } from "react";
import { SISTEMAS } from "@/lib/sistemas";
import type { ResumoPersonagem } from "@/lib/sistemas/resumo-personagem";
import { retratoPadrao } from "@/lib/visual";
import { ImagemHub } from "./imagem";
import { ResumoFicha } from "./resumo";
import { Icone } from "./icone";

export const ROTULOS_STATUS: Record<string, string> = {
  ATIVO: "Ativo",
  RESERVA: "Reserva",
  APOSENTADO: "Aposentado",
  MORTO: "Morto",
  ARQUIVADO: "Arquivado",
};
export type PersonagemVisual = {
  id: string;
  nome: string;
  avatarUrl: string | null;
  bannerUrl?: string | null;
  status?: string;
  ehMonstro: boolean;
  sistema: { chave: string; nome: string };
  campanha?: { nome: string } | null;
  resumo: ResumoPersonagem;
};
export function urlFichaDe(
  p: Pick<PersonagemVisual, "id" | "sistema" | "ehMonstro">,
) {
  const sistema = SISTEMAS.find((s) => s.chave === p.sistema.chave);
  const arquivo = p.ehMonstro ? sistema?.fichaInimigo : sistema?.ficha;
  return arquivo ? `${arquivo}?id=${p.id}` : null;
}
export function CartaoPersonagem({
  personagem: p,
  gerenciamento,
  detalhes,
  complemento,
}: {
  personagem: PersonagemVisual;
  gerenciamento?: boolean;
  detalhes?: ReactNode;
  complemento?: ReactNode;
}) {
  const url = urlFichaDe(p);
  return (
    <article className="hub-card hub-personagem-card">
      <a
        href={url ?? `/fichas/${p.id}`}
        className={`hub-card-media ${p.bannerUrl ? "has-banner" : ""}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ImagemHub
          src={p.bannerUrl || p.avatarUrl}
          fallback={retratoPadrao(p.nome)}
          className="hub-cover"
        />
        {p.bannerUrl && (
          <ImagemHub
            src={p.avatarUrl}
            fallback={retratoPadrao(p.nome)}
            className="hub-card-portrait"
          />
        )}
      </a>
      <div className="hub-card-body">
        <div className="flex items-start justify-between gap-2">
          <h2 className="hub-card-title">
            <a href={url ?? `/fichas/${p.id}`}>{p.nome}</a>
          </h2>
          {p.status && (
            <span className="hub-badge" data-status={p.status}>
              {ROTULOS_STATUS[p.status] ?? p.status}
            </span>
          )}
        </div>
        <p className="hub-card-meta mt-1">
          {p.sistema.nome}
          {p.ehMonstro ? " · NPC / monstro" : ""}
        </p>
        <ResumoFicha resumo={p.resumo} />
        <p className="hub-card-meta mt-3 flex items-center gap-1.5">
          <Icone nome="campanha" width={14} height={14} />
          {p.campanha?.nome ?? "Personagem avulso"}
        </p>
        {complemento}
        <div className="hub-card-actions">
          {url && (
            <a href={url} className="hub-button hub-button-primary">
              Abrir ficha <Icone nome="seta" />
            </a>
          )}
          {gerenciamento && (
            <Link href={`/fichas/${p.id}`} className="hub-button">
              Gerenciar
            </Link>
          )}
        </div>
      </div>
      {detalhes && (
        <details className="hub-card-maintenance">
          <summary>Ações do personagem</summary>
          <div className="mt-4 space-y-4">{detalhes}</div>
        </details>
      )}
    </article>
  );
}
