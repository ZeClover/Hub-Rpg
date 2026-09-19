import { banco } from "@/lib/banco";

/*
  Código curto de convite (decisão #138) — mesmo alfabeto usado no backfill
  da migração 0017 (sem 0/O/1/I, pra não confundir na hora de digitar).
*/
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TAMANHO = 6;
const TENTATIVAS_MAXIMAS = 10;

function gerarCandidato(): string {
  let codigo = "";
  for (let i = 0; i < TAMANHO; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

/// Gera um código que ainda não existe em nenhuma campanha. Colisão com 6
/// caracteres de um alfabeto de 32 é rara (1 em ~1 bilhão); mesmo assim,
/// tenta de novo em vez de confiar cegamente na sorte.
export async function gerarCodigoConviteUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < TENTATIVAS_MAXIMAS; tentativa++) {
    const candidato = gerarCandidato();
    const existente = await banco.campanha.findUnique({ where: { codigoConvite: candidato } });
    if (!existente) return candidato;
  }
  throw new Error("não consegui gerar um código de convite único");
}
