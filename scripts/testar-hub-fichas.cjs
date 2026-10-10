/* eslint-disable @typescript-eslint/no-require-imports -- Teste Node em CommonJS, com dependências isoladas. */
/* Componentes reais das fichas; somente a rede de contas é isolada. */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'/opt/codex/runtimes/cua/lib/node_modules/playwright-core');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),out=path.resolve(__dirname,'../artifacts/hub-auditoria');
const nomes=['dnd-5e','sao','fabula-ultima','kaizoku-no-sho','sistema-do-savio','thryliki-chelona','fabula-ultima-inimigo','sao-inimigo','sistema-do-savio-inimigo','thryliki-chelona-inimigo'];
async function esperar(condicao){const fim=Date.now()+10000;while(!condicao()){assert.ok(Date.now()<fim,'a operação deve concluir');await new Promise(r=>setTimeout(r,25));}}
const tipos={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.mjs':'text/javascript','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const resultados=[];
 try{for(const nome of nomes){
  let salvo={},pedidos=[],dono=true,editar=true,negado=false,corrida=false,emCurso=0,maxConcorrencia=0,inicioCorrida,contadorCorrida=0;
  const ctx=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),p=await ctx.newPage(),erros=[];
  p.setDefaultTimeout(10000);p.on('dialog',d=>d.accept());p.on('pageerror',e=>erros.push(e.message));
  await ctx.route('**/*',async r=>{
   const u=new URL(r.request().url());if(u.origin!=='https://audit.local')return r.fulfill({status:204});
   if(u.pathname.startsWith('/api/')){
    if(negado)return r.fulfill({status:404,json:{erro:'não encontrado'}});
    if(r.request().method()==='PATCH'){
     assert.ok(editar,'leitor não pode gravar');const body=r.request().postDataJSON();pedidos.push(body);
     if(corrida){emCurso++;maxConcorrencia=Math.max(maxConcorrencia,emCurso);const n=++contadorCorrida;if(n===1)inicioCorrida();await new Promise(res=>setTimeout(res,n===1?1400:100));emCurso--;}
     if(body.dados)salvo=body.dados;
     return r.fulfill({json:{personagem:{atualizadoEm:new Date().toISOString()}}});
    }
    return r.fulfill({json:{personagem:{id:'auditoria',nome:'Auditoria',dados:salvo,ehDono:dono,podeEditar:editar,campanhaId:'campanha',sistema:{chave:nome}}}});
   }
   try{return r.fulfill({body:await fs.readFile(path.join(root,u.pathname)),contentType:tipos[path.extname(u.pathname)]||'application/octet-stream'});}catch{return r.fulfill({status:404});}
  });
  const pronto=()=>p.waitForFunction(()=>typeof atual==='function'?!!atual():typeof personagemAtual==='function'?!!personagemAtual():typeof estado!=='undefined'&&!!estado.inimigo);
  const abas=()=>p.locator(nome==='kaizoku-no-sho'?'#tabRow button[data-tab]':'button[data-aba]');
  async function perfil(){const id=['dnd-5e','sao','thryliki-chelona'].includes(nome)?'status':'perfil';const botao=p.locator('button[data-aba="'+id+'"],button[data-tab="'+id+'"]');if(await botao.count())await botao.first().click();}
  const campoNome=()=>p.locator(nome==='kaizoku-no-sho'?'#f_nome':'#c-nome');
  const nomeSalvo=()=>salvo.perfil?.nome||salvo.nome;
  await p.goto('https://audit.local/'+nome+'.html?id=auditoria',{waitUntil:'domcontentloaded'});await pronto();
  await perfil();await campoNome().fill('Personagem '+nome);await campoNome().blur();await esperar(()=>nomeSalvo()==='Personagem '+nome);
  await p.reload({waitUntil:'domcontentloaded'});await pronto();await perfil();assert.equal(await campoNome().inputValue(),'Personagem '+nome);
  assert.ok((await p.title()).includes('Personagem '+nome),'nome no título deve sobreviver à recarga');
  let aparencia=false;
  if(await p.locator('#btAparencia').count()){
   aparencia=true;await p.locator('#btAparencia').click();assert.equal(await p.locator('#painelAparencia').isVisible(),true);
   await p.locator('#pa-tema-cor').evaluate(e=>{e.value='#3987ba';e.dispatchEvent(new Event('change',{bubbles:true}));});await esperar(()=>salvo.temaCor==='#3987ba');
   const antes=pedidos.length;
   await p.locator('#pa-escala [data-escala="g"]').click();await p.locator('#pa-fonte-titulo [data-fonte-titulo="moderna"]').click();await p.locator('#pa-layout [data-layout="compacto"]').click();
   assert.equal(await p.evaluate(()=>localStorage.getItem('hub_escala_fonte')),'g');assert.equal(await p.evaluate(()=>localStorage.getItem('hub_fonte_titulo')),'moderna');
   assert.equal(pedidos.length,antes,'preferências do navegador não alteram regras da ficha');
   await p.reload({waitUntil:'domcontentloaded'});await pronto();await p.locator('#btAparencia').click();assert.equal(await p.locator('#pa-tema-cor').inputValue(),'#3987ba');
   assert.equal(await p.evaluate(()=>Number(getComputedStyle(document.body).zoom)),1.15);
   await p.locator('#pa-escala [data-escala="m"]').click();
   // Preferências incompletas, duplicadas e de formato antigo não podem apagar abas.
   await p.evaluate(()=>localStorage.setItem(CHAVE_ABAS,'null'));await p.reload({waitUntil:'domcontentloaded'});await pronto();assert.ok(await abas().count());
   const preferencias=await p.evaluate(()=>{const defs=typeof TABS!=='undefined'?TABS:ABAS;localStorage.setItem(CHAVE_ABAS,JSON.stringify([...defs.map(a=>({id:a.id,oculta:true})),null,{id:defs[0].id,oculta:false}]));return carregarPreferenciaAbas();});
   assert.equal(new Set(preferencias.map(a=>a.id)).size,preferencias.length);assert.ok(preferencias.some(a=>!a.oculta));
   await p.evaluate(()=>localStorage.removeItem(CHAVE_ABAS));await p.reload({waitUntil:'domcontentloaded'});await pronto();
  }
  const ids=await abas().evaluateAll(es=>es.map(e=>e.dataset.aba||e.dataset.tab));
  const recursos={
   'dnd-5e':['#c-dano-pv','#btAplicarDanoPv','3'],sao:['#c-dano-pv','#btAplicarDanoPv','3'],
   'fabula-ultima':['#c-dano-valor','#btAplicarDano','3'],'kaizoku-no-sho':['#r_vitDano','#r_btVitDano','3'],
   'sistema-do-savio':['#c-perda-pv','[data-recurso-perda="pv"]','3'],'sistema-do-savio-inimigo':['#c-perda-pv','[data-recurso-perda="pv"]','3'],
   'thryliki-chelona':['#c-vida-impacto','#btSofrerImpacto','1'],
   'fabula-ultima-inimigo':['#c-pvatual',null,'7'],'sao-inimigo':['#c-d-pv',null,'37'],'thryliki-chelona-inimigo':['#c-vida-atual',null,'7']
  }[nome];
  let abaRecurso='';for(const id of ids){await p.locator('button[data-aba="'+id+'"],button[data-tab="'+id+'"]').first().click();if(await p.locator(recursos[0]).isVisible()){abaRecurso=id;break;}}
  assert.ok(await p.locator(recursos[0]).isVisible(),nome+' controle de recurso disponível');
  const antesRecurso=structuredClone(salvo);await p.locator(recursos[0]).fill(recursos[2]);await p.locator(recursos[0]).blur();if(recursos[1])await p.locator(recursos[1]).click();
  await esperar(()=>JSON.stringify(salvo)!==JSON.stringify(antesRecurso));await p.reload({waitUntil:'domcontentloaded'});await pronto();if(abaRecurso)await p.locator('button[data-aba="'+abaRecurso+'"],button[data-tab="'+abaRecurso+'"]').first().click();
  if(recursos[1])assert.ok(salvo.resumoVida.atual<antesRecurso.resumoVida.atual,nome+' dano descontado e preservado');else assert.equal(await p.locator(recursos[0]).inputValue(),recursos[2],nome+' recurso manual persiste');
  for(const width of [1280,390,320]){
   await p.setViewportSize({width,height:900});
   for(const id of ids){const button=p.locator('button[data-aba="'+id+'"],button[data-tab="'+id+'"]');await button.first().click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,nome+' / '+id+' / '+width+' não deve transbordar');}
   await perfil();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,nome+'-'+width+'.png')});
  }
  const guiado=p.locator('#btModoGuiado,#btnModoGuiado');let guia=false;
  if(await guiado.count()){
   await guiado.click();guia=true;const proximo=p.locator('#btGuiadoProximo,#btnGuiadoProximo');assert.equal(await proximo.isVisible(),true,nome+' abre o guia');await proximo.click();assert.equal(await p.locator('#btGuiadoAnterior,#btnGuiadoAnterior').isVisible(),true,nome+' avança o guia');await p.locator('#btGuiadoAnterior,#btnGuiadoAnterior').click();await guiado.click();await perfil();assert.ok(await campoNome().isVisible());
  }
  // Uma gravação lenta não pode permitir a escrita antiga após a nova.
  const primeiro=new Promise(r=>inicioCorrida=r);corrida=true;
  async function gravarNome(valor){await p.evaluate(valor=>{const f=typeof atual==='function'?atual():typeof personagemAtual==='function'?personagemAtual():estado.inimigo;if(f.perfil)f.perfil.nome=valor;else f.nome=valor;salvarNoHub();},valor);}
  await gravarNome('Edição antiga');await primeiro;await gravarNome('Edição mais recente');await esperar(()=>nomeSalvo()==='Edição mais recente'&&emCurso===0);assert.equal(maxConcorrencia,1);corrida=false;
  await p.reload({waitUntil:'domcontentloaded'});await pronto();await perfil();assert.equal(await campoNome().inputValue(),'Edição mais recente');
  let evolucao=false;
  if(['sao','fabula-ultima','kaizoku-no-sho','sistema-do-savio','thryliki-chelona'].includes(nome)){
   const seletor=['sao','fabula-ultima'].includes(nome)?'select[data-classe]':nome==='thryliki-chelona'?'[data-progresso-nivel="2"]':'#btnLevelUp';
   for(const id of ids){await p.locator('button[data-aba="'+id+'"],button[data-tab="'+id+'"]').first().click();if(await p.locator(seletor).first().isVisible())break;}
   if(['sao','fabula-ultima'].includes(nome)){const op=await p.locator(seletor).first().locator('option').evaluateAll(es=>es.find(e=>e.value&&!e.disabled).value);await p.locator(seletor).first().selectOption(op);}
   if(nome==='thryliki-chelona')await p.locator(seletor).click();
   const snapshot=()=>p.evaluate(()=>{const f=typeof atual==='function'?atual():personagemAtual();return JSON.stringify({nivel:f.nivel,nc:f.nc,classes:f.classes,nome:f.perfil.nome});});const originalNivel=await snapshot();
   await p.locator(['sao','fabula-ultima'].includes(nome)?'[data-subir-nivel]':nome==='thryliki-chelona'?'#btSubirNivelPadrao':'#btnLevelUp').first().click();const cancelar=p.locator('#btCancelarNivel,#btnCancelarLevelUp');assert.equal(await cancelar.isVisible(),true,nome+' abre evolução cancelável');await cancelar.click();assert.equal(await snapshot(),originalNivel,nome+' cancelar evolução preserva ficha');evolucao=true;
   await p.waitForFunction(()=>!debounceHub&&(typeof salvamentoHubEmCurso==='undefined'||!salvamentoHubEmCurso));
  }
  dono=false;editar=true;await p.reload({waitUntil:'domcontentloaded'});await pronto();await perfil();assert.equal(await campoNome().isDisabled(),false,'Mestre autorizado pode editar');
  editar=false;await p.reload({waitUntil:'domcontentloaded'});await pronto();await perfil();assert.equal(await campoNome().isDisabled(),true,'leitor fica bloqueado');
  assert.deepEqual(erros,[]);resultados.push({sistema:nome,abas:ids,aparencia,guia,evolucao,salvarReabrir:true,concorrencia:maxConcorrencia,desktopCelular:true,recursoCombate:true,mestre:true,leitura:true,erros});
  console.log('PASS',nome,ids.length+' abas, aparência '+aparencia+', persistência, edição pelo Mestre, leitura e concorrência');await ctx.close();
 }
 await fs.writeFile(path.join(out,'fichas.json'),JSON.stringify(resultados,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
