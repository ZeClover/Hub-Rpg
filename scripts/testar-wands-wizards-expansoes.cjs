/* eslint-disable @typescript-eslint/no-require-imports -- Navegador e regras reais, rede da conta isolada. */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'/opt/codex/runtimes/cua/lib/node_modules/playwright-core');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),out=path.resolve(__dirname,'../artifacts/wands-wizards/expansoes');
(async()=>{
 const {novaFicha,prepararFichaWandsWizards}=await import('../public/wands-wizards/ficha-regras.mjs');
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});await fs.mkdir(out,{recursive:true});
 async function ambiente({ativo=true,mestre=false,editar=true,seed={}}={}){
  let salvo={...novaFicha(),varinhaRevelada:true,...seed},versao='2026-10-15T12:00:00.000Z',flag=ativo,escritas=0;
  const ctx=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'}),page=await ctx.newPage(),erros=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>erros.push(e.message));
  await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin!=='https://ww.local')return route.fulfill({status:204});
   if(u.pathname==='/api/personagens/exp'){
    const configuracao={versao:1,ativas:flag?['newt-trunk']:[]};
    if(req.method()==='PATCH'){const body=req.postDataJSON();assert.ok(editar);assert.equal(body.atualizadoEmBase,versao);const ready=prepararFichaWandsWizards(salvo,body.dados,{emCampanha:true,ehMestre:mestre,expansoesWandsWizards:configuracao});if(ready.erro)return route.fulfill({status:400,json:{erro:ready.erro}});salvo=ready.dados;escritas++;versao=new Date(Date.parse(versao)+1000).toISOString();return route.fulfill({json:{personagem:{atualizadoEm:versao}}});}
    return route.fulfill({json:{personagem:{id:'exp',dados:salvo,ehDono:!mestre,podeEditar:editar,ehMestre:mestre,campanhaId:'c',atualizadoEm:versao,sistema:{chave:'wands-wizards'},expansoesWandsWizards:configuracao}}});
   }
   if(u.pathname.startsWith('/api/'))return route.fulfill({status:404,json:{erro:'não encontrado'}});
   try{return route.fulfill({body:await fs.readFile(path.join(root,u.pathname)),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'})[path.extname(u.pathname)]||'application/octet-stream'});}catch{return route.fulfill({status:404});}
  });
  async function abrir(){await page.goto('https://ww.local/wands-wizards.html?id=exp');await page.waitForFunction(()=>document.querySelectorAll('.spell-entry').length>140);}
  await abrir();return{page,ctx,erros,salvo:()=>structuredClone(salvo),escritas:()=>escritas,ativar:v=>{flag=v;},abrir};
 }
 async function salvar(p){await p.locator('#salvar').click();await p.locator('#status').filter({hasText:'salvo na sua conta'}).waitFor();}
 try{
  const a=await ambiente();const p=a.page;
  assert.equal(await p.locator('.spell-entry').count(),149);
  await p.locator('[data-tab=personagem]').click();
  await p.locator('#form-personagem [data-beneficio-nivel="1"]').selectOption('mira');
  await p.getByLabel('Alternativa de expansão · nível 1',{exact:true}).selectOption('newt-bewitching-studies');
  assert.match(await p.locator('#form-personagem').innerText(),/sem ocupar a cota/);
  await p.setViewportSize({width:390,height:844});await p.getByLabel('Alternativa de expansão · nível 1',{exact:true}).scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'alternativa-mobile.png')});
  await p.locator('[data-tab=magias]').click();assert.equal(await p.locator('.spell-entry[data-feitico=accio] input').isChecked(),true);assert.equal(await p.locator('.spell-entry[data-feitico=accio] input').isDisabled(),true);
  await p.locator('.spell-entry[data-feitico=newt-inevitam] input').check();await salvar(p);
  assert.deepEqual(a.salvo().extensoesWW.magias,['newt-inevitam']);assert.equal(a.salvo().magias.includes('accio'),false);assert.equal(a.salvo().magias.some(id=>id.startsWith('newt-')),false);
  await a.abrir();await p.locator('[data-tab=magias]').click();assert.equal(await p.locator('.spell-entry[data-feitico=newt-inevitam] input').isChecked(),true);
  await p.getByRole('button',{name:/Minhas Magias/}).click();assert.equal(await p.locator('.spell-entry').count(),2,'Accio concedido e Inevitam aprendido');
  await p.getByRole('button',{name:'Índice Completo',exact:true}).click();await p.locator('.spell-entry[data-feitico=newt-inevitam] input').uncheck();await p.locator('#descartar').click();assert.equal(await p.locator('.spell-entry[data-feitico=newt-inevitam] input').isChecked(),true);
  await p.setViewportSize({width:1280,height:900});await p.locator('.spell-entry[data-feitico=newt-inevitam] button').first().click();assert.match(await p.locator('.pagina-descricao').first().innerText(),/está vivo/);assert.match(await p.locator('.pagina-fonte').first().innerText(),/Newt/);await p.screenshot({path:path.join(out,'magia-desktop.png')});
  for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'grimório sem transbordamento '+width);}
  const dadosAntes=a.salvo();a.ativar(false);await a.abrir();assert.equal(await p.locator('.spell-entry').count(),144);await p.locator('[data-tab=personagem]').click();assert.equal(await p.getByLabel('Alternativa de expansão · nível 1',{exact:true}).count(),0);assert.match(await p.locator('#form-personagem').innerText(),/objeto ou parte do corpo/);await p.locator('[data-campo=nome]').fill('Nome com expansão suspensa');await p.locator('[data-campo=nome]').dispatchEvent('change');await salvar(p);assert.deepEqual(a.salvo().extensoesWW,dadosAntes.extensoesWW);
  a.ativar(true);await a.abrir();await p.locator('[data-tab=magias]').click();assert.equal(await p.locator('.spell-entry[data-feitico=newt-inevitam] input').isChecked(),true);assert.deepEqual(a.erros,[]);await a.ctx.close();
  const leitura=await ambiente({editar:false,seed:dadosAntes});await leitura.page.locator('[data-tab=personagem]').click();assert.equal(await leitura.page.getByLabel('Alternativa de expansão · nível 1',{exact:true}).isDisabled(),true);await leitura.page.locator('[data-tab=magias]').click();assert.equal(await leitura.page.locator('.spell-entry[data-feitico=newt-inevitam] input').isDisabled(),true);assert.equal(leitura.escritas(),0);assert.deepEqual(leitura.erros,[]);await leitura.ctx.close();
  const formacao=await ambiente({mestre:true,seed:{nivel:6,escola:'magizoologia',extensoesWW:{formacoes:[{id:'newt-wandmakers-gift'},{id:'newt-quadribol',posicao:'goleiro'}]}}});await formacao.page.locator('[data-tab=personagem]').click();await formacao.page.getByLabel('Alternativa de expansão · nível 6',{exact:true}).selectOption('newt-way-of-the-wild');await salvar(formacao.page);assert.equal(formacao.salvo().extensoesWW.beneficiosEscola[6],'newt-way-of-the-wild');assert.deepEqual(formacao.salvo().inventario,[]);await formacao.abrir();assert.match(await formacao.page.locator('#recursos-magicos').innerText(),/Varinhalogia/);assert.match(await formacao.page.locator('#recursos-magicos').innerText(),/Clube de Quadribol/);assert.deepEqual(formacao.erros,[]);await formacao.ctx.close();
  console.log('PASS expansão no navegador: cinco magias opcionais, alternativa substitutiva, Accio concedido sem cota, salvar/reabrir, Minhas Magias, descarte, desligar/reativar preservando escolhas, leitor, formação do Mestre, nível 6 e 320–1280px.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
