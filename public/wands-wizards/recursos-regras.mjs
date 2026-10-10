import {companheiroDaFicha} from "./especiais-regras.mjs";
import CRIACAO from './criacao-pt-br.json' with {type:'json'};
import CATALOGO from './catalogo-origem.json' with {type:'json'};

export const PACOTES={herdado:{nome:'Pacote herdado',knuts:145,pergaminho:1,penas:1,tinta:1},padrao:{nome:'Pacote padrão',knuts:435,pergaminho:2,penas:3,tinta:2},abastado:{nome:'Pacote abastado',knuts:986,pergaminho:3,penas:5,tinta:2}};
export function aplicarEquipamentos(d){
  const next=structuredClone(d);next.equipamentosAplicados??=[];next.inventario??=[];
  function item(id,nome,quantidade=1,categoria='Equipamentos'){if(!next.inventario.some(i=>i.id===id))next.inventario.push({id,nome,quantidade,categoria});}
  if(next.pacoteInicial&&!next.equipamentosAplicados.includes('pacote')){
    const p=PACOTES[next.pacoteInicial];if(!p)throw Error('Pacote inicial inválido.');
    item('ww-mochila',p.nome+' · mochila');item('ww-vestes','Vestes pretas de trabalho',3);item('ww-chapeu','Chapéu pontudo preto');item('ww-pergaminho','Rolo de pergaminho de 10 pés',p.pergaminho);item('ww-penas','Pena de escrita',p.penas);item('ww-tinta','Frasco de tinta preta',p.tinta);
    if(next.pacoteInicial==='abastado'){item('ww-tinta-verde','Frasco de tinta verde-esmeralda');item('ww-tinta-escarlate','Frasco de tinta escarlate');}
    item('ww-varinha','Varinha');item('ww-capa-inverno','Capa de inverno');next.dinheiroKnuts=(next.dinheiroKnuts??0)+p.knuts;next.equipamentosAplicados.push('pacote');
  }
  if(next.antecedente&&!next.equipamentosAplicados.includes('antecedente')){const b=CRIACAO.antecedentes[next.antecedente];for(const [index,name]of b.equipamentos.entries())item('ww-antecedente-'+index,name);next.equipamentosAplicados.push('antecedente');}
  for(const [benefit,name]of [['quebrador','Ferramentas de quebra de maldições'],['vidente','Kit de adivinhação']])if(next.calculos?.beneficiosAtivos?.includes(benefit)&&!next.equipamentosAplicados.includes(benefit)){item('ww-'+benefit,name);next.equipamentosAplicados.push(benefit);}
  return next;
}
export function moedas(knuts=0){return{galeoes:Math.floor(knuts/493),sicles:Math.floor(knuts%493/29),nuques:knuts%29};}
export function recursosDaFicha(d,c){
  if(!Number.isInteger(d.pontosUsados??0)||(d.pontosUsados??0)<0||(d.pontosUsados??0)>c.pontosFeiticaria)throw Error("Pontos de feitiçaria usados inválidos.");const extras=d.espacosCriados??{},usados=d.espacosUsadosPorCirculo??{},slots=[];
  if(!extras||typeof extras!=='object'||Array.isArray(extras)||Object.entries(extras).some(([k,v])=>!Number.isInteger(Number(k))||Number(k)<1||Number(k)>5||!Number.isInteger(v)||v<0||v>99))throw Error('Espaços criados inválidos.');
  for(let circle=1;circle<=Math.max(c.circuloMaximo,...Object.keys(extras).map(Number));circle++){
    const total=(c.espacosPorCirculo[circle-1]??0)+(extras[circle]??0),used=circle===1?d.espacosUsados:usados[circle]??0;
    if(!Number.isInteger(used)||used<0||used>total)throw Error('Uso de espaços de magia inválido.');
    slots.push({circulo:circle,total,usados:used,disponiveis:total-used});
  }
  const lifeUsed=d.dadosVidaUsados??0;if(!Number.isInteger(lifeUsed)||lifeUsed<0||lifeUsed>d.nivel)throw Error('Dados de vida usados inválidos.');
  if(d.dinheiroKnuts!==undefined&&(!Number.isSafeInteger(d.dinheiroKnuts)||d.dinheiroKnuts<0||d.dinheiroKnuts>1000000000))throw Error('Saldo deve ser um inteiro não negativo em nuques.');
  if(d.equipamentosAplicados!==undefined&&(!Array.isArray(d.equipamentosAplicados)||new Set(d.equipamentosAplicados).size!==d.equipamentosAplicados.length||d.equipamentosAplicados.some(id=>!['pacote','antecedente','vidente','quebrador'].includes(id))))throw Error('Registro de equipamentos iniciais inválido.');
  const features=[];const add=(id,nome,max,descanso)=>features.push({id,nome,max,descanso});
  if(d.talentoCasa?.id==='sangue-gigante')add('resistir-condicao','Resistir condição mágica',1,'longo');
  if(d.talentoCasa?.id==='encanto-veela')add('encanto-veela','Encanto de veela',1,'longo');
  if(d.casa==='wampus')add('resistencia-wampus','Resistência do guerreiro',1,'longo');
  for(const [id,nome,max,rest]of [['animago','Transformação animaga',2,'curto'],['adrenalina','Adrenalina mágica',c.proficiencia,'longo'],['alerta-auror','Alerta de auror',1,'longo'],['visoes','Visões vívidas',1,'longo'],['sussurro','Sussurrador de animais',1,'curto'],['vulnerabilidades','Explorar vulnerabilidades',Math.max(0,c.modificadores.inteligencia),'longo'],['reflexos-cacador','Reflexos de caçador',1,'curto']])if(c.beneficiosAtivos.includes(id))add(id,nome,max,rest);
  const companion=companheiroDaFicha(d,c);if(companion)add('comando-companheiro','Dado de comando · '+companion.tipoDado,companion.dadosComando,'longo');
  const charges=d.usosHabilidades??{};if(!charges||typeof charges!=='object'||Array.isArray(charges)||Object.entries(charges).some(([id,n])=>!features.some(f=>f.id===id)||!Number.isInteger(n)||n<0||n>features.find(f=>f.id===id).max))throw Error('Usos de habilidades inválidos.');
  const sig=d.assinaturas??[];if(!Array.isArray(sig)||sig.length>2||new Set(sig).size!==sig.length||sig.length&&(d.nivel!==20||d.estilo!=='vontade'))throw Error('Seleção de magias de assinatura inválida.');
  const sigUses=d.usosAssinaturas??{};if(!sigUses||typeof sigUses!=='object'||Array.isArray(sigUses)||Object.entries(sigUses).some(([id,n])=>!sig.includes(id)||!Number.isInteger(n)||n<0||n>1))throw Error('Usos de magias de assinatura inválidos.');
  const omens=d.pressagios??[];if(!Array.isArray(omens)||omens.length>(c.beneficiosAtivos.includes('pressagios')?(d.nivel>=10?3:2):0)||omens.some(n=>!Number.isInteger(n)||n<1||n>20))throw Error('Registre resultados de presságios entre 1 e 20, obtidos fora do Hub.');
  const focus=d.concentracoes??[];if(!Array.isArray(focus)||new Set(focus).size!==focus.length||focus.length>(c.beneficiosAtivos.includes('varinha-escudo')?2:1)||focus.some(id=>!d.magias.includes(id)&&!c.magiasConcedidas.includes(id)||!/Duration: (Concentration|Dedication)/.test(CATALOGO.magias.find(m=>m.id===id)?.original??''))||focus.length===2&&!focus.some(id=>['protego','protego-maxima'].includes(id)))throw Error('Registro de concentração ou dedicação inválido.');
  return{espacos:slots,dadosVida:{total:d.nivel,usados:lifeUsed,disponiveis:d.nivel-lifeUsed},habilidades:features.map(f=>({...f,usados:charges[f.id]??0,disponiveis:f.max-(charges[f.id]??0)})),moedas:moedas(d.dinheiroKnuts)};
}
function mudarEspaco(d,circle,delta){if(circle===1)d.espacosUsados+=delta;else{d.espacosUsadosPorCirculo??={};d.espacosUsadosPorCirculo[circle]=(d.espacosUsadosPorCirculo[circle]??0)+delta;}}
export function converterRecurso(d,c,circle,direcao){const n=structuredClone(d),resources=recursosDaFicha(n,c);if(d.nivel<2)throw Error('Fonte de Magia exige nível 2.');if(!Number.isInteger(circle)||circle<1||circle>(direcao==='criar'?5:9))throw Error('Só espaços de 1º a 5º círculo podem ser criados; espaços maiores podem ser convertidos em pontos.');
  if(direcao==='criar'){const cost=[0,2,3,5,6,7][circle];if(c.pontosFeiticaria-(n.pontosUsados??0)<cost)throw Error('Pontos de feitiçaria insuficientes.');n.pontosUsados=(n.pontosUsados??0)+cost;n.espacosCriados??={};n.espacosCriados[circle]=(n.espacosCriados[circle]??0)+1;}
  else if(direcao==='converter'){if((resources.espacos.find(s=>s.circulo===circle)?.disponiveis??0)<1)throw Error('Não há espaço desse círculo disponível.');if((n.pontosUsados??0)<circle)throw Error('A conversão excederia seu máximo de pontos de feitiçaria.');mudarEspaco(n,circle,1);n.pontosUsados-=circle;}
  else throw Error('Conversão inválida.');recursosDaFicha(n,c);return n;
}
export function registrarDescanso(d,c,tipo,{dadosVida=0,cura=0}={}){const n=structuredClone(d),resources=recursosDaFicha(n,c);if(!['curto','longo'].includes(tipo))throw Error('Descanso inválido.');
  if(tipo==='longo'){delete n.animagoEstado;n.vida={atual:c.pvMaximos};n.espacosUsados=0;n.espacosUsadosPorCirculo={};n.espacosCriados={};n.pontosUsados=0;n.dadosVidaUsados=Math.max(0,(n.dadosVidaUsados??0)-Math.max(1,Math.floor(d.nivel/2)));n.pressagios=[];n.concentracoes=[];}
  else{if(!Number.isInteger(dadosVida)||dadosVida<0||dadosVida>resources.dadosVida.disponiveis||!Number.isInteger(cura)||cura<0||cura>10000||!dadosVida&&cura)throw Error('Informe dados de vida disponíveis e cura já determinada na mesa.');n.dadosVidaUsados=(n.dadosVidaUsados??0)+dadosVida;n.vida={atual:Math.min(c.pvMaximos,(n.vida.atual??c.pvMaximos)+cura)};if(d.nivel===20&&d.estilo==='tecnica')n.pontosUsados=Math.max(0,(n.pontosUsados??0)-4);}
  n.usosHabilidades=Object.fromEntries(Object.entries(n.usosHabilidades??{}).filter(([id])=>tipo!=='longo'&&resources.habilidades.find(f=>f.id===id)?.descanso!=='curto'));n.usosAssinaturas={};return n;
}
export function recuperarArcana(d,c,escolhas){if(d.nivel!==20||d.estilo!=='intelecto')throw Error('Recuperação Arcana exige Intelecto no nível 20.');const n=structuredClone(d),resources=recursosDaFicha(d,c);let total=0;for(const [key,value]of Object.entries(escolhas)){const circle=Number(key);if(!Number.isInteger(circle)||circle<1||circle>5||!Number.isInteger(value)||value<0||value>(resources.espacos.find(s=>s.circulo===circle)?.usados??0))throw Error('Espaços para Recuperação Arcana inválidos.');total+=circle*value;mudarEspaco(n,circle,-value);}if(total>10)throw Error('A soma dos círculos recuperados não pode ultrapassar dez.');return n;}

