import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { notificarParticipantes } from "@/lib/notificacoes";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Enquete simples (decisão #136) — só o mestre (ou mestre auxiliar, decisão
  #148) pergunta. Sem GET: a lista de enquetes chega junto da página da
  campanha, mesmo padrão de Sessões e Avisos.
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
  const pergunta = typeof corpo?.pergunta === "string" ? corpo.pergunta.trim() : "";
  const opcoes = Array.isArray(corpo?.opcoes)
    ? corpo.opcoes
        .filter((o: unknown): o is string => typeof o === "string")
        .map((o: string) => o.trim())
        .filter((o: string) => o.length > 0)
    : [];
  if (!pergunta || opcoes.length < 2) {
    return NextResponse.json(
      { erro: "pergunta e ao menos duas opções são obrigatórias" },
      { status: 400 },
    );
  }

  const enquete = await banco.enquete.create({
    data: { campanhaId, autorId: usuario.id, pergunta, opcoes },
    select: { id: true, pergunta: true, opcoes: true, encerrada: true, criadoEm: true },
  });

  await notificarParticipantes(campanhaId, "ENQUETE_NOVA", "Nova enquete na campanha.", usuario.id);

  return NextResponse.json({ enquete }, { status: 201 });
}
