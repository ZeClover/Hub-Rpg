import test from 'node:test';
import assert from 'node:assert/strict';
import {novaFicha,calcularFicha,prepararFichaWandsWizards,pendenciasFicha} from '../../../public/wands-wizards/ficha-regras.mjs';
import {converterRecurso,registrarDescanso,recursosDaFicha,registrarMagia,recuperarArcana,moedas} from '../../../public/wands-wizards/recursos-regras.mjs';

test('talento inicial e aprimoramento por talento recalculam atributos sem acumular dois tipos',()=>{
 const d=novaFicha();d.talentoCasa={id:'sangue-gigante'};assert.equal(calcularFicha(d).atributos.forca,11);
 d.nivel=4;d.aumentos=[{nivel:4,talento:{id:'observador',atributo:'inteligencia'}}];const c=calcularFicha(d);assert.equal(c.atributos.inteligencia,11);assert.equal(c.percepcaoPassiva,15);
 d.aumentos=[{nivel:4,talento:{id:'observador',atributo:'inteligencia'},atributos:{forca:2}}];assert.throws(()=>calcularFicha(d),/sem combinar/);
 d.aumentos=[{nivel:4,talento:{id:'ofidioglossia'}}];assert.throws(()=>calcularFicha(d),/inatos/);
});
test('Intelecto recebe somente os dois benefícios iniciais, não todos os níveis da escola',()=>{
 const d=novaFicha();d.estilo='intelecto';d.escola='maldicoes';d.nivel=3;const c=calcularFicha(d);assert.deepEqual(c.beneficiosAtivos.sort(),['auror','quebrador']);assert.equal(c.periciasEscolaLimite,2);
 d.beneficiosEscola={6:'magia-forca'};assert.throws(()=>calcularFicha(d),/nível disponível/);
});
test('pré-requisitos de escolas e bônus de mira e iniciativa são calculados',()=>{
 const d=novaFicha();d.nivel=10;d.escola='maldicoes';d.beneficiosEscola={1:'auror',6:'magia-forca',10:'rompe-protecao'};assert.throws(()=>calcularFicha(d),/exige/);
 d.beneficiosEscola={1:'quebrador',6:'magia-forca',10:'rompe-protecao'};assert.ok(calcularFicha(d).beneficiosAtivos.includes('rompe-protecao'));
 d.escola='encantamentos';d.beneficiosEscola={1:'mira',6:'mira-avancada'};d.base={forca:8,destreza:15,constituicao:13,inteligencia:12,sabedoria:10,carisma:14};assert.equal(calcularFicha(d).ataqueMagico,8);
 d.escola='adivinhacao';d.beneficiosEscola={1:'perigo'};assert.equal(calcularFicha(d).iniciativa,5);
});
test('magias concedidas não ocupam cota e não podem ser falsificadas',()=>{
 const d=novaFicha();d.escola='cura';d.magias=['accio','capto','alohomora','lumos-nox','protego','episkey','arresto-momentum'];const result=prepararFichaWandsWizards({},d);assert.equal(result.erro,undefined);assert.ok(result.dados!.magias.includes('anapneo'));
 d.magias.push('legilimens');assert.match(prepararFichaWandsWizards({},d).erro!,/seleção regular/);
});
test('perícias repetidas concedem substituição, talentos e especialização não somam proficiência duas vezes',()=>{
 const d=novaFicha();d.antecedente='protetor';d.periciasClasse=['atletismo','sobrevivencia'];d.substituicoesPericias=['percepcao'];let c=calcularFicha(d);assert.equal(c.substituicoesLimite,1);assert.equal(c.pericias.percepcao.bonus,2);
 d.substituicoesPericias=['atletismo'];assert.throws(()=>calcularFicha(d),/Substituições/);
 d.substituicoesPericias=['percepcao'];d.nivel=10;d.escola='magizoologia';d.beneficiosEscola={1:'folio',6:'companheiro',10:'sobrevivente'};d.sobrevivente={pericia:'herbologia',especializacao:'sobrevivencia'};c=calcularFicha(d);assert.equal(c.pericias.sobrevivencia.bonus,8);
});
test('capa escolhe fórmula de CA e não soma armadura com resiliência',()=>{
 const d=novaFicha();d.estilo='tecnica';d.base.destreza=15;d.capa='inverno';assert.equal(calcularFicha(d).ca,13);d.capa='desilusao';assert.equal(calcularFicha(d).ca,17);d.estilo='vontade';d.capa='inverno';assert.equal(calcularFicha(d).ca,16);
});
test('equipamento e saldo iniciais são entregues uma única vez, inclusive após consumo e recarga',()=>{
 const d=novaFicha();d.pacoteInicial='padrao';d.antecedente='sonhador';const a=prepararFichaWandsWizards({},d);assert.equal(a.erro,undefined);assert.equal(a.dados!.dinheiroKnuts,435);const count=a.dados!.inventario.length;
 a.dados!.inventario[0].quantidade=0;const b=prepararFichaWandsWizards(a.dados,a.dados);assert.equal(b.erro,undefined);assert.equal(b.dados!.inventario.length,count);assert.equal(b.dados!.inventario[0].quantidade,0);assert.equal(b.dados!.dinheiroKnuts,435);assert.deepEqual(moedas(986),{galeoes:2,sicles:0,nuques:0});
});
test('Fonte de Magia conserva custos, limita pontos e permite converter círculos altos',()=>{
 const d=novaFicha();d.nivel=7;const c=calcularFicha(d);const extra=converterRecurso(d,c,3,'criar');assert.equal(extra.pontosUsados,5);assert.equal(recursosDaFicha(extra,c).espacos[2].total,4);assert.throws(()=>converterRecurso(extra,c,3,'criar'),/insuficientes/);const converted=converterRecurso(extra,c,3,'converter');assert.equal(converted.pontosUsados,2);assert.equal(converted.espacosUsadosPorCirculo[3],1);
 const adult=novaFicha();adult.nivel=20;adult.pontosUsados=9;const high=converterRecurso(adult,calcularFicha(adult),9,'converter');assert.equal(high.pontosUsados,0);assert.equal(high.espacosUsadosPorCirculo[9],1);assert.throws(()=>converterRecurso(adult,calcularFicha(adult),9,'criar'),/1º a 5º/);
});
test('descansos recuperam exatamente recursos e dados de vida, sem rolar dados',()=>{
 const d=novaFicha();d.nivel=6;d.escola='transfiguracao';d.beneficiosEscola={1:'anatomia',6:'animago'};d.usosHabilidades={animago:2};d.dadosVidaUsados=5;d.vida={atual:1};d.espacosUsados=2;d.pontosUsados=3;d.espacosCriados={1:1};const c=calcularFicha(d);
 const short=registrarDescanso(d,c,'curto',{dadosVida:1,cura:9});assert.equal(short.vida.atual,10);assert.equal(short.dadosVidaUsados,6);assert.deepEqual(short.usosHabilidades,{});assert.equal(short.espacosUsados,2);
 const long=registrarDescanso(short,c,'longo');assert.equal(long.dadosVidaUsados,3);assert.equal(long.vida.atual,c.pvMaximos);assert.deepEqual(long.espacosCriados,{});assert.equal(long.pontosUsados,0);
});
test('rituais, concentração, gastos e assinaturas mantêm cotas e falham sem efeitos parciais',()=>{
 const d=novaFicha();d.estilo='intelecto';d.magias=['lumos-nox','accio','protego'];const c=calcularFicha(d);const cast=registrarMagia(d,c,'protego',1);assert.equal(cast.espacosUsados,1);assert.deepEqual(cast.concentracoes,['protego']);assert.equal(d.concentracoes,undefined);assert.throws(()=>registrarMagia(d,c,'accio',0,{ritual:true}),/ritual/);
 const high=novaFicha();high.nivel=20;high.magias=['ignis-laqueis'];high.assinaturas=['ignis-laqueis'];const h=calcularFicha(high),first=registrarMagia(high,h,'ignis-laqueis',3,{assinatura:true});assert.equal(first.usosAssinaturas['ignis-laqueis'],1);assert.equal(first.espacosUsadosPorCirculo,undefined);assert.throws(()=>registrarMagia(first,h,'ignis-laqueis',3,{assinatura:true}),/indisponível/);assert.deepEqual(registrarDescanso(first,h,'curto').usosAssinaturas,{});
});
test('Recuperação Arcana valida soma e nunca aceita círculos de sexto ou superior',()=>{
 const d=novaFicha();d.nivel=20;d.estilo='intelecto';d.espacosUsadosPorCirculo={3:2,4:1};const c=calcularFicha(d);const n=recuperarArcana(d,c,{3:2,4:1});assert.equal(n.espacosUsadosPorCirculo[3],0);assert.throws(()=>recuperarArcana(d,c,{6:1}),/inválidos/);
});
test('criação deixa de ser rascunho somente com as escolhas efetivamente completas',()=>{
 const d=novaFicha();d.base={forca:8,destreza:14,constituicao:13,inteligencia:12,sabedoria:10,carisma:15};d.talentoCasa={id:'magia-sem-varinha'};d.antecedente='estudioso';d.periciasClasse=['enganacao','persuasao'];d.beneficiosEscola={1:'mira'};d.pacoteInicial='padrao';d.varinha={madeira:'Carvalho',nucleo:'Fênix',comprimento:'12 polegadas',flexibilidade:'Flexível'};d.magias=['accio','capto','alohomora','lumos-nox','protego','episkey','arresto-momentum'];assert.deepEqual(pendenciasFicha(d),[]);assert.equal(prepararFichaWandsWizards({},d).dados!.criacaoFinalizada,true);d.magias=[];assert.equal(prepararFichaWandsWizards({},d).dados!.criacaoFinalizada,false);
});

