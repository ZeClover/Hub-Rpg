import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const regras = createRequire(import.meta.url)('../../../public/js/pathfinder-regras.js') as typeof import('../../../public/js/pathfinder-regras.js');
type Registro = Record<string, unknown>;
const catalogo = {
  classes: [{ id: 'guerreiro', nome: 'Guerreiro', pv: 10, atributoChave: ['for', 'des'], periciasTreinadas: 3, periciasFixas: [], percepcao: 2,
    salvaguardas: { fortitude: 2, reflexos: 2, vontade: 1 }, armaduras: { sem: 1, leve: 1, media: 1, pesada: 1 },
    armas: { simples: 2, marciais: 2, avancadas: 1, desarmados: 2 }, cdClasse: 1, opcoes: [] as Registro[],
    progressao: [
      { nivel: 3, nome: 'Bravura', automatico: true, proficiencias: { salvaguardas: { vontade: 2 } } },
      { nivel: 7, nome: 'Especialização em percepção', automatico: true, proficiencias: { percepcao: 3 } },
      { nivel: 9, nome: 'Determinação', automatico: true, proficiencias: { salvaguardas: { fortitude: 3 } } },
      { nivel: 11, nome: 'Experiência com armadura', automatico: true, proficiencias: { armaduras: { sem: 2, pesada: 2 }, cdClasse: 2 } },
      { nivel: 15, nome: 'Evasão', automatico: true, proficiencias: { salvaguardas: { reflexos: 3 } } },
      { nivel: 17, nome: 'Mestre em armaduras', automatico: true, proficiencias: { armaduras: { sem: 3, pesada: 3 } } },
      { nivel: 19, nome: 'Lenda marcial', automatico: true, proficiencias: { armas: { simples: 4, marciais: 4, avancadas: 3, desarmados: 4 }, cdClasse: 3 } }
    ] as Registro[] }],
  ancestralidades: [{ id: 'humano', nome: 'Humano', pv: 8, deslocamento: 7.5, incrementos: [], livres: 2, herancas: [{ id: 'versatil' }] as Registro[] },
    { id: 'anao', nome: 'Anão', pv: 10, deslocamento: 6, incrementos: ['con', 'sab'], livres: 1, defeito: 'car', herancas: [] as Registro[] }],
  biografias: [{ id: 'guerreiro', nome: 'Guerreiro', atributos: ['for', 'con'], pericia: 'atletismo', saber: 'militar', talento: 'biografia' }] as Registro[],
  talentos: [{ id: 'ancestral', nome: 'Talento ancestral', nivel: 1, tipo: 'ancestralidade' },
    { id: 'classe', nome: 'Talento de classe', nivel: 1, tipo: 'classe', classe: 'guerreiro' },
    { id: 'biografia', nome: 'Talento da biografia', nivel: 1, tipo: 'pericia' },
    { id: 'restrito', nome: 'Talento com pré-requisitos', nivel: 1, tipo: 'classe', requisitosEstruturados: { atributos: { des: 3 }, pericias: { medicina: 2 } } }] as Registro[],
  magias: [] as Registro[], equipamentos: [] as Registro[]
};
function ficha(n = 1) {
  const p = regras.criar();
  p.equipamentoAprovadoPeloMestre = true; p.bonusAprovadosPeloMestre = true;
  Object.assign(p, { nome: 'Teste Remaster', ancestralidadeId: 'humano', herancaId: 'versatil', biografiaId: 'guerreiro', classeId: 'guerreiro', atributoChave: 'for', nivel: n });
  p.incrementos = { ancestralidade: ['for', 'des'], biografia: ['for', 'con'], classe: ['for'], livres: ['for', 'des', 'con', 'sab'], nivel: {} };
  for (const l of [5, 10, 15, 20]) if (l <= n) p.incrementos.nivel[l] = ['for', 'des', 'con', 'sab'];
  p.pericias.medicina = 1; p.pericias.intimidacao = 1; p.pericias.furtividade = 1;
  p.talentos = [{ id: 'ancestral', nivel: 1, tipo: 'ancestralidade' }, { id: 'classe', nivel: 1, tipo: 'classe' }, { id: 'biografia', nivel: 1, tipo: 'pericia', origem: 'biografia' }];
  return p;
}

