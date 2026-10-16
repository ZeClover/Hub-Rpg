import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {zip} from './acervo/zip.mjs';
const root=process.cwd(),files=[];
async function visitar(rel){for(const e of await fs.readdir(path.join(root,rel),{withFileTypes:true})){const f=path.posix.join(rel,e.name);if(e.isSymbolicLink()||e.name.startsWith('.')||e.name==='node_modules')continue;if(e.isDirectory())await visitar(f);else if(/\.(?:toml|yaml|yml|webmanifest|webm|mp4|avif|apng|mp3|ogg|wav|otf|py|tsx?|jsx?|mjs|cjs|mts|json|css|html|sql|prisma|md|txt|csv|svg|png|jpe?g|webp|gif|woff2?|pdf|xlsx|ico)$/i.test(e.name)){files.push(['codigo/'+f,await fs.readFile(path.join(root,f))]);}}}
for(const dir of ['src','public','prisma','scripts','docs','arquivo'])await visitar(dir);
for(const f of ['README.md','LICENSE','LICENSE.md','LICENSE.txt','vercel.json','package.json','package-lock.json','tsconfig.json','next.config.ts','prisma.config.ts','eslint.config.mjs','postcss.config.mjs'])try{files.push(['codigo/'+f,await fs.readFile(f)]);}catch(e){if(e.code!=='ENOENT')throw e;}
const pkg=JSON.parse(await fs.readFile('package.json','utf8'));
const hashes=files.map(([nome,b])=>({nome,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')}));
files.push(['MANIFESTO-CODIGO.json',JSON.stringify({formato:1,node:'24.x',versaoProjeto:pkg.version,dependencias:pkg.dependencies,dependenciasDesenvolvimento:pkg.devDependencies,baseHistorica:'d86abb232524d1ffc11f245f59f50b0c3f59823c',origem:'ZeClover/Hub-Rpg',integracoesOriginais:'codigo/arquivo/acervo-integracoes',dados:'Incluídos somente na exportação autenticada por campanha.',arquivos:hashes},null,2)]);
await fs.mkdir('private/acervo',{recursive:true,mode:0o700});await fs.writeFile('private/acervo/manifesto-codigo.json',files.find(([n])=>n==='MANIFESTO-CODIGO.json')[1],{mode:0o600});await fs.writeFile('private/acervo/Codigo_Acervo_Preservado.zip',zip(files),{mode:0o600});console.log('Acervo: código, dependências e mídias locais preservados ('+files.length+' arquivos). Nenhum acesso ao banco.');
