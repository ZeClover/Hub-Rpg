/* eslint-disable @typescript-eslint/no-require-imports -- Teste isolado CommonJS, sem APIs reais. */
/* Somente APIs simuladas: não grava dados no Hub real.
   PLAYWRIGHT_CORE=/caminho/playwright-core node scripts/testar-pathfinder-interface.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'playwright-core');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const raiz=path.resolve(__dirname,'../public');
const id='11111111-1111-4111-8111-111111111111';
const ancestralidade={id:'humano',nome:'Humano',pv:8,deslocamento:7.5,incrementos:[],livres:2,herancas:[{id:'versatil',nome:'Versátil'}]};
const biografia={id:'artesao',nome:'Artesão',atributos:['for','int'],pericia:'medicina',talento:'bio'};
const classe={id:'guerreiro',nome:'Guerreiro',pv:10,atributoChave:['for','des'],periciasTreinadas:3,periciasFixas:['atletismo'],percepcao:2,salvaguardas:{fortitude:2,reflexos:2,vontade:1},armaduras:{sem:1,leve:1,media:1,pesada:1},armas:{simples:2,marciais:2},opcoes:[],progressao:[{nivel:1,nome:'Talento de guerreiro',descricao:'Escolha seu talento.',automatico:false},{nivel:2,nome:'Talento de guerreiro',descricao:'Escolha novo talento e talento de perícia.',automatico:false}]};
const talentos=[{id:'a1',nome:'Talento ancestral',nivel:1,tipo:'ancestralidade',ancestralidade:'humano'},{id:'c1',nome:'Talento guerreiro inicial',nivel:1,tipo:'classe',classe:'guerreiro'},{id:'c1b',nome:'Outra técnica guerreira',nivel:1,tipo:'classe',classe:'guerreiro'},{id:'c1c',nome:'Terceira técnica guerreira',nivel:1,tipo:'classe',classe:'guerreiro'},{id:'c2',nome:'Talento guerreiro avançado',nivel:2,tipo:'classe',classe:'guerreiro'},{id:'p2',nome:'Talento de perícia avançado',nivel:2,tipo:'pericia'},{id:'bio',nome:'Talento da biografia',nivel:1,tipo:'pericia'},{id:'consulta',nome:'Texto ainda em revisão',nivel:1,tipo:'classe',classe:'guerreiro',somenteConsulta:true,revisao:'texto-original-pt-indexado',descricao:'Trecho da fonte ainda não separado integralmente.'}];
const catalogo={fonte:{nome:'Fonte simulada',estado:'parcial'},classes:[classe],ancestralidades:[ancestralidade],biografias:[biografia],talentos,magias:[],equipamentos:[]};
const base={sistema:'pathfinder-2e-remaster',versaoFicha:1,nome:'Teste preservado',nivel:1,xp:1000,ancestralidadeId:'humano',herancaId:'versatil',biografiaId:'artesao',classeId:'guerreiro',atributoChave:'for',ancestralidadeAlternativa:true,incrementos:{ancestralidade:['for','con'],biografia:['for','int'],classe:['for'],livres:['for','des','con','sab'],nivel:{}},pericias:{acrobacia:1,arcanismo:1,diplomacia:1,furtividade:1},talentos:[{id:'a1',nivel:1,tipo:'ancestralidade'},{id:'c1',nivel:1,tipo:'classe'},{id:'bio',nivel:1,tipo:'pericia',origem:'biografia'}],magias:[],vida:{atual:7,maxima:20,temporaria:3},notas:'Campo que deve continuar',campoDesconhecido:{preservar:true},_guiado:{concluido:true,passo:7},_mestre:{segredo:'não exportar'}};
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  let testes=0;const cachePublico=new Map();
  async function ambiente({antes=false,readonly=false,fail=null,local=false,permitido=2,mestre=false,real=null,simulado=null,fichaId=id,viewport={width:390,height:844}}={}) {
    const context=await browser.newContext({viewport}),page=await context.newPage();
    const estado={dados:structuredClone(real?.base||simulado?.base||base),versao:'v1',patches:[],iniciativas:[],buscas:[],falha:fail};
    const validarServidor=real?await import('../src/lib/pathfinder/validar-ficha.ts'):null;
    await page.route('https://pf2.local/**',async route=>{
      const url=new URL(route.request().url()),req=route.request();
      if(url.pathname.startsWith('/api/')) {
        estado.buscas.push(url.pathname);
        if(url.pathname===`/api/personagens/${fichaId}/iniciativa`){const corpo=req.postDataJSON();estado.iniciativas.push(corpo);return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,declaracao:{nome:estado.dados.nome,resultado:corpo.resultado}})});}
        if(url.pathname===`/api/personagens/${fichaId}`) {
          if(req.method()==='PATCH') {
            const corpo=req.postDataJSON();estado.patches.push(corpo);
            if(estado.falha==='rede')return route.abort('failed');
            if(estado.falha)return route.fulfill({status:estado.falha,contentType:'application/json',body:JSON.stringify({erro:'Falha simulada'})});
            if(corpo.atualizadoEmBase!==estado.versao)return route.fulfill({status:409,body:'{}'});
            const xp=Math.max(0,Number(estado.dados.xp||0)-1000*Math.max(0,corpo.dados.nivel-estado.dados.nivel));
            if(validarServidor){const preparado=validarServidor.prepararFichaPathfinder(estado.dados,corpo.dados,{emCampanha:true,ehMestre:false,ehMonstro:false});if(preparado.erro)return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({erro:preparado.erro})});estado.dados=preparado.dados;}else estado.dados={...corpo.dados,xp};estado.versao='v'+(estado.patches.length+1);
            return route.fulfill({contentType:'application/json',body:JSON.stringify({personagem:{dados:estado.dados,atualizadoEm:estado.versao,progressaoPermitida:{nivelMaximo:estado.dados.nivel+Math.floor(xp/1000),modo:'mestre-ou-xp'}}})});
          }
          return route.fulfill({contentType:'application/json',body:JSON.stringify({personagem:{sistema:'pathfinder-2e-remaster',nome:'Teste',dados:estado.dados,podeEditar:!readonly,ehMestre:mestre,ehDono:true,atualizadoEm:estado.versao,progressaoPermitida:{nivelMaximo:permitido,modo:'mestre-ou-xp'}}})});
        }
        return route.fulfill({contentType:'application/json',body:'{"habilitado":false}'});
      }
      if(['/pathfinder/player-core-catalogo.json','/pathfinder/player-core-2-catalogo.json','/pathfinder/gm-core.json'].includes(url.pathname)) {
        const fonte=url.pathname.includes('core-2')?real?.pc2:url.pathname.includes('gm-core')?real?.gm:real?.pc1||simulado?.catalogo||catalogo;
        return route.fulfill({contentType:'application/json',body:JSON.stringify(fonte||{...catalogo,classes:[],ancestralidades:[],biografias:[],talentos:[]})});
      }
      if(process.env.PF2_PUBLIC==='1'&&!antes){if(!cachePublico.has(url.pathname)){const raw=execFileSync('python',['-c','import urllib.request,base64,json,sys\nr=urllib.request.urlopen(sys.argv[1]);print(json.dumps({"status":r.status,"mime":r.headers.get("Content-Type","application/octet-stream"),"body":base64.b64encode(r.read()).decode()}))','https://hub-rpg-eight.vercel.app'+url.pathname],{maxBuffer:8*1024*1024});cachePublico.set(url.pathname,JSON.parse(raw));}const r=cachePublico.get(url.pathname);return route.fulfill({status:r.status,contentType:r.mime,body:Buffer.from(r.body,'base64')});}
      const anteriores={'/pathfinder-2e.html':'/tmp/pf-guia-antes.html','/js/pathfinder-interface.js':'/tmp/pf-interface-antes.js','/css/pathfinder.css':'/tmp/pf-css-antes.css'};try { const bytes=await fs.readFile(antes&&anteriores[url.pathname]?anteriores[url.pathname]:path.join(raiz,url.pathname));return route.fulfill({contentType:url.pathname.endsWith('.js')?'application/javascript':url.pathname.endsWith('.css')?'text/css':'text/html',body:bytes}); }
      catch{return route.fulfill({status:404,body:'não encontrado'});}
    });
    const errors=[];page.on('pageerror',erro=>errors.push(erro.message));
    await page.goto('https://pf2.local/pathfinder-2e.html'+(local?'?local=teste':'?id='+fichaId));
    await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Ficha carregada')||document.querySelector('#status').textContent==='Somente leitura');
    return {context,page,estado,errors};
  }
  async function prontoGuia(page) {
    await page.locator('#evoluir').click();await page.locator('#guia').waitFor({state:'visible'});
    await page.locator('#guia-passos [data-passo="6"]').click();
    await page.locator('#guia-conteudo [data-escolha="talentos"][value="c2"]').check();
    await page.locator('#guia-conteudo [data-escolha="talentos"][value="p2"]').check();
    await page.locator('#guia-passos [data-passo="7"]').click();
  }
  try {
    for(const width of [320,390,1440]){
      const {page,context,estado,errors}=await ambiente({viewport:{width,height:900}});await page.locator('#evoluir').click();assert.equal(await page.locator('#guia').evaluate(e=>e.matches(':modal')),false);assert.equal(await page.locator('#ficha').isVisible(),false);assert.equal(await page.locator('#guia-etapa-titulo').innerText(),'Ganhos do nível');assert.equal(await page.locator('#guia-passos [data-passo="4"]').count(),0);assert.equal(await page.locator('#guia-passos [data-passo="9"]').count(),0);await page.locator('#guia-proximo').click();assert.equal(await page.locator('#guia-etapa-titulo').innerText(),'Talentos');assert.equal(await page.locator('#guia-conteudo [data-editar="armaduraId"]').count(),0);await page.locator('[data-acao="categoria-guia"][data-valor="classe"]').click();assert.equal(await page.locator('#guia-conteudo [data-escolha="talentos"][value="p2"]').count(),0);assert.equal(await page.locator('#guia-conteudo [data-escolha="talentos"][value="c2"]').count(),1);await page.locator('[data-acao="categoria-guia"][data-valor=""]').click();await page.locator('#guia-voltar').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(process.env.PF2_SCREENSHOTS){await fs.mkdir(path.join(raiz,'../artifacts/pathfinder-guiado'),{recursive:true});await page.screenshot({path:path.join(raiz,'../artifacts/pathfinder-guiado/evolucao-'+width+'.png'),fullPage:true});}await page.keyboard.press('Escape');assert.equal(await page.locator('#guia').isVisible(),false);assert.equal(estado.patches.length,0);assert.deepEqual(errors,[]);await context.close();testes++;
    }
    {const {page,context,estado}=await ambiente({permitido:5,simulado:{base:{...base,nivel:4},catalogo}});await page.locator('#evoluir').click();await page.locator('#guia-passos [data-passo="4"]').click();assert.equal(await page.locator('#guia-conteudo [data-incremento="ancestralidade"]').count(),0);assert.equal(await page.locator('#guia-conteudo [data-incremento="livres"]').count(),0);for(const id of ['for','des','con','int'])await page.locator('#guia-conteudo [data-incremento="nivel.5"][value="'+id+'"]').check();assert.equal(await page.locator('#guia-conteudo [data-incremento="nivel.5"][value="sab"]').isDisabled(),true);await page.locator('#guia-cancelar').click();assert.equal(estado.dados.nivel,4);assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context,estado}=await ambiente();await page.locator('#evoluir').click();await page.locator('#guia-fechar').click();const original=await page.evaluate(id=>localStorage.getItem('hub_pf2_guia_v1:'+id),id);estado.versao='v99';estado.dados.notas='Alteração feita pela mesa';await page.reload();await page.locator('#evoluir').click();assert.equal(await page.locator('#guia').isVisible(),false);assert.match(await page.locator('#aviso').innerText(),/ficha mudou/i);assert.equal(await page.evaluate(id=>localStorage.getItem('hub_pf2_guia_v1:'+id),id),original);assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context,estado}=await ambiente();await page.locator('#criar').click();await page.locator('#guia-passos [data-passo="9"]').click();assert.equal(await page.locator('#guia-conteudo [data-editar="equipamentoInicial"]').count(),1);assert.equal(await page.locator('#guia-conteudo [data-escolha="talentos"]').count(),0);await page.locator('#guia-passos [data-passo="7"]').click();const name=await page.locator('#guia-etapa-titulo').innerText();await page.locator('#guia-fechar').click();await page.reload();await page.locator('#criar').click();assert.equal(await page.locator('#guia-etapa-titulo').innerText(),name);await page.locator('#guia-cancelar').click();assert.equal(estado.patches.length,0);await context.close();testes++;}
    if(process.env.PF2_SCREENSHOTS){for(const antes of [true,false]){const {page,context}=await ambiente({antes,viewport:{width:1440,height:900}});await page.locator('#criar').click();await page.locator('#guia-passos [data-passo="1"]').click();await page.screenshot({path:path.join(raiz,'../artifacts/pathfinder-guiado/criacao-'+(antes?'antes':'depois')+'.png'),fullPage:true});await context.close();}}
    {const {page,context,estado,errors}=await ambiente({readonly:true});assert.equal(await page.locator('#acoes').isVisible(),false);assert.equal(await page.locator('[data-editar="vida.atual"]').isDisabled(),true);await page.waitForTimeout(700);assert.equal(estado.patches.length,0);assert.ok(!estado.buscas.some(url=>url.includes('campanha')));assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await context.close();testes++;}
    {const {page,context,estado}=await ambiente();await page.locator('#evoluir').click();await page.locator('#guia-passos [data-passo="6"]').click();await page.locator('[data-escolha="talentos"][value="c2"]').check();await page.locator('#guia-cancelar').click();assert.equal(estado.dados.nivel,1);assert.equal(estado.dados.vida.atual,7);assert.equal(estado.patches.length,0);assert.equal(await page.evaluate(id=>localStorage.getItem('hub_pf2_guia_v1:'+id),id),null);await context.close();testes++;}
    {const {page,context,estado}=await ambiente();await page.locator('#evoluir').click();await page.locator('#guia-passos [data-passo="6"]').click();await page.locator('[data-escolha="talentos"][value="c2"]').check();await page.locator('#guia-fechar').click();await page.reload();await page.locator('#evoluir').click();assert.equal(await page.locator('[data-escolha="talentos"][value="c2"]').isChecked(),true);assert.equal(estado.dados.nivel,1);assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context,estado,errors}=await ambiente();await prontoGuia(page);await page.locator('#guia-confirmar').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));assert.equal(estado.patches.length,1);assert.equal(estado.patches[0].atualizadoEmBase,'v1');assert.equal(estado.dados.nivel,2);assert.equal(estado.dados.xp,0);assert.equal(estado.dados.vida.atual,7);assert.equal(estado.dados.vida.temporaria,3);assert.equal(estado.dados.vida.maxima,32);assert.equal(estado.dados._mestre,undefined);assert.deepEqual(estado.dados.campoDesconhecido,{preservar:true});assert.equal(await page.locator('#evoluir').isDisabled(),true);assert.deepEqual(errors,[]);await context.close();testes++;}
    for(const falha of [409,500,'rede']) {const {page,context,estado}=await ambiente({fail:falha});await prontoGuia(page);await page.locator('#guia-confirmar').click();await page.waitForFunction(()=>document.querySelector('#guia-aviso').textContent.includes('Falha')||document.querySelector('#guia-aviso').textContent.includes('mudou'));assert.equal(estado.dados.nivel,1);assert.equal(estado.patches.length,1);const rascunho=await page.evaluate(id=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)),id);assert.equal(rascunho.dados.nivel,2);assert.equal(rascunho.base,'v1');assert.equal(rascunho.dados._mestre,undefined);assert.ok(!rascunho.baseSerial.includes('_mestre'));assert.equal(await page.locator('#guia-exportar').isEnabled(),true);await page.locator('#guia-fechar').click();assert.equal(estado.dados.vida.atual,7);await context.close();testes++;}
    {const {page,context,estado}=await ambiente({permitido:1});assert.equal(await page.locator('#evoluir').isDisabled(),true);assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context,estado}=await ambiente({local:true});await page.locator('#criar').click();await page.locator('#guia-conteudo [data-editar="nome"]').fill('Rascunho local');await page.locator('#guia-conteudo [data-editar="nome"]').dispatchEvent('change');await page.locator('#guia-fechar').click();await page.reload();await page.locator('#criar').click();assert.equal(await page.locator('#guia-conteudo [data-editar="nome"]').inputValue(),'Rascunho local');await page.locator('#guia-passos [data-passo="7"]').click();await page.locator('#guia-confirmar').click();assert.ok((await page.locator('#guia-aviso').textContent()).includes('Escolha'));assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context}=await ambiente({mestre:true});await prontoGuia(page);await page.locator('#guia-fechar').click();await page.reload();await page.locator('#evoluir').click();await page.locator('#guia-confirmar').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));const r=await page.evaluate(()=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:11111111-1111-4111-8111-111111111111')));assert.equal(r,null);await context.close();testes++;}
    {const {page,context}=await ambiente();await page.locator('[data-aba="opcoes"]').click();assert.equal(await page.locator('[data-escolha="talentos"][value="consulta"]').isDisabled(),true);await page.locator('[data-escolha="talentos"][value="consulta"]').locator('xpath=ancestor::details').evaluate(elemento=>elemento.open=true);await page.locator('[data-acao="detalhe"][data-valor="talentos:consulta"]').click();assert.ok((await page.locator('#detalhes-conteudo').textContent()).includes('ainda em revisão'));await page.locator('#detalhes-fechar').click();const texto=await page.evaluate(()=>{let impresso;window.print=()=>{impresso=document.querySelector('#ficha').textContent;};document.querySelector('#imprimir').click();return impresso;});assert.ok(texto.includes('Talento guerreiro inicial'));assert.ok(!texto.includes('Talento guerreiro avançado'));await context.close();testes++;}
    {const {page,context,estado}=await ambiente({viewport:{width:1365,height:900}});await page.locator('[data-aba="opcoes"]').click();const titulo=page.locator('h3').filter({hasText:'Opções compatíveis neste nível'}),antes=await titulo.textContent(),cartoesAntes=await titulo.locator('xpath=following-sibling::div[1]//article').count();assert.ok(cartoesAntes>=3);assert.equal(await page.locator('[data-escolha="talentos"][value="c1b"]').isDisabled(),true);await page.locator('[data-escolha="talentos"][value="c1"]').uncheck();await page.locator('[data-escolha="talentos"][value="c1b"]').check();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');const depois=await page.locator('h3').filter({hasText:'Opções compatíveis neste nível'}).textContent(),cartoesDepois=await page.locator('h3').filter({hasText:'Opções compatíveis neste nível'}).locator('xpath=following-sibling::div[1]//article').count();assert.equal(depois,antes);assert.equal(cartoesDepois,cartoesAntes);assert.ok(estado.dados.talentos.some(t=>t.id==='c1b'));assert.ok(!estado.dados.talentos.some(t=>t.id==='c1'));if(process.env.PF2_SCREENSHOTS){await fs.mkdir(path.join(raiz,'../artifacts/pathfinder-revisao'),{recursive:true});await page.screenshot({path:path.join(raiz,'../artifacts/pathfinder-revisao/talentos-desktop.png'),fullPage:true});}await context.close();testes++;}
    {const {page,context,estado,errors}=await ambiente();await page.locator('#quantidade-vida').fill('10');await page.locator('#dano-critico').check();await page.locator('[data-acao="dano"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.vida.atual,0);assert.equal(estado.dados.vida.temporaria,0);assert.equal(estado.dados.condicoes.find(c=>c.id==='morrendo').valor,2);await page.locator('#quantidade-vida').fill('5');await page.locator('[data-acao="curar"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.vida.atual,5);assert.equal(estado.dados.condicoes.find(c=>c.id==='ferido').valor,1);assert.ok(!estado.dados.condicoes.some(c=>c.id==='morrendo'));assert.deepEqual(errors,[]);await context.close();testes++;}
    {const {page,context,estado}=await ambiente();assert.equal(await page.locator('#rolagem, #conjurar').count(),0);assert.equal(await page.locator('[data-acao="teste"],[data-acao="ataque"],[data-acao="conjurar"],[data-acao="consumir-item"],[data-acao="iniciar-turno"],[data-acao="finalizar-turno"]').count(),0);await page.locator('#iniciativa-dado').fill('11');await page.locator('[data-acao="declarar-iniciativa"]').click();await page.waitForFunction(()=>document.querySelector('#aviso').textContent.includes('Iniciativa declarada'));assert.deepEqual(estado.iniciativas,[{resultado:17}]);await page.locator('[data-aba="opcoes"]').click();assert.ok((await page.locator('#ficha').textContent()).includes('não possui conjuração'));await context.close();testes++;}
    {const magiaDivina={id:'luz-divina',nome:'Luz Divina',tipo:'magia',nivel:1,ranque:1,tradicoes:['divina']},magiaArcana={id:'seta-arcana',nome:'Seta Arcana',tipo:'magia',nivel:1,ranque:1,tradicoes:['arcana']},magiaFutura={id:'milagre-futuro',nome:'Milagre Futuro',tipo:'magia',nivel:3,ranque:3,tradicoes:['divina']},clerigo={...classe,id:'clerigo',nome:'Clérigo',conjuracao:{tradicao:'divina',atributo:'sab',grau:1,truques:5,preparacao:'preparada',espacosPorNivel:[{nivel:1,espacos:{1:2}}]}};const {page,context}=await ambiente({simulado:{base:{...base,classeId:'clerigo',atributoChave:'sab'},catalogo:{...catalogo,classes:[clerigo],magias:[magiaDivina,magiaArcana,magiaFutura]}}});await page.locator('[data-aba="opcoes"]').click();const texto=await page.locator('#ficha').textContent();assert.ok(texto.includes('Você pode escolher agora'));assert.ok(texto.includes('Bloqueadas para esta ficha'));assert.ok(texto.includes('Planejar ranques futuros'));assert.equal(await page.locator('[data-acao="conjurar"]').count(),0);await context.close();testes++;}
    {const a=await ambiente();await a.page.locator('[data-aba="aparencia"]').click();assert.ok((await a.page.locator('#ficha').textContent()).includes('somente a esta ficha'));await a.page.locator('[data-editar="_aparencia.tema"]').selectOption('rubro');await a.page.locator('[data-editar="_aparencia.borda"]').fill('#aabbcc');await a.page.locator('[data-editar="_aparencia.borda"]').dispatchEvent('change');await a.page.locator('[data-editar="_aparencia.escala"]').selectOption('1.1');await a.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(a.estado.dados._aparencia.tema,'rubro');assert.equal(a.estado.dados._aparencia.borda,'#aabbcc');assert.equal(a.estado.dados._aparencia.escala,'1.1');if(process.env.PF2_SCREENSHOTS){await fs.mkdir(path.join(raiz,'../artifacts/pathfinder-revisao'),{recursive:true});await a.page.screenshot({path:path.join(raiz,'../artifacts/pathfinder-revisao/aparencia-celular.png'),fullPage:true});}await a.page.reload();await a.page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--borda')==='#aabbcc');assert.equal(await a.page.evaluate(()=>document.documentElement.style.getPropertyValue('--pf-escala')),'1.1');const b=await ambiente({fichaId:'22222222-2222-4222-8222-222222222222',simulado:{base:{...base,_aparencia:{tema:'verde',campoExistente:'preservado'}},catalogo}});assert.equal(await b.page.evaluate(()=>document.documentElement.style.getPropertyValue('--fundo')),'#0c1915');assert.equal(b.estado.dados._aparencia.tema,'verde');assert.equal(b.estado.patches.length,0);await a.context.close();await b.context.close();testes++;}
    if(process.env.PF2_CATALOGO_REAL==='1') {
      const R=require('../public/js/pathfinder-regras.js');
      const pc1=JSON.parse(await fs.readFile(path.join(raiz,'pathfinder/player-core-catalogo.json'),'utf8'));
      const pc2=JSON.parse(await fs.readFile(path.join(raiz,'pathfinder/player-core-2-catalogo.json'),'utf8'));
      const gm=JSON.parse(await fs.readFile(path.join(raiz,'pathfinder/gm-core.json'),'utf8'));
      const baseReal={...R.criar(),nome:'Novo personagem',xp:1000};
      const {page,context,estado,errors}=await ambiente({real:{pc1,pc2,gm,base:baseReal}});
      await page.locator('#criar').click();
      await page.locator('#guia-conteudo [data-editar="nome"]').fill('Guerreiro de catálogo real');
      await page.locator('#guia-conteudo [data-editar="nome"]').dispatchEvent('change');
      await page.locator('#guia-passos [data-passo="1"]').click();
      await page.locator('[data-editar="ancestralidadeId"]').selectOption('humano');
      await page.locator('#guia-conteudo [data-editar="herancaId"]').selectOption('humano-perito');
      await page.locator('#guia-conteudo [data-editar="escolhasHeranca.pericia"]').selectOption('sociedade');
      await page.locator('#guia-passos [data-passo="2"]').click();
      await page.locator('#guia-conteudo [data-editar="biografiaId"]').selectOption('acrobata');
      await page.locator('#guia-passos [data-passo="3"]').click();
      await page.locator('#guia-conteudo [data-editar="classeId"]').selectOption('guerreiro');
      await page.locator('#guia-conteudo [data-editar="atributoChave"]').selectOption('for');
      await page.locator('#guia-conteudo [data-editar="escolhasClasse.periciaInicial"]').selectOption('atletismo');
      await page.locator('#guia-passos [data-passo="4"]').click();
      for(const [lote,valores] of Object.entries({ancestralidade:['for','con'],biografia:['for','int'],livres:['for','des','con','sab']})) for(const atributo of valores) await page.locator('#guia-conteudo [data-incremento="'+lote+'"][value="'+atributo+'"]').check();
      await page.locator('#guia-passos [data-passo="6"]').click();
      await page.locator('#guia-conteudo [data-escolha="talentos"][value="humano-pericia-natural"]').check();
      await page.locator('#guia-conteudo [data-escolha="talentos"][value="guerreiro-investida-subita"]').check();
      await page.locator('#guia-passos [data-passo="5"]').click();
      for(const pericia of ['arcanismo','diplomacia','furtividade','medicina','sociedade','sobrevivencia','ladroagem']) await page.locator('#guia-conteudo [data-editar="pericias.'+pericia+'"]').selectOption('1');
      await page.locator('#guia-passos [data-passo="7"]').click();
      const rascunho=await page.evaluate(id=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)).dados,id);
      const combinado=Object.fromEntries(['classes','ancestralidades','biografias','talentos','magias','equipamentos','herancasVersateis','divindades','dominios'].map(tipo=>[tipo,[...(pc1[tipo]||[]),...(pc2[tipo]||[]),...(gm[tipo]||[])]]));
      assert.equal(R.calcular(rascunho,combinado).grausPericias.atletismo,1,'A perícia inicial escolhida do Guerreiro precisa ser aplicada.');
      assert.equal(R.validar(rascunho,combinado).valido,true,JSON.stringify(R.validar(rascunho,combinado)));
      await page.locator('#guia-confirmar').click();
      await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));
      assert.equal(estado.patches.length,1);assert.equal(estado.dados.nivel,1);assert.equal(estado.dados._guiado.concluido,true);assert.equal(estado.dados.vida.atual,20);assert.equal(estado.dados.xp,1000);assert.equal(estado.dados.escolhasClasse.periciaInicial,'atletismo');
      const primeiraFichaReal=structuredClone(estado.dados);
      await page.locator('[data-editar="vida.atual"]').fill('7');await page.locator('[data-editar="vida.atual"]').dispatchEvent('change');
      await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      assert.equal(estado.dados.vida.atual,7);
      await page.locator('#evoluir').click();await page.locator('#guia-passos [data-passo="6"]').click();
      await page.locator('#guia-conteudo [data-escolha="talentos"][value="guerreiro-estocada"]').check();
      await page.locator('#guia-conteudo [data-escolha="talentos"][value="queda-do-gato"]').check();
      await page.locator('#guia-passos [data-passo="7"]').click();await page.locator('#guia-confirmar').click();
      await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));
      assert.equal(estado.patches.length,3);assert.equal(estado.dados.nivel,2);assert.equal(estado.dados.vida.maxima,32);assert.equal(estado.dados.vida.atual,7);assert.equal(estado.dados.xp,0);assert.equal(estado.patches[2].atualizadoEmBase,'v3');assert.equal(await page.locator('#evoluir').isDisabled(),true);assert.deepEqual(errors,[]);
      const texto=await page.evaluate(()=>{let impresso;window.print=()=>{impresso=document.querySelector('#ficha').textContent;};document.querySelector('#imprimir').click();return impresso;});
      assert.ok(texto.includes('Investida Súbita'));assert.ok(texto.includes('Queda Do Gato')||texto.includes('Queda do Gato'));assert.ok(!texto.includes('Postura De Queima-Roupa'));await context.close();testes++;
      const equipado=await ambiente({real:{pc1,pc2,gm,base:primeiraFichaReal}});
      await equipado.page.locator('[data-aba="personagem"]').click();
      assert.equal(await equipado.page.locator('[data-editar="armadura.ca"]').count(),0,'CA não deve exigir cálculo manual.');
      for(const [campo,escolha] of Object.entries({armaduraId:'couro',armaId:'adaga',escudoId:'escudo-de-aco'}))await equipado.page.locator('[data-editar="'+campo+'"]').selectOption(escolha);
      await equipado.page.locator('[data-editar="escudoErguido"]').check();
      await equipado.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      let valores=R.calcular(equipado.estado.dados,combinado);
      assert.equal(valores.ca,17);assert.deepEqual(valores.map,[0,-4,-8]);
      assert.equal(equipado.estado.dados.equipamentos.filter(item=>item.id==='adaga').length,1);
      await equipado.page.locator('[data-editar="runasEquipamento.arma.impactante"]').selectOption('runa-impactante');
      await equipado.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      valores=R.calcular(equipado.estado.dados,combinado);assert.equal(valores.dadosArma,2);
      await equipado.page.locator('[data-aba="sessao"]').click();
      const ataqueTexto=await equipado.page.locator('#ficha').innerText();assert.ok(ataqueTexto.includes('Ataque 2 · '+(valores.ataque-4>=0?'+':'')+(valores.ataque-4)));assert.ok(ataqueTexto.includes('Fórmula de dano'));assert.equal(await equipado.page.locator('[data-acao="ataque"],#rolagem').count(),0);assert.deepEqual(equipado.errors,[]);await equipado.context.close();testes++;
      {
        const sombra=await ambiente({real:{pc1,pc2,gm,base:primeiraFichaReal}});
        await sombra.page.locator('[data-aba="personagem"]').click();
        await sombra.page.locator('[data-editar="armaduraId"]').selectOption('couro');
        await sombra.page.locator('[data-editar="runasEquipamento.armadura.potencia"]').selectOption('runa-potencia-armadura-1');
        await sombra.page.locator('[data-editar="armaduraInvestida"]').check();
        await sombra.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
        const furtividade=R.calcular(sombra.estado.dados,combinado).pericias.furtividade;
        await sombra.page.locator('[data-editar="runasEquipamento.armadura.propriedade1"]').selectOption('runa-sombra');
        await sombra.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
        assert.equal(R.calcular(sombra.estado.dados,combinado).pericias.furtividade,furtividade+1);
        await sombra.page.locator('[data-editar="armaduraInvestida"]').uncheck();
        await sombra.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
        assert.equal(R.calcular(sombra.estado.dados,combinado).pericias.furtividade,furtividade);
        assert.deepEqual(sombra.errors,[]);await sombra.context.close();testes++;
      }
      // A fonte PC1 completa pode ser atualizada antes dos índices gerados pelo build.
      // Este cenário usa regras reais e API simulada; os demais cenários reais validam a API canônica.
      const fonteEscudo=JSON.parse(await fs.readFile(path.join(raiz,'pathfinder/player-core.json'),'utf8'));
      const catalogoEscudo=Object.fromEntries(Object.keys(combinado).map(tipo=>[tipo,[...(fonteEscudo[tipo]||[]),...(pc2[tipo]||[]),...(gm[tipo]||[])]]));
      const bloqueio=await ambiente({simulado:{catalogo:catalogoEscudo,base:R.normalizar({...primeiraFichaReal,escudoId:'escudo-de-aco',escudoErguido:true,vida:{...primeiraFichaReal.vida,temporaria:0},turno:{reacoes:1,acoesGerais:3,podeAgir:true,encerrado:false}},catalogoEscudo)}});
      assert.ok(await bloqueio.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Bloqueio com Escudo deve caber na tela móvel.');
      assert.equal(await bloqueio.page.locator('[data-acao="iniciar-turno"]').count(),0);
      await bloqueio.page.locator('#quantidade-vida').fill('10');await bloqueio.page.locator('#dano-tipo').selectOption('cortante');await bloqueio.page.locator('#dano-ataque').check();
      await bloqueio.page.locator('[data-acao="bloquear-escudo"]').click();await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      assert.equal(bloqueio.estado.dados.escudoPv,15);assert.equal(bloqueio.estado.dados.vida.atual,15);assert.equal(bloqueio.estado.dados.turno.reacoes,0);assert.equal(bloqueio.estado.dados.escudoQuebrado,false);
      const quantidadePatches=bloqueio.estado.patches.length;await bloqueio.page.locator('#dano-ataque').check();await bloqueio.page.locator('[data-acao="bloquear-escudo"]').click();await bloqueio.page.waitForTimeout(650);assert.equal(bloqueio.estado.patches.length,quantidadePatches,'Reação já gasta não deve bloquear novamente.');
      // A mesa renovou a reação fora do Hub; o estado simulado é reaberto sem rolar dados.
      bloqueio.estado.dados.turno.reacoes=1;await bloqueio.page.reload();await bloqueio.page.waitForSelector('[data-acao="bloquear-escudo"]');
      await bloqueio.page.locator('#quantidade-vida').fill('16');await bloqueio.page.locator('#dano-tipo').selectOption('cortante');await bloqueio.page.locator('#dano-ataque').check();await bloqueio.page.locator('[data-acao="bloquear-escudo"]').click();await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      assert.equal(bloqueio.estado.dados.escudoPv,4);assert.equal(bloqueio.estado.dados.escudoQuebrado,true);assert.equal(bloqueio.estado.dados.vida.atual,4);
      let defesa=R.calcular(bloqueio.estado.dados,catalogoEscudo);assert.equal(defesa.ca,defesa.caSemEscudo,'Escudo quebrado não deve conceder CA.');
      await bloqueio.page.locator('[data-aba="personagem"]').click();await bloqueio.page.locator('[data-editar="escudoId"]').selectOption('broquel');await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');await bloqueio.page.locator('[data-editar="escudoId"]').selectOption('escudo-de-aco');await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      assert.equal(bloqueio.estado.dados.escudoPv,4);assert.equal(bloqueio.estado.dados.escudoQuebrado,true,'Trocar equipamento não repara o escudo anterior.');defesa=R.calcular(bloqueio.estado.dados,catalogoEscudo);assert.equal(defesa.caComEscudo,defesa.caSemEscudo);assert.deepEqual(bloqueio.errors,[]);await bloqueio.context.close();testes++;
      const clerigo=await ambiente({real:{pc1,pc2,gm,base:{...baseReal,classeId:'clerigo',atributoChave:'sab',opcaoClasseId:'sacerdote-enclausurado'}}});
      await clerigo.page.locator('#criar').click();await clerigo.page.locator('#guia-passos [data-passo="3"]').click();
      await clerigo.page.locator('#guia-conteudo [data-editar="escolhasClasse.divindade"]').selectOption('shelyn');
      await clerigo.page.locator('#guia-conteudo [data-editar="escolhasClasse.periciaDivindade"]').selectOption('performance');
      await clerigo.page.locator('#guia-conteudo [data-editar="escolhasClasse.dominio"]').selectOption('criacao');
      await clerigo.page.locator('#guia-passos [data-passo="8"]').click();
      const slot=clerigo.page.locator('#guia-conteudo [data-editar="magiasPreparadas.padrao.1.0"]');
      assert.equal(await slot.locator('option[value="cores-estonteantes"]').count(),1,'Magia concedida pela divindade deve estar disponível fora da tradição.');
      await slot.selectOption('cores-estonteantes');
      const preparado=await clerigo.page.evaluate(id=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)).dados,id);
      assert.equal(preparado.magiasPreparadas.padrao[1][0],'cores-estonteantes');
      assert.ok(preparado.magias.some(m=>m.id==='respingo-criativo'&&m.origem==='dominio:criacao'));
      assert.equal(R.calcular(preparado,combinado).conjuracao.espacos[1],2,'Concessão não deve criar espaço extra.');
      assert.equal(R.calcular(preparado,combinado).grausPericias.performance,1);
      assert.ok(!R.validar(preparado,combinado).erros.some(e=>e.includes('Magia preparada não concedida')));
      await clerigo.page.locator('#guia-cancelar').click();assert.equal(clerigo.estado.patches.length,0);assert.deepEqual(clerigo.errors,[]);await clerigo.context.close();testes++;
      for(const classeReal of combinado.classes) {
        const personagem=R.normalizar({...R.criar(),nome:'Classe '+classeReal.nome,classeId:classeReal.id,atributoChave:classeReal.atributoChave[0],opcaoClasseId:classeReal.opcoes?.[0]?.id||'',ancestralidadeId:'humano',herancaId:'humano-perito',escolhasHeranca:{pericia:'sociedade'},atributos:{for:2,des:2,con:2,int:2,sab:2,car:2},vida:{atual:5,maxima:1,temporaria:0}},combinado);
        const tela=await ambiente({real:{pc1,pc2,gm,base:personagem}}),calculado=R.calcular(personagem,combinado);
        assert.ok((await tela.page.locator('#resumo').textContent()).includes('CA '+calculado.ca));
        if(classeReal.conjuracao){const card=tela.page.locator('.card').filter({has:tela.page.locator('h2', {hasText:'Conjuração e recursos'})});assert.equal(await card.count(),1,classeReal.id+' deve oferecer painel de conjuração.');assert.ok((await card.textContent()).includes(String(calculado.cdMagia)));if(classeReal.conjuracao.tipo!=='foco')assert.ok(Object.keys(calculado.conjuracao.espacos).length>0,classeReal.id+' deve calcular espaços automaticamente.');}
        await tela.page.locator('#evoluir').click();await tela.page.locator('#guia-passos [data-passo="7"]').click();
        const copia=await tela.page.evaluate(id=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)).dados,id);
        assert.equal(copia.nivel,2);assert.equal(copia.classeId,classeReal.id);assert.equal(tela.estado.dados.nivel,1);
        const calculado2=R.calcular(copia,combinado);assert.ok(calculado2.pvMaximos>calculado.pvMaximos,classeReal.id+' deve receber PV sem cálculo manual.');
        await tela.page.locator('#guia-cancelar').click();assert.equal(tela.estado.patches.length,0);assert.deepEqual(tela.errors,[]);await tela.context.close();testes++;
      }
      const segundo=await ambiente({real:{pc1,pc2,gm,base:primeiraFichaReal}});
      await segundo.page.locator('#criar').click();await segundo.page.locator('#guia-passos [data-passo="6"]').click();
      await segundo.page.locator('#guia-conteudo [data-escolha="talentos"][value="humano-pericia-natural"]').uncheck();
      await segundo.page.locator('#guia-conteudo [data-escolha="talentos"][value="humano-ambicao-natural"]').check();
      await segundo.page.locator('#guia-conteudo [data-escolha="talentos"][value="guerreiro-golpe-feroz"]').check();
      const ambicao=await segundo.page.evaluate(id=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)).dados,id);
      assert.equal(ambicao.talentos.find(t=>t.id==='guerreiro-golpe-feroz').origem,'ancestralidade:humano-ambicao-natural');
      await segundo.page.locator('#guia-passos [data-passo="5"]').click();
      for(const pericia of ['sobrevivencia','ladroagem'])await segundo.page.locator('#guia-conteudo [data-editar="pericias.'+pericia+'"]').selectOption('0');
      await segundo.page.locator('#guia-passos [data-passo="7"]').click();const diagnostico=await segundo.page.evaluate(id=>{const p=JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)).dados;return p;},id);assert.equal(R.validar(diagnostico,combinado).valido,true,JSON.stringify(R.validar(diagnostico,combinado)));await segundo.page.locator('#guia-confirmar').click();
      await segundo.page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));
      assert.equal(segundo.estado.patches.length,1);assert.equal(segundo.estado.dados.nivel,1);assert.equal(segundo.estado.dados.talentos.filter(t=>t.tipo==='classe'&&t.nivel===1).length,2);assert.equal(segundo.estado.dados.talentos.find(t=>t.id==='guerreiro-golpe-feroz').origem,'ancestralidade:humano-ambicao-natural');await segundo.context.close();testes++;

    }
    console.log(`PASS ${testes} cenários de navegador: leitura, guias, versão, falhas, autorização, escolhas, aparência por ficha, ausência de rolagens, magias, consulta, impressão, equipamento e sessão.`);
  } finally {await browser.close();}
})().catch(erro=>{console.error(erro);process.exitCode=1;});
