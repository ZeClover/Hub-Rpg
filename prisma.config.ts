import path from "node:path";
import { defineConfig } from "prisma/config";

/*
  A partir do Prisma 7, o endereço de conexão do banco fica aqui, e não dentro
  do schema. Esta configuração serve só para criar e alterar tabelas, então
  usa a conexão direta (sem fila) — é a exigida para mexer na estrutura.

  A variável é criada automaticamente pela integração do Supabase na Vercel;
  nenhuma senha mora no repositório.
*/
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING,
  },
});
