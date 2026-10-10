import CRIACAO from './criacao-pt-br.json' with {type:'json'};

export const NIVEIS_ESCOLA=[1,6,10,14,18];
export const CAPAS={nenhuma:{nome:'Sem capa',base:10},inverno:{nome:'Capa de inverno',base:11,maxDex:2,furtividade:'Desvantagem'},seda:{nome:'Capa de seda',base:11},escudo:{nome:'Capa-escudo',base:12},seminviso:{nome:'Capa de seminviso',base:13,maxDex:2,furtividade:'Vantagem'},desilusao:{nome:'Capa de desilusão',base:14,furtividade:'Vantagem'}};

export function talentosDaFicha(d){return [d.talentoCasa?{...d.talentoCasa,nivel:1,origem:'casa'}:null,...(d.aumentos??[]).filter(a=>a.talento).map(a=>({...a.talento,nivel:a.nivel,origem:'aprimoramento'}))].filter(Boolean);}
export function validarTalentos(d){
  const vistos=new Set();
  for(const escolha of talentosDaFicha(d)){
    const t=CRIACAO.talentos[escolha.id];
    if(!t||vistos.has(escolha.id))throw Error('Talento inválido ou repetido.');vistos.add(escolha.id);
    if(t.inato&&(escolha.origem!=='casa'||d.nivel!==1&&escolha.nivel!==1))throw Error('Talentos inatos são escolhidos somente como talento da Casa na criação.');
    if(escolha.atributo!==undefined&&!t.atributoEscolha?.includes(escolha.atributo))throw Error('Atributo do talento inválido.');
    if(escolha.pericia!==undefined&&!t.periciaEscolha?.includes(escolha.pericia))throw Error('Perícia do talento inválida.');
    const treinos=escolha.treinamentos??[];
    if(!Array.isArray(treinos)||treinos.length>(t.treinamentos??0)||new Set(treinos).size!==treinos.length||treinos.some(k=>!CRIACAO.pericias[k]&&!CRIACAO.ferramentas.includes(k)))throw Error('Treinamentos do talento inválidos.');
    const idiomas=escolha.idiomas??[];
    if(!Array.isArray(idiomas)||idiomas.length>(t.idiomas??0)||new Set(idiomas).size!==idiomas.length||idiomas.some(k=>typeof k!=='string'||!k.trim()||k.length>80))throw Error('Idiomas do talento inválidos.');
  }
}
export function bonusTalento(escolha){const t=CRIACAO.talentos[escolha.id];return{...(t.bonus??{}),...(t.atributoEscolha?.includes(escolha.atributo)?{[escolha.atributo]:1}:{})};}
export function beneficiosAtivos(d){
  const ativos=[];
  if(!d.beneficiosEscola||typeof d.beneficiosEscola!=='object'||Array.isArray(d.beneficiosEscola))throw Error('Escolhas de escola inválidas.');
  for(const [nivel,id] of Object.entries(d.beneficiosEscola).sort(([a],[b])=>Number(a)-Number(b))){
    const b=CRIACAO.beneficios[id];
    if(!NIVEIS_ESCOLA.includes(Number(nivel))||!b||b.escola!==d.escola||b.nivel!==Number(nivel)||b.nivel>d.nivel)throw Error('Benefício não pertence à escola ou ao nível disponível.');
    if(b.requisito&&!ativos.includes(b.requisito))throw Error(b.nome+' exige '+CRIACAO.beneficios[b.requisito].nome+'.');
    ativos.push(id);
    if(Number(nivel)===1&&d.estilo==='intelecto'&&d.nivel>=3)for(const [key,value] of Object.entries(CRIACAO.beneficios))if(value.escola===d.escola&&value.nivel===1&&!ativos.includes(key))ativos.push(key);
  }
  // Diverse Studies also applies to an older draft without its first choice yet.
  if(d.estilo==='intelecto'&&d.nivel>=3)for(const [key,value] of Object.entries(CRIACAO.beneficios))if(value.escola===d.escola&&value.nivel===1&&!ativos.includes(key))ativos.push(key);
  return ativos;
}
export function magiasConcedidas(d,ativos,circulo){
  const grants=[];
  for(const [level,ids] of Object.entries(CRIACAO.magiasEscola[d.escola]??{}))if(Number(level)<=circulo)grants.push(...ids);
  if(d.casa==='durmstrang')grants.push('bombarda');
  if(ativos.includes('legilimencia'))grants.push('legilimens');
  if(ativos.includes('fiel-segredo'))grants.push('fidelius-mysteria-celare');
  return [...new Set(grants)];
}
export function pendenciasFormacao(d,c){
  const pendentes=[];
  if(!d.antecedente)pendentes.push('Escolha o antecedente da varinha em Estilo e escola.');
  if((d.periciasClasse??[]).length!==2)pendentes.push('Escolha duas perícias do estilo.');
  if(!d.talentoCasa)pendentes.push('Escolha o talento inicial da Casa.');
  for(const t of talentosDaFicha(d)){
    const regra=CRIACAO.talentos[t.id];
    if(regra.atributoEscolha&&!t.atributo)pendentes.push('Escolha o atributo de '+regra.nome+'.');
    if(regra.periciaEscolha&&!t.pericia)pendentes.push('Escolha a perícia de '+regra.nome+'.');
    if(regra.treinamentos&&(t.treinamentos??[]).length!==regra.treinamentos)pendentes.push('Escolha os três treinamentos de Habilidoso.');
    if(regra.idiomas&&(t.idiomas??[]).length!==regra.idiomas)pendentes.push('Informe três idiomas distintos para Linguista.');
  }
  for(const level of NIVEIS_ESCOLA.filter(n=>n<=d.nivel))if(!d.beneficiosEscola?.[level]&&!(level===1&&d.estilo==='intelecto'&&d.nivel>=3))pendentes.push('Escolha o benefício da escola do nível '+level+'.');
  if((d.periciasEscola??[]).length!==c.periciasEscolaLimite)pendentes.push('Escolha '+c.periciasEscolaLimite+' perícia(s) do benefício da escola.');
  if((d.substituicoesPericias??[]).length!==c.substituicoesLimite)pendentes.push('Substitua '+c.substituicoesLimite+' proficiência(s) repetida(s).');
  if(c.beneficiosAtivos.includes('sobrevivente')&&(!d.sobrevivente?.pericia||!d.sobrevivente?.especializacao))pendentes.push('Escolha a perícia e a especialização de Sobrevivente.');
  if(c.beneficiosAtivos.includes('auror')&&!d.receitasIniciais?.auror?.[0])pendentes.push('Escolha a receita comum de Treinamento de auror.');
  if(d.antecedente==='pocionista'&&(d.receitasIniciais?.pocionista??[]).filter(Boolean).length!==2)pendentes.push('Escolha as receitas comum e incomum de Pocionista.');
  if(c.beneficiosAtivos.includes('animago')&&!d.animago?.animal)pendentes.push('Escolha a forma animaga permanente.');
  if(c.beneficiosAtivos.includes('companheiro')&&(!d.companheiro?.nome||d.companheiro.pericias?.length!==2||d.companheiro.salvaguardas?.length!==2||d.companheiro.comandos?.length!==(d.nivel>=14?3:2)))pendentes.push('Complete o bloco, as proficiências e os comandos do companheiro animal.');
  if(!d.pacoteInicial)pendentes.push('Escolha o pacote inicial do estudante.');
  for(const k of ['madeira','nucleo','comprimento','flexibilidade'])if(!d.varinha?.[k]?.trim())pendentes.push('Complete '+k+' da varinha.');
  return pendentes;
}
