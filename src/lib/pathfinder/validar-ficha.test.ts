import test from 'node:test';
import assert from 'node:assert/strict';
import R from '../../../public/js/pathfinder-regras.js';
import catalogo from './catalogo-validacao.json' with { type: 'json' };
import { prepararFichaPathfinder, progressaoPermitidaPathfinder } from './validar-ficha.ts';
function ficha() { const p = R.criar(catalogo); Object.assign(p, { nome: 'Guarda', ancestralidadeId: 'humano', classeId: 'guerreiro', vida: { atual: 7, maxima: 999, temporaria: 3 } }); return p; }
const jogador = { emCampanha: true, ehMestre: false, ehMonstro: false };
test('nível da campanha depende de XP ou autorização privada sem expor segredo', () => {
 const p = { nivel: 2, xp: 1500, _mestre: { pathfinder: { nivelAutorizado: 4 }, segredo: 'oculto' } };
 assert.deepEqual(progressaoPermitidaPathfinder(p, true, false), { nivelMaximo: 4, modo: 'mestre-ou-xp' });
 assert.equal(progressaoPermitidaPathfinder(p, false, false).nivelMaximo, 20);
});
test('jogador não concede XP nem aumenta nível sem requisito', () => {
 const a=ficha();a.xp=0;const b=structuredClone(a);b.xp=99999;b.nivel=2;
 assert.match(prepararFichaPathfinder(a,b,jogador).erro!, /XP/);
 b.nivel=1;const resultado=prepararFichaPathfinder(a,b,jogador);assert.equal(resultado.dados?.xp,0);
});
test('XP já salvo paga evolução uma vez e não cura personagem', () => {
 const a=ficha();a.xp=1000;const b=structuredClone(a);b.nivel=2;
 const r=prepararFichaPathfinder(a,b,jogador);assert.equal(r.erro,undefined);assert.equal(r.dados?.xp,0);
 assert.equal((r.dados?.vida as Record<string,unknown>).atual,7);assert.equal((r.dados?.vida as Record<string,unknown>).temporaria,3);
});
test('servidor recalcula PV máximos e mantém campos desconhecidos', () => {
 const a=ficha();a.campoAnterior={registro:123};const r=prepararFichaPathfinder(a,a,{...jogador,emCampanha:false});
 assert.equal(r.erro,undefined);assert.equal((r.dados?.vida as Record<string,unknown>).maxima,18);assert.deepEqual(r.dados?.campoAnterior,{registro:123});
 assert.equal((r.dados?.resumoVida as Record<string,unknown>).rotulo,'PV');
});
test('rascunho incompleto salva, conclusão exige escolhas reais', () => {
 const a=ficha();assert.equal(prepararFichaPathfinder({},a,jogador).erro,undefined);
 a._guiado.concluido=true;assert.ok(prepararFichaPathfinder({},a,jogador).erro);
});
test('aprovações forjadas de perícias e talentos são removidas', () => {
 const a=ficha();const b=structuredClone(a);b.proficienciasAprovadasPeloMestre=true;b.periciasAprovadasPeloMestre=true;
 b.talentos=[{id:'inventado',tipo:'classe',nivel:1,aprovadoPeloMestre:true}];
 const r=prepararFichaPathfinder(a,b,jogador);assert.equal(r.erro,undefined);assert.equal(r.dados?.proficienciasAprovadasPeloMestre,undefined);assert.equal(r.dados?.periciasAprovadasPeloMestre,undefined);assert.equal((r.dados?.talentos as Record<string,unknown>[])[0].aprovadoPeloMestre,undefined);
});
test('NPC não recebe exigências de personagem nem recalculo de classe', () => {
 const npc={nome:'Lobo',vida:{atual:10,maxima:24},acoes:'Morder',outro:{x:1}};
 assert.deepEqual(prepararFichaPathfinder({},npc,{...jogador,ehMonstro:true}).dados,npc);
});

test("ficha nova ainda sem classe pode guardar o rascunho com zero PV", () => { const p=R.criar(catalogo);p.xp=0;const r=prepararFichaPathfinder({},p,jogador);assert.equal(r.erro,undefined);assert.equal((r.dados?.vida as Record<string,unknown>).maxima,0); });
test('quantidades do inventário recusam valores negativos, fracionados e não numéricos', () => {
 for (const quantidade of [-1, 0.5, '2', Infinity, 1000001]) {
  const a=ficha(), b=structuredClone(a);b.equipamentos=[{id:'roupa-de-explorador',quantidade}];
  assert.match(prepararFichaPathfinder(a,b,jogador).erro!,/Quantidade/);
 }
 const a=ficha();a.equipamentos=[{id:'roupa-de-explorador',quantidade:0,anotacao:'preservar'}];
 const r=prepararFichaPathfinder(a,a,jogador);assert.equal(r.erro,undefined);assert.equal((r.dados?.equipamentos as Record<string,unknown>[])[0].anotacao,'preservar');
});
test('valores manuais sem autorização não substituem o equipamento e os bônus calculados', () => {
 const a=ficha(), b=structuredClone(a);b.bonusAprovadosPeloMestre=true;b.equipamentoAprovadoPeloMestre=true;
 b.bonus=[{alvo:'pv',tipo:'sem-tipo',valor:500}];b.armadura={ca:50,limiteDes:100,grau:'sem'};
 const r=prepararFichaPathfinder(a,b,jogador);assert.equal(r.erro,undefined);
 assert.equal(r.dados?.bonusAprovadosPeloMestre,undefined);assert.equal(r.dados?.equipamentoAprovadoPeloMestre,undefined);
 assert.equal((r.dados?.vida as Record<string,unknown>).maxima,18);
 const esperado=R.calcular(a,catalogo);assert.equal(R.calcular(r.dados!,catalogo).ca,esperado.ca);
});
test('autorização do mestre alcança IDs nas famílias aninhadas de runas', () => {
 const item=catalogo.equipamentos.find(e=>'somenteMestre' in e && e.somenteMestre === true);assert(item);
 const a=ficha(), b=structuredClone(a);b.runasEquipamento={arma:{potencia:item.id}};
 assert.match(prepararFichaPathfinder(a,b,jogador).erro!,/autorização do mestre/);
});
