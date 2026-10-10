import { type NextRequest } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { acessoPersonagem,revelacoesPendentes } from '@/lib/colecionaveis/servico';
import { apresentarAcervo,type RegistroCatalogo } from '@/lib/colecionaveis/regras';
import { privado,falha } from '@/lib/colecionaveis/http';
export async function GET(r:NextRequest,{params}:{params:Promise<{id:string}>}){
 const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);
 try{
  const {id}=await params;const a=await acessoPersonagem(id,u.id,r.nextUrl.searchParams.get('campanhaId'));
  const contexto={personagem:{id:a.personagem.id,nome:a.personagem.nome},campanha:a.campanha,campanhas:a.campanhas,mestre:a.mestre};
  if(!a.campanha)return privado({...contexto,...apresentarAcervo([],[]),revelacoes:[]});
  const [catalogo,acervo]=await Promise.all([banco.colecionavel.findMany({where:{campanhaId:a.campanha.id},orderBy:[{criadoEm:'asc'},{id:'asc'}]}),banco.acervoColecionavel.findMany({where:{personagemId:id,campanhaId:a.campanha.id}})]);
  const apresentacao=apresentarAcervo(catalogo as RegistroCatalogo[],acervo,{personagemId:id,campanhaId:a.campanha.id});
  const revelacoes=a.personagem.donoId===u.id?await revelacoesPendentes(id,a.campanha.id,apresentacao.itens.filter(i=>i.adquirido&&i.categoria==='criaturas').map(i=>i.id)):[];
  return privado({...contexto,...apresentacao,revelacoes});
 }catch(e){return falha(e);}
}
