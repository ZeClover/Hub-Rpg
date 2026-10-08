/* eslint-disable @typescript-eslint/no-require-imports -- Validação do motor CommonJS usado no navegador. */
const {test}=require('node:test');const assert=require('node:assert/strict');
const C=require('../public/js/pathfinder-criaturas.js');const b=require('../public/pathfinder/monster-core.json');
const get=id=>b.criaturas.find(m=>m.id==='aon-monstro-'+id);
test('Golpe usa bônus e dano do bloco, sem somar Força novamente',()=>{
  let chamadas=0;const r=C.ataque(get(3162),0,12,0,()=>chamadas++===0?0.5:0);
  assert.equal(r.total,18);assert.equal(r.grau,'sucesso');assert.equal(r.dano.total,2);assert.equal(r.dano.formula,'1d6+1');
});
test('MAP ágil e falha não rolam dano',()=>{
  const r=C.ataque(get(3162),0,15,1,()=>0.5);assert.equal(r.bonus,3);assert.equal(r.total,14);assert.equal(r.dano,null);
});
test('crítico dobra dados e bônus e preserva o bloco original',()=>{
  const m=get(3241),antes=JSON.stringify(m),r=C.ataque(m,0,15,0,()=>0.95);
  assert.equal(r.grau,'sucesso-critico');assert.equal(r.dano.total,16);assert.equal(JSON.stringify(m),antes);
});
test('referências bloqueadas e parâmetros inválidos não executam',()=>{
  assert.equal(C.ataque(b.criaturas.find(m=>m.estadoTraducao==='referencia'),0,15,0).suportado,false);
  for(const args of [[0,NaN,0],[0,15,3],[-1,15,0]])assert.equal(C.ataque(get(3241),...args).suportado,false);
});
test('mortal com vários dados não inventa a quantidade da runa',()=>{
  const m={estadoTraducao:'revisado',ataques:[{nome:'Arco',bonus:10,dano:'2d8+3',tipoDano:'perfurante',tracos:['mortal d10']}]};
  const r=C.ataque(m,0,15,0,()=>0.95);assert.equal(r.suportado,true);assert.equal(r.dano.suportado,false);assert.match(r.dano.motivo,/mortal/);
});
test('traço fatal do bloco troca dados e acrescenta o dado sem dobrar',()=>{
  const m={estadoTraducao:'revisado',ataques:[{nome:'Arma fatal',bonus:10,dano:'1d6+3',tipoDano:'perfurante',tracos:['fatal d8']}]};
  const r=C.ataque(m,0,15,0,()=>0.95);assert.equal(r.dano.total,30);
});
test('testes mostram exceções e quatro graus',()=>{
  const m=get(3241),r=C.teste(m,'fortitude',15,()=>0.5);assert.equal(r.total,17);assert.equal(r.grau,'sucesso');
  assert.equal(C.teste(m,'pericia-inexistente',15).suportado,false);
});
