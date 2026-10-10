/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require('/opt/codex/runtimes/cua/lib/node_modules/playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {execFileSync}=require('node:child_process');
(async()=>{
  const {novaFicha,prepararFichaWandsWizards}=await import('../public/wands-wizards/ficha-regras.mjs');
  const root=path.resolve(__dirname,'../public'),out=path.resolve(__dirname,'../artifacts/wands-wizards/grimorio');
  const cat=JSON.parse(await fs.readFile(root+'/wands-wizards/catalogo-origem.json'));
  const translations=JSON.parse(await fs.readFile(root+'/wands-wizards/magias-pt-br.json'));
  let saved={...novaFicha(),nome:'Aurora Vale',magias:['accio','capto','protego']},version='2026-10-09T11:00:00Z',saves=0,readonly=false;
  const publico=process.env.WW_PUBLIC==='1',origin=publico?'https://hub-rpg-eight.vercel.app':'https://ww.local';
  await fs.mkdir(out,{recursive:true});
  const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try{
    const ctx=await b.newContext({viewport:{width:1280,height:900}}),p=await ctx.newPage(),errors=[];
    p.on('pageerror',e=>errors.push(e.message));
    await ctx.route(origin+'/**',async r=>{
      const req=r.request(),u=new URL(req.url());
      if(u.pathname==='/api/personagens/grimorio'){
        if(req.method()==='PATCH'){
          assert.equal(req.postDataJSON().atualizadoEmBase,version);
          const ready=prepararFichaWandsWizards(saved,req.postDataJSON().dados);assert.equal(ready.erro,undefined);
          saved=ready.dados;version=new Date(Date.parse(version)+1).toISOString();saves++;
          return r.fulfill({json:{personagem:{atualizadoEm:version}}});
        }
        return r.fulfill({json:{personagem:{dados:saved,atualizadoEm:version,sistema:{chave:'wands-wizards'},podeEditar:!readonly,ehDono:!readonly}}});
      }
      if(publico){
        const raw=execFileSync('python',['-c','import urllib.request,urllib.error,sys,json,base64\ntry: r=urllib.request.urlopen(sys.argv[1])\nexcept urllib.error.HTTPError as e: r=e\nprint(json.dumps({"status":r.status,"contentType":r.headers.get("Content-Type","application/octet-stream"),"body":base64.b64encode(r.read()).decode()}))',req.url()],{maxBuffer:8*1024*1024});
        const response=JSON.parse(raw);return r.fulfill({status:response.status,contentType:response.contentType,body:Buffer.from(response.body,'base64')});
      }
      try{await r.fulfill({body:await fs.readFile(path.join(root,u.pathname)),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'})[path.extname(u.pathname)]||'application/octet-stream'});}catch{await r.fulfill({status:404});}
    });
    await p.goto(origin+'/wands-wizards.html?id=grimorio');
    await p.waitForFunction(()=>document.querySelectorAll('.spell-entry').length===144);
    await p.locator('[data-tab=magias]').click();
    assert.equal(await p.locator('#lista-magias :is(details,.pagina-descricao)').count(),0);
    const rows=()=>p.locator('.spell-entry').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));
    const initial=await rows();
    for(const id of ['accio','alohomora','capto']){
      await p.locator('#lista-magias button[data-magia='+id+']').click();
      assert.ok((await rows()).every((height,i)=>Math.abs(height-initial[i])<1),'consultar não expande o índice (tolerância subpixel)');
      assert.deepEqual(await p.locator('.grimorio-detalhes .pagina-descricao p').allTextContents(),translations[id].split('\n'));
    }
    const pageBefore=await p.locator('.grimorio-detalhes .grimorio-pagina').innerHTML();
    await p.locator('#grimorio-minhas').click();assert.equal(await p.locator('#grimorio-conhecidas').inputValue(),'conhecidas');assert.equal(await p.locator('#grimorio-minhas').textContent(),'Minhas Magias (3)');assert.deepEqual(await p.locator('.grimorio-grupo').allTextContents(),['Truques','Magias Regulares']);assert.equal(await p.locator('.spell-entry').count(),3);assert.equal(await p.locator('.grimorio-detalhes .grimorio-pagina').innerHTML(),pageBefore);
    await p.locator('[data-feitico=capto] input').click();assert.equal(await p.locator('.spell-entry').count(),2);assert.equal(await p.locator('#grimorio-minhas').textContent(),'Minhas Magias (2)');
    await p.locator('#grimorio-completo').click();await p.locator('[data-feitico=capto] input').check();assert.equal(await p.locator('#grimorio-minhas').textContent(),'Minhas Magias (3)');
    await p.locator('#busca-magia').fill('Protego');await p.locator('#grimorio-minhas').click();assert.equal(await p.locator('.spell-entry').count(),1);await p.locator('#grimorio-completo').click();assert.equal(await p.locator('#busca-magia').inputValue(),'Protego');await p.locator('#busca-magia').fill('');
    await p.locator('#grimorio-conhecidas').selectOption('conhecidas');assert.equal(await p.locator('#grimorio-minhas').getAttribute('aria-pressed'),'true');await p.locator('#grimorio-conhecidas').selectOption('disponiveis');assert.equal(await p.locator('#grimorio-minhas').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('#grimorio-completo').getAttribute('aria-pressed'),'false');await p.locator('#grimorio-completo').click();
    assert.equal(saves,0,'consultar não salva ou aprende');
    assert.deepEqual(saved.magias,['accio','capto','protego']);
    // Check all source paragraphs and original text through the actual page renderer.
    const integrity=await p.evaluate(async({catalogo,traducoes})=>{
      const {detalhesMagia}=await import('/wands-wizards/experiencias/grimorio.js');
      return catalogo.every(s=>{const page=detalhesMagia(s);return JSON.stringify([...page.querySelectorAll('.pagina-descricao p')].map(p=>p.textContent))===JSON.stringify(traducoes[s.id].split('\n'))&&page.querySelector('.fonte-original p').textContent===s.original;});
    },{catalogo:cat.magias,traducoes:translations});assert.ok(integrity,'144 traduções e fontes completas preservadas');
    await p.locator('#busca-magia').fill('zzz-inexistente');assert.equal(await p.locator('.spell-entry').count(),0);
    assert.equal(await p.locator('.grimorio-detalhes .pagina-feitico').getAttribute('data-magia'),'capto');
    assert.equal(await p.locator('.grimorio-fora-filtro').isVisible(),true);
    await p.getByRole('button',{name:'Mostrar no índice'}).click();assert.equal(await p.locator('.spell-entry').count(),144);
    for(const [selector,value,predicate] of [
      ['#grimorio-nivel','2',s=>s.nivel===2],['#grimorio-escola','cura',s=>s.escola==='cura'],
      ['#grimorio-categoria','restritas',s=>s.restrita],['#grimorio-categoria','rituais',s=>/\(ritual\)/i.test(s.original)]
    ]){await p.locator(selector).selectOption(value);assert.equal(await p.locator('.spell-entry').count(),cat.magias.filter(predicate).length);await p.locator(selector).selectOption('');}
    await p.locator('#grimorio-conhecidas').selectOption('conhecidas');assert.equal(await p.locator('.spell-entry').count(),3);await p.locator('#grimorio-conhecidas').selectOption('');
    const future=cat.magias.find(s=>s.nivel===9);assert.equal(await p.locator('[data-feitico='+future.id+'] input').isDisabled(),true);
    await p.locator('[data-feitico='+future.id+'] button').click();assert.equal(await p.locator('.grimorio-detalhes .pagina-feitico').getAttribute('data-magia'),future.id);
    await p.locator('#lista-magias button[data-magia=alohomora]').click();
    await p.waitForFunction(()=>!document.querySelector('.grimorio-detalhes .grimorio-pagina').getAnimations({subtree:true}).some(a=>a.playState==='running'));await p.locator('#grimorio').screenshot({path:out+'/desktop.png'});
    await p.locator('[data-feitico=alohomora] input').check();await p.locator('#grimorio-conhecidas').selectOption('disponiveis');const available=await p.locator('.spell-entry').count();assert.ok(available>0);await p.locator('#salvar').click();
    await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('salvo na sua conta'));
    assert.equal(saves,1);assert.ok(saved.magias.includes('alohomora'));assert.equal(await p.locator('#grimorio-minhas').textContent(),'Minhas Magias (4)');assert.equal(await p.locator('.spell-entry').count(),available,'filtro de disponibilidade restaurado depois de salvar');
    await p.reload();await p.waitForFunction(()=>document.querySelectorAll('.spell-entry').length===144);await p.locator('[data-tab=magias]').click();
    assert.ok(await p.locator('[data-feitico=alohomora] input').isChecked());
    await p.locator('[data-feitico=alohomora] input').uncheck();await p.locator('#descartar').click();assert.ok(await p.locator('[data-feitico=alohomora] input').isChecked());
    await p.locator('[data-feitico=alohomora] input').uncheck();await p.reload();await p.waitForFunction(()=>document.querySelectorAll('.spell-entry').length===144);await p.locator('#retomar').click();await p.locator('[data-tab=magias]').click();assert.equal(await p.locator('[data-feitico=alohomora] input').isChecked(),false);await p.locator('#descartar').click();assert.ok(await p.locator('[data-feitico=alohomora] input').isChecked());
    for(const width of [320,390,600,768,860,861,1280]){
      await p.setViewportSize({width,height:900});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'sem overflow em '+width);
      if(width<=860){
        await p.locator('#busca-magia').fill('');assert.equal(await p.locator('#busca-magia').inputValue(),'');
        await p.locator('#grimorio-minhas').click();assert.equal(await p.locator('.spell-entry').count(),4);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        if(width===390)await p.locator('.grimorio-indice').screenshot({path:out+'/indice-celular.png'});await p.locator('#grimorio-completo').click();
        await p.locator('#busca-magia').fill('');
        const target=p.locator('#lista-magias button[data-magia=expecto-patronum]');await target.scrollIntoViewIfNeeded();
        const before=await p.locator('#lista-magias').evaluate(e=>e.scrollTop);
        await target.click();await p.waitForFunction(()=>document.querySelector('#grimorio-modal').open);
        assert.ok(await p.locator('#grimorio-modal .grimorio-pagina').evaluate(e=>e.scrollHeight>e.clientHeight));
        await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>document.querySelector('#grimorio-modal').contains(document.activeElement)));
        await p.keyboard.press('Escape');assert.equal(await p.locator('#grimorio-modal').evaluate(e=>e.open),false);
        assert.equal(await target.evaluate(e=>e===document.activeElement),true);
        assert.equal(await p.locator('#lista-magias').evaluate(e=>e.scrollTop),before);
        await p.locator('#busca-magia').fill('Alohomora');await p.locator('#lista-magias button[data-magia=alohomora]').click();
        assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        if(width===390){await p.waitForFunction(()=>!document.querySelector('#grimorio-modal').getAnimations({subtree:true}).some(a=>a.playState==='running'));await p.locator('#grimorio-modal').screenshot({path:out+'/celular.png'});}
        await p.getByRole('button',{name:'← Voltar ao índice'}).click();await p.waitForFunction(()=>document.activeElement===document.querySelector('#lista-magias button[data-magia=alohomora]'));await p.locator('#busca-magia').fill('');assert.equal(await p.locator('#busca-magia').inputValue(),'');
      }
    }
    await p.emulateMedia({reducedMotion:'reduce'});await p.locator('#lista-magias button[data-magia=accio]').click();
    assert.equal(await p.locator('.grimorio-detalhes .grimorio-pagina').evaluate(e=>e.getAnimations({subtree:true}).length),0);
    readonly=true;await p.reload();await p.waitForFunction(()=>document.querySelectorAll('.spell-entry').length===144);await p.locator('[data-tab=magias]').click();assert.equal(await p.locator('.spell-entry input:not(:disabled)').count(),0);await p.locator('#lista-magias button[data-magia=alohomora]').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.grimorio-detalhes .pagina-feitico').getAttribute('data-magia'),'alohomora');assert.equal(saves,1);assert.deepEqual(errors,[]);await ctx.close();
    console.log('PASS grimório: 144 textos/fontes, índice estável, filtros, futuro consultável, consultar sem aprender, salvar/reabrir/descarte, 320–1280px, dialog/Escape/foco/rolagem e movimento reduzido'+(publico?' — assets publicados.':'.'));
  }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
