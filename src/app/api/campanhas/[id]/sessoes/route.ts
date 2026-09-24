import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { notificarParticipantes } from "@/lib/notificacoes";
import { ehMestreOuAuxiliar } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

/*
  Criar uma sessão (decisão #135) — só o mestre. `numero` é automático:
  a próxima sessão da campanha é sempre (maior número já usado) + 1, pra
  não pedir a mesma pessoa fazer essa conta e nunca colidir com a trava
  `@@unique([campanhaId, numero])`. `data` chega como string ISO (o
  formulário manda um `datetime-local` convertido no cliente).

  Não existe GET aqui: a lista de sessões chega junto com a página da
  campanha (Server Component), igual `manualMestre` e
  `personagensDaCampanha` já fazem — não precisa de rota própria só pra
  leitura.
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
  const data = corpo?.data ? new Date(corpo.data) : null;
  if (!data || Number.isNaN(data.getTime())) {
    return NextResponse.json({ erro: "data é obrigatória" }, { status: 400 });
  }

  const ultima = await banco.sessao.findFirst({
    where: { campanhaId },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const sessao = await banco.sessao.create({
    data: {
      campanhaId,
      numero: (ultima?.numero ?? 0) + 1,
      data,
    },
    select: { id: true, numero: true, data: true },
  });

  await notificarParticipantes(
    campanhaId,
    "SESSAO_MARCADA",
    `Sessão ${sessao.numero} marcada para ${FORMATADOR_DATA.format(sessao.data)}.`,
    usuario.id,
  );

  return NextResponse.json({ sessao }, { status: 201 });
}