export function registrarMagia(d,c,id,circle,{metamagia='',incremento=1,ritual=false,assinatura=false}={}){
  const n=structuredClone(d),m=CATALOGO.magias.find(m=>m.id===id),r=recursosDaFicha(d,c);if(d.animagoEstado)throw Error('Não pode conjurar enquanto estiver na forma animaga.');
  if(!m||!d.magias.includes(id)&&!c.magiasConcedidas.includes(id))throw Error('Escolha uma magia conhecida.');
  if(!Number.isInteger(circle)||circle<m.nivel||m.nivel===0&&circle!==0&&!/At Higher Levels\./.test(m.original)||circle>9)throw Error('Círculo de conjuração inválido.');
  if(ritual&&(d.estilo!=='intelecto'||!/\(ritual\)/i.test(m.original)||circle!==m.nivel))throw Error('Esta conjuração não pode ser registrada como ritual.');
  if(assinatura&&(!(d.assinaturas??[]).includes(id)||circle!==3||(d.usosAssinaturas?.[id]??0)>0))throw Error('Uso gratuito de assinatura indisponível.');
  if(circle>0&&!ritual&&!assinatura){if((r.espacos.find(s=>s.circulo===circle)?.disponiveis??0)<1)throw Error('Não há espaço disponível desse círculo.');mudarEspaco(n,circle,1);}
  if(metamagia){const allowed=[...(d.metamagias??[]),...c.metamagiasConcedidas];if(!allowed.includes(metamagia))throw Error('Metamagia desconhecida.');if(['feroz','resistente'].includes(metamagia)&&(!Number.isInteger(incremento)||incremento<1||circle+incremento>Math.max(c.circuloMaximo,...r.espacos.filter(s=>s.total>0).map(s=>s.circulo))||metamagia==='feroz'&&incremento>2))throw Error('Elevação da metamagia excede os círculos disponíveis.');const cost=metamagia==='feroz'?incremento*2:metamagia==='resistente'?incremento:({cuidadosa:1,distante:1,potencializada:1,estendida:1,intensificada:3,acelerada:2,sutil:1,duplicada:circle||1})[metamagia];if(!cost||c.pontosFeiticaria-(n.pontosUsados??0)<cost)throw Error('Pontos de feitiçaria insuficientes para a metamagia.');n.pontosUsados=(n.pontosUsados??0)+cost;}
  if(assinatura){n.usosAssinaturas??={};n.usosAssinaturas[id]=1;}
  if(/Duration: (Concentration|Dedication)/.test(m.original)){const shield=['protego','protego-maxima'];n.concentracoes=c.beneficiosAtivos.includes('varinha-escudo')?[...(n.concentracoes??[]).filter(x=>shield.includes(x)!==shield.includes(id)),id]:[id];}
  return n;
}

export function registrarDeflexao(d,c,id){
 const m=CATALOGO.magias.find(m=>m.id===id);if(d.estilo!=='tecnica'||d.nivel<3||!m||!d.magias.includes(id)&&!c.magiasConcedidas.includes(id))throw Error('Deflexão exige Técnica no nível 3 e uma magia conhecida.');
 const custo=2*m.nivel;if(c.pontosFeiticaria-(d.pontosUsados??0)<custo)throw Error('Pontos de feitiçaria insuficientes para deflexão.');return {...d,pontosUsados:(d.pontosUsados??0)+custo};
}
