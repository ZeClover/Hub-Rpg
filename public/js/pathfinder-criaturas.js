/* Combate das criaturas Remaster. Valores vêm do bloco revisado, sem somar atributos novamente. */
(function(global){
/* eslint-disable @typescript-eslint/no-require-imports -- UMD compartilhado entre navegador e testes CommonJS. */
'use strict';
  var C=typeof module==='object'&&module.exports?require('./pathfinder-combate.js'):global.HubPF2Combate;
  function recusar(motivo){return {suportado:false,motivo:motivo};}
  function ataque(bloco,indice,ca,ordem,rng){
    if(!bloco||bloco.estadoTraducao!=='revisado')return recusar('Esta criatura ainda não tem bloco revisado.');
    if(!Number.isInteger(indice)||!Number.isInteger(ca)||ca<0||ca>1000000||!Number.isInteger(ordem)||ordem<0||ordem>2)return recusar('Escolha ataque, CA e posição no turno válidos.');
    var a=(bloco.ataques||[])[indice];
    if(!a||!Number.isInteger(a.bonus))return recusar('Bônus de ataque não estruturado.');
    var ts=Array.isArray(a.tracos)?a.tracos:[],agil=ts.indexOf('ágil')!==-1||ts.indexOf('agil')!==-1;
    var bonus=Array.isArray(a.map)&&a.map.length===3?a.map[ordem]:a.bonus-(ordem===0?0:ordem*(agil?4:5));
    if(!Number.isInteger(bonus))return recusar('Penalidade por ataques múltiplos inválida.');
    var d=C.rolar('1d20',rng),total=d.total+bonus,g=C.grauTeste(total,d.total,ca);
    if(!g.suportado)return g;
    var dano=null;
    if(g.indice>=2){
      var base=/^(\d+)d(4|6|8|10|12)([+-]\d+)?$/.exec(String(a.dano||'').replace(/\s/g,''));
      if(!base)dano=recusar('Dano composto ou especial ainda requer um plano estruturado próprio.');
      else {
        var arma={tipo:'arma',dano:base[1]+'d'+base[2],tipoDano:a.tipoDano,tracos:ts.map(function(t){return t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/^(mortal|fatal) d(\d+)$/, '$1-d$2').replace(/^versatil /,'versatil-').replace(/^duas maos d/,'duas-maos-d');})};
        if(a.tipo==='distancia')arma.distancia=0;
        var plano=C.danoArma(arma,{atributos:{for:0,des:0},bonusDanoArma:Number(base[3]||0)},{critico:g.indice===3,dadosMortal:a.dadosMortal});
        dano=plano.suportado?C.rolarDano(plano,rng):plano;
      }
    }
    return {suportado:true,nome:a.nome,natural:d.total,bonus:bonus,total:total,ca:ca,grau:g.grau,dano:dano,regraEspecial:a.efeito||'',tracos:ts,fonte:{id:bloco.id,pagina:bloco.pagina}};
  }
  function teste(bloco,tipo,cd,rng){
    if(!bloco||bloco.estadoTraducao!=='revisado'||!Number.isInteger(cd))return recusar('Bloco ou CD inválidos.');
    var bonus=tipo==='percepcao'?bloco.percepcao:(bloco.salvaguardas||{})[tipo];
    if(bonus===undefined)bonus=(bloco.pericias||{})[tipo];
    if(!Number.isInteger(bonus))return recusar('Esta perícia ou salvaguarda não possui valor revisado.');
    var d=C.rolar('1d20',rng),total=d.total+bonus,g=C.grauTeste(total,d.total,cd);
    if(!g.suportado)return g;
    return {suportado:true,natural:d.total,bonus:bonus,total:total,cd:cd,grau:g.grau,excecoes:[].concat(bloco.excecoesPericias||[],bloco.excecoesDefesas||[])};
  }
  var API=Object.freeze({ataque:ataque,teste:teste});
  if(typeof module==='object'&&module.exports)module.exports=API;else global.HubPF2Criaturas=API;
})(typeof window!=='undefined'?window:globalThis);
