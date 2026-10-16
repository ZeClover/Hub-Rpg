import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rootCertificates} from 'node:tls';
import {CERTIFICADO_SUPABASE} from '../src/lib/certificado-supabase.ts';
import {removerSslDoEndereco} from '../src/lib/endereco-banco.ts';

// A conexão de produção serve apenas para comparação; nunca é aberta por este comando.
export function alvoBanco(endereco){
 const u=new URL(endereco);if(!['postgres:','postgresql:'].includes(u.protocol))throw Error('Protocolo de banco inválido.');
 if(!u.hostname||!u.pathname||u.pathname==='/')throw Error('Informe explicitamente host e nome do banco.');
 if([...u.searchParams.keys()].some(k=>['host','hostaddr','port','dbname','database','user','password','service','connectionstring'].includes(k.toLowerCase())))throw Error('A conexão não pode sobrescrever seu alvo por parâmetros adicionais.');
 const host=u.hostname.toLowerCase(),direto=host.match(/^db\.([a-z0-9-]+)\.supabase\.co$/),pooler=host.endsWith('.pooler.supabase.com')?decodeURIComponent(u.username).match(/^postgres\.([a-z0-9-]+)$/):null;
 return [direto||pooler?'supabase:'+(direto||pooler)[1]:host+':'+(u.port||'5432'),decodeURIComponent(u.pathname)].join('/');
}
async function colunas(db){return (await db.query("SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='personagens' AND column_name IN ('inventarioLivre','versaoInventario') ORDER BY column_name")).rows;}
function conferir(colunas){for(const c of colunas){if(c.column_name==='inventarioLivre'&&(c.data_type!=='jsonb'||c.is_nullable!=='YES')||c.column_name==='versaoInventario'&&(c.data_type!=='integer'||c.is_nullable!=='NO'||!/^0(?:::(?:integer|int4))?$/.test(c.column_default??'')))throw Error('Colunas existentes incompatíveis; nenhuma conversão automática será feita.');}}
async function contagens(db){const r={};for(const tabela of ['personagens','colecionaveis','acervos_colecionaveis','concessoes_colecionaveis']){const existe=(await db.query('SELECT to_regclass($1) AS tabela',['public.'+tabela])).rows[0].tabela;r[tabela]=existe?(await db.query('SELECT count(*)::text AS total FROM public."'+tabela+'"')).rows[0].total:null;}return r;}
export async function executar({endereco,producao,aplicar=false}){
 if(!endereco)throw Error('Defina STAGING_DATABASE_URL para um banco isolado. Nenhuma conexão de produção será usada como alternativa.');
 const alvo=alvoBanco(endereco);if(producao&&alvo===alvoBanco(producao))throw Error('Staging aponta para o banco de produção. Operação recusada antes de conectar.');
 const u=new URL(endereco),local=['localhost','127.0.0.1','[::1]'].includes(u.hostname);
 const db=new pg.Client({connectionString:removerSslDoEndereco(endereco),ssl:local?false:{ca:[...rootCertificates,CERTIFICADO_SUPABASE]},connectionTimeoutMillis:8000,query_timeout:30000});
 try{await db.connect();await db.query(aplicar?'BEGIN ISOLATION LEVEL REPEATABLE READ':'BEGIN READ ONLY');await db.query("SET LOCAL search_path=public; SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='25s'");
 if(aplicar)await db.query("SELECT pg_advisory_xact_lock(hashtext('hub-inventario-livre-0035'))");
 if(!(await db.query("SELECT to_regclass('public.personagens') AS tabela")).rows[0].tabela)throw Error('Banco de staging sem a estrutura anterior do Hub; restaure uma cópia autorizada antes de migrar.');
 const antes=await contagens(db),atuais=await colunas(db);conferir(atuais);let aplicada=false;
 if(aplicar&&atuais.length<2){
  if(!atuais.length)await db.query(await fs.readFile(new URL('../prisma/migrations/0035_inventario_livre/migration.sql',import.meta.url),'utf8'));
  else if(!atuais.some(c=>c.column_name==='inventarioLivre'))await db.query('ALTER TABLE public."personagens" ADD COLUMN "inventarioLivre" JSONB');
  else await db.query('ALTER TABLE public."personagens" ADD COLUMN "versaoInventario" INTEGER NOT NULL DEFAULT 0');
  aplicada=true;
 }
 const finais=await colunas(db);conferir(finais);const depois=await contagens(db);if(JSON.stringify(antes)!==JSON.stringify(depois))throw Error('Contagens divergentes; migração revertida.');
 await db.query('COMMIT');return{estado:finais.length===2?'pronto':'pendente',aplicada,colunas:finais.map(c=>c.column_name),contagens:depois};
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}finally{await db.end();}
}
async function main(){const args=process.argv.slice(2);if(args.length>1||args.some(a=>!['--verificar','--aplicar'].includes(a)))throw Error('Use --verificar (padrão, somente leitura) ou --aplicar.');const r=await executar({endereco:process.env.STAGING_DATABASE_URL,producao:process.env.POSTGRES_PRISMA_URL,aplicar:args[0]==='--aplicar'});console.log(JSON.stringify(r,null,2));if(r.estado!=='pronto')process.exitCode=2;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(['Staging:',e.code?'Falha de conexão/SQL ('+e.code+').':e.message].join(' '));process.exitCode=1;});