test('CJS e navegador expõem as mesmas regras sem DOM ou estado de sessão', () => {
  const context = { window: {} as Record<string, unknown> };
  vm.runInNewContext(readFileSync(new URL('../../../public/js/pathfinder-regras.js', import.meta.url), 'utf8'), context);
  const browser = context.window.HubPF2Regras as typeof regras;
  assert.equal(browser.grauSucesso(20, 2, 15), regras.grauSucesso(20, 2, 15));
  assert.equal(browser.calcular(ficha(), catalogo).pvMaximos, 20);
});
test('ABC mais quatro livres deriva modificadores Remaster, PV e proficiências', () => {
  const p = ficha(); p.atributos.for = 99;
  const c = regras.calcular(p, catalogo);
  assert.deepEqual(c.atributos, { for: 4, des: 2, con: 2, int: 0, sab: 1, car: 0 });
  assert.equal(c.pvMaximos, 20); assert.equal(c.ca, 15); assert.equal(c.ataque, 9);
  assert.equal(c.pericias.arcanismo, 0); assert.equal(c.pericias.atletismo, 7);
  assert.equal(c.salvaguardas.fortitude, 7); assert.equal(c.salvaguardas.vontade, 4);
  assert.equal(regras.validar(p, catalogo).valido, true);
});
test('melhoria parcial de +4 ocorre no 5º e só aumenta no 10º; nível 20 segue progressão', () => {
  assert.equal(regras.incrementarAtributo(3), 4); assert.equal(regras.incrementarAtributo(4), 4.5); assert.equal(regras.incrementarAtributo(4.5), 5);
  const a = regras.calcular(ficha(5), catalogo), b = regras.calcular(ficha(10), catalogo), c = regras.calcular(ficha(20), catalogo);
  assert.equal(a.atributos.for, 4); assert.equal(a.incrementosParciais.for, true); assert.equal(a.pvMaximos, 73);
  assert.equal(b.atributos.for, 5); assert.equal(b.incrementosParciais.for, false); assert.equal(b.pvMaximos, 148);
  assert.equal(c.atributos.for, 6); assert.equal(c.atributos.con, 5); assert.equal(c.pvMaximos, 308); assert.equal(c.ataque, 34);
  assert.equal(c.pericias.arcanismo, 0);
});
test('modo ancestral original mantém defeito; dois livres substituem melhorias e defeito', () => {
  const p = ficha(); p.ancestralidadeId = 'anao'; p.herancaId = ''; p.ancestralidadeAlternativa = false; p.incrementos.ancestralidade = ['con', 'sab', 'for'];
  assert.equal(regras.calcular(p, catalogo).atributos.car, -1); assert.equal(regras.calcular(p, catalogo).pvMaximos, 23);
  p.ancestralidadeAlternativa = true; p.incrementos.ancestralidade = ['for', 'des']; assert.equal(regras.calcular(p, catalogo).atributos.car, 0);
});
test('orçamento recusa repetição, atributo de biografia inválido e melhorias antecipadas', () => {
  const p = ficha(); p.incrementos.livres = ['for', 'for', 'con', 'sab']; p.incrementos.biografia = ['int', 'car']; p.incrementos.nivel[5] = ['for', 'des', 'con', 'sab'];
  const v = regras.validar(p, catalogo);
  assert.match(v.erros.join(' '), /atributo diferente/); assert.match(v.erros.join(' '), /biografia/); assert.match(v.erros.join(' '), /nível 5/);
  const q = ficha(5); q.incrementos.nivel[5] = ['for']; assert.match(regras.validar(q, catalogo).pendencias.join(' '), /Nível 5: faltam 3/);
});
test('armadura limita Destreza, Força elimina teste mas reduz movimento só em 1,5 m', () => {
  const p = ficha(); p.armadura = { grau: 'pesada', ca: 6, limiteDes: 0, penalidade: -3, forca: 4, penalidadeDeslocamento: -3 };
  let c = regras.calcular(p, catalogo); assert.equal(c.ca, 19); assert.equal(c.pericias.furtividade, 5); assert.equal(c.deslocamento, 6);
  p.incrementos = regras.criar().incrementos; p.atributos = { for: 3, des: 4, con: 2, int: 0, sab: 1, car: 0 };
  c = regras.calcular(p, catalogo); assert.equal(c.ca, 19); assert.equal(c.pericias.furtividade, 4); assert.equal(c.deslocamento, 4.5); assert.equal(c.atletismoAtaque, 6);
  p.armadura = { grau: 'pesada', ca: 6, limiteDes: 0, penalidade: -3, forca: 3, tracos: ['barulhenta'] }; assert.equal(regras.calcular(p, catalogo).pericias.furtividade, 4);
});
test('arma ágil muda MAP; acuidade e distância usam atributo correto', () => {
  const p = ficha(); p.arma = { grau: 'marciais', tracos: ['agil', 'acuidade'] }; assert.deepEqual(regras.calcular(p, catalogo).map, [0, -4, -8]); assert.equal(regras.calcular(p, catalogo).ataque, 9);
  p.arma = { grau: 'marciais', distancia: true, tracos: [] }; assert.deepEqual(regras.calcular(p, catalogo).map, [0, -5, -10]); assert.equal(regras.calcular(p, catalogo).ataque, 7);
});
test('penalidades de estado não se somam; circunstância soma; drenado reduz máximos', () => {
  const p = ficha(); p.condicoes = [{ id: 'assustado', valor: 2 }, { id: 'desajeitado', valor: 1 }, { id: 'enjoado', valor: 1 }, { id: 'desprevenido' }];
  p.bonus = [{ alvo: 'ca', tipo: 'estado', valor: -1 }, { alvo: 'ca', tipo: 'item', valor: 2 }, { alvo: 'ca', tipo: 'item', valor: 1 }];
  const c = regras.calcular(p, catalogo); assert.equal(c.ca, 13); assert.equal(c.salvaguardas.reflexos, 5); assert.equal(c.ataque, 7);
  p.condicoes = [{ id: 'drenado', valor: 2 }]; p.nivel = 5; assert.equal(regras.calcular(p, catalogo).pvMaximos, 58); assert.equal(regras.calcular(p, catalogo).salvaguardas.fortitude, 9);
});
test('d20 natural ajusta um grau, não garante automaticamente crítico no 20', () => {
  assert.equal(regras.grauSucesso(20, 5, 20), 'falha'); assert.equal(regras.grauSucesso(20, 19, 20), 'sucesso'); assert.equal(regras.grauSucesso(1, 35, 20), 'sucesso');
  assert.equal(regras.grauSucesso(10, 30, 20), 'sucesso-critico'); assert.equal(regras.grauSucesso(10, 10, 20), 'falha-critica'); assert.throws(() => regras.grauSucesso(21, 21, 20), TypeError);
});
test('proficiência base da opção não rebaixa progressões posteriores', () => {
  const cat = structuredClone(catalogo); cat.classes[0].opcoes = [{ id: 'armadura', proficiencias: { armaduras: { pesada: 1 } }, progressao: [{ nivel: 5, proficiencias: { armaduras: { pesada: 2 } } }] }];
  const p = ficha(20); p.opcaoClasseId = 'armadura'; p.armadura = { grau: 'pesada', ca: 6, limiteDes: 0 };
  assert.equal((regras.calcular(p, cat).proficiencias.armaduras as Record<string, number>).pesada, 3); assert.equal(regras.calcular(p, cat).ca, 42);
});
test('pré-requisitos e ocupação duplicada de talento são verificados por IDs', () => {
  const p = ficha(); p.talentos[1] = { id: 'restrito', nivel: 1, tipo: 'classe' }; p.talentos.push({ id: 'classe', nivel: 1, tipo: 'classe' });
  const v = regras.validar(p, catalogo); assert.match(v.erros.join(' '), /atributo des insuficiente/); assert.match(v.erros.join(' '), /graduação insuficiente em medicina/); assert.match(v.erros.join(' '), /Mais de um talento/);
});
test('perícias respeitam orçamento de incrementos e níveis mínimos 7 e 15', () => {
  const p = ficha(); p.pericias.medicina = 3; p.pericias.arcanismo = 4;
  const erros = regras.validar(p, catalogo).erros.join(' '); assert.match(erros, /nível 7/); assert.match(erros, /nível 15/); assert.match(erros, /excedem/);
});
test('especialização restringe atributo-chave e acrescenta treinamento', () => {
  const cat = structuredClone(catalogo); cat.classes[0].atributoChave = ['for', 'des', 'car']; cat.classes[0].opcoes = [{ id: 'ladrao', atributoChave: ['des'], periciasFixas: ['ladroagem'] }];
  const p = ficha(); p.opcaoClasseId = 'ladrao'; p.atributoChave = 'car'; assert.match(regras.validar(p, cat).pendencias.join(' '), /atributo-chave permitido/); assert.equal(regras.calcular(p, cat).pericias.ladroagem, 5);
});
test('evolução usa cópia e preserva vida, campos futuros, aparência e escolhas anteriores', () => {
  const p = ficha(); p.vida.atual = 7; p.vida.temporaria = 3; p._aparencia = { cor: '#009900' }; p.campoFuturo = { conteudo: ['preservar'] };
  const snapshot = structuredClone(p), e = regras.evoluir(p, 5, catalogo); assert.deepEqual(p, snapshot); assert.equal(e.nivel, 5); assert.equal(p.nivel, 1);
  assert.equal(e.vida.atual, 7); assert.equal(e.vida.temporaria, 3); assert.deepEqual(e._aparencia, p._aparencia); assert.deepEqual(e.campoFuturo, p.campoFuturo); assert.deepEqual(e.talentos, p.talentos);
  assert.match((e._evolucao as { pendencias: string[] }).pendencias.join(' '), /Nível 5|talento/); assert.throws(() => regras.evoluir(p, 1, catalogo), RangeError); assert.throws(() => regras.evoluir(p, 21, catalogo), RangeError);
});
test('exceções de proficiência são ignoradas sem aprovação do mestre', () => {
  const p = ficha(); p.proficiencias = { armas: { simples: 4 } }; assert.equal(regras.calcular(p, catalogo).ataque, 9); assert.match(regras.validar(p, catalogo).avisos.join(' '), /aprovadas/);
  p.proficienciasAprovadasPeloMestre = true; assert.equal(regras.calcular(p, catalogo).ataque, 13);
});
test('PV e natação de herança só se aplicam à ancestralidade correspondente', () => {
  const cat = structuredClone(catalogo); cat.ancestralidades[0].herancas = [{ id: 'aquatica', pv: 10, deslocamento: 6, natacao: 3, periciasFixas: ['natureza'] }];
  const p = ficha(); p.herancaId = 'aquatica'; const c = regras.calcular(p, cat); assert.equal(c.pvMaximos, 22); assert.equal(c.deslocamento, 6); assert.equal(c.natacao, 3); assert.equal(c.pericias.natureza, 4);
  p.ancestralidadeId = 'anao'; assert.equal(regras.calcular(p, cat).natacao, null);
});
test('biografia com alternativas exige escolha e aplica só a perícia escolhida', () => {
  const cat = structuredClone(catalogo); cat.biografias.push({ id: 'eremita', nome: 'Eremita', atributos: ['con', 'int'], periciasEscolha: ['natureza', 'ocultismo'], saber: 'cavernas', talento: 'biografia' });
  const p = ficha(); p.biografiaId = 'eremita'; p.incrementos.biografia = ['con', 'for']; assert.match(regras.validar(p, cat).pendencias.join(' '), /perícia concedida pela biografia/);
  p.escolhasBiografia = { pericia: 'natureza' }; assert.equal(regras.calcular(p, cat).pericias.natureza, 4); assert.equal(regras.calcular(p, cat).pericias.ocultismo, 0);
});
test('salvaguarda do monge exige escolha e graduação mestre antes de lendária', () => {
  const cat = structuredClone(catalogo); cat.classes[0].progressao = [
    { nivel: 7, nome: 'Caminho da perfeição', escolhaProficiencia: { id: 'salvaguarda7', campo: 'salvaguardas', opcoes: ['fortitude', 'reflexos', 'vontade'], grau: 3, grauAnterior: 2 } },
    { nivel: 15, nome: 'Terceiro caminho', escolhaProficiencia: { id: 'salvaguarda15', campo: 'salvaguardas', opcoes: ['fortitude', 'reflexos', 'vontade'], grau: 4, grauAnterior: 3 } }];
  const p = ficha(15); assert.match(regras.validar(p, cat).pendencias.join(' '), /Caminho da perfeição/);
  p.escolhasClasse = { salvaguarda7: 'fortitude', salvaguarda15: 'reflexos' }; assert.match(regras.validar(p, cat).erros.join(' '), /graduação anterior 3/);
  assert.equal((regras.calcular(p, cat).proficiencias.salvaguardas as Record<string, number>).reflexos, 2);
  p.escolhasClasse = { salvaguarda7: 'fortitude', salvaguarda15: 'fortitude' }; assert.equal((regras.calcular(p, cat).proficiencias.salvaguardas as Record<string, number>).fortitude, 4);
});
test('truque de ranque 1 é contado como truque; foco não exige espaços ou truques', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { tradicao: 'linhagem', atributo: 'car', grau: 1, truques: 2 }, opcoes: [{ id: 'primal', conjuracao: { tradicao: 'primal', atributo: 'car' } }] });
  cat.magias = [{ id: 'truque', nome: 'Truque', ranque: 1, nivel: 1, tipo: 'truque', tradicoes: ['primal'] }, { id: 'magia', nome: 'Magia', nivel: 1, tradicoes: ['arcana'] }];
  const p = ficha(); p.opcaoClasseId = 'primal'; p.magias = [{ id: 'truque' }, { id: 'magia' }]; let v = regras.validar(p, cat);
  assert.match(v.pendencias.join(' '), /truques.*1 restantes/); assert.match(v.erros.join(' '), /não pertence à tradição/);
  Object.assign(cat.classes[0], { conjuracao: { tradicao: 'divina', atributo: 'car', tipo: 'foco' }, opcoes: [] }); p.magias = [{ id: 'devocao', nivel: 1 }]; p.opcaoClasseId = ''; v = regras.validar(p, cat); assert.doesNotMatch(v.pendencias.join(' '), /truques|1ª ordem/);
});
test('referências não revisadas continuam consultáveis mas não podem integrar a ficha', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.talentos[1], { somenteConsulta: true }); cat.magias = [{ id: 'referencia', nome: 'Referência', nivel: 1, somenteConsulta: true }];
  const p = ficha(); p.magias = [{ id: 'referencia' }]; const e = regras.validar(p, cat).erros.join(' ');
  assert.match(e, /Talento de classe.*apenas para consulta/); assert.match(e, /Referência.*apenas para consulta/);
});
test('Ambição Natural concede talento extra só com origem referenciada e feat realmente escolhido', () => {
  const cat = structuredClone(catalogo); cat.talentos[0] = { id: 'humano-ambicao-natural', nome: 'Ambição Natural', nivel: 1, tipo: 'ancestralidade', ancestralidade: 'humano', bonusTalentos: [{ tipo: 'classe', nivel: 1, quantidade: 1 }] };
  cat.talentos.push({ id: 'classe-extra', nome: 'Outro talento de classe', nivel: 1, tipo: 'classe', classe: 'guerreiro' });
  const p = ficha(); p.talentos[0].id = 'humano-ambicao-natural'; const origem = 'ancestralidade:humano-ambicao-natural';
  assert.deepEqual(regras.escolhasTalentos(p, cat).find(s => s.origem === origem), { tipo: 'classe', nivel: 1, origem, quantidade: 1 });
  assert.match(regras.validar(p, cat).pendencias.join(' '), /concedido por ancestralidade:humano-ambicao-natural/);
  p.talentos.push({ id: 'classe-extra', nivel: 1, tipo: 'classe', origem }); assert.equal(regras.validar(p, cat).valido, true);
  p.talentos[3].origem = 'ancestralidade:outro'; assert.match(regras.validar(p, cat).erros.join(' '), /com essa origem/);
  p.talentos[3].origem = origem; p.talentos.shift(); assert.match(regras.validar(p, cat).erros.join(' '), /com essa origem/);
});
test('treinamentos de Perícia Natural e herança somam uma vez e ampliam orçamento real', () => {
  const cat = structuredClone(catalogo); cat.talentos[0] = { id: 'humano-pericia-natural', nome: 'Perícia Natural', nivel: 1, tipo: 'ancestralidade', ancestralidade: 'humano', efeitos: [{ alvo: 'treinamentos', tipo: 'sem-tipo', valor: 2 }] };
  cat.ancestralidades[0].herancas[0].efeitos = [{ alvo: 'treinamentos', tipo: 'sem-tipo', valor: 1 }];
  const p = ficha(); p.talentos[0].id = 'humano-pericia-natural';
  assert.equal(regras.calcular(p, cat).treinamentosExtras, 3); assert.equal(regras.calcular(p, cat).periciasTreinadasEscolhidas, 6);
  assert.match(regras.validar(p, cat).pendencias.join(' '), /treinamentos de perícia restantes \(3\)/);
  p.pericias.natureza = 1; p.pericias.ocultismo = 1; p.pericias.ladroagem = 1; assert.equal(regras.validar(p, cat).valido, true);
  p.talentos.push({ id: 'humano-pericia-natural', nivel: 1, tipo: 'ancestralidade' }); assert.equal(regras.calcular(p, cat).treinamentosExtras, 3);
});

