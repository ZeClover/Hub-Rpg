"""Conteúdo editorial do Player Core 2 que não pertence às classes.

As biografias foram transcritas das páginas impressas 50–53 (páginas físicas
51–54). Os arquétipos são o índice completo das páginas 175–222. Arquétipos
ficam somente para consulta até seus talentos individuais receberem blocos e
executores próprios; isso evita oferecer uma escolha que a ficha não conclui.
"""

import re
import unicodedata


FONTE = "player-core-2"


def _id(texto):
    normal = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", normal.lower()).strip("-")


def _biografia(nome, atributos, pericia, saber, talento, pagina, *, rara=False,
               descricao=None, extras=None):
    escolha = " ou ".join(atributos)
    texto = descricao or (
        f"Escolha um incremento em {escolha} e outro incremento livre em atributo "
        f"diferente. Você fica treinado em {pericia} e em Saber ({saber}) e recebe "
        f"o talento {talento}. Se uma perícia se repetir com a classe, escolha outra."
    )
    row = {
        "id": _id(nome), "nome": nome, "atributos": atributos, "livres": 1,
        "pericia": _id(pericia), "saber": saber, "talento": _id(talento),
        "talentoNome": talento, "descricao": texto, "resumo": [texto],
        "pagina": pagina, "paginaImpressa": pagina - 1, "fonte": FONTE,
        "revisao": "revisado", "raridade": "raro" if rara else "comum",
        "secoes": [f"biografia-{_id(nome)}"],
    }
    if extras:
        row.update(extras)
    return row


