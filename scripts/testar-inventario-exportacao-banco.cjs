/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('@prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {execFileSync}=require('node:child_process');
const esbuild=require(process.env.ESBUILD||'/tmp/ww-expansoes-tools/node_modules/esbuild');
const url=process.env.HUB_TEST_DATABASE_URL;
if(url!=='postgresql://hub_test@127.0.0.1:55439/hub_inventario')throw Error('Este teste só usa o banco descartável local nomeado.');
const db=new PrismaClient({adapter:new PrismaPg({connectionString:url})});
(async()=>{globalThis.__inventarioDb=db;globalThis.__inventarioUser=null;const out='artifacts/inventario-acervo/handlers.cjs';await esbuild.build({stdin:{contents:`export * as fichas from './src/app/api/personagens/[id]/route.ts';export * as campanhas from './src/app/api/campanhas/[id]/route.ts';export * as copiar from './src/app/api/personagens/[id]/copiar/route.ts';export * as inventario from './src/app/api/personagens/[id]/inventario-livre/route.ts';export * as exportacao from './src/app/api/campanhas/[id]/acervo-exportacao/route.ts';export {snapshotCampanha} from './src/lib/acervo-exportacao/snapshot.ts';export {montarPacote} from './src/lib/acervo-exportacao/pacote.ts';`,resolveDir:process.cwd()},outfile:out,bundle:true,platform:'node',format:'cjs',packages:'external',plugins:[{name:'sessao-local',setup(build){build.onResolve({filter:/^@\/lib\/(usuario|banco)$/},args=>({path:args.path,namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:args.path.endsWith('banco')?'export const banco=globalThis.__inventarioDb':'export const usuarioAtual=async()=>globalThis.__inventarioUser',loader:'js'}));}}]});
const {fichas,campanhas,copiar,inventario,exportacao,snapshotCampanha,montarPacote}=require(path.resolve(out));
const dono=randomUUID(),mestre=randomUUID(),aux=randomUUID(),intruso=randomUUID(),campanha=randomUUID(),outra=randomUUID(),pid=randomUUID();
for(const [id,nome]of [[dono,'Jogador'],[mestre,'Mestre'],[aux,'Auxiliar'],[intruso,'Outro']])await db.usuario.create({data:{id,nome,email:id+'@test.invalid'}});
const sistema=await db.sistema.upsert({where:{chave:'wands-wizards'},update:{},create:{chave:'wands-wizards',nome:'Wands & Wizards'}});
for(const id of [campanha,outra])await db.campanha.create({data:{id,nome:'Campanha isolada',slug:id,codigoConvite:id,sistemaId:sistema.id}});
for(const [usuarioId,papel]of [[dono,'JOGADOR'],[mestre,'MESTRE'],[aux,'MESTRE_AUXILIAR']])await db.participacao.create({data:{campanhaId:campanha,usuarioId,papel}});
await db.personagem.create({data:{id:pid,nome:'Personagem legado',donoId:dono,campanhaId:campanha,sistemaId:sistema.id,dados:{inventario:[{id:'legado',nome:'Item anterior',quantidade:1}],colecaoFigurinhas:[{id:'godric',quantidade:2}],_mestre:{segredo:'não exportar ficha inteira'}}}});
// Exercita a migração aditiva exata em uma ficha anterior, somente neste banco local descartável.
await db.$transaction(async tx=>{await tx.$executeRawUnsafe('ALTER TABLE "personagens" DROP COLUMN "inventarioLivre", DROP COLUMN "versaoInventario"');await tx.$executeRawUnsafe(await fs.readFile('prisma/migrations/0035_inventario_livre/migration.sql','utf8'));});
assert.equal((await db.personagem.findUniqueOrThrow({where:{id:pid}})).dados.inventario[0].nome,'Item anterior');
const item=await db.colecionavel.create({data:{campanhaId:campanha,categoria:'criaturas',nome:'Criatura com segredo',descricao:'História',segredoMestre:'Local secreto',edicao:'Variante antiga',silhuetaArquivo:await require('sharp')({create:{width:16,height:16,channels:4,background:'#111111'}}).png().toBuffer(),imagemUrl:'/wands-wizards/experiencias/colecoes/cenas/criaturas.svg',repetivel:true}});
await db.colecionavel.create({data:{campanhaId:outra,categoria:'sapos',nome:'NÃO EXPORTAR OUTRA CAMPANHA',descricao:'Privado'}});
await db.acervoColecionavel.create({data:{personagemId:pid,campanhaId:campanha,colecionavelId:item.id,quantidade:3}});
await db.concessaoColecionavel.createMany({data:Array.from({length:125},(_,i)=>({operacaoId:randomUUID(),personagemId:pid,campanhaId:campanha,colecionavelId:item.id,quantidade:1,concedidoPorId:mestre,tipo:i%2?'retirar':'conceder'}))});
const ctx={params:Promise.resolve({id:pid})},ctxC={params:Promise.resolve({id:campanha})},req=new Request('https://test.invalid');
for(const actor of [null,{id:intruso}]){globalThis.__inventarioUser=actor;assert.equal((await inventario.GET(req,ctx)).status,404);assert.equal((await exportacao.GET(req,ctxC)).status,404);}
for(const id of [dono,aux]){globalThis.__inventarioUser={id};assert.equal((await inventario.GET(req,ctx)).status,200);assert.equal((await exportacao.GET(req,ctxC)).status,404);}
await db.personagem.update({where:{id:pid},data:{compartilhado:true}});globalThis.__inventarioUser=null;assert.equal((await (await inventario.GET(req,ctx)).json()).editavel,false);await db.personagem.update({where:{id:pid},data:{compartilhado:false}});
globalThis.__inventarioUser={id:dono};
const malicioso=await inventario.PUT(new Request('https://test.invalid',{method:'PUT',body:JSON.stringify({versao:0,itens:[],_mestre:{segredo:'forjado'}})}),ctx);assert.equal(malicioso.status,400);
const antes=await db.personagem.findUniqueOrThrow({where:{id:pid}});
const payload={versao:0,itens:[{id:'livre',nome:'Recordação',quantidade:2,categoria:'Minha categoria',descricao:'a'.repeat(15000),efeitos:'+999 CA apenas escrito'}]};
const put=()=>inventario.PUT(new Request('https://test.invalid',{method:'PUT',body:JSON.stringify(payload)}),ctx);
const paralelos=await Promise.all([put(),put()]);assert.deepEqual(paralelos.map(r=>r.status).sort(),[200,409]);
const saved=await db.personagem.findUniqueOrThrow({where:{id:pid}});assert.deepEqual(saved.inventarioLivre,payload.itens);assert.equal(saved.atualizadoEm.getTime(),antes.atualizadoEm.getTime(),'Inventário não invalida versão/autosalvamento da ficha');assert.equal(saved.dados.inventario[0].nome,'Item anterior');assert.equal(saved.dados._mestre.segredo,'não exportar ficha inteira');
const copiaR=await copiar.POST(new Request('https://test.invalid',{method:'POST',body:JSON.stringify({sandbox:true})}),ctx);assert.equal(copiaR.status,201);const copiaId=(await copiaR.json()).personagem.id;assert.deepEqual((await db.personagem.findUniqueOrThrow({where:{id:copiaId}})).inventarioLivre,payload.itens);
await db.$disconnect();const reaberto=new PrismaClient({adapter:new PrismaPg({connectionString:url})});assert.deepEqual((await reaberto.personagem.findUniqueOrThrow({where:{id:pid}})).inventarioLivre,payload.itens);await reaberto.$disconnect();
globalThis.__inventarioUser={id:mestre};assert.equal((await exportacao.GET(req,{params:Promise.resolve({id:outra})})).status,404);
globalThis.__inventarioUser={id:dono};assert.equal((await fichas.DELETE(req,ctx)).status,409);assert.ok(await db.personagem.findUnique({where:{id:pid}}));globalThis.__inventarioUser={id:mestre};assert.equal((await campanhas.DELETE(req,ctxC)).status,409);assert.equal(await db.concessaoColecionavel.count({where:{campanhaId:campanha}}),125);
const s=await snapshotCampanha(db,campanha);assert.equal(s.catalogo.length,1);assert.equal(s.historico.length,125);assert.equal(s.descobertas[0].quantidade,3);assert.equal(s.variantesLegadas[0].colecaoFigurinhas[0].quantidade,2);assert.ok(!JSON.stringify(s).includes('NÃO EXPORTAR'));assert.ok(!JSON.stringify(s).includes('não exportar ficha inteira'));
const response=await exportacao.GET(req,ctxC);assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'private, no-store');await fs.writeFile('artifacts/inventario-acervo/Acervo_Magico_Exportacao_Completa.zip',Buffer.from(await response.arrayBuffer()),{mode:0o600});
const pacote=await montarPacote(s);await fs.writeFile('/tmp/hub-inventario-test/backup-validacao.zip',pacote,{mode:0o600});
// Reconstrução a partir do JSON/PNG do ZIP, não a partir dos objetos ainda em memória.
const portavel=JSON.parse(execFileSync('python3',['-c',`import zipfile,json,base64
with zipfile.ZipFile('artifacts/inventario-acervo/Acervo_Magico_Exportacao_Completa.zip') as z:
 d=json.loads(z.read('dados/snapshot.json'))
 for i in d['catalogo']:
  if i.get('silhuetaArquivo'): i['silhuetaArquivo']=base64.b64encode(z.read(i['silhuetaArquivo'])).decode()
  i.pop('imagemExportada',None)
 print(json.dumps(d))`],{encoding:'utf8'}));
for(const i of portavel.catalogo)if(i.silhuetaArquivo)i.silhuetaArquivo=Buffer.from(i.silhuetaArquivo,'base64');
// Remove somente linhas sintéticas do banco descartável antes de restaurá-las.
await db.concessaoColecionavel.deleteMany({where:{campanhaId:campanha}});await db.acervoColecionavel.deleteMany({where:{campanhaId:campanha}});await db.colecionavel.deleteMany({where:{campanhaId:campanha}});
await db.$transaction(async tx=>{await tx.colecionavel.createMany({data:portavel.catalogo});await tx.acervoColecionavel.createMany({data:portavel.descobertas});await tx.concessaoColecionavel.createMany({data:portavel.historico});});
const depois=await snapshotCampanha(db,campanha);assert.deepEqual(depois,s);
// Sem coleção cosmética nem saldo, o histórico de retiradas ainda precisa impedir cascata.
await db.personagem.update({where:{id:pid},data:{dados:{...antes.dados,colecaoFigurinhas:[]}}});await db.acervoColecionavel.deleteMany({where:{personagemId:pid}});globalThis.__inventarioUser={id:dono};assert.equal((await fichas.DELETE(req,ctx)).status,409);assert.equal(await db.concessaoColecionavel.count({where:{personagemId:pid}}),125);
// Exclusões normais continuam funcionando quando não há Acervo, inclusive em outro sistema.
const pf=await db.sistema.upsert({where:{chave:'pathfinder-2e-remaster'},update:{},create:{chave:'pathfinder-2e-remaster',nome:'Pathfinder'}});
for(const [sistemaId,dados]of [[sistema.id,{}],[pf.id,{colecaoFigurinhas:[{id:'campo de outro jogo'}]}]]){const p=await db.personagem.create({data:{nome:'Sem Acervo',sistemaId,donoId:dono,dados}});assert.equal((await fichas.DELETE(req,{params:Promise.resolve({id:p.id})})).status,200);}
const vazia=await db.campanha.create({data:{nome:'Sem Acervo',slug:randomUUID(),codigoConvite:randomUUID(),sistemaId:sistema.id}});await db.participacao.create({data:{campanhaId:vazia.id,usuarioId:mestre,papel:'MESTRE'}});globalThis.__inventarioUser={id:mestre};assert.equal((await campanhas.DELETE(req,{params:Promise.resolve({id:vazia.id})})).status,200);
console.log('PostgreSQL real: inventário livre, concorrência 200/409, persistência, permissões de 5 perfis, isolamento entre campanhas, ZIP privado com 125 eventos e reconstrução sem perdas passaram.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.$disconnect());
