"""Ampliação recuperável das regras gerais do GM Core.

Este módulo mantém apenas texto editorial em português e dados conferidos nas
páginas indicadas. Ele não escreve arquivos por conta própria: reconstruir.py é
o único ponto de saída do catálogo.
"""


def ampliar(d):
    def guia(id_, nome, pagina, texto, resumo):
        d["secoes"].append({
            "id": id_, "nome": nome, "pagina": pagina, "texto": texto,
            "resumo": [resumo], "fonte": "gm-core", "tipo": "guia-revisado",
        })

    # Regras de mesa e adjudicação (capítulos 1–2).
    guia("testes-secretos", "Testes secretos e informação incerta", 15,
          "Quando uma ação possui o traço secreto, o mestre rola sem revelar o resultado. Diga o que o personagem percebe ou conclui, não o número obtido. Em falha crítica, forneça informação falsa somente quando a atividade manda; ela deve ser plausível e não denunciar o grau de sucesso. Se o jogador não deveria saber que houve teste, registre modificadores antes de rolar. Fortuna e infortúnio continuam válidos, mas o jogador não vê os dados. Não transforme em secreto um teste aberto apenas para esconder uma decisão arbitrária.",
          "O mestre rola testes secretos e narra a informação correspondente ao grau de sucesso.")
    guia("adjudicar-acoes", "Adjudicar ações fora das listas", 15,
          "Quando alguém tenta algo sem ação específica, determine intenção, abordagem, tempo, perícia e consequência. Se não houver risco ou pressão, conceda o resultado possível sem rolagem. Havendo incerteza relevante, escolha CD simples ou por nível e declare o que está em jogo. Uma ação criativa não ganha automaticamente efeito maior que um talento ou magia dedicada. Em encontro, compare seu custo ao de ações existentes e deixe claro se exige uma, duas ou três ações, reação ou atividade prolongada.",
          "Só role quando houver incerteza e consequência; defina custo e efeito antes do teste.")
    guia("modos-jogo", "Encontro, exploração e recesso", 30,
          "Encontro usa rodadas e ações quando cada instante importa. Exploração organiza minutos ou horas: cada personagem escolhe atividade, ordem de marcha e ritmo, e o mestre verifica apenas quando surge risco. Recesso cobre dias ou mais, com atividades como Manufaturar, Ganhar Proventos, Recuperar-se ou Retreinar. Mude de modo quando a escala da decisão mudar. A entrada em encontro normalmente parte da posição, atividade e recursos declarados durante exploração; não apague essas escolhas ao pedir iniciativa.",
          "A escala da decisão determina o modo; exploração prepara a posição inicial do encontro.")
    guia("iniciativa-encontros", "Iniciativa e começo do encontro", 24,
          "Percepção é a iniciativa padrão. Use outra perícia quando a atividade imediatamente anterior a justificar, como Furtividade ao Esgueirar ou Enganação ao criar distração. Role uma vez por participante; PNJs idênticos podem compartilhar resultado para agilizar. Determine percepção entre observado, oculto, indetectado e despercebido antes do primeiro turno. Se lados negociavam, sacar arma ou conjurar hostilidade normalmente inicia iniciativa antes de resolver o ataque, salvo efeito explícito.",
          "A atividade anterior define a perícia de iniciativa e o estado de percepção inicial.")
    guia("ajustar-dificuldade", "Ajustar dificuldade sem mover o mundo", 52,
          "Aplique ajustes fácil ou difícil por circunstância específica: ferramenta ideal, informação incompleta, pressão ou ambiente. Não ajuste a mesma razão duas vezes. Raridade usa ajuste próprio quando a regra solicitar. Uma tarefa não sobe de CD apenas porque o grupo ganhou nível. Para desafio recorrente com entidade de nível conhecido, use CD por nível; para qualidade intrínseca, use CD simples. Informe requisitos mínimos de proficiência quando existirem.",
          "Ajuste pela circunstância concreta, uma vez; nível do grupo não altera a tarefa por si só.")
    guia("encontros-tamanho-grupo", "Encontros para grupos de tamanho diferente", 76,
          "O orçamento base pressupõe quatro personagens. Some ou subtraia o ajuste por personagem da ameaça escolhida. Prefira alterar número de criaturas em vez de fortalecer todas; para chefe único, o ajuste elite ou fraco muda nível efetivo e deve ser refletido no XP. Companheiros, aliados temporários e participantes que agem plenamente podem exigir ajuste. A recompensa por personagem continua baseada no orçamento equivalente de quatro, não no total inflado pelo tamanho do grupo.",
          "Ajuste o orçamento por participante ativo, preservando a recompensa equivalente para quatro.")
    guia("recompensas-nao-combate", "Recompensas, feitos e soluções alternativas", 56,
          "Conceda XP ao superar obstáculo, não apenas ao matar. Negociação, fuga, desarme ou descoberta que resolve a mesma ameaça rende a recompensa correspondente uma vez. Feitos menores, moderados e maiores valem 10, 30 e 80 XP. Não some XP de feito por cada etapa já contabilizada como encontros, salvo conquista adicional real. Tesouro e acesso narrativo também podem recompensar sem alterar XP.",
          "Resolver a ameaça por outro método concede XP uma vez; feitos premiam conquistas adicionais.")

    # Ambiente, objetos e perigos.
    guia("objetos-dureza", "Objetos, Dureza e Limiar de Quebra", 93,
          "Dano a objeto é reduzido pela Dureza, salvo efeito que a ignore. Ao atingir o Limiar de Quebra, o objeto fica quebrado e normalmente não funciona ou sofre penalidade; em 0 PV, é destruído. Dano de precisão e acertos críticos geralmente não afetam objetos, que também possuem imunidades próprias. Escolha a parte realmente atacada e o material correspondente. Uma parede grossa pode exigir trabalho ou ferramenta apropriada mesmo quando a tabela oferece estatística de estrutura.",
          "Dureza reduz dano; no Limiar fica quebrado e em 0 PV fica destruído.")
    guia("portas-paredes", "Portas, paredes e passagem forçada", 93,
          "Uma porta pode ser aberta, destrancada, Forçada ou destruída. Use CD simples coerente com construção e fechadura; uma tranca excepcional pode ter nível. Para parede, determine material, espessura e área atacada. Abrir um vão exige destruir seção suficiente, não apenas causar dano uma vez. Escavar ou demolir fora de pressão pode ser resolvido por tempo e ferramentas em vez de repetidas rolagens. Ruído e consequências ambientais continuam relevantes.",
          "Separe fechadura, folha da porta e estrutura; cada uma pode exigir método e estatística próprios.")
    guia("temperatura-clima", "Temperatura, vento e visibilidade", 95,
          "Calor e frio perigosos exigem salvaguardas em intervalos definidos pela severidade, com equipamento e preparação alterando exposição. Precipitação e névoa podem impor ocultação, reduzir visibilidade e apagar chamas. Vento afeta voo, projéteis e objetos leves; vento extremo pode impedir movimento ou exigir verificações. Descreva sinais antes da exposição quando seriam perceptíveis e registre intervalo, CD e condições em vez de aplicar dano improvisado a cada cena.",
          "Registre severidade, intervalo e proteção; clima também altera visão, fogo e movimento.")
    guia("desastres-naturais", "Desastres naturais", 96,
          "Avalanche, inundação, terremoto, incêndio, tornado e outros desastres funcionam como perigos ou sequências de obstáculos. Defina área, aviso, velocidade, duração, salvaguardas, dano e rotas de fuga. Uma sequência deve permitir decisões entre proteger pessoas, salvar recursos e escapar. Não repita dano inevitável sem nova oportunidade de reação. Use nível compatível com a ameaça da cena e conceda XP quando o grupo realmente superar o desastre.",
          "Modele desastre com aviso, progressão e escolhas, usando perigo ou sequência de obstáculos.")
    guia("perigos-deteccao", "Detectar e desativar perigos", 99,
          "Perigo sem proficiência mínima de Furtividade pode ser percebido passivamente pela CD; com grau indicado, exige Procurar com ao menos esse grau. Detectar não desativa nem revela automaticamente toda consequência. Cada método de desarme lista perícia, CD, proficiência e sucessos necessários. Falha crítica pode ativar perigo quando a entrada declarar. Magia só neutraliza quando círculo e teste de neutralização estiverem informados. Permita solução física ou narrativa válida sem apagar requisitos expressos.",
          "Detecção e desarme são etapas separadas; método informa perícia, grau, CD e progresso.")
    guia("perigos-complexos", "Perigos complexos em encontro", 101,
          "Após gatilho, role iniciativa com modificador de Furtividade e execute a rotina no turno do perigo. Componentes desativados podem retirar ações ou alvos conforme a entrada. O perigo não improvisa táticas inteligentes sem essa natureza. Encerrar a rotina, fugir ou neutralizar todos os componentes supera o perigo. Se criaturas participarem do mesmo encontro, inclua todas na ordem e evite cobrar XP duas vezes pela mesma ameaça composta.",
          "Perigo complexo entra na iniciativa e repete rotina até ser neutralizado, evitado ou encerrado.")
    guia("perigos-construcao-final", "Revisar um perigo criado", 111,
          "Confirme nível, tipo simples ou complexo, sinais, gatilho, iniciativa, rotina, alvos, salvaguardas, dano, condições, detecção, cada método de desarme, defesas, reinício e recompensa. Compare todas as estatísticas às tabelas do mesmo nível e identifique qual é extrema; não use extremos em tudo. Teste se personagens conseguem compreender e interromper o perigo e se a rotina resolve casos de alvo ausente, componente quebrado ou área abandonada.",
          "A revisão final verifica bloco completo, contrajogo e coerência entre rotina e componentes.")

    # Construção de criaturas e itens.
    guia("criaturas-conceito-funcao", "Construir criaturas: conceito e função", 112,
          "Comece por conceito, nível e papel: bruto, escaramuçador, soldado, conjurador, controlador ou suporte. Escolha duas ou três forças e ao menos uma fraqueza. Traços, tamanho, idiomas e sentidos vêm do conceito, não do nível. Estatísticas das tabelas são valores finais, já incluindo nível e proficiência; não some atributos novamente. Alterações elite ou fraco servem para ajuste pequeno e não substituem reconstrução ampla.",
          "Defina papel, forças e fraquezas; as tabelas fornecem valores finais.")
    guia("criaturas-pericias-movimento", "Construir criaturas: sentidos, perícias e movimento", 115,
          "Percepção deve refletir papel e sentidos. Liste perícias relevantes e use valores altos apenas nas especialidades; Saber profissional pode ser excepcional sem aumentar combate. Deslocamento terrestre padrão costuma ser 7,5 m, ajustado pelo conceito. Escalada, natação, voo ou escavação alteram muito o encontro e precisam constar explicitamente. Sentidos especiais declaram preciso, impreciso ou vago, alcance e limitações.",
          "Perícias e sentidos seguem especialidade; deslocamentos alternativos mudam o poder tático.")
    guia("criaturas-ataques-dano", "Construir criaturas: ataques e dano", 119,
          "Escolha bônus de ataque e dano em conjunto. Ataque extremo costuma acompanhar dano moderado; dano extremo combina melhor com ataque moderado. Informe alcance, traços, tipo de dano e efeitos adicionais. Dano de área ou automático deve usar CD e valor compatíveis, frequência e área. Ataques secundários podem ter bônus menor ou dano diferente. Não acrescente dados de runa de jogador aos valores finais da tabela.",
          "Equilibre precisão e dano; valores de tabela já são finais e não recebem runas de personagem.")
    guia("criaturas-habilidades", "Construir criaturas: habilidades especiais", 121,
          "Cada habilidade ativa informa ações, traços, alcance ou área, alvo, ataque ou salvaguarda, duração, frequência e graus de sucesso. Reações precisam de gatilho observável. Remover ações, incapacitar ou controlar posição custa grande parte do orçamento de poder. Habilidade invisível ao jogador precisa de pistas quando afeta decisões. Reaproveite estrutura existente quando possível e revise interação com múltiplos alvos e recarga.",
          "Toda habilidade precisa de procedimento completo e seu controle deve corresponder ao nível.")
    guia("criaturas-conjuracao", "Construir criaturas: conjuração", 121,
          "Use CD e ataque de magia da tabela, escolhendo extremo apenas para conjurador dedicado. Selecione tradição, preparação ou espontaneidade, círculos e magias relevantes. Criatura não precisa de lista completa de personagem: mantenha opções que realmente pode usar na cena. Magias de controle, cura e área podem aumentar ameaça além do dano médio; compare rotina provável. Magias inatas informam frequência e atributo apenas quando necessário.",
          "Defina tradição, CD, ataque e repertório útil à cena; avalie controle e área além do dano.")
    guia("criaturas-revisao", "Construir criaturas: revisão e teste", 123,
          "Compare CA, salvaguardas, PV, ataques, dano, CD, mobilidade e ações ao mesmo nível. Simule três rodadas plausíveis e verifique se há ação útil em alcance, contrajogo e fraqueza perceptível. Reavalie habilidade que encerra luta em um resultado comum ou não permite resposta. Confira bloco contra objetivo narrativo e corrija números diretamente, sem reconstruir como personagem. Registre fonte e decisões para manutenção futura.",
          "Teste uma rotina de três rodadas, contrajogo e pontos fracos antes de usar a criatura.")
    guia("itens-nivel-preco", "Construir itens: nível, preço e raridade", 130,
          "O nível mede poder e acesso; preço acompanha tabelas e itens comparáveis, não compra equilíbrio por si só. Comum cabe amplamente no jogo, incomum depende de acesso, raro altera pressupostos e único pertence à história. Defina categoria, uso, Volume, investimento, traços, ativação, frequência e requisitos. Um efeito que remove custo de ação, concede voo permanente ou conjura de forma independente vale mais que bônus numérico semelhante.",
          "Compare função completa, ações e frequência; preço não compensa efeito excessivo.")
    guia("itens-consumiveis", "Construir consumíveis", 131,
          "Consumível concentra poder de uso único e normalmente é destruído após ativação. Indique ação, mãos, alvo e duração. Lote de Manufatura segue regra da atividade; isso não multiplica gratuitamente componentes caros. Munição ativada precisa ser disparada até fim do turno ou perde ativação sem ser consumida, salvo entrada diferente. Óleo geralmente exige duas mãos e alvo ao alcance. Poção é bebida ou administrada a criatura disposta ou indefesa.",
          "Uso único permite efeito concentrado, mas ação, alvo, duração e componentes permanecem explícitos.")
    guia("itens-ativacoes", "Ativações, frequência e investimento", 219,
          "Ativar Item usa as ações e traços da entrada; possuir ou investir não elimina ativação. Frequência pertence ao item, não a cada portador, salvo texto contrário. Investimento ocorre durante preparações diárias e o limite normal é dez. Remover e reinvestir não restaura usos. Uma ativação de conjuração usa regras da magia indicadas, incluindo alvo, locus e componentes especiais. Item inteligente usa suas próprias ações apenas quando seu bloco autoriza.",
          "Uso, investimento e ativação são requisitos distintos; trocar portador não renova frequência.")
    guia("materiais-regras", "Materiais comuns e preciosos", 252,
          "Objeto composto normalmente usa estatística do material mais forte que sustenta sua função, mas atacar parte vulnerável pode usar outro. Material precioso substitui material-base em item compatível, no máximo um por item. Grau baixo exige Manufatura especialista, padrão exige mestre e alto exige lendário; o nível do artesão deve alcançar o nível do material. Grau baixo comporta itens e runas até nível 8, padrão até 15 e alto sem limite. Matéria-prima inicial precisa conter ao menos 10% do precioso em grau baixo, 25% em padrão e 100% em alto. Melhorar grau paga diferença e exige material suficiente.",
          "Um material por item; grau limita fabricação e runas e exige proficiência e matéria-prima próprias.")
    guia("materiais-propriedades", "Propriedades dos materiais preciosos", 253,
          "Adamante prioriza durabilidade. Ferro frio interage com fraquezas de demônios e fadas. Prata da alvorada conta como prata e reduz Volume em 1, até leve quando era 1. Madeira crepuscular reduz Volume do mesmo modo. Oricalco repara completamente a si mesmo após 24 horas se não for destruído. Prata interage com fraquezas específicas e é menos durável. A redução de Volume não reduz preço por Volume e ocorre antes de ajustes de tamanho. Fraqueza só se aplica quando a criatura a possui; o material não cria dano extra universal.",
          "Cada material preserva durabilidade e propriedades próprias; fraquezas dependem do alvo.")

    # Subsistemas completos de operação.
    guia("subsistemas-projetar", "Projetar um subsistema de Pontos de Vitória", 184,
          "Defina nome dos pontos, objetivo, duração, oportunidades, CDs, resultado de cada grau, ponto final, patamares e consequência de tempo. Modelo acumulativo costuma dar +2 no crítico, +1 no sucesso, 0 na falha e −1 na falha crítica. Reserva decrescente preserva no sucesso, perde 1 na falha e 2 na falha crítica; crítico recupera 1 quando permitido. Use várias perícias e limite repetição para envolver o grupo. Patamares entregam mudanças concretas antes do resultado final.",
          "Um subsistema precisa de escala, patamares, oportunidades e efeitos concretos para cada resultado.")
    guia("influencia-operacao", "Influência: Descobrir e Influenciar", 187,
          "Cada rodada, cada personagem age uma vez para Descobrir ou Influenciar. Descobrir usa Percepção ou perícia apropriada contra a CD do PNJ; sucesso aprende menor CD ainda desconhecida, resistência, fraqueza ou outro dado, e crítico aprende dois. Falha crítica fornece informação plausível incorreta. Influenciar usa perícia e CD listadas: crítico +2 pontos, sucesso +1, falha 0, falha crítica −1. Resistências elevam CD ou impõem consequência; fraquezas reduzem CD ou dão progresso. Patamares concedem favores definidos, nunca controle mental irrestrito.",
          "Descobrir revela abordagem; Influenciar soma pontos até benefícios definidos no bloco do PNJ.")
    guia("pesquisa-operacao", "Pesquisa: bibliotecas, pontos e revelações", 190,
          "Uma coleção declara nível, CDs, perícias e máximo de Pontos de Pesquisa por divisão. Cada intervalo, o pesquisador escolhe divisão e testa: crítico normalmente +2 pontos, sucesso +1, falha 0, falha crítica pode gerar informação falsa ou complicação apenas se o bloco disser. Revelações ocorrem em patamares globais e devem entregar informação utilizável. Uma divisão esgotada não produz pontos adicionais. Ajuda e magia podem modificar abordagem, mas não ultrapassam o máximo sem efeito explícito.",
          "Divisões têm perícias, CD e limite; patamares transformam pontos em revelações concretas.")
    guia("infiltracao-operacao", "Infiltração: preparação, obstáculos e alerta", 196,
          "Na preparação, cada oportunidade pode conceder Pontos de Vantagem vinculados a uso específico. Durante a infiltração, obstáculos pedem Pontos de Infiltração: crítico +2, sucesso +1; falha dá 1 de Alerta e falha crítica 2. Uma vantagem aplicável gasta um ponto para converter falha ou falha crítica em sucesso. Alerta acumulado gera complicações em 5, 10 e 15, com ajuste total de CD +1 após 5 e +2 após 15; 20 encerra missão em falha. Tempo também pode gerar alerta quando o cenário declarar.",
          "Progresso e Alerta são trilhas separadas; vantagens corrigem falhas quando sua preparação se aplica.")
    guia("reputacao-operacao", "Reputação: ganhos, perdas e patamares", 200,
          "Controle valor separado por organização, de −50 a +50. Favor ou prejuízo menor, moderado e maior normalmente altera 1, 2 ou 5 pontos; evento extremo pode superar isso. Cruzar patamar muda tratamento e acesso, conforme facção. A tabela limita quais magnitudes normalmente mudam cada faixa, evitando cultivar reputação reverenciada apenas com tarefas triviais. Uma pessoa pode discordar da reputação geral. Mudança de liderança ou revelação importante pode redefinir valor de forma narrativa.",
          "Cada facção tem valor próprio; magnitude do ato e patamar determinam mudanças relevantes.")

    T = d["tabelas"]
    T["pontosVitoriaEscalas"] = [
        {"duracao": "Encontro rápido", "pontoFinalMin": 3, "pontoFinalMax": 5, "patamares": [], "pagina": 186},
        {"duracao": "Encontro longo", "pontoFinalMin": 7, "pontoFinalMax": 10, "patamares": [4], "pagina": 186},
        {"duracao": "Maior parte de uma sessão", "pontoFinalMin": 15, "pontoFinalMax": 25, "patamares": [5, 10, 15], "pagina": 186},
        {"duracao": "Ao longo da aventura, secundário", "pontoFinalMin": 15, "pontoFinalMax": 20, "patamares": [5, 10, 15], "pagina": 186},
        {"duracao": "Ao longo da aventura, central", "pontoFinalMin": 25, "pontoFinalMax": 50, "patamares": [10, 20, 30, 40], "pagina": 186},
    ]
    T["pontosVitoriaResultados"] = [
        {"grau": "Sucesso crítico", "acumulativo": 2, "reservaDecrescente": "Recupera 1, se possível", "pagina": 185},
        {"grau": "Sucesso", "acumulativo": 1, "reservaDecrescente": "Sem perda", "pagina": 185},
        {"grau": "Falha", "acumulativo": 0, "reservaDecrescente": "Perde 1", "pagina": 185},
        {"grau": "Falha crítica", "acumulativo": -1, "reservaDecrescente": "Perde 2", "pagina": 185},
    ]
    T["influenciaResultados"] = [
        {"grau": "Sucesso crítico", "pontos": 2, "pagina": 187},
        {"grau": "Sucesso", "pontos": 1, "pagina": 187},
        {"grau": "Falha", "pontos": 0, "pagina": 187},
        {"grau": "Falha crítica", "pontos": -1, "pagina": 187},
    ]
    T["infiltracaoResultados"] = [
        {"grau": "Sucesso crítico", "pontosInfiltracao": 2, "pontosAlerta": 0, "pagina": 197},
        {"grau": "Sucesso", "pontosInfiltracao": 1, "pontosAlerta": 0, "pagina": 197},
        {"grau": "Falha", "pontosInfiltracao": 0, "pontosAlerta": 1, "pagina": 197},
        {"grau": "Falha crítica", "pontosInfiltracao": 0, "pontosAlerta": 2, "pagina": 197},
    ]
    T["grausMaterialPrecioso"] = [
        {"grau": "Baixo", "proficienciaMinima": "Especialista", "nivelMaximoItemOuRuna": 8, "percentualMinimoMaterialInicial": 10, "pagina": 253},
        {"grau": "Padrão", "proficienciaMinima": "Mestre", "nivelMaximoItemOuRuna": 15, "percentualMinimoMaterialInicial": 25, "pagina": 253},
        {"grau": "Alto", "proficienciaMinima": "Lendário", "nivelMaximoItemOuRuna": None, "percentualMinimoMaterialInicial": 100, "pagina": 253},
    ]
    comuns = [
        ("Papel", 0, 1, None, "Páginas, leque ou pergaminho"), ("Tecido fino", 0, 1, None, "Pipa, vestido ou camisa"),
        ("Vidro fino", 0, 1, None, "Garrafa, óculos ou vidraça"), ("Tecido", 1, 4, 2, "Armadura de tecido, saco ou barraca"),
        ("Vidro", 1, 4, 2, "Bloco, mesa ou vaso pesado"), ("Estrutura de vidro", 2, 8, 4, "Parede de blocos de vidro"),
        ("Couro fino", 2, 8, 4, "Mochila, jaqueta, bolsa ou chicote"), ("Corda fina", 2, 8, 4, "Corda comum de aventura"),
        ("Madeira fina", 3, 12, 6, "Cadeira, clava, muda ou escudo de madeira"), ("Couro", 4, 16, 8, "Armadura de couro ou sela"),
        ("Corda", 4, 16, 8, "Corda industrial ou cordame"), ("Pedra fina", 4, 16, 8, "Ardósia, telha ou revestimento"),
        ("Ferro ou aço fino", 5, 20, 10, "Corrente, escudo de aço ou espada"), ("Madeira", 5, 20, 10, "Baú, porta, mesa ou tronco"),
        ("Pedra", 7, 28, 14, "Pavimento ou estátua"), ("Ferro ou aço", 9, 36, 18, "Bigorna, armadura ou fogão"),
        ("Estrutura de madeira", 10, 40, 20, "Porta reforçada ou parede"), ("Estrutura de pedra", 14, 56, 28, "Parede de pedra"),
        ("Estrutura de ferro ou aço", 18, 72, 36, "Parede de placas metálicas"),
    ]
    T["materiaisComuns"] = [
        {"material": n, "dureza": h, "pv": pv, "limiarQuebra": bt, "exemplos": ex, "pagina": 252}
        for n, h, pv, bt, ex in comuns
    ]
    stats = {
        "Adamante": [("Padrão", "Fino", 10, 40, 20), ("Alto", "Fino", 13, 52, 26), ("Padrão", "Item", 14, 56, 28), ("Alto", "Item", 17, 68, 34), ("Padrão", "Estrutura", 28, 112, 56), ("Alto", "Estrutura", 34, 136, 68)],
        "Ferro frio": [("Baixo", "Fino", 5, 20, 10), ("Padrão", "Fino", 7, 28, 14), ("Alto", "Fino", 10, 40, 20), ("Baixo", "Item", 9, 36, 18), ("Padrão", "Item", 11, 44, 22), ("Alto", "Item", 14, 56, 28), ("Baixo", "Estrutura", 18, 72, 36), ("Padrão", "Estrutura", 22, 88, 44), ("Alto", "Estrutura", 28, 112, 56)],
        "Prata da alvorada": [("Padrão", "Fino", 5, 20, 10), ("Alto", "Fino", 8, 32, 16), ("Padrão", "Item", 9, 36, 18), ("Alto", "Item", 12, 48, 24), ("Padrão", "Estrutura", 18, 72, 36), ("Alto", "Estrutura", 24, 96, 48)],
        "Madeira crepuscular": [("Padrão", "Fino", 5, 20, 10), ("Alto", "Fino", 8, 32, 16), ("Padrão", "Item", 7, 28, 14), ("Alto", "Item", 10, 40, 20), ("Padrão", "Estrutura", 14, 56, 28), ("Alto", "Estrutura", 20, 80, 40)],
        "Oricalco": [("Alto", "Fino", 16, 64, 32), ("Alto", "Item", 18, 72, 36), ("Alto", "Estrutura", 35, 140, 70)],
        "Prata": [("Baixo", "Fino", 3, 12, 6), ("Padrão", "Fino", 5, 20, 10), ("Alto", "Fino", 8, 32, 16), ("Baixo", "Item", 5, 20, 10), ("Padrão", "Item", 7, 28, 14), ("Alto", "Item", 10, 40, 20), ("Baixo", "Estrutura", 10, 40, 20), ("Padrão", "Estrutura", 14, 56, 28), ("Alto", "Estrutura", 20, 80, 40)],
    }
    T["materiaisPreciososEstatisticas"] = [
        {"material": material, "grau": grau, "forma": forma, "dureza": h, "pv": pv, "limiarQuebra": bt, "pagina": 253 if material in ("Adamante", "Ferro frio") else 254}
        for material, linhas in stats.items() for grau, forma, h, pv, bt in linhas
    ]
    precos = [
        ("adamante", "Adamante", 8, "Padrão", 350, 16, 6000, "incomum"),
        ("ferro-frio", "Ferro frio", 2, "Baixo", 20, 15, 4500, "comum"),
        ("prata-alvorada", "Prata da alvorada", 8, "Padrão", 350, 16, 6000, "incomum"),
        ("madeira-crepuscular", "Madeira crepuscular", 8, "Padrão", 350, 16, 6000, "incomum"),
        ("oricalco", "Oricalco", 17, "Alto", 10000, 17, 10000, "raro"),
        ("prata", "Prata", 2, "Baixo", 20, 15, 4500, "comum"),
    ]
    for id_, nome, nivel_baixo, grau_baixo, preco_baixo, nivel_alto, preco_alto, raridade in precos:
        descricao = f"Material precioso {nome}. A tabela materiaisPreciososEstatisticas contém Dureza, PV e Limiar de Quebra por forma e grau. O grau {grau_baixo.lower()} começa no nível {nivel_baixo} por {preco_baixo} po por Volume; o grau alto é nível {nivel_alto} e custa {preco_alto} po por Volume. Preços de arma, armadura e escudo usam suas entradas específicas."
        d["equipamentos"].append({
            "id": "material-" + id_, "nome": nome, "nivel": nivel_baixo,
            "precoPo": preco_baixo, "preco": f"{preco_baixo} po por Volume",
            "pagina": 253 if id_ in ("adamante", "ferro-frio") else 254,
            "fonte": "gm-core", "categoria": "material-precioso", "uso": "Matéria-prima",
            "raridade": raridade, "descricao": descricao,
            "resumo": [f"Material precioso com graus e estatísticas próprias; preço-base de {grau_baixo.lower()} por Volume."],
            "automatizavel": False, "automacao": "consulta",
            "mecanica": {"versao": 1, "tipo": "material-precioso", "estado": "dados-revisados-sem-executor", "grauInicial": grau_baixo, "nivelInicial": nivel_baixo},
        })

    d["fonte"]["coberturaRegras"] = {
        "estado": "regras-de-consulta-revisadas",
        "idioma": "pt-BR",
        "secoes": ["mesa e adjudicação", "ambiente e objetos", "perigos", "construção de criaturas", "construção e uso de itens", "materiais", "subsistemas"],
        "nota": "Cobertura operacional de consulta; exemplos extensos, cenário e todo o catálogo individual de tesouro não são reproduzidos como tradução página a página.",
    }
    d["lacunas"] = [
        "Exemplos extensos de aventuras e cenário não foram reproduzidos página a página; as regras operacionais estão disponíveis em português.",
        "O catálogo detalhado conserva somente entradas individualmente revisadas; a tabela de tesouro do livro continua sendo índice para os demais itens.",
        "Variantes e subsistemas são consulta e exigem ativação do mestre; não alteram automaticamente a ficha padrão.",
    ]

    # Marcadores verificáveis de cobertura deste módulo.
    assert len(T["materiaisComuns"]) == 19
    assert len(T["materiaisPreciososEstatisticas"]) == 39
    assert len(T["pontosVitoriaEscalas"]) == 5
    assert sum(e.get("categoria") == "material-precioso" for e in d["equipamentos"]) == 6
