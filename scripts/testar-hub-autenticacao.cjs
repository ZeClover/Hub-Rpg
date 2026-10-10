/* eslint-disable @typescript-eslint/no-require-imports -- Teste Node em CommonJS, com dependências isoladas. */
/* Executa os handlers reais sem uma sessão; nunca conecta ao banco real. */
const esbuild=require(process.env.ESBUILD||'/tmp/hub-vercel-cli/node_modules/esbuild');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
async function arquivos(dir){const es=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(es.map(e=>e.isDirectory()?arquivos(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
(async()=>{
 const routes=(await arquivos(root+'/src/app/api')).filter(p=>p.endsWith('/route.ts')),resultados=[];let ficha,criacao;globalThis.__auditUser=null;
 for(const file of routes){
  const plugins=[{name:'conta-isolada',setup(b){
   b.onResolve({filter:/^(?:@\/lib\/(?:usuario|banco)|\.\/banco|.*\/src\/lib\/(?:usuario|banco)(?:\.ts)?)$/},a=>({path:a.path.includes('usuario')?'usuario':'banco',namespace:'conta-isolada'}));
   b.onResolve({filter:/^next\/server$/},()=>({path:'server',namespace:'conta-isolada'}));
   b.onLoad({filter:/.*/,namespace:'conta-isolada'},a=>({contents:a.path==='usuario'?'export async function usuarioAtual(){return globalThis.__auditUser;}':a.path==='banco'?'export const banco=new Proxy({}, {get(_,key){if(globalThis.__auditDb&&key in globalThis.__auditDb)return globalThis.__auditDb[key];throw Error("Banco acessado sem sessão");}});':'export const NextResponse={json:(data,options)=>Response.json(data,options)};',loader:'js'}));
  }}];
  const code=await esbuild.build({entryPoints:[file],alias:{'@':root+'/src'},plugins,bundle:true,write:false,format:'cjs',platform:'node',packages:'external'});
  const m={exports:{}};new Function('require','module','exports','__dirname',code.outputFiles[0].text)(require,m,m.exports,path.dirname(file));
  if(file.endsWith('/api/personagens/[id]/route.ts'))ficha=m.exports;
  if(file.endsWith('/api/personagens/route.ts'))criacao=m.exports;
  for(const [method,handler] of Object.entries(m.exports)){
   if(!['GET','POST','PUT','PATCH','DELETE'].includes(method))continue;
   // GET da ficha compartilhada é público por decisão de produto; testado separadamente.
   if(file.endsWith('/api/personagens/[id]/route.ts')&&method==='GET')continue;
   const request=new Request('https://teste.local/api',{method,headers:{'Content-Type':'application/json'},...(method==='GET'?{}:{body:'{}'})});
   const response=await handler(request,{params:Promise.resolve({id:'auditoria',personagemId:'p',itemId:'i',sessaoId:'s',jogadorId:'u',colecionavelId:'c'})});
   assert.ok(response.status===401||response.status===404,path.relative(root,file)+' '+method+' deve recusar acesso sem sessão');
   assert.deepEqual(Object.keys(await response.json()),['erro'],'a recusa não pode retornar dados privados');
   resultados.push({rota:path.relative(root,file),metodo:method,status:response.status});
  }
 }
 const sistemas=['pathfinder-2e-remaster','kaizoku-no-sho','fabula-ultima','sao','dnd-5e','campanha-livre','sistema-do-savio','wands-wizards','hogwarts-rpg','thryliki-chelona'];
 const papeis=[];
 for(const sistema of sistemas){
  const personagem={id:'p',nome:'Original',dados:{perfil:{nome:'Original'},_mestre:{segredo:'segredo protegido'}},donoId:'dono',campanhaId:'campanha',compartilhado:false,sistema:{chave:sistema},atualizadoEm:new Date()};
  globalThis.__auditDb={personagem:{findUnique:async()=>personagem},participacao:{findMany:async()=>globalThis.__auditUser?.id==='mestre'?[{campanhaId:'campanha'}]:[]}};
  const ctx={params:Promise.resolve({id:'p'})},req=new Request('https://teste.local/api');
  globalThis.__auditUser=null;assert.equal((await ficha.GET(req,ctx)).status,404);
  personagem.compartilhado=true;let response=await ficha.GET(req,ctx),body=await response.json();assert.equal(response.status,200);assert.equal(body.personagem.podeEditar,false);assert.equal(body.personagem.dados._mestre,undefined);
  globalThis.__auditUser={id:'outro'};response=await ficha.GET(req,ctx);assert.equal((await response.json()).personagem.podeEditar,false);assert.equal((await ficha.PATCH(new Request('https://teste.local/api',{method:'PATCH',body:JSON.stringify({dados:{nome:'forjado'}})}),ctx)).status,404);
  globalThis.__auditUser={id:'dono'};body=await (await ficha.GET(req,ctx)).json();assert.equal(body.personagem.ehDono,true);assert.equal(body.personagem.podeEditar,true);assert.equal(body.personagem.dados._mestre,undefined);
  globalThis.__auditUser={id:'mestre'};body=await (await ficha.GET(req,ctx)).json();assert.equal(body.personagem.ehDono,false);assert.equal(body.personagem.podeEditar,true);assert.equal(body.personagem.dados._mestre.segredo,'segredo protegido');
  let criado;globalThis.__auditUser={id:'dono'};globalThis.__auditDb.sistema={findUnique:async()=>({id:'s',chave:sistema})};globalThis.__auditDb.personagem.create=async({data})=>{criado=data;return {id:'novo',nome:data.nome,dados:data.dados};};
  response=await criacao.POST(new Request('https://teste.local/api',{method:'POST',body:JSON.stringify({sistemaChave:sistema})}));assert.equal(response.status,201);assert.equal(criado.donoId,'dono');assert.equal(criado.sistemaId,'s');assert.deepEqual(criado.dados,{});assert.equal(criado.ehMonstro,false);
  response=await criacao.POST(new Request('https://teste.local/api',{method:'POST',body:JSON.stringify({sistemaChave:sistema,ehMonstro:true})}));assert.equal(response.status,201);assert.equal(criado.ehMonstro,true);
  papeis.push({sistema,anonimoPrivado:404,anonimoCompartilhado:200,leitorSemEscrita:404,criacaoPJ:true,criacaoNPC:true,dono:true,mestre:true,segredosProtegidos:true});
 }
 globalThis.__auditUser=null;delete globalThis.__auditDb;
 await fs.mkdir(root+'/artifacts/hub-auditoria',{recursive:true});await fs.writeFile(root+'/artifacts/hub-auditoria/permissoes-fichas.json',JSON.stringify(papeis,null,2));
 console.log('PASS dez sistemas: acesso do dono/Mestre, compartilhamento somente leitura, escrita negada a terceiro e segredos exclusivos do Mestre.');
 await fs.mkdir(root+'/artifacts/hub-auditoria',{recursive:true});await fs.writeFile(root+'/artifacts/hub-auditoria/autenticacao.json',JSON.stringify(resultados,null,2));
 console.log('PASS',resultados.length,'handlers de',routes.length,'rotas: acesso anônimo recusado antes de consultar o banco. GET compartilhado da ficha é tratado separadamente.');
})().catch(e=>{console.error(e);process.exitCode=1});
