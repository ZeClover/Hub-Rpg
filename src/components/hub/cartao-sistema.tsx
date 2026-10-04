import Link from "next/link";
import { ROTULO_SITUACAO, type Sistema } from "@/lib/sistemas";
import { CAPAS_VERTICAIS, capaCatalogo, visualSistema } from "@/lib/visual";
import { FavoritarSistema } from "@/app/(hub)/fichas/favoritar-sistema";
import { Icone } from "./icone";
import { ImagemHub } from "./imagem";

export function CartaoSistema({
  sistema,
  favorito,
}: {
  sistema: Sistema;
  favorito?: boolean;
}) {
  const visual = visualSistema(sistema.chave);
  return (
    <article className="hub-card hub-sistema-card">
      <Link href={`/sistemas/${sistema.chave}`} className="hub-card-media">
        <ImagemHub
          src={capaCatalogo(sistema.chave)}
          className="hub-cover"
          sizes="(max-width: 767px) 100vw, 320px"
          ajuste={CAPAS_VERTICAIS.has(sistema.chave) ? "contain" : "cover"}
        />
        <span className="hub-sistema-symbol">
          <Icone nome={visual.icone} width={28} height={28} />
        </span>
        <span className="hub-card-media-label">{visual.tema}</span>
      </Link>
      <div className="hub-card-body">
        <div className="flex items-start justify-between gap-2">
          <h2 className="hub-card-title">
            <Link href={`/sistemas/${sistema.chave}`}>{sistema.nome}</Link>
          </h2>
          {favorito !== undefined && (
            <FavoritarSistema
              chave={sistema.chave}
              favoritoInicial={favorito}
            />
          )}
        </div>
        <span className="hub-badge mt-2" data-status={sistema.situacao}>
          {ROTULO_SITUACAO[sistema.situacao]}
        </span>
        <p className="hub-card-description">{sistema.descricao}</p>
        <div className="hub-card-actions">
          <Link href={`/sistemas/${sistema.chave}`} className="hub-button">
            Explorar <Icone nome="seta" />
          </Link>
          {sistema.salvaNoHub && (
            <Link
              href={`/fichas?sistema=${sistema.chave}#criar-personagem`}
              className="text-xs text-ambar-forte"
            >
              Criar personagem
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
