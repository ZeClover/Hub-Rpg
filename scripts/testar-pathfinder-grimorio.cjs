/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS com APIs simuladas para regressão de leitura e preservação. */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'playwright-core');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const catalogo=JSON.parse(fs.readFileSync('public/pathfinder/monster-core.json','utf8'));
 const revisados=catalogo.criaturas.filter(m=>m.estadoTraducao==='revisado');
 const total=catalogo.criaturas.length;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const errors=[];const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8123/pathfinder-grimorio.html?fonte=monster-core');
 await page.waitForFunction(n=>document.querySelector('#referencia').options.length===n+1,total);
 for(const m of revisados){
  await page.selectOption('#referencia',m.id);const text=await page.locator('#conteudo').innerText();
  assert(text.includes('CA '+m.ca)&&text.includes('PV '+m.pv),m.nome+' defesas');
  assert(text.includes('Perícias:')&&text.includes('Tamanho: '+m.tamanho),m.nome+' perícias/tamanho');
  for(const a of m.ataques){if(a.dano!==undefined)assert(text.includes(a.dano+' '+a.tipoDano),m.nome+' dano');if(a.efeito)assert(text.includes(a.efeito),m.nome+' efeito');if(a.alcancePes)assert(text.includes('Alcance: '+a.alcancePes+' pés'),m.nome+' alcance');if(a.incrementoDistanciaPes)assert(text.includes('Incremento de distância: '+a.incrementoDistanciaPes+' pés'),m.nome+' distância');}
  for(const a of m.acoes){assert(text.includes(a.descricao),m.nome+' ação inteira');if(a.acoes===0)assert(text.includes('Passiva'));if(a.acoes==='reacao')assert(text.includes('Reação'));}
  for(const k of ['sentidos','idiomas','imunidades','equipamentos','excecoesDefesas','excecoesPericias'])for(const s of m[k]||[])assert(text.includes(s),m.nome+' '+k);
  for(const k of ['resistencias','fraquezas'])for(const s of m[k]||[])assert(text.includes(s.tipo+': '+s.valor),m.nome+' '+k);
  for(const v of m.variantes||[])assert(typeof v==='string'?text.includes(v):text.includes(v.nome)&&text.includes(v.descricao),m.nome+' variante');
  if(m.cura)assert(text.includes(m.cura),m.nome+' cura');assert(!text.includes('[object Object]'));
 }
 const m0=revisados[0];await page.selectOption('#referencia',m0.id);assert(await page.locator('#conteudo a').count()===1);
 const xss=structuredClone(catalogo);const unsafe=xss.criaturas.find(x=>x.id==='aon-monstro-3241');unsafe.nome='<img src=x onerror="window.__xss=1">';unsafe.resumo='Resumo integral em uma string.';unsafe.ataques[0].efeito='<img src=x onerror="window.__xss=2">';unsafe.url='javascript:window.__xss=3';
 await page.route('**/pathfinder/monster-core.json',r=>r.fulfill({json:xss}));await page.reload();await page.waitForFunction(n=>document.querySelector('#referencia').options.length===n+1,total);await page.selectOption('#referencia',unsafe.id);
 assert(await page.locator('#conteudo img').count()===0);assert(await page.locator('#conteudo a').count()===0);assert(!(await page.evaluate(()=>window.__xss)));assert((await page.locator('#conteudo').innerText()).includes('Resumo integral em uma string.'));
 const np=await browser.newPage();np.on('pageerror',e=>errors.push(e.message));np.on('dialog',d=>d.accept());let saved=[];
 const fixture={nome:'NPC original',nivel:3,atributos:'anotação original',acoes:'regras originais',tracos:'traços originais',descricao:'notas originais',vida:{atual:9,maxima:11,temporaria:2,campoDesconhecido:'não apagar'},resumoVida:{extra:'conservar'},_aparencia:{cor:'#ff0000'},campoNovo:{subcampo:42}};
 await np.route('**/api/personagens/pf-audit',async route=>{if(route.request().method()==='PATCH'){const body=route.request().postDataJSON();saved.push(body);await route.fulfill({json:{personagem:{dados:body.dados,atualizadoEm:'2026-10-06T00:00:01Z'}}});}else await route.fulfill({json:{personagem:{ehMonstro:true,sistema:{chave:'pathfinder-2e-remaster'},podeEditar:true,dados:fixture,atualizadoEm:'2026-10-06T00:00:00Z'}}});});
 await np.goto('http://127.0.0.1:8123/pathfinder-bestiario.html?id=pf-audit');await np.waitForFunction(n=>document.querySelectorAll('#modelos button').length===n,total);
 for(const m of revisados){await np.getByRole('button',{name:m.nome+' · nível '+m.nivel,exact:true}).click();const t=await np.locator('#tracos').inputValue(),a=await np.locator('#acoes').inputValue(),attrs=await np.locator('#atributos').inputValue();assert(attrs.includes('Perícias:')&&attrs.includes('Deslocamento:'));for(const attack of m.ataques){if(attack.dano!==undefined)assert(a.includes(attack.dano+' '+attack.tipoDano));if(attack.efeito)assert(a.includes(attack.efeito));}for(const act of m.acoes)assert(a.includes(act.descricao));for(const k of ['resistencias','fraquezas'])for(const item of m[k]||[])assert(t.includes(item.tipo+': '+item.valor));for(const v of m.variantes||[])assert(t.includes(typeof v==='string'?v:v.descricao));if(m.cura)assert(t.includes(m.cura));assert(!t.includes('excecoesDefesas:'));}
 const executavel=revisados.find(m=>m.ataques.some(a=>typeof a.dano==='string'&&/^\d+d\d+(?:[+-]\d+)?$/.test(a.dano)));
 await np.getByRole('button',{name:executavel.nome+' · nível '+executavel.nivel,exact:true}).click();
 assert.deepEqual(await np.evaluate(()=>window.structuredClone?document.querySelector('#combate-criatura h2').textContent:null),'Combate · valores do modelo');
 await np.getByRole('button',{name:'Atacar · '+executavel.ataques[0].nome,exact:true}).click();assert((await np.locator('#resultado-combate-criatura').innerText()).includes('contra CA 15'));
 await np.getByRole('button',{name:'Salvar criatura',exact:true}).click();await np.waitForFunction(()=>document.querySelector('#estado').textContent==='Criatura salva.');assert(saved.length===1);assert(saved[0].dados.vida.campoDesconhecido==='não apagar');assert(saved[0].dados.campoNovo.subcampo===42);assert(saved[0].dados._aparencia.cor==='#ff0000');assert(saved[0].dados.resumoVida.extra==='conservar');assert(saved[0].atualizadoEmBase==='2026-10-06T00:00:00Z');
 const pending=catalogo.criaturas.find(m=>m.estadoTraducao==='referencia');const btn=np.getByRole('button',{name:pending.nome+' · nível '+pending.nivel+' · referência',exact:true});assert(await btn.isDisabled());const before=await np.locator('#nome').inputValue();await btn.evaluate(b=>b.onclick());assert((await np.locator('#nome').inputValue())===before);
 const ro=await browser.newPage();await ro.route('**/api/personagens/pf-readonly',route=>route.fulfill({json:{personagem:{ehMonstro:true,sistema:{chave:'pathfinder-2e-remaster'},podeEditar:false,dados:fixture,atualizadoEm:'2026-10-06T00:00:00Z'}}}));await ro.goto('http://127.0.0.1:8123/pathfinder-bestiario.html?id=pf-readonly');await ro.waitForFunction(n=>document.querySelectorAll('#modelos button').length===n,total);assert(await ro.locator('#nome').isDisabled());assert(await ro.getByRole('button',{name:m0.nome+' · nível '+m0.nivel,exact:true}).isDisabled());await ro.getByRole('button',{name:m0.nome+' · nível '+m0.nivel,exact:true}).evaluate(b=>b.onclick());assert((await ro.locator('#nome').inputValue())==='NPC original');
 assert.deepEqual(errors,[]);console.log(`PASS: ${revisados.length} blocos completos no grimório móvel e importação, ${catalogo.criaturas.length-revisados.length} referências bloqueadas, XSS, strings, conservação de campos desconhecidos/vida/aparência e somente leitura.`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
