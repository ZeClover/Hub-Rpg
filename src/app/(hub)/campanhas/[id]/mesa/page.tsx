import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { IniciativaEspectador } from "./iniciativa-espectador";
import { PainelDeVida } from "./painel-de-vida";
import { RastreadorDeIniciativa } from "./rastreador-iniciativa";
import { RelogioDeSessao } from "./relogio-de-sessao";

/*
  Mesa ao Vivo (decisão #46): a tela que o mestre abre durante a sessão,
  separada da tela de organização da campanha. Reúne o que se usa na hora
  de jogar — vida de todo mundo acompanhada sozinha, ordem de iniciativa
  e (decisão #137) um modo espectador pro jogador acompanhar em leitura.

  Só participante entra (mestre ou jogador já ligado à campanha) — quem
  não é nem isso recebe 404, não 403, mesma trava de sempre (decisão
  #13), pra nem revelar que a campanha existe. Jogador nunca edita nada
  aqui, só olha: vida (sem os inimigos — isso é informação de mestre) e
  a ordem de iniciativa que o mestre está controlando.
*/
export default async function PaginaMesaAoVivo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = (await usuarioAtual())!;

  const campanha = await banco.campanha.findUnique({
    where: { id },
    select: { id: true, nome: true, sistema: { select: { chave: true } } },
  });
  if (!campanha) notFound();

  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId: id, usuarioId: usuario.id } },
  });
  if (!participacao) notFound();
  // Mestre auxiliar (decisão #148) tem o mesmo controle da Mesa ao Vivo
  // que o mestre — as rotas que esta tela chama já aceitam os dois papéis.
  const souMestre = participacao.papel === "MESTRE" || participacao.papel === "MESTRE_AUXILIAR";

  const sistemaDef = SISTEMAS.find((s) => s.chave === campanha.sistema.chave);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href={`/campanhas/${id}`}
        className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto"
      >
        ← {campanha.nome}
      </Link>
      <h1 className="mt-3 font-titulo text-3xl">Mesa ao vivo</h1>
      {souMestre ? (
        <p className="mt-2 text-sm text-texto-suave">
          Vida de jogadores e inimigos, acompanhada sozinha, e a ordem de
          iniciativa da cena. Só você edita esta tela.
        </p>
      ) : (
        <p className="mt-2 text-sm text-texto-suave">
          Modo espectador — acompanhe a vida do grupo e a ordem de
          iniciativa que o mestre está controlando.
        </p>
      )}

      <PainelDeVida
        campanhaId={id}
        fichaJogador={sistemaDef?.ficha ?? null}
        fichaInimigo={sistemaDef?.fichaInimigo ?? null}
        mostrarInimigos={souMestre}
      />

      {souMestre ? (
        <>
          <RastreadorDeIniciativa campanhaId={id} />
          <RelogioDeSessao campanhaId={id} />
        </>
      ) : (
        <IniciativaEspectador campanhaId={id} />
      )}
    </main>
  );
}
