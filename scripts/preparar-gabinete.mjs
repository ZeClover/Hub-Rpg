// A migração aditiva roda no ambiente da publicação, com a conexão existente do projeto.
// Nenhum personagem, campanha existente, inventário ou regra é atualizado.
import pg from 'pg';
import fs from 'node:fs/promises';
import {CERTIFICADO_SUPABASE} from '../src/lib/certificado-supabase.ts';
import {removerSslDoEndereco} from '../src/lib/endereco-banco.ts';
if(process.env.VERCEL==='1'){
 if(!process.env.POSTGRES_PRISMA_URL)throw Error('Conexão do projeto ausente para preparar o Gabinete.');
 const db=new pg.Client({connectionString:removerSslDoEndereco(process.env.POSTGRES_PRISMA_URL),ssl:{ca:CERTIFICADO_SUPABASE,checkServerIdentity:()=>undefined},connectionTimeoutMillis:10000,query_timeout:30000});
 try{await db.connect();await db.query('BEGIN');await db.query("SELECT pg_advisory_xact_lock(hashtext('hub-gabinete-0031'))");await db.query(await fs.readFile(new URL('../prisma/migrations/0031_gabinete_curiosidades/migration.sql',import.meta.url),'utf8'));await db.query(await fs.readFile(new URL('../prisma/migrations/0032_acervo_magico/migration.sql',import.meta.url),'utf8'));await db.query(await fs.readFile(new URL('../prisma/migrations/0033_criaturas_revelacao/migration.sql',import.meta.url),'utf8'));await db.query('COMMIT');console.log('Acervo Mágico: estrutura e coleções atualizadas; aquisições e fichas preservadas.');}catch(e){await db.query('ROLLBACK').catch(()=>{});console.error('Falha ao preparar o Gabinete:',e.code??e.name);process.exitCode=1;}finally{await db.end();}
}else console.log('Gabinete: preparação do banco reservada ao ambiente de publicação.');
