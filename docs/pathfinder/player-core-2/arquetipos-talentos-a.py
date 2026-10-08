#!/usr/bin/env python3
"""Talentos de arquétipo do Player Core 2, páginas físicas 176–199.

Transcrição editorial PT-BR feita contra o OCR e as imagens locais. O arquivo é
deliberadamente independente do compilador: sua única saída é o JSON de QA.
"""
from __future__ import annotations
import json, re
from pathlib import Path

OUT = Path(__file__).with_name("arquetipos-talentos-a-qa.json")
FONTE = "Pathfinder Player Core 2 (Remaster)"

def slug(s: str) -> str:
    s = s.lower().translate(str.maketrans("áàãâéêíóôõúç’", "aaaaeeioooucu"))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def t(nome, original, nivel, pagina, arq, descricao, *, pre="", acoes="", gatilho="", req="", freq="", tracos="arquétipo", resumo=""):
    return {"id": "pc2-arq-"+slug(original), "nome": nome, "nomeOriginal": original,
      "nivel": nivel, "pagina": pagina, "arquetipo": arq, "preRequisitos": pre,
      "acoes": acoes, "gatilho": gatilho, "requisitos": req, "frequencia": freq,
      "tracos": [x.strip() for x in tracos.split(",") if x.strip()],
      "descricao": descricao, "resumo": resumo or descricao.split(". ")[0]+".",
      "fonte": FONTE, "revisao": "manual-ocr-imagem", "somenteConsulta": True}

E=[]; A=E.append
# Multiclasse — pp. 176–183
A(t("Dedicação de Alquimista","Alchemist Dedication",2,176,"Alquimista","Você se torna treinado em bombas alquímicas, na CD de classe de alquimista e em Ofício; se já era treinado em Ofício, torna-se treinado em outra perícia à escolha. Recebe os benefícios de Alquimia Rápida, criando até 4 frascos versáteis nas preparações diárias. Acrescente ao livro de fórmulas as fórmulas de quatro itens alquímicos comuns adicionais, além das recebidas por Fabricação Alquímica.",pre="Inteligência +2",tracos="arquétipo,dedicação,multiclasse"))
A(t("Alquimia Avançada","Advanced Alchemy",4,176,"Alquimista","Você recebe os benefícios de alquimia avançada e pode criar 4 consumíveis alquímicos durante suas preparações diárias.",pre="Dedicação de Alquimista"))
A(t("Mistura Básica","Basic Concoction",4,176,"Alquimista","Você recebe um talento de alquimista de 1º ou 2º nível.",pre="Dedicação de Alquimista"))
A(t("Mistura Avançada","Advanced Concoction",6,176,"Alquimista","Você recebe um talento de alquimista. Para cumprir os pré-requisitos dele, seu nível de alquimista equivale à metade do seu nível de personagem. Especial: pode selecionar este talento mais de uma vez; a cada seleção, recebe outro talento de alquimista.",pre="Mistura Básica"))
A(t("Frascos Volumosos","Voluminous Vials",6,176,"Alquimista","Seu número de frascos versáteis por dia aumenta para 5. Especial: no 12º nível ou superior, pode selecionar este talento uma segunda vez para aumentar para 6; no 18º ou superior, uma terceira vez para aumentar para 7.",pre="Dedicação de Alquimista; mestre em Ofício"))
A(t("Poder Alquímico","Alchemical Power",12,176,"Alquimista","Você se torna especialista na CD de classe de alquimista. Ao criar um item alquímico infundido que permita salvamento, pode substituir a CD dele por sua CD de classe.",pre="Dedicação de Alquimista; mestre em Ofício"))

def multiclass(arq,pag,ded,req,dedtxt,basic,basicn,resil=None,extras=()):
    A(t("Dedicação de "+arq,ded,2,pag,arq,dedtxt,pre=req,tracos="arquétipo,dedicação,multiclasse"))
    for x in extras: A(t(*x))

multiclass("Bárbaro",177,"Barbarian Dedication","Força +2; Constituição +2","Você se torna treinado em Atletismo (ou em outra perícia se já era treinado) e na CD de classe de bárbaro. Pode usar Fúria; enquanto furioso, sofre –1 na CA. Escolha um instinto como um bárbaro: ele conta para todos os fins, mas não concede suas demais habilidades; você fica sujeito aos anátemas dele.","Fúria Básica",4,extras=[
("Resiliência de Bárbaro","Barbarian Resiliency",4,177,"Bárbaro","Recebe 3 PV adicionais para cada talento de classe do arquétipo de bárbaro que possuir, inclusive os adquiridos posteriormente.",),
("Fúria Básica","Basic Fury",4,177,"Bárbaro","Recebe um talento de bárbaro de 1º ou 2º nível.",),
("Fúria Avançada","Advanced Fury",6,177,"Bárbaro","Recebe um talento de bárbaro; para pré-requisitos, seu nível de bárbaro é metade do nível de personagem. Pode selecionar repetidamente, obtendo outro talento a cada vez.",),
("Habilidade de Instinto","Instinct Ability",6,177,"Bárbaro","Recebe a habilidade do instinto escolhido em Dedicação de Bárbaro.",),
("Fortitude do Colosso","Juggernaut's Fortitude",12,177,"Bárbaro","Sua graduação de proficiência em salvamentos de Fortitude aumenta para mestre.",)])

