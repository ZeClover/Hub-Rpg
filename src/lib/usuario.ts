import { cache } from "react";

import { banco } from "@/lib/banco";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type UsuarioLogado = {
  id: string;
  email: string;
  nome: string | null;
  avatarUrl: string | null;
};

/*
  Quem está pedindo esta página?

  Devolve `null` se ninguém estiver logado. Toda página protegida do Hub começa
  chamando esta função — é o único lugar que decide "quem é você".

  Usamos `getUser()`, e não `getSession()`: o primeiro confere a identidade com
  o servidor do Supabase, o segundo confia no que veio no cookie. Como a
  permissão do Hub depende de saber quem é a pessoa (decisão #13), a conferência
  precisa ser de verdade.

  O `cache()` em volta faz a resposta ser reaproveitada dentro de um mesmo
  carregamento de página. Sem ele, uma página que pergunta "quem é você?" no
  cabeçalho e de novo no corpo faria a conferência duas vezes.
*/
export const usuarioAtual = cache(async function usuarioAtual(): Promise<UsuarioLogado | null> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  /*
    O Supabase guarda a conta em área própria dele. O Hub mantém um espelho na
    tabela `usuarios` para poder ligar a pessoa aos universos, campanhas e
    fichas dela. O `upsert` cria no primeiro acesso e atualiza nome e foto nos
    seguintes — se a pessoa trocar a foto no Google, o Hub acompanha.
  */
  const nome =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  return banco.usuario.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email, nome, avatarUrl },
    update: { email: user.email, nome, avatarUrl },
    select: { id: true, email: true, nome: true, avatarUrl: true },
  });
});
