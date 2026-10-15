import {opcoesDisponiveis,projetarExpansoes} from './expansoes/regras.mjs';
import {mostrarEspeciais} from "./especiais-ui.js";
import {CRIACAO,calcularFicha,ATRIBUTOS,CAPAS} from './ficha-regras.mjs';
import {NIVEIS_ESCOLA,talentosDaFicha} from './formacao-regras.mjs';
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
const secao=(host,title)=>{const panel=el('fieldset');panel.className='panel formation-block';panel.style.gridColumn='1 / -1';panel.append(el('legend',title));host.append(panel);return panel;};
function select(host,title,value,options,change,enabled=true){const label=el('label',title),input=el('select');input.setAttribute('aria-label',title);for(const [id,name,disabled] of options){const op=el('option',name);op.value=id;op.disabled=!!disabled;input.append(op);}input.value=value??'';input.disabled=!enabled;input.onchange=()=>change(input.value);label.append(input);host.append(label);return input;}
function checks(host,title,options,selected,limit,change,enabled=true){const panel=secao(host,title);for(const [id,name,blocked]of options){const label=el('label'),input=el('input');label.className='check';input.type='checkbox';input.value=id;input.checked=selected.includes(id);input.disabled=!enabled||!input.checked&&(blocked||selected.length>=limit);input.onchange=()=>change(input.checked?[...selected,id]:selected.filter(k=>k!==id));label.append(input,el('span',name));panel.append(label);}panel.append(el('p',selected.length+'/'+limit+' escolhas'));return panel;}

export function criarTalento(host,{obter,alterar,permitido,contexto=()=>({})},nivel=1){
  const d=obter(),item=nivel===1?d.talentoCasa:d.aumentos?.find(x=>x.nivel===nivel)?.talento;
  const panel=secao(host,nivel===1?'Talento inicial da Casa':'Talento do nível '+nivel);
  const usados=new Set(talentosDaFicha(d).filter(x=>x.nivel!==nivel).map(x=>x.id));
  function definir(value){limparSubstituicoes(d,contexto());if(nivel===1)d.talentoCasa=value;else{d.aumentos=(d.aumentos??[]).filter(x=>x.nivel!==nivel);if(value)d.aumentos.push({nivel,talento:value});}alterar();panel.remove();criarTalento(host,{obter,alterar,permitido,contexto},nivel);}
  const options=[['','Escolha um talento'],...Object.entries(CRIACAO.talentos).map(([id,t])=>[id,t.nome+(t.inato?' · inato':''),usados.has(id)||nivel!==1&&t.inato])];
  const picker=select(panel,'Talento',item?.id,options,id=>definir(id?{id}:null),permitido('talentoCasa',nivel));picker.dataset.talentoNivel=nivel;
  if(!item)return;
  const t=CRIACAO.talentos[item.id];panel.append(el('p',t.texto),el('small',t.fonte||'Livro principal · p. '+t.pagina));
  if(t.atributoEscolha)select(panel,'Atributo aumentado',item.atributo,[['','Escolha um atributo'],...t.atributoEscolha.map(k=>[k,ATRIBUTOS[k]])],v=>definir({...item,atributo:v||undefined}),permitido('talentoCasa',nivel));
  if(t.periciaEscolha)select(panel,'Perícia concedida',item.pericia,[['','Escolha uma perícia'],...t.periciaEscolha.map(k=>[k,CRIACAO.pericias[k].nome])],v=>definir({...item,pericia:v||undefined}),permitido('talentoCasa',nivel));
  if(t.treinamentos)checks(panel,'Três perícias ou ferramentas',[...Object.entries(CRIACAO.pericias).map(([k,v])=>[k,v.nome]),...CRIACAO.ferramentas.map(k=>[k,k])],item.treinamentos??[],3,v=>definir({...item,treinamentos:v}),permitido('talentoCasa',nivel));
  if(t.idiomas){const label=el('label','Três idiomas, separados por vírgula'),input=el('input');input.value=(item.idiomas??[]).join(', ');input.maxLength=250;input.disabled=!permitido('talentoCasa',nivel);input.onchange=()=>definir({...item,idiomas:input.value.split(',').map(s=>s.trim()).filter(Boolean)});label.append(input);panel.append(label);}
}

