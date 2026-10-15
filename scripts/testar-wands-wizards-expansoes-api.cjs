/* eslint-disable @typescript-eslint/no-require-imports -- Handlers reais; somente conta e banco isolados. */
const esbuild=require(process.env.ESBUILD||'/tmp/ww-expansoes-tools/node_modules/esbuild');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const {novaFicha}=await import('../public/wands-wizards/ficha-regras.mjs');
 let usuario=null,flag=null,papel='JOGADOR',conflitoConfig=false,conflitoFicha=false,escritas=0,consultas=0;
 let personagem={id:'11111111-1111-4111-8111-111111111111',nome:'Teste',dados:novaFicha(),donoId:'dono',campanhaId:'c',ehMonstro:false,compartilhado:false,sistema:{chave:'wands-wizards'},atualizadoEm:new Date('2026-10-15T12:00:00Z')};
 const banco={sistema:{findUnique:async()=>({chave:'wands-wizards'})},
  campanha:{findUnique:async({where})=>{consultas++;return where.id==='c'?{id:'c',sistema:{chave:'wands-wizards'},expansoesWandsWizards:structuredClone(flag)}:null;},updateMany:async({data})=>{if(conflitoConfig)return{count:0};flag=data.expansoesWandsWizards;escritas++;return{count:1};}},
  participacao:{findUnique:async({where})=>{consultas++;return where.campanhaId_usuarioId.campanhaId==='c'?{papel,usuarioId:usuario?.id}:null;},findMany:async()=>['MESTRE','MESTRE_AUXILIAR'].includes(papel)?[{campanhaId:'c'}]:[]},
  personagem:{findUnique:async({where})=>{consultas++;return where.id===personagem.id?structuredClone(personagem):null;},findMany:async()=>[{id:'11111111-1111-4111-8111-111111111111',nome:'Teste'}],updateMany:async({where,data})=>{if(conflitoFicha||where.campanhaId!==personagem.campanhaId||String(where.atualizadoEm)!==String(personagem.atualizadoEm))return{count:0};Object.assign(personagem,data);escritas++;return{count:1};},update:async({data})=>{Object.assign(personagem,data);personagem.atualizadoEm=new Date(personagem.atualizadoEm.getTime()+1000);escritas++;return structuredClone(personagem);}},
 };
 globalThis.__wwExpDb=banco;globalThis.__wwExpUser=()=>usuario;
 const plugins=[{name:'conta-banco',setup(b){b.onResolve({filter:/^@\/lib\/(usuario|banco)$/},a=>({path:a.path,namespace:'isolado'}));b.onResolve({filter:/^next\/server$/},a=>({path:a.path,namespace:'isolado'}));b.onLoad({filter:/.*/,namespace:'isolado'},a=>({contents:a.path.endsWith('/banco')?'export const banco=globalThis.__wwExpDb':a.path.endsWith('/usuario')?'export const usuarioAtual=async()=>globalThis.__wwExpUser()':'export const NextResponse={json:(d,o)=>Response.json(d,o)}',loader:'js'}));}}];
 async function carregar(file){const build=await esbuild.build({entryPoints:[path.join(root,file)],alias:{'@':root+'/src'},plugins,bundle:true,write:false,format:'cjs',platform:'node',packages:'external'});const m={exports:{}};new Function('require','module','exports',build.outputFiles[0].text)(require,m,m.exports);return m.exports;}
 const exp=await carregar('src/app/api/campanhas/[id]/wands-wizards-expansoes/route.ts'),ficha=await carregar('src/app/api/personagens/[id]/route.ts');
 const ctx={params:Promise.resolve({id:'c'})},pj={params:Promise.resolve({id:'11111111-1111-4111-8111-111111111111'})};
 const req=(body,method='PATCH')=>new Request('https://teste.local/api',{method,headers:{'Content-Type':'application/json'},body:method==='GET'?undefined:JSON.stringify(body)});
 for(const method of ['GET','PATCH','POST']){consultas=0;assert.equal((await exp[method](req({},method),ctx)).status,401);assert.equal(consultas,0);}
 usuario={id:'dono'};
 for(const method of ['GET','PATCH','POST']){const r=await exp[method](req({},method),ctx);assert.equal(r.status,404);assert.deepEqual(await r.json(),{erro:'não encontrado'});}
 papel='MESTRE';usuario={id:'mestre'};
 let response=await exp.GET(req({},'GET'),ctx),body=await response.json();assert.equal(response.status,200);assert.deepEqual(body.configuracao.ativas,[]);assert.equal(body.catalogo.opcoes.length,195);
 assert.equal((await exp.PATCH(req({ativo:true,revisao:0,aprovarB:true}),ctx)).status,400);
 response=await exp.PATCH(req({ativo:true,revisao:0}),ctx);assert.equal(response.status,200);assert.deepEqual(flag.ativas,['newt-trunk']);
 assert.equal((await exp.PATCH(req({ativo:false,revisao:0}),ctx)).status,409);
 conflitoConfig=true;assert.equal((await exp.PATCH(req({ativo:false,revisao:1}),ctx)).status,409);conflitoConfig=false;
 papel='MESTRE_AUXILIAR';assert.equal((await exp.PATCH(req({ativo:false,revisao:1}),ctx)).status,200);assert.deepEqual(flag.ativas,[]);
 const a={...novaFicha(),extensoesWW:{beneficiosEscola:{1:'newt-bewitching-studies'}}};
 papel='JOGADOR';usuario={id:'dono'};
 response=await ficha.PATCH(req({dados:a,atualizadoEmBase:personagem.atualizadoEm.toISOString()}),pj);assert.equal(response.status,400);
 papel='MESTRE';usuario={id:'mestre'};assert.equal((await exp.PATCH(req({ativo:true,revisao:2}),ctx)).status,200);
 papel='JOGADOR';usuario={id:'dono'};
 body=await (await ficha.GET(req({},'GET'),pj)).json();assert.deepEqual(body.personagem.expansoesWandsWizards.ativas,['newt-trunk']);
 response=await ficha.PATCH(req({dados:a,atualizadoEmBase:personagem.atualizadoEm.toISOString()}),pj);assert.equal(response.status,200,JSON.stringify(await response.json()));assert.equal(personagem.dados.extensoesWW.beneficiosEscola[1],'newt-bewitching-studies');
 const forged=structuredClone(personagem.dados);forged.extensoesWW.formacoes=[{id:'newt-wandmakers-gift'}];
 assert.equal((await ficha.PATCH(req({dados:forged,atualizadoEmBase:personagem.atualizadoEm.toISOString()}),pj)).status,400);
 const invalid=structuredClone(personagem.dados);invalid.extensoesWW.beneficiosEscola[1]='newt-first-strike';
 assert.equal((await ficha.PATCH(req({dados:invalid,atualizadoEmBase:personagem.atualizadoEm.toISOString()}),pj)).status,400);
 papel='MESTRE';usuario={id:'mestre'};
 assert.equal((await exp.POST(req({personagemId:'22222222-2222-4222-8222-222222222222',formacao:{id:'newt-wandmakers-gift'}},'POST'),ctx)).status,404);
 personagem.ehMonstro=true;assert.equal((await exp.POST(req({personagemId:'11111111-1111-4111-8111-111111111111',formacao:{id:'newt-wandmakers-gift'}},'POST'),ctx)).status,404);personagem.ehMonstro=false;
 assert.equal((await exp.POST(req({personagemId:'11111111-1111-4111-8111-111111111111',formacao:{id:'newt-aqua-research'}},'POST'),ctx)).status,400);
 for(let i=0;i<2;i++){response=await exp.POST(req({personagemId:'11111111-1111-4111-8111-111111111111',formacao:{id:'newt-wandmakers-gift'}},'POST'),ctx);assert.equal(response.status,200,JSON.stringify(await response.json()));}
 assert.equal(personagem.dados.extensoesWW.formacoes.length,1);assert.deepEqual(personagem.dados.inventario,[]);
 conflitoFicha=true;assert.equal((await exp.POST(req({personagemId:'11111111-1111-4111-8111-111111111111',formacao:{id:'newt-beast-speech'}},'POST'),ctx)).status,409);conflitoFicha=false;
 const anteriores=JSON.stringify(personagem.dados.extensoesWW),total=escritas;
 assert.equal((await exp.PATCH(req({ativo:false,revisao:3}),ctx)).status,200);assert.equal(escritas,total+1,'desativação não grava personagens');
 papel='JOGADOR';usuario={id:'dono'};
 body=await (await ficha.GET(req({},'GET'),pj)).json();assert.deepEqual(body.personagem.expansoesWandsWizards.ativas,[]);assert.equal(JSON.stringify(body.personagem.dados.extensoesWW),anteriores);
 const notas=structuredClone(personagem.dados);notas.anotacoes='Edição com expansão suspensa';notas.calculos={ca:999};
 response=await ficha.PATCH(req({dados:notas,atualizadoEmBase:personagem.atualizadoEm.toISOString()}),pj);assert.equal(response.status,200,JSON.stringify(await response.json()));assert.equal(personagem.dados.calculos.ca,13);assert.equal(JSON.stringify(personagem.dados.extensoesWW),anteriores);
 const out=path.join(root,'artifacts/wands-wizards/expansoes');await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'api.json'),JSON.stringify({anonimo:'401 sem consultas',jogador:'404 no catálogo privado e na configuração',mestre:'ativa A e concede formação',auxiliar:'pode configurar',pendentes:'B/C recusadas',conflitos:'configuração e personagem retornam 409',persistencia:'escolhas mantidas após desativação e salvamento',estoque:'nenhum item gerado',banco:'isolado; handlers e validadores reais'},null,2));
 console.log('PASS expansões API: anonimato, dono/Mestre/auxiliar, configuração opt-in, catálogo privado, B/C, ficha/nível/NPC, concessão idempotente, CAS, persistência e desativação sem perda.');
})().catch(e=>{console.error(e);process.exitCode=1});
