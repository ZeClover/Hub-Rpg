/* eslint-disable @typescript-eslint/no-require-imports -- Interface real com rede isolada. */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'/opt/codex/runtimes/cua/lib/node_modules/playwright-core');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),out=path.resolve(__dirname,'../artifacts/iniciativa');
(async()=>{
 await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const nome of ['dnd-5e','sao','fabula-ultima','kaizoku-no-sho','sistema-do-savio','thryliki-chelona','hogwarts-rpg']){
  let dono=true,campanha='c',npc=false,negado=false,erroEnvio=false,posts=[];
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.origin!=='https://initiative.local')return route.fulfill({status:204});
   if(u.pathname.startsWith('/api/')){
    if(negado)return route.fulfill({status:404,json:{erro:'não encontrado'}});
    if(u.pathname.endsWith('/iniciativa')){posts.push(route.request().postDataJSON());await new Promise(r=>setTimeout(r,120));return route.fulfill({status:erroEnvio?409:200,json:erroEnvio?{erro:'Tente novamente.'}:{declaracao:{nome:'Nome salvo',resultado:posts.at(-1).resultado}}});}
    return route.fulfill({json:{personagem:{id:'p',nome:'Teste',dados:{},ehDono:dono,podeEditar:true,campanhaId:campanha,ehMonstro:npc,sistema:{chave:nome}}}});
   }
   const type={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'}[path.extname(u.pathname)];
   try{return route.fulfill({body:await fs.readFile(path.join(root,u.pathname)),contentType:type||'application/octet-stream'});}catch{return route.fulfill({status:404});}
  });
  const open=async()=>{await page.goto('https://initiative.local/'+nome+'.html?id=p');await page.waitForFunction(()=>!!window.hubIniciativaContexto);};
  await open();const panel=page.locator('#hub-iniciativa');await panel.locator('summary').click();
  const input=panel.locator('input'),button=panel.locator('button');
  await input.fill('17');await button.click();await panel.getByText('Iniciativa enviada: Nome salvo — 17',{exact:true}).waitFor();assert.deepEqual(posts,[{resultado:17}]);
  await input.fill('-2');erroEnvio=true;await button.click();await panel.getByText('Tente novamente.',{exact:true}).waitFor();assert.equal(await input.inputValue(),'-2');assert.equal(await button.isDisabled(),false);
  erroEnvio=false;await button.click();await panel.getByText('Iniciativa enviada: Nome salvo — -2',{exact:true}).waitFor();
  const before=posts.length;await input.fill('1001');await button.click();assert.equal(posts.length,before);
  await input.fill('0');await page.evaluate(()=>{window.hubIniciativaSalvamentoPendente=()=>true;});await button.click();await panel.getByText('Aguarde a ficha ser salva antes de enviar a iniciativa.',{exact:true}).waitFor();assert.equal(posts.length,before);
  await page.evaluate(()=>{window.hubIniciativaSalvamentoPendente=()=>false;const form=document.querySelector('#hub-iniciativa form');form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});await panel.getByText('Iniciativa enviada: Nome salvo — 0',{exact:true}).waitFor();assert.equal(posts.length,before+1,'envio duplo não duplica declaração');
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,nome+' '+width);await panel.screenshot({path:path.join(out,nome+'-'+width+'.png')});}
  dono=false;await open();await panel.locator('summary').click();assert.equal(await panel.locator('button').isDisabled(),true);
  dono=true;campanha=null;await open();await panel.locator('summary').click();assert.equal(await panel.locator('button').isDisabled(),true);
  campanha='c';npc=true;await open();assert.equal(await panel.count(),0);
  npc=false;negado=true;await page.goto('https://initiative.local/'+nome+'.html?id=p');assert.equal(await panel.count(),0);
  assert.deepEqual(errors,[],nome);console.log('PASS',nome,'envio/reenvio, negativo/zero, limites, salvamento, leitor/avulso/NPC, mobile');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
