import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { CERTIFICADO_SUPABASE } from "@/lib/certificado-supabase";

/*
  Conexão com o banco de dados.

  Quatro decisões estão embutidas aqui:

  1. Usamos a conexão "com fila" (`POSTGRES_PRISMA_URL`). O Hub roda em funções
     que nascem e morrem a cada visita; sem uma fila na frente, um punhado de
     acessos simultâneos estoura o limite de conexões do plano gratuito.

  2. A conexão só é aberta na primeira consulta de verdade, nunca quando o
     arquivo é carregado. Isso importa porque o processo que monta o site para
     publicação também carrega este arquivo, e lá o endereço do banco não
     existe — abrir na carga faria a publicação falhar.

  3. Guardamos a conexão numa variável global fora de produção. Sem isso, cada
     recarregamento de código criaria uma conexão nova e o banco acabaria
     recusando as próximas.

  4. Esta conexão fala com o Postgres direto, como dona do banco — por isso
     passa por fora da trava que fechamos nas tabelas (migração 0002). É de
     propósito: aquela trava bloqueia o acesso vindo do navegador, e este é o
     caminho autorizado, onde as regras de permissão do Hub são aplicadas
     (decisão #13).
*/
function criarConexao(): PrismaClient {
  const endereco = process.env.POSTGRES_PRISMA_URL;
  if (!endereco) {
    throw new Error(
      "POSTGRES_PRISMA_URL não está definida. Ela vem da integração do " +
        "Supabase na Vercel — confira as variáveis de ambiente do projeto.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: endereco,
      /*
        O Supabase assina o certificado do banco com uma autoridade própria,
        que o Node não conhece. Informamos essa autoridade aqui, em vez de
        desligar a checagem — a conexão continua sendo conferida, e ninguém
        consegue se passar pelo banco no meio do caminho.

        `checkServerIdentity` vazio dispensa só a conferência do nome do
        servidor. O endereço do banco muda conforme a fila de conexões do
        Supabase, e esse nome não bate com o do certificado. A cadeia de
        assinatura, que é o que impede um impostor, continua sendo exigida.
        Isso equivale ao modo "verify-ca" do Postgres.
      */
      ssl: {
        ca: CERTIFICADO_SUPABASE,
        checkServerIdentity: () => undefined,
      },
    }),
  });
}

const globalComPrisma = globalThis as unknown as {
  conexaoPrisma?: PrismaClient;
};

function conexao(): PrismaClient {
  if (!globalComPrisma.conexaoPrisma) {
    globalComPrisma.conexaoPrisma = criarConexao();
  }
  return globalComPrisma.conexaoPrisma;
}

/*
  `banco` se comporta como o cliente do Prisma, mas é um intermediário: ele só
  cria a conexão de verdade quando alguém usa alguma coisa dele. Daí o
  intermediário (`Proxy`) em vez do cliente direto.
*/
export const banco = new Proxy({} as PrismaClient, {
  get(_alvo, propriedade) {
    const cliente = conexao() as unknown as Record<string | symbol, unknown>;
    const valor = cliente[propriedade];
    return typeof valor === "function" ? valor.bind(cliente) : valor;
  },
});
