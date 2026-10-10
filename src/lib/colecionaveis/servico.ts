import { createHash } from 'node:crypto';
import { banco } from '@/lib/banco';
import { ehPapelDeMestre } from '@/lib/permissao-mestre';
import { ErroGabinete, uuid, validarConcessao, conferirQuantidade, conferirRetirada, mesmoPedido } from './regras';
export async function acessoCampanha(campanhaId:string,usuarioId:string,mestre=false){
 if(!uuid(campanhaId))throw new ErroGabinete('Não encontrado.',404);
 const p=await banco.participacao.findUnique({where:{campanhaId_usuarioId:{campanhaId,usuarioId}},select:{papel:true,campanha:{select:{id:true,nome:true,sistema:{select:{chave:true}}}}}});
 if(!p||p.campanha.sistema.chave!=='wands-wizards'||mestre&&!ehPapelDeMestre(p.papel))throw new ErroGabinete('Não encontrado.',404);
 return {campanha:p.campanha,mestre:ehPapelDeMestre(p.papel)};
}
export async function conceder(campanhaId:string,usuarioId:string,corpo:unknown,tipo:'conceder'|'retirar'='conceder'){
 await acessoCampanha(campanhaId,usuarioId,true);const pedido={...validarConcessao(corpo),tipo};
 return banco.$transaction(async tx=>{
  // Uma ordem de locks comum serializa cadastro e concessões sem alterar os dados das fichas.
  const cat=await tx.$queryRaw<{id:string}[]>`SELECT "id" FROM "colecionaveis" WHERE "id"=${pedido.colecionavelId}::uuid AND "campanhaId"=${campanhaId}::uuid FOR UPDATE`;
  if(!cat.length)throw new ErroGabinete('Colecionável não encontrado.',404);
  const p=tipo==='retirar'
   ? await tx.$queryRaw<{id:string}[]>`SELECT p."id" FROM "personagens" p JOIN "sistemas" s ON s."id"=p."sistemaId" WHERE p."id"=${pedido.personagemId}::uuid AND s."chave"='wands-wizards' AND (p."campanhaId"=${campanhaId}::uuid OR EXISTS (SELECT 1 FROM "concessoes_colecionaveis" a WHERE a."personagemId"=p."id" AND a."campanhaId"=${campanhaId}::uuid)) FOR UPDATE OF p`
   : await tx.$queryRaw<{id:string}[]>`SELECT p."id" FROM "personagens" p JOIN "sistemas" s ON s."id"=p."sistemaId" WHERE p."id"=${pedido.personagemId}::uuid AND p."campanhaId"=${campanhaId}::uuid AND s."chave"='wands-wizards' FOR UPDATE OF p`;
  if(!p.length)throw new ErroGabinete('O personagem precisa pertencer a esta campanha.',404);
  const anterior=await tx.concessaoColecionavel.findUnique({where:{operacaoId:pedido.operacaoId}});
  if(anterior){if(!mesmoPedido(anterior,pedido,usuarioId))throw new ErroGabinete('Esta operação já foi usada em outra concessão.',409);return {repetida:true};}
  const item=await tx.colecionavel.findUniqueOrThrow({where:{id:pedido.colecionavelId}});
  const chave={personagemId:pedido.personagemId,colecionavelId:pedido.colecionavelId};
  const acervo=await tx.acervoColecionavel.findUnique({where:{personagemId_colecionavelId:chave}});
  const quantidade=tipo==='retirar'?conferirRetirada(acervo?.quantidade??0,pedido.quantidade):conferirQuantidade(item.repetivel,acervo?.quantidade??0,pedido.quantidade);
  await tx.concessaoColecionavel.create({data:{...pedido,campanhaId,concedidoPorId:usuarioId}});
  if(tipo==='retirar')await tx.concessaoColecionavel.updateMany({where:{campanhaId,personagemId:pedido.personagemId,colecionavelId:pedido.colecionavelId,tipo:'conceder',revelacaoVistaEm:null},data:{revelacaoVistaEm:new Date()}});
  if(quantidade===0)await tx.acervoColecionavel.delete({where:{personagemId_colecionavelId:chave}});
  else await tx.acervoColecionavel.upsert({where:{personagemId_colecionavelId:chave},create:{...chave,campanhaId,quantidade},update:{quantidade}});
  return {repetida:false,quantidade};
 });
}

