"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  aplicarMudancas,
  criarSnapshot,
  desfazerEvento,
  desfazerImportacao,
  eventosConflitantes,
  restaurarSnapshot,
} from "@/lib/campanha-livre/aplicar.ts";
import { blocoAtual, diaSemanaDoDia, DIAS_SEMANA, proximoBloco, ROTULOS_DIA_SEMANA } from "@/lib/campanha-livre/calendario.ts";
import {
  normalizarPersonagemLivre,
  type BlocoGrade,
  type CategoriaMural,
  type CodexLivre,
  type CompromissoLivre,
  type CondicaoLivre,
  type ConquistaLivre,
  type CriaturaLivre,
  type DescobertaLivre,
  type DiaSemana,
  type DuracaoEfeito,
  type EntradaDiario,
  type EntradaEscola,
  type EntradaMural,
  type EstadoDescobertaLocal,
  type EventoAplicado,
  type ExcecaoCalendario,
  type LocalLivre,
  type MagiaLivre,
  type MissaoLivre,
  type ModificadorTemporario,
  type NomeLista,
  type NpcLivre,
  type OportunidadeLivre,
  type PersonagemLivre,
  type PesquisaLivre,
  type RecursoLivre,
  type StatusCompromisso,
  type StatusDescoberta,
  type StatusMissao,
  type StatusObjetivo,
  type TipoDuracao,
  type TipoExcecaoCalendario,
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

      <Agora dados={dados} />

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

/*
  ---------- Agora: tela inicial da campanha ----------
  Critério de sucesso (pedido da Academia Mágica): abrir a ficha e em
  poucos segundos saber onde estou, que horas são, o que estou fazendo,
  qual a próxima obrigação, e o que mudou recentemente — sem entrar em
  nenhuma aba. Tudo aqui é 100% derivado de dados já existentes (regra
  #124: "se pode ser derivado com segurança, não persistir duplicado")
  — nada novo é inventado, só lido e mostrado num lugar só.
*/
function Agora({ dados }: { dados: PersonagemLivre }) {
  const semana = diaSemanaDoDia(dados, dados.diaAtual);
  const atual = blocoAtual(dados);
  const proximo = proximoBloco(dados);
  const missoesAtivas = dados.missoes.filter((m) => m.status === "ativa");
  const pesquisasRecentes = [...dados.pesquisas].sort((a, b) => b.criadaEm - a.criadaEm).slice(0, 4);
  const compromissosPendentes = dados.compromissos.filter((c) => c.status === "pendente");
  const oportunidadesAbertas = dados.oportunidades.filter((o) => !o.arquivada);
  const muralRecente = [...dados.mural].sort((a, b) => b.criadaEm - a.criadaEm).slice(0, 4);
  const eventosRecentes = dados.eventos
    .filter((e) => !e.revertido)
    .slice(-5)
    .reverse();
  const recursos = Object.entries(dados.recursos);

  return (
    <section className="mt-6 rounded-lg border border-ambar/30 bg-superficie p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-texto-suave">Agora</p>
          <p className="font-titulo text-2xl text-texto">
            Dia {dados.diaAtual} · {ROTULOS_DIA_SEMANA[semana]}
          </p>
        </div>
        <p className="font-titulo text-3xl text-ambar-forte">{dados.horaAtual}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-texto-suave">Onde estou</p>
          <p className="mt-1 text-sm text-texto">{dados.localAtual ?? "Não registrado"}</p>
        </div>
        <div>
          <p className="text-xs text-texto-suave">Fazendo agora</p>
          <p className="mt-1 text-sm text-texto">
            {atual ? `${atual.rotulo} (${atual.inicio}-${atual.fim})` : (dados.atividadeAtual ?? "Janela livre")}
          </p>
        </div>
        <div>
          <p className="text-xs text-texto-suave">Próxima obrigação</p>
          <p className="mt-1 text-sm text-texto">
            {proximo
              ? `${proximo.rotulo} — ${proximo.dia === dados.diaAtual ? "hoje" : `dia ${proximo.dia} (${ROTULOS_DIA_SEMANA[diaSemanaDoDia(dados, proximo.dia)]})`} ${proximo.inicio}`
              : "Nada agendado na grade"}
          </p>
        </div>
        {recursos.length > 0 && (
          <div>
            <p className="text-xs text-texto-suave">Recursos</p>
            <p className="mt-1 text-sm text-texto">
              {recursos.map(([nome, r]) => `${nome}: ${r.atual}${r.maximo !== null ? `/${r.maximo}` : ""}`).join(" · ")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CardResumoAgora titulo="Missões ativas" vazio="Nenhuma missão ativa.">
          {missoesAtivas.map((m) => (
            <li key={m.id}>{m.nome}</li>
          ))}
        </CardResumoAgora>
        <CardResumoAgora titulo="Pesquisas" vazio="Nenhuma pesquisa registrada.">
          {pesquisasRecentes.map((p) => (
            <li key={p.id}>
              {p.titulo} <span className="text-texto-suave">({p.status})</span>
            </li>
          ))}
        </CardResumoAgora>
        <CardResumoAgora titulo="Compromissos pendentes" vazio="Nada pendente.">
          {compromissosPendentes.map((c) => (
            <li key={c.id}>{c.descricao}</li>
          ))}
        </CardResumoAgora>
        <CardResumoAgora titulo="Oportunidades" vazio="Nenhuma registrada.">
          {oportunidadesAbertas.map((o) => (
            <li key={o.id}>{o.descricao}</li>
          ))}
        </CardResumoAgora>
        <CardResumoAgora titulo="Mural" vazio="Nada no mural ainda.">
          {muralRecente.map((m) => (
            <li key={m.id}>{m.titulo}</li>
          ))}
        </CardResumoAgora>
        <CardResumoAgora titulo="Desde a última vez" vazio="Nada mudou ainda.">
          {eventosRecentes.map((e) => (
            <li key={e.id}>{e.resumo}</li>
          ))}
        </CardResumoAgora>
      </div>
    </section>
  );
}

function CardResumoAgora({ titulo, vazio, children }: { titulo: string; vazio: string; children: ReactNode }) {
  const itens = Array.isArray(children) ? children : [children];
  const temItens = itens.filter(Boolean).length > 0;
  return (
    <div className="rounded-lg border border-borda bg-fundo p-3">
      <p className="font-titulo text-sm text-texto">{titulo}</p>
      {temItens ? <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-texto-suave">{children}</ul> : <p className="mt-1.5 text-xs text-texto-suave">{vazio}</p>}
    </div>
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
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [minimoNovo, setMinimoNovo] = useState("");
  const [atualNovo, setAtualNovo] = useState("");
  const [maximoNovo, setMaximoNovo] = useState("");
  const [erro, setErro] = useState("");
  const nomes = Object.keys(dados.recursos);

  function fecharFormulario() {
    setFormularioAberto(false);
    setNomeNovo("");
    setMinimoNovo("");
    setAtualNovo("");
    setMaximoNovo("");
    setErro("");
  }

  function adicionar() {
    const chave = nomeNovo.trim();
    if (!chave) {
      setErro("Dá um nome pro recurso.");
      return;
    }
    if (dados.recursos[chave]) {
      setErro(`Já existe um recurso chamado "${chave}".`);
      return;
    }
    onSalvar({
      ...dados,
      recursos: {
        ...dados.recursos,
        [chave]: {
          atual: atualNovo === "" ? 0 : Number(atualNovo) || 0,
          minimo: minimoNovo === "" ? null : Number(minimoNovo),
          maximo: maximoNovo === "" ? null : Number(maximoNovo),
        },
      },
    });
    fecharFormulario();
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

      {nomes.length === 0 && !formularioAberto && <p className="mt-3 text-sm text-texto-suave">Nenhum recurso registrado.</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {nomes.map((nome) => (
          <CardRecurso
            key={nome}
            nome={nome}
            recurso={dados.recursos[nome]}
            somenteLeitura={somenteLeitura}
            onAtualizar={(campo, valor) => atualizar(nome, campo, valor)}
            onRemover={() => remover(nome)}
          />
        ))}

        {!somenteLeitura && !formularioAberto && (
          <button
            type="button"
            onClick={() => setFormularioAberto(true)}
            className="flex min-h-[9.5rem] items-center justify-center rounded-lg border border-dashed border-borda p-4 text-sm text-texto-suave transition hover:border-ambar/50 hover:text-ambar-forte"
          >
            + Adicionar recurso
          </button>
        )}

        {!somenteLeitura && formularioAberto && (
          <div className="rounded-lg border border-borda bg-superficie p-4">
            <div className="space-y-3">
              <label className="block text-xs text-texto-suave">
                Nome
                <input
                  type="text"
                  autoFocus
                  value={nomeNovo}
                  onChange={(e) => {
                    setNomeNovo(e.target.value);
                    setErro("");
                  }}
                  placeholder="ex: mana"
                  className="mt-1 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="block text-xs text-texto-suave">
                  Mínimo
                  <input
                    type="number"
                    value={minimoNovo}
                    onChange={(e) => setMinimoNovo(e.target.value)}
                    placeholder="—"
                    className="mt-1 w-full min-w-0 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
                <label className="block text-xs text-texto-suave">
                  Atual
                  <input
                    type="number"
                    value={atualNovo}
                    onChange={(e) => setAtualNovo(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full min-w-0 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
                <label className="block text-xs text-texto-suave">
                  Máximo
                  <input
                    type="number"
                    value={maximoNovo}
                    onChange={(e) => setMaximoNovo(e.target.value)}
                    placeholder="—"
                    className="mt-1 w-full min-w-0 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
              </div>
              {erro && <p className="text-xs text-segredo">{erro}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={adicionar}
                  className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1.5 text-sm text-ambar-forte hover:bg-ambar/20"
                >
                  Adicionar recurso
                </button>
                <button type="button" onClick={fecharFormulario} className="rounded border border-borda px-3 py-1.5 text-sm text-texto-suave hover:text-texto">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Card de um recurso — Atual/Mínimo/Máximo com labels explícitos (regra: nada de "≤"/"/" soltos) e resumo com barra discreta quando há teto. */
function CardRecurso({
  nome,
  recurso,
  somenteLeitura,
  onAtualizar,
  onRemover,
}: {
  nome: string;
  recurso: RecursoLivre;
  somenteLeitura: boolean;
  onAtualizar: (campo: "atual" | "maximo" | "minimo", valor: number | null) => void;
  onRemover: () => void;
}) {
  const [confirmandoRemover, setConfirmandoRemover] = useState(false);
  const temMaximo = recurso.maximo !== null;
  const fracao = temMaximo && recurso.maximo! > 0 ? Math.max(0, Math.min(1, recurso.atual / recurso.maximo!)) : null;

  return (
    <div className="rounded-lg border border-borda bg-superficie p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 break-words font-titulo capitalize text-texto">{nome}</h3>
        {!somenteLeitura &&
          (confirmandoRemover ? (
            <div className="flex shrink-0 items-center gap-1.5 text-xs">
              <span className="text-texto-suave">Remover?</span>
              <button type="button" onClick={onRemover} className="font-medium text-segredo hover:underline">
                Sim
              </button>
              <button type="button" onClick={() => setConfirmandoRemover(false)} className="text-texto-suave hover:text-texto">
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmandoRemover(true)}
              aria-label={`Remover recurso ${nome}`}
              title="Remover recurso"
              className="shrink-0 rounded p-1 text-texto-suave transition hover:bg-segredo/10 hover:text-segredo"
            >
              ✕
            </button>
          ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <label className="block text-xs text-texto-suave">
          Mínimo
          <input
            type="number"
            value={recurso.minimo ?? ""}
            placeholder="—"
            disabled={somenteLeitura}
            onChange={(e) => onAtualizar("minimo", e.target.value === "" ? null : Number(e.target.value))}
            className="mt-1 w-full min-w-0 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave disabled:opacity-60"
          />
        </label>
        <label className="block text-xs text-texto-suave">
          Atual
          <input
            type="number"
            value={recurso.atual}
            disabled={somenteLeitura}
            onChange={(e) => onAtualizar("atual", Number(e.target.value) || 0)}
            className="mt-1 w-full min-w-0 rounded border border-borda bg-fundo px-2 py-1.5 text-sm font-medium text-texto disabled:opacity-60"
          />
        </label>
        <label className="block text-xs text-texto-suave">
          Máximo
          <input
            type="number"
            value={recurso.maximo ?? ""}
            placeholder="—"
            disabled={somenteLeitura}
            onChange={(e) => onAtualizar("maximo", e.target.value === "" ? null : Number(e.target.value))}
            className="mt-1 w-full min-w-0 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave disabled:opacity-60"
          />
        </label>
      </div>

      <div className="mt-3">
        <p className="text-sm text-texto-suave">{temMaximo ? `${recurso.atual} / ${recurso.maximo}` : `${recurso.atual}`}</p>
        {fracao !== null && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-fundo">
            <div className="h-full bg-ambar-forte transition-all" style={{ width: `${fracao * 100}%` }} />
          </div>
        )}
      </div>
    </div>
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
  { id: "compromissos", rotulo: "Compromissos" },
  { id: "mural", rotulo: "Mural" },
  { id: "calendario", rotulo: "Calendário" },
  { id: "oportunidades", rotulo: "Oportunidades" },
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
        {aba === "compromissos" && <Compromissos dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "mural" && <Mural dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "calendario" && <Calendario dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
        {aba === "oportunidades" && <Oportunidades dados={dados} somenteLeitura={somenteLeitura} onSalvar={onSalvar} />}
      </div>
    </section>
  );
}

const STATUS_COMPROMISSO_OPCOES: { valor: StatusCompromisso; rotulo: string }[] = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "cumprido", rotulo: "Cumprido" },
  { valor: "cancelado", rotulo: "Cancelado" },
  { valor: "atrasado", rotulo: "Atrasado" },
];

const CATEGORIA_MURAL_OPCOES: { valor: CategoriaMural; rotulo: string }[] = [
  { valor: "anuncio", rotulo: "Anúncio" },
  { valor: "evento", rotulo: "Evento" },
  { valor: "resultado", rotulo: "Resultado" },
  { valor: "comunicado", rotulo: "Comunicado" },
  { valor: "outro", rotulo: "Outro" },
];

/* ---------- Compromissos ("coisas para lembrar") ---------- */
function Compromissos({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [descricaoNova, setDescricaoNova] = useState("");
  const [busca, setBusca] = useState("");
  const filtrados = dados.compromissos.filter((c) => corresponde(busca, c.descricao, c.npc));

  function atualizarStatus(id: string, status: StatusCompromisso) {
    onSalvar({ ...dados, compromissos: dados.compromissos.map((c) => (c.id === id ? { ...c, status } : c)) });
  }

  function remover(id: string) {
    onSalvar({ ...dados, compromissos: dados.compromissos.filter((c) => c.id !== id) });
  }

  function adicionar() {
    if (!descricaoNova.trim()) return;
    const novo: CompromissoLivre = {
      id: `compromisso-${Date.now().toString(36)}`,
      descricao: descricaoNova.trim(),
      status: "pendente",
      criadoEm: Date.now(),
    };
    onSalvar({ ...dados, compromissos: [...dados.compromissos, novo] });
    setDescricaoNova("");
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">
        Promessas e combinados — não é menu de ações, é só memória do que Zé já se comprometeu a fazer. Nunca fecha sozinho: só muda quando alguém marca.
      </p>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar compromisso…" />
      {dados.compromissos.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhum compromisso ainda.</p>}
      {dados.compromissos.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtrados.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className={`text-sm text-texto ${c.status === "cumprido" || c.status === "cancelado" ? "line-through text-texto-suave" : ""}`}>{c.descricao}</p>
              <p className="mt-1 text-xs text-texto-suave">
                {c.npc && <>NPC: {c.npc} </>}
                {c.data && <>· {c.data}</>}
              </p>
              <select
                value={c.status}
                disabled={somenteLeitura}
                onChange={(e) => atualizarStatus(c.id, e.target.value as StatusCompromisso)}
                className="mt-2 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto disabled:opacity-60"
              >
                {STATUS_COMPROMISSO_OPCOES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
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
            value={descricaoNova}
            onChange={(e) => setDescricaoNova(e.target.value)}
            placeholder="Descrição (ex: prometeu revanche pra Juno)"
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Compromisso
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Mural (informação pública da campanha) ---------- */
function Mural({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [tituloNovo, setTituloNovo] = useState("");
  const [resumoNovo, setResumoNovo] = useState("");
  const [categoriaNova, setCategoriaNova] = useState<CategoriaMural>("anuncio");
  const [busca, setBusca] = useState("");
  const filtrados = dados.mural.filter((m) => corresponde(busca, m.titulo, m.resumo));

  function remover(id: string) {
    onSalvar({ ...dados, mural: dados.mural.filter((m) => m.id !== id) });
  }

  function adicionar() {
    if (!tituloNovo.trim()) return;
    const nova: EntradaMural = {
      id: `mural-${Date.now().toString(36)}`,
      titulo: tituloNovo.trim(),
      categoria: categoriaNova,
      resumo: resumoNovo.trim() || undefined,
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, mural: [nova, ...dados.mural] });
    setTituloNovo("");
    setResumoNovo("");
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">Informação pública da Academia — só o que Zé pode legitimamente saber, nunca plano de mestre.</p>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar no mural…" />
      {dados.mural.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada no mural ainda.</p>}
      {dados.mural.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtrados.map((m) => (
          <li key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className="font-titulo text-sm text-texto">
                {m.titulo} {m.categoria && <span className="text-xs font-normal text-texto-suave">· {CATEGORIA_MURAL_OPCOES.find((o) => o.valor === m.categoria)?.rotulo}</span>}
              </p>
              {m.resumo && <p className="mt-1 text-sm text-texto-suave">{m.resumo}</p>}
              {m.data && <p className="mt-1 text-xs text-texto-suave">{m.data}</p>}
            </div>
            {!somenteLeitura && (
              <button type="button" onClick={() => remover(m.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
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
            value={tituloNovo}
            onChange={(e) => setTituloNovo(e.target.value)}
            placeholder="Título"
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <textarea
            value={resumoNovo}
            onChange={(e) => setResumoNovo(e.target.value)}
            placeholder="Resumo"
            rows={2}
            className="w-full rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <select
            value={categoriaNova}
            onChange={(e) => setCategoriaNova(e.target.value as CategoriaMural)}
            className="rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto"
          >
            {CATEGORIA_MURAL_OPCOES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Mural
          </button>
        </div>
      )}
    </div>
  );
}

const DIAS_SEMANA_OPCOES: { valor: DiaSemana; rotulo: string }[] = DIAS_SEMANA.map((d) => ({ valor: d, rotulo: ROTULOS_DIA_SEMANA[d] }));

const TIPO_EXCECAO_OPCOES: { valor: TipoExcecaoCalendario; rotulo: string }[] = [
  { valor: "cancelado", rotulo: "Cancelado" },
  { valor: "alterado", rotulo: "Alterado" },
  { valor: "adicionado", rotulo: "Adicionado" },
];

/* ---------- Calendário: grade semanal + exceções + "agora" da campanha ---------- */
function Calendario({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [diaSemanaNova, setDiaSemanaNova] = useState<DiaSemana>("segunda");
  const [inicioNovo, setInicioNovo] = useState("");
  const [fimNovo, setFimNovo] = useState("");
  const [rotuloNovo, setRotuloNovo] = useState("");
  const [localNovo, setLocalNovo] = useState("");

  const [diaExcecaoNovo, setDiaExcecaoNovo] = useState("");
  const [tipoExcecaoNovo, setTipoExcecaoNovo] = useState<TipoExcecaoCalendario>("cancelado");
  const [rotuloAlvoNovo, setRotuloAlvoNovo] = useState("");
  const [novoInicioExcecao, setNovoInicioExcecao] = useState("");
  const [novoFimExcecao, setNovoFimExcecao] = useState("");
  const [novoRotuloExcecao, setNovoRotuloExcecao] = useState("");
  const [motivoExcecaoNovo, setMotivoExcecaoNovo] = useState("");

  const atual = blocoAtual(dados);
  const proximo = proximoBloco(dados);
  const semanaAtual = diaSemanaDoDia(dados, dados.diaAtual);

  function removerBloco(id: string) {
    onSalvar({ ...dados, gradeHoraria: dados.gradeHoraria.filter((b) => b.id !== id) });
  }

  function adicionarBloco() {
    if (!inicioNovo.trim() || !fimNovo.trim() || !rotuloNovo.trim()) return;
    const novo: BlocoGrade = {
      id: `bloco-${Date.now().toString(36)}`,
      diaSemana: diaSemanaNova,
      inicio: inicioNovo.trim(),
      fim: fimNovo.trim(),
      rotulo: rotuloNovo.trim(),
      local: localNovo.trim() || undefined,
      criadoEm: Date.now(),
    };
    onSalvar({ ...dados, gradeHoraria: [...dados.gradeHoraria, novo] });
    setInicioNovo("");
    setFimNovo("");
    setRotuloNovo("");
    setLocalNovo("");
  }

  function removerExcecao(id: string) {
    onSalvar({ ...dados, excecoesCalendario: dados.excecoesCalendario.filter((e) => e.id !== id) });
  }

  function adicionarExcecao() {
    const dia = Number(diaExcecaoNovo);
    if (!diaExcecaoNovo.trim() || Number.isNaN(dia)) return;
    if ((tipoExcecaoNovo === "cancelado" || tipoExcecaoNovo === "alterado") && !rotuloAlvoNovo.trim()) return;
    if (tipoExcecaoNovo === "adicionado" && (!novoInicioExcecao.trim() || !novoFimExcecao.trim() || !novoRotuloExcecao.trim())) return;
    const nova: ExcecaoCalendario = {
      id: `excecao-${Date.now().toString(36)}`,
      dia,
      tipo: tipoExcecaoNovo,
      rotuloAlvo: rotuloAlvoNovo.trim() || undefined,
      novoInicio: novoInicioExcecao.trim() || undefined,
      novoFim: novoFimExcecao.trim() || undefined,
      novoRotulo: novoRotuloExcecao.trim() || undefined,
      motivo: motivoExcecaoNovo.trim() || undefined,
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, excecoesCalendario: [...dados.excecoesCalendario, nova] });
    setDiaExcecaoNovo("");
    setRotuloAlvoNovo("");
    setNovoInicioExcecao("");
    setNovoFimExcecao("");
    setNovoRotuloExcecao("");
    setMotivoExcecaoNovo("");
  }

  const gradeOrdenada = [...dados.gradeHoraria].sort(
    (a, b) => DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana) || a.inicio.localeCompare(b.inicio),
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-borda bg-superficie p-4">
        <p className="text-xs uppercase tracking-wide text-texto-suave">Agora</p>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <label className="text-xs text-texto-suave">
            Dia
            <input
              type="number"
              value={dados.diaAtual}
              disabled={somenteLeitura}
              onChange={(e) => onSalvar({ ...dados, diaAtual: Number(e.target.value) || 1 })}
              className="mt-1 block w-20 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto disabled:opacity-60"
            />
          </label>
          <label className="text-xs text-texto-suave">
            Hora
            <input
              type="text"
              value={dados.horaAtual}
              disabled={somenteLeitura}
              placeholder="HH:MM"
              onChange={(e) => onSalvar({ ...dados, horaAtual: e.target.value })}
              className="mt-1 block w-24 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave disabled:opacity-60"
            />
          </label>
          <p className="text-sm text-texto">{ROTULOS_DIA_SEMANA[semanaAtual]}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-texto-suave">Bloco atual</p>
            <p className="mt-1 text-sm text-texto">{atual ? `${atual.rotulo} (${atual.inicio}-${atual.fim})` : "Nenhum — janela livre"}</p>
          </div>
          <div>
            <p className="text-xs text-texto-suave">Próxima obrigação</p>
            <p className="mt-1 text-sm text-texto">
              {proximo
                ? `${proximo.rotulo} — ${
                    proximo.dia === dados.diaAtual ? "hoje" : `dia ${proximo.dia} (${ROTULOS_DIA_SEMANA[diaSemanaDoDia(dados, proximo.dia)]})`
                  } ${proximo.inicio}`
                : "Nada agendado na grade"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="font-titulo text-sm text-texto">Grade semanal</p>
        <p className="text-xs text-texto-suave">Toda semana se repete assim — pra exceção de um dia só, use &ldquo;Exceções&rdquo; embaixo.</p>
        {gradeOrdenada.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhum bloco cadastrado ainda.</p>}
        <ul className="mt-2 space-y-1.5">
          {gradeOrdenada.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded border border-borda bg-superficie px-3 py-2 text-sm">
              <span className="text-texto">
                <span className="text-texto-suave">{ROTULOS_DIA_SEMANA[b.diaSemana]}</span> {b.inicio}-{b.fim} — {b.rotulo}
                {b.local && <span className="text-xs text-texto-suave"> · {b.local}</span>}
              </span>
              {!somenteLeitura && (
                <button
                  type="button"
                  onClick={() => removerBloco(b.id)}
                  className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
        {!somenteLeitura && (
          <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-borda bg-superficie p-3">
            <label className="text-xs text-texto-suave">
              Dia
              <select
                value={diaSemanaNova}
                onChange={(e) => setDiaSemanaNova(e.target.value as DiaSemana)}
                className="mt-1 block rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto"
              >
                {DIAS_SEMANA_OPCOES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-texto-suave">
              Início
              <input
                type="text"
                value={inicioNovo}
                onChange={(e) => setInicioNovo(e.target.value)}
                placeholder="08:00"
                className="mt-1 block w-20 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
              />
            </label>
            <label className="text-xs text-texto-suave">
              Fim
              <input
                type="text"
                value={fimNovo}
                onChange={(e) => setFimNovo(e.target.value)}
                placeholder="09:45"
                className="mt-1 block w-20 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
              />
            </label>
            <label className="text-xs text-texto-suave">
              Rótulo
              <input
                type="text"
                value={rotuloNovo}
                onChange={(e) => setRotuloNovo(e.target.value)}
                placeholder="Mana"
                className="mt-1 block rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
              />
            </label>
            <label className="text-xs text-texto-suave">
              Local (opcional)
              <input
                type="text"
                value={localNovo}
                onChange={(e) => setLocalNovo(e.target.value)}
                placeholder="Sala 3"
                className="mt-1 block rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
              />
            </label>
            <button type="button" onClick={adicionarBloco} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1.5 text-sm text-ambar-forte hover:bg-ambar/20">
              + Bloco
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="font-titulo text-sm text-texto">Exceções</p>
        <p className="text-xs text-texto-suave">Cancelamento, mudança de horário ou evento extra num dia específico — não mexe na grade semanal.</p>
        {dados.excecoesCalendario.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma exceção ainda.</p>}
        <ul className="mt-2 space-y-1.5">
          {dados.excecoesCalendario.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 rounded border border-borda bg-superficie px-3 py-2 text-sm">
              <span className="text-texto">
                Dia {e.dia}: {e.rotuloAlvo ?? e.novoRotulo} — {TIPO_EXCECAO_OPCOES.find((o) => o.valor === e.tipo)?.rotulo}
                {e.motivo && <span className="text-xs text-texto-suave"> ({e.motivo})</span>}
              </span>
              {!somenteLeitura && (
                <button
                  type="button"
                  onClick={() => removerExcecao(e.id)}
                  className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
        {!somenteLeitura && (
          <div className="mt-2 space-y-2 rounded-lg border border-borda bg-superficie p-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs text-texto-suave">
                Dia
                <input
                  type="number"
                  value={diaExcecaoNovo}
                  onChange={(e) => setDiaExcecaoNovo(e.target.value)}
                  placeholder="3"
                  className="mt-1 block w-16 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                />
              </label>
              <label className="text-xs text-texto-suave">
                Tipo
                <select
                  value={tipoExcecaoNovo}
                  onChange={(e) => setTipoExcecaoNovo(e.target.value as TipoExcecaoCalendario)}
                  className="mt-1 block rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto"
                >
                  {TIPO_EXCECAO_OPCOES.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              {(tipoExcecaoNovo === "cancelado" || tipoExcecaoNovo === "alterado") && (
                <label className="text-xs text-texto-suave">
                  Bloco alvo (rótulo)
                  <input
                    type="text"
                    value={rotuloAlvoNovo}
                    onChange={(e) => setRotuloAlvoNovo(e.target.value)}
                    placeholder="História"
                    className="mt-1 block rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
              )}
            </div>
            {(tipoExcecaoNovo === "alterado" || tipoExcecaoNovo === "adicionado") && (
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-xs text-texto-suave">
                  Novo início
                  <input
                    type="text"
                    value={novoInicioExcecao}
                    onChange={(e) => setNovoInicioExcecao(e.target.value)}
                    placeholder="16:00"
                    className="mt-1 block w-20 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
                <label className="text-xs text-texto-suave">
                  Novo fim
                  <input
                    type="text"
                    value={novoFimExcecao}
                    onChange={(e) => setNovoFimExcecao(e.target.value)}
                    placeholder="17:00"
                    className="mt-1 block w-20 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
                <label className="text-xs text-texto-suave">
                  {tipoExcecaoNovo === "adicionado" ? "Rótulo" : "Novo rótulo (opcional)"}
                  <input
                    type="text"
                    value={novoRotuloExcecao}
                    onChange={(e) => setNovoRotuloExcecao(e.target.value)}
                    placeholder="Clube de Duelos"
                    className="mt-1 block rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="text-xs text-texto-suave">
                Motivo (opcional)
                <input
                  type="text"
                  value={motivoExcecaoNovo}
                  onChange={(e) => setMotivoExcecaoNovo(e.target.value)}
                  placeholder="professor doente"
                  className="mt-1 block w-64 rounded border border-borda bg-fundo px-2 py-1.5 text-sm text-texto placeholder:text-texto-suave"
                />
              </label>
              <button type="button" onClick={adicionarExcecao} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-1.5 text-sm text-ambar-forte hover:bg-ambar/20">
                + Exceção
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*
  ---------- Oportunidades: "coisas que Zé pode fazer" (regra #11) ----------
  NUNCA é um menu de ações — é só memória do que Zé já descobriu que
  poderia fazer (continuar uma pesquisa, visitar um local, cumprir uma
  promessa). O jogador continua livre pra fazer qualquer outra coisa;
  "arquivar" só tira do radar quando deixou de ser relevante lembrar.
*/
function Oportunidades({
  dados,
  somenteLeitura,
  onSalvar,
}: {
  dados: PersonagemLivre;
  somenteLeitura: boolean;
  onSalvar: (novosDados: PersonagemLivre) => void;
}) {
  const [descricaoNova, setDescricaoNova] = useState("");
  const [busca, setBusca] = useState("");
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  const visiveis = dados.oportunidades.filter((o) => mostrarArquivadas || !o.arquivada);
  const filtradas = visiveis.filter((o) => corresponde(busca, o.descricao, o.npc, o.local));

  function alternarArquivada(id: string, arquivada: boolean) {
    onSalvar({ ...dados, oportunidades: dados.oportunidades.map((o) => (o.id === id ? { ...o, arquivada } : o)) });
  }

  function remover(id: string) {
    onSalvar({ ...dados, oportunidades: dados.oportunidades.filter((o) => o.id !== id) });
  }

  function adicionar() {
    if (!descricaoNova.trim()) return;
    const nova: OportunidadeLivre = {
      id: `oportunidade-${Date.now().toString(36)}`,
      descricao: descricaoNova.trim(),
      arquivada: false,
      criadaEm: Date.now(),
    };
    onSalvar({ ...dados, oportunidades: [...dados.oportunidades, nova] });
    setDescricaoNova("");
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">
        Coisas que Zé já sabe que pode fazer — não é lista de ações, e ele continua livre pra fazer qualquer outra coisa. Isso é só memória.
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar oportunidade…" />
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-texto-suave">
          <input type="checkbox" checked={mostrarArquivadas} onChange={(e) => setMostrarArquivadas(e.target.checked)} />
          Mostrar arquivadas
        </label>
      </div>
      {dados.oportunidades.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhuma oportunidade registrada ainda.</p>}
      {dados.oportunidades.length > 0 && filtradas.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-2">
        {filtradas.map((o) => (
          <li key={o.id} className="flex items-start justify-between gap-3 rounded-lg border border-borda bg-superficie p-4">
            <div>
              <p className={`text-sm text-texto ${o.arquivada ? "text-texto-suave line-through" : ""}`}>{o.descricao}</p>
              <p className="mt-1 text-xs text-texto-suave">
                {o.npc && <>NPC: {o.npc} </>}
                {o.local && <>· local: {o.local} </>}
                {o.origem && <>· {o.origem}</>}
              </p>
            </div>
            {!somenteLeitura && (
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <button type="button" onClick={() => alternarArquivada(o.id, !o.arquivada)} className="text-texto-suave underline decoration-borda underline-offset-4 hover:text-texto">
                  {o.arquivada ? "Reabrir" : "Arquivar"}
                </button>
                <button type="button" onClick={() => remover(o.id)} className="text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!somenteLeitura && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={descricaoNova}
            onChange={(e) => setDescricaoNova(e.target.value)}
            placeholder="Descrição (ex: continuar a pesquisa da Torre Velha)"
            className="flex-1 rounded border border-borda bg-fundo px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />
          <button type="button" onClick={adicionar} className="rounded border border-ambar/40 bg-ambar/10 px-3 py-2 text-sm text-ambar-forte hover:bg-ambar/20">
            + Oportunidade
          </button>
        </div>
      )}
    </div>
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

/** Sugestões pro campo de relação — texto livre, não um enum fechado (regra #17: cada relação tem sua nuance). */
const ESTADOS_RELACAO_SUGERIDOS = ["Conhecido", "Colega", "Amizade próxima", "Mentor", "Rivalidade competitiva", "Tensão"];

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
      <datalist id="npc-estados-relacao">
        {ESTADOS_RELACAO_SUGERIDOS.map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>
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
            {somenteLeitura ? (
              npc.estadoRelacao && (
                <p className="mt-1">
                  <span className="rounded-full border border-ambar/40 bg-ambar/10 px-2 py-0.5 text-xs text-ambar-forte">{npc.estadoRelacao}</span>
                </p>
              )
            ) : (
              <div className="mt-2">
                <label className="text-xs text-texto-suave">
                  Relação
                  <input
                    type="text"
                    list="npc-estados-relacao"
                    value={npc.estadoRelacao ?? ""}
                    onChange={(e) => atualizarNpc(npc.id, { estadoRelacao: e.target.value || undefined })}
                    placeholder="ex: amizade próxima, mentor, rivalidade competitiva…"
                    className="mt-1 block w-full max-w-xs rounded border border-borda bg-fundo px-2 py-1 text-sm text-texto placeholder:text-texto-suave"
                  />
                </label>
              </div>
            )}
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

            {(Object.keys(npc.relacoes).length > 0 || !somenteLeitura) && (
              <p className="mt-3 text-xs text-texto-suave">
                Estatísticas numéricas (opcional — pra mecânica própria da campanha, não é &ldquo;quanto ele gosta de você&rdquo;)
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-2">
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

function ConexaoNova({ onAdicionar }: { onAdicionar: (texto: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="nome de outro local conhecido que liga com este"
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
        + Conexão
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

const ESTADO_DESCOBERTA_LOCAL_OPCOES: { valor: EstadoDescobertaLocal; rotulo: string }[] = [
  { valor: "ouviu_falar", rotulo: "Ouviu falar" },
  { valor: "conhecido", rotulo: "Conhecido" },
  { valor: "visitado", rotulo: "Visitado" },
];

/* ---------- Locais (mapa por descoberta) ---------- */
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
      estadoDescoberta: "ouviu_falar",
      conexoesConhecidas: [],
      conhecimento: [],
      criadoEm: Date.now(),
    };
    onSalvar({ ...dados, locais: [...dados.locais, novo] });
    setNomeNovo("");
  }

  return (
    <div>
      <p className="text-sm text-texto-suave">
        Mapa por descoberta — só mostra o que Zé já ouviu falar, conhece ou visitou. Sem coordenadas nem imagem, só a lista organizada.
      </p>
      <BarraBusca valor={busca} onMudar={setBusca} placeholder="Buscar local…" />
      {dados.locais.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nenhum local ainda.</p>}
      {dados.locais.length > 0 && filtrados.length === 0 && <p className="mt-2 text-sm text-texto-suave">Nada encontrado.</p>}
      <ul className="mt-3 space-y-3">
        {filtrados.map((l) => (
          <li key={l.id} className="rounded-lg border border-borda bg-superficie p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-titulo text-texto">
                {l.nome} <span className="text-xs font-normal text-texto-suave">· {ESTADO_DESCOBERTA_LOCAL_OPCOES.find((o) => o.valor === l.estadoDescoberta)?.rotulo}</span>
              </p>
              {!somenteLeitura && (
                <button type="button" onClick={() => remover(l.id)} className="shrink-0 text-xs text-texto-suave underline decoration-borda underline-offset-4 hover:text-segredo">
                  Remover
                </button>
              )}
            </div>
            {l.descricao && <p className="mt-1 text-sm text-texto-suave">{l.descricao}</p>}
            {!somenteLeitura && (
              <select
                value={l.estadoDescoberta}
                onChange={(e) => atualizar(l.id, { estadoDescoberta: e.target.value as EstadoDescobertaLocal })}
                className="mt-2 rounded border border-borda bg-fundo px-2 py-1 text-xs text-texto"
              >
                {ESTADO_DESCOBERTA_LOCAL_OPCOES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
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
            {l.conexoesConhecidas.length > 0 && (
              <p className="mt-2 text-xs text-texto-suave">Conexões: {l.conexoesConhecidas.join(", ")}</p>
            )}
            {!somenteLeitura && (
              <ConexaoNova onAdicionar={(texto) => atualizar(l.id, { conexoesConhecidas: [...l.conexoesConhecidas, texto] })} />
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
  compromissos: "compromisso",
  mural: "mural",
  gradeHoraria: "bloco de horário",
  excecoesCalendario: "exceção de calendário",
  oportunidades: "oportunidade",
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