export function criarFormacao(host,config,{secoes=null,niveis=null,evolucao=false}={}){
  const mostra=id=>!secoes||secoes.includes(id);
  const {obter,alterar,permitido,contexto=()=>({})}=config,root=el('div');root.style.gridColumn='1 / -1';root.dataset.formacaoCompleta='';host.append(root);
  function desenhar(){const d=obter(),c=calcularFicha(d,contexto());root.replaceChildren();const formacoes=(c.efeitosExpansao??[]).filter(o=>opcoesDisponiveis(contexto()).some(x=>x.id===o.id&&x.tipo==='formacao'));if(mostra('escola')&&formacoes.length){const extras=secao(root,'Formações concedidas pelo Mestre');for(const o of formacoes)extras.append(el('strong',o.nome),el('p',o.texto));}
    if(mostra('antecedente')){const background=secao(root,'Antecedente da varinha');
    const bg=select(background,'Antecedente',d.antecedente,[['','Escolha um antecedente'],...Object.entries(CRIACAO.antecedentes).map(([id,b])=>[id,b.nome])],id=>{d.antecedente=id;limparSubstituicoes(d,contexto());alterar();desenhar();},permitido('antecedente'));bg.dataset.campo='antecedente';
    if(d.antecedente){const b=CRIACAO.antecedentes[d.antecedente];background.append(el('p',b.caracteristica+': '+b.texto),el('p','Perícias: '+b.pericias.map(k=>CRIACAO.pericias[k].nome).join(', ')+'.'),el('p','Equipamentos: '+b.equipamentos.join('; ')+'.'),el('small','Livro principal · p. '+b.pagina));}
    }
    if(mostra('pericias')&&!evolucao)checks(root,'Perícias do estilo',CRIACAO.periciasEstilo[d.estilo].map(k=>[k,CRIACAO.pericias[k].nome]),d.periciasClasse??[],2,values=>{d.periciasClasse=values;limparSubstituicoes(d,contexto());alterar();desenhar();},permitido('periciasClasse'));
    for(const level of NIVEIS_ESCOLA.filter(n=>n<=d.nivel&&mostra('escola')&&(!niveis||niveis.includes(n)))){
      const school=secao(root,'Benefício da escola · nível '+level),options=Object.entries(CRIACAO.beneficios).filter(([,v])=>v.escola===d.escola&&v.nivel===level);
      if(level===1&&d.estilo==='intelecto'&&d.nivel>=3){school.append(el('p',c.marcosExpansao?.includes(1)?'Estudos Diversos mantém dois benefícios iniciais; a alternativa ocupa uma posição.':'Estudos Diversos concede automaticamente os dois benefícios iniciais.'));for(const[,b]of options.filter(([id])=>c.beneficiosAtivos.includes(id)))school.append(el('strong',b.nome),el('p',b.texto));}
      else{
        const picker=select(school,(opcoesDisponiveis(contexto()).some(o=>o.tipo==='beneficio'&&o.escola===d.escola&&o.nivel===level)?'Benefício-base de reserva · nível ':'Escolha de nível ')+level,d.beneficiosEscola?.[level],[['','Escolha um benefício'],...options.map(([id,b])=>[id,b.nome+(b.requisito&&!c.beneficiosAtivos.includes(b.requisito)?' · exige '+CRIACAO.beneficios[b.requisito].nome:''),b.requisito&&!c.beneficiosAtivos.includes(b.requisito)])],id=>{d.beneficiosEscola??={};if(id)d.beneficiosEscola[level]=id;else delete d.beneficiosEscola[level];if(level===1)d.periciasEscola=[];limparSubstituicoes(d,contexto());for(const[n,key]of Object.entries(d.beneficiosEscola))if(CRIACAO.beneficios[key].requisito&&!calcularFicha({...d,beneficiosEscola:Object.fromEntries(Object.entries(d.beneficiosEscola).filter(([x])=>Number(x)<Number(n)))},contexto()).beneficiosAtivos.includes(CRIACAO.beneficios[key].requisito))delete d.beneficiosEscola[n];alterar();desenhar();},permitido('beneficiosEscola',level));picker.dataset.beneficioNivel=level;
        if(d.beneficiosEscola?.[level]&&(!opcoesDisponiveis(contexto()).length||!d.extensoesWW?.beneficiosEscola?.[level])){const b=CRIACAO.beneficios[d.beneficiosEscola[level]];school.append(el('p',b.texto),el('small','Livro principal · p. '+b.pagina));}
      }
      const extras=opcoesDisponiveis(contexto()).filter(o=>o.tipo==='beneficio'&&o.escola===d.escola&&o.nivel===level);
      if(extras.length){const escolha=d.extensoesWW?.beneficiosEscola?.[level];select(school,'Alternativa de expansão · nível '+level,escolha,[['','Usar o benefício-base'],...extras.map(o=>[o.id,o.nome])],id=>{d.extensoesWW??={};d.extensoesWW.beneficiosEscola??={};if(id)d.extensoesWW.beneficiosEscola[level]=id;else delete d.extensoesWW.beneficiosEscola[level];limparSubstituicoes(d,contexto());alterar();desenhar();},permitido('beneficiosEscola',level));
        school.append(el('p','A alternativa substitui uma escolha deste marco; o benefício-base fica guardado para quando a expansão for desativada. Estudos Diversos mantém duas posições iniciais, sem conceder todas as alternativas.'));
        const opcao=extras.find(o=>o.id===escolha);if(opcao)school.append(el('strong',opcao.nome),el('p',opcao.texto),el('small','Newt’s Trunk of Everything · homebrew opcional'));
      }
    }
    if(mostra('pericias')&&c.periciasEscolaLimite)checks(root,'Perícias concedidas pela escola',c.periciasEscolaOpcoes.map(k=>[k,CRIACAO.pericias[k].nome]),d.periciasEscola??[],c.periciasEscolaLimite,v=>{d.periciasEscola=v;limparSubstituicoes(d,contexto());alterar();desenhar();},permitido('periciasEscola'));
    if(mostra('pericias')&&c.beneficiosAtivos.includes('sobrevivente')){
      const panel=secao(root,'Sobrevivente');for(const [key,title]of [['pericia','Perícia concedida'],['especializacao','Especialização']])select(panel,title,d.sobrevivente?.[key],[['','Escolha uma perícia'],...['herbologia','sobrevivencia'].map(k=>[k,CRIACAO.pericias[k].nome,key==='especializacao'&&!c.pericias[k].treinada])],v=>{d.sobrevivente??={};d.sobrevivente[key]=v||undefined;limparSubstituicoes(d,contexto());alterar();desenhar();},permitido('sobrevivente'));
    }
    if(mostra('pericias')&&c.substituicoesLimite)checks(root,'Substituir proficiências repetidas',Object.entries(CRIACAO.pericias).map(([k,v])=>[k,v.nome,c.periciasSemSubstituicao.includes(k)]),projetarExpansoes(d,contexto()).dados.substituicoesPericias??[],c.substituicoesLimite,v=>{if(temEscolhasExpansao(d,contexto()))d.extensoesWW.substituicoesPericias=v;else d.substituicoesPericias=v;alterar();desenhar();},permitido('substituicoesPericias'));
    if(mostra('equipamento')){const equip=secao(root,'Equipamento do estudante');
    select(equip,'Pacote inicial',d.pacoteInicial,[['','Escolha o pacote'],['herdado','Herdado · 5 sicles'],['padrao','Padrão · 15 sicles'],['abastado','Abastado · 2 galeões']],v=>{d.pacoteInicial=v;alterar();},permitido('pacoteInicial'));
    select(equip,'Capa vestida',d.capa??'nenhuma',Object.entries(CAPAS).map(([k,v])=>[k,v.nome]),v=>{d.capa=v;alterar();},permitido('capa'));

    equip.append(el('p','A CA usa automaticamente a melhor fórmula disponível, sem somar fórmulas de armadura. Vestir ou retirar uma capa custa uma ação na mesa. Escolher o pacote não duplica os objetos já registrados no malão.'));
    }
    mostrarEspeciais(root,d,c,config,{secoes:secoes?secoes.filter(x=>['receitas','pet','animago','companheiro'].includes(x)):null});
  }
  root.atualizarFormacao=desenhar;desenhar();
}

