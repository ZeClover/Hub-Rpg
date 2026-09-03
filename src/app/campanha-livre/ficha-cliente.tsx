"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  aplicarMudancas,
  criarSnapshot,
  desfazerEvento,
  desfazerImportacao,
  eventosConflitantes,
  restaurarSnapshot,
} from "@/lib/campanha-livre/aplicar.ts";
import {
  normalizarPersonagemLivre,
  type CodexLivre,
  type CondicaoLivre,
  type ConquistaLivre,
  type CriaturaLivre,
  type DescobertaLivre,
  type DuracaoEfeito,
  type EntradaDiario,
  type EntradaEscola,
  type EventoAplicado,
  type LocalLivre,
  type MagiaLivre,
  type MissaoLivre,
  type ModificadorTemporario,
  type NomeLista,
  type NpcLivre,
  type PersonagemLivre,
  type PesquisaLivre,
  type StatusDescoberta,
  type StatusMissao,
  type StatusObjetivo,
  type TipoDuracao,
} from "@/lib/campanha-livre/tipos.ts";

import { ImportarDoChat } from "./importar-do-chat";

/** Filtro de busca usado em cada aba — case-insensitive, ignora campos vazios. */
function corresponde(busca: string, ...campos: (string | undefined)[]): boolean {
  const alvo = busca.trim().toLowerCase();
  if (!alvo) return true;
  return campos.some((c) => c?.toLowerCase().includes(alvo));
}

function BarraBusca({
  valor,
  onMudar,
  placeholder,
}: {
  valor: string;
  onMudar: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onMudar(e.target.value)}
      placeholder={placeholder}
      className="mb-3 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
    />
  );
}

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
            const importId = `import-${Date.now().toString(36)}`;
            const { dados: novosDados, resumos } = aplicarMudancas(dados, mudancasSelecionadas, importId);
            novosDados.historicoImportacoes = [
              { id: importId, hash, updateId, aplicadoEm: Date.now(), resumo: resumos },
              ...novosDados.historicoImportacoes,
            ].slice(0, 50);
            salvar(novosDados);
          }}
        />
      )}

      <Recursos dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Atributos dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Moedas dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Condicoes dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Inventario dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <AbasMundo dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Snapshots dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
      <Historico dados={dados} somenteLeitura={somenteLeitura} onSalvar={salvar} />
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
    onSalvar({ ...dados, recursos: { ...dados.recursos, [chave]: { atual: 0, maximo: null, minimo: null } } });
    setNomeNovo("");
  }

  function remover(nome: string) {
    const resto = { ...dados.recursos };
    delete resto[nome];
    onSalvar({ ...dados, recursos: resto });
  }

  function atualizar(nome: string, campo: "atual" | "maximo" | "minimo", valor: number | null) {
    onSalvar({ ...dados, recursos: { ...dados.recursos, [nome]: { ...dados.recursos[nome], [campo]: valor } } });
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Recursos</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Mana, HP, sanidade, o que a sua campanha usar — cada um é criado sozinho na primeira vez que um{" "}
        <code>resources.NOME</code> aparece num HUB_UPDATE, ou você cria um aqui à mão. Mínimo e máximo em branco
        significam &ldquo;sem limite configurado&rdquo; — o Hub ainda avisa se ficar negativo, mas nunca corrige
        sozinho.
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
                  value={r.minimo ?? ""}
                  placeholder="sem piso"
                  disabled={somenteLeitura}
                  onChange={(e) => atualizar(nome, "minimo", e.target.value === "" ? null : Number(e.target.value))}
                  className="w-20 rounded border border-borda bg-fundo px-2 py-1 text-texto placeholder:text-texto-suave disabled:opacity-60"
                />
                <span className="text-texto-suave">≤</span>
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

const OPCOES_DURACAO: { valor: TipoDuracao; rotulo: string }[] = [
  { valor: "rounds", rotulo: "rodadas" },
  { valor: "turns", rotulo: "turnos" },
  { valor: "scenes", rotulo: "cenas" },
  { valor: "sessions", rotulo: "sessões" },
  { valor: "until_rest", rotulo: "até descansar" },
  { valor: "until_removed", rotulo: "até ser removido" },
  { valor: "custom", rotulo: "outro" },
];

function rotuloDuracao(duracao?: DuracaoEfeito): string | null {
  if (!duracao) return null;
  if (duracao.descricao) return duracao.descricao;
  const opcao = OPCOES_DURACAO.find((o) => o.valor === duracao.tipo);
  const rotulo = opcao?.rotulo ?? duracao.tipo;
  return duracao.valor !== undefined ? `${duracao.valor} ${rotulo}` : rotulo;
}

/** Formulário compartilhado pra escolher duração — usado ao criar condição/modificador manualmente. */
function SeletorDuracao({ onEscolher }: { onEscolher: (duracao: DuracaoEfeito) => void }) {
  const [tipo, setTipo] = useState<TipoDuracao>("scenes");
  const [valor, setValor] = useState(1);
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (tipo === "custom") onEscolher({ tipo, descricao: descricao.trim() || undefined });
    else if (tipo === "until_rest" || tipo === "until_removed") onEscolher({ tipo });
    else onEscolher({ tipo, valor });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, valor, descricao]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoDuracao)}
        className="rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto"
      >
        {OPCOES_DURACAO.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {tipo !== "until_rest" && tipo !== "until_removed" && tipo !== "custom" && (
        <input
          type="number"
          min={1}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value) || 1)}
          className="w-16 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto"
        />
      )}
      {tipo === "custom" && (
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="descreva a duração"
          className="rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
        />
      )}
    </div>
  );
}

