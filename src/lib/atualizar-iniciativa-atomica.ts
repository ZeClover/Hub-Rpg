import { Prisma } from '@prisma/client';
import { banco } from './banco';

// Compara o JSON que foi lido: uma declaração concorrente nunca é apagada.
export async function atualizarIniciativaAtomica(campanhaId: string, transformar: (atual: unknown) => Record<string, unknown>) {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const campanha = await banco.campanha.findUnique({ where: { id: campanhaId }, select: { iniciativaAtual: true } });
    if (!campanha) return false;
    const atual = campanha.iniciativaAtual;
    const resultado = await banco.campanha.updateMany({
      where: { id: campanhaId, ...(atual === null ? { OR: [{ iniciativaAtual: { equals: Prisma.DbNull } }, { iniciativaAtual: { equals: Prisma.JsonNull } }] } : { iniciativaAtual: { equals: atual } }) },
      data: { iniciativaAtual: transformar(atual) as Prisma.InputJsonObject },
    });
    if (resultado.count === 1) return true;
  }
  return false;
}
