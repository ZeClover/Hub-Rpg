"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/*
  QR Code do link de convite (decisão #138) — útil pra projetar numa tela
  ou mostrar no celular numa sessão presencial, em vez de ditar o link
  letra por letra. Gerado no próprio navegador (pacote `qrcode`, sem
  serviço externo nenhum) — mantém o convite igual de privado que já era:
  ninguém além de quem está vendo esta tela sabe que o código existe.
*/
export function QrCode({ valor }: { valor: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    QRCode.toDataURL(valor, { margin: 1, width: 160 })
      .then((url) => {
        if (!cancelado) setDataUrl(url);
      })
      .catch(() => {
        // Sem QR, o link de texto logo acima continua funcionando normal.
      });
    return () => {
      cancelado = true;
    };
  }, [valor]);

  if (!dataUrl) return null;

  // eslint-disable-next-line @next/next/no-img-element -- data: URL gerada no navegador, não um asset otimizável pelo Next.
  return <img src={dataUrl} alt="QR Code do convite" width={160} height={160} className="mt-3 rounded border border-borda bg-white p-2" />;
}
