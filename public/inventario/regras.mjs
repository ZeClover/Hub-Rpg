export const CAMPOS=[['nome','Nome','text',200],['imagem','Imagem (endereço HTTPS)','url',4096],['categoria','Categoria livre','text',10000],['descricao','Descrição','textarea',20000],['quantidade','Quantidade','number'],['peso','Peso por unidade','number'],['propriedades','Propriedades mágicas','textarea',10000],['raridade','Raridade','text',200],['historia','História e origem','textarea',20000],['efeitos','Efeitos mecânicos descritos','textarea',10000],['anotacoes','Anotações','textarea',20000]];
export function validarItens(itens){
 if(!Array.isArray(itens)||itens.length>200)throw Error('Registre até 200 itens personalizados.');
 const ids=new Set();
 for(const item of itens){
  if(!item||typeof item!=='object'||typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id))throw Error('Identificador de item inválido.');ids.add(item.id);
  if(typeof item.nome!=='string'||!item.nome.trim())throw Error('Informe o nome do item.');
  for(const [chave,,tipo,max] of CAMPOS){const v=item[chave];if(v===undefined||v==='')continue;if(tipo==='number'){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>(chave==='quantidade'?9999:100000)||chave==='quantidade'&&!Number.isInteger(v))throw Error('Quantidade ou peso inválidos.');}else if(typeof v!=='string'||v.length>max)throw Error('Texto do item excede o limite permitido.');}
  if(!Number.isInteger(item.quantidade)||item.quantidade<0)throw Error('Informe uma quantidade inteira.');
  if(item.imagem){let u;try{u=new URL(item.imagem);}catch{throw Error('Informe uma imagem HTTPS.');}if(u.protocol!=='https:'||u.username||u.password)throw Error('Informe uma imagem HTTPS.');}
 }
 return itens;
}
