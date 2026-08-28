import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { AdicionarInimigo } from "./adicionar-inimigo";
import { EntrarNaCampanha } from "./entrar-na-campanha";

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
      sistema: { select: { chave: true, nome: true } },
    },
  });
  if (!campanha) notFound();

  const sistemaDef = SISTEMAS.find((s) => s.chave === campanha.sistema.chave);
  const ficha = sistemaDef?.ficha ?? null;
  const fichaInimigo = sistemaDef?.fichaInimigo ?? null;

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
      select: { id: true, nome: true, donoId: true },
    }),
  ]);

  const minhaParticipacao = participacoes.find((p) => p.usuarioId === usuario.id);
  const souMestre = minhaParticipacao?.papel === "MESTRE";

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
      <h1 className="mt-3 font-titulo text-3xl">{campanha.nome}</h1>
      <p className="mt-2 text-sm text-texto-suave">{campanha.sistema.nome}</p>

      {souMestre ? (
        <VisaoDoMestre
          campanhaId={campanha.id}
          ficha={ficha}
          fichaInimigo={fichaInimigo}
          origem={origem}
          jogadores={participacoes.filter((p) => p.papel === "JOGADOR")}
          personagensDaCampanha={personagensDaCampanha}
          idDoMestre={usuario.id}
        />
      ) : (
        <VisaoDoJogador
          campanhaId={campanha.id}
          ficha={ficha}
          convidado={!minhaParticipacao}
          meuPersonagem={personagensDaCampanha.find((p) => p.donoId === usuario.id) ?? null}
          minhasFichasDoSistema={await banco.personagem.findMany({
            where: { donoId: usuario.id, sistemaId: campanha.sistemaId },
            select: { id: true, nome: true },
            orderBy: { atualizadoEm: "desc" },
          })}
        />
      )}
    </main>
  );
}

function VisaoDoMestre({
  campanhaId,
  ficha,
  fichaInimigo,
  origem,
  jogadores,
  personagensDaCampanha,
  idDoMestre,
}: {
  campanhaId: string;
  ficha: string | null;
  fichaInimigo: string | null;
  origem: string;
  jogadores: { usuarioId: string; usuario: { nome: string | null; email: string } }[];
  personagensDaCampanha: { id: string; nome: string; donoId: string }[];
  idDoMestre: string;
}) {
  const inimigos = personagensDaCampanha.filter((p) => p.donoId === idDoMestre);

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
          Manda esse endereço pros seus jogadores. Cada um escolhe a ficha dele
          ao abrir — só aparecem fichas do sistema desta campanha.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Jogadores</h2>
        {jogadores.length === 0 ? (
          <p className="mt-3 text-sm text-texto-suave">Ninguém entrou ainda.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jogadores.map((jogador) => {
              const personagem = personagensDaCampanha.find(
                (p) => p.donoId === jogador.usuarioId,
              );
              return (
                <li
                  key={jogador.usuarioId}
                  className="rounded-lg border border-borda bg-superficie p-5"
                >
                  <p className="font-titulo text-base">
                    {jogador.usuario.nome ?? jogador.usuario.email}
                  </p>
                  {personagem ? (
                    ficha ? (
                      <a
                        href={`${ficha}?id=${personagem.id}`}
                        className="mt-1 inline-block text-sm text-ambar-forte underline underline-offset-2"
                      >
                        {personagem.nome}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-texto-suave">{personagem.nome}</p>
                    )
                  ) : (
                    <p className="mt-1 text-sm text-texto-suave">
                      Ainda não escolheu uma ficha.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Fichas de inimigo</h2>
        <p className="mt-2 text-sm text-texto-suave">
          Fichas suas, só pra organizar a mesa — os jogadores não veem esta
          lista.
        </p>
        {inimigos.length > 0 && (
          <ul className="mt-4 space-y-2">
            {inimigos.map((inimigo) => (
              <li key={inimigo.id}>
                {fichaInimigo ? (
                  <a
                    href={`${fichaInimigo}?id=${inimigo.id}`}
                    className="text-sm text-texto underline decoration-borda underline-offset-2 hover:text-ambar-forte"
                  >
                    {inimigo.nome}
                  </a>
                ) : (
                  <span className="text-sm text-texto">{inimigo.nome}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {fichaInimigo ? (
          <AdicionarInimigo campanhaId={campanhaId} ficha={fichaInimigo} />
        ) : (
          <p className="mt-3 text-sm text-texto-suave">
            O sistema desta campanha ainda não tem ficha de inimigo própria no Hub.
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
  meuPersonagem,
  minhasFichasDoSistema,
}: {
  campanhaId: string;
  ficha: string | null;
  convidado: boolean;
  meuPersonagem: { id: string; nome: string } | null;
  minhasFichasDoSistema: { id: string; nome: string }[];
}) {
  return (
    <section className="mt-10 rounded-lg border border-borda bg-superficie p-6">
      <p className="font-titulo text-xs uppercase tracking-[0.25em] text-texto-suave">
        {convidado ? "Você foi convidado" : "Sua ficha nesta campanha"}
      </p>
      {ficha ? (
        <EntrarNaCampanha
          campanhaId={campanhaId}
          ficha={ficha}
          minhasFichas={minhasFichasDoSistema}
          personagemAtualId={meuPersonagem?.id ?? null}
        />
      ) : (
        <p className="mt-3 text-sm text-texto-suave">
          O sistema desta campanha ainda não tem ficha própria no Hub.
        </p>
      )}
    </section>
  );
}
