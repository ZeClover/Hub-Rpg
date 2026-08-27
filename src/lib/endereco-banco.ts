/*
  Tira o parâmetro `sslmode` do endereço de conexão do banco.

  POR QUE ISTO EXISTE

  A biblioteca que conversa com o Postgres lê o endereço de conexão e, se
  encontrar `sslmode` lá dentro, monta a configuração de segurança por conta
  própria — jogando fora a que a gente passou junto, inclusive o certificado
  da autoridade do Supabase. O resultado era a conexão ser recusada com
  "self-signed certificate in certificate chain".

  Tirando o parâmetro, a nossa configuração é a que vale.

  A troca é feita só no pedaço de parâmetros, depois do "?". O começo do
  endereço, que carrega usuário e senha, não é tocado: reescrever aquilo
  poderia alterar caracteres especiais da senha e derrubar o acesso.
*/
const PARAMETROS_REMOVIDOS = new Set(["sslmode", "ssl"]);

export function removerSslDoEndereco(endereco: string): string {
  const inicioDosParametros = endereco.indexOf("?");
  if (inicioDosParametros === -1) return endereco;

  const base = endereco.slice(0, inicioDosParametros);
  const mantidos = endereco
    .slice(inicioDosParametros + 1)
    .split("&")
    .filter((par) => {
      const chave = par.split("=")[0].toLowerCase();
      return par !== "" && !PARAMETROS_REMOVIDOS.has(chave);
    });

  return mantidos.length > 0 ? `${base}?${mantidos.join("&")}` : base;
}
