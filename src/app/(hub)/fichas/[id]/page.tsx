import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { GerenciadorItens, type LocalItem } from "../../itens-compartilhados";
import { Companheiros } from "../companheiros";
import { CompartilharFicha } from "../compartilhar-ficha";
import { CriarSandbox } from "../criar-sandbox";
import { AvatarFicha, EditarImagemFicha, ROTULO_STATUS, StatusFicha } from "../organizacao-ficha";
import { TransferirDono } from "../transferir-dono";

/*
  Página geral do personagem (decisão #149, ideia #135) — gerenciamento ao
  redor da ficha oficial, sem duplicá-la: status, imagem, compartilhamento
  (com QR Code, ideia #132), companheiros, itens e veículos. A ficha em si
  — os números e regras do sistema — continua só no arquivo HTML daquele
  sistema (decisão #17); esta página nunca lê nem escreve `dados`.
*/
export default async function PaginaDoPersonagem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = (await usuarioAtual())!;

  const personagem = await banco.personagem.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      donoId: true,
      status: true,
      avatarUrl: true,
      bannerUrl: true,
      compartilhado: true,
      ehMonstro: true,
      sistemaId: true,
      campanhaId: true,
      sistema: { select: { chave: true, nome: true } },
      campanha: { select: { nome: true } },
    },
  });
  if (!personagem || personagem.donoId !== usuario.id) notFound();

  const [outrosPersonagens, itens, veiculos, companheiros] = await Promise.all([
    banco.personagem.findMany({
      where: { donoId: usuario.id, id: { not: id } },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    banco.item.findMany({
      where: { personagemId: id },
      orderBy: { criadoEm: "desc" },
      select: { id: true, nome: true, descricao: true, quantidade: true },
    }),
    banco.veiculo.findMany({
      where: { donoId: id },
      select: { id: true, nome: true, descricao: true, capacidade: true },
    }),
    banco.companheiro.findMany({
      where: { personagemId: id },
      select: { companheiro: { select: { id: true, nome: true } } },
    }),
  ]);

  // Trocar o dono (decisão #172): só faz sentido pra ficha ligada numa
  // campanha — é a lista de participações dela que diz pra quem dá pra
  // passar. Ficha avulsa nem busca isso.
  const outrosParticipantes = personagem.campanhaId
    ? (
        await banco.participacao.findMany({
          where: { campanhaId: personagem.campanhaId, NOT: { usuarioId: usuario.id } },
          select: { usuarioId: true, usuario: { select: { nome: true, email: true } } },
        })
      ).map((p) => ({ usuarioId: p.usuarioId, nome: p.usuario.nome ?? p.usuario.email }))
    : [];

  const sistemaDef = SISTEMAS.find((s) => s.chave === personagem.sistema.chave);
  const arquivoFicha = personagem.ehMonstro ? sistemaDef?.fichaInimigo : sistemaDef?.ficha;
  const urlFicha = arquivoFicha ? `${arquivoFicha}?id=${personagem.id}` : null;

  const cabecalhos = await headers();
  const origem = `${cabecalhos.get("x-forwarded-proto") ?? "https"}://${cabecalhos.get("host")}`;
  const linkCompartilhavel = urlFicha ? `${origem}${urlFicha}` : `${origem}/fichas/${personagem.id}`;

  const destinosDeItem: { rotulo: string; local: LocalItem }[] = [
    { rotulo: "Biblioteca pessoal", local: { donoId: usuario.id } },
    ...outrosPersonagens.map((p) => ({ rotulo: p.nome, local: { personagemId: p.id } })),
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href="/fichas"
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
      >
        ← Fichas
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <AvatarFicha nome={personagem.nome} avatarUrl={personagem.avatarUrl} />
        <div>
          <h1 className="font-titulo text-3xl">{personagem.nome}</h1>
          <p className="mt-1 text-sm text-texto-suave">
            {personagem.sistema.nome}
            {personagem.campanha && ` · ${personagem.campanha.nome}`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusFicha id={personagem.id} statusInicial={personagem.status} />
        <EditarImagemFicha
          id={personagem.id}
          avatarUrlInicial={personagem.avatarUrl}
          bannerUrlInicial={personagem.bannerUrl}
        />
        {urlFicha && (
          <a
            href={urlFicha}
            className="text-sm text-ambar-forte underline underline-offset-2"
          >
            Abrir ficha →
          </a>
        )}
      </div>

      <p className="mt-2 text-xs text-texto-suave">
        Status atual: {ROTULO_STATUS[personagem.status] ?? personagem.status}
      </p>

      {outrosParticipantes.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-texto-suave">
            Transferir esta ficha pra outra pessoa da campanha:
          </p>
          <div className="mt-1">
            <TransferirDono
              personagemId={personagem.id}
              nomeFicha={personagem.nome}
              donoAtualId={personagem.donoId}
              candidatos={outrosParticipantes}
            />
          </div>
        </div>
      )}

      <div className="mt-3">
        <CriarSandbox personagemId={personagem.id} />
      </div>

      <CompartilharFicha
        personagemId={personagem.id}
        link={linkCompartilhavel}
        compartilhadoInicial={personagem.compartilhado}
      />

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Companheiros</h2>
        <Companheiros
          personagemId={personagem.id}
          companheiros={companheiros.map((c) => c.companheiro)}
          candidatas={outrosPersonagens}
        />
      </section>

      <section className="mt-8">
        <h2 className="font-titulo text-xl">Itens</h2>
        <div className="mt-3">
          <GerenciadorItens
            titulo="Carregando"
            itens={itens}
            criarLocal={{ personagemId: personagem.id }}
            destinos={destinosDeItem}
            podeGerenciar
          />
        </div>
      </section>

      {veiculos.length > 0 && (
        <section className="mt-8">
          <h2 className="font-titulo text-xl">Veículos</h2>
          <ul className="mt-3 space-y-2">
            {veiculos.map((veiculo) => (
              <li
                key={veiculo.id}
                className="rounded-lg border border-borda bg-superficie p-4 text-sm text-texto"
              >
                {veiculo.nome}
                {veiculo.capacidade !== null && (
                  <span className="text-texto-suave"> · capacidade {veiculo.capacidade}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
