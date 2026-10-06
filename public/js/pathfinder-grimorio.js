'use strict';
(()=>{
const $=id=>document.getElementById(id), params=new URLSearchParams(location.search), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categorias={secoes:'Regras',classes:'Classes',ancestralidades:'Ancestralidades',biografias:'Biografias',divindades:'Divindades',dominios:'Domínios',talentos:'Talentos',magias:'Magias',equipamentos:'Equipamentos',criaturas:'Bestas',tabelas:'Tabelas'};
const guias=[
 ['criar','Criar seu personagem',['Escolha ancestralidade, herança, biografia e classe. Leia o que cada escolha concede antes de confirmar.','Distribua os incrementos de ancestralidade e biografia, o incremento no atributo-chave da classe e quatro incrementos livres em atributos diferentes. É possível usar dois incrementos livres na ancestralidade no lugar da distribuição padrão.','Escolha as perícias treinadas, talentos e magias exigidos no primeiro nível. Você começa com 15 peças de ouro para equipamento.','O guia mantém um rascunho. Confirme somente quando todas as escolhas obrigatórias estiverem preenchidas. Cancelar mantém sua ficha salva.']],
 ['testes','Testes e quatro graus',['Role 1d20 e some o atributo, a proficiência e os bônus aplicáveis. Compare o total com a CD.','Total igual ou superior à CD: sucesso. Total 10 ou mais acima: sucesso crítico. Abaixo da CD: falha. Total 10 ou mais abaixo: falha crítica.','20 natural melhora o resultado em um grau; 1 natural piora em um grau. O total ainda determina o grau inicial.']],
 ['proficiencias','Proficiências',['Destreinado: bônus 0, sem acrescentar nível. Treinado: nível +2. Especialista: nível +4. Mestre: nível +6. Lendário: nível +8.','Acrescente o modificador do atributo e os bônus de item, circunstância e estado aplicáveis. Bônus do mesmo tipo não se somam: use o maior. Penalidades seguem suas regras próprias.','Graduações de classe, perícias, armas e armaduras são diferentes. A especialização em um grupo de armas não concede a mesma graduação a todas as armas.']],
 ['combate','Três ações e uma reação',['No seu turno você normalmente tem três ações. Atividades podem consumir uma, duas ou três. Reações dependem de um gatilho e geralmente ficam disponíveis novamente no início do seu turno.','Ataques múltiplos no mesmo turno sofrem penalidade: primeiro 0, segundo −5, terceiro e seguintes −10. Com arma ágil: 0, −4, −8. Manobras com o traço ataque também contam.','Deslocar-se, sacar e usar equipamentos podem consumir ações. Leia as ações específicas; nem toda habilidade funciona como ataque ou reação.']],
 ['vida','Vida e condições',['PV máximos = PV da ancestralidade/herança + nível × (PV da classe + modificador de Constituição). A mudança em Constituição vale para todos os níveis.','PV temporários são separados dos PV atuais e normalmente não se acumulam. Ganhar um nível não cura automaticamente seu personagem.','Condições modificam testes e defesas conforme suas próprias regras. Assustado aplica penalidade de estado igual ao valor da condição; condições de mesmo tipo não devem duplicar a penalidade.']],
 ['evoluir','Evoluir com segurança',['Ao atingir 1.000 XP, aumente um nível e desconte 1.000 XP. Na campanha, a ficha respeita XP e níveis autorizados pelo mestre.','O guia apresenta os ganhos da classe e as escolhas daquele nível: talentos, perícias, magias e incrementos nos níveis 5, 10, 15 e 20.','Um incremento leva um atributo abaixo de +4 para o próximo modificador. A partir de +4, são necessários dois incrementos em níveis diferentes para aumentar o modificador em +1.','A evolução fica em rascunho até confirmar. Cancelar não altera a ficha. Se outra pessoa salvou a ficha durante o guia, o sistema pede revisão em vez de sobrescrever a nova versão.']],
 ['fontes','Livros e escolhas do mestre',['Este sistema usa somente Pathfinder 2e Remaster: Player Core, Player Core 2, GM Core e Monster Core. O Livro Básico antigo não é misturado.','Raridade, artefatos, regras opcionais e concessões especiais dependem da decisão do mestre. Consultar uma referência não adiciona automaticamente um benefício à ficha.','Cada livro informa o conteúdo revisado e as lacunas. Registros apenas indexados servem para consulta à página de origem e não para conceder regras automaticamente.']]
].map(([id,nome,resumo])=>({id,nome,resumo,tipo:'Regras'}));
let todos=[], visiveis=[], dados={}, geracao=0;
const lista=v=>Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):[];
function frases(valor){return (typeof valor==='string'?[valor]:lista(valor)).map(x=>typeof x==='string'?x:x?.descricao||x?.texto||x?.nome||'').filter(Boolean)}
function texto(v){return typeof v==='string'&&v.trim()?`<p>${escape(v)}</p>`:''}
function bullets(v){const a=frases(v);return a.length?`<ul>${a.map(x=>`<li>${escape(x)}</li>`).join('')}</ul>`:''}
const titulos={fortitude:'Fortitude',reflexos:'Reflexos',vontade:'Vontade',terrestre:'Terrestre',voo:'Voo',nado:'Nado',natacao:'Natação',escalada:'Escalada',escavacao:'Escavação',for:'Força',des:'Destreza',con:'Constituição',int:'Inteligência',sab:'Sabedoria',car:'Carisma',acrobacia:'Acrobatismo',arcanismo:'Arcanismo',atletismo:'Atletismo',enganacao:'Enganação',diplomacia:'Diplomacia',intimidacao:'Intimidação',manufatura:'Manufatura',medicina:'Medicina',natureza:'Natureza',ocultismo:'Ocultismo',performance:'Performance',religiao:'Religião',sociedade:'Sociedade',furtividade:'Furtividade',sobrevivencia:'Sobrevivência',ladroagem:'Ladroagem',tipo:'Tipo',valor:'Valor',nome:'Nome',descricao:'Descrição',texto:'Texto',bonus:'Bônus',dano:'Dano',tipoDano:'Tipo de dano',map:'Bônus dos ataques',efeito:'Efeito',acoes:'Custo',gatilho:'Gatilho',frequencia:'Frequência',tracos:'Traços',alcancePes:'Alcance em pés',incrementoDistanciaPes:'Incremento de distância em pés'};
const sinal=v=>Number.isFinite(v)?(v>=0?'+':'')+v:String(v??'');
function humano(v){if(v===null||v===undefined)return '';if(typeof v==='boolean')return v?'Sim':'Não';if(Array.isArray(v))return v.map(humano).filter(Boolean).join('; ');if(typeof v==='object'){if(v.tipo&&v.valor!==undefined)return `${v.tipo}: ${v.valor}`;if(v.nivel!==undefined&&v.quantidade!==undefined&&Object.keys(v).every(k=>k==='nivel'||k==='quantidade'))return `${v.quantidade} de nível ${v.nivel}`;return Object.entries(v).map(([k,x])=>`${titulos[k]||k}: ${humano(x)}`).join(' · ')}return String(v)}
function pares(o,comSinal=false){return o&&typeof o==='object'?Object.entries(o).map(([k,v])=>`${titulos[k]||k}: ${comSinal&&typeof v==='number'?sinal(v):humano(v)}`).join(' · '):humano(o)}
function custo(v){if(v===undefined||v===null)return '';if(v===0)return 'Passiva';if(v==='reacao')return 'Reação';if(v==='livre')return 'Ação livre';if(typeof v==='number')return `${v} ${v===1?'ação':'ações'}`;return String(v)}
function deslocamento(v,unidade){const u=unidade==='pes'?'pés':unidade==='metros'?'metros':'';return v&&typeof v==='object'?Object.entries(v).map(([k,n])=>`${titulos[k]||k}: ${humano(n)}${u?' '+u:''}`).join(' · '):humano(v)}
function bloco(a){
 if(typeof a==='string')return texto(a);if(!a||typeof a!=='object')return '';
 if(a.tipo&&a.valor!==undefined&&!a.nome)return texto(`${a.tipo}: ${a.valor}`);
 const linhas=[],acao=custo(a.acoes),tipo=({'corpo-a-corpo':'Corpo a corpo',distancia:'À distância'})[a.tipo];
 if(tipo||acao)linhas.push([tipo,acao].filter(Boolean).join(' · '));
 if(a.bonus!==undefined)linhas.push('Ataque '+sinal(a.bonus));
 if(a.dano!==undefined)linhas.push('Dano: '+humano(a.dano)+(a.tipoDano?' '+a.tipoDano:''));
 if(Array.isArray(a.map)&&a.map.length)linhas.push('Bônus dos ataques: '+a.map.map(sinal).join(' / '));
 if(a.alcancePes!==undefined)linhas.push(`Alcance: ${a.alcancePes} pés`);
 if(a.incrementoDistanciaPes!==undefined)linhas.push(`Incremento de distância: ${a.incrementoDistanciaPes} pés`);
 if(frases(a.tracos).length)linhas.push('Traços: '+frases(a.tracos).join(', '));
 for(const [k,n] of [['gatilho','Gatilho'],['frequencia','Frequência'],['requisitos','Requisitos'],['efeito','Efeito']])if(a[k])linhas.push(n+': '+humano(a[k]));
 const titulo=a.nome||(!linhas.length?'':'Ação');
 return (titulo?`<h3>${escape(titulo)}</h3>`:'')+linhas.map(texto).join('')+texto(a.descricao||a.texto);
}
function secao(rotulo,valor){
 if(valor===null||valor===undefined||valor===''||(Array.isArray(valor)&&!valor.length))return '';
 let conteudo;
 if(typeof valor==='string')conteudo=texto(valor);
 else if(Array.isArray(valor))conteudo=valor.every(v=>typeof v==='string')?bullets(valor):valor.map(bloco).join('');
 else conteudo=texto(pares(valor));
 return conteudo?`<h3>${escape(rotulo)}</h3>${conteudo}`:'';
}
const nomesTabelas={cdSimples:'CDs simples por proficiência',cdPorNivel:'CDs por nível',cdPorCirculo:'CDs por círculo de magia',ajustesCd:'Ajustes de dificuldade da CD',ajustesRaridade:'Ajustes de CD por raridade',orcamentoEncontro:'Orçamento de XP dos encontros',xpCriaturas:'XP por criatura',xpPerigos:'XP por perigo',feitos:'XP por feitos',tesouroPorNivel:'Tesouro do grupo por nível',riquezaNovoPersonagem:'Riqueza inicial de personagens',infiltracaoAlerta:'Alerta durante infiltrações',reputacao:'Graus de reputação'};
Object.assign(titulos,{id:'Identificador',grau:'Graduação',cd:'CD',nivel:'Nível',circulo:'Círculo de magia',ajuste:'Ajuste',xp:'XP',ajustePorPersonagem:'Ajuste de XP por personagem',grupoBase:'Personagens no grupo de referência',diferencaNivel:'Diferença em relação ao nível do grupo',simples:'XP de perigo simples',complexo:'XP de perigo complexo',valorTotalPo:'Valor total (po)',permanentes:'Itens permanentes',consumiveis:'Consumíveis',moedaPo:'Moedas (po)',moedaPorPersonagemExtraPo:'Moedas por personagem adicional (po)',valorUnicoAlternativoPo:'Valor único alternativo (po)',quantidade:'Quantidade',pontos:'Pontos de alerta',ajusteCdTotal:'Ajuste total da CD',complicacaoPrimeiraVez:'Complicação na primeira ocorrência',minimo:'Mínimo',maximo:'Máximo',sobeCom:'Aumenta com feitos',desceCom:'Diminui com feitos',raridade:'Raridade',preco:'Preço',precoPo:'Preço (po)',categoria:'Categoria'});
function entradasTabelas(valor,prefixo){
 if(Array.isArray(valor))return valor;
 if(!valor||typeof valor!=='object')return [];
 return Object.entries(valor).filter(([,linhas])=>Array.isArray(linhas)).map(([chave,linhas])=>({id:`${prefixo}-tabela-${chave}`,nome:nomesTabelas[chave]||chave.replace(/([a-z])([A-Z])/g,'$1 $2'),linhas,colunas:[...new Set(linhas.flatMap(l=>l&&typeof l==='object'&&!Array.isArray(l)?Object.keys(l):[]))].map(k=>({chave:k,nome:titulos[k]||k})),observacaoEditorial:valor[chave+'Nota']||'',fonte:dados.fonte?.id}));
}
function tabela(e){
 const rows=lista(e.linhas);if(!rows.length)return texto('Esta tabela não contém linhas.');
 const campos=Array.isArray(e.colunas)&&e.colunas.length?e.colunas:[...new Set(rows.flatMap(r=>r&&typeof r==='object'&&!Array.isArray(r)?Object.keys(r):[]))];
 const colunas=campos.map(c=>typeof c==='string'?{chave:c,nome:titulos[c]||c}:c);
 const cabecalho=colunas.length?`<thead><tr>${colunas.map(c=>`<th scope="col">${escape(c.nome||titulos[c.chave]||c.chave)}</th>`).join('')}</tr></thead>`:'';
 const linhas=rows.map(row=>{const valores=Array.isArray(row)?row:colunas.length?colunas.map(c=>row?.[c.chave]):lista(row);return `<tr>${valores.map(v=>`<td>${escape(humano(v)||'—')}</td>`).join('')}</tr>`}).join('');
 return `<table><caption>${escape(e.nome||'Tabela')}</caption>${cabecalho}<tbody>${linhas}</tbody></table>`;
}
function nomeReferencia(id,campo){return lista(dados[campo]).find(x=>x.id===id)?.nome||titulos[id]||({curar:'Curar',ferir:'Ferir',nenhuma:'Nenhuma',sagrado:'Sagrado',profano:'Profano'})[id]||String(id||'');}
function beneficiosReligiosos(e){
 let html='';
 if(e.tipo==='Divindades'){
  html+=secao('Áreas de interesse',e.areasInteresse)+secao('Éditos',e.editos)+secao('Anátemas',e.anatemas);
  if(e.atributosDivinos?.length)html+=secao('Atributos divinos para Criado na Crença',e.atributosDivinos.map(id=>titulos[id]||id));
  if(e.periciasFixas?.length)html+=secao('Perícia divina: treinamento concedido',e.periciaDivinaNome?[e.periciaDivinaNome]:e.periciasFixas.map(id=>titulos[id]||id));
  if(e.periciasOpcoes?.length)html+=texto('Escolha uma perícia divina: '+e.periciasOpcoes.map(id=>titulos[id]||id).join(' ou ')+'.');
  if(e.armaFavorecidaId||e.armaFavorecida)html+=texto('Arma favorecida: '+nomeReferencia(e.armaFavorecidaId||e.armaFavorecida,'equipamentos')+'. Concede treinamento específico e acesso se for incomum.');
  if(e.fontesDivinas?.length)html+=texto('Fonte divina: '+e.fontesDivinas.map(id=>nomeReferencia(id,'magias')).join(' ou ')+'. A escolha entre as duas não muda sem intervenção divina.');
  if(e.santificacao)html+=texto('Santificação '+(e.santificacao.obrigatoria?'obrigatória':'permitida')+': '+lista(e.santificacao.opcoes).map(id=>nomeReferencia(id)).join(' ou ')+'.');
  if(e.dominios?.length)html+=secao('Domínios disponíveis',e.dominios.map(id=>nomeReferencia(id,'dominios')));
 }
 if(e.tipo==='Domínios'&&e.magiaInicialId)html+=texto('Magia inicial de foco: '+nomeReferencia(e.magiaInicialId,'magias')+'. Custa 1 Ponto de Foco e é elevada automaticamente à metade do nível, arredondada para cima.');
 if((e.tipo==='Domínios'||e.tipo==='Divindades')&&e.magiasConcedidas?.length){
  html+='<h3>'+(e.tipo==='Domínios'?'Magia de foco concedida':'Magias adicionadas à lista para preparação')+'</h3><ul>';
  html+=e.magiasConcedidas.map(m=>`<li>${escape(nomeReferencia(m.id,'magias'))}${Number.isFinite(m.graduacao)?' · ranque '+escape(m.graduacao):''}${Number.isFinite(m.nivelConcessao)?' · disponível no nível '+escape(m.nivelConcessao):''}${m.apenasAcessoPreparacao?' · acesso à preparação; não concede espaço adicional':''}</li>`).join('');html+='</ul>';
 }
 return html;
}
function render(){const e=visiveis.find(x=>x.id===$('referencia').value)||visiveis[0];if(!e){$('conteudo').innerHTML='<p>Nenhuma referência encontrada.</p>';return}history.replaceState(null,'','#'+encodeURIComponent(e.id));let html=`<h2>${escape(e.nome)}</h2><p class="origem">${escape(dados.fonte?.nome||'Guia do Hub')}${e.pagina?' · página '+escape(e.pagina):''}${Number.isFinite(e.nivel)?' · nível '+e.nivel:''}</p>`;
 if(e.somenteConsulta||e.estadoTraducao==='referencia')html+='<p class="aviso">Referência ainda sem revisão completa. Não concede benefícios automaticamente. Consulte a origem indicada.</p>';
 html+=bullets(e.resumo);
 if(e.preco!==undefined&&e.preco!==null&&e.preco!=='')html+=texto('Preço: '+humano(e.preco));else if(e.precoPo!==undefined)html+=texto('Preço: '+humano(e.precoPo)+' po');if(e.raridade)html+=texto('Raridade: '+e.raridade);if(e.categoria)html+=texto('Categoria: '+e.categoria);
 if(!e.somenteConsulta){html+=texto(e.descricao||e.texto)+beneficiosReligiosos(e);if(e.progressao?.length)html+='<details><summary>Ganhos por nível</summary>'+e.progressao.map(g=>`<h3>Nível ${escape(g.nivel)} · ${escape(g.nome)}</h3>${texto(g.descricao)}`).join('')+'</details>';
 for(const [campo,rotulo]of [['opcoes','Opções'],['herancas','Heranças']])if(e[campo]?.length)html+='<details><summary>'+rotulo+'</summary>'+e[campo].map(bloco).join('')+'</details>';
 if(e.requisitos)html+=texto('Pré-requisitos: '+(Array.isArray(e.requisitos)?e.requisitos.join('; '):e.requisitos));
 if(e.tamanho)html+=texto('Tamanho: '+e.tamanho);if(frases(e.tracos).length)html+=texto('Traços: '+frases(e.tracos).join(', '));
 if(e.ca!==undefined)html+=texto(`CA ${e.ca} · PV ${e.pv} · Percepção ${sinal(e.percepcao)}`);
 if(e.atributos)html+=texto('Atributos: '+pares(e.atributos,true));if(e.salvaguardas)html+=texto('Salvaguardas: '+pares(e.salvaguardas,true));if(e.pericias)html+=texto('Perícias: '+pares(e.pericias,true));if(e.deslocamento)html+=texto('Deslocamento: '+deslocamento(e.deslocamento,e.unidadeDeslocamento));
 for(const [k,n]of [['sentidos','Sentidos'],['idiomas','Idiomas'],['imunidades','Imunidades'],['resistencias','Resistências'],['fraquezas','Fraquezas'],['cura','Cura'],['excecoesDefesas','Defesas especiais'],['excecoesPericias','Perícias especiais'],['variantes','Variantes'],['equipamentos','Equipamentos']])html+=secao(n,e[k]);
 for(const a of [...lista(e.ataques),...lista(e.acoes)])html+=bloco(a);
 if(e.uso)html+=texto('Uso: '+e.uso);if(e.ativacao)html+=texto('Ativação: '+(typeof e.ativacao==='string'?e.ativacao:pares(e.ativacao)));
 if(e.linhas)html+=tabela(e);}
 if(e.nota)html+=texto(e.nota);if(e.observacaoEditorial)html+=secao('Observação editorial',e.observacaoEditorial);
 if(e.somenteConsulta&&e.pagina){const pagina=todos.find(x=>x.tipo==='Regras'&&x.pagina===e.pagina);if(pagina&&pagina.id!==e.id)html+=`<p><button data-ref="${escape(pagina.id)}">Ler a página de origem completa</button></p>`;}
 const origens=lista(e.secoes).map(id=>todos.find(x=>x.tipo==='Regras'&&x.id===id)).filter(x=>x&&x.id!==e.id);
 if(origens.length)html+='<h3>Fonte no livro</h3>'+origens.map(p=>`<p><button data-ref="${escape(p.id)}">Ler ${escape(p.nome||'página '+p.pagina)} na íntegra</button></p>`).join('');
 if(e.url&&/^https:\/\/2e\.aonprd\.com\//.test(e.url))html+=`<p><a href="${escape(e.url)}" target="_blank" rel="noopener noreferrer">Origem no Archives of Nethys (inglês)</a></p>`;
 $('conteudo').innerHTML=html;$('anterior').disabled=visiveis.indexOf(e)<=0;$('proximo').disabled=visiveis.indexOf(e)>=visiveis.length-1;
 $('conteudo').querySelectorAll('[data-ref]').forEach(btn=>btn.addEventListener('click',ev=>{ $('tipo').value='';$('busca').value='';filtrar(ev.currentTarget.dataset.ref);}));
}
function filtrar(id){const q=$('busca').value.toLocaleLowerCase('pt-BR'), t=$('tipo').value;visiveis=todos.filter(x=>(!t||x.tipo===t)&&(!q||[x.nome,x.nomeOriginal,x.descricao,x.texto,...frases(x.resumo),...frases(x.tracos)].join(' ').toLocaleLowerCase('pt-BR').includes(q)));$('referencia').innerHTML=visiveis.map(x=>`<option value="${escape(x.id)}">${escape(x.nome)}${Number.isFinite(x.nivel)?' · '+x.nivel:''}</option>`).join('');if(id&&visiveis.some(x=>x.id===id))$('referencia').value=id;$('estado').textContent=visiveis.length+' referências encontradas';render();}
async function carregar(){const seq=++geracao;$('estado').textContent='Carregando…';const fonte=$('fonte').value;try{const novosDados=fonte==='guia'?{secoes:guias}:await fetch('/pathfinder/'+fonte+'.json').then(r=>{if(!r.ok)throw Error('Livro indisponível');return r.json()});if(seq!==geracao)return;dados=novosDados;todos=[];for(const[campo,tipo]of Object.entries(categorias))for(const x of campo==='tabelas'?entradasTabelas(dados[campo],fonte==='gm-core'?'gm':fonte):lista(dados[campo]))todos.push({...x,tipo,id:x.id||campo+'-'+todos.length});$('tipo').innerHTML='<option value="">Todas</option>'+[...new Set(todos.map(x=>x.tipo))].map(x=>`<option>${escape(x)}</option>`).join('');$('cobertura').textContent=fonte==='guia'?'Guia rápido do Hub. Consulte os livros para as regras específicas.':(dados.fonte?.estado==='completo'?'Conteúdo completo declarado pela fonte.':'Livro em revisão; algumas referências ainda não estão traduzidas ou revisadas.')+' '+frases(dados.lacunas).join(' ');filtrar(decodeURIComponent(location.hash.slice(1)));}catch(e){if(seq!==geracao)return;$('estado').textContent='Não foi possível abrir este livro.';$('conteudo').textContent=e.message;}}
if(params.get('ficha'))$('voltar').href='/pathfinder-2e.html?id='+encodeURIComponent(params.get('ficha'));if([...$('fonte').options].some(x=>x.value===params.get('fonte')))$('fonte').value=params.get('fonte');
$('fonte').addEventListener('change',()=>{const p=new URLSearchParams(location.search);p.set('fonte',$('fonte').value);history.replaceState(null,'','?'+p);carregar()});$('tipo').addEventListener('change',()=>filtrar());$('busca').addEventListener('input',()=>filtrar());$('referencia').addEventListener('change',render);for(const [btn,delta]of [['anterior',-1],['proximo',1]])$(btn).addEventListener('click',()=>{$('referencia').selectedIndex+=delta;render()});carregar();
})();
