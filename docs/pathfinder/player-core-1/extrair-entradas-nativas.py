"""Extrai corpos PT por blocos/colunas, sem atribuir automação ou revisão mecânica.
O índice nunca é usado como regra. Casos sem corpo ou com fronteira ambígua são auditados.
"""
import fitz, glob, json, re, unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
DIR=Path(__file__).resolve().parent
pdf=fitz.open(glob.glob('/workspace/attachments/*/*remaster-livro-do-jogador*.pdf')[0])
def norm(s):
 s=s.replace('\u00ad','').replace('\b','')
 s=re.sub(r'([A-Za-zÀ-ÿ])-\s*\n\s*([a-zà-ÿ])',r'\1\2',s)
 for en,pt in [('one','1'),('two','2'),('three','3')]:s=s.replace(f'[{en}-action]',f'[{pt} ações]')
 return s.replace('[reaction]','[reação]').replace('[free-action]','[ação livre]')
def key(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
header=re.compile(r'^(.+?)\s*(?:\[[^\n]+\])?\s*\n?\s*(TALENTO|MAGIA|TRUQUE|FOCO|RITUAL)\s+(\d{1,2})\s*$',re.S)
def header_match(s):return header.match(s) if len(s)<220 else None
stream=[]
for n in range(44,398):
 bs=[]
 example_cols=set()
 for eb in pdf[n-1].get_text('blocks'):
  if 'Exemplo de ' in eb[4]:example_cols.add(0 if eb[0]<(310 if n%2 else 290) else 1)
 for b in pdf[n-1].get_text('dict')['blocks']:
  if 'lines' not in b:continue
  x,y,x1,y1=b['bbox'];spans=[sp for line in b['lines'] for sp in line['spans']]
  s=norm('\n'.join(''.join(sp['text'] for sp in line['spans']) for line in b['lines'])).strip()
  if y<46 or y>=752 or (n%2==0 and x>=530) or 'CopiCola' in s:continue
  if (0 if x<(310 if n%2 else 290) else 1) in example_cols:continue # boxed character examples occupy separate columns
  # PDF may merge a body and the next large heading into one block.
  # Separate at the first heading-font line; do not throw the valid body away.
  split=next((i for i,l in enumerate(b['lines']) if any(sp['size']>=13 for sp in l['spans'])),None)
  if split is not None and split>0:
   before=norm('\n'.join(''.join(sp['text'] for sp in line['spans']) for line in b['lines'][:split])).strip()
   bs.append((0 if x<(310 if n%2 else 290) else 1,y,before,False))
   s=norm('\n'.join(''.join(sp['text'] for sp in line['spans']) for line in b['lines'][split:])).strip()
   y=b['lines'][split]['bbox'][1]
   spans=[sp for line in b['lines'][split:] for sp in line['spans']]
  if spans and all(10.9<=sp['size']<=11.1 for sp in spans):continue # illustration labels, not section boundaries
  structural=not header_match(s) and (any(sp['size']>=13 for sp in spans) or (spans and all(sp['size']>=12 for sp in spans)))
  if x1-x>300 and not structural:continue
  if s.startswith('TALENTOS DE ') or (n<270 and len(re.findall(r'(?m)^\s*\d{1,2}\s*$',s))>=5):continue # class alphabetical index, never an entry body
  if s.startswith('ESTATÍSTICAS DOS '):structural=True
  # One mixed block contains PARALISAR and its traits. Keep the body separate.
  mixed=re.match(r'^(.*?\b(?:TALENTO|MAGIA|TRUQUE|FOCO|RITUAL)\s+\d{1,2})\s*\n(.+)$',s,re.S) if len(s)<400 else None
  if mixed and header_match(mixed[1]):
   bs.append((0 if x<(310 if n%2 else 290) else 1,y,mixed[1],False))
   bs.append((0 if x<(310 if n%2 else 290) else 1,y+.1,mixed[2],False))
  else:bs.append((0 if x<(310 if n%2 else 290) else 1,y,s,structural))
 for col,y,s,structural in sorted(bs):stream.append({'pagina':n-1,'coluna':col,'y':y,'texto':s,'fronteira':structural})
entries=[]
for i,b in enumerate(stream):
 h=header_match(b['texto'])
 if not h or len(h[1])>130:continue
 body=[];pages=[b['pagina']];amb=[]
 for nxt in stream[i+1:]:
  if header_match(nxt['texto']) or nxt['fronteira']:break
  if nxt['pagina']>b['pagina']+1:amb.append('continuação atravessa mais de uma página');break
  s=nxt['texto']
  if re.fullmatch(r'\d+[º°] NÍVEL',s):break
  if re.match(r'^(Exemplo de |Atributos\n|Talentos em níveis altos\n|Repertório de magias\n|Características de classe\n)',s):amb.append('fronteira com caixa de exemplo/tabela');break
  body.append(s)
  if nxt['pagina'] not in pages:pages.append(nxt['pagina'])
 text='\n\n'.join(body).strip()
 if len(text)<55:amb.append('corpo ausente ou curto')
 if text and text[-1] not in '.!?):»”':amb.append('final sem pontuação: possível coluna truncada')
 entries.append({'nome':re.sub(r'\[[^\n]+\]','',h[1]).strip(),'tipo':h[2],'nivel':int(h[3]),'pagina':b['pagina'],'paginas':pages,'texto':text,'ambiguidade':amb,'cabecalho':b['texto']})
base=json.loads((ROOT/'public/pathfinder/player-core.json').read_text())
by={}
for e in entries:by.setdefault((e['pagina'],key(e['nome']),e['nivel']),[]).append(e)
out={'observacao':'Texto PT do PDF, delimitado por colunas e cabeçalhos. Automação/revisão mecânica são independentes; entradas somenteConsulta continuam não elegíveis na ficha.','talentos':[],'magias':[],'pendencias':[]}
for category in ['talentos','magias']:
 for r in base[category]:
  if r.get('revisao')=='revisado':continue
  name=r.get('nomeFonte',r['nome'])
  es=by.get((r['pagina'],key(name),r.get('nivel',r.get('ranque'))),[])
  if not es:
   out['pendencias'].append({'id':r['id'],'categoria':category,'pagina':r['pagina'],'motivo':'cabeçalho sem correspondência segura'});continue
  e=es.pop(0)
  if e['ambiguidade']:
   out['pendencias'].append({'id':r['id'],'categoria':category,'pagina':r['pagina'],'motivo':'; '.join(e['ambiguidade'])});continue
  desc=re.sub(r'\s+',' ',e['texto'])
  record={'id':r['id'],'descricao':desc,'resumo':[],'textoNativoCompleto':True,'revisao':'texto-nativo-delimitado','somenteConsulta':True,'paginasTexto':e['paginas'],'secoes':[f'pc1-pdf-{p+1}' for p in e['paginas']]}
  # Only complete metadata lines, no guessed prerequisites or invented semantics.
  lines=e['texto'].splitlines()
  meta=[s.strip() for s in lines if re.match(r'^(Pré-requisitos|Requerimentos|Frequência|Gatilho|Distância|Área|Alvos|Defesa|Duração|Execução|Custo|Eleva)',s)]
  record['resumo']=[] # no partial metadata line presented as a complete rule summary
  record['metadadosFonte']=meta
  record['cabecalhoFonte']=e['cabecalho']
  if category=='magias':
   trad=re.search(r'Tradições\s+((?:(?:arcana|divina|ocultista|primal)[,\s]*)+)',e['texto'])
   if trad:record['tradicoes']=re.findall(r'arcana|divina|ocultista|primal',trad[1])
  out[category].append(record)
# Fonte p83 coloca estes talentos na coluna AIUVARIN; índice antigo atribuiu
# dono DROMAAR pelo intervalo de páginas. Mantém IDs persistidos, corrige filtro.
for r in out['talentos']:
 if r['id'] in ['dromaar-charme-sobrenatural','dromaar-inspirar-imitacao']:
  r['ancestralidade']='aiuvarin'
  r['observacaoEditorial']='ID histórico preservado; ancestralidade conferida pelo traço AIUVARIN do texto fonte.'
exceptions=json.loads((DIR/'entradas-nativas-excecoes.json').read_text())
for category in ['talentos','magias']:
 for r in exceptions[category]:
  out[category]=[x for x in out[category] if x['id']!=r['id']]+[r]
  out['pendencias']=[x for x in out['pendencias'] if x['id']!=r['id']]
destination=DIR/'entradas-nativas-pt.json'
temp=destination.with_suffix('.json.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');temp.replace(destination)
# Auditoria completa pode ser gerada à parte; manifesto tem somente entradas seguras.
print({k:len(out[k]) for k in ['talentos','magias','pendencias']})
