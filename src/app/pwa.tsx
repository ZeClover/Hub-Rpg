"use client";

import { useEffect, useState } from "react";

/*
  Registra o service worker (decisão #150, ideias #128/#129) e mostra um
  aviso quando a conexão cai ou volta.

  Por que só um aviso, sem recarregar sozinho: as fichas salvam sozinhas a
  cada mudança (decisão #46), mas cada uma delas ainda manda esse
  salvamento direto pra rede — não existe hoje uma fila de "salvar quando
  voltar a internet" dentro de nenhuma ficha (são ~10 arquivos HTML soltos,
  sem nada em comum entre eles — decisão #17). Recarregar a página sozinho
  ao reconectar arriscaria jogar fora uma mudança feita offline que ainda
  não tinha sido salva. Por isso a sincronização automática (ideia #130)
  fica só neste aviso por enquanto: a pessoa fica sabendo do estado da
  conexão e decide se quer recarregar.
*/
export function Pwa() {
  const [offline, setOffline] = useState(false);
  const [avisoReconexao, setAvisoReconexao] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sem service worker, o Hub continua funcionando normal — só sem
        // cache offline.
      });
    }
  }, []);

  useEffect(() => {
    function ficouOffline() {
      setOffline(true);
      setAvisoReconexao(false);
    }
    function ficouOnline() {
      setOffline(false);
      setAvisoReconexao(true);
      setTimeout(() => setAvisoReconexao(false), 5000);
    }
    window.addEventListener("offline", ficouOffline);
    window.addEventListener("online", ficouOnline);
    return () => {
      window.removeEventListener("offline", ficouOffline);
      window.removeEventListener("online", ficouOnline);
    };
  }, []);

  if (!offline && !avisoReconexao) return null;

  return (
    <div
      role="status"
      className={
        offline
          ? "fixed inset-x-0 bottom-0 z-50 bg-segredo/90 px-4 py-2 text-center text-sm text-texto"
          : "fixed inset-x-0 bottom-0 z-50 bg-ambar/90 px-4 py-2 text-center text-sm text-fundo"
      }
    >
      {offline
        ? "Sem conexão — só telas e fichas já visitadas abrem agora. Mudanças podem não salvar até reconectar."
        : "Conectado de novo."}
    </div>
  );
}