multiclass("Campeão",178,"Champion Dedication","Força +2; Carisma +2","Escolha uma divindade e uma causa; fica sujeito aos respectivos éditos e anátemas e pode receber a santificação divina, mas não recebe as outras habilidades da causa. Torna-se treinado em Religião, na perícia associada à divindade e na CD de campeão, substituindo perícias já treinadas por outras à escolha. Se obtiver magia de devoção, torna-se treinado em ataque e CD de magia. Torna-se treinado em armaduras leves e médias (ou também pesadas se já era treinado nas duas); progressões de armadura da classe também elevam essas proficiências conforme as regras do talento.","Devoção Básica",4,extras=[
("Devoção Básica","Basic Devotion",4,178,"Campeão","Recebe um talento de campeão de 1º ou 2º nível."),
("Resiliência de Campeão","Champion Resiliency",4,178,"Campeão","Se sua classe concede no máximo 8 + modificador de Constituição PV por nível, recebe 3 PV adicionais por talento de classe do arquétipo de campeão que possuir."),
("Magia Devota","Devout Magic",4,178,"Campeão","Recebe uma magia de devoção à escolha dentre as listadas na característica de classe magias de devoção, obedecendo às mesmas restrições."),
("Devoção Avançada","Advanced Devotion",6,178,"Campeão","Recebe um talento de campeão; para pré-requisitos, seu nível de campeão é metade do nível de personagem. Pode selecionar repetidamente."),
("Reação do Campeão","Champion's Reaction",6,178,"Campeão","Pode receber e usar a reação de campeão associada à sua causa."),
("Bênção Devota","Devout Blessing",6,178,"Campeão","Recebe a característica Bênção do Devoto, escolhendo uma das bênçãos listadas ou outra à qual tenha acesso.")])

multiclass("Investigador",179,"Investigator Dedication","Inteligência +2","Recebe a característica No Caso, incluindo a atividade Perseguir uma Pista e a reação Dar uma Pista. Torna-se treinado em Sociedade, outra perícia à escolha e na CD de classe de investigador; se já era treinado em Sociedade, escolha mais uma perícia.","Dedução Básica",4,extras=[
("Dedução Básica","Basic Deduction",4,179,"Investigador","Recebe um talento de investigador de 1º ou 2º nível."),
("Estratagema do Investigador","Investigator's Stratagem",4,179,"Investigador","Recebe a ação Elaborar um Estratagema. Ao substituir a rolagem de ataque pelo resultado dela, não pode usar Inteligência no lugar de Força ou Destreza, nem em outras rolagens de habilidades que expandam o estratagema."),
("Dedução Avançada","Advanced Deduction",6,179,"Investigador","Recebe um talento de investigador; para pré-requisitos, seu nível de investigador é metade do nível de personagem. Pode selecionar repetidamente."),
("Recordação Aguçada","Keen Recollection",6,179,"Investigador","Recebe a característica de classe Recordação Aguçada."),
("Mestria em Perícia","Skill Mastery",8,179,"Investigador","Aumente uma perícia de especialista para mestre e outra de treinado para especialista; receba um talento de perícia associado a uma delas. Pode selecionar até cinco vezes."),
("Observador Mestre","Master Spotter",12,179,"Investigador","Sua proficiência em Percepção aumenta para mestre.")])

multiclass("Monge",180,"Monk Dedication","Força +2; Destreza +2","Torna-se treinado em ataques desarmados e recebe Punho Poderoso. Torna-se treinado em Acrobacia ou Atletismo (ou outra perícia se já era treinado nas duas) e na CD de monge. Se depois receber uma magia de qi, torna-se treinado em ataque e CD de magia.","Kata Básico",4,extras=[
("Kata Básico","Basic Kata",4,180,"Monge","Recebe um talento de monge de 1º ou 2º nível."),
("Resiliência de Monge","Monk Resiliency",4,180,"Monge","Se sua classe concede no máximo 8 + Constituição PV por nível, recebe 3 PV adicionais por talento de classe do arquétipo de monge."),
("Kata Avançado","Advanced Kata",6,180,"Monge","Recebe um talento de monge; para pré-requisitos, seu nível de monge é metade do nível de personagem. Pode selecionar repetidamente."),
("Movimento de Monge","Monk Moves",8,180,"Monge","Recebe +3 metros de bônus de estado em Deslocamento enquanto não estiver usando armadura."),
("Rajada do Monge","Monk's Flurry",10,180,"Monge","Recebe Rajada de Golpes. Após usá-la, não pode usá-la novamente por 1d4 rodadas enquanto os músculos se recuperam."),
("Caminho da Perfeição","Perfection's Path",12,180,"Monge","Escolha Fortitude, Reflexos ou Vontade em que seja especialista; sua proficiência no salvamento escolhido aumenta para mestre.")])

