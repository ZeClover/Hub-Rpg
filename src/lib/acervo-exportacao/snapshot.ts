import type {PrismaClient} from '@prisma/client';
export async function snapshotCampanha(db:PrismaClient,id:string){return db.$transaction(async tx=>{
 const campanha=await tx.campanha.findFirst({where:{id,sistema:{chave:'wands-wizards'}},select:{id:true,nome:true}});if(!campanha)return null;
 const [catalogo,descobertas,historico,personagens]=await Promise.all([
 tx.colecionavel.findMany({where:{campanhaId:id},orderBy:{id:'asc'}}),tx.acervoColecionavel.findMany({where:{campanhaId:id},orderBy:{id:'asc'}}),tx.concessaoColecionavel.findMany({where:{campanhaId:id},orderBy:{operacaoId:'asc'}}),
 tx.personagem.findMany({where:{OR:[{campanhaId:id},{concessoesColecionaveis:{some:{campanhaId:id}}},{acervosColecionaveis:{some:{campanhaId:id}}}]},select:{id:true,nome:true,campanhaId:true,dados:true}})]);
 const variantesLegadas=personagens.flatMap(p=>{const d=p.dados as Record<string,unknown>|null;return d?.colecaoFigurinhas?[{personagemId:p.id,colecaoFigurinhas:d.colecaoFigurinhas}]:[];});
 return {campanha,catalogo,descobertas,historico,personagens:personagens.map(({id,nome,campanhaId})=>({id,nome,campanhaId})),variantesLegadas};
 },{isolationLevel:'RepeatableRead',timeout:30000});}
