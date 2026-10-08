/* Pathfinder 2e Remaster: apresentação, rascunho independente e salvamento com versão.
 * Regras permanecem em HubPF2Regras. Nenhuma busca de campanha ou segredo em exportações. */
(() => {
  'use strict';
  const R = window.HubPF2Regras;
  const Combate=()=>window.HubPF2Combate;
  let testeAtual=null;
  const $ = seletor => document.querySelector(seletor);
  const parametros = new URLSearchParams(location.search);
  const id = parametros.get('id');
  const nomesAtributos = { for:'Força', des:'Destreza', con:'Constituição', int:'Inteligência', sab:'Sabedoria', car:'Carisma' };
  const nomesPericias = { acrobacia:'Acrobatismo', arcanismo:'Arcanismo', atletismo:'Atletismo', enganacao:'Dissimulação', diplomacia:'Diplomacia', intimidacao:'Intimidação', manufatura:'Manufatura', medicina:'Medicina', natureza:'Natureza', ocultismo:'Ocultismo', performance:'Performance', religiao:'Religião', sociedade:'Sociedade', furtividade:'Furtividade', sobrevivencia:'Sobrevivência', ladroagem:'Ladroagem' };
  const nomesGraus = ['Destreinado','Treinado','Especialista','Mestre','Lendário'];
  const nomesSalvaguardas = { fortitude:'Fortitude', reflexos:'Reflexos', vontade:'Vontade' };
  const etapas = ['Identidade','Ancestralidade','Biografia','Classe','Incrementos','Perícias','Opções e equipamento','Revisão'];
  let ficha, catalogo, versao, localId, progressaoPermitida, guia;
  let podeEditar=false, ehMestre=false, aba='sessao', pendente=false, enviando=false, conflito=false, renderizando=false, timer, salvamento;
  const copiar = valor => structuredClone(valor);
  const escapar = valor => String(valor??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chave = tipo => `hub_pf2_${tipo}_v1:${id||localId}`;
  function avisar(texto) { $('#aviso').textContent=texto; }
  // Remover um campo focado pode disparar change/blur sincronamente. A renderização não deve iniciar outra edição.
  function escreverHTML(elemento,html) { const anterior=renderizando;renderizando=true;try{elemento.innerHTML=html;}finally{renderizando=anterior;} }
  function guardar(nome,valor) { try { localStorage.setItem(nome,JSON.stringify(valor)); return true; } catch { avisar('O navegador não conseguiu guardar o rascunho. Exporte sua ficha antes de fechar.'); return false; } }
  function ler(nome) { try { return JSON.parse(localStorage.getItem(nome)); } catch { return null; } }
  function remover(nome) { try { localStorage.removeItem(nome); } catch { /* A versão impede reaplicar um rascunho antigo. */ } }
  function semSegredos(valor) {
    const resultado=copiar(valor);
    for(const nome of ['_mestre','ehMestre','ehDono','podeEditar','campanhaId','usuarioId','donoId','id']) delete resultado[nome];
    return resultado;
  }
  function dadosSalvar(valor) { const resultado=copiar(valor); if(!ehMestre) delete resultado._mestre; return resultado; }
  function serialBase() { return JSON.stringify(semSegredos(ficha)); }
  function guardarRecuperacao() { if(id&&podeEditar) guardar(chave('recuperacao'),{versao,dados:semSegredos(ficha)}); }
  function registro(tipo,identificador) { return (catalogo[tipo]||[]).find(item=>item.id===identificador); }
  function classe(dados) { return registro('classes',dados.classeId); }
  function opcao(dados) { return classe(dados)?.opcoes?.find(item=>item.id===dados.opcaoClasseId); }
  function atributosChave(dados) { return opcao(dados)?.atributoChave||classe(dados)?.atributoChave||[]; }
  function atualizarServidor(personagem) {
    if(!personagem?.atualizadoEm) throw new Error('O servidor não confirmou a versão salva. Preserve o rascunho antes de recarregar.');
    versao=personagem.atualizadoEm;
    progressaoPermitida=personagem.progressaoPermitida||progressaoPermitida;
    if(!personagem.dados) throw new Error('O servidor não confirmou os dados calculados. Recarregue para conferir o salvamento; o rascunho foi preservado.');
    return R.normalizar(personagem.dados,catalogo);
  }
  async function conferirOperacao(operacao,base) {
    const resposta=await fetch('/api/personagens/'+encodeURIComponent(id));
    if(!resposta.ok) throw new Error('Não foi possível conferir a versão da ficha. O guia continua salvo neste navegador.');
    const corpo=await resposta.json(), personagem=corpo.personagem;
    if(personagem?.dados?._operacaoGuiada===operacao) return atualizarServidor(personagem);
    if(personagem?.atualizadoEm!==base) { conflito=true; throw new Error('A ficha mudou em outra aba ou pela mesa. Exporte o rascunho antes de recarregar; o guia não será aplicado sobre outra versão.'); }
    return null;
  }
  async function persistir(novosDados,base,operacao) {
    if(!podeEditar) throw new Error('Esta ficha está em modo leitura.');
    if(!id) {
      if(!guardar(chave('ficha'),dadosSalvar(novosDados))) throw new Error('Não foi possível salvar neste navegador. Exporte o rascunho.');
      versao='local:'+JSON.stringify(novosDados);
      return copiar(novosDados);
    }
    if(operacao) { const jaSalvo=await conferirOperacao(operacao,base); if(jaSalvo) return jaSalvo; }
    let resposta;
    try {
      resposta=await fetch('/api/personagens/'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({dados:dadosSalvar(novosDados),atualizadoEmBase:base})});
    } catch {
      if(operacao) {
        try { const salvo=await conferirOperacao(operacao,base); if(salvo) return salvo; }
        catch(erro) { if(conflito) throw erro; }
      }
      throw new Error('Falha de conexão. O rascunho permanece salvo. Confira a ficha antes de tentar novamente.');
    }
    if(resposta.status===409||resposta.status===428) { conflito=true; throw new Error('A ficha mudou em outra aba ou pela mesa. Exporte o rascunho antes de recarregar.'); }
    if(!resposta.ok) {
      let mensagem='Não foi possível salvar ('+resposta.status+').';
      try { mensagem=(await resposta.json()).erro||mensagem; } catch { /* Mensagem HTTP é suficiente. */ }
      throw new Error(mensagem);
    }
    return atualizarServidor((await resposta.json()).personagem);
  }
  async function salvarAgora() {
    clearTimeout(timer); timer=null;
    if(!podeEditar||!pendente) return !conflito;
    if(salvamento) { await salvamento; return salvarAgora(); }
    if(conflito) { avisar('Conflito de versão: exporte seu rascunho antes de recarregar.'); return false; }
    const snapshot=copiar(ficha), serial=JSON.stringify(snapshot);
    enviando=true; $('#status').textContent='Salvando…';
    salvamento=(async()=>{
      try {
        const salva=await persistir(snapshot,versao);
        if(JSON.stringify(ficha)===serial) { ficha=salva; pendente=false; remover(chave('recuperacao')); renderizar(); }
        $('#status').textContent=pendente?'Alterações aguardando salvamento':'Salvo ✓';
        return true;
      } catch(erro) {
        guardarRecuperacao(); $('#status').textContent=conflito?'Conflito · rascunho preservado':'Falha · rascunho preservado'; avisar(erro.message); return false;
      } finally { enviando=false; salvamento=null; }
    })();
    const sucesso=await salvamento;
    if(sucesso&&pendente) return salvarAgora();
    return sucesso;
  }
  function salvar() {
    if(!podeEditar||guia) return;
    ficha=R.normalizar(ficha,catalogo); pendente=true; guardarRecuperacao();
    $('#status').textContent='Alterações aguardando salvamento';
    clearTimeout(timer); timer=setTimeout(salvarAgora,550); atualizarResumo();
  }
  function valor(dados,caminho) { return caminho.split('.').reduce((atual,nome)=>atual?.[nome],dados); }
  function definir(dados,caminho,novoValor) {
    const partes=caminho.split('.');
    if(partes.some(nome=>['__proto__','constructor','prototype'].includes(nome))) return;
    let atual=dados;
    for(const nome of partes.slice(0,-1)) {
      if(!atual[nome]||typeof atual[nome]!=='object') {
        if(nome==='escolhasClasse'&&typeof atual[nome]==='string') dados.escolhasClasseNotas=atual[nome];
        atual[nome]={};
      }
      atual=atual[nome];
    }
    atual[partes.at(-1)]=novoValor;
  }
  function campo(dados,rotulo,caminho,tipo='text',opcoes={}) {
    const atual=valor(dados,caminho), atributos=`data-editar="${escapar(caminho)}" ${opcoes.min!==undefined?`min="${opcoes.min}"`:''} ${opcoes.max!==undefined?`max="${opcoes.max}"`:''}`;
    if(tipo==='select') return `<label>${escapar(rotulo)}<select ${atributos}>${(opcoes.valores||[]).map(([id,nome])=>`<option value="${escapar(id)}" ${String(atual)===String(id)?'selected':''}>${escapar(nome)}</option>`).join('')}</select></label>`;
    if(tipo==='textarea') return `<label>${escapar(rotulo)}<textarea ${atributos}>${escapar(atual)}</textarea></label>`;
    if(tipo==='checkbox') return `<label class="check"><input type="checkbox" ${atributos} ${atual?'checked':''}>${escapar(rotulo)}</label>`;
    return `<label>${escapar(rotulo)}<input ${atributos} type="${tipo}" value="${escapar(atual)}"></label>`;
  }
  const botao=(texto,acao,identificador='',tipo='')=>`<button type="button" class="${tipo}" data-acao="${acao}" data-valor="${escapar(identificador)}">${escapar(texto)}</button>`;
  const opcoesLista=lista=>[['','Escolha uma opção'],...(lista||[]).map(item=>[item.id,item.nome])];
  function resumo(item) { return Array.isArray(item?.resumo)?item.resumo.join(' '):item?.resumo||''; }
  function fonte(item) { return `${item.fonte?.nome||item.fonte||''}${item.pagina?' · p. '+item.pagina:''}`; }
  function textoRevisao(item) { return item.revisao==='texto-original-pt-indexado'||item.revisao==='indexado'?'Trecho indexado da fonte em português, ainda em revisão. Pode incluir blocos vizinhos; confira a página indicada.':''; }
  function descricaoOpcao(item) {
    if(!item) return '';
    return `<details><summary>${escapar(item.nome)} · ver efeito</summary>${textoRevisao(item)?'<p class="aviso">'+escapar(textoRevisao(item))+'</p>':''}<p>${escapar(resumo(item))}</p><div class="texto-integral">${escapar(item.descricao||item.texto||'Texto desta referência ainda em revisão.')}</div></details>`;
  }
  function ajuda(tipo,identificador) {
    const item=registro(tipo,identificador);
    return item?`<p class="mini">${escapar(resumo(item))}</p>${botao('Ver o que '+item.nome+' faz','detalhe',tipo+':'+identificador)}`:'';
  }
  function escolhasHeranca(dados) {
    const ancestral=registro('ancestralidades',dados.ancestralidadeId),h=[...(ancestral?.herancas||[]),...(catalogo.herancasVersateis||[])].find(item=>item.id===dados.herancaId);
    return h?.periciasEscolha?.length?campo(dados,'Perícia concedida pela herança','escolhasHeranca.pericia','select',{valores:[['','Escolha'],...h.periciasEscolha.map(nome=>[nome,nomesPericias[nome]||nome])]}):'';
  }
  function escolhasBiografia(dados) {
    const bio=registro('biografias',dados.biografiaId);
    return bio?.periciasEscolha?.length?campo(dados,'Perícia da biografia','escolhasBiografia.pericia','select',{valores:[['','Escolha'],...bio.periciasEscolha.map(nome=>[nome,nomesPericias[nome]||nome])]}):'';
  }
  function escolhasClasse(dados) {
    let html=''; const classeAtual=classe(dados), especializacao=opcao(dados);
    if(classeAtual?.periciasEscolha?.length) html+=campo(dados,'Perícia inicial da classe','escolhasClasse.periciaInicial','select',{valores:[['','Escolha'],...classeAtual.periciasEscolha.map(nome=>[nome,nomesPericias[nome]||nome])]});
    if(especializacao?.periciasEscolha?.length) html+=campo(dados,'Perícia da especialização','escolhasClasse.periciaEspecializacao','select',{valores:[['','Escolha'],...especializacao.periciasEscolha.map(nome=>[nome,nomesPericias[nome]||nome])]});
    for(const ganho of classeAtual?.progressao||[]) {
      const escolha=ganho.escolhaProficiencia;
      if(escolha&&ganho.nivel<=dados.nivel) html+=campo(dados,ganho.nome+' · nível '+ganho.nivel,'escolhasClasse.'+escolha.id,'select',{valores:[['','Escolha'],...escolha.opcoes.map(nome=>[nome,nomesSalvaguardas[nome]||nomesPericias[nome]||nome])]});
    }
    if(especializacao?.periciaSaberEscolha)html+=campo(dados,'Saber concedido pela especialização · nome','escolhasClasse.periciaSaber');
    if((dados.talentos||[]).some(t=>t.id==='monge-magias-qi'))html+=campo(dados,'Tradição das magias de qi','escolhasClasse.tradicaoQi','select',{valores:[['','Escolha'],['divina','Divina'],['ocultista','Ocultista']]});
    const fonteDivina=classeAtual?.conjuracao?.fonteDivina;if(fonteDivina?.opcoes?.length)html+=campo(dados,'Fonte divina','escolhasClasse.fonteDivina','select',{valores:[['','Escolha'],...fonteDivina.opcoes.map(nome=>[nome,nome==='curar'?'Curar':'Ferir'])]});
    const extras=typeof R.escolhasExtras==='function'?R.escolhasExtras(dados,catalogo):[...(classeAtual?.escolhasExtras||[]),...(especializacao?.escolhasExtras||[]),...(dados.talentos||[]).flatMap(t=>registro('talentos',t.id)?.escolhasExtras||[])];
    for(const escolha of extras)if(escolha.nivel<=dados.nivel){html+=campo(dados,escolha.nome+' · nível '+escolha.nivel,'escolhasClasse.'+escolha.id,'select',{valores:[['','Escolha'],...(escolha.opcoes||[]).map(nome=>[typeof nome==='object'?nome.id:nome,typeof nome==='object'?nome.nome:nome])]});const selecionada=(escolha.opcoes||[]).find(r=>typeof r==='object'&&r.id===dados.escolhasClasse?.[escolha.id]);if(selecionada)html+=descricaoOpcao(selecionada);if(escolha.id==='divindade')html+=ajuda('divindades',dados.escolhasClasse?.divindade);}
    const divindade=(extras.find(e=>e.id==='divindade')?.opcoes||[]).find(e=>typeof e==='object'&&e.id===dados.escolhasClasse?.divindade);
    const concedeDominio=[classeAtual,especializacao,...(dados.talentos||[]).map(t=>registro('talentos',t.id))].some(r=>r?.concedeDominio);
    if(concedeDominio&&divindade?.dominios?.length&&!extras.some(e=>e.id==='dominio'))html+=campo(dados,'Domínio concedido pela divindade','escolhasClasse.dominio','select',{valores:[['','Escolha'],...divindade.dominios.map(id=>[id,registro('dominios',id)?.nome||id])]});
    return html?'<section class="card"><h2>Escolhas de classe e talentos</h2><div class="grade">'+html+'</div></section>':'';
  }
  function camposIdentidade(dados) {
    const ancestral=registro('ancestralidades',dados.ancestralidadeId), atualClasse=classe(dados);
    const herancas=[...(ancestral?.herancas||[]),...(catalogo.herancasVersateis||[])];
    return `<section class="card"><h2>Identidade</h2><div class="grade">${campo(dados,'Nome do personagem','nome')}${ehMestre||!id?campo(dados,'Experiência (XP)','xp','number',{min:0}):'<div><h3>Experiência</h3><p>'+escapar(dados.xp||0)+' XP · controlada pelo mestre.</p></div>'}${ehMestre?campo(dados,'Nível autorizado pelo mestre','_mestre.pathfinder.nivelAutorizado','number',{min:dados.nivel,max:20}):''}${campo(dados,'Ancestralidade','ancestralidadeId','select',{valores:opcoesLista(catalogo.ancestralidades)})}${campo(dados,'Herança','herancaId','select',{valores:opcoesLista(herancas)})}${campo(dados,'Biografia','biografiaId','select',{valores:opcoesLista(catalogo.biografias)})}${campo(dados,'Classe','classeId','select',{valores:opcoesLista(catalogo.classes)})}${campo(dados,'Especialização','opcaoClasseId','select',{valores:opcoesLista(atualClasse?.opcoes)})}${campo(dados,'Atributo-chave','atributoChave','select',{valores:[['','Escolha'],...atributosChave(dados).map(nome=>[nome,nomesAtributos[nome]])]})}</div>${descricaoOpcao(herancas.find(item=>item.id===dados.herancaId))}${escolhasHeranca(dados)}${descricaoOpcao(opcao(dados))}${ajuda('ancestralidades',dados.ancestralidadeId)}${ajuda('biografias',dados.biografiaId)}${escolhasBiografia(dados)}${ajuda('classes',dados.classeId)}<p class="mini">O botão Evoluir altera o nível. Trocar classe ou ancestralidade exige revisar as escolhas dependentes.</p></section>`;
  }
  function incrementos(dados,lote,titulo,permitidos=Object.keys(nomesAtributos)) {
    const escolhidos=valor(dados,'incrementos.'+lote)||[];
    return `<section class="item"><h3>${escapar(titulo)}</h3><div class="grade">${permitidos.map(nome=>`<label class="check"><input type="checkbox" data-incremento="${lote}" value="${nome}" ${escolhidos.includes(nome)?'checked':''}>${nomesAtributos[nome]}</label>`).join('')}</div></section>`;
  }
  function camposAtributos(dados) {
    const calculo=R.calcular(dados,catalogo), ancestral=registro('ancestralidades',dados.ancestralidadeId), bio=registro('biografias',dados.biografiaId);
    return `<section class="card"><h2>Atributos · modificadores</h2><div class="grade seis">${Object.entries(nomesAtributos).map(([nome,rotulo])=>`<div><h3>${rotulo}</h3><span class="numero">${calculo.atributos[nome]>=0?'+':''}${calculo.atributos[nome]}</span>${calculo.incrementosParciais?.[nome]?'<p class="mini">Meio incremento registrado.</p>':''}</div>`).join('')}</div><p class="mini">Um incremento por atributo em cada lote. A partir de +4, são necessários dois incrementos em níveis distintos para aumentar +1.</p>${campo(dados,'Dois incrementos livres da ancestralidade','ancestralidadeAlternativa','checkbox')}${incrementos(dados,'ancestralidade',dados.ancestralidadeAlternativa?'Ancestralidade · dois livres':'Ancestralidade · incrementos de '+(ancestral?.nome||'sua escolha'))}${!dados.ancestralidadeAlternativa&&ancestral?'<p class="mini">Fixos: '+(ancestral.incrementos||[]).map(nome=>nomesAtributos[nome]||nome).join(', ')+' · livres: '+(ancestral.livres||0)+(ancestral.defeito?' · defeito: '+nomesAtributos[ancestral.defeito]:'')+'</p>':''}${incrementos(dados,'biografia','Biografia · dois distintos; um entre '+(bio?.atributos||[]).map(nome=>nomesAtributos[nome]).join(' ou '))}${incrementos(dados,'classe','Classe · um no atributo-chave',atributosChave(dados))}${incrementos(dados,'livres','Criação · quatro livres')}${[5,10,15,20].filter(nivel=>nivel<=dados.nivel).map(nivel=>incrementos(dados,'nivel.'+nivel,'Nível '+nivel+' · quatro livres')).join('')}</section>`;
  }
  function camposPericias(dados) {
    const calculo=R.calcular(dados,catalogo),restricoes=classe(dados)?.restricoesIncrementosExtra||{},estilo=opcao(dados)?.periciasFixas?.[0];
    const extras=Object.entries(restricoes).filter(([nivel])=>Number(nivel)<=dados.nivel).map(([nivel,opcoes])=>campo(dados,'Melhoria extra de estilo · nível '+nivel,'incrementosPericiaExtras.'+nivel,'select',{valores:[['','Escolha'],...opcoes.map(id=>id==='pericia-do-estilo'?estilo:id).filter(Boolean).map(id=>[id,nomesPericias[id]||id])]})).join('');
    return `<section class="card"><h2>Perícias e proficiência</h2>${extras}<p class="mini">A ficha aplica os treinamentos concedidos e confere quantas escolhas e melhorias restam. Destreinado não acrescenta o nível.</p><ul>${[...validacao(dados).pendencias,...validacao(dados).erros].filter(texto=>/treinamento|incrementos de perícia|graduações de perícia/i.test(texto)).map(texto=>'<li>'+escapar(texto)+'</li>').join('')||'<li>Distribuição de perícias conferida.</li>'}</ul><div class="grade">${Object.entries(nomesPericias).map(([nome,rotulo])=>`<article class="item">${campo(dados,rotulo+' · '+(calculo.pericias[nome]>=0?'+':'')+calculo.pericias[nome],'pericias.'+nome,'select',{valores:nomesGraus.map((grau,i)=>[i,grau])})}${calculo.grausPericias?.[nome]>Number(dados.pericias?.[nome]||0)?'<p class="mini">Treinamento concedido automaticamente pela classe, ancestralidade ou biografia.</p>':''}${botao('Testar '+rotulo,'teste',nome)}</article>`).join('')}</div><div class="grade">${Object.entries(calculo.pericias||{}).filter(([id])=>id.startsWith('saber:')).map(([id,bonus])=>'<article class="item"><h3>Saber: '+escapar(id.slice(6))+'</h3><span class="numero">'+(bonus>=0?'+':'')+bonus+'</span>'+botao('Testar Saber','teste',id)+'</article>').join('')}</div>${campo(dados,'Anotações de Saberes e substituições','saberes','textarea')}</section>`;
  }
  function niveisTalento(dados,tipo) {
    const atual=classe(dados), personalizados=atual?.niveisTalentos?.[tipo];
    if(personalizados) return personalizados;
    if(tipo==='ancestralidade') return [1,5,9,13,17];
    if(tipo==='geral') return [3,7,11,15,19];
    if(tipo==='pericia') return ['ladino','investigador'].includes(atual?.id)?Array.from({length:20},(_,i)=>i+1):[2,4,6,8,10,12,14,16,18,20];
    return [1,2,4,6,8,10,12,14,16,18,20];
  }
  function nivelAquisicao(dados,item) {
    const possiveis=niveisTalento(dados,item.tipo).filter(nivel=>nivel>=(item.nivel||1)&&nivel<=dados.nivel&&!(dados.talentos||[]).some(t=>t.tipo===item.tipo&&t.nivel===nivel&&!t.origem));
    return possiveis.at(-1)||item.nivel||1;
  }
  function origensTalento(dados,talento) {
    const origens=[...new Set(escolhasTalentoDisponiveis(dados).filter(escolha=>escolha.tipo===talento.tipo&&escolha.nivel===talento.nivel&&escolha.origem).map(escolha=>escolha.origem))];
    if(talento.origem&&talento.origem!=='biografia'&&!origens.includes(talento.origem)) origens.push(talento.origem);
    return [['','Escolha regular'],...origens.map(origem=>{const identificador=origem.split(':').slice(1).join(':');const fonte=registro('talentos',identificador)||(catalogo.ancestralidades||[]).flatMap(item=>item.herancas||[]).find(item=>item.id===identificador);return [origem,'Escolha extra: '+(fonte?.nome||identificador)];})];
  }
  function talentosSelecionados(dados) {
    return (dados.talentos||[]).map((talento,i)=>{
      const item=registro('talentos',talento.id);
      return '<article class="item"><strong>'+escapar(item?.nome||talento.nome||talento.id)+'</strong>'+(talento.origem==='biografia'?'<p class="mini">Concedido pela biografia; não ocupa a escolha regular de talento.</p>':'<div class="grade">'+campo(dados,'Nível de aquisição','talentos.'+i+'.nivel','number',{min:item?.nivel||1,max:dados.nivel})+campo(dados,'Escolha usada','talentos.'+i+'.tipo','select',{valores:[['ancestralidade','Ancestralidade'],['classe','Classe'],['pericia','Perícia'],['geral','Geral'],['arquetipo','Arquétipo']]})+campo(dados,'Origem da escolha','talentos.'+i+'.origem','select',{valores:origensTalento(dados,talento)})+'</div>')+'</article>';
    }).join('');
  }
  function magiasSelecionadas(dados) {
    const conj=R.calcular(dados,catalogo).conjuracao;
    if(!conj)return '';
    const espontanea=conj.tipo==='espontanea'||conj.preparacao==='espontanea',maximo=Math.max(1,...Object.keys(conj.espacos||{}).map(Number));
    return (dados.magias||[]).map((escolha,i)=>{
      const item=registro('magias',typeof escolha==='string'?escolha:escolha.id),truque=escolha.tipo==='truque'||item?.tipo==='truque'||item?.truque,foco=escolha.tipo==='foco'||item?.tipo==='foco';
      return '<article class="item"><strong>'+escapar(item?.nome||escolha.nome||escolha.id||escolha)+'</strong>'+(escolha.concedidaAutomaticamente?'<p class="mini">Concedida automaticamente pela classe ou especialização.</p>':espontanea&&!truque&&!foco?campo(dados,'Ranque conhecido','magias.'+i+'.ranque','select',{valores:Array.from({length:Math.max(0,maximo-(item?.ranque||item?.nivel||1)+1)},(_,offset)=>{const ranque=(item?.ranque||item?.nivel||1)+offset;return [ranque,ranque];})})+((conj.magiasAssinaturaDesde||99)<=dados.nivel?campo(dados,'Magia de assinatura · ampliar ou reduzir o ranque','magias.'+i+'.assinatura','checkbox'):''):'')+'</article>';
    }).join('');
  }
  function quantidadeItem(item) {const n=item.quantidade===undefined?1:Number(item.quantidade);return Number.isSafeInteger(n)&&n>=0?n:0;}
  function equipamentosSelecionados(dados) {
    return (dados.equipamentos||[]).map((escolha,i)=>{
      const item=registro('equipamentos',typeof escolha==='string'?escolha:escolha.id),modelo=copiar(dados);modelo.equipamentos[i]=typeof escolha==='string'?{id:escolha,quantidade:1}:{...escolha,quantidade:quantidadeItem(escolha)};
      return '<article class="item"><strong>'+escapar(item?.nome||escolha.nome||escolha.id||escolha)+'</strong>'+campo(modelo,'Quantidade','equipamentos.'+i+'.quantidade','number',{min:0})+(item?.mecanica?.acao==='curar'&&quantidadeItem(modelo.equipamentos[i])>0?botao('Consumir e aplicar cura automática','consumir-item',i):'')+'</article>';
    }).join('');
  }
  function catalogoOpcoes(dados,tipo,titulo) {
    const selecionados=new Set((dados[tipo]||[]).map(item=>typeof item==='string'?item:item.id));
    let itens=(catalogo[tipo]||[]).filter(item=>ehMestre||item.somenteMestre!==true);
    const carga=tipo==='equipamentos'?R.calcular(dados,catalogo).carga:null;
    if(tipo==='talentos') itens=itens.filter(item=>(item.nivel||1)<=dados.nivel&&(!item.classe||item.classe===dados.classeId)&&(!item.ancestralidade||item.ancestralidade===dados.ancestralidadeId));
    return `<section class="card"><h2>${titulo}</h2>${carga?'<p>Volume total: <strong>'+carga.volume+'</strong> · sobrecarga a partir de '+carga.limiteSobrecarga+' · máximo '+carga.limiteMaximo+'.</p>'+(carga.sobrecarregado?'<p class="aviso">Sobrecarregado: Desajeitado1 e redução de deslocamento aplicados automaticamente.</p>':'')+(carga.pendentes?.length?'<p class="aviso">Volume ainda pendente para: '+carga.pendentes.map(id=>registro('equipamentos',id)?.nome||id).map(escapar).join(', ')+'.</p>':''):''}${tipo==='talentos'?talentosSelecionados(dados):tipo==='magias'?magiasSelecionadas(dados):tipo==='equipamentos'?equipamentosSelecionados(dados):''}<label>Buscar ${titulo.toLowerCase()}<input type="search" data-busca="${tipo}" placeholder="Nome, efeito ou origem"></label><p class="mini">Confira os requisitos e as opções permitidas na mesa. Referências indexadas ainda em revisão não são apresentadas como conteúdo integral revisado.</p><div class="catalogo">${itens.map(item=>`<article class="item" data-filtro="${escapar((item.nome+' '+resumo(item)+' '+fonte(item)).toLocaleLowerCase('pt-BR'))}"><label class="check"><input type="checkbox" data-escolha="${tipo}" value="${escapar(item.id)}" ${selecionados.has(item.id)?'checked':''} ${item.somenteConsulta||(tipo==='magias'&&(dados.magias||[]).some(m=>m.id===item.id&&m.concedidaAutomaticamente))?'disabled':''}>${escapar(item.nome)}${item.nivel!==undefined?' · nível '+item.nivel:''}</label><p class="mini">${escapar(resumo(item))}</p>${item.somenteConsulta?'<p class="mini">Somente consulta · seleção mecânica ainda indisponível.</p>':textoRevisao(item)?'<p class="mini">Texto da fonte em revisão.</p>':''}${botao('Ver efeito e requisitos','detalhe',tipo+':'+item.id)}</article>`).join('')||'<p>Esta categoria ainda não tem opções revisadas. A ficha não presume escolhas ausentes.</p>'}</div></section>`;
  }
  function magiasEmUso(dados) {
    return (dados.magias||[]).map(escolha=>{
      const item=registro('magias',typeof escolha==='string'?escolha:escolha.id),concedida=typeof escolha==='object'&&escolha.concedidaAutomaticamente;
      if(!item)return '<article class="item"><h3>'+escapar(escolha.nome||escolha.id||escolha)+'</h3><p class="mini">'+(concedida?'Concedida automaticamente pela classe ou especialização. ':'')+'A referência integral desta magia ainda está em revisão; sua escolha foi preservada.</p></article>';
      return '<article class="item"><h3>'+escapar(item.nome)+'</h3>'+(escolha.apenasAcessoPreparacao?'<p class="mini">Disponível para preparação por divindade; não concede espaços extras.</p>':concedida?'<p class="mini">Concedida automaticamente.</p>':'')+'<p class="mini">'+escapar(resumo(item))+'</p>'+botao('Ver efeito','detalhe','magias:'+item.id)+(item.efeitoCombate&&!item.somenteConsulta?botao('Conjurar · efeito automático','conjurar',item.id):'<p class="mini">O efeito desta magia ainda não está disponível para execução automática.</p>')+'</article>';
    }).join('');
  }
  function conjuradorPreparado(conj) {return conj?.tipo==='preparada'||conj?.preparacao==='preparada';}
  function magiasConhecidas(dados) {
    const conj=R.calcular(dados,catalogo).conjuracao;
    return ['clerigo','druida'].includes(dados.classeId)?(catalogo.magias||[]).filter(item=>!item.somenteConsulta&&(typeof R.magiaElegivel==='function'?R.magiaElegivel(dados,item.id,catalogo):(item.tradicoes||[]).includes(conj?.tradicao))):(dados.magias||[]).map(escolha=>registro('magias',typeof escolha==='string'?escolha:escolha.id)).filter(item=>item&&!item.somenteConsulta);
  }
  function magiasCurriculo(dados,ranque) {
    const op=opcao(dados),linhas=op?.magiasCurriculo||[];
    return linhas.filter(linha=>{const rank=Number(linha.ranque??linha.graduacao);return Number(ranque)===0?rank===0:rank>0&&rank<=Number(ranque);}).flatMap(linha=>linha.magias||[]).map(item=>typeof item==='string'?item:item.id);
  }
  function preparacaoMagias(dados,conj) {
    if(!conjuradorPreparado(conj))return '';
    const conhecidas=magiasConhecidas(dados),truques=conhecidas.filter(item=>item.truque||item.tipo==='truque'),maxTruques=Number(conj.truques||0);
    let html='<section class="card"><h2>Preparação diária · escolhas por espaço</h2><p class="mini">Cada espaço recebe uma magia conhecida do ranque indicado ou ampliada. Preparar a mesma magia em dois espaços permite conjurá-la duas vezes. Uma seleção consumida continua gasta até a preparação diária.</p><div class="grade">';
    const bonusCurriculo=conj.extrasCurriculo&&dados.opcaoClasseId&&dados.opcaoClasseId!==conj.extrasCurriculo.excetoOpcao?Number(conj.extrasCurriculo.truques||0):0;
    for(let i=0;i<maxTruques;i++){const curricular=i>=maxTruques-bonusCurriculo,ids=curricular?magiasCurriculo(dados,0):null,permitidos=truques.filter(item=>!ids||ids.includes(item.id));html+=campo(dados,(curricular?'Truque do currículo ':'Truque preparado ')+(i+1),'magiasPreparadas.truques.'+i,'select',{valores:[['','Escolha'],...permitidos.map(item=>[item.id,item.nome])]});}
    html+='</div>';
    for(const [grupo,limites] of [['padrao',conj.espacos||{}],['curriculo',conj.extraCurriculo||{}]])for(const [ranque,maximo] of Object.entries(limites)) {
      const permitidas=grupo==='curriculo'?magiasCurriculo(dados,ranque):null,opcoes=conhecidas.filter(item=>!item.truque&&item.tipo!=='truque'&&item.tipo!=='foco'&&Number(item.ranque||item.nivel||1)<=Number(ranque)&&(!permitidas||permitidas.includes(item.id)));
      html+='<h3>Ranque '+ranque+' · '+(grupo==='curriculo'?'currículo':'padrão')+'</h3>'+(grupo==='curriculo'&&!permitidas.length?'<p class="aviso">A lista de magias deste currículo ainda está em revisão; estes espaços ficam bloqueados até a fonte ser revisada.</p>':'')+'<div class="grade">';
      for(let i=0;i<Number(maximo);i++)html+='<article class="item">'+campo(dados,'Espaço '+(i+1),'magiasPreparadas.'+grupo+'.'+ranque+'.'+i,'select',{valores:[['','Escolha uma magia'],...opcoes.map(item=>[item.id,item.nome])]})+((dados.preparacaoGasta?.[grupo]?.[ranque]||[]).includes(i)?'<p class="mini">Espaço já consumido.</p>':dados.magiasPreparadas?.[grupo]?.[ranque]?.[i]?botao('Conjurar espaço preparado','conjurar',dados.magiasPreparadas[grupo][ranque][i]):'')+'</article>';
      html+='</div>';
    }
    return html+'</section>';
  }
  function painelMagia(dados) {
    const calculo=R.calcular(dados,catalogo),conj=calculo.conjuracao;
    if(!conj)return '';
    const espacos=conj.espacos||{},extras=conj.extraCurriculo||{},fonteDivina=conj.fonteDivina;
    return preparacaoMagias(dados,conj)+'<section class="card"><h2>Conjuração automática</h2><div class="grade"><div><h3>CD de magia</h3><span class="numero">'+calculo.cdMagia+'</span></div><div><h3>Ataque de magia</h3><span class="numero">'+(calculo.ataqueMagia>=0?'+':'')+calculo.ataqueMagia+'</span>'+botao('Atacar com magia','teste','ataqueMagia')+'</div><div><h3>Tradição</h3><p>'+escapar(conj.tradicao||'Escolha a especialização')+'</p></div></div><p>Truques disponíveis: <strong>'+escapar(conj.truques??0)+'</strong>.</p><div class="grade">'+Object.entries(espacos).map(([ranque,maximo])=>{const usado=Math.min(Number(maximo),Math.max(0,Number(dados.espacosGastos?.[ranque]||0)));return '<article class="item"><h3>Ranque '+ranque+'</h3><span class="numero">'+(Number(maximo)-usado)+' / '+maximo+'</span>'+(conjuradorPreparado(conj)?'':botao('Gastar espaço','gastar-espaco',ranque))+(extras[ranque]?'<p>'+Math.max(0,Number(extras[ranque])-Number(dados.espacosCurriculoGastos?.[ranque]||0))+' / '+extras[ranque]+' espaço(s) de currículo.</p>'+(conjuradorPreparado(conj)?'':botao('Gastar espaço de currículo','gastar-curriculo',ranque)):'')+'</article>';}).join('')+'</div>'+(fonteDivina?.quantidade?'<p>Fonte divina: '+Math.max(0,Number(fonteDivina.quantidade)-Number(dados.fonteDivinaGastos||0))+' / '+fonteDivina.quantidade+' espaço(s) de '+escapar(fonteDivina.magia||'cura/ferimento')+' no ranque '+(fonteDivina.ranque||'máximo')+'.</p>'+(registro('magias',fonteDivina.magia)?botao('Conjurar Fonte divina','conjurar',fonteDivina.magia):'<p class="mini">Escolha Curar ou Ferir nas escolhas da classe.</p>'):'')+(conj.foco>0?'<h3>Pontos de foco</h3><p>'+Math.max(0,conj.foco-Number(dados.focoGasto||0))+' / '+conj.foco+'</p>'+botao('Gastar foco','gastar-foco')+botao('Refocar · 10 minutos','refocar'):'')+botao('Preparação diária · recuperar espaços','recuperar-espacos')+'<h3>Magias escolhidas</h3>'+magiasEmUso(dados)+'<p class="mini">Os limites vêm da classe, nível e especialização. Você escolhe o que conjurar; a ficha controla os espaços gastos.</p></section>';
  }
  function camposOpcoes(dados) {
    return escolhasClasse(dados)+painelMagia(dados)+catalogoOpcoes(dados,'talentos','Talentos')+catalogoOpcoes(dados,'magias','Magias')+`${camposDefesa(dados)}<section class="card"><h2>Equipamento e preparação</h2><p class="mini">O inventário desta ficha mantém as quantidades de cada item. Registre aqui equipamento mecânico, preparação e recursos; uma seleção cadastra um exemplar e preserva os itens anteriores.</p>${campo(dados,'Equipamento inicial e moedas','equipamentoInicial','textarea')}${dados.recursosMagicos?'<details><summary>Anotações antigas de conjuração · preservadas</summary><p class="texto-integral">'+escapar(dados.recursosMagicos)+'</p></details>':''}${campo(dados,'Escolhas específicas e efeitos de classe','escolhasClasseNotas','textarea')}</section>`+catalogoOpcoes(dados,'equipamentos','Inventário desta ficha');
  }
  function validacao(dados) { const resultado=R.validar(dados,catalogo); return Array.isArray(resultado)?{valido:!resultado.length,erros:resultado,pendencias:[],avisos:[]}:{erros:[],pendencias:[],avisos:[],...resultado}; }
  function camposRevisao(dados) {
    const resultado=validacao(dados), calculo=R.calcular(dados,catalogo);
    return '<section class="card"><h2>Revisão da ficha</h2><p>'+(resultado.valido?'Escolhas básicas validadas.':'Há escolhas ou regras para revisar antes de concluir.')+'</p>'+[['erros','Corrigir'],['pendencias','Escolhas pendentes'],['avisos','Conferir com a mesa']].map(([chave,titulo])=>resultado[chave].length?'<h3>'+titulo+'</h3><ul>'+resultado[chave].map(texto=>'<li>'+escapar(texto)+'</li>').join('')+'</ul>':'').join('')+'<p>PV máximos: <strong>'+calculo.pvMaximos+'</strong> · CA: <strong>'+calculo.ca+'</strong> · CD da classe: <strong>'+calculo.cdClasse+'</strong>.</p><h3>O que seu nível concede</h3><ul class="ganhos">'+(calculo.ganhos||[]).map(item=>'<li>'+escapar(typeof item==='string'?item:item.nome)+(item.descricao?'<p class="mini">'+escapar(item.descricao)+'</p>':'')+'</li>').join('')+'</ul></section>';
  }
  const condicoesConhecidas={acelerado:'Acelerado',desacelerado:'Desacelerado',atordoado:'Atordoado',paralisado:'Paralisado',petrificado:'Petrificado',confuso:'Confuso',cego:'Cego',surdo:'Surdo',agarrado:'Agarrado',restringido:'Restringido',imobilizado:'Imobilizado',fugindo:'Fugindo',ocultado:'Ocultado',escondido:'Escondido',indetectado:'Indetectado',morrendo:'Morrendo',ferido:'Ferido',condenado:'Condenado',assustado:'Assustado',enjoado:'Enjoado',enfraquecido:'Enfraquecido',desajeitado:'Desajeitado',drenado:'Drenado',estupefato:'Estupefato',fatigado:'Fatigado',inconsciente:'Inconsciente',fascinado:'Fascinado',desprevenido:'Desprevenido',prostrado:'Prostrado'};
  function camposCondicoes(dados) {
    return (dados.condicoes||[]).map((item,i)=>typeof item==='object'?'<div class="grade item">'+campo(dados,'Condição','condicoes.'+i+'.id','select',{valores:[['','Escolha'],...Object.entries(condicoesConhecidas)]})+campo(dados,'Valor','condicoes.'+i+'.valor','number',{min:0,max:10})+botao('Remover','remover-condicao',i)+'</div>':'<p>'+escapar(item)+botao('Remover','remover-condicao',i)+'</p>').join('')+botao('Adicionar condição','adicionar-condicao')+'<p class="mini">Condições cadastradas recalculam os valores afetados; notas livres não aplicam penalidades.</p>';
  }
  function painelAtaques(dados,calculo) {
    const arma=calculo.equipamento?.arma||registro('equipamentos',dados.armaId);
    const map=calculo.map||[0,-5,-10];
    const dano=calculo.danoArma?.formula||calculo.danoArma||calculo.danoFormula||'';
    const turno=dados.turno,sequencia=turno&&!turno.encerrado?[Math.min(2,Number(turno.ataquesRealizados||0))]:[0,1,2];
    const estados=(dados.classeId==='ladino'?campo(dados,'Alvo desprevenido · aplicar precisão quando elegível','estados.alvoDesprevenido','checkbox'):'')+(dados.classeId==='investigador'?campo(dados,'Usar Estratagema no golpe · INT e precisão quando elegíveis','estados.estratagema','checkbox'):'')+(dados.classeId==='espadachim'?campo(dados,'Panache ativo','estados.panache','checkbox'):'');
    return estados+'<h3>'+escapar(arma?.nome||'Ataque desarmado')+'</h3><div class="acoes">'+sequencia.map(i=>botao('Golpear · ataque '+(i+1)+' · '+(calculo.ataque+map[i]>=0?'+':'')+(calculo.ataque+map[i]),'ataque',i)).join('')+'</div>'+(dano?'<p><strong>Dano automático:</strong> '+escapar(dano)+'</p>':'')+'<p class="mini">A arma selecionada define proficiência, atributo, dado de dano e penalidade por ataques múltiplos.</p>';
  }
  const tiposDano={contundente:'Contundente',perfurante:'Perfurante',cortante:'Cortante',acido:'Ácido',fogo:'Fogo',frio:'Frio',eletricidade:'Eletricidade',sonico:'Sônico',vitalidade:'Vitalidade',vazio:'Vazio',forca:'Força',espiritual:'Espiritual',mental:'Mental',veneno:'Veneno',sangramento:'Sangramento'};
  function painelTurno(dados) {
    const turno=dados.turno;
    return '<section class="card"><h2>Meu turno · ações e efeitos automáticos</h2>'+(turno?'<div class="grade"><div><h3>Ações gerais</h3><span class="numero">'+turno.acoesGerais+'</span></div><div><h3>Ação acelerada</h3><span class="numero">'+turno.acaoAcelerada+'</span><p class="mini">'+escapar((turno.restricoesAcelerada||[]).join(', ')||'Sem ação acelerada disponível.')+'</p></div><div><h3>Reações</h3><span class="numero">'+turno.reacoes+'</span></div></div><p>'+(turno.podeAgir?'Você pode agir.':'Condições impedem ações neste momento.')+'</p>'+(turno.precisaDefinirRestricoes?'<p class="aviso">A ação acelerada exige a restrição da fonte; ela fica bloqueada até os metadados serem definidos.</p>':''):'<p>Inicie seu turno para calcular ações, reação e recuperação de morrendo.</p>')+'<div class="acoes">'+botao('Iniciar meu turno','iniciar-turno')+botao('Finalizar meu turno','finalizar-turno')+(turno&&!turno.encerrado?botao('Gastar uma ação geral','gastar-acao')+botao('Gastar reação','gastar-reacao'):'')+'</div><h3>Danos persistentes</h3>'+(dados.danosPersistentes||[]).map((item,i)=>'<article class="item"><div class="grade">'+campo(dados,'Tipo de dano','danosPersistentes.'+i+'.tipo','select',{valores:[['','Escolha'],...Object.entries(tiposDano)]})+campo(dados,'Fórmula base da fonte · exemplo: 1d6','danosPersistentes.'+i+'.formula')+campo(dados,'A fonte prevê persistente duplicado por crítico','danosPersistentes.'+i+'.critico','checkbox')+campo(dados,'CD do teste simples · padrão 15','danosPersistentes.'+i+'.cdRecuperacao','number',{min:1,max:100})+'</div>'+botao('Remover efeito','remover-persistente',i)+'</article>').join('')+botao('Registrar dano persistente','adicionar-persistente')+'<p class="mini">O fim do turno rola cada fórmula, aplica defesas e PV, testa a recuperação e reduz Assustado. O começo resolve a recuperação de Morrendo e as perdas de ações. Informe a fórmula base da fonte e marque o crítico quando a regra permitir; a ficha calcula a multiplicação.</p>'+(dados._ultimoTurnoSnapshot?botao('Exportar estado antes do último turno','exportar-turno-anterior'):'')+'</section>';
  }
  function painelRecursos(dados) {
    const recursos=R.calcular(dados,catalogo).recursosCalculados||[];
    if(!recursos.length)return '';
    return '<section class="card"><h2>Recursos da classe · limites automáticos</h2><div class="grade">'+recursos.map(r=>{
      if(r.substituiPVTemporarios)return '<article class="item"><h3>'+escapar(r.nome)+'</h3><p>'+r.maximo+' PV temporários ao ativar, sem somar aos atuais.</p>'+botao(dados.estados?.furia?'Encerrar Fúria':'Entrar em Fúria','furia')+'</article>';
      const usados=Math.max(0,Number(dados.recursosGastos?.[r.id]||0));
      return '<article class="item"><h3>'+escapar(r.nome)+'</h3><span class="numero">'+Math.max(0,r.maximo-usados)+' / '+r.maximo+'</span><div class="acoes">'+botao('Gastar uma unidade','gastar-recurso',r.id)+(r.recuperacao?botao('Recuperar · '+(r.recuperacao.intervalo||r.recuperacao.tempo||'descanso'),'recuperar-recurso',r.id):'')+botao('Renovar · '+(r.renovacao||'preparação diária'),'renovar-recurso',r.id)+'</div></article>';
    }).join('')+'</div><p class="mini">A classe, nível, atributo e especialização calculam os limites. A recuperação exige cumprir o intervalo ou descanso descrito na fonte.</p></section>';
  }
  function painelIniciativa() {
    return '<section class="card"><h2>Declarar iniciativa</h2><p class="mini">Escolha Percepção ou a perícia autorizada pelo mestre. A ficha soma o bônus automaticamente e envia somente o resultado; o nome é confirmado pelo servidor.</p><div class="grade"><label>Teste de iniciativa<select id="iniciativa-base"><option value="percepcao">Percepção</option>'+Object.entries(nomesPericias).map(([id,nome])=>'<option value="'+id+'">'+escapar(nome)+'</option>').join('')+'</select></label><label>d20 já rolado · opcional<input id="iniciativa-dado" type="number" min="1" max="20" placeholder="Em branco: rolar automaticamente"></label></div>'+botao(id?'Rolar ou usar dado e declarar':'Rolar ou usar dado','declarar-iniciativa')+'</section>';
  }
  function camposSessao(dados) {
    const calculo=R.calcular(dados,catalogo);
    return `<section class="card"><h2>Durante a sessão</h2><p class="mini">Três ações e uma reação por rodada. A mesa aplica ações extras, perda de ações e restrições de condições.</p><div class="grade">${[['Classe de Armadura',calculo.ca],['Percepção',calculo.percepcao],['CD da classe',calculo.cdClasse],['Deslocamento',calculo.deslocamento]].map(([nome,valor])=>`<div><h3>${nome}</h3><span class="numero">${valor}</span></div>`).join('')}</div><div class="grade">${campo(dados,'PV atuais','vida.atual','number',{min:0})}${campo(dados,'PV temporários','vida.temporaria','number',{min:0})}<div><h3>PV máximos calculados</h3><span class="numero">${calculo.pvMaximos}</span></div></div><div class="acoes"><label>Dano-base recebido ou cura<input id="quantidade-vida" type="number" min="0" value="0"></label><label>Tipo do dano<select id="dano-tipo">${Object.entries(tiposDano).map(([id,nome])=>'<option value="'+id+'">'+nome+'</option>').join('')}</select></label><label class="check"><input id="dano-critico" type="checkbox">Acerto crítico ou falha crítica · duplicar dano-base</label><label class="check"><input id="dano-ja-final" type="checkbox">Mestre informou dano final já calculado · não duplicar nem reduzir novamente</label><label class="check"><input id="dano-nao-letal" type="checkbox">Dano não letal</label>${botao('Aplicar dano','dano')}${botao('Curar','curar')}${botao('Testar Percepção','teste','percepcao')}</div></section><section class="card"><h2>Salvaguardas e ataques</h2><div class="grade">${Object.entries(calculo.salvaguardas||{}).map(([nome,valor])=>`<div><h3>${nomesSalvaguardas[nome]||nome}</h3><span class="numero">${valor>=0?'+':''}${valor}</span>${botao('Testar','teste',nome)}</div>`).join('')}</div><p>Penalidade por ataques múltiplos: <strong>0 / −5 / −10</strong>; arma ágil: <strong>0 / −4 / −8</strong>. Ataques fora do seu turno normalmente não contam.</p>${painelAtaques(dados,calculo)}</section><section class="card"><h2>Condições e recursos</h2>${dados.morto?'<p class="aviso">Morte registrada pelas regras de dano. Cura comum não restaura o personagem.</p>':''}${camposCondicoes(dados)}${campo(dados,'Condições, duração e efeitos em vigor','condicoesNotas','textarea')}${campo(dados,'Pontos heroicos','pontosHeroicos','number',{min:0,max:3})}${campo(dados,'Recursos consumidos e reações','recursosSessao','textarea')}</section>${painelEscudo(dados,calculo)}${painelMagia(dados)}${painelRecursos(dados)}${painelTurno(dados)}${painelIniciativa()}`;
  }
  function painelEscudo(dados,calculo) {
    const escudo=calculo.equipamento?.escudo;if(!escudo)return '';
    const pv=dados.escudoPv??escudo.pv,estado=dados.escudoDestruido||pv===0?'Destruído':dados.escudoQuebrado||pv<=escudo.limiarQuebra?'Quebrado':'Íntegro';
    return '<section class="card"><h2>'+escapar(escudo.nome)+' · defesa automática</h2><div class="grade"><div><h3>PV do escudo</h3><span class="numero">'+escapar(pv)+' / '+escapar(escudo.pv)+'</span></div><div><h3>Dureza</h3><span class="numero">'+escapar(escudo.dureza)+'</span></div><div><h3>Limite de quebra</h3><span class="numero">'+escapar(escudo.limiarQuebra)+'</span></div></div><p>'+estado+'. '+(dados.escudoErguido?'Escudo erguido.':'Erga o escudo para bloquear.')+'</p>'+(calculo.bloqueioEscudo?'<label class="check"><input id="dano-ataque" type="checkbox">O dano físico informado acima veio de um ataque</label>'+botao('Bloquear com Escudo · aplicar dano e gastar reação','bloquear-escudo')+'<p class="mini">Usa o dano-base e o tipo escolhidos acima. A dureza, o dano ao personagem, os PV do escudo e a quebra são calculados automaticamente. Uma reação disponível é necessária.</p>':'<p class="mini">Esta ficha ainda não possui o talento Bloqueio com Escudo.</p>')+'</section>';
  }
  function equipamentosDoTipo(tipo) {
    return (catalogo.equipamentos||[]).filter(item=>item.tipo===tipo&&item.somenteConsulta!==true&&(ehMestre||item.somenteMestre!==true));
  }
  function runasDoTipo(categoria,familia) {
    return (catalogo.equipamentos||[]).filter(item=>item.tipo==='runa'&&item.somenteConsulta!==true&&item.automatizavel!==false&&(ehMestre||item.somenteMestre!==true)&&(item.mecanica?.categoria||item.categoria)===categoria&&(item.mecanica?.familia||item.familia)===(familia==='reforco'?'reforcadora':familia));
  }
  function selecaoRuna(dados,categoria,familia,rotulo) {
    const itens=runasDoTipo(categoria,/^propriedade[123]$/.test(familia)?'propriedade':familia);
    return itens.length?campo(dados,rotulo,'runasEquipamento.'+categoria+'.'+familia,'select',{valores:[['','Sem runa'],...itens.map(item=>[item.id,item.nome])]}):'';
  }
  function modosArma(dados) {
    const arma=registro('equipamentos',dados.armaId)||registro('equipamentos','punho'),tracos=arma?.tracos||[];
    return [['','Automático pela arma'],...(arma?.distancia!==undefined?[['distancia','Distância']]:[['corpo-a-corpo','Corpo a corpo']]),...(tracos.some(traco=>/^arremesso(?:-|$)/.test(traco))?[['arremesso','Arremessar']]:[])];
  }
  function maosArma(dados) {
    const arma=registro('equipamentos',dados.armaId)||registro('equipamentos','punho');
    return [['','Automático pela arma'],...(Number(arma?.maos||1)===1?[['1','Uma mão']]:[]),...((arma?.tracos||[]).some(traco=>/^duas-maos-/.test(traco))||arma?.maos===2?[['2','Duas mãos']]:[])];
  }
  function camposDefesa(dados) {
    const calculo=R.calcular(dados,catalogo);
    return `<section class="card"><h2>Equipamento em uso · valores automáticos</h2><div class="grade">${campo(dados,'Armadura','armaduraId','select',{valores:[['','Sem armadura'],...equipamentosDoTipo('armadura').map(item=>[item.id,item.nome])]})}${campo(dados,'Arma','armaId','select',{valores:[['','Punho · desarmado'],...equipamentosDoTipo('arma').map(item=>[item.id,item.nome])]})}${campo(dados,'Escudo','escudoId','select',{valores:[['','Sem escudo'],...equipamentosDoTipo('escudo').map(item=>[item.id,item.nome])]})}${selecaoRuna(dados,'arma','potencia','Runa de potência da arma')}${selecaoRuna(dados,'arma','impactante','Runa impactante da arma')}${selecaoRuna(dados,'armadura','potencia','Runa de potência da armadura')}${selecaoRuna(dados,'armadura','resiliente','Runa resiliente da armadura')}${[1,2,3].map(n=>selecaoRuna(dados,'armadura','propriedade'+n,'Propriedade da armadura '+n)).join('')}${selecaoRuna(dados,'escudo','reforco','Runa de reforço do escudo')}${campo(dados,'Uso da arma','armaModo','select',{valores:modosArma(dados)})}${campo(dados,'Mãos na arma','armaMaos','select',{valores:maosArma(dados)})}</div>${campo(dados,'Armadura investida · ativa runas','armaduraInvestida','checkbox')}${campo(dados,'Cobertura do escudo de corpo','escudoCobertura','checkbox')}${campo(dados,'Escudo erguido','escudoErguido','checkbox')}<div class="grade"><div><h3>CA calculada</h3><span class="numero">${calculo.ca}</span></div><div><h3>Ataque calculado</h3><span class="numero">${calculo.ataque>=0?'+':''}${calculo.ataque}</span></div><div><h3>Deslocamento calculado</h3><span class="numero">${calculo.deslocamento} m</span></div></div><p class="mini">Escolha o equipamento; a ficha aplica a categoria, proficiência, limite de Destreza, Força exigida, penalidades e runas suportadas. Selecionar cadastra um exemplar nesta ficha se ele ainda não estiver no inventário. Trocar o equipamento não remove os itens anteriores.</p>${ajuda('equipamentos',dados.armaduraId)}${ajuda('equipamentos',dados.armaId)}${ajuda('equipamentos',dados.escudoId)}</section>`;
  }
  const temasFicha={verde:{nome:'Floresta',fundo:'#0c1915',superficie:'#142a22',texto:'#eef4e9',acento:'#c4dc88',borda:'#8daf91',muted:'#c5d7c6'},azul:{nome:'Safira',fundo:'#0d1525',superficie:'#17283f',texto:'#edf4ff',acento:'#8fcaff',borda:'#86adc7',muted:'#bed3e8'},roxo:{nome:'Crepúsculo',fundo:'#1d1327',superficie:'#30223f',texto:'#f7efff',acento:'#deb2f5',borda:'#b397c5',muted:'#decae8'},dourado:{nome:'Sol antigo',fundo:'#201a12',superficie:'#342a1e',texto:'#fff6e6',acento:'#f4d18a',borda:'#bba679',muted:'#dfd0b0'},papel:{nome:'Pergaminho claro',fundo:'#f6efdf',superficie:'#fffaf0',texto:'#242c20',acento:'#33613f',borda:'#687a5b',muted:'#495744'}};
  function aplicarAparencia() {
    const aparencia=ficha?._aparencia||{},tema=temasFicha[aparencia.tema]||temasFicha.verde;
    for(const nome of ['fundo','superficie','texto','acento','borda','muted'])document.documentElement.style.setProperty('--'+nome,/^#[0-9a-f]{6}$/i.test(aparencia[nome]||'')?aparencia[nome]:tema[nome]);
    const fontes={padrao:'system-ui, sans-serif',serif:'Georgia, serif',mono:'ui-monospace, monospace'};
    let familia=fontes[aparencia.fonte]||fontes.padrao,estilo=$('#fonte-ficha');
    if(!estilo){estilo=document.createElement('style');estilo.id='fonte-ficha';document.head.append(estilo);}estilo.textContent='';
    if(aparencia.fonteURL){try{const endereco=new URL(aparencia.fonteURL,location.href);if(['https:','http:'].includes(endereco.protocol)){estilo.textContent='@font-face{font-family:PFPersonagem;src:url('+JSON.stringify(endereco.href)+');font-display:swap}';familia='PFPersonagem, '+familia;}}catch{/* Uma URL inválida não altera a fonte. */}}
    document.documentElement.style.setProperty('--pf-fonte',familia);document.documentElement.style.setProperty('--pf-fonte-titulo',aparencia.fonte==='padrao'&&!aparencia.fonteURL?'Georgia,serif':familia);document.documentElement.style.colorScheme=aparencia.tema==='papel'?'light':'dark';
  }
  function camposAparencia(dados) {
    const atual=dados._aparencia||{},tema=temasFicha[atual.tema]||temasFicha.verde,modelo={...dados,_aparencia:{tema:'verde',fonte:'padrao',...tema,...atual}};
    return '<section class="card"><h2>Aparência deste personagem</h2><p class="mini">As cores e a fonte ficam salvas somente nesta ficha. Outro personagem pode usar um estilo diferente.</p><div class="grade">'+campo(modelo,'Tema','_aparencia.tema','select',{valores:Object.entries(temasFicha).map(([id,t])=>[id,t.nome])})+campo(modelo,'Fonte','_aparencia.fonte','select',{valores:[['padrao','Padrão'],['serif','Serifada'],['mono','Monoespaçada']]})+Object.entries({fundo:'Fundo',superficie:'Painéis',texto:'Texto',acento:'Destaques',borda:'Bordas'}).map(([nome,label])=>campo(modelo,label,'_aparencia.'+nome,'color')).join('')+'</div>'+campo(modelo,'Fonte própria · URL de arquivo WOFF2, WOFF, TTF ou OTF','_aparencia.fonteURL','url')+'<p class="mini">Use um link HTTPS acessível ao navegador. Se a fonte não carregar, a fonte escolhida acima continua disponível.</p></section>';
  }
  function atualizarResumo() {
    if(!ficha) return;
    const calculo=R.calcular(ficha,catalogo);
    $('#resumo').innerHTML=[ficha.nome||'Novo personagem',registro('ancestralidades',ficha.ancestralidadeId)?.nome,classe(ficha)?.nome,'Nível '+ficha.nivel,'CA '+calculo.ca,`${ficha.vida?.atual??0}/${calculo.pvMaximos} PV`].filter(Boolean).map(texto=>'<span class="selo">'+escapar(texto)+'</span>').join('');
  }
  function botoesRascunho() {
    const existe=podeEditar&&!!ler(chave('guia'));
    $('#exportar-guia-pausado').hidden=!existe;
    $('#descartar-guia-pausado').hidden=!existe;
  }
  function renderizar() {
    if(!ficha) return;
    aplicarAparencia();
    $('#ficha').setAttribute('aria-busy','false'); $('#acoes').hidden=!podeEditar; $('#importar-label').hidden=!podeEditar; $('#exportar').disabled=false;
    $('#criar').textContent=ficha._guiado?.concluido?'Revisar criação · guiado':'Criar · modo guiado';
    $('#evoluir').disabled=ficha.nivel>=20||!!(progressaoPermitida&&ficha.nivel>=progressaoPermitida.nivelMaximo);
    $('#evoluir').title=progressaoPermitida&&ficha.nivel>=progressaoPermitida.nivelMaximo?'A evolução aguarda XP ou autorização do mestre.':'';
    $('#abas').innerHTML=Object.entries({sessao:'Sessão',personagem:'Personagem',atributos:'Atributos',pericias:'Perícias',opcoes:'Talentos e magias',notas:'Jornada'}).map(([id,nome])=>`<button data-aba="${id}" aria-current="${aba===id}">${nome}</button>`).join('');
    escreverHTML($('#ficha'),aba==='sessao'?camposSessao(ficha):aba==='personagem'?camposIdentidade(ficha)+camposDefesa(ficha)+camposAparencia(ficha)+camposRevisao(ficha):aba==='atributos'?camposAtributos(ficha):aba==='pericias'?camposPericias(ficha):aba==='opcoes'?camposOpcoes(ficha):`<section class="card"><h2>Jornada</h2>${campo(ficha,'História, personalidade e objetivos','historia','textarea')}${campo(ficha,'Anotações e acordos','notas','textarea')}</section>`);
    if(!podeEditar||guia) for(const elemento of $('#ficha').querySelectorAll('input,select,textarea,button[data-acao]:not([data-acao="detalhe"]):not([data-acao="teste"]):not([data-acao="ataque"])')) elemento.disabled=true;
    atualizarResumo(); botoesRascunho();
  }
  function concederTalentoBiografia(dados) {
    const bio=registro('biografias',dados.biografiaId), talentoId=bio?.talentoEscolha?.[dados.escolhasBiografia?.pericia]||bio?.talento;
    dados.talentos=(dados.talentos||[]).filter(item=>item.origem!=='biografia');
    if(talentoId&&registro('talentos',talentoId)) dados.talentos.push({id:talentoId,nivel:1,tipo:'pericia',origem:'biografia'});
  }
  function atualizarCampo(dados,caminho,novoValor) {
    const escudoAnterior=caminho==='escudoId'?dados.escudoId:null;
    if(caminho.startsWith('magiasPreparadas.')) {
      dados.magiasPreparadas??={truques:[],padrao:{},curriculo:{}};
      const partes=caminho.split('.');
      if(partes[1]==='truques'){if(!Array.isArray(dados.magiasPreparadas.truques))dados.magiasPreparadas.truques=[];}
      else{dados.magiasPreparadas[partes[1]]??={};if(!Array.isArray(dados.magiasPreparadas[partes[1]][partes[2]]))dados.magiasPreparadas[partes[1]][partes[2]]=[];}
    }
    definir(dados,caminho,novoValor);
    if(caminho==='escudoId'&&escudoAnterior!==novoValor){
      dados.estadoEscudos??={};
      if(escudoAnterior&&(dados.escudoPv!==undefined||dados.escudoQuebrado||dados.escudoDestruido))dados.estadoEscudos[escudoAnterior]={...dados.estadoEscudos[escudoAnterior],pv:dados.escudoPv,quebrado:dados.escudoQuebrado===true,destruido:dados.escudoDestruido===true};
      const estado=dados.estadoEscudos[novoValor];
      if(estado){dados.escudoPv=estado.pv;dados.escudoQuebrado=estado.quebrado;dados.escudoDestruido=estado.destruido;}
      else{delete dados.escudoPv;delete dados.escudoQuebrado;delete dados.escudoDestruido;}
      dados.escudoErguido=false;dados.escudoCobertura=false;
    }
    if(/^danosPersistentes\.\d+\.critico$/.test(caminho))dados.danosPersistentes[Number(caminho.split('.')[1])].multiplicador=novoValor?2:1;
    if(['armaduraId','armaId','escudoId'].includes(caminho)) { if(novoValor&&registro('equipamentos',novoValor)&&!(dados.equipamentos||[]).some(item=>(typeof item==='string'?item:item.id)===novoValor)) { dados.equipamentos??=[];dados.equipamentos.push({id:novoValor,nome:registro('equipamentos',novoValor).nome,quantidade:1}); } }
    if(caminho==='_aparencia.tema')for(const nome of ['fundo','superficie','texto','acento','borda','muted'])delete dados._aparencia[nome];
    if(caminho==='armaId'){dados.armaModo='';dados.armaMaos=null;}
    if(caminho==='ancestralidadeId') {dados.herancaId='';dados.escolhasHeranca={...dados.escolhasHeranca,pericia:''};}
    if(caminho==='herancaId')dados.escolhasHeranca={...dados.escolhasHeranca,pericia:''};
    if(caminho==='classeId') { dados.opcaoClasseId=''; dados.atributoChave=''; dados.incrementos??={}; dados.incrementos.classe=[]; }
    if(caminho==='opcaoClasseId'&&!atributosChave(dados).includes(dados.atributoChave)) { dados.atributoChave=''; dados.incrementos.classe=[]; }
    if(caminho==='atributoChave') { dados.incrementos??={}; dados.incrementos.classe=novoValor?[novoValor]:[]; }
    if(caminho==='biografiaId') { dados.escolhasBiografia={...dados.escolhasBiografia,pericia:''}; concederTalentoBiografia(dados); }
    if(caminho==='escolhasBiografia.pericia') concederTalentoBiografia(dados);
    return R.normalizar(dados,catalogo);
  }
  function escolhasTalentoDisponiveis(dados) {
    if(typeof R.escolhasTalentos==='function') return R.escolhasTalentos(dados,catalogo);
    return ['ancestralidade','classe','pericia','geral'].flatMap(tipo=>niveisTalento(dados,tipo).filter(nivel=>nivel<=dados.nivel).map(nivel=>({tipo,nivel,origem:null,quantidade:1})));
  }
  function escolherAquisicao(dados,item) {
    const disponiveis=escolhasTalentoDisponiveis(dados).filter(escolha=>escolha.tipo===item.tipo&&escolha.nivel>=(item.nivel||1)&&escolha.nivel<=dados.nivel&&(escolha.nivelMaximoTalento===undefined||(item.nivel||1)<=escolha.nivelMaximoTalento)).sort((a,b)=>b.nivel-a.nivel);
    const livre=disponiveis.find(escolha=>(dados.talentos||[]).filter(t=>t.tipo===escolha.tipo&&t.nivel===escolha.nivel&&(t.origem||null)===(escolha.origem||null)).length<(escolha.quantidade||1));
    return livre?{nivel:livre.nivel,...(livre.origem?{origem:livre.origem}:{})}:{nivel:nivelAquisicao(dados,item)};
  }
  function mudar(evento,dados) {
    const elemento=evento.target;
    if(elemento.dataset.editar) {
      const novoValor=elemento.type==='checkbox'?elemento.checked:elemento.type==='number'?(elemento.value===''?null:Number(elemento.value)):elemento.dataset.editar.startsWith('pericias.')?Number(elemento.value):elemento.dataset.editar==='armaMaos'||/^magias\.\d+\.ranque$/.test(elemento.dataset.editar)?(elemento.value===''?null:Number(elemento.value)):elemento.value;
      return atualizarCampo(dados,elemento.dataset.editar,novoValor);
    }
    if(elemento.dataset.incremento) {
      const caminho='incrementos.'+elemento.dataset.incremento;
      const valores=(valor(dados,caminho)||[]).filter(item=>item!==elemento.value);
      if(elemento.checked) valores.push(elemento.value);
      definir(dados,caminho,valores);
    }
    if(elemento.dataset.escolha) {
      const tipo=elemento.dataset.escolha;
      dados[tipo]=(dados[tipo]||[]).filter(item=>(typeof item==='string'?item:item.id)!==elemento.value);
      if(elemento.checked) {
        const item=registro(tipo,elemento.value);
        dados[tipo].push({id:elemento.value,nome:item?.nome,tipo:item?.tipo||tipo,...(tipo==='talentos'?escolherAquisicao(dados,item):tipo==='equipamentos'?{quantidade:1}:{nivel:item?.nivel??1,ranque:item?.ranque??item?.nivel??1})});
      }
    }
    return R.normalizar(dados,catalogo);
  }
  function detalhe(tipo,identificador) {
    const item=registro(tipo,identificador); if(!item) return;
    const fonteId=typeof item.fonte==='object'?item.fonte.id:item.fonte||'player-core';
    $('#detalhes-titulo').textContent=item.nome;
    $('#detalhes-conteudo').innerHTML='<p class="mini">'+escapar(fonte(item))+'</p>'+(textoRevisao(item)?'<p class="aviso">'+escapar(textoRevisao(item))+'</p>':'')+'<p>'+escapar(resumo(item))+'</p>'+(item.requisitos?'<p><strong>Requisitos:</strong> '+escapar(typeof item.requisitos==='string'?item.requisitos:JSON.stringify(item.requisitos))+'</p>':'')+'<div class="texto-integral">'+escapar(item.descricao||item.texto||'Texto integral desta referência ainda em revisão.')+'</div>'+(item.progressao?'<h3>Progressão</h3><ul>'+item.progressao.map(ganho=>'<li><strong>Nível '+ganho.nivel+' · '+escapar(ganho.nome)+'</strong><p>'+escapar(ganho.descricao||'')+'</p></li>').join('')+'</ul>':'')+`<a href="/pathfinder-grimorio.html?fonte=${encodeURIComponent(fonteId)}${id?'&ficha='+encodeURIComponent(id):''}#${encodeURIComponent(item.id)}" target="_blank" rel="noopener">Abrir no grimório</a>`;
    $('#detalhes').showModal();
  }
  function d20() {
    const bytes=new Uint32Array(1);let numero;do{crypto.getRandomValues(bytes);numero=bytes[0];}while(numero>=4294967280);return numero%20+1;
  }
  function abrirTeste(nome,indice=null) {
    const calculo=R.calcular(ficha,catalogo);
    const bonus=nome==='ataque'?calculo.ataque+(calculo.map||[0,-5,-10])[indice||0]:calculo.pericias?.[nome]??calculo.salvaguardas?.[nome]??(nome==='ataqueMagia'?calculo.ataqueMagia:calculo.percepcao);
    testeAtual={nome,indice,calculo,bonus};
    $('#rolagem-titulo').textContent=nome==='ataque'?'Ataque '+((indice||0)+1):nome==='ataqueMagia'?'Ataque de magia':nomesPericias[nome]||nomesSalvaguardas[nome]||'Percepção';
    $('#rolagem-contexto').textContent='Bônus automático: '+(bonus>=0?'+':'')+bonus+'. Condições e equipamento da ficha já foram aplicados.';
    $('#rolagem-resultado').textContent='';$('#rolagem-dano').hidden=true;$('#rolagem').showModal();
  }
  function pagarAcoes(custo,acao,aplicar=false) {
    const turno=ficha.turno;if(!turno||turno.encerrado)return true;
    if(!turno.podeAgir)return false;
    const extra=custo===1&&Number(turno.acaoAcelerada||0)>0&&!turno.precisaDefinirRestricoes&&(turno.restricoesAcelerada||[]).includes(acao);
    if(!extra&&Number(turno.acoesGerais||0)<custo)return false;
    if(aplicar){if(extra)turno.acaoAcelerada--;else turno.acoesGerais-=custo;}return true;
  }
  function rolarTeste() {
    if(!testeAtual)return;
    if(testeAtual.nome==='ataque'&&podeEditar&&!pagarAcoes(1,'golpear')){$('#rolagem-resultado').textContent='Não há ação disponível para Golpear, ou uma condição impede agir.';return;}
    const dado=d20(),total=dado+testeAtual.bonus,cdCampo=$('#rolagem-cd');
    if(cdCampo.value!==''&&!cdCampo.reportValidity())return;
    const grau=cdCampo.value!==''?R.grauSucesso(dado,total,Number(cdCampo.value)):null;
    testeAtual.resultado={d20:dado,total,grau};
    if(testeAtual.nome==='ataque'&&podeEditar&&ficha.turno&&!ficha.turno.encerrado){pagarAcoes(1,'golpear',true);ficha.turno.ataquesRealizados=Number(ficha.turno.ataquesRealizados||0)+1;salvar();renderizar();}
    const nomes={'sucesso-critico':'Sucesso crítico',sucesso:'Sucesso',falha:'Falha','falha-critica':'Falha crítica'};
    $('#rolagem-resultado').textContent='d20 '+dado+' '+(testeAtual.bonus>=0?'+':'')+testeAtual.bonus+' = '+total+(grau?' · '+nomes[grau]:'. Informe a CD para resolver também o grau de sucesso.');
    $('#rolagem-dano').hidden=testeAtual.nome!=='ataque'||['falha','falha-critica'].includes(grau);
  }
  function rolarDano() {
    if(!testeAtual?.resultado)return;if(!Combate()){$('#rolagem-resultado').textContent='Não foi possível carregar o módulo de combate. Recarregue antes de executar o dano.';return;}
    const calculo=testeAtual.calculo,arma=calculo.equipamento?.arma||registro('equipamentos',ficha.armaId)||{nome:'Punho',dano:'1d4',tipo:'arma',tipoDano:'contundente',tracos:['agil','acuidade','nao-letal']};
    const plano=Combate().danoArma(arma,calculo,{critico:testeAtual.resultado.grau==='sucesso-critico',modo:ficha.armaModo||undefined,maos:ficha.armaMaos});
    if(!plano.suportado){$('#rolagem-resultado').textContent=plano.motivo||'O efeito desta arma ainda não está disponível para execução automática.';return;}
    const resultado=Combate().rolarDano(plano);
    if(!resultado.suportado){$('#rolagem-resultado').textContent=resultado.motivo;return;}
    const linha=document.createElement('p');linha.textContent='Dano automático: '+resultado.total+' · '+(resultado.formula||plano.formula)+'. O mestre aplica ao alvo; a rolagem não altera outra ficha.';$('#rolagem-resultado').append(linha);
  }
  let magiaAtual=null,magiaResultado=null,magiaOpcoes=[];
  function opcoesConjuracao(identificador,calculo) {
    const item=registro('magias',identificador),conj=calculo.conjuracao;if(!item||!conj||typeof R.magiaElegivel==='function'&&!R.magiaElegivel(ficha,identificador,catalogo))return [];
    const escolha=(ficha.magias||[]).find(m=>(typeof m==='string'?m:m.id)===identificador),truque=item.truque||item.tipo==='truque',foco=item.tipo==='foco',minimo=Number(item.ranque||item.nivel||1),rankAuto=Math.ceil(ficha.nivel/2),opcoes=[];
    if(truque&&escolha&&(!conjuradorPreparado(conj)||(ficha.magiasPreparadas?.truques||[]).includes(identificador)))opcoes.push({fonte:'truque',ranque:rankAuto});
    else if(foco&&escolha&&Number(ficha.focoGasto||0)<Number(conj.foco||0))opcoes.push({fonte:'foco',ranque:rankAuto});
    else if(!truque&&!foco&&escolha) {
      if(conjuradorPreparado(conj))for(const [grupo,limites] of [['padrao',conj.espacos||{}],['curriculo',conj.extraCurriculo||{}]])for(const [ranque,maximo] of Object.entries(limites)) {
        const usadas=ficha.preparacaoGasta?.[grupo]?.[ranque]||[],lista=ficha.magiasPreparadas?.[grupo]?.[ranque]||[];
        for(let i=0;i<Number(maximo);i++)if(lista[i]===identificador&&!usadas.includes(i)&&Number(ranque)>=minimo&&(grupo!=='curriculo'||magiasCurriculo(ficha,ranque).includes(identificador)))opcoes.push({fonte:grupo,ranque:Number(ranque),indice:i});
      }
      else for(const [ranque,maximo] of Object.entries(conj.espacos||{}))if(Number(ranque)>=minimo&&(escolha.assinatura||Number(ranque)===Number(escolha.ranque||minimo))&&Number(ficha.espacosGastos?.[ranque]||0)<Number(maximo))opcoes.push({fonte:'padrao',ranque:Number(ranque)});
    }
    const fd=conj.fonteDivina;if(fd?.magia===identificador&&Number(ficha.fonteDivinaGastos||0)<Number(fd.quantidade||0))opcoes.push({fonte:'fonteDivina',ranque:Number(fd.ranque)});
    return opcoes.map(op=>({...op,chave:[op.fonte,op.ranque,op.indice??'livre'].join(':')}));
  }
  function abrirConjuracao(identificador) {
    if(!podeEditar||guia||enviando)return;
    magiaAtual=registro('magias',identificador);if(!magiaAtual?.efeitoCombate||magiaAtual.somenteConsulta||!Combate())return;
    const calculo=R.calcular(ficha,catalogo);magiaOpcoes=opcoesConjuracao(identificador,calculo);magiaResultado=null;$('#conjurar-aplicar').hidden=true;
    const nomes={padrao:'padrão',curriculo:'currículo',fonteDivina:'Fonte divina',foco:'foco',truque:'truque'},variantes=magiaAtual.efeitoCombate.variantes;
    $('#conjurar-titulo').textContent=magiaAtual.nome;
    $('#conjurar-escolhas').innerHTML='<p>'+escapar(resumo(magiaAtual))+'</p><label>Espaço ou recurso de conjuração<select id="conjurar-ranque" '+(magiaOpcoes.length===1?'disabled':'')+'>'+magiaOpcoes.map(op=>'<option value="'+op.chave+'">Ranque '+op.ranque+' · '+nomes[op.fonte]+(op.indice!==undefined?' · espaço '+(op.indice+1):'')+'</option>').join('')+'</select></label>'+(variantes?'<label>Ações<select id="conjurar-acoes">'+Object.keys(variantes).map(acoes=>'<option value="'+acoes+'">'+acoes+' ação(ões)</option>').join('')+'</select></label>':'')+((magiaAtual.efeitoCombate.exigeAtaque||(magiaAtual.tracos||[]).includes('ataque'))?'<label>CA do alvo informada pelo mestre<input id="conjurar-ataque-cd" type="number" required min="0" max="999"></label>':'')+(magiaAtual.efeitoCombate.salvamentoBasico?'<label>Resultado do salvamento do alvo<select id="conjurar-salvamento"><option value="falha">Falha · efeito integral</option><option value="sucesso">Sucesso · metade</option><option value="falha-critica">Falha crítica · dobro</option><option value="sucesso-critico">Sucesso crítico · sem dano</option></select></label>':'')+'<p class="mini">A ficha calcula ampliação e consome somente o recurso escolhido. A rolagem não altera outra ficha; o mestre aplica ao alvo.</p>';
    $('#conjurar-resultado').textContent=magiaOpcoes.length?'':'Não há espaço preparado ou recurso disponível para esta magia.';$('#conjurar-executar').disabled=!magiaOpcoes.length;$('#conjurar').showModal();
  }
  function executarConjuracao() {
    if(!podeEditar||guia||enviando||!magiaAtual||!Combate())return;
    const selecionada=$('#conjurar-ranque').value,calculo=R.calcular(ficha,catalogo),op=opcoesConjuracao(magiaAtual.id,calculo).find(item=>item.chave===selecionada);
    if(!op){$('#conjurar-resultado').textContent='Este espaço ou recurso não está mais disponível. Nenhum recurso foi alterado.';return;}
    const plano=Combate().magiaEstruturada(magiaAtual,op.ranque,{acoes:Number($('#conjurar-acoes')?.value||0)});
    if(!plano.suportado){$('#conjurar-resultado').textContent=plano.motivo;return;}
    const custo=Number($('#conjurar-acoes')?.value||magiaAtual.acoes||magiaAtual.efeitoCombate.acoes||0);
    if(ficha.turno&&!ficha.turno.encerrado&&(!Number.isInteger(custo)||custo<1||custo>3)){$('#conjurar-resultado').textContent='O custo de ações desta magia ainda não está estruturado na fonte. Nenhum recurso foi alterado.';return;}
    if(!pagarAcoes(custo,'conjurar')){$('#conjurar-resultado').textContent='Não há ações suficientes para conjurar, ou uma condição impede agir.';return;}
    const campoCD=$('#conjurar-ataque-cd');if(plano.exigeAtaque&&(!campoCD||!campoCD.reportValidity()))return;
    const verificacao=Combate().verificarConjuracao(ficha);let ataque=null;
    if(plano.exigeAtaque&&!verificacao.interrompida){const natural=d20(),bonus=calculo.ataqueMagia+(ficha.turno&&!ficha.turno.encerrado?[0,-5,-10][Math.min(2,Number(ficha.turno.ataquesRealizados||0))]:0);ataque={natural,total:natural+bonus,...Combate().grauTeste(natural+bonus,natural,Number(campoCD.value))};}
    const falhouAtaque=ataque&&['falha','falha-critica'].includes(ataque.grau),resultado=verificacao.interrompida||falhouAtaque?{suportado:true,total:0,cura:0,formula:plano.formula}:Combate().rolarMagia(plano,{grauSalvamento:$('#conjurar-salvamento')?.value,critico:ataque?.grau==='sucesso-critico'});
    if(!resultado.suportado){$('#conjurar-resultado').textContent=resultado.motivo;return;}
    magiaResultado=resultado;$('#conjurar-aplicar').hidden=plano.tipoEfeito!=='cura'||verificacao.interrompida;$('#conjurar-aplicar').disabled=false;
    if(op.fonte==='foco')ficha.focoGasto=Number(ficha.focoGasto||0)+1;
    else if(op.fonte==='fonteDivina')ficha.fonteDivinaGastos=Number(ficha.fonteDivinaGastos||0)+1;
    else if(op.fonte!=='truque') {
      if(op.indice!==undefined){ficha.preparacaoGasta??={padrao:{},curriculo:{}};ficha.preparacaoGasta[op.fonte]??={};const usadas=ficha.preparacaoGasta[op.fonte][op.ranque]||[];ficha.preparacaoGasta[op.fonte][op.ranque]=[...usadas,op.indice];}
      const campoGasto=op.fonte==='curriculo'?'espacosCurriculoGastos':'espacosGastos';ficha[campoGasto]={...ficha[campoGasto],[op.ranque]:Number(ficha[campoGasto]?.[op.ranque]||0)+1};
    }
    if(ficha.turno&&!ficha.turno.encerrado){pagarAcoes(custo,'conjurar',true);if(ataque)ficha.turno.ataquesRealizados=Number(ficha.turno.ataquesRealizados||0)+1;}
    if(op.fonte!=='truque'||ficha.turno&&!ficha.turno.encerrado){salvar();renderizar();}
    $('#conjurar-resultado').textContent=(verificacao.interrompida?'Estupefato interrompeu a magia: teste '+verificacao.teste.total+' contra CD '+verificacao.teste.cd+'. ':ataque?'Ataque: d20 '+ataque.natural+', total '+ataque.total+' · '+ataque.grau+'. ':'')+(plano.tipoEfeito==='cura'?'Cura automática':'Dano automático')+': '+resultado.total+' · '+resultado.formula+'.'+(op.fonte==='truque'?' Nenhum espaço gasto.':' O recurso escolhido foi consumido.');$('#conjurar-executar').disabled=true;
  }
  function aplicarCuraConjurada() {
    if(!podeEditar||guia||enviando||!magiaResultado||!Combate())return;
    const atual=copiar(ficha);atual.vida={...atual.vida,maxima:R.calcular(ficha,catalogo).pvMaximos};
    const cura=Combate().curar(atual,magiaResultado.cura,{tipoCura:magiaResultado.tipoCura});
    if(!cura.suportado){$('#conjurar-resultado').textContent=cura.motivo;return;}
    ficha=cura.ficha;magiaResultado=null;$('#conjurar-aplicar').disabled=true;salvar();renderizar();
    $('#conjurar-resultado').textContent+=' '+cura.recuperadoPV+' PV recuperado(s) nesta ficha.';
  }
  function aplicarVida(cura,bloquear=false) {
    const campoQuantidade=$('#quantidade-vida'); if(!campoQuantidade||!campoQuantidade.reportValidity()) return;
    const quantidade=Number(campoQuantidade.value), calculo=R.calcular(ficha,catalogo);
    if(!Number.isSafeInteger(quantidade)||quantidade<0||quantidade>1000000){avisar('Informe um valor inteiro entre 0 e 1.000.000.');return;}
    if(!cura&&$('#dano-critico')?.checked&&!$('#dano-ja-final')?.checked&&quantidade>500000){avisar('O dano-base crítico ultrapassa o limite de execução.');return;}
    if(!Combate()){avisar('Não foi possível carregar o módulo de combate. Recarregue antes de alterar os PV.');return;}
    const atual=copiar(ficha);atual.vida={...atual.vida,maxima:calculo.pvMaximos};
    const critico=$('#dano-critico')?.checked===true,final=$('#dano-ja-final')?.checked===true,valor=critico&&!final?Combate().rolar(String(quantidade)+'*2').total:quantidade;
    const partes=[{tipo:$('#dano-tipo')?.value||'sem-tipo',valor,valorSemDobra:quantidade}],opcoes={danoFinal:final,defesas:calculo.defesas,limiteMorrendo:calculo.limiteMorrendo,critico,naoLetal:$('#dano-nao-letal')?.checked===true};
    if(bloquear&&typeof Combate().bloqueioEscudo!=='function'){avisar('Não foi possível carregar o cálculo de Bloqueio com Escudo. Recarregue a ficha.');return;}
    const resultado=cura?Combate().curar(atual,quantidade):bloquear?Combate().bloqueioEscudo(atual,calculo,partes,{...opcoes,ataque:$('#dano-ataque')?.checked===true}):Combate().aplicarDano(atual,partes,opcoes);
    if(!resultado.suportado){avisar(resultado.motivo||'Este efeito não pôde ser aplicado.');return;}
    ficha=resultado.ficha;
    if(bloquear){ficha.estadoEscudos??={};ficha.estadoEscudos[ficha.escudoId]={...ficha.estadoEscudos[ficha.escudoId],pv:ficha.escudoPv,quebrado:ficha.escudoQuebrado===true,destruido:ficha.escudoDestruido===true};avisar('Bloqueio: dureza reduziu '+resultado.reducaoDureza+' de dano; personagem recebeu '+resultado.danoPersonagem+' e escudo recebeu '+resultado.danoEscudo+'. '+(resultado.escudo.destruido?'Escudo destruído.':resultado.escudo.quebrado?'Escudo quebrado.':'Escudo íntegro.'));}
    if(resultado.avisos?.length)avisar(resultado.avisos.join(' '));
    salvar(); renderizar();
  }
  function resolverTurno(inicio) {
    if(!podeEditar||guia||enviando||!Combate())return;
    if(inicio&&ficha.turno&&!ficha.turno.encerrado){avisar('Finalize o turno atual antes de iniciar outro.');return;}
    if(!inicio&&(!ficha.turno||ficha.turno.encerrado)){avisar('Inicie seu turno antes de finalizar.');return;}
    const calculo=R.calcular(ficha,catalogo),antes=semSegredos(ficha);delete antes._ultimoTurnoSnapshot;
    const atual=copiar(ficha);atual.vida={...atual.vida,maxima:calculo.pvMaximos};
    const resultado=inicio?Combate().iniciarTurno(atual,{limiteMorrendo:calculo.limiteMorrendo,cdRecuperacaoAjuste:calculo.cdRecuperacaoAjuste}):Combate().finalizarTurno(atual,{defesas:calculo.defesas});
    if(!resultado.suportado){avisar(resultado.motivo||'Não foi possível resolver os efeitos do turno.');return;}
    ficha=resultado.ficha;ficha._ultimoTurnoSnapshot=antes;salvar();renderizar();
    avisar(inicio?'Turno iniciado.'+(resultado.recuperacao?' Recuperação: '+resultado.recuperacao.total+' contra CD '+resultado.recuperacao.cd+' · '+resultado.recuperacao.grau+'.':''):'Turno finalizado.'+(resultado.danosPersistentes?.length?' '+resultado.danosPersistentes.map(p=>tiposDano[p.tipo]+': '+p.valor+' de dano, teste '+p.recuperacao.total+' contra CD '+p.recuperacao.cd+(p.recuperacao.sucesso?' · removido.':' · continua.')).join(' '):''));
  }
  function consumirItem(indice) {
    if(!podeEditar||guia||enviando||!Combate())return;
    const escolha=ficha.equipamentos?.[indice],item=registro('equipamentos',typeof escolha==='string'?escolha:escolha?.id),mecanica=item?.mecanica;
    if(!escolha||!mecanica||mecanica.acao!=='curar'||item.somenteConsulta||item.automatizavel===false||quantidadeItem(escolha)<Number(mecanica.consomeQuantidade||1))return;
    const ingestao=Combate().podeIngerir(ficha);if(!ingestao.permitido){avisar(ingestao.motivo);return;}
    try {
      const rolagem=Combate().rolar(mecanica.cura.expressao),atual=copiar(ficha);atual.vida={...atual.vida,maxima:R.calcular(ficha,catalogo).pvMaximos};
      const cura=Combate().curar(atual,rolagem.total,{tipoCura:mecanica.tipoCura});
      if(!cura.suportado){avisar(cura.motivo);return;}
      ficha=cura.ficha;ficha.equipamentos[indice]=typeof escolha==='string'?{id:escolha,quantidade:0}:{...escolha,quantidade:quantidadeItem(escolha)-Number(mecanica.consomeQuantidade||1)};
      salvar();renderizar();avisar(item.nome+': '+rolagem.total+' de cura rolada; '+cura.recuperadoPV+' PV recuperados. Um exemplar foi consumido.');
    }catch{avisar('A fórmula desta poção não pôde ser executada. Nenhum item foi consumido.');}
  }
  let iniciativaEnviando=false;
  async function declararIniciativa() {
    if(!podeEditar||guia||enviando||iniciativaEnviando)return;
    const dadoCampo=$('#iniciativa-dado');if(!dadoCampo.reportValidity())return;
    const nome=$('#iniciativa-base').value,dado=dadoCampo.value===''?d20():Number(dadoCampo.value),calculo=R.calcular(ficha,catalogo),bonus=(nome==='percepcao'?calculo.percepcao:calculo.pericias[nome])+Number(calculo.bonusIniciativa||0),resultado=dado+bonus;
    if(!Number.isInteger(dado)||dado<1||dado>20||!Number.isInteger(resultado))return;
    if(!id){avisar('Iniciativa: d20 '+dado+' '+(bonus>=0?'+':'')+bonus+' = '+resultado+'. Salve a ficha no Hub para declarar à mesa.');return;}
    iniciativaEnviando=true;
    try {
      if(!await salvarAgora())return;
      const resposta=await fetch('/api/personagens/'+encodeURIComponent(id)+'/iniciativa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resultado})});
      const corpo=await resposta.json();
      if(!resposta.ok||!corpo.ok||!corpo.declaracao)throw new Error(corpo.erro||'Não foi possível declarar a iniciativa.');
      avisar('Iniciativa declarada: '+corpo.declaracao.nome+' · '+corpo.declaracao.resultado+' (d20 '+dado+' '+(bonus>=0?'+':'')+bonus+').');
    }catch(erro){avisar(erro.message);}finally{iniciativaEnviando=false;}
  }
  function executarAcao(evento) {
    const elemento=evento.target.closest('[data-acao]'); if(!elemento) return;
    const acao=elemento.dataset.acao;
    if(acao==='detalhe') { const [tipo,...resto]=elemento.dataset.valor.split(':'); detalhe(tipo,resto.join(':')); }
    else if(acao==='exportar-turno-anterior'&&ficha._ultimoTurnoSnapshot)exportar(ficha._ultimoTurnoSnapshot,'antes-do-turno');
    else if(acao==='consumir-item') consumirItem(Number(elemento.dataset.valor));
    else if(acao==='declarar-iniciativa') declararIniciativa();
    else if(acao==='teste') abrirTeste(elemento.dataset.valor);
    else if(acao==='conjurar') abrirConjuracao(elemento.dataset.valor);
    else if(acao==='ataque') abrirTeste('ataque',Number(elemento.dataset.valor));
    else if(podeEditar&&!guia&&!enviando) {
      if(acao==='iniciar-turno'||acao==='finalizar-turno')resolverTurno(acao==='iniciar-turno');
      else if(acao==='gastar-acao'||acao==='gastar-reacao'){if(ficha.turno&&!ficha.turno.encerrado&&ficha.turno.podeAgir){const campo=acao==='gastar-acao'?'acoesGerais':'reacoes';ficha.turno[campo]=Math.max(0,Number(ficha.turno[campo]||0)-1);salvar();renderizar();}}
      else if(acao==='adicionar-persistente'){ficha.danosPersistentes??=[];ficha.danosPersistentes.push({id:crypto.randomUUID(),tipo:'',formula:'',cdRecuperacao:15});salvar();renderizar();}
      else if(acao==='remover-persistente'){ficha.danosPersistentes.splice(Number(elemento.dataset.valor),1);salvar();renderizar();}
      else if(acao==='furia') {
        ficha.estados??={};const ativo=ficha.estados.furia===true;ficha.estados.furia=!ativo;
        if(!ativo){const recurso=(R.calcular(ficha,catalogo).recursosCalculados||[]).find(r=>r.substituiPVTemporarios);if(recurso&&Number(ficha.vida.temporaria||0)<recurso.maximo){ficha.vida.temporaria=recurso.maximo;ficha.vida.fonteTemporaria='furia';}}
        else if(ficha.vida.fonteTemporaria==='furia'){ficha.vida.temporaria=0;delete ficha.vida.fonteTemporaria;}
        salvar();renderizar();
      }
      else if(['gastar-recurso','recuperar-recurso','renovar-recurso'].includes(acao)) {
        const recurso=(R.calcular(ficha,catalogo).recursosCalculados||[]).find(r=>r.id===elemento.dataset.valor);if(!recurso)return;
        const gasto=Math.max(0,Number(ficha.recursosGastos?.[recurso.id]||0)),novo=acao==='gastar-recurso'?Math.min(recurso.maximo,gasto+1):acao==='recuperar-recurso'?Math.max(0,gasto-Number(recurso.recuperacao?.quantidade||0)):0;
        ficha.recursosGastos={...ficha.recursosGastos,[recurso.id]:novo};salvar();renderizar();
      }
      else if(acao==='dano'||acao==='curar') aplicarVida(acao==='curar');
      else if(acao==='bloquear-escudo') aplicarVida(false,true);
      else if(acao==='adicionar-condicao') { ficha.condicoes.push({id:'assustado',valor:1}); salvar(); renderizar(); }
      else if(acao==='gastar-espaco') {const c=R.calcular(ficha,catalogo),ranque=elemento.dataset.valor,maximo=Number(c.conjuracao?.espacos?.[ranque]||0),usado=Number(ficha.espacosGastos?.[ranque]||0);if(usado<maximo){ficha.espacosGastos={...ficha.espacosGastos,[ranque]:usado+1};salvar();renderizar();}}
      else if(acao==='gastar-curriculo'){const c=R.calcular(ficha,catalogo),ranque=elemento.dataset.valor,maximo=Number(c.conjuracao?.extraCurriculo?.[ranque]||0),usado=Number(ficha.espacosCurriculoGastos?.[ranque]||0);if(usado<maximo){ficha.espacosCurriculoGastos={...ficha.espacosCurriculoGastos,[ranque]:usado+1};salvar();renderizar();}}
      else if(acao==='gastar-fonte-divina'){const c=R.calcular(ficha,catalogo),maximo=Number(c.conjuracao?.fonteDivina?.quantidade||0),usado=Number(ficha.fonteDivinaGastos||0);if(usado<maximo){ficha.fonteDivinaGastos=usado+1;salvar();renderizar();}}
      else if(acao==='gastar-foco'){const maximo=Number(R.calcular(ficha,catalogo).conjuracao?.foco||0),gasto=Number(ficha.focoGasto||0);if(gasto<maximo){ficha.focoGasto=gasto+1;salvar();renderizar();}}
      else if(acao==='refocar'){ficha.focoGasto=Math.max(0,Number(ficha.focoGasto||0)-1);salvar();renderizar();}
      else if(acao==='recuperar-espacos'){ficha.preparacaoGasta={padrao:{},curriculo:{}};ficha.focoGasto=0;ficha.espacosGastos={};ficha.espacosCurriculoGastos={};ficha.fonteDivinaGastos=0;salvar();renderizar();}
      else if(acao==='remover-condicao') { ficha.condicoes.splice(Number(elemento.dataset.valor),1); salvar(); renderizar(); }
    }
  }
  function filtrar(evento) {
    if(!evento.target.dataset.busca) return;
    const termo=evento.target.value.toLocaleLowerCase('pt-BR');
    for(const item of evento.target.closest('.card').querySelectorAll('[data-filtro]')) item.hidden=!item.dataset.filtro.includes(termo);
  }
  function guardarGuia() { if(guia&&podeEditar) guardar(chave('guia'),{...guia,dados:semSegredos(guia.dados)}); }
  async function abrirGuia(tipo) {
    if(!podeEditar||!await salvarAgora()) return;
    if(tipo==='evolucao'&&progressaoPermitida&&ficha.nivel>=progressaoPermitida.nivelMaximo) { avisar('A evolução aguarda XP suficiente ou autorização do mestre.'); return; }
    const pausado=ler(chave('guia'));
    if(pausado?.tipo===tipo&&pausado.base===versao&&pausado.baseSerial===serialBase()) guia={...pausado,dados:{...copiar(ficha),...pausado.dados}};
    else {
      if(pausado) { avisar('Existe um guia pausado de outro modo ou versão. Exporte ou descarte esse guia pelos botões da ficha; suas escolhas foram preservadas.'); return; }
      const novosDados=tipo==='evolucao'?R.evoluir(copiar(ficha),Math.min(20,ficha.nivel+1),catalogo):copiar(ficha);
      guia={tipo,base:versao,baseSerial:serialBase(),dados:novosDados,passo:tipo==='evolucao'?4:Math.max(0,Math.min(7,ficha._guiado?.passo||0)),operacao:crypto.randomUUID()};
    }
    guardarGuia(); renderizar(); renderizarGuia(); $('#guia').showModal();
  }
  function compararEvolucao(dados) {
    const antes=R.calcular(ficha,catalogo), depois=R.calcular(dados,catalogo);
    const linhas=[['Nível',ficha.nivel,dados.nivel],['PV máximos',antes.pvMaximos,depois.pvMaximos],['CA',antes.ca,depois.ca],['Percepção',antes.percepcao,depois.percepcao],['CD da classe',antes.cdClasse,depois.cdClasse],...Object.keys(nomesAtributos).map(nome=>[nomesAtributos[nome],antes.atributos[nome],depois.atributos[nome]]),...Object.keys(nomesPericias).filter(nome=>antes.pericias[nome]!==depois.pericias[nome]).map(nome=>[nomesPericias[nome],antes.pericias[nome],depois.pericias[nome]])];
    return '<section class="card"><h2>Antes e depois</h2><div class="grade">'+linhas.map(([nome,a,b])=>'<div><strong>'+escapar(nome)+'</strong><p>'+escapar(a)+' → '+escapar(b)+'</p></div>').join('')+'</div><h3>Ganhos deste avanço</h3><ul>'+(dados._evolucao?.ganhos||[]).map(item=>'<li>'+escapar(item.nome)+'<p class="mini">'+escapar(item.descricao||'')+'</p></li>').join('')+'</ul><p class="mini">A evolução aumenta o limite de PV; não cura ferimentos nem recupera recursos.</p></section>';
  }
  function conteudoGuia() {
    const dados=guia.dados, ancestral=registro('ancestralidades',dados.ancestralidadeId), atualClasse=classe(dados);
    const herancas=[...(ancestral?.herancas||[]),...(catalogo.herancasVersateis||[])];
    if(guia.passo===0) return `<section class="card"><h2>Quem é seu personagem?</h2>${campo(dados,'Nome','nome')}${campo(dados,'Conceito, objetivo ou história','historia','textarea')}<p class="mini">Retomar preserva a mesma ficha, o mesmo ID e suas escolhas atuais.</p></section>`;
    if(guia.passo===1) return `<section class="card"><h2>Ancestralidade e herança</h2>${campo(dados,'Ancestralidade','ancestralidadeId','select',{valores:opcoesLista(catalogo.ancestralidades)})}${ajuda('ancestralidades',dados.ancestralidadeId)}${campo(dados,'Herança','herancaId','select',{valores:opcoesLista(herancas)})}${descricaoOpcao(herancas.find(item=>item.id===dados.herancaId))}${escolhasHeranca(dados)}</section>`;
    if(guia.passo===2) return `<section class="card"><h2>Biografia</h2>${campo(dados,'Biografia','biografiaId','select',{valores:opcoesLista(catalogo.biografias)})}${ajuda('biografias',dados.biografiaId)}${escolhasBiografia(dados)}</section>`;
    if(guia.passo===3) return `<section class="card"><h2>Classe e especialização</h2>${campo(dados,'Classe','classeId','select',{valores:opcoesLista(catalogo.classes)})}${ajuda('classes',dados.classeId)}${campo(dados,'Especialização','opcaoClasseId','select',{valores:opcoesLista(atualClasse?.opcoes)})}${descricaoOpcao(opcao(dados))}${campo(dados,'Atributo-chave','atributoChave','select',{valores:[['','Escolha'],...atributosChave(dados).map(nome=>[nome,nomesAtributos[nome]])]})}${campo(dados,'Escolhas particulares da classe','escolhasClasseNotas','textarea')}</section>${escolhasClasse(dados)}`;
    if(guia.passo===4) return camposAtributos(dados);
    if(guia.passo===5) return camposPericias(dados);
    if(guia.passo===6) return camposOpcoes(dados);
    return camposRevisao(dados)+(guia.tipo==='evolucao'?compararEvolucao(dados):'')+`<p>Confirmar salva o nível ${dados.nivel} e suas escolhas uma única vez sobre a versão conferida.</p>`;
  }
  function renderizarGuia() {
    if(!guia) return;
    $('#guia-titulo').textContent=guia.tipo==='evolucao'?`Evoluir · nível ${ficha.nivel} → ${guia.dados.nivel}`:'Criar e revisar personagem';
    $('#guia-contexto').textContent='Rascunho independente. Pausar guarda as escolhas; descartar mantém a ficha atual intacta.';
    $('#guia-passos').innerHTML=etapas.map((nome,i)=>`<button type="button" data-passo="${i}" aria-current="${guia.passo===i?'step':'false'}" ${guia.tipo==='evolucao'&&i<4?'disabled':''}>${i+1}. ${nome}</button>`).join('');
    escreverHTML($('#guia-conteudo'),conteudoGuia()); $('#guia-aviso').textContent='';
    $('#guia-voltar').disabled=guia.passo<=(guia.tipo==='evolucao'?4:0)||enviando;
    $('#guia-proximo').hidden=guia.passo===7; $('#guia-confirmar').hidden=guia.passo!==7; $('#guia-confirmar').disabled=enviando;
  }
  function mudarPasso(numero) {
    if(!guia||enviando) return;
    guia.passo=Math.max(guia.tipo==='evolucao'?4:0,Math.min(7,numero));
    guia.dados._guiado={...guia.dados._guiado,passo:guia.passo};
    guardarGuia(); renderizarGuia(); $('#guia').scrollTop=0;
  }
  function fecharGuia(descartar=false) {
    if(enviando) return;
    if(descartar) remover(chave('guia')); else guardarGuia();
    guia=null; $('#guia').close(); renderizar();
  }
  async function confirmarGuia() {
    if(!guia||enviando||!podeEditar) return;
    if(conflito||guia.base!==versao||guia.baseSerial!==serialBase()) { $('#guia-aviso').textContent='A ficha mudou desde a abertura. Preserve seu rascunho antes de recarregar; ele não será aplicado sobre outra versão.'; return; }
    if(guia.tipo==='evolucao') {
      const antes=R.calcular(ficha,catalogo).grausPericias,depois=R.calcular(guia.dados,catalogo).grausPericias;
      const registros=Object.keys(guia.dados.pericias||{}).filter(id=>Number(guia.dados.pericias[id]||0)>Number(ficha.pericias?.[id]||0)&&Number(depois[id]||0)>Number(antes[id]||0)).map(id=>({id,antes:Number(antes[id]||0),depois:Number(depois[id]||0)}));
      guia.dados.incrementosPericias={...guia.dados.incrementosPericias,[guia.dados.nivel]:registros};guardarGuia();
    }
    const resultado=validacao(guia.dados);
    if(resultado.erros.length||resultado.pendencias.length||resultado.valido===false) { $('#guia-aviso').textContent=[...resultado.erros,...resultado.pendencias].join(' · ')||'Revise as escolhas antes de concluir.'; return; }
    const novosDados=copiar(guia.dados), pvMaximos=R.calcular(novosDados,catalogo).pvMaximos;
    novosDados._guiado={...novosDados._guiado,concluido:true,passo:7}; novosDados._operacaoGuiada=guia.operacao;
    novosDados.vida={...novosDados.vida,maxima:pvMaximos};
    if(!ficha._guiado?.concluido&&guia.tipo==='criacao') novosDados.vida.atual=pvMaximos;
    enviando=true; $('#guia-confirmar').disabled=true; $('#guia-aviso').textContent='Conferindo e salvando a versão…'; guardarGuia();
    try {
      ficha=await persistir(novosDados,guia.base,guia.operacao);
      pendente=false; remover(chave('guia')); remover(chave('recuperacao')); guia=null;
      $('#guia').close(); $('#status').textContent='Guia concluído · salvo ✓'; avisar('Escolhas aplicadas à mesma ficha.'); renderizar();
    } catch(erro) { $('#guia-aviso').textContent=erro.message; guardarGuia(); }
    finally { enviando=false; $('#guia-confirmar').disabled=conflito; }
  }
  function exportar(dados,nome='personagem') {
    const seguros=semSegredos(dados), link=document.createElement('a'), url=URL.createObjectURL(new Blob([JSON.stringify(seguros,null,2)],{type:'application/json'}));
    link.href=url; link.download='pathfinder-'+(seguros.nome||nome).replace(/[^\p{L}\p{N}_-]/gu,'-')+'.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function opcoesImpressas(dados) {
    return [['talentos','Talentos'],['magias','Magias'],['equipamentos','Equipamento de referência']].map(([tipo,titulo])=>'<section class="card"><h2>'+titulo+'</h2>'+(dados[tipo]||[]).map(escolha=>{const item=registro(tipo,typeof escolha==='string'?escolha:escolha.id);return '<p><strong>'+escapar(item?.nome||escolha.nome||escolha.id||escolha)+'</strong>'+(tipo==='equipamentos'?' · quantidade '+quantidadeItem(escolha):'')+(resumo(item)?' · '+escapar(resumo(item)):'')+'</p>';}).join('')+'</section>').join('');
  }
  function imprimir() {
    if(!ficha) return;
    escreverHTML($('#ficha'),camposSessao(ficha)+camposIdentidade(ficha)+camposDefesa(ficha)+camposAtributos(ficha)+camposPericias(ficha)+opcoesImpressas(ficha)+camposRevisao(ficha)+'<section class="card"><h2>Jornada</h2><div class="texto-integral">'+escapar(ficha.historia||'')+'\n'+escapar(ficha.notas||'')+'</div></section>');
    window.print(); renderizar();
  }
  $('#ficha').addEventListener('change',evento=>{
    if(renderizando||!podeEditar||guia||!evento.target.matches('[data-editar],[data-incremento],[data-escolha]')) return;
    ficha=mudar(evento,ficha); salvar(); renderizar();
  });
  $('#ficha').addEventListener('input',filtrar); $('#ficha').addEventListener('click',executarAcao);
  $('#abas').onclick=evento=>{ if(evento.target.dataset.aba) { aba=evento.target.dataset.aba; renderizar(); } };
  $('#guia-conteudo').addEventListener('change',evento=>{
    if(renderizando||!guia||enviando||!evento.target.matches('[data-editar],[data-incremento],[data-escolha]')) return;
    guia.dados=mudar(evento,guia.dados); guardarGuia(); renderizarGuia();
  });
  $('#guia-conteudo').addEventListener('input',filtrar); $('#guia-conteudo').addEventListener('click',executarAcao);
  $('#guia-form').onsubmit=evento=>evento.preventDefault();
  $('#guia-passos').onclick=evento=>{if(evento.target.dataset.passo) mudarPasso(Number(evento.target.dataset.passo));};
  $('#guia-voltar').onclick=()=>mudarPasso(guia.passo-1); $('#guia-proximo').onclick=()=>mudarPasso(guia.passo+1);
  $('#guia-fechar').onclick=()=>fecharGuia(); $('#guia-cancelar').onclick=()=>fecharGuia(true);
  $('#guia').addEventListener('cancel',evento=>{evento.preventDefault(); fecharGuia();});
  $('#guia-confirmar').onclick=confirmarGuia; $('#guia-exportar').onclick=()=>{if(guia) exportar(guia.dados,'rascunho');};
  $('#criar').onclick=()=>abrirGuia('criacao'); $('#evoluir').onclick=()=>{if(ficha.nivel<20) abrirGuia('evolucao');};
  $('#salvar').onclick=salvarAgora; $('#imprimir').onclick=imprimir; $('#detalhes-fechar').onclick=()=>$('#detalhes').close();
  $('#conjurar-aplicar').onclick=aplicarCuraConjurada;
  $('#conjurar-fechar').onclick=()=>$('#conjurar').close();$('#conjurar-executar').onclick=executarConjuracao;
  $('#rolagem-fechar').onclick=()=>$('#rolagem').close();$('#rolagem-rolar').onclick=rolarTeste;$('#rolagem-dano').onclick=rolarDano;
  $('#exportar').onclick=()=>{if(ficha) exportar(guia?.dados||ficha);};
  $('#exportar-guia-pausado').onclick=()=>{const pausado=ler(chave('guia'));if(pausado) exportar(pausado.dados,'guia-pausado');};
  $('#descartar-guia-pausado').onclick=()=>{if(guia||enviando)return;remover(chave('guia'));botoesRascunho();avisar('Guia pausado descartado. Sua ficha permanece intacta.');};
  $('#importar').onchange=async evento=>{
    const arquivo=evento.target.files?.[0]; if(!arquivo||!podeEditar||guia) return;
    try {
      if(enviando) throw new Error('Aguarde o salvamento atual antes de importar.');
      if(arquivo.size>2*1024*1024) throw new Error('Importe um JSON de até 2 MB.');
      const dados=JSON.parse(await arquivo.text()); if(dados.sistema!=='pathfinder-2e-remaster') throw new Error('O arquivo não é uma ficha Pathfinder 2e Remaster.');
      const importados=semSegredos(dados);
      for(const nome of ['xp','_operacaoGuiada','_evolucao','proficienciasAprovadasPeloMestre','periciasAprovadasPeloMestre']) delete importados[nome];
      if(id) importados.nivel=ficha.nivel;
      ficha=R.normalizar({...ficha,...importados},catalogo); salvar(); renderizar();
      avisar('Importação na mesma ficha. Permissões, XP e segredos não foram importados; revise as escolhas.');
    } catch(erro) { avisar(erro.message); } finally { evento.target.value=''; }
  };
  window.addEventListener('beforeunload',evento=>{if(pendente||enviando){evento.preventDefault();evento.returnValue='';}});
  async function iniciar() {
    try {
      if(!R) throw new Error('O módulo de regras não carregou. Recarregue a página.');
      const fontes=await Promise.all(['/pathfinder/player-core-catalogo.json','/pathfinder/player-core-2-catalogo.json','/pathfinder/gm-core.json'].map(async url=>{const resposta=await fetch(url);if(!resposta.ok)throw new Error('Não foi possível carregar '+url);return resposta.json();}));
      catalogo=Object.fromEntries(['classes','ancestralidades','biografias','talentos','magias','equipamentos','herancasVersateis','dominios','divindades'].map(tipo=>[tipo,fontes.flatMap(fonte=>fonte[tipo]||[])]));
      for(const tipo of Object.keys(catalogo)) { const vistos=new Set(); catalogo[tipo]=catalogo[tipo].filter(item=>item&&typeof item.id==='string'&&!vistos.has(item.id)&&vistos.add(item.id)); }
      $('#cobertura').textContent=fontes.map(fonte=>(fonte.fonte?.nome||'Fonte')+': '+(fonte.fonte?.estado==='completo'?'conteúdo integral revisado':'conteúdo parcial em revisão')).join(' · ')+'. Referências ausentes não são tratadas como escolhas concluídas.';
      if(id) {
        if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Identificador de ficha inválido.');
        const resposta=await fetch('/api/personagens/'+encodeURIComponent(id));
        if(!resposta.ok) throw new Error(resposta.status===401?'Entre na sua conta para abrir esta ficha.':'Não foi possível abrir esta ficha ('+resposta.status+').');
        const corpo=await resposta.json(), personagem=corpo.personagem;
        if(!personagem) throw new Error('Resposta de ficha inválida.');
        if(personagem.sistema&&personagem.sistema!=='pathfinder-2e-remaster') throw new Error('Esta ficha pertence a outro sistema. Abra pelo Hub para preservar seus dados.');
        podeEditar=personagem.podeEditar===true; ehMestre=personagem.ehMestre===true;
        versao=personagem.atualizadoEm; progressaoPermitida=corpo.progressaoPermitida||personagem.progressaoPermitida||null;
        ficha=R.normalizar({...personagem.dados,nome:personagem.dados?.nome||personagem.nome},catalogo); if(!ehMestre)delete ficha._mestre;
        $('#voltar').href='/fichas'; $('#voltar').textContent='← Fichas'; $('#grimorio').href='/pathfinder-grimorio.html?ficha='+encodeURIComponent(id);
        $('#modo').textContent=podeEditar?'Modo Hub · salvamento na conta com proteção de versão.':'Somente leitura · nenhuma alteração é enviada.';
        const recuperacao=ler(chave('recuperacao'));
        if(podeEditar&&recuperacao) {
          const botao=document.createElement('button'); botao.textContent='Recuperar edições não salvas';
          botao.onclick=()=>{if(guia||recuperacao.versao!==versao){avisar('Rascunho de outra versão. Não será aplicado automaticamente; compare com sua ficha atual.');return;}ficha=R.normalizar({...ficha,...semSegredos(recuperacao.dados)},catalogo);salvar();renderizar();botao.remove();};
          $('#acoes').append(botao); avisar('Foi encontrado um rascunho não salvo. A ficha da conta permanece preservada.');
        }
      } else {
        localId=parametros.get('local')||ler('hub_pf2_ultima_local_v1')||crypto.randomUUID();
        if(typeof localId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(localId)) localId=crypto.randomUUID();
        guardar('hub_pf2_ultima_local_v1',localId); $('#seletor').innerHTML='<option value="'+escapar(localId)+'">Ficha local</option>';
        ficha=R.normalizar(ler(chave('ficha'))||R.criar(catalogo),catalogo); podeEditar=true; versao='local:'+JSON.stringify(ficha);
        $('#modo').textContent='Modo local · salvo apenas neste navegador. Exporte uma cópia ou crie sua ficha na conta do Hub.';
      }
      $('#status').textContent=podeEditar?'Ficha carregada':'Somente leitura'; renderizar();
      const pausado=ler(chave('guia'));
      if(podeEditar&&pausado?.operacao&&ficha._operacaoGuiada===pausado.operacao) { remover(chave('guia'));botoesRascunho();avisar('O guia já foi aplicado pelo servidor. A evolução não foi repetida.'); }
      else if(podeEditar&&pausado) avisar('Há um guia pausado. Abra o mesmo modo para retomar sem recriar sua ficha.');
    } catch(erro) {
      $('#status').textContent='Não foi possível carregar'; avisar(erro.message); $('#ficha').setAttribute('aria-busy','false');
      escreverHTML($('#ficha'),'<section class="card"><h2>Sua ficha foi preservada</h2><p>Nenhuma edição foi enviada. Recarregue quando a conexão e as fontes estiverem disponíveis.</p></section>');
    }
  }
  iniciar();
})();
