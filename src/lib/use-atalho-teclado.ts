import { useEffect, useRef } from "react";

/*
  Atalho de teclado simples (decisão #145, ideia #127) — nunca dispara
  enquanto a pessoa está digitando em input/textarea/select ou num campo
  editável, pra não atrapalhar quem está preenchendo um campo de texto.
  Só pra telas com uma ação repetida com muita frequência (hoje: "Próximo
  turno" da Mesa ao Vivo) — não é um sistema geral de comandos.
*/
export function useAtalhoTeclado(tecla: string, aoAcionar: () => void, ativo = true) {
  const callbackAtual = useRef(aoAcionar);
  useEffect(() => {
    callbackAtual.current = aoAcionar;
  });

  useEffect(() => {
    if (!ativo) return;

    function ouvir(evento: KeyboardEvent) {
      const alvo = evento.target as HTMLElement | null;
      const digitando =
        alvo instanceof HTMLInputElement ||
        alvo instanceof HTMLTextAreaElement ||
        alvo instanceof HTMLSelectElement ||
        alvo?.isContentEditable;
      if (digitando) return;
      if (evento.key.toLowerCase() === tecla.toLowerCase()) {
        evento.preventDefault();
        callbackAtual.current();
      }
    }

    document.addEventListener("keydown", ouvir);
    return () => document.removeEventListener("keydown", ouvir);
  }, [tecla, ativo]);
}