test('Guerreiro real do Player Core exige a escolha inicial e repõe treino duplicado com biografia', () => {
  const pc1 = JSON.parse(readFileSync(new URL('../../../public/pathfinder/player-core.json', import.meta.url), 'utf8')) as { classes: Registro[] };
  const real = pc1.classes.find(c => c.id === 'guerreiro'); assert.ok(real);
  const cat = { ...structuredClone(catalogo), classes: [real] }, p = ficha();
  assert.match(regras.validar(p, cat).pendencias.join(' '), /perícia inicial concedida pela classe/);
  p.escolhasClasse = { periciaInicial: 'atletismo' };
  assert.equal(regras.calcular(p, cat).grausPericias.atletismo, 1);
  assert.match(regras.validar(p, cat).pendencias.join(' '), /treinamentos de perícia restantes \(1\)/);
  p.pericias.natureza = 1; assert.equal(regras.validar(p, cat).valido, true);
  p.escolhasClasse = { periciaInicial: 'arcanismo' };
  assert.match(regras.validar(p, cat).pendencias.join(' '), /perícia inicial concedida pela classe/);
  assert.equal(regras.calcular(p, cat).grausPericias.arcanismo, 0);
});

test('Bárbaro real do Player Core 2 usa PV12 e não ganha penalidade de CA de Fúria legada', () => {
  const pc2 = JSON.parse(readFileSync(new URL('../../../public/pathfinder/player-core-2.json', import.meta.url), 'utf8')) as { classes: Registro[] };
  const real = pc2.classes.find(c => c.id === 'barbaro'); assert.ok(real);
  const cat = { ...structuredClone(catalogo), classes: [real] }, p = ficha(); p.classeId = 'barbaro';
  const normal = regras.calcular(p, cat); assert.equal(normal.pvMaximos, 22); assert.equal(normal.grausPericias.atletismo, 1);
  p.condicoes = [{ id: 'furia' }]; assert.equal(regras.calcular(p, cat).ca, normal.ca);
});

test('efeitos revisados de deslocamento somam herança e talento; sem consulta não há bônus', () => {
  const cat = structuredClone(catalogo); cat.ancestralidades[0].herancas[0].efeitos = [{ alvo: 'deslocamento', tipo: 'sem-tipo', valor: 1.5 }];
  cat.talentos[0].efeitos = [{ alvo: 'deslocamento', tipo: 'sem-tipo', valor: 1.5 }];
  const p = ficha(); assert.equal(regras.calcular(p, cat).deslocamento, 10.5);
  cat.talentos[0].somenteConsulta = true; assert.equal(regras.calcular(p, cat).deslocamento, 9);
});

test('Herança Humano versátil real concede talento geral de 1º com origem própria', () => {
  const pc1 = JSON.parse(readFileSync(new URL('../../../public/pathfinder/player-core.json', import.meta.url), 'utf8')) as { ancestralidades: Registro[] };
  const h = (pc1.ancestralidades.find(a => a.id === 'humano')?.herancas as Registro[]).find(h => h.id === 'humano-versatil'); assert.ok(h);
  const cat = structuredClone(catalogo); cat.ancestralidades[0].herancas = [h]; cat.talentos.push({ id: 'geral', nome: 'Talento geral', tipo: 'geral', nivel: 1 });
  const p = ficha(); p.herancaId = 'humano-versatil'; const origem = 'heranca:humano-versatil';
  assert.deepEqual(regras.escolhasTalentos(p, cat).find(s => s.origem === origem), { tipo: 'geral', nivel: 1, origem, quantidade: 1 });
  p.talentos.push({ id: 'geral', nivel: 1, tipo: 'geral', origem }); assert.equal(regras.validar(p, cat).valido, true);
  p.ancestralidadeId = 'anao'; assert.equal(regras.escolhasTalentos(p, cat).some(s => s.origem === origem), false);
});

