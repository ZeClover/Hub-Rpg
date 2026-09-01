"use client";

import { useState } from "react";

import { interpretarHubUpdate, type Alerta, type Mudanca } from "@/lib/campanha-livre/parser.ts";
import type { PersonagemLivre } from "@/lib/campanha-livre/tipos.ts";
import { temErro, validarContraPersonagem } from "@/lib/campanha-livre/validar.ts";

/*
  O coração do protocolo HUB_UPDATE (ver pacote de especificação): cola →
  interpreta → revisa → confirma. Nada é salvo antes do clique em
  "Confirmar selecionadas" (regra #1 da especificação) — até lá isto é só
  estado local do componente.
*/

type Props = {
  dados: PersonagemLivre;
  onConfirmar: (selecionadas: Mudanca[], hash: string, updateId: string | null) => void;
};

export function ImportarDoChat({ dados, onConfirmar }: Props) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [erroParse, setErroParse] = useState<string | null>(null);
  const [mudancas, setMudancas] = useState<Mudanca[] | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [camposDesconhecidos, setCamposDesconhecidos] = useState<string[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [duplicadoConfirmado, setDuplicadoConfirmado] = useState(false);

  const jaImportado = hash
    ? dados.historicoImportacoes.find((h) => h.hash === hash || (updateId && h.updateId === updateId))
    : null;

  function interpretar() {
    setErroParse(null);
    const resultado = interpretarHubUpdate(texto);
    if (!resultado.ok) {
      setErroParse(resultado.erro);
      setMudancas(null);
      return;
    }
    const validadas = validarContraPersonagem(resultado.mudancas, dados);
    setMudancas(validadas);
    setHash(resultado.hash);
    setUpdateId(resultado.cabecalho.updateId);
    setCamposDesconhecidos(resultado.camposDesconhecidos);
    setDuplicadoConfirmado(false);
    // Marca tudo que não tem erro, por padrão — a pessoa desmarca o que não quer.
    setSelecionados(new Set(validadas.filter((m) => !temErro(m)).map((m) => m.id)));
  }

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function editarValor(id: string, novoValor: number) {
    setMudancas((atual) =>
      (atual ?? []).map((m) => {
        if (m.id !== id) return m;
        if (m.tipo === "xp" || m.tipo === "recurso" || m.tipo === "nivel" || m.tipo === "atributo" || m.tipo === "moeda") {
          return { ...m, valor: novoValor };
        }
        if (m.tipo === "item_add" || m.tipo === "item_remove") return { ...m, quantidade: novoValor };
        return m;
      }),
    );
  }

  function limpar() {
    setTexto("");
    setMudancas(null);
    setErroParse(null);
    setHash(null);
    setUpdateId(null);
    setSelecionados(new Set());
    setDuplicadoConfirmado(false);
  }

  function confirmar() {
    if (!mudancas || !hash) return;
    const escolhidas = mudancas.filter((m) => selecionados.has(m.id) && !temErro(m));
    if (escolhidas.length === 0) return;
    onConfirmar(escolhidas, hash, updateId);
    limpar();
    setAberto(false);
  }

  return (
    <section className="mt-8 rounded-lg border border-ambar/30 bg-superficie p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-titulo text-xl">Importar do Chat</h2>
        {!aberto && (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            Colar resposta do ChatGPT
          </button>
        )}
      </div>

      {aberto && (
        <div className="mt-4">
          {!mudancas && (
            <>
              <p className="text-sm text-texto-suave">
                Cole a narrativa inteira ou só o bloco <code>[HUB_UPDATE]...[/HUB_UPDATE]</code>. O resto do texto é
                ignorado.
              </p>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={10}
                placeholder="Cole aqui a resposta do ChatGPT…"
                className="mt-3 w-full rounded border border-borda bg-fundo p-3 font-mono text-xs text-texto placeholder:font-sans placeholder:text-sm placeholder:text-texto-suave"
              />
              {erroParse && <p className="mt-2 text-sm text-segredo">{erroParse}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={interpretar}
                  disabled={!texto.trim()}
                  className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte hover:bg-ambar/20 disabled:opacity-50"
                >
                  Interpretar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    limpar();
                    setAberto(false);
                  }}
                  className="rounded border border-borda px-4 py-2 text-sm text-texto-suave hover:text-texto"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}

          {mudancas && (
            <div>
              {jaImportado && !duplicadoConfirmado && (
                <div className="mb-4 rounded border border-segredo/50 bg-segredo/10 p-3 text-sm text-segredo">
                  <p>
                    Isso parece já ter sido importado em{" "}
                    <strong>{new Date(jaImportado.aplicadoEm).toLocaleString("pt-BR")}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDuplicadoConfirmado(true)}
                    className="mt-2 underline decoration-segredo underline-offset-4"
                  >
                    Importar mesmo assim
                  </button>
                </div>
              )}

              {camposDesconhecidos.length > 0 && (
                <p className="mb-3 text-xs text-texto-suave">
                  Campo(s) que esta versão do Hub ainda não entende, ignorado(s): {camposDesconhecidos.join(", ")}.
                </p>
              )}

              <ul className="space-y-2">
                {mudancas.map((m) => (
                  <LinhaMudanca
                    key={m.id}
                    mudanca={m}
                    dados={dados}
                    marcado={selecionados.has(m.id)}
                    onMarcar={() => alternar(m.id)}
                    onEditar={(v) => editarValor(m.id, v)}
                  />
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={confirmar}
                  disabled={selecionados.size === 0 || (!!jaImportado && !duplicadoConfirmado)}
                  className="rounded border border-ambar/40 bg-ambar/10 px-4 py-2 text-sm text-ambar-forte hover:bg-ambar/20 disabled:opacity-50"
                >
                  Confirmar selecionadas ({selecionados.size})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    limpar();
                    setAberto(false);
                  }}
                  className="rounded border border-borda px-4 py-2 text-sm text-texto-suave hover:text-texto"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function corAlerta(nivel: Alerta["nivel"]): string {
  if (nivel === "error") return "text-segredo";
  if (nivel === "warning") return "text-ambar-forte";
  return "text-texto-suave";
}

function LinhaMudanca({
  mudanca,
  dados,
  marcado,
  onMarcar,
  onEditar,
}: {
  mudanca: Mudanca;
  dados: PersonagemLivre;
  marcado: boolean;
  onMarcar: () => void;
  onEditar: (valor: number) => void;
}) {
  const bloqueado = temErro(mudanca);

  return (
    <li className={`rounded-lg border p-3 ${bloqueado ? "border-segredo/40 bg-segredo/5" : "border-borda bg-fundo"}`}>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={marcado && !bloqueado}
          disabled={bloqueado}
          onChange={onMarcar}
          className="mt-1"
        />
        <div className="flex-1">
          <DescricaoMudanca mudanca={mudanca} dados={dados} onEditar={onEditar} />
          {mudanca.alertas.map((a, i) => (
            <p key={i} className={`mt-1 text-xs ${corAlerta(a.nivel)}`}>
              {a.mensagem}
            </p>
          ))}
        </div>
      </label>
    </li>
  );
}

function DescricaoMudanca({
  mudanca,
  dados,
  onEditar,
}: {
  mudanca: Mudanca;
  dados: PersonagemLivre;
  onEditar: (valor: number) => void;
}) {
  if (mudanca.tipo === "xp") {
    const depois = mudanca.operacao === "add" ? dados.xp + mudanca.valor : mudanca.operacao === "remove" ? dados.xp - mudanca.valor : mudanca.valor;
    return (
      <p className="text-sm text-texto">
        XP: {dados.xp} → {depois}{" "}
        <input
          type="number"
          value={mudanca.valor}
          onChange={(e) => onEditar(Number(e.target.value) || 0)}
          className="ml-2 w-20 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />{" "}
        <span className="text-xs text-texto-suave">({mudanca.operacao}{mudanca.motivo ? ` — ${mudanca.motivo}` : ""})</span>
      </p>
    );
  }
  if (mudanca.tipo === "recurso") {
    const existente = dados.recursos[mudanca.nome];
    const antes = existente?.atual ?? 0;
    const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
    return (
      <p className="text-sm text-texto">
        {mudanca.nome}: {antes} → {depois}{" "}
        <input
          type="number"
          value={mudanca.valor}
          onChange={(e) => onEditar(Number(e.target.value) || 0)}
          className="ml-2 w-20 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />{" "}
        <span className="text-xs text-texto-suave">({mudanca.operacao}{mudanca.motivo ? ` — ${mudanca.motivo}` : ""})</span>
      </p>
    );
  }
  if (mudanca.tipo === "item_add") {
    return (
      <p className="text-sm text-texto">
        + Item: <strong>{mudanca.nome}</strong> ×{" "}
        <input
          type="number"
          min={1}
          value={mudanca.quantidade}
          onChange={(e) => onEditar(Number(e.target.value) || 1)}
          className="w-16 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />
        {mudanca.categoria && <span className="text-xs text-texto-suave"> · {mudanca.categoria}</span>}
        {mudanca.descricao && <span className="block text-xs text-texto-suave">{mudanca.descricao}</span>}
      </p>
    );
  }
  if (mudanca.tipo === "item_remove") {
    return (
      <p className="text-sm text-texto">
        − Item: <strong>{mudanca.nome}</strong> ×{" "}
        <input
          type="number"
          min={1}
          value={mudanca.quantidade}
          onChange={(e) => onEditar(Number(e.target.value) || 1)}
          className="w-16 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />
        {mudanca.motivo && <span className="text-xs text-texto-suave"> — {mudanca.motivo}</span>}
      </p>
    );
  }
  if (mudanca.tipo === "nota_add") {
    return (
      <div className="text-sm text-texto">
        <p>
          Nova colinha: <strong>{mudanca.titulo}</strong>
          {mudanca.categoria && <span className="text-xs text-texto-suave"> · {mudanca.categoria}</span>}
        </p>
        <p className="mt-1 text-xs text-texto-suave">{mudanca.texto}</p>
      </div>
    );
  }
  if (mudanca.tipo === "nivel") {
    const depois = mudanca.operacao === "set" ? mudanca.valor : dados.nivel + mudanca.valor;
    return (
      <p className="text-sm text-texto">
        Nível: {dados.nivel} → {depois}{" "}
        <input
          type="number"
          value={mudanca.valor}
          onChange={(e) => onEditar(Number(e.target.value) || 0)}
          className="ml-2 w-20 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />{" "}
        <span className="text-xs text-texto-suave">({mudanca.operacao}{mudanca.motivo ? ` — ${mudanca.motivo}` : ""})</span>
      </p>
    );
  }
  if (mudanca.tipo === "atributo") {
    const antes = dados.atributos[mudanca.nome] ?? 0;
    const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
    return (
      <p className="text-sm text-texto">
        {mudanca.nome}: {antes} → {depois}{" "}
        <input
          type="number"
          value={mudanca.valor}
          onChange={(e) => onEditar(Number(e.target.value) || 0)}
          className="ml-2 w-20 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />{" "}
        <span className="text-xs text-texto-suave">({mudanca.operacao}{mudanca.motivo ? ` — ${mudanca.motivo}` : ""})</span>
      </p>
    );
  }
  if (mudanca.tipo === "moeda") {
    const antes = dados.moedas[mudanca.nome] ?? 0;
    const depois = mudanca.operacao === "set" ? mudanca.valor : antes + mudanca.valor;
    return (
      <p className="text-sm text-texto">
        {mudanca.nome}: {antes} → {depois}{" "}
        <input
          type="number"
          value={mudanca.valor}
          onChange={(e) => onEditar(Number(e.target.value) || 0)}
          className="ml-2 w-20 rounded border border-borda bg-superficie px-2 py-0.5 text-xs"
        />{" "}
        <span className="text-xs text-texto-suave">({mudanca.operacao}{mudanca.motivo ? ` — ${mudanca.motivo}` : ""})</span>
      </p>
    );
  }
  if (mudanca.tipo === "item_update") {
    const existente = dados.inventario.find((item) => item.nome.trim().toLowerCase() === mudanca.nome.trim().toLowerCase());
    const rotulos: Record<string, string> = {
      descricao: "descrição",
      categoria: "categoria",
      raridade: "raridade",
      origem: "origem",
      notas: "notas",
      quantidade: "quantidade",
      equipado: "equipado",
    };
    return (
      <div className="text-sm text-texto">
        <p>
          Atualizar <strong>{mudanca.nome}</strong>
        </p>
        <ul className="mt-1 list-inside list-disc text-xs text-texto-suave">
          {Object.entries(mudanca.campos).map(([campo, valor]) => {
            const antes = existente ? (existente as unknown as Record<string, unknown>)[campo] : undefined;
            return (
              <li key={campo}>
                {rotulos[campo] ?? campo}: {String(antes ?? "—")} → {String(valor)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  // equipamento
  return (
    <p className="text-sm text-texto">
      {mudanca.acao === "equipar" ? "Equipar" : "Desequipar"} <strong>{mudanca.nome}</strong>
      {mudanca.acao === "equipar" && mudanca.slot && <span className="text-xs text-texto-suave"> · {mudanca.slot}</span>}
    </p>
  );
}
