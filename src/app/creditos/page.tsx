import Link from "next/link";
import creditos from "@/lib/creditos-imagens.json";
import { ImagemHub } from "@/components/hub/imagem";

export default function Creditos() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Link href="/painel" className="hub-button mb-6">
        ← Voltar ao Hub
      </Link>
      <header className="hub-page-heading">
        <div>
          <p className="hub-eyebrow">Quem dá vida às nossas imagens</p>
          <h1 className="font-titulo text-3xl">Créditos das imagens</h1>
          <p>
            A biblioteca reúne personagens e cenários de fantasia digital de
            David Revoy, com licença CC BY 4.0. As capas originais identificam seus
            sistemas e pertencem aos respectivos autores e editoras.
          </p>
        </div>
      </header>
      <ul className="hub-grid">
        {creditos.map((c) => (
          <li className="hub-panel" key={c.arquivo}>
            <ImagemHub
              src={c.arquivo}
              alt={c.title.replace(/^File:/, "")}
              className="mb-4 aspect-[4/3] rounded-lg"
            />
            <h2 className="font-titulo text-base">
              {c.title.replace(/^File:/, "")}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-texto-suave">
              {c.artist || "Autoria indicada na fonte"}
            </p>
            <p className="mt-2 text-xs text-texto-suave">
              {c.license === "Public domain" ? "Domínio público" : c.license}
            </p>
            <p className="mt-2 text-xs text-texto-suave">
              {"modificacoes" in c
                ? c.modificacoes
                : "Recorte, redimensionamento e conversão para WebP."}
            </p>
            <div className="mt-4 flex gap-4 text-xs text-ambar-forte">
              <a href={c.source} target="_blank" rel="noreferrer">
                Fonte original ↗
              </a>
              {c.licenseUrl && (
                <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                  Licença e condições ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs leading-relaxed text-texto-suave">
        As ilustrações temáticas não representam uma parceria com os autores dos
        sistemas. A licença de cada obra permanece indicada acima. As capas
        comerciais não fazem parte das opções da biblioteca para personalização.
      </p>
    </main>
  );
}
