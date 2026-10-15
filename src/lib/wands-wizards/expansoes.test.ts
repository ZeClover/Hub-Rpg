import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import BASE from './expansoes-baseline.json' with {type:'json'};
import EDITORIAL from './expansoes-editorial.json' with {type:'json'};
import MATERIAIS from './suplementos-editorial.json' with {type:'json'};
import SEGURAS from '../../../public/wands-wizards/expansoes/seguras.json' with {type:'json'};
import CORE from '../../../public/wands-wizards/catalogo-origem.json' with {type:'json'};
import { novaFicha, calcularFicha, prepararFichaWandsWizards, ESTILOS, ESCOLAS, CRIACAO } from '../../../public/wands-wizards/ficha-regras.mjs';
import { catalogoComExpansoes, configuracaoExpansoes, magiasEscolhidas } from '../../../public/wands-wizards/expansoes/regras.mjs';
import { registrarMagia, recursosDaFicha, registrarDescanso } from '../../../public/wands-wizards/recursos-regras.mjs';

const ligado={emCampanha:true,ehMestre:true,expansoesWandsWizards:{versao:1,ativas:['newt-trunk'],revisao:1}};
const jogador={...ligado,ehMestre:false};

test('1440 combinações de Casa, estilo, escola e níveis 1–20 são idênticas ao commit publicado sem expansão',()=>{
  for(const entrada of BASE.entradas){
    const {sha256,...escolhas}=entrada,d={...novaFicha(),...escolhas};
    const atual=createHash('sha256').update(JSON.stringify(calcularFicha(d))).digest('hex');
    assert.equal(atual,sha256,`${d.casa}/${d.estilo}/${d.escola}/${d.nivel}`);
    assert.deepEqual(calcularFicha(d,{expansoesWandsWizards:{versao:1,ativas:[]}}),calcularFicha(d));
  }
});

test('somente três estilos e seis escolas-base; novas progressões ficam indisponíveis',()=>{
  assert.equal(Object.keys(ESTILOS).length,3);assert.equal(Object.keys(ESCOLAS).length,6);
  for(const trilha of EDITORIAL.trilhas){assert.equal(trilha.selecionavel,false);const d={...novaFicha(),escola:trilha.id};assert.match(prepararFichaWandsWizards({},d,ligado).erro!,/Escola inválida/);}
  assert.equal(configuracaoExpansoes(null).ativas.length,0);
  assert.equal(configuracaoExpansoes({versao:99,ativas:['newt-trunk']}).ativas.length,0);
});

test('cada alternativa A respeita escola, nível e um único marco; não altera atributos, PV ou espaços',()=>{
  for(const opcao of SEGURAS.opcoes.filter(o=>o.tipo==='beneficio'))for(const estilo of ['vontade','tecnica','intelecto'])for(let nivel=opcao.nivel;nivel<=20;nivel++){
    const d={...novaFicha(),estilo,nivel,escola:opcao.escola!,extensoesWW:{beneficiosEscola:{[opcao.nivel]:opcao.id}}};
    const c=calcularFicha(d,ligado),antes=calcularFicha({...d,extensoesWW:undefined});
    for(const campo of ['atributos','salvaguardas','pvMaximos','espacosPorCirculo','pontosFeiticaria','truques','magias','ca','cdMagia'])assert.deepEqual(c[campo],antes[campo],`${opcao.id}/${campo}`);
    assert.ok((c.beneficiosExpansao as string[]).includes(opcao.id));
    assert.equal(prepararFichaWandsWizards(d,d,ligado).erro,undefined,opcao.id);
  }
});

test('Intelecto recebe duas posições iniciais, nunca dois benefícios-base mais uma alternativa',()=>{
  const d={...novaFicha(),estilo:'intelecto',nivel:3,beneficiosEscola:{1:'mira'},extensoesWW:{beneficiosEscola:{1:'newt-bewitching-studies'}}};
  const c=calcularFicha(d,ligado);
  assert.deepEqual(c.beneficiosAtivos,['protecao']);assert.deepEqual(c.beneficiosExpansao,['newt-bewitching-studies']);
  assert.deepEqual(c.magiasConcedidas,['muffliato','accio']);assert.equal(c.truques,7);
  assert.deepEqual(calcularFicha(d).beneficiosAtivos,['mira','protecao']);
});

