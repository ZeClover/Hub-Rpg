// Original image files supplied by the user, served locally without alteration.
import manifesto from "./brasoes/manifesto.json" with { type: "json" };
// Structural palettes: one source for the entire sheet and its magical objects.
export const CASAS_VISUAIS = {
  neutra: {nome:'Hogwarts',primary:'#244A7D',accent:'#D9BB7A',border:'#8D7650',background:'#0A1523',surface:'#14263A',panel:'#1B3046',card:'#15293E',input:'#091522',text:'#F5EAD7',muted:'#B9C4D0',simbolo:'Brasão de Hogwarts'},
  grifinoria: {nome:'Grifinória',primary:'#813344',accent:'#D9A657',border:'#9C7046',background:'#180F15',surface:'#301820',panel:'#44212A',card:'#351B23',input:'#231218',text:'#F5E9DA',muted:'#CCB9B6',simbolo:'Leão'},
  sonserina: {nome:'Sonserina',primary:'#2C7055',accent:'#BED2C9',border:'#64877C',background:'#091714',surface:'#112820',panel:'#1B392E',card:'#142C25',input:'#0C1E1A',text:'#E6EFEA',muted:'#B8CDC3',simbolo:'Serpente'},
  corvinal: {nome:'Corvinal',primary:'#346899',accent:'#D1AB75',border:'#957653',background:'#0A1425',surface:'#142B49',panel:'#1D3A5B',card:'#152D4B',input:'#0B1C32',text:'#EAF0F6',muted:'#BECEDF',simbolo:'Águia'},
  lufalufa: {metal:'#73716A',nome:'Lufa-Lufa',primary:'#A77D32',accent:'#F0CB75',border:'#97773F',background:'#191710',surface:'#29251B',panel:'#393224',card:'#302A1D',input:'#211E17',text:'#F4EBD8',muted:'#CCC1AA',simbolo:'Texugo'},
};
export const CORES_TRANSICAO = ['--house-primary','--house-accent','--house-border','--house-case-metal','--house-background','--house-surface-primary','--house-surface-secondary','--house-card','--house-input','--house-text','--house-muted','--house-shadow','--bg','--surface','--panel','--card','--input','--text','--muted','--accent','--border'];

