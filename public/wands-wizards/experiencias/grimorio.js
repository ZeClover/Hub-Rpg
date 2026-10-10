import {LIMITES_ESCURAS} from "../corrupcao-regras.mjs";
import {criar, reduzido} from './base.js';
import traducoes from '../magias-pt-br.json' with {type:'json'};
const ESCOLAS={encantamentos:'Encantamentos',maldicoes:'Azarações, feitiços e maldições',transfiguracao:'Transfiguração',cura:'Cura',adivinhacao:'Adivinhação',magizoologia:'Magizoologia'};
export function metadados(magia){const s=magia.original.replace(/\n/g,' ');const ler=(campo,fim)=>s.match(new RegExp(campo+': (.*?)(?='+fim+':)'))?.[1].trim()??'';const traduzir=s=>s.replace(/1 bonus action/g,'1 ação bônus').replace(/1 action or reaction/g,'1 ação ou reação').replace(/1 reaction/g,'1 reação').replace(/1 action/g,'1 ação').replace(/which you take when you are hit by an attack/g,'quando você é atingido por um ataque').replace(/which you take when you or a creature within 60 feet of you falls/g,'quando você ou uma criatura a até 60 pés cai').replace(/which you take when a collision occurs within 30 feet/g,'quando ocorre uma colisão a até 30 pés').replace(/feet|foot|ft\.?/g,'pés').replace(/cube/g,'cubo').replace(/cone/g,'cone').replace(/radius/g,'raio').replace(/Touch/g,'Toque').replace(/Self/g,'Pessoal').replace(/hemisphere/g,'hemisfério').replace(/sphere/g,'esfera').replace(/\bor\b/g,'ou').replace(/which you take when you see a creature within 60 pés of you casting a spell/g,'quando vê uma criatura a até 60 pés conjurando uma magia').replace(/minutes?/g,m=>m==='minute'?'minuto':'minutos').replace(/hours?/g,m=>m==='hour'?'hora':'horas').replace(/days?/g,m=>m==='day'?'dia':'dias').replace(/rounds?/g,m=>m==='round'?'rodada':'rodadas').replace(/Instantaneous/g,'Instantânea').replace(/Until dispelled/g,'Até ser dissipada').replace(/Concentration/g,'Concentração').replace(/Dedication/g,'Dedicação').replace(/up to/g,'até');const dur=magia.original.split('Duration: ')[1]?.split('\n')[0]??'';return{tempo:traduzir(ler('Casting Time','Range')),alcance:traduzir(ler('Range','Duration')),duracao:traduzir(dur.trim()),escola:ESCOLAS[magia.escola]||magia.escola};}
export function detalhesMagia(magia,{fonte}={}){
  const p=criar('article',undefined,'pagina-feitico');p.dataset.magia=magia.id;
  const ornamento=criar('div','✧','pagina-ornamento');ornamento.setAttribute('aria-hidden','true');
  p.append(ornamento,criar('small',(magia.nivel===0?'Truque':magia.nivel+'º círculo')+' · '+(ESCOLAS[magia.escola]||magia.escola),'pagina-rubrica'),criar('h3',magia.nome));
  const dl=criar('dl');const meta=metadados(magia);
  const componentes=magia.componentes??magia.original.match(/Components:\s*([^\n]+)/)?.[1];
  if(componentes)meta.componentes=componentes;
  for(const[k,v]of Object.entries(meta))if(v)dl.append(criar('dt',({tempo:'Conjuração',alcance:'Alcance',duracao:'Duração',escola:'Escola',componentes:'Componentes'})[k]),criar('dd',v));
  p.append(dl);
  if(/\(ritual\)/i.test(magia.original))p.append(criar('p','Pode ser conjurada como ritual, conforme as regras do estilo.','pagina-rubrica'));
  const descricao=criar('div',undefined,'pagina-descricao');
  for(const texto of (traducoes[magia.id]||'Tradução deste efeito ainda em preparação. Consulte a fonte original.').split('\n'))descricao.append(criar('p',texto));
  p.append(descricao);
  const rodape=criar('footer',undefined,'pagina-fonte');
  rodape.append(criar('p',(fonte?.nome||'Livro de regras — Wands & Wizards v1.4')+' · p. '+magia.pagina,'pagina-referencia'));
  if(fonte?.arquivo?.startsWith('/wands-wizards/')){const link=criar('a','Consultar página do livro');link.href=fonte.arquivo+'#page='+magia.pagina;link.target='_blank';link.rel='noopener';rodape.append(link);}
  const original=criar('details',undefined,'fonte-original');original.append(criar('summary','Fonte original · livro principal, p. '+magia.pagina),criar('p',magia.original));
  rodape.append(original);p.append(rodape);return p;
}

