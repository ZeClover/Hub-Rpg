import { banco } from "@/lib/banco";

/*
  Onde um Item pode morar (decisão #147) — biblioteca pessoal, uma ficha
  específica, o inventário de um grupo, ou o cofre da campanha. Sempre
  exatamente um dos quatro campos preenchido; os outros três, null.
*/
export type LocalItem = {
  donoId?: string | null;
  personagemId?: string | null;
  grupoId?: string | null;
  campanhaId?: string | null;
};

async function souMestreDaCampanha(campanhaId: string, usuarioId: string): Promise<boolean> {
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
  return participacao?.papel === "MESTRE";
}

/*
  Quem pode gerenciar (editar/apagar/tirar dali) um item que já está num
  determinado local — usada tanto pra checar o local atual quanto, ao
  transferir, o local de destino.

  - Biblioteca pessoal: só o dono da conta.
  - Numa ficha: o dono da ficha, ou o mestre da campanha dela (mesmo
    direito de edição que o mestre já tem sobre a ficha em si).
  - Inventário de grupo: o mestre da campanha, ou quem tem uma ficha
    naquele grupo.
  - Cofre da campanha: só o mestre.
*/
export async function podeGerenciarLocal(local: LocalItem, usuarioId: string): Promise<boolean> {
  if (local.donoId) {
    return local.donoId === usuarioId;
  }
  if (local.personagemId) {
    const personagem = await banco.personagem.findUnique({
      where: { id: local.personagemId },
      select: { donoId: true, campanhaId: true },
    });
    if (!personagem) return false;
    if (personagem.donoId === usuarioId) return true;
    if (personagem.campanhaId && (await souMestreDaCampanha(personagem.campanhaId, usuarioId))) {
      return true;
    }
    return false;
  }
  if (local.grupoId) {
    const grupo = await banco.grupo.findUnique({
      where: { id: local.grupoId },
      select: { campanhaId: true },
    });
    if (!grupo) return false;
    if (await souMestreDaCampanha(grupo.campanhaId, usuarioId)) return true;
    const souMembro = await banco.grupoMembro.findFirst({
      where: { grupoId: local.grupoId, personagem: { donoId: usuarioId } },
    });
    return souMembro !== null;
  }
  if (local.campanhaId) {
    return souMestreDaCampanha(local.campanhaId, usuarioId);
  }
  return false;
}

/// Normaliza um local pra guardar só o campo de verdade preenchido — evita
/// salvar dois locais preenchidos ao mesmo tempo por engano.
export function normalizarLocal(local: LocalItem): {
  donoId: string | null;
  personagemId: string | null;
  grupoId: string | null;
  campanhaId: string | null;
} {
  if (local.donoId) return { donoId: local.donoId, personagemId: null, grupoId: null, campanhaId: null };
  if (local.personagemId) {
    return { donoId: null, personagemId: local.personagemId, grupoId: null, campanhaId: null };
  }
  if (local.grupoId) return { donoId: null, personagemId: null, grupoId: local.grupoId, campanhaId: null };
  if (local.campanhaId) {
    return { donoId: null, personagemId: null, grupoId: null, campanhaId: local.campanhaId };
  }
  return { donoId: null, personagemId: null, grupoId: null, campanhaId: null };
}