/* ---------- Condições e modificadores temporários: sempre visível (relevante em qualquer sessão) ---------- */
function Condicoes({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeCondicao, setNomeCondicao] = useState("");
  const [duracaoCondicao, setDuracaoCondicao] = useState<DuracaoEfeito>({ tipo: "scenes", valor: 1 });
  const [nomeModificador, setNomeModificador] = useState("");
  const [alvoModificador, setAlvoModificador] = useState("");
  const [valorModificador, setValorModificador] = useState(0);
  const [duracaoModificador, setDuracaoModificador] = useState<DuracaoEfeito>({ tipo: "scenes", valor: 1 });

  function removerCondicao(id: string) {
    onSalvar({ ...dados, condicoes: dados.condicoes.filter((c) => c.id !== id) });
  }

  function adicionarCondicao() {
    if (!nomeCondicao.trim()) return;
    const nova: CondicaoLivre = {
      id: `condicao-${Date.now().toString(36)}`,
      nome: nomeCondicao.trim(),
      duracao: duracaoCondicao,
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, condicoes: [...dados.condicoes, nova] });
    setNomeCondicao("");
  }

  function removerModificador(id: string) {
    onSalvar({ ...dados, modificadoresTemporarios: dados.modificadoresTemporarios.filter((m) => m.id !== id) });
  }

  function adicionarModificador() {
    if (!nomeModificador.trim() || !alvoModificador.trim()) return;
    const novo: ModificadorTemporario = {
      id: `modificador-${Date.now().toString(36)}`,
      nome: nomeModificador.trim(),
      alvo: alvoModificador.trim(),
      valor: valorModificador,
      duracao: duracaoModificador,
      criadoEm: Date.now(),
    };
    onSalvar({ ...dados, modificadoresTemporarios: [...dados.modificadoresTemporarios, novo] });
    setNomeModificador("");
    setAlvoModificador("");
    setValorModificador(0);
  }

  if (dados.condicoes.length === 0 && dados.modificadoresTemporarios.length === 0 && somenteLeitura) return null;

  return (
    <section className="mt-8 rounded-lg border border-borda bg-superficie p-6">
      <h2 className="font-titulo text-xl">Condições e modificadores</h2>
      <p className="mt-1 text-sm text-texto-suave">O que está afetando o personagem agora — sempre visível, útil em sessão.</p>

      <div className="mt-4">
        <h3 className="text-sm font-titulo text-texto">Condições</h3>
        {dados.condicoes.length === 0 && <p className="mt-1 text-sm text-texto-suave">Nenhuma condição ativa.</p>}
        <ul className="mt-2 space-y-2">
          {dados.condicoes.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 rounded border border-borda bg-fundo p-3">
              <div>
                <p className="text-sm text-texto">
                  {c.nome}
                  {rotuloDuracao(c.duracao) && <span className="ml-2 text-xs text-texto-suave">· {rotuloDuracao(c.duracao)}</span>}
                </p>
                {c.descricao && <p className="mt-1 text-xs text-texto-suave">{c.descricao}</p>}
              </div>
              {!somenteLeitura && (
                <button type="button" onClick={() => removerCondicao(c.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
        {!somenteLeitura && (
          <div className="mt-2 space-y-2 rounded border border-borda bg-fundo p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={nomeCondicao}
                onChange={(e) => setNomeCondicao(e.target.value)}
                placeholder="nome da condição"
                className="flex-1 rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
              />
              <button type="button" onClick={adicionarCondicao} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1 text-xs text-ambar-forte hover:bg-ambar/20">
                + Condição
              </button>
            </div>
            <SeletorDuracao onEscolher={setDuracaoCondicao} />
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-titulo text-texto">Modificadores temporários</h3>
        {dados.modificadoresTemporarios.length === 0 && <p className="mt-1 text-sm text-texto-suave">Nenhum modificador ativo.</p>}
        <ul className="mt-2 space-y-2">
          {dados.modificadoresTemporarios.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 rounded border border-borda bg-fundo p-3">
              <p className="text-sm text-texto">
                {m.nome} — {m.alvo} {m.valor >= 0 ? "+" : ""}
                {m.valor}
                {rotuloDuracao(m.duracao) && <span className="ml-2 text-xs text-texto-suave">· {rotuloDuracao(m.duracao)}</span>}
              </p>
              {!somenteLeitura && (
                <button type="button" onClick={() => removerModificador(m.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
        {!somenteLeitura && (
          <div className="mt-2 space-y-2 rounded border border-borda bg-fundo p-3">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={nomeModificador}
                onChange={(e) => setNomeModificador(e.target.value)}
                placeholder="nome"
                className="rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
              />
              <input
                type="text"
                value={alvoModificador}
                onChange={(e) => setAlvoModificador(e.target.value)}
                placeholder="alvo (ex: força)"
                className="rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
              />
              <input
                type="number"
                value={valorModificador}
                onChange={(e) => setValorModificador(Number(e.target.value) || 0)}
                className="w-16 rounded border border-borda bg-superficie px-2 py-1 text-xs text-texto"
              />
              <button type="button" onClick={adicionarModificador} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1 text-xs text-ambar-forte hover:bg-ambar/20">
                + Modificador
              </button>
            </div>
            <SeletorDuracao onEscolher={setDuracaoModificador} />
          </div>
        )}
      </div>
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
                {item.imagemPendente && <span className="ml-2 text-xs text-ambar-forte">imagem pendente</span>}
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

/* ---------- Abas: Missões, NPCs, Descobertas, Locais, Bestiário, Codex, Diário, Colinhas ---------- */
const ABAS_MUNDO = [
  { id: "missoes", rotulo: "Missões" },
  { id: "npcs", rotulo: "NPCs" },
  { id: "descobertas", rotulo: "Descobertas" },
  { id: "locais", rotulo: "Locais" },
  { id: "bestiario", rotulo: "Bestiário" },
  { id: "codex", rotulo: "Codex" },
  { id: "diario", rotulo: "Diário" },
  { id: "colinhas", rotulo: "Colinhas" },
  { id: "magias", rotulo: "Magias" },
  { id: "pesquisas", rotulo: "Pesquisas" },
  { id: "conquistas", rotulo: "Conquistas" },
  { id: "reputacao", rotulo: "Reputação" },
  { id: "imagens", rotulo: "Imagens" },
  { id: "escola", rotulo: "Escola" },
] as const;

type AbaMundo = (typeof ABAS_MUNDO)[number]["id"];

function AbasMundo({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [aba, setAba] = useState<AbaMundo>("missoes");

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-1 border-b border-borda">
        {ABAS_MUNDO.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-titulo ${
              aba === a.id ? "border-ambar-forte text-ambar-forte" : "border-transparent text-texto-suave hover:text-texto"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {aba === "missoes" && <Missoes dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "npcs" && <Npcs dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "descobertas" && <Descobertas dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "locais" && <Locais dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "bestiario" && <Bestiario dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "codex" && <Codex dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "diario" && <Diario dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "colinhas" && <Colinhas dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "magias" && <Magias dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "pesquisas" && <Pesquisas dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "conquistas" && <Conquistas dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "reputacao" && <Reputacao dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "imagens" && <Imagens dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "escola" && <Escola dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
      </div>
    </section>
  );
}

const STATUS_MISSAO_OPCOES: { valor: StatusMissao; rotulo: string }[] = [
  { valor: "disponivel", rotulo: "Disponível" },
  { valor: "ativa", rotulo: "Ativa" },
  { valor: "concluida", rotulo: "Concluída" },
  { valor: "falhou", rotulo: "Falhou" },
  { valor: "abandonada", rotulo: "Abandonada" },
  { valor: "oculta", rotulo: "Oculta" },
];

const STATUS_OBJETIVO_OPCOES: { valor: StatusObjetivo; rotulo: string }[] = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "concluido", rotulo: "Concluído" },
  { valor: "falhou", rotulo: "Falhou" },
];

/* ---------- Missões ---------- */
function Missoes({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNova, setNomeNova] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.missoes.filter((m) => corresponde(busca, m.nome, m.descricao));

  function atualizarMissao(id: string, parcial: Partial<MissaoLivre>) {
    onSalvar({ ...dados, missoes: dados.missoes.map((m) => (m.id === id ? { ...m, ...parcial } : m)) });
  }

  function removerMissao(id: string) {
    onSalvar({ ...dados, missoes: dados.missoes.filter((m) => m.id !== id) });
  }

  function adicionarMissao() {
    if (!nomeNova.trim()) return;
    const nova: MissaoLivre = {
      id: `missao-${Date.now().toString(36)}`,
      nome: nomeNova.trim(),
      status: "ativa",
      objetivos: [],
      recompensas: [],
      anotacoes: [],
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, missoes: [...dados.missoes, nova] });
    setNomeNova("");
  }

  function atualizarObjetivo(missaoId: string, indice: number, status: StatusObjetivo) {
    const missao = dados.missoes.find((m) => m.id === missaoId);
    if (!missao) return;
    const objetivos = missao.objetivos.map((o, i) => (i === indice ? { ...o, status } : o));
    atualizarMissao(missaoId, { objetivos });
  }

  function removerObjetivo(missaoId: string, indice: number) {
    const missao = dados.missoes.find((m) => m.id === missaoId);
    if (!missao) return;
    atualizarMissao(missaoId, { objetivos: missao.objetivos.filter((_, i) => i !== indice) });
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar missão…" />
      {dados.missoes.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma missão ainda.</p>}
      {dados.missoes.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtradas.map((missao) => (
          <li key={missao.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">{missao.nome}</p>
              {!somenteLeitura && (
                <button
                  type="button"
                  onClick={() => removerMissao(missao.id)}
                  className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                >
                  Remover
                </button>
              )}
            </div>
            {missao.descricao && <p className="mt-1 text-sm text-texto-suave">{missao.descricao}</p>}
            <select
              value={missao.status}
              disabled={somenteLeitura}
              onChange={(e) => atualizarMissao(missao.id, { status: e.target.value as StatusMissao })}
              className="mt-2 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto disabled:opacity-60"
            >
              {STATUS_MISSAO_OPCOES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>

            {missao.objetivos.length > 0 && (
              <ul className="mt-3 space-y-1">
                {missao.objetivos.map((objetivo, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-texto">
                    <select
                      value={objetivo.status}
                      disabled={somenteLeitura}
                      onChange={(e) => atualizarObjetivo(missao.id, i, e.target.value as StatusObjetivo)}
                      className="rounded border border-borda bg-fundo px-1 py-0.5 text-xs text-texto disabled:opacity-60"
                    >
                      {STATUS_OBJETIVO_OPCOES.map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </option>
                      ))}
                    </select>
                    <span className={objetivo.status === "concluido" ? "line-through text-texto-suave" : ""}>{objetivo.texto}</span>
                    {!somenteLeitura && (
                      <button
                        type="button"
                        onClick={() => removerObjetivo(missao.id, i)}
                        className="text-xs text-texto-suave hover:text-segredo"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {!somenteLeitura && <ObjetivoNovo onAdicionar={(texto) => atualizarMissao(missao.id, { objetivos: [...missao.objetivos, { texto, status: "pendente" }] })} />}

            {missao.recompensas.length > 0 && (
              <p className="mt-2 text-xs text-texto-suave">Recompensas: {missao.recompensas.join(", ")}</p>
            )}
            {missao.anotacoes.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-xs text-texto-suave">
                {missao.anotacoes.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNova}
            onChange={(e) => setNomeNova(e.target.value)}
            placeholder="nome da missão"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button
            type="button"
            onClick={adicionarMissao}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + Missão
          </button>
        </div>
      )}
    </div>
  );
}

function ObjetivoNovo({ onAdicionar }: { onAdicionar: (texto: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="novo objetivo"
        className="flex-1 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
      />
      <button
        type="button"
        onClick={() => {
          if (!texto.trim()) return;
          onAdicionar(texto.trim());
          setTexto("");
        }}
        className="rounded border border-ambar/40 bg-ambar/10 px-2 py-1 text-xs text-ambar-forte hover:bg-ambar/20"
      >
        + Objetivo
      </button>
    </div>
  );
}

/* ---------- NPCs ---------- */
function Npcs({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const [busca, setBusca] = useState("");
  const filtrados = dados.npcs.filter((n) => corresponde(busca, n.nome, n.descricao));

  function atualizarNpc(id: string, parcial: Partial<NpcLivre>) {
    onSalvar({ ...dados, npcs: dados.npcs.map((n) => (n.id === id ? { ...n, ...parcial } : n)) });
  }

  function removerNpc(id: string) {
    onSalvar({ ...dados, npcs: dados.npcs.filter((n) => n.id !== id) });
  }

  function adicionarNpc() {
    if (!nomeNovo.trim()) return;
    const novo: NpcLivre = {
      id: `npc-${Date.now().toString(36)}`,
      nome: nomeNovo.trim(),
      conhecimento: [],
      relacoes: {},
      criadoEm: Date.now(),
    };
    onSalvar({ ...dados, npcs: [...dados.npcs, novo] });
    setNomeNovo("");
  }

  function atualizarRelacao(npcId: string, stat: string, valor: number) {
    const npc = dados.npcs.find((n) => n.id === npcId);
    if (!npc) return;
    atualizarNpc(npcId, { relacoes: { ...npc.relacoes, [stat]: valor } });
  }

  function removerRelacao(npcId: string, stat: string) {
    const npc = dados.npcs.find((n) => n.id === npcId);
    if (!npc) return;
    const resto = { ...npc.relacoes };
    delete resto[stat];
    atualizarNpc(npcId, { relacoes: resto });
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar NPC…" />
      {dados.npcs.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhum NPC ainda.</p>}
      {dados.npcs.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtrados.map((npc) => (
          <li key={npc.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">
                {npc.nome}
                {npc.primeiroEncontro && <span className="ml-2 text-xs font-normal text-texto-suave">· {npc.primeiroEncontro}</span>}
              </p>
              {!somenteLeitura && (
                <button
                  type="button"
                  onClick={() => removerNpc(npc.id)}
                  className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                >
                  Remover
                </button>
              )}
            </div>
            {npc.descricao && <p className="mt-1 text-sm text-texto-suave">{npc.descricao}</p>}
            {npc.tags && npc.tags.length > 0 && (
              <p className="mt-1 flex flex-wrap gap-1">
                {npc.tags.map((t) => (
                  <span key={t} className="rounded-full border border-borda px-2 py-0.5 text-[11px] text-texto-suave">
                    {t}
                  </span>
                ))}
              </p>
            )}

            {npc.conhecimento.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-texto-suave">
                {npc.conhecimento.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
            {!somenteLeitura && (
              <ConhecimentoNovo onAdicionar={(texto) => atualizarNpc(npc.id, { conhecimento: [...npc.conhecimento, texto] })} />
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(npc.relacoes).map(([stat, valor]) => (
                <div key={stat} className="flex items-center gap-1 rounded border border-borda bg-fundo px-2 py-1">
                  <span className="text-xs text-texto-suave">{stat}</span>
                  <input
                    type="number"
                    value={valor}
                    disabled={somenteLeitura}
                    onChange={(e) => atualizarRelacao(npc.id, stat, Number(e.target.value) || 0)}
                    className="w-14 rounded border border-borda bg-superficie px-1 py-0.5 text-xs text-texto disabled:opacity-60"
                  />
                  {!somenteLeitura && (
                    <button type="button" onClick={() => removerRelacao(npc.id, stat)} className="text-xs text-texto-suave hover:text-segredo">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!somenteLeitura && <RelacaoNova onAdicionar={(stat) => atualizarRelacao(npc.id, stat, 0)} />}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="nome do NPC"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button
            type="button"
            onClick={adicionarNpc}
            className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20"
          >
            + NPC
          </button>
        </div>
      )}
    </div>
  );
}

function ConhecimentoNovo({ onAdicionar }: { onAdicionar: (texto: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="o que o jogador descobriu sobre este NPC"
        className="flex-1 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
      />
      <button
        type="button"
        onClick={() => {
          if (!texto.trim()) return;
          onAdicionar(texto.trim());
          setTexto("");
        }}
        className="rounded border border-ambar/40 bg-ambar/10 px-2 py-1 text-xs text-ambar-forte hover:bg-ambar/20"
      >
        + Conhecimento
      </button>
    </div>
  );
}

function RelacaoNova({ onAdicionar }: { onAdicionar: (stat: string) => void }) {
  const [stat, setStat] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={stat}
        onChange={(e) => setStat(e.target.value)}
        placeholder="relação (ex: trust)"
        className="w-40 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto placeholder:text-texto-suave"
      />
      <button
        type="button"
        onClick={() => {
          if (!stat.trim()) return;
          onAdicionar(stat.trim());
          setStat("");
        }}
        className="rounded border border-ambar/40 bg-ambar/10 px-2 py-1 text-xs text-ambar-forte hover:bg-ambar/20"
      >
        + Relação
      </button>
    </div>
  );
}

const STATUS_DESCOBERTA_OPCOES: { valor: StatusDescoberta; rotulo: string }[] = [
  { valor: "desconhecido", rotulo: "Desconhecido" },
  { valor: "suspeita", rotulo: "Suspeita" },
  { valor: "teoria", rotulo: "Teoria" },
  { valor: "testando", rotulo: "Testando" },
  { valor: "parcial", rotulo: "Parcial" },
  { valor: "confirmada", rotulo: "Confirmada" },
  { valor: "refutada", rotulo: "Refutada" },
];

/* ---------- Descobertas ---------- */
function Descobertas({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [tituloNovo, setTituloNovo] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.descobertas.filter((d) => corresponde(busca, d.titulo, d.descricao, d.categoria));

  function atualizar(id: string, parcial: Partial<DescobertaLivre>) {
    onSalvar({ ...dados, descobertas: dados.descobertas.map((d) => (d.id === id ? { ...d, ...parcial } : d)) });
  }

  function remover(id: string) {
    onSalvar({ ...dados, descobertas: dados.descobertas.filter((d) => d.id !== id) });
  }

  function adicionar() {
    if (!tituloNovo.trim()) return;
    const nova: DescobertaLivre = {
      id: `descoberta-${Date.now().toString(36)}`,
      titulo: tituloNovo.trim(),
      status: "teoria",
      evidencias: [],
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, descobertas: [...dados.descobertas, nova] });
    setTituloNovo("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar descoberta…" />
      {dados.descobertas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma descoberta ainda.</p>}
      {dados.descobertas.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtradas.map((d) => (
          <li key={d.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">{d.titulo}</p>
              {!somenteLeitura && (
                <button type="button" onClick={() => remover(d.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </div>
            {d.descricao && <p className="mt-1 text-sm text-texto-suave">{d.descricao}</p>}
            <select
              value={d.status}
              disabled={somenteLeitura}
              onChange={(e) => atualizar(d.id, { status: e.target.value as StatusDescoberta })}
              className="mt-2 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto disabled:opacity-60"
            >
              {STATUS_DESCOBERTA_OPCOES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
            {d.evidencias.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-texto-suave">
                {d.evidencias.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={tituloNovo}
            onChange={(e) => setTituloNovo(e.target.value)}
            placeholder="título da descoberta"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Descoberta
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Locais ---------- */
function Locais({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const [busca, setBusca] = useState("");
  const filtrados = dados.locais.filter((l) => corresponde(busca, l.nome, l.descricao));

  function atualizar(id: string, parcial: Partial<LocalLivre>) {
    onSalvar({ ...dados, locais: dados.locais.map((l) => (l.id === id ? { ...l, ...parcial } : l)) });
  }

  function remover(id: string) {
    onSalvar({ ...dados, locais: dados.locais.filter((l) => l.id !== id) });
  }

  function adicionar() {
    if (!nomeNovo.trim()) return;
    const novo: LocalLivre = {
      id: `local-${Date.now().toString(36)}`,
      nome: nomeNovo.trim(),
      descoberto: true,
      conhecimento: [],
      criadoEm: Date.now(),
    };
    onSalvar({ ...dados, locais: [...dados.locais, novo] });
    setNomeNovo("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar local…" />
      {dados.locais.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhum local ainda.</p>}
      {dados.locais.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtrados.map((l) => (
          <li key={l.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">
                {l.nome}
                {!l.descoberto && <span className="ml-2 text-xs font-normal text-texto-suave">(não visitado)</span>}
              </p>
              {!somenteLeitura && (
                <button type="button" onClick={() => remover(l.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </div>
            {l.descricao && <p className="mt-1 text-sm text-texto-suave">{l.descricao}</p>}
            {!somenteLeitura && (
              <label className="mt-2 flex items-center gap-1 text-xs text-texto-suave">
                <input type="checkbox" checked={l.descoberto} onChange={(e) => atualizar(l.id, { descoberto: e.target.checked })} />
                Descoberto
              </label>
            )}
            {l.conhecimento.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-texto-suave">
                {l.conhecimento.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
            {!somenteLeitura && (
              <ConhecimentoNovo onAdicionar={(texto) => atualizar(l.id, { conhecimento: [...l.conhecimento, texto] })} />
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="nome do local"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Local
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Bestiário ---------- */
function Bestiario({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNovo, setNomeNovo] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.criaturas.filter((c) => corresponde(busca, c.nome, c.categoria, c.descricao));

  function remover(id: string) {
    onSalvar({ ...dados, criaturas: dados.criaturas.filter((c) => c.id !== id) });
  }

  function adicionar() {
    if (!nomeNovo.trim()) return;
    const nova: CriaturaLivre = {
      id: `criatura-${Date.now().toString(36)}`,
      nome: nomeNovo.trim(),
      tracosConhecidos: [],
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, criaturas: [...dados.criaturas, nova] });
    setNomeNovo("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar criatura…" />
      {dados.criaturas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma criatura catalogada ainda.</p>}
      {dados.criaturas.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtradas.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="text-texto">
                {c.nome}
                {c.categoria && <span className="ml-2 text-xs text-texto-suave">· {c.categoria}</span>}
              </p>
              {c.descricao && <p className="mt-1 text-xs text-texto-suave">{c.descricao}</p>}
              {c.tracosConhecidos.length > 0 && (
                <p className="mt-1 flex flex-wrap gap-1">
                  {c.tracosConhecidos.map((t) => (
                    <span key={t} className="rounded-full border border-borda px-2 py-0.5 text-[11px] text-texto-suave">
                      {t}
                    </span>
                  ))}
                </p>
              )}
            </div>
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(c.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            placeholder="nome da criatura"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Criatura
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Codex ---------- */
function Codex({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const filtrados = dados.codex.filter((c) => corresponde(busca, c.titulo, c.categoria, c.texto));

  function remover(id: string) {
    onSalvar({ ...dados, codex: dados.codex.filter((c) => c.id !== id) });
  }

  function adicionar() {
    if (!titulo.trim() || !texto.trim()) return;
    const nova: CodexLivre = { id: `codex-${Date.now().toString(36)}`, titulo: titulo.trim(), texto: texto.trim(), criadoEm: Date.now() };
    onSalvar({ ...dados, codex: [...dados.codex, nova] });
    setTitulo("");
    setTexto("");
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">Lore de referência — teorias, conceitos, o que a campanha for explicando.</p>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar no codex…" />
      {dados.codex.length === 0 && <p className="mt-2 text-sm text-texto-suave">Vazio por enquanto.</p>}
      {dados.codex.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtrados.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="font-titulo text-sm text-texto">
                {c.titulo} {c.categoria && <span className="text-xs font-normal text-texto-suave">· {c.categoria}</span>}
              </p>
              <p className="mt-1 text-sm text-texto-suave">{c.texto}</p>
            </div>
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(c.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            placeholder="Texto"
            rows={3}
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Codex
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Diário ---------- */
function Diario({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.diario.filter((e) => corresponde(busca, e.titulo, e.resumo));

  function remover(id: string) {
    onSalvar({ ...dados, diario: dados.diario.filter((e) => e.id !== id) });
  }

  function adicionar() {
    if (!titulo.trim()) return;
    const nova: EntradaDiario = { id: `diario-${Date.now().toString(36)}`, titulo: titulo.trim(), resumo: resumo.trim() || undefined, eventos: [], criadaEm: Date.now() };
    onSalvar({ ...dados, diario: [nova, ...dados.diario] });
    setTitulo("");
    setResumo("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar no diário…" />
      {dados.diario.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma entrada ainda.</p>}
      {dados.diario.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtradas.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="font-titulo text-sm text-texto">
                {e.titulo}
                <span className="ml-2 text-xs font-normal text-texto-suave">{new Date(e.criadaEm).toLocaleDateString("pt-BR")}</span>
              </p>
              {e.resumo && <p className="mt-1 text-sm text-texto-suave">{e.resumo}</p>}
              {e.eventos.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-texto-suave">
                  {e.eventos.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              )}
            </div>
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(e.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            placeholder="Título da entrada"
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            placeholder="O que aconteceu…"
            rows={3}
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Entrada
          </button>
        </div>
      )}
    </div>
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
    <div>
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar colinha…"
        className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
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
    </div>
  );
}

/* ---------- Magias ---------- */
function Magias({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNova, setNomeNova] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.magias.filter((m) => corresponde(busca, m.nome, m.afinidade, m.descricao));

  function remover(id: string) {
    onSalvar({ ...dados, magias: dados.magias.filter((m) => m.id !== id) });
  }

  function adicionar() {
    if (!nomeNova.trim()) return;
    const nova: MagiaLivre = {
      id: `magia-${Date.now().toString(36)}`,
      nome: nomeNova.trim(),
      descobertasSimples: [],
      descobertas: [],
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, magias: [...dados.magias, nova] });
    setNomeNova("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar magia…" />
      {dados.magias.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma magia conhecida ainda.</p>}
      {dados.magias.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtradas.map((m) => (
          <li key={m.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">
                {m.nome}
                {m.afinidade && <span className="ml-2 text-xs font-normal text-texto-suave">· {m.afinidade}</span>}
              </p>
              {!somenteLeitura && (
                <button type="button" onClick={() => remover(m.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </div>
            {m.descricao && <p className="mt-1 text-sm text-texto-suave">{m.descricao}</p>}
            {m.custo && (
              <p className="mt-1 text-xs text-texto-suave">
                Custo: {Object.entries(m.custo).map(([k, v]) => `${k} ${v}`).join(", ")}
              </p>
            )}
            {(m.statusConhecimento || m.progressoConhecimento !== undefined) && (
              <p className="mt-1 text-xs text-texto-suave">
                {m.statusConhecimento}
                {m.progressoConhecimento !== undefined && ` · progresso ${m.progressoConhecimento}`}
              </p>
            )}
            {m.descobertasSimples.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-texto-suave">
                {m.descobertasSimples.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            {m.descobertas.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-texto-suave">
                {m.descobertas.map((d) => (
                  <li key={d.id}>
                    <strong className="text-texto">{d.titulo}</strong> ({d.status}){d.descricao ? ` — ${d.descricao}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={nomeNova}
            onChange={(e) => setNomeNova(e.target.value)}
            placeholder="nome da magia"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Magia
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Pesquisas ---------- */
function Pesquisas({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [tituloNovo, setTituloNovo] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.pesquisas.filter((p) => corresponde(busca, p.titulo, p.status));

  function atualizar(id: string, parcial: Partial<PesquisaLivre>) {
    onSalvar({ ...dados, pesquisas: dados.pesquisas.map((p) => (p.id === id ? { ...p, ...parcial } : p)) });
  }

  function remover(id: string) {
    onSalvar({ ...dados, pesquisas: dados.pesquisas.filter((p) => p.id !== id) });
  }

  function adicionar() {
    if (!tituloNovo.trim()) return;
    const nova: PesquisaLivre = {
      id: `pesquisa-${Date.now().toString(36)}`,
      titulo: tituloNovo.trim(),
      status: "active",
      progresso: 0,
      objetivos: [],
      evidencias: [],
      notas: [],
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, pesquisas: [...dados.pesquisas, nova] });
    setTituloNovo("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar pesquisa…" />
      {dados.pesquisas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma pesquisa ainda.</p>}
      {dados.pesquisas.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtradas.map((p) => (
          <li key={p.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">{p.titulo}</p>
              {!somenteLeitura && (
                <button type="button" onClick={() => remover(p.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-texto-suave">
              <input
                type="text"
                value={p.status}
                disabled={somenteLeitura}
                onChange={(e) => atualizar(p.id, { status: e.target.value })}
                className="w-28 rounded border border-borda bg-fundo px-2 py-1 text-texto disabled:opacity-60"
              />
              <span>
                progresso{" "}
                <input
                  type="number"
                  value={p.progresso}
                  disabled={somenteLeitura}
                  onChange={(e) => atualizar(p.id, { progresso: Number(e.target.value) || 0 })}
                  className="w-16 rounded border border-borda bg-fundo px-2 py-1 text-texto disabled:opacity-60"
                />
              </span>
            </div>
            {p.objetivos.length > 0 && (
              <p className="mt-2 text-xs text-texto-suave">Objetivos: {p.objetivos.join(", ")}</p>
            )}
            {p.evidencias.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-xs text-texto-suave">
                {p.evidencias.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            {p.notas.length > 0 && (
              <p className="mt-1 text-xs text-texto-suave">Notas: {p.notas.join(" · ")}</p>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={tituloNovo}
            onChange={(e) => setTituloNovo(e.target.value)}
            placeholder="título da pesquisa"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Pesquisa
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Conquistas ---------- */
function Conquistas({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [nomeNova, setNomeNova] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.conquistas.filter((c) => corresponde(busca, c.nome, c.descricao));

  function remover(id: string) {
    onSalvar({ ...dados, conquistas: dados.conquistas.filter((c) => c.id !== id) });
  }

  function adicionar() {
    if (!nomeNova.trim()) return;
    const nova: ConquistaLivre = { id: `conquista-${Date.now().toString(36)}`, nome: nomeNova.trim(), criadaEm: Date.now() };
    onSalvar({ ...dados, conquistas: [...dados.conquistas, nova] });
    setNomeNova("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar conquista…" />
      {dados.conquistas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma conquista ainda.</p>}
      {dados.conquistas.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtradas.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="text-texto">{c.nome}</p>
              {c.descricao && <p className="mt-1 text-xs text-texto-suave">{c.descricao}</p>}
            </div>
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(c.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            value={nomeNova}
            onChange={(e) => setNomeNova(e.target.value)}
            placeholder="nome da conquista"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Conquista
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Reputação: alvo livre (facção, NPC, cidade...) → número, igual moedas ---------- */
function Reputacao({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [alvoNovo, setAlvoNovo] = useState("");
  const [busca, setBusca] = useState("");
  const alvos = Object.keys(dados.reputacao).filter((alvo) => corresponde(busca, alvo));

  function adicionar() {
    const chave = alvoNovo.trim();
    if (!chave || dados.reputacao[chave] !== undefined) return;
    onSalvar({ ...dados, reputacao: { ...dados.reputacao, [chave]: 0 } });
    setAlvoNovo("");
  }

  function remover(alvo: string) {
    const resto = { ...dados.reputacao };
    delete resto[alvo];
    onSalvar({ ...dados, reputacao: resto });
  }

  function atualizar(alvo: string, valor: number) {
    onSalvar({ ...dados, reputacao: { ...dados.reputacao, [alvo]: valor } });
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">Facção, grupo, cidade, NPC — qualquer entidade que a campanha usar.</p>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar reputação…" />
      {Object.keys(dados.reputacao).length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma reputação registrada ainda.</p>}
      {Object.keys(dados.reputacao).length > 0 && alvos.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {alvos.map((alvo) => (
          <div key={alvo} className="flex items-center gap-2 rounded-lg border border-borda bg-superficie px-3 py-2">
            <span className="font-titulo text-sm text-texto">{alvo}</span>
            <input
              type="number"
              value={dados.reputacao[alvo]}
              disabled={somenteLeitura}
              onChange={(e) => atualizar(alvo, Number(e.target.value) || 0)}
              className="w-20 rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto disabled:opacity-60"
            />
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(alvo)} className="text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            value={alvoNovo}
            onChange={(e) => setAlvoNovo(e.target.value)}
            placeholder="alvo (ex: Guilda dos Ferreiros)"
            className="rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Reputação
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Imagens: fila de pedidos — nunca gera sozinho, só marca pendência (regra #32/#45) ---------- */
function Imagens({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [busca, setBusca] = useState("");
  const filtrados = dados.filaImagens.filter((s) => corresponde(busca, s.nomeEntidade, s.tipoEntidade, s.promptSugerido));

  function alternarAtendida(id: string) {
    onSalvar({
      ...dados,
      filaImagens: dados.filaImagens.map((s) => (s.id === id ? { ...s, atendida: !s.atendida } : s)),
    });
  }

  function remover(id: string) {
    onSalvar({ ...dados, filaImagens: dados.filaImagens.filter((s) => s.id !== id) });
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">
        Pedidos de imagem — o Hub nunca gera sozinho, só guarda a fila para quando você (ou uma futura integração) for gerar.
      </p>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar pedido de imagem…" />
      {dados.filaImagens.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhum pedido pendente.</p>}
      {dados.filaImagens.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtrados.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className={`text-texto ${s.atendida ? "text-texto-suave line-through" : ""}`}>
                {s.nomeEntidade} <span className="text-xs text-texto-suave">({s.tipoEntidade})</span>
              </p>
              {s.promptSugerido && <p className="mt-1 text-xs text-texto-suave">{s.promptSugerido}</p>}
            </div>
            {!somenteLeitura && (
              <div className="flex shrink-0 gap-2 text-xs">
                <button type="button" onClick={() => alternarAtendida(s.id)} className="text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto">
                  {s.atendida ? "Marcar pendente" : "Marcar atendida"}
                </button>
                <button type="button" onClick={() => remover(s.id)} className="text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Escola: módulo genérico — aulas, matérias, conteúdos (regra: não hardcode Academia Mágica) ---------- */
function Escola({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [materia, setMateria] = useState("");
  const [topico, setTopico] = useState("");
  const [busca, setBusca] = useState("");
  const filtradas = dados.escola.filter((e) => corresponde(busca, e.materia, e.topico));

  function remover(id: string) {
    onSalvar({ ...dados, escola: dados.escola.filter((e) => e.id !== id) });
  }

  function adicionar() {
    if (!materia.trim()) return;
    const nova: EntradaEscola = {
      id: `escola-${Date.now().toString(36)}`,
      materia: materia.trim(),
      topico: topico.trim() || undefined,
      notas: [],
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, escola: [nova, ...dados.escola] });
    setMateria("");
    setTopico("");
  }

  return (
    <div>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar aula…" />
      {dados.escola.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma aula registrada ainda.</p>}
      {dados.escola.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtradas.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="font-titulo text-sm text-texto">
                {e.materia} {e.topico && <span className="text-xs font-normal text-texto-suave">· {e.topico}</span>}
                <span className="ml-2 text-xs font-normal text-texto-suave">{new Date(e.criadaEm).toLocaleDateString("pt-BR")}</span>
              </p>
              {e.notas.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-texto-suave">
                  {e.notas.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(e.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            placeholder="matéria"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <input
            type="text"
            value={topico}
            onChange={(e) => setTopico(e.target.value)}
            placeholder="tópico (opcional)"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Aula
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Snapshots: estado inteiro num momento — nunca restaura sem preview/confirmação (regra #45) ---------- */
function Snapshots({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (somenteLeitura && dados.snapshots.length === 0) return null;

  function criar() {
    if (!titulo.trim()) return;
    onSalvar(criarSnapshot(dados, titulo.trim(), "manual"));
    setTitulo("");
  }

  function remover(id: string) {
    onSalvar({ ...dados, snapshots: dados.snapshots.filter((s) => s.id !== id) });
  }

  function confirmarRestaurar(id: string) {
    onSalvar(restaurarSnapshot(dados, id));
    setPreviewId(null);
  }

  return (
    <section className="mt-8 rounded-lg border border-borda bg-superficie p-6">
      <h2 className="font-titulo text-xl">Snapshots</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Uma cópia da ficha inteira num momento — útil antes de uma importação grande. Restaurar sempre pede confirmação.
      </p>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="título do snapshot"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={criar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Snapshot
          </button>
        </div>
      )}
      {dados.snapshots.length === 0 && <p className="mt-3 text-sm text-texto-suave">Nenhum snapshot ainda.</p>}
      <ul className="mt-3 space-y-2">
        {dados.snapshots.map((s) => (
          <li key={s.id} className="rounded-lg border border-borda bg-fundo p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-texto">
                {s.titulo} <span className="text-xs text-texto-suave">· {new Date(s.criadoEm).toLocaleString("pt-BR")} · {s.origem}</span>
              </p>
              {!somenteLeitura && (
                <div className="flex shrink-0 gap-2 text-xs">
                  <button type="button" onClick={() => setPreviewId(previewId === s.id ? null : s.id)} className="text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto">
                    Restaurar
                  </button>
                  <button type="button" onClick={() => remover(s.id)} className="text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                    Remover
                  </button>
                </div>
              )}
            </div>
            {previewId === s.id && (
              <div className="mt-2 rounded border border-segredo/40 bg-segredo/5 p-3 text-xs text-texto">
                <p>
                  Isso vai substituir a ficha atual pelo estado salvo em{" "}
                  <strong>{new Date(s.criadoEm).toLocaleString("pt-BR")}</strong> — XP {s.estado.xp}, Nível {s.estado.nivel},{" "}
                  {s.estado.inventario.length} item(ns) no inventário. A ficha atual antes de restaurar também vira um snapshot
                  automático, pra não perder nada.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => confirmarRestaurar(s.id)}
                    className="rounded border border-segredo/50 bg-segredo/10 px-3 py-1.5 text-xs text-segredo hover:bg-segredo/20"
                  >
                    Confirmar restauração
                  </button>
                  <button type="button" onClick={() => setPreviewId(null)} className="rounded border border-borda px-3 py-1.5 text-xs text-texto-suave hover:text-texto">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Histórico de importações ---------- */
const NOME_LISTA_SINGULAR: Record<NomeLista, string> = {
  inventario: "item",
  notas: "colinha",
  missoes: "missão",
  npcs: "NPC",
  descobertas: "descoberta",
  codex: "codex",
  locais: "local",
  criaturas: "criatura",
  diario: "entrada de diário",
  modificadoresTemporarios: "modificador",
  condicoes: "condição",
  magias: "magia",
  pesquisas: "pesquisa",
  conquistas: "conquista",
  filaImagens: "pedido de imagem",
  escola: "aula",
};

/** Descreve o que "Desfazer" vai fazer a este evento específico — antes → depois na direção do desfazer, não da mudança original. */
function descreverDesfazer(dados: PersonagemLivre, evento: EventoAplicado): string {
  const alvo = evento.alvo;
  if (alvo.forma === "raiz") {
    const atual = dados[alvo.campo];
    return `${alvo.campo === "xp" ? "XP" : "Nível"} ${atual} → ${alvo.antes}`;
  }
  if (alvo.forma === "mapa") {
    const valorAtual = dados[alvo.mapa][alvo.chave];
    const atualTexto = valorAtual && typeof valorAtual === "object" ? valorAtual.atual : (valorAtual ?? 0);
    const antesTexto =
      alvo.antes === null ? "(removido)" : typeof alvo.antes === "object" ? alvo.antes.atual : alvo.antes;
    return `${alvo.chave} ${atualTexto} → ${antesTexto}`;
  }
  // lista
  const tipo = NOME_LISTA_SINGULAR[alvo.lista];
  if (alvo.antes === null) return `remover ${tipo} "${alvo.identificador}"`;
  return `reverter ${tipo} "${alvo.identificador}"`;
}

function Historico({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [previewImportId, setPreviewImportId] = useState<string | null>(null);

  if (dados.historicoImportacoes.length === 0) return null;

  function desfazer(eventoId: string) {
    onSalvar(desfazerEvento(dados, eventoId));
  }

  function confirmarDesfazerImportacao(importId: string) {
    onSalvar(desfazerImportacao(dados, importId));
    setPreviewImportId(null);
  }

  return (
    <section className="mt-8">
      <h2 className="font-titulo text-xl">Histórico de importações</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Cada linha pode ser desfeita individualmente, ou a importação inteira de uma vez — desfazer nunca some com o
        registro, só marca que foi revertido.
      </p>
      <ul className="mt-3 space-y-2">
        {dados.historicoImportacoes.map((h) => {
          const eventosDoImport = dados.eventos.filter((e) => e.importId === h.id);
          const pendentes = eventosDoImport.filter((e) => !e.revertido);
          const conflitantes = new Set(eventosConflitantes(dados, h.id).map((e) => e.id));
          return (
            <li key={h.id} className="rounded-lg border border-borda bg-superficie p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-texto-suave">
                  {new Date(h.aplicadoEm).toLocaleString("pt-BR")}
                  {h.updateId && <span> · {h.updateId}</span>}
                </p>
                {!somenteLeitura && pendentes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewImportId(previewImportId === h.id ? null : h.id)}
                    className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                  >
                    Desfazer importação inteira
                  </button>
                )}
              </div>

              {previewImportId === h.id && (
                <div className="mt-2 rounded border border-segredo/40 bg-segredo/5 p-3">
                  <p className="text-texto">
                    Serão revertidas {pendentes.length} alteraç{pendentes.length === 1 ? "ão" : "ões"}:
                  </p>
                  <ul className="mt-1 list-inside list-disc text-texto">
                    {pendentes.map((evento) => (
                      <li key={evento.id}>
                        {descreverDesfazer(dados, evento)}
                        {conflitantes.has(evento.id) && (
                          <span className="ml-1 text-xs text-ambar-forte">
                            (outra importação mexeu nisso depois — o resultado pode não ser o esperado)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => confirmarDesfazerImportacao(h.id)}
                      className="rounded border border-segredo/50 bg-segredo/10 px-3 py-1.5 text-xs text-segredo hover:bg-segredo/20"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewImportId(null)}
                      className="rounded border border-borda px-3 py-1.5 text-xs text-texto-suave hover:text-texto"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <ul className="mt-1 space-y-1 text-texto">
                {(eventosDoImport.length > 0 ? eventosDoImport : null)?.map((evento) => (
                  <li key={evento.id} className="flex items-center justify-between gap-2">
                    <span className={evento.revertido ? "text-texto-suave line-through" : ""}>{evento.resumo}</span>
                    {!somenteLeitura && !evento.revertido && (
                      <button
                        type="button"
                        onClick={() => desfazer(evento.id)}
                        className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                      >
                        Desfazer
                      </button>
                    )}
                    {evento.revertido && <span className="shrink-0 text-xs text-texto-suave">(desfeito)</span>}
                  </li>
                )) ??
                  h.resumo.map((linha, j) => (
                    <li key={j} className="list-inside list-disc">
                      {linha}
                    </li>
                  ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