test('Humano perito exige escolha no 1º e aumenta a especialista no 5º sem gastar incremento comum', () => {
  const cat = structuredClone(catalogo); cat.ancestralidades[0].herancas = [{ id: 'humano-perito', periciasEscolha: ['arcanismo', 'natureza'],
    graduacaoPericia: [{ nivel: 1, grau: 1 }, { nivel: 5, grau: 2 }], efeitos: [{ alvo: 'treinamentos', tipo: 'sem-tipo', valor: 1 }] }];
  const p = ficha(); p.herancaId = 'humano-perito'; assert.match(regras.validar(p, cat).pendencias.join(' '), /perícia concedida pela herança/);
  p.escolhasHeranca = { pericia: 'arcanismo' }; assert.equal(regras.calcular(p, cat).grausPericias.arcanismo, 1); assert.equal(regras.validar(p, cat).valido, true);
  p.nivel = 5; p.incrementos.nivel[5] = ['for', 'des', 'con', 'sab']; p.pericias.arcanismo = 2;
  assert.equal(regras.calcular(p, cat).grausPericias.arcanismo, 2);
  assert.match(regras.validar(p, cat).pendencias.join(' '), /incrementos de perícia restantes \(2\)/); // free experto não consome incrementos de 3 e 5
  p.pericias.medicina = 2; p.pericias.intimidacao = 2;
  assert.doesNotMatch(regras.validar(p, cat).pendencias.join(' '), /incrementos de perícia restantes/);
});

function bibliotecaReal() {
  const livros = ['player-core', 'player-core-2', 'gm-core'].map(nome => JSON.parse(readFileSync(new URL(`../../../public/pathfinder/${nome}.json`, import.meta.url), 'utf8')) as Record<string, Registro[]>);
  return Object.fromEntries(['classes', 'ancestralidades', 'biografias', 'talentos', 'magias', 'equipamentos'].map(tipo => [tipo, livros.flatMap(l => l[tipo] || [])]));
}

test('equipamento por ID usa estatísticas reais do livro e ignora cache manual divergente', () => {
  const cat = bibliotecaReal(), p = ficha(); p.armaduraId = 'couro-batido'; p.armaId = 'espada-longa'; p.escudoId = 'escudo-de-aco';
  p.armadura = { ca: 99, limiteDes: 99 }; p.arma = { bonus: 99 };
  let c = regras.calcular(p, cat); assert.equal(c.ca, 17); assert.equal(c.ataque, 9); assert.equal(c.danoArma, '1d8+4'); assert.equal(c.equipamento.arma?.id, 'espada-longa');
  p.escudoErguido = true; c = regras.calcular(p, cat); assert.equal(c.ca, 19); assert.equal(c.caSemEscudo, 17);
  p.escudoPv = 10; assert.equal(regras.calcular(p, cat).ca, 17); // aço quebra em 10
});

test('potência e impactante reais GM alteram ataque e total de dados; armadura exige investimento', () => {
  const cat = bibliotecaReal(), p = ficha(); p.armaduraId = 'couro-batido'; p.armaId = 'espada-longa';
  p.runasEquipamento = { arma: { potencia: 'runa-potencia-arma-1', impactante: 'runa-impactante' }, armadura: { potencia: 'runa-potencia-armadura-1', resiliente: 'runa-resiliente' } };
  let c = regras.calcular(p, cat); assert.equal(c.ataque, 10); assert.equal(c.dadosArma, 2); assert.equal(c.danoArma, '2d8+4'); assert.equal(c.ca, 17);
  p.armaduraInvestida = true; c = regras.calcular(p, cat); assert.equal(c.ca, 18); assert.equal(c.salvaguardas.fortitude, 8);
  p.armaduraId = 'sem-armadura'; assert.match(regras.validar(p, cat).erros.join(' '), /Runa inválida/);
});

test('runas não podem ser aplicadas em categoria diferente nem referências sem automação', () => {
  const cat = bibliotecaReal(), p = ficha(); p.armaId = 'espada-longa'; p.runasEquipamento = { arma: { potencia: 'runa-potencia-armadura-3' } };
  assert.equal(regras.calcular(p, cat).ataque, 9); assert.match(regras.validar(p, cat).erros.join(' '), /Runa inválida/);
  p.armaId = 'arma-inexistente'; assert.match(regras.validar(p, cat).erros.join(' '), /Equipamento inválido/);
});

test('reforçadora real aumenta estatísticas de escudo respeitando máximos', () => {
  const cat = bibliotecaReal(), p = ficha(); p.escudoId = 'escudo-de-aco'; p.runasEquipamento = { escudo: { reforco: 'runa-reforcadora-minima' } };
  const e = regras.calcular(p, cat).equipamento.escudo; assert.equal(e?.dureza, 8); assert.equal(e?.pv, 64); assert.equal(e?.limiarQuebra, 32);
  p.runasEquipamento = { escudo: { reforco: 'runa-reforcadora-maior' } }; assert.match(regras.validar(p, cat).erros.join(' '), /Runa inválida/);
});

test('grupo de arma do Guerreiro e especialização usam arma realmente selecionada', () => {
  const cat = bibliotecaReal(), p = ficha(7); p.armaId = 'espada-longa'; p.escolhasClasse = { periciaInicial: 'atletismo', grupoArma: 'espada' };
  const c = regras.calcular(p, cat); assert.equal(c.graduacaoArma, 3); assert.equal(c.ataque, 17); assert.equal(c.bonusDanoArma, 3); assert.equal(c.danoArma, '1d8+7');
  p.armaId = 'machado-de-batalha'; assert.equal(regras.calcular(p, cat).graduacaoArma, 2); assert.equal(regras.calcular(p, cat).bonusDanoArma, 2);
});

test('escudo de corpo reduz movimento ao segurar e cobertura só dá o bônus de circunstância maior', () => {
  const cat = bibliotecaReal(), p = ficha(); p.escudoId = 'escudo-de-corpo'; p.escudoErguido = true;
  assert.equal(regras.calcular(p, cat).deslocamento, 6); assert.equal(regras.calcular(p, cat).ca, 17);
  p.escudoCobertura = true; assert.equal(regras.calcular(p, cat).ca, 19);
});

test('slots reais Player Core e escola de Mago ficam separados dos espaços de currículo', () => {
  const cat = bibliotecaReal(), p = ficha(5); p.classeId = 'mago'; p.opcaoClasseId = 'ars-grammatica'; p.atributoChave = 'int';
  const conj = regras.calcular(p, cat).conjuracao;
  assert.deepEqual(conj?.espacos, { '1': 3, '2': 3, '3': 2 }); assert.equal(conj?.truques, 6); assert.deepEqual(conj?.extraCurriculo, { '1': 1, '2': 1, '3': 1 });
  p.opcaoClasseId = 'teoria-magica-unificada'; assert.equal(regras.calcular(p, cat).conjuracao?.truques, 5);
});

test('tabela PC2 indexada por nível e magias concedidas são normalizadas sem duplicar', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { tradicao: 'divina', atributo: 'car', truques: 2, espacosPorNivel: { '1': [3], '3': [4, 3] } },
    opcoes: [{ id: 'misterio', magiasConcedidas: [{ id: 'gift', nome: 'Concedida', graduacao: 0, tipo: 'truque' }, { id: 'rank2', graduacao: 2, nome: 'Concedida 2' }] }] });
  const p = ficha(); p.opcaoClasseId = 'misterio'; let q = regras.normalizar(p, cat); assert.equal(q.magias.length, 1); assert.deepEqual(regras.normalizar(q, cat).magias, q.magias);
  assert.deepEqual(regras.calcular(p, cat).conjuracao?.espacos, { '1': 3 }); p.nivel = 3; q = regras.normalizar(p, cat); assert.equal(q.magias.length, 2);
  assert.deepEqual(regras.calcular(p, cat).conjuracao?.espacos, { '1': 4, '2': 3 }); assert.equal(p.magias.length, 0);
});

test('efeitos de instinto escolhem último patamar, dividem Fúria ágil e evitam dano em arremesso', () => {
  const cat = structuredClone(catalogo); cat.classes[0].opcoes = [{ id: 'instinto', progressao: [
    { nivel: 1, efeitos: [{ alvo: 'dano', tipo: 'sem-tipo', valor: 2, condicao: 'furia', grupo: 'furia', reduzAgil: true, apenasCorpoACorpo: true }] },
    { nivel: 7, efeitos: [{ alvo: 'dano', tipo: 'sem-tipo', valor: 6, condicao: 'furia', grupo: 'furia', reduzAgil: true, apenasCorpoACorpo: true }] }] }];
  const p = ficha(7); p.opcaoClasseId = 'instinto'; p.estados = { furia: true }; p.arma = { grau: 'marciais', dano: '1d6', tracos: ['agil'] };
  assert.equal(regras.calcular(p, cat).bonusDanoArma, 3); p.armaModo = 'arremesso'; assert.equal(regras.calcular(p, cat).bonusDanoArma, 0);
});

