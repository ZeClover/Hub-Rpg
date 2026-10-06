declare namespace combate {
  interface Falha { suportado: false; motivo: string; ficha?: Record<string, unknown> }
  interface Rolagem { formula: string; total: number; rolagens: Array<{ quantidade: number; faces: number; resultados: number[]; total: number }> }
  interface PlanoArma { suportado: true; tipoEfeito: 'dano'; tipoDano: string; modo: string; critico: boolean; minimo: number; multiplicador: number;
    base: { quantidade: number; faces: number; bonus: number }; extras: Array<{ quantidade: number; faces: number; origem: string }>; partesExtras?: Array<{tipo:string;valor:number;origem:string}>; extrasPrecisao?:Array<{nome?:string;formula:string}>;
    formula: string; modificadorAtributo: number; bonusDano: number; fonte: { livro: string; paginas: number[] } }
  interface ParteDano { tipo: string; valor: number; valorSemDobra?: number; precisao?:boolean }
  interface Defesas { imunidades?: string[]; resistencias?: Array<{ tipo: string; valor: number; [campo: string]: unknown }>;
    fraquezas?: Array<{ tipo: string; valor: number; [campo: string]: unknown }>; curaPeloVazio?: boolean }
  interface OpcoesArma { modo?: 'corpo-a-corpo' | 'distancia' | 'arremesso'; critico?: boolean; dadosArma?: number; dadosMortal?: number; bonusDano?: number; maos?: number; tipoDano?: string }
  interface OpcoesDano { defesas?: Defesas; danoFinal?: boolean; critico?: boolean; naoLetal?: boolean; falhaCritica?: boolean; usaMorrendo?: boolean; efeitoMorte?: boolean; limiteMorrendo?: number }
  interface CalculoArma { atributos: Record<string, number>; dadosArma?: number; facesDanoArma?: number; facesDanoArmaPorMaos?: Record<string,number>; danoExtraFuria?: {valor:number;tipo:string}|null; danosExtras?:Array<{nome?:string;expressao:string;tipo:'precisao'}>; bonusDanoArma?: number; atributoDanoArma?: string; [campo: string]: unknown }
  interface Vida { atual: number; maxima: number; temporaria?: number; [campo: string]: unknown }
  interface Ficha extends Record<string, unknown> { vida: Vida; condicoes?: unknown[]; morto?: boolean }
  interface DanoAplicado { suportado: true; ficha: Ficha; total: number; absorvidoTemporario: number; perdidoPV: number;
    detalhes: Array<{ tipo: string; inicial: number; imune: boolean; fraqueza: number; resistencia: number; final: number }>; avisos: string[] }
  interface CuraAplicada { suportado: true; ficha: Ficha; recuperadoPV: number; motivo?: string }
  interface DanoRolado { suportado: true; total: number; formula: string; partesDano: ParteDano[]; rolagens: Rolagem[]; minimoAplicado: boolean }
  interface PlanoMagia { suportado: true; formula: string; tipoEfeito: 'cura' | 'dano'; tipoDano: string; tipoCura: string; salvamentoBasico: boolean; exigeAtaque: boolean; componentes?: Array<{tipoDano:string;formula:string}>; ranque: number }
  interface MagiaRolada { suportado: true; total: number; cura: number; partesDano: ParteDano[]; tipoCura: string; rolagens: Rolagem['rolagens']; formula: string }
  function rolar(formula: string, rng?: () => number): Rolagem;
  function danoArma(arma: Record<string, unknown>, calculo: CalculoArma, opcoes?: OpcoesArma): PlanoArma | Falha;
  function rolarDano(plano: PlanoArma | Falha, rng?: () => number): DanoRolado | Falha;
  function aplicarDano(ficha: Record<string, unknown>, partes: ParteDano[], opcoes?: OpcoesDano): DanoAplicado | Falha;
  function curar(ficha: Record<string, unknown>, quantidade: number, opcoes?: { defesas?: Defesas; tipoCura?: string }): CuraAplicada | Falha;
  function magiaEstruturada(magia: Record<string, unknown>, ranque: number, opcoes?: { acoes?: number }): PlanoMagia | Falha;
  function rolarMagia(plano: PlanoMagia | Falha, opcoes?: { grauSalvamento?: string; critico?: boolean }, rng?: () => number): MagiaRolada | Falha;
  interface Turno { encerrado:boolean;acoesGerais:number;acaoAcelerada:number;reacoes:number;podeAgir:boolean;restricoesAcelerada:string[];precisaDefinirRestricoes:boolean;ataquesRealizados:number }
  interface TesteSimples extends Rolagem { cd:number;grau:string;sucesso:boolean }
  interface TurnoIniciado { suportado:true;ficha:Ficha;turno:Turno;recuperacao:(TesteSimples & {morrendoAntes:number;morrendoDepois:number|null})|null;fonte:{livro:string;paginas:number[]} }
  interface TurnoFinalizado { suportado:true;ficha:Ficha;danosPersistentes:Array<{id:string;tipo:string;rolagem:Rolagem;valor:number;recuperacao:TesteSimples}>;dano:DanoAplicado|null;snapshotAntes:Ficha;fonte:{livro:string;paginas:number[]} }
  function grauTeste(total:number,natural:number,cd:number): {suportado:true;grau:string;indice:number}|Falha;
  function verificarConjuracao(ficha:Record<string,unknown>,rng?:()=>number):{suportado:true;interrompida:boolean;teste:TesteSimples|null};
  function podeIngerir(ficha:Record<string,unknown>):{permitido:boolean;motivo:string|null};
  interface BloqueioAplicado {suportado:true;ficha:Ficha;reducaoDureza:number;danoPersonagem:number;danoEscudo:number;escudo:{pvAntes:number;pvDepois:number;quebrado:boolean;destruido:boolean};defesasAplicadas:DanoAplicado['detalhes'];dano:DanoAplicado;snapshotAntes:Ficha;fonte:{livro:string;paginas:number[]}}
  function bloqueioEscudo(ficha:Record<string,unknown>,calculo:Record<string,unknown>,partes:ParteDano[],opcoes:OpcoesDano & {ataque:boolean}):BloqueioAplicado|Falha;
  function iniciarTurno(ficha:Record<string,unknown>,opcoes?:{preservarAcelerada?:boolean;limiteMorrendo?:number},rng?:()=>number):TurnoIniciado|Falha;
  function finalizarTurno(ficha:Record<string,unknown>,opcoes?:{defesas?:Defesas},rng?:()=>number):TurnoFinalizado|Falha;
  function declaracaoIniciativa(nome: string, resultado: number): { nome: string; resultado: number } | Falha;
}
export = combate;