test('desativar e reativar preserva formação-base, perícias, receitas, itens, varinha e aparência',()=>{
  const d={...novaFicha(),escola:'maldicoes',beneficiosEscola:{1:'auror'},periciasEscola:['pocoes','furtividade'],receitasIniciais:{auror:['cure-for-boils']},
    varinha:{madeira:'Carvalho',nucleo:'Fênix',comprimento:'12 polegadas',flexibilidade:'Flexível'},aparencia:{tema:'floresta'},inventario:[{id:'livro',nome:'Livro antigo',quantidade:1}],_mestre:{segredo:'preservar'}};
  // Use an actual common recipe from the current base data.
  const receitas=(CRIACAO.receitas as Record<string,{raridade:string}>);d.receitasIniciais.auror=[Object.keys(receitas).find(id=>receitas[id].raridade==='comum')!];
  const novo={...structuredClone(d),extensoesWW:{beneficiosEscola:{1:'newt-specialized-skills'}}};
  const antes=JSON.stringify(novo),c=calcularFicha(novo,ligado);
  assert.equal(c.pericias.pocoes.treinada,false);assert.equal(c.pericias.intimidacao.treinada,true);
  assert.equal(JSON.stringify(novo),antes,'calcular não pode modificar dados');
  const salvo=prepararFichaWandsWizards(d,novo,ligado);assert.equal(salvo.erro,undefined);
  assert.deepEqual(salvo.dados!.receitasIniciais,d.receitasIniciais);assert.deepEqual(salvo.dados!.periciasEscola,d.periciasEscola);
  for(const campo of ['atributos','beneficiosAtivos','pericias','ferramentas','pvMaximos','ca'])assert.deepEqual(calcularFicha(salvo.dados!)[campo],calcularFicha(d)[campo]);
  assert.deepEqual(calcularFicha(novo,ligado),calcularFicha(structuredClone(novo),ligado));
  assert.deepEqual(salvo.dados!._mestre,d._mestre);assert.deepEqual(salvo.dados!.varinha,d.varinha);
});

test('Intimidação concede proficiência ou especialização sem multiplicar três vezes',()=>{
  const d=novaFicha();d.escola='maldicoes';d.extensoesWW={beneficiosEscola:{1:'newt-specialized-skills'}};
  let c=calcularFicha(d,ligado);assert.equal(c.pericias.intimidacao.especializada,false);assert.equal(c.pericias.intimidacao.bonus,2);
  const antecedentes=CRIACAO.antecedentes as Record<string,{pericias:string[]}>;
  d.antecedente=Object.keys(antecedentes).find(id=>antecedentes[id].pericias.includes('intimidacao'))!;
  assert.ok(d.antecedente);c=calcularFicha(d,ligado);assert.equal(c.pericias.intimidacao.especializada,true);assert.equal(c.pericias.intimidacao.bonus,4);
});

test('perícias duplicadas da expansão usam escolhas separadas, sem apagar substituições antigas',()=>{
  const d=novaFicha();d.escola='magizoologia';d.periciasClasse=['criaturas','intuicao'];
  // Intelecto permits Magical Creatures and Insight in its skill list.
  d.estilo='intelecto';
  d.extensoesWW={beneficiosEscola:{1:'newt-biological-studies'},substituicoesPericias:['atletismo']};
  const c=calcularFicha(d,ligado);assert.equal(c.pericias.atletismo.treinada,true);assert.equal(c.substituicoesLimite,1);
  assert.equal(calcularFicha(d).pericias.atletismo.treinada,false);assert.deepEqual(d.substituicoesPericias,[]);
});

