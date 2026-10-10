/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium}=require('/opt/codex/runtimes/cua/lib/node_modules/playwright-core');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),out=path.resolve(__dirname,'../artifacts/wands-wizards/paletas');
const paletas={
 neutra:{bg:'#0A1523',surface:'#14263A',panel:'#1B3046',card:'#15293E',input:'#091522',text:'#F5EAD7',accent:'#D9BB7A'},
 grifinoria:{bg:'#180F15',surface:'#301820',panel:'#44212A',card:'#351B23',input:'#231218',text:'#F5E9DA',accent:'#D9A657'},
 sonserina:{bg:'#091714',surface:'#112820',panel:'#1B392E',card:'#142C25',input:'#0C1E1A',text:'#E6EFEA',accent:'#BED2C9'},
 corvinal:{bg:'#0A1425',surface:'#142B49',panel:'#1D3A5B',card:'#152D4B',input:'#0B1C32',text:'#EAF0F6',accent:'#D1AB75'},
 lufalufa:{bg:'#191710',surface:'#29251B',panel:'#393224',card:'#302A1D',input:'#211E17',text:'#F4EBD8',accent:'#F0CB75'}
};
const rgb=hex=>'rgb('+hex.match(/[0-9a-f]{2}/ig).map(v=>parseInt(v,16)).join(', ')+')';
const lum=color=>{const v=color.match(/\d+(?:\.\d+)?/g).slice(0,3).map(n=>Number(n)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
(async()=>{
 const {novaFicha,prepararFichaWandsWizards,calcularFicha}=await import('../public/wands-wizards/ficha-regras.mjs');
 await fs.mkdir(out,{recursive:true});
 const original={...novaFicha(),nome:'Aurora Vale',magias:['accio','capto','protego'],varinhaRevelada:true,varinha:{madeira:'Pau-brasil',nucleo:'Pena de fênix',comprimento:'12½ polegadas',flexibilidade:'Flexível'},varinhaVisual:{cabo:'ornamental',acabamento:'natural'},inventario:[{id:'cura',nome:'Poção de cura',categoria:'Poções',quantidade:3,descricao:'Receita aprovada na mesa.'},{id:'livro',nome:'Livro de Herbologia',categoria:'Livros',quantidade:1}]};
 delete original.casa; // Existing neutral presentation before the first confirmed House.
 let saved=structuredClone(original),version='2026-10-09T20:00:00.000Z',patches=0;
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const rows=[];
 try{
  for(const width of [1280,390]){
   saved=structuredClone(original);
   const ctx=await browser.newContext({viewport:{width,height:1000}}),p=await ctx.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await ctx.route('https://ww.local/**',async route=>{
    const req=route.request(),u=new URL(req.url());
    if(u.pathname==='/api/personagens/paletas'){
     if(req.method()==='PATCH'){
      const payload=req.postDataJSON();assert.equal(payload.atualizadoEmBase,version);
      const result=prepararFichaWandsWizards(saved,payload.dados);assert.equal(result.erro,undefined);
      saved=result.dados;patches++;version=new Date(Date.parse(version)+1).toISOString();
      return route.fulfill({json:{personagem:{atualizadoEm:version}}});
     }
     return route.fulfill({json:{personagem:{dados:saved,atualizadoEm:version,sistema:{chave:'wands-wizards'},podeEditar:true,ehDono:true}}});
    }
    try{await route.fulfill({body:await fs.readFile(path.join(root,u.pathname)),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(u.pathname)]||'application/octet-stream'});}catch{await route.fulfill({status:404});}
   });
   await p.goto('https://ww.local/wands-wizards.html?id=paletas');
   await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('carregada'));
   await p.waitForLoadState('networkidle');
   const settle=async()=>{await p.waitForFunction(()=>!document.getAnimations().some(a=>a.playState==='running'||a.playState==='pending'),{},{timeout:8000});};
   const shot=async(name,locator)=>{await settle();await locator.screenshot({path:path.join(out,`${name}-${width}.png`)});};
   const wood=()=>p.locator('#form-personagem [data-varinha-preview] .wand-art svg:not(.wand-previous)').evaluate(e=>({shaft:e.querySelector('.wand-shaft').getAttribute('d'),grip:e.querySelector('.wand-grip').getAttribute('d'),stops:[...e.querySelectorAll('[id$="-wood"] stop')].map(s=>s.getAttribute('stop-color'))}));
   await p.locator('[data-tab=personagem]').click();const modelo=await wood();
   for(const[casa,expected]of Object.entries(paletas)){console.log('Verificando',casa,width);
    await p.locator('[data-tab=personagem]').click();
    if(casa!=='neutra')await p.locator('#form-personagem [data-campo=casa]').selectOption(casa);
    await settle();assert.equal(await p.locator('html').getAttribute('data-casa'),casa);
    const colors=await p.evaluate(()=>{const s=getComputedStyle(document.documentElement),tokens={};for(const k of ['bg','surface','panel','card','input','text','muted','accent'])tokens[k]=s.getPropertyValue('--'+k).trim();return tokens;});
    for(const key of ['bg','surface','panel','card','input','text','accent'])assert.equal(colors[key],rgb(expected[key]),casa+' '+key);
    assert.equal(await p.locator('#form-personagem [data-campo=nome]').evaluate(e=>getComputedStyle(e).backgroundColor),rgb(expected.input));
    assert.ok((await p.locator('.stat').first().evaluate(e=>getComputedStyle(e).backgroundImage)).includes(rgb(expected.panel)));
    assert.deepEqual(await wood(),modelo,'a Casa não pode recolorir nem deformar a madeira');
    for(const key of ['bg','surface','panel','card','input']){
     for(const tinta of ['text','muted','accent'])assert.ok(contrast(colors[tinta],colors[key])>=4.5,`${casa} ${tinta}/${key}: ${contrast(colors[tinta],colors[key])}`);
    }
    await p.locator('#form-personagem [data-campo=nome]').focus();
    assert.equal(await p.locator('#form-personagem [data-campo=nome]').evaluate(e=>getComputedStyle(e).outlineColor),rgb(expected.accent));
    await shot(casa+'-identidade',p.locator('[data-secao=Casa]'));
    await shot(casa+'-varinha',p.locator('[data-varinha-preview]'));
    await p.locator('[data-tab=sessao]').click();await p.evaluate(()=>scrollTo(0,0));
    await shot(casa+'-sessao',p);
    await p.screenshot({path:path.join(out,`${casa}-sem-brasao-${width}.png`),style:'#brasao,#casa-identidade,.magic-sparks{visibility:hidden!important}'});
    await p.locator('[data-tab=magias]').click();
    await shot(casa+'-grimorio-indice',p.locator('#grimorio'));
    await p.locator('#lista-magias button[data-magia=accio]').click();
    await shot(casa+'-grimorio-aberto',width===390?p.locator('#grimorio-modal'):p.locator('#grimorio'));
    const papel=width===390?p.locator('#grimorio-modal .grimorio-pagina'):p.locator('.grimorio-detalhes .grimorio-pagina');
    assert.ok((await papel.innerText()).includes('mão invisível'));
    assert.equal(await papel.locator('.pagina-descricao p').first().evaluate(e=>getComputedStyle(e).color),'rgb(48, 39, 30)');
    if(width===390)await p.keyboard.press('Escape');
    await p.locator('[data-tab=inventario]').click();
    const trunk=p.locator('#malao .objeto-tampa:not([aria-hidden])');
    if(await trunk.getAttribute('aria-expanded')==='true')await p.locator('#malao .objeto-fechar').click();
    await shot(casa+'-malao-capa',p.locator('#malao'));
    await trunk.click();await shot(casa+'-malao-aberto',p.locator('#malao'));
    assert.equal(await p.locator('[aria-label="Quantidade de Poção de cura"]').inputValue(),'3');
    assert.equal(await p.locator('[aria-label="Quantidade de Livro de Herbologia"]').inputValue(),'1');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.equal(patches,width===1280?0:1,'nenhum tema deve salvar automaticamente');
    rows.push({casa,width,colors});
   }
   // Reduced motion is automatic unless a player explicitly opts into the line.
   await p.locator('[data-tab=estilo]').click();await p.locator('#efeito-casa').selectOption('dispositivo');await p.emulateMedia({reducedMotion:'reduce'});await p.locator('[data-tab=personagem]').click();
   await p.locator('#form-personagem [data-campo=casa]').selectOption('sonserina');
   assert.equal(await p.locator('body').evaluate(e=>e.classList.contains('house-enchant')),false);
   await settle();
   // Saving preserves the appearance and all non-House data; reload never replays.
   await p.locator('#salvar').click();await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('salvo'));
   assert.deepEqual(saved.varinha,original.varinha);assert.deepEqual(saved.inventario,original.inventario);assert.deepEqual(saved.magias,original.magias);
   const calculo=calcularFicha(saved);await p.reload();await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('carregada'));
   assert.equal(await p.locator('html').getAttribute('data-casa'),'sonserina');
   assert.equal(await p.locator('body').evaluate(e=>e.classList.contains('house-enchant')),false);
   await p.locator('[data-tab=estilo]').click();
   await p.locator('#cor-fundo').evaluate(e=>{e.value='#201823';e.dispatchEvent(new Event('input'));});
   assert.equal(await p.locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--bg').trim()),'rgb(32, 24, 35)');
   await p.locator('#descartar').click();assert.equal(await p.locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--bg').trim()),rgb(paletas.sonserina.bg));
   for(const tema of ['floresta','azul','pergaminho']){
    await p.locator('#tema').selectOption(tema);
    assert.equal(await p.locator('html').evaluate(e=>e.style.colorScheme),tema==='pergaminho'?'light':'dark');
   }
   assert.deepEqual(calcularFicha(saved),calculo,'temas visuais não modificam cálculos');
   assert.deepEqual(errors,[]);await ctx.close();
  }
  await fs.writeFile(path.join(out,'contraste-e-paletas.json'),JSON.stringify(rows,null,2));
  console.log('PASS paletas: cinco fundos/superfícies/campos distintos, contraste mínimo 4.5, foco temático, madeira idêntica, grimório legível, quantidades e magias preservadas, tema persistente, personalização e descarte, movimento reduzido, sem overflow em 390/1280; capturas comparativas de todas as seções.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
