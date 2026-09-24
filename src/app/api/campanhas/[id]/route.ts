import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { ehMestreOuAuxiliar, ehMestreTitular } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Excluir a campanha inteira. Só o mestre TITULAR pode — a única coisa que
  o mestre auxiliar nunca tem (decisão #148, ideia #115).

  As fichas ligadas a ela (de jogador ou de inimigo) não são apagadas —
  ficam soltas, campanhaId volta a null, exatamente como qualquer ficha
  nasce fora de campanha nenhuma (migração 0006 corrigiu o vínculo do
  banco pra isso funcionar assim). Participações e sessões da campanha,
  essas sim, somem junto — não fazem sentido sem a campanha.
*/
export async function DELETE(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await ehMestreTitular(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  await banco.campanha.delete({ where: { id: campanhaId } });
  return NextResponse.json({ ok: true });
}

/*
  Identidade da campanha (decisão #134): capa, descrição e tags — só o
  mestre edita, mas os três campos aparecem pra qualquer participante (não
  são segredo como o Manual do Mestre). `tags` sempre substitui a lista
  inteira, mais simples que um diff de adicionar/remover item por item.
*/
export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const temCapa = typeof corpo?.capaUrl === "string" || corpo?.capaUrl === null;
  const temDescricao = typeof corpo?.descricao === "string" || corpo?.descricao === null;
  const temTags =
    Array.isArray(corpo?.tags) && corpo.tags.every((t: unknown) => typeof t === "string");
  if (!temCapa && !temDescricao && !temTags) {
    return NextResponse.json(
      { erro: "capaUrl, descricao ou tags é obrigatório" },
      { status: 400 },
    );
  }

  const campanha = await banco.campanha.update({
    where: { id: campanhaId },
    data: {
      ...(temCapa ? { capaUrl: corpo.capaUrl } : {}),
      ...(temDescricao ? { descricao: corpo.descricao } : {}),
      ...(temTags ? { tags: corpo.tags as string[] } : {}),
    },
    select: { id: true, capaUrl: true, descricao: true, tags: true },
  });

  return NextResponse.json({ campanha });
}
