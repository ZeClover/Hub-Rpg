#!/usr/bin/env python3
"""Gera catálogos leves e regras do servidor, sem duplicar tradução editorial."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
campos=['classes','ancestralidades','biografias','talentos','magias','equipamentos','divindades','dominios']
saida={k:[] for k in campos}
def reduzir(v):
 if isinstance(v,dict):return {k:reduzir(x) for k,x in v.items() if k not in ['descricao','texto','resumo','url','observacao','nomeOriginal']}
 if isinstance(v,list):return [reduzir(x) for x in v]
 return v
for fonte in ['player-core','player-core-2','gm-core']:
 p=root/'public/pathfinder'/f'{fonte}.json'
 data=json.loads(p.read_text())
 if data.get('fonte',{}).get('edicao')!='remaster':raise ValueError(f'Fonte não Remaster: {fonte}')
 for k in campos:saida[k].extend(reduzir(data.get(k,[])))
 if fonte!='gm-core':
  leve={k:v for k,v in data.items() if k!='secoes'}
  (p.parent/f'{fonte}-catalogo.json').write_text(json.dumps(leve,ensure_ascii=False,separators=(',',':'))+'\n')
for k in campos:
 ids=[v['id'] for v in saida[k]]
 if len(ids)!=len(set(ids)):raise ValueError(f'IDs repetidos em {k}')
destino=root/'src/lib/pathfinder/catalogo-validacao.json'
destino.parent.mkdir(parents=True,exist_ok=True)
destino.write_text(json.dumps(saida,ensure_ascii=False,separators=(',',':'))+'\n')
print({k:len(v) for k,v in saida.items()})
