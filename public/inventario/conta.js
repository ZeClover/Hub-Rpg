import {criarEditor} from './editor.js';
export async function montarInventarioConta(host,id){
 const aviso=document.createElement('p');aviso.role='status';host.append(aviso);let itens=[],versao=0,editavel=false;
 try{const r=await fetch('/api/personagens/'+encodeURIComponent(id)+'/inventario-livre',{cache:'no-store'}),b=await r.json();if(!r.ok)throw Error(b.erro||'Inventário indisponível.');itens=b.itens;versao=b.versao;editavel=b.editavel;
 const backup=document.createElement('button');backup.type='button';backup.textContent='Exportar inventário';backup.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({formato:1,itens},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='inventario-livre.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};host.append(backup);
 criarEditor(host,{obter:()=>itens,editavel:()=>editavel,gravar:async novos=>{const r=await fetch('/api/personagens/'+encodeURIComponent(id)+'/inventario-livre',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({itens:novos,versao})}),b=await r.json();if(!r.ok)throw Error(b.erro||'Não foi possível salvar; mantenha esta janela aberta.');itens=novos;versao=b.versao;},titulo:'Inventário livre'});
 aviso.textContent='Itens do livro e equipamentos iniciais continuam na seção original. Estes registros são salvos separadamente, sem alterar as regras.';
 }catch(e){aviso.textContent=e.message;}
}