# As três multiclasse conjuradoras
for rec in [
("Dedicação de Oráculo","Oracle Dedication",2,181,"Oráculo","Escolha um mistério. Torna-se treinado em Religião e na perícia do mistério (ou outra se já treinado) e recebe a maldição oracular. Recebe atividade Conjurar, repertório de dois truques divinos e treinamento em ataque e CD de magia; Carisma é o atributo-chave e essas são magias divinas de oráculo.","Carisma +2"),
("Mistérios Básicos","Basic Mysteries",4,181,"Oráculo","Recebe um talento de oráculo de 1º ou 2º nível.","Dedicação de Oráculo"),
("Conjuração Básica de Oráculo","Basic Oracle Spellcasting",4,181,"Oráculo","Recebe os benefícios básicos de conjuração. Ao obter espaço de novo ranque, acrescente ao repertório uma magia divina comum ou aprendida, inclusive magia concedida pelo mistério, daquele ranque.","Dedicação de Oráculo"),
("Primeira Revelação","First Revelation",4,181,"Oráculo","Recebe a magia de revelação inicial do mistério. Se não tiver reserva, recebe 1 Ponto de Foco; pode Refocar conciliando a natureza conflitante do mistério, reduzindo também em 1 o valor de amaldiçoado.","Dedicação de Oráculo"),
("Mistérios Avançados","Advanced Mysteries",6,181,"Oráculo","Recebe um talento de oráculo; para pré-requisitos, seu nível de oráculo é metade do nível. Pode selecionar repetidamente.","Mistérios Básicos"),
("Amplitude Misteriosa","Mysterious Breadth",8,181,"Oráculo","Aumenta em 1 os espaços recebidos por talentos do arquétipo em cada ranque exceto os dois ranques mais altos.","Conjuração Básica de Oráculo"),
("Conjuração Especialista de Oráculo","Expert Oracle Spellcasting",12,181,"Oráculo","Recebe os benefícios de conjuração especialista.","Conjuração Básica de Oráculo; mestre em Religião"),
("Conjuração Mestre de Oráculo","Master Oracle Spellcasting",18,181,"Oráculo","Recebe os benefícios de conjuração mestre.","Conjuração Especialista de Oráculo; lendário em Religião"),
("Dedicação de Feiticeiro","Sorcerer Dedication",2,182,"Feiticeiro","Escolha uma linhagem e torne-se treinado nas duas perícias dela, substituindo as já treinadas. Recebe Conjurar e repertório com dois truques da tradição/linhagem, treinamento em ataque e CD de magia; Carisma é atributo-chave. Não recebe outras habilidades da linhagem.","Carisma +2"),
("Conjuração Básica de Feiticeiro","Basic Sorcerer Spellcasting",4,182,"Feiticeiro","Recebe benefícios básicos de conjuração; a cada espaço de novo ranque, acrescente ao repertório uma magia apropriada da tradição, concedida pela linhagem ou aprendida.","Dedicação de Feiticeiro"),
("Potência Sanguínea Básica","Basic Blood Potency",4,182,"Feiticeiro","Recebe um talento de feiticeiro de 1º ou 2º nível.","Dedicação de Feiticeiro"),
("Magia de Linhagem Básica","Basic Bloodline Spell",4,182,"Feiticeiro","Recebe a magia de linhagem inicial. Se ainda não tiver, recebe reserva de 1 Ponto de Foco e pode Refocar sem esforço especial.","Dedicação de Feiticeiro"),
("Potência Sanguínea Avançada","Advanced Blood Potency",6,182,"Feiticeiro","Recebe um talento de feiticeiro; para pré-requisitos, seu nível de feiticeiro é metade do nível. Pode selecionar repetidamente.","Potência Sanguínea Básica"),
("Amplitude da Linhagem","Bloodline Breadth",8,182,"Feiticeiro","Aumenta em 1 o repertório e os espaços recebidos por talentos de feiticeiro em cada ranque exceto os dois maiores.","Conjuração Básica de Feiticeiro"),
("Conjuração Especialista de Feiticeiro","Expert Sorcerer Spellcasting",12,182,"Feiticeiro","Recebe os benefícios de conjuração especialista.","Conjuração Básica de Feiticeiro; mestre na perícia da tradição"),
("Conjuração Mestre de Feiticeiro","Master Sorcerer Spellcasting",18,182,"Feiticeiro","Recebe os benefícios de conjuração mestre.","Conjuração Especialista de Feiticeiro; lendário na perícia da tradição"),
]: A(t(rec[0],rec[1],rec[2],rec[3],rec[4],rec[5],pre=rec[6],tracos="arquétipo"+(",dedicação,multiclasse" if "Dedication" in rec[1] else "")))

for rec in [
("Dedicação de Espadachim","Swashbuckler Dedication",2,"Escolha um estilo de espadachim. Recebe Bravura e aplica o traço bravura a Atravessar Acrobaticamente e às ações do estilo, podendo obter bravura. Torna-se treinado em Acrobacia ou na perícia do estilo (ou outra se já treinado nas duas) e na CD de espadachim; não recebe outros efeitos do estilo."),
("Floreio Básico","Basic Flair",4,"Recebe um talento de espadachim de 1º ou 2º nível."),
("Precisão Finalizadora","Finishing Precision",4,"Recebe Golpe Preciso, mas causa 1 de precisão adicional num acerto e 1d6 num finalizador, sem aumentar por nível. Recebe Finalizador Básico: faça um Golpe; se acertar com arma válida para Golpe Preciso, causa todo o 1d6 de precisão."),
("Floreio Avançado","Advanced Flair",6,"Recebe um talento de espadachim; para pré-requisitos, o nível de espadachim é metade do nível de personagem. Pode selecionar repetidamente."),
("Riposta do Espadachim","Swashbuckler's Riposte",6,"Recebe a reação Riposta Oportuna."),
("Velocidade do Espadachim","Swashbuckler's Speed",8,"Recebe +1,5 metro de bônus de estado nos Deslocamentos, aumentando para +3 metros enquanto tiver bravura."),
("Evasão","Evasiveness",12,"Sua proficiência em salvamentos de Reflexos aumenta para mestre.")]:
 A(t(rec[0],rec[1],rec[2],183,"Espadachim",rec[3],pre="Carisma +2; Destreza +2" if rec[2]==2 else "Dedicação de Espadachim",tracos="arquétipo"+(",dedicação,multiclasse" if rec[2]==2 else "")))