test('A desligada, B, C, escola errada, tier futuro e concessões forjadas são recusados',()=>{
  for(const id of ['newt-first-strike','newt-farseeing','newt-bogus']){
    const d={...novaFicha(),extensoesWW:{beneficiosEscola:{1:id}}};assert.ok(prepararFichaWandsWizards({},d,ligado).erro);
  }
  const d={...novaFicha(),extensoesWW:{beneficiosEscola:{1:'newt-bewitching-studies'}}};
  assert.match(prepararFichaWandsWizards({},d).erro!,/desativada/);
  assert.ok(prepararFichaWandsWizards({}, {...d,escola:'cura'},ligado).erro);
  assert.ok(prepararFichaWandsWizards({}, {...d,escola:'magizoologia',extensoesWW:{beneficiosEscola:{6:'newt-way-of-the-wild'}}},ligado).erro);
  const forjado={...novaFicha(),extensoesWW:{formacoes:[{id:'newt-wandmakers-gift'}]}};
  assert.match(prepararFichaWandsWizards({},forjado,jogador).erro!,/Mestre/);
  assert.equal(prepararFichaWandsWizards({},forjado,ligado).erro,undefined);
  const confirmado={...novaFicha(),beneficiosEscola:{1:'mira'}};
  assert.match(prepararFichaWandsWizards(confirmado,{...confirmado,extensoesWW:{beneficiosEscola:{1:'newt-bewitching-studies'}}},jogador).erro!,/Mestre/);
});

test('magias-base aprendidas graças à cota liberada ficam separadas e são suspensas com a expansão',()=>{
  const truques=CORE.magias.filter(m=>m.nivel===0&&!m.restrita&&m.id!=='accio');
  const d={...novaFicha(),magias:['accio',...truques.slice(0,3).map(m=>m.id)],extensoesWW:{beneficiosEscola:{1:'newt-bewitching-studies'},magias:[truques[3].id]}};
  const r=prepararFichaWandsWizards({},d,ligado);assert.equal(r.erro,undefined);
  assert.equal(magiasEscolhidas(r.dados,ligado).length,5);assert.equal(magiasEscolhidas(r.dados,{}).length,4);
  assert.equal(prepararFichaWandsWizards(r.dados,r.dados).erro,undefined);
  assert.doesNotThrow(()=>registrarMagia(r.dados,calcularFicha(r.dados,ligado),truques[3].id,0));
});

test('o limite de entrada permite os 55 conhecimentos legítimos de Intelecto no nível 20, mantendo as cotas',()=>{
  const d={...novaFicha(),nivel:20,estilo:'intelecto',aumentos:[4,8,12,16,19].map(nivel=>({nivel,atributos:{forca:2}}))};
  const c=calcularFicha(d);assert.equal(c.truques,15);assert.equal(c.magias,40);
  const comuns=CORE.magias.filter(m=>!m.restrita&&!c.magiasConcedidas.includes(m.id)&&!['crucio','imperio','avada-kedavra','morsmordre','fiendfyre'].includes(m.id));
  d.magias=[...comuns.filter(m=>m.nivel===0).slice(0,15),...comuns.filter(m=>m.nivel>0).slice(0,40)].map(m=>m.id);
  assert.equal(d.magias.length,55);assert.equal(prepararFichaWandsWizards({...d,nivel:19},d).erro,undefined);
});

test('formações têm concessão explícita, mínimo de nível e não geram inventário',()=>{
  for(const opcao of SEGURAS.opcoes.filter(o=>o.tipo==='formacao')){
    const formacao={id:opcao.id,...(opcao.id==='newt-beguiling-influence'?{pericias:['intimidacao','persuasao']}:{}),...(opcao.id==='newt-quadribol'?{posicao:'goleiro'}:{})};
    const d={...novaFicha(),nivel:opcao.nivel,extensoesWW:{formacoes:[formacao]}};
    const r=prepararFichaWandsWizards(d,d,ligado);assert.equal(r.erro,undefined,opcao.id);assert.deepEqual(r.dados!.inventario,[]);
    if(opcao.nivel>1)assert.ok(prepararFichaWandsWizards({}, {...d,nivel:1},ligado).erro);
  }
});

