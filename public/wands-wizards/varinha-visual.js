import {movimentoReduzido,preferenciaMovimento as reducedMotion} from './movimento-varinha.js';
import { criarCaixaVarinha, atualizarRevelacao } from "./caixa-varinha.js";
// Presentation only. Wand characteristics stay in dados.varinha; handle is cosmetic.
export const MADEIRAS = ['Acácia','Amieiro','Freixo','Macieira','Álamo-tremedor','Faia','Abrunheiro','Nogueira-negra','Cedro','Cerejeira','Castanheira','Cipreste','Corniso','Ébano','Sabugueiro','Olmo','Carvalho-inglês','Abeto','Espinheiro','Aveleira','Azevinho','Carpino','Lariço','Loureiro','Mogno','Bordo','Pereira','Pinheiro','Choupo','Carvalho-vermelho','Sequoia','Sorveira','Tília-prateada','Abeto-vermelho','Sicômoro','Videira','Nogueira','Salgueiro','Teixo'];
export const NUCLEOS = ['Pena de fênix','Fibra de coração de dragão','Pelo de unicórnio','Pelo de kelpie','Caule de ditamno','Bigode de amasso','Cabelo de veela','Coral','Bigode de trasgo'];
export const CABOS = {automatico:'Da madeira',liso:'Polido',espiral:'Espiral',gravado:'Entalhado',organico:'Orgânico',ornamental:'Ornamental'};
const normal = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function comprimentoEmPolegadas(value) {
  let text = normal(value).replace(/,/g,'.');
  const fractions = {'¼':.25,'½':.5,'¾':.75,'⅛':.125,'⅜':.375,'⅝':.625,'⅞':.875,'⅓':1/3,'⅔':2/3};
  let amount = 0;
  for (const [glyph,n] of Object.entries(fractions)) if(text.includes(glyph)){amount=n;text=text.replace(glyph,'');break;}
  const match=text.match(/^\s*(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?/);
  if(!match)return null;
  amount+=Number(match[1]);
  if(match[2]){if(Number(match[3])===0)return null;amount+=Number(match[2])/Number(match[3]);}
  if(text.includes('cm'))amount/=2.54;
  return amount>0&&Number.isFinite(amount)?amount:null;
}
export const ACABAMENTOS={natural:'Natural',polido:'Polido',escurecido:'Escurecido',envelhecido:'Envelhecido',encantado:'Encantado'};
export const TONALIDADES={azul:'Azul profundo',verde:'Verde-esmeralda',violeta:'Violeta'};
export const MADEIRAS_EXPANDIDAS=['Pau-brasil','Pau-roxo','Bétula'];
const PRESETS = [
 {match:/ebano|ebony/,light:'#92929b',mid:'#24252d',dark:'#080d15',cabo:'gravado',width:13,profile:-2,familia:'escuras'},
 {match:/pau.brasil|brazilwood/,light:'#e38362',mid:'#a02f32',dark:'#401016',cabo:'ornamental',width:22,profile:4,familia:'vermelhas'},
 {match:/pau.roxo|purpleheart/,light:'#c198c4',mid:'#723a79',dark:'#28102f',cabo:'gravado',width:20,profile:-3,familia:'exoticas'},
 {match:/videira|vine/,light:'#c8c395',mid:'#7b8754',dark:'#303c22',cabo:'organico',width:24,profile:8,familia:'exoticas'},
 {match:/cerejeira|cherry/,light:'#f1c4be',mid:'#bf8081',dark:'#6c404b',cabo:'ornamental',width:15,profile:-1,familia:'vermelhas'},
 {match:/azevi|holly/,light:'#fff4d4',mid:'#e0d7b8',dark:'#8a816c',cabo:'liso',width:13,profile:0,familia:'claras'},
 {match:/betula|birch/,light:'#efe7d6',mid:'#d0c7b8',dark:'#7d7169',cabo:'gravado',width:17,profile:1,familia:'claras'},
 {match:/freixo|ash/,light:'#c7d0d8',mid:'#7a8896',dark:'#3b4856',cabo:'liso',width:18,profile:2,familia:'frias'},
 {match:/bordo|maple/,light:'#ffdd8d',mid:'#d6a44d',dark:'#80612d',cabo:'ornamental',width:19,profile:0,familia:'douradas'},
 {match:/teixo|yew/,light:'#b87881',mid:'#633442',dark:'#271321',cabo:'gravado',width:21,profile:-5,familia:'escuras'},
 {match:/cedro|cedar/,light:'#f4b57b',mid:'#c8753e',dark:'#693318',cabo:'espiral',width:20,profile:2,familia:'douradas'},
 {match:/sequoia|redwood|carvalho.vermelho|red oak/,light:'#e38d74',mid:'#a64131',dark:'#4e211c',cabo:'espiral',width:23,profile:3,familia:'vermelhas'},
 {match:/carvalho|oak/,light:'#d9b686',mid:'#926538',dark:'#3f2a1c',cabo:'espiral',width:26,profile:5,familia:'escuras'},
 {match:/nogueira.negra|black walnut/,light:'#a38b75',mid:'#4e3e33',dark:'#19181b',cabo:'gravado',width:18,profile:-2,familia:'escuras'},
 {match:/nogueira|walnut/,light:'#b8a184',mid:'#71583c',dark:'#2c231b',cabo:'ornamental',width:23,profile:3,familia:'escuras'},
 {match:/mogno|mahogany/,light:'#d0986a',mid:'#91452c',dark:'#391b15',cabo:'ornamental',width:22,profile:-1,familia:'vermelhas'},
 {match:/salgueiro|willow|choupo|poplar/,light:'#c8cec0',mid:'#89967b',dark:'#45523e',cabo:'organico',width:17,profile:4,familia:'frias'},
 {match:/sabugueiro|elder|tilia|silver lime|alamo|aspen/,light:'#e0e0d8',mid:'#a2a79f',dark:'#505955',cabo:'organico',width:16,profile:2,familia:'frias'},
 {match:/faia|beech|carpino|hornbeam|sicomo|sycamore|abeto|fir|spruce/,light:'#e8d1ae',mid:'#b29976',dark:'#5d4933',cabo:'liso',width:17,profile:0,familia:'claras'},
 {match:/pinheiro|pine|larico|larch|macieira|apple|pereira|pear/,light:'#edc185',mid:'#c28b4a',dark:'#755030',cabo:'espiral',width:18,profile:1,familia:'douradas'},
 {match:/abrunheiro|blackthorn|espinheiro|hawthorn/,light:'#a19e98',mid:'#635c54',dark:'#28272a',cabo:'organico',width:24,profile:6,familia:'escuras'}
];
const DEFAULT = {light:'#c9a37a',mid:'#866344',dark:'#35261d',cabo:'gravado',width:18,profile:2,familia:'escuras'};
function misturar(a,b,t){const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));return '#'+rgb(a).map((v,i)=>Math.round(v*(1-t)+rgb(b)[i]*t).toString(16).padStart(2,'0')).join('');}
function assinatura(text){return [...text].reduce((sum,c)=>(sum*31+c.charCodeAt(0))>>>0,7);}
export function parametrosVarinha(dados) {
  const wand=dados.varinha??{},wood=normal(wand.madeira),core=normal(wand.nucleo),flex=normal(wand.flexibilidade);
  const seed=assinatura(wood),basePreset=PRESETS.find(p=>p.match.test(wood))??{...DEFAULT,cabo:['liso','espiral','gravado','organico','ornamental'][seed%5]};
  const acabamento=ACABAMENTOS[dados.varinhaVisual?.acabamento]?dados.varinhaVisual.acabamento:'natural',tonalidade=TONALIDADES[dados.varinhaVisual?.tonalidade]?dados.varinhaVisual.tonalidade:'azul';
  const preset={...basePreset};
  if(acabamento==='escurecido')for(const k of ['light','mid','dark'])preset[k]=misturar(preset[k],'#17131a',.38);
  if(acabamento==='envelhecido')for(const k of ['light','mid','dark'])preset[k]=misturar(preset[k],'#879185',.30);
  if(acabamento==='polido')preset.light=misturar(preset.light,'#fff1d2',.25);
  if(acabamento==='encantado'){const cor={azul:'#18489c',verde:'#187956',violeta:'#8054a1'}[tonalidade];preset.mid=misturar(preset.mid,cor,.78);preset.light=misturar(preset.light,cor,.36);preset.dark=misturar(preset.dark,cor,.42);}
  const inches=comprimentoEmPolegadas(wand.comprimento),length=330+(Math.min(18,Math.max(6,inches??12))-6)*26;
  const curve=/inflex|rigid|firme|dura|stiff|unyield/.test(flex)?0:/muito|bastante|very|whippy/.test(flex)?20:/flex|maleavel|elastic|pliant|supple|swishy/.test(flex)?11:3;
  const glow=/fenix|phoenix/.test(core)?'#efbe60':/drag|dragon/.test(core)?'#df7566':/unicorn/.test(core)?'#d8e4ed':'#b4c4cd';
  const selected=dados.varinhaVisual?.cabo;
  return {...preset,cabo:selected&&selected!=='automatico'&&CABOS[selected]?selected:preset.cabo,seed,length,curve,glow,inches,acabamento,tonalidade};
}
// Small illustrative emblems identify the material without exposing the core itself.
const EMBLEMAS = [
  ['fenix',/fenix|phoenix/,'Fênix',0],['unicornio',/unicorn/,'Unicórnio',1],['dragao',/drag|dragon/,'Dragão',2],
  ['kelpie',/kelpie/,'Kelpie',0,true],['amasso',/amasso|kneazle/,'Amasso',1,true],['veela',/veela/,'Veela',2,true],
  ['ditamno',/ditam|dittany/,'Ditamno',3,true],['coral',/coral/,'Coral',4,true],['trasgo',/trasgo|troll/,'Trasgo',5,true]
];
function emblemaNucleo(value){const text=normal(value);if(!text.trim())return null;return EMBLEMAS.find(([,match])=>match.test(text))??['outro',null,'Núcleo personalizado'];}
const mobileFrame=matchMedia('(max-width: 600px)');
function enquadrar(svg){if(svg.closest('.case-world')){svg.setAttribute('viewBox','55 35 925 240');svg.querySelector('.wand-framing').setAttribute('transform','');return;}svg.setAttribute('viewBox',mobileFrame.matches?'180 -135 730 650':'80 105 875 140');svg.querySelector('.wand-framing').setAttribute('transform',mobileFrame.matches?'rotate(-40 517 154)':'');}
mobileFrame.addEventListener('change',()=>{for(const svg of document.querySelectorAll('.wand-art svg'))enquadrar(svg);});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)for(const box of document.querySelectorAll('[data-varinha-preview]')){const state=states.get(box);if(!movimentoReduzido({varinhaVisual:{animacao:state?.animacao}}))continue;state?.animations?.forEach(a=>a.cancel());box.querySelectorAll('.wand-previous').forEach(e=>e.remove());delete box.dataset.transicao;}});
let serial=0;
const states=new WeakMap();
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
function arte(p,id) {
  const start=266,end=start+p.length,cy=154,bend=p.curve,w=p.width;
  const body=`M ${start} ${cy-w/2} C ${start+110} ${cy-w/2+3+p.profile} ${end-95} ${cy+bend-5-p.profile/2} ${end} ${cy+bend} C ${end-95} ${cy+bend+5+p.profile/2} ${start+110} ${cy+w/2-3-p.profile} ${start} ${cy+w/2} Z`;
  const organic=p.cabo==='organico';
  const grip=organic?'M 126 146 C 135 134 150 141 159 133 C 172 130 181 146 194 139 C 211 132 217 142 228 139 L 268 144 L 267 165 C 247 169 236 164 224 173 C 209 178 203 160 185 171 C 169 181 156 163 144 170 Q 121 175 126 146 Z':`M 126 143 Q 123 154 126 165 Q 165 ${p.cabo==='ornamental'?177:171} 202 164 Q 231 162 266 165 L 268 143 Q 231 146 202 144 Q 168 ${p.cabo==='ornamental'?131:137} 126 143 Z`;
  let grains='';
  for(let i=0;i<12;i++){const offset=-w/2+i*w/11,shift=((p.seed+i*17)%9)-4;grains+=`<path d="M ${start-8} ${cy+offset} C ${start+110} ${cy+offset+shift} ${end-130} ${cy+bend+offset/3+shift/2} ${end+8} ${cy+bend+offset/5}" stroke="${i%3===0?p.light:p.dark}" opacity="${i%3===0?.25:.38}" stroke-width="${i%4===0?1.3:.55}" fill="none"/>`;}
  let handle='';
  if(p.cabo==='espiral')for(let i=0;i<9;i++)handle+=`<path d="M ${134+i*13} 138 q -11 15 8 31" stroke="${p.dark}" stroke-width="4" fill="none"/><path d="M ${136+i*13} 138 q -11 15 8 31" stroke="${p.light}" stroke-width="1.5" opacity=".7" fill="none"/>`;
  if(p.cabo==='gravado')for(let i=0;i<8;i++)handle+=`<path d="M ${139+i*15} 145 l 6 9 -6 9 -6 -9 Z" fill="none" stroke="${p.dark}" stroke-width="1.5"/><path d="M ${139+i*15} 146 l 5 8" fill="none" stroke="${p.light}" opacity=".65"/>`;
  if(organic)for(let i=0;i<5;i++)handle+=`<path d="M 124 ${143+i*5} C 158 ${121+i*9} 192 ${181-i*7} 262 ${148+i*3}" fill="none" stroke="${i%2?p.light:p.dark}" opacity=".6" stroke-width="2"/>`;
  if(p.cabo==='ornamental')handle='<path d="M 146 141 Q 169 121 192 141 Q 170 156 146 141 M 146 166 Q 170 184 194 165 Q 171 150 146 166" fill="none" stroke="'+p.dark+'" stroke-width="3"/><path d="M 149 141 Q 170 130 190 142 M 150 166 Q 170 173 190 165" fill="none" stroke="'+p.light+'" stroke-width="1.4"/>';
  if(p.cabo==='liso')handle=`<path d="M 139 147 Q 181 140 246 149 M 135 159 Q 181 167 251 158" stroke="${p.light}" opacity=".25" stroke-width="1.2" fill="none"/>`;
  const knotx=start+Math.min(105,p.length/4);
  return `<svg viewBox="0 0 900 300" role="img" aria-label="Prévia visual da varinha" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${id}-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${p.dark}"/><stop offset=".22" stop-color="${p.light}"/><stop offset=".48" stop-color="${p.mid}"/><stop offset=".82" stop-color="${p.dark}"/><stop offset="1" stop-color="${p.mid}"/></linearGradient><radialGradient id="${id}-aura"><stop stop-color="${p.glow}" stop-opacity=".23"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient><radialGradient id="${id}-reacao"><stop stop-color="${p.glow}" stop-opacity=".65"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient><clipPath id="${id}-shaft"><path d="${body}"/></clipPath><clipPath id="${id}-grip"><path d="${grip}"/></clipPath><filter id="${id}-shadow" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <g class="wand-framing"><g class="wand-model" transform="translate(${517-(126+end)/2} 0)">
  <ellipse class="wand-aura" cx="${end-30}" cy="${cy+bend}" rx="120" ry="90" fill="url(#${id}-aura)"/>
  <path d="${grip}" fill="#000" opacity=".4" filter="url(#${id}-shadow)" transform="translate(0 14)"/><path d="${body}" fill="#000" opacity=".4" filter="url(#${id}-shadow)" transform="translate(0 14)"/>
  <path class="wand-shaft" d="${body}" fill="url(#${id}-wood)" stroke="${p.dark}" stroke-width="1"/>
  <g clip-path="url(#${id}-shaft)">${grains}<ellipse cx="${knotx}" cy="${cy-1}" rx="17" ry="4.7" fill="none" stroke="${p.dark}" opacity=".55"/><ellipse cx="${knotx}" cy="${cy-1}" rx="9" ry="2.8" fill="none" stroke="${p.light}" opacity=".3"/></g>
  <path class="wand-grip" d="${grip}" fill="url(#${id}-wood)" stroke="${p.dark}" stroke-width="1.3"/><g clip-path="url(#${id}-grip)">${handle}</g>
  <path d="M 253 143 Q 249 154 253 165 M 261 144 Q 257 154 261 164" stroke="${p.dark}" stroke-width="2.8" fill="none"/><path d="M 255 144 Q 251 154 255 164" stroke="${p.light}" opacity=".7" stroke-width="1.2" fill="none"/>
  <path d="M 127 145 Q 124 154 128 164" stroke="${p.light}" opacity=".7" stroke-width="1.5" fill="none"/>
  <g class="wand-measure" stroke="#bba378" stroke-opacity=".5" fill="none" stroke-width=".8"><path d="M 126 216 V 228 M ${end} 216 V 228 M 126 223 H ${end}"/><path d="M 138 220 l -12 3 12 3 M ${end-12} 220 l 12 3 -12 3"/></g>
  <ellipse class="wand-pulse" cx="${(266+end)/2}" cy="${cy+bend/2}" rx="${p.length*.58}" ry="70" fill="url(#${id}-reacao)" opacity="0"/>
  <defs><linearGradient id="${id}-beam"><stop stop-color="#edd6ab" stop-opacity="0"/><stop offset=".5" stop-color="#edd6ab" stop-opacity=".65"/><stop offset="1" stop-color="#edd6ab" stop-opacity="0"/></linearGradient><clipPath id="${id}-silhouette"><path d="${grip}"/><path d="${body}"/></clipPath></defs>
  <g clip-path="url(#${id}-silhouette)"><rect class="wand-sweep" x="65" y="100" width="120" height="100" fill="url(#${id}-beam)" opacity="0"/></g>
  </g></g></svg>`;
}
export function criarPreviaVarinha(container,dados) {
  const box=node('figure');box.className='wand-preview';box.dataset.varinhaPreview='';
  const heading=node('div');heading.className='wand-preview-heading';heading.append(node('span','ATELIÊ DE VARINHAS'),node('small','Uma identidade própria'));
  const art=node('div');art.className='wand-art';
  const caption=node('figcaption');caption.className='wand-caption';
  const title=node('strong'),description=node('span'),core=node('div');core.className='wand-core';caption.append(title,description,core);
  box.append(heading);criarCaixaVarinha(box,art);box.append(caption);container.append(box);states.set(box,{art,title,description,core,id:'ww-wand-'+(++serial),signature:null,revision:0});atualizarPrevia(box,dados,false);
}
const easing='cubic-bezier(.22,.61,.36,1)';
function atualizarPrevia(box,dados,animar) {
  const state=states.get(box);if(!state)return;state.animacao=dados.varinhaVisual?.animacao;box.dataset.movimentoCompleto=String(state.animacao==='completa');if(movimentoReduzido(dados)){state.animations?.forEach(a=>a.cancel());delete box.dataset.transicao;}
  const wand=dados.varinha??{},emblem=emblemaNucleo(wand.nucleo),p=parametrosVarinha(dados);
  const signature=JSON.stringify([wand.madeira,wand.nucleo,wand.comprimento,wand.flexibilidade,dados.varinhaVisual?.cabo,dados.varinhaVisual?.acabamento,dados.varinhaVisual?.tonalidade]);
  if(signature===state.signature)return;
  const oldParams=state.params,oldCore=state.core.dataset.nucleo;
  const changes=[];
  if(oldParams){if(p.seed!==oldParams.seed||p.mid!==oldParams.mid||p.light!==oldParams.light)changes.push('madeira');if(p.glow!==oldParams.glow||emblem?.[0]!==oldCore)changes.push('nucleo');if(p.length!==oldParams.length)changes.push('comprimento');if(p.curve!==oldParams.curve)changes.push('flexibilidade');if(p.cabo!==oldParams.cabo)changes.push('cabo');}
  const old=state.art.querySelector('svg:not(.wand-previous)');
  if(!old||changes.length){
    // Capture the displayed geometry before replacing it, including interrupted transitions.
    const paths=old?[...old.querySelectorAll('path')].map(e=>({d:e.getAttribute('d'),display:getComputedStyle(e).d})):[];
    const oldTransform=old?getComputedStyle(old.querySelector('.wand-model')).transform:null;
    const ellipses=old?[...old.querySelectorAll('ellipse')].map(e=>({cx:getComputedStyle(e).cx,cy:getComputedStyle(e).cy,rx:getComputedStyle(e).rx})):[];
    state.animations?.forEach(a=>a.cancel());
    state.art.innerHTML=arte(p,state.id+'-'+(++state.revision));const svg=state.art.querySelector('svg');enquadrar(svg);
    state.animations=[];delete box.dataset.transicao;
    if(old&&animar&&!movimentoReduzido(dados)&&changes.length){
      box.dataset.transicao=changes.join(' ');const animations=state.animations;
      const animate=(e,frames,duration=480)=>{const a=e.animate(frames,{duration,easing});animations.push(a);return a;};
      if(changes.includes('madeira')||changes.includes('cabo')){
        old.classList.add('wand-previous');old.setAttribute('aria-hidden','true');state.art.append(old);
        animate(old,[{opacity:1},{opacity:0}],400).finished.then(()=>old.remove()).catch(()=>old.remove());animate(svg,[{opacity:0},{opacity:1}],400);
        animate(svg.querySelector('.wand-sweep'),[{opacity:0,transform:'translateX(0px)'},{opacity:.7,offset:.25},{opacity:0,transform:`translateX(${changes.includes('madeira')?p.length+230:205}px)`}],540);
      }else if(changes.includes('comprimento')||changes.includes('flexibilidade')){
        // Native path interpolation changes the shaft, grain, shadow and ruler together.
        for(const [index,path]of [...svg.querySelectorAll('path')].entries()){
          const before=paths[index],after=path.getAttribute('d');
          if(before&&before.d!==after&&before.d.match(/[A-Za-z]/g)?.join('')===after.match(/[A-Za-z]/g)?.join(''))animate(path,[{d:before.display==='none'?`path("${before.d}")`:before.display},{d:`path("${after}")`}]);
        }
        const model=svg.querySelector('.wand-model');animate(model,[{transform:oldTransform},{transform:`translateX(${517-(126+266+p.length)/2}px)`}]);
        for(const [i,e]of [...svg.querySelectorAll('ellipse')].entries())if(ellipses[i])animate(e,[ellipses[i],{cx:e.getAttribute('cx')+'px',cy:e.getAttribute('cy')+'px',rx:e.getAttribute('rx')+'px'}]);
      }
      animate(svg.querySelector('.wand-pulse'),[{opacity:0},{opacity:.9,offset:.4},{opacity:0}],600);animate(state.art,[{transform:'translate3d(0,0,3px)'},{transform:'translate3d(0,-12px,12px)',offset:.45},{transform:'translate3d(0,0,3px)'}],600);
      const revision=state.revision;Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(state.revision===revision)delete box.dataset.transicao;});
    }
  }
  box.style.setProperty('--wand-magic',p.glow);box.dataset.cabo=p.cabo;box.dataset.comprimento=String(p.inches??'indefinido');box.dataset.curva=String(p.curve);
  state.title.textContent=wand.madeira||'Sua varinha aguarda uma madeira';
  state.description.textContent=[wand.comprimento||'Comprimento a escolher',wand.flexibilidade||'Flexibilidade a escolher',p.acabamento!=='natural'?ACABAMENTOS[p.acabamento]:null].filter(Boolean).join(' · ');
  state.core.hidden=!emblem;
  if(emblem){
    const [key,,label,index,secondary]=emblem;state.core.dataset.nucleo=key;state.core.style.setProperty('--core-light',p.glow);
    if(key!==oldCore||!state.core.childElementCount){
      state.core.replaceChildren();const icon=node('span');icon.className='wand-core-icon';icon.setAttribute('role','img');icon.setAttribute('aria-label',label);
      if(index!==undefined){icon.classList.add('wand-core-illustration');icon.style.backgroundImage=`url(/wands-wizards/varinhas/nucleos-${secondary?'complementares':'ilustrados'}.webp)`;icon.style.backgroundSize=secondary?'300% 200%':'300% 100%';icon.style.backgroundPosition=`${(index%3)*50}% ${secondary&&index>=3?100:0}%`;}
      else{icon.textContent='✦';icon.classList.add('wand-core-custom');}
      const copy=node('span');copy.className='wand-core-copy';copy.append(node('small','NÚCLEO'),node('span',wand.nucleo));state.core.append(icon,copy);
      if(old&&animar&&!movimentoReduzido(dados)&&changes.includes('nucleo'))state.animations.push(icon.animate([{opacity:0,transform:'scale(.93)'},{opacity:1,transform:'scale(1)'}],{duration:400,easing}));
    }else state.core.querySelector('.wand-core-copy>span').textContent=wand.nucleo;
  }else{state.core.replaceChildren();delete state.core.dataset.nucleo;}
  state.signature=signature;state.params=p;
}
export function atualizarVarinhas(dados,animar=true){for(const box of document.querySelectorAll('[data-varinha-preview]'))atualizarPrevia(box,dados,animar);atualizarRevelacao();}
export function adicionarSugestoes(input,values){const list=node('datalist');list.id='wand-options-'+(++serial);for(const value of values){const option=node('option');option.value=value;list.append(option);}input.setAttribute('list',list.id);input.after(list);}

