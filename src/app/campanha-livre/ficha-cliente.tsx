"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { aplicarMudancas } from "@/lib/campanha-livre/aplicar.ts";
import { normalizarPersonagemLivre, type PersonagemLivre } from "@/lib/campanha-livre/tipos.ts";

import { ImportarDoChat } from "./importar-do-chat";

/*
  Ficha do sistema Campanha Livre — o único dos cinco sistemas do Hub que
  não é um arquivo HTML estático em /public. Precisa de estado de servidor
  mais rico (histórico de importações, revisão em várias etapas) do que faz
  sentido escrever em JS puro; React resolve isso sem esforço extra, e o
  contrato com o resto do Hub continua o mesmo: `?id=` na URL, ler/salvar
  via `/api/personagens/[id]`, mesma permissão de sempre (decisão #13).
*/

type Carregamento =
  | { status: "carregando" }
  | { status: "nao-encontrado" }
  | {
      status: "pronto";
      id: string;
      dados: PersonagemLivre;
      compartilhado: boolean;
      ehDono: boolean;
    };

export function FichaCampanhaLivre() {
  const parametros = useSearchParams();
  const id = parametros.get("id");
  const [estado, setEstado] = useState<Carregamento>({ status: "carregando" });
  const [falhouSalvar, setFalhouSalvar] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    fetch(`/api/personagens/${id}`)
      .then(async (resposta) => {
        if (cancelado) return;
        if (!resposta.ok) {
          setEstado({ status: "nao-encontrado" });
          return;
        }
        const { personagem } = await resposta.json();
        setEstado({
          status: "pronto",
          id: personagem.id,
          dados: normalizarPersonagemLivre(personagem.dados),
          compartilhado: !!personagem.compartilhado,
          ehDono: !!personagem.ehDono,
        });
      })
      .catch(() => {
        if (!cancelado) setEstado({ status: "nao-encontrado" });
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function salvar(novosDados: PersonagemLivre) {
    if (estado.status !== "pronto") return;
    setEstado({ ...estado, dados: novosDados });
    try {
      const resposta = await fetch(`/api/personagens/${estado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dados: novosDados }),
      });
      setFalhouSalvar(!resposta.ok);
    } catch {
      setFalhouSalvar(true);
    }
  }

  if (!id) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-titulo text-2xl">Campanha Livre</h1>
        <p className="mt-3 text-sm text-texto-suave">
          Esta página abre uma ficha específica. Crie ou escolha uma em{" "}
          <Link href="/fichas" className="text-ambar-forte underline underline-offset-2">
            /fichas
          </Link>
          .
        </p>
      </main>
    );
  }
  if (estado.status === "carregando") {
    return <main className="mx-auto max-w-2xl px-6 py-14 text-sm text-texto-suave">Carregando…</main>;
  }
  if (estado.status === "nao-encontrado") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-titulo text-2xl">Ficha não encontrada</h1>
        <p className="mt-3 text-sm text-texto-suave">
          Ela pode ter sido apagada, ou não é sua.{" "}
          <Link href="/fichas" className="text-ambar-forte underline underline-offset-2">
            Voltar para Fichas
          </Link>
        </p>
      </main>
    );
  }

  const somenteLeitura = !estado.ehDono;
  const { dados } = estado;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/fichas" className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto">
        ← Fichas
      </Link>

      {falhouSalvar && (
        <div className="mt-4 rounded border border-segredo/50 bg-segredo/10 p-3 text-sm text-segredo">
          Não consegui salvar no Hub. Confira sua internet — se cair, evite fechar a aba até salvar de novo.
        </div>
      )}
      {somenteLeitura && (
        <div className="mt-4 rounded border border-borda bg-superficie p-3 text-sm text-texto-suave">
          Modo leitura — você está vendo a ficha de <strong className="text-texto">{dados.perfil.nome}</strong>. Só quem é
          dono edita ou importa do chat.
        </div>
      )}

      <Cabecalho dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />

      {!somenteLeitura && (
        <ImportarDoChat
          dados={dados}
          onConfirmar={(mudancasSelecionadas, hash, updateId) => {
            const { dados: novosDados, resumos } = aplicarMudancas(dados, mudancasSelecionadas);
            novosDados.historicoImportacoes = [
              { hash, updateId, aplicadoEm: Date.now(), resumo: resumos },
              ...novosDados.historicoImportacoes,
            ].slice(0, 50);
            salvar(novosDados);
          }}
        />
      )}

      <Recursos dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Atributos dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Moedas dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Inventario dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Colinhas dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Historico dados={dados} />
    </main>
  );
}

/* ---------- Cabeçalho: nome, XP, Nível ---------- */
function Cabecalho({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nome, setNome] = useState(dados.perfil.nome);
  const debounceNome = useRef<ReturnType<typeof setTimeout> | null>(null);

  function aoDigitarNome(valor: string) {
    setNome(valor);
    if (debounceNome.current) clearTimeout(debounceNome.current);
    debounceNome.current = setTimeout(() => {
      onSalvar({ ...dados, perfil: { nome: valor } });
    }, 600);
  }

  return (
    <section className="mt-6 rounded-lg border border-borda bg-superficie p-6">
      <label className="block text-xs uppercase tracking-wide text-texto-suave">Nome</label>
      <input
        type="text"
        value={nome}
        onChange={(e) => aoDigitarNome(e.target.value)}
        disabled={somenteLeitura}
        className="mt-1 w-full rounded border border-borda bg-fundo px-3 py-2 font-titulo text-2xl text-texto focus:border-ambar/60 focus:outline-none disabled:opacity-60"
      />
      <div className="mt-4 flex gap-6">
        <div>
          <label className="block text-xs uppercase tracking-wide text-texto-suave">XP</label>
          <input
            type="number"
            value={dados.xp}
            disabled={somenteLeitura}
            onChange={(e) => onSalvar({ ...dados, xp: Number(e.target.value) || 0 })}
            className="mt-1 w-28 rounded border border-borda bg-fundo px-3 py-2 text-texto disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-texto-suave">Nível</label>
          <input
            type="number"
            value={dados.nivel}
            disabled={somenteLeitura}
            onChange={(e) => onSalvar({ ...dados, nivel: Number(e.target.value) || 1 })}
            className="mt-1 w-28 rounded border border-borda bg-fundo px-3 py-2 text-texto disabled:opacity-60"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Recursos: mana, hp, sanidade... o que a campanha usar ---------- */
function Recursos({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const nomes = Object.keys(dados.recursos);

  function adicionar() {
    const chave = nomeNovo.trim();
    if (!chave || dados.recursos[chave]) return;
    onSalvar({ ...dados, recursos: { ...dados.recursos, [chave]: { atual: 0, maximo: null } } });
    setNomeNovo("");
  }

  function remover(nome: string) {
    const resto = { ...dados.recursos };
    delete resto[nome];
    onSalvar({ ...dados, recursos: resto });
  }

  function atualizar(nome: string, campo: "atual" | "maximo", valor: number | null) {
    onSalvar({ ...dados, recursos: { ...dados.recursos, [nome]: { ...dados.recursos[nome], [campo]: valor } } });
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Recursos</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Mana, HP, sanidade, o que a sua campanha usar — cada um é criado sozinho na primeira vez que um{" "}
        <code>resources.NOME</code> aparece num HUB_UPDATE, ou você cria um aqui à mão.
      </p>
      {nomes.length === 0 && <p className="mt-3 text-sm text-texto-suave">Nenhum recurso ainda.</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {nomes.map((nome) => {
          const r = dados.recursos[nome];
          return (
            <div key={nome} className="rounded-lg border border-borda bg-superficie p-4">
              <div className="flex items-center justify-between">
                <span className="font-titulo capitalize text-texto">{nome}</span>
                {!somenteLeitura && (
                  <button
                    type="button"
                    onClick={() => remover(nome)}
                    className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                  >
                    Remover
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="number"
                  value={r.atual}
                  disabled={somenteLeitura}
                  onChange={(e) => atualizar(nome, "atual", Number(e.target.value) || 0)}
                  className="w-20 rounded border border-borda bg-fundo px-2 py-1 text-texto disabled:opacity-60"
                />
                <span className="text-texto-suave">/</span>
                <input
                  type="number"
                  value={r.maximo ?? ""}
                  placeholder="sem teto"
                  disabled={somenteLeitura}
                  onChange={(e) => atualizar(nome, "maximo", e.target.value === "" ? null : Number(e.target.value))}
                  className="w-24 rounded border border-borda bg-fundo px-2 py-1 text-texto placeholder:text-texto-suave disabled:opacity-60"
                />
              </div>
            </div>
          );
        })}
      </div>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="nome do recurso (ex: mana)"
            className="rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button
            type="button"
            onClick={adicionar}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + Recurso
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Atributos: livres, sem teto (FOR, INT, o que a campanha usar) ---------- */
function Atributos({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const nomes = Object.keys(dados.atributos);

  function adicionar() {
    const chave = nomeNovo.trim();
    if (!chave || dados.atributos[chave] !== undefined) return;
    onSalvar({ ...dados, atributos: { ...dados.atributos, [chave]: 0 } });
    setNomeNovo("");
  }

  function remover(nome: string) {
    const resto = { ...dados.atributos };
    delete resto[nome];
    onSalvar({ ...dados, atributos: resto });
  }

  function atualizar(nome: string, valor: number) {
    onSalvar({ ...dados, atributos: { ...dados.atributos, [nome]: valor } });
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Atributos</h2>
      <p className="mt-1 text-sm text-texto-suave">FOR, INT, o que a sua campanha usar — sem teto fixo.</p>
      {nomes.length === 0 && <p className="mt-3 text-sm text-texto-suave">Nenhum atributo ainda.</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {nomes.map((nome) => (
          <div key={nome} className="flex items-center gap-2 rounded-lg border border-borda bg-superficie px-3 py-2">
            <span className="font-titulo text-sm uppercase text-texto">{nome}</span>
            <input
              type="number"
              value={dados.atributos[nome]}
              disabled={somenteLeitura}
              onChange={(e) => atualizar(nome, Number(e.target.value) || 0)}
              className="w-16 rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto disabled:opacity-60"
            />
            {!somenteLeitura && (
              <button
                type="button"
                onClick={() => remover(nome)}
                className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="nome do atributo (ex: FOR)"
            className="rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button
            type="button"
            onClick={adicionar}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + Atributo
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Moedas: berries, ouro, o que a campanha usar — só um total, sem teto ---------- */
function Moedas({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const nomes = Object.keys(dados.moedas);

  function adicionar() {
    const chave = nomeNovo.trim();
    if (!chave || dados.moedas[chave] !== undefined) return;
    onSalvar({ ...dados, moedas: { ...dados.moedas, [chave]: 0 } });
    setNomeNovo("");
  }

  function remover(nome: string) {
    const resto = { ...dados.moedas };
    delete resto[nome];
    onSalvar({ ...dados, moedas: resto });
  }

  function atualizar(nome: string, valor: number) {
    onSalvar({ ...dados, moedas: { ...dados.moedas, [nome]: valor } });
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Moedas</h2>
      <p className="mt-1 text-sm text-texto-suave">Berries, ouro, o que a sua campanha usar.</p>
      {nomes.length === 0 && <p className="mt-3 text-sm text-texto-suave">Nenhuma moeda ainda.</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {nomes.map((nome) => (
          <div key={nome} className="flex items-center gap-2 rounded-lg border border-borda bg-superficie px-3 py-2">
            <span className="font-titulo text-sm capitalize text-texto">{nome}</span>
            <input
              type="number"
              value={dados.moedas[nome]}
              disabled={somenteLeitura}
              onChange={(e) => atualizar(nome, Number(e.target.value) || 0)}
              className="w-24 rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto disabled:opacity-60"
            />
            {!somenteLeitura && (
              <button
                type="button"
                onClick={() => remover(nome)}
                className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="nome da moeda (ex: berries)"
            className="rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button
            type="button"
            onClick={adicionar}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + Moeda
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Inventário ---------- */
function Inventario({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  function adicionar() {
    if (!nome.trim()) return;
    onSalvar({
      ...dados,
      inventario: [
        ...dados.inventario,
        { id: `item-${Date.now().toString(36)}`, nome: nome.trim(), quantidade: Math.max(1, quantidade) },
      ],
    });
    setNome("");
    setQuantidade(1);
  }

  function remover(id: string) {
    onSalvar({ ...dados, inventario: dados.inventario.filter((i) => i.id !== id) });
  }

  function alternarEquipado(id: string) {
    onSalvar({
      ...dados,
      inventario: dados.inventario.map((i) => (i.id === id ? { ...i, equipado: !i.equipado, slot: i.equipado ? undefined : i.slot } : i)),
    });
  }

  function mudarSlot(id: string, slot: string) {
    onSalvar({ ...dados, inventario: dados.inventario.map((i) => (i.id === id ? { ...i, slot: slot || undefined } : i)) });
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Inventário</h2>
      {dados.inventario.length === 0 && <p className="mt-2 text-sm text-texto-suave">Vazio por enquanto.</p>}
      <ul className="mt-3 space-y-2">
        {dados.inventario.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="text-texto">
                {item.nome} <span className="text-texto-suave">×{item.quantidade}</span>
                {item.equipado && <span className="ml-2 text-xs text-ambar-forte">equipado{item.slot ? ` · ${item.slot}` : ""}</span>}
              </p>
              {(item.categoria || item.descricao) && (
                <p className="mt-1 text-xs text-texto-suave">
                  {item.categoria && <span>{item.categoria}</span>}
                  {item.categoria && item.descricao && " — "}
                  {item.descricao}
                </p>
              )}
              {item.tags && item.tags.length > 0 && (
                <p className="mt-1 flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-full border border-borda px-2 py-0.5 text-[11px] text-texto-suave">
                      {t}
                    </span>
                  ))}
                </p>
              )}
              {!somenteLeitura && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 text-texto-suave">
                    <input type="checkbox" checked={!!item.equipado} onChange={() => alternarEquipado(item.id)} />
                    Equipado
                  </label>
                  {item.equipado && (
                    <input
                      type="text"
                      value={item.slot ?? ""}
                      onChange={(e) => mudarSlot(item.id, e.target.value)}
                      placeholder="onde (ex: mão)"
                      className="w-28 rounded border border-borda bg-fundo px-2 py-1 text-texto placeholder:text-texto-suave"
                    />
                  )}
                </div>
              )}
            </div>
            {!somenteLeitura && (
              <button
                type="button"
                onClick={() => remover(item.id)}
                className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
              >
                Remover
              </button>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="nome do item"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value) || 1)}
            className="w-20 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto"
          />
          <button
            type="button"
            onClick={adicionar}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + Item
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Colinhas ---------- */
function Colinhas({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [busca, setBusca] = useState("");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");

  const filtradas = dados.notas.filter((n) => {
    const alvo = busca.trim().toLowerCase();
    if (!alvo) return true;
    return (
      n.titulo.toLowerCase().includes(alvo) ||
      n.texto.toLowerCase().includes(alvo) ||
      (n.categoria ?? "").toLowerCase().includes(alvo)
    );
  });

  function adicionar() {
    if (!titulo.trim() || !texto.trim()) return;
    onSalvar({
      ...dados,
      notas: [
        ...dados.notas,
        { id: `nota-${Date.now().toString(36)}`, titulo: titulo.trim(), texto: texto.trim(), criadaEm: Date.now() },
      ],
    });
    setTitulo("");
    setTexto("");
  }

  function remover(id: string) {
    onSalvar({ ...dados, notas: dados.notas.filter((n) => n.id !== id) });
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Colinhas</h2>
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar colinha…"
        className="mt-2 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
      />
      {filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtradas.map((n) => (
          <li key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="font-titulo text-sm text-texto">
                {n.titulo} {n.categoria && <span className="text-xs font-normal text-texto-suave">· {n.categoria}</span>}
              </p>
              <p className="mt-1 text-sm text-texto-suave">{n.texto}</p>
            </div>
            {!somenteLeitura && (
              <button
                type="button"
                onClick={() => remover(n.id)}
                className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
              >
                Remover
              </button>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 space-y-2 rounded-lg border border-borda bg-superficie p-4">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="O que você quer anotar…"
            rows={3}
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button
            type="button"
            onClick={adicionar}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + Colinha
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- Histórico de importações ---------- */
function Historico({ dados }: { dados: PersonagemLivre }) {
  if (dados.historicoImportacoes.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Histórico de importações</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Um event log completo com desfazer por mudança é fatia futura — por enquanto, isto é só o registro de quando
        cada importação foi aplicada.
      </p>
      <ul className="mt-3 space-y-2">
        {dados.historicoImportacoes.map((h, i) => (
          <li key={`${h.hash}-${i}`} className="rounded-lg border border-borda bg-superficie p-4 text-sm">
            <p className="text-texto-suave">
              {new Date(h.aplicadoEm).toLocaleString("pt-BR")}
              {h.updateId && <span> · {h.updateId}</span>}
            </p>
            <ul className="mt-1 list-inside list-disc text-texto">
              {h.resumo.map((linha, j) => (
                <li key={j}>{linha}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
