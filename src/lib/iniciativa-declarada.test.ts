import test from 'node:test';
import assert from 'node:assert/strict';
import { adicionarDeclaracao, preservarDeclaracoes, incorporarDeclaracoes, normalizarEstadoIniciativa, type DeclaracaoIniciativa } from './iniciativa-declarada.ts';
const d: DeclaracaoIniciativa = { id:'d1', personagemId:'p1', nome:'Ayla', resultado:22 };
test('declaração só acrescenta nome/resultado identificado, sem alterar NPCs, condições ou rodada',()=>{const original={combatentes:[{id:'npc',nome:'Guardião',condicao:'ferido'}],vezDe:0,rodada:3,outro:42};const novo=adicionarDeclaracao(original,d);assert.deepEqual(novo.combatentes,original.combatentes);assert.equal(novo.outro,42);assert.equal(novo.rodada,3);assert.deepEqual(novo.declaracoes,[d]);assert.equal('declaracoes' in original,false);});
test('nova declaração da mesma ficha substitui a anterior sem duplicar a fila',()=>{const r=adicionarDeclaracao({declaracoes:[d]}, {...d,id:'d2',resultado:9});assert.equal(r.declaracoes.length,1);assert.equal(r.declaracoes[0].resultado,9);});
test('salvamento antigo do mestre não apaga uma declaração nova concorrente',()=>{const recebido={combatentes:[],vezDe:0,rodada:1};assert.deepEqual(preservarDeclaracoes(recebido,{declaracoes:[d]}).declaracoes,[d]);});
test('processar resultado antigo não remove um resultado novo da mesma ficha',()=>{const atual={declaracoes:[{...d,id:'d2',resultado:25}]};const novo=preservarDeclaracoes({combatentes:[],vezDe:0,rodada:1,declaracoesProcessadas:['d1']},atual);assert.equal(novo.declaracoes.length,1);});
test('incorporação ordena pelo resultado e preserva turno atual e notas de NPC',()=>{const original={combatentes:[{id:'npc',nome:'Guardião',condicao:'ferido',resultado:10}],vezDe:0,rodada:4};const novo=incorporarDeclaracoes(original,[d]);assert.equal(novo.combatentes[0].nome,'Ayla');assert.equal(novo.vezDe,1);assert.equal(novo.rodada,4);assert.equal(novo.combatentes[1].condicao,'ferido');assert.equal(original.combatentes.length,1);});
test('fila já processada é idempotente e mantém estado por referência',()=>{const estado=incorporarDeclaracoes({combatentes:[],vezDe:0,rodada:1},[d]);assert.equal(incorporarDeclaracoes(estado,[d]),estado);});
test('resultado novo atualiza o combatente, não duplica nem remove condição aplicada',()=>{const a=incorporarDeclaracoes({combatentes:[],vezDe:0,rodada:1},[d]);a.combatentes[0].condicao='assustado1';const b=incorporarDeclaracoes(a,[{...d,id:'d2',resultado:30}]);assert.equal(b.combatentes.length,1);assert.equal(b.combatentes[0].resultado,30);assert.equal(b.combatentes[0].condicao,'assustado1');});
test('preferências corrompidas não derrubam a Mesa e índices inválidos voltam ao início',()=>{
  for(const valor of [null,[],{combatentes:{}},{combatentes:[null,{}],vezDe:-2,rodada:0}]){
    assert.deepEqual(normalizarEstadoIniciativa(valor),{combatentes:[],vezDe:0,rodada:1,declaracoesProcessadas:[]});
  }
});
test('recuperação preserva combatentes, condições, resultados e confirmações válidos',()=>{
  const original={combatentes:[{id:'npc',nome:'Guardião',condicao:'ferido',resultado:10},{id:'pj',nome:'Ayla',condicao:'',resultado:22,personagemId:'p1'}],vezDe:1,rodada:4,declaracoesProcessadas:['d1','d2']};
  assert.deepEqual(normalizarEstadoIniciativa(original),original);
  assert.equal(normalizarEstadoIniciativa({...original,vezDe:9}).vezDe,0);
  assert.equal(normalizarEstadoIniciativa({...original,declaracoesProcessadas:[null,'d1']}).declaracoesProcessadas?.[0],'d1');
});