export function seletorMadeiras(container,input){
 const details=node('details');details.className='wood-library';details.append(node('summary','Explorar madeiras por aparência'));const filtro=node('select');filtro.setAttribute('aria-label','Filtrar aparência da madeira');const grupos={todas:'Todas',claras:'Claras',escuras:'Escuras',vermelhas:'Vermelhas e rosadas',douradas:'Douradas e alaranjadas',frias:'Frias e acinzentadas',exoticas:'Exóticas'};for(const[k,n]of Object.entries(grupos)){const op=node('option',n);op.value=k;filtro.append(op);}const busca=node('input');busca.type='search';busca.placeholder='Buscar madeira';busca.setAttribute('aria-label','Buscar na biblioteca de madeiras');const lista=node('div');lista.className='wood-swatches';function atualizar(){lista.replaceChildren();for(const madeira of [...MADEIRAS,...MADEIRAS_EXPANDIDAS]){const p=parametrosVarinha({varinha:{madeira}});if((filtro.value!=='todas'&&filtro.value!==p.familia)||!normal(madeira).includes(normal(busca.value)))continue;const b=node('button');b.type='button';b.disabled=input.disabled;const amostra=node('span');amostra.className='wood-sample';amostra.style.background=`repeating-linear-gradient(168deg,${p.dark}88 0 1px,transparent 1px 5px),linear-gradient(100deg,${p.dark},${p.mid} 45%,${p.light} 56%,${p.mid} 73%,${p.dark})`;b.append(amostra,node('span',madeira));b.onclick=()=>{input.value=madeira;input.dispatchEvent(new Event('change'));};lista.append(b);}}filtro.onchange=atualizar;busca.oninput=atualizar;details.append(filtro,busca,lista,node('p','Paletas e silhuetas são interpretações artísticas. Pau-brasil, Pau-roxo e Bétula são sugestões cosméticas expandidas; não recebem regras do livro. Você pode manter uma madeira personalizada no campo.'));container.append(details);atualizar();
}
