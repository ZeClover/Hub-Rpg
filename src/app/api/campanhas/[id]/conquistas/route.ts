import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Publicar uma conquista da campanha (decisão #140) — só o mestre. Sem
  relação nenhuma com as conquistas de Campanha Livre (aquelas vivem no
  `dados` json da própria ficha daquele sistema). Sem GET: a lista chega
  junto da página da campanha, mesmo padrão de Sessões/Avisos/Enquetes.
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId: usuario.id } },
  });
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const titulo = typeof corpo?.titulo === "string" ? corpo.titulo.trim() : "";
  const descricao = typeof corpo?.descricao === "string" ? corpo.descricao.trim() : "";
  if (!titulo) {
    return NextResponse.json({ erro: "título é obrigatório" }, { status: 400 });
  }

  const conquista = await banco.conquista.create({
    data: { campanhaId, titulo, descricao: descricao || null },
    select: { id: true, titulo: true, descricao: true, criadoEm: true },
  });

  return NextResponse.json({ conquista }, { status: 201 });
}
