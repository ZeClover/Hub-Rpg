/* Pathfinder 2e Remaster, Player Core pp. 282–283, 406–412.
 * Regras de combate puras: sem DOM, campanha, rede ou persistência. */
(function (global) {
  'use strict';
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function lista(v) { return Array.isArray(v) ? v : []; }
  function copia(v) { return JSON.parse(JSON.stringify(v)); }
  function normal(v) { return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s_]+/g, '-'); }
  function inteiro(v) { return typeof v === 'number' && Number.isSafeInteger(v); }
  function falha(motivo, extra) { return Object.assign({ suportado: false, motivo: motivo }, extra || {}); }
  function inteiroValido(v, minimo, maximo) { return inteiro(v) && v >= minimo && v <= maximo; }
  function sinal(v) { return v > 0 ? '+' + v : v < 0 ? String(v) : ''; }
  function tipoDano(v) {
    var n = normal(v), aliases = { vital: 'vitalidade', eversivo: 'vazio', void: 'vazio', vitality: 'vitalidade', spirit: 'espiritual', 'todo-dano': 'todos', 'todo-o-dano': 'todos', 'todos-os-danos': 'todos', fisicos: 'fisico' };
    return aliases[n] || n;
  }
  var TIPOS = ['contundente', 'perfurante', 'cortante', 'acido', 'fogo', 'frio', 'eletricidade', 'sonico', 'vitalidade', 'vazio', 'forca', 'espiritual', 'mental', 'veneno', 'sangramento', 'sem-tipo'];
  function tracos(arma) { return lista(arma.tracos).map(function (t) { return normal(typeof t === 'string' ? t : t.id) + (typeof t === 'object' && t.dado ? '-d' + t.dado : ''); }); }
  function dadoTraco(ts, nome) { var r = ts.map(function (t) { return new RegExp('^' + nome + '-d(4|6|8|10|12)$').exec(t); }).find(Boolean); return r ? Number(r[1]) : null; }

  // Parser aritmético restrito; nunca avalia JavaScript ou propriedades de objetos.
  function rolar(formula, rng) {
    if (typeof formula !== 'string' || !formula.trim() || formula.length > 400) throw new RangeError('Use uma expressão de dados válida.');
    var fonte = formula.replace(/\s+/g, '').toLowerCase(), tokens = fonte.match(/\d+d\d+|d\d+|\d+|[()+*\-]/g);
    if (!tokens || tokens.join('') !== fonte || tokens.length > 100) throw new RangeError('Expressão não suportada. Use dados, inteiros, +, −, × e parênteses.');
    var pos = 0, totalDados = 0, lancamentos = [], random = rng || Math.random;
    function limitar(v) { if (!Number.isSafeInteger(v) || Math.abs(v) > 1000000) throw new RangeError('Resultado fora do limite de segurança.'); return v; }
    function valor() {
      var t = tokens[pos++];
      if (t === '+') return valor(); if (t === '-') return -valor();
      if (t === '(') { var v = soma(); if (tokens[pos++] !== ')') throw new RangeError('Parênteses incompletos.'); return v; }
      if (!t || !/^\d+(?:d\d+)?$|^d\d+$/.test(t)) throw new RangeError('Termo inválido na expressão.');
      if (t.indexOf('d') === -1) return limitar(Number(t));
      var pedacos = t.split('d'), qtd = Number(pedacos[0] || 1), faces = Number(pedacos[1]);
      if (!inteiroValido(qtd, 1, 100) || !inteiroValido(faces, 2, 1000) || (totalDados += qtd) > 100) throw new RangeError('Limite de 100 dados, com 2 a 1.000 faces.');
      var dados = [];
      for (var i = 0; i < qtd; i++) { var n = random(); if (typeof n !== 'number' || n < 0 || n >= 1 || !Number.isFinite(n)) throw new RangeError('Fonte de sorteio inválida.'); dados.push(Math.floor(n * faces) + 1); }
      var somaDados = dados.reduce(function (a, b) { return a + b; }, 0); lancamentos.push({ quantidade: qtd, faces: faces, resultados: dados, total: somaDados }); return somaDados;
    }
    function produto() { var n = valor(); while (tokens[pos] === '*') { pos++; n = limitar(n * valor()); } return n; }
    function soma() { var n = produto(); while (tokens[pos] === '+' || tokens[pos] === '-') { var s = tokens[pos++]; n = limitar(n + (s === '+' ? 1 : -1) * produto()); } return n; }
    var resultado = soma(); if (pos !== tokens.length) throw new RangeError('Expressão incompleta.');
    return { formula: formula, total: resultado, rolagens: lancamentos };
  }
  function danoArma(arma, calculo, opcoes) {
    arma = obj(arma); calculo = obj(calculo); opcoes = obj(opcoes);
    if (arma.somenteConsulta || arma.tipo !== 'arma') return falha('A arma não possui um bloco de combate revisado.');
    var base = /^(\d+)d(4|6|8|10|12)$/.exec(String(arma.dano || '').trim()), tipo = tipoDano(arma.tipoDano);
    if (!base || TIPOS.indexOf(tipo) === -1 || tipo === 'sem-tipo') return falha('Dados ou tipo de dano da arma ainda não estão estruturados.');
    var ts = tracos(arma), modo = opcoes.modo || (arma.distancia !== undefined ? 'distancia' : 'corpo-a-corpo'), arremesso = ts.some(function (t) { return /^arremesso(?:-|$)/.test(t); });
    if (['corpo-a-corpo', 'distancia', 'arremesso'].indexOf(modo) === -1 || modo === 'arremesso' && !arremesso || modo === 'distancia' && arma.distancia === undefined) return falha('O modo de ataque não é permitido por esta arma.');
    var at = obj(calculo.atributos), atributo = modo === 'corpo-a-corpo' && calculo.atributoDanoArma === 'des' ? 'des' : 'for';
    var usaAtributo = modo === 'corpo-a-corpo' || modo === 'arremesso' || arremesso || ts.indexOf('propulsivo') !== -1 || ts.indexOf('propulsiva') !== -1;
    if (usaAtributo && !inteiro(at[atributo])) return falha('O modificador de atributo ainda não foi calculado.');
    var mod = usaAtributo ? at[atributo] : 0;
    if (modo === 'distancia' && !arremesso && (ts.indexOf('propulsivo') !== -1 || ts.indexOf('propulsiva') !== -1)) mod = mod > 0 ? Math.floor(mod / 2) : mod;
    var qtd = opcoes.dadosArma === undefined ? calculo.dadosArma === undefined ? Number(base[1]) : calculo.dadosArma : opcoes.dadosArma;
    var bonus = opcoes.bonusDano === undefined ? calculo.bonusDanoArma === undefined ? 0 : calculo.bonusDanoArma : opcoes.bonusDano;
    if (!inteiroValido(qtd, 1, 20) || !inteiro(bonus)) return falha('Dados de arma ou bônus de dano inválidos.');
    var faces = calculo.facesDanoArma === undefined ? Number(base[2]) : calculo.facesDanoArma, duasMaos = dadoTraco(ts, 'duas-maos');
    if (opcoes.maos !== undefined && obj(calculo.facesDanoArmaPorMaos)[opcoes.maos] !== undefined) faces = calculo.facesDanoArmaPorMaos[opcoes.maos];
    else if (duasMaos && opcoes.maos !== undefined) faces = opcoes.maos === 2 ? duasMaos : Number(base[2]);
    if ([4, 6, 8, 10, 12].indexOf(faces) === -1) return falha('O dado de dano calculado da arma é inválido.');
    var condicionais = ['energica', 'gemea', 'justa'];
    if (ts.some(function (t) { return condicionais.some(function (k) { return t === k || t.indexOf(k + '-') === 0; }); })) return falha('Esta arma tem um benefício contextual ainda não estruturado para automação.');
    if (opcoes.tipoDano && tipoDano(opcoes.tipoDano) !== tipo) { var alt = tipoDano(opcoes.tipoDano); if (ts.indexOf('versatil-' + alt) === -1) return falha('A arma não permite esse tipo alternativo de dano.'); tipo = alt; }
    var extras = [], fatal = dadoTraco(ts, 'fatal'), mortal = dadoTraco(ts, 'mortal'), critico = opcoes.critico === true;
    if (critico && fatal) { faces = fatal; extras.push({ quantidade: 1, faces: fatal, origem: 'fatal' }); }
    if (critico && mortal) { if (Number(base[1]) !== 1 && opcoes.dadosMortal === undefined) return falha('A quantidade de dados do traço mortal precisa de metadados da runa impactante.'); var nd = opcoes.dadosMortal === undefined ? qtd >= 4 ? 3 : qtd >= 3 ? 2 : 1 : opcoes.dadosMortal; if (!inteiroValido(nd, 1, 20)) return falha('Quantidade de dados mortal inválida.'); extras.push({ quantidade: nd, faces: mortal, origem: 'mortal' }); }
    var partesExtras = [], furia = obj(calculo.danoExtraFuria);
    if (Object.keys(furia).length) { if (!inteiroValido(furia.valor, 0, 1000000) || TIPOS.indexOf(tipoDano(furia.tipo)) === -1) return falha('O dano adicional da fúria ainda não está estruturado.'); partesExtras.push({ tipo: tipoDano(furia.tipo), valor: furia.valor, origem: 'furia' }); }
    var extrasPrecisao = lista(calculo.danosExtras);
    for (var ip = 0; ip < extrasPrecisao.length; ip++) { var ep = obj(extrasPrecisao[ip]); if (ep.tipo !== 'precisao' || typeof ep.expressao !== 'string') return falha('Dano adicional de precisão sem fórmula verificada.'); try { rolar(ep.expressao, function () { return 0; }); } catch { return falha('Fórmula de precisão inválida.'); } }
    var totalBonus = mod + bonus, formulaBase = qtd + 'd' + faces + sinal(totalBonus), mult = critico ? 2 : 1;
    return { suportado: true, tipoEfeito: 'dano', tipoDano: tipo, modo: modo, critico: critico, minimo: 1, multiplicador: mult, base: { quantidade: qtd, faces: faces, bonus: totalBonus }, extras: extras, partesExtras: partesExtras, extrasPrecisao: extrasPrecisao.map(function (e) { return { nome: e.nome, formula: e.expressao }; }), formula: (critico ? '(' + formulaBase + ')*2' : formulaBase) + extras.map(function (e) { return '+' + e.quantidade + 'd' + e.faces; }).join('') + partesExtras.map(function (e) { return '+' + e.valor * mult + ' ' + e.tipo; }).join('') + extrasPrecisao.map(function (e) { return '+(' + e.expressao + ')' + (critico ? '*2' : '') + ' precisão'; }).join(''), modificadorAtributo: mod, bonusDano: bonus, fonte: { livro: 'Player Core', paginas: [282, 283, 406, 407] } };
  }
  function rolarDano(plano, rng) {
    if (!plano || plano.suportado !== true || !plano.base) return falha(plano && plano.motivo || 'Plano de dano não suportado.');
    var b = plano.base, base = rolar(b.quantidade + 'd' + b.faces + sinal(b.bonus), rng), n = Math.max(plano.minimo || 0, base.total), extras = lista(plano.extras).map(function (e) { return Object.assign({ origem: e.origem }, rolar(e.quantidade + 'd' + e.faces, rng)); });
    var extra = extras.reduce(function (sum, e) { return sum + e.total; }, 0), total = n * plano.multiplicador + extra;
    var partes = [{ tipo: plano.tipoDano, valor: total, valorSemDobra: n + extra }].concat(lista(plano.partesExtras).map(function (p) { return { tipo: p.tipo, valor: p.valor * plano.multiplicador, valorSemDobra: p.valor }; }));
    var precisoes = lista(plano.extrasPrecisao).map(function (e) { var r = rolar(e.formula, rng); partes.push({ tipo: plano.tipoDano, valor: Math.max(0, r.total) * plano.multiplicador, valorSemDobra: Math.max(0, r.total), precisao: true }); return Object.assign({ origem: e.nome || 'precisão' }, r); });
    return { suportado: true, total: partes.reduce(function (s, p) { return s + p.valor; }, 0), formula: plano.formula, partesDano: partes, rolagens: [base].concat(extras, precisoes), minimoAplicado: base.total < n };
  }
  function defesaTipo(d, parte) { var t = tipoDano(d), p = tipoDano(parte.tipo); return t === 'todos' || t === p || t === 'fisico' && ['contundente', 'perfurante', 'cortante', 'sangramento'].indexOf(p) !== -1; }
  function validarDefesas(d) {
    if (d.imunidades !== undefined && (!Array.isArray(d.imunidades) || d.imunidades.some(function (v) { return typeof v !== 'string'; }))) return false;
    return ['resistencias', 'fraquezas'].every(function (k) { return d[k] === undefined || Array.isArray(d[k]) && d[k].every(function (r) { return r && typeof r.tipo === 'string' && TIPOS.concat(['todos', 'fisico']).indexOf(tipoDano(r.tipo)) !== -1 && inteiroValido(r.valor, 0, 1000000) && Object.keys(r).every(function (k) { return ['tipo', 'valor', 'id', 'fonte', 'pagina'].indexOf(k) !== -1; }); }); });
  }
  function vidaValida(v) { return inteiroValido(v.maxima, 1, 1000000) && inteiroValido(v.atual, 0, v.maxima) && inteiroValido(v.temporaria === undefined ? 0 : v.temporaria, 0, 1000000); }
  function idCondicao(c) { var n = normal(typeof c === 'string' ? c : obj(c).id || obj(c).nome); return ({ lento: 'desacelerado', lenta: 'desacelerado', amedrontado: 'assustado', 'pego-desprevenido': 'desprevenido' })[n] || n; }
  function condicao(f, id) { return lista(f.condicoes).reduce(function (max, c) { return idCondicao(c) === id ? Math.max(max, typeof c === 'string' ? 1 : obj(c).valor || 1) : max; }, 0); }
  function definirCondicao(f, id, valor) {
    var antigo = lista(f.condicoes).find(function (c) { return normal(typeof c === 'string' ? c : obj(c).id || obj(c).nome) === id; });
    f.condicoes = lista(f.condicoes).filter(function (c) { return normal(typeof c === 'string' ? c : obj(c).id || obj(c).nome) !== id; });
    if (valor > 0) f.condicoes.push(Object.assign({}, typeof antigo === 'object' ? antigo : {}, { id: id, valor: valor }));
  }
  function atualizarResumo(f) { f.resumoVida = Object.assign({}, obj(f.resumoVida), { atual: f.vida.atual, maxima: f.vida.maxima, rotulo: 'PV' }); }
  function encerrarFuriaInconsciente(f) {
    if (condicao(f, 'inconsciente') && obj(f.estados).furia) { f.estados = Object.assign({}, f.estados, { furia: false }); if (obj(f.vida).fonteTemporaria === 'furia') f.vida = Object.assign({}, f.vida, { temporaria: 0, fonteTemporaria: null }); }
  }
  function aplicarDano(personagem, partes, opcoes) {
    var f = copia(obj(personagem)), o = obj(opcoes), vida = obj(f.vida), d = obj(o.defesas || f.defesas || f), entradas = lista(partes), grupos = {}, detalhes = [], imunes = lista(d.imunidades).map(normal);
    if (!vidaValida(vida)) return falha('Pontos de vida ainda não estão estruturados.', { ficha: f });
    if (!entradas.length || !o.danoFinal && !validarDefesas(d)) return falha('Dano ou defesas precisam de dados estruturados sem exceções pendentes.', { ficha: f });
    for (var i = 0; i < entradas.length; i++) {
      var p = entradas[i], t = tipoDano(p && p.tipo);
      if (!p || !inteiroValido(p.valor, 0, 1000000) || TIPOS.indexOf(t) === -1) return falha('Tipo ou valor do dano inválido.', { ficha: f });
      if (!o.danoFinal && t === 'sem-tipo' && (lista(d.resistencias).length || lista(d.fraquezas).length || imunes.length)) return falha('Informe o tipo do dano para aplicar as defesas automaticamente.', { ficha: f });
      var valor = p.valor;
      if (!o.danoFinal && o.critico && imunes.indexOf('acertos-criticos') !== -1 && !(p.precisao === true && imunes.indexOf('precisao') !== -1)) { if (!inteiroValido(p.valorSemDobra, 0, p.valor)) return falha('A imunidade a críticos exige o valor antes da dobra.', { ficha: f }); valor = p.valorSemDobra; }
      if (!o.danoFinal && p.precisao === true && imunes.indexOf('precisao') !== -1) valor = 0;
      grupos[t] = (grupos[t] || 0) + valor;
    }
    Object.keys(grupos).forEach(function (t) {
      var inicial = grupos[t], valor = inicial, fraqueza = 0, resistencia = 0, imune = false;
      if (!o.danoFinal && inicial > 0) {
        imune = imunes.some(function (it) { return defesaTipo(it, { tipo: t }); }) || o.naoLetal && imunes.indexOf('nao-letal') !== -1 || d.curaPeloVazio === true && t === 'vazio';
        if (imune) valor = 0;
        else { lista(d.fraquezas).forEach(function (r) { if (defesaTipo(r.tipo, { tipo: t })) fraqueza = Math.max(fraqueza, r.valor); }); lista(d.resistencias).forEach(function (r) { if (defesaTipo(r.tipo, { tipo: t })) resistencia = Math.max(resistencia, r.valor); }); valor = Math.max(0, inicial + fraqueza - resistencia); }
      }
      detalhes.push({ tipo: t, inicial: inicial, imune: !!imune, fraqueza: fraqueza, resistencia: resistencia, final: valor });
    });
    var total = detalhes.reduce(function (sum, p) { return sum + p.final; }, 0), temp = vida.temporaria || 0, absorvido = Math.min(temp, total), perda = Math.min(vida.atual, total - absorvido);
    f.vida = Object.assign({}, vida, { temporaria: temp - absorvido, atual: vida.atual - perda });
    var avisos = [], usaMorrendo = o.usaMorrendo === undefined ? f.ehMonstro !== true : o.usaMorrendo;
    if (total > 0 && f.vida.atual === 0) {
      if (total >= vida.maxima * 2 || o.efeitoMorte) { f.morto = true; definirCondicao(f, 'morrendo', 0); definirCondicao(f, 'condenado', 0); avisos.push('Morte instantânea por dano massivo ou efeito de morte.'); }
      else if (usaMorrendo) {
        var morrer = condicao(f, 'morrendo'), aumento = o.critico || o.falhaCritica ? 2 : 1;
        if (morrer > 0) morrer += aumento; else if (!o.naoLetal) morrer = aumento + condicao(f, 'ferido');
        if (morrer > 0) { definirCondicao(f, 'morrendo', morrer); var limite = (inteiroValido(o.limiteMorrendo, 1, 20) ? o.limiteMorrendo : 4) - condicao(f, 'condenado'); if (morrer >= limite) { f.morto = true; definirCondicao(f, 'morrendo', 0); definirCondicao(f, 'condenado', 0); avisos.push('O limite de morrendo foi atingido.'); } }
      } else if (!o.naoLetal) { f.morto = true; avisos.push('Criatura sem regras de morrendo reduzida a 0 PV.'); }
      definirCondicao(f, 'inconsciente', 1); definirCondicao(f, 'prostrado', 1);
    } else if (total > 0 && f.vida.atual > 0 && f.despertarComDano !== false) definirCondicao(f, 'inconsciente', 0);
    encerrarFuriaInconsciente(f); atualizarResumo(f);
    return { suportado: true, ficha: f, total: total, absorvidoTemporario: absorvido, perdidoPV: perda, detalhes: detalhes, avisos: avisos };
  }
  function curar(personagem, quantidade, opcoes) {
    var f = copia(obj(personagem)), o = obj(opcoes), v = obj(f.vida), d = obj(o.defesas || f.defesas || f);
    if (!vidaValida(v) || !inteiroValido(quantidade, 0, 1000000)) return falha('Cura ou pontos de vida inválidos.', { ficha: f });
    if (f.morto) return falha('Cura comum não restaura uma criatura morta.', { ficha: f });
    if (d.curaPeloVazio === true && tipoDano(o.tipoCura) === 'vitalidade') return { suportado: true, ficha: f, recuperadoPV: 0, motivo: 'Cura de vitalidade não afeta esta criatura.' };
    var ganho = Math.min(quantidade, v.maxima - v.atual); f.vida = Object.assign({}, v, { atual: v.atual + ganho });
    if (quantidade > 0 && f.vida.atual > 0) { if (condicao(f, 'morrendo')) { definirCondicao(f, 'morrendo', 0); definirCondicao(f, 'ferido', condicao(f, 'ferido') + 1); } definirCondicao(f, 'inconsciente', 0); }
    atualizarResumo(f); return { suportado: true, ficha: f, recuperadoPV: ganho };
  }
  function magiaEstruturada(magia, ranque, opcoes) {
    magia = obj(magia); var o = obj(opcoes), e = obj(magia.efeitoCombate);
    if (magia.somenteConsulta || !Object.keys(e).length) return falha('Esta magia ainda não tem fórmula de combate revisada.');
    if (!inteiroValido(ranque, 1, 10)) return falha('Ranque inválido.');
    if (e.variantes) { var variante = obj(e.variantes[String(o.acoes)]); if (!Object.keys(variante).length) return falha('Escolha uma variante de ações estruturada.'); e = Object.assign({}, e, variante); }
    if (['cura', 'dano'].indexOf(e.tipo) === -1 || !inteiroValido(e.ranqueBase, 1, 10) || ranque < e.ranqueBase) return falha('Efeito ou ranque base não estruturado.');
    if (e.componentes !== undefined) {
      if (e.tipo !== 'dano' || !Array.isArray(e.componentes) || !e.componentes.length || e.componentes.length > 10) return falha('Componentes de dano da magia inválidos.');
      var componentes = [];
      for (var ic = 0; ic < e.componentes.length; ic++) { var ec = obj(e.componentes[ic]); if (ec.componentes || ec.variantes) return falha('Componentes aninhados não são suportados.'); var pc = magiaEstruturada({ efeitoCombate: Object.assign({ tipo: 'dano', ranqueBase: e.ranqueBase }, ec) }, ranque); if (!pc.suportado) return pc; componentes.push({ tipoDano: pc.tipoDano, formula: pc.formula }); }
      return { suportado: true, formula: componentes.map(function (c) { return c.formula + ' ' + c.tipoDano; }).join(' + '), tipoEfeito: 'dano', tipoDano: '', tipoCura: '', salvamentoBasico: e.salvamentoBasico === true, exigeAtaque: e.exigeAtaque === true || lista(magia.tracos).indexOf('ataque') !== -1, componentes: componentes, ranque: ranque };
    }
    var formula = obj(e.formulasPorRanque)[ranque] || e.formulaBase;
    if (typeof formula !== 'string') return falha('A fórmula desse ranque ainda não foi revisada.');
    if (!obj(e.formulasPorRanque)[ranque] && ranque > e.ranqueBase) {
      var a = obj(e.ampliacao); if (!inteiroValido(a.intervalo, 1, 10) || typeof a.formula !== 'string') return falha('A ampliação dessa magia ainda não está estruturada.');
      var qtd = Math.floor((ranque - e.ranqueBase) / a.intervalo); if (qtd > 0) formula = '(' + formula + ')+' + Array.from({ length: qtd }, function () { return '(' + a.formula + ')'; }).join('+');
    }
    if (e.tipo === 'dano' && TIPOS.indexOf(tipoDano(e.tipoDano)) === -1) return falha('Tipo de dano da magia não estruturado.');
    return { suportado: true, formula: formula, tipoEfeito: e.tipo, tipoDano: tipoDano(e.tipoDano), tipoCura: tipoDano(e.tipoCura), salvamentoBasico: e.salvamentoBasico === true, exigeAtaque: e.exigeAtaque === true || lista(magia.tracos).some(function (t) { return normal(typeof t === 'string' ? t : obj(t).id) === 'ataque'; }), ranque: ranque };
  }
  function rolarMagia(plano, opcoes, rng) {
    if (!plano || !plano.suportado) return falha(plano && plano.motivo || 'Plano de magia não suportado.');
    var o = obj(opcoes), fatores = { 'sucesso-critico': 0, sucesso: 0.5, falha: 1, 'falha-critica': 2 };
    if (o.critico && (plano.tipoEfeito !== 'dano' || !plano.exigeAtaque)) return falha('A dobra crítica só é permitida em magias de ataque estruturadas.');
    if (o.grauSalvamento && (!plano.salvamentoBasico || plano.exigeAtaque || fatores[o.grauSalvamento] === undefined)) return falha('Este efeito não possui o salvamento básico informado.');
    var componentes = lista(plano.componentes); if (!componentes.length) componentes = [{ tipoDano: plano.tipoDano, formula: plano.formula }];
    var grupos = {}, rolagens = [], total = 0;
    componentes.forEach(function (c) { var r = rolar(c.formula, rng), valor = Math.max(0, r.total); grupos[c.tipoDano] = (grupos[c.tipoDano] || 0) + valor; rolagens = rolagens.concat(r.rolagens); });
    var partes = Object.keys(grupos).map(function (tipo) { var semDobra = grupos[tipo], valor = semDobra;
      if (plano.tipoEfeito === 'dano' && o.grauSalvamento) valor = fatores[o.grauSalvamento] === 0 ? 0 : valor > 0 ? Math.max(1, Math.floor(valor * fatores[o.grauSalvamento])) : 0;
      if (o.critico) valor *= 2; total += valor; return { tipo: tipo, valor: valor, valorSemDobra: semDobra };
    });
    return { suportado: true, total: total, cura: plano.tipoEfeito === 'cura' ? total : 0, partesDano: plano.tipoEfeito === 'dano' ? partes : [], tipoCura: plano.tipoCura, rolagens: rolagens, formula: plano.formula };
  }
  function grauTeste(total, natural, cd) {
    if (!inteiro(total) || !inteiroValido(natural, 1, 20) || !inteiro(cd)) return falha('Resultado, dado natural ou CD inválidos.');
    var grau = total >= cd + 10 ? 3 : total >= cd ? 2 : total <= cd - 10 ? 0 : 1;
    if (natural === 20) grau = Math.min(3, grau + 1); if (natural === 1) grau = Math.max(0, grau - 1);
    return { suportado: true, grau: ['falha-critica', 'falha', 'sucesso', 'sucesso-critico'][grau], indice: grau };
  }
  function testeSimples(cd, rng) { var r = rolar('1d20', rng), g = grauTeste(r.total, r.total, cd); return Object.assign({}, r, { cd: cd, grau: g.grau, sucesso: g.indice >= 2 }); }
  function verificarConjuracao(ficha, rng) { var estupefato = condicao(obj(ficha), 'estupefato'), teste = estupefato ? testeSimples(5 + estupefato, rng) : null; return { suportado: true, interrompida: !!(teste && !teste.sucesso), teste: teste }; }
  function podeIngerir(ficha) { var enjoado = condicao(obj(ficha), 'enjoado'); return { permitido: enjoado === 0, motivo: enjoado ? 'Enjoado impede ingerir voluntariamente poções, elixires e outros alimentos.' : null }; }
  // Player Core pp.252,269,274: uma redução de Dureza; a sobra inteira atinge ambos.
  function bloqueioEscudo(personagem, calculo, partes, opcoes) {
    var antes = copia(obj(personagem)), c = obj(calculo), o = obj(opcoes), e = obj(c.escudoCalculado || obj(c.equipamento).escudo);
    function recusar(m) { return falha(m, { ficha: antes }); }
    if (c.bloqueioEscudo !== true || e.tipo !== 'escudo' || e.somenteConsulta) return recusar('Bloqueio com Escudo exige uma fonte revisada ativa e um escudo válido.');
    if (!antes.escudoErguido || antes.escudoId !== e.id) return recusar('Erga o escudo selecionado antes de bloquear.');
    if (o.ataque !== true) return recusar('Esta reação bloqueia dano físico proveniente de um ataque.');
    if (antes.morto || ['inconsciente', 'paralisado', 'petrificado', 'atordoado'].some(function (id) { return condicao(antes, id) > 0; })) return recusar('A condição atual impede usar reações.');
    if (obj(antes.turno).reacoes !== 1) return recusar('Inicie o controle de turno para recuperar a reação; uma reação já gasta não é recuperada pelo bloqueio.');
    if (!lista(partes).length || lista(partes).some(function (p) { return ['contundente', 'perfurante', 'cortante'].indexOf(tipoDano(obj(p).tipo)) === -1; })) return recusar('Este bloqueio requer componentes físicos revisados (contundente, perfurante ou cortante).');
    var pv = antes.escudoPv === undefined ? e.pv : antes.escudoPv;
    if (!inteiroValido(e.dureza, 0, 1000000) || !inteiroValido(e.pv, 1, 1000000) || !inteiroValido(e.limiarQuebra, 0, e.pv) || !inteiroValido(pv, 0, e.pv)) return recusar('Dureza, PV ou Limiar de Quebra do escudo ainda não estão estruturados.');
    if (antes.escudoQuebrado || antes.escudoDestruido || pv <= e.limiarQuebra) return recusar('Um escudo quebrado ou destruído não pode bloquear.');
    // Preview puro calcula IWR antes do dano; sua ficha simulada nunca é aplicada.
    var preview = aplicarDano(antes, partes, Object.assign({}, o, { defesas: o.defesas || c.defesas }));
    if (!preview.suportado) return recusar(preview.motivo);
    if (preview.total === 0) return recusar('As defesas já impediram todo o dano; não há dano físico para acionar o bloqueio.');
    var reducao = Math.min(e.dureza, preview.total), sobra = preview.total - reducao;
    var dano = aplicarDano(antes, [{ tipo: 'sem-tipo', valor: sobra }], Object.assign({}, o, { danoFinal: true }));
    if (!dano.suportado) return recusar(dano.motivo);
    var f = dano.ficha, depois = Math.max(0, pv - sobra), quebrado = depois <= e.limiarQuebra;
    f.escudoPv = depois; f.escudoQuebrado = quebrado; f.escudoDestruido = depois === 0;
    f.turno = Object.assign({}, obj(f.turno), { reacoes: 0 });
    if (quebrado) { f.escudoErguido = false; f.escudoCobertura = false; }
    return { suportado: true, ficha: f, reducaoDureza: reducao, danoPersonagem: sobra, danoEscudo: sobra,
      escudo: { pvAntes: pv, pvDepois: depois, quebrado: quebrado, destruido: depois === 0 }, defesasAplicadas: preview.detalhes,
      dano: dano, snapshotAntes: antes, fonte: { livro: 'Player Core', paginas: [252, 269, 274] } };
  }
  function reduzirCondicoes(f, id, quantidade) {
    f.condicoes = lista(f.condicoes).map(function (c) {
      if (idCondicao(c) !== id || obj(c).reduzirAutomaticamente === false) return c;
      var n = Math.max(obj(c).minimo || 0, (typeof c === 'string' ? 1 : obj(c).valor || 1) - quantidade);
      return n > 0 ? Object.assign({}, obj(c), { id: id, valor: n }) : null;
    }).filter(Boolean);
  }
  function iniciarTurno(personagem, opcoes, rng) {
    var f = copia(obj(personagem)), o = obj(opcoes), recuperacao = null, morrer = condicao(f, 'morrendo');
    if (morrer > 0 && !f.morto) {
      recuperacao = testeSimples(10 + morrer, rng);
      var ajustes = { 'sucesso-critico': -2, sucesso: -1, falha: 1, 'falha-critica': 2 }, depois = Math.max(0, morrer + ajustes[recuperacao.grau]);
      if (depois >= (inteiroValido(o.limiteMorrendo, 1, 20) ? o.limiteMorrendo : 4) - condicao(f, 'condenado')) { f.morto = true; definirCondicao(f, 'morrendo', 0); definirCondicao(f, 'condenado', 0); }
      else { definirCondicao(f, 'morrendo', depois); if (depois === 0) definirCondicao(f, 'ferido', condicao(f, 'ferido') + 1); }
      recuperacao.morrendoAntes = morrer; recuperacao.morrendoDepois = f.morto ? null : depois;
    }
    encerrarFuriaInconsciente(f);
    var acelerados = lista(f.condicoes).filter(function (c) { return idCondicao(c) === 'acelerado'; }), extra = acelerados.length ? 1 : 0;
    var permitidas = [], pendente = false;
    acelerados.forEach(function (c) { if (!Array.isArray(obj(c).acoesPermitidas)) pendente = true; else lista(c.acoesPermitidas).forEach(function (id) { if (typeof id === 'string' && permitidas.indexOf(id) === -1) permitidas.push(id); }); });
    var atordoado = condicao(f, 'atordoado'), lento = condicao(f, 'desacelerado');
    var atordos = lista(f.condicoes).filter(function (c) { return idCondicao(c) === 'atordoado'; });
    if (atordos.some(function (c) { return typeof c === 'string' || !inteiroValido(c.valor, 1, 1000000); })) return falha('Atordoado por duração exige metadados de início/fim; não será convertido em atordoado 1.', { ficha: f });
    var total = f.morto ? 0 : 3 + extra, perdeuAtordoado = Math.min(total, atordoado);
    if (!f.morto) reduzirCondicoes(f, 'atordoado', perdeuAtordoado);
    var perda = Math.min(total, Math.max(atordoado, lento)), gerais = 3, extraRestante = extra;
    if (o.preservarAcelerada) gerais -= Math.min(3, perda); else { extraRestante -= Math.min(extra, perda); gerais -= Math.max(0, perda - extra); }
    if (o.preservarAcelerada && perda > 3) extraRestante = 0;
    if (f.morto) { gerais = 0; extraRestante = 0; }
    var bloqueado = f.morto || condicao(f, 'inconsciente') || condicao(f, 'petrificado') || condicao(f, 'paralisado') || condicao(f, 'atordoado');
    var turno = { encerrado: false, acoesGerais: Math.max(0, gerais), acaoAcelerada: extraRestante, reacoes: f.morto ? 0 : condicao(f, 'confuso') || bloqueado ? 0 : 1, podeAgir: !bloqueado, restricoesAcelerada: permitidas, precisaDefinirRestricoes: !!(extraRestante && pendente), ataquesRealizados: 0 };
    f.turno = Object.assign({}, obj(f.turno), turno);
    return { suportado: true, ficha: f, turno: turno, recuperacao: recuperacao, fonte: { livro: 'Player Core', paginas: [411, 414, 442, 443, 446] } };
  }
  function finalizarTurno(personagem, opcoes, rng) {
    var antes = copia(obj(personagem)), f = copia(antes), o = obj(opcoes), persistentes = lista(f.danosPersistentes), agrupados = {}, resultados = [], partes = [];
    for (var i = 0; i < persistentes.length; i++) {
      var p = obj(persistentes[i]), t = tipoDano(p.tipo), cd = p.cdRecuperacao === undefined ? 15 : p.cdRecuperacao, mult = p.multiplicador === undefined ? 1 : p.multiplicador;
      if (!p.id || TIPOS.indexOf(t) === -1 || typeof p.formula !== 'string' || !inteiroValido(cd, 1, 100) || [0.5, 1, 2].indexOf(mult) === -1) return falha('Dano persistente precisa de id, tipo, fórmula e teste simples estruturados.', { ficha: antes });
      if (agrupados[t] && (agrupados[t].formula !== p.formula || (agrupados[t].multiplicador || 1) !== mult)) return falha('Persistentes do mesmo tipo com fórmulas diferentes precisam de uma fonte dominante verificada.', { ficha: antes });
      if (!agrupados[t]) agrupados[t] = p;
    }
    try { Object.keys(agrupados).forEach(function (t) {
      var p = agrupados[t], r = rolar(p.formula, rng), mult = p.multiplicador === undefined ? 1 : p.multiplicador, valor = r.total > 0 ? Math.max(1, Math.floor(r.total * mult)) : 0;
      partes.push({ tipo: t, valor: valor }); resultados.push({ id: p.id, tipo: t, rolagem: r, valor: valor });
    }); } catch { return falha('A fórmula de dano persistente é inválida.', { ficha: antes }); }
    var dano = null;
    if (partes.length) { dano = aplicarDano(f, partes, { defesas: o.defesas }); if (!dano.suportado) return falha(dano.motivo, { ficha: antes }); f = dano.ficha; }
    var recuperados = {};
    resultados.forEach(function (r) { r.recuperacao = testeSimples(agrupados[r.tipo].cdRecuperacao === undefined ? 15 : agrupados[r.tipo].cdRecuperacao, rng); if (r.recuperacao.sucesso) recuperados[r.tipo] = true; });
    f.danosPersistentes = persistentes.filter(function (p) { return !recuperados[tipoDano(p.tipo)]; });
    reduzirCondicoes(f, 'assustado', 1);
    f.turno = Object.assign({}, obj(f.turno), { encerrado: true, acoesGerais: 0, acaoAcelerada: 0, podeAgir: false });
    return { suportado: true, ficha: f, danosPersistentes: resultados, dano: dano, snapshotAntes: antes, fonte: { livro: 'Player Core', paginas: [442, 443, 445] } };
  }
  function declaracaoIniciativa(nome, resultado) { if (typeof nome !== 'string' || !nome.trim() || nome.length > 200 || !inteiro(resultado)) return falha('Nome ou resultado da iniciativa inválido.'); return { nome: nome.trim(), resultado: resultado }; }
  var API = Object.freeze({ rolar: rolar, danoArma: danoArma, rolarDano: rolarDano, aplicarDano: aplicarDano, curar: curar, magiaEstruturada: magiaEstruturada, rolarMagia: rolarMagia, grauTeste: grauTeste, verificarConjuracao: verificarConjuracao, podeIngerir: podeIngerir, bloqueioEscudo: bloqueioEscudo, iniciarTurno: iniciarTurno, finalizarTurno: finalizarTurno, declaracaoIniciativa: declaracaoIniciativa });
  if (typeof module === 'object' && module.exports) module.exports = API; else global.HubPF2Combate = API;
})(typeof window !== 'undefined' ? window : globalThis);
