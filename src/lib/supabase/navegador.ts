import { createBrowserClient } from "@supabase/ssr";

/*
  Cliente do Supabase para uso NO NAVEGADOR.

  Só usa a chave pública (`ANON_KEY`), que é feita para ficar exposta. Ela não
  dá acesso a nada sozinha: as tabelas do Hub estão fechadas para essa chave, e
  toda leitura de dado passa pelo nosso servidor (decisão #13).
*/
export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
