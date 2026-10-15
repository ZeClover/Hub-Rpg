"use client";

import { useEffect, useState } from 'react';

type Proposta={status:string;efeito:string|null;acao:string|null;alcance:string|null;custoERecuperacao:string|null;dependenciasEImpactos:string;aprovada:boolean};
type Candidato={id:string;nome:string;nomeOriginal:string;categoria:string;grupo:string;parecer:string;status:string;observacoes:string[];proposta?:Proposta};
type Formacao={id:string;nome:string;nivel:number;texto:string};
type Materiais={pocoes:{id:string;nomeOriginal:string;novoCandidato:boolean;camposOriginais:Record<string,unknown>}[];equivalenciaMagias:unknown[];criaturas:{id:string;nomeOriginal:string;coluna:number;camposOriginais:{rotulo:string;valor:unknown}[]}[];cartas:{motivo:string}};
type Painel={configuracao:{versao:number;ativas:string[];revisao:number};catalogo:{opcoes:Candidato[];trilhas:{id:string;nome:string;motivo:string}[]};materiais?:Materiais;formacoes:Formacao[];personagens:{id:string;nome:string}[]};
const campo='mt-1 block min-h-11 w-full rounded border border-borda bg-fundo px-3 py-2 text-sm';
const rotulosStatus:Record<string,string>={'implementada-opcional':'opcional implementada','requer-aprovacao':'aguarda aprovação','bloqueada':'indisponível','aguarda-validacao':'validação pendente'};
function CriaturaEmRevisao({criatura:c}:{criatura:Materiais['criaturas'][number]}) {
  const [aberto,setAberto]=useState(false);
  return <details className="my-2 rounded border border-borda p-3 text-sm" onToggle={e=>setAberto(e.currentTarget.open)}><summary className="cursor-pointer">{c.nomeOriginal}</summary>{aberto&&<dl className="mt-2 space-y-2">{c.camposOriginais.map((v,i)=><div key={i}><dt className="font-medium">{v.rotulo}</dt><dd className="whitespace-pre-wrap break-words">{String(v.valor)}</dd></div>)}</dl>}</details>;
}