BIOGRAFIAS = [
    _biografia("Astrólogo", ["int", "sab"], "Ocultismo", "Astrologia", "Identificação de Esquisitice", 51),
    _biografia("Barbeiro", ["des", "sab"], "Medicina", "Cirurgia", "Cirurgia Arriscada", 51),
    _biografia("Contador", ["int", "sab"], "Sociedade", "Contabilidade", "Olho para Números", 51),
    _biografia("Mensageiro", ["des", "int"], "Sociedade", "cidade ou região de origem", "Conteúdo Limpo", 51),
    _biografia("Condutor", ["for", "des"], "Acrobacia", "Pilotagem", "Garantia", 51),
    _biografia("Insurgente", ["for", "sab"], "Dissimulação", "Guerra", "Distração Prolongada", 51),
    _biografia("Batedor Montado", ["con", "sab"], "Natureza", "Planícies", "Cavaleiro Expresso", 51),
    _biografia("Peregrino", ["sab", "car"], "Religião", "divindade patrona", "Símbolo do Peregrino", 51),
    _biografia("Refugiado", ["con", "sab"], "Sociedade", "assentamento de origem", "Experiência das Ruas", 52),
    _biografia("Raizeiro", ["int", "sab"], "Ocultismo", "Herbalismo", "Magia de Raiz", 52),
    _biografia("Sabotador", ["for", "des"], "Ladinagem", "Engenharia", "Prestidigitação Ocultadora", 52),
    _biografia("Catador", ["int", "sab"], "Sobrevivência", "assentamento onde catava", "Forrageador", 52),
    _biografia("Criado", ["des", "car"], "Sociedade", "Trabalho", "Leitura Labial", 52),
    _biografia("Escudeiro", ["for", "con"], "Atletismo", "Heráldica ou Guerra", "Auxílio com Armadura", 52),
    _biografia("Coletor de Impostos", ["for", "car"], "Intimidação", "assentamento empregador", "Coerção Rápida", 52),
    _biografia("Pupilo", ["con", "car"], "Performance", "Genealogia", "Performance Fascinante", 52),
    _biografia("Amnésico", ["livre", "livre", "mestre"], "a definir", "passado desconhecido", "nenhum", 53,
        rara=True,
        descricao="Recebe três incrementos livres: você escolhe dois e o mestre escolhe o terceiro conforme os primeiros indícios do passado. Você e o mestre definem poucos detalhes marcantes para iniciar a descoberta durante o jogo.",
        extras={"livres": 3, "escolhaMestre": 1, "pericia": None, "talento": None}),
    _biografia("Abençoado", ["sab", "car"], "a definir", "divindade que concedeu a bênção", "Orientação Inata", 53,
        rara=True,
        descricao="Escolha Sabedoria ou Carisma e outro incremento livre. Treina um Saber ligado à divindade. Pode conjurar orientação como magia inata divina à vontade ou receber bênção equivalente definida pelo mestre.",
        extras={"magiasInatas": [{"id": "orientacao", "tradicao": "divina", "frequencia": "a-vontade"}]}),
    _biografia("Amaldiçoado", ["int", "car"], "Ocultismo", "Maldições", "Sinal Protetor", 53,
        rara=True,
        descricao="Escolha Inteligência ou Carisma e outro incremento livre. Treina Ocultismo e Saber (Maldições). Sinal Protetor é uma reação, uma vez por minuto, antes de uma salvaguarda mágica: +2 de circunstância, ou +3 se o efeito for uma maldição. O mestre define as manifestações remanescentes da maldição.",
        extras={"reacao": {"id": "sinal-protetor", "frequenciaMinutos": 1, "bonus": 2, "bonusContraMaldicao": 3}}),
    _biografia("Criança Feral", ["for", "des", "con"], "Natureza", "Sobrevivência", "Forrageador", 53,
        rara=True,
        descricao="Escolha Força, Destreza ou Constituição e outro incremento livre. Treina Natureza e Sobrevivência; recebe visão na penumbra (ou visão no escuro se já a possuía), faro impreciso de 9 m e Forrageador.",
        extras={"pericias": ["natureza", "sobrevivencia"], "sentidos": [{"tipo": "faro", "precisao": "impreciso", "alcance": 9}, {"tipo": "visao-penumbra", "melhoraSeRepetido": "visao-escuro"}]}),
    _biografia("Ligado às Fadas", ["des", "car"], "a definir", "Fadas", "Fortuna Feérica", 53,
        rara=True,
        descricao="Escolha Destreza ou Carisma e outro incremento livre. Treina Saber (Fadas). Uma vez por dia, Fortuna Feérica permite rolar duas vezes um teste de perícia ainda não realizado e usar o melhor resultado. O pacto inclui um anátema definido com o mestre.",
        extras={"fortuna": {"frequenciaDias": 1, "rolagens": 2, "usar": "melhor"}, "exigeAnatema": True}),
    _biografia("Assombrado", ["sab", "car"], "Ocultismo", "entidade assombradora", "Ajuda da Assombração", 54,
        rara=True,
        descricao="Escolha Sabedoria ou Carisma e outro incremento livre. Treina Ocultismo e uma perícia adicional ligada à entidade. O mestre pode oferecer +1 de circunstância como Ajuda; se aceitar e falhar, fica assustado 2 (4 em falha crítica), sem poder reduzir esse valor inicial.",
        extras={"ajudaAssombracao": {"bonus": 1, "falhaAssustado": 2, "falhaCriticaAssustado": 4}}),
    _biografia("Retornado", ["con", "sab"], "a definir", "Cemitério", "Inabalável", 54,
        rara=True,
        descricao="Escolha Constituição ou Sabedoria e outro incremento livre. Recebe Inabalável e Saber Adicional para Saber (Cemitério). Sua volta da morte orienta a história, sem conceder automaticamente traços de morto-vivo.",
        extras={"talentosAdicionais": ["saber-adicional"]}),
    _biografia("Realeza", ["int", "car"], "Sociedade", "Nobreza", "Graças da Corte", 54,
        rara=True,
        descricao="Escolha Inteligência ou Carisma e outro incremento livre. Treina Sociedade e recebe Graças da Corte. Sua posição concede influência narrativa, definida com o mestre, e interage com Conexões Influentes conforme o território da família.",
        extras={"exigeAprovacaoMestre": True}),
]


