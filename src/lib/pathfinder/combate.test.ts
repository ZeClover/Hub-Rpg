import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const C = createRequire(import.meta.url)('../../../public/js/pathfinder-combate.js') as typeof import('../../../public/js/pathfinder-combate.js');
const R = createRequire(import.meta.url)('../../../public/js/pathfinder-regras.js');
const livro = JSON.parse(readFileSync(new URL('../../../public/pathfinder/player-core.json', import.meta.url), 'utf8'));
const armas = livro.equipamentos.filter((e: Record<string, unknown>) => e.tipo === 'arma') as Record<string, unknown>[];
const arma = (id: string) => { const a = armas.find(e => e.id === id); assert.ok(a, id); return a; };
const calculo = (forca = 4, des = 3): import('../../../public/js/pathfinder-combate.js').CalculoArma => ({ atributos: { for: forca, des }, dadosArma: 1, bonusDanoArma: 0 });
function vida(atual = 20, maxima = 20, temporaria = 0): Record<string, unknown> { return { nome: 'Personagem de teste', vida: { atual, maxima, temporaria, extra: 'preservar' }, condicoes: [], extra: { campo: 27 } }; }
function plano(id: string, opts = {}, calc = calculo()) { const p = C.danoArma(arma(id), calc, opts); assert.ok(p.suportado, !p.suportado ? p.motivo : ''); return p; }
function roll(id: string, opts = {}, calc = calculo()) { const r = C.rolarDano(plano(id, opts, calc), () => 0); assert.ok(r.suportado); return r; }
function dano(p: Record<string, unknown>, partes: import('../../../public/js/pathfinder-combate.js').ParteDano[], opts = {}) { const r = C.aplicarDano(p, partes, opts); assert.ok(r.suportado, !r.suportado ? r.motivo : ''); return r; }
function cura(p: Record<string, unknown>, n: number, opts = {}) { const r = C.curar(p, n, opts); assert.ok(r.suportado); return r; }
function cvalor(f: Record<string, unknown>, id: string) { return (f.condicoes as Array<{ id: string; valor: number }>).find(c => c.id === id)?.valor || 0; }

