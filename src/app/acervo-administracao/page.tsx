import {notFound} from 'next/navigation';
import {usuarioAtual} from '@/lib/usuario';
import {banco} from '@/lib/banco';
import {acessoCampanha} from '@/lib/colecionaveis/servico';
import {uuid} from '@/lib/colecionaveis/regras';
import {GabineteMestre} from '../(hub)/campanhas/[id]/gabinete-mestre';
export const dynamic='force-dynamic';
export default async function AdministracaoAcervo({searchParams}:{searchParams:Promise<{personagemId?:string;campanhaId?:string}>}){
 const u=await usuarioAtual(),p=await searchParams;
 if(!u||!uuid(p.personagemId)||!uuid(p.campanhaId))notFound();
 try{await acessoCampanha(p.campanhaId,u.id,true);}catch{notFound();}
 const personagem=await banco.personagem.findFirst({where:{id:p.personagemId,sistema:{chave:'wands-wizards'},OR:[{campanhaId:p.campanhaId},{concessoesColecionaveis:{some:{campanhaId:p.campanhaId}}}]},select:{nome:true}});
 if(!personagem)notFound();
 return <main className="min-h-screen bg-preto p-3 text-areia"><p className="px-2 text-sm text-areia-suave">Administração da campanha · ficha de {personagem.nome}</p><GabineteMestre campanhaId={p.campanhaId}/></main>;
}
