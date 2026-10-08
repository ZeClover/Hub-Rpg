"""Guardas de delimitação: não substituem a revisão mecânica individual."""
import json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
j=json.loads((HERE/'entradas-nativas-pt.json').read_text())
assert not j['pendencias'],j['pendencias']
assert len(j['talentos'])==735
assert len(j['magias'])==361
for collection in ['talentos','magias']:
 ids=[r['id'] for r in j[collection]]
 assert len(ids)==len(set(ids))
 for r in j[collection]:
  assert len(r['descricao'])>=55,r['id']
  assert 'Entrada de referência' not in r['descricao'],r['id']
  assert r['textoNativoCompleto'] and r['somenteConsulta'],r['id']
  assert r['revisao'] in ['texto-nativo-delimitado','texto-nativo-conferido']
  assert r['secoes']==[f'pc1-pdf-{n+1}' for n in r['paginasTexto']]
by={r['id']:r for k in ['talentos','magias'] for r in j[k]}
assert 'Sua musa não se enquadra' in by['bardo-musa-multifacetada']['descricao']
assert 'DANÇARINA' not in by['bardo-musa-multifacetada']['descricao']
assert 'ELFO' not in by['anao-portal-de-pedra']['descricao']
assert 'LACAIO FANTASMAGÓRICO' not in by['lentidao']['descricao']
assert 'TALENTOS DE DRUIDA' not in by['druida-arma-verdejante']['descricao']
assert 'magia primal' in by['patrulheiro-protetor-iniciado']['descricao']
assert 'Duração 10 minutos' in by['movimento-irrestrito']['descricao']
assert by['dromaar-inspirar-imitacao']['ancestralidade']=='aiuvarin'
assert 'Magias de' not in by['tempo-triplo']['descricao']
assert 'Elevada (5º)' in by['transito-do-viajante']['descricao']
p=json.loads((HERE/'passivos-gerais-revisados.json').read_text())
t=next(t for t in p['talentos'] if t['id']=='treinamento-em-pericia')
assert t['requisitosEstruturados']=={'atributos':{'int':1}}
assert t['efeitos']==[{'alvo':'treinamentos','tipo':'sem-tipo','valor':1}]
print('OK: 1096 corpos PT individuais; IDs, páginas, continuações e separação de caixas/tabelas.')