// A mesma política protege catálogo do personagem, silhuetas e notificações.
export async function acessoPersonagem(id:string,usuarioId:string,campanhaPedida?:string|null){
 if(!uuid(id))throw new ErroGabinete('Não encontrado.',404);
 const p=await banco.personagem.findUnique({where:{id},select:{id:true,nome:true,donoId:true,campanhaId:true,sistema:{select:{chave:true}}}});
 if(!p||p.sistema.chave!=='wands-wizards')throw new ErroGabinete('Não encontrado.',404);
 const historico=await banco.campanha.findMany({where:{participacoes:{some:{usuarioId}},OR:[...(p.campanhaId?[{id:p.campanhaId}]:[]),{concessoesColecionaveis:{some:{personagemId:id}}}]},select:{id:true,nome:true},orderBy:{nome:'asc'}});
 const campanhaId=campanhaPedida||p.campanhaId||(p.donoId===usuarioId?historico[0]?.id:null);
 if(!campanhaId){if(p.donoId!==usuarioId)throw new ErroGabinete('Não encontrado.',404);return {personagem:p,campanha:null,campanhas:historico,mestre:false};}
 const a=await acessoCampanha(campanhaId,usuarioId);
 if(p.donoId!==usuarioId&&!a.mestre)throw new ErroGabinete('Não encontrado.',404);
 if(p.campanhaId!==campanhaId&&!await banco.concessaoColecionavel.count({where:{campanhaId,personagemId:id}}))throw new ErroGabinete('Não encontrado.',404);
 return {personagem:p,campanha:{id:a.campanha.id,nome:a.campanha.nome},campanhas:historico,mestre:a.mestre};
}
export async function revelacoesPendentes(personagemId:string,campanhaId:string,itensAdquiridos:string[]){
 if(!itensAdquiridos.length)return [];
 return banco.concessaoColecionavel.findMany({where:{personagemId,campanhaId,tipo:'conceder',revelacaoVistaEm:null,colecionavelId:{in:itensAdquiridos}},orderBy:[{criadoEm:'asc'},{operacaoId:'asc'}],take:30,select:{operacaoId:true,colecionavelId:true,quantidade:true,criadoEm:true}});
}
export async function reservarRevelacao(personagemId:string,usuarioId:string,corpo:unknown){
 const c=corpo as {operacaoId?:unknown;campanhaId?:unknown}|null;
 if(!c||!uuid(c.operacaoId)||!uuid(c.campanhaId))throw new ErroGabinete('Revelação inválida.');
 const a=await acessoPersonagem(personagemId,usuarioId,c.campanhaId);
 if(a.personagem.donoId!==usuarioId)throw new ErroGabinete('Somente o dono recebe a revelação.',403);
 // Compare-and-set no banco: um único dispositivo ganha a apresentação.
 const resultado=await banco.$queryRaw<{operacaoId:string}[]>`
 UPDATE "concessoes_colecionaveis" e SET "revelacaoVistaEm"=CURRENT_TIMESTAMP
 WHERE e."operacaoId"=${c.operacaoId}::uuid AND e."personagemId"=${personagemId}::uuid
 AND e."campanhaId"=${c.campanhaId}::uuid AND e."tipo"='conceder' AND e."revelacaoVistaEm" IS NULL
 AND EXISTS (SELECT 1 FROM "acervos_colecionaveis" a WHERE a."personagemId"=e."personagemId" AND a."colecionavelId"=e."colecionavelId" AND a."campanhaId"=e."campanhaId" AND a."quantidade">0)
 RETURNING e."operacaoId"`;
 return {apresentar:resultado.length===1};
}

// IDs derivados por destinatário mantêm reenvios seguros mesmo após uma falha de rede.
export async function concederEmLote(campanhaId:string,usuarioId:string,corpo:unknown){
 await acessoCampanha(campanhaId,usuarioId,true);
 const c=corpo as Record<string,unknown>;
 if(!c||!Array.isArray(c.personagemIds)||!c.personagemIds.length||c.personagemIds.length>50||!c.personagemIds.every(uuid)||new Set(c.personagemIds).size!==c.personagemIds.length)throw new ErroGabinete('Selecione entre 1 e 50 personagens distintos.');
 const base=validarConcessao({...c,personagemId:c.personagemIds[0]});
 const resultados=[];
 for(const personagemId of c.personagemIds as string[]){
  const h=createHash('sha256').update(base.operacaoId+':'+personagemId).digest('hex');
  const operacaoId=h.slice(0,8)+'-'+h.slice(8,12)+'-5'+h.slice(13,16)+'-a'+h.slice(17,20)+'-'+h.slice(20,32);
  try{resultados.push({personagemId,ok:true,...await conceder(campanhaId,usuarioId,{...base,personagemId,operacaoId})});}
  catch(e){if(!(e instanceof ErroGabinete))throw e;resultados.push({personagemId,ok:false,erro:e.message});}
 }
 return {resultados};
}