const normalizar=texto=>texto.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function criarGrimorio(host,{obter,catalogo,contexto,selecionar,fonte}){
  host.className='grimorio';
  const layout=criar('div',undefined,'grimorio-layout'),indice=criar('aside',undefined,'grimorio-indice');
  indice.setAttribute('aria-label','Índice de feitiços');
  const titulo=criar('h2','Grimório de Feitiços'),subtitulo=criar('p','HOGWARTS · 1890','grimorio-rubrica');
  const filtros=criar('div',undefined,'grimorio-filtros'),buscar=criar('input');buscar.id='busca-magia';buscar.type='search';buscar.placeholder='Nome ou escola do feitiço';
  const pesquisa=criar('label','Pesquisar feitiço');pesquisa.append(buscar);filtros.append(pesquisa);
  function seletor(id,nome,opcoes){const label=criar('label',nome),select=criar('select');select.id=id;for(const[value,text]of Object.entries(opcoes).sort(([a],[b])=>a===''?-1:b===''?1:0)){const op=criar('option',text);op.value=value;select.append(op);}select.value='';label.append(select);filtros.append(label);return select;}
  const niveis=Object.fromEntries([...new Set(catalogo().map(s=>s.nivel))].sort((a,b)=>a-b).map(n=>[String(n),n===0?'Truques':n+'º círculo']));
  const nivel=seletor('grimorio-nivel','Nível',{'':'Todos os níveis',...niveis});
  const escolas=Object.fromEntries([...new Set(catalogo().map(s=>s.escola))].map(k=>[k,ESCOLAS[k]||k]));
  const escola=seletor('grimorio-escola','Escola',{'':'Todas as escolas',...escolas});
  const categoria=seletor('grimorio-categoria','Categoria',{'':'Todas as categorias',truques:'Truques',magias:'Magias regulares',restritas:'Restritas',rituais:'Rituais'});
  const conhecimento=seletor('grimorio-conhecidas','Exibir',{'':'Todos os feitiços',conhecidas:'Minhas magias conhecidas',disponiveis:'Posso selecionar agora'});
  const status=criar('p',undefined,'grimorio-status');status.setAttribute('role','status');
  const lista=criar('div',undefined,'grimorio-lista');lista.id='lista-magias';lista.setAttribute('aria-label','Catálogo de feitiços');
  const atalhos=criar('div',undefined,'grimorio-atalhos');atalhos.setAttribute('role','group');atalhos.setAttribute('aria-label','Consulta rápida de feitiços');
  const minhas=criar('button','Minhas Magias'),completo=criar('button','Índice Completo');minhas.id='grimorio-minhas';completo.id='grimorio-completo';
  for(const [button,value] of [[minhas,'conhecidas'],[completo,'']]){button.type='button';button.setAttribute('aria-controls','lista-magias');button.onclick=()=>{conhecimento.value=value;conhecimento.dispatchEvent(new Event('change'));};atalhos.append(button);}
  indice.append(subtitulo,titulo,filtros,atalhos,status,lista);
  const painel=criar('section',undefined,'grimorio-detalhes');painel.setAttribute('aria-label','Página do grimório');
  const aviso=criar('div',undefined,'grimorio-fora-filtro');aviso.hidden=true;
  const nota=criar('span'),mostrar=criar('button','Mostrar no índice');mostrar.type='button';aviso.append(nota,mostrar);
  const pagina=criar('div',undefined,'grimorio-pagina');pagina.tabIndex=0;pagina.setAttribute('aria-label','Conteúdo do feitiço');
  painel.append(aviso,pagina);layout.append(indice,painel);host.append(layout);
  const modal=criar('dialog',undefined,'grimorio-modal');modal.id='grimorio-modal';modal.setAttribute('aria-labelledby','grimorio-modal-titulo');
  const topo=criar('div',undefined,'grimorio-modal-topo'),voltar=criar('button','← Voltar ao índice');voltar.type='button';voltar.autofocus=true;
  const tituloModal=criar('span','Consultar feitiço');tituloModal.id='grimorio-modal-titulo';
  topo.append(voltar,tituloModal);const paginaModal=criar('div',undefined,'grimorio-pagina');modal.append(topo,paginaModal);document.body.append(modal);
  let escolhido=null,resultados=[],origem=null,scrollLista=0,scrollJanela=0;
  const celular=matchMedia('(max-width: 860px)'),movimento=matchMedia('(prefers-reduced-motion: reduce)');
  function estados(){const dados=obter(),c=contexto(),ids=new Set([...dados.magias,...(c.calculo.magiasConcedidas??[])]),magias=catalogo();return{...c,ids,truques:magias.filter(s=>ids.has(s.id)&&!(c.calculo.magiasConcedidas??[]).includes(s.id)&&s.nivel===0).length,regulares:magias.filter(s=>ids.has(s.id)&&!(c.calculo.magiasConcedidas??[]).includes(s.id)&&s.nivel>0).length};}
  function situacao(s,e){const conhecida=e.ids.has(s.id),concedida=(e.calculo.magiasConcedidas??[]).includes(s.id);let motivo='';
    if(!e.editavel)motivo='Ficha somente para leitura.';
    else if(concedida)motivo="Concedida automaticamente pela formação · não ocupa a cota regular.";
    else if(!conhecida&&s.restrita)motivo='Feitiço restrito · seleção regular indisponível.';
    else if(!conhecida&&LIMITES_ESCURAS[s.id]&&!(e.calculo.magiasEscurasLiberadas??[]).includes(s.id))motivo='Requer '+LIMITES_ESCURAS[s.id]+' pontos de corrupção para aprender.';
    else if(!conhecida&&s.nivel>e.calculo.circuloMaximo)motivo='Círculo ainda indisponível nesta ficha.';
    else if(!conhecida&&(s.nivel===0?e.truques>=e.calculo.truques:e.regulares>=e.calculo.magias))motivo=s.nivel===0?'Limite de truques conhecidos atingido.':'Limite de magias conhecidas atingido.';
    return{conhecida,concedida,motivo,permitida:!motivo};
  }
  function animarPagina(slot){for(const a of slot.getAnimations({subtree:true}))a.cancel();if(reduzido())return;
    slot.animate([{opacity:.7,transform:'translateX(7px)'},{opacity:1,transform:'none'}],{duration:340,easing:'ease-out'});
    slot.querySelector('.pagina-ornamento')?.animate([{opacity:.6},{opacity:1,textShadow:'0 0 12px #b59049'},{opacity:1}],{duration:380,easing:'ease-out'});
  }
  function vazio(){const page=criar('div',undefined,'pagina-feitico pagina-vazia');const ornament=criar('div','✧','pagina-ornamento');ornament.setAttribute('aria-hidden','true');page.append(ornament,criar('small','REGISTRO DE ENCANTAMENTOS','pagina-rubrica'),criar('h3','Escolha um feitiço'),criar('p','Consulte o índice para abrir uma página do grimório. Os checkboxes registram suas magias conhecidas separadamente.'),criar('p','Hogwarts · 1890','pagina-assinatura'));return page;}
  pagina.append(vazio());
  function renderDetalhe(s,animar=false){pagina.replaceChildren(detalhesMagia(s,{fonte:fonte?.()}));pagina.scrollTop=0;if(animar)animarPagina(pagina);
    if(modal.open){paginaModal.replaceChildren(detalhesMagia(s,{fonte:fonte?.()}));paginaModal.scrollTop=0;tituloModal.textContent=s.nome;if(animar)animarPagina(paginaModal);}
  }
  function destacar(){for(const button of lista.querySelectorAll('button[data-magia]')){const ativa=button.dataset.magia===escolhido;button.setAttribute('aria-pressed',String(ativa));button.closest('.spell-entry').dataset.consultando=String(ativa);}}
  function estadoFiltro(){const s=catalogo().find(s=>s.id===escolhido);aviso.hidden=!s||resultados.some(x=>x.id===escolhido);if(s)nota.textContent=s.nome+' está fora dos filtros atuais.';}
  function consultar(s,button){const mudou=escolhido!==s.id;escolhido=s.id;origem=button;renderDetalhe(s,mudou&&!celular.matches);destacar();estadoFiltro();
    if(celular.matches){scrollLista=lista.scrollTop;scrollJanela=scrollY;paginaModal.replaceChildren(detalhesMagia(s,{fonte:fonte?.()}));tituloModal.textContent=s.nome;document.body.classList.add('grimorio-consulta-aberta');if(!modal.open)modal.showModal();paginaModal.scrollTop=0;animarPagina(paginaModal);}
  }
  voltar.onclick=()=>modal.close();
  modal.addEventListener('close',()=>{document.body.classList.remove('grimorio-consulta-aberta');for(const a of paginaModal.getAnimations({subtree:true}))a.cancel();const btn=origem?.isConnected?origem:lista.querySelector(`button[data-magia="${CSS.escape(escolhido||'')}"]`);const ativo=document.activeElement;if(ativo===document.body||modal.contains(ativo)||!ativo?.isConnected)(btn||buscar).focus({preventScroll:true});lista.scrollTop=scrollLista;scrollTo(0,scrollJanela);});
  celular.addEventListener('change',()=>{if(!celular.matches&&modal.open)modal.close();});
  movimento.addEventListener('change',()=>{if(movimento.matches)for(const slot of [pagina,paginaModal])for(const a of slot.getAnimations({subtree:true}))a.cancel();});
  function atualizarEstados(){const e=estados();minhas.textContent='Minhas Magias ('+(e.ids.size)+')';minhas.setAttribute('aria-pressed',String(conhecimento.value==='conhecidas'));completo.setAttribute('aria-pressed',String(conhecimento.value===''));for(const row of lista.querySelectorAll('.spell-entry')){const s=catalogo().find(s=>s.id===row.dataset.feitico);if(!s)continue;const state=situacao(s,e),box=row.querySelector('input'),badge=row.querySelector('.spell-known');box.checked=state.conhecida;box.disabled=!state.permitida;row.dataset.conhecida=String(state.conhecida);badge.textContent=state.concedida?'Concedida':state.conhecida?'Conhecida':s.restrita?'Restrita':s.nivel>e.calculo.circuloMaximo?'Círculo futuro':'';badge.hidden=!badge.textContent;const razao=row.querySelector('.spell-reason');razao.textContent=state.motivo;box.title=state.motivo||'Registrar '+s.nome+' como conhecida';}}
  function atualizar(){const e=estados(),term=normalizar(buscar.value);resultados=catalogo().filter(s=>{
      const state=situacao(s,e);
      return(!term||normalizar(s.nome+' '+(ESCOLAS[s.escola]||s.escola)).includes(term))&&(!nivel.value||String(s.nivel)===nivel.value)&&(!escola.value||s.escola===escola.value)&&(!categoria.value||categoria.value==='truques'&&s.nivel===0||categoria.value==='magias'&&s.nivel>0&&!s.restrita||categoria.value==='restritas'&&s.restrita||categoria.value==='rituais'&&/\(ritual\)/i.test(s.original))&&(!conhecimento.value||conhecimento.value==='conhecidas'&&state.conhecida||conhecimento.value==='disponiveis'&&state.permitida&&!state.conhecida);
    }).sort((a,b)=>a.nivel-b.nivel||a.nome.localeCompare(b.nome,'pt-BR'));
    const pos=lista.scrollTop,ativo=document.activeElement,ativoId=ativo?.closest('.spell-entry')?.dataset.feitico,tipo=ativo?.tagName;
    lista.replaceChildren();let grupo=null;
    for(const s of resultados){const chaveGrupo=conhecimento.value==='conhecidas'?(s.nivel===0?0:1):s.nivel;if(grupo!==chaveGrupo){grupo=chaveGrupo;lista.append(criar('h3',grupo===0?'Truques':conhecimento.value==='conhecidas'?'Magias Regulares':grupo+'º círculo','grimorio-grupo'));}
      const row=criar('article',undefined,'spell-entry');row.dataset.feitico=s.id;
      const checkLabel=criar('label',undefined,'spell-check'),check=criar('input');check.type='checkbox';check.dataset.nivel=s.nivel;check.id='conhecida-'+s.id;check.setAttribute('aria-describedby','motivo-'+s.id);
      const labelText=criar('span','Conheço '+s.nome,'visually-hidden');checkLabel.append(check,labelText);
      check.onchange=()=>{const state=situacao(s,estados());if(!state.permitida){atualizarEstados();return;}selecionar(s,check.checked);atualizarEstados();if(conhecimento.value)atualizar();};
      const button=criar('button');button.type='button';button.dataset.magia=s.id;button.setAttribute('aria-label','Consultar '+s.nome);
      const nome=criar('strong',s.nome),meta=criar('small',(ESCOLAS[s.escola]||s.escola)+(conhecimento.value==='conhecidas'&&s.nivel>0?' · '+s.nivel+'º círculo':'')),badge=criar('span',undefined,'spell-known');
      button.append(nome,meta,badge);button.onclick=()=>consultar(s,button);
      const motivo=criar('span',undefined,'visually-hidden spell-reason');motivo.id='motivo-'+s.id;row.append(checkLabel,button,motivo);lista.append(row);
    }
    if(!resultados.length)lista.append(criar('p','Nenhum feitiço corresponde aos filtros.','grimorio-vazio'));
    status.textContent=resultados.length+' feitiço'+(resultados.length===1?'':'s')+' no índice';lista.scrollTop=pos;atualizarEstados();destacar();estadoFiltro();
    if(ativoId){const row=lista.querySelector(`[data-feitico="${CSS.escape(ativoId)}"]`);row?.querySelector(tipo==='INPUT'?'input':'button')?.focus({preventScroll:true});}
    if(escolhido&&!catalogo().some(s=>s.id===escolhido)){escolhido=null;pagina.replaceChildren(vazio());}
  }
  buscar.oninput=()=>{lista.scrollTop=0;atualizar();};for(const filtro of [nivel,escola,categoria,conhecimento])filtro.onchange=()=>{lista.scrollTop=0;atualizar();};
  mostrar.onclick=()=>{buscar.value='';for(const s of [nivel,escola,categoria,conhecimento])s.value='';atualizar();lista.querySelector(`button[data-magia="${CSS.escape(escolhido||'')}"]`)?.focus({preventScroll:true});};
  atualizar();return{atualizar,atualizarEstados};
}
