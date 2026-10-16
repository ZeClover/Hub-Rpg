import {NextResponse,type NextRequest} from 'next/server';
import {banco} from '@/lib/banco';
import {usuarioAtual} from '@/lib/usuario';
import {ehMestreTitular} from '@/lib/permissao-mestre';
import {montarPacote} from '@/lib/acervo-exportacao/pacote';
import {uuid} from '@/lib/colecionaveis/regras';
import {snapshotCampanha} from '@/lib/acervo-exportacao/snapshot';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(_r:NextRequest,{params}:{params:Promise<{id:string}>}){
 const u=await usuarioAtual(),{id}=await params;
 if(!u||!uuid(id)||!await ehMestreTitular(id,u.id))return NextResponse.json({erro:'Não encontrado.'},{status:404,headers:{'Cache-Control':'no-store'}});
 try{const snapshot=await snapshotCampanha(banco,id);if(!snapshot)return NextResponse.json({erro:'Não encontrado.'},{status:404});const bytes=await montarPacote(snapshot);let offset=0;const stream=new ReadableStream({pull(controller){if(offset>=bytes.length){controller.close();return;}const next=Math.min(offset+262144,bytes.length);controller.enqueue(new Uint8Array(bytes.subarray(offset,next)));offset=next;}});return new NextResponse(stream,{headers:{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="Acervo_Magico_Exportacao_Completa.zip"','Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});}catch(e){console.error('Exportação do Acervo:',e instanceof Error?e.name:'erro');return NextResponse.json({erro:'Não foi possível gerar o pacote. Os dados foram preservados.'},{status:500,headers:{'Cache-Control':'no-store'}});}
}
