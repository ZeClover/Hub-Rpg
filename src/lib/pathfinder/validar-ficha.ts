import regras from '../../../public/js/pathfinder-regras.js';
import catalogo from './catalogo-validacao.json' with { type: 'json' };

type Registro = Record<string, unknown>;
const objeto = (v: unknown): Registro => v && typeof v === 'object' && !Array.isArray(v) ? v as Registro : {};
const inteiro = (v: unknown, fallback = 0) => Number.isInteger(v) && Number(v) >= 0 ? Number(v) : fallback;
export function progressaoPermitidaPathfinder(valor: unknown, emCampanha: boolean, ehMestre: boolean) {
  const d = objeto(valor), nivel = Math.min(20, Math.max(1, inteiro(d.nivel, 1))), xp = inteiro(d.xp);
  const mestre = objeto(objeto(d._mestre).pathfinder);
  const autorizado = Math.min(20, Math.max(nivel, inteiro(mestre.nivelAutorizado, nivel)));
  return { nivelMaximo: !emCampanha || ehMestre ? 20 : Math.min(20, Math.max(autorizado, nivel + Math.floor(xp / 1000))), modo: !emCampanha || ehMestre ? 'livre' : 'mestre-ou-xp' };
}
export function prepararFichaPathfinder(antes: unknown, depois: unknown, contexto: { emCampanha: boolean; ehMestre: boolean; ehMonstro: boolean }): { dados?: Registro; erro?: string } {
  const old = objeto(antes), d = structuredClone(objeto(depois));
  if (contexto.ehMonstro) return { dados: d };
  if (d.sistema !== 'pathfinder-2e-remaster' || d.versaoFicha !== 1) return { erro: 'Formato de ficha Pathfinder inválido.' };
  if (!Number.isInteger(d.nivel) || Number(d.nivel) < 1 || Number(d.nivel) > 20) return { erro: 'Nível deve estar entre 1 e 20.' };
  if (!Number.isInteger(d.xp) || Number(d.xp) < 0 || Number(d.xp) > 1000000) return { erro: 'XP inválido.' };
  const atual = inteiro(old.nivel, 1), novo = Number(d.nivel);
  if (contexto.emCampanha && !contexto.ehMestre) {
    if (novo < atual || novo > progressaoPermitidaPathfinder(old, true, false).nivelMaximo) return { erro: 'A evolução exige XP ou autorização do mestre.' };
    const autorizado = inteiro(objeto(objeto(old._mestre).pathfinder).nivelAutorizado, atual);
    d.xp = novo > atual && novo > autorizado ? inteiro(old.xp) - (novo - atual) * 1000 : inteiro(old.xp);
  }
  if (!contexto.ehMestre) {
    for (const k of ['proficienciasAprovadasPeloMestre', 'periciasAprovadasPeloMestre']) { if (old[k] !== undefined) d[k] = old[k]; else delete d[k]; }
    if (old.proficienciasAprovadasPeloMestre) d.proficiencias = old.proficiencias; else delete d.proficiencias;
    for (const [flag, campos] of [['bonusAprovadosPeloMestre', ['bonus']], ['equipamentoAprovadoPeloMestre', ['arma', 'armadura', 'escudo']]] as const) {
      if (old[flag] === true) { d[flag] = true; for (const campo of campos) { if (old[campo] !== undefined) d[campo] = old[campo]; else delete d[campo]; } }
      else delete d[flag];
    }
    const antigos = Array.isArray(old.talentos) ? old.talentos.map(objeto) : [];
    if (Array.isArray(d.talentos)) d.talentos = d.talentos.map((t: unknown) => { const x = objeto(t), anterior = antigos.find(a => a.id === x.id); const r = { ...x }; delete r.aprovadoPeloMestre; if (anterior?.aprovadoPeloMestre === true) Object.assign(r, { aprovadoPeloMestre: true, nome: anterior.nome, tipo: anterior.tipo, nivel: anterior.nivel }); return r; });
    if (contexto.emCampanha) {
      const permitidos = objeto(objeto(old._mestre).pathfinder).opcoesAutorizadas;
      const antesItens = Array.isArray(old.equipamentos) ? old.equipamentos.map(objeto) : [];
      const itens = Array.isArray(d.equipamentos) ? d.equipamentos.map(objeto) : [];
      const selecionados = ['armaId', 'armaduraId', 'escudoId'].map(k => d[k]).filter((v): v is string => typeof v === 'string' && !!v);
      const anteriores = ['armaId', 'armaduraId', 'escudoId'].map(k => old[k]);
      const idsRunas = Object.values(objeto(d.runasEquipamento)).flatMap(v => typeof v === 'string' ? [v] : Object.values(objeto(v)).filter((x): x is string => typeof x === 'string' && !!x));
      const runasAnteriores = Object.values(objeto(old.runasEquipamento)).flatMap(v => typeof v === 'string' ? [v] : Object.values(objeto(v)).filter((x): x is string => typeof x === 'string' && !!x));
      const exclusivos = (catalogo.equipamentos as { id: string; somenteMestre?: boolean }[]).filter(e => e.somenteMestre);
      const novosIds = [...itens.map(e => e.id), ...selecionados, ...idsRunas].filter((id): id is string => typeof id === 'string');
      if (novosIds.some(id => exclusivos.some(x => x.id === id) && !antesItens.some(x => x.id === id) && !anteriores.includes(id) && !runasAnteriores.includes(id) && !(Array.isArray(permitidos) && permitidos.includes(id)))) return { erro: 'Este item depende de autorização do mestre.' };
    }
  }
  if (Array.isArray(d.equipamentos) && d.equipamentos.some((item: unknown) => { const q = objeto(item).quantidade; return q !== undefined && (typeof q !== 'number' || !Number.isInteger(q) || q < 0 || q > 1000000); })) return { erro: 'Quantidade de equipamento inválida.' };
  const validacao = regras.validar(d, catalogo);
  const erros = [...(validacao.erros ?? []), ...(objeto(d._guiado).concluido === true ? validacao.pendencias ?? [] : [])];
  if (erros.length) return { erro: erros.map((e: unknown) => typeof e === 'string' ? e : objeto(e).mensagem ?? 'Escolha inválida').join(' ') };
  const normalizada = regras.normalizar(d, catalogo), calculo = regras.calcular(normalizada, catalogo);
  const vida = objeto(normalizada.vida), maxima = calculo.pvMaximos;
  if (!Number.isFinite(maxima) || maxima < 0 || (maxima === 0 && objeto(d._guiado).concluido === true)) return { erro: 'Não foi possível calcular os PV.' };
  const atualPv = vida.atual, temporaria = vida.temporaria;
  if (typeof atualPv !== 'number' || !Number.isFinite(atualPv) || atualPv < 0 || typeof temporaria !== 'number' || !Number.isFinite(temporaria) || temporaria < 0 || temporaria > 1000000) return { erro: 'Pontos de vida inválidos.' };
  normalizada.vida = { ...vida, atual: Math.min(maxima, atualPv), maxima, temporaria };
  normalizada.resumoVida = { ...objeto(old.resumoVida), atual: Math.min(maxima, atualPv), maxima, rotulo: "PV" };
  return { dados: normalizada };
}
