import { type NextRequest,NextResponse } from 'next/server';
import { banco } from '@/lib/banco';
import { usuarioAtual } from '@/lib/usuario';
import { acessoPersonagem } from '@/lib/colecionaveis/servico';
import { uuid,ErroGabinete } from '@/lib/colecionaveis/regras';
import { privado,falha } from '@/lib/colecionaveis/http';
export async function GET(r:NextRequest,{params}:{params:Promise<{id:string;colecionavelId:string}>}){
 const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);
 try{
  const {id,colecionavelId}=await params;if(!uuid(colecionavelId))throw new ErroGabinete('Não encontrado.',404);
  const a=await acessoPersonagem(id,u.id,r.nextUrl.searchParams.get('campanhaId'));if(!a.campanha)throw new ErroGabinete('Não encontrado.',404);
  const item=await banco.colecionavel.findFirst({where:{id:colecionavelId,campanhaId:a.campanha.id,categoria:'criaturas'},select:{silhuetaArquivo:true,visibilidade:true}});
  if(!item?.silhuetaArquivo||item.visibilidade==='oculto'&&!await banco.acervoColecionavel.count({where:{personagemId:id,colecionavelId,campanhaId:a.campanha.id,quantidade:{gt:0}}}))throw new ErroGabinete('Não encontrado.',404);
  return new NextResponse(new Uint8Array(item.silhuetaArquivo),{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
 }catch(e){return falha(e);}
}
