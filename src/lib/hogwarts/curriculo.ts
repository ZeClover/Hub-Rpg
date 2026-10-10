/** Liberações nunca rebaixam conhecimentos; promoção avança uma etapa. */
export function estadoAposAula(atual: string | undefined, acao: string, cumpre: boolean) {
  const adquiridos = ['formacao-inicial', 'conhecido', 'dominado', 'assinatura'];
  if (acao === 'promover') {
    if (atual === 'assinatura') return atual;
    if (atual === 'dominado') return 'assinatura';
    if (atual === 'conhecido' || atual === 'formacao-inicial') return 'dominado';
    throw new Error('Só é possível promover um conteúdo já conhecido.');
  }
  if (adquiridos.includes(atual ?? '')) return atual!;
  return acao === 'conceder' ? 'conhecido' : cumpre ? 'disponivel' : 'bloqueado';
}
