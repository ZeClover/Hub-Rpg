"""Munições e óleos individuais, traduzidos da fonte local (pp. 255–258)."""


def ampliar(d):
    def guia(id_, nome, pagina, texto, resumo):
        d["secoes"].append({"id": id_, "nome": nome, "pagina": pagina, "texto": texto,
            "resumo": [resumo], "fonte": "gm-core", "tipo": "guia-revisado"})
    def item(id_, nome, nivel, preco, pagina, descricao, resumo, categoria, raridade="comum"):
        d["equipamentos"].append({"id": id_, "nome": nome, "nivel": nivel, "precoPo": preco,
            "pagina": pagina, "descricao": descricao, "resumo": [resumo], "categoria": categoria,
            "fonte": "gm-core", "raridade": raridade, "somenteConsulta": True,
            "automatizavel": False, "mecanica": {"versao": 1, "tipo": "referencia",
            "estado": "nao-implementado", "motivo": "Consumível revisado para consulta; ativação, ataque e consumo ainda não possuem executor completo."}})

    guia("consumiveis-magicos", "Consumíveis mágicos", 255,
        "Item com o traço consumível só pode ser usado uma vez e, salvo indicação contrária, é destruído ao ser ativado. Manufaturar consumíveis permite lotes de quatro conforme a atividade. Posse ou investimento não evita a ação, alvo, frequência, requisito ou destruição declarados.",
        "Consumível mágico é destruído após o uso e conserva todos os requisitos de ativação.")
    guia("municao-magica", "Munição mágica", 255,
        "Munição usa recarga e Volume do tipo normal. As runas fundamentais da arma determinam ataque e dados de dano, mas propriedades da arma não se aplicam salvo texto expresso. O disparo causa dano normal além do efeito, salvo exceção. Lançar consome a magia mesmo se errar.\n\nSe houver ativação, é preciso ativar e disparar até o fim do mesmo turno; caso contrário, desativa sem ser consumida. Dispará-la sem ativar funciona como munição não mágica e ainda a consome. A ativação não substitui ações de recarga.",
        "Fundamentais da arma valem; propriedades não. Ative e dispare no mesmo turno quando exigido.")
    guia("oleos-magicos", "Óleos mágicos", 257,
        "Óleos são géis, pomadas e pastas mágicas consumíveis aplicados a objetos ou, às vezes, criaturas ao alcance. Normalmente exigem duas mãos. Não podem ser aplicados em alvo indisposto nem em objeto que ele carrega, salvo se estiver paralisado, petrificado ou inconsciente. Cada aplicação consome o óleo.",
        "Óleo normalmente exige duas mãos, alcance e alvo disposto ou indefeso.")

    item("tiro-sinalizador", "Tiro sinalizador", 3, 10, 255,
        "Flecha ou virote; uma ação para ativar. Ao acertar, fica cravado e solta faíscas por 1 minuto: invisível passa a apenas oculto para quem não o via e encoberto é negado. Remover exige Interagir e Atletismo CD 20.",
        "Marca o alvo por 1 minuto, reduzindo invisibilidade e negando encoberto.", "municao")
    item("virote-escalada", "Virote de escalada", 4, 15, 255,
        "Ao atingir superfície sólida, seu fio vira corda de 15 metros presa ao ponto. Soltar a corda exige Interagir e Atletismo CD 20.",
        "Cria corda de 15 metros presa à superfície atingida.", "municao")
    item("municao-explosiva", "Munição explosiva", 9, 130, 255,
        "Qualquer munição; uma ação para ativar. No acerto explode em raio de 3 metros, causando 6d6 de fogo a todos, inclusive o alvo, com Reflexos básico CD 25. A maior (nível 13, 520 po) causa 10d6, CD 30.",
        "No acerto explode em 3 metros: 6d6/CD 25 ou 10d6/CD 30.", "municao")
    item("municao-fantasma", "Munição fantasma", 14, 900, 255,
        "Qualquer munição; recebe benefícios de toque fantasma e atravessa obstáculos que não bloqueiem incorpóreos. Ignora cobertura, mas não oculto ou escondido. Não permite mirar indetectado sem adivinhar. Some após o disparo e reaparece 1d4 dias depois no último recipiente de onde foi retirada.",
        "Atravessa barreiras e ignora cobertura; retorna após 1d4 dias.", "municao")
    item("municao-perfurante", "Munição perfurante", 12, 400, 255,
        "Flecha ou virote; uma ação Interagir. O Golpe vira linha de 18 metros: uma única rolagem contra cada CA. Ignora 10 de resistência, atravessa paredes de até 30 cm com Dureza 10 ou menor e causa 1d6 de sangramento persistente a cada alvo ferido. O 20 natural melhora só contra o primeiro alvo; especialização crítica só no último quadrado.",
        "Golpe em linha de 18 metros, ignora resistência e causa sangramento persistente.", "municao")
    item("municao-brilhante", "Munição brilhante", 1, 3, 256,
        "Qualquer munição. Brilha por 10 minutos em raio de 6 metros, com penumbra por mais 6. Se acertar, fica presa e faz o alvo emitir a luz; Interagir remove, mas ela continua brilhando.",
        "Produz luz por 10 minutos e pode marcar o alvo.", "municao")
    item("municao-golpe-magico", "Munição de golpe mágico", 3, 12, 256,
        "Duas ações para conjurar nela magia de uma ou duas ações que possa mirar outra criatura. Ao acertar alvo válido, aplica a magia apenas nele; ataque de magia usa o resultado do Golpe e salvaguarda usa sua CD. Tipos I–IX, níveis 3/5/7/9/11/13/15/17/19, preços 12/30/70/150/300/600/1.300/3.000/8.000 po, comportam círculos 1–9.",
        "Armazena magia de 1 ou 2 ações e a entrega ao alvo atingido; nove versões.", "municao")
    item("projetil-pedra", "Projétil de pedra", 15, 1300, 256,
        "Projétil de funda; uma ação para ativar. Criatura atingida sofre Petrificar de 6º círculo, CD 34. Fabricar exige uma conjuração de Petrificar.",
        "Aplica Petrificar de 6º círculo, CD 34, no alvo atingido.", "municao")
    item("flecha-vinha", "Flecha de vinha", 3, 10, 256,
        "Uma ação de concentração. No acerto, reduz deslocamentos em 3 metros por 2d4 rodadas ou até Escapar CD 19. No crítico também imobiliza até Escapar.",
        "Reduz deslocamento; crítico imobiliza até Escapar CD 19.", "municao")

    item("oleo-antimagia", "Óleo antimagia", 20, 13000, 257,
        "Raro; aplicado em armadura por uma ação. Por 1 minuto, usuário fica imune a magias, efeitos de itens mágicos e efeitos mágicos. Não afeta magia da armadura nem runas fundamentais das armas que o atacam; fontes de nível 20 ou maior ainda funcionam.",
        "Imunidade ampla a magia por 1 minuto, com exceções expressas.", "oleo", "raro")
    item("nectar-purificacao", "Néctar de purificação", 1, 3, 257,
        "Uma ação derramada em comida ou bebida conjura Purificar Alimento de 1º círculo. Evapora sem alterar sabor ou textura.",
        "Purifica alimento ou bebida sem alterar sabor.", "oleo")
    item("oleo-ofuscacao", "Óleo de ofuscação", 15, 1200, 257,
        "Aplicado a item de Volume 3 ou menor, torna-o permanentemente indetectável para detecção, revelação e vidência de 8º círculo ou menor. Ácido remove em 1 minuto para Volume 1 ou menos, ou minutos iguais ao Volume.",
        "Oculta permanentemente item pequeno de magia de detecção até 8º círculo.", "oleo")
    item("oleo-animacao", "Óleo de animação", 12, 330, 257,
        "Incomum; aplicado a arma corpo a corpo por uma ação, concede benefícios da runa animada. Termina quando a verificação simples da arma falha e ela cai.",
        "Concede temporariamente os benefícios da runa animada.", "oleo", "incomum")
    item("oleo-fio-afiado", "Óleo de fio afiado", 11, 250, 257,
        "Incomum; aplicado em arma corpo a corpo perfurante ou cortante por uma ação, concede benefícios da runa afiada por 1 minuto.",
        "Concede runa afiada por 1 minuto.", "oleo", "incomum")
    item("oleo-reparo", "Óleo de reparo", 3, 9, 257,
        "Aplicação de 1 minuto conjura Reparar de 2º círculo no item.",
        "Repara um item como magia de 2º círculo.", "oleo")
    item("oleo-potencia", "Óleo de potência", 2, 7, 257,
        "Por 1 minuto, arma vira +1 impactante ou armadura +1 resiliente. Maior (nível 12, 400 po): +2 impactante maior ou +2 resiliente maior. Superior (nível 19, 8.000 po): +3 impactante superior ou +3 resiliente superior.",
        "Concede runas fundamentais temporárias por 1 minuto; três versões.", "oleo")
    item("oleo-repulsao", "Óleo de repulsão", 11, 175, 257,
        "Na armadura por 1 minuto: criatura que acerta Golpe corpo a corpo faz Fortitude CD 28. Sucesso nada; falha é empurrada até 3 metros; falha crítica também cai no chão.",
        "Ataques corpo a corpo podem empurrar o agressor, Fortitude CD 28.", "oleo")
    item("oleo-nao-vida", "Óleo de não vida", 1, 4, 258,
        "Cura morto-vivo ou criatura com cura por vazio, inclusive incorpóreo. Mínimo 1d8; menor (nível 3, 12 po) 2d8+5; moderado (nível 6, 50 po) 3d8+10; maior (nível 12, 400 po) 6d8+20; superior (nível 18, 5.000 po) 8d8+30.",
        "Cura por vazio em cinco versões, de 1d8 a 8d8+30.", "oleo")
    item("oleo-leveza", "Óleo de leveza", 2, 6, 258,
        "Item de Volume 1 ou menor passa a Volume desprezível por 1 hora. Maior (nível 6, 36 po) funciona em Volume 2 ou menor por 8 horas.",
        "Reduz Volume de item por 1 ou 8 horas.", "oleo")
    item("unguento-antiparalisia", "Unguento de antiparalisia", 6, 40, 258,
        "Tenta neutralizar paralisia mágica: círculo 3, modificador +22. Maior (nível 12, 325 po) também reverte petrificação; para paralisia usa círculo 6 e +31.",
        "Neutraliza paralisia; versão maior também reverte petrificação.", "oleo")
