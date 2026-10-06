"""Escolhas de evolução baixa, traduzidas manualmente das páginas físicas."""

def aplicar(cat):
    def add(classe, id, name, page, description, summary, **extra):
        cat['talentos'].append({'id': classe + '-' + id, 'nome': name, 'classe': classe,
            'nivel': 2, 'tipo': 'classe', 'fonte': 'player-core-2', 'pagina': page,
            'descricao': description, 'resumo': [summary], 'revisao': 'revisado',
            'somenteConsulta': False, 'requisitos': '', **extra})
    add('alquimista', 'elixires-coagulantes', 'Elixires Coagulantes', 64,
        'Quando uma criatura viva bebe um elixir infundido com o traço cura que você criou, pode imediatamente fazer um teste simples CD 10 para encerrar dano persistente de sangramento.',
        'Seus elixires infundidos de cura permitem um teste CD 10 contra sangramento persistente.',
        testeSimplesAcao={'cd': 10, 'removeCondicao': 'sangramento-persistente', 'acionador': 'beber-elixir-infundido-cura'})
    add('alquimista', 'bomba-fumaca', 'Bomba de Fumaça', 65,
        'Aditivo: pode misturar um aditivo alcatroado a uma bomba alquímica. Ao lançá-la, além dos efeitos normais, cria fumaça em uma explosão de 3 m de raio, centrada no canto escolhido do espaço do alvo ou do espaço onde caiu. Criaturas na área ficam ocultadas, e todas as outras criaturas ficam ocultadas para elas. A fumaça dura 1 minuto ou até um vento forte dissipá-la.',
        'Uma bomba com aditivo também cria fumaça de 3 m de raio por 1 minuto, ocultando criaturas.',
        tracos=['aditivo'], area={'tipo': 'explosao', 'raio': 3, 'duracaoRodadas': 10})
    add('barbaro', 'faro-agucado', 'Faro Aguçado', 78,
        'Enquanto estiver em Fúria, ganha faro impreciso com alcance de 9 m.',
        'Faro impreciso de 9 m durante a Fúria.', sentidos=[{'tipo': 'faro', 'precisao': 'impreciso', 'alcance': 9, 'condicao': 'furia'}])
    add('barbaro', 'golpe-intimidador', 'Golpe Intimidador', 78,
        'Duas ações, com traços emoção, medo e mental. Faça um Golpe corpo a corpo. Se acertar e causar dano, o alvo fica assustado 1; em acerto crítico, assustado 2.',
        'Um Golpe em duas ações: se causar dano, assusta o alvo; crítico aumenta a condição.', acoes=2,
        condicaoNoAcerto={'id': 'assustado', 'valor': 1, 'valorCritico': 2, 'exigeDano': True})
    add('barbaro', 'sem-escapatoria', 'Sem Escapatória', 78,
        'Reação quando um inimigo ao seu alcance tenta se afastar. Ande até seu Deslocamento, seguindo o inimigo e mantendo-o ao alcance durante o movimento, até ele parar ou você gastar todo o movimento. Pode substituir Andar por Escavar, Escalar, Voar ou Nadar se possuir o Deslocamento correspondente.',
        'Segue um inimigo que se afasta, sem superar seu Deslocamento e mantendo-o ao alcance.', acoes='reacao')
    add('barbaro', 'livrar-se', 'Livrar-se', 79,
        'Uma ação com concentração e Fúria. Reduz assustado em 1 e faz uma salvaguarda de Fortitude para se recuperar de enjoado como ao usar uma ação para vomitar. Reduz enjoado em 1 na falha, 2 no sucesso ou 3 no sucesso crítico; falha crítica não reduz enjoado.',
        'Reduz medo e testa Fortitude para diminuir enjoado, mesmo durante a Fúria.', acoes=1)
    add('campeao', 'graca-divina', 'Graça Divina', 95,
        'Reação quando vai tentar uma salvaguarda contra magia, antes de rolar. Recebe +2 de circunstância na salvaguarda que acionou a reação.',
        'Gasta reação antes da rolagem para receber +2 contra uma magia.', acoes='reacao')
    add('campeao', 'saude-divina', 'Saúde Divina', 95,
        'Recebe +2 de estado em salvaguardas contra doenças e venenos e em testes simples para se recuperar de dano persistente de veneno. Aliados na sua aura recebem +1 nesses testes. Seu sucesso contra doença ou veneno vira sucesso crítico; aliados não recebem essa conversão. Se tiver Corpo Sagrado, sua falha crítica contra doença ou veneno vira falha.',
        'Melhora defesas contra doença e veneno; aliados na aura recebem um bônus menor.',
        defesaSituacional={'contra': ['doenca', 'veneno'], 'bonusEstado': 2, 'aliadosNaAura': 1,
                          'sucessoViraCritico': True, 'falhaCriticaViraFalhaRequer': 'corpo-sagrado'})
    add('investigador', 'explorar-erro', 'Explorar Erro', 108,
        'Reação quando uma criatura contra a qual Idealizou Estratagema no turno mais recente falha ou falha criticamente em um Golpe contra você. Dê um Passo.',
        'Reage ao erro de um alvo estudado com um Passo.', acoes='reacao')
    add('investigador', 'pessoa-interesse', 'Pessoa de Interesse', 108,
        'Uma ação, uma vez a cada 10 minutos. Escolha uma criatura visível que, pelo que sabe, não esteja relacionada a nenhuma de suas investigações atuais. Durante 1 minuto, pode Idealizar Estratagema contra ela como ação livre.',
        'Por 1 minuto, estuda um novo suspeito com Estratagema como ação livre.', acoes=1,
        frequencia={'quantidade': 1, 'minutos': 10})
    add('investigador', 'estratagema-compartilhado', 'Estratagema Compartilhado', 108,
        'Quando acerta uma criatura com um ataque cuja rolagem foi substituída por Idealizar Estratagema, designe um aliado. A criatura fica desprevenida contra o próximo ataque desse aliado contra ela, feito antes do início do seu próximo turno.',
        'Um acerto com Estratagema abre a guarda do alvo para um ataque do aliado escolhido.')
    add('monge', 'agarrao-esmagador', 'Agarrão Esmagador', 120,
        'Quando Agarra uma criatura com sucesso, pode causar a ela dano contundente igual ao seu modificador de Força. Pode tornar esse ataque não letal sem penalidade.',
        'Um Agarrar bem-sucedido pode causar dano igual à Força.',
        danoAcao={'acao': 'agarrar', 'resultado': 'sucesso', 'atributo': 'for', 'tipoDano': 'contundente', 'naoLetalOpcional': True})
    add('monge', 'folha-dancante', 'Folha Dançante', 121,
        'Ao Saltar ou obter sucesso em Salto em Altura ou Salto em Distância, aumenta a distância saltada em 1,5 m. Ao calcular dano de queda, desconsidere a distância caída enquanto esteve adjacente a uma parede.',
        'Salta 1,5 m mais longe; queda junto a parede não conta para o dano.', distanciaSaltoAdicional=1.5)
    add('monge', 'golpes-atordoantes', 'Golpes Atordoantes', 122,
        'Requer Rajada de Golpes. Ao usar os dois Golpes da Rajada contra a mesma criatura, se ao menos um acertar e causar dano, o alvo precisa de uma salvaguarda de Fortitude contra sua CD de classe. Falha: atordoado 1. Falha crítica: atordoado 3. O efeito tem incapacitação: criatura de nível maior que o seu melhora o resultado da salvaguarda em um grau.',
        'Uma Rajada com dano contra o mesmo alvo pode atordoar; usa sua CD de classe.',
        requisitos='Rajada de Golpes', requisitosEstruturados={'capacidades': ['rajada-de-golpes']},
        salvaguardaAcao={'acao': 'rajada-de-golpes', 'salvaguarda': 'fortitude', 'cd': 'classe',
            'incapacitacao': True, 'condicaoFalha': {'id': 'atordoado', 'valor': 1}, 'condicaoFalhaCritica': {'id': 'atordoado', 'valor': 3}})
    add('oraculo', 'expansao-truques', 'Expansão de Truques', 139,
        'Adiciona dois truques de sua lista de magias ao repertório.',
        'Aprende dois truques adicionais.', conjuracao={'truquesExtras': 2})
    add('oraculo', 'egide-divina', 'Égide Divina', 139,
        'Reação quando vai tentar uma salvaguarda contra um efeito mágico, antes de rolar. Até o início do seu próximo turno, recebe +1 de circunstância nas salvaguardas contra efeitos mágicos não divinos, mas sofre −1 de circunstância nas salvaguardas contra efeitos divinos.',
        'Proteção contra magia não divina por reação, com vulnerabilidade equivalente à magia divina.', acoes='reacao')
    add('oraculo', 'futuros-intrometidos', 'Futuros Intrometidos', 140,
        'Uma ação divina ligada à maldição. Role 1d4: 1, Guerreiro — sua próxima ação precisa ser um Golpe, com +1 de estado no ataque e +2 de estado no dano (+6 se amaldiçoado 3 ou mais). 2, Adepto — próximo teste de Percepção ou ação de perícia recebe +1 de estado (+2 se amaldiçoado 3 ou mais). 3, Sábio — precisa Conjurar Magia; dano ou cura recebe bônus de estado igual à graduação da magia (graduação +3 se amaldiçoado 3 ou mais). 4, Andarilho — precisa Andar, ou Voar, Escalar ou Escavar se tiver esse Deslocamento; para essa ação, recebe +3 m de estado no Deslocamento (+6 m se amaldiçoado 3 ou mais). Se tentar uma ação diferente, faça teste simples CD 6; falha perde a ação. Por ser ligada à maldição, usar a habilidade aumenta amaldiçoado após resolver o efeito.',
        'Um espírito define e melhora sua próxima ação. Desobedecer arrisca perdê-la e o uso agrava a maldição.', acoes=1,
        tracos=['divino', 'ligado-a-maldicao'])
    add('espadachim', 'primeiro-voce', 'Primeiro Você', 166,
        'Ação livre quando vai rolar iniciativa. Não rola; aceita agir por último e ganha panache. Se mais de uma criatura aceitar agir por último, resolva empate normalmente: PNJs e monstros antes dos personagens, e os integrantes de cada grupo escolhem sua ordem.',
        'Aceita agir por último na iniciativa para ganhar panache.', acoes='livre')
    add('espadachim', 'antagonizar', 'Antagonizar', 166,
        'Ao Desmoralizar uma criatura com sucesso, assustado não pode cair abaixo de 1 no fim do turno dela até que use uma ação hostil contra você ou deixe de percebê-lo por pelo menos 1 rodada.',
        'Mantém o medo de um alvo desmoralizado até ele reagir contra você ou perder sua presença.')
    add('espadachim', 'atravessar-guarda', 'Atravessar a Guarda', 166,
        'Quando obtém sucesso em Atravessar, a criatura atravessada fica desprevenida contra o próximo ataque que fizer antes do fim do seu turno.',
        'Atravessar com sucesso abre a guarda para seu próximo ataque neste turno.')
    classes = {c['id']: c for c in cat['classes']}
    classes['monge']['capacidades'] = ['rajada-de-golpes']
    for t in cat['talentos']:
        if t['id'] == 'feiticeiro-expansao-truques':
            t['conjuracao'] = {'truquesExtras': 2}