export const BRASOES = Object.fromEntries(Object.entries(manifesto.brasoes).map(([key,asset])=>[key,asset.validado?asset.solicitado:null]));
export const BRASOES_PENDENTES = Object.entries(manifesto.brasoes).filter(([,asset])=>!asset.validado).map(([key,asset])=>({casa:key,arquivo:asset.solicitado}));
export function criarBrasao(casa){const key=Object.hasOwn(BRASOES,casa)?casa:'neutra',img=document.createElement('img');if(!BRASOES[key]){const pending=document.createElement('span');pending.className='crest-unavailable';pending.textContent='Brasão de '+CASAS_VISUAIS[key].nome+' pendente';return pending;}img.src=BRASOES[key];img.alt='Brasão de '+CASAS_VISUAIS[key].nome;img.width=230;img.height=253;img.className='crest-image';img.onerror=()=>{const fallback=document.createElement('span');fallback.className='crest-unavailable';fallback.textContent='Brasão de '+CASAS_VISUAIS[key].nome+' indisponível';img.replaceWith(fallback);};return img;}
for(const src of Object.values(BRASOES).filter(Boolean)){const image=new Image();image.src=src;}
let aplicada=null,timer,quadro,efeitoAtual='magica';
const DURACAO_CASA=1800;
const CURVA_CASA='cubic-bezier(.4,0,.6,1)';
const reduced=()=>efeitoAtual==='suave'||efeitoAtual==='dispositivo'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export function atualizarIdentidade(casa,{animar=false,nome='',ano='',avatarUrl=null,nomeCasa='',efeitoCasa='magica'}={}){
  const key=Object.hasOwn(CASAS_VISUAIS,casa)?casa:'neutra',t=CASAS_VISUAIS[key],root=document.documentElement;
  efeitoAtual=efeitoCasa;root.dataset.casaMagica=String(efeitoCasa==='magica');
  const mudou=aplicada!==null&&aplicada!==key;
  if(aplicada!==key){
    const movimentoReduzido=reduced(),transicao=animar&&mudou;
    const propriedades=CORES_TRANSICAO;
    const antes=Object.fromEntries(propriedades.map(k=>[k,getComputedStyle(root).getPropertyValue(k).trim()]));
    clearTimeout(timer);cancelAnimationFrame(quadro);document.body.classList.remove('house-enchant');delete root.dataset.encantando;
    if(transicao){
      // Capture the current interpolated colors before interrupting a rapid switch.
      for(const[k,v]of Object.entries(antes))if(v)root.style.setProperty(k,v);
      root.style.setProperty('--house-fade-duration',movimentoReduzido?'200ms':DURACAO_CASA+'ms');
      root.dataset.encantando='true';void root.offsetWidth;
      if(!movimentoReduzido)document.body.classList.add('house-enchant');
      timer=setTimeout(()=>{document.body.classList.remove('house-enchant');delete root.dataset.encantando;document.querySelectorAll('.house-crest .crest-outgoing').forEach(e=>e.remove());document.querySelectorAll('.house-crest[data-crossfade]').forEach(e=>delete e.dataset.crossfade);},movimentoReduzido?220:2000);
    }
    root.dataset.casa=key;
    for(const[k,v]of Object.entries({'--house-primary':t.primary,'--house-accent':t.accent,'--house-border':t.border,'--house-glow':'color-mix(in srgb,var(--house-primary) 40%,transparent)','--house-case-metal':t.metal??t.accent,'--house-background':t.background,'--house-surface-primary':t.surface,'--house-surface-secondary':t.panel,'--house-card':t.card,'--house-input':t.input,'--house-text':t.text,'--house-muted':t.muted,'--house-shadow':`color-mix(in srgb,${t.primary} 18%,#000)`}))root.style.setProperty(k,v);
    for(const box of document.querySelectorAll('#brasao, #guia-brasao')){
      const anterior=box.querySelector('.crest-image:not(.crest-outgoing)'),previous=anterior?.cloneNode(true),opacidade=anterior?getComputedStyle(anterior).opacity:'1';
      const atual=criarBrasao(key);box.replaceChildren(atual);delete box.dataset.crossfade;
      if(transicao&&previous){
        box.dataset.crossfade='true';previous.classList.add('crest-outgoing');previous.setAttribute('aria-hidden','true');box.append(previous);
        const duracao=movimentoReduzido?200:DURACAO_CASA;
        previous.animate([{opacity:opacidade},{opacity:0}],{duration:duracao,easing:movimentoReduzido?'ease':CURVA_CASA,fill:'forwards'});
        atual.animate([{opacity:0},{opacity:1}],{duration:duracao,easing:movimentoReduzido?'ease':CURVA_CASA});
      }
    }
    if(transicao&&!movimentoReduzido){
      // Start the color, crest and luminous sweep on one clock after the form
      // has rendered and applied its final theme variables in this same task.
      quadro=requestAnimationFrame(()=>{
        const inicio=document.timeline.currentTime;
        for(const a of document.getAnimations()){
          const alvo=a.effect?.target;
          if(alvo===root&&a.transitionProperty?.startsWith('--')||
            alvo?.matches?.('.enchantment-wave, .house-crest[data-crossfade] > .crest-image'))a.startTime=inicio;
        }
      });
    }
    aplicada=key;
  }
  document.getElementById('casa-identidade').textContent=key==='neutra'?(nomeCasa||'Casa a confirmar'):t.nome;
  document.getElementById('ano-identidade').textContent=ano?String(ano)==='Adulto'?'Bruxo adulto':ano+'º ano':'Registro do aluno';
  const portrait=document.getElementById('retrato'),initials=document.getElementById('retrato-iniciais');initials.textContent=(nome||'Hogwarts').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toLocaleUpperCase('pt-BR');
  // Only use the character portrait supplied by the Hub, never execute arbitrary URL schemes.
  if(typeof avatarUrl==='string'&&(/^(https?:\/\/|\/[^/]|data:image\/(png|jpeg|webp);base64,)/i.test(avatarUrl))){if(portrait.getAttribute('src')!==avatarUrl)portrait.src=avatarUrl;portrait.hidden=false;initials.hidden=true;portrait.onerror=()=>{portrait.hidden=true;initials.hidden=false;};}else{portrait.hidden=true;initials.hidden=false;}
  return t;
}

// The crest may be above the viewport; reveal the actual choice area too.
export function revelarEscolhaCasa(){
  const movimentoReduzido=reduced();
  for(const box of document.querySelectorAll('#form-personagem [data-secao="Casa"], #passo.identity-layout')){
    box.animate([{opacity:movimentoReduzido ? .8 : .45},{opacity:1}],{duration:movimentoReduzido?200:700,easing:'cubic-bezier(.22,.61,.36,1)'});
  }
}
