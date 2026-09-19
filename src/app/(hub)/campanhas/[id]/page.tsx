import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { AdicionarInimigo } from "./adicionar-inimigo";
import { Avisos, type AvisoView } from "./avisos";
import { Chat } from "./chat";
import { CriarPersonagem } from "./criar-personagem";
import { Enquetes, type EnqueteView } from "./enquetes";
import { EntrarNaCampanha } from "./entrar-na-campanha";
import { ExcluirCampanha } from "./excluir-campanha";
import { IdentidadeCampanha } from "./identidade-campanha";
import { ManualDoMestre } from "./manual-mestre";
import { RemoverJogador } from "./remover-jogador";
import { SairDaCampanha } from "./sair-da-campanha";
import { Sessoes, type SessaoView } from "./sessoes";

/*
  A campanha em si. O que aparece muda conforme quem está olhando:

  - Mestre: link de convite, lista de jogadores (com a ficha que cada um
    ligou, se já ligou), e as fichas de inimigo/NPC que ele mesmo criou.
  - Jogador (ou visitante recém-chegado pelo link): só a própria ficha —
    escolher qual delas representa ele nesta mesa, ou trocar depois. Nunca
    vê a ficha dos outros jogadores nem os inimigos: isso é só do mestre.

  Não existe um segredo separado pra "entrar" — o próprio endereço da
  campanha é o convite (um UUID, como o link de leitura das fichas, decisão
  #46). Quem tem o link e está logado consegue ver esta tela; virar jogador
  de fato exige escolher uma ficha sua, que é quando a Participacao nasce.
*/
export default async function PaginaCampanha({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = (await usuarioAtual())!;

  const campanha = await banco.campanha.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      sistemaId: true,
      capaUrl: true,
      descricao: true,
      tags: true,
      sistema: { select: { chave: true, nome: true } },
    },
  });
  if (!campanha) notFound();

  const sistemaDef = SISTEMAS.find((s) => s.chave === campanha.sistema.chave);
  const ficha = sistemaDef?.ficha ?? null;
  const fichaInimigo = sistemaDef?.fichaInimigo ?? null;
  const escudoMestre = sistemaDef?.escudoMestre ?? null;
  const grimorio = sistemaDef?.grimorio ?? null;

  const [participacoes, personagensDaCampanha] = await Promise.all([
    banco.participacao.findMany({
      where: { campanhaId: id },
      select: {
        papel: true,
        usuarioId: true,
        usuario: { select: { nome: true, email: true } },
      },
    }),
    banco.personagem.findMany({
      where: { campanhaId: id },
      select: { id: true, nome: true, donoId: true, ehMonstro: true },
    }),
  ]);

  const minhaParticipacao = participacoes.find((p) => p.usuarioId === usuario.id);
  const souMestre = minhaParticipacao?.papel === "MESTRE";

  // O Manual do Mestre só é buscado quando quem pergunta é mestre — a
  // consulta nem acontece pra jogador, então o campo nunca sai do servidor
  // pra quem não devia ver (decisão #13).
  const manualMestre = souMestre
    ? (
        await banco.campanha.findUnique({
          where: { id },
          select: { manualMestre: true },
        })
      )?.manualMestre ?? ""
    : "";

  // Sessões (decisão #135): `notasMestre` segue a mesma regra do Manual do
  // Mestre — a consulta que busca esse campo só roda quando quem pergunta
  // já é confirmadamente mestre.
  const [sessoesBase, notasPorSessao] = await Promise.all([
    banco.sessao.findMany({
      where: { campanhaId: id },
      orderBy: { numero: "desc" },
      select: {
        id: true,
        numero: true,
        data: true,
        resumoPublico: true,
        mudancasImportantes: true,
        presencas: { select: { usuarioId: true, resposta: true } },
      },
    }),
    souMestre
      ? banco.sessao.findMany({ where: { campanhaId: id }, select: { id: true, notasMestre: true } })
      : Promise.resolve([]),
  ]);
  const notasMap = new Map(notasPorSessao.map((s) => [s.id, s.notasMestre]));
  const sessoes: SessaoView[] = sessoesBase.map((s) => ({
    ...s,
    data: s.data.toISOString(),
    notasMestre: notasMap.get(s.id) ?? null,
  }));
  const pessoas = participacoes.map((p) => ({
    usuarioId: p.usuarioId,
    nome: p.usuario.nome ?? p.usuario.email,
  }));
  const agoraMs = new Date().getTime();

  // Avisos e enquetes (decisão #136): sem campo de mestre nenhum aqui, então
  // — diferente do Manual do Mestre e das notas de sessão — a mesma consulta
  // serve pra mestre e jogador.
  const [avisosBase, enquetesBase] = await Promise.all([
    banco.aviso.findMany({
      where: { campanhaId: id },
      orderBy: { criadoEm: "desc" },
      select: { id: true, texto: true, fixado: true, criadoEm: true },
    }),
    banco.enquete.findMany({
      where: { campanhaId: id },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        pergunta: true,
        opcoes: true,
        encerrada: true,
        criadoEm: true,
        votos: { select: { usuarioId: true, opcaoIndex: true } },
      },
    }),
  ]);
  const avisos: AvisoView[] = avisosBase.map((a) => ({
    ...a,
    criadoEm: a.criadoEm.toISOString(),
  }));
  const enquetes: EnqueteView[] = enquetesBase.map((e) => ({
    ...e,
    criadoEm: e.criadoEm.toISOString(),
  }));

  const cabecalhos = await headers();
  const origem = `${cabecalhos.get("x-forwarded-proto") ?? "https"}://${cabecalhos.get("host")}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href="/campanhas"
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
      >
        ← Campanhas
      </Link>
      {campanha.capaUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- capa é uma URL externa qualquer, não um asset otimizável pelo Next.
        <img
          src={campanha.capaUrl}
          alt=""
          className="mt-4 h-40 w-full rounded-lg border border-borda object-cover"
        />
      )}
      <h1 className="mt-3 font-titulo text-3xl">{campanha.nome}</h1>
      <p className="mt-2 text-sm text-texto-suave">{campanha.sistema.nome}</p>
      {campanha.descricao && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-texto-suave">
          {campanha.descricao}
        </p>
      )}
      {campanha.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {campanha.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-borda px-3 py-0.5 text-xs text-texto-suave"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {souMestre && (
        <Link
          href={`/campanhas/${campanha.id}/mesa`}
          className="mt-4 inline-block rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte transition hover:bg-ambar/20"
        >
          Abrir Mesa ao vivo →
        </Link>
      )}

      {souMestre ? (
        <VisaoDoMestre
          campanhaId={campanha.id}
          nome={campanha.nome}
          ficha={ficha}
          fichaInimigo={fichaInimigo}
          origem={origem}
          jogadores={participacoes.filter((p) => p.papel === "JOGADOR")}
          personagensDaCampanha={personagensDaCampanha}
          idDoMestre={usuario.id}
          manualMestre={manualMestre}
          escudoMestre={escudoMestre}
          grimorio={grimorio}
          capaUrl={campanha.capaUrl ?? ""}
          descricao={campanha.descricao ?? ""}
          tags={campanha.tags}
          sessoes={sessoes}
          pessoas={pessoas}
          agoraMs={agoraMs}
          avisos={avisos}
          enquetes={enquetes}
        />
      ) : (
        <VisaoDoJogador
          campanhaId={campanha.id}
          ficha={ficha}
          convidado={!minhaParticipacao}
          meuUsuarioId={usuario.id}
          meusPersonagens={personagensDaCampanha.filter((p) => p.donoId === usuario.id)}
          minhasFichasDoSistema={await banco.personagem.findMany({
            where: { donoId: usuario.id, sistemaId: campanha.sistemaId },
            select: { id: true, nome: true },
            orderBy: { atualizadoEm: "desc" },
          })}
          grimorio={grimorio}
          sessoes={sessoes}
          pessoas={pessoas}
          agoraMs={agoraMs}
          avisos={avisos}
          enquetes={enquetes}
        />
      )}
    </main>
  );
}

function VisaoDoMestre({
  campanhaId,
  nome,
  ficha,
  fichaInimigo,
  origem,
  jogadores,
  personagensDaCampanha,
  idDoMestre,
  manualMestre,
  escudoMestre,
  grimorio,
  capaUrl,
  descricao,
  tags,
  sessoes,
  pessoas,
  agoraMs,
  avisos,
  enquetes,
}: {
  campanhaId: string;
  nome: string;
  ficha: string | null;
  fichaInimigo: string | null;
  origem: string;
  jogadores: { usuarioId: string; usuario: { nome: string | null; email: string } }[];
  personagensDaCampanha: { id: string; nome: string; donoId: string; ehMonstro: boolean }[];
  idDoMestre: string;
  manualMestre: string;
  escudoMestre: string | null;
  grimorio: string | null;
  capaUrl: string;
  descricao: string;
  tags: string[];
  sessoes: SessaoView[];
  pessoas: { usuarioId: string; nome: string }[];
  agoraMs: number;
  avisos: AvisoView[];
  enquetes: EnqueteView[];
}) {
  const fichasDoMestre = personagensDaCampanha.filter((p) => p.donoId === idDoMestre);
  const monstros = fichasDoMestre.filter((p) => p.ehMonstro);
  const personagensDoMestre = fichasDoMestre.filter((p) => !p.ehMonstro);

  return (
    <>
      <section className="mt-10 rounded-lg border border-borda bg-superficie p-6">
        <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          Link de convite
        </p>
        <p className="mt-2 break-all rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto">
          {origem}/campanhas/{campanhaId}
        </p>
        <p className="mt-2 text-xs text-texto-suave">
          Manda esse endereço pros seus jogadores. Cada um escolhe a ficha (ou
          fichas — dá pra ligar mais de uma) ao abrir — só aparecem fichas do
          sistema desta campanha.
        </p>
        {escudoMestre && (
          <a
            href={escudoMestre}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-ambar-forte underline underline-offset-2"
          >
            Abrir Escudo do Mestre (referência rápida de regras)
          </a>
        )}
        {grimorio && (
          <a
            href={grimorio}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-sm text-ambar-forte underline underline-offset-2"
          >
            📖 Abrir Grimório (manual do jogador e do mestre)
          </a>
        )}
        <ExcluirCampanha campanhaId={campanhaId} nome={nome} />
      </section>

      <IdentidadeCampanha
        campanhaId={campanhaId}
        capaUrlInicial={capaUrl}
        descricaoInicial={descricao}
        tagsIniciais={tags.join(", ")}
      />

      <ManualDoMestre campanhaId={campanhaId} textoInicial={manualMestre} />

      <Sessoes
        campanhaId={campanhaId}
        sessoes={sessoes}
        souMestre
        meuUsuarioId={idDoMestre}
        pessoas={pessoas}
        agoraMs={agoraMs}
      />

      <Avisos campanhaId={campanhaId} avisos={avisos} souMestre />

      <Enquetes
        campanhaId={campanhaId}
        enquetes={enquetes}
        souMestre
        meuUsuarioId={idDoMestre}
      />

      <Chat campanhaId={campanhaId} meuUsuarioId={idDoMestre} />

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Jogadores</h2>
        {jogadores.length === 0 ? (
          <p className="mt-3 text-sm text-texto-suave">Ninguém entrou ainda.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jogadores.map((jogador) => {
              const personagens = personagensDaCampanha.filter(
                (p) => p.donoId === jogador.usuarioId,
              );
              return (
                <li
                  key={jogador.usuarioId}
                  className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-5"
                >
                  <div>
                    <p className="font-titulo text-base">
                      {jogador.usuario.nome ?? jogador.usuario.email}
                    </p>
                    {personagens.length > 0 ? (
                      <ul className="mt-1 space-y-0.5">
                        {personagens.map((personagem) => (
                          <li key={personagem.id}>
                            {ficha ? (
                              <a
                                href={`${ficha}?id=${personagem.id}`}
                                className="inline-block text-sm text-ambar-forte underline underline-offset-2"
                              >
                                {personagem.nome}
                              </a>
                            ) : (
                              <p className="text-sm text-texto-suave">{personagem.nome}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-texto-suave">
                        Ainda não escolheu uma ficha.
                      </p>
                    )}
                  </div>
                  <RemoverJogador
                    campanhaId={campanhaId}
                    usuarioId={jogador.usuarioId}
                    nome={jogador.usuario.nome ?? jogador.usuario.email}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Fichas de personagem e monstro</h2>
        <p className="mt-2 text-sm text-texto-suave">
          Fichas suas, criadas já dentro desta campanha — os jogadores não
          veem esta lista.
        </p>

        <h3 className="mt-5 font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave">
          Personagens
        </h3>
        {personagensDoMestre.length > 0 && (
          <ul className="mt-3 space-y-2">
            {personagensDoMestre.map((personagem) => (
              <li key={personagem.id}>
                {ficha ? (
                  <a
                    href={`${ficha}?id=${personagem.id}`}
                    className="text-sm text-texto underline decoration-borda underline-offset-2 hover:text-ambar-forte"
                  >
                    {personagem.nome}
                  </a>
                ) : (
                  <span className="text-sm text-texto">{personagem.nome}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {ficha ? (
          <CriarPersonagem campanhaId={campanhaId} ficha={ficha} />
        ) : (
          <p className="mt-3 text-sm text-texto-suave">
            O sistema desta campanha ainda não tem ficha própria no Hub.
          </p>
        )}

        <h3 className="mt-6 font-titulo text-xs uppercase tracking-[0.2em] text-texto-suave">
          Monstros
        </h3>
        {monstros.length > 0 && (
          <ul className="mt-3 space-y-2">
            {monstros.map((monstro) => (
              <li key={monstro.id}>
                {fichaInimigo ? (
                  <a
                    href={`${fichaInimigo}?id=${monstro.id}`}
                    className="text-sm text-texto underline decoration-borda underline-offset-2 hover:text-ambar-forte"
                  >
                    {monstro.nome}
                  </a>
                ) : (
                  <span className="text-sm text-texto">{monstro.nome}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {fichaInimigo ? (
          <AdicionarInimigo campanhaId={campanhaId} ficha={fichaInimigo} />
        ) : (
          <p className="mt-3 text-sm text-texto-suave">
            O sistema desta campanha ainda não tem ficha de monstro própria no Hub.
          </p>
        )}
      </section>
    </>
  );
}

function VisaoDoJogador({
  campanhaId,
  ficha,
  convidado,
  meuUsuarioId,
  meusPersonagens,
  minhasFichasDoSistema,
  grimorio,
  sessoes,
  pessoas,
  agoraMs,
  avisos,
  enquetes,
}: {
  campanhaId: string;
  ficha: string | null;
  convidado: boolean;
  meuUsuarioId: string;
  meusPersonagens: { id: string; nome: string }[];
  minhasFichasDoSistema: { id: string; nome: string }[];
  grimorio: string | null;
  sessoes: SessaoView[];
  pessoas: { usuarioId: string; nome: string }[];
  agoraMs: number;
  avisos: AvisoView[];
  enquetes: EnqueteView[];
}) {
  return (
    <>
      <section className="mt-10 rounded-lg border border-borda bg-superficie p-6">
        <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
          {convidado ? "Você foi convidado" : "Suas fichas nesta campanha"}
        </p>
        {ficha ? (
          <EntrarNaCampanha
            campanhaId={campanhaId}
            ficha={ficha}
            minhasFichas={minhasFichasDoSistema}
            meusPersonagens={meusPersonagens}
          />
        ) : (
          <p className="mt-3 text-sm text-texto-suave">
            O sistema desta campanha ainda não tem ficha própria no Hub.
          </p>
        )}
        {grimorio && (
          <a
            href={grimorio}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-sm text-ambar-forte underline underline-offset-2"
          >
            📖 Abrir Grimório (aprenda o sistema)
          </a>
        )}
        {!convidado && <SairDaCampanha campanhaId={campanhaId} usuarioId={meuUsuarioId} />}
      </section>

      {!convidado && (
        <>
          <Sessoes
            campanhaId={campanhaId}
            sessoes={sessoes}
            souMestre={false}
            meuUsuarioId={meuUsuarioId}
            pessoas={pessoas}
            agoraMs={agoraMs}
          />

          <Avisos campanhaId={campanhaId} avisos={avisos} souMestre={false} />

          <Enquetes
            campanhaId={campanhaId}
            enquetes={enquetes}
            souMestre={false}
            meuUsuarioId={meuUsuarioId}
          />

          <Chat campanhaId={campanhaId} meuUsuarioId={meuUsuarioId} />
        </>
      )}
    </>
  );
}
