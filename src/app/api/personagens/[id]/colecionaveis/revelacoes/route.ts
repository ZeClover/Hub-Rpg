import { type NextRequest } from 'next/server';
import { usuarioAtual } from '@/lib/usuario';
import { reservarRevelacao } from '@/lib/colecionaveis/servico';
import { privado,falha } from '@/lib/colecionaveis/http';
export async function POST(r:NextRequest,{params}:{params:Promise<{id:string}>}){
 const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);
 try{const {id}=await params;return privado(await reservarRevelacao(id,u.id,await r.json().catch(()=>null)));}catch(e){return falha(e);}
}
