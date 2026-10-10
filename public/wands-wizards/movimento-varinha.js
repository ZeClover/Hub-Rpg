// Follow accessibility preferences unless the player explicitly chooses full motion.
export const preferenciaMovimento=matchMedia('(prefers-reduced-motion: reduce)');
export const ANIMACOES={sistema:'Seguir meu dispositivo',completa:'Animação completa',reduzida:'Sem movimento'};
export function movimentoReduzido(dados){const escolha=dados?.varinhaVisual?.animacao;return escolha==='reduzida'||escolha!=='completa'&&preferenciaMovimento.matches;}