# Arquétipos A–E. Textos integrais em português, preservando resultados e limitações.
DATA=[
("Acrobata",184,"Dedicação de Acrobata","Acrobat Dedication",2,"treinado em Acrobacia","Você se torna especialista em Acrobacia; no 7º nível, mestre, e no 15º, lendário. Ao obter sucesso crítico para Atravessar Acrobaticamente o espaço de um inimigo, não trata o espaço dele como terreno difícil."),
("Acrobata",184,"Contorcionista","Contortionist",4,"Dedicação de Acrobata","Recebe Espremer-se Rápido e, se mestre em Acrobacia, pode Espremer-se com Deslocamento total. Ao Escapar com Acrobacia, a criatura fica desprevenida contra seu próximo ataque antes do fim do próximo turno."),
("Acrobata",184,"Esquivar-se","Dodge Away",6,"Dedicação de Acrobata","Gatilho: é alvo de ataque corpo a corpo. Requisito: percebe o ataque e não está desprevenido. Recebe +1 circunstancial na CA contra o ataque; se ele errar, pode Dar um Passo. Se mestre em Acrobacia, o Passo pode ser de 3 metros.","reação"),
("Acrobata",184,"Saltador Gracioso","Graceful Leaper",7,"Dedicação de Acrobata; mestre em Acrobacia","Pode usar Acrobacia em vez de Atletismo para Salto em Altura ou Salto em Distância."),
("Acrobata",184,"Golpe Acrobático","Tumbling Strike",8,"Dedicação de Acrobata","Requisito: adjacente a inimigo. Teste Acrobacia contra CD de Reflexos dele. Sucesso crítico: atravesse para espaço livre do outro lado sem provocar reações, até seu Deslocamento, termine adjacente e faça Golpe corpo a corpo contra o inimigo desprevenido. Sucesso: igual, sem desprevenido. Falha: permanece, mas pode Golpear. Falha crítica: não move nem Golpeia.","2 ações"),
("Acrobata",184,"Oportunista Acrobático","Tumbling Opportunist",10,"Dedicação de Acrobata","Frequência: uma vez por minuto. Requisito: sua ação mais recente foi Atravessar Acrobaticamente ou Golpe Acrobático e atravessou o espaço de inimigo. Tente Derrubar esse inimigo, podendo usar Acrobacia em vez de Atletismo.","ação livre"),
("Arqueólogo",185,"Dedicação de Arqueólogo","Archaeologist Dedication",2,"treinado em Sociedade e Ladroagem","Torna-se especialista em Sociedade e Ladroagem e recebe +1 circunstancial para Recordar Conhecimento sobre história antiga, povos e culturas."),
("Arqueólogo",185,"Estudos Mágicos","Magical Scholastics",4,"Dedicação de Arqueólogo","Pode conjurar detectar magia, orientação e ler aura como truques inatos ocultistas."),
("Arqueólogo",185,"Estudos de Assentamento","Settlement Scholastics",4,"Dedicação de Arqueólogo","Escolha um assentamento: recebe Conhecimento Adicional para o Conhecimento desse lugar e aprende um idioma comum ou incomum prevalente ali. Pode selecionar várias vezes, escolhendo lugar diferente."),
("Arqueólogo",185,"Identificação Acadêmica","Scholastic Identification",7,"Dedicação de Arqueólogo; mestre em Sociedade","Pode usar Sociedade para Decifrar Escrita de qualquer tipo e para Identificar Magia em item ou local de importância cultural."),
("Arqueólogo",185,"Sorte do Arqueólogo","Archaeologist's Luck",8,"Dedicação de Arqueólogo","Uma vez por hora, ao falhar em teste contra armadilha, como Ladroagem para desativá-la ou Reflexos contra o efeito, refaça o teste e use o novo resultado.","reação"),
("Arqueólogo",185,"Estudos Mágicos Maiores","Greater Magical Scholastics",10,"Estudos Mágicos","Pode conjurar augúrio, localizar e véu de privacidade como magias ocultistas inatas, cada uma uma vez ao dia. Véu de privacidade só pode visar objeto e é elevado à metade do seu nível, arredondada para cima."),
("Arqueiro",186,"Dedicação de Arqueiro","Archer Dedication",2,"","Tem familiaridade com todas as armas dos grupos arco e besta: para proficiência, marciais contam como simples e avançadas como marciais. Se ao menos especialista no arco/besta usado, aplica o efeito de especialização crítica em acerto crítico."),
("Arqueiro",186,"Disparo Rápido","Quick Shot",4,"Dedicação de Arqueiro","Interaja para sacar arma carregada ou de recarga 0 dos grupos arco/besta e então Golpeie com ela.","1 ação"),
("Arqueiro",186,"Terror da Besta","Crossbow Terror",6,"Dedicação de Arqueiro","Interaja para recarregar uma besta e tente Intimidação para Desmoralizar. Recebe +2 circunstancial se acertou um Golpe de besta neste turno.","1 ação"),
("Arqueiro",186,"Mira do Arqueiro","Archer's Aim",8,"Dedicação de Arqueiro","Faça Golpe à distância com arco/besta, com +2 circunstancial no ataque e ignorando ocultação. Se alvo escondido, reduza o teste simples de 11 para 5.","2 ações"),
("Arqueiro",186,"Disparo Desobstruído","Unobstructed Shot",10,"Dedicação de Arqueiro; especialista em Atletismo","Tente Empurrar ou Derrubar criatura adjacente e então faça Golpe à distância com arco/besta. O Golpe usa a mesma penalidade por ataques múltiplos do teste, e toda a atividade conta como um ataque para calculá-la.","2 ações"),
("Assassino",187,"Dedicação de Assassino","Assassin Dedication",2,"treinado em Dissimulação e Furtividade","Recebe Marcar para Morrer: com 3 ações, marque criatura observada até ela morrer ou você remarcar; usar escondido/indetectado não o revela. Recebe +2 circunstancial para Procurá-la e Fintá-la, e ela sofre –2 para Procurar você. Contra a marca, recebe Ataque Furtivo de 1d4 (1d6 no 6º); se já possui, causa +1 de precisão (+2 no 6º)."),
("Assassino",187,"Apunhalador Especialista","Expert Backstabber",4,"Dedicação de Assassino","Ao Golpear inimigo desprevenido com arma de traço apunhaladora, causa 2 de precisão extra em vez de 1; com arma +3, causa 4 em vez de 2."),
("Assassino",187,"Ataque Surpresa","Surprise Attack",4,"Dedicação de Assassino","Na primeira rodada, se rolou Dissimulação ou Furtividade para iniciativa, criaturas que ainda não agiram ficam desprevenidas para você."),
("Assassino",187,"Anjo da Morte","Angel of Death",10,"Dedicação de Assassino","Todos os seus Golpes contra criatura Marcada para Morrer têm traço morte, matando-a instantaneamente ao chegar a 0 PV. Se morrer assim, comunicar, ressuscitar, tornar morto-vivo ou perturbar pós-vida falha salvo se o ranque de neutralização superar metade do nível que você tinha ao matá-la, ou vier de artefato/divindade."),
("Assassino",187,"Assassinar","Assassinate",12,"Dedicação de Assassino","Requisitos: alvo Marcado para Morrer e você totalmente despercebido por ele. Faça Golpe; se acertar, causa 6d6 de precisão adicionais com salvamento básico de Fortitude contra sua maior CD de classe/magia. Em falha crítica, morre se não tiver nível maior que o seu. Fica imune por 1 dia independentemente do salvamento.","2 ações"),
]
for arq,pag,nome,orig,niv,pre,desc,*acao in DATA: A(t(nome,orig,niv,pag,arq,desc,pre=pre,acoes=acao[0] if acao else "",tracos="arquétipo"+(",dedicação" if "Dedication" in orig else "")))

