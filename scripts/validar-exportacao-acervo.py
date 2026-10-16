"""Valida o arquivo recebido do endpoint privado; não extrai arquivos nem imprime dados secretos."""
import csv
import hashlib
import io
import json
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as pacote:
    assert pacote.testzip() is None, 'CRC do pacote inválido'
    manifesto = json.loads(pacote.read('MANIFESTO.json'))
    for arquivo in manifesto['arquivos']:
        conteudo = pacote.read(arquivo['nome'])
        assert len(conteudo) == arquivo['bytes']
        assert hashlib.sha256(conteudo).hexdigest() == arquivo['sha256']
    dados = json.loads(pacote.read('dados/snapshot.json'))
    for chave in ['catalogo', 'descobertas', 'historico', 'personagens', 'variantesLegadas']:
        assert json.loads(pacote.read('dados/' + chave + '.json')) == dados[chave]
        linhas = list(csv.DictReader(io.StringIO(pacote.read('dados/' + chave + '.csv').decode('utf-8-sig'))))
        assert len(linhas) == len(dados[chave])
    ids = {item['id'] for item in dados['catalogo']}
    personagens = {p['id'] for p in dados['personagens']}
    for grupo in ['catalogo', 'descobertas', 'historico']:
        for registro in dados[grupo]:
            assert registro['campanhaId'] == dados['campanha']['id']
    for registro in dados['descobertas'] + dados['historico']:
        assert registro['colecionavelId'] in ids
        assert registro['personagemId'] in personagens
    with zipfile.ZipFile(io.BytesIO(pacote.read('codigo/Codigo_Acervo_Preservado.zip'))) as codigo:
        assert codigo.testzip() is None
        fontes = json.loads(codigo.read('MANIFESTO-CODIGO.json'))
        for arquivo in fontes['arquivos']:
            assert hashlib.sha256(codigo.read(arquivo['nome'])).hexdigest() == arquivo['sha256']
        assert not any('/.env' in n or '/node_modules/' in n or '/.git/' in n for n in codigo.namelist())
        for item in dados['catalogo']:
            if item.get('silhuetaArquivo'):
                assert pacote.read(item['silhuetaArquivo']), 'Máscara ausente'
            if item.get('imagemExportada', '').startswith('codigo/Codigo_Acervo_Preservado.zip → '):
                assert item['imagemExportada'].split(' → ')[1] in codigo.namelist()
    pendencias = json.loads(pacote.read('PENDENCIAS.json'))
    assert len(pendencias) == manifesto['pendencias']
    print('ZIP válido: CRCs, hashes, JSON/CSV, referências, mídias locais e isolamento da campanha conferidos.')
    print('Pendências externas/arquivos indisponíveis:', len(pendencias))
