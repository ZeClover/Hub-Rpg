import Link from "next/link";
import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";
import { capaSistema, retratoPadrao, ROTULOS_PAPEL } from "@/lib/visual";
import { resumirPersonagem } from "@/lib/sistemas/resumo-personagem";
import { ImagemHub } from "@/components/hub/imagem";
import { Icone } from "@/components/hub/icone";
import { urlFichaDe } from "@/components/hub/cartao-personagem";

export default async function Painel() {
  const usuario = (await usuarioAtual())!;
  const [participacoes, fichas, proximaSessao] = await Promise.all([
    banco.participacao.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { criadoEm: "desc" },
      take: 4,
      select: {
        papel: true,
        campanha: {
          select: {
            id: true,
            nome: true,
            capaUrl: true,
            sistema: { select: { chave: true, nome: true } },
          },
        },
      },
    }),
    banco.personagem.findMany({
      where: { donoId: usuario.id },
      orderBy: { atualizadoEm: "desc" },
      take: 4,
      select: {
        id: true,
        nome: true,
        avatarUrl: true,
        ehMonstro: true,
        dados: true,
        sistema: { select: { chave: true, nome: true } },
      },
    }),
    banco.sessao.findFirst({
      where: {
        data: { gte: new Date() },
        campanha: { participacoes: { some: { usuarioId: usuario.id } } },
      },
      orderBy: { data: "asc" },
      select: {
        numero: true,
        data: true,
        campanha: {
          select: {
            id: true,
            nome: true,
            capaUrl: true,
            sistema: { select: { chave: true, nome: true } },
          },
        },
      },
    }),
  ]);
  const destaque = proximaSessao?.campanha ?? participacoes[0]?.campanha;
  return (
    <main>
      <header className="hub-page-heading">
        <div>
          <p className="hub-eyebrow">Seu ponto de encontro</p>
          <h1>Olá, {usuario.nome?.split(" ")[0] ?? "aventureiro"}.</h1>
          <p>
            Suas histórias estão aqui. Continue de onde parou ou prepare sua
            próxima aventura.
          </p>
        </div>
        <Link href="/fichas#criar-personagem" className="hub-button">
          <Icone nome="mais" /> Novo personagem
        </Link>
      </header>
      <section className="hub-feature">
        <ImagemHub
          src={destaque?.capaUrl}
          fallback={capaSistema(destaque?.sistema.chave ?? "fabula-ultima")}
          className="hub-feature-image"
          destaque
        />
        <div className="hub-feature-content">
          <p className="hub-eyebrow">
            {destaque
              ? "De volta à aventura"
              : "Uma nova história espera por você"}
          </p>
          <h2>{destaque?.nome ?? "Que mundo vamos explorar?"}</h2>
          <p className="mt-3 max-w-lg text-sm">
            {destaque?.sistema.nome ??
              "Encontre um sistema, dê vida ao seu personagem e reúna sua mesa."}
          </p>
          <Link
            href={destaque ? `/campanhas/${destaque.id}` : "/sistemas"}
            className="hub-button hub-button-primary mt-5"
          >
            {destaque ? "Abrir campanha" : "Explorar sistemas"}
            <Icone nome="seta" />
          </Link>
        </div>
      </section>
      {proximaSessao?.data && (
        <Link
          href={`/campanhas/${proximaSessao.campanha.id}`}
          className="hub-next-session mt-5"
        >
          <div className="hub-session-date">
            <strong>{proximaSessao.data.getDate()}</strong>
            <span>
              {proximaSessao.data.toLocaleDateString("pt-BR", {
                month: "short",
              })}
            </span>
          </div>
          <div>
            <p className="hub-eyebrow">Próxima sessão</p>
            <h2 className="mt-1 font-titulo text-lg">
              {proximaSessao.campanha.nome} · Sessão {proximaSessao.numero}
            </h2>
            <p className="mt-1 text-sm text-texto-suave">
              {proximaSessao.data.toLocaleString("pt-BR", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <Icone nome="seta" />
        </Link>
      )}
      <div className="hub-dashboard-grid mt-7">
        <section className="hub-panel">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-titulo text-xl">Suas campanhas</h2>
            <Link href="/campanhas" className="text-xs text-ambar-forte">
              Ver todas →
            </Link>
          </div>
          {participacoes.length ? (
            <ul className="hub-recent-list">
              {participacoes.map(({ campanha: c, papel }) => (
                <li key={c.id}>
                  <Link href={`/campanhas/${c.id}`}>
                    <ImagemHub
                      src={c.capaUrl}
                      fallback={capaSistema(c.sistema.chave)}
                      className="hub-recent-image"
                    />
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate font-titulo">
                        {c.nome}
                      </strong>
                      <span className="hub-card-meta">
                        {c.sistema.nome} · {ROTULOS_PAPEL[papel]}
                      </span>
                    </span>
                    <Icone nome="seta" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-7 text-sm text-texto-suave">
              <p>Reúna seu grupo para a primeira sessão.</p>
              <Link href="/campanhas#nova-campanha" className="hub-button mt-4">
                Criar ou entrar em uma campanha
              </Link>
            </div>
          )}
        </section>
        <section className="hub-panel">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-titulo text-xl">Personagens recentes</h2>
            <Link href="/fichas" className="text-xs text-ambar-forte">
              Ver todos →
            </Link>
          </div>
          {fichas.length ? (
            <ul className="hub-recent-list">
              {fichas.map((p) => {
                const resumo = resumirPersonagem(
                  p.sistema.chave,
                  p.dados,
                  p.ehMonstro,
                );
                return (
                  <li key={p.id}>
                    <a href={urlFichaDe(p) ?? `/fichas/${p.id}`}>
                      <ImagemHub
                        src={p.avatarUrl}
                        fallback={retratoPadrao(p.nome)}
                        className="hub-recent-image rounded-full"
                      />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate font-titulo">
                          {p.nome}
                        </strong>
                        <span className="hub-card-meta">
                          {p.sistema.nome}
                          {resumo.progressao ? ` · ${resumo.progressao}` : ""}
                        </span>
                      </span>
                      <Icone nome="seta" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-7 text-sm text-texto-suave">
              <p>Dê nome e rosto ao seu próximo personagem.</p>
              <Link href="/fichas#criar-personagem" className="hub-button mt-4">
                Criar personagem
              </Link>
            </div>
          )}
        </section>
      </div>
      <section className="mt-6 flex flex-wrap gap-3">
        <Link href="/sistemas" className="hub-button">
          <Icone nome="livro" /> Explorar sistemas
        </Link>
        <Link href="/itens" className="hub-button">
          <Icone nome="bolsa" /> Meus itens
        </Link>
        <Link href="/atualizacoes" className="hub-button">
          <Icone nome="novidades" /> Novidades do Hub
        </Link>
      </section>
    </main>
  );
}
