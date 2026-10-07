/* Pathfinder 2e Remaster, Player Core pp. 19–29, 92–213, 226, 271, 400–401, 442–447.
 * Motor puro compartilhado entre ficha e servidor: não acessa campanha ou persistência. */
(function (global) {
  'use strict';
  var ATRIBUTOS = ['for', 'des', 'con', 'int', 'sab', 'car'];
  var PERICIAS = [
    ['acrobacia', 'Acrobatismo', 'des'], ['arcanismo', 'Arcanismo', 'int'], ['atletismo', 'Atletismo', 'for'],
    ['enganacao', 'Dissimulação', 'car'], ['diplomacia', 'Diplomacia', 'car'], ['intimidacao', 'Intimidação', 'car'],
    ['manufatura', 'Manufatura', 'int'], ['medicina', 'Medicina', 'sab'], ['natureza', 'Natureza', 'sab'],
    ['ocultismo', 'Ocultismo', 'int'], ['performance', 'Performance', 'car'], ['religiao', 'Religião', 'sab'],
    ['sociedade', 'Sociedade', 'int'], ['furtividade', 'Furtividade', 'des'], ['sobrevivencia', 'Sobrevivência', 'sab'], ['ladroagem', 'Ladroagem', 'des']
  ].map(function (s) { return { id: s[0], nome: s[1], atributo: s[2] }; });
  function lista(v) { return Array.isArray(v) ? v : []; }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function numero(v, padrao) { return v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : padrao; }
  function copia(v) { return JSON.parse(JSON.stringify(v)); }
  function encontrar(c, tipo, id) { return lista(obj(c)[tipo]).find(function (r) { return r.id === id; }) || null; }
  function mapaDoNivel(tabela, n) {
    var ls = Array.isArray(tabela) ? tabela : Object.keys(obj(tabela)).map(function (l) { return { nivel: Number(l), valores: tabela[l] }; });
    ls = ls.filter(function (l) { return l.nivel <= n; }).sort(function (a, b) { return a.nivel - b.nivel; });
    var row = ls.length ? ls[ls.length - 1].valores || ls[ls.length - 1].espacos : null, resultado = {};
    if (Array.isArray(row)) row.forEach(function (v, i) { if (v > 0) resultado[i + 1] = v; }); else resultado = Object.assign({}, obj(row));
    return resultado;
  }
  function valorDoNivel(tabela, n, padrao) {
    var ns = Object.keys(obj(tabela)).map(Number).filter(function (l) { return l <= n; }).sort(function (a, b) { return a - b; });
    return ns.length ? tabela[ns[ns.length - 1]] : padrao;
  }
  function nivel(p) { return Math.max(1, Math.min(20, Math.trunc(numero(p.nivel, 1)))); }
  function grau(v) { return Math.max(0, Math.min(4, Math.trunc(numero(v, 0)))); }
  function proficiencia(v, n) { var g = grau(v); return g ? n + 2 * g : 0; }
  function incrementarAtributo(v) { var n = numero(v, 0); return n + (n >= 4 ? 0.5 : 1); }
  function criar() {
    var p = { sistema: 'pathfinder-2e-remaster', versaoFicha: 1, nome: '', nivel: 1, xp: 0,
      ancestralidadeId: '', herancaId: '', biografiaId: '', classeId: '', opcaoClasseId: '', atributoChave: '',
      atributos: {}, incrementos: { ancestralidade: [], biografia: [], classe: [], livres: [], nivel: {} },
      ancestralidadeAlternativa: true, pericias: {}, talentos: [], magias: [], equipamentos: [],
      vida: { atual: 0, maxima: 0, temporaria: 0 }, condicoes: [], notas: '', _guiado: { concluido: false, passo: 0 } };
    ATRIBUTOS.forEach(function (a) { p.atributos[a] = 0; });
    PERICIAS.forEach(function (s) { p.pericias[s.id] = 0; }); return p;
  }
  function normalizar(personagem, catalogo) {
    var p = Object.assign(criar(), copia(obj(personagem)));
    p.atributos = Object.assign(criar().atributos, obj(p.atributos)); p.pericias = Object.assign(criar().pericias, obj(p.pericias));
    p.incrementos = Object.assign(criar().incrementos, obj(p.incrementos)); p.incrementos.nivel = obj(p.incrementos.nivel);
    p.vida = Object.assign(criar().vida, obj(p.vida)); p._guiado = Object.assign(criar()._guiado, obj(p._guiado));
    ['talentos', 'magias', 'equipamentos', 'condicoes'].forEach(function (a) { p[a] = lista(p[a]); });
    if (catalogo) {
      var deus = divindadeSelecionada(p, catalogo), santa = obj(deus && deus.santificacao);
      if (santa.obrigatoria === true && lista(santa.opcoes).length === 1) p.escolhasClasse = Object.assign({}, obj(p.escolhasClasse), { santificacao: santa.opcoes[0] });
      p.magias = p.magias.filter(function (m) { return !m.concedidaAutomaticamente; });
      p.acessosPreparacao = [];
      p.talentos = p.talentos.filter(function (t) { return !t.concedidoAutomaticamente; });
      fontesSelecionadas(p, catalogo).forEach(function (fonte) { lista(fonte.registro.magiasConcedidas).forEach(function (m) {
        var rank = numero(m.graduacao, numero(m.ranque, 0));
        if (nivel(p) < numero(m.nivelConcessao, Math.max(1, rank * 2 - 1))) return;
        if (m.apenasAcessoPreparacao === true) { p.acessosPreparacao.push({ id: m.id, nome: m.nome, ranque: rank, origem: fonte.origem }); return; }
        p.magias = p.magias.filter(function (s) { return (typeof s === 'string' ? s : s.id) !== m.id || m.tipo !== 'foco' && m.tipo !== 'truque' && rank > 0 && typeof s === 'object' && Number.isInteger(s.ranque) && s.ranque > rank; });
        p.magias.push(Object.assign({}, m, { id: m.id, nome: m.nome, ranque: rank, nivel: rank, tipo: m.tipo || (rank ? 'magia' : 'truque'), origem: fonte.origem, concedidaAutomaticamente: true }));
      }); talentosConcedidosFonte(p, catalogo, fonte.registro).forEach(function (t) {
        var id = typeof t === 'string' ? t : t.id, r = encontrar(catalogo, 'talentos', id); if (!r || p.talentos.some(function (s) { return s.id === id; }) || typeof t === 'object' && t.nivel > nivel(p)) return;
        p.talentos.push({ id: id, nivel: typeof t === 'object' ? numero(t.nivel, 1) : 1, tipo: r.tipo, origem: fonte.origem, concedidoAutomaticamente: true });
      }); });
    }
    return p;
  }
  function atributos(p, catalogo) {
    var grupos = ['ancestralidade', 'biografia', 'classe', 'livres'].map(function (k) { return lista(p.incrementos[k]); });
    [5, 10, 15, 20].filter(function (l) { return l <= nivel(p); }).forEach(function (l) { grupos.push(lista(p.incrementos.nivel[l])); });
    var usa = grupos.some(function (g) { return g.length > 0; }), brutos = {}, valores = {}, parciais = {};
    ATRIBUTOS.forEach(function (a) { brutos[a] = usa ? 0 : numero(p.atributos[a], 0); });
    if (usa) {
      var anc = encontrar(catalogo, 'ancestralidades', p.ancestralidadeId);
      if (!p.ancestralidadeAlternativa && anc && ATRIBUTOS.indexOf(anc.defeito) !== -1) brutos[anc.defeito]--;
      lista(p.defeitosVoluntarios).forEach(function (a) { if (ATRIBUTOS.indexOf(a) !== -1) brutos[a]--; });
      grupos.forEach(function (g) { g.forEach(function (a) { if (ATRIBUTOS.indexOf(a) !== -1) brutos[a] = incrementarAtributo(brutos[a]); }); });
    }
    ATRIBUTOS.forEach(function (a) { valores[a] = Math.floor(brutos[a]); parciais[a] = brutos[a] % 1 !== 0; });
    return { valores: valores, parciais: parciais };
  }
  function mesclarProficiencias(destino, novos, preservarMaior) {
    Object.keys(obj(novos)).forEach(function (k) {
      if (typeof novos[k] === 'object') { destino[k] = obj(destino[k]); mesclarProficiencias(destino[k], novos[k], preservarMaior); }
      else destino[k] = preservarMaior ? Math.max(grau(destino[k]), grau(novos[k])) : grau(novos[k]);
    });
  }
  function opcao(p, classe) { return lista(classe && classe.opcoes).find(function (o) { return o.id === p.opcaoClasseId; }); }
  function heranca(p, anc, catalogo) { return lista(anc && anc.herancas).concat(lista(obj(catalogo).herancasVersateis)).find(function (h) { return h.id === p.herancaId; }); }
  function fontesSelecionadas(p, catalogo) {
    var classe = encontrar(catalogo, 'classes', p.classeId), o = opcao(p, classe), anc = encontrar(catalogo, 'ancestralidades', p.ancestralidadeId), h = heranca(p, anc, catalogo), fontes = [], vistos = {};
    if (classe) fontes.push({ registro: classe, origem: 'classe:' + classe.id });
    if (o) fontes.push({ registro: o, origem: 'especializacao:' + o.id });
    if (anc) fontes.push({ registro: anc, origem: 'ancestralidade:' + anc.id });
    if (h) fontes.push({ registro: h, origem: 'heranca:' + h.id });
    p.talentos.forEach(function (t) { var r = encontrar(catalogo, 'talentos', t.id); if (talentoAtivo(p, t, r) && (!vistos[t.id] || r.repetivel)) { fontes.push({ registro: r, origem: r.tipo + ':' + r.id, nivelConcessao: Number(t.nivel) }); vistos[t.id] = true; } });
    var extrasVistas = {};
    for (var indice = 0; indice < fontes.length && indice < 128; indice++) { var fonte = fontes[indice]; lista(fonte.registro.escolhasExtras).filter(function (e) { return e.nivel <= nivel(p); }).forEach(function (e) {
      var valor = obj(p.escolhasClasse)[e.id], r = lista(e.opcoes).find(function (r) { return (typeof r === 'string' ? r : r.id) === valor; });
      if (typeof r === 'string') r = lista(fonte.registro.teses).concat(lista(classe && classe.teses)).find(function (t) { return t.id === r; });
      var origem = r && 'escolha:' + e.id + ':' + r.id;
      if (r && typeof r === 'object' && !extrasVistas[origem]) { fontes.push({ registro: r, origem: origem }); extrasVistas[origem] = true; }
    }); }
    var deidade = fontes.find(function (f) { return f.origem === 'escolha:divindade:' + obj(p.escolhasClasse).divindade; });
    if (deidade && fontes.some(function (f) { return f.registro.concedeDominio === true; }) && lista(deidade.registro.dominios).indexOf(obj(p.escolhasClasse).dominio) !== -1) {
      var dominio = encontrar(catalogo, 'dominios', p.escolhasClasse.dominio); if (dominio) fontes.push({ registro: dominio, origem: 'dominio:' + dominio.id });
    }
    return fontes;
  }
  function escolhasExtras(personagem, catalogo) { var p = normalizar(personagem), ls = []; fontesSelecionadas(p, catalogo).forEach(function (f) { ls = ls.concat(lista(f.registro.escolhasExtras).filter(function (e) { return e.nivel <= nivel(p); })); }); return ls; }
  function divindadeSelecionada(p, catalogo) { var f = fontesSelecionadas(p, catalogo).find(function (f) { return f.origem === 'escolha:divindade:' + obj(p.escolhasClasse).divindade; }); return f ? f.registro : null; }
  function armaFavorecidaSimples(p, catalogo) { var d = divindadeSelecionada(p, catalogo), arma = encontrar(catalogo, 'equipamentos', d && (d.armaFavorecidaId || d.armaFavorecida)); return !!arma && ['simples', 'desarmado', 'desarmados', 'desarmadas'].indexOf(arma.grau) !== -1; }
  function talentosConcedidosFonte(p, catalogo, fonte) { return lista(fonte.talentosConcedidos).concat(lista(fonte.talentosConcedidosCondicionais).filter(function (r) { return r.condicao === 'arma-favorecida-simples' && armaFavorecidaSimples(p, catalogo); })); }
  function magiaElegivel(personagem, id, catalogo) {
    var p = normalizar(personagem), r = encontrar(catalogo, 'magias', id); if (!r || r.somenteConsulta === true) return false;
    var concessao = fontesSelecionadas(p, catalogo).some(function (fonte) { return lista(fonte.registro.magiasConcedidas).some(function (m) { return m.id === id && nivel(p) >= numero(m.nivelConcessao, Math.max(1, numero(m.graduacao, 0) * 2 - 1)); }); });
    if (concessao) return true;
    if (r.tipo === 'foco') return false;
    var conj = conjuracaoBase(p, encontrar(catalogo, 'classes', p.classeId), catalogo);
    return !!conj && conj.tipo !== 'foco' && (!lista(r.tradicoes).length || lista(r.tradicoes).indexOf(conj.tradicao) !== -1);
  }
  function periciaHeranca(p, h) {
    var s = obj(p.escolhasHeranca).pericia;
    if (lista(h && h.periciasEscolha).indexOf(s) === -1) return null;
    var g = 1;
    lista(h && h.graduacaoPericia).filter(function (r) { return r.nivel <= nivel(p); }).sort(function (a, b) { return a.nivel - b.nivel; }).forEach(function (r) { g = grau(r.grau); });
    return { id: s, grau: g };
  }
  function saberEscolhido(p, classe, o) { var nome = obj(p.escolhasClasse).periciaSaber; return (classe && classe.periciaSaberEscolha || o && o.periciaSaberEscolha) && typeof nome === 'string' && nome.trim() ? 'saber:' + nome.trim() : null; }
  function periciasPermitidas(restricoes, o) {
    var ids = []; lista(restricoes).forEach(function (s) {
      if (s === 'pericia-do-estilo' || s === 'pericia-da-metodologia') ids = ids.concat(lista(o && o.periciasFixas), lista(o && o.periciasEscolha));
      else if (s === 'pericia-mental') ids = ids.concat(PERICIAS.filter(function (p) { return ['int', 'sab', 'car'].indexOf(p.atributo) !== -1; }).map(function (p) { return p.id; }));
      else ids.push(s);
    }); return ids;
  }
  function conjuracaoBase(p, classe, catalogo) {
    var conj = classe && classe.conjuracao ? copia(classe.conjuracao) : null, o = opcao(p, classe);
    p.talentos.forEach(function (t) { var r = encontrar(catalogo, 'talentos', t.id); if (!conj && talentoAtivo(p, t, r) && r.conjuracao) conj = copia(r.conjuracao); });
    if (conj && o) { Object.assign(conj, obj(o.conjuracao)); if (o.tradicao) conj.tradicao = o.tradicao; }
    if (conj && lista(conj.tradicoesEscolha).length) conj.tradicao = lista(conj.tradicoesEscolha).indexOf(obj(p.escolhasClasse).tradicaoQi) !== -1 ? p.escolhasClasse.tradicaoQi : null;
    return conj;
  }
  function proficienciasClasse(p, classe, catalogo) {
    var conjBase = conjuracaoBase(p, classe, catalogo), conj = obj(conjBase);
    var prof = { percepcao: grau(classe && classe.percepcao), salvaguardas: {}, armaduras: {}, armas: {},
      cdClasse: classe ? grau(classe.cdClasse === undefined ? 1 : classe.cdClasse) : 0,
      conjuracao: conjBase ? grau(conj.grau === undefined ? conj.proficiencia === undefined ? 1 : conj.proficiencia : conj.grau) : 0 };
    if (classe) {
      mesclarProficiencias(prof, { salvaguardas: obj(classe.salvaguardas), armaduras: obj(classe.armaduras), armas: obj(classe.armas) });
      var o = opcao(p, classe); if (o) mesclarProficiencias(prof, o.proficiencias);
      lista(classe.progressao).concat(lista(o && o.progressao)).filter(function (r) { return r.nivel <= nivel(p); }).sort(function (a, b) { return a.nivel - b.nivel; }).forEach(function (r) {
        mesclarProficiencias(prof, r.proficiencias);
        var pc = obj(r.proficienciasCondicionais);
        if (pc.conjuracao && p.talentos.some(function (t) { return (t.id === pc.requer || t.id === 'monge-' + pc.requer) && talentoAtivo(p, t, encontrar(catalogo, 'talentos', t.id)); })) prof.conjuracao = grau(pc.conjuracao);
        var escolha = obj(r.escolhaProficiencia), selecionado = obj(p.escolhasClasse)[escolha.id], grupo = obj(prof[escolha.campo]);
        if (escolha.campo && lista(escolha.opcoes).indexOf(selecionado) !== -1 && (!escolha.grauAnterior || grupo[selecionado] === escolha.grauAnterior)) {
          grupo[selecionado] = grau(escolha.grau); prof[escolha.campo] = grupo;
        }
      });
    }
    p.talentos.forEach(function (t) {
      var r = encontrar(catalogo, 'talentos', t.id);
      if (!talentoAtivo(p, t, r)) return;
      mesclarProficiencias(prof, r.proficiencias, true);
      if (r.armaduraAcompanha && obj(r.proficiencias).armaduras) Object.keys(r.proficiencias.armaduras).forEach(function (tipo) { prof.armaduras[tipo] = Math.max(grau(prof.armaduras[tipo]), grau(prof.armaduras[r.armaduraAcompanha])); });
    });
    if (p.proficienciasAprovadasPeloMestre === true) mesclarProficiencias(prof, p.proficiencias); return prof;
  }
  function condicoes(p) {
    var c = {};
    lista(p.condicoes).forEach(function (r) {
      var id = typeof r === 'string' ? r : r.id || r.nome; if (!id) return;
      id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); if (id === 'amedrontado') id = 'assustado';
      if (id === 'pego-desprevenido' || id === 'pego desprevenido') id = 'desprevenido';
      c[id] = Math.max(c[id] || 0, typeof r === 'string' ? 1 : Math.max(0, numero(r.valor, 1)));
    }); return c;
  }
  // Bônus e penalidade de cada tipo coexistem; dois bônus ou duas penalidades de mesmo tipo não somam.
  function ajuste(p, alvo, automaticos) {
    var grupos = {};
    (p.bonusAprovadosPeloMestre === true ? lista(p.bonus) : []).concat(automaticos || []).forEach(function (b) {
      if (b.alvo !== alvo && b.alvo !== 'todos') return;
      var tipo = b.tipo || 'sem-tipo', v = numero(b.valor, 0);
      if (tipo === 'sem-tipo') { (grupos[tipo] || (grupos[tipo] = [])).push(v); return; }
      var g = grupos[tipo] || (grupos[tipo] = { positivo: 0, negativo: 0 });
      if (v > 0) g.positivo = Math.max(g.positivo, v); else g.negativo = Math.min(g.negativo, v);
    });
    return Object.keys(grupos).reduce(function (sum, k) { var g = grupos[k]; return sum + (Array.isArray(g) ? g.reduce(function (s, v) { return s + v; }, 0) : g.positivo + g.negativo); }, 0);
  }
  function penalidadeEstado(c, atributo, alvo) {
    var v = Math.max(c.assustado || 0, c.enjoado || 0);
    if (atributo === 'for') v = Math.max(v, c.enfraquecido || 0);
    if (atributo === 'des') v = Math.max(v, c.desajeitado || 0);
    if (atributo === 'con') v = Math.max(v, c.drenado || 0);
    if (['int', 'sab', 'car'].indexOf(atributo) !== -1) v = Math.max(v, c.estupefato || 0);
    if ((alvo === 'ca' || ['fortitude', 'reflexos', 'vontade'].indexOf(alvo) !== -1) && c.fatigado) v = Math.max(v, 1);
    if (['ca', 'reflexos', 'percepcao'].indexOf(alvo) !== -1 && c.inconsciente) v = Math.max(v, 4);
    if ((alvo === 'percepcao' || alvo.indexOf('pericia:') === 0) && c.fascinado) v = Math.max(v, 2);
    return { alvo: alvo, tipo: 'estado', valor: -v };
  }
  function ganhos(p, classe, anterior) {
    var de = anterior === undefined ? 0 : anterior;
    var itens = lista(classe && classe.progressao).filter(function (r) { return r.nivel > de && r.nivel <= nivel(p); }).map(copia);
    [5, 10, 15, 20].filter(function (n) { return n > de && n <= nivel(p); }).forEach(function (n) {
      if (!itens.some(function (r) { return r.nivel === n && /melhoria|incremento.*atributo/i.test(r.nome); })) itens.push({ nivel: n, nome: 'Quatro melhorias de atributo', descricao: 'Escolha quatro atributos diferentes. Em +4 ou mais, cada melhoria vale metade de um aumento.', automatico: false });
    }); return itens.sort(function (a, b) { return a.nivel - b.nivel; });
  }
  function talentoAtivo(p, t, r) {
    return r && r.somenteConsulta !== true && Number(t.nivel) >= numero(r.nivel, 1) && Number(t.nivel) <= nivel(p) &&
      (!r.ancestralidade || r.ancestralidade === p.ancestralidadeId) && (!r.classe || r.classe === p.classeId);
  }
  function resolverEquipamento(p, catalogo) {
    var equipamento = {}, runas = {}, problemas = [];
    ['armadura', 'arma', 'escudo'].forEach(function (tipo) {
      var id = p[tipo + 'Id'], r = encontrar(catalogo, 'equipamentos', id);
      if (!r && tipo === 'arma') fontesSelecionadas(p, catalogo).some(function (fonte) { r = lista(fonte.registro.ataques).find(function (a) { return a.id === id; }); return !!r; });
      if (id && (!r || r.tipo !== tipo || r.somenteConsulta === true)) problemas.push('Equipamento inválido ou apenas para consulta: ' + id + '.');
      equipamento[tipo] = r && r.tipo === tipo && r.somenteConsulta !== true ? copia(r) : !id && tipo !== 'escudo' && p.equipamentoAprovadoPeloMestre === true && p[tipo] ? copia(obj(p[tipo])) : null;
      if (!equipamento[tipo] && !id) { var padrao = tipo === 'armadura' ? 'sem-armadura' : tipo === 'arma' ? 'punho' : ''; var base = encontrar(catalogo, 'equipamentos', padrao); if (base && base.somenteConsulta !== true) equipamento[tipo] = copia(base); }
      if (tipo === 'arma' && equipamento.arma && equipamento.arma.dadoPorNivel) equipamento.arma.dano = valorDoNivel(equipamento.arma.dadoPorNivel, nivel(p), equipamento.arma.dano);
      runas[tipo] = {};
      Object.keys(obj(obj(p.runasEquipamento)[tipo])).forEach(function (slot) {
        var idRuna = p.runasEquipamento[tipo][slot]; if (!idRuna) return;
        var r = encontrar(catalogo, 'equipamentos', idRuna), m = obj(r && r.mecanica), familia = slot === 'reforco' ? 'reforcadora' : /^propriedade[123]$/.test(slot) ? 'propriedade' : slot;
        if (!r || r.somenteConsulta === true || r.automatizavel !== true || m.tipo !== 'runa' || m.categoria !== tipo || m.familia !== familia || !equipamento[tipo] || tipo === 'armadura' && equipamento.armadura.id === 'sem-armadura') { problemas.push('Runa inválida ou sem equipamento-base: ' + idRuna + '.'); return; }
        if (lista(m.restricoesArmadura).length && lista(m.restricoesArmadura).indexOf(equipamento[tipo].grau) === -1) { problemas.push('A runa ' + r.nome + ' não pode ser gravada nesta categoria de armadura.'); return; }
        if (m.exigeInvestimento && p.armaduraInvestida !== true) return;
        runas[tipo][slot] = copia(r);
      });
    });
    ['arma', 'armadura'].forEach(function (tipo) {
      var propriedades = Object.keys(runas[tipo]).filter(function (slot) { return /^propriedade[123]$/.test(slot); });
      var capacidade = numero(obj(obj(runas[tipo].potencia).mecanica).valor, 0), grupos = {}, invalido = propriedades.length > capacidade;
      if (invalido) problemas.push('A quantidade de propriedades excede a potência de ' + tipo + '.');
      propriedades.forEach(function (slot) { var m = obj(runas[tipo][slot].mecanica), grupo = m.propriedadeGrupo || runas[tipo][slot].id; if (grupos[grupo]) { invalido = true; problemas.push('Não combine versões da mesma propriedade: ' + grupo + '.'); } grupos[grupo] = true; });
      if (invalido) propriedades.forEach(function (slot) { delete runas[tipo][slot]; });
    });
    var reforco = obj(obj(runas.escudo.reforco).mecanica).reforco || obj(runas.escudo.reforco).reforco;
    if (equipamento.escudo && reforco) {
      var esc = equipamento.escudo;
      ['dureza', 'pv', 'limiarQuebra'].forEach(function (k) {
        var capital = k[0].toUpperCase() + k.slice(1), aumento = numero(reforco['aumento' + capital], numero(reforco[k], 0)), maximo = numero(reforco['maximo' + capital], numero(reforco['max' + capital], Infinity));
        esc[k] = Math.min(numero(esc[k], 0) + aumento, maximo);
      });
    }
    return { equipamento: equipamento, runas: runas, problemas: problemas };
  }
  function efeitosAtivos(p, catalogo, h, equipamento, grauArma) {
    var classe = encontrar(catalogo, 'classes', p.classeId), o = opcao(p, classe);
    var efeitos = [];
    fontesSelecionadas(p, catalogo).forEach(function (fonte) { efeitos = efeitos.concat(lista(fonte.registro.efeitos)); });
    lista(classe && classe.progressao).concat(lista(o && o.progressao)).filter(function (r) { return r.nivel <= nivel(p); }).sort(function (a, b) { return a.nivel - b.nivel; }).forEach(function (r) { efeitos = efeitos.concat(lista(r.efeitos)); });
    var grupos = {}, ativos = [], c = condicoes(p), arm = obj(equipamento && equipamento.armadura), arma = obj(equipamento && equipamento.arma);
    if (o && o.danoFuriaPorNivel) {
      var ataqueInstinto = fontesSelecionadas(p, catalogo).some(function (fonte) { return lista(fonte.registro.ataques).some(function (r) { return r.id === arma.id; }); });
      if ((!o.requerAtaqueDoInstinto || ataqueInstinto) && (!o.requerArmaMaior || p.armaMaior === true)) efeitos.push({ alvo: 'dano', tipo: 'sem-tipo', grupo: 'furia-instinto', valor: numero(valorDoNivel(p.alvoConjurador && o.danoFuriaAlvoConjuradorPorNivel ? o.danoFuriaAlvoConjuradorPorNivel : o.danoFuriaPorNivel, nivel(p), 2), 2), condicao: 'furia', reduzAgil: true, apenasCorpoACorpo: true });
    }
    efeitos.forEach(function (e) {
      if (e.condicao === 'sem-armadura' ? arm.grau && arm.grau !== 'sem' : e.condicao && obj(p.estados)[e.condicao] !== true && !c[e.condicao]) return;
      if (lista(e.excetoArmaduras).indexOf(arm.grau || 'sem') !== -1) return;
      if (e.apenasCorpoACorpo && (arma.distancia || p.armaModo === 'arremesso' || p.armaModo === 'distancia')) return;
      var v = e.valorPorGrauArma ? numero(e.valorPorGrauArma[grauArma], 0) : numero(e.valor, 0);
      if (e.reduzAgil && lista(arma.tracos).indexOf('agil') !== -1) v = Math.floor(v / 2);
      var efeito = Object.assign({}, e, { valor: v * (e.porNivel ? nivel(p) : 1) });
      if (e.grupo) grupos[e.grupo] = efeito; else ativos.push(efeito);
    });
    return ativos.concat(Object.keys(grupos).map(function (k) { return grupos[k]; }));
  }
  function defesasSelecionadas(p, catalogo) {
    var fontes = fontesSelecionadas(p, catalogo).map(function (f) { return f.registro; });
    var classe = encontrar(catalogo, 'classes', p.classeId), o = opcao(p, classe), defesas = { imunidades: [], resistencias: [], fraquezas: [], curaPeloVazio: false };
    fontes = fontes.concat(lista(classe && classe.progressao), lista(o && o.progressao)).filter(function (r) { return !r.nivel || r.nivel <= nivel(p); });
    fontes.forEach(function (r) {
      var d = Object.assign({}, r, obj(r.defesas));
      lista(d.imunidades).forEach(function (tipo) { if (typeof tipo === 'string' && defesas.imunidades.indexOf(tipo) === -1) defesas.imunidades.push(tipo); });
      ['resistencias', 'fraquezas'].forEach(function (k) { lista(d[k]).forEach(function (v) {
        if (!v || typeof v.tipo !== 'string') return;
        var valor = v.metadeNivel ? Math.floor(nivel(p) / 2) : numero(v.valor, 0); valor = Math.max(numero(v.minimo, 0), valor);
        var existente = defesas[k].find(function (x) { return x.tipo === v.tipo; });
        if (existente) existente.valor = Math.max(existente.valor, valor); else if (valor > 0) defesas[k].push(Object.assign({}, v, { valor: valor }));
      }); });
      if (d.curaPeloVazio === true) defesas.curaPeloVazio = true;
    }); return defesas;
  }
  function recursosSelecionados(p, catalogo, at) {
    var recursos = {}, c = condicoes(p);
    fontesSelecionadas(p, catalogo).forEach(function (fonte) { lista(fonte.registro.recursosCalculados).forEach(function (r) {
      if (!r.id || r.nivel && r.nivel > nivel(p)) return;
      var maximo = numero(r.base, 0) + numero(r.porNivel, 0) * nivel(p) + (ATRIBUTOS.indexOf(r.porAtributo) !== -1 ? at[r.porAtributo] : 0);
      maximo = Math.max(numero(r.minimo, 0), Math.min(numero(r.maximo, Infinity), maximo));
      var recuperacao = copia(obj(r.recuperacao)); if (recuperacao.quantidadePorNivel) recuperacao.quantidade = numero(valorDoNivel(recuperacao.quantidadePorNivel, nivel(p), 0), 0);
      recursos[r.id] = Object.assign({}, r, { maximo: maximo, ativo: !r.condicao || obj(p.estados)[r.condicao] === true || !!c[r.condicao], recuperacao: recuperacao });
    }); }); return Object.keys(recursos).map(function (id) { return recursos[id]; });
  }
  function cargaSelecionada(p, catalogo, equipamento, forca) {
    var listaItens = p.equipamentos.slice(), ids = listaItens.map(function (e) { return typeof e === 'string' ? e : e.id; }), unidades = 0, pendentes = [];
    Object.keys(equipamento).forEach(function (tipo) { var r = equipamento[tipo]; if (r && r.id && r.id !== 'sem-armadura' && ids.indexOf(r.id) === -1) listaItens.push({ id: r.id, quantidade: 1 }); });
    listaItens.forEach(function (e) {
      var id = typeof e === 'string' ? e : e.id, q = typeof e === 'string' || e.quantidade === undefined ? 1 : numero(e.quantidade, 0); if (q <= 0 || id === 'sem-armadura') return;
      var r = encontrar(catalogo, 'equipamentos', id);
      if (!r) r = Object.keys(equipamento).map(function (k) { return equipamento[k]; }).find(function (r) { return r && r.id === id; });
      var v = r && r.volume;
      if (v === 'L' || v === 'l') unidades += q;
      else if (typeof v === 'number' && Number.isFinite(v) && v >= 0) unidades += v * 10 * q;
      else if (v === '-' || v === '—') return;
      else if (pendentes.indexOf(id) === -1) pendentes.push(id);
    });
    var volume = Math.floor(unidades / 10);
    return { volume: volume, leves: unidades % 10, limiteSobrecarga: 5 + forca, limiteMaximo: 10 + forca, sobrecarregado: volume > 5 + forca, acimaMaximo: volume > 10 + forca, pendentes: pendentes };
  }
  function calcular(personagem, catalogo) {
    var p = normalizar(personagem, catalogo), n = nivel(p), a = atributos(p, catalogo), at = a.valores;
    var classe = encontrar(catalogo, 'classes', p.classeId), anc = encontrar(catalogo, 'ancestralidades', p.ancestralidadeId), bio = encontrar(catalogo, 'biografias', p.biografiaId);
    var o = opcao(p, classe), h = heranca(p, anc, catalogo), prof = proficienciasClasse(p, classe, catalogo), c = condicoes(p), resolvido = resolverEquipamento(p, catalogo);
    var divindade = divindadeSelecionada(p, catalogo);
    var arm = obj(resolvido.equipamento.armadura), arma = obj(resolvido.equipamento.arma), escudo = resolvido.equipamento.escudo;
    var carga = cargaSelecionada(p, catalogo, resolvido.equipamento, at.for); if (carga.sobrecarregado) c.desajeitado = Math.max(c.desajeitado || 0, 1);
    var grauArma = arma.grau || 'simples'; if (['desarmado', 'desarmados', 'desarmadas'].indexOf(grauArma) !== -1) grauArma = prof.armas.desarmados === undefined ? 'desarmado' : 'desarmados';
    var graduacaoArma = grau(prof.armas[grauArma]);
    if (divindade && arma.id === (divindade.armaFavorecidaId || divindade.armaFavorecida)) graduacaoArma = Math.max(graduacaoArma, grau(prof.armas.simples));
    lista(classe && classe.proficienciasGruposArma).filter(function (r) { return r.nivel <= n && obj(p.escolhasClasse)[r.escolha] === arma.grupo; }).sort(function (a, b) { return a.nivel - b.nivel; }).forEach(function (r) { graduacaoArma = Math.max(graduacaoArma, grau(r[grauArma])); });
    var efeitos = efeitosAtivos(p, catalogo, h, resolvido.equipamento, graduacaoArma);
    ['arma', 'armadura'].forEach(function (tipo) { Object.keys(resolvido.runas[tipo]).forEach(function (slot) { if (/^propriedade[123]$/.test(slot)) efeitos = efeitos.concat(lista(obj(resolvido.runas[tipo][slot].mecanica).efeitos)); }); });
    var extrasTreino = ajuste(p, 'treinamentos', efeitos);
    function total(alvo, atributo, g, extras) { return at[atributo] + proficiencia(g, n) + ajuste(p, alvo, [penalidadeEstado(c, atributo, alvo)].concat(efeitos, extras || [])); }
    var potenciaArmadura = numero(obj(obj(resolvido.runas.armadura.potencia).mecanica).valor, 0);
    var def = [{ alvo: 'ca', tipo: 'item', valor: numero(arm.ca, 0) + potenciaArmadura }, penalidadeEstado(c, 'des', 'ca')].concat(efeitos);
    if (c.desprevenido || c.inconsciente || c.prostrado) def.push({ alvo: 'ca', tipo: 'circunstancia', valor: -2 });
    var ca = 10 + Math.min(at.des, numero(arm.limiteDes, Infinity)) + proficiencia(prof.armaduras[arm.grau || 'sem'], n) + ajuste(p, 'ca', def);
    var resiliente = numero(obj(obj(resolvido.runas.armadura.resiliente).mecanica).valor, 0);
    function bonusSave(alvo) { return [{ alvo: alvo, tipo: 'item', valor: resiliente }]; }
    var salv = { fortitude: total('fortitude', 'con', prof.salvaguardas.fortitude, bonusSave('fortitude')), reflexos: total('reflexos', 'des', prof.salvaguardas.reflexos, bonusSave('reflexos')), vontade: total('vontade', 'sab', prof.salvaguardas.vontade, bonusSave('vontade')) };
    var grausPericias = Object.assign({}, p.pericias);
    fontesSelecionadas(p, catalogo).forEach(function (fonte) { lista(fonte.registro.periciasFixas).forEach(function (s) { grausPericias[s] = Math.max(1, grau(grausPericias[s])); }); });
    var skillHeranca = periciaHeranca(p, h);
    if (skillHeranca) grausPericias[skillHeranca.id] = Math.max(skillHeranca.grau, grau(grausPericias[skillHeranca.id]));
    var inicial = obj(p.escolhasClasse).periciaInicial;
    if (lista(classe && classe.periciasEscolha).indexOf(inicial) !== -1) grausPericias[inicial] = Math.max(1, grau(grausPericias[inicial]));
    var escolhida = obj(p.escolhasClasse).periciaEspecializacao;
    if (lista(o && o.periciasEscolha).indexOf(escolhida) !== -1) grausPericias[escolhida] = Math.max(1, grau(grausPericias[escolhida]));
    if (bio && bio.pericia) grausPericias[bio.pericia] = Math.max(1, grau(grausPericias[bio.pericia]));
    var bioEscolha = obj(p.escolhasBiografia).pericia;
    if (lista(bio && bio.periciasEscolha).indexOf(bioEscolha) !== -1) grausPericias[bioEscolha] = Math.max(1, grau(grausPericias[bioEscolha]));
    if (bio && bio.saber) grausPericias['saber:' + bio.saber] = Math.max(1, grau(grausPericias['saber:' + bio.saber]));
    var periciaDivina = obj(p.escolhasClasse).periciaDivindade;
    if (lista(divindade && divindade.periciasOpcoes).indexOf(periciaDivina) !== -1) grausPericias[periciaDivina] = Math.max(1, grau(grausPericias[periciaDivina]));
    var saberClasse = saberEscolhido(p, classe, o); if (saberClasse) grausPericias[saberClasse] = Math.max(1, grau(grausPericias[saberClasse]));
    Object.keys(obj(classe && classe.restricoesIncrementosExtra)).map(Number).sort(function (a, b) { return a - b; }).filter(function (l) { return l <= n; }).forEach(function (l) { var id = obj(p.incrementosPericiaExtras)[l]; if (periciasPermitidas(classe.restricoesIncrementosExtra[l], o).indexOf(id) !== -1 && grau(grausPericias[id]) > 0) grausPericias[id] = Math.min(4, grau(grausPericias[id]) + 1); });
    var skills = {}, suficienteForca = arm.forca !== undefined && at.for >= numero(arm.forca, 0), barulhenta = lista(arm.tracos).some(function (t) { return t === 'barulhenta' || t === 'ruidosa'; });
    PERICIAS.forEach(function (s) {
      var extra = [], fisica = s.atributo === 'for' || s.atributo === 'des';
      var flexivel = lista(arm.tracos).indexOf('flexivel') !== -1 && (s.id === 'acrobacia' || s.id === 'atletismo');
      if ((fisica && !suficienteForca && !flexivel && !(barulhenta && s.id === 'furtividade')) || (barulhenta && s.id === 'furtividade')) extra.push({ alvo: 'pericia:' + s.id, tipo: 'sem-tipo', valor: -Math.abs(numero(arm.penalidade, 0)) });
      skills[s.id] = total('pericia:' + s.id, s.atributo, grausPericias[s.id], extra);
    });
    Object.keys(grausPericias).filter(function (s) { return s.indexOf('saber:') === 0; }).forEach(function (s) { skills[s] = total('pericia:' + s, 'int', grausPericias[s]); });
    var distancia = p.armaModo === 'arremesso' || p.armaModo === 'distancia' || arma.distancia;
    var atributoAtaque = distancia || arma.atributo === 'des' || (lista(arma.tracos).indexOf('acuidade') !== -1 && at.des > at.for) ? 'des' : 'for';
    var agilOuAcuidade = lista(arma.tracos).some(function (t) { return t === 'agil' || t === 'acuidade'; });
    var permitePorretes = p.talentos.some(function (t) { var r = encontrar(catalogo, 'talentos', t.id); return talentoAtivo(p, t, r) && r.permiteEstratagemaPorretes === true; });
    var estratagemaElegivel = !!arma.distancia || agilOuAcuidade || permitePorretes && arma.grupo === 'porrete', estratagemaAtivo = classe && classe.id === 'investigador' && obj(p.estados).estratagema === true && estratagemaElegivel;
    if (estratagemaAtivo) atributoAtaque = 'int';
    var bonusArma = [{ alvo: 'ataque', tipo: 'item', valor: Math.max(numero(arma.bonus, 0), numero(obj(obj(resolvido.runas.arma.potencia).mecanica).valor, 0)) }]; if (c.prostrado) bonusArma.push({ alvo: 'ataque', tipo: 'circunstancia', valor: -2 });
    var velocidade = numero(h && h.deslocamento, numero(anc && anc.deslocamento, 7.5)), reducao = Math.abs(numero(arm.penalidadeDeslocamento, 0)); if (suficienteForca) reducao = Math.max(0, reducao - 1.5);
    reducao += Math.abs(numero(escudo && escudo.penalidadeDeslocamento, 0)) + (carga.sobrecarregado ? 3 : 0);
    var chave = ATRIBUTOS.indexOf(p.atributoChave) !== -1 ? p.atributoChave : lista(o && o.atributoChave)[0] || lista(classe && classe.atributoChave)[0] || 'for';
    var conj = conjuracaoBase(p, classe, catalogo);
    if (conj) {
      var linhas = Array.isArray(conj.espacosPorNivel) ? conj.espacosPorNivel : Object.keys(obj(conj.espacosPorNivel)).map(function (l) {
        var row = conj.espacosPorNivel[l], espacos = {};
        if (Array.isArray(row)) row.forEach(function (q, i) { if (q > 0) espacos[i + 1] = q; }); else espacos = obj(row.espacos || row);
        return { nivel: Number(l), espacos: espacos };
      });
      var tabela = linhas.filter(function (r) { return r.nivel <= n; }).sort(function (a, b) { return a.nivel - b.nivel; });
      var linha = tabela[tabela.length - 1]; conj.espacos = copia(obj(linha && linha.espacos)); if (linha && linha.truques !== undefined) conj.truques = linha.truques;
      p.talentos.forEach(function (t) { var r = encontrar(catalogo, 'talentos', t.id); if (talentoAtivo(p, t, r)) conj.truques = numero(conj.truques, 0) + numero(obj(r.conjuracao).truquesExtras, 0); });
      var curriculo = obj(conj.extrasCurriculo);
      if (Object.keys(curriculo).length && p.opcaoClasseId && p.opcaoClasseId !== curriculo.excetoOpcao) {
        conj.truques = numero(conj.truques, 0) + numero(curriculo.truques, 0); conj.extraCurriculo = {};
        Object.keys(conj.espacos).forEach(function (r) { if (Number(r) < 10) conj.extraCurriculo[r] = numero(curriculo.espacosPorRanque, 0); });
      }
      var fonte = obj(conj.fonteDivina), ft = lista(fonte.espacos).filter(function (r) { return r.nivel <= n; }).sort(function (a, b) { return a.nivel - b.nivel; });
      if (ft.length) { var fontesPermitidas = lista(divindade && divindade.fontesDivinas); conj.fonteDivina = Object.assign({}, fonte, { opcoes: fontesPermitidas, quantidade: ft[ft.length - 1].quantidade, ranque: Math.ceil(n / 2), magia: fontesPermitidas.length === 1 ? fontesPermitidas[0] : fontesPermitidas.indexOf(obj(p.escolhasClasse).fonteDivina) !== -1 ? p.escolhasClasse.fonteDivina : null }); }
      var focos = {};
      p.magias.forEach(function (m) { var r = encontrar(catalogo, 'magias', typeof m === 'string' ? m : m.id); if (r && r.tipo === 'foco' && magiaElegivel(p, r.id, catalogo)) focos[r.id] = true; });
      conj.foco = Math.min(3, Math.max(numero(conj.focoInicial, 0), Object.keys(focos).length));
      conj.ranqueFoco = Math.ceil(n / 2);
      if (!conj.preparacao && conj.tipo === 'espontanea') conj.preparacao = 'espontanea';
      conj.repertorioEscolhido = mapaDoNivel(conj.repertorioEscolhidoPorNivel, n);
      conj.repertorioTotal = mapaDoNivel(conj.repertorioPorNivel, n);
      if (!Object.keys(conj.repertorioEscolhido).length && conj.preparacao === 'espontanea') conj.repertorioEscolhido = Object.assign({}, conj.espacos);
      if (conj.conhecidas) conj.conhecidasMinimos = { truques: numero(conj.conhecidas.truques, 0), magias: numero(conj.conhecidas.magiasIniciais, 0) + numero(conj.conhecidas.magiasPorNivel, 0) * (n - 1) + numero(conj.conhecidas.magiasPorNovoRanque, 0) * (Math.ceil(n / 2) - 1) };
    }
    var especificacoes = lista(classe && classe.especializacaoArma).filter(function (r) { return r.nivel <= n; }).sort(function (a, b) { return a.nivel - b.nivel; });
    if (especificacoes.length) efeitos.push({ alvo: 'dano', tipo: 'sem-tipo', valor: numero(obj(especificacoes[especificacoes.length - 1].porGrau)[graduacaoArma], 0) });
    var bonusDano = ajuste(p, 'dano', efeitos), dados = Math.max(1, numero(obj(obj(resolvido.runas.arma.impactante).mecanica).valor, 0));
    var danoBase = /^([0-9]+)d([0-9]+)$/.exec(arma.dano || ''), faces = danoBase ? Number(danoBase[2]) : 4;
    if (classe && classe.dadoMinimoPunho && arma.id === 'punho') faces = Math.max(faces, numero(classe.dadoMinimoPunho, faces));
    if (!resolvido.runas.arma.impactante && danoBase) dados = Number(danoBase[1]);
    var facesPorMaos = { 1: faces, 2: faces };
    lista(arma.tracos).forEach(function (t) { var m = /^duas-maos-d([0-9]+)$/.exec(t); if (m) facesPorMaos[2] = Number(m[1]); });
    var mortal = fontesSelecionadas(p, catalogo).some(function (fonte) { return fonte.registro.melhoraArmaFavorecidaSimples === true || fonte.registro.simplicidadeMortalSeArmaFavorecidaSimples === true; });
    if (mortal && divindade && arma.id === (divindade.armaFavorecidaId || divindade.armaFavorecida)) {
      [1, 2].forEach(function (maos) {
        var v = facesPorMaos[maos];
        if (['desarmado', 'desarmados', 'desarmadas'].indexOf(arma.grau) !== -1) facesPorMaos[maos] = Math.max(6, v);
        else if (arma.grau === 'simples') { var passos = [4, 6, 8, 10, 12], indiceDado = passos.indexOf(v); if (indiceDado !== -1) facesPorMaos[maos] = passos[Math.min(passos.length - 1, indiceDado + 1)]; }
      });
    }
    faces = facesPorMaos[p.armaMaos === 2 ? 2 : 1];
    var atributoDano = !distancia || p.armaModo === 'arremesso' ? 'for' : null;
    if (classe && classe.id === 'ladino' && o && o.id === 'ladrao' && !distancia && lista(arma.tracos).indexOf('acuidade') !== -1) atributoDano = 'des';
    var propulsiva = lista(arma.tracos).some(function (t) { return t === 'propulsivo' || t === 'propulsiva'; });
    if (atributoDano === 'for' || propulsiva) bonusDano = ajuste(p, 'dano', efeitos.concat([{ alvo: 'dano', tipo: 'estado', valor: -(c.enfraquecido || 0) }]));
    var bonusAtributoDano = atributoDano ? at[atributoDano] : propulsiva ? at.for < 0 ? at.for : Math.floor(at.for / 2) : 0;
    var tipoFuria = fontesSelecionadas(p, catalogo).map(function (fonte) { return fonte.registro.tipoDanoFuria; }).find(function (t) { return typeof t === 'string'; });
    var efeitoFuria = efeitos.find(function (e) { return e.grupo === 'furia-instinto' && e.alvo === 'dano'; }), danoExtraFuria = null;
    if (tipoFuria && efeitoFuria && efeitoFuria.valor > 0) { danoExtraFuria = { valor: efeitoFuria.valor, tipo: tipoFuria }; bonusDano -= efeitoFuria.valor; }
    var somaDano = bonusDano + bonusAtributoDano;
    var caSemEscudo = ca, intacto = escudo && p.escudoQuebrado !== true && (p.escudoPv === undefined || numero(p.escudoPv, 0) > numero(escudo.limiarQuebra, 0));
    var caComEscudo = ca + (intacto ? ajuste(p, 'ca', def.concat([{ alvo: 'ca', tipo: 'circunstancia', valor: p.escudoCobertura && escudo.caCobertura ? escudo.caCobertura : numero(escudo.ca, 0) }])) - ajuste(p, 'ca', def) : 0);
    if (p.escudoErguido) ca = caComEscudo;
    var ataque = at[atributoAtaque] + proficiencia(graduacaoArma, n) + ajuste(p, 'ataque', bonusArma.concat(efeitos, [penalidadeEstado(c, atributoAtaque, 'ataque')])), map = lista(arma.tracos).indexOf('agil') !== -1 ? [0, -4, -8] : [0, -5, -10];
    var pvBase = anc && classe ? numero(h && h.pv, numero(anc.pv, 0)) + (numero(classe.pv, 0) + at.con) * n : 0;
    var danosExtras = [];
    function precisao(tabela, ativa, nome) { var rows = lista(tabela).filter(function (r) { return r.nivel <= n; }).sort(function (a, b) { return a.nivel - b.nivel; }); if (ativa && rows.length) danosExtras.push({ nome: nome, expressao: rows[rows.length - 1].dano, tipo: 'precisao' }); }
    precisao(classe && classe.ataqueFurtivo, obj(p.estados).alvoDesprevenido === true && (distancia || agilOuAcuidade), 'Ataque Furtivo');
    precisao(classe && classe.ataqueEstrategico, estratagemaAtivo, 'Ataque Estratégico');
    return { atributos: at, incrementosParciais: a.parciais, pvMaximos: Math.max(0, pvBase - (c.drenado || 0) * n + ajuste(p, 'pv', efeitos)), ca: ca,
      percepcao: total('percepcao', 'sab', prof.percepcao), salvaguardas: salv, pericias: skills, grausPericias: grausPericias, proficiencias: prof,
      cdClasse: 10 + total('cdClasse', chave, prof.cdClasse), cdMagia: conj ? 10 + total('cdMagia', conj.atributo || chave, prof.conjuracao) : null,
      ataqueMagia: conj ? total('ataqueMagia', conj.atributo || chave, prof.conjuracao) : null, deslocamento: Math.max(1.5, velocidade - reducao + ajuste(p, 'deslocamento', efeitos)),
      ataque: ataque, ataques: map.map(function (v) { return ataque + v; }), danoArma: dados + 'd' + faces + (somaDano ? (somaDano > 0 ? '+' : '') + somaDano : '') + (danoExtraFuria ? ' + ' + danoExtraFuria.valor + ' (' + danoExtraFuria.tipo + ')' : ''), atributoDanoArma: atributoDano, danoExtraFuria: danoExtraFuria,
      equipamento: resolvido.equipamento, escudoCalculado: resolvido.equipamento.escudo, bloqueioEscudo: !!resolvido.equipamento.escudo && fontesSelecionadas(p, catalogo).some(function (fonte) { return fonte.registro.somenteConsulta !== true && (fonte.registro.bloqueioEscudo === true || lista(fonte.registro.capacidades).indexOf('bloqueio-com-escudo') !== -1); }), armaSelecionada: resolvido.equipamento.arma, graduacaoArma: graduacaoArma, dadosArma: dados, facesDanoArma: faces, facesDanoArmaPorMaos: facesPorMaos, bonusDanoArma: bonusDano,
      caSemEscudo: caSemEscudo, caComEscudo: caComEscudo, conjuracao: conj, defesas: defesasSelecionadas(p, catalogo), recursosCalculados: recursosSelecionados(p, catalogo, at), atletismoAtaque: total('pericia:atletismo', 'for', grausPericias.atletismo),
      natacao: h && h.natacao !== undefined ? Math.max(1.5, numero(h.natacao, 0) - reducao) : null,
      map: map, ganhos: ganhos(p, classe), treinamentosExtras: extrasTreino, carga: carga, danosExtras: danosExtras, atributoAtaqueArma: atributoAtaque,
      periciasTreinadasEscolhidas: Math.max(0, numero(classe && classe.periciasTreinadas, 0) + at.int) + extrasTreino };
  }
  function grauSucesso(d20, total, cd) {
    if (!Number.isInteger(d20) || d20 < 1 || d20 > 20 || !Number.isFinite(total) || !Number.isFinite(cd)) throw new TypeError('Informe um d20 de 1 a 20, total e CD numéricos.');
    var r = total >= cd + 10 ? 3 : total >= cd ? 2 : total <= cd - 10 ? 0 : 1;
    if (d20 === 20) r = Math.min(3, r + 1); if (d20 === 1) r = Math.max(0, r - 1);
    return ['falha-critica', 'falha', 'sucesso', 'sucesso-critico'][r];
  }
  function niveisPericia(classe) {
    if (Array.isArray(classe && classe.incrementosPericia)) return classe.incrementosPericia;
    return classe && ['ladino', 'investigador'].indexOf(classe.id) !== -1 ? Array.from({ length: 19 }, function (_, i) { return i + 2; }) : [3, 5, 7, 9, 11, 13, 15, 17, 19];
  }
  function niveisPericiaNormais(classe) {
    var ls = niveisPericia(classe).slice(); Object.keys(obj(classe && classe.restricoesIncrementosExtra)).forEach(function (l) { var i = ls.indexOf(Number(l)); if (i !== -1) ls.splice(i, 1); }); return ls;
  }
  function slotsTalento(classe, tipo) {
    if (Array.isArray(obj(classe && classe.niveisTalentos)[tipo])) return classe.niveisTalentos[tipo];
    if (tipo === 'ancestralidade') return [1, 5, 9, 13, 17]; if (tipo === 'geral') return [3, 7, 11, 15, 19];
    if (tipo === 'pericia') return classe && ['ladino', 'investigador'].indexOf(classe.id) !== -1 ? Array.from({ length: 20 }, function (_, i) { return i + 1; }) : [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    if (tipo === 'classe') {
      var ns = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
      if (classe && ['guerreiro', 'ladino', 'patrulheiro', 'alquimista', 'barbaro', 'campeao', 'investigador', 'monge', 'espadachim'].indexOf(classe.id) !== -1) ns.unshift(1); return ns;
    } return [];
  }
  function escolhasTalentos(personagem, catalogo) {
    var p = normalizar(personagem), classe = encontrar(catalogo, 'classes', p.classeId), slots = [];
    if (classe) ['ancestralidade', 'classe', 'pericia', 'geral'].forEach(function (tipo) { slotsTalento(classe, tipo).filter(function (l) { return l <= nivel(p); }).forEach(function (l) { slots.push({ tipo: tipo, nivel: l, origem: null, quantidade: 1 }); }); });
    fontesSelecionadas(p, catalogo).forEach(function (fonte) { lista(fonte.registro.bonusTalentos).forEach(function (b) {
      if (fonte.registro.somenteConsulta !== true && Number(b.nivel) >= numero(fonte.nivelConcessao, 1) && Number(b.nivel) <= nivel(p) && ['ancestralidade', 'classe', 'pericia', 'geral'].indexOf(b.tipo) !== -1) slots.push({ tipo: b.tipo, nivel: Number(b.nivel), origem: fonte.origem, quantidade: Math.max(1, Math.trunc(numero(b.quantidade, 1))) });
    }); });
    return slots;
  }
  function validarPreparacao(p, catalogo, conj, o, erros, pendencias) {
    if (conj.preparacao !== 'preparada') return;
    var preparadas = obj(p.magiasPreparadas), conhecidos = p.magias.map(function (m) { return typeof m === 'string' ? m : m.id; });
    function verificar(id, rank, tipo) {
      var r = encontrar(catalogo, 'magias', id); if (!r || r.somenteConsulta === true) { erros.push('Preparação usa magia desconhecida ou apenas para consulta: ' + id + '.'); return; }
      var truque = r.tipo !== 'foco' && (r.tipo === 'truque' || r.truque === true || numero(r.nivel, 0) === 0), minimo = numero(r.ordem, numero(r.ranque, numero(r.nivel, 0)));
      if (tipo === 'truque' ? !truque : truque || r.tipo === 'foco' || minimo > rank) erros.push('Magia incompatível com o espaço preparado: ' + r.nome + '.');
      if (!magiaElegivel(p, id, catalogo)) erros.push('Magia preparada não concedida ou fora da tradição: ' + r.nome + '.');
      if (conhecidos.indexOf(id) === -1 && ['clerigo', 'druida'].indexOf(p.classeId) === -1) erros.push('Magia preparada não consta no grimório ou familiar: ' + r.nome + '.');
      var curriculares = [];
      lista(o && o.magiasCurriculo).forEach(function (row) { if (typeof row === 'string') curriculares.push(row); else if (numero(row.ranque, 0) <= rank) curriculares = curriculares.concat(lista(row.magias)); });
      if (tipo === 'curriculo' && curriculares.indexOf(id) === -1) erros.push('Magia não confirmada no currículo desta escola: ' + r.nome + '.');
    }
    var truques = lista(preparadas.truques), maxTruques = numero(conj.truques, 0);
    if (new Set(truques).size !== truques.length) erros.push('Truques preparados precisam ser diferentes.');
    if (truques.length > maxTruques) erros.push('Truques preparados acima do orçamento.'); else if (truques.length < maxTruques) pendencias.push('Prepare os truques restantes (' + (maxTruques - truques.length) + ').');
    truques.forEach(function (id) { verificar(id, 0, 'truque'); });
    ['padrao', 'curriculo'].forEach(function (tipo) {
      var slots = tipo === 'padrao' ? obj(conj.espacos) : obj(conj.extraCurriculo), escolhidas = obj(preparadas[tipo]);
      Object.keys(slots).forEach(function (rank) { var ids = lista(escolhidas[rank]); if (ids.length > slots[rank]) erros.push('Preparação acima dos espaços de ' + tipo + ' da ordem ' + rank + '.'); else if (ids.length < slots[rank]) pendencias.push('Prepare os espaços restantes de ' + tipo + ' da ordem ' + rank + ' (' + (slots[rank] - ids.length) + ').'); ids.forEach(function (id) { verificar(id, Number(rank), tipo); }); });
      Object.keys(escolhidas).forEach(function (rank) { if (!(rank in slots) && lista(escolhidas[rank]).length) erros.push('Não existem espaços preparados de ' + tipo + ' da ordem ' + rank + '.'); });
      var gastos = obj(obj(p.preparacaoGasta)[tipo]); Object.keys(gastos).forEach(function (rank) { var indices = lista(gastos[rank]); if (new Set(indices).size !== indices.length || indices.some(function (i) { return !Number.isInteger(i) || i < 0 || i >= lista(escolhidas[rank]).length; })) erros.push('Consumo de espaço preparado inválido em ' + tipo + ' da ordem ' + rank + '.'); });
    });
  }
  function validar(personagem, catalogo) {
    var p = normalizar(personagem, catalogo), n = nivel(p), erros = [], avisos = [], pendencias = [];
    var classe = encontrar(catalogo, 'classes', p.classeId), anc = encontrar(catalogo, 'ancestralidades', p.ancestralidadeId), bio = encontrar(catalogo, 'biografias', p.biografiaId), h = heranca(p, anc, catalogo), o = opcao(p, classe);
    var divindade = divindadeSelecionada(p, catalogo), concedeDominio = fontesSelecionadas(p, catalogo).some(function (f) { return f.registro.concedeDominio === true; });
    if (concedeDominio && (!divindade || lista(divindade.dominios).indexOf(obj(p.escolhasClasse).dominio) === -1 || !encontrar(catalogo, 'dominios', obj(p.escolhasClasse).dominio))) pendencias.push('Escolha um domínio concedido por sua divindade.');
    if (lista(divindade && divindade.periciasOpcoes).length && lista(divindade.periciasOpcoes).indexOf(obj(p.escolhasClasse).periciaDivindade) === -1) pendencias.push('Escolha a perícia concedida por sua divindade.');
    var santificacao = obj(divindade && divindade.santificacao);
    if (santificacao.obrigatoria && lista(santificacao.opcoes).indexOf(obj(p.escolhasClasse).santificacao) === -1) pendencias.push('Escolha a santificação exigida por sua divindade.');
    if (obj(p.escolhasClasse).santificacao && lista(santificacao.opcoes).length && lista(santificacao.opcoes).indexOf(p.escolhasClasse.santificacao) === -1) erros.push('A santificação escolhida não é permitida por sua divindade.');
    if (!String(p.nome || '').trim()) pendencias.push('Informe o nome do personagem.');
    if (!classe) pendencias.push('Escolha uma classe do Remaster.'); if (!anc) pendencias.push('Escolha uma ancestralidade do Remaster.'); if (!bio) pendencias.push('Escolha uma biografia.');
    if (!Number.isInteger(Number(p.nivel)) || Number(p.nivel) < 1 || Number(p.nivel) > 20) erros.push('O nível precisa estar entre 1 e 20.');
    if (p.sistema !== 'pathfinder-2e-remaster') erros.push('Esta ficha pertence a outro sistema.');
    if (p.proficiencias && p.proficienciasAprovadasPeloMestre !== true) avisos.push('Exceções de proficiência precisam ser aprovadas pelo mestre e não foram aplicadas.');
    function lote(nome, valores, quantidade) {
      var vs = lista(valores); if (vs.length < quantidade) pendencias.push(nome + ': faltam ' + (quantidade - vs.length) + ' melhorias.');
      if (vs.length > quantidade) erros.push(nome + ': melhorias acima do orçamento (' + quantidade + ').');
      if (new Set(vs).size !== vs.length) erros.push(nome + ': cada melhoria deve ir para um atributo diferente.');
      if (vs.some(function (v) { return ATRIBUTOS.indexOf(v) === -1; })) erros.push(nome + ': atributo desconhecido.');
    }
    lote('Ancestralidade', p.incrementos.ancestralidade, p.ancestralidadeAlternativa || !anc ? 2 : lista(anc.incrementos).length + numero(anc.livres, 0));
    lote('Biografia', p.incrementos.biografia, 2); lote('Classe', p.incrementos.classe, 1); lote('Quatro livres', p.incrementos.livres, 4);
    if (!p.ancestralidadeAlternativa && anc && lista(anc.incrementos).some(function (v) { return lista(p.incrementos.ancestralidade).indexOf(v) === -1; })) erros.push('As melhorias fixas da ancestralidade precisam ser incluídas.');
    if (bio && bio.dependeDivindade) avisos.push('A biografia depende da divindade: confira atributo divino, perícia divina e Saber com o mestre. Esses benefícios não foram adivinhados.');
    if (bio && !bio.dependeDivindade && lista(p.incrementos.biografia).length === 2 && !lista(p.incrementos.biografia).some(function (v) { return lista(bio.atributos).indexOf(v) !== -1; })) erros.push('Uma melhoria da biografia deve usar um dos atributos indicados por ela.');
    if (bio && lista(bio.periciasEscolha).length && lista(bio.periciasEscolha).indexOf(obj(p.escolhasBiografia).pericia) === -1) pendencias.push('Escolha a perícia concedida pela biografia.');
    var chaves = o && Array.isArray(o.atributoChave) ? o.atributoChave : lista(classe && classe.atributoChave);
    if (classe && chaves.indexOf(p.atributoChave) === -1) pendencias.push('Escolha um atributo-chave permitido pela classe.');
    if (lista(p.incrementos.classe).length && p.incrementos.classe[0] !== p.atributoChave) erros.push('A melhoria da classe deve usar seu atributo-chave.');
    if (classe && classe.opcoesObrigatorias !== false && lista(classe.opcoes).length && !o) pendencias.push('Escolha uma opção da classe.');
    if (classe && lista(classe.periciasEscolha).length && lista(classe.periciasEscolha).indexOf(obj(p.escolhasClasse).periciaInicial) === -1) pendencias.push('Escolha a perícia inicial concedida pela classe.');
    if (o && lista(o.periciasEscolha).length && lista(o.periciasEscolha).indexOf(obj(p.escolhasClasse).periciaEspecializacao) === -1) pendencias.push('Escolha a perícia da especialização de classe.');
    if ((classe && classe.periciaSaberEscolha || o && o.periciaSaberEscolha) && !saberEscolhido(p, classe, o)) pendencias.push('Escolha o Saber concedido pela classe.');
    if (anc && lista(anc.herancas).length && !h) pendencias.push('Escolha uma herança válida.');
    if (h && lista(h.periciasEscolha).length && !periciaHeranca(p, h)) pendencias.push('Escolha a perícia concedida pela herança.');
    [5, 10, 15, 20].filter(function (l) { return l <= n; }).forEach(function (l) { lote('Nível ' + l, p.incrementos.nivel[l], 4); });
    Object.keys(p.incrementos.nivel).forEach(function (l) { if ([5, 10, 15, 20].indexOf(Number(l)) === -1 || Number(l) > n) erros.push('Melhorias de atributo não disponíveis no nível ' + l + '.'); });
    if (new Set(lista(p.defeitosVoluntarios)).size !== lista(p.defeitosVoluntarios).length || lista(p.defeitosVoluntarios).some(function (a) { return ATRIBUTOS.indexOf(a) === -1; })) erros.push('Cada defeito voluntário precisa usar um atributo válido diferente.');
    var calculo = calcular(p, catalogo);
    p.equipamentos.forEach(function (e) { if (typeof e !== 'string' && (!Number.isSafeInteger(e.quantidade === undefined ? 1 : e.quantidade) || e.quantidade < 0)) erros.push('Quantidade de item inválida: ' + e.id + '.'); });
    if (calculo.carga.pendentes.length) pendencias.push('Volume ainda não confirmado para: ' + calculo.carga.pendentes.join(', ') + '.');
    if (calculo.carga.acimaMaximo) avisos.push('A carga excede o máximo que o personagem pode carregar.');
    erros = erros.concat(resolverEquipamento(p, catalogo).problemas);
    var armaEquipada = obj(calculo.equipamento.arma);
    if (p.armaModo === 'arremesso' && !lista(armaEquipada.tracos).some(function (t) { return /^arremesso/.test(t); })) erros.push('Esta arma não possui traço arremesso.');
    if (p.armaModo === 'distancia' && !armaEquipada.distancia) erros.push('Esta arma não permite ataque à distância nesse modo.');
    if (p.armaModo === 'corpo-a-corpo' && armaEquipada.distancia) erros.push('Esta arma à distância não possui ataque corpo a corpo catalogado.');
    if (p.armaMaos === 1 && numero(armaEquipada.maos, 1) === 2) erros.push('Esta arma exige duas mãos para ser empunhada.');
    if (obj(obj(p.runasEquipamento).armadura) && Object.keys(obj(obj(p.runasEquipamento).armadura)).some(function (s) { return p.runasEquipamento.armadura[s]; }) && p.armaduraInvestida !== true) avisos.push('As runas de armadura só entram no cálculo depois de investir a armadura.');
    fontesSelecionadas(p, catalogo).forEach(function (fonte) { lista(fonte.registro.escolhasExtras).filter(function (e) { return e.nivel <= n; }).forEach(function (e) { if (lista(e.opcoes).length && !lista(e.opcoes).some(function (r) { return (typeof r === 'string' ? r : r.id) === obj(p.escolhasClasse)[e.id]; })) pendencias.push('Escolha ' + (e.nome || e.id) + ' para o benefício do nível ' + e.nivel + '.'); }); });
    Object.keys(obj(classe && classe.restricoesIncrementosExtra)).filter(function (l) { return Number(l) <= n; }).forEach(function (l) { if (periciasPermitidas(classe.restricoesIncrementosExtra[l], o).indexOf(obj(p.incrementosPericiaExtras)[l]) === -1) pendencias.push('Escolha a perícia permitida para o incremento extra do nível ' + l + '.'); });
    ATRIBUTOS.forEach(function (a) { if (calculo.atributos[a] < -1 || n === 1 && calculo.atributos[a] > 4) erros.push('Modificador inicial inválido em ' + a + '.'); });
    var aumentos = 0, treinoHeranca = periciaHeranca(p, h);
    Object.keys(p.pericias).forEach(function (s) {
      var v = p.pericias[s]; if (!Number.isInteger(v) || v < 0 || v > 4) erros.push('Graduação de perícia inválida: ' + s + '.');
      if (v === 3 && n < 7 || v === 4 && n < 15) erros.push('A graduação de ' + s + ' exige nível ' + (v === 3 ? 7 : 15) + '.');
      if (v > 1) aumentos += Math.max(0, v - (treinoHeranca && treinoHeranca.id === s ? treinoHeranca.grau : 1));
    });
    Object.keys(calculo.grausPericias).forEach(function (s) { var g = grau(calculo.grausPericias[s]); if (g === 3 && n < 7 || g === 4 && n < 15) erros.push('A graduação calculada de ' + s + ' ainda não está disponível no nível atual.'); });
    var fixos = fontesSelecionadas(p, catalogo).reduce(function (s, fonte) { return s + lista(fonte.registro.periciasFixas).length; }, 0);
    var iniciais = Math.max(0, numero(classe && classe.periciasTreinadas, 0) + calculo.atributos.int) + calculo.treinamentosExtras + fixos + (lista(classe && classe.periciasEscolha).length ? 1 : 0) + (lista(o && o.periciasEscolha).length ? 1 : 0) + (lista(divindade && divindade.periciasOpcoes).length ? 1 : 0) + (classe && classe.periciaSaberEscolha || o && o.periciaSaberEscolha ? 1 : 0) + (bio && (bio.pericia || lista(bio.periciasEscolha).length) ? 1 : 0) + (bio && bio.saber ? 1 : 0);
    var concedidos = Object.keys(calculo.grausPericias).filter(function (s) { return grau(calculo.grausPericias[s]) > 0; }).length;
    var disponiveis = niveisPericiaNormais(classe).filter(function (l) { return l <= n; }).length, custos = Math.max(0, concedidos - Math.max(0, iniciais)) + aumentos;
    if (custos > disponiveis && p.periciasAprovadasPeloMestre !== true) erros.push('Graduações de perícia excedem os treinamentos e incrementos disponíveis.');
    if (concedidos < Math.max(0, iniciais)) pendencias.push('Escolha os treinamentos de perícia restantes (' + (Math.max(0, iniciais) - concedidos) + ').');
    if (classe && custos < disponiveis) pendencias.push('Distribua os incrementos de perícia restantes (' + (disponiveis - custos) + ').');
    var slots = escolhasTalentos(p, catalogo), usados = {}, talentosVistos = {};
    function chaveSlot(tipo, adquirido, origem) { return tipo + ':' + adquirido + ':' + (origem || 'normal'); }
    p.talentos.forEach(function (t) {
      var r = encontrar(catalogo, 'talentos', t.id);
      if (!r) { avisos.push('Talento personalizado ou ainda não catalogado: ' + t.id + '. Confira com o mestre.'); if (!t.aprovadoPeloMestre) return; r = { id: t.id, nome: t.nome || t.id, nivel: 1, tipo: t.tipo }; }
      if (r.somenteConsulta === true) erros.push(r.nome + ' está disponível apenas para consulta; não pode ser selecionado.');
      if (talentosVistos[t.id] && !r.repetivel) erros.push('Talento não repetível selecionado mais de uma vez: ' + r.nome + '.'); talentosVistos[t.id] = true;
      var adquirido = Number(t.nivel), tipo = t.tipo || r.tipo;
      if (!Number.isInteger(adquirido) || adquirido < r.nivel || adquirido > n) erros.push('Nível de aquisição inválido: ' + r.nome + '.');
      if (r.classe && r.classe !== p.classeId && tipo !== 'arquetipo') erros.push(r.nome + ' pertence a outra classe.');
      if (r.ancestralidade && r.ancestralidade !== p.ancestralidadeId) erros.push(r.nome + ' pertence a outra ancestralidade.');
      if (r.melhoraArmaFavorecidaSimples && !armaFavorecidaSimples(p, catalogo)) erros.push(r.nome + ': sua divindade precisa favorecer uma arma simples ou ataque desarmado.');
      if (r.tipo && r.tipo !== tipo && !(tipo === 'geral' && r.tipo === 'pericia') && tipo !== 'arquetipo') erros.push('Categoria de talento inválida: ' + r.nome + '.');
      if (t.origem === 'biografia' && bio && (bio.talento === t.id || obj(bio.talentoEscolha)[obj(p.escolhasBiografia).pericia] === t.id)) return;
      if (t.concedidoAutomaticamente && fontesSelecionadas(p, catalogo).some(function (fonte) { return fonte.origem === t.origem && talentosConcedidosFonte(p, catalogo, fonte.registro).some(function (item) { return (typeof item === 'string' ? item : item.id) === t.id; }); })) return;
      var slot = slots.find(function (s) { return s.tipo === tipo && s.nivel === adquirido && s.origem === (t.origem || null); });
      if (!slot && !t.aprovadoPeloMestre) erros.push('Não há uma escolha de talento de ' + tipo + ' no nível ' + adquirido + ' com essa origem.');
      var chave = chaveSlot(tipo, adquirido, t.origem); usados[chave] = (usados[chave] || 0) + 1;
      if (slot && usados[chave] > slot.quantidade) erros.push('Mais de um talento ocupa a escolha de ' + tipo + ' do nível ' + adquirido + '.');
      var requisitos = obj(r.requisitosEstruturados), naAquisicao = normalizar(p); naAquisicao.nivel = adquirido;
      Object.keys(obj(p.incrementosPericias)).map(Number).filter(function (l) { return l > adquirido; }).sort(function (a, b) { return b - a; }).forEach(function (l) { lista(p.incrementosPericias[l]).forEach(function (inc) { if (typeof inc.id === 'string' && Number.isInteger(inc.antes)) naAquisicao.pericias[inc.id] = inc.antes; }); });
      var attrs = atributos(naAquisicao, catalogo).valores;
      Object.keys(obj(requisitos.atributos)).forEach(function (a) { if (numero(attrs[a], -1) < requisitos.atributos[a]) erros.push(r.nome + ': atributo ' + a + ' insuficiente no nível de aquisição.'); });
      var limiteHistorico = 1 + niveisPericiaNormais(classe).filter(function (l) { return l <= adquirido; }).length;
      Object.keys(naAquisicao.pericias).forEach(function (s) { naAquisicao.pericias[s] = Math.min(grau(naAquisicao.pericias[s]), limiteHistorico, adquirido < 7 ? 2 : adquirido < 15 ? 3 : 4); });
      var aquisicao = calcular(naAquisicao, catalogo);
      Object.keys(obj(requisitos.pericias)).forEach(function (s) { var req = requisitos.pericias[s]; if (grau(aquisicao.grausPericias[s]) < req || req === 3 && adquirido < 7 || req === 4 && adquirido < 15) erros.push(r.nome + ': graduação insuficiente em ' + s + ' no nível de aquisição.'); });
      lista(requisitos.talentos).forEach(function (id) { if (!p.talentos.some(function (t0) { return t0.id === id && t0.nivel <= adquirido; })) erros.push(r.nome + ': talento pré-requisito ausente (' + id + ').'); });
      if (lista(requisitos.opcoesClasse).length && lista(requisitos.opcoesClasse).indexOf(p.opcaoClasseId) === -1) erros.push(r.nome + ': opção de classe exigida ausente.');
      var capacidades = [];
      fontesSelecionadas(naAquisicao, catalogo).forEach(function (fonte) { capacidades = capacidades.concat(lista(fonte.registro.capacidades)); });
      p.talentos.forEach(function (t0) { var reqTalento = encontrar(catalogo, 'talentos', t0.id); if (t0.nivel <= adquirido && t0.id !== t.id && talentoAtivo(naAquisicao, t0, reqTalento)) capacidades = capacidades.concat(lista(reqTalento.capacidades)); });
      lista(requisitos.capacidades).forEach(function (cap) { if (capacidades.indexOf(cap) === -1) erros.push(r.nome + ': capacidade exigida ausente (' + cap + ').'); });
      var restrTalento = lista(obj(classe && classe.restricoesTalentosExtra)[adquirido]);
      if (tipo === 'pericia' && restrTalento.length) { var permitidas = periciasPermitidas(restrTalento, o), reqSkills = Object.keys(obj(requisitos.pericias)); if (!reqSkills.some(function (s) { return permitidas.indexOf(s) !== -1 || restrTalento.indexOf('pericia-mental') !== -1 && s.indexOf('saber:') === 0; })) erros.push(r.nome + ': talento de perícia não atende à restrição da classe no nível ' + adquirido + '.'); }
      if (r.requisitos && !Object.keys(requisitos).length) avisos.push('Confira os pré-requisitos de ' + r.nome + ': ' + (typeof r.requisitos === 'string' ? r.requisitos : JSON.stringify(r.requisitos)));
    });
    slots.forEach(function (s) { var falta = s.quantidade - (usados[chaveSlot(s.tipo, s.nivel, s.origem)] || 0); if (falta > 0) pendencias.push('Escolha o talento de ' + s.tipo + ' do nível ' + s.nivel + (s.origem ? ' concedido por ' + s.origem : '') + '.'); });
    p.magias.forEach(function (m) {
      var r = encontrar(catalogo, 'magias', typeof m === 'string' ? m : m.id);
      if (!r) erros.push('Magia desconhecida ou sem regras revisadas: ' + (typeof m === 'string' ? m : m.id) + '.');
      else if (!magiaElegivel(p, r.id, catalogo)) {
        var conjElegivel = conjuracaoBase(p, classe, catalogo);
        erros.push(conjElegivel && lista(r.tradicoes).length && lista(r.tradicoes).indexOf(conjElegivel.tradicao) === -1 ? 'A magia ' + r.nome + ' não pertence à tradição desta classe.' : 'Magia não concedida ou não permitida para esta ficha: ' + r.nome + '.');
      }
      if (r && r.somenteConsulta === true) erros.push(r.nome + ' está disponível apenas para consulta; não pode ser selecionada.');
    });
    if (classe) {
      lista(classe.progressao).filter(function (r) { return r.nivel <= n && r.escolhaProficiencia; }).forEach(function (r) {
        var escolha = r.escolhaProficiencia, selecionado = obj(p.escolhasClasse)[escolha.id];
        if (lista(escolha.opcoes).indexOf(selecionado) === -1) pendencias.push('Escolha a proficiência de ' + r.nome + ' (nível ' + r.nivel + ').');
        else if (escolha.grauAnterior) { var antes = normalizar(p); antes.nivel = r.nivel - 1; if (grau(obj(proficienciasClasse(antes, classe, catalogo)[escolha.campo])[selecionado]) !== escolha.grauAnterior) erros.push('A escolha de ' + r.nome + ' exige graduação anterior ' + escolha.grauAnterior + '.'); }
      });
      var conj = calculo.conjuracao;
      var truques = 0, magias = 0, truquesLivro = 0, magiasLivro = 0, vistas = {}, vistasLivro = {}, porRanque = {}, assinaturas = {};
      p.magias.forEach(function (m) {
        var id = typeof m === 'string' ? m : m.id, r = encontrar(catalogo, 'magias', id); if (!r || !magiaElegivel(p, id, catalogo)) return; var registro = r;
        var ordem = numero(registro.ordem === undefined ? registro.ranque === undefined ? registro.nivel : registro.ranque : registro.ordem, 0);
        var truque = registro.tipo !== 'foco' && (registro.tipo === 'truque' || registro.truque === true || ordem === 0);
        var conhecida = typeof m === 'object' && m.ranque !== undefined ? numero(m.ranque, ordem) : ordem;
        if (typeof m === 'object' && m.ranque !== undefined && !Number.isInteger(m.ranque)) erros.push('O ranque conhecido da magia precisa ser inteiro: ' + r.nome + '.');
        var chaveMagia = truque || registro.tipo === 'foco' ? id : id + ':' + conhecida;
        if (!vistas[chaveMagia]) { if (truque && (!m.concedidaAutomaticamente || conj && conj.truquesEscolhidos === undefined && m.consomeVaga !== false)) truques++; else if (!truque && registro.tipo !== 'foco') { magias++; if (!m.concedidaAutomaticamente) porRanque[conhecida] = (porRanque[conhecida] || 0) + 1; } vistas[chaveMagia] = true; }
        if (!vistasLivro[id] && (!m.concedidaAutomaticamente || m.consomeVaga !== false || conj && obj(conj.conhecidas).incluiConcedidas === true)) { if (truque) truquesLivro++; else if (registro.tipo !== 'foco') magiasLivro++; vistasLivro[id] = true; }
        if (conj && lista(r.tradicoes).length && conj.tradicao && lista(r.tradicoes).indexOf(conj.tradicao) === -1 && !m.concedidaAutomaticamente) erros.push('A magia ' + r.nome + ' não pertence à tradição desta classe.');
        if (!truque && (conhecida < ordem || conhecida > Math.ceil(n / 2) || !Number.isInteger(conhecida))) erros.push('Ordem de magia acima da disponível ou abaixo da ordem original.');
        if (m.assinatura) {
          if (!conj || n < numero(conj.magiasAssinaturaDesde, Infinity) || truque || registro.tipo === 'foco') erros.push('Esta magia ainda não pode ser escolhida como assinatura.');
          assinaturas[conhecida] = (assinaturas[conhecida] || 0) + 1;
          if (conj && assinaturas[conhecida] > numero(conj.assinaturasPorGraduacao, 1)) erros.push('Magias de assinatura acima do orçamento para a ordem ' + conhecida + '.');
        }
      });
      if (conj) {
        if (conj.fonteDivina && conj.fonteDivina.quantidade && !conj.fonteDivina.magia) pendencias.push('Escolha a Fonte divina permitida por sua divindade.');
        validarPreparacao(p, catalogo, conj, o, erros, pendencias);
        var livro = obj(conj.conhecidasMinimos);
        if (truquesLivro < numero(livro.truques, 0)) pendencias.push('Complete os truques conhecidos do grimório ou familiar (' + (livro.truques - truquesLivro) + ' restantes).');
        if (magiasLivro < numero(livro.magias, 0)) pendencias.push('Complete as magias conhecidas do grimório ou familiar (' + (livro.magias - magiasLivro) + ' restantes).');
        if (conj.tipo !== 'foco') {
          var minimoTruques = numero(conj.truquesEscolhidos, numero(conj.truques, 1));
          if (truques < minimoTruques) pendencias.push('Selecione os truques de sua conjuração (' + (minimoTruques - truques) + ' restantes).');
          if (!magias && conj.exigeMagias !== false) pendencias.push('Selecione pelo menos uma magia de 1ª ordem ou superior para sua conjuração.');
          Object.keys(obj(conj.repertorioEscolhido)).forEach(function (r) { var falta = conj.repertorioEscolhido[r] - (porRanque[r] || 0); if (falta > 0) pendencias.push('Escolha ' + falta + ' magia(s) de ordem ' + r + ' para completar seu repertório.'); else if (falta < 0) erros.push('Magias escolhidas acima do orçamento do repertório de ordem ' + r + '.'); });
        } else if (!p.magias.length) pendencias.push('Selecione a magia de foco concedida por sua classe ou talento.');
        if (!conj.tradicao || ['linhagem', 'patrono'].indexOf(conj.tradicao) !== -1) pendencias.push('Defina a tradição mágica por sua opção de classe.');
      }
    }
    return { valido: erros.length === 0 && pendencias.length === 0, erros: erros, avisos: avisos, pendencias: pendencias };
  }
  function evoluir(personagem, novoNivel, catalogo) {
    var p = normalizar(personagem, catalogo), anterior = nivel(p);
    if (!Number.isInteger(novoNivel) || novoNivel <= anterior || novoNivel > 20) throw new RangeError('Escolha um nível maior que o atual, até 20.');
    p.nivel = novoNivel; p = normalizar(p, catalogo); p.vida.maxima = calcular(p, catalogo).pvMaximos;
    p._evolucao = { nivelAnterior: anterior, ganhos: ganhos(p, encontrar(catalogo, 'classes', p.classeId), anterior), pendencias: validar(p, catalogo).pendencias };
    p._guiado.concluido = false; return p;
  }
  var API = Object.freeze({ criar: criar, normalizar: normalizar, calcular: calcular, validar: validar, incrementarAtributo: incrementarAtributo,
    grauSucesso: grauSucesso, evoluir: evoluir, escolhasTalentos: escolhasTalentos, escolhasExtras: escolhasExtras, magiaElegivel: magiaElegivel, pericias: PERICIAS, atributos: ATRIBUTOS, bonusProficiencia: proficiencia });
  if (typeof module === 'object' && module.exports) module.exports = API; else global.HubPF2Regras = API;
})(typeof window !== 'undefined' ? window : globalThis);
