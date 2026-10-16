import {criarEditor} from '../../inventario/editor.js';
import {criar,objetoAbrivel} from './base.js';
import {sapoChocolate} from './inventario-dados.mjs';
let serial=0;
function frasco(item){const id='pocao-'+serial++;let h=0;for(const c of item.nome)h=(h*31+c.charCodeAt(0))>>>0;const cor=['#93c5e0','#ba84ce','#92b779','#e4ae5f','#d37d94'][h%5],formas=['M46 27V63C46 72 23 81 23 112Q22 147 75 147Q128 147 127 112C127 81 104 72 104 63V27Z','M53 27V74Q32 80 32 96V138Q75 156 118 138V96Q118 80 97 74V27Z','M49 27V59L29 111Q17 145 75 146Q133 145 121 111L101 59V27Z'];const e=criar('div',undefined,'pocao-arte');e.innerHTML=`<svg viewBox="0 0 150 170" aria-hidden="true"><defs><linearGradient id="${id}-vidro"><stop stop-color="#c1e4f6" stop-opacity=".45"/><stop offset=".4" stop-color="#152b49" stop-opacity=".15"/><stop offset="1" stop-color="#c1e4f6" stop-opacity=".5"/></linearGradient><linearGradient id="${id}-liquido" x2="0" y2="1"><stop stop-color="${cor}"/><stop offset="1" stop-color="#27334c"/></linearGradient><clipPath id="${id}-c"><path d="${formas[h%3]}"/></clipPath></defs><ellipse cx="75" cy="154" rx="51" ry="6" fill="#0006"/><g clip-path="url(#${id}-c)"><path class="pocao-liquido" d="M10 94Q42 86 75 93T140 92V150H10Z" fill="url(#${id}-liquido)"/><g class="pocao-bolhas" fill="${cor}" stroke="#fff6"><circle cx="48" cy="119" r="3"/><circle cx="85" cy="105" r="2"/><circle cx="99" cy="129" r="4"/></g></g><path d="${formas[h%3]}" fill="url(#${id}-vidro)" stroke="#b6ccdf" stroke-width="2"/><path d="M39 103Q32 127 46 136M58 35V59" fill="none" stroke="#fff8" stroke-width="4" stroke-linecap="round"/><path d="M45 15H105L102 29H48Z" fill="#957552" stroke="#d0b38a"/><path d="M47 18H101M51 22H99" stroke="#554533"/><path d="M48 105Q75 101 102 105V129Q75 137 48 129Z" fill="#e8d8b2" stroke="#93744e"/><path d="M58 111H92M63 118H87M70 125H80" stroke="#876744"/></svg>`;return e;}
function boite(){const e=criar('div',undefined,'sapo-embalagem');e.innerHTML='<svg viewBox="0 0 280 240" aria-hidden="true"><defs><linearGradient id="embalagem-cor" x2="1" y2="1"><stop stop-color="#46658d"/><stop offset=".5" stop-color="#25274a"/><stop offset="1" stop-color="#4c3667"/></linearGradient></defs><path d="M140 9L260 95L216 222H64L20 95Z" fill="url(#embalagem-cor)" stroke="#d5b96f" stroke-width="5"/><path class="sapo-aba" d="M140 23L244 98L206 207H74L36 98Z" fill="none" stroke="#b89a5f" stroke-width="2"/><path d="M140 39L226 102L195 192H85L54 102Z" fill="none" stroke="#aa8c5c"/><g fill="none" stroke="#cfb57c"><path d="M95 58Q114 75 140 61Q167 75 185 58M70 171Q83 147 61 125M210 171Q197 147 219 125M108 207Q140 174 172 207"/><circle cx="140" cy="122" r="40"/></g><text x="140" y="92" text-anchor="middle" fill="#ead7a2" font-family="Georgia" font-size="14">SAPOS DE</text><text x="140" y="168" text-anchor="middle" fill="#ead7a2" font-family="Georgia" font-size="20">CHOCOLATE</text><g class="sapo-chocolate" fill="#755037" stroke="#bc8c5b" stroke-width="1.5"><path d="M110 137Q96 131 112 116L123 113Q118 98 128 99Q140 91 152 99Q162 98 158 113L169 116Q184 131 170 137L154 130Q140 140 126 130Z"/><ellipse cx="140" cy="116" rx="15" ry="17"/><circle cx="129" cy="102" r="4"/><circle cx="151" cy="102" r="4"/><path d="M131 120Q140 125 149 120" fill="none"/></g></svg>';return e;}

function arteItem(item){return sapoChocolate(item)?boite():/po[cç][aã]o|elixir/i.test(item.nome+' '+item.categoria)?frasco(item):null;}
export function criarInventario(host,{obter,editavel,alterar,salvarUso}){
 const interior=criar('div',undefined,'malao-conteudo'),livre=criar('div');livre.dataset.rascunho='true';interior.append(livre);
 let ocupado=false;
 const editor=criarEditor(livre,{obter:()=>obter().inventario??[],editavel:()=>editavel()&&!ocupado,gravar:async itens=>{alterar(d=>{d.inventario=itens;});},inspecionar:mostrar,arte:arteItem,titulo:'Organizar objetos do malão'});
 objetoAbrivel(host,{nome:'Malão do estudante',classe:'malao',interior});
 function mostrar(item){
  const modal=criar('dialog',undefined,'inspecao-item');modal.setAttribute('aria-label',item.nome);
  const fechar=criar('button','Fechar inspeção');fechar.type='button';fechar.onclick=()=>modal.close();modal.append(fechar,criar('h2',item.nome));
  const art=arteItem(item);if(art){art.classList.add('inspecionada');modal.append(art);}
  for(const[k,label]of [['descricao','Descrição'],['propriedades','Propriedades mágicas'],['raridade','Raridade'],['historia','História e origem'],['efeitos','Efeitos descritos'],['anotacoes','Anotações']])if(item[k])modal.append(criar('h3',label),criar('p',item[k]));
  modal.append(criar('p',item.quantidade+' unidade(s)'+(item.peso!==undefined?' · peso por unidade: '+item.peso:'')));
  if(editavel()&&item.quantidade>0&&(sapoChocolate(item)||/po[cç][aã]o|elixir|consum[ií]vel|consum[ií]veis/i.test(item.nome+' '+item.categoria))){
   const usar=criar('button',sapoChocolate(item)?'Abrir uma unidade':'Confirmar consumo de uma unidade');usar.type='button';
   const status=criar('p');status.setAttribute('role','status');modal.append(criar('p','Confirme para salvar o rascunho e o consumo juntos. Efeitos de uso são resolvidos na mesa.','notice'),usar,status);
   usar.onclick=async()=>{if(ocupado||!editavel())return;ocupado=true;usar.disabled=true;fechar.disabled=true;status.textContent='Salvando uso…';
    try{if(!await salvarUso(item.id,false))throw Error('Não foi possível confirmar o uso. Quantidade preservada.');status.textContent='Uso salvo.';modal.querySelectorAll('.sapo-embalagem,.pocao-arte').forEach(e=>e.classList.add('consumida'));}
    catch(e){status.textContent=e.message;usar.disabled=false;}
    finally{ocupado=false;fechar.disabled=false;editor.atualizar();}
   };
  }
  document.body.append(modal);modal.addEventListener('cancel',e=>{if(ocupado)e.preventDefault();});modal.addEventListener('close',()=>{modal.remove();livre.querySelector('button')?.focus({preventScroll:true});});modal.showModal();
 }
 return{atualizar:()=>editor.atualizar()};
}
