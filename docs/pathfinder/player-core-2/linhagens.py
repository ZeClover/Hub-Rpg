"""Concessões da linhagem, cotejadas com Bloodlines.aspx (Remaster)."""

def aplicar(cat, references):
    classes = {c['id']: c for c in cat['classes']}
    # IDs seguem o livro português já indexado; inglês só identifica a referência.
    spells = {
        'daze': ('pasmar', 'Pasmar'), 'phantom pain': ('dor-fantasma', 'Dor Fantasma'),
        'stupefy': ('estupefazer', 'Estupefazer'), 'vampiric feast': ('festim-vampirico', 'Festim Vampírico'),
        'confusion': ('confusao', 'Confusão'), 'slither': ('serpentes-sombrias', 'Serpentes Sombrias'),
        'never mind': ('mente-ausente', 'Mente Ausente'), 'warp mind': ('distorcer-mente', 'Distorcer Mente'),
        'uncontrollable dance': ('danca-incontrolavel', 'Dança Incontrolável'), 'unfathomable song': ('cancao-incomensuravel', 'Canção Incomensurável'),
        'light': ('luz', 'Luz'), 'heal': ('curar', 'Curar'), 'spiritual armament': ('armamento-espiritual', 'Armamento Espiritual'),
        'holy light': ('luz-sagrada', 'Luz Sagrada'), 'divine wrath': ('ira-divina', 'Ira Divina'),
        'divine immolation': ('imolacao-divina', 'Imolação Divina'), 'blessed boundary': ('barreira-abencoada', 'Barreira Abençoada'),
        'divine decree': ('decreto-divino', 'Decreto Divino'), 'moment of renewal': ('momento-de-renovacao', 'Momento de Renovação'),
        'foresight': ('presciencia', 'Presciência'), 'caustic blast': ('bolha-caustica', 'Bolha Cáustica'),
        'fear': ('medo', 'Medo'), 'enlarge': ('aumentar', 'Aumentar'), 'slow': ('lentidao', 'Lentidão'),
        'blister': ('bolhas-dolorosas', 'Bolhas Dolorosas'), 'disintegrate': ('desintegrar', 'Desintegrar'),
        'canticle of everlasting grief': ('cantico-do-pesar-perpetuo', 'Cântico do Pesar Perpétuo'), 'implosion': ('implosao', 'Implosão'),
        'ignition': ('ignicao', 'Ignição'), 'charm': ('cativar', 'Cativar'), 'floating flame': ('chama-flutuante', 'Chama Flutuante'),
        'enthrall': ('hipnotizar', 'Hipnotizar'), 'suggestion': ('sugestao', 'Sugestão'),
        'wave of despair': ('onda-de-desespero', 'Onda de Desespero'), 'truesight': ('visao-verdadeira', 'Visão Verdadeira'),
        'divine inspiration': ('inspiracao-divina', 'Inspiração Divina'), 'falling stars': ('estrelas-cadentes', 'Estrelas Cadentes'),
        'figment': ('ficcao', 'Ficção'), 'laughing fit': ('crise-de-risos', 'Crise de Risos'),
        'hallucination': ('alucinacao', 'Alucinação'), 'mislead': ('despistar', 'Despistar'),
        'visions of danger': ('visoes-do-perigo', 'Visões do Perigo'), 'metamorphosis': ('metamorfose', 'Metamorfose'),
        'illusory disguise': ('disfarce-ilusorio', 'Disfarce Ilusório'), 'blindness': ('cegueira', 'Cegueira'),
        "outcast's curse": ('maldicao-do-exilado', 'Maldição do Exilado'), "mariner's curse": ('maldicao-do-marinheiro', 'Maldição do Marinheiro'),
        'cursed metamorphosis': ('metamorfose-amaldicoada', 'Metamorfose Amaldiçoada'), 'quandary': ('perplexidade', 'Perplexidade'),
        'phantasmagoria': ('fantasmagoria', 'Fantasmagoria'), 'detect magic': ('detectar-magia', 'Detectar Magia'),
        'force barrage': ('barragem-de-forca', 'Barragem de Força'), 'dispel magic': ('dissipar-magia', 'Dissipar Magia'),
        'haste': ('rapidez', 'Rapidez'), 'translocate': ('translocar', 'Translocar'), 'scouting eye': ('olho-batedor', 'Olho Batedor'),
        'retrocognition': ('retrocognicao', 'Retrocognição'), 'void warp': ('distorcao-do-vazio', 'Distorção do Vazio'),
        'harm': ('ferir', 'Ferir'), 'see the unseen': ('ver-o-que-nao-e-visto', 'Ver o que Não É Visto'),
        'bind undead': ('compelir-morto-vivo', 'Compelir Morto-vivo'), 'talking corpse': ('cadaver-falante', 'Cadáver Falante'),
        'invoke spirits': ('invocar-espiritos', 'Invocar Espíritos'), 'vampiric exsanguination': ('exsanguinacao-vampirica', 'Exsanguinação Vampírica'),
        'execute': ('executar', 'Executar'), 'wails of the damned': ('lamentos-dos-mortos', 'Lamentos dos Mortos'),
        'shield': ('escudo-mistico', 'Escudo Místico'), 'fly': ('voar', 'Voar'), 'dragon form': ('forma-de-dragao', 'Forma de Dragão'),
        'mask of terror': ('mascara-de-terror', 'Máscara de Terror'), 'overwhelming presence': ('presenca-avassaladora', 'Presença Avassaladora'),
        'blazing bolt': ('raio-flamejante', 'Raio Flamejante'), 'subconscious suggestion': ('sugestao-subconsciente', 'Sugestão Subconsciente'),
        'augury': ('augurio', 'Augúrio'), 'blood vendetta': ('vinganca-de-sangue', 'Vingança de Sangue'),
        'unrelenting observation': ('observacao-inexoravel', 'Observação Inexorável'), 'shatter': ('estilhacar', 'Estilhaçar'),
        'howling blizzard': ('nevasca-uivante', 'Nevasca Uivante'), 'earthquake': ('terremoto', 'Terremoto'),
        'resist energy': ('resistir-a-energia', 'Resistir a Energia'), 'unfettered movement': ('movimento-irrestrito', 'Movimento Irrestrito'),
        'elemental form': ('forma-de-elemental', 'Forma de Elemental'), 'energy aegis': ('egide-de-energia', 'Égide de Energia'),
        'wrathful storm': ('tormenta-colerica', 'Tormenta Colérica'), 'gale blast': ('rajada-de-vento', 'Rajada de Vento'),
        'tailwind': ('bons-ventos', 'Bons Ventos'), 'wall of wind': ('muralha-de-vento', 'Muralha de Vento'),
        'chain lightning': ('corrente-de-relampagos', 'Corrente de Relâmpagos'), 'scatter scree': ('espalhar-cascalho', 'Espalhar Cascalho'),
        'pummeling rubble': ('agredir-com-detritos', 'Agredir com Detritos'), 'earthbind': ('subjugar', 'Subjugar'),
        'petrify': ('petrificar', 'Petrificar'), 'breathe fire': ('soprar-fogo', 'Soprar Fogo'), 'fireball': ('bola-de-fogo', 'Bola de Fogo'),
        'tree of seasons': ('arvore-das-estacoes', 'Árvore das Estações'), 'electric arc': ('arco-eletrico', 'Arco Elétrico'),
        'thunderstrike': ('trovoada', 'Trovoada'), 'lightning bolt': ('relampago', 'Relâmpago'),
        'frostbite': ('geladura', 'Geladura'), 'hydraulic push': ('empurrao-hidraulico', 'Empurrão Hidráulico'),
        'aqueous orb': ('orbe-aquoso', 'Orbe Aquoso'), 'scintillating safeguard': ('salvaguarda-cintilante', 'Salvaguarda Cintilante'),
        'tangle vine': ('cipos-emaranhadores', 'Cipós Emaranhadores'), 'cleanse cuisine': ('purificar-culinaria', 'Purificar Culinária'),
        'wall of thorns': ('muralha-de-espinhos', 'Muralha de Espinhos'), 'tangling creepers': ('trepadeiras-emaranhadoras', 'Trepadeiras Emaranhadoras'),
    }
    def gift(rank, english):
        id, name = spells[english]
        return {'id': id, 'nome': name, 'graduacao': rank, 'tipo': 'truque' if rank == 0 else 'magia',
                'nivelConcessao': 1 if rank < 2 else rank * 2 - 1, 'consomeVaga': True, 'referenciaAon': references[english]}
    rows = {
        'aberrante': ['daze', 'phantom pain', 'stupefy', 'vampiric feast', 'confusion', 'slither', 'never mind', 'warp mind', 'uncontrollable dance', 'unfathomable song'],
        'angelical': ['light', 'heal', 'spiritual armament', 'holy light', 'divine wrath', 'divine immolation', 'blessed boundary', 'divine decree', 'moment of renewal', 'foresight'],
        'demoniaca': ['caustic blast', 'fear', 'enlarge', 'slow', 'divine wrath', 'blister', 'disintegrate', 'divine decree', 'canticle of everlasting grief', 'implosion'],
        'diabolica': ['ignition', 'charm', 'floating flame', 'enthrall', 'suggestion', 'wave of despair', 'truesight', 'divine decree', 'divine inspiration', 'falling stars'],
        'feerica': ['figment', 'charm', 'laughing fit', 'enthrall', 'suggestion', 'hallucination', 'mislead', 'visions of danger', 'uncontrollable dance', 'metamorphosis'],
        'bruxa': ['daze', 'illusory disguise', 'stupefy', 'blindness', "outcast's curse", "mariner's curse", 'cursed metamorphosis', 'warp mind', 'quandary', 'phantasmagoria'],
        'imperial': ['detect magic', 'force barrage', 'dispel magic', 'haste', 'translocate', 'scouting eye', 'disintegrate', 'retrocognition', 'quandary', 'implosion'],
        'morta-viva': ['void warp', 'harm', 'see the unseen', 'bind undead', 'talking corpse', 'invoke spirits', 'vampiric exsanguination', 'execute', 'canticle of everlasting grief', 'wails of the damned'],
    }
    dragon_changes = {
        'arcana': {2: 'blazing bolt', 5: 'subconscious suggestion', 8: 'quandary'},
        'divina': {2: 'augury', 5: 'divine immolation', 8: 'divine inspiration'},
        'ocultista': {2: 'blood vendetta', 5: 'slither', 8: 'unrelenting observation'},
        'primal': {2: 'shatter', 5: 'howling blizzard', 8: 'earthquake'},
    }
    elemental = next(o for o in classes['feiticeiro']['opcoes'] if o['id'] == 'elemental')
    fixed_elemental = {2: 'resist energy', 4: 'unfettered movement', 5: 'elemental form', 7: 'energy aegis', 8: 'earthquake', 9: 'wrathful storm'}
    elemental['magiasConcedidas'] = [gift(rank, spell) for rank, spell in fixed_elemental.items()]
    elemental['escolhasExtras'] = [{'id': 'elemento-linhagem', 'nome': 'Elemento da linhagem', 'nivel': 1, 'opcoes': []}]
    for id, name, damage, spells_element in [
        ('ar', 'Ar', 'cortante', ['gale blast', 'tailwind', 'wall of wind', 'chain lightning']),
        ('terra', 'Terra', 'contundente', ['scatter scree', 'pummeling rubble', 'earthbind', 'petrify']),
        ('fogo', 'Fogo', 'fogo', ['ignition', 'breathe fire', 'fireball', 'tree of seasons']),
        ('metal', 'Metal', 'perfurante', ['electric arc', 'thunderstrike', 'lightning bolt', 'chain lightning']),
        ('agua', 'Água', 'contundente', ['frostbite', 'hydraulic push', 'aqueous orb', 'scintillating safeguard']),
        ('madeira', 'Madeira', 'contundente', ['tangle vine', 'cleanse cuisine', 'wall of thorns', 'tangling creepers'])]:
        elemental['escolhasExtras'][0]['opcoes'].append({'id': id, 'nome': name, 'tipoDanoMagiaSanguinea': damage,
             'magiasConcedidas': [gift(rank, spell) for rank, spell in zip([0, 1, 3, 6], spells_element)]})
    for o in classes['feiticeiro']['opcoes']:
        if o['id'] in rows:
            o['magiasConcedidas'] = [gift(rank, name) for rank, name in enumerate(rows[o['id']])]
        elif o['id'].startswith('draconica-'):
            base = {0: 'shield', 1: 'fear', 3: 'haste', 4: 'fly', 6: 'dragon form', 7: 'mask of terror', 9: 'overwhelming presence'}
            base.update(dragon_changes[o['tradicao']])
            o['magiasConcedidas'] = [gift(rank, name) for rank, name in sorted(base.items())]
            o['descricao'] = o['descricao'].replace('Dons do Dragão', 'Rajada de Garras')
            o['resumo'] = [o['descricao']]
        o['fonteConcessoes'] = 'https://2e.aonprd.com/Bloodlines.aspx'
        o['descricao'] += '\nMagias concedidas: ' + '; '.join(('truque' if g['graduacao'] == 0 else str(g['graduacao']) + 'ª graduação') + ' — ' + g['nome'] for g in o['magiasConcedidas']) + '.'
    cat['lacunas'].append('Concessões de todas as linhagens estão estruturadas, incluindo seis escolhas elementais. Algumas magias não têm bloco individual revisado; isso exige implementação antes da criação completa, sem pedir cálculo manual ao jogador.')
