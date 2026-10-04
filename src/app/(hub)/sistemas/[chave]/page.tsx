import Link from "next/link";
import { notFound } from "next/navigation";
import { SISTEMAS, ROTULO_SITUACAO } from "@/lib/sistemas";
import { capaCatalogo, visualSistema } from "@/lib/visual";
import { ImagemHub } from "@/components/hub/imagem";
import { Icone } from "@/components/hub/icone";
import { CriarFicha } from "../../fichas/criar-ficha";
import { CriarNpc } from "../../fichas/criar-npc";
import { CriarCampanha } from "../../campanhas/criar-campanha";

export default async function DetalheSistema({
  params,
}: {
  params: Promise<{ chave: string }>;
}) {
  const { chave } = await params;
  const sistema = SISTEMAS.find((s) => s.chave === chave);
  if (!sistema) notFound();
  const visual = visualSistema(chave);
  const recursos = [
    {
      nome: "Grimório",
      descricao: "Conheça as regras e consulte o manual do jogador.",
      url: sistema.grimorio,
      icone: "livro" as const,
    },
    {
      nome: "Escudo do Mestre",
      descricao: "Referências rápidas para conduzir sua mesa.",
      url: sistema.escudoMestre,
      icone: "escudo" as const,
    },
    {
      nome: "Ficha de personagem",
      descricao: "Veja a ficha e os recursos deste sistema.",
      url: sistema.ficha,
      icone: "personagem" as const,
    },
    {
      nome: "Ficha de NPC e monstro",
      descricao: "Prepare encontros e personagens do mestre.",
      url: sistema.fichaInimigo,
      icone: "dados" as const,
    },
  ].filter((r) => r.url);
  return (
    <main>
      <Link href="/sistemas" className="hub-button mb-5">
        <Icone nome="voltar" /> Todos os sistemas
      </Link>
      <section className="hub-feature">
        <ImagemHub
          src={capaCatalogo(chave)}
          className="hub-feature-image"
          destaque
        />
        <div className="hub-feature-content">
          <p className="hub-eyebrow flex items-center gap-2">
            <Icone nome={visual.icone} /> {visual.tema}
          </p>
          <h1>{sistema.nome}</h1>
          <p className="mt-3 max-w-xl">{visual.frase}</p>
          <span className="hub-badge mt-4" data-status={sistema.situacao}>
            {ROTULO_SITUACAO[sistema.situacao]}
          </span>
        </div>
      </section>
      <p className="my-7 max-w-3xl text-sm leading-relaxed text-texto-suave">
        {sistema.descricao}
      </p>
      <h2 className="font-titulo text-2xl">Tudo para sua mesa</h2>
      <div className="hub-grid mt-5">
        {recursos.map((r) => (
          <a
            key={r.nome}
            href={r.url!}
            className="hub-panel"
            target="_blank"
            rel="noreferrer"
          >
            <Icone nome={r.icone} width={28} height={28} />
            <h3 className="mt-4 font-titulo text-lg">{r.nome}</h3>
            <p className="mt-2 text-sm text-texto-suave">{r.descricao}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-ambar-forte">
              Abrir <Icone nome="seta" />
            </span>
          </a>
        ))}
      </div>
      {sistema.salvaNoHub && (
        <section className="mt-9">
          <h2 className="font-titulo text-2xl">Comece sua história</h2>
          <div className="hub-creation-grid">
            <CriarFicha sistemaInicial={chave} />
            {sistema.fichaInimigo && <CriarNpc sistemaInicial={chave} />}
            <CriarCampanha sistemaInicial={chave} />
          </div>
        </section>
      )}
      <Link href={`/fichas?sistema=${chave}`} className="hub-button mt-5">
        Ver meus personagens deste sistema
      </Link>
    </main>
  );
}
