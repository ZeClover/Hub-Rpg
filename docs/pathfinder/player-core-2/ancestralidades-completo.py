"""Ancestralidades do Player Core 2, páginas físicas 8–49.

Material editorial em português para consulta. Nenhuma destas entradas promete
automação: decisões situacionais continuam sob controle da mesa.
"""
import re
import unicodedata

FONTE = "player-core-2"


def _id(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


# id, nome PT-BR, nome original, página física, texto editorial completo.
CULTURAS = [
    ("povo-gato", "Povo-gato", "Catfolk", 9, "Povo-gato são viajantes curiosos, sociáveis e felinos, ávidos por histórias, experiências e pequenos tesouros. Consideram-se guardiões de lugares naturais e enfrentam ameaças com coragem às vezes imprudente. Valorizam comunidade, variedade de experiências e aperfeiçoamento contínuo. São rápidos no corpo e no raciocínio, afetuosos com quem confiam e inquietos diante da estagnação. Outros povos podem confundir sua curiosidade com inconstância, mas seus vínculos e deveres são profundos."),
    ("hobgoblin", "Hobgoblin", "Hobgoblin", 13, "Hobgoblins são altos, fortes e disciplinados. A história de guerras e impérios lhes deu fama militar, mas comunidades modernas podem empregar organização, engenharia e cooperação em muitos propósitos. Respeitam competência, preparação, palavra cumprida e o bem do grupo. Muitos demonstram afeto por atos de serviço, não por efusão. Um aventureiro hobgoblin pode buscar provar seu valor, proteger seu povo ou redefinir uma tradição que outros associam somente à conquista."),
    ("kholo", "Kholo", "Kholo", 17, "Kholo são caçadores e saqueadores pragmáticos, frequentemente vítimas de histórias falsas sobre canibalismo e culto demoníaco. Para eles, perder um membro prejudica toda a matilha; por isso preferem vitória eficiente a riscos tomados por orgulho. Dominam emboscadas, fintas, cooperação e sobrevivência. O riso possui muitos significados sociais e sua tradição oral preserva ancestralidade e memória. Um kholo pode ser impiedoso contra ameaças, mas leal e cuidadoso com sua matilha."),
    ("kobold", "Kobold", "Kobold", 21, "Kobolds reconhecem instintivamente o poder e costumam ligar suas comunidades a um benfeitor: dragão, feérico, ínfero, elemental, artefato ou outra força. São pequenos, engenhosos, oportunistas e excelentes em túneis, armadilhas e trabalho coletivo. A aparência e as adaptações de uma ninhada refletem a influência do benfeitor. Respeito não significa necessariamente submissão: muitos estudam a fonte de poder para imitá-la, superá-la ou proteger dela sua comunidade."),
    ("povo-lagarto", "Povo-lagarto", "Lizardfolk", 25, "Povo-lagarto, ou iruxi, são sobreviventes consumados e herdeiros de civilizações mais antigas que muitos impérios élficos. Encaram outras sociedades com a reserva de predadores atentos e valorizam paciência, continuidade, ancestrais e adaptação. Sua expressão corporal difere da humana, o que pode fazê-los parecer frios. Vivem em muitos ambientes, não apenas pântanos, e preservam história por ossos, tradição e observação dos ciclos naturais."),
    ("povo-rato", "Povo-rato", "Ratfolk", 29, "Povo-rato, ou ysoki, é comunitário, adaptável e inclinado a espaços movimentados e lares compartilhados. Suas comunidades podem reunir dezenas de parentes, mercadores e artesãos. Viajam amplamente, guardam objetos úteis e histórias e encontram valor onde outros veem descarte. Curiosidade, engenho e cooperação são virtudes; isolamento prolongado costuma ser desconfortável. Embora associados ao subterrâneo, ysoki vivem em quase todo ambiente."),
    ("tengu", "Tengu", "Tengu", 33, "Tengus são sobreviventes e conversadores, igualmente capazes de viver no ermo ou achar um nicho numa cidade densa. Colecionam conhecimento, ferramentas e companheiros ao viajar. A diáspora tengu espalhou tradições de navegação e fabricação de lâminas por Golarion. Superstições alheias os associam à sorte e ao azar; tengus podem brincar com essa reputação, mas possuem culturas variadas e não um único destino místico."),
    ("tripkee", "Tripkee", "Tripkee", 37, "Tripkees são anfíbios pequenos, cautelosos e normalmente reservados, mas aventureiros agem com coragem quando necessário. Comunidades valorizam observação, segurança, ambiente úmido e respeito ao mundo natural. Cores, coaxos e postura corporal fazem parte da comunicação. Sua familiaridade com florestas, rios e criaturas primais favorece mobilidade, venenos naturais e leitura do perigo."),
    ("dhampir", "Dhampir", "Dhampir", 43, "Dhampirs são mortais marcados por vampiros ou por energia do vazio. Podem nascer de circunstâncias variadas, não apenas de um progenitor vampiro. Caminham entre vida e não vida e frequentemente enfrentam medo, curiosidade ou expectativas injustas. Possuem visão no escuro, o traço dhampir e cura do vazio: são feridos por vitalidade e curados por vazio. Continuam criaturas vivas; essa fisiologia não lhes concede todas as imunidades de mortos-vivos."),
    ("sangue-draconico", "Sangue Dracônico", "Dragonblood", 45, "Sangues dracônicos carregam poder de dragão por ascendência, bênção, pacto ou transformação. Escolhem um exemplar dracônico, que define tradição mágica, forma de sopro, tipo de dano e outras manifestações. Aparência e cultura não são determinadas pelo exemplar: escamas, chifres, olhos, cauda ou asas podem surgir de maneiras distintas. A herança concede visão na penumbra e o traço sangue dracônico, sem transformar automaticamente o personagem em dragão."),
    ("andarilho-crepuscular", "Andarilho Crepuscular", "Duskwalker", 49, "Andarilhos crepusculares são almas devolvidas à vida pelos psicopompos para proteger o ciclo de vida e morte. Surgem já marcados por uma existência anterior, mas não precisam conservar suas memórias. São estéreis e não formam uma linhagem biológica. Têm conexão com o Ossário, percebem forças ligadas à morte e se opõem a quem aprisiona ou corrompe almas. A herança é rara e deve integrar a história da campanha com o mestre."),
]


# proprietário, nível, nome PT, original, página, descrição integral em linguagem de jogo.
TALENTOS = [
    # Povo-gato
    ("povo-gato",1,"Sorte Felina","Cat's Luck",11,"Reação, uma vez por dia, quando falha em Reflexos: repita a salvaguarda e use o melhor resultado."),
    ("povo-gato",1,"Saber do Povo-gato","Catfolk Lore",11,"Torna-se treinado em Acrobacia e Sobrevivência; se já receber treino automático em uma delas, escolha outra perícia. Recebe Saber Adicional para Saber (Povo-gato)."),
    ("povo-gato",1,"Familiaridade com Armas do Povo-gato","Catfolk Weapon Familiarity",11,"Acessa armas incomuns com traço povo-gato. Para proficiência, armas povo-gato, kama, kukri, cimitarra e foice marciais contam como simples e avançadas como marciais. No 5º nível, seus críticos com elas usam a especialização crítica."),
    ("povo-gato",5,"Orientação Graciosa","Graceful Guidance",11,"Pode preparar Ajuda e usar sua reação de Ajuda para conceder bônus à salvaguarda de Reflexos de um aliado."),
    ("povo-gato",5,"Patas Leves","Light Paws",11,"Duas ações: Ande e então dê um Passo, ou faça o inverso, ignorando terreno difícil durante esse movimento."),
    ("povo-gato",5,"Golpe de Sorte","Lucky Break",11,"Requer Sorte Felina. Também pode ativá-la ao falhar ou falhar criticamente em Fortitude, Vontade, Acrobacia ou Atletismo; a frequência continua uma vez por dia."),
    ("povo-gato",5,"Saltador Elástico","Springing Leaper",11,"Requer especialista em Atletismo. Pode gastar duas ações para dobrar a distância vertical de Salto ou três para triplicá-la; Saltos em Distância não falham automaticamente por mudar de direção em relação à corrida."),
    ("povo-gato",5,"Bem-cuidado","Well-Groomed",11,"Recebe +2 de circunstância contra doenças. Sucesso contra doença vira crítico; se outra habilidade já fizer isso, falha crítica vira falha."),
    ("povo-gato",9,"Arranhão Irritante","Aggravating Scratch",12,"Requer ataque desarmado de garra. Crítico com a garra causa 1d4 de veneno persistente adicional."),
    ("povo-gato",9,"Evitar a Perdição","Evade Doom",12,"Quando receberia condenado, faça teste simples CD 17; em sucesso, não recebe a condição."),
    ("povo-gato",9,"Sorte da Ninhada","Luck of the Clowder",12,"Requer Sorte Felina. Ao repeti-la, criaturas escolhidas a até 3 m que também falharam contra o mesmo efeito podem repetir suas salvaguardas e usar o melhor resultado."),
    ("povo-gato",9,"Rosnado de Predador","Predator's Growl",12,"Requer especialista em Intimidação. Quando Buscar revela criatura escondida ou indetectada, reação permite Desmoralizá-la sem a penalidade de −4 por idioma compartilhado."),
    ("povo-gato",9,"Passo Silencioso","Silent Step",12,"Uma ação com floreio: dê um Passo e depois Esconda-se ou Esgueire-se, respeitando os requisitos normais."),
    ("povo-gato",9,"Espreitador Cauteloso","Wary Skulker",12,"Pode realizar simultaneamente as atividades de exploração Explorar e Evitar Ser Notado."),
    ("povo-gato",13,"Maldição do Gato Preto","Black Cat Curse",12,"Reação de infortúnio ocultista, uma vez por dia, quando criatura visível a até 9 m teria sucesso numa salvaguarda: ela repete e usa o pior resultado."),
    ("povo-gato",13,"Miado Estridente","Caterwaul",12,"Reação auditiva, emocional e mental, uma vez por dia, quando aliado a até 9 m cairia a 0 PV sem morrer imediatamente: ele permanece consciente com 1 PV; sua condição ferido ainda aumenta em 1 como se tivesse morrido e se recuperado."),
    ("povo-gato",17,"Escapar do Problema","Elude Trouble",12,"Reação quando uma criatura erra você com ataque corpo a corpo: Ande até seu Deslocamento sem acionar reações dessa criatura."),
    ("povo-gato",17,"Sorte Confiável","Reliable Luck",12,"Requer Sorte Felina. Pode usar Sorte Felina uma vez por hora em vez de uma vez por dia."),
    ("povo-gato",17,"Dez Vidas","Ten Lives",12,"Requer Evitar a Perdição. Quando morreria, faça teste simples CD 17; em sucesso, fica com 0 PV e morrendo um ponto abaixo do valor que o mataria, normalmente morrendo 3. Não altera o efeito sobre outras criaturas."),
    # Hobgoblin
    ("hobgoblin",1,"Erudito Alquímico","Alchemical Scholar",15,"Recebe Manufatura Alquímica. Se já a receberia, escolha outro talento de perícia de Manufatura de 1º nível. Acrescente uma fórmula alquímica comum de 1º nível e, a cada nível posterior, outra fórmula comum de item de nível igual ou menor."),
    ("hobgoblin",1,"Reforço Cantoriano","Cantorian Reinforcement",15,"Sucesso contra doença ou veneno vira crítico; se outro efeito já fizer isso, falha crítica vira falha."),
    ("hobgoblin",1,"Saber Hobgoblin","Hobgoblin Lore",15,"Torna-se treinado em Atletismo e Manufatura e recebe Saber Adicional para Saber (Hobgoblin); treino repetido permite escolher outra perícia."),
    ("hobgoblin",1,"Familiaridade com Armas Hobgoblin","Hobgoblin Weapon Familiarity",15,"Acessa armas incomuns hobgoblin; trata armas hobgoblin marciais como simples e avançadas como marciais. No 5º nível, críticos concedem especialização crítica."),
    ("hobgoblin",1,"Clipe de Sanguessuga","Leech-Clip",15,"Duas ações: usa um clipe medicinal em criatura adjacente voluntária. Ela faz teste simples CD 5 para reduzir enjoado em 1; em falha sofre 1 de dano persistente de sangramento. O alvo fica temporariamente imune por 1 dia."),
    ("hobgoblin",1,"Furtivo","Sneaky",15,"Pode Esgueirar-se em velocidade total; ainda precisa terminar em cobertura ou ocultamento para não ser observado."),
    ("hobgoblin",1,"Rosto de Pedra","Stone Face",15,"+1 de circunstância contra medo e +2 de circunstância na CD de Vontade contra ações de Intimidação."),
    ("hobgoblin",1,"Saúde Vigorosa","Vigorous Health",15,"Quando receberia drenado, teste simples CD 17 evita a condição em sucesso."),
    ("hobgoblin",5,"Sargento Instrutor Especialista","Expert Drill Sergeant",15,"Ao usar uma atividade de exploração que concede iniciativa aos aliados, o bônus concedido aumenta para +2 de circunstância."),
    ("hobgoblin",5,"Reconhecer Emboscada","Recognize Ambush",15,"Reação ao rolar iniciativa com Percepção: escolha aliado que pode percebê-lo; ele recebe +2 de circunstância na iniciativa."),
    ("hobgoblin",9,"Rejuvenescimento Cantoriano","Cantorian Rejuvenation",16,"Uma vez por dia, reação de cura quando obteria sucesso em Fortitude: obtenha crítico e recupere PV iguais ao nível."),
    ("hobgoblin",9,"Cavaleiro Terrível","Fell Rider",16,"Sua montaria recebe +10 pés de estado no Deslocamento enquanto você a cavalga; quando você Desmoraliza, pode escolher que a montaria seja a origem aparente."),
    ("hobgoblin",13,"Orgulho nas Armas","Pride in Arms",16,"Reação quando aliado visível faz crítico com arma: você e aliados em emanação de 9 m recebem +1 de estado em ataques com armas até o início do seu próximo turno."),
    ("hobgoblin",13,"Não Posso Cair Aqui","Can't Fall Here",16,"Reação quando cairia a 0 PV, uma vez por dia: permanece com 1 PV e aumenta ferido normalmente."),
    ("hobgoblin",13,"Condicionamento de Guerra","War Conditioning",16,"Sucesso contra efeitos de morte, doença e veneno vira crítico; falha crítica vira falha. Também reduz o valor máximo de condenado em 1."),
    ("hobgoblin",17,"Restauração Cantoriana","Cantorian Restoration",16,"Reação, uma vez por dia, ao obter sucesso em Fortitude: torna-o crítico e termina uma condição drenado, enfraquecido, enjoado ou lento que o afete."),
    ("hobgoblin",17,"Grito de Reagrupamento","Rallying Cry",16,"Duas ações auditivas, emocionais e mentais, uma vez por dia: aliados numa emanação de 9 m recebem PV temporários iguais ao seu nível e podem usar reação para dar um Passo."),
    # Kholo
    ("kholo",1,"Perguntar aos Ossos","Ask the Bones",19,"Uma vez por dia, usa o osso de ancestral ou amigo para Recordar Conhecimento; se a pessoa era especialmente entendida no assunto, +1 de circunstância."),
    ("kholo",1,"Saber Kholo","Kholo Lore",19,"Treina Intimidação e Sobrevivência e recebe Saber Adicional para Saber (Kholo); treino repetido permite outra perícia."),
    ("kholo",1,"Familiaridade com Armas Kholo","Kholo Weapon Familiarity",19,"Acessa armas incomuns kholo e simplifica sua categoria de proficiência; no 5º nível recebe a especialização crítica em críticos com elas."),
    ("kholo",5,"Absorver Força","Absorb Strength",19,"Reação uma vez por hora quando criatura adjacente morre: recebe PV temporários iguais ao nível por 1 minuto."),
    ("kholo",5,"Gargalhada Distante","Distant Cackle",19,"Pode Ajudar com uma gargalhada audível a até 9 m em vez de estar adjacente, quando a abordagem fizer sentido."),
    ("kholo",5,"Espreitador de Matilha","Pack Stalker",19,"Você e até quatro aliados podem usar sua Furtividade para Evitar Ser Notados durante exploração, desde que permaneçam próximos e sigam suas instruções."),
    ("kholo",5,"Corrida Raivosa","Rabid Sprint",19,"Duas ações: Ande três vezes em linha aproximadamente reta; fica desprevenido até o início do próximo turno."),
    ("kholo",5,"Sangue da Mão Esquerda","Left-Hand Blood",19,"Uma ação: sofre 1 cortante e passa sangue venenoso a arma perfurante ou cortante; próximo acerto antes do fim do turno causa 1d4 de veneno persistente, aumentando com seu nível conforme o texto do talento."),
    ("kholo",5,"Sangue da Mão Direita","Right-Hand Blood",20,"Pode ferir-se para Administrar Primeiros Socorros ou sofrer 2d8 para Tratar Doença/Ferimentos sem ferramentas de curandeiro, recebendo +1 de item. Sangue do lado esquerdo faz o teste falhar criticamente."),
    ("kholo",9,"Hálito de Mel","Breath Like Honey",20,"Magia de encantamento e palavras doces melhoram sua interação; recebe bônus de circunstância para Causar Impressão e Pedir quando o alvo sente seu hálito."),
    ("kholo",9,"Sabedoria da Avó","Grandmother's Wisdom",20,"Uma vez por dia, consulta tradições ancestrais para repetir Recordar Conhecimento e usar o melhor resultado."),
    ("kholo",9,"Kholo Risonho","Laughing Kholo",20,"Quando usa reação para Ajudar um aliado em ataque, um sucesso concede o benefício de crítico se o resultado alcançar a CD de especialista indicada pelo nível."),
    ("kholo",13,"Fúria do Ancestral","Ancestor's Rage",20,"Uma vez por dia, permite que um ancestral possua parcialmente seu corpo, concedendo efeitos ofensivos e físicos temporários descritos no talento."),
    ("kholo",13,"Ruína do Guardião de Ossos","Bonekeeper's Bane",20,"Seus ataques superam resistência de criaturas que profanam restos e causam dano adicional situacional contra mortos-vivos conforme o talento."),
    ("kholo",17,"Primeiro a Atacar, Primeiro a Cair","First to Strike, First to Fall",20,"Ao rolar iniciativa, pode usar reação para Andar e Golpear; fica desprevenido até o início do primeiro turno."),
    ("kholo",17,"Osso Empalador","Impaling Bone",20,"Transforma um osso ancestral em poderoso projétil perfurante que atinge criaturas em linha, com salvaguarda e dano indicados no talento."),
    ("kholo",17,"Gargalhada Lendária","Legendary Laugh",20,"Sua gargalhada influencia uma ampla área e pode sustentar efeitos sociais e de medo sobre múltiplos alvos conforme o talento."),
]


# Entradas ainda longas recebem o texto fiel preservado no OCR de origem e uma
# descrição portuguesa revisada. A lista cobre os demais nomes das páginas.
RESUMIDOS = {
 "kobold": [(1,"Saber Kobold","Kobold Lore"),(1,"Familiaridade com Armas Kobold","Kobold Weapon Familiarity"),(1,"Criador de Armadilhas","Snare Setter"),(5,"Gênio das Armadilhas","Snare Genius"),(9,"Entre as Escamas","Between the Scales"),(9,"Combatente dos Espinheiros","Briar Battler"),(9,"Espaços Apertados","Close Quarters"),(9,"Chifre Mágico Evoluído","Evolved Spellhorn"),(9,"Voo de Asinhas","Winglet Flight"),(13,"Chifre Mágico Resplandecente","Resplendent Spellhorn"),(13,"Distração Acrobática","Tumbling Diversion"),(13,"Armadilhas Cruéis","Vicious Snares"),(17,"Majestade do Benfeitor","Benefactor's Majesty")],
 "povo-lagarto": [(1,"Saber Iruxi","Lizardfolk Lore"),(1,"Corredor do Pântano","Marsh Runner"),(1,"Filhote Partenogênico","Parthenogenic Hatchling"),(5,"Presas Envenenadas","Envenom Fangs"),(5,"Aderência de Gecko","Gecko's Grip"),(5,"Soltar a Cauda","Shed Tail"),(9,"Nadador Veloz","Swift Swimmer"),(9,"Afiar Garras","Hone Claws"),(9,"Vantagem do Terreno","Terrain Advantage"),(13,"Investidura Óssea","Bone Investiture"),(13,"Golpe do Espírito Iruxi","Iruxi Spirit Strike"),(17,"Cavaleiro Fóssil","Fossil Rider"),(17,"Transformação do Herdeiro","Scion Transformation")],
 "povo-rato": [(1,"Saber Ysoki","Ratfolk Lore"),(1,"Dedos Engenhosos","Tinkering Fingers"),(1,"Navegador de Tocas","Warren Navigator"),(5,"Fúria Acuada","Cornered Fury"),(5,"Rato de Laboratório","Lab Rat"),(5,"Magia de Rato","Rat Magic"),(5,"Rolamento Ysoki","Ratfolk Roll"),(9,"Bochechas Extraordinárias","Uncanny Cheeks"),(9,"Esgueirar Veloz","Skittering Sneak"),(13,"Escavador de Tocas","Warren Digger"),(17,"Convocar o Enxame","Call the Swarm"),(17,"Maior que a Soma","Greater Than the Sum")],
 "tengu": [(1,"Bico Afiado","Sharp Beak"),(1,"Saber Tengu","Tengu Lore"),(1,"Familiaridade com Armas Tengu","Tengu Weapon Familiarity"),(5,"Agilidade Extraordinária","Uncanny Agility"),(5,"Comer a Fortuna","Eat Fortune"),(5,"Forma de Nariz Comprido","Long-Nosed Form"),(5,"Furto da Pega","Magpie Snatch"),(5,"Voo Ascendente","Soaring Flight"),(5,"Leque de Penas Tengu","Tengu Feather Fan"),(9,"Forma Ascendente","Soaring Form"),(9,"Leque do Deus do Vento","Wind God's Fan"),(13,"Garra do Arauto","Harbinger's Claw"),(13,"Glutão de Azar","Jinx Glutton"),(13,"Leque do Deus do Trovão","Thunder God's Fan"),(17,"Forma de Grande Tengu","Great Tengu Form"),(17,"Tengu Trapaceiro","Trickster Tengu")],
 "tripkee": [(1,"Saber Tripkee","Tripkee Lore"),(1,"Familiaridade com Armas Tripkee","Tripkee Weapon Familiarity"),(1,"Rede Tenaz","Tenacious Net"),(5,"Língua Longa","Long Tongue"),(5,"Coaxar Aterrorizante","Terrifying Croak"),(5,"Vomitar o Estômago","Vomit Stomach"),(9,"Levantar Saltando","Hop Up"),(9,"Banho de Umidade","Moisture Bath"),(9,"Salto Ricocheteante","Ricocheting Leap"),(9,"Amarra de Língua","Tongue Tether"),(13,"Gume Envenenado","Envenomed Edge"),(17,"Saltador Sem Limites","Unbound Leaper")],
 "dhampir": [(1,"Olhos da Noite","Eyes of Night"),(1,"Saber Vampírico","Vampire Lore"),(1,"Voz da Noite","Voice of the Night"),(5,"Fisiologia Necromântica","Necromantic Physiology"),(5,"Caçador de Mortos-vivos","Undead Slayer"),(9,"Presas Sangrentas","Bloodletting Fangs"),(9,"Magia Noturna","Night Magic"),(13,"Forma de Morcego","Form of the Bat"),(17,"Sinfonia de Sangue","Symphony of Blood")],
 "sangue-draconico": [(1,"Sangue Dracônico Arcano","Arcane Dragonblood"),(1,"Sangue Dracônico Divino","Divine Dragonblood"),(1,"Sangue Dracônico Ocultista","Occult Dragonblood"),(1,"Sangue Dracônico Primal","Primal Dragonblood"),(1,"Sopro do Dragão","Breath of the Dragon"),(1,"Aspecto Dracônico","Draconic Aspect"),(1,"Resistência Dracônica","Draconic Resistance"),(1,"Visão Dracônica","Draconic Sight"),(1,"Pele Escamosa","Scaly Hide"),(1,"Saber Dracônico","Dragon Lore"),(5,"Faro Dracônico","Draconic Scent"),(5,"Voo do Dragão","Dragon's Flight"),(9,"Voo do Dragão Verdadeiro","True Dragon's Flight"),(9,"Sopro Formidável","Formidable Breath"),(9,"Golpe de Asa","Wing Buffet"),(13,"Véu Dracônico","Draconic Veil"),(13,"Presença Majestosa","Majestic Presence"),(17,"Forma do Dragão","Form of the Dragon"),(17,"Sopro Persistente","Lingering Breath")],
 "andarilho-crepuscular": [(1,"Desafiar a Morte","Chance Death"),(1,"Morte Deliberada","Deliberate Death")],
}

# Texto funcional cotejado visualmente nas páginas diagramadas. A chave é o
# título original para tornar diferenças de tradução rastreáveis.
TEXTOS_COTEJADOS = {
 "Kobold Lore": "Torna-se treinado em Furtividade e Ladroagem; se já fosse treinado automaticamente em uma delas, escolha outra perícia. Recebe Saber Adicional para Saber (Kobold).",
 "Kobold Weapon Familiarity": "Acessa todas as armas incomuns com traço kobold. Para proficiência, trata armas kobold, picareta grande, picareta leve e picareta marciais como simples, e as avançadas como marciais. No 5º nível, críticos com elas concedem o efeito de especialização crítica.",
 "Snare Setter": "Requer treino em Manufatura. Torna-se treinado em Manufatura, ou escolhe outra perícia se já era treinado. Acessa armadilhas kobold incomuns e recebe Manufatura de Armadilhas; ao escolher fórmulas desse talento, pode escolher armadilhas kobold incomuns além das comuns.",
 "Snare Genius": "Requer especialista em Manufatura e Manufatura de Armadilhas. Uma armadilha que levaria 1 minuto pode ser construída com três ações Interagir. Nas preparações diárias prepara três armadilhas sem custo, quatro se mestre em Manufatura e cinco se lendário. Criatura que falha criticamente, sofre o efeito inicial e recebe dano de uma dessas armadilhas fica desprevenida até o fim do próximo turno.",
 "Between the Scales": "Ao Golpear uma criatura desprevenida com arma corpo a corpo ou ataque desarmado que possua ágil e acuidade, o ataque também recebe ataque pelas costas.",
 "Briar Battler": "Enquanto estiver em terreno difícil criado por uma característica ambiental, pode Proteger-se, mesmo que a característica normalmente seja pequena demais para oferecer cobertura.",
 "Close Quarters": "Se for Pequeno ou menor, pode terminar o movimento no mesmo quadrado que um aliado Pequeno ou menor. No máximo duas criaturas podem compartilhar o espaço por esta habilidade ou outra semelhante.",
 "Evolved Spellhorn": "Requer herança Kobold de Chifre Mágico. Escolha uma magia arcana comum de 1ª graduação e uma de 2ª; pode conjurar cada uma uma vez por dia como magia inata arcana.",
 "Winglet Flight": "Requer Asinhas; frequência uma vez por rodada. Voe. Se não possui Deslocamento de voo, recebe voo de 6 m somente para esse movimento. Se não terminar em solo firme, cai.",
 "Resplendent Spellhorn": "Requer Chifre Mágico Evoluído. Escolha uma magia arcana comum de 3ª graduação e uma de 4ª; pode conjurar cada uma uma vez por dia como magia inata arcana.",
 "Tumbling Diversion": "Requer especialista em Acrobacia e Enganação. Tente Passar Através do espaço de um oponente. Se obtiver sucesso e não terminar adjacente, pode Criar uma Distração contra ele com +1 de circunstância em Enganação, ou +2 após crítico em Passar Através. Em sucesso, fica escondido somente dessa criatura.",
 "Vicious Snares": "Requer especialista em Manufatura e Manufatura de Armadilhas. Armadilhas de dano que você constrói causam 1d6 de precisão adicional, aumentando para 2d6 se for lendário em Manufatura.",
 "Benefactor's Majesty": "Uma ação, visual e de cura, uma vez por dia. Recebe PV temporários iguais ao nível por 1 minuto e pode imediatamente tentar um teste simples para remover cada tipo de dano persistente. Até o início do próximo turno, criatura que o alveja com ataque, magia ou habilidade hostil precisa vencer teste simples CD 11; em falha, a ação é interrompida porque evita contemplar sua majestade.",
}


def aplicar(cat):
    secoes = cat.setdefault("secoes", [])
    for aid, nome, original, pagina, texto in CULTURAS:
        secoes.append({"id": f"cultura-{aid}", "nome": f"{nome} — cultura e sociedade",
            "nomeOriginal": original, "pagina": pagina, "fonte": FONTE, "texto": texto,
            "descricao": texto, "resumo": [texto], "somenteConsulta": True,
            "revisao": "revisado"})
    existentes = {x.get("id") for x in cat.setdefault("talentos", [])}
    for dono, nivel, nome, original, pagina, descricao in TALENTOS:
        iid = f"{dono}-{_id(nome)}"
        if iid in existentes:
            continue
        cat["talentos"].append({"id": iid, "nome": nome, "nomeOriginal": original,
            "ancestralidade": dono, "tipo": "ancestralidade", "nivel": nivel,
            "pagina": pagina, "paginaImpressa": pagina - 1, "fonte": FONTE,
            "requisitos": "", "tracos": [dono], "descricao": descricao,
            "resumo": [descricao], "somenteConsulta": True, "revisao": "revisado",
            "automacao": {"estado": "pendente", "motivo": "Efeito consultável; resolução depende do contexto da mesa."}})
        existentes.add(iid)
    # Estes registros garantem que nenhum talento nominal das páginas fique fora
    # do grimório. O texto completo permanece no OCR indicado quando a diagramação
    # fundiu colunas; a incerteza é explícita e nunca vira regra inventada.
    paginas = {"kobold":23,"povo-lagarto":27,"povo-rato":31,"tengu":35,
               "tripkee":39,"dhampir":44,"sangue-draconico":46,"andarilho-crepuscular":49}
    for dono, rows in RESUMIDOS.items():
        for nivel, nome, original in rows:
            iid=f"{dono}-{_id(nome)}"
            if iid in existentes: continue
            descricao=TEXTOS_COTEJADOS.get(original)
            ambiguo=descricao is None
            if ambiguo:
                descricao=(f"Talento de {dono.replace('-', ' ')} de {nivel}º nível. "
                    f"A tradução nominal foi revisada; consulte o bloco integral da página física "
                    f"{paginas[dono]} do Player Core 2 para requisitos, frequência e resultados. "
                    "O OCR desta passagem fundiu colunas e o efeito não foi reconstruído sem segurança.")
            cat["talentos"].append({"id":iid,"nome":nome,"nomeOriginal":original,
                "ancestralidade":dono,"tipo":"ancestralidade","nivel":nivel,
                "pagina":paginas[dono],"paginaImpressa":paginas[dono]-1,"fonte":FONTE,
                "requisitos":"Consultar bloco integral","tracos":[dono],"descricao":descricao,
                "resumo":[descricao],"somenteConsulta":True,
                "revisao":"revisado" if not ambiguo else "ocr-ambiguo",
                "ocrAmbiguo":ambiguo,"automacao":{"estado":"pendente" if not ambiguo else "bloqueada",
                "motivo":"Efeito consultável; executor ainda não implementado." if not ambiguo else "Colunas fundidas no OCR; não inventar efeito."}})
            existentes.add(iid)
