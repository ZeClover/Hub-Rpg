import sharp from 'sharp';
import { ErroGabinete } from './regras';
// Recebe a MESMA ilustração recortada, somente no cadastro do Mestre.
// Nenhuma URL remota é buscada pelo servidor; evita SSRF e conserva a arte original.
export async function prepararSilhueta(corpo:Record<string,unknown>){
 if(corpo.removerSilhueta===true)return {silhuetaArquivo:null};
 if(corpo.silhuetaUpload===undefined||corpo.silhuetaUpload===null)return {};
 const upload=corpo.silhuetaUpload;
 if(typeof upload!=='string'||upload.length>8_100_000||!/^data:image\/(png|webp);base64,[A-Za-z0-9+/=]+$/.test(upload))throw new ErroGabinete('Envie a ilustração recortada em PNG ou WEBP transparente, até 6 MB.');
 try{
  const original=Buffer.from(upload.slice(upload.indexOf(',')+1),'base64');
  const {data,info}=await sharp(original,{limitInputPixels:16_000_000,animated:false}).rotate().resize(512,512,{fit:'inside',withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let transparente=0,opaco=0;
  for(let i=0;i<data.length;i+=4){const alpha=data[i+3];if(alpha<16)transparente++;if(alpha>64)opaco++;data[i]=data[i+1]=data[i+2]=22;data[i+3]=alpha>=64?255:0;}
  if(transparente<info.width*info.height*.02||opaco<info.width*info.height*.005)throw new ErroGabinete('A ilustração precisa ter fundo transparente e um contorno visível. Não usamos um retângulo como silhueta.');
  const png=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
  return {silhuetaArquivo:new Uint8Array(png)};
 }catch(e){if(e instanceof ErroGabinete)throw e;throw new ErroGabinete('Não foi possível ler a ilustração recortada. Use PNG ou WEBP transparente.');}
}
