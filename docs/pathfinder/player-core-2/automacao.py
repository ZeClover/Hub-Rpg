"""Metadados mecânicos revistos; aplicados pelo compilador editorial.

Quantidades de magia conferidas no Archives of Nethys em 2026-10-06.
Não torna magias ou talentos ainda não revistos selecionáveis.
"""
import json
from pathlib import Path

def aplicar(cat):
    classes = {c['id']: c for c in cat['classes']}
    slots = {}
    for n in range(1, 21):
        rank = min(9, (n + 1) // 2)
        slots[str(n)] = [4] * (rank - 1) + ([3] if n < 19 and n % 2 else [4])
        if n >= 19:
            slots[str(n)].append(1)
    oracle = classes['oraculo']
    sorc = classes['feiticeiro']
    for c, choices, cantrip_choices, total_cantrips in [(oracle, 3, 5, 6), (sorc, 2, 4, 5)]:
        c['conjuracao'].update({
            'truques': total_cantrips,
            'truquesEscolhidos': cantrip_choices,
            'truquesConcedidos': 1,
            'magiasEscolhidas': choices,
            'magiasConcedidas': 1,
            'espacos': [3],
            'espacosPorNivel': slots,
            'niveisMagia': {str(n): (10 if n >= 19 else (n + 1) // 2) for n in range(1, 21)},
            'focoInicial': 1,
            'focoMaximo': 3,
            'focoPorMagiaConhecida': True,
            'magiasAssinaturaDesde': 3,
            'assinaturasPorGraduacao': 1,
            'decimaGraduacao': {'nivel': 19, 'espacos': 1, 'repertorio': 2, 'especial': True},
            'fonteQuantidades': 'https://2e.aonprd.com/Classes.aspx?ID=' + ('61' if c is oracle else '62'),
        })
    # Oracle gains ALL mystery spells in addition to the selected repertoire.
    oracle['conjuracao']['repertorioEscolhidoPorNivel'] = {
        n: values[:-1] + [2] if int(n) >= 19 else values[:] for n, values in slots.items()
    }
    references = json.loads((Path(__file__).parent / 'referencias-magias.json').read_text())
    gifts = {
        'ancestrais': [(0, 'orientacao', 'Orientação', 'guidance'), (1, 'mau-pressagio', 'Mau Presságio', 'ill omen'),
                      (2, 'portador-fantasmagorico', 'Portador Fantasmagórico', 'ghostly carrier'), (5, 'potencial-onirico', 'Potencial Onírico', 'dreaming potential')],
        'batalha': [(0, 'escudo-mistico', 'Escudo Místico', 'shield'), (1, 'golpe-certeiro', 'Golpe Certeiro', 'sure strike'),
                   (2, 'manobra-telecinetica', 'Manobra Telecinética', 'telekinetic maneuver'), (4, 'tempestade-de-armas', 'Tempestade de Armas', 'weapon storm')],
        'ossos': [(0, 'distorcao-do-vazio', 'Distorção do Vazio', 'void warp'), (1, 'gavinhas-sombrias', 'Gavinhas Sombrias', 'grim tendrils'),
                  (2, 'vitalidade-falsa', 'Vitalidade Falsa', 'false vitality'), (3, 'arma-fantasmagorica', 'Arma Fantasmagórica', 'ghostly weapon')],
        'cosmos': [(0, 'luz', 'Luz', 'light'), (1, 'cores-estonteantes', 'Cores Estonteantes', 'dizzying colors'),
                   (2, 'escuridao', 'Escuridão', 'darkness'), (5, 'frenesi-lunar', 'Frenesi Lunar', 'moon frenzy')],
        'chamas': [(0, 'ignicao', 'Ignição', 'ignition'), (1, 'soprar-fogo', 'Soprar Fogo', 'breathe fire'),
                   (2, 'raio-flamejante', 'Raio Flamejante', 'blazing bolt'), (3, 'bola-de-fogo', 'Bola de Fogo', 'fireball')],
        'vida': [(0, 'acoite-de-vitalidade', 'Açoite de Vitalidade', 'vitality lash'), (1, 'abrandar', 'Abrandar', 'soothe'),
                 (2, 'vitalidade-falsa', 'Vitalidade Falsa', 'false vitality'), (5, 'crescimentos-macabros', 'Crescimentos Macabros', 'grisly growths')],
        'conhecimento': [(0, 'ler-aura', 'Ler Aura', 'read aura'), (1, 'vinculo-mental', 'Vínculo Mental', 'mindlink'),
                         (3, 'hipercognicao', 'Hipercognição', 'hypercognition'), (6, 'mente-ausente', 'Mente Ausente', 'never mind')],
        'tempestade': [(0, 'arco-eletrico', 'Arco Elétrico', 'electric arc'), (1, 'trovoada', 'Trovoada', 'thunderstrike'),
                      (4, 'torrente-hidraulica', 'Torrente Hidráulica', 'hydraulic torrent'), (6, 'corrente-de-relampagos', 'Corrente de Relâmpagos', 'chain lightning')],
    }
    def gift(row):
        rank, id, name, english = row
        return {'id': id, 'nome': name, 'graduacao': rank, 'tipo': 'truque' if rank == 0 else 'magia',
                'nivelConcessao': 1 if rank < 2 else rank * 2 - 1,
                'referenciaAon': references[english]}
    for o in oracle['opcoes']:
        o['magiasConcedidas'] = [gift(row) for row in gifts[o['id']]]
        o['magiasConcedidasAdicionais'] = True
        for m in o['magiasConcedidas']:
            m['consomeVaga'] = False
    initial_bloodlines = {
        'aberrante': [(0, 'pasmar', 'Pasmar', 'daze'), (1, 'dor-fantasma', 'Dor Fantasma', 'phantom pain')],
        'angelical': [(0, 'luz', 'Luz', 'light'), (1, 'curar', 'Curar', 'heal')],
        'demoniaca': [(0, 'bolha-caustica', 'Bolha Cáustica', 'caustic blast'), (1, 'medo', 'Medo', 'fear')],
        'diabolica': [(0, 'ignicao', 'Ignição', 'ignition'), (1, 'cativar', 'Cativar', 'charm')],
        'feerica': [(0, 'ficcao', 'Ficção', 'figment'), (1, 'cativar', 'Cativar', 'charm')],
        'bruxa': [(0, 'pasmar', 'Pasmar', 'daze'), (1, 'disfarce-ilusorio', 'Disfarce Ilusório', 'illusory disguise')],
        'imperial': [(0, 'detectar-magia', 'Detectar Magia', 'detect magic'), (1, 'barragem-de-forca', 'Barragem de Força', 'force barrage')],
        'morta-viva': [(0, 'distorcao-do-vazio', 'Distorção do Vazio', 'void warp'), (1, 'ferir', 'Ferir', 'harm')],
    }
    for o in sorc['opcoes']:
        if o['id'].startswith('draconica-'):
            rows = [(0, 'escudo-mistico', 'Escudo Místico', 'shield'), (1, 'medo', 'Medo', 'fear')]
        else:
            rows = initial_bloodlines.get(o['id'], [])
        o['magiasConcedidas'] = [gift(row) for row in rows]
        o['magiasConcedidasAdicionais'] = False
        for m in o['magiasConcedidas']:
            m['consomeVaga'] = True
    # Sorcerer bloodline spells occupy a repertoire entry; they are not extra slots.
    sorc['conjuracao']['repertorioPorNivel'] = {
        n: values[:-1] + [2] if int(n) >= 19 else values[:] for n, values in slots.items()
    }
    sorc['conjuracao']['repertorioEscolhidoPorNivel'] = {
        n: [v - 1 for v in values[:9]] + ([2] if int(n) >= 19 else []) for n, values in slots.items()
    }
    for g in oracle['progressao']:
        if g['nome'] == 'Repertório Divino':
            g['descricao'] = ('Aprende cinco truques divinos e três magias divinas de 1ª graduação à escolha, '
                'mais o truque e as magias concedidos pelo mistério. Começa com três espaços de 1ª graduação. '
                'Cada novo espaço acrescenta uma magia escolhida da mesma graduação ao repertório. '
                'Magias concedidas pelo mistério são adicionais e não concedem espaços. '
                'As quantidades seguem a redação corrigida do Archives of Nethys, não o erro da impressão. '
                'Truques e foco elevam-se a metade do nível arredondada para cima.')
    classes['campeao']['conjuracao'].update({'focoInicial': 1, 'focoMaximo': 3, 'focoPorMagiaConhecida': True})
    classes['monge']['dadoMinimoPunho'] = 6
    qi = next(t for t in cat['talentos'] if t['id'] == 'monge-magias-qi')
    qi['conjuracao'] = {'tipo': 'foco', 'atributo': 'sab', 'grau': 1,
        'tradicoesEscolha': ['divina', 'ocultista'], 'focoInicial': 1, 'focoMaximo': 3}
    qi['escolhasExtras'] = [{'id': 'magia-qi-inicial', 'nome': 'Magia inicial de Qi', 'nivel': 1,
        'opcoes': [{'id': id, 'nome': name, 'magiasConcedidas': [{'id': id, 'nome': name,
            'graduacao': 1, 'tipo': 'foco', 'nivelConcessao': 1, 'consomeVaga': False,
            'fonte': 'player-core-2', 'pagina': 258}]} for id, name in [
                ('agitacao-interior', 'Agitação Interior'), ('impulso-de-qi', 'Impulso de Qi')]]}]
    inv = classes['investigador']
    inv['ataqueEstrategico'] = [{'nivel': n, 'dano': str(i + 1) + 'd6'} for i, n in enumerate([1, 5, 9, 13, 17])]
    inv['ataqueEstrategicoRequisitos'] = {'estado': 'estratagema', 'usaIntelectoNoAtaque': True,
        'corpoACorpo': ['agil', 'acuidade'], 'armaDistancia': True, 'armaArremessoCorpoACorpo': ['agil', 'acuidade']}
    inv['capacidades'] = ['idealizar-estratagema']
    inv['restricoesTalentosExtra'] = {str(n): ['pericia-mental', 'pericia-da-metodologia'] for n in range(3, 20, 2)}
    inv['restricoesIncrementosExtra'] = {}
    classes['espadachim']['restricoesIncrementosExtra'] = {str(n): ['acrobacia', 'pericia-do-estilo'] for n in [3, 7, 15]}

    # The public sheet uses meters; source distances in feet remain in prose.
    for a in cat['ancestralidades']:
        a['deslocamento'] = 7.5
        a['unidadeDeslocamento'] = 'm'
        for h in a['herancas']:
            if 'deslocamentoNatacao' in h:
                h['deslocamentoNatacao'] = 4.5
    def effect(value, condition=None):
        e = {'alvo': 'deslocamento', 'tipo': 'estado', 'valor': value}
        if condition:
            e['condicao'] = condition
        return e
    def progression(c, n, name, effects):
        c['progressao'].append({'nivel': n, 'nome': name, 'descricao': 'Bônus de estado atualizado automaticamente, sem acumular os patamares anteriores.',
            'automatico': True, 'efeitos': effects, 'fonte': 'player-core-2', 'pagina': c['pagina'] + 1})
    for c in classes.values():
        for g in c['progressao']:
            if g['nome'] in ['Especialização em Armas', 'Especialização em Armas Maior']:
                maior = g['nome'].endswith('Maior')
                g['efeitos'] = [{'alvo': 'dano', 'tipo': 'sem-tipo', 'grupo': 'especializacao-arma',
                    'valorPorGrauArma': {'2': 4 if maior else 2, '3': 6 if maior else 3, '4': 8 if maior else 4}}]
                g['automatico'] = True
    for n, meters in [(3, 3), (7, 4.5), (11, 6), (15, 7.5), (19, 9)]:
        progression(classes['monge'], n, 'Movimento Incrível — bônus vigente', [effect(meters, 'sem-armadura')])
    progression(classes['barbaro'], 3, 'Passos Furiosos — bônus vigente', [effect(1.5), effect(3, 'furia')])
    classes['espadachim']['efeitos'] = [effect(1.5, 'panache')]
    for n, with_panache, without_panache in [(3, 3, 1.5), (7, 4.5, 1.5), (11, 6, 3), (15, 7.5, 3), (19, 9, 4.5)]:
        progression(classes['espadachim'], n, 'Velocidade Vivaz — bônus vigente', [effect(without_panache), effect(with_panache, 'panache')])
    def rage(value):
        return {'alvo': 'dano', 'tipo': 'sem-tipo', 'grupo': 'furia-instinto', 'valor': value,
                'condicao': 'furia', 'reduzAgil': True, 'apenasCorpoACorpo': True}
    classes['barbaro']['efeitos'] = [rage(2)]
    instincts = {o['id']: o for o in classes['barbaro']['opcoes']}
    for id, damage in [('furia', [3, 7, 13]), ('espirito', [3, 7, 13]), ('dragao', [4, 8, 16])]:
        o = instincts[id]
        o['efeitos'] = [rage(damage[0])]
        o['progressao'] = [{'nivel': n, 'efeitos': [rage(v)]} for n, v in zip([7, 15], damage[1:])]
    instincts['furia']['bonusTalentos'] = [{'tipo': 'classe', 'nivel': 1, 'quantidade': 1}]
    instincts['espirito']['tipoDanoFuria'] = 'espiritual'
    dragons = [('adamante', 'Adamante', 'primal', 'contundente'), ('conspirador', 'Conspirador', 'ocultista', 'veneno'),
               ('diabolico', 'Diabólico', 'divina', 'fogo'), ('empireo', 'Empíreo', 'divina', 'espiritual'),
               ('fortuna', 'Fortuna', 'arcana', 'forca'), ('cornudo', 'Cornudo', 'primal', 'veneno'),
               ('miragem', 'Miragem', 'arcana', 'mental'), ('pressagio', 'Presságio', 'ocultista', 'mental')]
    instincts['dragao']['escolhasExtras'] = [{'id': 'dragao-instinto', 'nome': 'Dragão do instinto', 'nivel': 1,
        'opcoes': [{'id': id, 'nome': name, 'tradicao': trad, 'tipoDanoFuria': damage} for id, name, trad, damage in dragons]}]
    animals = [
        ('macaco', 'Macaco', [('punho', 'Punho', '1d10', 'contundente', ['agarrar'])]),
        ('urso', 'Urso', [('mandibula', 'Mandíbula', '1d10', 'perfurante', []), ('garra', 'Garra', '1d6', 'cortante', ['agil'])]),
        ('touro', 'Touro', [('chifre', 'Chifre', '1d10', 'perfurante', ['empurrar'])]),
        ('felino', 'Felino', [('mandibula', 'Mandíbula', '1d10', 'perfurante', []), ('garra', 'Garra', '1d6', 'cortante', ['agil'])]),
        ('cervo', 'Cervo', [('galhada', 'Galhada', '1d10', 'perfurante', ['agarrar'])]),
        ('sapo', 'Sapo', [('mandibula', 'Mandíbula', '1d10', 'contundente', []), ('lingua', 'Língua', '1d6', 'contundente', ['agil'])]),
        ('tubarao', 'Tubarão', [('mandibula', 'Mandíbula', '1d10', 'perfurante', ['agarrar'])]),
        ('serpente', 'Serpente', [('presas', 'Presas', '1d10', 'perfurante', ['agarrar'])]),
        ('lobo', 'Lobo', [('mandibula', 'Mandíbula', '1d10', 'perfurante', ['derrubar'])]),
    ]
    instincts['animal']['escolhasExtras'] = [{'id': 'animal-instinto', 'nome': 'Animal do instinto', 'nivel': 1,
        'opcoes': [{'id': id, 'nome': name, 'ataques': [{'id': 'instinto-' + id + '-' + aid, 'nome': aname,
            'tipo': 'arma', 'grau': 'desarmado', 'grupo': 'pugilato', 'dano': dice, 'tipoDano': damage, 'tracos': traits + ['desarmado'],
            'dadoPorNivel': {'1': dice, '7': '1d12' if dice == '1d10' else '1d8'}}
            for aid, aname, dice, damage, traits in attacks]} for id, name, attacks in animals]}]
    for id, damage in [('animal', [2, 5, 12]), ('gigante', [6, 10, 18]), ('supersticao', [3, 7, 13])]:
        # Target/equipment-dependent conditions must be applied by the executor.
        instincts[id]['danoFuriaPorNivel'] = dict(zip(['1', '7', '15'], damage))
    instincts['animal']['requerAtaqueDoInstinto'] = True
    instincts['gigante']['requerArmaMaior'] = True
    instincts['supersticao']['danoFuriaAlvoConjuradorPorNivel'] = {'1': 4, '7': 8, '15': 16}
    instincts['supersticao']['escolhasExtras'] = [{'id': 'resistencia-supersticao', 'nome': 'Tradições da resistência', 'nivel': 9,
        'opcoes': [{'id': id, 'nome': name, 'tradicoes': traditions} for id, name, traditions in [
            ('arcana-ocultista', 'Arcana e Ocultista', ['arcana', 'ocultista']), ('arcana-primal', 'Arcana e Primal', ['arcana', 'primal']),
            ('divina-ocultista', 'Divina e Ocultista', ['divina', 'ocultista']), ('divina-primal', 'Divina e Primal', ['divina', 'primal'])]]}]
    for o in instincts.values():
        o['descricao'] = o['descricao'].replace('Escolha de animal e ataques ainda exige registro manual.',
            'Selecione o animal no guia; seus ataques e a progressão de dano são estruturados para cálculo automático.')
        o['descricao'] = o['descricao'].replace('escolha exige registro.', 'selecione o dragão no guia.')
        o['descricao'] = o['descricao'].replace('Resistência cobre duas tradições associadas escolhidas conforme livro; detalhamento pendente.',
            'No nível 7 o dano de Fúria passa a 7, ou 8 contra um alvo visto conjurando na última hora; no nível 15, passa a 13 ou 16. '
            'No nível 9, escolhe resistência a dano de magias de um par de tradições: arcana/ocultista, arcana/primal, divina/ocultista ou divina/primal.')
        o['resumo'] = [o['descricao']]
    classes['campeao']['escolhasExtras'] = [{'id': 'bencao-devoto', 'nome': 'Bênção do Devoto', 'nivel': 3,
        'opcoes': [{'id': 'armamento', 'nome': 'Armamento Abençoado', 'especializacaoCritica': True,
                    'runasPropriedadePermitidas': ['amedrontadora', 'toque-fantasma', 'retornante', 'mutavel', 'vitalizante']},
                   {'id': 'escudo', 'nome': 'Escudo Abençoado', 'reforcoPorNivel': {'3': 'menor', '7': 'inferior', '10': 'moderada', '13': 'superior', '16': 'maior', '19': 'suprema'}},
                   {'id': 'rapidez', 'nome': 'Rapidez Abençoada', 'efeitos': [effect(1.5)], 'beneficiaMontariaSeMontado': True}]}]
    classes['alquimista']['recursosCalculados'] = [
        {'id': 'frascos-versateis', 'nome': 'Frascos Versáteis', 'base': 2, 'porAtributo': 'int', 'minimo': 0,
         'renovacao': 'preparacoes', 'recuperacao': {'minutos': 10, 'quantidadePorNivel': {'1': 2, '9': 3}, 'modo': 'exploracao'}},
        {'id': 'alquimia-avancada', 'nome': 'Itens de Alquimia Avançada', 'base': 4, 'porAtributo': 'int', 'minimo': 0, 'renovacao': 'preparacoes'},
    ]
    classes['barbaro']['recursosCalculados'] = [
        {'id': 'pv-temporarios-furia', 'nome': 'PV temporários de Fúria', 'porNivel': 1, 'porAtributo': 'con', 'minimo': 0,
         'condicao': 'furia', 'substituiPVTemporarios': True, 'naoSoma': True},
    ]
    for c in classes.values():
        c['progressao'].sort(key=lambda g: (g['nivel'], g['nome']))
    cat['fonte']['revisaoMecanicaAdicional'] = 'https://2e.aonprd.com/Classes.aspx — classes Remaster 56–63; consulta em 2026-10-06.'
    from linhagens import aplicar as aplicar_linhagens
    aplicar_linhagens(cat, references)
    oracle_focus = {
        'ancestrais': ('toque-ancestral', 'Toque Ancestral', 'ancestral touch'),
        'batalha': ('transe-da-arma', 'Transe da Arma', 'weapon trance'),
        'ossos': ('sifao-da-alma', 'Sifão da Alma', 'soul siphon'),
        'cosmos': ('chuva-de-estrelas', 'Chuva de Estrelas', 'spray of stars'),
        'chamas': ('aura-incendiaria', 'Aura Incendiária', 'incendiary aura'),
        'vida': ('vinculo-vital', 'Vínculo Vital', 'life link'),
        'conhecimento': ('drenar-mente', 'Drenar Mente', 'brain drain'),
        'tempestade': ('toque-da-tempestade', 'Toque da Tempestade', 'tempest touch'),
    }
    sorc_focus = {
        'aberrante': ('membros-tentaculares', 'Membros Tentaculares', 'tentacular limbs'),
        'angelical': ('halo-angelical', 'Halo Angelical', 'angelic halo'),
        'demoniaca': ('mandibulas-glutonas', 'Mandíbulas Glutonas', "glutton's jaws"),
        'diabolica': ('edito-diabolico', 'Édito Diabólico', 'diabolic edict'),
        'elemental': ('arremesso-elemental', 'Arremesso Elemental', 'elemental toss'),
        'feerica': ('po-de-fada', 'Pó de Fada', 'faerie dust'),
        'bruxa': ('sortilegio-ciumento', 'Sortilégio Ciumento', 'jealous hex'),
        'imperial': ('memorias-ancestrais', 'Memórias Ancestrais', 'ancestral memories'),
        'morta-viva': ('bencao-da-nao-morte', 'Bênção da Não Morte', "undeath's blessing"),
    }
    def focus(row):
        id, name, english = row
        return {'id': id, 'nome': name, 'graduacao': 1, 'tipo': 'foco', 'nivelConcessao': 1,
                'consomeVaga': False, 'referenciaAon': references[english]}
    for o in oracle['opcoes']:
        o['magiasConcedidas'].append(focus(oracle_focus[o['id']]))
    for o in sorc['opcoes']:
        row = ('rajada-de-garras', 'Rajada de Garras', 'flurry of claws') if o['id'].startswith('draconica-') else sorc_focus[o['id']]
        o['magiasConcedidas'].append(focus(row))
    classes['campeao']['escolhasExtras'].insert(0, {'id': 'devocao', 'nome': 'Magia inicial de devoção', 'nivel': 1,
        'opcoes': [{'id': row[0], 'nome': row[1], 'magiasConcedidas': [focus(row)], **extra} for row, extra in [
            (('escudos-do-espirito', 'Escudos do Espírito', 'shields of the spirit'), {}),
            (('imposicao-das-maos', 'Imposição das Mãos', 'lay on hands'), {'fonteDivinaPermitida': 'cura'}),
            (('toque-do-vazio', 'Toque do Vazio', 'touch of the void'), {'fonteDivinaPermitida': 'dano'})]]})
    cat['lacunas'] = [x for x in cat['lacunas'] if not x.startswith('Oráculo: prosa inicial')]
    cat['lacunas'].append('Magias de mistério/linhagem, devoção e qi precisam de blocos individuais revisados e concessões vinculadas para completar a criação automática de todos os conjuradores; quantidades e espaços estão estruturados.')
