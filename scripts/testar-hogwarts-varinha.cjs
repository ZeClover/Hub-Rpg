/* eslint-disable @typescript-eslint/no-require-imports -- smoke isolado com APIs simuladas. */
const {chromium}=require(process.env.PLAYWRIGHT_CORE||'playwright-core');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const raiz=path.resolve(__dirname,'../public'),fichaId='11111111-1111-4111-8111-111111111111';
const familia={id:'33333333-3333-4333-8333-333333333333',chave:'scamander',nome:'Scamander',tipo:'Canônica',condicaoFinanceira:'Confortável',tags:['Naturalista'],conteudoFamiliar:'Olho de Criador',acessoFamiliar:'Rede de Criadores',herancas:['Legado dos Criadores','Confiança Conquistada','Guardião de Criaturas'],segredos:[]};
const base={perfil:{nome:'Eiris',sobrenome:'Scamander',casa:'Lufa-Lufa',tradicao:'Mãos Cuidadosas',statusSangue:'Mestiço',familiaId:'scamander',origemId:''},nivel:1,atributos:{Arcano:3,Engenho:2,Pulso:2,Presença:1,Fibra:0},pericias:{Feitiços:1,Herbologia:1,Voo:1},conteudosConhecidos:{},academico:{criacaoVersao:1,criacaoFinalizada:true,formacaoInicialConcluida:true,materias:{'Feitiços':{cursando:true,progresso:1}},notas:[],extrasPorAno:{}},varinha:{madeira:'',nucleo:'',comprimento:'',flexibilidade:'',sintonia:1,entregue:false,revelados:[]},vida:{atual:5,maxima:5},tensao:0,galeoes:0};

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const estado={dados:structuredClone(base),acoes:[],herancaNivel:0};
  async function abrir({mestre,viewport}){
    const context=await browser.newContext({viewport}),page=await context.newPage(),erros=[],falhas=[];
    page.on('pageerror',e=>erros.push(e.message));page.on('requestfailed',r=>falhas.push(`${r.method()} ${r.url()}: ${r.failure()?.errorText||'falhou'}`));
    await page.route('https://hogwarts.local/**',async route=>{
      const url=new URL(route.request().url()),req=route.request();
      if(url.pathname===`/api/personagens/${fichaId}`){if(req.method()==='PATCH')estado.dados=req.postDataJSON().dados;return route.fulfill({contentType:'application/json',body:JSON.stringify({personagem:{id:fichaId,nome:'Eiris Scamander',dados:mestre?estado.dados:{...estado.dados,_mestre:undefined},podeEditar:true,ehDono:!mestre,ehMestre:mestre,campanhaId:'22222222-2222-4222-8222-222222222222'}})});}
      if(url.pathname===`/api/personagens/${fichaId}/hogwarts-conteudos`)return route.fulfill({contentType:'application/json',body:JSON.stringify({conteudos:[{slug:'sonorus-quietus',nome:'Sonorus / Quietus',pericia:'Feitiços',atributo_padrao:'Arcano',efeito:'Amplifica a voz.',estado:estado.dados.conteudosConhecidos['sonorus-quietus']||'disponivel'}],selecaoInicialPendente:false,selecionadosIniciais:[]})});
      if(url.pathname===`/api/personagens/${fichaId}/hogwarts-descobertas`)return route.fulfill({contentType:'application/json',body:JSON.stringify({eventos:[],revisao:null})});
      if(url.pathname===`/api/personagens/${fichaId}/hogwarts-familia`&&req.method()==='GET')return route.fulfill({contentType:'application/json',body:JSON.stringify({familias:[familia],familia,herancaNivel:estado.herancaNivel,ehMestre:mestre})});
      if(url.pathname===`/api/personagens/${fichaId}/hogwarts-familia`&&req.method()==='POST'){const corpo=req.postDataJSON();if(corpo.acao==='avancar-heranca')estado.herancaNivel++;return route.fulfill({contentType:'application/json',body:'{"ok":true}'});}
      if(url.pathname===`/api/personagens/${fichaId}/hogwarts-varinha`&&req.method()==='POST'){
        const corpo=req.postDataJSON();estado.acoes.push(corpo);
        if(corpo.acao==='entregar'){estado.dados.varinha={...corpo.varinha,sintonia:1,entregue:true,revelados:[]};estado.dados._mestre={varinha:{tendencia:corpo.varinha.tendencia,propriedade:corpo.varinha.propriedade,peculiaridade:corpo.varinha.peculiaridade,lealdade:corpo.varinha.lealdade}};}
        if(corpo.acao==='avancar-sintonia')estado.dados.varinha.sintonia++;
        if(corpo.acao==='revelar'){estado.dados.varinha.revelados.push(corpo.campo);estado.dados.varinha[corpo.campo]=estado.dados._mestre.varinha[corpo.campo];}
        return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,varinha:estado.dados.varinha})});
      }
      if(url.pathname===`/api/personagens/${fichaId}/hogwarts-academico`&&req.method()==='POST'){
        if(!mestre)return route.fulfill({status:403,contentType:'application/json',body:'{"erro":"Somente o Mestre"}'});
        const c=req.postDataJSON(),academico=estado.dados.academico;
        if(c.acao==='progresso')academico.materias[c.materia].progresso=Math.max(0,academico.materias[c.materia].progresso+c.delta);
        if(c.acao==='nota')academico.notas.push({id:'nota-1',...c});
        if(c.acao==='extra'){academico.materias[c.materia].progresso-=2;academico.extrasPorAno['1']=1;estado.dados.conteudosConhecidos[c.slug]='conhecido';}
        return route.fulfill({contentType:'application/json',body:'{"ok":true}'});
      }
      if(url.pathname.startsWith('/api/'))return route.fulfill({contentType:'application/json',body:'{}'});
      try{return route.fulfill({contentType:'text/html',body:await fs.readFile(path.join(raiz,url.pathname))});}catch{return route.fulfill({status:404,body:'não encontrado'});}
    });
    await page.goto(`https://hogwarts.local/hogwarts-rpg.html?id=${fichaId}`);await page.locator('#app').waitFor();
    try{await page.waitForFunction(()=>document.querySelector('[data-campo="perfil.nome"]')?.value==='Eiris',null,{timeout:5000});}
    catch{const resumo=(await page.locator('#app').textContent()||'').replace(/\s+/g,' ').slice(0,500);throw new Error(`Ficha não carregou. App: ${resumo}\nErros: ${erros.join(' | ')||'nenhum'}\nFalhas: ${falhas.join(' | ')||'nenhuma'}`);}
    return {context,page,erros};
  }
  try{
    const mestre=await abrir({mestre:true,viewport:{width:1365,height:900}});
    await mestre.page.locator('#varinhaMadeira').fill('Azevinho');await mestre.page.locator('#varinhaNucleo').fill('Pena de fênix');await mestre.page.locator('#varinhaComprimento').fill('28 cm');await mestre.page.locator('#varinhaFlexibilidade').fill('Flexível');await mestre.page.locator('#varinhaTendencia').fill('Protetora');await mestre.page.locator('[data-varinha-entregar]').click();await mestre.page.waitForFunction(()=>document.querySelector('#varinhaMadeira')?.value==='Azevinho');
    await mestre.page.locator('[data-varinha-sintonia]').click();await mestre.page.waitForFunction(()=>document.querySelector('#varinhaSintonia')?.value==='2');await mestre.page.locator('[data-varinha-revelar="tendencia"]').click();await mestre.page.waitForFunction(()=>document.querySelector('[data-varinha-revelar="tendencia"]')?.disabled===true);
    assert.deepEqual(estado.acoes.map(a=>a.acao),['entregar','avancar-sintonia','revelar']);assert.equal(estado.dados._mestre?.varinha?.tendencia,'Protetora',JSON.stringify(estado.acoes[0]));assert.equal(estado.dados.varinha.tendencia,'Protetora');assert.deepEqual(mestre.erros,[]);
    await mestre.page.locator('#btAparencia').click();await mestre.page.locator('#pa-tema').selectOption('floresta');assert.equal(await mestre.page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--fundo').trim()),'#07100b');
    await mestre.page.waitForFunction(()=>document.querySelector('#statusSalvo')?.textContent?.includes('Salvo')||(!debounceHub&&!salvandoHub));
    await mestre.page.getByRole('button',{name:'Casa & Família'}).click();assert.ok((await mestre.page.locator('#app').textContent()).includes('Olho de Criador'));await mestre.page.locator('[data-avancar-heranca]').click();await mestre.page.waitForFunction(()=>document.querySelector('#app')?.textContent?.includes('✓ 1'));
    assert.equal(await mestre.page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--fundo').trim()),'#07100b','Estilo deve sobreviver à atualização familiar.');
    await fs.mkdir(path.resolve(__dirname,'../artifacts/hogwarts-revisao'),{recursive:true});await mestre.page.screenshot({path:path.resolve(__dirname,'../artifacts/hogwarts-revisao/familia-mestre-desktop.png'),fullPage:true});await mestre.page.getByRole('button',{name:'Acadêmico',exact:true}).click();
    await mestre.page.locator('[data-mat-prog-inc="Feitiços"]').click();await mestre.page.locator('[data-extra-academico="Feitiços"]').waitFor();
    await mestre.page.locator('[data-extra-materia="Feitiços"]').selectOption('sonorus-quietus');await mestre.page.locator('[data-extra-academico="Feitiços"]').click();await mestre.page.waitForFunction(()=>document.querySelector('#app')?.textContent?.includes('1 / 2 extras'));
    await mestre.page.locator('#novaNotaComentario').fill('Participou da aula');await mestre.page.locator('[data-add-nota]').click();await mestre.page.waitForFunction(()=>document.querySelector('#app')?.textContent?.includes('Participou da aula'));
    await mestre.page.screenshot({path:path.resolve(__dirname,'../artifacts/hogwarts-revisao/academico-mestre-desktop.png'),fullPage:true});assert.deepEqual(mestre.erros,[]);await mestre.context.close();
    const jogador=await abrir({mestre:false,viewport:{width:390,height:844}});assert.equal(await jogador.page.locator('[data-varinha-entregar]').count(),0);assert.equal(await jogador.page.locator('#varinhaMadeira').getAttribute('readonly'),'');
    const textoJogador=await jogador.page.locator('#app').textContent();
    assert.ok(textoJogador.includes('Protetora'),`Revelação ausente: ${textoJogador.replace(/\s+/g,' ').slice(-500)}`);assert.ok(!textoJogador.includes('Propriedade Desperta: Luz firme'));assert.deepEqual(jogador.erros,[]);await jogador.page.screenshot({path:path.resolve(__dirname,'../artifacts/hogwarts-revisao/varinha-jogador-celular.png'),fullPage:true});await jogador.context.close();
    const jogadorFamilia=await abrir({mestre:false,viewport:{width:390,height:844}});await jogadorFamilia.page.getByRole('button',{name:'Casa & Família'}).click();assert.equal(await jogadorFamilia.page.locator('[data-avancar-heranca]').count(),0);assert.equal(await jogadorFamilia.page.locator('[data-familia-compartilhada]').isDisabled(),true);assert.ok((await jogadorFamilia.page.locator('#app').textContent()).includes('Olho de Criador'));await jogadorFamilia.page.screenshot({path:path.resolve(__dirname,'../artifacts/hogwarts-revisao/familia-jogador-celular.png'),fullPage:true});assert.deepEqual(jogadorFamilia.erros,[]);await jogadorFamilia.page.getByRole('button',{name:'Acadêmico',exact:true}).click();assert.equal(await jogadorFamilia.page.locator('[data-add-nota]').count(),0);assert.equal(await jogadorFamilia.page.locator('[data-mat-prog-inc="Feitiços"]').isDisabled(),true);assert.ok((await jogadorFamilia.page.locator('#app').textContent()).includes('Participou da aula'));await jogadorFamilia.page.screenshot({path:path.resolve(__dirname,'../artifacts/hogwarts-revisao/academico-jogador-celular.png'),fullPage:true});await jogadorFamilia.context.close();
    console.log('PASS 5 fluxos Hogwarts: acadêmico do Mestre e consulta do jogador; varinha entregue e revelada; família compartilhada e Herança; estilo preservado e jogador sem controles de mestre.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
