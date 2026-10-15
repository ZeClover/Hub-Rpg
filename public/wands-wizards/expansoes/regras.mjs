import SEGURAS from './seguras.json' with {type:'json'};
import BASE from '../catalogo-origem.json' with {type:'json'};

export const OPCOES_SEGURAS = SEGURAS.opcoes;
const porId = new Map(OPCOES_SEGURAS.map(opcao => [opcao.id, opcao]));
const objeto = valor => valor && typeof valor === 'object' && !Array.isArray(valor);

export function configuracaoExpansoes(valor) {
  const ativa = valor?.versao === 1 && Array.isArray(valor.ativas) && valor.ativas.includes('newt-trunk');
  return {versao:1, ativas:ativa ? ['newt-trunk'] : [], revisao:Number.isSafeInteger(valor?.revisao) && valor.revisao >= 0 ? valor.revisao : 0};
}
export function expansaoAtiva(contexto = {}) {
  return contexto.emCampanha === true && configuracaoExpansoes(contexto.expansoesWandsWizards).ativas.includes('newt-trunk');
}
export function opcoesDisponiveis(contexto = {}) {
  return expansaoAtiva(contexto) ? OPCOES_SEGURAS : [];
}
export function catalogoComExpansoes(base, contexto = {}) {
  return [...base, ...opcoesDisponiveis(contexto).filter(opcao => opcao.tipo === 'magia')];
}
export function magiasEscolhidas(dados, contexto = {}) {
  return [...new Set([...(dados.magias ?? []), ...(expansaoAtiva(contexto) ? dados.extensoesWW?.magias ?? [] : [])])];
}
export function selecionarMagia(dados, id, conhecida, separar = false) {
  if (porId.get(id)?.tipo === 'magia' || separar || dados.extensoesWW?.magias?.includes(id)) {
    dados.extensoesWW ??= {};
    const atuais = dados.extensoesWW.magias ?? [];
    dados.extensoesWW.magias = conhecida ? [...new Set([...atuais,id])] : atuais.filter(x => x !== id);
  } else dados.magias = conhecida ? [...new Set([...dados.magias,id])] : dados.magias.filter(x => x !== id);
}

export function projetarExpansoes(dados, contexto = {}) {
  if (!expansaoAtiva(contexto)) return {dados, beneficios:[], formacoes:[], pericias:[], ferramentas:[], removerIniciais:[]};
  const ext = dados.extensoesWW ?? {};
  if (!objeto(ext) || Object.keys(ext).some(k => !['beneficiosEscola','magias','formacoes','substituicoesPericias'].includes(k))) throw Error('Dados de expansão inválidos.');
  const escolhas = ext.beneficiosEscola ?? {};
  if (!objeto(escolhas) || Object.keys(escolhas).length > 5) throw Error('Escolhas de expansão inválidas.');
  const beneficios = Object.entries(escolhas).map(([nivel,id]) => {
    const opcao = porId.get(id);
    if (!opcao || opcao.tipo !== 'beneficio' || String(opcao.nivel) !== nivel || opcao.escola !== dados.escola || opcao.nivel > dados.nivel) throw Error('Benefício da expansão não pertence à escola ou ao nível disponível.');
    return opcao;
  });
  const formacoes = ext.formacoes ?? [];
  if (!Array.isArray(formacoes) || formacoes.length > 10 || new Set(formacoes.map(x => x?.id)).size !== formacoes.length) throw Error('Formações de expansão inválidas.');
  const formacoesAtivas = formacoes.map(escolha => {
    const opcao = porId.get(escolha?.id);
    if (!opcao || opcao.tipo !== 'formacao' || opcao.nivel > dados.nivel || Object.keys(escolha).some(k => !['id','pericias','posicao'].includes(k))) throw Error('Formação da expansão inválida ou de nível indisponível.');
    if (opcao.id === 'newt-beguiling-influence' && (!Array.isArray(escolha.pericias) || escolha.pericias.length !== 2 || new Set(escolha.pericias).size !== 2 || escolha.pericias.some(k => !['enganacao','intimidacao','atuacao','persuasao'].includes(k)))) throw Error('Influência cativante exige duas perícias sociais distintas.');
    if (opcao.id !== 'newt-beguiling-influence' && escolha.pericias !== undefined) throw Error('Esta formação não concede escolhas de perícias.');
    if (opcao.id === 'newt-quadribol' ? !['artilheiro','batedor','goleiro','apanhador'].includes(escolha.posicao) : escolha.posicao !== undefined) throw Error('Posição de Quadribol inválida.');
    return {...opcao, escolha};
  });
  const magias = ext.magias ?? [];
  if (!Array.isArray(magias) || new Set(magias).size !== magias.length || magias.length > 60 || magias.some(id => porId.get(id)?.tipo !== 'magia' && !BASE.magias.some(m=>m.id===id)) || magias.some(id=>dados.magias?.includes(id))) throw Error('Seleção de magias da expansão inválida ou duplicada na ficha-base.');
  const efetivos = beneficios.length || formacoesAtivas.length ? {...dados,beneficiosEscola:{...dados.beneficiosEscola},substituicoesPericias:ext.substituicoesPericias??[]} : dados;
  for (const beneficio of beneficios) delete efetivos.beneficiosEscola[beneficio.nivel];
  if (escolhas[1]) {
    efetivos.periciasEscola = [];
    if (dados.receitasIniciais?.auror) { efetivos.receitasIniciais={...dados.receitasIniciais};delete efetivos.receitasIniciais.auror; }
  }
  const todas = [...beneficios,...formacoesAtivas];
  return {
    dados:efetivos, beneficios, formacoes:formacoesAtivas,
    pericias:todas.flatMap(o => [...(o.efeitos?.pericias ?? []),...(o.escolha?.pericias ?? [])]),
    ferramentas:todas.flatMap(o => o.efeitos?.ferramentas ?? []),
    removerIniciais:escolhas[1] ? [dados.beneficiosEscola?.[1] ?? null] : [],
  };
}

export function validarMudancasExpansoes(anterior, recebido, contexto = {}) {
  const antes = anterior?.extensoesWW;
  const depois = recebido.extensoesWW;
  if (!expansaoAtiva(contexto)) {
    if (JSON.stringify(antes) !== JSON.stringify(depois)) throw Error('A expansão está desativada nesta campanha. As escolhas anteriores devem ser preservadas.');
    return;
  }
  projetarExpansoes(recebido, contexto);
  if (!contexto.ehMestre) {
    if (JSON.stringify(antes?.formacoes ?? []) !== JSON.stringify(depois?.formacoes ?? [])) throw Error('Somente o Mestre pode conceder ou retirar formações da expansão.');
    for (const [nivel,id] of Object.entries(antes?.beneficiosEscola ?? {})) if (depois?.beneficiosEscola?.[nivel] !== id) throw Error('Alternativas já confirmadas exigem revisão do Mestre.');
    for (const nivel of Object.keys(depois?.beneficiosEscola ?? {})) if (anterior?.beneficiosEscola?.[nivel] && !antes?.beneficiosEscola?.[nivel]) throw Error('Substituir um benefício-base já confirmado exige revisão do Mestre.');
  }
}
