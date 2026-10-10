export interface Talento { id: string; atributo?: string; pericia?: string; treinamentos?: string[]; idiomas?: string[] }
export interface FichaWands extends Record<string, unknown> {
 tipo: string; nome: string; nivel: number; base: Record<string, number>; casa: string; bonusCasa: string; estilo: string; escola: string;
 antecedente: string; periciasClasse: string[]; periciasEscola: string[]; substituicoesPericias: string[]; beneficiosEscola: Record<string, string>;
 talentoCasa: Talento | null; aumentos: {nivel: number; atributos?: Record<string, number>; talento?: Talento}[];
 magias: string[]; metamagias: string[]; pacoteInicial: string; capa: string; varinha: Record<string, string>; vida: {atual: number | null};
}
export interface CalculoWands extends Record<string, unknown> {
 atributos: Record<string, number>; modificadores: Record<string, number>; beneficiosAtivos: string[]; magiasConcedidas: string[]; metamagiasConcedidas: string[];
 pericias: Record<string, {nome: string; treinada: boolean; especializada: boolean; bonus: number}>;
 ca: number; pvMaximos: number; percepcaoPassiva: number; ataqueMagico: number; espacosPorCirculo: number[];
}
export interface FichaSalva extends FichaWands { inventario: {id: string; nome: string; quantidade: number}[] }
export function prepararFichaWandsWizards(anterior: unknown, recebido: unknown, contexto?: { emCampanha: boolean; ehMestre: boolean }): { erro?: string; dados?: FichaSalva; calculo?: CalculoWands };
export function calcularFicha(dados: unknown): CalculoWands;
export function novaFicha(): FichaWands;
export const CASAS: Record<string, unknown>;
export const ESTILOS: Record<string, unknown>;
export const ATRIBUTOS: Record<string, string>;

export function ganhosDoNivel(dados: unknown): string[];
export const NIVEIS_AUMENTO: number[];
export const METAMAGIAS: Record<string, { nome: string; texto: string }>;

export const CRIACAO: Record<string, unknown>;

export function pendenciasFicha(dados: unknown, calculo?: CalculoWands): string[];