test('Ladrão usa Destreza no dano corpo a corpo de acuidade, mas arremesso continua Força', () => {
  const cat = bibliotecaReal(), p = ficha(); p.classeId = 'ladino'; p.opcaoClasseId = 'ladrao'; p.atributoChave = 'des'; p.armaId = 'adaga';
  p.incrementos = regras.criar().incrementos; p.atributos = { for: 1, des: 4, con: 2, int: 0, sab: 0, car: 0 };
  assert.equal(regras.calcular(p, cat).danoArma, '1d4+4'); assert.equal(regras.calcular(p, cat).atributoDanoArma, 'des');
  p.armaModo = 'arremesso'; assert.equal(regras.calcular(p, cat).danoArma, '1d4+1'); assert.equal(regras.calcular(p, cat).atributoDanoArma, 'for');
});

test('concessões de talentos são idempotentes, preservam escolhas e dispensam somente seu próprio slot', () => {
  const cat = structuredClone(catalogo); cat.ancestralidades[0].herancas[0].talentosConcedidos = ['biografia'];
  const p = ficha(); p.talentos = p.talentos.filter(t => t.id !== 'biografia');
  const q = regras.normalizar(p, cat);
  assert.equal(q.talentos.find(t => t.id === 'biografia')?.origem, 'heranca:versatil');
  assert.equal(regras.validar(q, cat).valido, true);
  assert.deepEqual(regras.normalizar(q, cat).talentos, q.talentos); assert.equal(p.talentos.length, 2);
  q.herancaId = ''; assert.equal(regras.normalizar(q, cat).talentos.some(t => t.id === 'biografia'), false);
});

test('Punho Poderoso e duas mãos expõem o dado efetivo sem alterar outros ataques naturais', () => {
  const cat = bibliotecaReal(), p = ficha(); p.classeId = 'monge'; p.armaId = 'punho';
  assert.equal(regras.calcular(p, cat).facesDanoArma, 6); assert.equal(regras.calcular(p, cat).danoArma, '1d6+4');
  cat.equipamentos.push({ id: 'garra-teste', tipo: 'arma', grau: 'desarmado', dano: '1d4', tracos: ['agil'] });
  p.armaId = 'garra-teste'; assert.equal(regras.calcular(p, cat).facesDanoArma, 4);
  p.armaId = 'cajado'; p.armaMaos = 2; assert.equal(regras.calcular(p, cat).facesDanoArma, 8);
});

test('funda propulsiva usa metade de Força positiva, negativa inteira e estado Enfraquecido', () => {
  const cat = bibliotecaReal(), p = ficha(); p.armaId = 'funda';
  assert.equal(regras.calcular(p, cat).danoArma, '1d6+2');
  p.condicoes = [{ id: 'enfraquecido', valor: 1 }]; assert.equal(regras.calcular(p, cat).danoArma, '1d6+1');
  p.incrementos = regras.criar().incrementos; p.atributos.for = -1; p.condicoes = [];
  assert.equal(regras.calcular(p, cat).danoArma, '1d6-1');
});

test('magia Qi depende do talento, da tradição escolhida e da progressão condicional', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: undefined, progressao: [
    { nivel: 9, proficienciasCondicionais: { conjuracao: 2, requer: 'magias-qi' } },
    { nivel: 17, proficienciasCondicionais: { conjuracao: 3, requer: 'magias-qi' } }] });
  cat.talentos.push({ id: 'monge-magias-qi', nome: 'Magias Qi', tipo: 'classe', nivel: 1,
    conjuracao: { tipo: 'foco', atributo: 'sab', grau: 1, focoInicial: 1, tradicoesEscolha: ['divina', 'ocultista'] } });
  const p = ficha(9); assert.equal(regras.calcular(p, cat).cdMagia, null);
  p.talentos[1] = { id: 'monge-magias-qi', tipo: 'classe', nivel: 1 }; p.escolhasClasse = { tradicaoQi: 'ocultista' };
  assert.equal(regras.calcular(p, cat).proficiencias.conjuracao, 2); assert.equal(regras.calcular(p, cat).conjuracao?.foco, 1);
  p.nivel = 17; assert.equal(regras.calcular(p, cat).proficiencias.conjuracao, 3);
  p.escolhasClasse = { tradicaoQi: 'arcana' }; assert.match(regras.validar(p, cat).pendencias.join(' '), /tradição mágica/);
});

test('repertório distingue magias escolhidas e concedidas; ranque aprendido e assinaturas têm limites', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { tipo: 'espontanea', tradicao: 'arcana', atributo: 'car', truques: 0,
    espacosPorNivel: { '1': [3], '3': [4, 3] }, repertorioEscolhidoPorNivel: { '1': [2], '3': [3, 2] }, magiasAssinaturaDesde: 3, assinaturasPorGraduacao: 1 },
    opcoes: [{ id: 'linhagem', magiasConcedidas: [{ id: 'concedida', nome: 'Concedida', graduacao: 1 }] }] });
  cat.magias.push(...['a', 'b', 'concedida'].map(id => ({ id, nome: id, nivel: 1, tipo: 'magia', tradicoes: ['arcana'] })));
  const p = ficha(); p.opcaoClasseId = 'linhagem'; p.magias = [{ id: 'a', ranque: 1 }, { id: 'b', ranque: 1 }];
  assert.doesNotMatch(regras.validar(p, cat).pendencias.join(' '), /repertório/);
  p.magias = [{ id: 'a', ranque: 1, assinatura: true }]; assert.match(regras.validar(p, cat).erros.join(' '), /assinatura/);
  assert.match(regras.validar(p, cat).pendencias.join(' '), /Escolha 1 magia/);
  p.magias = [{ id: 'a', ranque: 2 }]; assert.match(regras.validar(p, cat).erros.join(' '), /Ordem de magia/);
});

test('efeitos e magias de escolhas extras com opções estruturadas exigem opção canônica', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { escolhasExtras: [{ id: 'bencao', nome: 'Bênção', nivel: 3, opcoes: [{ id: 'rapidez', nome: 'Rapidez', efeitos: [{ alvo: 'deslocamento', tipo: 'estado', valor: 1.5 }] }] }] });
  const p = ficha(3); assert.match(regras.validar(p, cat).pendencias.join(' '), /Bênção/);
  p.escolhasClasse = { bencao: 'rapidez' }; assert.equal(regras.calcular(p, cat).deslocamento, 9);
  assert.doesNotMatch(regras.validar(p, cat).pendencias.join(' '), /Bênção/);
  p.escolhasClasse = { bencao: 'inventada' }; assert.equal(regras.calcular(p, cat).deslocamento, 7.5);
});

test('talentos de conjuração e armadura calculam benefícios; opções e capacidades restringem aquisição', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { atributo: 'int', tradicao: 'arcana', truques: 5 } }); cat.classes[0].opcoes = [{ id: 'capelao', capacidades: ['familiar'] }];
  cat.talentos.push({ id: 'expansao', nome: 'Expansão', nivel: 1, tipo: 'classe', conjuracao: { truquesExtras: 2 }, requisitosEstruturados: { opcoesClasse: ['capelao'], capacidades: ['familiar'] },
    proficiencias: { armaduras: { pesada: 1 } }, armaduraAcompanha: 'media' });
  cat.classes[0].progressao.push({ nivel: 5, proficiencias: { armaduras: { media: 3 } } });
  const p = ficha(5); p.opcaoClasseId = 'capelao'; p.talentos[1] = { id: 'expansao', nivel: 1, tipo: 'classe' };
  assert.equal(regras.calcular(p, cat).conjuracao?.truques, 7); assert.equal((regras.calcular(p, cat).proficiencias.armaduras as Record<string, number>).pesada, 3);
  assert.doesNotMatch(regras.validar(p, cat).erros.join(' '), /exigida ausente/);
  p.opcaoClasseId = ''; assert.match(regras.validar(p, cat).erros.join(' '), /opção de classe exigida/); assert.match(regras.validar(p, cat).erros.join(' '), /capacidade exigida/);
});

