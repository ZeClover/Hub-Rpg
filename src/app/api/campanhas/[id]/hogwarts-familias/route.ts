import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { garantirFundacaoHogwarts } from "@/lib/hogwarts/auditoria";
import { sincronizarFamiliasHogwarts, validarFamiliaCustom } from "@/lib/hogwarts/familias";
import { ehPapelDeMestre } from "@/lib/permissao-mestre";
import { usuarioAtual } from "@/lib/usuario";

type Contexto={params:Promise<{id:string}>};
async function acesso(campanhaId:string,usuarioId:string){const [campanha,p]=await Promise.all([banco.campanha.findUnique({where:{id:campanhaId},select:{sistema:{select:{chave:true}}}}),banco.participacao.findUnique({where:{campanhaId_usuarioId:{campanhaId,usuarioId}},select:{papel:true}})]);if(!campanha||campanha.sistema.chave!=="hogwarts-rpg"||!p||!ehPapelDeMestre(p.papel))return null;return {ehMestre:true};}

export async function GET(_req:NextRequest,{params}:Contexto){const {id}=await params,usuario=await usuarioAtual();if(!usuario)return NextResponse.json({erro:"não autenticado"},{status:401});const permissao=await acesso(id,usuario.id);if(!permissao)return NextResponse.json({erro:"não encontrado"},{status:404});await garantirFundacaoHogwarts();await sincronizarFamiliasHogwarts(banco,id);const familias=await banco.hogwartsFamilia.findMany({where:{campanhaId:id},orderBy:{nome:"asc"},include:{membros:{select:{personagemId:true,personagem:{select:{nome:true}}}},segredos:{where:permissao.ehMestre?{}:{reveladoEm:{not:null}},orderBy:{criadoEm:"asc"}}}});return NextResponse.json({familias,ehMestre:permissao.ehMestre});}

export async function POST(req:NextRequest,{params}:Contexto){const {id}=await params,usuario=await usuarioAtual();if(!usuario)return NextResponse.json({erro:"não autenticado"},{status:401});const permissao=await acesso(id,usuario.id);if(!permissao?.ehMestre)return NextResponse.json({erro:"somente o Mestre gerencia famílias"},{status:403});await garantirFundacaoHogwarts();await sincronizarFamiliasHogwarts(banco,id);const corpo=await req.json().catch(()=>null);try{
  if(corpo?.acao==="criar"){const f=validarFamiliaCustom(corpo);await banco.hogwartsFamilia.create({data:{campanhaId:id,...f}});}
  else if(corpo?.acao==="segredo"){const familia=await banco.hogwartsFamilia.findFirst({where:{id:String(corpo.familiaId??""),campanhaId:id}});if(!familia)throw new Error("Família não encontrada.");const nome=String(corpo.nome??"").trim(),descricao=String(corpo.descricao??"").trim();if(nome.length<2||descricao.length<3)throw new Error("Informe nome e descrição do segredo.");await banco.$transaction([banco.hogwartsFamiliaSegredo.create({data:{familiaId:familia.id,nome:nome.slice(0,100),descricao:descricao.slice(0,1000)}}),banco.eventoAuditoriaHogwarts.create({data:{campanhaId:id,atorId:usuario.id,modulo:"familia",acao:"segredo.criar",resumo:`Um segredo foi registrado para a família ${familia.nome}`,detalhes:{familiaId:familia.id}}})]);}
  else if(corpo?.acao==="revelar"){
    const segredo=await banco.hogwartsFamiliaSegredo.findFirst({where:{id:String(corpo.segredoId??""),familia:{campanhaId:id}},include:{familia:true}});
    if(!segredo)throw new Error("Segredo não encontrado.");
    await banco.$transaction(async tx=>{
      const revelacao=await tx.hogwartsFamiliaSegredo.updateMany({where:{id:segredo.id,reveladoEm:null},data:{reveladoEm:new Date()}});
      if(revelacao.count!==1)return;
      const membros=await tx.hogwartsFamiliaMembro.findMany({where:{familiaId:segredo.familiaId},select:{personagemId:true}});
      const evento={campanhaId:id,atorId:usuario.id,modulo:"familia",acao:"segredo.revelar",resumo:`Um novo detalhe da família ${segredo.familia.nome} foi revelado`,detalhes:{familiaId:segredo.familiaId,segredoId:segredo.id}};
      await tx.eventoAuditoriaHogwarts.create({data:evento});
      if(membros.length)await tx.eventoAuditoriaHogwarts.createMany({data:membros.map(m=>({...evento,personagemId:m.personagemId}))});
    });
  }
  else throw new Error("Ação de família inválida.");return NextResponse.json({ok:true});
}catch(e){return NextResponse.json({erro:e instanceof Error?e.message:"Não foi possível atualizar a família."},{status:400});}}
