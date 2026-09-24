import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { notificarParticipantes } from "@/lib/notificacoes";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Aviso fixado no mural da campanha (decisão #136) — só o mestre (ou mestre
  auxiliar, decisão #148) publica. Sem GET: a lista de avisos chega junto
  da página da campanha (Server Component), mesmo padrão de Sessões.
*/
export async function POST(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await ehMestreOuAuxiliar(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  const texto = typeof corpo?.texto === "string" ? corpo.texto.trim() : "";
  if (!texto) {
    return NextResponse.json({ erro: "texto é obrigatório" }, { status: 400 });
  }

  const aviso = await banco.aviso.create({
    data: { campanhaId, autorId: usuario.id, texto },
    select: { id: true, texto: true, fixado: true, criadoEm: true, atualizadoEm: true },
  });

  await notificarParticipantes(campanhaId, "AVISO_NOVO", "Novo aviso na campanha.", usuario.id);

  return NextResponse.json({ aviso }, { status: 201 });
}