test('motor CommonJS e navegador é puro e expõe a mesma rolagem transparente', () => {
  const ctx = { window: {} as Record<string, unknown> }; vm.runInNewContext(readFileSync(new URL('../../../public/js/pathfinder-combate.js', import.meta.url), 'utf8'), ctx);
  const web = ctx.window.HubPF2Combate as typeof C;
  assert.equal(web.rolar('2d6+3', () => 0).total, 5); assert.equal(C.rolar('2d6+3', () => 0).total, 5);
  assert.equal(web.rolar('d20', () => 0.999).rolagens[0].resultados[0], 20);
});
test('parser mantém cada resultado, precedência, parênteses e modificadores negativos', () => {
  const r = C.rolar('(2d6+4)*2+1d8-3', () => 0); assert.equal(r.total, 10); assert.deepEqual(r.rolagens.map(x => x.resultados), [[1, 1], [1]]);
  assert.equal(C.rolar('1d20-4', () => 0).total, -3); assert.equal(C.rolar('2+3*4').total, 14);
});
test('parser recusa código, expressões incompletas, excesso de dados e fonte inválida', () => {
  for (const f of ['process.exit()', '1d6;alert(1)', '1d0', '101d6', '(1d6', '1d6+', '2**4', '1/0', '']) assert.throws(() => C.rolar(f), RangeError, f);
  assert.throws(() => C.rolar('1d20', () => 1), RangeError); assert.throws(() => C.rolar('1d20', () => -1), RangeError);
});
// As armas são os blocos reais revisados do Player Core PT, não mocks da implementação.
for (const w of armas) test(`arma real PC1: ${w.nome} preserva dano ou bloqueia contexto ainda não verificado`, () => {
  const p = C.danoArma(w, calculo());
  if ((w.tracos as string[]).some(t=>['energica','gemea','justa'].includes(t))) { assert(!p.suportado); assert(p.motivo.includes('contextual')); return; }
  assert.ok(p.suportado, !p.suportado ? p.motivo : '');
  const r = C.rolarDano(p, () => 0); assert.ok(r.suportado); const ranged = w.distancia !== undefined;
  const ts = w.tracos as string[]; const expectedBonus = ranged ? ts.includes('propulsivo') || ts.includes('propulsiva') ? 2 : 0 : 4;
  assert.equal(r.total, 1 + expectedBonus); assert.equal(r.partesDano[0].tipo, w.tipoDano);
});
test('acuidade melhora ataque mas não substitui Força por Destreza no dano', () => { assert.equal(roll('rapieira', {}, calculo(1, 4)).total, 2); });
test('ladino só usa Destreza no dano quando cálculo confiável concede explicitamente', () => {
  assert.equal(roll('rapieira', {}, { ...calculo(1, 4), atributoDanoArma: 'des' }).total, 5);
});
test('adaga arremessada mantém Força inteira e não ganha dano de Destreza', () => { assert.equal(roll('adaga', { modo: 'arremesso' }, calculo(3, 4)).total, 4); });
test('arma à distância comum não recebe modificador de atributo', () => { assert.equal(roll('arco-curto', {}, calculo(-4, 5)).total, 1); });
test('arco composto usa metade positiva arredondada baixo e penalidade negativa inteira', () => {
  assert.equal(roll('arco-curto-composto', {}, calculo(3)).total, 2); assert.equal(plano('arco-curto-composto', {}, calculo(-2)).base.bonus, -2);
});
test('dano mínimo é 1 após penalidades, antes da dobra de crítico', () => {
  assert.equal(roll('adaga', {}, calculo(-4)).total, 1); const r = roll('adaga', { critico: true }, calculo(-4)); assert.equal(r.total, 2); assert(r.minimoAplicado);
});
test('duas mãos muda todos os dados, inclusive os da runa impactante', () => {
  const p = plano('cajado', { maos: 2, dadosArma: 3 }); assert.equal(p.base.faces, 8); assert.equal(p.base.quantidade, 3);
});
test('tipo versátil deve estar autorizado pela própria arma', () => {
  assert.equal(plano('adaga', { tipoDano: 'cortante' }).tipoDano, 'cortante'); assert.equal(C.danoArma(arma('adaga'), calculo(), { tipoDano: 'fogo' }).suportado, false);
});
test('crítico mortal dobra base/modificadores e adiciona d8 sem dobrar', () => {
  const r = roll('rapieira', { critico: true }); assert.equal(r.total, 11); assert.equal(r.partesDano[0].valorSemDobra, 6);
});
test('mortal aumenta para 2 e 3 dados apenas nas runas impactantes maiores', () => {
  assert.equal(plano('rapieira', { critico: true, dadosArma: 2 }).extras[0].quantidade, 1);
  assert.equal(plano('rapieira', { critico: true, dadosArma: 3 }).extras[0].quantidade, 2);
  assert.equal(plano('rapieira', { critico: true, dadosArma: 4 }).extras[0].quantidade, 3);
});
test('fatal aumenta os dados base e acrescenta exatamente um dado não dobrado', () => {
  const p = plano('picareta', { critico: true, dadosArma: 3 }); assert.equal(p.base.faces, 10); assert.equal(p.extras[0].quantidade, 1); assert.equal(p.extras[0].faces, 10);
  const r = C.rolarDano(p, () => 0); assert.ok(r.suportado); assert.equal(r.total, 15);
});
test('entrada sem dano estruturado não inventa uma fórmula ou aceita referência indexada', () => {
  assert.equal(C.danoArma({ tipo: 'arma', descricao: 'um dado e força' }, calculo()).suportado, false);
  assert.equal(C.danoArma({ ...arma('adaga'), somenteConsulta: true }, calculo()).suportado, false);
});
test('dano consome temporários antes dos PV, não muta original nem perde campos novos', () => {
  const f = vida(20, 20, 5); const r = dano(f, [{ tipo: 'cortante', valor: 8 }]); assert.equal(r.absorvidoTemporario, 5); assert.equal(r.perdidoPV, 3);
  assert.equal(r.ficha.vida.atual, 17); assert.equal(r.ficha.vida.temporaria, 0); assert.equal((f.vida as { atual: number }).atual, 20); assert.equal(r.ficha.vida.extra, 'preservar'); assert.deepEqual(r.ficha.extra, { campo: 27 });
});
test('imunidade vem antes de fraqueza e resistência e não pode converter dano em cura', () => {
  const r = dano(vida(), [{ tipo: 'fogo', valor: 8 }], { defesas: { imunidades: ['fogo'], fraquezas: [{ tipo: 'fogo', valor: 5 }], resistencias: [{ tipo: 'fogo', valor: 2 }] } }); assert.equal(r.total, 0); assert.equal(r.ficha.vida.atual, 20);
});
test('fraquezas e resistências usam maiores valores aplicáveis e ordem correta', () => {
  const r = dano(vida(), [{ tipo: 'cortante', valor: 3 }], { defesas: { fraquezas: [{ tipo: 'fisico', valor: 4 }, { tipo: 'cortante', valor: 5 }], resistencias: [{ tipo: 'todos', valor: 2 }, { tipo: 'cortante', valor: 6 }] } }); assert.equal(r.total, 2);
});
test('resistência a todo dano aplica uma vez para cada tipo, não uma vez no total', () => {
  const r = dano(vida(), [{ tipo: 'cortante', valor: 7 }, { tipo: 'fogo', valor: 4 }], { defesas: { resistencias: [{ tipo: 'todos', valor: 5 }] } }); assert.equal(r.total, 2);
});
test('parcelas de mesmo tipo de uma instância agregam antes de fraqueza/resistência', () => {
  const r = dano(vida(), [{ tipo: 'cortante', valor: 7 }, { tipo: 'cortante', valor: 4 }], { defesas: { resistencias: [{ tipo: 'cortante', valor: 5 }] } }); assert.equal(r.total, 6);
});
test('imunidade a críticos remove dobra e mantém benefício mortal separado', () => {
  const r = dano(vida(), roll('rapieira', { critico: true }).partesDano, { critico: true, defesas: { imunidades: ['acertos-criticos'] } }); assert.equal(r.total, 6);
  assert.equal(C.aplicarDano(vida(), [{ tipo: 'cortante', valor: 10 }], { critico: true, defesas: { imunidades: ['acertos-criticos'] } }).suportado, false);
});
test('resistência com exceção não é aplicada silenciosamente como resistência universal', () => { assert.equal(C.aplicarDano(vida(), [{ tipo: 'cortante', valor: 10 }], { defesas: { resistencias: [{ tipo: 'fisico', valor: 5, exceto: ['prata'] }] } }).suportado, false); });
test('defesas materiais e campos condicionais desconhecidos são explicitamente bloqueados', () => {
  for (const r of [{ tipo: 'prata', valor: 5 }, { tipo: 'cortante', valor: 5, magico: false }]) assert.equal(C.aplicarDano(vida(), [{ tipo: 'cortante', valor: 8 }], { defesas: { resistencias: [r] } }).suportado, false);
});
test('dano informado já líquido pelo mestre não reaplica resistência', () => {
  const r = dano(vida(), [{ tipo: 'sem-tipo', valor: 7 }], { danoFinal: true, defesas: { resistencias: [{ tipo: 'todos', valor: 5 }] } }); assert.equal(r.total, 7);
});
test('dano final do mestre pode ser aplicado sem interpretar defesas de texto livre', () => {
  const f = vida(); f.defesas = { resistencias: 'anotação antiga não estruturada' }; const r = dano(f, [{ tipo: 'sem-tipo', valor: 4 }], { danoFinal: true }); assert.equal(r.total, 4);
});
test('cura pelo vazio ignora dano de vazio sem converter dano em PV', () => {
  const r = dano(vida(8), [{ tipo: 'vazio', valor: 9 }], { defesas: { curaPeloVazio: true } }); assert.equal(r.total, 0); assert.equal(r.ficha.vida.atual, 8);
  assert.equal(cura(vida(8), 9, { tipoCura: 'vitalidade', defesas: { curaPeloVazio: true } }).recuperadoPV, 0);
});
test('cura limita nos PV máximos e não recupera temporários', () => {
  const r = cura(vida(17, 20, 2), 10); assert.equal(r.recuperadoPV, 3); assert.equal(r.ficha.vida.atual, 20); assert.equal(r.ficha.vida.temporaria, 2);
});
test('chegar a zero inclui ferido e crítico em morrendo, mantendo demais condições', () => {
  const p = vida(4); p.condicoes = [{ id: 'ferido', valor: 1, origem: 'anterior' }, { id: 'assustado', valor: 2 }];
  const r = dano(p, [{ tipo: 'cortante', valor: 4 }], { critico: true }); assert.equal(cvalor(r.ficha, 'morrendo'), 3); assert.equal(cvalor(r.ficha, 'inconsciente'), 1); assert.equal(cvalor(r.ficha, 'assustado'), 2); assert(!r.ficha.morto);
});
test('receber dano estabilizado a zero reinicia morrendo com ferido', () => {
  const p = vida(0); p.condicoes = [{ id: 'ferido', valor: 1 }]; assert.equal(cvalor(dano(p, [{ tipo: 'fogo', valor: 1 }]).ficha, 'morrendo'), 2);
});
test('cura tira morrendo/inconsciente, aumenta ferido e mantém prostrado', () => {
  const p = vida(0); p.condicoes = [{ id: 'morrendo', valor: 2 }, { id: 'inconsciente', valor: 1 }, { id: 'prostrado', valor: 1 }, { id: 'ferido', valor: 1 }];
  const r = cura(p, 3); assert.equal(cvalor(r.ficha, 'morrendo'), 0); assert.equal(cvalor(r.ficha, 'inconsciente'), 0); assert.equal(cvalor(r.ficha, 'ferido'), 2); assert.equal(cvalor(r.ficha, 'prostrado'), 1);
});
test('não letal a zero nocauteia sem atribuir morrendo', () => { const r = dano(vida(2), [{ tipo: 'contundente', valor: 3 }], { naoLetal: true }); assert.equal(cvalor(r.ficha, 'morrendo'), 0); assert.equal(cvalor(r.ficha, 'inconsciente'), 1); assert(!r.ficha.morto); });
test('dano massivo e condenado podem matar, e cura comum não ressuscita', () => {
  const r = dano(vida(), [{ tipo: 'fogo', valor: 40 }]); assert(r.ficha.morto); assert.equal(C.curar(r.ficha, 10).suportado, false);
  const p = vida(1); p.condicoes = [{ id: 'ferido', valor: 1 }, { id: 'condenado', valor: 2 }]; assert(dano(p, [{ tipo: 'fogo', valor: 1 }]).ficha.morto);
});
test('fórmulas de magia indexadas ficam bloqueadas e fórmula estruturada amplia sem adivinhar texto', () => {
  assert.equal(C.magiaEstruturada({ nome: 'Curar', somenteConsulta: true }, 1).suportado, false);
  const m = { efeitoCombate: { tipo: 'cura', ranqueBase: 1, formulaBase: '1d8+8', ampliacao: { intervalo: 1, formula: '1d8+8' } } };
  const p = C.magiaEstruturada(m, 3); assert.ok(p.suportado); const r = C.rolarMagia(p, {}, () => 0); assert.ok(r.suportado); assert.equal(r.cura, 27);
});
test('ampliação de magia lança dados novos independentes em cada ranque', () => {
  const p = C.magiaEstruturada({ efeitoCombate: { tipo: 'cura', ranqueBase: 1, formulaBase: '1d8+8', ampliacao: { intervalo: 1, formula: '1d8+8' } } }, 3); assert.ok(p.suportado);
  const valores = [0, 0.999, 0.5]; let chamadas = 0; const r = C.rolarMagia(p, {}, () => valores[chamadas++]); assert.ok(r.suportado);
  assert.equal(chamadas, 3); assert.equal(r.cura, 38); assert.deepEqual(r.rolagens.flatMap(d => d.resultados), [1, 8, 5]);
});
test('magia com salvamento básico reduz 1 à metade mantendo mínimo 1 ou dobra na falha crítica', () => {
  const p = C.magiaEstruturada({ efeitoCombate: { tipo: 'dano', tipoDano: 'fogo', ranqueBase: 1, formulaBase: '1d6', salvamentoBasico: true } }, 1); assert.ok(p.suportado);
  const a = C.rolarMagia(p, { grauSalvamento: 'sucesso' }, () => 0), b = C.rolarMagia(p, { grauSalvamento: 'falha-critica' }, () => 0), c = C.rolarMagia(p, { grauSalvamento: 'sucesso-critico' }, () => 0);
  assert.ok(a.suportado&&b.suportado&&c.suportado); assert.equal(a.total, 1); assert.equal(b.total, 2); assert.equal(c.total, 0);
});
test('declaração de iniciativa contém somente nome e resultado, sem campanha ou NPC', () => { assert.deepEqual(C.declaracaoIniciativa(' Personagem ', 19), { nome: 'Personagem', resultado: 19 }); assert.equal('suportado' in C.declaracaoIniciativa('', 19), true); });

