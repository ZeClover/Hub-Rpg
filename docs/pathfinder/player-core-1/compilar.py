"""Player Core PT: catálogo revisado e índice apenas referencial.
Nunca usa regex de corpo em colunas como descrição mecânica individual.
"""
import fitz, glob, re, json, hashlib, unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PDF=Path(glob.glob('/workspace/attachments/*/*remaster-livro-do-jogador*.pdf')[0]);D=fitz.open(PDF)
F='player-core'
def slug(s):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def clean(s):
 s=s.replace('\b','').replace('\u00ad','')
 s=re.sub(r'([a-zA-ZÀ-ÿ])-\s*\n\s*([a-zà-ÿ])',r'\1\2',s)
 for en,pt in [('[one-action]','[1 ação]'),('[two-actions]','[2 ações]'),('[three-actions]','[3 ações]'),('[free-action]','[ação livre]'),('[reaction]','[reação]')]:s=s.replace(en,pt)
 return s.strip()
def blocks(n):
 bs=[]
 for b in D[n-1].get_text('blocks'):
  if not isinstance(b[4],str):continue
  x,y,x1,y1=b[:4];t=clean(b[4])
  if not t or 'CopiCola - Copiar não é Roubar!' in t:continue
  if n not in [1,2,3,4,470] and (y<46 or y>=752):continue
  if n%2==0 and n>4 and x>=530:continue
  bs.append((x,y,x1,y1,t))
 def order(b):
  x,y,x1,y1,t=b
  return (0 if x1-x>300 and y<170 else (3 if x1-x>300 else (1 if x < (310 if n%2 else 290) else 2)),y,x)
 return sorted(bs,key=order)
