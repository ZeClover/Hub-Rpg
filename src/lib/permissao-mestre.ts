import { banco } from "@/lib/banco";

/*
  "Mestre auxiliar" (decisão #148, ideia #115) — mesmo poder do mestre em
  tudo, com uma única exceção: nunca exclui a campanha nem mexe em quem é
  mestre (promover/remover). Em vez de duplicar `papel === "MESTRE"` em
  mais um lugar, todo o resto do código passou a chamar as duas funções
  daqui: `ehMestreOuAuxiliar` pra qualquer poder de mestre, `ehMestreTitular`
  só pra excluir a campanha e gerenciar quem é mestre.
*/

async function buscarPapel(campanhaId: string, usuarioId: string) {
  const participacao = await banco.participacao.findUnique({
    where: { campanhaId_usuarioId: { campanhaId, usuarioId } },
  });
  return participacao?.papel ?? null;
}

/// Qualquer poder de mestre — a esmagadora maioria das travas do Hub.
export async function ehMestreOuAuxiliar(campanhaId: string, usuarioId: string): Promise<boolean> {
  const papel = await buscarPapel(campanhaId, usuarioId);
  return papel === "MESTRE" || papel === "MESTRE_AUXILIAR";
}

/// Só o mestre de verdade — excluir campanha, promover/remover mestre
/// auxiliar. Nunca usada pra nenhum outro poder.
export async function ehMestreTitular(campanhaId: string, usuarioId: string): Promise<boolean> {
  return (await buscarPapel(campanhaId, usuarioId)) === "MESTRE";
}

/// Mesma checagem de `ehMestreOuAuxiliar`, mas pra quando o papel já foi
/// buscado do banco por outro motivo — evita uma consulta a mais.
export function ehPapelDeMestre(papel: string): boolean {
  return papel === "MESTRE" || papel === "MESTRE_AUXILIAR";
}
