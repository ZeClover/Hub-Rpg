import { type NextRequest } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { acessoCampanha } from '@/lib/colecionaveis/servico';
import { validarCadastro } from '@/lib/colecionaveis/regras';
import { prepararSilhueta } from '@/lib/colecionaveis/silhueta';
import { privado,falha } from '@/lib/colecionaveis/http';
type Contexto={params:Promise<{id:string}>};
export async function GET(_r:NextRequest,{params}:Contexto){const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);try{const {id}=await params;const acesso=await acessoCampanha(id,u.id,true);const [catalogo,personagens,historico]=await Promise.all([banco.colecionavel.findMany({where:{campanhaId:id},orderBy:{criadoEm:'asc'}}),banco.personagem.findMany({where:{sistema:{chave:'wands-wizards'},OR:[{campanhaId:id},{concessoesColecionaveis:{some:{campanhaId:id}}}]},select:{id:true,nome:true},orderBy:{nome:'asc'}}),banco.concessaoColecionavel.findMany({where:{campanhaId:id},orderBy:{criadoEm:'desc'},take:100,select:{operacaoId:true,personagemId:true,colecionavelId:true,tipo:true,quantidade:true,criadoEm:true,personagem:{select:{nome:true}},colecionavel:{select:{nome:true,edicao:true}}}})]);return privado({campanha:{id,nome:acesso.campanha.nome},catalogo:catalogo.map(({silhuetaArquivo,...item})=>({...item,temSilhueta:!!silhuetaArquivo?.length})),personagens,historico});}catch(e){return falha(e);}}
export async function POST(r:NextRequest,{params}:Contexto){const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);try{const {id}=await params;await acessoCampanha(id,u.id,true);const corpo=await r.json().catch(()=>null);const dados=validarCadastro(corpo);const mascara=await prepararSilhueta(corpo);const {silhuetaArquivo,...item}=await banco.colecionavel.create({data:{...dados,...mascara,campanhaId:id}});return privado({item:{...item,temSilhueta:!!silhuetaArquivo?.length}},201);}catch(e){return falha(e);}}