test('Punho Poderoso usa o dado calculado da classe sem alterar catálogo', () => {
  const p = plano('punho', {}, { ...calculo(), facesDanoArma: 6 }); assert.equal(p.base.faces, 6); assert.equal(arma('punho').dano, '1d4');
});
test('armas reais suportadas mantêm fórmula da ficha; contextuais pendentes são bloqueadas explicitamente', () => {
  const gm = JSON.parse(readFileSync(new URL('../../../public/pathfinder/gm-core.json', import.meta.url), 'utf8'));
  const cat = { ...livro, equipamentos: [...livro.equipamentos, ...gm.equipamentos] };
  const f = R.criar(); f.classeId = 'guerreiro'; f.ancestralidadeId = 'humano'; f.atributosBase = {for:4,des:3,con:2,int:0,sab:1,car:0};
  for (const w of armas) { f.armaId = w.id; const c = R.calcular(f,cat), p = C.danoArma(w,c); if ((w.tracos as string[]).some(t=>['energica','gemea','justa'].includes(t))) { assert(!p.suportado); continue; } assert.ok(p.suportado); assert.equal(p.formula,c.danoArma,String(w.nome)); }
});
test('escolha explícita de uma mão desfaz duas mãos calculadas sem perder dado de classe', () => {
  assert.equal(plano('cajado', { maos: 1 }, { ...calculo(), facesDanoArma: 8 }).base.faces, 4);
  assert.equal(plano('cajado', { maos: 2 }, { ...calculo(), facesDanoArma: 4 }).base.faces, 8);
});
test('fúria dracônica separa energia e dano físico antes das resistências e dobra ambas no crítico', () => {
  const p = plano('espada-longa', { critico: true }, { ...calculo(), bonusDanoArma: 2, danoExtraFuria: { tipo: 'fogo', valor: 8 } });
  const r = C.rolarDano(p, () => 0); assert.ok(r.suportado); assert.deepEqual(r.partesDano, [{tipo:'cortante',valor:14,valorSemDobra:7},{tipo:'fogo',valor:16,valorSemDobra:8}]);
  const d = dano(vida(50,50), r.partesDano, {defesas:{resistencias:[{tipo:'cortante',valor:5},{tipo:'fogo',valor:10}]}}); assert.equal(d.total, 15);
});
test('magia de ataque duplica dano crítico; magia de cura ou salvamento não aceita flag crítico', () => {
  const p = C.magiaEstruturada({tracos:['ataque'],efeitoCombate:{tipo:'dano',tipoDano:'frio',ranqueBase:1,formulaBase:'2d6'}},1); assert.ok(p.suportado);
  const r=C.rolarMagia(p,{critico:true},()=>0); assert.ok(r.suportado); assert.equal(r.total,4); assert.equal(r.partesDano[0].valorSemDobra,2);
  const h=C.magiaEstruturada({efeitoCombate:{tipo:'cura',ranqueBase:1,formulaBase:'1d8'}},1); assert.ok(h.suportado); assert.equal(C.rolarMagia(h,{critico:true}).suportado,false);
});
test('componentes de magia mantêm tipos e salvamento antes de resistências com snapshot imutável', () => {
  const p=C.magiaEstruturada({efeitoCombate:{tipo:'dano',ranqueBase:1,salvamentoBasico:true,componentes:[{tipoDano:'fogo',formulaBase:'2d6'},{tipoDano:'cortante',formulaBase:'3d6'}]}},1); assert.ok(p.suportado);
  const r=C.rolarMagia(p,{grauSalvamento:'sucesso'},()=>0); assert.ok(r.suportado); assert.equal(r.total,2);
  const f=vida(); const d=dano(f,r.partesDano,{defesas:{resistencias:[{tipo:'fogo',valor:2}]}}); assert.equal(d.total,1); assert.equal((f.vida as {atual:number}).atual,20);
  const c=C.rolarMagia(p,{grauSalvamento:'falha-critica'},()=>0); assert.ok(c.suportado); assert.equal(c.total,10);
});
test('componentes do mesmo tipo são agregados antes de arredondar o salvamento', () => {
  const p=C.magiaEstruturada({efeitoCombate:{tipo:'dano',ranqueBase:1,salvamentoBasico:true,componentes:[{tipoDano:'fogo',formulaBase:'1'},{tipoDano:'fogo',formulaBase:'2'}]}},1); assert.ok(p.suportado);
  const r=C.rolarMagia(p,{grauSalvamento:'sucesso'}); assert.ok(r.suportado); assert.equal(r.total,1); assert.equal(r.partesDano.length,1);
});
test('graus de testes usam margem 10 e natural 1/20, inclusive recuperação de morrendo',()=>{
  for (const [total,natural,cd,grau] of [[20,10,20,'sucesso'],[30,10,20,'sucesso-critico'],[10,10,20,'falha-critica'],[20,20,30,'falha'],[21,1,20,'falha']] as const) { const r=C.grauTeste(total,natural,cd); assert.ok(r.suportado); assert.equal(r.grau,grau); }
});
function iniciar(f:Record<string,unknown>,o={},rng=()=>0.5){const r=C.iniciarTurno(f,o,rng);assert.ok(r.suportado,!r.suportado?r.motivo:'');return r;}
function finalizar(f:Record<string,unknown>,o={},rng=()=>0.5){const r=C.finalizarTurno(f,o,rng);assert.ok(r.suportado,!r.suportado?r.motivo:'');return r;}
test('começo de turno recupera três ações, uma reação e preserva dados desconhecidos',()=>{
  const f=vida();f.turno={origem:'preservar'};const r=iniciar(f);assert.equal(r.turno.acoesGerais,3);assert.equal(r.turno.reacoes,1);assert.equal(r.turno.ataquesRealizados,0);assert.equal((r.ficha.turno as {origem:string}).origem,'preservar');assert.equal(f.turno && 'acoesGerais' in (f.turno as object),false);
});
test('atordoado 4 consome três ações agora e uma no próximo turno',()=>{
  const f=vida();f.condicoes=[{id:'atordoado',valor:4,fonte:'monstro'}];const a=iniciar(f);assert.equal(a.turno.acoesGerais,0);assert.equal(cvalor(a.ficha,'atordoado'),1);assert(!a.turno.podeAgir);
  const b=iniciar(a.ficha);assert.equal(b.turno.acoesGerais,2);assert.equal(cvalor(b.ficha,'atordoado'),0);assert(b.turno.podeAgir);
});
test('atordoado sobrepõe desacelerado sem subtrair ambos integralmente',()=>{
  const f=vida();f.condicoes=[{id:'atordoado',valor:1},{id:'desacelerado',valor:2}];const r=iniciar(f);assert.equal(r.turno.acoesGerais,1);assert.equal(cvalor(r.ficha,'desacelerado'),2);
});
test('acelerado oferece só uma ação e permite perder a restrita primeiro para desacelerado',()=>{
  const f=vida();f.condicoes=[{id:'acelerado',acoesPermitidas:['andar','golpear']},{id:'acelerado',acoesPermitidas:['escalar']},{id:'desacelerado',valor:1}];
  const r=iniciar(f);assert.equal(r.turno.acoesGerais,3);assert.equal(r.turno.acaoAcelerada,0);assert.deepEqual(r.turno.restricoesAcelerada,['andar','golpear','escalar']);
  const b=iniciar(f,{preservarAcelerada:true});assert.equal(b.turno.acoesGerais,2);assert.equal(b.turno.acaoAcelerada,1);
});
test('restrições da ação acelerada e atordoamento por duração não são inventadas',()=>{
  const f=vida();f.condicoes=['acelerado'];const r=iniciar(f);assert.equal(r.turno.acaoAcelerada,1);assert(r.turno.precisaDefinirRestricoes);
  f.condicoes=[{id:'atordoado',duracao:'1 minuto'}];assert.equal(C.iniciarTurno(f).suportado,false);
});
test('inconsciente recupera ações mas não pode usá-las; morto não recupera ações',()=>{
  const f=vida();f.condicoes=['inconsciente'];const r=iniciar(f);assert.equal(r.turno.acoesGerais,3);assert(!r.turno.podeAgir);assert.equal(r.turno.reacoes,0);
  f.morto=true;assert.equal(iniciar(f).turno.acoesGerais,0);
});
test('recuperação de morrendo tem CD10+valor, sucesso crítico estabiliza e aumenta ferido',()=>{
  const f=vida(0);f.condicoes=[{id:'morrendo',valor:2},{id:'inconsciente',valor:1}];const r=iniciar(f,{},()=>0.999);assert.equal(r.recuperacao?.cd,12);assert.equal(r.recuperacao?.grau,'sucesso-critico');assert.equal(cvalor(r.ficha,'morrendo'),0);assert.equal(cvalor(r.ficha,'ferido'),1);assert(!r.turno.podeAgir);assert.equal(r.ficha.vida.atual,0);
});
test('falha crítica em recuperação e condenado aplicam morte sem recuperação adicional',()=>{
  const f=vida(0);f.condicoes=[{id:'morrendo',valor:2},{id:'condenado',valor:1}];const r=iniciar(f,{},()=>0);assert(r.ficha.morto);assert.equal(r.turno.acoesGerais,0);assert.equal(cvalor(r.ficha,'condenado'),0);
});
test('fim de turno reduz cada instância de assustado preservando duração e pisos verificados',()=>{
  const f=vida();f.condicoes=[{id:'assustado',valor:3,fonte:'A',duracaoRodadas:4},{id:'assustado',valor:1,fonte:'B'},{id:'amedrontado',valor:2,minimo:2},{id:'assustado',valor:2,reduzirAutomaticamente:false}];const r=finalizar(f);assert.equal((r.ficha.condicoes as Array<{valor:number}>).length,3);assert.equal((r.ficha.condicoes as Array<{valor:number}>)[0].valor,2);assert.equal((r.ficha.condicoes as Array<{duracaoRodadas:number}>)[0].duracaoRodadas,4);assert.equal((f.condicoes as Array<{valor:number}>)[0].valor,3);
});
test('persistentes de tipos distintos aplicam juntos e aumentam morrendo só uma vez',()=>{
  const f=vida(0);f.condicoes=[{id:'morrendo',valor:1},{id:'inconsciente',valor:1}];f.danosPersistentes=[{id:'chama',tipo:'fogo',formula:'1d6'},{id:'acido',tipo:'acido',formula:'1d4'}];const r=finalizar(f,{},()=>0);assert.equal(r.dano?.total,2);assert.equal(cvalor(r.ficha,'morrendo'),2);assert.equal(r.danosPersistentes.length,2);assert.deepEqual(r.snapshotAntes,f);
});
test('persistente usa resistência no fim, só então faz teste simples CD15 e remove ao sucesso',()=>{
  const f=vida();f.danosPersistentes=[{id:'chama',tipo:'fogo',formula:'2d6'}];const nums=[0,0,0.7];let idx=0;const r=finalizar(f,{defesas:{resistencias:[{tipo:'fogo',valor:1}]}},()=>nums[idx++]);assert.equal(r.ficha.vida.atual,19);assert.equal(r.danosPersistentes[0].recuperacao.total,15);assert.equal(r.danosPersistentes[0].recuperacao.cd,15);assert.deepEqual(r.ficha.danosPersistentes,[]);assert.equal((f.danosPersistentes as unknown[]).length,1);
});
test('persistente continua quando falha recuperação, roda dados novos e respeita multiplicador crítico',()=>{
  const f=vida();f.danosPersistentes=[{id:'chama',tipo:'fogo',formula:'1d6',multiplicador:2}];const r=finalizar(f,{},()=>0);assert.equal(r.dano?.total,2);assert.equal((r.ficha.danosPersistentes as unknown[]).length,1);const b=finalizar(r.ficha,{},()=>0.5);assert.equal(b.dano?.total,8);
});
test('duplicatas idênticas de persistente não empilham; fórmulas diferentes bloqueiam sem alterar ficha',()=>{
  const f=vida();f.danosPersistentes=[{id:'A',tipo:'fogo',formula:'1d6'},{id:'B',tipo:'fogo',formula:'1d6'}];assert.equal(finalizar(f,{},()=>0).dano?.total,1);
  f.danosPersistentes=[{id:'A',tipo:'fogo',formula:'2'},{id:'B',tipo:'fogo',formula:'1d4'}];const r=C.finalizarTurno(f);assert(!r.suportado);assert.deepEqual(r.ficha,f);assert.equal((f.vida as {atual:number}).atual,20);
});
test('dano em inconsciente com PV desperta mas preserva regra especial que bloqueia despertar',()=>{
  const f=vida();f.condicoes=[{id:'inconsciente',valor:1}];assert.equal(cvalor(dano(f,[{tipo:'fogo',valor:1}]).ficha,'inconsciente'),0);f.despertarComDano=false;assert.equal(cvalor(dano(f,[{tipo:'fogo',valor:1}]).ficha,'inconsciente'),1);
});
test('dano de precisão dobra no crítico e compartilha tipo físico para resistência sem empilhar redução',()=>{
  const p=plano('rapieira',{critico:true},{...calculo(),danosExtras:[{nome:'Ataque furtivo',expressao:'2d6',tipo:'precisao'}]});const r=C.rolarDano(p,()=>0);assert.ok(r.suportado);assert.equal(r.total,15);assert.equal(r.partesDano[1].precisao,true);assert.equal(r.partesDano[1].tipo,'perfurante');assert.equal(dano(vida(),r.partesDano,{defesas:{resistencias:[{tipo:'perfurante',valor:5}]}}).total,10);
});
test('imunidade a precisão remove só dados de precisão, inclusive quando também imune a críticos',()=>{
  const p=plano('rapieira',{critico:true},{...calculo(),danosExtras:[{nome:'Ataque furtivo',expressao:'2d6',tipo:'precisao'}]});const r=C.rolarDano(p,()=>0);assert.ok(r.suportado);
  assert.equal(dano(vida(),r.partesDano,{critico:true,defesas:{imunidades:['precisao']}}).total,11);
  assert.equal(dano(vida(),r.partesDano,{critico:true,defesas:{imunidades:['precisao','acertos-criticos']}}).total,6);
});
test('incapacitado encerra Fúria sem apagar outros estados ou PV temporários de outra fonte',()=>{
  const f=vida(2);f.estados={furia:true,escudo:true};f.vida={atual:2,maxima:20,temporaria:0,fonteTemporaria:'furia'};const r=dano(f,[{tipo:'fogo',valor:2}]);assert.equal((r.ficha.estados as {furia:boolean}).furia,false);assert.equal((r.ficha.estados as {escudo:boolean}).escudo,true);
  const s=vida(10,20,5);s.condicoes=['inconsciente'];s.estados={furia:true};s.vida={atual:10,maxima:20,temporaria:5,fonteTemporaria:'magia'};assert.equal(iniciar(s).ficha.vida.temporaria,5);
});
test('novo turno limpa encerrado anterior sem apagar estado adicional',()=>{
  const f=vida();f.turno={encerrado:true,extra:'preservar'};const r=iniciar(f);assert.equal(r.turno.encerrado,false);assert.equal((r.ficha.turno as {extra:string}).extra,'preservar');
});
test('Estupefato interrompe conjuração por teste simples CD5+valor sem aplicar bônus ou penalidades de estado',()=>{
  const f=vida();f.condicoes=[{id:'estupefato',valor:2},{id:'assustado',valor:3}];const nums=[0.3,0.25];let i=0;const a=C.verificarConjuracao(f,()=>nums[i++]),b=C.verificarConjuracao(f,()=>nums[i++]);assert.equal(a.teste?.total,7);assert.equal(a.teste?.cd,7);assert(!a.interrompida);assert(b.interrompida);assert.equal(C.verificarConjuracao(vida()).teste,null);
});
test('Enjoado impede ingestão sem exigir que jogador calcule penalidades de poção',()=>{
  const f=vida();f.condicoes=[{id:'enjoado',valor:1}];assert(!C.podeIngerir(f).permitido);assert(C.podeIngerir(vida()).permitido);
});