_ARQUETIPOS = [
    ("Multiclasse de Alquimista", 176, "Adota fórmulas, ferramentas e alquimia de um alquimista."),
    ("Multiclasse de Bárbaro", 177, "Obtém Fúria e amplia técnicas ligadas a um instinto."),
    ("Multiclasse de Campeão", 178, "Assume uma causa, defesa e devoção de campeão."),
    ("Multiclasse de Investigador", 179, "Adquire investigação, dedução e estratagema."),
    ("Multiclasse de Monge", 180, "Aprende técnicas, posturas e disciplina de monge."),
    ("Multiclasse de Oráculo", 181, "Acessa magia divina e poderes de um mistério."),
    ("Multiclasse de Feiticeiro", 182, "Desperta magia espontânea de uma linhagem."),
    ("Multiclasse de Espadachim", 183, "Adquire panache e técnicas de finalização."),
    ("Acrobata", 184, "Especializa mobilidade, equilíbrio e manobras acrobáticas."),
    ("Arqueólogo", 185, "Explora ruínas, interpreta relíquias e resiste a perigos antigos."),
    ("Arqueiro", 186, "Aprofunda ataques e técnicas com arcos."),
    ("Assassino", 187, "Marca alvos e aperfeiçoa emboscadas letais."),
    ("Bastião", 188, "Especializa defesa e reações com escudo."),
    ("Domador de Feras", 189, "Combate ao lado de um companheiro animal."),
    ("Abençoado", 191, "Recebe magia curativa ou destrutiva de devoção."),
    ("Caçador de Recompensas", 192, "Rastreia uma presa designada e explora suas fraquezas."),
    ("Cavaleiro", 193, "Luta montado e desenvolve uma montaria companheira."),
    ("Celebridade", 195, "Transforma fama, atenção e presença pública em recursos."),
    ("Dândi", 196, "Usa etiqueta, rumores e influência social."),
    ("Guerreiro de Duas Armas", 197, "Coordena ataques e defesas com uma arma em cada mão."),
    ("Duelista", 198, "Aperfeiçoa combate com uma mão livre."),
    ("Arqueiro Místico", 199, "Combina magia com disparos de arco."),
    ("Mestre de Familiar", 201, "Amplia habilidades e versatilidade do familiar."),
    ("Gladiador", 202, "Usa espetáculo e perícia marcial diante de uma plateia."),
    ("Herbalista", 203, "Prepara remédios e itens naturais para cura e suporte."),
    ("Linguista", 204, "Domina idiomas, escrita, códigos e comunicação."),
    ("Marechal", 205, "Comanda aliados por posturas e instruções táticas."),
    ("Artista Marcial", 207, "Desenvolve ataques desarmados e posturas sem multiclasse."),
    ("Atropelador", 208, "Derruba oponentes com força, impulso e tamanho."),
    ("Médico", 209, "Expande tratamento de ferimentos e resposta médica em combate."),
    ("Pirata", 210, "Emprega mobilidade naval, intimidação e truques de abordo."),
    ("Envenenador", 211, "Fabrica e aplica venenos com segurança e precisão."),
    ("Ritualista", 212, "Aprende e conduz rituais além da conjuração normal."),
    ("Batedor", 213, "Reconhece terreno e prepara o grupo antes do combate."),
    ("Trapaceiro de Pergaminhos", 214, "Improvisa conjuração a partir de pergaminhos de várias tradições."),
    ("Patife", 215, "Explora truques sujos, distrações e vantagens oportunistas."),
    ("Sentinela", 216, "Aprimora proficiência e mobilidade com armaduras."),
    ("Espantalho", 217, "Usa presença, medo e aparência inquietante para controlar inimigos."),
    ("Diletante de Talismãs", 218, "Prepara e ativa talismãs temporários diariamente."),
    ("Vigilante", 219, "Mantém uma identidade social separada da identidade heroica."),
    ("Viking", 221, "Combina escudo, armas nórdicas e investidas marítimas."),
    ("Improvisador de Armas", 222, "Transforma objetos comuns em armas eficazes."),
    ("Lutador", 223, "Especializa agarrões, derrubadas e combate corpo a corpo."),
]


ARQUETIPOS = [
    {"id": _id(nome), "nome": nome, "pagina": pagina, "paginaImpressa": pagina - 1,
     "fonte": FONTE, "descricao": resumo, "resumo": [resumo],
     "somenteConsulta": True, "revisao": "resumo-editorial",
     "lacunaAutomacao": "Talentos individuais e pré-requisitos ainda precisam de blocos estruturados antes da seleção guiada."}
    for nome, pagina, resumo in _ARQUETIPOS
]


def aplicar(cat):
    cat["biografias"] = BIOGRAFIAS
    cat["arquetipos"] = ARQUETIPOS
    cat["lacunas"].append({
        "categoria": "arquetipos",
        "descricao": "Os 43 arquétipos do índice estão traduzidos e localizáveis para consulta; talentos individuais ainda não são oferecidos pelo guia.",
    })
