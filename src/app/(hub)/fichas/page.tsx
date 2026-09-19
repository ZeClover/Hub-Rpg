import { banco } from "@/lib/banco";
import { ROTULO_SITUACAO, SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { GerarCard } from "../gerar-card";
import { CriarFicha } from "./criar-ficha";
import { CriarNpc } from "./criar-npc";
import { BotaoExcluir } from "./excluir-ficha";
import { FavoritarSistema } from "./favoritar-sistema";
import { MoverOuCopiarFicha } from "./mover-ou-copiar-ficha";
import { AvatarFicha, EditarImagemFicha, ROTULO_STATUS, StatusFicha } from "./organizacao-ficha";

type Personagem = {
  id: string;
  nome: string;
  status: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  sistemaId: string;
  campanhaId: string | null;
  campanha: { nome: string } | null;
  ehMonstro: boolean;
  sistema: { chave: string; nome: string };
};

export default async function Fichas() {
  // O layout do Hub já garantiu que existe alguém logado.
  const usuario = (await usuarioAtual())!;

  const [personagens, dadosUsuario, minhasParticipacoes] = await Promise.all([
    banco.personagem.findMany({
      where: { donoId: usuario.id },
      orderBy: { atualizadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        status: true,
        avatarUrl: true,
        bannerUrl: true,
        sistemaId: true,
        campanhaId: true,
        campanha: { select: { nome: true } },
        // decisão #143: precisa saber se é ficha de jogador ou de
        // NPC/monstro — as duas abrem em arquivos de ficha diferentes
        // (`sistema.ficha` vs `sistema.fichaInimigo`), então sem isto
        // todo monstro linkava (errado) pra ficha de jogador.
        ehMonstro: true,
        sistema: { select: { chave: true, nome: true } },
      },
    }),
    banco.usuario.findUnique({
      where: { id: usuario.id },
      select: { sistemasFavoritos: true },
    }),
    // Pra "Mover"/"Copiar" (decisão #139): campanhas do mesmo sistema onde
    // a própria pessoa já participa (mestre ou jogador), sejam candidatas
    // pra cada ficha.
    banco.participacao.findMany({
      where: { usuarioId: usuario.id },
      select: { campanha: { select: { id: true, nome: true, sistemaId: true } } },
    }),
  ]);
  const favoritos = new Set(dadosUsuario?.sistemasFavoritos ?? []);
  // Favoritos primeiro (decisão #134); dentro de cada grupo, mesma ordem de
  // sempre (a ordem que os sistemas aparecem em `SISTEMAS`).
  const sistemasOrdenados = [...SISTEMAS].sort((a, b) => {
    const aFav = favoritos.has(a.chave) ? 0 : 1;
    const bFav = favoritos.has(b.chave) ? 0 : 1;
    return aFav - bFav;
  });

  const personagensDoJogador = personagens.filter((p) => !p.ehMonstro);
  const npcsEMonstros = personagens.filter((p) => p.ehMonstro);
  const candidatasDe = (p: Personagem) =>
    minhasParticipacoes
      .map((part) => part.campanha)
      .filter((c) => c.sistemaId === p.sistemaId && c.id !== p.campanhaId);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-titulo text-3xl">Fichas</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-texto-suave">
        Uma ficha por sistema de regras. Cada uma conhece as regras do seu
        sistema e calcula os números sozinha.
      </p>

      {personagensDoJogador.length > 0 && (
        <ul className="mt-10 space-y-3">
          {personagensDoJogador.map((personagem) => (
            <CartaoFicha
              key={personagem.id}
              personagem={personagem}
              candidatas={candidatasDe(personagem)}
            />
          ))}
        </ul>
      )}

      <CriarFicha />

      <h2 className="mt-14 font-titulo text-xl">NPCs e monstros</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Sua biblioteca pessoal (decisão #143) — crie avulso aqui e depois
        &quot;Copie&quot; pra dentro de qualquer campanha do sistema certo
        quando precisar, quantas vezes quiser. A ficha original nunca muda.
      </p>
      {npcsEMonstros.length > 0 && (
        <ul className="mt-4 space-y-3">
          {npcsEMonstros.map((personagem) => (
            <CartaoFicha
              key={personagem.id}
              personagem={personagem}
              candidatas={candidatasDe(personagem)}
            />
          ))}
        </ul>
      )}
      <CriarNpc />

      <h2 className="mt-14 font-titulo text-xl">Sistemas do Hub</h2>
      <ul className="mt-4 space-y-3">
        {sistemasOrdenados.map((sistema) => (
          <li
            key={sistema.chave}
            className="rounded-lg border border-borda bg-superficie p-5 opacity-80"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <FavoritarSistema chave={sistema.chave} favoritoInicial={favoritos.has(sistema.chave)} />
                <p className="font-titulo text-lg">{sistema.nome}</p>
              </div>
              <span
                className={
                  sistema.situacao === "pronta"
                    ? "shrink-0 rounded-full border border-ambar/40 bg-ambar/10 px-3 py-0.5 text-xs text-ambar-forte"
                    : "shrink-0 rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
                }
              >
                {ROTULO_SITUACAO[sistema.situacao]}
              </span>
            </div>
            <p className="mt-1 text-sm text-texto-suave">{sistema.descricao}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm leading-relaxed text-texto-suave">
        Cada ficha criada aqui salva sozinha na sua conta — sem botão de
        salvar, e ela te segue em qualquer aparelho.
      </p>
    </main>
  );
}

function CartaoFicha({
  personagem,
  candidatas,
}: {
  personagem: Personagem;
  candidatas: { id: string; nome: string }[];
}) {
  const sistema = SISTEMAS.find((s) => s.chave === personagem.sistema.chave);
  const arquivoFicha = personagem.ehMonstro ? sistema?.fichaInimigo : sistema?.ficha;
  const url = arquivoFicha ? `${arquivoFicha}?id=${personagem.id}` : null;
  const conteudo = (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="font-titulo text-lg">{personagem.nome}</p>
      <span className="shrink-0 text-xs text-texto-suave">{personagem.sistema.nome}</span>
    </div>
  );

  return (
    <li className="flex items-start gap-3 rounded-lg border border-borda bg-superficie p-5 transition hover:border-ambar/40">
      <AvatarFicha nome={personagem.nome} avatarUrl={personagem.avatarUrl} />
      <div className="min-w-0 flex-1">
        {url ? (
          <a href={url} className="block">
            {conteudo}
          </a>
        ) : (
          <div className="opacity-60">{conteudo}</div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <StatusFicha id={personagem.id} statusInicial={personagem.status} />
          <EditarImagemFicha
            id={personagem.id}
            avatarUrlInicial={personagem.avatarUrl}
            bannerUrlInicial={personagem.bannerUrl}
          />
        </div>
        <div className="mt-2">
          <MoverOuCopiarFicha
            personagemId={personagem.id}
            campanhaAtualNome={personagem.campanha?.nome ?? null}
            candidatas={candidatas}
          />
        </div>
        <div className="mt-2">
          <GerarCard
            dados={{
              titulo: personagem.nome,
              subtitulo: personagem.sistema.nome,
              linhas: [
                ROTULO_STATUS[personagem.status] ?? personagem.status,
                personagem.campanha ? `Em ${personagem.campanha.nome}` : "Ficha avulsa",
              ],
              imagemUrl: personagem.avatarUrl,
            }}
            nomeArquivo={personagem.nome}
          />
        </div>
      </div>
      <BotaoExcluir id={personagem.id} nome={personagem.nome} />
    </li>
  );
}
