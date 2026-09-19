import { NextResponse, type NextRequest } from "next/server";

import { banco } from "@/lib/banco";
import { usuarioAtual } from "@/lib/usuario";

type Contexto = { params: Promise<{ id: string }> };

/*
  Espelho da ordem de iniciativa (decisão #137) — quem controla de verdade
  continua sendo o `RastreadorDeIniciativa` no navegador do mestre
  (localStorage, decisão #46); esta rota só existe pra jogador conseguir
  ver a mesma ordem em modo leitura. GET é de qualquer participante
  (mestre ou jogador já ligado); PATCH é só do mestre — ele que manda o
  estado inteiro a cada mudança, nunca um ajuste parcial.
*/
async function minhaParticipacao(campanhaId: string, usuarioId: string) {
  return banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
}

export async function GET(_requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  if (!(await minhaParticipacao(campanhaId, usuario.id))) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const campanha = await banco.campanha.findUnique({
    where: { id: campanhaId },
    select: { iniciativaAtual: true },
  });
  if (!campanha) {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ iniciativa: campanha.iniciativaAtual });
}

function corpoValido(corpo: unknown): corpo is {
  combatentes: { id: string; nome: string; condicao: string }[];
  vezDe: number;
  rodada: number;
} {
  if (typeof corpo !== "object" || corpo === null) return false;
  const { combatentes, vezDe, rodada } = corpo as Record<string, unknown>;
  if (!Array.isArray(combatentes)) return false;
  if (typeof vezDe !== "number" || typeof rodada !== "number") return false;
  return combatentes.every(
    (c) =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as Record<string, unknown>).id === "string" &&
      typeof (c as Record<string, unknown>).nome === "string" &&
      typeof (c as Record<string, unknown>).condicao === "string",
  );
}

export async function PATCH(requisicao: NextRequest, { params }: Contexto) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const { id: campanhaId } = await params;
  const participacao = await minhaParticipacao(campanhaId, usuario.id);
  if (participacao?.papel !== "MESTRE") {
    return NextResponse.json({ erro: "não encontrado" }, { status: 404 });
  }

  const corpo = await requisicao.json().catch(() => null);
  if (!corpoValido(corpo)) {
    return NextResponse.json({ erro: "estado de iniciativa inválido" }, { status: 400 });
  }

  await banco.campanha.update({
    where: { id: campanhaId },
    data: { iniciativaAtual: corpo },
  });

  return NextResponse.json({ ok: true });
}
