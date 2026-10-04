"use client";
import { useId, useState, type ReactNode } from "react";
import { Icone } from "./icone";

export type EntradaColecao = {
  id: string;
  nome: string;
  busca?: string;
  sistema?: string;
  campanha?: string;
  status?: string;
  papel?: string;
  tipo?: string;
  favorito?: boolean;
  conteudo: ReactNode;
};
type Filtro = "sistema" | "campanha" | "status" | "papel";
const rotulos: Record<Filtro, string> = {
  sistema: "Sistema",
  campanha: "Campanha",
  status: "Status",
  papel: "Seu papel",
};
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}
export function Colecao({
  entradas,
  filtros = [],
  classe = "",
  placeholder = "Nome, sistema ou campanha…",
  sistemaInicial = "",
  vazio = "Sua biblioteca está esperando sua primeira aventura.",
  acaoVazia,
  tipos,
  rotuloOrdem = "Ordem recente",
}: {
  entradas: EntradaColecao[];
  filtros?: Filtro[];
  classe?: string;
  placeholder?: string;
  sistemaInicial?: string;
  vazio?: string;
  acaoVazia?: ReactNode;
  tipos?: string[];
  rotuloOrdem?: string;
}) {
  const idFiltros = useId();
  const [mostrarFiltros, setMostrarFiltros] = useState(!!sistemaInicial);
  const [busca, setBusca] = useState("");
  const [selecoes, setSelecoes] = useState<Record<Filtro, string>>({
    sistema: sistemaInicial,
    campanha: "",
    status: "",
    papel: "",
  });
  const [ordem, setOrdem] = useState("recentes");
  const [visual, setVisual] = useState("galeria");
  const [tipo, setTipo] = useState("");
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  const temFiltro =
    !!busca ||
    Object.values(selecoes).some(Boolean) ||
    !!tipo ||
    somenteFavoritos;
  const visiveis = entradas
    .filter(
      (e) =>
        (!tipo || e.tipo === tipo) &&
        (!somenteFavoritos || e.favorito) &&
        filtros.every((f) => !selecoes[f] || e[f] === selecoes[f]) &&
        normalizar(
          [e.nome, e.busca, e.sistema, e.campanha, e.status, e.papel]
            .filter(Boolean)
            .join(" "),
        ).includes(normalizar(busca.trim())),
    )
    .sort((a, b) =>
      ordem === "nome"
        ? a.nome.localeCompare(b.nome, "pt-BR")
        : ordem === "favoritos"
          ? Number(!!b.favorito) - Number(!!a.favorito)
          : 0,
    );
  function limpar() {
    setBusca("");
    setSelecoes({ sistema: "", campanha: "", status: "", papel: "" });
    setTipo("");
    setSomenteFavoritos(false);
  }
  return (
    <section aria-label="Biblioteca">
      {tipos && (
        <div className="hub-tabs" aria-label="Tipo de ficha">
          <button aria-pressed={!tipo} onClick={() => setTipo("")}>
            Todas ({entradas.length})
          </button>
          {tipos.map((t) => (
            <button
              key={t}
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
            >
              {t} ({entradas.filter((e) => e.tipo === t).length})
            </button>
          ))}
        </div>
      )}
      <div className="hub-collection-toolbar">
        <div className="hub-search">
          <label htmlFor="hub-busca">Buscar na biblioteca</label>
          <div className="hub-search-control">
            <Icone nome="busca" />
            <input
              id="hub-busca"
              type="search"
              className="hub-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        </div>
        <div
          className="hub-secondary-filters"
          id={idFiltros}
          data-open={mostrarFiltros}
        >
          {filtros.map((f) => (
            <div className="hub-filter" key={f}>
              <label htmlFor={`filtro-${f}`}>{rotulos[f]}</label>
              <select
                id={`filtro-${f}`}
                className="hub-input"
                value={selecoes[f]}
                onChange={(e) =>
                  setSelecoes({ ...selecoes, [f]: e.target.value })
                }
              >
                <option value="">{f === "campanha" ? "Todas" : "Todos"}</option>
                {Array.from(
                  new Set(
                    entradas.map((e) => e[f]).filter((v): v is string => !!v),
                  ),
                )
                  .sort((a, b) => a.localeCompare(b, "pt-BR"))
                  .map((v) => (
                    <option key={v}>{v}</option>
                  ))}
              </select>
            </div>
          ))}
          <div className="hub-filter">
            <label htmlFor="hub-ordem">Ordenar</label>
            <select
              id="hub-ordem"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="hub-input"
            >
              <option value="recentes">{rotuloOrdem}</option>
              <option value="nome">Nome A–Z</option>
              {entradas.some((e) => e.favorito !== undefined) && (
                <option value="favoritos">Favoritos primeiro</option>
              )}
            </select>
          </div>
        </div>
        <button
          type="button"
          className="hub-button hub-filter-toggle"
          aria-label="Filtros e ordenação"
          aria-controls={idFiltros}
          aria-expanded={mostrarFiltros}
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Icone nome="filtro" /> Filtros
          {Object.values(selecoes).some(Boolean) && (
            <span className="hub-badge">
              {Object.values(selecoes).filter(Boolean).length}
            </span>
          )}
        </button>
        <div className="hub-view-controls">
          <button
            type="button"
            className="hub-icon-button"
            aria-label="Mostrar galeria"
            aria-pressed={visual === "galeria"}
            onClick={() => setVisual("galeria")}
          >
            <Icone nome="grade" />
          </button>
          <button
            type="button"
            className="hub-icon-button"
            aria-label="Mostrar lista compacta"
            aria-pressed={visual === "lista"}
            onClick={() => setVisual("lista")}
          >
            <Icone nome="lista" />
          </button>
        </div>
      </div>
      <div className="hub-collection-info">
        <p role="status">
          {visiveis.length} de {entradas.length}{" "}
          {entradas.length === 1 ? "entrada" : "entradas"}
          {temFiltro ? " · filtros ativos" : " na biblioteca"}
        </p>
        <div className="flex gap-4">
          {entradas.some((e) => e.favorito !== undefined) && (
            <button
              aria-pressed={somenteFavoritos}
              onClick={() => setSomenteFavoritos(!somenteFavoritos)}
              className={somenteFavoritos ? "text-ambar-forte" : ""}
            >
              ★ Só favoritos
            </button>
          )}
          {temFiltro && (
            <button onClick={limpar} className="text-ambar-forte">
              Limpar filtros
            </button>
          )}
        </div>
      </div>
      {visiveis.length ? (
        <ul className={`hub-grid ${classe}`} data-view={visual}>
          {visiveis.map((e) => (
            <li key={e.id}>{e.conteudo}</li>
          ))}
        </ul>
      ) : (
        <div className="hub-empty">
          <Icone nome="livro" width={32} height={32} />
          <h2 className="font-titulo text-xl">
            {entradas.length
              ? "Nenhum resultado encontrado"
              : "Sua próxima história começa aqui"}
          </h2>
          <p>
            {entradas.length
              ? "Experimente outro nome ou limpe os filtros para ver toda a biblioteca."
              : vazio}
          </p>
          {entradas.length ? (
            <button className="hub-button" onClick={limpar}>
              Limpar filtros
            </button>
          ) : (
            acaoVazia
          )}
        </div>
      )}
    </section>
  );
}
