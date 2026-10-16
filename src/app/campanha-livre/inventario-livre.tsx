'use client';
import {useEffect,useRef} from 'react';
import '../../../public/inventario/editor.css';
export function InventarioLivre({id}:{id:string}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{let ativo=true;import(/* webpackIgnore: true */ '/inventario/'+'conta.js').then(m=>{if(ativo&&ref.current){ref.current.replaceChildren();m.montarInventarioConta(ref.current,id);}});return()=>{ativo=false;};},[id]);return <div ref={ref}/>;}