export function ExpansoesWandsWizards({campanhaId}:{campanhaId:string}) {
  const [aberto,setAberto]=useState(false),[dados,setDados]=useState<Painel|null>(null);
  const [mensagem,setMensagem]=useState(''),[ocupado,setOcupado]=useState(false);
  const [categoria,setCategoria]=useState(''),[busca,setBusca]=useState('');
  const [personagem,setPersonagem]=useState(''),[formacao,setFormacao]=useState('newt-wandmakers-gift');
  const [pericias,setPericias]=useState<string[]>([]),[posicao,setPosicao]=useState('artilheiro');
  const endpoint=`/api/campanhas/${encodeURIComponent(campanhaId)}/wands-wizards-expansoes`;
  useEffect(()=>{
    if(!aberto||dados)return;
    let cancelado=false;
    fetch(endpoint).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.erro||'Não foi possível abrir as expansões.');if(!cancelado){setDados(b);}}).catch(e=>{if(!cancelado)setMensagem(e.message);});
    return()=>{cancelado=true;};
  },[aberto,dados,endpoint]);
  async function alterar(ativo:boolean) {
    if(!dados||ocupado)return;
    setOcupado(true);
    setDados({...dados,configuracao:{...dados.configuracao,ativas:ativo?['newt-trunk']:[]}});
    let conflito=false;
    try {
      const r=await fetch(endpoint,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ativo,revisao:dados.configuracao.revisao})});
      const b=await r.json();if(!r.ok){if(r.status===409){conflito=true;setDados(null);}throw Error(b.erro);}
      setDados({...dados,configuracao:b.configuracao});setMensagem(ativo?'Opções A revisadas ativadas. Reabra as fichas para carregar a configuração.':'Expansão desativada. As escolhas dos personagens foram preservadas e ficam suspensas.');
    }catch(e){if(!conflito)setDados(dados);setMensagem(e instanceof Error?e.message:'Não foi possível salvar.');}finally{setOcupado(false);}
  }
  async function conceder(retirar=false) {
    if(!dados||ocupado||!personagem)return;
    setOcupado(true);
    const escolha={id:formacao,...(formacao==='newt-beguiling-influence'?{pericias}:{}),...(formacao==='newt-quadribol'?{posicao}:{})};
    try {
      const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({personagemId:personagem,formacao:escolha,retirar})});
      const b=await r.json();if(!r.ok)throw Error(b.erro);setMensagem(retirar?'Formação retirada.':'Formação concedida. Nenhum equipamento ou estoque foi criado; reabra a ficha.');
    }catch(e){setMensagem(e instanceof Error?e.message:'Não foi possível conceder.');}finally{setOcupado(false);}
  }
  const ativa=!!dados?.configuracao.ativas.includes('newt-trunk');
  const candidatos=dados?.catalogo.opcoes.filter(o=>(!categoria||o.categoria===categoria)&&(!busca||`${o.nome} ${o.nomeOriginal} ${o.grupo}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))))??[];
  return <details className="my-5 rounded-xl border border-borda bg-superficie p-5" onToggle={e=>setAberto(e.currentTarget.open)}>
    <summary className="cursor-pointer font-semibold text-ambar-forte">Expansões opcionais · Wands & Wizards</summary>
    <p className="mt-3 text-sm text-texto-suave">Newt’s Trunk of Everything é homebrew opcional. Somente opções A revisadas podem ser disponibilizadas; B exige proposta e aprovação, C continua bloqueada. As novas escolas ainda não possuem progressão segura completa.</p>
    {aberto&&dados&&<>
      <label className="my-4 flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={ativa} disabled={ocupado} onChange={e=>alterar(e.target.checked)}/>Ativar opções A revisadas de Newt nesta campanha</label>
      <p className="text-sm text-texto-suave">O suplemento acrescenta alternativas, sem aumentar a quantidade de benefícios por marco. Desativá-lo suspende seus efeitos e preserva escolhas e formações para retomada.</p>
      <fieldset className="my-5 grid gap-3 rounded-lg border border-borda p-4 sm:grid-cols-2" disabled={ocupado||!ativa}>
        <legend className="px-2 font-medium">Conceder formação ao personagem</legend>
        <label className="text-sm">Personagem<select aria-label="Personagem" className={campo} value={personagem} onChange={e=>setPersonagem(e.target.value)}><option value="">Escolha um personagem</option>{dados.personagens.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
        <label className="text-sm">Formação<select aria-label="Formação" className={campo} value={formacao} onChange={e=>{setFormacao(e.target.value);setPericias([]);}}>{dados.formacoes.map(f=><option key={f.id} value={f.id}>{f.nome} · nível {f.nivel}</option>)}</select></label>
        <p className="text-sm text-texto-suave sm:col-span-2">{dados.formacoes.find(f=>f.id===formacao)?.texto}</p>
        {formacao==='newt-beguiling-influence'&&<div className="flex flex-wrap gap-4 sm:col-span-2">{[['enganacao','Enganação'],['intimidacao','Intimidação'],['atuacao','Atuação'],['persuasao','Persuasão']].map(([id,nome])=><label key={id} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={pericias.includes(id)} disabled={!pericias.includes(id)&&pericias.length>=2} onChange={e=>setPericias(e.target.checked?[...pericias,id]:pericias.filter(x=>x!==id))}/>{nome}</label>)}</div>}
        {formacao==='newt-quadribol'&&<label className="text-sm">Posição no time<select aria-label="Posição no time" value={posicao} onChange={e=>setPosicao(e.target.value)} className={campo}>{['artilheiro','batedor','goleiro','apanhador'].map(p=><option key={p} value={p}>{p}</option>)}</select></label>}
        <div className="flex flex-wrap gap-3 sm:col-span-2"><button type="button" disabled={!personagem} onClick={()=>conceder()} className="min-h-11 rounded border border-borda px-3 py-2 text-sm">Conceder formação</button><button type="button" disabled={!personagem} onClick={()=>conceder(true)} className="min-h-11 rounded border border-borda px-3 py-2 text-sm">Retirar formação</button></div>
      </fieldset>
      <details className="my-4"><summary className="cursor-pointer font-medium">Novas escolas e especializações em preparação</summary><ul className="mt-3 space-y-2 text-sm">{dados.catalogo.trilhas.map(t=><li key={t.id}><strong>{t.nome}:</strong> {t.motivo}</li>)}</ul><p className="mt-3 text-sm">Varinhalogia permanece formação profissional; Quadribol, clube esportivo. Mystical Caster não é um quarto estilo selecionável.</p></details>
      {dados.materiais&&<details className="my-4 rounded border border-borda p-3"><summary className="cursor-pointer font-medium">Materiais recuperados · revisão exclusiva do Mestre</summary>
        <p className="my-3 text-sm">{dados.materiais.equivalenciaMagias.length} magias-base conferidas sem duplicação; {dados.materiais.pocoes.length} poções, das quais {dados.materiais.pocoes.filter(p=>p.novoCandidato).length} são candidatas novas; {dados.materiais.criaturas.length} blocos de criaturas em referência. Estes materiais não são opções de jogador nem geram itens.</p>
        <p className="my-3 text-sm text-texto-suave">{dados.materiais.cartas.motivo} Os textos originais abaixo aguardam tradução e revisão, antes de qualquer incorporação ao laboratório ou bestiário.</p>
        <h3 className="my-3 font-medium">Poções adicionais em revisão</h3>
        {dados.materiais.pocoes.filter(p=>p.novoCandidato).map(p=><details key={p.id} className="mb-2 rounded border border-borda p-3 text-sm"><summary className="cursor-pointer">{p.nomeOriginal} · indisponível para concessão</summary><p className="mt-2 whitespace-pre-wrap break-words">Fonte original: {String(p.camposOriginais.Effects??'Efeito ausente.')}</p></details>)}
        <details className="my-3"><summary className="cursor-pointer text-sm">Blocos de criaturas · conversão e CR não aprovados</summary>{dados.materiais.criaturas.map(c=><CriaturaEmRevisao key={c.id+'-'+c.coluna} criatura={c}/>)}</details>
      </details>}
      <div className="my-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">Pesquisar auditoria<input value={busca} onChange={e=>setBusca(e.target.value)} className={campo}/></label><label className="text-sm">Parecer<select aria-label="Parecer" value={categoria} onChange={e=>setCategoria(e.target.value)} className={campo}><option value="">Todos</option><option value="A">A · candidatas seguras</option><option value="B">B · propostas para revisão</option><option value="C">C · indisponíveis</option></select></label></div>
      <p className="my-3 text-sm text-texto-suave">{candidatos.length} opções na revisão. Classificação A não significa que todas as dependências já foram implementadas.</p>
      <div className="grid gap-3">{candidatos.map(o=><details key={o.id} className="min-w-0 rounded border border-borda p-3 text-sm"><summary className="cursor-pointer break-words"><strong>{o.categoria} · {o.nome}</strong><span className="ml-2 text-texto-suave">{rotulosStatus[o.status]}</span></summary><p className="mt-3">{o.parecer}</p>{o.observacoes.map((s,i)=><p key={i} className="mt-2">{s}</p>)}{o.proposta&&<div className="mt-3 border-l-2 border-borda pl-3"><strong>Proposta não aprovada</strong>{o.proposta.efeito?<><p>{o.proposta.efeito}</p><p>Ação: {o.proposta.acao}. Alcance: {o.proposta.alcance}.</p><p>Custo e recuperação: {o.proposta.custoERecuperacao}.</p></>:<p>A especificação de ação, alcance, custo e recuperação ainda está pendente. Esta opção não pode ser habilitada.</p>}<p>{o.proposta.dependenciasEImpactos}</p></div>}</details>)}</div>
    </>}
    <p role="status" aria-live="polite" className="mt-3 text-sm">{mensagem||(aberto&&!dados?'Carregando revisão…':'')}</p>
  </details>;
}
