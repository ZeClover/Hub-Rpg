import { banco } from "./banco";
import { SISTEMAS } from "./sistemas";

// Apenas chamadas autenticadas de criação registram o novo sistema.
// Não altera fichas existentes nem depende de migração do banco.
export async function obterSistemaCadastrado(chave: string) {
  const existente = await banco.sistema.findUnique({ where: { chave } });
  if (existente || !["pathfinder-2e-remaster", "wands-wizards"].includes(chave)) return existente;
  const sistema = SISTEMAS.find((s) => s.chave === chave)!;
  return banco.sistema.upsert({
    where: { chave }, update: {},
    create: { chave, nome: sistema.nome, descricao: sistema.descricao },
  });
}
