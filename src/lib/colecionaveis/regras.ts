export const CATEGORIAS = { sapos: 'Sapos de Chocolate', criaturas: 'Criaturas Mágicas', biblioteca: 'Biblioteca de Raridades', recordacoes: 'Recordações do Mundo Bruxo', curiosidades: 'Gabinete de Curiosidades' } as const;
export type Categoria = keyof typeof CATEGORIAS;
export const uuid = (v: unknown): v is string => typeof v === 'string' && /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(v);
export class ErroGabinete extends Error { status: number; constructor(message: string, status=400){ super(message); this.status=status; } }
export type Cadastro = {nome: string; descricao: string; categoria: Categoria; imagemUrl: string|null; repetivel: boolean; retratoAnimado: boolean; localizacaoMestre: string;raridade:string;edicao:string;origemRevelada:string;segredoMestre:string;visibilidade:'silhueta'|'oculto'};
export function validarCadastro(corpo: unknown): Cadastro {
 if(!corpo || typeof corpo!=='object' || Array.isArray(corpo))throw new ErroGabinete('Cadastro inválido.');
 const c=corpo as Record<string,unknown>;
 const texto=(key: string,max: number,obrigatorio=false)=>{if(c[key]!==undefined&&typeof c[key]!=='string')throw new ErroGabinete('Texto inválido: '+key);const t=String(c[key]??'').trim();if(t.length>max||obrigatorio&&!t)throw new ErroGabinete('Confira o campo '+key+'.');return t;};
 if(typeof c.categoria!=='string'||!Object.hasOwn(CATEGORIAS,c.categoria))throw new ErroGabinete('Escolha uma categoria válida.');
 for(const k of ['repetivel','retratoAnimado'])if(c[k]!==undefined&&typeof c[k]!=='boolean')throw new ErroGabinete('Opção inválida: '+k);
 const imagemUrl=c.imagemUrl===null?null:texto('imagemUrl',1500)||null;
 if(imagemUrl){let ok=false;try{const u=new URL(imagemUrl,'https://hub-rpg-eight.vercel.app');ok=(imagemUrl.startsWith('/')&&!imagemUrl.startsWith('//')||/^https:\/\//i.test(imagemUrl)&&u.protocol==='https:')&&!u.username&&!u.password;}catch{}if(!ok)throw new ErroGabinete('Use uma imagem do projeto ou uma URL HTTPS.');}
 if(c.retratoAnimado&&c.categoria!=='sapos')throw new ErroGabinete('Retratos animados pertencem aos Sapos de Chocolate.');
 if(c.visibilidade!==undefined&&!['silhueta','oculto'].includes(String(c.visibilidade)))throw new ErroGabinete('Escolha silhueta ou oculto para objetos não descobertos.');
 return {raridade:texto('raridade',80),edicao:texto('edicao',160),origemRevelada:texto('origemRevelada',2000),segredoMestre:texto('segredoMestre',4000),visibilidade:c.visibilidade==='oculto'?'oculto':'silhueta',nome:texto('nome',160,true),descricao:texto('descricao',4000,true),categoria:c.categoria as Categoria,imagemUrl,repetivel:c.repetivel===true,retratoAnimado:c.retratoAnimado===true,localizacaoMestre:texto('localizacaoMestre',4000)};
}
export function validarConcessao(corpo: unknown){
 const c=(corpo??{}) as Record<string,unknown>;
 if(!uuid(c.operacaoId)||!uuid(c.personagemId)||!uuid(c.colecionavelId))throw new ErroGabinete('Concessão inválida.');
 const quantidade=c.quantidade??1;if(!Number.isInteger(quantidade)||Number(quantidade)<1||Number(quantidade)>99)throw new ErroGabinete('Conceda entre 1 e 99 exemplares por vez.');
 return {operacaoId:c.operacaoId,personagemId:c.personagemId,colecionavelId:c.colecionavelId,quantidade:Number(quantidade)};
}
export function conferirQuantidade(repetivel: boolean, atual: number, acrescentar: number){
 if(!repetivel&&(atual>0||acrescentar!==1))throw new ErroGabinete('Este objeto é único e já foi encontrado, ou a quantidade solicitada não é 1.',409);
 if(atual+acrescentar>999)throw new ErroGabinete('O acervo suporta até 999 exemplares por objeto.');
 return atual+acrescentar;
}
export type RegistroCatalogo = Cadastro & {id:string; criadoEm?:Date;silhuetaArquivo?:Uint8Array|null};
export type RegistroAcervo = {colecionavelId:string;quantidade:number;descobertoEm:Date};
export function apresentarAcervo(catalogo: RegistroCatalogo[], acervo: RegistroAcervo[], contexto?:{personagemId:string;campanhaId:string}){
 const encontrados=new Map(acervo.map(a=>[a.colecionavelId,a]));
 const itens=catalogo.filter(c=>c.visibilidade!=='oculto'||(encontrados.get(c.id)?.quantidade??0)>0).map(c=>{const a=encontrados.get(c.id);if(!a||a.quantidade<1)return {id:c.id,categoria:c.categoria,adquirido:false as const,quantidade:0,...(c.categoria==='criaturas'&&c.silhuetaArquivo?.length&&contexto?{silhuetaUrl:'/api/personagens/'+contexto.personagemId+'/colecionaveis/'+c.id+'/silhueta?campanhaId='+contexto.campanhaId}:{})};return {id:c.id,categoria:c.categoria,adquirido:true as const,quantidade:a.quantidade,...(c.categoria==='criaturas'&&c.silhuetaArquivo?.length&&contexto?{silhuetaUrl:'/api/personagens/'+contexto.personagemId+'/colecionaveis/'+c.id+'/silhueta?campanhaId='+contexto.campanhaId}:{}),raridade:c.raridade,edicao:c.edicao,origemRevelada:c.origemRevelada,nome:c.nome,descricao:c.descricao,imagemUrl:c.imagemUrl,retratoAnimado:c.retratoAnimado,repetivel:c.repetivel,descobertoEm:a.descobertoEm.toISOString()};});
 const progresso=Object.entries(CATEGORIAS).map(([id,nome])=>{const grupo=itens.filter(i=>i.categoria===id);return {id,nome,total:grupo.length,descobertos:grupo.filter(i=>i.adquirido).length,exemplares:grupo.reduce((n,i)=>n+i.quantidade,0)};});
 return {itens,progresso};
}
export function mesmoPedido(a:{personagemId:string;colecionavelId:string;quantidade:number;concedidoPorId:string;tipo?:string},b:{personagemId:string;colecionavelId:string;quantidade:number;tipo?:string},usuarioId:string){return (a.tipo??'conceder')===(b.tipo??'conceder')&&a.personagemId===b.personagemId&&a.colecionavelId===b.colecionavelId&&a.quantidade===b.quantidade&&a.concedidoPorId===usuarioId;}

export function conferirRetirada(atual:number,retirar:number){if(retirar>atual||atual<1)throw new ErroGabinete('O personagem não possui essa quantidade de exemplares.',409);return atual-retirar;}
