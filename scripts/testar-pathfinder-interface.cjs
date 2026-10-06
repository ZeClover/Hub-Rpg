/* eslint-disable @typescript-eslint/no-require-imports -- Teste isolado CommonJS, sem APIs reais. */
/* Somente APIs simuladas: não grava dados no Hub real.
   PLAYWRIGHT_CORE=/caminho/playwright-core node scripts/testar-pathfinder-interface.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'playwright-core');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const raiz=path.resolve(__dirname,'../public');
const id='11111111-1111-4111-8111-111111111111';
const ancestralidade={id:'humano',nome:'Humano',pv:8,deslocamento:7.5,incrementos:[],livres:2,herancas:[{id:'versatil',nome:'Versátil'}]};
const biografia={id:'artesao',nome:'Artesão',atributos:['for','int'],pericia:'medicina',talento:'bio'};
const classe={id:'guerreiro',nome:'Guerreiro',pv:10,atributoChave:['for','des'],periciasTreinadas:3,periciasFixas:['atletismo'],percepcao:2,salvaguardas:{fortitude:2,reflexos:2,vontade:1},armaduras:{sem:1,leve:1,media:1,pesada:1},armas:{simples:2,marciais:2},opcoes:[],progressao:[{nivel:1,nome:'Talento de guerreiro',descricao:'Escolha seu talento.',automatico:false},{nivel:2,nome:'Talento de guerreiro',descricao:'Escolha novo talento e talento de perícia.',automatico:false}]};
const talentos=[{id:'a1',nome:'Talento ancestral',nivel:1,tipo:'ancestralidade',ancestralidade:'humano'},{id:'c1',nome:'Talento guerreiro inicial',nivel:1,tipo:'classe',classe:'guerreiro'},{id:'c2',nome:'Talento guerreiro avançado',nivel:2,tipo:'classe',classe:'guerreiro'},{id:'p2',nome:'Talento de perícia avançado',nivel:2,tipo:'pericia'},{id:'bio',nome:'Talento da biografia',nivel:1,tipo:'pericia'},{id:'consulta',nome:'Texto ainda em revisão',nivel:1,tipo:'classe',classe:'guerreiro',somenteConsulta:true,revisao:'texto-original-pt-indexado',descricao:'Trecho da fonte ainda não separado integralmente.'}];
const catalogo={fonte:{nome:'Fonte simulada',estado:'parcial'},classes:[classe],ancestralidades:[ancestralidade],biografias:[biografia],talentos,magias:[],equipamentos:[]};
const base={sistema:'pathfinder-2e-remaster',versaoFicha:1,nome:'Teste preservado',nivel:1,xp:1000,ancestralidadeId:'humano',herancaId:'versatil',biografiaId:'artesao',classeId:'guerreiro',atributoChave:'for',ancestralidadeAlternativa:true,incrementos:{ancestralidade:['for','con'],biografia:['for','int'],classe:['for'],livres:['for','des','con','sab'],nivel:{}},pericias:{acrobacia:1,arcanismo:1,diplomacia:1,furtividade:1},talentos:[{id:'a1',nivel:1,tipo:'ancestralidade'},{id:'c1',nivel:1,tipo:'classe'},{id:'bio',nivel:1,tipo:'pericia',origem:'biografia'}],magias:[],vida:{atual:7,maxima:20,temporaria:3},notas:'Campo que deve continuar',campoDesconhecido:{preservar:true},_guiado:{concluido:true,passo:7},_mestre:{segredo:'não exportar'}};
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  let testes=0;
  async function ambiente({readonly=false,fail=null,local=false,permitido=2,mestre=false,real=null,simulado=null,fichaId=id}={}) {
    const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
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
      try { const bytes=await fs.readFile(path.join(raiz,url.pathname));return route.fulfill({contentType:url.pathname.endsWith('.js')?'application/javascript':url.pathname.endsWith('.css')?'text/css':'text/html',body:bytes}); }
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
    {const {page,context,estado,errors}=await ambiente({readonly:true});assert.equal(await page.locator('#acoes').isVisible(),false);assert.equal(await page.locator('[data-editar="vida.atual"]').isDisabled(),true);await page.waitForTimeout(700);assert.equal(estado.patches.length,0);assert.ok(!estado.buscas.some(url=>url.includes('campanha')));assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await context.close();testes++;}
    {const {page,context,estado}=await ambiente();await page.locator('#evoluir').click();await page.locator('#guia-passos [data-passo="6"]').click();await page.locator('[data-escolha="talentos"][value="c2"]').check();await page.locator('#guia-cancelar').click();assert.equal(estado.dados.nivel,1);assert.equal(estado.dados.vida.atual,7);assert.equal(estado.patches.length,0);assert.equal(await page.evaluate(id=>localStorage.getItem('hub_pf2_guia_v1:'+id),id),null);await context.close();testes++;}
    {const {page,context,estado}=await ambiente();await page.locator('#evoluir').click();await page.locator('#guia-passos [data-passo="6"]').click();await page.locator('[data-escolha="talentos"][value="c2"]').check();await page.locator('#guia-fechar').click();await page.reload();await page.locator('#evoluir').click();assert.equal(await page.locator('[data-escolha="talentos"][value="c2"]').isChecked(),true);assert.equal(estado.dados.nivel,1);assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context,estado,errors}=await ambiente();await prontoGuia(page);await page.locator('#guia-confirmar').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));assert.equal(estado.patches.length,1);assert.equal(estado.patches[0].atualizadoEmBase,'v1');assert.equal(estado.dados.nivel,2);assert.equal(estado.dados.xp,0);assert.equal(estado.dados.vida.atual,7);assert.equal(estado.dados.vida.temporaria,3);assert.equal(estado.dados.vida.maxima,32);assert.equal(estado.dados._mestre,undefined);assert.deepEqual(estado.dados.campoDesconhecido,{preservar:true});assert.equal(await page.locator('#evoluir').isDisabled(),true);assert.deepEqual(errors,[]);await context.close();testes++;}
    for(const falha of [409,500,'rede']) {const {page,context,estado}=await ambiente({fail:falha});await prontoGuia(page);await page.locator('#guia-confirmar').click();await page.waitForFunction(()=>document.querySelector('#guia-aviso').textContent.includes('Falha')||document.querySelector('#guia-aviso').textContent.includes('mudou'));assert.equal(estado.dados.nivel,1);assert.equal(estado.patches.length,1);const rascunho=await page.evaluate(id=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:'+id)),id);assert.equal(rascunho.dados.nivel,2);assert.equal(rascunho.base,'v1');assert.equal(rascunho.dados._mestre,undefined);assert.ok(!rascunho.baseSerial.includes('_mestre'));assert.equal(await page.locator('#guia-exportar').isEnabled(),true);await page.locator('#guia-fechar').click();assert.equal(estado.dados.vida.atual,7);await context.close();testes++;}
    {const {page,context,estado}=await ambiente({permitido:1});assert.equal(await page.locator('#evoluir').isDisabled(),true);assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context,estado}=await ambiente({local:true});await page.locator('#criar').click();await page.locator('#guia-conteudo [data-editar="nome"]').fill('Rascunho local');await page.locator('#guia-conteudo [data-editar="nome"]').dispatchEvent('change');await page.locator('#guia-fechar').click();await page.reload();await page.locator('#criar').click();assert.equal(await page.locator('#guia-conteudo [data-editar="nome"]').inputValue(),'Rascunho local');await page.locator('#guia-passos [data-passo="7"]').click();await page.locator('#guia-confirmar').click();assert.ok((await page.locator('#guia-aviso').textContent()).includes('Escolha'));assert.equal(estado.patches.length,0);await context.close();testes++;}
    {const {page,context}=await ambiente({mestre:true});await prontoGuia(page);await page.locator('#guia-fechar').click();await page.reload();await page.locator('#evoluir').click();await page.locator('#guia-confirmar').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Guia concluído'));const r=await page.evaluate(()=>JSON.parse(localStorage.getItem('hub_pf2_guia_v1:11111111-1111-4111-8111-111111111111')));assert.equal(r,null);await context.close();testes++;}
    {const {page,context}=await ambiente();await page.locator('[data-aba="opcoes"]').click();assert.equal(await page.locator('[data-escolha="talentos"][value="consulta"]').isDisabled(),true);await page.locator('[data-acao="detalhe"][data-valor="talentos:consulta"]').click();assert.ok((await page.locator('#detalhes-conteudo').textContent()).includes('ainda em revisão'));await page.locator('#detalhes-fechar').click();const texto=await page.evaluate(()=>{let impresso;window.print=()=>{impresso=document.querySelector('#ficha').textContent;};document.querySelector('#imprimir').click();return impresso;});assert.ok(texto.includes('Talento guerreiro inicial'));assert.ok(!texto.includes('Talento guerreiro avançado'));await context.close();testes++;}
    {const {page,context,estado,errors}=await ambiente();await page.locator('#quantidade-vida').fill('10');await page.locator('#dano-critico').check();await page.locator('[data-acao="dano"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.vida.atual,0);assert.equal(estado.dados.vida.temporaria,0);assert.equal(estado.dados.condicoes.find(c=>c.id==='morrendo').valor,2);await page.locator('#quantidade-vida').fill('5');await page.locator('[data-acao="curar"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.vida.atual,5);assert.equal(estado.dados.condicoes.find(c=>c.id==='ferido').valor,1);assert.ok(!estado.dados.condicoes.some(c=>c.id==='morrendo'));assert.deepEqual(errors,[]);await context.close();testes++;}
    {const curar={id:'curar',nome:'Curar',tipo:'magia',nivel:1,tradicoes:['divina'],efeitoCombate:{tipo:'cura',tipoCura:'vitalidade',ranqueBase:1,formulaBase:'1d8',ampliacao:{intervalo:1,formula:'1d8'},variantes:{'1':{formulaBase:'1d8'},'2':{formulaBase:'1d8+8',ampliacao:{intervalo:1,formula:'1d8+8'}}}}},caster={...classe,id:'clerigo',nome:'Clérigo',conjuracao:{tradicao:'divina',atributo:'sab',grau:1,truques:5,preparacao:'preparada',espacosPorNivel:[{nivel:1,espacos:{1:2}},{nivel:3,espacos:{1:3,2:2}}]}};
      const {page,context,estado,errors}=await ambiente({simulado:{base:{...base,classeId:'clerigo',nivel:3,_guiado:{concluido:false},magias:[{id:'curar',tipo:'magia'}],magiasPreparadas:{truques:[],padrao:{1:['curar','curar','curar'],2:['curar','curar']},curriculo:{}}},catalogo:{...catalogo,classes:[caster],magias:[curar]}}});await page.evaluate(()=>{Math.random=()=>0;});await page.locator('[data-acao="conjurar"][data-valor="curar"]').first().click();await page.locator('#conjurar-ranque').selectOption('padrao:2:0');await page.locator('#conjurar-acoes').selectOption('2');await page.locator('#conjurar-executar').click();assert.ok((await page.locator('#conjurar-resultado').textContent()).includes('Cura automática: 18'));assert.equal(await page.locator('#conjurar-executar').isDisabled(),true);await page.locator('#conjurar-aplicar').click();assert.equal(await page.locator('#conjurar-aplicar').isDisabled(),true);await page.locator('#conjurar-fechar').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.espacosGastos[2],1);assert.equal(estado.dados.vida.atual,25);await page.locator('[data-acao="recuperar-espacos"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.deepEqual(estado.dados.espacosGastos,{});assert.deepEqual(errors,[]);await context.close();testes++;}
    {const spell={id:'cura-foco',nome:'Cura de foco simulada',tipo:'foco',nivel:1,efeitoCombate:{tipo:'cura',tipoCura:'vitalidade',ranqueBase:1,formulaBase:'1d6',ampliacao:{intervalo:1,formula:'1d6'}}},caster={...classe,id:'campeao',nome:'Campeão',conjuracao:{tipo:'foco',tradicao:'divina',atributo:'car',grau:1,focoInicial:2},magiasConcedidas:[{id:'cura-foco',tipo:'foco',graduacao:1,nivelConcessao:1}]};
      const {page,context,estado,errors}=await ambiente({simulado:{base:{...base,classeId:'campeao',_guiado:{concluido:false},magias:[{id:spell.id,tipo:'foco'}]},catalogo:{...catalogo,classes:[caster],magias:[spell]}}});await page.evaluate(()=>{Math.random=()=>0;});await page.locator('[data-acao="conjurar"]').click();assert.equal(await page.locator('#conjurar-ranque').isDisabled(),true);await page.locator('#conjurar-executar').click();await page.locator('#conjurar-fechar').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.focoGasto,1);assert.equal(estado.dados.espacosGastos,undefined);await page.locator('[data-acao="refocar"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.focoGasto,0);assert.deepEqual(errors,[]);await context.close();testes++;}
    {const {page,context,estado,errors}=await ambiente();await page.locator('[data-aba="personagem"]').click();await page.locator('[data-editar="nome"]').fill('Nome confirmado');await page.locator('[data-editar="nome"]').dispatchEvent('change');await page.locator('[data-aba="sessao"]').click();await page.locator('#iniciativa-dado').fill('11');await page.locator('[data-acao="declarar-iniciativa"]').click();await page.waitForFunction(()=>document.querySelector('#aviso').textContent.includes('Iniciativa declarada'));assert.equal(estado.patches.length,1);assert.deepEqual(estado.iniciativas,[{resultado:17}]);assert.ok((await page.locator('#aviso').textContent()).includes('Nome confirmado'));assert.ok(!estado.buscas.some(url=>url.includes('campanha')));assert.deepEqual(errors,[]);await context.close();testes++;}
    {const a=await ambiente();await a.page.locator('[data-aba="personagem"]').click();await a.page.locator('[data-editar="_aparencia.tema"]').selectOption('azul');await a.page.locator('[data-editar="_aparencia.borda"]').fill('#aabbcc');await a.page.locator('[data-editar="_aparencia.borda"]').dispatchEvent('change');await a.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(a.estado.dados._aparencia.tema,'azul');assert.equal(a.estado.dados._aparencia.borda,'#aabbcc');await a.page.reload();await a.page.waitForFunction(()=>document.documentElement.style.getPropertyValue('--borda')==='#aabbcc');const b=await ambiente({fichaId:'22222222-2222-4222-8222-222222222222',simulado:{base:{...base,_aparencia:{tema:'verde',campoExistente:'preservado'}},catalogo}});assert.equal(await b.page.evaluate(()=>document.documentElement.style.getPropertyValue('--fundo')),'#0c1915');assert.equal(b.estado.dados._aparencia.tema,'verde');assert.equal(b.estado.patches.length,0);await a.context.close();await b.context.close();testes++;}
    {const potion={id:'pocao-teste',nome:'Poção de teste',tipo:'consumivel',volume:'L',mecanica:{acao:'curar',cura:{expressao:'1d8+1'},consomeQuantidade:1}},inv={...base,equipamentos:[{id:'pocao-teste',quantidade:2,anotacao:'preservar'}]};const {page,context,estado,errors}=await ambiente({simulado:{base:inv,catalogo:{...catalogo,equipamentos:[potion]}}});await page.evaluate(()=>{Math.random=()=>0;});await page.locator('[data-aba="opcoes"]').click();for(let i=0;i<2;i++){await page.locator('[data-acao="consumir-item"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');}assert.equal(estado.dados.equipamentos[0].quantidade,0);assert.equal(estado.dados.equipamentos[0].anotacao,'preservar');assert.equal(estado.dados.vida.atual,11);assert.equal(await page.locator('[data-acao="consumir-item"]').count(),0);assert.deepEqual(errors,[]);await context.close();const leitor=await ambiente({readonly:true,simulado:{base:{...inv,_aparencia:{tema:'roxo'}},catalogo:{...catalogo,equipamentos:[potion]}}});await leitor.page.locator('[data-aba="opcoes"]').click();assert.equal(await leitor.page.locator('[data-acao="consumir-item"]').isDisabled(),true);await leitor.page.locator('[data-aba="personagem"]').click();assert.equal(await leitor.page.locator('[data-editar="_aparencia.tema"]').isDisabled(),true);assert.equal(leitor.estado.patches.length,0);await leitor.context.close();testes++;}
    {const turnoBase={...base,condicoes:[{id:'assustado',valor:2},{id:'desacelerado',valor:1}],danosPersistentes:[{id:'fogo',tipo:'fogo',formula:'1d4',cdRecuperacao:15,critico:true,multiplicador:2}]};const {page,context,estado,errors}=await ambiente({simulado:{base:turnoBase,catalogo}});await page.evaluate(()=>{Math.random=()=>0;});await page.locator('[data-acao="iniciar-turno"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.turno.acoesGerais,2);await page.locator('[data-acao="iniciar-turno"]').click();assert.equal(estado.patches.length,1);await page.locator('[data-acao="finalizar-turno"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.turno.encerrado,true);assert.equal(estado.dados.vida.temporaria,1);assert.equal(estado.dados.condicoes.find(c=>c.id==='assustado').valor,1);assert.equal(estado.dados._ultimoTurnoSnapshot._mestre,undefined);assert.equal(estado.dados._ultimoTurnoSnapshot._ultimoTurnoSnapshot,undefined);await page.locator('[data-acao="iniciar-turno"]').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');assert.equal(estado.dados.turno.encerrado,false);assert.deepEqual(errors,[]);await context.close();testes++;}
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
      await equipado.page.evaluate(()=>{crypto.getRandomValues=bytes=>{bytes.fill(19);return bytes;};Math.random=()=>0;});
      await equipado.page.locator('[data-acao="ataque"][data-valor="1"]').click();
      assert.ok((await equipado.page.locator('#rolagem-contexto').textContent()).includes('+'+(valores.ataque-4)));
      await equipado.page.locator('#rolagem-cd').fill('10');await equipado.page.locator('#rolagem-rolar').click();
      assert.ok((await equipado.page.locator('#rolagem-resultado').textContent()).includes('Sucesso crítico'));
      await equipado.page.locator('#rolagem-dano').click();assert.ok((await equipado.page.locator('#rolagem-resultado').textContent()).includes('(2d4+4)*2'));
      await equipado.page.locator('#rolagem-fechar').click();assert.deepEqual(equipado.errors,[]);await equipado.context.close();testes++;
      // A fonte PC1 completa pode ser atualizada antes dos índices gerados pelo build.
      // Este cenário usa regras reais e API simulada; os demais cenários reais validam a API canônica.
      const fonteEscudo=JSON.parse(await fs.readFile(path.join(raiz,'pathfinder/player-core.json'),'utf8'));
      const catalogoEscudo=Object.fromEntries(Object.keys(combinado).map(tipo=>[tipo,[...(fonteEscudo[tipo]||[]),...(pc2[tipo]||[]),...(gm[tipo]||[])]]));
      const bloqueio=await ambiente({simulado:{catalogo:catalogoEscudo,base:R.normalizar({...primeiraFichaReal,escudoId:'escudo-de-aco',escudoErguido:true,vida:{...primeiraFichaReal.vida,temporaria:0}},catalogoEscudo)}});
      assert.ok(await bloqueio.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Bloqueio com Escudo deve caber na tela móvel.');
      await bloqueio.page.locator('[data-acao="iniciar-turno"]').click();await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      await bloqueio.page.locator('#quantidade-vida').fill('10');await bloqueio.page.locator('#dano-tipo').selectOption('cortante');await bloqueio.page.locator('#dano-ataque').check();
      await bloqueio.page.locator('[data-acao="bloquear-escudo"]').click();await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
      assert.equal(bloqueio.estado.dados.escudoPv,15);assert.equal(bloqueio.estado.dados.vida.atual,15);assert.equal(bloqueio.estado.dados.turno.reacoes,0);assert.equal(bloqueio.estado.dados.escudoQuebrado,false);
      const quantidadePatches=bloqueio.estado.patches.length;await bloqueio.page.locator('#dano-ataque').check();await bloqueio.page.locator('[data-acao="bloquear-escudo"]').click();await bloqueio.page.waitForTimeout(650);assert.equal(bloqueio.estado.patches.length,quantidadePatches,'Reação já gasta não deve bloquear novamente.');
      await bloqueio.page.locator('[data-acao="finalizar-turno"]').click();await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');await bloqueio.page.locator('[data-acao="iniciar-turno"]').click();await bloqueio.page.waitForFunction(()=>document.querySelector('#status').textContent==='Salvo ✓');
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
      await clerigo.page.locator('#guia-passos [data-passo="6"]').click();
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
        if(classeReal.conjuracao){const card=tela.page.locator('.card').filter({has:tela.page.locator('h2', {hasText:'Conjuração automática'})});assert.equal(await card.count(),1,classeReal.id+' deve oferecer painel de conjuração.');assert.ok((await card.textContent()).includes(String(calculado.cdMagia)));if(classeReal.conjuracao.tipo!=='foco')assert.ok(Object.keys(calculado.conjuracao.espacos).length>0,classeReal.id+' deve calcular espaços automaticamente.');}
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
    console.log(`PASS ${testes} cenários de navegador: leitura, cancelamento, retomada, aplicação única, versão, falhas, autorização, escolhas pendentes, segredos, consulta, impressão, equipamento, combate e conjuração automática.`);
  } finally {await browser.close();}
})().catch(erro=>{console.error(erro);process.exitCode=1;});
