import Link from "next/link";
import { notFound } from "next/navigation";

import { banco } from "@/lib/banco";
import { SISTEMAS } from "@/lib/sistemas";
import { usuarioAtual } from "@/lib/usuario";

import { PainelDeVida } from "./painel-de-vida";
import { RastreadorDeIniciativa } from "./rastreador-iniciativa";

/*
  Mesa ao Vivo (decisão #46): a tela que o mestre abre durante a sessão,
  separada da tela de organização da campanha. Reúne o que se usa na hora
  de jogar — vida de todo mundo acompanhada sozinha, e ordem de
  iniciativa — em vez de misturar com convite, jogadores e Manual do
  Mestre, que são coisas de "antes/depois da sessão".

  Só o mestre entra: mesma trava de sempre, 404 pra quem não é (decisão
  #13) — nem revela que a campanha existe pra quem não devia estar aqui.
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
  if (participacao?.papel !== "MESTRE") notFound();

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
      <p className="mt-2 text-sm text-texto-suave">
        Vida de jogadores e inimigos, acompanhada sozinha, e a ordem de
        iniciativa da cena. Só você vê esta tela.
      </p>

      <PainelDeVida
        campanhaId={id}
        fichaJogador={sistemaDef?.ficha ?? null}
        fichaInimigo={sistemaDef?.fichaInimigo ?? null}
      />

      <RastreadorDeIniciativa campanhaId={id} />
    </main>
  );
}
