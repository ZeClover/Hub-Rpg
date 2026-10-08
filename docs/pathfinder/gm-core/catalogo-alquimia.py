"""Catálogo individual de alquimia, traduzido da fonte local (pp. 244–251).

As entradas são somente de consulta. O módulo não tenta executar aflições,
ataques, consumo ou duração na ficha.
"""


def ampliar(d):
    def guia(id_, nome, pagina, texto, resumo):
        d["secoes"].append({"id": id_, "nome": nome, "pagina": pagina,
            "texto": texto, "resumo": [resumo], "fonte": "gm-core", "tipo": "guia-revisado"})

    def item(id_, nome, nivel, preco, pagina, descricao, resumo, categoria):
        d["equipamentos"].append({
            "id": id_, "nome": nome, "nivel": nivel, "precoPo": preco, "pagina": pagina,
            "descricao": descricao, "resumo": [resumo], "categoria": categoria,
            "fonte": "gm-core", "raridade": "comum", "somenteConsulta": True,
            "automatizavel": False,
            "mecanica": {"versao": 1, "tipo": "referencia", "estado": "nao-implementado",
                "motivo": "Texto revisado para consulta; ataque, aflição, consumo e duração ainda não possuem executor completo."},
        })

    guia("alquimia-regras", "Itens alquímicos e fabricação", 244,
        "Itens alquímicos não são mágicos: não irradiam aura, não podem ser dissipados e seus efeitos terminam pela duração ou pelo método físico indicado. Fabricá-los exige Manufatura Alquímica e pode trazer requisito adicional na entrada. Falha crítica em Manufaturar costuma causar exposição ou explosão além da perda de materiais. Bomba, elixir e veneno são categorias próprias; ferramentas alquímicas não pertencem a essas três categorias.",
        "Alquimia não é magia; cada categoria conserva ativação, exposição e consumo próprios.")
    guia("bombas-alquimicas", "Bombas alquímicas, ataques e respingo", 244,
        "Bombas são armas marciais arremessadas, incremento de alcance de 6 metros, ativadas como parte do Golpe e consumidas no uso. Exigem uma mão para sacar, preparar e lançar. Não aceitam runas nem talismãs e não recebem runas replicadas, embora bônus aplicáveis a todos os ataques ou armas arremessadas ainda possam valer.\n\nRespingo não soma Força. Em falha, sucesso ou crítico, todas as criaturas a 1,5 metro do alvo, inclusive ele, sofrem o respingo indicado; falha crítica não causa dano. Some dano inicial e respingo contra o alvo antes de resistência ou fraqueza. Crítico dobra o dano direto e persistente, nunca o respingo.",
        "Bomba é arma marcial arremessada de 6 metros; respingo atinge a área mesmo em falha, mas não em falha crítica.")
    guia("elixires-alquimicos", "Elixires alquímicos", 246,
        "Beber elixir ou administrá-lo normalmente usa uma ação Interagir e uma mão. Só é possível alimentar criatura ao alcance que esteja disposta ou incapaz de impedir. Elixires são alquímicos, não mágicos; duração, bônus e imunidades são os da entrada e a dose é consumida.",
        "Elixir usa uma ação e pode ser dado apenas a alvo disposto ou incapaz de impedir.")
    guia("venenos-alquimicos", "Venenos alquímicos e exposição", 248,
        "Cada dose declara salvaguarda, início, duração máxima e estágios. Contato atua na primeira criatura que tocar a superfície; ingerido atua ao consumir; inalado cria cubo de 3 metros por 1 minuto ou até vento forte, e segurar a respiração conscientemente concede +2 de circunstância por uma rodada; ferimento exige aplicar com duas ações e acertar Golpe cortante ou perfurante. Falha no Golpe preserva a dose, mas falha crítica ou ausência de dano adequado a gasta. Veneno virulento exige dois sucessos consecutivos para reduzir estágio; crítico reduz somente um estágio.",
        "O método define a exposição; veneno virulento exige dois sucessos consecutivos para reduzir estágio.")
    guia("ferramentas-alquimicas", "Ferramentas alquímicas", 251,
        "Ferramentas alquímicas são consumíveis que não se bebem. Cada entrada informa mãos, ação e aplicação. Bastão luminoso, palito incendiário, unguento de prata, esfera de fumaça e óleo de cobra são ferramentas; possuir uma delas não concede efeito passivo antes da ativação e do consumo.",
        "Ferramentas alquímicas são consumidas por sua ativação específica, não por ingestão.")

    item("frasco-acido", "Frasco de ácido", 1, 3, 244,
        "Uma versão menor causa 1 de ácido, 1d6 de ácido persistente e 1 de respingo. Moderada (nível 3, 10 po): +1 no ataque, 2d6 persistente e respingo 2. Maior (nível 11, 250 po): +2, 3d6 e respingo 3. Superior (nível 17, 2.500 po): +3, 4d6 e respingo 4. Usa uma ação como Golpe, uma mão e Volume leve.",
        "Ácido direto, persistente e em respingo; quatro versões dos níveis 1, 3, 11 e 17.", "bomba")
    item("fogo-alquimista", "Fogo do alquimista", 1, 3, 245,
        "Menor: 1d8 de fogo, 1 persistente e respingo 1. Moderado (nível 3, 10 po): +1 no ataque, 2d8, 2 persistente e respingo 2. Maior (nível 11, 250 po): +2, 3d8, 3 persistente e respingo 3. Superior (nível 17, 2.500 po): +3, 4d8, 4 persistente e respingo 4.",
        "Fogo direto, persistente e em respingo; quatro versões.", "bomba")
    item("ampola-pavor", "Ampola de pavor", 1, 3, 245,
        "Causa dano mental e respingo mental; no acerto deixa assustado 1, ou 2 no crítico. Menor: 1d6 e respingo 1. Moderada (nível 3, 10 po): +1, 2d6 e 2. Maior (nível 11, 300 po): +2, 3d6 e 3. Superior (nível 17, 3.000 po): +3, 4d6 e 4. Possui traços emoção, medo, mental e veneno.",
        "Dano mental em respingo e assustado 1, ou 2 no crítico.", "bomba")
    item("bomba-cola", "Bomba de cola", 1, 3, 245,
        "No acerto reduz deslocamentos por 1 minuto; crítico em contato com superfície sólida também imobiliza por uma rodada, e voo por asas termina com queda segura e impedimento de Voar por uma rodada. Escapar ou três ações Interagir, inclusive de aliados, encerram o efeito. Menor: −3 m, CD 17. Moderada (nível 3, 10 po): +1, −4,5 m, CD 19. Maior (nível 11, 250 po): +2, −4,5 m, CD 28. Superior (nível 17, 2.500 po): +3, −6 m, CD 37. Não funciona submersa.",
        "Reduz deslocamento; crítico pode imobilizar ou derrubar voo por asas.", "bomba")

    item("antidoto", "Antídoto", 1, 3, 246,
        "Por 6 horas concede bônus de item em Fortitude contra venenos: +2 menor; +3 moderado (nível 6, 35 po); +4 maior (nível 10, 160 po). O superior (nível 14, 675 po) mantém +4 e permite salvaguarda imediata contra um veneno de nível 14 ou menor, neutralizando-o em sucesso.",
        "Bônus contra venenos por 6 horas; versão superior pode neutralizar uma aflição.", "elixir")
    item("antipraga", "Antipraga", 1, 3, 246,
        "Por 24 horas concede bônus de item em Fortitude contra doenças, inclusive a salvaguarda diária: +2 menor; +3 moderado (nível 6, 35 po); +4 maior (nível 10, 160 po). O superior (nível 14, 675 po) mantém +4 e permite salvaguarda imediata contra doença de nível 14 ou menor, curando-a em sucesso.",
        "Bônus contra doenças por 24 horas; versão superior pode curar uma doença.", "elixir")
    item("elixir-olho-bombardeiro", "Elixir do olho do bombardeiro", 4, 14, 246,
        "Por 5 minutos, Golpes com bombas reduzem o bônus de circunstância à CA concedido por cobertura. Menor reduz em 1; maior (nível 14, 700 po) reduz em 2.",
        "Reduz em 1 ou 2 a cobertura contra seus Golpes com bombas.", "elixir")
    item("cerveja-valente", "Cerveja do valente", 2, 7, 246,
        "Por 1 hora concede bônus de item em Vontade: +1, ou +2 contra medo. Moderada (nível 10, 150 po): +2, ou +3 contra medo. Maior (nível 15, 700 po): +3, ou +4 contra medo; sucesso contra medo vira crítico.",
        "Bônus de Vontade por uma hora, maior contra medo.", "elixir")
    item("elixir-olho-gato", "Elixir de olho de gato", 2, 7, 246,
        "Por 1 minuto, contra criaturas a até 9 metros, a verificação simples para atingir oculto passa a CD 5 e não há verificação simples para atingir encoberto.",
        "Facilita atingir criaturas ocultas e ignora encoberto a até 9 metros.", "elixir")
    item("elixir-guepardo", "Elixir de guepardo", 1, 3, 246,
        "Bônus de estado no deslocamento: menor +1,5 m por 1 minuto; moderado (nível 5, 25 po) +3 m por 10 minutos; maior (nível 9, 110 po) +3 m por 1 hora.",
        "Aumenta deslocamento em 1,5 ou 3 metros pela duração indicada.", "elixir")
    item("elixir-visao-escuro", "Elixir de visão no escuro", 2, 6, 246,
        "Concede visão no escuro. Menor dura 10 minutos; moderado (nível 4, 11 po) 1 hora; maior (nível 8, 90 po) 24 horas.",
        "Concede visão no escuro por 10 minutos, 1 hora ou 24 horas.", "elixir")
    item("elixir-olho-aguia", "Elixir de olho de águia", 1, 4, 247,
        "Por 1 hora concede Percepção: menor +1, ou +2 para portas secretas e armadilhas; moderado (nível 5, 27 po) +2/+3; maior (nível 10, 200 po) +3/+4; superior (nível 16, 2.000 po) +3/+4 e o mestre testa secretamente ao passar a 3 metros de porta secreta ou armadilha.",
        "Bônus de Percepção, maior para portas secretas e armadilhas.", "elixir")
    item("elixir-vida", "Elixir da vida", 1, 3, 247,
        "Cura criatura viva e concede por 10 minutos bônus contra doenças e venenos. Mínimo: 1d6/+1. Menor (nível 5, 30 po): 3d6+6/+1. Moderado (nível 9, 150 po): 5d6+12/+2. Maior (nível 13, 600 po): 7d6+18/+2. Superior (nível 15, 1.300 po): 8d6+21/+3. Verdadeiro (nível 19, 8.000 po): 10d6+27/+4.",
        "Cura e concede bônus temporário contra doenças e venenos; seis versões.", "elixir")
    item("elixir-forma-nevoa", "Elixir de forma de névoa", 4, 18, 247,
        "Deixa encoberto; se a posição continua óbvia, o encobrimento não permite Esconder-se ou Furtar-se. Menor dura 3 rodadas; moderado (nível 6, 56 po) 1 minuto; maior (nível 10, 180 po) 5 minutos.",
        "Concede encoberto por 3 rodadas, 1 minuto ou 5 minutos.", "elixir")
    item("elixir-toque-mar", "Elixir de toque do mar", 5, 22, 247,
        "Concede natação 6 metros. Menor dura 10 minutos. Moderado (nível 12, 300 po) dura 1 hora e permite respirar sob a água. Maior (nível 15, 920 po) dura 24 horas e permite respirar sob a água.",
        "Natação 6 metros; versões superiores também permitem respirar sob a água.", "elixir")
    item("elixir-punho-pedra", "Elixir do punho de pedra", 4, 13, 247,
        "Por 1 hora, os punhos causam 1d6 contundente e perdem o traço não letal.",
        "Punhos causam 1d6 contundente letal por uma hora.", "elixir")

    venenos = [
      ("arsenico", "Arsênico", 1, 3, 248, "Fortitude CD 18; início 10 minutos; máximo 5 minutos. Estágios por 1 minuto: 1d4 e enjoado 1; 1d6 e enjoado 2; 1d8 e enjoado 3. Enjoado não pode ser reduzido enquanto durar."),
      ("veneno-vibora-negra", "Veneno de víbora-negra", 2, 6, 248, "Ferimento, Fortitude CD 18, máximo 3 rodadas. Estágios: 1d4, 1d6 e 1d8 de veneno, cada um por 1 rodada."),
      ("extrato-lotus-negra", "Extrato de lótus-negra", 19, 6500, 248, "Contato e virulento; Fortitude CD 42; início 1 minuto; máximo 6 rodadas. Estágios: 13d6 e drenado 1; 15d6 e drenado 1; 17d6 e drenado 2, cada um por 1 rodada."),
      ("resina-praga", "Resina de praga", 11, 225, 248, "Contato; Fortitude CD 30; início 1 minuto; máximo 6 rodadas. Estágios: 6d6, 7d6 e 9d6 de veneno, cada um por 1 rodada."),
      ("fumaca-enxofre", "Fumaça de enxofre", 16, 1500, 249, "Inalado; Fortitude CD 36; início 1 rodada; máximo 6 rodadas. Estágios: 7d8 e enfraquecido 1; 8d8 e enfraquecido 2; 10d8 e enfraquecido 3, cada um por 1 rodada."),
      ("po-cogumelo-morte", "Pó de cogumelo-da-morte", 13, 450, 249, "Ingerido; Fortitude CD 33; início 10 minutos; máximo 6 minutos. Estágios: 7d8; 9d6 e enjoado 2; 8d10 e enjoado 3, cada um por 1 minuto."),
      ("nectar-flor-medo", "Néctar de flor-do-medo", 4, 16, 249, "Ferimento; Fortitude CD 21; máximo 6 rodadas. Estágios: 1d6 e assustado 1, 2 ou 3 conforme o estágio, cada um por 1 rodada."),
      ("veneno-centopeia-gigante", "Veneno de centopeia gigante", 1, 4, 249, "Ferimento; Fortitude CD 17; máximo 6 rodadas. Estágio 1: 1d4. Estágio 2: 1d4 e fatigado. Estágio 3: 1d4, desajeitado 1 e fatigado; cada um por 1 rodada."),
      ("veneno-escorpiao-gigante", "Veneno de escorpião gigante", 6, 40, 249, "Ferimento; Fortitude CD 22; máximo 6 rodadas. Estágios: 2d6 e enfraquecido 1; 2d8 e enfraquecido 1; 2d10 e enfraquecido 2, cada um por 1 rodada."),
      ("raiz-tumular", "Raiz tumular", 3, 10, 249, "Ferimento; Fortitude CD 19; máximo 4 rodadas. Estágios: 1d8; 1d10 e estupefato 1; 2d6 e estupefato 2, cada um por 1 rodada."),
      ("cicuta", "Cicuta", 17, 2250, 249, "Ingerido; Fortitude CD 38; início 30 minutos; máximo 60 minutos. Estágios: 16d6 e enfraquecido 2; 17d6 e enfraquecido 3; 16d6 e enfraquecido 4, cada um por 10 minutos."),
      ("veneno-letargia", "Veneno de letargia", 2, 7, 250, "Ferimento, sono e incapacitação; Fortitude CD 18; máximo 4 horas. Estágio 1: lento 1 por 1 rodada. Estágio 2: lento 1 por 1 minuto. Estágio 3: inconsciente sem teste de Percepção para acordar por 1 rodada. Estágio 4: o mesmo por 1d4 horas. Exposição adicional não cria nova salvaguarda."),
      ("nevoa-mental", "Névoa mental", 15, 1000, 250, "Inalado; Fortitude CD 35; início 1 rodada; máximo 6 rodadas. Estágio 1: estupefato 2. Estágio 2: confuso e estupefato 3. Estágio 3: confuso e estupefato 4; cada um por 1 rodada."),
      ("vinho-sonifero", "Vinho sonífero", 12, 325, 250, "Ingerido e sono; Fortitude CD 32; início 1 hora; máximo 7 dias. Estágios: inconsciente por 1, 2 ou 3 dias. Não acorda enquanto durar, não precisa comer ou beber e parece recém-morto salvo Medicina CD 40."),
      ("raiz-aranha", "Raiz-aranha", 9, 110, 250, "Contato; Fortitude CD 28; início 1 minuto; máximo 6 minutos. Estágios: 3d6 e desajeitado 1; 4d6 e desajeitado 2; 6d6 e desajeitado 3, cada um por 1 minuto."),
      ("veneno-aranha", "Veneno de aranha", 5, 25, 250, "Ferimento; Fortitude CD 22; máximo 6 rodadas. Estágio 1: 1d10 e enjoado 1. Estágio 2: 1d12, desajeitado 1 e enjoado 2. Estágio 3: 2d6, desajeitado 2 e enjoado 3; cada um por 1 rodada."),
      ("lagrimas-morte", "Lágrimas da morte", 20, 12000, 250, "Contato e virulento; Fortitude CD 44; início 1 minuto; máximo 10 minutos. Estágios: 20d6 e paralisado por 1 rodada; 22d6 e paralisado por 1 minuto; 24d6 e paralisado por 1 minuto."),
      ("aconito", "Acônito", 10, 155, 250, "Ingerido; Fortitude CD 30; início 10 minutos; máximo 6 minutos. Estágios: 3d10, 4d10 e 5d10, cada um por 1 minuto. Sobreviver ao estágio 3 cura imediatamente a maldição de licantropo."),
      ("veneno-wyvern", "Veneno de wyvern", 8, 80, 250, "Ferimento; Fortitude CD 26; máximo 6 rodadas. Estágios: 3d6, 3d8 e 3d10 de veneno, cada um por 1 rodada."),
    ]
    for id_, nome, nivel, preco, pagina, descricao in venenos:
        item(id_, nome, nivel, preco, pagina, descricao, "Aflição completa com CD, duração e estágios conforme a descrição.", "veneno")

    item("bastao-luminoso", "Bastão luminoso", 1, 3, 251,
        "Uma ação de manuseio acende luz brilhante em raio de 6 metros e penumbra nos 12 metros seguintes por 6 horas.",
        "Ilumina por 6 horas.", "ferramenta-alquimica")
    item("palito-incendiario", "Palito incendiário", 1, 0.2, 251,
        "Uma ação de manuseio acende o palito numa superfície áspera e pode tocar objeto inflamável como parte da mesma ação.",
        "Acende chama e objeto inflamável com uma ação.", "ferramenta-alquimica")
    item("unguento-prata", "Unguento de prata", 2, 6, 251,
        "Uma ação com duas mãos aplica em uma arma corpo a corpo, uma arma arremessada ou dez munições. O frasco inteiro precisa ser usado; por 1 hora o dano físico conta como prata em vez do material normal.",
        "Faz arma ou dez munições contarem como prata por 1 hora.", "ferramenta-alquimica")
    item("esfera-fumaca", "Esfera de fumaça", 1, 3, 251,
        "Uma ação com duas mãos cria fumaça centrada num canto do espaço: criaturas dentro ficam encobertas e as demais ficam encobertas para elas. Dura 1 minuto ou até vento forte. Menor: explosão de 1,5 metro. Maior (nível 7, 53 po): explosão de 6 metros.",
        "Cria fumaça de encobrimento por até 1 minuto.", "ferramenta-alquimica")
    item("oleo-cobra", "Óleo de cobra", 1, 2, 251,
        "Uma ação com duas mãos oculta por 1 hora o sintoma externo de ferimento, aflição ou condição, sem remover qualquer efeito. Buscar especificamente e obter Percepção CD 17 revela o disfarce.",
        "Oculta sintomas por uma hora sem curar; Percepção CD 17 revela.", "ferramenta-alquimica")
