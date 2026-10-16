import type {PrismaClient} from '@prisma/client';
// Durante a separação, os FKs antigos ainda têm ON DELETE CASCADE.
// Estes testes são chamados apenas após autorização, em exclusões Wands & Wizards.
export function temColecaoLegada(dados:unknown):boolean{
 if(!dados||typeof dados!=='object'||Array.isArray(dados))return false;
 const colecao=(dados as Record<string,unknown>).colecaoFigurinhas;
 return Array.isArray(colecao)?colecao.length>0:!!colecao;
}
export async function reterPersonagem(db:PrismaClient,id:string,dados:unknown){
 if(temColecaoLegada(dados))return true;
 const [descobertas,historico]=await Promise.all([db.acervoColecionavel.count({where:{personagemId:id}}),db.concessaoColecionavel.count({where:{personagemId:id}})]);
 return descobertas>0||historico>0;
}
export async function reterCampanha(db:PrismaClient,id:string){
 const [catalogo,descobertas,historico]=await Promise.all([db.colecionavel.count({where:{campanhaId:id}}),db.acervoColecionavel.count({where:{campanhaId:id}}),db.concessaoColecionavel.count({where:{campanhaId:id}})]);
 if(catalogo||descobertas||historico)return true;
 const personagens=await db.personagem.findMany({where:{campanhaId:id},select:{dados:true}});
 return personagens.some(p=>temColecaoLegada(p.dados));
}
