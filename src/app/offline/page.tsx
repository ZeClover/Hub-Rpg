/*
  Página de fallback do service worker (decisão #150, ideia #128) — só
  aparece quando o navegador tenta abrir uma tela que nunca foi visitada
  antes e não há internet. Fora de "(hub)" de propósito: não pode exigir
  login, porque é servida direto pelo cache, sem passar pelo servidor.
*/
export const metadata = {
  title: "Sem conexão — Hub RPG",
};

export default function Offline() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-titulo text-xs uppercase tracking-[0.35em] text-ambar">
        Hub RPG
      </p>
      <h1 className="mt-4 font-titulo text-2xl">Sem conexão</h1>
      <p className="mt-3 text-sm leading-relaxed text-texto-suave">
        Esta tela ainda não tinha sido aberta antes, então não tem uma
        versão salva pra mostrar sem internet. Telas e fichas que você já
        visitou continuam abrindo normalmente.
      </p>
    </main>
  );
}
