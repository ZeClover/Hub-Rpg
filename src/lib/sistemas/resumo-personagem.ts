import { lerResumoVida, type ResumoVida } from "../resumo-vida.ts";
import rotulos from "./rotulos-resumo.json" with { type: "json" };

export type ResumoPersonagem = {
  identidade: string[];
  progressao: string | null;
  vida: ResumoVida | null;
};
type Registro = Record<string, unknown>;
function objeto(valor: unknown): Registro {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Registro)
    : {};
}
function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().slice(0, 100) : "";
}
function numero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0
    ? valor
    : null;
}
function rotulo(sistema: string, valor: unknown): string {
  const id = texto(valor);
  const catalogo =
    (rotulos as Record<string, Record<string, string>>)[sistema] ?? {};
  return (
    catalogo[id] ??
    id.replace(/[-_]/g, " ").replace(/^./u, (letra) => letra.toUpperCase())
  );
}
function nivel(valor: unknown): string | null {
  const n = numero(valor);
  return n === null ? null : `Nível ${n}`;
}
function classes(
  sistema: string,
  dados: Registro,
): { identidade: string[]; progressao: string | null } {
  const escolhidas = (Array.isArray(dados.classes) ? dados.classes : [])
    .map(objeto)
    .filter((c) => texto(c.classeId));
  const custom = (
    Array.isArray(dados.classesCustom) ? dados.classesCustom : []
  ).map(objeto);
  const identidade = escolhidas
    .map(
      (c) =>
        texto(custom.find((x) => x.id === c.classeId)?.nome) ||
        rotulo(sistema, c.classeId),
    )
    .slice(0, 3);
  const niveis = escolhidas.map((c) => numero(c.nivel));
  return {
    identidade,
    progressao:
      niveis.length && niveis.every((n) => n !== null)
        ? nivel(niveis.reduce<number>((s, n) => s + (n ?? 0), 0))
        : null,
  };
}

// Adaptadores de apresentação: leem apenas campos públicos conhecidos.
// O Hub usa o resumo de vida salvo pela ficha e nunca refaz fórmulas.
export function resumirPersonagem(
  sistema: string,
  valor: unknown,
  ehMonstro = false,
): ResumoPersonagem {
  const dados = objeto(valor),
    perfil = objeto(dados.perfil);
  let identidade: string[] = [],
    progressao: string | null = null;
  if (ehMonstro) {
    identidade = [texto(dados.especie), texto(dados.tipo)];
    progressao = nivel(dados.nivel);
  } else
    switch (sistema) {
      case "fabula-ultima":
      case "sao":
        ({ identidade, progressao } = classes(sistema, dados));
        break;
      case "kaizoku-no-sho":
        identidade = [
          texto(perfil.especie),
          texto(perfil.profissao) || rotulo(sistema, perfil.profissaoId),
        ];
        progressao = numero(dados.nc) === null ? null : `NC ${dados.nc}`;
        break;
      case "dnd-5e":
        identidade = [
          rotulo(sistema, perfil.racaId),
          rotulo(sistema, perfil.classeId),
        ];
        progressao = nivel(dados.nivel);
        break;
      case "hogwarts-rpg":
        identidade = [
          texto(perfil.casa),
          numero(perfil.anoEscolar) === null ? "" : `${perfil.anoEscolar}º ano`,
        ];
        progressao = nivel(dados.nivel);
        break;
      case "sistema-do-savio":
        identidade = [rotulo(sistema, dados.especializacaoId)];
        progressao = nivel(dados.nivel);
        break;
      case "thryliki-chelona":
        identidade = [
          rotulo(sistema, perfil.areaId),
          rotulo(sistema, perfil.ramoId),
          numero(dados.ano) === null ? "" : `${dados.ano}º ano`,
        ];
        progressao = nivel(dados.nivel);
        break;
      case "campanha-livre":
        identidade = [texto(perfil.identidade)];
        break;
    }
  const vida = lerResumoVida(dados);
  return {
    identidade: identidade.filter(Boolean),
    progressao,
    vida:
      vida &&
      Number.isFinite(vida.atual) &&
      Number.isFinite(vida.maxima) &&
      vida.maxima > 0
        ? vida
        : null,
  };
}
