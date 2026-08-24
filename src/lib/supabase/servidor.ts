import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
  Cliente do Supabase para uso NO SERVIDOR.

  Ele guarda a sessão de quem está logado em cookies. Como um Server Component
  no Next.js só pode ler cookies (não escrever), a gravação é feita pelo
  middleware — por isso o `try/catch` silencioso abaixo não é descuido.
*/
export async function criarClienteServidor() {
  const cookiesDaRequisicao = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookiesDaRequisicao.getAll();
        },
        setAll(novosCookies) {
          try {
            for (const { name, value, options } of novosCookies) {
              cookiesDaRequisicao.set(name, value, options);
            }
          } catch {
            // Chamado de dentro de um Server Component: o middleware renova.
          }
        },
      },
    },
  );
}
