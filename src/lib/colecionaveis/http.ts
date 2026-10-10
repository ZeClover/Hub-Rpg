import { NextResponse } from 'next/server';
import { ErroGabinete } from './regras';
export const privado=(dados:unknown,status=200)=>NextResponse.json(dados,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export function falha(erro:unknown){if(erro instanceof ErroGabinete)return privado({erro:erro.message},erro.status);console.error('Gabinete: falha interna',erro instanceof Error?erro.name:'erro');return privado({erro:'Não foi possível acessar o Gabinete. Suas coleções foram preservadas.'},500);}
