"use client";

import type { ReactNode } from "react";

export function LinkCriacao({ children }: { children: ReactNode }) {
  return (
    <a
      href="#criar-personagem"
      className="hub-button hub-button-primary"
      onClick={() => {
        const criacao = document.getElementById("criar-personagem");
        if (criacao instanceof HTMLDetailsElement) criacao.open = true;
      }}
    >
      {children}
    </a>
  );
}
