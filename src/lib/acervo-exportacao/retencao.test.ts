import test from 'node:test';
import assert from 'node:assert/strict';
import {temColecaoLegada} from './retencao.ts';
test('coleção cosmética anterior impede perda da referência até a migração',()=>{assert.equal(temColecaoLegada({colecaoFigurinhas:[{id:'godric',quantidade:2}]}),true);assert.equal(temColecaoLegada({colecaoFigurinhas:{formatoAnterior:'preservar'}}),true);});
test('ficha comum sem descobertas legadas não ganha bloqueio cosmético',()=>{for(const dados of [null,undefined,[],{}, {colecaoFigurinhas:[]},{colecaoFigurinhas:null},{inventario:[{nome:'Sapo de Chocolate'}]}])assert.equal(temColecaoLegada(dados),false);});
