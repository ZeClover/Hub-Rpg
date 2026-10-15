/* eslint-disable @typescript-eslint/no-require-imports -- PostgreSQL local descartável; nunca usa variáveis do banco de produção. */
const esbuild=require(process.env.ESBUILD||'/tmp/ww-expansoes-tools/node_modules/esbuild');
const {PrismaClient}=require('@prisma/client'),{PrismaPg}=require('@prisma/adapter-pg'),{randomUUID}=require('node:crypto');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const raw=process.env.WW_TEST_DATABASE_URL;
 if(!raw)throw Error('Defina WW_TEST_DATABASE_URL para o banco local descartável ww_expansoes.');
 const u=new URL(raw);if(!['127.0.0.1','localhost'].includes(u.hostname)||u.port!=='55439'||u.pathname!=='/ww_expansoes')throw Error('Este teste recusa qualquer banco fora de localhost:55439/ww_expansoes.');
 const banco=new PrismaClient({adapter:new PrismaPg({connectionString:raw})});
 let usuario=null;globalThis.__wwLocalDb=banco;globalThis.__wwLocalUser=()=>usuario;
 const {novaFicha}=await import('../public/wands-wizards/ficha-regras.mjs');
 try{
  const sufixo=randomUUID(),mestreId=randomUUID(),jogadorId=randomUUID();
  const sistema=await banco.sistema.upsert({where:{chave:'wands-wizards'},create:{chave:'wands-wizards',nome:'Wands & Wizards'},update:{}});
  await banco.usuario.createMany({data:[{id:mestreId,email:`mestre-${sufixo}@teste.local`},{id:jogadorId,email:`jogador-${sufixo}@teste.local`}]});
  const campanha=await banco.campanha.create({data:{nome:'Campanha de teste',slug:'exp-'+sufixo,codigoConvite:sufixo,sistemaId:sistema.id}});
  await banco.participacao.createMany({data:[{campanhaId:campanha.id,usuarioId:mestreId,papel:'MESTRE'},{campanhaId:campanha.id,usuarioId:jogadorId,papel:'JOGADOR'}]});
  const personagem=await banco.personagem.create({data:{nome:'Elisa teste',dados:{...novaFicha(),nome:'Elisa teste'},sistemaId:sistema.id,donoId:jogadorId,campanhaId:campanha.id}});
  // Verify the exact additive migration against an existing campaign row.
  await banco.$executeRawUnsafe('ALTER TABLE "campanhas" DROP COLUMN "expansoesWandsWizards"');
  await banco.$executeRawUnsafe(await fs.readFile(root+'/prisma/migrations/0034_expansoes_wands_wizards/migration.sql','utf8'));
  assert.equal((await banco.campanha.findUnique({where:{id:campanha.id}})).expansoesWandsWizards,null);
  const plugins=[{name:'sessao-local',setup(b){b.onResolve({filter:/^@\/lib\/(usuario|banco)$/},a=>({path:a.path,namespace:'local'}));b.onResolve({filter:/^next\/server$/},a=>({path:a.path,namespace:'local'}));b.onLoad({filter:/.*/,namespace:'local'},a=>({contents:a.path.endsWith('/banco')?'export const banco=globalThis.__wwLocalDb':a.path.endsWith('/usuario')?'export const usuarioAtual=async()=>globalThis.__wwLocalUser()':'export const NextResponse={json:(d,o)=>Response.json(d,o)}',loader:'js'}));}}];
  async function carregar(file){const b=await esbuild.build({entryPoints:[path.join(root,file)],alias:{'@':root+'/src'},plugins,bundle:true,write:false,format:'cjs',platform:'node',packages:'external'});const m={exports:{}};new Function('require','module','exports',b.outputFiles[0].text)(require,m,m.exports);return m.exports;}
  const exp=await carregar('src/app/api/campanhas/[id]/wands-wizards-expansoes/route.ts'),ficha=await carregar('src/app/api/personagens/[id]/route.ts');
  const ctx={params:Promise.resolve({id:campanha.id})},pj={params:Promise.resolve({id:personagem.id})};
  const req=(data,method='PATCH')=>new Request('https://local.test',{method,body:method==='GET'?undefined:JSON.stringify(data),headers:{'Content-Type':'application/json'}});
  usuario={id:jogadorId};assert.equal((await exp.GET(req({},'GET'),ctx)).status,404);
  usuario={id:mestreId};const toggles=await Promise.all([exp.PATCH(req({ativo:true,revisao:0}),ctx),exp.PATCH(req({ativo:true,revisao:0}),ctx)]);assert.deepEqual(toggles.map(r=>r.status).sort(),[200,409]);
  usuario={id:jogadorId};let atual=await banco.personagem.findUnique({where:{id:personagem.id}});
  const dados={...atual.dados,extensoesWW:{beneficiosEscola:{1:'newt-bewitching-studies'},magias:['newt-inevitam']}};
  let r=await ficha.PATCH(req({dados,atualizadoEmBase:atual.atualizadoEm.toISOString()}),pj);assert.equal(r.status,200,JSON.stringify(await r.json()));
  atual=await banco.personagem.findUnique({where:{id:personagem.id}});assert.deepEqual(atual.dados.extensoesWW.magias,['newt-inevitam']);assert.ok(!atual.dados.magias.includes('newt-inevitam'));
  usuario={id:mestreId};const grants=await Promise.all([exp.POST(req({personagemId:personagem.id,formacao:{id:'newt-wandmakers-gift'}},'POST'),ctx),exp.POST(req({personagemId:personagem.id,formacao:{id:'newt-wandmakers-gift'}},'POST'),ctx)]);assert.ok(grants.every(r=>[200,409].includes(r.status)));assert.ok(grants.some(r=>r.status===200));
  atual=await banco.personagem.findUnique({where:{id:personagem.id}});assert.equal(atual.dados.extensoesWW.formacoes.length,1);assert.deepEqual(atual.dados.inventario,[]);
  const salvo=JSON.stringify(atual.dados.extensoesWW);assert.equal((await exp.PATCH(req({ativo:false,revisao:1}),ctx)).status,200);
  usuario={id:jogadorId};const reaberto=await (await ficha.GET(req({},'GET'),pj)).json();assert.deepEqual(reaberto.personagem.expansoesWandsWizards.ativas,[]);assert.equal(JSON.stringify(reaberto.personagem.dados.extensoesWW),salvo);
  const novoCliente=new PrismaClient({adapter:new PrismaPg({connectionString:raw})});try{const persistido=await novoCliente.personagem.findUnique({where:{id:personagem.id}});assert.equal(JSON.stringify(persistido.dados.extensoesWW),salvo);}finally{await novoCliente.$disconnect();}
  const out=root+'/artifacts/wands-wizards/expansoes';await fs.mkdir(out,{recursive:true});await fs.writeFile(out+'/banco-local.json',JSON.stringify({banco:'PostgreSQL 17 local descartável',prisma:'cliente real e schema completo',migracao0034:'SQL aplicado sobre campanha existente, default null',autenticacao:'sessão isolada; papéis e participações reais no banco',configConcorrente:'200/409; sem perda de revisão',concessaoConcorrente:'idempotente ou 409; uma formação, zero itens',persistencia:'confirmada por outro cliente Prisma',desativacao:'dados preservados',producao:'nenhum acesso de escrita'},null,2));
  console.log('PASS PostgreSQL local: migração aditiva real, autorização por participação, JSON opt-in, CAS concorrente 200/409, salvamento versionado, concessão sem duplicação, desativação e releitura por outro cliente.');
 }finally{await banco.$disconnect();}
})().catch(e=>{console.error(e);process.exitCode=1});