export function criarAprimoramento(host,config,nivel){
  const {obter,alterar}=config;let mode=obter().aumentos?.find(a=>a.nivel===nivel)?.talento?'talento':'atributos';
  function desenhar(){host.replaceChildren();select(host,'Tipo de aprimoramento',mode,[['atributos','Dois pontos de atributo'],['talento','Um talento']],v=>{mode=v;obter().aumentos=(obter().aumentos??[]).filter(a=>a.nivel!==nivel);alterar();desenhar();});
    if(mode==='talento'){criarTalento(host,config,nivel);return;}
    const choices={...obter().aumentos?.find(a=>a.nivel===nivel)?.atributos},total=el('p');
    host.append(el('p','Distribua +2 em um atributo ou +1 em dois, sem ultrapassar 20.'));
    for(const [key,name]of Object.entries(ATRIBUTOS)){const label=el('label',name),input=el('input');input.type='number';input.min=0;input.max=2;input.value=choices[key]??0;input.dataset.aumento=key;input.onchange=()=>{choices[key]=Number(input.value);const attrs=Object.fromEntries(Object.entries(choices).filter(([,v])=>v!==0));const sum=Object.values(attrs).reduce((a,b)=>a+b,0);obter().aumentos=(obter().aumentos??[]).filter(a=>a.nivel!==nivel);if(sum===2)obter().aumentos.push({nivel,atributos:attrs});total.textContent=sum+'/2 pontos distribuídos';alterar();};label.append(input);host.append(label);}
    total.textContent=Object.values(choices).reduce((a,b)=>a+b,0)+'/2 pontos distribuídos';host.append(total);
  }
  desenhar();
}

export function resumoFormacao(host,d,c){
  host.replaceChildren();for(const [id,skill]of Object.entries(c.pericias)){const card=el('div');card.className='stat';card.dataset.pericia=id;card.append(el('small',skill.nome+(skill.especializada?' · especialista':skill.treinada?' · treinada':'')),el('strong',(skill.bonus>=0?'+':'')+skill.bonus));host.append(card);}
}

function temEscolhasExpansao(d,contexto){return opcoesDisponiveis(contexto).length&&(Object.keys(d.extensoesWW?.beneficiosEscola??{}).length||d.extensoesWW?.formacoes?.length);}
function limparSubstituicoes(d,contexto){if(temEscolhasExpansao(d,contexto))d.extensoesWW.substituicoesPericias=[];else d.substituicoesPericias=[];}
