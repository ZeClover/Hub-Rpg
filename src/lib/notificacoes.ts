import { TipoNotificacao } from "@prisma/client";

import { banco } from "@/lib/banco";

/*
  Notificação interna simples (decisão #136) — sem push nem e-mail (custo
  zero, decisão #5), só uma lista dentro do próprio Hub. Usada pelas rotas
  de sessão, aviso e enquete: sempre "avisa todo mundo da campanha, menos
  quem fez a ação".
*/
export async function notificarParticipantes(
  campanhaId: string,
  tipo: TipoNotificacao,
  texto: string,
  usuarioQueAgiu: string,
) {
  const participacoes = await banco.participacao.findMany({
    where: { campanhaId, usuarioId: { not: usuarioQueAgiu } },
    select: { usuarioId: true },
  });
  if (participacoes.length === 0) return;

  await banco.notificacao.createMany({
    data: participacoes.map((p) => ({
      usuarioId: p.usuarioId,
      campanhaId,
      tipo,
      texto,
    })),
  });
}