test('defesas usam só metadados confiáveis e resistências iguais não acumulam', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { resistencias: [{ tipo: 'veneno', metadeNivel: true }] });
  cat.ancestralidades[0].herancas[0].defesas = { imunidades: ['vazio'], resistencias: [{ tipo: 'veneno', valor: 2 }], curaPeloVazio: true };
  const p = ficha(7); p.defesas = { imunidades: ['tudo'] }; const d = regras.calcular(p, cat).defesas;
  assert.deepEqual(d.imunidades, ['vazio']); assert.deepEqual(d.resistencias, [{ tipo: 'veneno', metadeNivel: true, valor: 3 }]); assert.equal(d.curaPeloVazio, true);
  assert.deepEqual(regras.calcular(ficha(), catalogo).defesas.imunidades, []);
});

test('recursos reais do Alquimista usam Inteligência e recuperação por patamar, sem mudar gastos', () => {
  const cat = bibliotecaReal(), p = ficha(9); p.classeId = 'alquimista'; p.incrementos = regras.criar().incrementos; p.atributos.int = 4; p.recursosGastos = { 'frascos-versateis': 1 };
  const r = regras.calcular(p, cat).recursosCalculados;
  assert.equal(r.find(r => r.id === 'frascos-versateis')?.maximo, 6); assert.equal(r.find(r => r.id === 'frascos-versateis')?.recuperacao.quantidade, 3);
  assert.equal(r.find(r => r.id === 'alquimia-avancada')?.maximo, 8); assert.deepEqual(p.recursosGastos, { 'frascos-versateis': 1 });
});

test('PV temporários de Fúria são calculados, dependem de estado e nunca somam na vida do personagem', () => {
  const cat = bibliotecaReal(), p = ficha(7); p.classeId = 'barbaro'; p.vida.temporaria = 20;
  let r = regras.calcular(p, cat).recursosCalculados.find(r => r.id === 'pv-temporarios-furia'); assert.equal(r?.maximo, 10); assert.equal(r?.ativo, false);
  p.estados = { furia: true }; r = regras.calcular(p, cat).recursosCalculados.find(r => r.id === 'pv-temporarios-furia'); assert.equal(r?.ativo, true); assert.equal(r?.naoSoma, true); assert.equal(p.vida.temporaria, 20);
});

test('ataque de animal é resolvido pela opção selecionada e cresce no nível confirmado', () => {
  const cat = bibliotecaReal(), p = ficha(); p.classeId = 'barbaro'; p.opcaoClasseId = 'animal'; p.escolhasClasse = { 'animal-instinto': 'urso' }; p.armaId = 'instinto-urso-mandibula';
  assert.equal(regras.calcular(p, cat).facesDanoArma, 10); p.nivel = 7; assert.equal(regras.calcular(p, cat).facesDanoArma, 12);
  p.escolhasClasse = { 'animal-instinto': 'lobo' }; assert.match(regras.validar(p, cat).erros.join(' '), /Equipamento inválido/);
});

test('Fúria Animal, Gigante e Superstição só aplicam seu patamar nas circunstâncias corretas', () => {
  const cat = bibliotecaReal(), p = ficha(7); p.classeId = 'barbaro'; p.opcaoClasseId = 'animal'; p.escolhasClasse = { 'animal-instinto': 'urso' }; p.armaId = 'instinto-urso-mandibula'; p.estados = { furia: true };
  assert.equal(regras.calcular(p, cat).bonusDanoArma, 7); // especialista +2, instinto +5
  p.armaId = 'instinto-urso-garra'; assert.equal(regras.calcular(p, cat).bonusDanoArma, 4); // ágil:floor(5/2)+2
  p.opcaoClasseId = 'gigante'; p.armaId = 'espada-longa'; assert.equal(regras.calcular(p, cat).bonusDanoArma, 4); // base +2 +especialização2
  p.armaMaior = true; assert.equal(regras.calcular(p, cat).bonusDanoArma, 12);
  p.opcaoClasseId = 'supersticao'; assert.equal(regras.calcular(p, cat).bonusDanoArma, 9); p.alvoConjurador = true; assert.equal(regras.calcular(p, cat).bonusDanoArma, 10);
});

test('magias forjadas/desconhecidas/consulta não concedem foco nem cumprem vagas', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { tradicao: 'arcana', atributo: 'int', truques: 1, focoInicial: 0 } });
  cat.magias.push({ id: 'consulta', nome: 'Consulta', nivel: 0, tipo: 'foco', somenteConsulta: true }, { id: 'divina', nome: 'Divina', tipo: 'magia', nivel: 1, tradicoes: ['divina'] });
  const p = ficha(); p.magias = [{ id: 'fake', tipo: 'foco', nivel: 0, origem: 'classe:guerreiro', aprovadoPeloMestre: true }, { id: 'consulta', tipo: 'foco' }];
  assert.equal(regras.calcular(p, cat).conjuracao?.foco, 0); assert.match(regras.validar(p, cat).erros.join(' '), /Magia desconhecida/); assert.match(regras.validar(p, cat).pendencias.join(' '), /truques/);
  p.magias = [{ id: 'divina', origem: 'especializacao:falsa', aprovadoPeloMestre: true }]; assert.match(regras.validar(p, cat).erros.join(' '), /não pertence à tradição/);
  p.magias = [{ id: 'divina', concedidaAutomaticamente: true, origem: 'classe:guerreiro' }]; assert.equal(regras.normalizar(p, cat).magias.length, 0);
});

test('perícia que só melhorou depois não cumpre pré-requisito de aquisição anterior', () => {
  const cat = structuredClone(catalogo); cat.talentos.push({ id: 'medicina-exp', nome: 'Medicina Especialista', nivel: 1, tipo: 'classe', requisitosEstruturados: { pericias: { medicina: 2 } } });
  const p = ficha(5); p.pericias.medicina = 2; p.talentos[1] = { id: 'medicina-exp', nivel: 1, tipo: 'classe' };
  assert.match(regras.validar(p, cat).erros.join(' '), /graduação insuficiente em medicina no nível de aquisição/);
});

test('preparação diária distingue biblioteca e slots, permite repetição e rejeita consumo inválido', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { preparacao: 'preparada', tradicao: 'arcana', atributo: 'int', truques: 1, espacosPorNivel: { '1': [2] } } });
  cat.magias.push({ id: 'truque', nome: 'Truque', tipo: 'truque', nivel: 1, tradicoes: ['arcana'] }, { id: 'magia', nome: 'Magia', tipo: 'magia', nivel: 1, tradicoes: ['arcana'] }, { id: 'forte', nome: 'Forte', tipo: 'magia', nivel: 2, tradicoes: ['arcana'] });
  const p = ficha(); p.magias = [{ id: 'truque' }, { id: 'magia' }];
  assert.match(regras.validar(p, cat).pendencias.join(' '), /Prepare os espaços restantes/);
  p.magiasPreparadas = { truques: ['truque'], padrao: { '1': ['magia', 'magia'] }, curriculo: {} }; assert.equal(regras.validar(p, cat).valido, true);
  p.preparacaoGasta = { padrao: { '1': [0, 2] } }; assert.match(regras.validar(p, cat).erros.join(' '), /Consumo de espaço preparado inválido/);
  p.preparacaoGasta = {}; p.magiasPreparadas = { truques: ['truque', 'truque'], padrao: { '1': ['magia', 'forte'] } }; assert.match(regras.validar(p, cat).erros.join(' '), /Truques preparados precisam ser diferentes/); assert.match(regras.validar(p, cat).erros.join(' '), /incompatível com o espaço/);
});

test('Fúria de dragão separa dano do sopro da arma para aplicar defesas corretamente', () => {
  const cat = bibliotecaReal(), p = ficha(7); p.classeId = 'barbaro'; p.opcaoClasseId = 'dragao'; p.escolhasClasse = { 'dragao-instinto': 'diabolico' }; p.armaId = 'espada-longa'; p.estados = { furia: true };
  const c = regras.calcular(p, cat); assert.equal(c.bonusDanoArma, 2); assert.deepEqual(c.danoExtraFuria, { tipo: 'fogo', valor: 8 }); assert.equal(c.danoArma, '1d8+6 + 8 (fogo)');
});

test('inventário calcula 10 leves por volume e inclui equipamento equipado uma única vez', () => {
  const cat = bibliotecaReal(), p = ficha(); p.armaId = 'espada-longa'; p.armaduraId = 'couro-batido';
  cat.equipamentos.push({ id: 'leve', nome: 'Leve', tipo: 'equipamento', volume: 'L' });
  p.equipamentos = [{ id: 'espada-longa', quantidade: 1 }, { id: 'leve', quantidade: 19 }];
  const carga = regras.calcular(p, cat).carga; assert.equal(carga.volume, 3); assert.equal(carga.leves, 9); assert.equal(carga.limiteSobrecarga, 9); assert.equal(carga.limiteMaximo, 14);
  p.equipamentos.push({ id: 'desconhecido', quantidade: 1 }); assert.deepEqual(regras.calcular(p, cat).carga.pendentes, ['desconhecido']); assert.match(regras.validar(p, cat).pendencias.join(' '), /Volume ainda não confirmado/);
});

