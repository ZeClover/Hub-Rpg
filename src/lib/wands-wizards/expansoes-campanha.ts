import { banco } from '@/lib/banco';
import { configuracaoExpansoes } from '../../../public/wands-wizards/expansoes/regras.mjs';

export async function expansoesDaCampanha(campanhaId: string | null) {
  if (!campanhaId) return configuracaoExpansoes(null);
  const campanha = await banco.campanha.findUnique({
    where:{id:campanhaId}, select:{expansoesWandsWizards:true},
  });
  return configuracaoExpansoes(campanha?.expansoesWandsWizards);
}
