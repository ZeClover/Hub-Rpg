import Link from "next/link";
import { capaSistema, ROTULOS_PAPEL } from "@/lib/visual";
import { Icone } from "./icone";
import { ImagemHub } from "./imagem";
export type CampanhaVisual = {
  id: string;
  nome: string;
  capaUrl: string | null;
  descricao: string | null;
  tags: string[];
  sistema: { chave: string; nome: string };
  _count?: { personagens: number; participacoes: number };
  sessoes?: { numero: number; data: Date | null }[];
};
export function CartaoCampanha({
  campanha: c,
  papel,
}: {
  campanha: CampanhaVisual;
  papel: string;
}) {
  const sessao = c.sessoes?.[0];
  return (
    <article className="hub-card">
      <Link
        href={`/campanhas/${c.id}`}
        className="hub-card-media"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ImagemHub
          src={c.capaUrl}
          fallback={capaSistema(c.sistema.chave)}
          className="hub-cover"
        />
        <span className="hub-card-media-label">{ROTULOS_PAPEL[papel]}</span>
      </Link>
      <div className="hub-card-body">
        <h2 className="hub-card-title">
          <Link href={`/campanhas/${c.id}`}>{c.nome}</Link>
        </h2>
        <p className="hub-card-meta mt-1">{c.sistema.nome}</p>
        {c.descricao && <p className="hub-card-description">{c.descricao}</p>}
        {c._count && (
          <p className="hub-card-meta mt-3">
            {c._count.participacoes} participantes · {c._count.personagens}{" "}
            personagens
          </p>
        )}
        {sessao?.data && (
          <p className="mt-3 flex items-center gap-2 text-xs text-ambar-forte">
            <Icone nome="calendario" width={15} height={15} />
            Sessão {sessao.numero} · {sessao.data.toLocaleDateString("pt-BR")}
          </p>
        )}
        {c.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.tags.map((t) => (
              <span className="hub-badge" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="hub-card-actions">
          <Link
            href={`/campanhas/${c.id}`}
            className="hub-button hub-button-primary"
          >
            Entrar na campanha <Icone nome="seta" />
          </Link>
        </div>
      </div>
    </article>
  );
}