test('Simplicidade Mortal preserva passo adicional ao escolher uma ou duas mãos no cajado de Nethys',()=>{
  const o=JSON.parse(readFileSync(new URL('../../../docs/pathfinder/player-core-1/divindades-dominios-iniciais.json',import.meta.url),'utf8'));
  const cat=JSON.parse(JSON.stringify(livro));cat.divindades=o.divindades;cat.dominios=o.dominios;
  for(const t of o.talentos){const a=cat.talentos.find((x:{id:string})=>x.id===t.id);if(a)Object.assign(a,t);}
  for(const p of o.patchesClasses){const cl=cat.classes.find((x:{id:string})=>x.id===p.classeId),target=p.opcaoId?cl.opcoes.find((x:{id:string})=>x.id===p.opcaoId):cl;for(const [key,value]of Object.entries(p))if(!['classeId','opcaoId'].includes(key))target[key]=value;}
  const f=R.criar();f.classeId='clerigo';f.opcaoClasseId='capelao-guerra';f.armaId='cajado';f.escolhasClasse={divindade:'nethys',fonteDivina:'curar',santificacao:'nenhuma'};
  const n=R.normalizar(f,cat),c=R.calcular(n,cat);assert.deepEqual(c.facesDanoArmaPorMaos,{1:6,2:10});
  assert.equal(C.danoArma(c.equipamento.arma,c,{maos:1}).suportado,true);const um=C.danoArma(c.equipamento.arma,c,{maos:1}),dois=C.danoArma(c.equipamento.arma,c,{maos:2});assert.ok(um.suportado&&dois.suportado);assert.equal(um.base.faces,6);assert.equal(dois.base.faces,10);
});
const escudos=livro.equipamentos.filter((e:Record<string,unknown>)=>e.tipo==='escudo') as Array<Record<string,unknown>>;
function escudoBase(id='escudo-de-aco'){const e=escudos.find(s=>s.id===id);assert.ok(e);const f=vida();f.escudoId=id;f.escudoErguido=true;f.escudoPv=e.pv;f.turno={reacoes:1,origem:'preservar'};return {f,c:{bloqueioEscudo:true,equipamento:{escudo:e},defesas:{}},e};}
function bloquear(f:Record<string,unknown>,c:Record<string,unknown>,valor:number,o={}){const r=C.bloqueioEscudo(f,c,[{tipo:'cortante',valor}],{ataque:true,...o});assert.ok(r.suportado,!r.suportado?r.motivo:'');return r;}
for(const e of escudos)test(`escudo real PC1 ${e.nome}: Dureza reduz uma vez e sobra integral atinge ambos`,()=>{
  const {f,c}=escudoBase(String(e.id));const r=bloquear(f,c,Number(e.dureza)+2);assert.equal(r.reducaoDureza,e.dureza);assert.equal(r.danoPersonagem,2);assert.equal(r.danoEscudo,2);assert.equal(r.ficha.vida.atual,18);assert.equal(r.ficha.escudoPv,Number(e.pv)-2);assert.equal((r.ficha.turno as {reacoes:number}).reacoes,0);assert.equal((f.vida as {atual:number}).atual,20);assert.equal(f.escudoPv,e.pv);assert.deepEqual(r.snapshotAntes,f);
});
test('Bloqueio em aço usa fonte real dureza5/PV20/LQ10: 15 dano deixa escudo10 quebrado e derruba bônus CA',()=>{
  const {f,c}=escudoBase();const r=bloquear(f,c,15);assert.equal(r.danoPersonagem,10);assert.equal(r.escudo.pvDepois,10);assert(r.escudo.quebrado);assert(!r.escudo.destruido);assert.equal(r.ficha.escudoErguido,false);assert.equal(r.ficha.escudoCobertura,false);assert.equal(C.bloqueioEscudo(r.ficha,c,[{tipo:'cortante',valor:1}],{ataque:true}).suportado,false);
});
test('Bloqueio pode destruir escudo e não divide dano residual pela metade',()=>{
  const {f,c}=escudoBase();const r=bloquear(f,c,25);assert.equal(r.danoPersonagem,20);assert.equal(r.danoEscudo,20);assert(r.escudo.destruido);assert.equal(r.ficha.vida.atual,0);assert.equal(cvalor(r.ficha,'morrendo'),1);assert.equal(r.ficha.escudoPv,0);
});
test('Bloqueio computa fraqueza/resistência antes de Dureza uma vez e absorve temporários só depois',()=>{
  const {f,c}=escudoBase();f.vida={atual:20,maxima:20,temporaria:3};const r=bloquear(f,c,14,{defesas:{fraquezas:[{tipo:'cortante',valor:1}],resistencias:[{tipo:'cortante',valor:3}]}});assert.equal(r.defesasAplicadas[0].final,12);assert.equal(r.danoPersonagem,7);assert.equal(r.ficha.vida.atual,16);assert.equal(r.ficha.vida.temporaria,0);assert.equal(r.escudo.pvDepois,13);
});
test('valor líquido do mestre não reaplica resistência no bloqueio',()=>{
  const {f,c}=escudoBase();const r=bloquear(f,c,9,{danoFinal:true,defesas:{resistencias:[{tipo:'cortante',valor:5}]}});assert.equal(r.danoPersonagem,4);assert.equal(r.escudo.pvDepois,16);
});
test('escudo pode absorver tudo sem sofrer dano, mas usa reação; defesas que zeram tudo não acionam',()=>{
  const {f,c}=escudoBase();const r=bloquear(f,c,3);assert.equal(r.danoPersonagem,0);assert.equal(r.escudo.pvDepois,20);assert.equal((r.ficha.turno as {reacoes:number}).reacoes,0);
  const a=C.bloqueioEscudo(f,c,[{tipo:'cortante',valor:3}],{ataque:true,defesas:{imunidades:['cortante']}});assert(!a.suportado);assert.deepEqual(a.ficha,f);
});
test('Bloqueio rejeita escudo baixo, origem não ataque, sem fonte, referência, sem reação e incapacitado',()=>{
  const {f,c}=escudoBase();for(const altered of [{...f,escudoErguido:false},{...f,turno:{reacoes:0}},{...f,turno:{}},{...f,condicoes:['inconsciente']},{...f,escudoQuebrado:true},{...f,escudoPv:0}]){const r=C.bloqueioEscudo(altered,c,[{tipo:'perfurante',valor:4}],{ataque:true});assert(!r.suportado);assert.deepEqual(r.ficha,altered);}
  assert.equal(C.bloqueioEscudo(f,c,[{tipo:'perfurante',valor:4}],{ataque:false}).suportado,false);assert.equal(C.bloqueioEscudo(f,{...c,bloqueioEscudo:false},[{tipo:'perfurante',valor:4}],{ataque:true}).suportado,false);assert.equal(C.bloqueioEscudo(f,{...c,escudoCalculado:{...c.equipamento.escudo,somenteConsulta:true}},[{tipo:'perfurante',valor:4}],{ataque:true}).suportado,false);
});
test('reação pode bloquear fora do turno encerrado; tipos não físicos ou misturados não são inventados',()=>{
  const {f,c}=escudoBase();f.turno={reacoes:1,encerrado:true,podeAgir:false};assert.equal(bloquear(f,c,6).danoPersonagem,1);assert.equal(C.bloqueioEscudo(f,c,[{tipo:'fogo',valor:6}],{ataque:true}).suportado,false);assert.equal(C.bloqueioEscudo(f,c,[{tipo:'cortante',valor:6},{tipo:'fogo',valor:6}],{ataque:true}).suportado,false);
});
