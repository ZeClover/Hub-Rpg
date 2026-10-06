#!/usr/bin/env python3
"""Fatos e referências Remaster (AoN 221); não traduz prosa automaticamente."""
import concurrent.futures, hashlib, html, json, re, time, urllib.request
from pathlib import Path
from lxml import html as lh
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/workspace/artifacts/pathfinder-fontes/monster-core')
DOC=ROOT/'docs/pathfinder/monster-core'
BASE='https://2e.aonprd.com/'
def obter(url,p):
 if p.exists():return p.read_bytes()
 for i in range(4):
  try:
   b=urllib.request.urlopen(urllib.request.Request(BASE+url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read();p.write_bytes(b);return b
  except Exception:
   if i==3:raise
   time.sleep(i+1)
def txt(n):return ' '.join(n.text_content().split())
def parse(i,nome,nomes,revisados):
 b=obter(f'Monsters.aspx?ID={i}&NoRedirect=1',CACHE/f'{i}.html')
 d=lh.fromstring(b);heads=d.xpath('//h1[contains(@class,"monster-statblock-name")]')
 if not heads:raise ValueError(f'{i}: sem bloco Remaster')
 h=heads[0];nodes=[h]
 for n in h.itersiblings():
  if 'monster-family' in n.get('class',''):break
  nodes.append(n)
 s=' '.join(' '.join((n.text_content()+(n.tail or '')).split()) for n in nodes)
 (CACHE/f'{i}.txt').write_text(s)
 def num(p):
  m=re.search(p,s);return int(m.group(1).replace('−','-')) if m else None
 size={'Tiny':'Minúsculo','Small':'Pequeno','Medium':'Médio','Large':'Grande','Huge':'Enorme','Gargantuan':'Imenso'}
 trait={'Aberration':'Aberração','Acid':'Ácido','Aeon':'Éon','Alchemical':'Alquímico','Amphibious':'Anfíbio','Angel':'Anjo','Animal':'Animal','Aquatic':'Aquático','Air':'Ar','Arcane':'Arcano','Archon':'Arconte','Astral':'Astral','Beast':'Besta','Celestial':'Celestial','Changeling':'Cambiante','Cold':'Frio','Construct':'Construto','Daemon':'Daemon','Demon':'Demônio','Devil':'Diabo','Dinosaur':'Dinossauro','Divine':'Divino','Dragon':'Dragão','Dwarf':'Anão','Earth':'Terra','Elemental':'Elemental','Elf':'Elfo','Ethereal':'Etéreo','Fey':'Fada','Fiend':'Ínfero','Fire':'Fogo','Fungus':'Fungo','Genie':'Gênio','Ghost':'Fantasma','Ghoul':'Carniçal','Giant':'Gigante','Gnome':'Gnomo','Goblin':'Goblin','Graveknight':'Cavaleiro sepulcral','Hag':'Estriga','Holy':'Sagrado','Human':'Humano','Humanoid':'Humanoide','Incorporeal':'Incorpóreo','Lawful':'Ordeiro','Metal':'Metal','Mindless':'Acéfalo','Monitor':'Monitor','Mummy':'Múmia','Mutant':'Mutante','Nymph':'Ninfa','Occult':'Ocultista','Ooze':'Gosma','Orc':'Orc','Phantom':'Espectro','Plant':'Planta','Primal':'Primal','Protean':'Proteano','Psychopomp':'Psicopompo','Rare':'Raro','Serpentfolk':'Povo-serpente','Shadow':'Sombra','Skeleton':'Esqueleto','Soulbound':'Vinculado à alma','Spirit':'Espírito','Swarm':'Enxame','Time':'Tempo','Troop':'Tropa','Undead':'Morto-vivo','Unholy':'Profano','Uncommon':'Incomum','Unique':'Único','Vampire':'Vampiro','Water':'Água','Werecreature':'Licantropo','Wight':'Inumano','Wood':'Madeira','Wraith':'Aparição','Zombie':'Zumbi','Merfolk':'Povo-do-mar'}
 tamanho='';tracos=[]
 for n in nodes:
  if n.get('class')=='traitsize':tamanho=size.get(txt(n),txt(n))
  if n.get('class')=='trait':tracos.append(trait.get(txt(n),txt(n)))
 attrs={pt:num(r'\b'+en+r'\s+([+−-]?\d+)') for en,pt in [('Str','for'),('Dex','des'),('Con','con'),('Int','int'),('Wis','sab'),('Cha','car')]}
 skills={};m=re.search(r'Skills (.*?) Str ',s)
 if m:
  for en,pt in [('Acrobatics','acrobacia'),('Arcana','arcanismo'),('Athletics','atletismo'),('Crafting','manufatura'),('Deception','enganacao'),('Diplomacy','diplomacia'),('Intimidation','intimidacao'),('Medicine','medicina'),('Nature','natureza'),('Occultism','ocultismo'),('Performance','performance'),('Religion','religiao'),('Society','sociedade'),('Stealth','furtividade'),('Survival','sobrevivencia'),('Thievery','ladroagem')]:
   v=re.search(r'\b'+en+r'\s+([+−-]?\d+)',m.group(1))
   if v:skills[pt]=int(v.group(1).replace('−','-'))
 speed={};m=re.search(r'Speed (.*?)(?:Melee|Ranged|[A-Z][a-z]+ Spells|$)',s)
 if m:
  for en,pt in [('', 'terrestre'),('fly','voo'),('swim','natacao'),('climb','escalada'),('burrow','escavacao')]:
   v=re.search((r'^\s*' if not en else r'\b'+en+r'\s+')+r'(\d+)\s+feet',m.group(1))
   if v:speed[pt]=int(v.group(1))
 r={'id':f'aon-monstro-{i}','nome':nomes[str(i)],'nomeOriginal':nome,'nivel':num(r'Creature\s+(-?\d+)'),'tamanho':tamanho,'tracos':tracos,'percepcao':num(r'Perception\s+([+−-]?\d+)'),'atributos':attrs,'ca':num(r'\bAC\s+(\d+)'),'pv':num(r'\bHP\s+(\d+)'),'salvaguardas':{'fortitude':num(r'\bFort\s+([+−-]?\d+)'),'reflexos':num(r'\bRef\s+([+−-]?\d+)'),'vontade':num(r'\bWill\s+([+−-]?\d+)')},'deslocamento':speed,'unidadeDeslocamento':'pes','pericias':skills,'ataques':[],'acoes':[],'resumo':['Referência do Monster Core Remaster. Consulte a fonte para habilidades e exceções ainda não revisadas em português.'],'fonte':'monster-core','pagina':num(r'Monster Core pg\.\s+(\d+)'),'url':BASE+f'Monsters.aspx?ID={i}&NoRedirect=1','estadoTraducao':'referencia','nota':'Valores básicos extraídos da fonte. Resistências, imunidades, exceções e habilidades não estão completas em referências pendentes; não importar como bloco de combate completo.','sha256Fonte':hashlib.sha256(b).hexdigest()}
 r.update(revisados.get(str(i),{}));return r
if __name__=='__main__':
 CACHE.mkdir(parents=True,exist_ok=True)
 source=obter('Sources.aspx?ID=221',CACHE/'source-221.html').decode()
 links=re.findall(r'<a[^>]*href="([^"]*Monsters.aspx\?ID=[^"]+)"[^>]*>(.*?)</a>',source,re.S)
 links=[(int(re.search(r'ID=(\d+)',u).group(1)),html.unescape(re.sub('<[^>]+>','',n))) for u,n in links]
 assert len(links)==411 and len(set(i for i,n in links))==411,'A fonte mudou; revisar cobertura'
 nomes=json.loads((DOC/'nomes.json').read_text());rev=json.loads((DOC/'revisados.json').read_text()) if (DOC/'revisados.json').exists() else {}
 assert set(nomes)=={str(i) for i,n in links},'Mapa de nomes incompleto'
 records=[];falhas=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  futs={pool.submit(parse,i,n,nomes,rev):(i,n) for i,n in links}
  for f in concurrent.futures.as_completed(futs):
   try:records.append(f.result())
   except Exception as e:falhas.append({'id':futs[f][0],'erro':str(e)})
   if (len(records)+len(falhas))%50==0:print(f'{len(records)} capturadas; {len(falhas)} falhas',flush=True)
 if falhas:print(json.dumps(falhas));raise SystemExit(1)
 records.sort(key=lambda x:(x['nome'].casefold(),x['id']))
 assert all(m[k] is not None for m in records for k in ['nivel','ca','pv','percepcao','pagina'])
 assert all(all(v is not None for v in m['atributos'].values()) for m in records)
 count=sum(m['estadoTraducao']=='revisado' for m in records)
 fonte={'id':'monster-core','nome':'Monster Core — Bestiário Remaster','edicao':'remaster','idiomaOriginal':'en','estado':'parcial','url':BASE+'Sources.aspx?ID=221','totalCriaturas':411,'criaturasRevisadas':count,'licenca':'ORC — Open RPG Creative License. Regras e adaptações mecânicas sob ORC; marcas e material reservado permanecem com seus titulares.','licencaUrl':'https://paizo.com/orclicense','creditos':'Pathfinder Monster Core © 2024 Paizo Inc. Consulta: Archives of Nethys, fonte 221. Adaptação editorial das regras em português: Hub-Rpg, 2026. Créditos completos documentados em docs/pathfinder/monster-core/LICENCA.md.','avisoLicenca':'Material mecânico licenciado sob ORC, com exclusão de garantias conforme a licença. Não publicado, endossado ou aprovado pela Paizo.'}
 fonte['atribuicao']=json.loads((DOC/'creditos.json').read_text())
 c={'fonte':fonte,'criaturas':records,'secoes':[{'id':'cobertura-monster-core','nome':'Cobertura e consulta','pagina':None,'texto':f'Catálogo de 411 criaturas Remaster. {count} blocos mecânicos foram redigidos e revisados em português. As demais entradas são referências básicas incompletas: habilidades, magias, exceções, imunidades e resistências devem ser consultadas na fonte antes de usá-las em combate. Distâncias em pés. Versões Legacy não foram incluídas.','resumo':['411 referências Remaster; somente entradas com estado revisado são fichas de combate importáveis.']}],'lacunas':[f'{411-count} criaturas aguardam redação e revisão de suas habilidades em português.','Valores básicos das referências não contemplam todas as exceções. Não importar referências como fichas completas.']}
 destino=ROOT/'public/pathfinder/monster-core.json'
 temporario=destino.with_suffix('.json.tmp')
 temporario.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
 temporario.replace(destino)
 print(f'Concluído: {len(records)} referências, {count} revisadas.')
