import Link from "next/link";
import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";
import { resumirPersonagem } from "@/lib/sistemas/resumo-personagem";
import { retratoPadrao } from "@/lib/visual";
import { Colecao } from "@/components/hub/colecao";
import {
  CartaoPersonagem,
  ROTULOS_STATUS,
} from "@/components/hub/cartao-personagem";
import { Icone } from "@/components/hub/icone";
import { LinkCriacao } from "@/components/hub/link-criacao";
import { GerarCard } from "../gerar-card";
import { CriarFicha } from "./criar-ficha";
import { CriarNpc } from "./criar-npc";
import { BotaoExcluir } from "./excluir-ficha";
import { MoverOuCopiarFicha } from "./mover-ou-copiar-ficha";
import { EditarImagemFicha, StatusFicha } from "./organizacao-ficha";

export default async function Fichas({
  searchParams,
}: {
  searchParams: Promise<{ sistema?: string }>;
}) {
  const usuario = (await usuarioAtual())!;
  const parametros = await searchParams;
  const inicial = SISTEMAS.find((s) => s.chave === parametros.sistema);
  const [personagens, participacoes] = await Promise.all([
    banco.personagem.findMany({
      where: { donoId: usuario.id },
      orderBy: { atualizadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        status: true,
        avatarUrl: true,
        bannerUrl: true,
        dados: true,
        sistemaId: true,
        campanhaId: true,
        campanha: { select: { nome: true } },
        ehMonstro: true,
        sistema: { select: { chave: true, nome: true } },
      },
    }),
    banco.participacao.findMany({
      where: { usuarioId: usuario.id },
      select: {
        campanha: { select: { id: true, nome: true, sistemaId: true } },
      },
    }),
  ]);
  return (
    <main>
      <header className="hub-page-heading">
        <div>
          <p className="hub-eyebrow">Sua biblioteca de histórias</p>
          <h1>Personagens</h1>
          <p>
            Reconheça seus personagens de relance. Organize fichas, NPCs e
            monstros por sistema, campanha e status.
          </p>
        </div>
        <LinkCriacao>
          <Icone nome="mais" /> Criar personagem
        </LinkCriacao>
      </header>
      <Colecao
        filtros={["sistema", "campanha", "status"]}
        tipos={["Personagens", "NPCs e monstros"]}
        sistemaInicial={inicial?.nome}
        vazio="Crie seu primeiro personagem ou prepare um NPC para a próxima sessão."
        acaoVazia={
          <LinkCriacao>Criar personagem</LinkCriacao>
        }
        entradas={personagens.map((p) => {
          const resumo = resumirPersonagem(
            p.sistema.chave,
            p.dados,
            p.ehMonstro,
          );
          const candidatas = participacoes
            .map((x) => x.campanha)
            .filter(
              (c) => c.sistemaId === p.sistemaId && c.id !== p.campanhaId,
            );
          return {
            id: p.id,
            nome: p.nome,
            sistema: p.sistema.nome,
            campanha: p.campanha?.nome ?? "Avulsos",
            status: ROTULOS_STATUS[p.status],
            tipo: p.ehMonstro ? "NPCs e monstros" : "Personagens",
            busca: [resumo.progressao, ...resumo.identidade].join(" "),
            conteudo: (
              <CartaoPersonagem
                personagem={{ ...p, resumo }}
                gerenciamento
                detalhes={
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusFicha id={p.id} statusInicial={p.status} />
                      <EditarImagemFicha
                        id={p.id}
                        avatarUrlInicial={p.avatarUrl}
                        bannerUrlInicial={p.bannerUrl}
                      />
                    </div>
                    <MoverOuCopiarFicha
                      personagemId={p.id}
                      campanhaAtualNome={p.campanha?.nome ?? null}
                      candidatas={candidatas}
                    />
                    <GerarCard
                      dados={{
                        titulo: p.nome,
                        subtitulo: p.sistema.nome,
                        linhas: [
                          resumo.progressao,
                          ...resumo.identidade,
                          ROTULOS_STATUS[p.status],
                          p.campanha?.nome ?? "Personagem avulso",
                        ].filter((x): x is string => !!x),
                        imagemUrl: p.avatarUrl ?? retratoPadrao(p.nome),
                      }}
                      nomeArquivo={p.nome}
                    />
                    <BotaoExcluir id={p.id} nome={p.nome} />
                  </>
                }
              />
            ),
          };
        })}
      />
      <details
        id="criar-personagem"
        className="hub-panel mt-8"
        open={personagens.length === 0 || !!inicial}
      >
        <summary className="cursor-pointer font-titulo text-xl">
          Criar uma nova ficha
        </summary>
        <p className="mt-3 text-sm text-texto-suave">
          Escolha o sistema da aventura. NPCs criados aqui também podem ser
          copiados para suas campanhas.
        </p>
        <div className="hub-creation-grid">
          <CriarFicha sistemaInicial={inicial?.chave} />
          <CriarNpc sistemaInicial={inicial?.chave} />
        </div>
      </details>
      <p className="mt-6 text-sm text-texto-suave">
        Quer conhecer outro sistema?{" "}
        <Link href="/sistemas" className="text-ambar-forte underline">
          Explore o catálogo visual
        </Link>
        .
      </p>
    </main>
  );
}