def page(n):return '\n\n'.join(b[4] for b in blocks(n))
def prose(s):return re.sub(r'\s+',' ',clean(s)).strip()
j={'fonte':{'id':F,'nome':'Livro do Jogador — Player Core','edicao':'remaster','idiomaOriginal':'pt-BR','paginas':470,'estado':'parcial','sha256':hashlib.sha256(PDF.read_bytes()).hexdigest(),'observacao':'PDF enviado em português. Referências usam páginas impressas; página do PDF = impressa +1. Texto integral extraído; revisão integral pendente. Índices não revisados são somente consulta, sem requisitos inferidos.'},'classes':[],'ancestralidades':[],'biografias':[],'talentos':[],'magias':[],'equipamentos':[],'secoes':[],'lacunas':[]}
classes=[
('bardo','Bardo',96,8,['car'],4,['ocultismo','performance'],2,[1,1,2],[1,1,0,0],[1,1,0],'ocultista','car','Conjurador espontâneo ocultista que apoia aliados com performances e composições. Escolhe uma musa, recebe um talento e uma magia, e usa Carisma para conjurar.'),
('bruxo','Bruxo',110,6,['int'],3,[],1,[1,1,2],[1,0,0,0],[1,0,0],'patrono','int','Conjurador preparado que aprende magias pelo familiar. O patrono determina tradição, perícia, sortilégio inicial e habilidade especial de familiar.'),
('clerigo','Clérigo',124,8,['sab'],2,['religiao'],1,[1,1,2],[1,0,0,0],[1,0,0],'divina','sab','Conjurador preparado divino. Escolhe divindade e doutrina, segue éditos e anátemas e recebe espaços extras de curar ou ferir pela fonte divina.'),
('druida','Druida',138,8,['sab'],2,['natureza'],1,[1,1,2],[1,1,1,0],[1,0,0],'primal','sab','Conjurador preparado primal que protege a natureza. A ordem concede perícia, talento e magia de foco; segue anátemas e conhece a Canção Selvagem.'),
('guerreiro','Guerreiro',152,10,['for','des'],3,[],2,[2,2,1],[1,1,1,1],[2,2,1],None,None,'Combatente especialista em armas simples e marciais, treinado em armas avançadas e todas as armaduras. Recebe Golpe Reativo, Bloqueio com Escudo e talentos de combate.'),
('ladino','Ladino',168,8,['des','car','int','for'],7,['furtividade'],2,[1,2,2],[1,1,0,0],[1,1,0],None,None,'Combatente com ataque furtivo contra alvos desprevenidos e um talento de perícia por nível. O esquema determina perícias adicionais e pode liberar outro atributo-chave.'),
('mago','Mago',182,6,['int'],2,['arcanismo'],1,[1,1,2],[1,0,0,0],[1,0,0],'arcana','int','Conjurador preparado arcano que registra magias em um grimório. Escolhe escola arcana e tese, com benefícios distintos para currículo, preparação e vínculo arcano.'),
('patrulheiro','Patrulheiro',196,10,['for','des'],4,['natureza','sobrevivencia'],2,[2,2,1],[1,1,1,0],[1,1,0],None,None,'Combatente que designa uma presa e recebe vantagens para localizá-la e rastreá-la. Escolhe excelência em despiste, rajada ou precisão.')]
P={
'bardo':{3:{'salvaguardas':{'reflexos':2}},7:{'conjuracao':2},9:{'salvaguardas':{'fortitude':2,'vontade':3}},11:{'percepcao':3,'armas':{'simples':2,'marciais':2,'desarmados':2}},13:{'armaduras':{'sem':2,'leve':2}},15:{'conjuracao':3},17:{'salvaguardas':{'vontade':4}},19:{'conjuracao':4}},
'bruxo':{5:{'salvaguardas':{'fortitude':2}},7:{'conjuracao':2},9:{'salvaguardas':{'reflexos':2}},11:{'percepcao':2,'armas':{'simples':2,'desarmados':2}},13:{'armaduras':{'sem':2}},15:{'conjuracao':3},17:{'salvaguardas':{'vontade':3}},19:{'conjuracao':4}},
'clerigo':{5:{'percepcao':2},9:{'salvaguardas':{'vontade':3}},11:{'salvaguardas':{'reflexos':2}},13:{'armaduras':{'sem':2}}},
'druida':{3:{'percepcao':2,'salvaguardas':{'fortitude':2}},5:{'salvaguardas':{'reflexos':2}},7:{'conjuracao':2},11:{'salvaguardas':{'vontade':3},'armas':{'simples':2,'desarmados':2}},13:{'armaduras':{'sem':2,'leve':2,'media':2}},15:{'conjuracao':3},19:{'conjuracao':4}},
'guerreiro':{3:{'salvaguardas':{'vontade':2}},7:{'percepcao':3},9:{'salvaguardas':{'fortitude':3}},11:{'armaduras':{'sem':2,'leve':2,'media':2,'pesada':2},'cdClasse':2},13:{'armas':{'simples':3,'marciais':3,'avancadas':2,'desarmados':3}},15:{'salvaguardas':{'reflexos':3}},17:{'armaduras':{'sem':3,'leve':3,'media':3,'pesada':3}},19:{'armas':{'simples':4,'marciais':4,'avancadas':3,'desarmados':4},'cdClasse':3}},
'ladino':{5:{'armas':{'simples':2,'marciais':2,'desarmados':2}},7:{'percepcao':3,'salvaguardas':{'reflexos':3}},9:{'salvaguardas':{'fortitude':2}},11:{'cdClasse':2},13:{'percepcao':4,'salvaguardas':{'reflexos':4},'armas':{'simples':3,'marciais':3,'desarmados':3},'armaduras':{'sem':2,'leve':2}},17:{'salvaguardas':{'vontade':3}},19:{'armaduras':{'sem':3,'leve':3},'cdClasse':3}},
'mago':{5:{'salvaguardas':{'reflexos':2}},7:{'conjuracao':2},9:{'salvaguardas':{'fortitude':2}},11:{'percepcao':2,'armas':{'simples':2,'desarmados':2}},13:{'armaduras':{'sem':2}},15:{'conjuracao':3},17:{'salvaguardas':{'vontade':3}},19:{'conjuracao':4}},
'patrulheiro':{3:{'salvaguardas':{'vontade':2}},5:{'armas':{'simples':2,'marciais':2,'desarmados':2}},7:{'percepcao':3,'salvaguardas':{'reflexos':3}},9:{'cdClasse':2},11:{'armaduras':{'sem':2,'leve':2,'media':2},'salvaguardas':{'fortitude':3}},13:{'armas':{'simples':3,'marciais':3,'desarmados':3}},15:{'percepcao':4,'salvaguardas':{'reflexos':4}},17:{'cdClasse':3},19:{'armaduras':{'sem':3,'leve':3,'media':3}}}}
for id,name,p,pv,key,budget,fixed,perc,saves,armor,weap,trad,attr,desc in classes:
 c={'id':id,'nome':name,'pagina':p-1,'paginaPdf':p,'fonte':F,'pv':pv,'atributoChave':key,'periciasTreinadas':budget,'periciasFixas':fixed,'percepcao':perc,'salvaguardas':dict(zip(['fortitude','reflexos','vontade'],saves)),'armaduras':dict(zip(['sem','leve','media','pesada'],armor)),'armas':dict(zip(['simples','marciais','avancadas'],weap)),'cdClasse':1,'opcoes':[],'progressao':[],'descricao':desc,'resumo':[desc],'revisao':'revisado','secoes':[f'pc1-pdf-{n}' for n in range(p,p+14)]}
 c['armas']['desarmados']=weap[0]
 c['niveisTalentos']={'classe':([1] if id in ['guerreiro','ladino','patrulheiro'] else [])+list(range(2,21,2)),'geral':[3,7,11,15,19],'ancestralidade':[1,5,9,13,17],'pericia':list(range(1,21)) if id=='ladino' else list(range(2,21,2))}
 c['niveisIncrementosPericia']=list(range(2,21)) if id=='ladino' else list(range(3,21,2))
 if trad:c['conjuracao']={'tradicao':trad,'atributo':attr,'proficiencia':1,'truques':5,'preparacao':'espontanea' if id=='bardo' else 'preparada','espacosPorNivel':[{'nivel':n,'espacos':{str(r):(1 if r==10 else (2 if n==2*r-1 else 3)) for r in range(1,min(10,(n+1)//2)+1)},'truques':5} for n in range(1,21)]}
 table=next(b[4] for b in D[p].get_text('blocks') if 'Características de classe' in b[4] and re.search(r'\n\s*1\s*\n',b[4]) and re.search(r'\n\s*20\s*\n',b[4]))
 rows=re.split(r'(?m)^\s*(\d{1,2})\s*$',table)
 for i in range(1,len(rows),2):
  level=int(rows[i]);r={'nivel':level,'nome':f'Benefícios de {name} no nível {level}','descricao':prose(rows[i+1]),'automatico':False,'fonte':F,'pagina':p}
  if level in P[id]:r['proficiencias']=P[id][level]
  c['progressao'].append(r)
 assert [r['nivel'] for r in c['progressao']]==list(range(1,21))
 if id=='guerreiro':c['periciasEscolha']=['acrobacia','atletismo'];c['observacao']='Escolha treinar Acrobatismo ou Atletismo além das3+INT. Proficiências do grupo de armas escolhido no5º/13º não são aplicadas a todos os grupos.'
 if id=='clerigo':c['observacao']='Divindade também fornece perícia e arma favorecida. Essas escolhas não equivalem a treinamento universal em armas marciais.';c['conjuracao']['fonteDivina']={'opcoes':['curar','ferir'],'dependeDivindade':True,'espacos':[{'nivel':1,'quantidade':4},{'nivel':5,'quantidade':5},{'nivel':15,'quantidade':6}]}
 if id=='mago':c['conjuracao']['extrasCurriculo']={'truques':1,'espacosPorRanque':1,'excetoOpcao':'teoria-magica-unificada'}
 j['classes'].append(c)
def save():
 out=ROOT/'public/pathfinder/player-core.json';out.parent.mkdir(parents=True,exist_ok=True);tmp=out.with_suffix('.json.tmp');tmp.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');tmp.replace(out)
# Escolhas de classe escritas após conferir as entradas do livro.
options={
'bardo':[
('combatente','Combatente',98,'Recebe Performance Marcial e adiciona medo ao repertório.',{}),('enigma','Enigma',98,'Recebe Saber Bárdico e adiciona golpe certeiro ao repertório.',{}),('maestro','Maestro',98,'Recebe Composição Prolongada e adiciona abrandar ao repertório.',{}),('polimata','Polímata',98,'Recebe Performance Versátil e adiciona lacaio fantasmagórico ao repertório.',{})],
'bruxo':[
('guardiao-fe-irrefreavel','O Guardião da Fé Irrefreável',114,'Magia divina; Religião treinada; avivar o coração. Familiar aprende comando e, ao Conjurar/Sustentar sortilégio, concede 2+metade do nível em PV temporários a voluntário até4,5m, até seu próximo turno.',{'conjuracao':{'tradicao':'divina','atributo':'int'},'periciasFixas':['religiao']}),
('sentinela-ermos','O Sentinela dos Ermos',114,'Magia primal; Natureza treinada; palavra dos ermos. Familiar aprende convocar animal ou convocar planta/fungo e, ao sortilégio, recebe sentido impreciso18m e pode Apontar.',{'conjuracao':{'tradicao':'primal','atributo':'int'},'periciasFixas':['natureza']}),
('inscrito','O Inscrito',114,'Magia arcana; Arcanismo treinado; discernir segredos. Familiar aprende arma rúnica e, ao sortilégio, fornece flanqueamento como se atacasse com alcance1,5m até próximo turno.',{'conjuracao':{'tradicao':'arcana','atributo':'int'},'periciasFixas':['arcanismo']}),
('ressentimento','O Ressentimento',114,'Magia ocultista; Ocultismo treinado; mau-olhado. Familiar aprende enfraquecer e, ao sortilégio, prolonga1rodada condições negativas com duração definida de criatura até4,5m; não impede removê-las de outra forma.',{'conjuracao':{'tradicao':'ocultista','atributo':'int'},'periciasFixas':['ocultismo']}),
('silencio-invernal','O Silêncio Invernal',115,'Magia primal; Natureza treinada; gelo duradouro. Familiar aprende lufada de vento; ao sortilégio, cria terreno difícil em explosão1,5m de seu espaço até próximo turno.',{'conjuracao':{'tradicao':'primal','atributo':'int'},'periciasFixas':['natureza']}),
('sombra-inconstelada','A Sombra Inconstelada',115,'Magia ocultista; Ocultismo treinado; mortalha da noite. Familiar aprende medo; ao sortilégio, inimigo adjacente para quem esteja ocultado, escondido ou indetectado fica assustado1.',{'conjuracao':{'tradicao':'ocultista','atributo':'int'},'periciasFixas':['ocultismo']}),
('tecelao-destinos','O Tecelão de Destinos',115,'Magia ocultista; Ocultismo treinado; guiar o destino. Familiar aprende golpe certeiro; ao sortilégio, dá+1 ou−1 de estado na CA de criatura até4,5m até próximo turno.',{'conjuracao':{'tradicao':'ocultista','atributo':'int'},'periciasFixas':['ocultismo']})],
'clerigo':[
('sacerdote-enclausurado','Sacerdote enclausurado',126,'Recebe Iniciado no Domínio. Fortitude especialista3º; conjuração especialista7º/mestre15º/lendária19º; armas simples/desarmados especialista11º. Arma favorecida depende da divindade.',{'progressao':[{'nivel':3,'proficiencias':{'salvaguardas':{'fortitude':2}}},{'nivel':7,'proficiencias':{'conjuracao':2}},{'nivel':11,'proficiencias':{'armas':{'simples':2,'desarmados':2}}},{'nivel':15,'proficiencias':{'conjuracao':3}},{'nivel':19,'proficiencias':{'conjuracao':4}}]}),
('capelao-guerra','Capelão da guerra',126,'Treina armaduras leves/médias, Fortitude especialista e Bloqueio com Escudo. Simplicidade Mortal se arma favorecida simples/desarmada. Armas marciais treinadas3º e especialista7º; conjuração especialista11º/mestre19º; Fortitude mestre15º; armaduras especialista13º.',{'proficiencias':{'armaduras':{'leve':1,'media':1},'salvaguardas':{'fortitude':2}},'progressao':[{'nivel':3,'proficiencias':{'armas':{'marciais':1}}},{'nivel':7,'proficiencias':{'armas':{'simples':2,'marciais':2,'desarmados':2}}},{'nivel':11,'proficiencias':{'conjuracao':2}},{'nivel':13,'proficiencias':{'armaduras':{'leve':2,'media':2}}},{'nivel':15,'proficiencias':{'salvaguardas':{'fortitude':3}}},{'nivel':19,'proficiencias':{'conjuracao':3}}]})],
'druida':[
('animais','Animais',139,'Treina Atletismo; Companheiro Animal; curar animal. Crueldade ou morte desnecessária de animais é anátema; defesa e alimentação sem crueldade são permitidas.',{'periciasFixas':['atletismo']}),
('folha','Folha',139,'Treina Diplomacia; Familiar Leshy; cornucópia. Crueldade ou morte desnecessária de plantas/fungos é anátema; defesa e colheita para alimentar-se são permitidas.',{'periciasFixas':['diplomacia']}),
('indomavel','Indomável',140,'Treina Intimidação; Forma Indomável; transformação indomável. Dependência completa da civilização é anátema; comprar bens ou visitar cidades não é.',{'periciasFixas':['intimidacao']}),
('tempestade','Tempestade',140,'Treina Acrobatismo; Nascido da Tempestade; surto de tempestade. Poluir ar/deixar grandes poluidores impunes é anátema; não exige sacrifício contra adversário superior.',{'periciasFixas':['acrobacia']})],
'ladino':[
('ladrao','Ladrão',168,'Treina Ladroagem. Pode usar DES no dano de arma/ataque desarmado corpo a corpo de acuidade em lugar de FOR.',{'atributoChave':['des'],'periciasFixas':['ladroagem']}),
('malandro','Malandro',168,'Treina Diplomacia/Dissimulação e pode usar CAR. Fintar prolonga desprevenido contra seus ataques corpo a corpo até fim do próximo turno; crítico beneficia todos. Com arma ágil/acuidade, pode Dar um Passo livre após Fintar.',{'atributoChave':['des','car'],'periciasFixas':['diplomacia','enganacao']}),
('mandante','Mandante',168,'Treina Sociedade e escolhe Arcanismo/Natureza/Ocultismo/Religião; pode usar INT. Identificar criatura com Recordar Conhecimento deixa-a desprevenida contra seus ataques até início do próximo turno, ou1minuto no crítico.',{'atributoChave':['des','int'],'periciasFixas':['sociedade'],'periciasEscolha':['arcanismo','natureza','ocultismo','religiao']}),
('rufiao','Rufião',169,'Treina Intimidação/armaduras médias e pode usar FOR. Ataque furtivo admite outras armas de dado máximo d8 simples ou d6 marcial/avançado após alterações. Crítico contra desprevenido aplica especialização. Média progride junto da leve.',{'atributoChave':['des','for'],'periciasFixas':['intimidacao'],'proficiencias':{'armaduras':{'media':1}},'progressao':[{'nivel':13,'proficiencias':{'armaduras':{'media':2}}},{'nivel':19,'proficiencias':{'armaduras':{'media':3}}}]})],
'patrulheiro':[
('despiste','Despiste',196,'Contra a presa, +1 de circunstância na CA e+2 em Dissimulação/Furtividade/Intimidação/Recordar Conhecimento. No17º, perícias mestre recebem+4; se mestre na armadura, CA+2.',{}),
('rajada','Rajada',196,'Contra a presa, penalidades de ataques múltiplos−3/−6 ou−2/−4 ágil. No17º, mestre na arma usa−2/−4 ou−1/−2 ágil. Contra outros alvos, penalidades normais.',{}),
('precisao','Precisão',196,'Primeiro acerto da rodada na presa causa1d8 de precisão;2d8 no11º e3d8 no19º. No17º, segundo acerto causa1d8; no19º segundo2d8 e terceiro1d8. Imunidade a precisão continua válida.',{})]}
for c in j['classes']:
 for id,name,p,desc,extra in options.get(c['id'],[]):c['opcoes'].append({'id':id,'nome':name,'fonte':F,'pagina':p,'descricao':desc,'resumo':[desc],'revisao':'revisado',**extra})
m=next(c for c in j['classes'] if c['id']=='mago')
m['opcoes']=[{'id':id,'nome':name,'grupo':'escola','fonte':F,'pagina':p,'descricao':desc,'resumo':[desc],'revisao':'revisado'} for id,name,p,desc in [
('ars-grammatica','Escola da Ars Grammatica',186,'Currículo de runas, palavras e proteções; foco guarita de proteção e runa de observação.'),('forma-proteana','Escola da Forma Proteana',187,'Currículo de alteração de corpos; foco embaralhar corpo e forma mutável.'),('limiares','Escola dos Limiares',187,'Currículo de espíritos e viagem planar; foco fortificar convocação e espiral de horrores.'),('magia-belica','Escola da Magia Bélica',188,'Currículo ofensivo e defesa militar; foco raio de força e absorção de energia.'),('magia-civica','Escola da Magia Cívica',188,'Currículo de utilidade e construção; foco terraplenagem e restauração comunitária.'),('mentalismo','Escola do Mentalismo',188,'Currículo de ilusões e influência mental; foco ímpeto cativante e manto de invisibilidade.'),('teoria-magica-unificada','Escola da Teoria Mágica Unificada',188,'Sem espaços/magias extras de currículo. Adiciona magia1º ao grimório e usa Drenar Item Vinculado uma vez por dia para cada ranque. Foco mão do aprendiz e fórmula interdisciplinar.')]]
m['teses']=[{'id':id,'nome':name,'fonte':F,'pagina':p,'descricao':desc,'resumo':[desc],'revisao':'revisado'} for id,name,p,desc in [
('mescla-magia','Mescla de magia',183,'Nas preparações, troca dois espaços iguais por um até2ranques maior, dentre ranques conjuráveis, sem repetir ranques criados. Uma vez por preparação, também troca um espaço por dois truques extras.'),('moldamagia-experimental','Moldamagia experimental',183,'Recebe moldamagia de mago1º. A partir do4º, escolhe nas preparações um talento moldamagia até metade do nível para usar até preparação seguinte.'),('nexo-cajado','Nexo de cajado',183,'Começa com cajado improvisado contendo truque/magia1º do grimório. Gastar magia na preparação dá cargas do ranque; pode gastar duas magias no8º e três no16º. Paga custo normal para aprimorar o cajado.'),('familiar-aprimorado','Sintonização com familiar aprimorada',184,'Recebe Familiar com habilidade extra, mais outra no6º/12º/18º. Vínculo fica no familiar e Drenar Familiar substitui Drenar Item Vinculado.'),('substituicao-magia','Substituição de magia',184,'Troca espaço preparado por outra magia do grimório em10minutos. Interrompido, conserva magia anterior e deve recomeçar o processo.')]]
ancestries=[('anao','Anão',44,10,6,'Médio',['con','sab'],1,'car','Visão no escuro e adaga de clã gratuita; resistente, com Velocidade6m.'),('elfo','Elfo',48,6,9,'Médio',['des','int'],1,'con','Visão na penumbra e Velocidade9m; heranças de magia, experiência ou ambiente.'),('gnomo','Gnomo',52,8,7.5,'Pequeno',['con','car'],1,'for','Visão na penumbra; corpo pequeno e ligação com magia feérica.'),('goblin','Goblin',56,6,7.5,'Pequeno',['des','car'],1,'sab','Visão no escuro; corpo pequeno e heranças que fornecem resistência, mandíbulas ou maisPV.'),('halfling','Halfling',60,6,7.5,'Pequeno',['des','sab'],1,'for','Olhos Aguçados: +2 de circunstância para Buscar escondidos/indetectados até9m e testes simples3/9 contra ocultado/escondido.'),('humano','Humano',64,8,7.5,'Médio',[],2,None,'Dois incrementos livres; herança concede treino de perícia ou talento geral.'),('leshy','Leshy',68,8,7.5,'Pequeno',['con','sab'],1,'int','Visão na penumbra e nutrição vegetal; espírito em corpo de planta ou fungo.'),('orc','Orc',72,10,7.5,'Médio',[],2,None,'Visão no escuro e dois incrementos livres; robusto, com heranças de resistência/perícias.')]
H={
'anao':[('da-forja','Anão da forja','Resistência a fogo metade do nível, mínimo1; calor ambiental um grau mais brando.',{}),('sangue-ancestral','Anão de sangue ancestral','Reação Invocar Sangue Ancestral antes de salvamento mágico: +1 de circunstância contra esse e outros efeitos mágicos até fim do turno.',{}),('sangue-forte','Anão de sangue forte','Resistência a veneno metade do nível, mínimo1. Sucesso reduz estágio2 e crítico3; veneno virulento reduz respectivamente1 e2.',{}),('guardiao-morte','Anão guardião da morte','Sucesso contra eversão ou efeito de morto-vivo vira crítico.',{}),('rochoso','Anão rochoso','+2 de circunstância nas CDs/salvamentos contra Derrubar, Empurrar, Reposicionar e movimento forçado/prostrado. Movimento forçado de3m ou mais fica pela metade.',{})],
'elfo':[('antigo','Elfo antigo','Dedicação multiclasse de outra classe ignorando só nível; demais requisitos valem. Típico pelo menos100anos, mais jovem a critério do mestre.',{}),('artico','Elfo ártico','Resistência a frio metade do nível, mínimo1; frio ambiental um grau mais brando.',{}),('cavernas','Elfo das cavernas','Visão no escuro.',{}),('florestas','Elfo das florestas','Escalar vegetação: metade da Velocidade no sucesso, toda no crítico; Escalada Rápida dá toda no sucesso. Em floresta pode Obter Cobertura sem obstáculo usual. Não muda Velocidade de escalada.',{}),('sussurros','Elfo dos sussurros','+2 de circunstância para Buscar escondidos/indetectados até9m; teste simples3/9 contra ocultado/escondido. Exige poder ouvir e alvo emitir sons.',{}),('vidente','Elfo vidente','Detectar magia arcana inata à vontade; +1 de circunstância em Identificar Magia/Decifrar Escrita mágica.',{})],
'gnomo':[('camaleao','Gnomo camaleão','Muda cores com uma ação para mudanças pequenas ou até1hora para grandes. Ao combinar cor com ambiente usando uma ação, +2 de circunstância em Furtividade até mudar de ambiente.',{}),('manancial','Gnomo manancial','Escolhe tradição arcana/divina/ocultista, recebe um truque inato à vontade. Magias primais inatas futuras de talentos de gnomo passam à tradição escolhida.',{}),('sensitivo','Gnomo sensitivo','Faro impreciso9m e+2 de circunstância em Percepção para localizar indetectados nesse alcance; mestre ajusta conforme vento.',{}),('tocado-fadas','Gnomo tocado-pelas-fadas','Traço fada e truque primal inato à vontade; uma vez por dia troca truque com atividade10minutos de concentração.',{}),('umbral','Gnomo umbral','Visão no escuro.',{})],
'goblin':[('bucho-ferro','Goblin bucho-de-ferro','Subsiste de lixo disponível em assentamento e come/bebe quando enjoado. +2 de circunstância contra aflições/enjoado por ingestão; sucesso de Fortitude afetado vira crítico.',{}),('couro-chamuscado','Goblin couro-chamuscado','Resistência a fogo metade do nível, mínimo1. Teste simples para fogo persistente CD10, ou5 com ajuda apropriada.',{}),('neves','Goblin das neves','Resistência a frio metade do nível, mínimo1; frio ambiental um grau mais brando.',{}),('dentes-navalha','Goblin dentes-de-navalha','Mandíbulas1d6 perfurante, grupo pugilato, acuidade/desarmado.',{}),('inquebravel','Goblin inquebrável','PV de ancestralidade10 em vez de6; queda causa dano como metade da distância.',{'pv':10})],
'halfling':[('agourento','Halfling agourento','Incomum, proíbe Sorte de Halfling. Agourar: duas ações,1/dia,9m; Vontade contra maiorCDclasse/magia. Falha desajeitado1/crítica2 por1min; sucesso imunidade24h.',{'raridade':'incomum'}),('colinas','Halfling das colinas','Soma nível aosPV recuperados dormindo e por Tratar Ferimentos se comer lanche durante tratamento.',{}),('matas','Halfling das matas','Ignora terreno difícil de plantas/fungos.',{}),('crepuscular','Halfling crepuscular','Visão na penumbra.',{}),('intrepido','Halfling intrépido','Sucesso em salvamento contra emoção vira crítico.',{}),('nomade','Halfling nômade','Dois idiomas comuns/incomuns disponíveis; cada Poliglota dá mais um idioma.',{})],
'humano':[('perito','Humano perito','Uma perícia treinada à escolha, especialista nela no5º.',{'efeitos':[{'alvo':'treinamentos','tipo':'sem-tipo','valor':1}]}),('versatil','Humano versátil','Um talento geral cujos pré-requisitos atende; pode selecioná-lo mais tarde durante criação.',{'bonusTalentos':[{'tipo':'geral','nivel':1,'quantidade':1}]})],
'leshy':[('algaceo','Leshy algáceo','Respira na água; natação3m e Velocidade terrestre−1,5m.',{'deslocamento':6,'natacao':3}),('cabacal','Leshy cabaçal','Guarda1Volume na cabeça; CD para Furtar conteúdo+4. Só um item guardado pode ser sacado junto da ação que usa, dando manuseio à ação.',{}),('cactario','Leshy cactário','Espinhos1d6 perfurante, grupo pugilato, acuidade/desarmado.',{}),('ciporeo','Leshy cipóreo','Escala sem mão livre; sucesso em Atletismo para Escalar vira crítico.',{}),('foliaceo','Leshy foliáceo','Não sofre dano de queda.',{}),('frutifero','Leshy frutífero','Um fruto por amanhecer: Interagir para remover e para comer. Consumido por criatura viva até1hora, cura1d8+1d8 por cada2níveis acima do1º.',{}),('fungico','Leshy fúngico','Visão no escuro; perde planta e ganha fungo.',{}),('hidrofito','Leshy hidrófito','Anda sobre líquidos parados não danosos à metade da Velocidade. Água corrente exige Equilibrar-se comCDNadar; falha/crítica cai na água.',{}),('radicular','Leshy radicular','PV de ancestralidade10; tolera2semanas sem sol antes de fome; +2 de circunstância nas CDs/salvamentos contra movimento forçado/prostrado.',{'pv':10})],
'orc':[('belico','Orc bélico','Intimidação treinada e Olhar Intimidante.',{'periciasFixas':['intimidacao']}),('profundezas','Orc das profundezas','Especialidade em Terreno subterrâneo e Escalador de Combate.',{}),('chuvano','Orc chuvano','+2 de circunstância para Escalar/Nadar com Atletismo e+1 contra doenças.',{}),('ermos','Orc dos ermos','Trotar pelo dobro da duração normal na exploração; calor ambiental um grau mais brando.',{}),('invernal','Orc invernal','Sobrevivência treinada e frio ambiental um grau mais brando.',{'periciasFixas':['sobrevivencia']}),('sarjado','Orc sarjado','PV de ancestralidade12 e Duro de Matar.',{'pv':12}),('sepulcral','Orc sepulcral','Resistência a eversão metade do nível, mínimo1; +1 de circunstância contra morte/eversão.',{})]}
for id,name,p,pv,speed,size,boosts,free,flaw,desc in ancestries:
 a={'id':id,'nome':name,'pv':pv,'deslocamento':speed,'tamanho':size,'incrementos':boosts,'livres':free,'herancas':[],'descricao':desc,'resumo':[desc],'pagina':p-2,'fonte':F,'revisao':'revisado'}
 if flaw:a['defeito']=flaw
 for hid,hname,hdesc,extra in H[id]:a['herancas'].append({'id':id+'-'+hid,'nome':hname,'descricao':hdesc,'resumo':[hdesc],'pagina':p-1,'fonte':F,'revisao':'revisado',**extra})
 j['ancestralidades'].append(a)
j['herancasVersateis']=[{'id':id,'nome':name,'pagina':p,'fonte':F,'descricao':desc,'resumo':[desc],'revisao':'revisado'} for id,name,p,desc in [('cambiante','Cambiante',76,'Herança incomum de estriga; traço cambiante e penumbra ou visão no escuro se já tinha penumbra. Acesso a talentos de cambiante e da ancestralidade original.'),('nefilim','Nefilim',78,'Herança incomum extraplanar; traço nefilim e penumbra ou visão no escuro se já tinha penumbra. Acesso a talentos de nefilim e da ancestralidade original.'),('aiuvarin','Aiuvarin',82,'Herança mista élfica; traços elfo/aiuvarin, penumbra e acesso a talentos de elfo, aiuvarin e ancestralidade original.'),('dromaar','Dromaar',83,'Herança mista órquica; traços orc/dromaar, penumbra e acesso a talentos de orc, dromaar e ancestralidade original.')]]
bios=[
('Acólito',84,['int','sab'],'religiao','Escrita','Estudante do Cânone'),('Acrobata',84,['for','des'],'acrobacia','Circo','Equilíbrio Estável'),('Advogado',84,['int','car'],'diplomacia','Leis','Impressionar Grupo'),('Animador',84,['des','car'],'performance','Teatro','Performance Fascinante'),('Apostador',84,['des','car'],'enganacao','Jogos','Mente na Minha Cara'),('Artesão',84,['for','int'],'manufatura','Guildas','Especialidade de Manufatura'),('Artista',84,['des','car'],'manufatura','Artes','Especialidade de Manufatura'),
('Bandido',85,['des','car'],'intimidacao','terreno em que trabalhou','Coagir Grupo'),('Batedor',85,['des','sab'],'sobrevivencia','terreno em que atuava','Forrageador'),('Caçador',85,['des','sab'],'sobrevivencia','Curtume','Procurar Vida Selvagem'),('Caçador de Recompensas',85,['for','sab'],'sobrevivencia','Leis','Rastreador Experiente'),('Charlatão',85,['int','car'],'enganacao','Submundo','Mentiroso Charmoso'),
('Cozinheiro',86,['con','int'],'sobrevivencia','Culinária','Temperado'),('Criado na Crença',86,[],None,'divindade escolhida','Certeza'),('Criança de Rua',86,['des','con'],'ladroagem','cidade em que vivia','Punga'),('Criminoso',86,['des','int'],'furtividade','Submundo','Contrabandista Experiente'),('Cultista',86,['int','car'],'ocultismo','divindade ou culto','Instruído em Segredos'),('Detetive',86,['int','sab'],'sociedade','Submundo','Manha das Ruas'),('Discípulo Marcial',86,['for','des'],None,'Guerra','Queda do Gato ou Salto Rápido'),('Emissário',86,['int','car'],'sociedade','cidade visitada','Poliglota'),('Encantador de Animais',86,['sab','car'],'natureza','terreno habitado pelos animais','Treinar Animal'),('Eremita',86,['con','int'],None,'terreno onde vivia','Conhecimento Duvidoso'),
('Estudioso',87,['int','sab'],None,'Academia','Certeza'),('Funileiro',87,['des','int'],'manufatura','Engenharia','Especialidade de Manufatura'),('Gladiador',87,['for','car'],'performance','Gladiadores','Performance Impressionante'),('Guarda',87,['for','car'],'intimidacao','Leis ou Guerra','Coerção Rápida'),('Herbalista',87,['con','sab'],'natureza','Herbalismo','Medicina Natural'),('Lavrador',87,['con','sab'],'atletismo','Agricultura','Certeza'),('Marinheiro',87,['for','des'],'atletismo','Navegação','Saqueador Subaquático'),('Médico de Campo',87,['con','sab'],'medicina','Guerra','Medicina de Batalha'),
('Mercador',88,['int','car'],'diplomacia','Mercantil','Pechinchador'),('Mineiro',88,['for','sab'],'sobrevivencia','Mineração','Especialidade em Terreno'),('Nobre',88,['int','car'],'sociedade','Genealogia ou Heráldica','Gracejos da Corte'),('Nômade',88,['con','sab'],'sobrevivencia','terreno em que viajou','Certeza'),('Operário',88,['for','con'],'atletismo','Trabalho','Carregador Robusto'),('Professor',88,['int','sab'],None,'Academia','Profissional Experiente'),('Prisioneiro',88,['for','con'],'furtividade','Submundo','Contrabandista Experiente'),('Soldado',88,['for','con'],'intimidacao','Guerra','Olhar Intimidante'),('Taverneiro',88,['con','car'],'diplomacia','Álcool','Camarada'),('Vidente',88,['int','car'],'ocultismo','Vidência','Identificar Estranhezas')]
attribute_labels={'for':'Força','des':'Destreza','con':'Constituição','int':'Inteligência','sab':'Sabedoria','car':'Carisma'}
skill_labels={'acrobacia':'Acrobatismo','arcanismo':'Arcanismo','atletismo':'Atletismo','enganacao':'Dissimulação','diplomacia':'Diplomacia','intimidacao':'Intimidação','manufatura':'Manufatura','medicina':'Medicina','natureza':'Natureza','ocultismo':'Ocultismo','performance':'Performance','religiao':'Religião','sociedade':'Sociedade','furtividade':'Furtividade','sobrevivencia':'Sobrevivência','ladroagem':'Ladroagem'}
for name,p,attrs,skill,lore,feat in bios:
 id=slug(name)
 desc=f'Escolha um incremento em {" ou ".join(attribute_labels[a] for a in attrs)} e outro livre em atributo diferente. Treina {skill_labels.get(skill,"a perícia escolhida na lista desta biografia")} e Saber ({lore}); recebe {feat}. Se o treino inicial da classe repetir a perícia da biografia, escolha outra perícia.'
 b={'id':id,'nome':name,'atributos':attrs,'livres':1,'pericia':skill,'saber':lore,'talento':slug(feat),'talentoNome':feat,'descricao':desc,'resumo':[desc],'pagina':p,'fonte':F,'revisao':'revisado','secoes':[f'pc1-pdf-{p+1}']}
 if id=='criado-na-crenca':b['dependeDivindade']=True;b['descricao']='Escolha um incremento dentre os atributos divinos da divindade e outro livre em atributo diferente. Treina sua perícia divina e Saber da divindade; recebe Certeza para essa perícia. Precisa definir divindade antes de aplicar esses benefícios.';b['resumo']=[b['descricao']]
 if id=='discipulo-marcial':b['periciasEscolha']=['acrobacia','atletismo'];b['talentoEscolha']={'acrobacia':'queda-do-gato','atletismo':'salto-rapido'}
 if id=='eremita':b['periciasEscolha']=['natureza','ocultismo']
 if id=='estudioso':b['periciasEscolha']=['arcanismo','natureza','ocultismo','religiao']
 if id=='professor':b['periciasEscolha']=['performance','sociedade']
 j['biografias'].append(b)
# Texto integral de cada página não é apresentado como revisão integral do livro.
chapters=[(1,4,'Capa, créditos e sumário'),(5,40,'Introdução'),(41,91,'Ancestralidades e biografias'),(92,225,'Classes'),(226,249,'Perícias'),(250,269,'Talentos'),(270,295,'Equipamento'),(296,397,'Magias'),(398,441,'Jogando Pathfinder'),(442,447,'Condições'),(448,453,'Ficha de personagem'),(454,470,'Glossário, índice e créditos')]
for n in range(1,len(D)+1):
 label=next(label for start,end,label in chapters if start<=n<=end)
 for id,name,p,*_ in classes:
  if p<=n<p+14:label='Classes — '+name
 text=page(n)
 if len(text)<40:text+='\n\nPágina de ilustração/separação sem regras adicionais extraíveis.'
 j['secoes'].append({'id':f'pc1-pdf-{n}','nome':label+' — '+('capa' if n==1 else f'página{n-1}'),'pagina':max(1,n-1),'paginaPdf':n,'texto':text.strip(),'resumo':[],'fonte':F,'revisao':'texto-extraido-nao-revisado-integralmente'})
# Somente cabeçalhos: nunca atribui texto/requisitos de outra coluna à entrada.
def owner(n,kind):
 if kind=='ancestralidade':
  for id,name,p,*_ in ancestries:
   if p<=n<p+4:return id
  for lo,hi,who in [(77,78,'cambiante'),(79,82,'nefilim'),(83,83,'aiuvarin'),(84,84,'dromaar')]:
   if lo<=n<=hi:return who
 if kind=='classe':
  for id,name,p,*_ in classes:
   if p<=n<p+14:return id
 return None
featpattern=r'^([A-ZÀÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÀÁÉÍÓÚÂÊÔÃÕÇ0-9 \-–—’\'()/,]+?)(?:\s*\[[^\n]+?\])?\s*\n?\s*TALENTO\s+(\d{1,2})\s*$'
magicpattern=r'^([A-ZÀÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÀÁÉÍÓÚÂÊÔÃÕÇ0-9 \-–—’\'()/,]+?)(?:\s*\[[^\n]+?\])?\s*\n?\s*(MAGIA|TRUQUE|FOCO|RITUAL)\s+(\d{1,2})\s*$'
for lo,hi,kind in [(44,84,'ancestralidade'),(102,225,'classe'),(253,269,'geral')]:
 for n in range(lo,hi+1):
  for match in re.finditer(featpattern,page(n),re.M):
   name=prose(match.group(1)).title();who=owner(n,kind);typ='arquetipo' if kind=='classe' and n>=215 else kind
   if typ=='arquetipo':who=None
   id=((who+'-') if who else '')+slug(name)
   if any(t['id']==id for t in j['talentos']):id+='-'+match.group(2)
   t={'id':id,'nome':name,'nivel':int(match.group(2)),'tipo':typ,'requisitos':'','descricao':f'Entrada de referência. Consulte a página{n-1} no grimório: o texto integral da página está preservado, mas esta entrada individual ainda aguarda revisão.','resumo':[],'fonte':F,'pagina':n-1,'revisao':'material-indexado','somenteConsulta':True,'secoes':[f'pc1-pdf-{n}']}
   if who:t['ancestralidade' if kind=='ancestralidade' else 'classe']=who
   if id=='guerreiro-investida-abalroante-10':t['nomeFonte']=name;t['nome']='Investida Abalroante (nível10)';t['observacaoEditorial']='Fonte imprime mesmo título para talentos diferentes de níveis4/10. O nível distingue os registros sem modificar regras.'
   j['talentos'].append(t)
for n in range(315,398):
 for match in re.finditer(magicpattern,page(n),re.M):
  name=prose(match.group(1)).title();kind=match.group(2).lower();r=int(match.group(3));id=slug(name)
  if any(m['id']==id for m in j['magias']):id+='-'+str(n)
  m={'id':id,'nome':name,'ranque':r,'nivel':r,'tipo':kind,'truque':kind=='truque','tradicoes':[],'descricao':f'Entrada de referência. Consulte a página{n-1} no grimório: o texto integral da página está preservado, mas esta magia individual ainda aguarda revisão.','resumo':[],'fonte':F,'pagina':n-1,'revisao':'material-indexado','somenteConsulta':True,'secoes':[f'pc1-pdf-{n}']}
  j['magias'].append(m)
j['lacunas']=['Texto de todas as470 páginas extraído para consulta, sem revisão integral de ordem de leitura/tabelas/símbolos.','Talentos/magias identificados como material indexado são somente consulta; não são selecionáveis nem têm efeitos/pré-requisitos inferidos. Só entradas revisadas individualmente entram na criação guiada.','Escolhas de divindade, grupo de armas, tese e conhecimentos Saber precisam de validação específica, não inferência pelo nome.']
# Revisões individuais: texto de regra e resumo de decisão escritos separadamente.
def review_feat(id,desc,summary,requirements='',**extra):
 t=next(t for t in j['talentos'] if t['id']==id)
 t.update({'descricao':desc,'resumo':[summary],'requisitos':requirements,'revisao':'revisado','somenteConsulta':False,**extra})
review_feat('guerreiro-investida-subita','[2 ações], floreio. Ande duas vezes; se terminar com um inimigo ao alcance, faça um Golpe corpo a corpo. Pode substituir Andar por Escalar, Escavar, Nadar ou Voar quando tiver a Velocidade correspondente. Só uma ação de floreio por rodada.','Avança duas vezes e ataca com duas ações. Exige alcançar um inimigo e respeita o limite de floreio.')
review_feat('guerreiro-golpe-feroz','[2 ações], floreio. Faça um Golpe corpo a corpo; conta como dois ataques para penalidade por ataques múltiplos. Se acertar, adiciona um dado de dano da arma, dois no10º nível e três no18º.','Um ataque forte de duas ações; dado extra no acerto, mas aumenta a penalidade como dois ataques.')
review_feat('guerreiro-ataque-fisgador','[1 ação]. Precisa de mão livre e alvo ao alcance dessa mão. Faça um Golpe mantendo-a livre; se acertar, alvo fica desprevenido até início do seu próximo turno ou até sair desse alcance.','Um Golpe que deixa o alvo desprevenido; precisa de mão livre e manter o inimigo próximo.')
review_feat('guerreiro-afericao-de-combate','[1 ação]. Faça um Golpe corpo a corpo. Se acertar, tente imediatamente Recordar Conhecimento sobre o alvo; crítico dá+2 de circunstância nesse teste. O alvo fica imune a Aferição de Combate por1dia.','Ataca e, no acerto, permite conhecer o inimigo; funciona uma vez por dia por alvo.')
review_feat('guerreiro-corte-duplo','[2 ações]. Precisa empunhar duas armas corpo a corpo, uma por mão. Faça dois Golpes no mesmo alvo usando a penalidade por ataques múltiplos atual; segundo Golpe sofre−2 se sua arma não for ágil. Se ambos acertarem, some danos antes de resistências/fraquezas, adicione precisão apenas uma vez e aplique os demais efeitos de ambas as armas. Conta como dois ataques para ataques seguintes.','Dois Golpes na mesma penalidade atual; a segunda arma não ágil sofre−2. Dano combinado evita aplicar resistência duas vezes.')
review_feat('guerreiro-escudo-reativo','[reação]. Quando inimigo atingir você com Golpe corpo a corpo e estiver empunhando escudo, imediatamente Erga o Escudo. Seu bônus de circunstância de CA já vale para determinar o resultado do ataque acionador.','Ergue o escudo como reação a um acerto e pode fazer esse ataque errar. Não é Bloqueio com Escudo.')
review_feat('guerreiro-golpe-de-exatidao','[1 ação], pressão. Faça um Golpe; se falhar, esse ataque não conta para sua penalidade por ataques múltiplos. Pressão só pode ser usada enquanto houver penalidade por ataques múltiplos.','Um ataque sequencial que não agrava a penalidade se falhar; exige estar sob penalidade de ataques múltiplos.')
review_feat('guerreiro-postura-de-queima-roupa','[1 ação], postura. Precisa empunhar arma à distância. Na postura, ignora penalidade de voleio; arma sem voleio recebe+2 de circunstância no dano contra alvo dentro do primeiro incremento. Postura termina ao perder requerimento, ficar nocauteado, encontro acabar ou assumir outra postura.','Favorece tiros próximos: elimina voleio ou aumenta dano de armas sem voleio.')
review_feat('guerreiro-aparagem-de-duelo','[1 ação]. Precisa empunhar uma arma corpo a corpo de uma mão e não segurar mais nada. Recebe+2 de circunstância na CA até início do próximo turno, enquanto mantiver os requerimentos.','Defesa com arma de uma mão e outra mão livre; custa uma ação e dura até próximo turno.')
review_feat('guerreiro-atracar-em-combate','[1 ação], pressão. Precisa mão livre e alvo ao alcance dessa mão. Faça um Golpe corpo a corpo mantendo a mão livre; acerto agarra o alvo até fim do próximo turno ou até Escapar. Pressão exige já estar sob penalidade por ataques múltiplos.','Um ataque sequencial que também agarra no acerto; usa uma mão livre.')
review_feat('guerreiro-golpe-intimidante','[2 ações], emoção/medo/mental. Faça um Golpe corpo a corpo. Se acertar e causar dano, alvo fica assustado1, ou2 no crítico.','Fere e assusta com um único ataque de duas ações; precisa causar dano.')
review_feat('guerreiro-estocada','[1 ação]. Precisa empunhar arma corpo a corpo. Faça um Golpe com alcance+1,5m só para este ataque. Se arma tem derrubar, desarmar ou empurrar, pode fazer a manobra correspondente em vez do Golpe.','Alcança mais longe em um ataque ou manobra permitida pelo traço da arma.')
review_feat('ladino-esquiva-agil','[reação]. Quando criatura visível visar você com ataque, desde que não esteja sobrecarregado, recebe+2 de circunstância na CA contra aquele ataque.','Reação defensiva contra um ataque visível; não funciona sobrecarregado.')
review_feat('ladino-finta-dupla','[2 ações]. Precisa duas armas corpo a corpo, uma em cada mão. Faça dois Golpes no mesmo alvo, um por arma; alvo fica desprevenido contra o segundo. Aplique a penalidade por ataques múltiplos normalmente a cada Golpe.','Duas armas permitem deixar o alvo desprevenido para o segundo ataque; a penalidade aumenta normalmente.')
review_feat('patrulheiro-abate-duplo','[1 ação], floreio. Precisa empunhar duas armas corpo a corpo, uma em cada mão. Faça dois Golpes na presa caçada; aplique penalidade por ataques múltiplos normalmente. Se ambos acertarem a mesma presa, some danos antes de resistências/fraquezas.','Dois ataques na presa por uma ação; penalidade normal, dano combinado se ambos acertarem.')
review_feat('patrulheiro-cacador-de-monstros','Como parte de Caçar Presa, pode Recordar Conhecimento sobre ela. Crítico ao identificá-la concede a você e aliados informados+1 de circunstância no próximo ataque contra essa presa. Só concede esse bônus uma vez por dia por criatura.','Permite identificar a presa durante a caçada; crítico dá bônus ao próximo ataque do grupo.')
review_feat('mago-ampliar-magia','[1 ação], concentração/moldamagia. Se próxima ação for Conjurar uma Magia sem duração com área explosão, cone ou linha, aumente a área: raio de explosão3m ou mais ganha1,5m; explosões menores não mudam. Cone/linha até4,5m ganha1,5m; maior ganha3m.','Aumenta área da próxima magia instantânea de explosão, cone ou linha; não altera explosões pequenas.')
review_feat('mago-estender-magia','[1 ação], concentração/moldamagia. Se próxima ação for Conjurar uma Magia com distância, aumente-a em9m; toque passa a9m.','Uma ação extra para aumentar a distância da próxima magia; toque passa a9m.')
review_feat('mago-familiar','Faz pacto com uma criatura que o auxilia na conjuração; recebe um familiar conforme regras da página212. Familiar não é companheiro animal e usa as capacidades próprias de familiar.','Recebe familiar; escolha suas habilidades pelas regras de familiares.')
review_feat('anao-correr-nas-rochas','Ignora terreno difícil de pedras e solo irregular de pedra/terra. Ao Equilibrar-se em superfícies estreitas ou solo irregular desses materiais, não fica desprevenido e sucesso vira crítico. Não tem pré-requisito Correr nas Rochas.','Move-se com segurança sobre terreno pedregoso e melhora Equilibrar-se nesses materiais.')
review_feat('anao-ferro-desimpedido','Ignora redução de Velocidade de armaduras. Outras penalidades de Velocidade são reduzidas em1,5m; por exemplo, sobrecarregado passa de−3m para−1,5m.','Armadura não reduz seu movimento; também suaviza outras penalidades de Velocidade.')
review_feat('elfo-elfo-ligeiro','Sua Velocidade aumenta em1,5m.','Aumenta permanentemente sua Velocidade em1,5m.',efeitos=[{'alvo':'deslocamento','tipo':'sem-tipo','valor':1.5}])
review_feat('elfo-abandonado','Recebe+1 de circunstância em salvamentos contra emoção. Sucesso em salvamento contra efeito com traço emoção torna-se crítico.','Mais resistência a efeitos de emoção e melhora sucessos para críticos.')
review_feat('gnomo-cumplice-animal','Recebe familiar conforme regras da página212. Pode escolher tipo de animal; muitos gnomos escolhem animais escavadores.','Um familiar animal com habilidades de familiar; não concede companheiro de combate.')
review_feat('gnomo-companheiro-das-fadas','Recebe+2 de circunstância em Percepção e salvamentos contra fadas. Ao encontrar fada em situação social, pode Impressionar imediatamente sem conversar1minuto, com−5 no teste. Se falhar, pode conversar1minuto e tentar novamente.','Protege contra fadas e permite tentativa social imediata, com penalidade.')
review_feat('goblin-cavaleiro-brusco','Recebe Cavalgar mesmo sem requisitos. +1 de circunstância em Natureza para Comandar cães-goblin/lobos de montaria. Companheiro lobo ganha Montaria; se recebe companheiro com Montaria, pode escolher lobo.','Facilita cavalgar e comandar montarias tradicionais goblins.')
review_feat('halfling-cavaleiro-de-pradaria','Torna-se treinado em Natureza; se já ganharia esse treino automaticamente, escolha outra perícia. +1 de circunstância em Comandar Animal quando alvo é montaria tradicional halfling, como pônei ou cão de montaria.','Treino em Natureza e bônus para comandar montarias tradicionais.',periciasFixas=['natureza'])
review_feat('halfling-distracao-nas-sombras','Pode usar criatura pelo menos um tamanho maior como cobertura para Esconder-se e Esgueirar-se. Não concede cobertura para outras ações, como Obter Cobertura.','Pode se esconder usando criaturas maiores; não concede proteção geral de cobertura.')
review_feat('humano-ambicao-natural','Recebe um talento de classe de1º nível da própria classe e precisa atender seus pré-requisitos. Durante criação, pode escolhê-lo mais tarde quando cumprir requisitos.','Mais um talento de classe1º, além dos talentos normais; requisitos continuam válidos.',bonusTalentos=[{'tipo':'classe','nivel':1,'quantidade':1}])
review_feat('humano-treinamento-geral','Recebe um talento geral de1º nível e deve cumprir seus pré-requisitos. Durante criação, pode selecionar esse talento mais tarde para cumprir requisitos. Pode selecionar Treinamento Geral várias vezes, escolhendo um talento geral diferente a cada vez.','Mais um talento geral1º cujos pré-requisitos atende.',bonusTalentos=[{'tipo':'geral','nivel':1,'quantidade':1}])
review_feat('humano-pericia-natural','Torna-se treinado em duas perícias à escolha.','Dois treinamentos adicionais de perícia à escolha.',efeitos=[{'alvo':'treinamentos','tipo':'sem-tipo','valor':2}])
review_feat('leshy-impavido','+1 de circunstância em salvamentos contra emoção. Sucesso contra efeito com traço emoção vira crítico.','Protege de emoções e melhora sucessos para críticos.')
review_feat('leshy-disparar-sementes','Recebe ataque desarmado à distância de sementes: incremento9m, dano1d4 contundente. Crítico impõe−3m de circunstância na Velocidade do alvo até início do próximo turno. Não aplica especialização de crítico.','Ataque à distância natural; no crítico, reduz movimento do alvo temporariamente.')
review_feat('orc-ferocidade-orquica','[reação], uma vez por dia. Aciona quando seria reduzido a0PV sem morrer imediatamente. Evita nocaute e fica com1PV; aumenta ferido em1.','Permanece com1PV uma vez por dia, mas aumenta ferido.')
review_feat('orc-punhos-de-ferro','Ataques desarmados de punho perdem não letal e ganham empurrar.','Punhos tornam-se letais e podem ser usados para Empurrar.')
review_feat('orc-supersticao-orquica','[reação], concentração. Antes de rolar salvamento contra magia/efeito mágico, recebe+1 de circunstância nesse salvamento.','Uma reação para reforçar um salvamento contra magia.')
# Talentos gerais e de perícia: requisitos graduados para validação no nível de aquisição.
def skill_feat(id,skill,desc,summary):
 review_feat(id,desc,summary,'Treinado em '+skill_labels[skill],tipo='pericia',requisitosEstruturados={'pericias':{skill:1}})
review_feat('duro-de-matar','Você morre quando a condição morrendo alcançar5, em vez de4.','Aumenta de4 para5 o limite de morrendo que causa morte.')
review_feat('vitalidade','Seus PV máximos aumentam em seu nível. A CD dos seus testes de recuperação diminui em1.','Mais1PV por nível e recuperação contra a morte um pouco mais fácil.',efeitos=[{'alvo':'pv','tipo':'sem-tipo','valor':1,'porNivel':True}])
review_feat('veloz','Sua Velocidade aumenta em1,5m.','Mais1,5m de Velocidade.',efeitos=[{'alvo':'deslocamento','tipo':'sem-tipo','valor':1.5}])
review_feat('cavalgar','Ao Comandar um Animal que esteja montando para ele se mover, obtém sucesso automático. Esse animal age no seu turno como lacaio. Ao montar em encontro um animal que normalmente teria seu próprio turno, ele pula o próximo turno e passa a agir em seu próximo turno.','Movimento da montaria não exige teste para Comandar; ela passa a agir no seu turno.')
skill_feat('olhar-intimidante','intimidacao','Ao Desmoralizar, pode substituir auditivo por visual. Não sofre a penalidade por não compartilhar um idioma com o alvo.','Desmoraliza pela aparência, sem penalidade de idioma.')
skill_feat('poliglota','sociedade','Aprende dois idiomas adicionais. Devem ser comuns, incomuns a que tenha acesso ou outros permitidos pelo Mestre. Com Sociedade mestre recebe um terceiro; com lendário, um quarto. Pode escolher o talento várias vezes, aprendendo idiomas diferentes.','Aprende dois idiomas; a quantidade aumenta quando Sociedade chega a mestre ou lendário.')
skill_feat('certeza','sociedade','Escolha uma perícia em que seja pelo menos treinado. Ao fazer um teste dela, pode dispensar o dado e usar10+bônus de proficiência, ignorando todos os outros bônus, penalidades e modificadores, inclusive o atributo. Tem traço fortúnio. Pode escolher este talento várias vezes para perícias diferentes.','Troca a rolagem por10+proficiência em uma perícia escolhida; atributo e demais modificadores não entram.')
# Certeza admite qualquer perícia treinada, e não apenas Sociedade.
next(t for t in j['talentos'] if t['id']=='certeza').update(requisitos='Treinado em pelo menos uma perícia',requisitosEstruturados={},escolhaPericia=True)
skill_feat('queda-do-gato','acrobacia','Para dano de queda, trate a distância como3m menor; especialista em Acrobatismo reduz7,5m e mestre reduz15m. Lendário sempre cai em pé e não sofre dano de quedas.','Reduz dano de queda; melhora com a graduação de Acrobatismo.')
skill_feat('equilibrio-estavel','acrobacia','Ao Equilibrar-se, sucesso torna-se sucesso crítico. Não fica desprevenido por Equilibrar-se em superfície estreita ou solo irregular.','Mais segurança ao Equilibrar-se: sucesso vira crítico e o terreno não o deixa desprevenido.')
skill_feat('escalador-de-combate','atletismo','Não fica desprevenido ao Escalar. Pode Escalar com uma mão ocupada, mas ainda precisa de uma mão livre e das duas pernas.','Escala sem ficar desprevenido e pode manter uma mão ocupada.')
skill_feat('carregador-robusto','atletismo','Aumenta em2 tanto o Volume que pode carregar sem ficar sobrecarregado quanto seu Volume máximo.','Carrega2Volumes adicionais antes de ficar sobrecarregado e no limite máximo.')
skill_feat('medicina-de-combate','medicina','[1 ação], cura/manuseio. Precisa de ferramentas de curandeiro empunhadas ou vestidas. Faça teste de Medicina contra a CD de Tratar Ferimentos; pode escolher CD maior se tiver graduação suficiente. Recupera PV como Tratar Ferimentos, mas não remove ferido. Depois, o alvo fica imune à SUA Medicina de Combate por1dia. A imunidade é independente de Tratar Ferimentos.','Cura rapidamente com Medicina; exige ferramentas, não remove ferido e só funciona uma vez por dia por alvo para você.')
skill_feat('medicina-natural','natureza','Pode usar Natureza em vez de Medicina para Tratar Ferimentos e para alcançar CDs maiores dessa atividade. Isso não substitui Medicina em outras atividades ou pré-requisitos. Em ambiente natural, materiais frescos podem conceder+2 de circunstância nesse teste, a critério do Mestre.','Trata Ferimentos com Natureza; não substitui outros usos ou pré-requisitos de Medicina.')
skill_feat('estudante-do-canone','religiao','Ao Decifrar Escrita religiosa ou Recordar Conhecimento sobre princípios de uma religião, falha crítica vira falha. Ao Recordar Conhecimento sobre a própria religião, falha vira sucesso e sucesso vira crítico.','Melhora resultados sobre doutrina religiosa, especialmente sobre sua própria fé.')
skill_feat('forrageador','sobrevivencia','Ao Subsistir, resultado inferior a sucesso torna-se sucesso. Sucesso alimenta você e quatro outras criaturas; crítico dobra as criaturas adicionais. Pode reduzir essas criaturas adicionais pela metade para sustentar a todos confortavelmente. Com Sobrevivência especialista, mestre ou lendário, os adicionais no sucesso passam a8,16 ou32.','Encontra alimento com segurança para você e um grupo; a capacidade aumenta com Sobrevivência.')
for b in j['biografias']:
 if b['id']=='medico-de-campo':
  b['nomeTalentoFonte']=b['talentoNome'];b['talento']='medicina-de-combate';b['talentoNome']='Medicina de Combate';b['descricao']=b['descricao'].replace('Medicina de Batalha','Medicina de Combate');b['resumo']=[b['descricao']]
# Não expor notas de implementação como parte da regra.
t=next(t for t in j['talentos'] if t['id']=='anao-correr-nas-rochas');t['descricao']=t['descricao'].replace(' Não tem pré-requisito Correr nas Rochas.','')
# Magias iniciais: tradições, ações, efeitos e elevação conferidos nas entradas do PDF.
def review_spell(id,traditions,actions,desc,summary,**extra):
 m=next(m for m in j['magias'] if m['id']==id)
 m.update({'tradicoes':traditions,'acoes':actions,'descricao':desc,'resumo':[summary],'revisao':'revisado','somenteConsulta':False,**extra})
ALL=['arcana','divina','ocultista','primal']
review_spell('arco-eletrico',['arcana','primal'],'2','[2 ações], concentração/eletricidade/manuseio. Até duas criaturas a9m: cada uma sofre2d4 de eletricidade, Reflexos básico. Elevação(+1):+1d4 de dano.','Atinge até dois alvos com eletricidade; cada um faz Reflexos básico.')
review_spell('detectar-magia',ALL,'2','[2 ações], concentração/detecção/manuseio. Emanação9m identifica presença ou ausência de magia; pode ignorar magia conhecida, como itens e efeitos contínuos seus e dos aliados. Ilusões só são detectadas se seu ranque for menor que o deste truque, salvo itens com aura de ilusão sem aparência enganosa. Elevada3º: descobre ranque ou nível do efeito mais poderoso, ao critério do Mestre. Elevada4º: também localiza essa fonte imprecisamente em um cubo de1,5m ou maior se necessário.','Verifica presença de magia próxima; não identifica efeitos. Ranques3/4 revelam potência e uma localização imprecisa.')
review_spell('escudo-mistico',['arcana','divina','ocultista'],'1','[1 ação], concentração/força. Até início do próximo turno, conta como Erguer Escudo e concede+1 de circunstância na CA sem ocupar mão. Permite Bloqueio com Escudo com Dureza5; esse bloqueio pode reduzir dano de qualquer magia ou efeito mágico, inclusive não físico. Ao bloquear, encerra o truque e impede nova conjuração por10minutos. Elevação(+2):Dureza+5.','Uma ação para+1CA; pode bloquear dano, mas então encerra e fica indisponível10minutos.')
review_spell('estabilizar',['divina','primal'],'2','[2 ações], concentração/cura/manuseio/vitalidade. Uma criatura morrendo a9m perde a condição morrendo, mas continua inconsciente com0PV.','Estabiliza um aliado a9m; não cura PV nem desperta.')
review_spell('geladura',['arcana','primal'],'2','[2 ações], concentração/frio/manuseio. Uma criatura a18m sofre2d4 de frio, Fortitude básico. Falha crítica também causa fraqueza1 a dano contundente até início do seu próximo turno. Elevação(+1):+1d4 de dano e+1 na fraqueza.','Dano de frio com Fortitude básico; falha crítica facilita dano contundente temporariamente.')
review_spell('lanca-divina',['divina'],'2','[2 ações], ataque/concentração/espírito/manuseio/santificado. Ataque de magia à distância contra CA de uma criatura a18m. Acerto causa2d4 espiritual; crítico dobra. Elevação(+1):+1d4 de dano.','Ataque espiritual a18m; crítico dobra o dano.')
review_spell('luz',ALL,'2','[2 ações], concentração/luz/manuseio. Cria orbe a até36m, com luz forte6m e fraca nos6m seguintes, na cor escolhida. Pode anexar a criatura voluntária no mesmo espaço. Sustentar move o orbe até18m e permite anexar/desanexar. Dura até próximas preparações diárias; pode Dispensar. No máximo quatro conjurações ativas: criar quinta encerra uma anterior. Elevada4º: raios de luz forte/fraca passam a18m cada.','Iluminação móvel até próximas preparações; pode acompanhar aliado, com máximo de quatro orbes ativos.')
review_spell('mao-telecinetica',['arcana','ocultista'],'2','[2 ações], concentração/manuseio. Alvo:objeto solto sem dono segurando, Volume leve ou menor, a9m. Mão flutuante move-o até6m; Sustentar move mais6m. Se o objeto estiver no ar ao encerrar, cai. Elevada3º:Volume1;5º:Volume1 e distância18m;7º:Volume2 e distância18m.','Move objeto solto de Volume leve; precisa Sustentar para continuar, não manipula equipamento de outra criatura.')
review_spell('orientacao',['divina','ocultista','primal'],'1','[1 ação], concentração. Uma criatura a9m recebe+1 de estado em um teste de ataque, Percepção, perícia ou salvamento feito antes do início do seu próximo turno. Escolhe o teste antes de rolar. Usar bônus encerra a magia; ao encerrar de qualquer modo, alvo fica imune a Orientação por1hora.','+1 em um teste escolhido antes da rolagem; cada alvo fica imune por1hora depois.')
review_spell('prestidigitacao',ALL,'2','[2 ações], concentração/manuseio, duração sustentada, distância9m. Ao Sustentar escolhe um efeito:cozinhar(esfriar/esquentar/temperar meio quilo não vivo); criar(objeto frágil e artificial de Volume insignificante, nunca arma, ferramenta, componente ou locus); erguer(objeto solto de Volume leve até30cm do chão); tingir(colorir, limpar ou sujar objeto leve; Volume1 exige10rodadas e maiores1minuto por Volume). Não causa dano nem condições adversas. Outras alterações reais persistem apenas enquanto Sustenta.','Pequenos efeitos de cozinha, limpeza, cor ou objetos frágeis; não serve para dano, ferramentas ou componentes.')
review_spell('projetil-telecinetico',['arcana','ocultista'],'2','[2 ações], ataque/concentração/manuseio. Arremessa objeto solto não empunhado de Volume1 ou menor, dentro de9m, contra uma criatura a9m. Ataque mágico contra CA; acerto causa2d6 contundente, cortante ou perfurante conforme objeto, crítico dobra. Traços e propriedades mágicas do objeto não modificam ataque/dano. Elevação(+1):+1d6.','Ataque com objeto solto; dano depende do objeto, mas suas propriedades especiais não se aplicam.')
review_spell('armadura-mistica',ALL,'2','[2 ações], concentração/manuseio. Até próximas preparações diárias, fornece+1 de item na CA, limite de Destreza+5, usando proficiência sem armadura. Elevada4º:+1 de item em salvamentos;6º:CA+2 e salvamentos+1;8º:CA+2 e salvamentos+2;10º:CA+3 e salvamentos+3. Bônus de item não acumula com outro bônus de item.','Proteção sem armadura até próximas preparações; elevações aumentam CA e depois salvamentos.')
review_spell('curar',['divina','primal'],'1–3','[1 a3ações], cura/manuseio/vitalidade. Cura1d8PV em vivo voluntário ou causa1d8 vital em morto-vivo(Fortitude básico). Uma ação:toque. Duas ações:adiciona concentração, distância9m e+8PV na cura de vivo. Três ações:adiciona concentração, emanação9m que afeta todos os vivos e mortos-vivos. Elevação(+1):+1d8 de cura/dano e+8 na cura extra da versão de duas ações.','Escolha toque, cura reforçada a9m ou área9m; a área também atinge mortos-vivos e todos os vivos presentes.')
review_spell('medo',ALL,'2','[2 ações], concentração/emoção/medo/manuseio/mental. Uma criatura a9m faz Vontade:crítico sucesso nada; sucesso assustado1; falha assustado2; falha crítica assustado3 e fugindo por1rodada. Elevada5º:até cinco criaturas.','Impõe assustado conforme Vontade; falha crítica ainda força fuga por uma rodada.')
review_spell('golpe-certeiro',['arcana','ocultista'],'1','[1 ação], concentração/fortúnio. Até fim do turno, no próximo ataque role duas vezes e use resultado melhor. O ataque ignora penalidades de circunstância na jogada e qualquer teste simples por alvo ocultado ou escondido. Após usar, você fica imune a Golpe Certeiro por10minutos.','Melhora o próximo ataque deste turno; ignora penalidades de circunstância e testes simples de ocultação/esconderijo, depois impõe imunidade por10minutos.')
review_spell('antifona-da-coragem',['ocultista'],'1','[1 ação], incomum/bardo/composição/concentração/emoção/mental. Por1rodada, você e aliados em emanação18m recebem+1 de estado nos ataques, dano e salvamentos contra medo. Usa regras de composição:apenas uma composição por turno e só uma composição ativa.','Inspira aliados próximos com+1 nos ataques, dano e defesas contra medo durante uma rodada.',classe='bardo',acesso='Concedida pela classe bardo')
# Tabelas conferidas manualmente (PDF274,278,279,282): não há inferência por posição de texto.
armorrows=[
('Sem armadura','sem',0,None,0,0,0,0,0,0,[]),
('Roupa de explorador','sem',0,5,0,0,0,.1,'L',0,['confortavel']),
('Armadura acolchoada','leve',1,3,0,0,0,.2,'L',0,['confortavel']),
('Couro','leve',1,4,-1,0,0,2,1,0,[]),
('Couro batido','leve',2,3,-1,0,1,3,1,0,[]),
('Camisão de malha','leve',2,3,-1,0,1,5,1,0,['barulhenta','flexivel']),
('Gibão de peles','media',3,2,-2,-1.5,2,2,2,0,[]),
('Cota de escamas','media',3,2,-2,-1.5,2,4,2,0,[]),
('Cota de malha','media',4,1,-2,-1.5,3,6,2,0,['barulhenta','flexivel']),
('Placa peitoral','media',4,1,-2,-1.5,3,8,2,0,[]),
('Cota de talas','pesada',5,1,-3,-3,3,13,3,1,[]),
('Meia armadura','pesada',5,1,-3,-3,3,18,3,1,[]),
('Armadura completa','pesada',6,0,-3,-3,4,30,4,2,['baluarte'])]
for name,grade,ca,dex,pen,speed,force,price,bulk,level,traits in armorrows:
 desc=f'Bônus de item à CA+{ca}; '+('sem limite de Destreza' if dex is None else f'limite de Destreza+{dex}')+f'; penalidade de teste{pen}; penalidade de Velocidade{speed}m; Força{force}; preço{price}po; Volume{bulk}. '
 if grade!='sem':desc+='Atingir a Força remove a penalidade de testes(exceto Furtividade de armadura barulhenta) e reduz em1,5m a penalidade de Velocidade. '
 if 'barulhenta' in traits:desc+='Barulhenta:a penalidade de Furtividade permanece mesmo atingindo a Força. '
 if 'flexivel' in traits:desc+='Flexível:não impõe a penalidade de teste em Acrobatismo ou Atletismo. '
 if 'baluarte' in traits:desc+='Baluarte:contra efeitos que causam dano, usa+3 em vez de Destreza nos salvamentos de Reflexos; não se aplica aos demais Reflexos. '
 if 'confortavel' in traits:desc+='Confortável:pode descansar normalmente vestindo-a. '
 j['equipamentos'].append({'id':slug(name),'nome':name,'tipo':'armadura','grau':grade,'ca':ca,'limiteDes':dex,'penalidade':pen,'penalidadeDeslocamento':speed,'forca':force,'preco':price,'moeda':'po','volume':bulk,'nivel':level,'tracos':traits,'descricao':desc.strip(),'resumo':[f'CA+{ca}; '+('Destreza sem limite' if dex is None else f'Destreza até+{dex}')+f'; Força{force}; {price}po.'],'fonte':F,'pagina':273,'secoes':['pc1-pdf-274'],'revisao':'revisado','somenteConsulta':False})
# nome, categoria, dado, tipo de dano, preço PO, Volume, mãos, grupo, traços
weaponrows=[
('Punho','desarmados','1d4','contundente',0,0,1,'pugilato',['acuidade','agil','desarmado','nao-letal']),
('Adaga','simples','1d4','perfurante',.2,'L',1,'faca',['acuidade','agil','arremesso-3m','versatil-cortante']),
('Cajado','simples','1d4','contundente',0,1,1,'clava',['duas-maos-d8','monge']),
('Clava','simples','1d6','contundente',0,1,1,'clava',['arremesso-3m']),
('Foice','simples','1d4','cortante',.2,'L',1,'faca',['acuidade','agil','derrubar']),
('Lança','simples','1d6','perfurante',.1,1,1,'lanca',['arremesso-6m','monge']),
('Lança longa','simples','1d8','perfurante',.5,2,2,'lanca',['alcance']),
('Maça','simples','1d6','contundente',1,1,1,'clava',['empurrar']),
('Maça leve','simples','1d4','contundente',.4,'L',1,'clava',['acuidade','agil','empurrar']),
('Maça-estrela','simples','1d6','contundente',1,1,1,'clava',['versatil-perfurante']),
('Manopla','simples','1d4','contundente',.2,'L',1,'pugilato',['agil','mao-livre']),
('Manopla com cravos','simples','1d4','perfurante',.3,'L',1,'pugilato',['agil','mao-livre']),
('Espada curta','marciais','1d6','perfurante',.9,'L',1,'espada',['acuidade','agil','versatil-cortante']),
('Espada longa','marciais','1d8','cortante',1,1,1,'espada',['versatil-perfurante']),
('Montante','marciais','1d12','cortante',2,2,2,'espada',['versatil-perfurante']),
('Rapieira','marciais','1d6','perfurante',2,1,1,'espada',['acuidade','desarmar','mortal-d8']),
('Machado de batalha','marciais','1d8','cortante',1,1,1,'machado',['amplitude']),
('Machadinha','marciais','1d6','cortante',.4,'L',1,'machado',['agil','amplitude','arremesso-3m']),
('Alabarda','marciais','1d10','perfurante',2,2,2,'haste',['alcance','versatil-cortante']),
('Bisarma','marciais','1d10','cortante',2,2,2,'haste',['alcance','derrubar']),
('Chicote','marciais','1d4','cortante',.1,1,1,'mangual',['acuidade','alcance','derrubar','desarmar','nao-letal']),
('Espada bastarda','marciais','1d8','cortante',4,1,1,'espada',['duas-maos-d12']),
('Malho','marciais','1d12','contundente',3,2,2,'martelo',['empurrar']),
('Mangual','marciais','1d6','contundente',.8,1,1,'mangual',['amplitude','derrubar','desarmar']),
('Martelo de guerra','marciais','1d8','contundente',1,1,1,'martelo',['empurrar']),
('Picareta','marciais','1d6','perfurante',.7,1,1,'picareta',['fatal-d10']),
('Tridente','marciais','1d8','perfurante',1,1,1,'lanca',['arremesso-6m'])]
for name,grade,die,damage,price,bulk,hands,group,traits in weaponrows:
 n=278 if grade in ['simples','desarmados'] else 279
 desc=f'{die} de dano {damage}; {hands}mão(s); Volume{bulk}; grupo{group}; preço{price}po. Traços:'+(', '.join(traits) if traits else 'nenhum')+'. Os traços e especializações de crítico estão nas páginas282–285; o dado não inclui Força, runas ou outros bônus.'
 j['equipamentos'].append({'id':slug(name),'nome':name,'tipo':'arma','grau':grade,'dano':die,'tipoDano':damage,'preco':price,'moeda':'po','volume':bulk,'maos':hands,'grupo':group,'tracos':traits,'nivel':0,'descricao':desc,'resumo':[f'{die} {damage}; {hands}mão(s); {price}po.'],'fonte':F,'pagina':n-1,'secoes':[f'pc1-pdf-{n}','pc1-pdf-283','pc1-pdf-284','pc1-pdf-285','pc1-pdf-286'],'revisao':'revisado','somenteConsulta':False})
for name,grade,die,damage,price,bulk,hands,group,traits,distance,reload,level in [
('Arco curto','marciais','1d6','perfurante',3,1,'1+','arco',['mortal-d10'],18,0,0),
('Arco longo','marciais','1d8','perfurante',6,2,'1+','arco',['mortal-d10','voleio-9m'],30,0,0),
('Arco curto composto','marciais','1d6','perfurante',14,1,'1+','arco',['mortal-d10','propulsivo'],18,0,1),
('Arco longo composto','marciais','1d8','perfurante',20,2,'1+','arco',['mortal-d10','propulsivo','voleio-9m'],30,0,1),
('Besta leve','simples','1d8','perfurante',3,1,2,'besta',[],36,1,0),
('Besta de mão','simples','1d6','perfurante',3,'L',1,'besta',[],18,1,0),
('Besta pesada','simples','1d8','perfurante',4,2,2,'besta',[],36,2,0),
('Funda','simples','1d6','contundente',.01,'L',1,'funda',['propulsiva'],15,1,0)]:
 desc=f'{die} de dano {damage}; incremento{distance}m; recarga{reload}ação(ões); {hands}mão(s); Volume{bulk}; preço{price}po. '+('Mãos1+:uma mão empunha o arco e a outra deve estar livre para disparar. ' if hands=='1+' else '')+'Traços:'+(', '.join(traits) if traits else 'nenhum')+'. Dano não inclui modificadores. Munição é comprada separadamente e destruída ao usar; veja descrição dos traços no grimório.'
 j['equipamentos'].append({'id':slug(name),'nome':name,'tipo':'arma','grau':grade,'dano':die,'tipoDano':damage,'distancia':distance,'recarga':reload,'preco':price,'moeda':'po','volume':bulk,'maos':hands,'grupo':group,'tracos':traits,'nivel':level,'descricao':desc,'resumo':[f'{die} {damage}; incremento{distance}m; recarga{reload}; {price}po.'],'fonte':F,'pagina':281,'secoes':['pc1-pdf-282','pc1-pdf-283','pc1-pdf-284','pc1-pdf-285','pc1-pdf-286'],'revisao':'revisado','somenteConsulta':False})
# Escolha oficial de Humano Perito: a mesma perícia progride automaticamente no5º.
h=next(h for a in j['ancestralidades'] for h in a['herancas'] if h['id']=='humano-perito')
h['periciasEscolha']=list(skill_labels)
h['graduacaoPericia']=[{'nivel':1,'grau':1},{'nivel':5,'grau':2}]
for name,ca,price,bulk,hard,pv,breakpoint,speed in [
('Broquel',1,1,'L',3,6,3,0),('Escudo de madeira',2,1,1,3,12,6,0),('Escudo de aço',2,2,1,5,20,10,0),('Escudo de corpo',2,10,4,5,20,10,-1.5)]:
 desc=f'Erguer Escudo(1ação) concede+{ca} de circunstância na CA até início do próximo turno. Dureza{hard}; PV{pv}; Limiar de Quebra{breakpoint}; Volume{bulk}; preço{price}po. Bloqueio com Escudo exige acesso à reação:reduz dano pela Dureza, e você e escudo recebem todo o restante. Escudo quebrado não pode ser usado e escudo com0PV é destruído. '
 if name=='Broquel':desc+='Preso ao antebraço; pode Erguer com mão livre ou segurando objeto leve não arma ao critério do Mestre.'
 elif name=='Escudo de corpo':desc+='Penalidade de Velocidade−1,5m sempre que segurado. Obter Cobertura enquanto erguido aumenta bônus de circunstância de CA para+4, sujeito à duração normal da cobertura.'
 else:desc+='Ocupa uma mão para usar.'
 e={'id':slug(name),'nome':name,'tipo':'escudo','ca':ca,'preco':price,'moeda':'po','volume':bulk,'dureza':hard,'pv':pv,'limiarQuebra':breakpoint,'penalidadeDeslocamento':speed,'nivel':0,'descricao':desc,'resumo':[f'Erguido:CA+{ca}; Dureza{hard}; PV{pv}; quebra em{breakpoint}; {price}po.'],'fonte':F,'pagina':274,'secoes':['pc1-pdf-275'],'revisao':'revisado','somenteConsulta':False}
 if name=='Escudo de corpo':e['caCobertura']=4
 j['equipamentos'].append(e)
# Dano de especialização de armas: por graduação, nunca uma soma global fixa.
for c in j['classes']:
 martial=c['id'] in ['guerreiro','ladino','patrulheiro']
 c['especializacaoArma']=[{'nivel':7 if martial else 13,'porGrau':{'2':2,'3':3,'4':4}}]
 if martial:c['especializacaoArma'].append({'nivel':15,'porGrau':{'2':4,'3':6,'4':8}})
 c['automatico']=True
 for r in c['progressao']:
  r['automatico']=True
  # Todas essas escolhas usam os campos estruturados e o guia, não o texto da tabela.
  r['escolhas']=[]
  for typ,levels in c['niveisTalentos'].items():
   if r['nivel'] in levels:r['escolhas'].append({'tipo':'talento','categoria':typ,'quantidade':1})
  if r['nivel'] in [5,10,15,20]:r['escolhas'].append({'tipo':'incrementoAtributo','quantidade':4,'distintos':True})
  if r['nivel'] in c['niveisIncrementosPericia']:r['escolhas'].append({'tipo':'incrementoPericia','quantidade':1})
  if c.get('conjuracao'):r['conjuracao']=next(x for x in c['conjuracao']['espacosPorNivel'] if x['nivel']==r['nivel'])
ladino=next(c for c in j['classes'] if c['id']=='ladino')
ladino['ataqueFurtivo']=[{'nivel':1,'dano':'1d6'},{'nivel':5,'dano':'2d6'},{'nivel':11,'dano':'3d6'},{'nivel':17,'dano':'4d6'}]
groups=['arco','besta','bomba','clava','dardo','escudo','espada','faca','funda','haste','lanca','machado','mangual','martelo','picareta','pugilato']
c=next(c for c in j['classes'] if c['id']=='guerreiro')
c['escolhasExtras']=[{'id':'grupoArma','nome':'Grupo de armas preferido','nivel':5,'opcoes':groups}]
c['proficienciasGruposArma']=[{'nivel':5,'escolha':'grupoArma','simples':3,'marciais':3,'avancadas':2,'desarmados':3},{'nivel':13,'escolha':'grupoArma','simples':4,'marciais':4,'avancadas':3,'desarmados':4}]
c['efeitos']=[{'alvo':'iniciativa:percepcao','tipo':'circunstancia','valor':2,'nivel':7}]
# Talentos de2ºnível: revisão individual da entrada nativa, inclusive continuação de página.
review_feat('bardo-abertura-edificante','Recebe o truque de composição Abertura Edificante. Sua execução auxilia as perícias de aliados segundo as regras da magia.','Recebe composição que ajuda um teste de perícia de aliado; exige musa Maestro.','Musa maestro',requisitosEstruturados={'opcoesClasse':['maestro']},magiasConcedidas=[{'id':'abertura-edificante','nome':'Abertura Edificante','tipo':'truque','graduacao':1}])
review_feat('bardo-cancao-de-forca','Recebe o truque de composição Canção de Força para inspirar tarefas físicas dos aliados.','Recebe composição voltada à força física; exige musa Combatente.','Musa combatente',requisitosEstruturados={'opcoesClasse':['combatente']},magiasConcedidas=[{'id':'cancao-de-forca','nome':'Canção de Força','tipo':'truque','graduacao':1}])
review_feat('bardo-expansao-de-truque-magico','Adicione dois truques da lista ocultista de bardo ao repertório.','Mais dois truques conhecidos da própria tradição.',conjuracao={'truquesExtras':2})
review_feat('bruxo-expansao-de-truque-magico','Você pode preparar dois truques mágicos adicionais por dia.','Mais dois truques preparados diariamente.',conjuracao={'truquesExtras':2})
review_feat('bruxo-familiar-melhorado','Pode escolher quatro habilidades de familiar ou de mestre por dia, em vez de duas. Elas são adicionais às habilidades extras recebidas pela classe bruxo.','Familiar recebe duas habilidades diárias adicionais, além dos extras de bruxo.','Um familiar',requisitosEstruturados={'capacidades':['familiar']},familiar={'habilidadesExtras':2})
review_feat('bruxo-idioma-de-familiar','Pode fazer perguntas, receber respostas e usar Diplomacia com animais da mesma família do familiar: um familiar gato permite falar com felinos, por exemplo. Isso não os torna mais amigáveis. Se o familiar mudar para criatura diferente, perde o uso desta habilidade por uma semana até aprender seu novo idioma. Tem o traço da sua tradição mágica.','Comunica-se com animais da família do familiar, sem torná-los amigos; trocar o tipo de familiar suspende o benefício por uma semana.','Um familiar',requisitosEstruturados={'capacidades':['familiar']})
conceal='[1 ação], concentração/moldamagia. Se sua próxima ação for Conjurar uma Magia, ela ganha sutil: oculta gestos, palavras e manifestações da conjuração. Não esconde os efeitos da magia, como um raio disparado ou seu desaparecimento.'
review_feat('bruxo-ocultar-magia',conceal,'Uma ação para tornar a próxima conjuração sutil; os efeitos continuam perceptíveis.')
review_feat('clerigo-armadura-do-capelao-da-guerra','Torna-se treinado em armaduras pesadas. Quando característica de classe aumentar proficiência de armaduras médias para especialista ou melhor, pesadas recebem a mesma graduação. Armadura vestida de Volume2 ou mais ocupa um Volume a menos, mínimo1.','Treina armadura pesada e acompanha a progressão da média; reduz Volume de armadura robusta vestida.','Doutrina do capelão da guerra',requisitosEstruturados={'opcoesClasse':['capelao-guerra']},proficiencias={'armaduras':{'pesada':1}},armaduraAcompanha='media',volumeArmaduraReducao=1)
review_feat('clerigo-cura-comunal','Quando conjura Curar para curar uma única criatura, escolha outra criatura viva voluntária dentro da distância da magia. A segunda recupera PV iguais ao ranque de Curar usado.','Curar um único alvo também cura outro vivo voluntário na distância, em PV iguais ao ranque; não vale para versão em área.')
review_feat('clerigo-expansao-de-truque-magico','Pode preparar dois truques adicionais por dia.','Mais dois truques preparados diariamente.',conjuracao={'truquesExtras':2})
review_feat('druida-chamado-dos-ermos','Pode comungar com a natureza por10minutos para substituir uma magia preparada em um espaço de druida por Convocar Animal ou Convocar Planta ou Fungo do mesmo ranque.','Troca uma magia preparada por convocação natural do mesmo ranque em10minutos.')
review_feat('druida-explorador-de-ordens','Escolha outra ordem druídica. Recebe um talento de1ºnível que exija essa ordem e é considerado membro para pré-requisitos de talentos. Não ganha os demais benefícios de entrar na ordem. Se violar os anátemas dela, perde talentos e habilidades dessa ordem, mantendo os outros. Pode selecionar várias vezes, escolhendo ordem diferente a cada vez.','Acessa talentos de outra ordem e ganha um talento inicial dela; assume seus anátemas sem receber os demais benefícios da ordem.',repetivel=True,escolhaOrdem=['animais','folha','indomavel','tempestade'])
review_feat('druida-resistencia-a-veneno','Recebe resistência a veneno igual à metade do nível e+1 de estado em salvamentos contra venenos. Valores fracionados são arredondados para baixo pela regra geral.','Resiste a veneno pela metade do nível e melhora salvamentos contra venenos em+1.',resistencias=[{'tipo':'veneno','metadeNivel':True}],efeitosCondicionais=[{'alvo':'salvaguarda','condicao':'veneno','tipo':'estado','valor':1}])
review_feat('ladino-braco-forte','Ao Golpear com arma de arremesso, o incremento de distância aumenta em3m.','Armas arremessadas alcançam incrementos3m maiores.',incrementoArremesso=3)
review_feat('ladino-mobilidade','Ao Andar até metade de sua Velocidade, esse movimento não aciona reações. Pode usar o benefício ao Escalar, Nadar ou Voar se possuir a respectiva Velocidade.','Movimento de até metade da Velocidade evita reações; vale para outras formas de movimento que possuir.')
draw='[1 ação]. Interaja para sacar uma arma e faça um Golpe com ela como parte da mesma ação.'
review_feat('ladino-saque-rapido',draw,'Saca uma arma e ataca com ela usando uma única ação.')
review_feat('mago-expansao-de-truque-magico','Pode preparar dois truques adicionais por dia.','Mais dois truques preparados diariamente.',conjuracao={'truquesExtras':2})
review_feat('mago-magia-nao-letal','[1 ação], manuseio/moldamagia. Se sua próxima ação for Conjurar uma Magia que causa dano sem traços eversão ou morte, ela ganha não letal.','Uma ação transforma a próxima magia de dano em não letal, exceto magias de morte ou eversão.')
review_feat('mago-ocultar-magia',conceal,'Uma ação torna a próxima conjuração sutil; seus efeitos continuam perceptíveis.')
review_feat('patrulheiro-empatia-com-animais','Pode usar Diplomacia para Impressionar animais e fazer Pedidos muito simples. Em geral, animais selvagens ao menos prestam atenção; isso não altera automaticamente a atitude ou garante aceitação.','Permite interações diplomáticas simples com animais, sem garantir obediência.')
review_feat('patrulheiro-mira-do-cacador','[2 ações], concentração. Faça um Golpe à distância com arma contra a presa caçada. Neste ataque,+2 de circunstância no teste; ignora ocultado e cobertura menor.','Tiro cuidadoso na presa:+2 no ataque, ignorando ocultação e cobertura menor.')
review_feat('patrulheiro-saque-rapido',draw,'Saca uma arma e ataca com ela com uma única ação.')
# Aplicações nativas de combate das magias já revisadas neste compiler.
heal=next(m for m in j['magias'] if m['id']=='curar')
heal['efeitoCombate']={'tipo':'cura','ranqueBase':1,'formulaBase':'1d8','tipoCura':'vitalidade','ampliacao':{'intervalo':1,'formula':'1d8'},'variantes':{'1':{'formulaBase':'1d8','ampliacao':{'intervalo':1,'formula':'1d8'}},'2':{'formulaBase':'1d8+8','ampliacao':{'intervalo':1,'formula':'1d8+8'}}},'restricao':'Somente cura de uma criatura viva voluntária. Cura/dano de área ou dano em mortos-vivos exigem escolha de alvos e resolução própria.'}
# Overlay revisado por agente de concessões: mescla campos sem perder referências ou dados anteriores.
overlay=ROOT/'docs/pathfinder/player-core-1/magias-concedidas-automatizacao.json'
if overlay.exists():
 for r in json.loads(overlay.read_text()).get('magias',[]):
  current=next((m for m in j['magias'] if m['id']==r['id']),None)
  if current is None:j['magias'].append(r)
  else:current.update(r)


# Capacidades vêm de fontes explícitas; nunca do texto ou do nome de uma escolha.
next(c for c in j['classes'] if c['id']=='bruxo')['capacidades']=['familiar']
next(o for c in j['classes'] if c['id']=='druida' for o in c['opcoes'] if o['id']=='folha')['capacidades']=['familiar']
next(o for c in j['classes'] if c['id']=='mago' for o in c['teses'] if o['id']=='familiar-aprimorado')['capacidades']=['familiar']
for id in ['mago-familiar','gnomo-cumplice-animal']:
 next(t for t in j['talentos'] if t['id']==id)['capacidades']=['familiar']
for hid,ids in [('orc-belico',['olhar-intimidante']),('orc-sarjado',['duro-de-matar']),('orc-profundezas',['escalador-de-combate'])]:
 next(h for a in j['ancestralidades'] for h in a['herancas'] if h['id']==hid)['talentosConcedidos']=ids
next(t for t in j['talentos'] if t['id']=='goblin-cavaleiro-brusco')['talentosConcedidos']=['cavalgar']

# Opções mínimas revisadas de currículo: cada escola tem um truque e duas magias1º.
review_spell('mensagem',['arcana','divina','ocultista'],'1','[1 ação], auditivo/concentração/ilusão/linguístico/mental/sutil. Uma criatura a36m ouve suas palavras como se estivesse próxima; outros ouvem só um sussurro indistinto. O alvo pode responder brevemente com reação ou ação livre no próximo turno, desde que veja você e esteja na distância. A resposta chega diretamente aos seus ouvidos. Elevada3º:distância150m.','Comunicação discreta a36m; resposta exige que o alvo veja você e esteja na distância.')
review_spell('garra-retalhadora',['arcana','primal'],'2','[2 ações], ataque/concentração/manuseio/morfia. Ataque mágico corpo a corpo por toque contra CA. Acerto:2d6 cortante ou perfurante, à escolha, mais2 de sangramento persistente. Crítico dobra ambos. Elevação(+1):+1d6 no dano inicial e+1 no sangramento persistente.','Ataque mágico de toque que causa dano e sangramento persistente; crítico dobra os dois.')
review_spell('ferrao-de-aranha',['arcana','primal'],'2','[2 ações], concentração/manuseio/veneno. Toque em uma criatura:causa1d4 perfurante e aplica peçonha de aranha, com Fortitude. Crítico sucesso:não afetado; sucesso:1d4 veneno; falha:peçonha estágio1; falha crítica:estágio2. Peçonha nível1, duração máxima4rodadas. Estágio1:1d4 veneno e enfraquecido1 por1rodada; estágio2:1d4 veneno e enfraquecido2 por1rodada. Novos testes e alteração dos estágios seguem regras de aflições.','Um toque causa dano perfurante e ameaça envenenar; o veneno causa dano e enfraquecido, com duração máxima de quatro rodadas.')
review_spell('salto',['arcana','primal'],'1','[1 ação], manuseio/movimento. Salta9m em qualquer direção sem tocar o chão. Precisa aterrissar em chão sólido a até9m; caso contrário, cai depois de usar sua próxima ação. Elevada3º:toque em uma criatura, duração1minuto; o alvo pode realizar o salto descrito a cada ação Pular.','Um salto de9m; precisa aterrissar em chão sólido. No3ºranque, concede saltos assim por um minuto ao alvo tocado.')
review_spell('agredir-com-detritos',['arcana','primal'],'2','[2 ações], concentração/manuseio/terra. Cone4,5m; cada criatura faz Reflexos. Crítico sucesso:nada; sucesso:metade de2d4 contundente; falha:dano completo e empurrada1,5m para longe; falha crítica:dano dobrado e empurrada3m. Elevação(+1):+2d4 de dano.','Cone curto de pedras:Reflexos determina dano e empurrão; falhas também afastam o alvo.',efeitoCombate={'tipo':'dano','ranqueBase':1,'formulaBase':'2d4','tipoDano':'contundente','salvamentoBasico':True,'ampliacao':{'intervalo':1,'formula':'2d4'},'restricao':'Empurrão de1,5m/3m em falha/falha crítica deve ser aplicado conforme espaço e movimento forçado.'})
review_spell('empurrao-hidraulico',['arcana','primal'],'2','[2 ações], água/ataque/concentração/manuseio. Ataque mágico à distância contra uma criatura ou objeto não empunhado a18m. Acerto:3d6 contundente e empurrão1,5m para trás. Crítico:6d6 contundente e empurrão3m. Elevação(+1):+2d6 no dano normal; crítico dobra o dano elevado.','Jato a18m ataca a CA, causa dano contundente e empurra; crítico dobra dano e distância do empurrão.',efeitoCombate={'tipo':'dano','ranqueBase':1,'formulaBase':'3d6','tipoDano':'contundente','ampliacao':{'intervalo':1,'formula':'2d6'},'restricao':'Golpe mágico contra CA; empurrão1,5m/3m conforme acerto/crítico.'})

# Currículos são listas de referência exatas; não concedem automaticamente magias à escolha.
CURRICULA={
'ars-grammatica':['mensagem,sigilo','arma rúnica,comandar,corpo rúnico,disfarçar magia','dissipar magia,traduzir','subjugar,véu de privacidade','globo dissipador,sugestão','enviar mensagem,fala verdadeira','arruinar magia,repulsão','contingência,selo planar','observação inexorável,perplexidade','detonar magia'],
'forma-proteana':['garra dilacerante,vinha enredante','forma de peste,ferrão de aranha,salto','aumentar,forma de humanoide','banquete vampírico,pés a nadadeiras','forma de vapor,resiliência da montanha','forma de elemental,nuvem tóxica','metamorfose amaldiçoada,petrificar','corpo ardente,duplicar inimigo','dessecar,forma de monstruosidade','metamorfose'],
'limiares':['distorção do vazio,mão telecinética','convocar morto-vivo,gavinhas sombrias,lacaio fantasmagórico','escuridão,ver o que não é visto','arma fantasmagórica,compelir morto-vivo','translocar,tremular','banimento,invocar espíritos','exsanguinação vampírica,teleporte','explosão de eclipse,teleporte interplanar','observação inexorável,perplexidade','massacre'],
'magia-belica':['escudo místico,projétil telecinético','armadura mística,saraivada de força,soprar fogo','névoa,resistir a energia','bola de fogo,prender à terra','muralha de fogo,tempestade de armas','cravo empalador,nevasca uivante','corrente de relâmpagos,desintegrar','alvo verdadeiro,égide de energia','dessecar,fenda ártica','estrelas cadentes'],
'magia-civica':['prestidigitação,ler aura','convocar construto,destroços esmagadores,empurrão hidráulico','caminhar na água,luz reveladora','cabana confortável,passagem segura','criação,movimento irrestrito','controlar água,muralha de pedra','desintegrar,muralha de força','palácio planar,retrocognição','terremoto,apontar','presciência'],
'mentalismo':['ficção,pasmar','cores estonteantes,golpe certeiro,sono','criatura ilusória,estupefazer','mensagem onírica,ler mente','pesadelo,visão da morte','alucinação,cena ilusória','calamidade fanstamagórica,mente ausente','distorcer mente,projetar imagem','dança incontrolável,desaparecimento','fantasmagoria']}
ALIASES={'comandar':'comando','garra-dilacerante':'garra-retalhadora','vinha-enredante':'cipos-emaranhadores','disfarcar-magia':'disfarcar-magia','banquete-vampirico':'festim-vampirico','pes-a-nadadeiras':'pes-em-barbatanas','duplicar-inimigo':'duplicar-adversario','saraivada-de-forca':'barragem-de-forca','destrocos-esmagadores':'agredir-com-detritos','apontar':'precisar','calamidade-fanstamagorica':'calamidade-fantasmagorica'}
byid={m['id']:m for m in j['magias']};missing=[]
for c in j['classes']:
 if c['id']!='mago':continue
 for o in c['opcoes']:
  if o['id']=='teoria-magica-unificada':
   o['magiasCurriculo']=[];o['bonusTalentos']=[{'tipo':'classe','nivel':1,'quantidade':1}];continue
  o['magiasCurriculo']=[];o['magiasCurriculoFonte']=[]
  for rank,line in enumerate(CURRICULA[o['id']]):
   names=line.split(',');ids=[]
   for name in names:
    id=ALIASES.get(slug(name),slug(name))
    if id not in byid:missing.append((o['id'],rank,name,id))
    else:ids.append(id)
   o['magiasCurriculo'].append({'ranque':rank,'magias':ids})
   o['magiasCurriculoFonte'].append({'ranque':rank,'nomes':names,'pagina':187 if o['id'] in ['ars-grammatica','forma-proteana','limiares'] else 188})
if missing:print('Currículos: referências ainda não resolvidas',missing)
# Concessões iniciais revisadas em overlay separado: listas são aditivas.
initial=ROOT/'docs/pathfinder/player-core-1/concessoes-iniciais-foco-musas.json'
def merge_nonempty(current,patch):
 for key,val in patch.items():
  if isinstance(val,list) and not val and current.get(key):continue
  current[key]=val
if initial.exists():
 inc=json.loads(initial.read_text())
 for key in ['magias','talentos']:
  for r in inc.get(key,[]):
   old=next((x for x in j[key] if x['id']==r['id']),None)
   if old is None:j[key].append(r)
   else:merge_nonempty(old,r)
 for patch in inc.get('patchesClasses',[])+inc.get('magiasClasse',[]):
  c=next(c for c in j['classes'] if c['id']==patch['classeId']);target=next(o for o in c['opcoes'] if o['id']==patch['opcaoId']) if patch.get('opcaoId') else c
  for field in ['magiasConcedidas','talentosConcedidos']:
   values=target.setdefault(field,[])
   for r in patch.get(field,[]):
    id=r['id'] if isinstance(r,dict) else r
    if not any((x['id'] if isinstance(x,dict) else x)==id for x in values):values.append(r)
 for patch in inc.get('escolhasObrigatorias',[]):
  c=next(c for c in j['classes'] if c['id']==patch['classeId']);target=next(o for o in c['opcoes'] if o['id']==patch['opcaoId']) if patch.get('opcaoId') else c
  tipo='foco' if patch['id']=='sortilegio-inicial' else 'magia'
  target.setdefault('escolhasExtras',[]).append({'id':patch['id'],'nome':'Sortilégio de foco inicial' if tipo=='foco' else 'Magia inicial do familiar','nivel':1,'quantidade':1,'opcoes':[{'id':id,'nome':next(m['nome'] for m in j['magias'] if m['id']==id),'magiasConcedidas':[{'id':id,'tipo':tipo,'graduacao':1,'nivelConcessao':1,'consomeVaga':False}]} for id in patch['opcoes']]})
 # Mantém a composição básica além das cinco escolhas normais de truques.
 bard=next(c for c in j['classes'] if c['id']=='bardo')
 bard.setdefault('magiasConcedidas',[]).append({'id':'antifona-da-coragem','nome':'Antífona da Coragem','tipo':'truque','graduacao':0,'nivelConcessao':1,'consomeVaga':False})
 for id,option in [('bardo-performance-marcial','combatente'),('bardo-saber-bardico','enigma'),('bardo-composicao-prolongada','maestro'),('bardo-performance-versatil','polimata')]:
  t=next(t for t in j['talentos'] if t['id']==id);t['requisitos']='Musa '+option;t['requisitosEstruturados']={'opcoesClasse':[option]}
 # Aliases da tradução da lista da escola não são usados como IDs ou nome de exibição.
 for c in j['classes']:
  for o in c['opcoes']:
   o['descricao']=o['descricao'].replace('guiar o destino','tocar o destino').replace('foco raio de força','foco dardo de força').replace('foco terraplenagem','foco desnivelar')
   o['resumo']=[o['descricao']]

# Conhecer magias não equivale a prepará-las. Fonte PDF112,184,187 e190.
for c in j['classes']:
 if c['id'] in ['mago','bruxo']:
  c['conjuracao']['conhecidas']={'truques':10,'magiasIniciais':5,'magiasPorNivel':2}
  c['conjuracao']['conhecidasFonte']={'pagina':111 if c['id']=='bruxo' else 183,'descricao':'10 truques e5magias de1º; duas magias novas por nível após o primeiro. Concessões e currículos são adicionais; magias aprendidas além do mínimo são permitidas.'}
 if c['id']=='mago':
  for o in c['opcoes']:
   o.setdefault('conjuracao',{})['conhecidas']=({'truques':10,'magiasIniciais':6,'magiasPorNivel':2} if o['id']=='teoria-magica-unificada' else {'truques':11,'magiasIniciais':7,'magiasPorNivel':2,'magiasPorNovoRanque':1,'incluiConcedidas':True})
review_spell('bencao',['divina','ocultista'],'2','[2 ações], aura/concentração/manuseio/mental. Emanação4,5m por1minuto: você e aliados dentro dela recebem+1 de estado nos ataques. Uma vez por rodada em turnos seguintes, Sustentar aumenta o raio em3m. Pode neutralizar Ruína.','Aura que concede+1 nos ataques dos aliados por um minuto; pode ampliar o raio em turnos seguintes e neutralizar Ruína.')
review_spell('cipos-emaranhadores',['arcana','primal'],'2','[2 ações], ataque/concentração/madeira/manuseio/planta. Ataque mágico contra CA de uma criatura a9m. Sucesso:−3m de circunstância nas Velocidades por1rodada. Crítico:também imobilizado. Pode Escapar contra sua CD de magia para encerrar penalidade e imobilização; falha:nada. Elevada2º:dura2rodadas;4º:1minuto.','Ataque a9m atrapalha movimento; crítico imobiliza. O alvo pode Escapar e a duração melhora nos ranques2/4.')
review_spell('purificar-culinaria',['divina','primal'],'2','[2 ações], concentração/manuseio. A3m, transforma alimentos/bebidas em um cubo de30litros em pratos deliciosos; pode melhorar sabores/ingredientes, transformar água em vinho ou outra bebida fina e remover toxinas/contaminação. Não evita contaminação futura, deterioração nem aumenta valor nutritivo. Elevação(+2):+30litros contíguos.','Melhora comida/bebida e pode retirar toxinas; não aumenta nutrição nem protege contra deterioração futura.')
review_spell('bons-ventos',['arcana','primal'],'2','[2 ações], ar/concentração/manuseio. Por1hora recebe+3m de estado na Velocidade. Elevada2º:dura8horas. Não acumula com outro bônus de estado de Velocidade.','+3m na Velocidade por uma hora; no2ºranque dura oito horas.')
review_feat('druida-companheiro-animal','Recebe um companheiro animal jovem que acompanha suas aventuras e obedece a comandos simples da melhor maneira que puder, conforme regras da página206.','Recebe companheiro animal jovem; escolha seu tipo pelas regras de companheiros.','Ordem dos animais',requisitosEstruturados={'opcoesClasse':['animais']},capacidades=['companheiro-animal'],companheiroAnimal={'estagio':'jovem','pagina':206})
review_feat('druida-familiar-leshy','Recebe familiar leshy Minúsculo. Ele tem a habilidade planta ou fungo à sua escolha, sem consumir seu limite normal de habilidades de familiar(geralmente2). É um familiar para ajudar na conjuração, não um companheiro animal.','Recebe familiar vegetal/fúngico Minúsculo com uma habilidade extra obrigatória.','Ordem da folha',requisitosEstruturados={'opcoesClasse':['folha']},capacidades=['familiar'],familiar={'habilidadeGratuitaEscolha':['planta','fungo']})
review_feat('druida-forma-indomavel','Recebe a magia de ordem Forma Indomável. Ela transforma você em formas que sua lista de formas conhecidas permitir; talentos adicionais podem ampliar a lista.','Recebe Forma Indomável, com novas formas liberadas por outros talentos.','Ordem indomável',requisitosEstruturados={'opcoesClasse':['indomavel']},magiasConcedidas=[{'id':'forma-indomavel','tipo':'foco','graduacao':1,'consomeVaga':False}])
review_feat('druida-nascido-da-tempestade','Seus ataques de magia à distância e Percepção ignoram penalidades de circunstância causadas pelo clima. Magias com alvo dispensam teste simples contra ocultação causada por efeitos climáticos, como névoa.','Ignora interferência do clima em ataques mágicos, Percepção e ocultação de alvos.','Ordem da tempestade',requisitosEstruturados={'opcoesClasse':['tempestade']})
review_feat('clerigo-iniciado-no-dominio','Escolha um domínio dentre os da sua divindade. Recebe sua magia de domínio inicial, uma magia de foco. A reserva começa com1Ponto de Foco; Refocar por10minutos orando ou servindo à causa recupera1, e preparações diárias reabastecem a reserva. Magias de foco elevam-se à metade do nível arredondada para cima, sem usar espaços normais; reserva máxima3. Pode selecionar novamente, escolhendo outro domínio e sua magia inicial.','Recebe a magia inicial de um domínio da divindade e uma reserva de foco; precisa escolher domínio permitido.',repetivel=True,conjuracao={'focoInicial':1},escolhaDominio={'dependeDivindade':True,'pagina':39,'magiasPaginas':[375,384]})
for c in j['classes']:
 if c['id']=='druida':
  for o in c['opcoes']:
   grants={'animais':'druida-companheiro-animal','folha':'druida-familiar-leshy','indomavel':'druida-forma-indomavel','tempestade':'druida-nascido-da-tempestade'}
   o.setdefault('talentosConcedidos',[]).append(grants[o['id']])
 if c['id']=='clerigo':
  o=next(o for o in c['opcoes'] if o['id']=='sacerdote-enclausurado');o.setdefault('talentosConcedidos',[]).append('clerigo-iniciado-no-dominio');o.setdefault('conjuracao',{})['focoInicial']=1

# Cinco teses são escolhas independentes da escola arcana, obrigatórias no1º.
M=next(c for c in j['classes'] if c['id']=='mago')
for t in M['teses']:
 if t['id']=='familiar-aprimorado':
  t['talentosConcedidos']=['mago-familiar'];t['capacidades']=['familiar'];t['familiar']={'habilidadesExtrasPorNivel':[{'nivel':1,'quantidade':1},{'nivel':6,'quantidade':2},{'nivel':12,'quantidade':3},{'nivel':18,'quantidade':4}]}
 if t['id']=='moldamagia-experimental':
  t['escolhasExtras']=[{'id':'moldamagia-inicial','nome':'Moldamagia inicial da tese','nivel':1,'opcoes':[{'id':id,'nome':next(r['nome'] for r in j['talentos'] if r['id']==id),'talentosConcedidos':[id]} for id in ['mago-ampliar-magia','mago-estender-magia']]}]
 if t['id']=='nexo-cajado':t['cajadoImprovisado']={'truques':1,'magiasPrimeiroRanque':1,'magiasSacrificadasPorNivel':[{'nivel':1,'quantidade':1},{'nivel':8,'quantidade':2},{'nivel':16,'quantidade':3}],'cargas':'ranque da magia sacrificada'}
 if t['id']=='substituicao-magia':t['substituicaoMagia']={'minutos':10,'exigeMagiaNoGrimorio':True,'interrompidaMantemOriginal':True}
 if t['id']=='mescla-magia':t['mesclaMagia']={'trocaEspacos':2,'mesmoRanque':True,'aumentoMaximoRanque':2,'ranqueMaximoDisponivel':True,'trocaPorTruques':{'espacos':1,'truques':2,'vezesPreparacao':1}}
M.setdefault('escolhasExtras',[]).append({'id':'tese','nome':'Tese arcana','nivel':1,'opcoes':M['teses']})
# Favorecidas das divindades: estatísticas oficiais da tabela PDF279.
for name,die,damage,price,bulk,hands,group,traits in [
('Faca-estrela','1d4','perfurante',2,'L',1,'faca',['acuidade','agil','arremesso-6m','mortal-d6','versatil-cortante']),
('Bracamante','1d10','cortante',3,2,2,'espada',['amplitude','energica']),
('Machado longo','1d12','cortante',2,2,2,'machado',['amplitude']),
('Cimitarra','1d6','cortante',1,1,1,'espada',['amplitude','energica']),
('Glaive','1d8','cortante',1,2,2,'haste',['alcance','energica','mortal-d8']),
('Segadeira','1d10','cortante',2,2,2,'haste',['derrubar','mortal-d10']),
('Corrente com cravos','1d8','cortante',3,1,2,'mangual',['acuidade','derrubar','desarmar'])]:
 r={'id':slug(name),'nome':name,'tipo':'arma','grau':'marciais','dano':die,'tipoDano':damage,'preco':price,'moeda':'po','volume':bulk,'maos':hands,'grupo':group,'tracos':traits,'nivel':0,'descricao':f'{die} de dano {damage}; {hands}mão(s); Volume{bulk}; grupo{group}; preço{price}po. Traços:'+','.join(traits)+'. O dado não inclui atributos, runas ou outros bônus.','resumo':[f'{die} {damage}; {hands}mão(s); {price}po.'],'fonte':F,'pagina':278,'secoes':['pc1-pdf-279','pc1-pdf-283','pc1-pdf-284','pc1-pdf-285','pc1-pdf-286'],'revisao':'revisado','somenteConsulta':False}
 if name=='Corrente com cravos':r['raridade']='incomum'
 j['equipamentos'].append(r)
# Relações de divindades/domínios ficam em overlay de revisão separado.
religion=ROOT/'docs/pathfinder/player-core-1/divindades-dominios-iniciais.json'
if religion.exists():
 rg=json.loads(religion.read_text())
 for key in ['divindades','dominios']:
  if rg.get(key):j[key]=rg[key]
 for key in ['magias','talentos']:
  for r in rg.get(key,[]):
   old=next((m for m in j[key] if m['id']==r['id']),None)
   if old is None:j[key].append(r)
   else:merge_nonempty(old,r)
 for patch in rg.get('patchesClasses',[]):
  c=next(c for c in j['classes'] if c['id']==patch['classeId']);target=next(o for o in c['opcoes'] if o['id']==patch['opcaoId']) if patch.get('opcaoId') else c
  for key,val in patch.items():
   if key in ['classeId','opcaoId']:continue
   if isinstance(val,list):target.setdefault(key,[]).extend(x for x in val if x not in target.get(key,[]))
   else:target[key]=val

# Reação básica concedida pelas classes: não ocupa uma escolha de talento.
review_feat('bloqueio-com-escudo',
 '[reação]. Gatilho: enquanto estiver com seu escudo erguido, você sofreria dano físico (contundente, perfurante ou cortante) de um ataque. Você posiciona o escudo para bloquear o ataque. O escudo reduz o dano sofrido em uma quantidade igual à Dureza dele. Você e o escudo sofrem qualquer dano restante, possivelmente quebrando ou destruindo o escudo.',
 'Com o escudo erguido, use uma reação contra dano físico de um ataque: reduza o dano pela Dureza. Você e o escudo recebem, cada um, todo o restante.',
 acoes='reacao',tracos=['geral'],capacidades=['bloqueio-com-escudo'],
 reacao={'gatilho':{'escudoErguido':True,'origemAtaque':True,'tiposDano':['contundente','perfurante','cortante']},'reducao':'dureza-do-escudo','destinatariosDanoRestante':['personagem','escudo']})
for cid in ['guerreiro','druida']:
 c=next(c for c in j['classes'] if c['id']==cid)
 c.setdefault('talentosConcedidos',[]).append({'id':'bloqueio-com-escudo','nivel':1,'tipo':'geral','consomeVaga':False})
# Overlays podem usar a forma curta (ID) ou o objeto estruturado para a mesma
# concessão. Mantém uma só concessão, dando preferência ao objeto explícito.
for c in j['classes']:
 for r in [c]+c.get('opcoes',[]):
  grants={}
  for g in r.get('talentosConcedidos',[]):
   gid=g if isinstance(g,str) else g['id']
   if gid not in grants or isinstance(g,dict):grants[gid]=g
  if 'talentosConcedidos' in r:r['talentosConcedidos']=list(grants.values())

# Cobertura declarada sem apresentar índices como dados revisados.
j['cobertura']={'classes':8,'ancestralidades':8,'herancas':45,'biografias':40,'paginasNativas':470,'talentosRevisados':sum(t.get('revisao')=='revisado' for t in j['talentos']),'magiasRevisadas':sum(m.get('revisao')=='revisado' for m in j['magias']),'talentosIndexados':len(j['talentos']),'magiasIndexadas':len(j['magias']),'equipamentosRevisados':len(j['equipamentos'])}
j['lacunas'].extend(['Não são revisados individualmente todos os talentos e magias indexados. Talentos/magias somente consulta não concedem efeitos na ficha.','Concessões iniciais estruturadas de musas, patronos, ordens, escolas e teses são revisadas; poderes condicionais, domínios e opções adicionais dependem dos respectivos overlays declarados.','Divindades, currículos detalhados, poderes de companheiros/familiares, dedicação multiclasse e condições situacionais exigem metadados adicionais, não interpretação automática de texto.','Equipamentos revisados cobrem as entradas declaradas na cobertura das tabelas iniciais; não equivalem a todos os itens de todos os suplementos.'])
# Melhora apenas a tipografia dos resumos escritos, preservando texto nativo e IDs.
def readable(s):
 s=re.sub(r'(?<=[A-Za-zÀ-ÿ])(?=\d|[+−])',' ',s)
 s=re.sub(r'(?<=\d)(?=PV|po\b|m\b|mão|ação|dia|hora|minuto|rodada|criatura|nível|talento|Volume)',' ',s)
 s=re.sub(r'([:;])(?=[A-Za-zÀ-ÿ\d])',r'\1 ',s)
 return s
for collection in ['classes','ancestralidades','herancasVersateis','biografias','talentos','magias','equipamentos']:
 for item in j.get(collection,[]):
  for r in [item]+item.get('herancas',[])+item.get('opcoes',[])+item.get('teses',[]):
   if r.get('revisao')=='revisado':
    r['descricao']=readable(r['descricao']);r['resumo']=[readable(s) for s in r.get('resumo',[])]
save()