test('sobrecarga aplica Desajeitado1 e menos 3m, sem empilhar com Desajeitado maior', () => {
  const cat = bibliotecaReal(), p = ficha(); p.armaId = 'espada-longa'; p.equipamentos = [{ id: 'espada-longa', quantidade: 10 }];
  const c = regras.calcular(p, cat); assert.equal(c.carga.sobrecarregado, true); assert.equal(c.deslocamento, 4.5); assert.equal(c.ca, 14); assert.equal(c.salvaguardas.reflexos, 6);
  p.condicoes = [{ id: 'desajeitado', valor: 2 }]; assert.equal(regras.calcular(p, cat).ca, 13);
  p.equipamentos = [{ id: 'espada-longa', quantidade: 9 }]; assert.equal(regras.calcular(p, cat).carga.sobrecarregado, false);
});

test('precisões reais dependem do alvo e arma, sem trocar atributo do dano por Inteligência', () => {
  const cat = bibliotecaReal(), p = ficha(5); p.classeId = 'ladino'; p.opcaoClasseId = 'ladrao'; p.armaId = 'adaga';
  assert.deepEqual(regras.calcular(p, cat).danosExtras, []); p.estados = { alvoDesprevenido: true };
  assert.deepEqual(regras.calcular(p, cat).danosExtras, [{ nome: 'Ataque Furtivo', expressao: '2d6', tipo: 'precisao' }]);
  p.armaId = 'espada-longa'; assert.deepEqual(regras.calcular(p, cat).danosExtras, []);
  p.classeId = 'investigador'; p.opcaoClasseId = ''; p.armaId = 'adaga'; p.estados = { estratagema: true }; p.incrementos = regras.criar().incrementos; p.atributos = { for: 1, des: 2, con: 2, int: 4, sab: 0, car: 0 };
  const c = regras.calcular(p, cat); assert.equal(c.atributoAtaqueArma, 'int'); assert.equal(c.ataque, 13); assert.equal(c.atributoDanoArma, 'for'); assert.deepEqual(c.danosExtras, [{ nome: 'Ataque Estratégico', expressao: '2d6', tipo: 'precisao' }]);
  p.armaId = 'espada-longa'; assert.equal(regras.calcular(p, cat).atributoAtaqueArma, 'for'); assert.deepEqual(regras.calcular(p, cat).danosExtras, []);
});

test('foco de catálogo exige concessão da fonte e escolha de talento Qi concede só uma magia', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { tradicao: 'divina', tipo: 'foco', atributo: 'sab', focoInicial: 0 } });
  cat.magias.push({ id: 'qi-a', nome: 'Qi A', tipo: 'foco', nivel: 1, tradicoes: ['divina'] }, { id: 'qi-b', nome: 'Qi B', tipo: 'foco', nivel: 1, tradicoes: ['divina'] });
  cat.talentos.push({ id: 'qi', nome: 'Qi', nivel: 1, tipo: 'classe', escolhasExtras: [{ id: 'qi-inicial', nivel: 1, opcoes: ['qi-a', 'qi-b'].map(id => ({ id, magiasConcedidas: [{ id, tipo: 'foco', graduacao: 1 }] })) }] });
  const p = ficha(); p.magias = [{ id: 'qi-a', tipo: 'foco', origem: 'qualquer' }]; assert.equal(regras.calcular(p, cat).conjuracao?.foco, 0); assert.match(regras.validar(p, cat).erros.join(' '), /Magia não concedida/);
  p.magias = []; p.talentos[1] = { id: 'qi', nivel: 1, tipo: 'classe' }; assert.match(regras.validar(p, cat).pendencias.join(' '), /qi-inicial/);
  p.escolhasClasse = { 'qi-inicial': 'qi-b' }; const q = regras.normalizar(p, cat); assert.deepEqual(q.magias.map(m => (m as Registro).id), ['qi-b']); assert.equal(regras.calcular(q, cat).conjuracao?.foco, 1); assert.equal(regras.magiaElegivel(q, 'qi-a', cat), false); assert.equal(regras.magiaElegivel(q, 'qi-b', cat), true);
});

test('Saber do Oráculo é obrigatório e ganho automático sem perder treinamento por sobreposição', () => {
  const cat = bibliotecaReal(), p = ficha(); p.classeId = 'oraculo'; p.opcaoClasseId = 'conhecimento';
  assert.match(regras.validar(p, cat).pendencias.join(' '), /Saber concedido pela classe/);
  p.escolhasClasse = { periciaSaber: 'Astronomia' }; assert.equal(regras.calcular(p, cat).grausPericias['saber:Astronomia'], 1);
  assert.doesNotMatch(regras.validar(p, cat).pendencias.join(' '), /Saber concedido pela classe/);
});

test('incremento extra do Espadachim exige estilo e é automático separado dos incrementos livres', () => {
  const cat = bibliotecaReal(), p = ficha(3); p.classeId = 'espadachim'; p.opcaoClasseId = 'ginasta'; p.pericias.acrobacia = 1;
  assert.match(regras.validar(p, cat).pendencias.join(' '), /incremento extra do nível 3/);
  p.incrementosPericiaExtras = { '3': 'acrobacia' }; assert.equal(regras.calcular(p, cat).grausPericias.acrobacia, 2); assert.doesNotMatch(regras.validar(p, cat).pendencias.join(' '), /incremento extra do nível 3/);
  p.incrementosPericiaExtras = { '3': 'religiao' }; assert.equal(regras.calcular(p, cat).grausPericias.religiao, 0); assert.match(regras.validar(p, cat).pendencias.join(' '), /incremento extra do nível 3/);
});

test('mínimos conhecidos do grimório são diferentes das preparadas e aceitam aprendizado adicional', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { conjuracao: { tradicao: 'arcana', atributo: 'int', truques: 1, conhecidas: { truques: 2, magiasIniciais: 2, magiasPorNivel: 2 } } });
  cat.magias.push(...['a', 'b'].map(id => ({ id, nome: id, nivel: 1, tipo: 'truque', tradicoes: ['arcana'] })), ...['c', 'd', 'e'].map(id => ({ id, nome: id, nivel: 1, tipo: 'magia', tradicoes: ['arcana'] })));
  const p = ficha(); p.magias = [{ id: 'a' }, { id: 'c' }]; assert.match(regras.validar(p, cat).pendencias.join(' '), /truques conhecidos/); assert.match(regras.validar(p, cat).pendencias.join(' '), /magias conhecidas/);
  p.magias = [{ id: 'a' }, { id: 'a' }, { id: 'c' }, { id: 'c' }]; assert.match(regras.validar(p, cat).pendencias.join(' '), /truques conhecidos/); assert.match(regras.validar(p, cat).pendencias.join(' '), /magias conhecidas/);
  p.magias = ['a', 'b', 'c', 'd', 'e'].map(id => ({ id })); assert.doesNotMatch(regras.validar(p, cat).pendencias.join(' '), /conhecid/); assert.equal(regras.validar(p, cat).erros.length, 0);
  p.nivel = 3; assert.deepEqual(regras.calcular(p, cat).conjuracao?.conhecidasMinimos, { truques: 2, magias: 6 }); assert.match(regras.validar(p, cat).pendencias.join(' '), /magias conhecidas.*3 restantes/);
});

test('objetos manuais de equipamento e bônus só afetam cálculos com autorização persistida do mestre', () => {
  const cat = bibliotecaReal(), p = ficha(); p.equipamentoAprovadoPeloMestre = false; p.bonusAprovadosPeloMestre = false;
  p.arma = { bonus: 99, grau: 'marciais', dano: '8d20' }; p.armadura = { ca: 99, limiteDes: 99, grau: 'sem' }; p.bonus = [{ alvo: 'ca', tipo: 'sem-tipo', valor: 99 }];
  const c = regras.calcular(p, cat); assert.equal(c.ca, 15); assert.equal(c.ataque, 9); assert.equal(c.danoArma, '1d4+4'); assert.equal(c.equipamento.arma?.id, 'punho');
  assert.deepEqual(regras.normalizar(p, cat).arma, p.arma); // os dados antigos permanecem como anotação
  p.armaId = 'espada-longa'; p.armaduraId = 'couro-batido'; assert.equal(regras.calcular(p, cat).ca, 17); assert.equal(regras.calcular(p, cat).danoArma, '1d8+4');
});

