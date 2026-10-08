declare namespace regras {
  interface Ficha extends Record<string, unknown> {
    sistema: string; versaoFicha: number; nome: string; nivel: number; xp: number;
    ancestralidadeId: string; herancaId: string; biografiaId: string; classeId: string;
    opcaoClasseId: string; atributoChave: string; ancestralidadeAlternativa: boolean;
    atributos: Record<string, number>; pericias: Record<string, number>;
    incrementos: { ancestralidade: string[]; biografia: string[]; classe: string[]; livres: string[]; nivel: Record<string, string[]> };
    talentos: Array<{ id: string; nivel: number; tipo: string; [chave: string]: unknown }>;
    magias: unknown[]; equipamentos: unknown[]; condicoes: unknown[];
    vida: { atual: number; maxima: number; temporaria: number; [chave: string]: unknown };
    notas: string; _guiado: { concluido: boolean; passo: number; [chave: string]: unknown };
  }
  interface Ganho extends Record<string, unknown> { nivel: number; nome: string; descricao: string; automatico: boolean }
  interface Calculo {
    limiteMorrendo: number; cdRecuperacaoAjuste: number; atributos: Record<string, number>; incrementosParciais: Record<string, boolean>; pvMaximos: number; ca: number; percepcao: number;
    salvaguardas: { fortitude: number; reflexos: number; vontade: number }; pericias: Record<string, number>; grausPericias: Record<string, number>;
    proficiencias: Record<string, unknown>; cdClasse: number; cdMagia: number | null; ataqueMagia: number | null;
    deslocamento: number; ataque: number; atletismoAtaque: number; natacao: number | null; map: number[];
    ganhos: Ganho[]; treinamentosExtras: number; periciasTreinadasEscolhidas: number;
    equipamento: { armadura: Record<string, unknown> | null; arma: Record<string, unknown> | null; escudo: Record<string, unknown> | null };
    escudoCalculado: Record<string, unknown> | null; bloqueioEscudo: boolean;
    armaSelecionada: Record<string, unknown> | null; graduacaoArma: number; dadosArma: number; facesDanoArma: number; bonusDanoArma: number;
    facesDanoArmaPorMaos: { 1: number; 2: number };
    danoArma: string; atributoDanoArma: string | null; ataques: number[]; caSemEscudo: number; caComEscudo: number;
    danoExtraFuria: { tipo: string; valor: number } | null;
    conjuracao: Record<string, unknown> | null;
    defesas: { imunidades: string[]; resistencias: Array<{ tipo: string; valor: number }>; fraquezas: Array<{ tipo: string; valor: number }>; curaPeloVazio: boolean };
    recursosCalculados: Array<{ id: string; nome?: string; maximo: number; ativo: boolean; recuperacao: Record<string, unknown>; [chave: string]: unknown }>;
    carga: { volume: number; leves: number; limiteSobrecarga: number; limiteMaximo: number; sobrecarregado: boolean; acimaMaximo: boolean; pendentes: string[] };
    danosExtras: Array<{ nome: string; expressao: string; tipo: string }>; atributoAtaqueArma: string; bonusIniciativa: number;
  }
  interface Validacao { valido: boolean; erros: string[]; avisos: string[]; pendencias: string[] }
  interface EscolhaTalento { tipo: string; nivel: number; origem: string | null; quantidade: number; nivelMaximoTalento?: number }
  function criar(catalogo?: unknown): Ficha;
  function normalizar(personagem: unknown, catalogo?: unknown): Ficha;
  function calcular(personagem: unknown, catalogo?: unknown): Calculo;
  function validar(personagem: unknown, catalogo?: unknown): Validacao;
  function incrementarAtributo(valor: number): number;
  function grauSucesso(d20: number, total: number, cd: number): 'falha-critica' | 'falha' | 'sucesso' | 'sucesso-critico';
  function evoluir(personagem: unknown, nivel: number, catalogo?: unknown): Ficha;
  function escolhasTalentos(personagem: unknown, catalogo?: unknown): EscolhaTalento[];
  function magiaElegivel(personagem: unknown, id: string, catalogo?: unknown): boolean;
  function escolhasExtras(personagem: unknown, catalogo?: unknown): Array<Record<string, unknown>>;
  function bonusProficiencia(grau: number, nivel: number): number;
  const pericias: Array<{ id: string; nome: string; atributo: string }>;
  const atributos: string[];
}
export = regras;
