import Link from "next/link";
import { Icone } from "@/components/hub/icone";
import { ImagemHub } from "@/components/hub/imagem";
import { capaSistema, capaCatalogo, CAPAS_VERTICAIS } from "@/lib/visual";
import { SISTEMAS, ROTULO_SITUACAO } from "@/lib/sistemas";

export default function Home() {
  return (
    <main className="hub-home mx-auto w-full max-w-7xl px-6 py-8 sm:py-12">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="hub-brand">
          <Icone nome="dados" width={30} height={30} />
          <span>Hub RPG</span>
        </Link>
        <Link href="/entrar" className="hub-button">
          Entrar <Icone nome="seta" />
        </Link>
      </header>
      <section className="hub-feature">
        <ImagemHub
          src={capaSistema("fabula-ultima")}
          className="hub-feature-image"
          destaque
        />
        <div className="hub-feature-content">
          <p className="hub-eyebrow">Personagens. Mundos. Histórias.</p>
          <h1>
            Seu próximo capítulo
            <br />
            <span className="text-ambar-forte">começa aqui.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed sm:text-base">
            Reúna seus personagens e campanhas em um só lugar. Fichas com as
            regras do seu sistema e ferramentas para jogar junto.
          </p>
          <Link href="/entrar" className="hub-button hub-button-primary mt-6">
            Entrar com Google <Icone nome="seta" />
          </Link>
        </div>
      </section>
      <section className="mt-12">
        <div className="hub-page-heading">
          <div>
            <p className="hub-eyebrow">Um lugar para cada aventura</p>
            <h2 className="font-titulo text-3xl">Explore os sistemas</h2>
            <p>Escolha o universo da sua próxima história.</p>
          </div>
        </div>
        <ul className="hub-home-grid">
          {SISTEMAS.map((s) => (
            <li key={s.chave}>
              <Link href={`/sistemas/${s.chave}`} className="hub-card">
                <ImagemHub
                  src={capaCatalogo(s.chave)}
                  ajuste={CAPAS_VERTICAIS.has(s.chave) ? "contain" : "cover"}
                  className="hub-cover"
                />
                <div className="hub-card-body">
                  <h3 className="hub-card-title">{s.nome}</h3>
                  <span className="hub-badge mt-2" data-status={s.situacao}>
                    {ROTULO_SITUACAO[s.situacao]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="hub-grid mt-12">
        {[
          {
            nome: "Personagens com identidade",
            texto: "Retratos, resumos e organização por sistema e campanha.",
            icone: "personagem" as const,
          },
          {
            nome: "Sua mesa reunida",
            texto: "Campanhas, sessões, comunicação e elenco em um só lugar.",
            icone: "campanha" as const,
          },
          {
            nome: "Pronto para jogar",
            texto:
              "Fichas salvas na conta e Mesa ao Vivo para acompanhar a sessão.",
            icone: "dados" as const,
          },
        ].map((r) => (
          <article key={r.nome} className="hub-panel">
            <Icone nome={r.icone} width={28} height={28} />
            <h3 className="mt-4 font-titulo text-lg">{r.nome}</h3>
            <p className="mt-2 text-sm text-texto-suave">{r.texto}</p>
          </article>
        ))}
      </section>
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-borda pt-6 text-xs text-texto-suave">
        <span>Hub RPG · Suas histórias, reunidas.</span>
        <Link href="/creditos">Créditos das imagens</Link>
      </footer>
    </main>
  );
}
