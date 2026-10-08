import type { PrismaClient } from "@prisma/client";

export type FamiliaSeedHogwarts = { chave: string; nome: string; tipo: string; condicaoFinanceira: string; tags: string[]; conteudoFamiliar: string; acessoFamiliar: string; herancas: string[] };

export const FAMILIAS_HOGWARTS: FamiliaSeedHogwarts[] = [
  { chave:"black", nome:"Black", tipo:"Canônica", condicaoFinanceira:"Abastada", tags:["Antiga","Influente","Tradicional","Intimidadora"], conteudoFamiliar:"Educação das Casas Antigas — genealogias, símbolos, etiqueta e costumes de famílias bruxas tradicionais.", acessoFamiliar:"Parentes, correspondências, residências e círculos tradicionais.", herancas:[] },
  { chave:"gaunt", nome:"Gaunt", tipo:"Canônica", condicaoFinanceira:"Decadente", tags:["Antiquíssima","Obscura","Decadente"], conteudoFamiliar:"Legado de Slytherin — conhece símbolos e tradições obscuras da linhagem; não concede Ofidioglossia.", acessoFamiliar:"Objetos antigos, histórias transmitidas oralmente, locais e membros da linhagem.", herancas:[] },
  { chave:"malfoy", nome:"Malfoy", tipo:"Canônica", condicaoFinanceira:"Riquíssima", tags:["Rica","Influente","Prestigiada","Ambiciosa"], conteudoFamiliar:"Alta Sociedade Bruxa — etiqueta da elite, famílias influentes e como solicitar audiência sem gafes.", acessoFamiliar:"Introduções a pessoas influentes, comerciantes, eventos e propriedades; não é dinheiro infinito.", herancas:[] },
  { chave:"potter", nome:"Potter", tipo:"Canônica", condicaoFinanceira:"Abastada", tags:["Antiga","Respeitável","Discreta","Inventiva"], conteudoFamiliar:"Tradição de Remédios — preparados medicinais, conservação, ingredientes curativos e observação de sintomas.", acessoFamiliar:"Cadernos antigos, receitas, contatos de boticários e materiais de Poções.", herancas:[] },
  { chave:"weasley", nome:"Weasley", tipo:"Canônica", condicaoFinanceira:"Variável por ramo", tags:["Antiga","Extensa","Conectada"], conteudoFamiliar:"Teia Familiar — familiaridade com parentes, casamentos e conexões entre famílias bruxas.", acessoFamiliar:"Rede extensa de parentes, conhecidos e contatos familiares.", herancas:[] },
  { chave:"ollivander", nome:"Ollivander", tipo:"Canônica", condicaoFinanceira:"Confortável", tags:["Antiquíssima","Artesã","Especialista","Respeitada"], conteudoFamiliar:"Conhecimento de Varinhas — madeiras comuns, núcleos tradicionais, manutenção e construção básica.", acessoFamiliar:"Oficina, registros, fornecedores e artesãos de varinhas.", herancas:[] },
  { chave:"longbottom", nome:"Longbottom", tipo:"Canônica", condicaoFinanceira:"Confortável", tags:["Antiga","Respeitável","Tradicional"], conteudoFamiliar:"Memória da Linhagem — registros extensos de gerações anteriores.", acessoFamiliar:"Documentos, parentes e propriedades de longa data.", herancas:[] },
  { chave:"burke", nome:"Burke", tipo:"Canônica", condicaoFinanceira:"Confortável", tags:["Comerciante","Obscura","Conhecedora de Artefatos"], conteudoFamiliar:"Avaliação de Artefatos — reconhece sinais gerais de procedência, falsificação, risco e valor.", acessoFamiliar:"Comerciantes, colecionadores, avaliadores e objetos incomuns.", herancas:[] },
  { chave:"scamander", nome:"Scamander", tipo:"Canônica", condicaoFinanceira:"Confortável", tags:["Respeitável","Prática","Criadores","Naturalista"], conteudoFamiliar:"Olho de Criador — após observar uma criatura, reconhece sinais básicos de medo, agitação, dor, territorialidade, corte, fome e fuga. Casos difíceis usam Engenho + Trato das Criaturas Mágicas.", acessoFamiliar:"Rede de Criadores — criadores, tratadores, fornecedores, estábulos, curadores, compradores, transportadores e contatos ministeriais.", herancas:["Legado dos Criadores","Confiança Conquistada","Guardião de Criaturas"] },
];

export async function sincronizarFamiliasHogwarts(banco: PrismaClient, campanhaId: string) {
  await Promise.all(FAMILIAS_HOGWARTS.map((f) => banco.hogwartsFamilia.upsert({
    where: { campanhaId_chave: { campanhaId, chave: f.chave } }, update: { nome:f.nome, tipo:f.tipo, condicaoFinanceira:f.condicaoFinanceira, tags:f.tags, conteudoFamiliar:f.conteudoFamiliar, acessoFamiliar:f.acessoFamiliar, herancas:f.herancas }, create: { campanhaId, ...f },
  })));
}

export function validarFamiliaCustom(corpo: Record<string, unknown>) {
  const nome=String(corpo.nome??"").trim(),conteudoFamiliar=String(corpo.conteudoFamiliar??"").trim(),acessoFamiliar=String(corpo.acessoFamiliar??"").trim();
  if(nome.length<2||nome.length>80)throw new Error("O nome da família deve ter entre 2 e 80 caracteres.");
  if(conteudoFamiliar.length<3||acessoFamiliar.length<3)throw new Error("Informe o Conteúdo e o Acesso Familiar.");
  const chave=`custom-${nome.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`;
  return {chave,nome,tipo:String(corpo.tipo??"Original").trim().slice(0,40)||"Original",condicaoFinanceira:String(corpo.condicaoFinanceira??"Modesta").trim().slice(0,40)||"Modesta",tags:Array.isArray(corpo.tags)?corpo.tags.map(String).map(s=>s.trim()).filter(Boolean).slice(0,8):[],conteudoFamiliar:conteudoFamiliar.slice(0,500),acessoFamiliar:acessoFamiliar.slice(0,500),herancas:Array.isArray(corpo.herancas)?corpo.herancas.map(String).map(s=>s.trim()).filter(Boolean).slice(0,3):[]};
}
