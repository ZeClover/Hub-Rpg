import { type NextRequest } from 'next/server';
import { usuarioAtual } from '@/lib/usuario';
import { conceder,concederEmLote } from '@/lib/colecionaveis/servico';
import { privado,falha } from '@/lib/colecionaveis/http';
export async function POST(r:NextRequest,{params}:{params:Promise<{id:string}>}){const u=await usuarioAtual();if(!u)return privado({erro:'Não autenticado.'},401);try{const {id}=await params;const corpo=await r.json().catch(()=>null);return privado({ok:true,...await (Array.isArray(corpo?.personagemIds)?concederEmLote(id,u.id,corpo):conceder(id,u.id,corpo))});}catch(e){return falha(e);}}
