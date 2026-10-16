// Legado preservado em legado.ts. Desativado sem consultas, mutações ou notificações.
import {NextResponse} from 'next/server';
const desativado=()=>NextResponse.json({erro:'O Acervo Mágico foi desativado no Hub. Os dados foram preservados.'},{status:410,headers:{'Cache-Control':'private, no-store'}});
export const PATCH=desativado;
