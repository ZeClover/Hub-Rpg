import {montarInventarioConta} from './conta.js';
const id=new URL(location.href).searchParams.get('id');
if(id){const host=document.createElement('section');host.id='inventario-livre-conta';const main=document.querySelector('main');if(main)main.after(host);else document.body.append(host);montarInventarioConta(host,id);}
