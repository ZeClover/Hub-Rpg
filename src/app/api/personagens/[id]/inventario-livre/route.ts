import {NextResponse,type NextRequest} from 'next/server';
import {banco} from '@/lib/banco';
import {usuarioAtual} from '@/lib/usuario';
import {ehMestreOuAuxiliar} from '@/lib/permissao-mestre';
import {validarItens} from '../../../../../../public/inventario/regras.mjs';
import {uuid} from '@/lib/colecionaveis/regras';
type Contexto={params:Promise<{id:string}>};
const resposta=(dados:unknown,status=200)=>NextResponse.json(dados,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
async function acesso(id:string){
 if(!uuid(id))return null;
 const u=await usuarioAtual();
 const p=await banco.personagem.findUnique({where:{id},select:{id:true,donoId:true,campanhaId:true,compartilhado:true,inventarioLivre:true,versaoInventario:true,sistema:{select:{chave:true}}}});
 if(!p)return null;
 const editar=!!u&&(p.donoId===u.id||!!p.campanhaId&&await ehMestreOuAuxiliar(p.campanhaId,u.id));
 return editar||p.compartilhado?{p,editar}:null;
}
export async function GET(_r:NextRequest,{params}:Contexto){const a=await acesso((await params).id);if(!a)return resposta({erro:'Não encontrado.'},404);return resposta({itens:a.p.inventarioLivre??[],versao:a.p.versaoInventario,editavel:a.editar});}
export async function PUT(r:NextRequest,{params}:Contexto){
 const a=await acesso((await params).id);if(!a||!a.editar)return resposta({erro:'Não encontrado.'},404);
 const c=await r.json().catch(()=>null);try{if(!c||Object.keys(c).some(k=>!['itens','versao'].includes(k))||!Number.isSafeInteger(c.versao)||c.versao<0)throw Error('Pedido inválido.');validarItens(c.itens);}catch(e){return resposta({erro:e instanceof Error?e.message:'Itens inválidos.'},400);}
 // Atualização atômica da coluna independente: não avança atualizadoEm da ficha.
 const alterados=await banco.$executeRaw`UPDATE "personagens" SET "inventarioLivre"=${JSON.stringify(c.itens)}::jsonb, "versaoInventario"="versaoInventario"+1 WHERE "id"=${a.p.id}::uuid AND "versaoInventario"=${c.versao}`;
 if(!alterados)return resposta({erro:'O inventário mudou em outra janela. Reabra para revisar; seu rascunho permanece nesta tela.'},409);
 return resposta({versao:c.versao+1});
}
