import Link from "next/link";
import { PontosCasasHogwarts } from "./pontos-casas-hogwarts";

type Atalho = { rotulo: string; descricao: string; href: string; externo?: boolean };

export function PainelHogwarts({
  campanhaId,
  ehMestre,
  ficha,
  fichaId,
  grimorio,
  escudoMestre,
  modoSessao,
}: {
  campanhaId: string;
  ehMestre: boolean;
  ficha: string | null;
  fichaId: string | null;
  grimorio: string | null;
  escudoMestre: string | null;
  modoSessao: string | null;
}) {
  const atalhos: Atalho[] = [
    {
      rotulo: "Mesa ao vivo",
      descricao: ehMestre ? "Iniciativa e ferramentas da sessão" : "Acompanhe iniciativa e rodada",
      href: `/campanhas/${campanhaId}/mesa`,
    },
  ];
  if (ficha && fichaId) atalhos.push({
    rotulo: "Minha ficha",
    descricao: "Personagem, Conteúdos e vida escolar",
    href: `${ficha}?id=${fichaId}`,
    externo: true,
  });
  if (ehMestre && modoSessao) atalhos.push({
    rotulo: "Modo Sessão",
    descricao: "Ações do Mestre sobre a campanha",
    href: `${modoSessao}?campanha=${campanhaId}`,
    externo: true,
  });
  if (ehMestre && escudoMestre) atalhos.push({
    rotulo: "Escudo do Mestre",
    descricao: "Referência rápida e preparação",
    href: escudoMestre,
    externo: true,
  });
  if (grimorio) atalhos.push({
    rotulo: "Grimório",
    descricao: "Regras, Conteúdos e referências",
    href: grimorio,
    externo: true,
  });

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-ambar/40 bg-[linear-gradient(135deg,rgba(124,83,32,.2),rgba(20,28,42,.92))] shadow-lg shadow-black/10">
      <div className="border-b border-ambar/25 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-ambar-forte">Hogwarts RPG</p>
        <h2 className="mt-1 font-titulo text-xl text-texto">
          {ehMestre ? "Gabinete do Mestre" : "Vida em Hogwarts"}
        </h2>
        <p className="mt-1 text-sm text-texto-suave">
          {ehMestre
            ? "Acesse as ferramentas escolares sem depender de endereços escondidos."
            : "Sua ficha, o Grimório e a sessão reunidos na própria campanha."}
        </p>
      </div>
      <nav aria-label="Navegação Hogwarts" className="grid gap-2 p-4 sm:grid-cols-2">
        {atalhos.map((atalho) => atalho.externo ? (
          <a key={atalho.rotulo} href={atalho.href} target="_blank" rel="noreferrer" className="rounded-lg border border-ambar/25 bg-fundo/70 px-4 py-3 transition hover:border-ambar/60 hover:bg-ambar/10">
            <strong className="block text-sm text-texto">{atalho.rotulo} →</strong>
            <span className="mt-1 block text-xs text-texto-suave">{atalho.descricao}</span>
          </a>
        ) : (
          <Link key={atalho.rotulo} href={atalho.href} className="rounded-lg border border-ambar/25 bg-fundo/70 px-4 py-3 transition hover:border-ambar/60 hover:bg-ambar/10">
            <strong className="block text-sm text-texto">{atalho.rotulo} →</strong>
            <span className="mt-1 block text-xs text-texto-suave">{atalho.descricao}</span>
          </Link>
        ))}
      </nav>
      <PontosCasasHogwarts campanhaId={campanhaId} ehMestre={ehMestre} />
    </section>
  );
}
