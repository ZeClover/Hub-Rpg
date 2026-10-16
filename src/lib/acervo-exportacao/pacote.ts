import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {zip} from '../../../scripts/acervo/zip.mjs';
import {CATEGORIAS} from '../colecionaveis/regras';
export type Snapshot={campanha:{id:string;nome:string};personagens:unknown[];catalogo:Record<string,unknown>[];descobertas:unknown[];historico:unknown[];variantesLegadas:unknown[]};
const json=(v:unknown)=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x,2);
function csv(linhas:unknown[]){if(!linhas.length)return '';const keys=[...new Set(linhas.flatMap(x=>Object.keys(x as object)))];const cell=(v:unknown)=>{let texto=String(v==null?'':typeof v==='object'?json(v):v);if(/^\s*[=+\-@]/.test(texto))texto="'"+texto;return '"'+texto.replaceAll('"','""')+'"';};return '\ufeff'+[keys.map(cell).join(','),...linhas.map(x=>keys.map(k=>cell((x as Record<string,unknown>)[k])).join(','))].join('\r\n');}
export async function montarPacote(snapshot:Snapshot){
 const arquivos:[string,Buffer|string][]=[['codigo/Codigo_Acervo_Preservado.zip',await readFile(process.cwd()+'/private/acervo/Codigo_Acervo_Preservado.zip')]];
 const manifestoCodigo=JSON.parse(await readFile(process.cwd()+'/private/acervo/manifesto-codigo.json','utf8')) as {arquivos:{nome:string}[]};
 const midiasLocais=new Set(manifestoCodigo.arquivos.map(f=>f.nome));
 const pendencias:unknown[]=[];
 const catalogo=snapshot.catalogo.map(item=>{const {silhuetaArquivo,...resto}=item;if(silhuetaArquivo){const nome='midias/silhuetas/'+item.id+'.png';arquivos.push([nome,Buffer.from(silhuetaArquivo as Uint8Array)]);resto.silhuetaArquivo=nome;}
 const url=item.imagemUrl;if(typeof url==='string'&&url){if(url.startsWith('data:image/')){const m=url.match(/^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/);if(m){const nome='midias/itens/'+item.id+'.'+m[1];arquivos.push([nome,Buffer.from(m[2],'base64')]);resto.imagemExportada=nome;}else pendencias.push({item:item.id,url:'data URI não suportada',motivo:'Formato precisa de conversão.'});}else if(!url.startsWith('/'))pendencias.push({item:item.id,url,motivo:'Mídia externa: URL original preservada; baixar com autorização da origem antes da migração. O servidor não faz requisições a URLs arbitrárias.'});else {let local=url.split(/[?#]/)[0];try{local=decodeURIComponent(local);}catch{}const nome='codigo/public'+local;if(midiasLocais.has(nome))resto.imagemExportada='codigo/Codigo_Acervo_Preservado.zip → '+nome;else pendencias.push({item:item.id,url,motivo:'Referência local não encontrada no pacote de código. Recuperar a mídia original antes da migração.'});}}
 return resto;});
 const dados={...snapshot,catalogo,categorias:CATEGORIAS};
 arquivos.push(['dados/snapshot.json',json(dados)]);
 for(const k of ['catalogo','descobertas','historico','personagens','variantesLegadas'] as const){arquivos.push(['dados/'+k+'.json',json(dados[k])],['dados/'+k+'.csv',csv(dados[k])]);}
 arquivos.push(['PENDENCIAS.json',json(pendencias)],['LEIA-ME.md','# Acervo Mágico — exportação completa por campanha\n\nPacote privado: contém segredos narrativos e identificadores de personagens. Não publique no GitHub.\n\n1. Descompacte codigo/Codigo_Acervo_Preservado.zip.\n2. Leia codigo/docs/acervo/MIGRACAO.md.\n3. Preserve dados/snapshot.json como cópia original.\n4. Reimporte IDs, catálogo, descobertas e histórico em transação num PostgreSQL isolado.\n5. Reponha as integrações originais somente no novo projeto, nunca sobre o Hub atual.\n6. Confira PENDENCIAS.json e a origem das mídias externas.\n\nNão inclui contas, e-mails, credenciais, cookies ou dados mecânicos das fichas. IDs de concedentes são referências opacas; vincule às contas autorizadas no destino. Cada campanha exige exportação própria.\n']);
 arquivos.push(['MANIFESTO.json',json({versao:1,geradoEm:new Date().toISOString(),campanhaId:snapshot.campanha.id,categorias:CATEGORIAS,arquivos:arquivos.map(([nome,v])=>({nome,bytes:Buffer.byteLength(v),sha256:createHash('sha256').update(v).digest('hex')})),pendencias:pendencias.length})]);
 return zip(arquivos);
}