test('metamagias de Vontade são gratuitas na cota, mas cobram os pontos corretos',()=>{
 const d=novaFicha();d.nivel=5;d.magias=['protego'];const c=calcularFicha(d);assert.deepEqual(c.metamagiasConcedidas,['feroz','resistente']);
 const used=registrarMagia(d,c,'protego',1,{metamagia:'feroz',incremento:2});assert.equal(used.pontosUsados,4);assert.equal(used.espacosUsados,1);assert.throws(()=>registrarMagia(d,c,'protego',2,{metamagia:'feroz',incremento:2}),/excede/);
 d.metamagias=['feroz','resistente','cuidadosa','sutil'];assert.equal(prepararFichaWandsWizards({...d,nivel:5},d).erro,undefined);
});
test('truques com escalonamento explícito podem usar espaços e outros continuam gratuitos',()=>{
 const d=novaFicha();d.magias=['accio'];const c=calcularFicha(d);assert.equal(registrarMagia(d,c,'accio',1).espacosUsados,1);assert.equal(registrarMagia(d,c,'accio',0).espacosUsados,0);
});
test('receitas obedecem à raridade e o benefício de Remédios é concedido automaticamente',async()=>{
 const {receitasDaFicha}=await import('../../../public/wands-wizards/especiais-regras.mjs');const d=novaFicha();d.antecedente='pocionista';d.escola='cura';d.beneficiosEscola={1:'remedios'};d.receitasIniciais={pocionista:['star-grass-salve','aging-potion']};assert.deepEqual(receitasDaFicha(d,calcularFicha(d)),['star-grass-salve','aging-potion']);d.receitasIniciais={pocionista:['aging-potion']};assert.throws(()=>receitasDaFicha(d,calcularFicha(d)),/raridade/);
});
test('formas animagas usam o bloco específico e preservam atributos mentais',async()=>{
 const {formaAnimaga}=await import('../../../public/wands-wizards/especiais-regras.mjs');const d=novaFicha();d.nivel=6;d.escola='transfiguracao';d.beneficiosEscola={1:'anatomia',6:'animago'};d.animago={animal:'Gato',tipo:'evasao',meio:'terra',tamanho:'minusculo'};const c=calcularFicha(d),f=formaAnimaga(d,c)!;assert.equal(f.ca,13);assert.equal(f.pvMaximos,15);assert.equal(f.atributos.inteligencia,c.atributos.inteligencia);assert.equal(f.atributos.destreza,16);assert.equal(f.duracaoHoras,3);d.animago={animal:'Águia',tipo:'combate',meio:'ar',tamanho:'medio'};assert.throws(()=>formaAnimaga(d,c),/inválida/);
});
test('companheiro cresce com o nível e concede dados de comando que descansos recuperam',async()=>{
 const {companheiroDaFicha}=await import('../../../public/wands-wizards/especiais-regras.mjs');const d=novaFicha();d.nivel=14;d.escola='magizoologia';d.beneficiosEscola={1:'folio',6:'companheiro'};d.companheiro={nome:'Fera conferida',tamanho:'medio',desafio:0.25,caBase:12,pvBase:11,atributos:{forca:12,destreza:15,constituicao:12,inteligencia:3,sabedoria:12,carisma:6},pericias:['percepcao','furtividade'],salvaguardas:['destreza','constituicao'],comandos:['atacar','abaixar','buscar']};const c=calcularFicha(d),a=companheiroDaFicha(d,c)!;assert.equal(a.ca,17);assert.equal(a.pvMaximos,81);assert.equal(a.dadosComando,7);assert.equal(a.tipoDado,'d8');d.usosHabilidades={'comando-companheiro':3};assert.equal(recursosDaFicha(d,c).habilidades.find(f=>f.id==='comando-companheiro')!.disponiveis,4);assert.deepEqual(registrarDescanso(d,c,'longo').usosHabilidades,{});
});
test('magias das trevas exigem corrupção para aprender e são mantidas depois de remover pontos',()=>{
 const d=novaFicha();d.nivel=9;d.aumentos=[{nivel:4,atributos:{inteligencia:2}},{nivel:8,atributos:{inteligencia:2}}];d.magias=['transmogrify'];const anterior={...d,magias:[]};assert.match(prepararFichaWandsWizards(anterior,d).erro!,/seleção regular/);d.corrupcao={pontos:2};const ready=prepararFichaWandsWizards(anterior,d);assert.equal(ready.erro,undefined);const n={...ready.dados!,corrupcao:{pontos:0}};assert.equal(prepararFichaWandsWizards(ready.dados,n).erro,undefined);
});

test('animago registra dois usos, preserva PV humanos e transfere automaticamente o dano excedente',async()=>{
 const {assumirFormaAnimaga,danoFormaAnimaga}=await import('../../../public/wands-wizards/especiais-regras.mjs');const d=novaFicha();d.nivel=6;d.escola='transfiguracao';d.beneficiosEscola={1:'anatomia',6:'animago'};d.animago={animal:'Gato',tipo:'evasao',meio:'terra',tamanho:'minusculo'};d.vida={atual:20};const c=calcularFicha(d),animal=assumirFormaAnimaga(d,c);assert.equal(animal.usosHabilidades.animago,1);assert.equal(animal.animagoEstado.pv,15);assert.equal(animal.vida.atual,20);assert.throws(()=>registrarMagia(animal,c,'protego',1),/Não pode conjurar/);const reverted=danoFormaAnimaga(animal,c,19);assert.equal(reverted.animagoEstado,undefined);assert.equal(reverted.vida.atual,16);const twice=assumirFormaAnimaga(reverted,c);assert.equal(twice.usosHabilidades.animago,2);delete twice.animagoEstado;assert.throws(()=>assumirFormaAnimaga(twice,c),/esgotadas/);
});
