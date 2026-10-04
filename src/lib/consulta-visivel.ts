/* A leitura periódica só tem utilidade enquanto a pessoa olha a aba.
   Esperamos cada resposta antes de marcar a próxima leitura, para não
   acumular consultas quando a conexão está lenta. Não guarda dados. */
export function consultarEnquantoVisivel(
  buscar: (signal: AbortSignal) => Promise<void>,
  intervaloMs: number,
) {
  let encerrado = false;
  let requisicao: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function consultar() {
    if (encerrado || document.hidden || requisicao) return;
    const atual = new AbortController();
    requisicao = atual;
    try {
      await buscar(atual.signal);
    } catch {
      // Falhas temporárias não apagam a última leitura; tentamos novamente.
    } finally {
      if (requisicao === atual) {
        requisicao = null;
        if (!encerrado && !document.hidden) {
          timer = setTimeout(consultar, intervaloMs);
        }
      }
    }
  }

  function mudouVisibilidade() {
    clearTimeout(timer);
    if (document.hidden) {
      requisicao?.abort();
    } else {
      // A leitura abortada pode ainda estar terminando; a próxima já pode
      // começar, sem permitir que a antiga programe outro intervalo.
      if (requisicao?.signal.aborted) requisicao = null;
      void consultar();
    }
  }

  document.addEventListener("visibilitychange", mudouVisibilidade);
  void consultar();
  return () => {
    encerrado = true;
    clearTimeout(timer);
    requisicao?.abort();
    document.removeEventListener("visibilitychange", mudouVisibilidade);
  };
}
