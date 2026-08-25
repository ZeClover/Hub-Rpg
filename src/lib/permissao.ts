import { cache } from "react";

import { banco } from "@/lib/banco";

export { filtrarCampos, type Visibilidade } from "@/lib/visibilidade";

/*
  Quem pode ver os segredos de um universo?

  Hoje: só o dono. Quando as campanhas existirem, entram também os mestres das
  campanhas rodadas nesse universo — e o ponto é que essa regra vai mudar
  AQUI, num lugar só, sem caçar verificação espalhada pelas telas.
*/
export const podeVerSegredosDoUniverso = cache(
  async function podeVerSegredosDoUniverso(
    universoId: string,
    usuarioId: string,
  ): Promise<boolean> {
    const universo = await banco.universo.findFirst({
      where: { id: universoId, donoId: usuarioId },
      select: { id: true },
    });
    return universo !== null;
  },
);