test('somente cinco verbetes completos entram no grimório opcional, com cotas e persistência separada',()=>{
  const catalogo=catalogoComExpansoes([],ligado);assert.equal(catalogo.length,5);assert.equal(catalogoComExpansoes([],{}).length,0);
  for(const magia of catalogo){assert.ok(magia.componentes);assert.ok(magia.traducao);assert.ok(magia.conjuracao);assert.ok(magia.duracao);}
  const d={...novaFicha(),extensoesWW:{magias:['newt-inevitam','newt-veentoosa','newt-siccaroube']}};
  const r=prepararFichaWandsWizards({},d,ligado);assert.equal(r.erro,undefined);assert.deepEqual(r.dados!.extensoesWW!.magias,d.extensoesWW.magias);assert.ok(!r.dados!.magias.some(id=>id.startsWith('newt-')));
  assert.deepEqual(magiasEscolhidas(r.dados,{}),r.dados!.magias);
  const excessos={...d,magias:CORE.magias.filter(m=>m.nivel===0&&!m.restrita).slice(0,4).map(m=>m.id)};assert.match(prepararFichaWandsWizards({},excessos,ligado).erro!,/limite regular/);
  assert.ok(prepararFichaWandsWizards({}, {...d,extensoesWW:{magias:['newt-beauty-spell']}},ligado).erro);
  assert.ok(prepararFichaWandsWizards({}, {...d,extensoesWW:{magias:['newt-magicae-felicis']}},ligado).erro);
});

test('conjuração de expansão usa os mesmos espaços, concentração, descansos e resultado externo',()=>{
  const d={...novaFicha(),extensoesWW:{magias:['newt-veentoosa','newt-siccaroube']}};
  const c=calcularFicha(d,ligado),conjurado=registrarMagia(d,c,'newt-siccaroube',1);
  assert.equal(conjurado.espacosUsados,1);assert.equal(d.espacosUsados,0);
  const concentrado=registrarMagia(conjurado,c,'newt-veentoosa',0);assert.deepEqual(concentrado.concentracoes,['newt-veentoosa']);
  assert.equal(recursosDaFicha(concentrado,calcularFicha(concentrado,ligado)).espacos[0].disponiveis,1);
  assert.equal(prepararFichaWandsWizards(concentrado,concentrado).erro,undefined,'desativação suspende a concentração sem apagar as escolhas');
  assert.equal(registrarDescanso(concentrado,c,'longo').espacosUsados,0);
});

test('catálogo editorial cobre as 30 magias completas, citações incompletas e bloqueios sem expor B/C como opções A',()=>{
  const spells=EDITORIAL.opcoes.filter(o=>o.secaoAuditoria.startsWith('5.'));
  assert.equal(spells.length,36);assert.equal(spells.filter(o=>o.verbeteOriginal).length,30);
  assert.equal(EDITORIAL.opcoes.filter(o=>o.categoria==='B').length,105);
  assert.ok(EDITORIAL.opcoes.filter(o=>o.categoria!=='A').every(o=>!o.habilitavel));
  assert.equal(new Set(EDITORIAL.opcoes.map(o=>o.id)).size,EDITORIAL.opcoes.length);
});

test('planilhas originais recuperam 19 poções e 167 blocos sem conceder itens, duplicar magias ou inventar cartas',()=>{
  assert.equal(MATERIAIS.pocoes.length,69);assert.equal(MATERIAIS.pocoes.filter(p=>p.novoCandidato).length,19);
  assert.ok(MATERIAIS.pocoes.every(p=>!p.disponivelJogador&&!p.concedeEstoque));
  assert.equal(MATERIAIS.equivalenciaMagias.length,144);assert.ok(MATERIAIS.equivalenciaMagias.every(m=>m.nivelConfere&&m.idBase));
  assert.equal(MATERIAIS.criaturas.length,167);assert.ok(MATERIAIS.criaturas.every(c=>!c.disponivelJogador&&!c.crValidado&&!c.conversaoAprovada));
  assert.equal(MATERIAIS.cartas.status,'fonte-ausente');
});
