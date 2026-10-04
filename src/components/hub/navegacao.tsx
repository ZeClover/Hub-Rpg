"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icone, type NomeIcone } from "./icone";
const destinos: { href: string; nome: string; icone: NomeIcone }[] = [
  { href: "/painel", nome: "Painel", icone: "painel" },
  { href: "/fichas", nome: "Personagens", icone: "personagem" },
  { href: "/campanhas", nome: "Campanhas", icone: "campanha" },
  { href: "/sistemas", nome: "Sistemas", icone: "livro" },
  { href: "/itens", nome: "Itens", icone: "bolsa" },
  { href: "/atualizacoes", nome: "Atualizações", icone: "novidades" },
];
export function NavegacaoHub({ mobile = false }: { mobile?: boolean }) {
  const caminho = usePathname();
  const [mais, setMais] = useState(false);
  const ativos = mobile ? destinos.slice(0, 4) : destinos;
  return (
    <>
      <nav
        aria-label={mobile ? "Navegação principal no celular" : "Menu do Hub"}
        className={mobile ? "hub-nav-mobile sem-impressao" : "hub-nav"}
      >
        {ativos.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            aria-current={
              caminho === d.href || caminho.startsWith(`${d.href}/`)
                ? "page"
                : undefined
            }
            onClick={() => setMais(false)}
          >
            <Icone nome={d.icone} />
            <span>{d.nome}</span>
          </Link>
        ))}
        {mobile && (
          <button
            type="button"
            aria-expanded={mais}
            aria-controls="hub-mais"
            onClick={() => setMais(!mais)}
          >
            <Icone nome="mais" />
            <span>Mais</span>
          </button>
        )}
      </nav>
      {mobile && mais && (
        <div className="hub-menu-mais sem-impressao" id="hub-mais">
          <div className="hub-section-heading">
            <strong>Mais no Hub</strong>
            <button
              className="hub-icon-button"
              aria-label="Fechar menu"
              onClick={() => setMais(false)}
            >
              <Icone nome="fechar" />
            </button>
          </div>
          {destinos.slice(4).map((d) => (
            <Link key={d.href} href={d.href} onClick={() => setMais(false)}>
              <Icone nome={d.icone} />
              {d.nome}
            </Link>
          ))}
          <Link href="/creditos" onClick={() => setMais(false)}>
            Créditos das imagens
          </Link>
          <form action="/auth/sair" method="post">
            <button type="submit">Sair da conta</button>
          </form>
        </div>
      )}
    </>
  );
}