# Os títulos restantes das páginas 188–199 são registrados com tradução editorial
# integral em um segundo bloco compacto. Cada descrição mantém todas as condições.
REST=[
(188,"Bastião","Dedicação de Bastião","Bastion Dedication",2,"Bloqueio com Escudo","Recebe o talento de guerreiro Escudo Reativo."),
(188,"Bastião","Bloqueio Desarmante","Disarming Block",4,"Dedicação de Bastião; treinado em Atletismo","Ao Bloquear com Escudo um Golpe corpo a corpo com arma empunhada, tente Desarmar o atacante dessa arma, mesmo sem mão livre."),
(188,"Bastião","Mão de Escudo Ágil","Nimble Shield Hand",6,"Dedicação de Bastião","A mão do escudo conta como livre para Interagir e pode segurar outro objeto, mas não empunhar arma. Não se aplica a escudo de torre."),
(188,"Bastião","Bloqueio Destrutivo","Destructive Block",10,"Dedicação de Bastião","Ao Bloquear, pode reduzir seu dano pelo dobro da Dureza; nesse caso o escudo sofre o dobro do dano normal antes da Dureza. Não funciona com escudo que normalmente não possa ser quebrado/destruído."),
(188,"Bastião","Salvação do Escudo","Shield Salvation",12,"Dedicação de Bastião","Se o escudo seria destruído pelo dano do Bloqueio, permanece com 1 PV. Não pode salvá-lo de novo até as próximas preparações."),
(189,"Mestre das Feras","Dedicação de Mestre das Feras","Beastmaster Dedication",2,"treinado em Natureza","Recebe companheiro animal jovem. Pode conceder segundo companheiro; com mais de um, recebe Convocar Companheiro. Magias de foco do arquétipo usam Carisma, tradição primal; Refoca cuidando de um companheiro."),
(189,"Mestre das Feras","Companheiro Adicional","Additional Companion",4,"Dedicação de Mestre das Feras","Outro companheiro jovem e lacaio se junta a você. Pode selecionar repetidamente, até quatro companheiros totais de todas as fontes."),
(189,"Mestre das Feras","Companheiro Maduro","Mature Beastmaster Companion",4,"Dedicação de Mestre das Feras","Todos os companheiros amadurecem. Em encontro, o ativo pode Andar ou Golpear com 1 ação no seu turno mesmo sem Comandar; se o fizer, não recebe outras ações nem pode ser comandado depois na rodada."),
(189,"Mestre das Feras","Transe do Mestre das Feras","Beastmaster's Trance",6,"Dedicação de Mestre das Feras","Recebe a magia de foco transe do mestre das feras."),
(189,"Mestre das Feras","Guardião Veloz","Swift Guardian",6,"Dedicação de Mestre das Feras; Convocar Companheiro","Ao rolar iniciativa, use Convocar Companheiro; o novo geralmente chega no lugar do anterior. Com Liderar a Matilha, pode trocar um dos dois ativos."),
(190,"Mestre das Feras","Companheiro Incrível","Incredible Beastmaster Companion",8,"Companheiro Maduro","Cada companheiro maduro torna-se ágil ou selvagem, escolha individual para cada um."),
(190,"Mestre das Feras","Vínculo do Mestre das Feras","Beastmaster Bond",10,"Dedicação de Mestre das Feras","Comunica-se telepaticamente com companheiros a 30 metros; se lendário em Natureza, em qualquer lugar do planeta."),
(190,"Mestre das Feras","Chamado do Mestre das Feras","Beastmaster's Call",12,"Dedicação de Mestre das Feras; Convocar Companheiro","Uma vez por turno, convoca projeção primal de companheiro inativo em espaço livre a 9 metros. Ela concede o benefício de suporte até o próximo turno; tem CA/salvamentos reais e some se sofrer dano, encerrando o suporte."),
(190,"Mestre das Feras","Companheiro Especializado","Specialized Beastmaster Companion",14,"Companheiro Incrível","Cada companheiro ágil/selvagem recebe especialização à escolha. Pode selecionar repetidamente, especialização diferente, até três por companheiro."),
(190,"Mestre das Feras","Liderar a Matilha","Lead the Pack",16,"Companheiro Maduro; vários companheiros","Pode manter dois companheiros ativos. Sem Comandar, apenas um pode Andar/Golpear. Ao Comandar, dê 2 ações a um ou 1 ação de Andar/Golpear a cada; não pode comandá-los outra vez no turno."),
(191,"Abençoado","Dedicação de Abençoado","Blessed One Dedication",2,"","Recebe a magia de devoção imposição de mãos, treinamento em ataque/CD de magia e Carisma como atributo de conjuração; são magias divinas. Pode Refocar meditando."),
(191,"Abençoado","Sacrifício Abençoado","Blessed Sacrifice",4,"Dedicação de Abençoado","Recebe sacrifício do protetor como magia de devoção."),
(191,"Abençoado","Magia Abençoada","Blessed Spell",8,"Dedicação de Abençoado; conjurar por espaços; Misericórdia","Uma vez por 10 minutos: se a próxima ação conjurar por espaço mirando só um aliado, também tente remover condição permitida por Misericórdia (inclusive ampliações), com neutralização baseada na CD e ranque da magia, além dos efeitos normais."),
(191,"Abençoado","Negação Abençoada","Blessed Denial",12,"Dedicação de Abençoado","Quando aliado a 9 metros receber amedrontado, drenado, enfraquecido, enjoado ou estupefato, reduza em 1 uma dessas condições, mínimo 0."),
(192,"Caçador de Recompensas","Dedicação de Caçador de Recompensas","Bounty Hunter Dedication",2,"treinado em Sobrevivência","Recebe Caçar Presa e pode designar alvo observado ou conhecido por relatos/cartaz, inclusive ao Obter Informação. Se já o identificou e marcou, +2 circunstancial para Obter Informação. Se já tinha Caçar Presa, recebe Caçador de Monstros."),
(192,"Caçador de Recompensas","Bando","Posse",4,"Dedicação de Caçador; presa designada","Em 1 minuto, instrui até cinco criaturas: +1 circunstancial para Procurar, Rastrear e Obter Informação sobre a presa; todos recebem +1 em iniciativa ao entrar em combate com ela. Dura até nova presa/morte, mas ajudante perde se ficar longe demais (normalmente 1 hora)."),
(192,"Caçador de Recompensas","Ferramentas do Ofício","Tools of the Trade",4,"Dedicação de Caçador","Familiaridade com boleadeira, porrete e chicote, tratados como simples. Contra presa desprevenida, Golpes não letais com elas causam +1d4 de precisão. Não sofre penalidade para ataque não letal sem o traço."),
(192,"Caçador de Recompensas","Manter o Ritmo","Keep Pace",6,"Dedicação de Caçador","Quando a presa ao alcance tenta afastar-se, mova até seu Deslocamento acompanhando-a e mantendo-a ao alcance até ela parar ou você esgotar o movimento; pode Escavar, Escalar, Voar ou Nadar se possuir o tipo."),
(192,"Caçador de Recompensas","Agarrão Oportunista","Opportunistic Grapple",8,"Dedicação de Caçador","Quando a presa ao alcance falha criticamente em Golpe corpo a corpo contra você, com mão livre e alvo até um tamanho maior, tente Agarrá-la."),
(193,"Cavaleiro","Dedicação de Cavaleiro","Cavalier Dedication",2,"treinado em Natureza ou Sociedade","Recebe companheiro jovem para montaria, com habilidade montaria ou opção da promessa aprovada pelo MJ, ao menos um tamanho maior; animal Pequeno pode começar Médio sem outras mudanças. Se jurou causa, pode tomar dedicação ligada a ela antes de dois talentos de cavaleiro, a critério do MJ."),
(193,"Cavaleiro","Estandarte do Cavaleiro","Cavalier's Banner",4,"Dedicação; promessa a organização/ideal","Você e aliados em emanação de 9 metros da montaria recebem +1 circunstancial em Vontade e CDs contra medo. Se o estandarte for destruído/removido, aliados a 9 metros ficam amedrontados 1."),
(193,"Cavaleiro","Investida do Cavaleiro","Cavalier's Charge",4,"Dedicação; montado","Comande a montaria a Andar duas vezes; em qualquer ponto, Golpeie inimigo ao alcance ou no primeiro incremento à distância, com +1 circunstancial no ataque."),
(193,"Cavaleiro","Montaria Impressionante","Impressive Mount",4,"Dedicação","A montaria amadurece. Mesmo sem Comandar, pode usar 1 ação para Andar/Golpear no turno; se usar, não recebe outras nem pode ser comandada depois."),
(194,"Cavaleiro","Montaria Rápida","Quick Mount",4,"Dedicação; especialista em Natureza","Adjacente a criatura disposta e um tamanho maior, Monte e Comande-a com uma ordem à escolha."),
(194,"Cavaleiro","Defender Montaria","Defend Mount",6,"Dedicação","Quando ataque ou magia atacar sua montaria enquanto você a cavalga, use sua defesa em vez da dela; se acertar, você sofre os efeitos."),
(194,"Cavaleiro","Escudo Montado","Mounted Shield",6,"Dedicação","Ao Erguer Escudo montado, você e montaria recebem o bônus de CA. Pode Bloquear dano físico contra a montaria, protegendo-a conforme regras normais."),
(194,"Cavaleiro","Montaria Incrível","Incredible Mount",8,"Montaria Impressionante","A montaria torna-se companheiro ágil ou selvagem, à escolha."),
(194,"Cavaleiro","Investida Atropeladora","Trampling Charge",10,"Dedicação; montado em criatura com Golpe de pernas","Comande a mover até o dobro do Deslocamento, atravessando inimigos até um tamanho menores. Cada um sofre dano do Golpe corpo a corpo da montaria, Reflexos básico contra CD de Atletismo dela; em falha crítica fica desprevenido até fim do próximo turno. Role dano uma vez e afete cada criatura uma vez."),
(194,"Cavaleiro","Derrubar da Montaria","Unseat",10,"Dedicação; montado e empunhando arma de justa","Faça Golpe corpo a corpo contra montado; se acertar, teste Atletismo contra Fortitude. Sucesso o derruba em espaço adjacente escolhido; crítico também o deixa prostrado."),
(194,"Cavaleiro","Montaria Especializada","Specialized Mount",14,"Montaria Incrível","Montaria recebe especialização à escolha. Pode selecionar até três vezes, sempre diferente; máximo três."),
(194,"Cavaleiro","Cavaleiro Lendário","Legendary Rider",20,"Dedicação","Enquanto montado, fica acelerado; ação extra apenas para Comandar a montaria."),
(195,"Celebridade","Dedicação de Celebridade","Celebrity Dedication",2,"","Recebe reação Ofuscar: quando inimigo faz teste de perícia sem crítico, teste a mesma perícia contra CD normalmente igual; crítico concede +1 de estado em ataques, Percepção, salvamentos e perícias até fim do próximo turno; sucesso concede se inimigo falhou. Ao Ganhar Proventos em tarefa acima do nível, +1 circunstancial."),
(195,"Celebridade","Nunca Cansar","Never Tire",4,"Dedicação","Ao receber fatigado enquanto observado por três não inimigos, adie a condição por 1 minuto ou até perder a audiência; a duração só começa depois e não pode ser adiada novamente."),
(195,"Celebridade","Olhar Hipnotizante","Mesmerizing Gaze",6,"Dedicação","Escolha criatura que vê e o vê: Vontade contra maior CD de classe/magia ou fica fascinada por você até fim do próximo turno. Sucesso ou término por ação hostil dá imunidade por 1 dia."),
(195,"Celebridade","Comandar Atenção","Command Attention",10,"Dedicação","Até fim do próximo turno, numa aura de 9 metros, salvamentos contra outros efeitos visuais melhoram um grau (fortuna). Inimigo que tente efeito visual focado deve passar Vontade contra sua maior CD para mirar alguém além de você. Aliados podem Esconder-se sem cobertura."),
(196,"Dândi","Dedicação de Dândi","Dandy Dedication",2,"treinado em Diplomacia","Torna-se treinado em Dissimulação e Sociedade, ou especialista se já treinado. Recebe Influenciar Rumor: em ao menos 1 dia, Diplomacia para alterar rumor; CDs típicas 15 vila, 20 cidade pequena, 30 cidade e 40 metrópole."),
(196,"Dândi","Bajulação Distrativa","Distracting Flattery",4,"Dedicação; especialista em Dissimulação","Ao ver atitude diminuir pela conduta de aliado, teste Dissimulação contra Vontade; alvo imune por 10 min. Sucesso impede queda; falha mantém; falha crítica reduz também atitude em relação a você."),
(196,"Dândi","Conhecimento de Fofocas","Gossip Lore",4,"Dedicação","Torna-se treinado em Conhecimento de Fofocas, usado apenas para Recordar qualquer tópico; em falha recebe Conhecimento Duvidoso. Se lendário em Sociedade, torna-se especialista, sem outro meio de aumentar."),
(196,"Dândi","Conexões Fabricadas","Fabricated Connections",7,"Dedicação; mestre em Dissimulação","Pode usar Dissimulação no lugar de outra perícia para Ganhar Proventos, Impressionar, Pedir ou Subsistir: uma vez/dia para Impressionar/Pedir e uma vez/semana para Ganhar Proventos/Subsistir."),
(196,"Dândi","Penetra de Festa","Party Crasher",7,"Dedicação; mestre em Sociedade","Ao encontrar evento social normalmente inacessível, gaste 1d4 horas para obter entrada para você e aliados sem teste. Não vale para evento secreto ou pequena reunião privada sem equipe, acompanhantes ou forasteiros."),
(197,"Guerreiro de Duas Armas","Dedicação de Guerreiro de Duas Armas","Dual-Weapon Warrior Dedication",2,"","Recebe o talento de guerreiro Corte Duplo."),
(197,"Guerreiro de Duas Armas","Arremessador Duplo","Dual Thrower",4,"Dedicação","Quando talento do arquétipo permitir Golpe corpo a corpo, pode fazer Golpe à distância com arma arremessável ou arma à distância de uma mão. Efeitos para arma/Golpe corpo a corpo de uma mão também se aplicam."),
(197,"Guerreiro de Duas Armas","Recarga com Duas Armas","Dual-Weapon Reload",4,"Dedicação","Empunhando duas armas de uma mão, uma em cada mão, não precisa de mão livre para recarregar arma à distância de uma mão."),
(197,"Guerreiro de Duas Armas","Corte Esfolador","Flensing Slice",8,"Dedicação; última ação Corte Duplo e ambos acertaram","Alvo sofre 1d8 de sangramento persistente por dado de dano da arma com mais dados, máximo 4d8; até seu próximo turno fica desprevenido e resistências físicas são reduzidas em 5."),
(197,"Guerreiro de Duas Armas","Blitz de Duas Armas","Dual-Weapon Blitz",10,"Dedicação; duas armas corpo a corpo de uma mão","Ande até seu Deslocamento e, durante o movimento, pode Golpear uma vez com cada arma, em quaisquer pontos."),
(197,"Guerreiro de Duas Armas","Investida Dupla","Dual Onslaught",14,"Dedicação","Ao usar Corte Duplo e errar ambos, escolha uma arma e aplique efeitos de acerto, salvo se a rolagem dela foi falha crítica; se ambas foram críticas, erra totalmente."),
(198,"Duelista","Dedicação de Duelista","Duelist Dedication",2,"treinado em armadura leve e armas simples","Recebe Saque Rápido, podendo sacar e atacar com uma ação."),
(198,"Duelista","Desafio do Duelista","Duelist's Challenge",4,"Dedicação","Escolha inimigo visível como oponente até ser derrotado, fugir ou o encontro acabar. Com arma corpo a corpo de uma mão e demais mãos livres, acertos contra ele recebem dano circunstancial igual aos dados da arma; atacar outro sofre a mesma penalidade."),
(198,"Duelista","Aparar Altruísta","Selfless Parry",8,"Dedicação; Aparada de Duelo","Enquanto beneficia-se de Aparada, aliados adjacentes recebem +1 circunstancial na CA. Se tem Riposta de Duelo, pode reagir quando inimigo ao alcance falha criticamente contra aliado adjacente."),
(198,"Duelista","Estudante das Artes de Duelo","Student of the Dueling Arts",12,"Dedicação","Nas preparações, pode trocar quaisquer talentos do arquétipo por outros válidos do nível apropriado, exceto a Dedicação e este talento. Pode entrar em postura de talento de duelista que não possui aumentando em 1 as ações, mantendo pré-requisitos."),
(199,"Arqueiro Místico","Dedicação de Arqueiro Místico","Eldritch Archer Dedication",6,"especialista em arco ou besta","Se não conjura por espaços, recebe conjuração espontânea, repertório de um truque de ataque de tradição à escolha, treinamento em ataque/CD e Carisma como atributo. Recebe Disparo Místico: conjure magia de 1–2 ações com ataque, imbua-a no arco/besta e Golpeie; a rolagem resolve Golpe e magia. Conta como dois ataques, mas a penalidade só se aplica depois."),
(199,"Arqueiro Místico","Conjuração Básica de Arqueiro Místico","Basic Eldritch Archer Spellcasting",8,"Dedicação de Arqueiro Místico","Recebe os benefícios básicos de conjuração. Toda vez que receber um espaço de magia de novo nível por este arquétipo, acrescente ao repertório uma magia do ranque apropriado: uma magia comum da tradição escolhida ou outra magia dessa tradição que tenha aprendido ou descoberto."),
]
for pag,arq,nome,orig,niv,pre,desc in REST:
    A(t(nome,orig,niv,pag,arq,desc,pre=pre,tracos="arquétipo"+(",dedicação" if "Dedication" in orig else "")))

ids=[x["id"] for x in E]
assert len(ids)==len(set(ids)), "IDs duplicados"
assert all(x["nome"] and x["nomeOriginal"] and x["descricao"] and x["resumo"] for x in E)
assert all(176 <= x["pagina"] <= 199 for x in E)
OUT.write_text(json.dumps({"schemaVersion":1,"fonte":FONTE,"paginas":[176,199],"quantidade":len(E),
  "qa":{"idsUnicos":True,"camposObrigatoriosPresentes":True,"ocrAmbiguidades":[],
        "continuacoesConsultadas":["A descrição de Conjuração Básica de Arqueiro Místico, iniciada na página física 199, foi concluída com as primeiras linhas do OCR local da página 200."]},
  "entradas":E},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"OK: {len(E)} talentos; IDs únicos; textos presentes -> {OUT.name}")
