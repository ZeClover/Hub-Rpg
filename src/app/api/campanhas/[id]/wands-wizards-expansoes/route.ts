import { Prisma } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { ehMestreOuAuxiliar } from '@/lib/permissao-mestre';
import EDITORIAL from '@/lib/wands-wizards/expansoes-editorial.json';
import MATERIAIS from '@/lib/wands-wizards/suplementos-editorial.json';
import { configuracaoExpansoes, OPCOES_SEGURAS } from '../../../../../../public/wands-wizards/expansoes/regras.mjs';
import { novaFicha, prepararFichaWandsWizards } from '../../../../../../public/wands-wizards/ficha-regras.mjs';

type Contexto = {params:Promise<{id:string}>};
async function acesso({params}:Contexto) {
  const usuario=await usuarioAtual();
  if (!usuario) return {resposta:NextResponse.json({erro:'não autenticado'},{status:401})};
  const {id}=await params;
  if (!(await ehMestreOuAuxiliar(id,usuario.id))) return {resposta:NextResponse.json({erro:'não encontrado'},{status:404})};
  const campanha=await banco.campanha.findUnique({where:{id},select:{id:true,expansoesWandsWizards:true,sistema:{select:{chave:true}}}});
  if (campanha?.sistema.chave!=='wands-wizards') return {resposta:NextResponse.json({erro:'não encontrado'},{status:404})};
  return {campanha};
}

export async function GET(_req:NextRequest, contexto:Contexto) {
  const autorizacao=await acesso(contexto);
  if (autorizacao.resposta) return autorizacao.resposta;
  const {campanha}=autorizacao;
  const personagens=await banco.personagem.findMany({where:{campanhaId:campanha.id,ehMonstro:false,sistema:{chave:'wands-wizards'}},select:{id:true,nome:true}});
  return NextResponse.json({configuracao:configuracaoExpansoes(campanha.expansoesWandsWizards),catalogo:EDITORIAL,materiais:MATERIAIS,formacoes:OPCOES_SEGURAS.filter(o=>o.tipo==='formacao'),personagens});
}

export async function PATCH(req:NextRequest, contexto:Contexto) {
  const autorizacao=await acesso(contexto);
  if (autorizacao.resposta) return autorizacao.resposta;
  const {campanha}=autorizacao,corpo=await req.json().catch(()=>null);
  if (!corpo || Object.keys(corpo).some(k=>!['ativo','revisao'].includes(k)) || typeof corpo.ativo!=='boolean' || !Number.isSafeInteger(corpo.revisao)) return NextResponse.json({erro:'Informe a ativação e a revisão atual. B e C não podem ser habilitadas.'},{status:400});
  const atual=configuracaoExpansoes(campanha.expansoesWandsWizards);
  if (corpo.revisao!==atual.revisao) return NextResponse.json({erro:'A configuração mudou. Recarregue antes de salvar.'},{status:409});
  const configuracao={versao:1,ativas:corpo.ativo?['newt-trunk']:[],revisao:atual.revisao+1};
  const antiga=campanha.expansoesWandsWizards;
  const filtro=antiga===null ? {OR:[{expansoesWandsWizards:{equals:Prisma.DbNull}},{expansoesWandsWizards:{equals:Prisma.JsonNull}}]} : {expansoesWandsWizards:{equals:antiga}};
  const resultado=await banco.campanha.updateMany({where:{id:campanha.id,...filtro},data:{expansoesWandsWizards:configuracao}});
  if (resultado.count!==1) return NextResponse.json({erro:'A configuração mudou durante o salvamento. Recarregue.'},{status:409});
  return NextResponse.json({configuracao});
}

export async function POST(req:NextRequest, contexto:Contexto) {
  const autorizacao=await acesso(contexto);
  if (autorizacao.resposta) return autorizacao.resposta;
  const {campanha}=autorizacao,configuracao=configuracaoExpansoes(campanha.expansoesWandsWizards);
  if (!configuracao.ativas.length) return NextResponse.json({erro:'Ative a expansão nesta campanha antes de conceder uma formação.'},{status:400});
  const corpo=await req.json().catch(()=>null);
  const opcao=OPCOES_SEGURAS.find(o=>o.tipo==='formacao'&&o.id===corpo?.formacao?.id);
  if (!opcao || typeof corpo?.personagemId!=='string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(corpo.personagemId) || corpo.retirar!==undefined&&typeof corpo.retirar!=='boolean' || Object.keys(corpo).some(k=>!['personagemId','formacao','retirar'].includes(k))) return NextResponse.json({erro:'Formação ou personagem inválido.'},{status:400});
  const personagem=await banco.personagem.findUnique({where:{id:corpo.personagemId},select:{id:true,nome:true,campanhaId:true,ehMonstro:true,dados:true,atualizadoEm:true,sistema:{select:{chave:true}}}});
  if (!personagem || personagem.campanhaId!==campanha.id || personagem.ehMonstro || personagem.sistema.chave!=='wands-wizards') return NextResponse.json({erro:'não encontrado'},{status:404});
  const anteriores=personagem.dados && typeof personagem.dados==='object' && !Array.isArray(personagem.dados)?personagem.dados:{};
  const dados={...novaFicha(),...anteriores};
  const ext=dados.extensoesWW??{};
  const formacoes=(ext.formacoes??[]).filter(f=>f.id!==opcao.id);
  if (!corpo.retirar) formacoes.push(corpo.formacao);
  const recebido={...dados,extensoesWW:{...ext,formacoes,substituicoesPericias:[]}};
  const preparado=prepararFichaWandsWizards(dados,recebido,{emCampanha:true,ehMestre:true,expansoesWandsWizards:configuracao});
  if (preparado.erro) return NextResponse.json({erro:preparado.erro},{status:400});
  const resultado=await banco.personagem.updateMany({where:{id:personagem.id,campanhaId:campanha.id,atualizadoEm:personagem.atualizadoEm},data:{dados:preparado.dados as Prisma.InputJsonValue}});
  if (resultado.count!==1) return NextResponse.json({erro:'A ficha mudou. Recarregue antes de conceder a formação.'},{status:409});
  return NextResponse.json({ok:true,personagemId:personagem.id});
}
