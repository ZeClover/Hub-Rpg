"""Tradução manual dos focos iniciais restantes, conferida com PDF e AoN."""
import json
from pathlib import Path

def compilar():
    refs = json.loads((Path(__file__).parent / 'referencias-magias.json').read_text())
    entries = []
    def add(id, name, english, page, actions, tradition, traits, text, summary, **extra):
        entries.append({'id': id, 'nome': name, 'nomeOriginal': english,
            'ranque': 1, 'nivel': 1, 'tipo': 'foco', 'truque': False, 'foco': True,
            'tradicoes': tradition, 'acoes': actions, 'tracos': ['incomum', 'foco', 'feiticeiro'] + traits,
            'descricao': text, 'resumo': [summary], 'fonte': 'player-core-2',
            'paginaImpressa': page, 'paginaPdf': page + 1, 'pagina': page + 1,
            'referenciaAon': refs[english], 'revisao': 'revisado', 'somenteConsulta': False,
            'revisaoFonte': 'Texto do PDF fornecido, páginas impressas 262–265, conferido com o Archives of Nethys Remaster em 2026-10-06.',
            'automatizacaoCombate': {'estado': 'efeito-condicional-pendente', 'semCalculoManual': True}, **extra})
    add('membros-tentaculares', 'Membros Tentaculares', 'tentacular limbs', 262, 1, ['ocultista'], ['manuseio', 'morfo'],
        'Duração: 1 minuto. Seus braços viram tentáculos longos e flexíveis. O alcance para entregar magias de toque e fazer Golpes desarmados com os braços, como punhos e garras, passa a 3 m. Isso não altera o alcance de ataques com armas corpo a corpo. Durante a duração, ao Conjurar Magia, pode acrescentar uma ação à conjuração para estender temporariamente seu alcance a 6 m para entregar aquela magia. Elevada (+2): ao acrescentar essa ação, o alcance temporário aumenta em mais 3 m.',
        'Por 1 minuto, toque e ataques desarmados com os braços alcançam 3 m; uma ação extra na conjuração amplia o toque a 6 m, com progressão a cada dois ranques.',
        mecanica={'alcanceToque': 3, 'alcanceDesarmadoBracos': 3, 'alcanceComAcaoExtra': {'base': 6, 'elevacao': {'intervalo': 2, 'valor': 3}}, 'duracaoRodadas': 10})
    add('mandibulas-glutonas', 'Mandíbulas Glutonas', "glutton's jaws", 263, 2, ['divina'], ['ataque', 'concentracao', 'manuseio'],
        'Alcance: 9 m; alvo: uma criatura; defesa: CA. Uma boca salivante abre sob o alvo e tenta mordê-lo. Faça um ataque de magia. Em um acerto, causa 2d6 de dano perfurante e você recebe 1d4 PV temporários, que duram até o início do seu próximo turno. Elevada (+1): o dano aumenta em 2d6 e os PV temporários aumentam em 1d4.',
        'Ataque de magia que causa 2d6 perfurante e concede 1d4 PV temporários ao conjurador; ambos aumentam a cada ranque.',
        mecanica={'ataque': 'magia', 'alcance': 9, 'dano': {'base': '2d6', 'elevacao': {'intervalo': 1, 'formula': '2d6'}, 'tipo': 'perfurante'}, 'pvTemporariosNoAcerto': {'base': '1d4', 'elevacao': {'intervalo': 1, 'formula': '1d4'}, 'ateInicioProximoTurno': True}})
    add('edito-diabolico', 'Édito Diabólico', 'diabolic edict', 263, 1, ['divina'], ['concentracao'],
        'Alcance: 9 m; alvo: uma criatura viva voluntária; duração: 1 rodada. Você ordena que o alvo execute uma tarefa específica e oferece uma recompensa por cumpri-la. Ele recebe +1 de estado nas jogadas de ataque e testes de perícia relacionados à tarefa. Se recusar a tarefa proclamada, sofre −1 de estado em todas as jogadas de ataque e testes de perícia.',
        'Por 1 rodada, uma tarefa aceita dá +1 nos ataques e perícias relacionados; recusá-la dá −1 em todos esses testes.',
        mecanica={'alcance': 9, 'duracaoRodadas': 1, 'bonusCumprindoTarefa': {'tipo': 'estado', 'valor': 1}, 'penalidadeRecusandoTarefa': {'tipo': 'estado', 'valor': -1}})
    add('rajada-de-garras', 'Rajada de Garras', 'flurry of claws', 263, 2, ['arcana', 'divina', 'ocultista', 'primal'], ['ataque', 'concentracao', 'manuseio'],
        'Alcance: 9 m; alvos: duas criaturas a no máximo 3 m uma da outra; defesa: CA. Garras de dragão surgem e golpeiam os dois inimigos. Faça um ataque de magia contra cada alvo. Conta como dois ataques para a penalidade por ataques múltiplos, mas a penalidade só aumenta depois dos dois ataques. Em um acerto, causa 1d8 cortante e 1d4 adicional conforme a tradição da linhagem: arcana, força; divina, espiritual; ocultista, mental; primal, fogo. Elevada (+1): o dano cortante aumenta em 1d8 e o adicional em 1d4. A referência atual do Archives of Nethys também permite o tipo associado a um exemplar dracônico específico; o PDF fornecido apresenta os quatro tipos por tradição.',
        'Dois ataques de magia usam a mesma penalidade atual; cada acerto causa dano cortante e dano da tradição, ambos crescendo por ranque.',
        mecanica={'ataques': 2, 'penalidadeMultiplaDepoisDosDois': True, 'alcance': 9, 'distanciaMaximaEntreAlvos': 3,
                  'dano': [{'base': '1d8', 'tipo': 'cortante', 'elevacao': {'intervalo': 1, 'formula': '1d8'}},
                           {'base': '1d4', 'tipoPorTradicao': {'arcana': 'forca', 'divina': 'espiritual', 'ocultista': 'mental', 'primal': 'fogo'}, 'elevacao': {'intervalo': 1, 'formula': '1d4'}}]})
    add('arremesso-elemental', 'Arremesso Elemental', 'elemental toss', 264, 1, ['primal'], ['ataque', 'manuseio'],
        'Alcance: 9 m; alvo: uma criatura; defesa: CA. Você arremessa matéria elemental com um movimento do pulso. Faça um ataque de magia à distância. Sucesso causa 1d8 de dano; sucesso crítico causa o dobro. O tipo de dano corresponde à sua influência elemental, como cortante para ar ou fogo para fogo, e a magia recebe o traço do elemento. Elevada (+1): o dano aumenta em 1d8.',
        'Ataque de magia em uma ação: 1d8 do tipo do seu elemento por ranque, dobrado no crítico.',
        mecanica={'ataque': 'magia-distancia', 'alcance': 9, 'dano': {'base': '1d8', 'elevacao': {'intervalo': 1, 'formula': '1d8'},
                   'tipoPorElemento': {'ar': 'cortante', 'terra': 'contundente', 'fogo': 'fogo', 'metal': 'perfurante', 'agua': 'contundente', 'madeira': 'contundente'}}})
    add('po-de-fada', 'Pó de Fada', 'faerie dust', 264, '1 a 3', ['primal'], ['concentracao', 'manuseio', 'mental'],
        'Alcance: 9 m; área: explosão de 1,5 m de raio ou maior; duração inicial: 1 rodada; defesa: Vontade. Espalha poeira mágica que torna as criaturas na área mais fáceis de enganar. Cada criatura faz uma salvaguarda de Vontade. Para cada ação além da primeira usada na conjuração, aumente o raio em 1,5 m. Sucesso: sem efeito. Falha: não pode usar reações e sofre −2 de estado em testes de Percepção e salvaguardas de Vontade durante 1 rodada. Falha crítica: os mesmos efeitos da falha, e também −1 de estado em Percepção e Vontade durante 1 minuto. As penalidades de estado não se somam: a de −2 vale na primeira rodada e a de −1 permanece depois. Elevada (+3): o raio inicial aumenta em 1,5 m.',
        'Vontade evita uma rodada sem reações e com Percepção/Vontade reduzidas. Mais ações ampliam a área; falha crítica também deixa uma penalidade menor por 1 minuto.',
        mecanica={'alcance': 9, 'raio': {'base': 1.5, 'porAcaoAdicional': 1.5, 'elevacao': {'intervalo': 3, 'valor': 1.5}}, 'salvaguarda': 'vontade', 'duracaoRodadas': 1})
    add('sortilegio-ciumento', 'Sortilégio Ciumento', 'jealous hex', 264, 1, ['ocultista'], ['concentracao', 'maldicao'],
        'Alcance: 9 m; alvo: uma criatura; defesa: Vontade; duração: 1 minuto. A maldição prejudica o maior modificador de atributo do alvo: Força impõe enfraquecido; Destreza, desajeitado; Constituição, drenado; Inteligência, Sabedoria ou Carisma, estupefato. Se houver empate, o próprio alvo escolhe uma das condições correspondentes aos atributos empatados. Sucesso na salvaguarda: sem efeito. Falha: condição de valor 1. Falha crítica: valor 2. No início de cada um dos seus turnos, o alvo pode repetir a salvaguarda de Vontade; sucesso encerra a magia.',
        'Vontade evita uma condição ligada ao melhor atributo do alvo; falha crítica dobra seu valor e novas salvaguardas podem encerrar a maldição.',
        mecanica={'alcance': 9, 'salvaguarda': 'vontade', 'condicaoPorAtributo': {'for': 'enfraquecido', 'des': 'desajeitado', 'con': 'drenado', 'int': 'estupefato', 'sab': 'estupefato', 'car': 'estupefato'}, 'duracaoRodadas': 10})
    add('memorias-ancestrais', 'Memórias Ancestrais', 'ancestral memories', 265, 1, ['arcana'], ['concentracao'],
        'Escolha um efeito: +1 de estado no próximo ataque de magia que fizer antes do fim do seu turno, ou um inimigo a até 18 m sofre −1 de estado na próxima salvaguarda contra uma magia sua conjurada antes do fim desse turno. Elevada (5ª): o bônus passa a +2 ou a penalidade a −2. Elevada (8ª): passa a +3 ou −3.',
        'Melhora seu próximo ataque de magia ou piora a próxima salvaguarda de um inimigo contra sua magia neste turno.',
        mecanica={'alcanceInimigo': 18, 'valorPorRanque': {'1': 1, '5': 2, '8': 3}, 'tipoBonus': 'estado', 'ateFimTurno': True})
    add('bencao-da-nao-morte', 'Bênção da Não Morte', "undeath's blessing", 265, 1, ['divina'], ['manuseio', 'vazio'],
        'Alcance: toque; alvo: uma criatura viva; duração: 1 minuto; defesa: Vontade. Durante o efeito, as magias Curar e Ferir tratam o alvo como morto-vivo. Além disso, Ferir recebe +2 de estado nos PV que restaura ao alvo. Um alvo involuntário pode fazer uma salvaguarda de Vontade para reduzir os efeitos. Sucesso crítico: sem efeito. Sucesso: por 1 rodada, recebe metade da cura de Curar e metade do dano de Ferir. Falha: efeitos completos descritos acima. Elevada (+1): o bônus de estado nos PV restaurados aumenta em 2.',
        'Curar e Ferir passam a tratar um alvo vivo como morto-vivo; Ferir cura com um bônus crescente. Vontade pode evitar ou reduzir o efeito.',
        mecanica={'alteraCurarFerirParaMortoVivo': True, 'bonusCuraFerirPorRanque': 2, 'tipoBonus': 'estado', 'salvaguarda': 'vontade', 'duracaoRodadas': 10})
    def cantrip(id, name, english, page, traits, text, summary, **extra):
        entries.append({'id': id, 'nome': name, 'nomeOriginal': english, 'ranque': 1, 'nivel': 1,
            'tipo': 'truque', 'truque': True, 'tradicoes': ['arcana', 'primal'], 'acoes': 2,
            'tracos': ['truque', 'concentracao', 'manuseio'] + traits,
            'descricao': text, 'resumo': [summary], 'fonte': 'player-core-2',
            'paginaImpressa': page, 'paginaPdf': page + 1, 'pagina': page + 1,
            'referenciaAon': refs[english], 'revisao': 'revisado', 'somenteConsulta': False,
            'revisaoFonte': 'Tradução manual do bloco no PDF fornecido; conferência com AoN Remaster.',
            'automatizacaoCombate': {'estado': 'dano-estruturado-efeitos-secundarios-pendentes', 'semCalculoManual': True}, **extra})
    cantrip('rajada-de-vento', 'Rajada de Vento', 'gale blast', 246, ['ar'],
        'Área: emanação de 1,5 m; defesa: Fortitude. O vento sai de suas mãos e gira à sua volta. Cada criatura na área recebe 1d6 contundente e faz uma salvaguarda de Fortitude. Sucesso crítico: sem efeito. Sucesso: metade do dano. Falha: dano completo e é empurrada 1,5 m para longe de você. Falha crítica: dano dobrado e é empurrada 3 m. Elevada (+1): o dano aumenta em 1d6.',
        'Vento em volta de você causa dano contundente, reduzido por Fortitude, e empurra quem falhar.',
        efeitoCombate={'tipo': 'dano', 'ranqueBase': 1, 'formulaBase': '1d6', 'ampliacao': {'intervalo': 1, 'formula': '1d6'}, 'tipoDano': 'contundente', 'salvamentoBasico': True, 'salvaguarda': 'fortitude'},
        mecanica={'area': {'tipo': 'emanacao', 'raio': 1.5}, 'empurraoFalha': 1.5, 'empurraoFalhaCritica': 3})
    cantrip('espalhar-cascalho', 'Espalhar Cascalho', 'scatter scree', 250, ['terra'],
        'Alcance: 9 m; área: dois cubos contíguos de 1,5 m de lado; defesa: Reflexos básica; duração: 1 minuto. Pedras caem sobre a área e causam 2d4 contundente, com salvaguarda básica de Reflexos. O chão vira terreno difícil durante a duração. Uma criatura pode Interagir para limpar um quadrado do cascalho. Ao conjurar esta magia novamente, sua conjuração anterior de Espalhar Cascalho termina. Elevada (+1): o dano aumenta em 1d4.',
        'Dois quadrados adjacentes recebem dano e viram terreno difícil por 1 minuto; uma nova conjuração encerra a anterior.',
        efeitoCombate={'tipo': 'dano', 'ranqueBase': 1, 'formulaBase': '2d4', 'ampliacao': {'intervalo': 1, 'formula': '1d4'}, 'tipoDano': 'contundente', 'salvamentoBasico': True, 'salvaguarda': 'reflexos'},
        mecanica={'alcance': 9, 'area': {'tipo': 'cubos-contiguos', 'quantidade': 2, 'lado': 1.5}, 'terrenoDificil': True, 'duracaoRodadas': 10, 'encerraConjuracaoAnterior': True})
    return {'magias': entries, 'fonte': {'id': 'player-core-2', 'estado': 'blocos-iniciais-revisados'},
        'lacunas': ['Onze blocos individuais foram traduzidos manualmente e revisados; execução completa de condições, auras, alcance, PV temporários e efeitos situacionais continua explicitamente pendente. Dano dos dois truques tem fórmula estruturada, sem representar aplicação completa do terreno ou empurrão.']}

if __name__ == '__main__':
    out = Path(__file__).parent / 'focos-linhagens-qa.json'
    out.write_text(json.dumps(compilar(), ensure_ascii=False, indent=2) + '\n')
    print('11 magias iniciais revisadas:', out)
