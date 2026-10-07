"""Tradução editorial manual do PC2, páginas físicas 79–80 e 121–123.

Os metadados descrevem a regra, sem fingir que o executor de combate já
implementa ações compostas, gatilhos ou efeitos situacionais.
"""

def aplicar(cat):
    def add(classe, id, nome, nivel, pagina, descricao, resumo, **extra):
        talento = dict(
            id=f'{classe}-{id}', nome=nome, classe=classe, tipo='classe',
            nivel=nivel, pagina=pagina, fonte='player-core-2',
            descricao=descricao, resumo=[resumo], revisao='revisado',
            somenteConsulta=True, requisitos='',
            automacao={'estado': 'pendente', 'motivo':
                'Texto revisado; executor específico desta habilidade ainda não implementado.'})
        talento.update(extra)
        cat['talentos'].append(talento)

    add('monge', 'punho-elemental', 'Punho Elemental', 2, 121,
        'Requer Agitação Interior. Ao conjurar Agitação Interior, além dos tipos de dano normais, pode escolher energia elemental. Acrescente o traço do elemento e use o tipo correspondente: ar causa eletricidade; terra, contundente; fogo, fogo; metal, cortante; água, frio; madeira, contundente. Esta escolha modifica o dano extra da magia, não todo o dano do Golpe.',
        'Agitação Interior pode usar seis elementos; altera somente o dano extra da magia.',
        requisitos='Agitação Interior', requisitosEstruturados={'magias': ['agitacao-interior']},
        alteraMagia={'id': 'agitacao-interior', 'tiposElementais': {
            'ar': 'eletricidade', 'terra': 'contundente', 'fogo': 'fogo',
            'metal': 'cortante', 'agua': 'frio', 'madeira': 'contundente'}})
    add('monge', 'postura-estrelas-cadentes', 'Postura das Estrelas Cadentes', 2, 121,
        'Uma ação com traço postura. Requer Armamento Monástico. Enquanto estiver nesta postura, pode usar shurikens no lugar de ataques desarmados para seus talentos e habilidades de monge que normalmente exigem ataques desarmados. A postura segue as restrições gerais de posturas: somente em encontros, uma ação de postura por rodada e termina se entrar em outra postura, ficar inconsciente, violar requisitos ou encerrar o encontro.',
        'Permite usar shurikens nas habilidades de monge que exigem ataques desarmados.',
        acoes=1, tracos=['postura'], requisitos='Armamento Monástico',
        substituicaoAtaque={'postura': 'estrelas-cadentes', 'origem': 'desarmado', 'arma': 'shuriken'})
    add('monge', 'postura-cobra', 'Postura da Cobra', 4, 122,
        'Uma ação com traço postura. Nesta postura, os únicos Golpes que pode fazer são ataques desarmados de presa da cobra: 1d4 perfurante, grupo pugilato, traços ágil, mortal d10, acuidade, desarmado e venenoso. Venenoso acrescenta 1 de dano persistente de veneno em um acerto, ou 2 se o ataque tiver runa impactante maior. Recebe +1 de circunstância nas salvaguardas de Fortitude e na CD de Fortitude, além de resistência a veneno igual à metade do seu nível. Frações são arredondadas para baixo.',
        'Postura com presa ágil e venenosa, bônus de Fortitude e resistência a veneno.',
        acoes=1, tracos=['postura'], ataquePostura={'id': 'presa-cobra', 'dados': '1d4',
            'tipoDano': 'perfurante', 'grupo': 'pugilato',
            'tracos': ['agil', 'mortal-d10', 'acuidade', 'desarmado', 'venenoso']},
        resistenciaSituacional={'tipo': 'veneno', 'formula': 'metade-nivel'},
        defesaSituacional={'salvaguarda': 'fortitude', 'cdFortitude': True, 'bonusCircunstancia': 1})
    add('monge', 'desviar-projetil', 'Desviar Projétil', 4, 122,
        'Reação quando é alvo de um ataque físico à distância. Precisa perceber o ataque, não estar desprevenido contra ele e ter uma mão livre. Recebe +4 de circunstância na CA contra esse ataque. Se o ataque errar, desviou o projétil. Não pode desviar projéteis excepcionalmente grandes, como rochas de cerco ou virotes de balista.',
        'Reação e mão livre: +4 de circunstância na CA contra um projétil físico.',
        acoes='reacao', defesaSituacional={'contra': 'ataque-fisico-distancia', 'bonusCircunstancia': 4})
    add('monge', 'rajada-manobras', 'Rajada de Manobras', 4, 122,
        'Requer especialista em Atletismo. Ao usar Rajada de Golpes, pode substituir um ou ambos os ataques por Agarrar, Reposicionar, Empurrar ou Derrubar. Essas manobras conservam suas próprias regras e a penalidade por ataques múltiplos; o talento não concede ataques extras.',
        'Substitui os ataques da Rajada por manobras de Atletismo.',
        requisitos='Especialista em Atletismo', requisitosEstruturados={'pericias': {'atletismo': 2}},
        substituicaoAcao={'origem': 'rajada-de-golpes', 'opcoes': ['agarrar', 'reposicionar', 'empurrar', 'derrubar']})
    add('monge', 'chute-voador', 'Chute Voador', 4, 122,
        'Duas ações. Salte ou tente um Salto em Altura ou Salto em Distância. Ao fim do salto, se estiver adjacente a um inimigo, pode imediatamente fazer um Golpe desarmado contra ele, mesmo se estiver no ar. Cai ao chão depois do Golpe. Se a distância da queda não exceder a altura do salto, aterrissa em pé e não sofre dano de queda.',
        'Salta e faz um Golpe desarmado ao chegar adjacente ao inimigo.',
        acoes=2, sequenciaAcao=['salto', 'golpe-desarmado'], quedaSeguraAteAlturaSalto=True)
    add('monge', 'movimento-protegido', 'Movimento Protegido', 4, 122,
        'Recebe +4 de circunstância na CA contra reações acionadas pelo seu movimento. O bônus não vale contra todos os ataques: só contra as reações cujo gatilho foi você se mover.',
        '+4 de circunstância na CA contra reações provocadas por movimento.',
        defesaSituacional={'contra': 'reacao-acionada-movimento', 'bonusCircunstancia': 4})
    add('monge', 'harmonizar-se', 'Harmonizar-se', 4, 122,
        'Requer Magias de Qi. Aprende a magia de qi Harmonizar-se. É uma magia de foco; suas regras de custo, elevação automática e limite de reserva seguem Magias de Qi. A concessão da magia não inventa sua ficha de efeito: consulte o bloco próprio de Harmonizar-se.',
        'Aprende a magia de foco Harmonizar-se.', requisitos='Magias de Qi',
        requisitosEstruturados={'talentos': ['monge-magias-qi']},
        magiasConcedidas=[{'id': 'harmonizar-se', 'nome': 'Harmonizar-se', 'tipo': 'foco', 'graduacao': 2}])
    add('monge', 'ficar-parado', 'Ficar Parado', 4, 122,
        'Reação quando uma criatura no seu alcance usa uma ação de movimento ou deixa um quadrado durante a ação de movimento que está usando. Faça um Golpe corpo a corpo contra ela. Se acertar criticamente e o gatilho tiver sido usar uma ação de movimento, interrompe essa ação. Um crítico acionado apenas pela saída do quadrado não concede automaticamente essa interrupção.',
        'Reação: golpeia quem se move ao alcance; pode interromper uma ação de movimento no crítico.',
        acoes='reacao', golpeReacao={'gatilhos': ['acao-movimento', 'sair-quadrado'], 'interrompeCritico': 'acao-movimento'})
    add('monge', 'armamento-monastico-avancado', 'Armamento Monástico Avançado', 6, 122,
        'Requer Armamento Monástico. Para fins de proficiência, trata armas avançadas de monge como armas marciais de monge. Isso modifica a categoria utilizada para sua proficiência; não transforma a arma em ataque desarmado nem remove seus traços.',
        'Usa sua proficiência em armas marciais de monge com armas avançadas de monge.',
        requisitos='Armamento Monástico', proficienciaArmaSubstituicao={'traco': 'monge', 'de': 'avancada', 'para': 'marcial'})
    add('monge', 'magias-qi-avancadas', 'Magias de Qi Avançadas', 6, 122,
        'Requer Magias de Qi. Aprende Explosão de Qi, Encurtar o Intervalo ou outra magia de qi de monge de 3ª graduação à qual tenha acesso. É uma escolha de uma magia, não a concessão de todas as opções. A reserva de foco segue as regras de Magias de Qi, com máximo de 3 pontos.',
        'Escolhe uma magia de qi de 3ª graduação à qual tenha acesso.',
        requisitos='Magias de Qi', escolhaMagia={'tipo': 'foco', 'classe': 'monge', 'graduacao': 3, 'quantidade': 1})
    add('monge', 'alinhar-qi', 'Alinhar Qi', 6, 122,
        'Reação, uma vez por hora. Requer Magias de Qi. O gatilho é você Conjurar uma Magia com o traço monge. Recupera PV iguais ao seu nível mais seu modificador de Sabedoria. A cura não pode exceder seus PV máximos.',
        'Após conjurar uma magia de monge, cura nível + Sabedoria; uma vez por hora.',
        acoes='reacao', requisitos='Magias de Qi', frequencia={'quantidade': 1, 'minutos': 60},
        curaAcao={'formula': 'nivel+mod-sab', 'gatilho': 'conjurar-magia-traco-monge'})
    add('monge', 'bater-asas-grou', 'Bater de Asas do Grou', 6, 122,
        'Reação quando um atacante observado mira você com um ataque. Requer Postura do Grou e estar nessa postura. O bônus de circunstância na CA da postura aumenta para +3 contra o ataque que acionou a reação. Se ele errar e o atacante estiver ao seu alcance, pode imediatamente fazer um Golpe de asa do grou contra ele com penalidade de −2.',
        'Reação: CA +3 da Postura do Grou contra o ataque; um erro permite contra-atacar com −2.',
        acoes='reacao', requisitos='Postura do Grou', requisitosEstruturados={'talentos': ['monge-postura-grou']},
        defesaSituacional={'postura': 'grou', 'bonusCircunstancia': 3}, contraAtaque={'penalidade': -2, 'exigeErro': True})
    add('monge', 'rugido-dragao', 'Rugido do Dragão', 6, 122,
        'Uma ação com traços auditivo, emoção, medo e mental. Requer Postura do Dragão e estar nessa postura. Inimigos em emanação de 4,5 m fazem uma salvaguarda de Vontade contra sua CD de Intimidação: na falha ficam assustados 1; na falha crítica, assustados 2. Uma criatura assustada pelo rugido que iniciar seu turno adjacente a você não pode reduzir assustado abaixo de 1 nesse turno. Seu primeiro ataque que acertar uma criatura assustada após rugir e até o fim do seu próximo turno recebe +4 de circunstância no dano. Depois de usar, espere 1d4 rodadas para usar novamente. Os efeitos terminam imediatamente se sair da Postura do Dragão. Criaturas na área ficam então temporariamente imunes por 1 minuto.',
        'Rugido amedronta inimigos próximos e melhora o dano de um acerto contra um alvo assustado.',
        acoes=1, requisitos='Postura do Dragão', tracos=['auditivo', 'emocao', 'medo', 'mental'],
        salvaguardaAcao={'salvaguarda': 'vontade', 'cd': 'intimidacao', 'condicaoFalha': {'id': 'assustado', 'valor': 1},
            'condicaoFalhaCritica': {'id': 'assustado', 'valor': 2}},
        area={'tipo': 'emanacao', 'raio': 4.5}, recarga={'dados': '1d4', 'unidade': 'rodadas'})
    add('monge', 'fortaleza-montanha', 'Fortaleza da Montanha', 6, 123,
        'Uma ação. Requer Postura da Montanha e estar nessa postura. Recebe +2 de circunstância na CA até o início do seu próximo turno. Além disso, ter este talento aumenta o limite de modificador de Destreza na CA da Postura da Montanha de +0 para +1; esse aumento é permanente enquanto usa a postura, não só durante a ação.',
        'Na Postura da Montanha, permite Destreza +1 na CA; uma ação concede CA +2 até seu próximo turno.',
        acoes=1, requisitos='Postura da Montanha',
        defesaSituacional={'postura': 'montanha', 'bonusCircunstancia': 2, 'duracao': 'inicio-proximo-turno', 'limiteDestreza': 1})
    add('monge', 'soco-uma-polegada', 'Soco de Uma Polegada', 6, 123,
        'Duas ou três ações. Requer golpes especialistas. Faça um Golpe desarmado. Com duas ações, um acerto causa 1 dado adicional de dano da arma; com três ações, 2 dados adicionais. A partir do nível 10, são 2 dados para duas ações ou 4 para três. A partir do nível 18, são 3 dados para duas ações ou 6 para três. Esses são dados adicionais do ataque desarmado utilizado, não uma fórmula fixa de d6.',
        'Um Golpe desarmado concentra duas ou três ações para acrescentar dados de dano.',
        acoes=[2, 3], requisitos='Golpes especialistas',
        dadosAdicionaisPorAcoes={'2': [{'nivel': 6, 'dados': 1}, {'nivel': 10, 'dados': 2}, {'nivel': 18, 'dados': 3}],
            '3': [{'nivel': 6, 'dados': 2}, {'nivel': 10, 'dados': 4}, {'nivel': 18, 'dados': 6}]})
    add('monge', 'devolver-fogo', 'Devolver Fogo', 6, 123,
        'Requer Desviar Projétil e Postura do Arqueiro Monástico. Precisa estar nessa postura, empunhar um arco e ter uma mão livre. Quando desviar com sucesso um projétil que seja uma flecha, como parte dessa mesma reação pode imediatamente fazer um Golpe à distância com seu arco, disparando a flecha que desviou. Não concede uma reação extra nem funciona com qualquer tipo de projétil.',
        'Ao desviar uma flecha, pode devolvê-la com seu arco como parte da mesma reação.',
        requisitos='Desviar Projétil e Postura do Arqueiro Monástico',
        requisitosEstruturados={'talentos': ['monge-desviar-projetil']},
        contraAtaque={'origem': 'desviar-projetil', 'exigeProjetil': 'flecha', 'arma': 'arco'})
    add('monge', 'finta-cambaleante', 'Finta Cambaleante', 6, 123,
        'Requer especialista em Dissimulação e Postura Cambaleante; precisa estar nessa postura. Ao usar Rajada de Golpes, pode tentar Fintar como ação livre imediatamente antes do primeiro Golpe. Em sucesso, em vez de deixar o alvo desprevenido apenas contra seu próximo ataque, ele fica desprevenido contra os dois ataques dessa Rajada.',
        'Finta livre antes da Rajada; sucesso deixa o alvo desprevenido contra os dois Golpes.',
        requisitos='Especialista em Dissimulação e Postura Cambaleante',
        requisitosEstruturados={'pericias': {'enganacao': 2}},
        sequenciaAcao=['fintar-livre', 'rajada-de-golpes'], fintaSucesso={'ataques': 2})

    add('barbaro', 'investida-arrasadora', 'Investida Arrasadora', 4, 79,
        'Duas ações com traço floreio. Requer treinado em Atletismo. Ande, tentando atravessar espaços de inimigos, e faça um Golpe corpo a corpo. Role um teste de Atletismo e compare esse mesmo resultado à CD de Fortitude de cada criatura cujo espaço tentar atravessar: em sucesso atravessa; em falha encerra o movimento antes de entrar no espaço dela. Pode substituir Andar por Escavar, Escalar, Voar ou Nadar se tiver o Deslocamento correspondente.',
        'Avança através de inimigos com Atletismo e termina com um Golpe corpo a corpo.',
        acoes=2, tracos=['floreio'], requisitos='Treinado em Atletismo',
        requisitosEstruturados={'pericias': {'atletismo': 1}}, sequenciaAcao=['andar', 'golpe-corpo-a-corpo'])
    add('barbaro', 'arremesso-colossal', 'Arremesso Colossal', 4, 79,
        'Uma ação com traço Fúria. Requer uma ou mais mãos livres. Pegue um objeto do cenário do seu tamanho ou uma categoria menor, cuja Volume possa erguer, e faça um Golpe à distância. O objeto conta como arma simples à distância: 1d10 contundente, incremento de distância de 6 m e traço arremesso. O dano aumenta para 2d10 se tiver especialização em armas simples e 3d10 se tiver especialização em armas maior. Independentemente do resultado do ataque, o próprio objeto sofre o dano que causaria em um acerto.',
        'Arremessa um objeto do cenário; o dano cresce com especialização e também danifica o objeto.',
        acoes=1, tracos=['furia'], ataqueTemporario={'dados': '1d10', 'tipoDano': 'contundente', 'categoria': 'simples',
            'incrementoDistancia': 6, 'tracos': ['arremesso'], 'dadosEspecializacao': 2, 'dadosEspecializacaoMaior': 3})
    add('barbaro', 'atleta-furioso', 'Atleta Furioso', 4, 79,
        'Requer especialista em Atletismo. Durante a Fúria, recebe Deslocamentos de escalada e natação iguais ao seu Deslocamento terrestre; as CDs de Salto em Altura e Salto em Distância diminuem em 10. Seu Salto vertical alcança 1,5 m. O Salto horizontal alcança 4,5 m se seu Deslocamento for pelo menos 4,5 m, ou 6 m se for pelo menos 9 m.',
        'Durante a Fúria, escala e nada à velocidade terrestre e melhora saltos.',
        requisitos='Especialista em Atletismo', requisitosEstruturados={'pericias': {'atletismo': 2}},
        movimentoSituacional={'condicao': 'furia', 'escalada': 'terrestre', 'natacao': 'terrestre', 'reducaoCdSaltos': 10})
    add('barbaro', 'cicatrizes-aco', 'Cicatrizes de Aço', 4, 79,
        'Reação, uma vez por dia. Requer instinto da fúria e estar em Fúria. O gatilho é um oponente acertar você criticamente com um ataque que cause dano físico. Recebe resistência ao ataque que acionou a reação igual ao seu modificador de Constituição mais metade do nível, arredondada para baixo. A resistência vale apenas para o ataque que acionou a reação.',
        'Uma vez por dia, reação reduz o dano de um crítico físico por Constituição + metade do nível.',
        acoes='reacao', requisitos='Instinto da fúria', frequencia={'quantidade': 1, 'dias': 1},
        resistenciaSituacional={'contra': 'ataque-critico-fisico', 'formula': 'mod-con+metade-nivel', 'condicao': 'furia'})
    add('barbaro', 'guias-espirituais', 'Guias Espirituais', 4, 79,
        'Reação com traço fortuna, uma vez por dia. Requer instinto espiritual. O gatilho é falhar, sem falhar criticamente, em um teste de Percepção ou de perícia. Role novamente o teste e use o segundo resultado, mesmo que seja pior. Como efeito de fortuna, não pode combiná-lo com outro efeito de fortuna na mesma rolagem.',
        'Uma vez por dia, repete uma falha em Percepção ou perícia e fica com o segundo resultado.',
        acoes='reacao', tracos=['fortuna'], requisitos='Instinto espiritual', frequencia={'quantidade': 1, 'dias': 1},
        repeticaoTeste={'resultado': 'falha', 'tipos': ['percepcao', 'pericia'], 'usarSegundo': True})
    add('barbaro', 'sentidos-sobrenaturais', 'Sentidos Sobrenaturais', 4, 79,
        'Requer Faro Aguçado ou possuir faro. Enquanto estiver em Fúria, ao mirar um oponente ocultado ou escondido, diminui a CD do teste simples para 3 se estiver ocultado, ou 9 se estiver escondido. Não elimina o teste nem torna automaticamente uma criatura indetectada um alvo conhecido.',
        'Na Fúria, faro reduz os testes simples contra ocultado para CD 3 e escondido para CD 9.',
        requisitos='Faro Aguçado ou faro', testesSimplesSituacionais={'condicao': 'furia', 'ocultado': 3, 'escondido': 9})
    add('barbaro', 'varredura', 'Varredura', 4, 79,
        'Duas ações com traço floreio. Faça um único Golpe corpo a corpo e compare o resultado da rolagem de ataque à CA de até dois inimigos. Ambos precisam estar ao seu alcance e adjacentes um ao outro. Role o dano uma única vez e aplique-o a cada criatura atingida. Varredura conta como dois ataques para a penalidade por ataques múltiplos. Se a arma possuir o traço varredura, seu modificador se aplica aos ataques desta atividade.',
        'Uma rolagem de ataque e dano pode atingir dois inimigos adjacentes; conta como dois ataques.',
        acoes=2, tracos=['floreio'], ataqueComposto={'alvosMaximos': 2, 'alvosAdjacentes': True,
            'rolagemAtaqueUnica': True, 'rolagemDanoUnica': True, 'incrementoAtaquesMultiplos': 2})
    add('barbaro', 'furia-ferida', 'Fúria Ferida', 4, 79,
        'Reação quando sofre dano e é capaz de entrar em Fúria. Você usa Fúria. Precisa cumprir todas as restrições para entrar em Fúria: o gatilho não remove impedimentos nem altera o intervalo entre fúrias.',
        'Reação ao sofrer dano permite entrar em Fúria se estiver apto a usá-la.',
        acoes='reacao', acaoConcedida={'id': 'furia', 'gatilho': 'sofrer-dano', 'respeitaRestricoes': True})
    add('barbaro', 'brutamontes-brutal', 'Brutamontes Brutal', 6, 80,
        'Requer especialista em Atletismo. Durante a Fúria, quando Desarma, Agarra, Reposiciona, Empurra ou Derruba um inimigo com sucesso, causa a ele dano contundente igual ao seu modificador de Força. Acrescente esse dano ao dano de um sucesso crítico em Derrubar.',
        'Manobras bem-sucedidas na Fúria causam dano contundente igual à Força.',
        requisitos='Especialista em Atletismo', requisitosEstruturados={'pericias': {'atletismo': 2}},
        danoAcao={'acoes': ['desarmar', 'agarrar', 'reposicionar', 'empurrar', 'derrubar'],
            'resultado': 'sucesso', 'atributo': 'for', 'tipoDano': 'contundente', 'condicao': 'furia'})
    add('barbaro', 'trespassar', 'Trespassar', 6, 80,
        'Reação com traço Fúria. O gatilho é seu Golpe corpo a corpo reduzir um inimigo a 0 PV, enquanto outro inimigo está adjacente a ele. Faça um Golpe corpo a corpo contra o segundo inimigo. Continua necessário alcançar o alvo com o Golpe; o talento não aumenta seu alcance.',
        'Ao derrubar um inimigo, reação permite golpear outro adjacente a ele.',
        acoes='reacao', tracos=['furia'], golpeReacao={'gatilho': 'golpe-corpo-a-corpo-reduz-pv-zero', 'alvoAdjacenteAoDerrotado': True})
    add('barbaro', 'sopro-furia-dragao', 'Sopro da Fúria do Dragão', 6, 80,
        'Duas ações, uma vez a cada 10 minutos. Requer instinto dracônico e estar em Fúria. Sopre energia em um cone de 9 m. Cada criatura na área sofre 1d6 de dano por nível, com salvaguarda básica de Reflexos contra sua CD de classe. O tipo de dano corresponde ao sopro escolhido no instinto dracônico, e a ação recebe o traço da tradição do seu instinto.',
        'Na Fúria, cone de 9 m causa 1d6 por nível; Reflexos básico contra sua CD de classe.',
        acoes=2, requisitos='Instinto dracônico', frequencia={'quantidade': 1, 'minutos': 10},
        area={'tipo': 'cone', 'comprimento': 9},
        danoAcao={'formula': 'nivel-d6', 'tipoDano': 'instinto-draconico'},
        salvaguardaAcao={'salvaguarda': 'reflexos', 'cd': 'classe', 'basica': True})
    add('barbaro', 'estatura-gigante', 'Estatura de Gigante', 6, 80,
        'Uma ação. Requer instinto gigante e tamanho Médio ou menor. Durante a Fúria, torna-se Grande, aumenta o alcance em 1,5 m e recebe desajeitado 1 até a Fúria terminar. Seu equipamento cresce com você. A mudança de tamanho não autoriza acumular duas vezes aumentos iguais de alcance ou ignorar outras regras de tamanho.',
        'Na Fúria, fica Grande, ganha alcance de 1,5 m e recebe desajeitado 1.',
        acoes=1, requisitos='Instinto gigante; tamanho Médio ou menor',
        estadoSituacional={'condicao': 'furia', 'tamanho': 'grande', 'alcanceAdicional': 1.5, 'condicoes': [{'id': 'desajeitado', 'valor': 1}]})
    add('barbaro', 'forca-interior', 'Força Interior', 6, 80,
        'Uma ação com traços concentração e Fúria. Requer instinto espiritual. Reduz o valor da condição enfraquecido em 1. Não reduz outras condições nem permite valores negativos.',
        'Uma ação durante a Fúria reduz enfraquecido em 1.',
        acoes=1, tracos=['concentracao', 'furia'], requisitos='Instinto espiritual',
        reduzCondicao={'id': 'enfraquecido', 'valor': 1})

    add('oraculo', 'golpe-enfeiticado', 'Golpe Enfeitiçado', 4, 140,
        'Ação livre, uma vez por turno. Sua ação mais recente precisa ter sido conjurar uma magia que não seja truque. Até o fim do seu turno, uma arma que empunha ou um de seus ataques desarmados causa 1d6 adicional de dano de força e ganha o traço divino se ainda não o tiver. Se a magia causou outro tipo de dano, o Golpe causa esse tipo adicional em vez de força; se a magia podia causar vários tipos, escolha um deles. O bônus vale para a arma ou ataque escolhido e não concede um Golpe extra.',
        'Depois de uma magia, uma arma ou ataque desarmado causa +1d6 até o fim do turno.',
        acoes='livre', frequencia={'quantidade': 1, 'turnos': 1},
        danoSituacional={'dados': '1d6', 'tipoDanoPadrao': 'forca', 'tipoDanoAlternativo': 'magia-anterior', 'duracao': 'fim-turno'})
    add('oraculo', 'mil-visoes', 'Mil Visões', 4, 140,
        'Ação livre com traços ligado à maldição e divino. Por 1 minuto, visões revelam sutilezas a até 9 m: não precisa de teste simples para mirar criaturas ocultadas; não fica desprevenido contra criaturas escondidas de você, a menos que outro motivo o deixe desprevenido; para mirar uma criatura escondida, basta teste simples CD 5. Além de 9 m, todas as suas percepções ficam imprecisas devido à sobreposição de futuros possíveis. A habilidade não elimina outras causas de desprevenido nem torna uma criatura indetectada automaticamente observada. Como habilidade ligada à maldição, aumenta amaldiçoado conforme as regras da classe.',
        'Por 1 minuto, supera ocultação e melhora percepção próxima; além de 9 m, os sentidos ficam imprecisos.',
        acoes='livre', tracos=['ligado-maldicao', 'divino'],
        percepcaoSituacional={'alcance': 9, 'duracaoRodadas': 10, 'testeOcultado': False,
            'cdEscondido': 5, 'sentidosImprecisosForaAlcance': True})
    add('oraculo', 'revelacao-avancada', 'Revelação Avançada', 6, 141,
        'Requer uma magia inicial de revelação. Aprende a magia avançada de revelação associada ao seu mistério. Essa concessão depende do mistério escolhido; não permite escolher livremente a revelação de outro mistério. As regras das magias de foco continuam valendo.',
        'Aprende a revelação avançada do seu próprio mistério.',
        requisitos='Magia inicial de revelação', escolhaMagia={'tipo': 'foco', 'origem': 'misterio', 'etapa': 'avancada', 'quantidade': 1})
    add('oraculo', 'poder-presenteado', 'Poder Presenteado', 6, 141,
        'Recebe um espaço de magia adicional da sua graduação mais alta. Só pode usá-lo para conjurar uma magia concedida pelo seu mistério, elevada a essa graduação. Se possuir a habilidade de classe Acesso Divino ou o talento Repertório Misterioso, também pode conjurar nesse espaço as magias aprendidas por essas habilidades. O espaço não aumenta seu repertório e não pode ser gasto com qualquer magia conhecida.',
        'Um espaço adicional da maior graduação, restrito às magias do mistério ou de acessos específicos.',
        espacoMagiaEspecial={'quantidade': 1, 'graduacao': 'maior', 'origensPermitidas': ['misterio', 'acesso-divino', 'repertorio-misterioso']})
    add('oraculo', 'sentido-espiritual', 'Sentido Espiritual', 6, 141,
        'Sua ligação vaga com o Plano Etéreo permite perceber espíritos. Durante exploração, mesmo sem Procurar, o mestre faz testes secretos para encontrar assombrações que normalmente exigem Procurar, espíritos, criaturas no Plano Etéreo e seres inteiramente espirituais, como celestiais, ínferos e monitores. Pode perceber criaturas etéreas e espíritos dentro de objetos sólidos se estiverem a até 9 m e não mais que 1,5 m dentro do objeto; isso vale ao Procurar, Buscar e nos testes secretos da exploração. Ainda precisa obter sucesso no teste. Ao perceber uma criatura, descobre sua localização: se estava indetectada, passa a estar escondida para você, não observada.',
        'Permite testes secretos para notar espíritos, inclusive dentro de objetos próximos, sem torná-los observados.',
        sentidos=[{'tipo': 'espiritual', 'precisao': 'impreciso', 'alcanceDentroObjeto': 9, 'profundidadeObjeto': 1.5,
            'exigeTeste': True, 'aoSucesso': 'escondido'}])
    add('oraculo', 'conjuracao-estavel', 'Conjuração Estável', 6, 141,
        'Se a reação de outra criatura fosse interromper sua ação de Conjurar uma Magia, faça um teste simples CD 15. Em sucesso, a ação não é interrompida. Isso não evita o dano ou os demais efeitos da reação e não protege automaticamente contra interrupções que não sejam reações de criaturas.',
        'Teste simples CD 15 pode impedir uma reação inimiga de interromper sua conjuração.',
        testeSimplesAcao={'cd': 15, 'gatilho': 'reacao-interromperia-conjurar', 'sucesso': 'impede-interrupcao'})