test('deidade limita domínio, Fonte divina, santificação e arma favorecida por fonte selecionada', () => {
  const cat = { ...structuredClone(catalogo), dominios: [{ id: 'dominio-a', magiasConcedidas: [{ id: 'foco-a', graduacao: 1, tipo: 'foco' }] }] };
  Object.assign(cat.classes[0], { concedeDominio: true, armas: { simples: 1, marciais: 0 }, conjuracao: { atributo: 'sab', tradicao: 'divina', truques: 0, exigeMagias: false, fonteDivina: { espacos: [{ nivel: 1, quantidade: 4 }] } }, escolhasExtras: [{ id: 'divindade', nivel: 1, opcoes: [{ id: 'deus', dominios: ['dominio-a'], fontesDivinas: ['curar'], armaFavorecidaId: 'favorita', periciasFixas: ['religiao'], santificacao: { obrigatoria: true, opcoes: ['sagrado'] } }] }] });
  cat.equipamentos.push({ id: 'favorita', tipo: 'arma', grau: 'marciais', dano: '1d8', volume: 1 }); cat.magias.push({ id: 'foco-a', nome: 'Foco', tipo: 'foco', nivel: 1 });
  const p = ficha(); p.armaId = 'favorita'; p.escolhasClasse = { divindade: 'deus' }; assert.match(regras.validar(p, cat).pendencias.join(' '), /domínio concedido/);
  p.escolhasClasse = { divindade: 'deus', dominio: 'dominio-a', santificacao: 'sagrado' }; assert.equal(regras.calcular(p, cat).conjuracao?.foco, 1); assert.equal((regras.calcular(p, cat).conjuracao?.fonteDivina as Registro).magia, 'curar'); assert.equal(regras.calcular(p, cat).graduacaoArma, 1);
  assert.equal(regras.calcular(p, cat).grausPericias.religiao, 1); p.escolhasClasse = { divindade: 'deus', dominio: 'falso', santificacao: 'profano' }; assert.equal(regras.calcular(p, cat).conjuracao?.foco, 0); assert.equal((regras.normalizar(p, cat).escolhasClasse as Registro).santificacao, 'sagrado');
});

test('tese inicial do Mago é fonte mecânica e suas escolhas aninhadas são obrigatórias', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { escolhasExtras: [{ id: 'tese', nivel: 1, opcoes: [{ id: 'experimento', escolhasExtras: [{ id: 'moldamagia', nivel: 1, opcoes: [{ id: 'ampliar', talentosConcedidos: ['classe'] }] }] }] }] });
  const p = ficha(); assert.match(regras.validar(p, cat).pendencias.join(' '), /tese/); p.escolhasClasse = { tese: 'experimento' };
  assert.match(regras.validar(p, cat).pendencias.join(' '), /moldamagia/); assert.equal(regras.escolhasExtras(p, cat).some(e => e.id === 'moldamagia'), true);
  p.escolhasClasse = { tese: 'experimento', moldamagia: 'ampliar' }; p.talentos = p.talentos.filter(t => t.id !== 'classe'); const q = regras.normalizar(p, cat);
  assert.equal(q.talentos.find(t => t.id === 'classe')?.origem, 'escolha:moldamagia:ampliar'); assert.doesNotMatch(regras.validar(q, cat).pendencias.join(' '), /moldamagia/);
});

test('Simplicidade Mortal usa arma favorecida simples, não melhora uma arma marcial', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { simplicidadeMortalSeArmaFavorecidaSimples: true, escolhasExtras: [{ id: 'divindade', nivel: 1, opcoes: [{ id: 'deus', armaFavorecidaId: 'maca' }] }] });
  cat.equipamentos.push({ id: 'maca', tipo: 'arma', grau: 'simples', dano: '1d6', volume: 1, tracos: ['duas-maos-d8'] }, { id: 'marcial', tipo: 'arma', grau: 'marciais', dano: '1d8', volume: 1 });
  const p = ficha(); p.armaId = 'maca'; p.escolhasClasse = { divindade: 'deus' }; assert.equal(regras.calcular(p, cat).facesDanoArma, 8);
  assert.deepEqual(regras.calcular(p, cat).facesDanoArmaPorMaos, { 1: 8, 2: 10 }); p.armaMaos = 2; assert.equal(regras.calcular(p, cat).facesDanoArma, 10);
  p.armaId = 'marcial'; assert.equal(regras.calcular(p, cat).facesDanoArma, 8);
});

test('talento condicional da doutrina só é concedido se a divindade favorece arma simples', () => {
  const cat = structuredClone(catalogo); Object.assign(cat.classes[0], { talentosConcedidosCondicionais: [{ id: 'mortal', condicao: 'arma-favorecida-simples' }], escolhasExtras: [{ id: 'divindade', nivel: 1, opcoes: [{ id: 'deus', armaFavorecidaId: 'simples' }, { id: 'outro', armaFavorecidaId: 'marcial' }] }] });
  cat.equipamentos.push({ id: 'simples', tipo: 'arma', grau: 'simples', dano: '1d6', volume: 1 }, { id: 'marcial', tipo: 'arma', grau: 'marciais', dano: '1d8', volume: 1 });
  cat.talentos.push({ id: 'mortal', nome: 'Mortal', tipo: 'classe', nivel: 1, melhoraArmaFavorecidaSimples: true });
  const p = ficha(); p.escolhasClasse = { divindade: 'deus' }; const q = regras.normalizar(p, cat); assert.equal(q.talentos.find(t => t.id === 'mortal')?.origem, 'classe:guerreiro'); assert.equal(regras.validar(q, cat).valido, true);
  q.escolhasClasse = { divindade: 'outro' }; assert.equal(regras.normalizar(q, cat).talentos.some(t => t.id === 'mortal'), false);
});

test('Bloqueio de Escudo exige capacidade revisada ativa e escudo conhecido com estatísticas pós-runa', () => {
  const cat = structuredClone(catalogo);
  cat.equipamentos.push({ id: 'escudo', tipo: 'escudo', dureza: 5, pv: 20, limiarQuebra: 10, volume: 1 }, { id: 'reforco', tipo: 'runa', automatizavel: true, mecanica: { tipo: 'runa', categoria: 'escudo', familia: 'reforcadora', reforco: { aumentoDureza: 3, maximoDureza: 8, aumentoPv: 16, maximoPv: 32, aumentoLimiarQuebra: 8, maximoLimiarQuebra: 16 } } });
  cat.talentos.push({ id: 'bloqueio', nome: 'Bloqueio', tipo: 'geral', nivel: 1, bloqueioEscudo: true }, { id: 'consulta-bloqueio', nome: 'Consulta', tipo: 'geral', nivel: 1, bloqueioEscudo: true, somenteConsulta: true });
  const p = ficha(); p.escudoId = 'escudo'; p.bloqueioEscudo = true;
  assert.equal(regras.calcular(p, cat).bloqueioEscudo, false); // a propriedade recebida não concede capacidade
  p.talentos.push({ id: 'consulta-bloqueio', nivel: 1, tipo: 'geral' }); assert.equal(regras.calcular(p, cat).bloqueioEscudo, false);
  p.talentos.push({ id: 'bloqueio', nivel: 1, tipo: 'geral' }); p.runasEquipamento = { escudo: { reforco: 'reforco' } };
  const c = regras.calcular(p, cat); assert.equal(c.bloqueioEscudo, true); assert.equal(c.escudoCalculado?.dureza, 8); assert.equal(c.escudoCalculado?.pv, 32); assert.equal(c.escudoCalculado?.limiarQuebra, 16);
  p.escudoId = 'desconhecido'; assert.equal(regras.calcular(p, cat).bloqueioEscudo, false);
});

test('capacidade canônica do Bloqueio com Escudo real habilita reação sem flag manual', () => {
  const cat = bibliotecaReal(), p = ficha(); p.classeId = 'ladino';
  const escudo = (cat.equipamentos as Registro[]).find(r => r.tipo === 'escudo' && r.somenteConsulta !== true);
  assert.ok(escudo); p.escudoId = escudo.id;
  p.talentos.push({ id: 'bloqueio-com-escudo', tipo: 'geral', nivel: 1 });
  assert.equal(regras.calcular(p, cat).bloqueioEscudo, true);
  p.talentos = p.talentos.filter(t => t.id !== 'bloqueio-com-escudo'); p.capacidades = ['bloqueio-com-escudo'];
  assert.equal(regras.calcular(p, cat).bloqueioEscudo, false);
});
