import { type NextRequest } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { acessoCampanha } from '@/lib/colecionaveis/servico';
import { ErroGabinete,uuid,validarCadastro } from '@/lib/colecionaveis/regras';
import { prepararSilhueta } from '@/lib/colecionaveis/silhueta';
import { privado,falha } from '@/lib/colecionaveis/http';
export async function PATCH(r:NextRequest,{params}:{params:Promise<{id:string;colecionavelId:string}>}){const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);try{const {id,colecionavelId}=await params;await acessoCampanha(id,u.id,true);if(!uuid(colecionavelId))throw new ErroGabinete('Não encontrado.',404);const corpo=await r.json().catch(()=>null),dados=validarCadastro(corpo);if(typeof corpo.atualizadoEmBase!=='string'||!Number.isFinite(Date.parse(corpo.atualizadoEmBase)))throw new ErroGabinete('Informe a versão do cadastro.');const resultado=await banco.colecionavel.updateMany({where:{id:colecionavelId,campanhaId:id,atualizadoEm:new Date(corpo.atualizadoEmBase)},data:{...dados,...await prepararSilhueta(corpo)}});if(!resultado.count)throw new ErroGabinete('O cadastro mudou. Recarregue antes de editar novamente.',409);const item=await banco.colecionavel.findUnique({where:{id:colecionavelId},omit:{silhuetaArquivo:true}});return privado({item});}catch(e){return falha(e);}}
