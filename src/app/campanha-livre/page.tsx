import { Suspense } from "react";

import { FichaCampanhaLivre } from "./ficha-cliente";

/*
  `useSearchParams()` (usado pra ler o `?id=`) precisa de um limite de
  Suspense — sem isso o Next reclama na build. A ficha de verdade mora em
  `ficha-cliente.tsx`; este arquivo só existe pra dar esse limite.
*/
export default function PaginaCampanhaLivre() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-6 py-14 text-sm text-texto-suave">Carregando…</main>}>
      <FichaCampanhaLivre />
    </Suspense>
  );
}
