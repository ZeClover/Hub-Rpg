export type PapelHogwarts = "MESTRE" | "MESTRE_AUXILIAR" | "JOGADOR" | null;

export type AcaoHogwarts =
  | "perfil.editar"
  | "recurso.usar"
  | "formacao.confirmar"
  | "conteudo.gerenciar"
  | "progressao.aplicar"
  | "economia.gerenciar"
  | "academico.gerenciar"
  | "bestiario.revelar"
  | "varinha.entregar"
  | "segredo.ler";

const ACOES_DO_MESTRE = new Set<AcaoHogwarts>([
  "conteudo.gerenciar",
  "progressao.aplicar",
  "economia.gerenciar",
  "academico.gerenciar",
  "bestiario.revelar",
  "varinha.entregar",
  "segredo.ler",
]);

export function papelEhMestreHogwarts(papel: PapelHogwarts): boolean {
  return papel === "MESTRE" || papel === "MESTRE_AUXILIAR";
}

/** Contrato central de autorização. A interface nunca substitui esta regra. */
export function podeExecutarAcaoHogwarts(
  papel: PapelHogwarts,
  acao: AcaoHogwarts,
  contexto: { ehDono?: boolean } = {},
): boolean {
  if (papelEhMestreHogwarts(papel)) return true;
  if (papel !== "JOGADOR" || contexto.ehDono !== true) return false;
  return acao === "perfil.editar" || acao === "recurso.usar" || acao === "formacao.confirmar";
}

export function acaoExigeMestreHogwarts(acao: AcaoHogwarts): boolean {
  return ACOES_DO_MESTRE.has(acao);
}
