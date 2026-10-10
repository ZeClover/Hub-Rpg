const el=(tag,texto,classe)=>{const n=document.createElement(tag);if(texto!==undefined)n.textContent=texto;if(classe)n.className=classe;return n;};
// Apresentação reutilizável: o Acervo decide autorização, fila e persistência.
export function revelarColecionavel(item,{verNoAcervo,concluir}){
 const origem=document.activeElement,modal=el('dialog',undefined,'acervo-desbloqueio');modal.dataset.objeto=item.id;modal.setAttribute('aria-labelledby','descoberta-titulo');modal.dataset.fase='descoberta';
 const saltar=el('button','Pular animação','descoberta-pular');saltar.type='button';
 const selo=el('p','NOVA DESCOBERTA','descoberta-selo'),palco=el('div',undefined,'descoberta-palco'),circulo=el('div',undefined,'descoberta-circulo');circulo.setAttribute('aria-hidden','true');
 const particulas=el('div',undefined,'descoberta-particulas');particulas.setAttribute('aria-hidden','true');for(let i=0;i<9;i++){const s=el('span','✧');s.style.setProperty('--i',i);particulas.append(s);}
 const mascara=el('img',undefined,'descoberta-silhueta');mascara.alt='Silhueta da miniatura';if(item.silhuetaUrl)mascara.src=item.silhuetaUrl;mascara.hidden=!item.silhuetaUrl;
 const colorida=el('img',undefined,'descoberta-imagem');colorida.alt=item.nome;colorida.referrerPolicy='no-referrer';colorida.hidden=!item.imagemUrl;if(item.imagemUrl)colorida.src=item.imagemUrl;colorida.onerror=()=>{colorida.hidden=true;};
 const feixe=el('div',undefined,'descoberta-feixe');feixe.setAttribute('aria-hidden','true');palco.append(circulo,particulas,mascara,colorida,feixe);
 const identidade=el('div',undefined,'descoberta-identidade'),titulo=el('h2',item.nome);titulo.id='descoberta-titulo';identidade.append(el('p','CRIATURA DESBLOQUEADA','descoberta-selo'),titulo);if(item.raridade)identidade.append(el('span',item.raridade,'descoberta-raridade'));if(item.edicao)identidade.append(el('p',item.edicao,'descoberta-edicao'));identidade.append(el('p','Nova miniatura adicionada à sua coleção!'));
 const botoes=el('div',undefined,'descoberta-acoes');for(const [nome,fn]of [['Ver no Acervo',()=>{modal.close();verNoAcervo();}],['Continuar',()=>modal.close()]]){const b=el('button',nome);b.type='button';b.onclick=fn;botoes.append(b);}
 const sr=el('p','Uma nova criatura foi concedida pelo Mestre.','sr-only');sr.setAttribute('role','status');modal.append(saltar,selo,palco,identidade,botoes,sr);document.body.append(modal);
 let timers=[],fechado=false;const fase=f=>{modal.dataset.fase=f;if(f==='conclusao'){saltar.hidden=true;selo.textContent='DESCOBERTA REGISTRADA';sr.textContent=item.nome+' desbloqueado.';}};
 const terminar=()=>{timers.forEach(clearTimeout);timers=[];fase('conclusao');};saltar.onclick=terminar;
 modal.addEventListener('close',()=>{if(fechado)return;fechado=true;timers.forEach(clearTimeout);modal.remove();if(origem?.isConnected)origem.focus({preventScroll:true});concluir();},{once:true});
 modal.showModal();saltar.focus();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)terminar();else{for(const [t,f]of [[650,'silhueta'],[1800,'revelacao'],[3400,'conclusao']])timers.push(setTimeout(()=>fase(f),t));}
 return {fechar:()=>{if(modal.open)modal.close();},elemento:modal};
}
