# Auditoria técnica e de balanceamento — Expansões Wands & Wizards / Hogwarts 1890
**Revisão documental:** 14/10/2026 · **Base de código:** `ZeClover/Hub-Rpg`, branch padrão `claude/hub-rpg-organization-x1tbpd`, HEAD consultado `d86abb232` (10/10/2026).
**Fontes:** `HB-Newtstrunkofeverything.txt` (texto-fonte homebrew), `Wands & Wizards v1.4`, `Headmaster’s Guide v0.2`, `Monster Book of Monsters v0.2`, `The Spellstaff v2.0`, `Wizarding Book of Monsters` (Grimoire Games), `Spells List.xlsx`, `Potions list.xlsx`, `Frog Cards.xlsx`, `Monsters.xlsx` e arquivos do GitHub.
**Método/limitação:** leitura estática dos materiais e de componentes centrais do GitHub via conexão. Não foi executado build nem teste de navegador ou banco nesta revisão, não foi verificado deploy Vercel. Parecer **não é aprovação automática** do Mestre. A classificação de balanceamento é análise editorial, não alegação do autor do suplemento. O texto-fonte de Newt contém trechos inacabados, duplicados e importados de sistemas de warlock de D&D; não reproduzir literalmente como regra segura.

**Legenda:** **A — candidato seguro** = pode ser acrescentado como alternativa contextual/documental sem mudar matemática-base, sujeito a testes; **B — adaptar** = boa ideia, mas exige revisão de números, pré-requisitos, limites, motor de regra e/ou aprovação de narrativa; **C — bloquear no momento** = incompleto, inconsistente, desproporcional ou substitui parte central do W&W, só desenvolver após especificação à parte.

## 1. Arquitetura W&W que não pode ser quebrada

- **Três estilos atuais**: Força de Vontade, Técnica, Intelecto (Carisma, Sabedoria, Inteligência). Bônus, cotas, PV, CA, fontes de pontos, magias e descanso diferem; não aceitar quarta classe como se fosse escola.
- **Seis escolas atuais**: Encantamentos, Azarações/Maldições, Transfiguração, Cura, Adivinhação e Magizoologia. `criacao-pt-br.json` armazena benefícios em níveis 1, 6, 10, 14 e 18; nível 3 de Intelecto recebe **ambos os benefícios iniciais** da escola, não todos os benefícios adicionais indiscriminadamente.
- **Escolhas por nível**: nos níveis 6/10/14/18 é uma escolha de benefício da escola. Adições de Newt devem ser opções **alternativas**, sem conceder benefício adicional automático em cada tier.
- **Magias**: catálogo-base tem 144; `magiasConcedidas` são calculadas pelo servidor; quaisquer novos feitiços precisam de IDs, escola, círculo, fontes, acesso e validação de cotas.
- **Sem dados dentro do Hub**: lançamentos de rolagens e salvaguardas são determinados na mesa; não criar rolagem automática.
- **Compatibilidade**: preservar `ficha-regras.mjs`, `formacao-regras.mjs`, `especiais-regras.mjs`, inventário, grimório, temas de Casas, varinha, Acervo, salvamento versionado, importações, cartas legadas e iniciativa de TODOS os sistemas; adições ficam no módulo W&W.

## 2. Escolas atuais — auditoria de TODOS os benefícios adicionais de Newt

### Encantamentos (Charms)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Cascadio Techniques — 1** | B | Concede Cascadio + projétil extra; requer aprovar feitiço novo, respeitar cota de magias concedidas e limitar escala. |
| **Bewitching Studies — 1** | A | Concede Accio já presente; usar `magiasConcedidas`, sem duplicar e sem somar à cota normal. |
| **First Strike — 1** | B | Desvantagem em resistência contra truques antes da primeira ação; pode ser forte demais, limitar a 1 uso/descanso ou cena. |
| **Arcane Footwork — 6** | B | Bônus INT na iniciativa pode empilhar com outros bônus; permitir sem duplo cômputo, revisar fuga de ataque de oportunidade. |
| **Unique Talents — 10** | B | Troca tipo de dano de Cascadio; depende de Cascadio e de lista de tipos de dano aceitos. |
| **Duelist Armor — 10** | B | Uma reação de magia até círculo 3 grátis/descanso longo; restringir lista de magias, verificar economia de reação/defesa e registrar uso. |

### Azarações, Feitiços e Maldições (Jinxes, Hexes and Curses)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Combat-Ready — 1** | B | Imune a surpresa enquanto consciente; efeito temático, mas concorre com Sentir Perigo da Adivinhação; deduplicar. |
| **Specialized Skills — 1** | A | Proficiência/especialização Intimidação; respeitar sistema atual de perícias repetidas, sem proficiência tripla. |
| **Cursemaster — 1** | B | Magia como ataque de oportunidade; limitar a truque ou custo normal, target único, reação, alcance e pré-requisitos, senão explosão de dano. |

### Transfiguração (Transfiguration)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Scientific Studies — 1** | A | Concede Vera Verto já existente, sem contar como truque regular; não duplicar com benefício de escola. |
| **Focused Animation — 10** | C | Concentração imune a dano sem custos anula pilar do combate; rever para 1 vez/descanso ou vantagem, antes de habilitar. |
| **Precise Control — 10** | B | Reduz custo de Magia Intensificada (3→2 pontos) em Transfiguração; não abaixo de 1, exige metamagia e travas do estilo. |

### Cura (Healing)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Dedicated Protector — 1** | A | Mover metade da velocidade como ação bônus em direção a aliado; efeito limitado, sem teletransporte. |
| **Combat Medic — 6** | B | Maximizar dados de cura em alvo a zero PV é muito forte; 1 uso/descanso longo, sem combinar com outras maximizações. |
| **Moral Support — 14** | B | Kit como bônus + Anapneo cura PV ao estabilizar; kit e uso limitado, não permitir substituir efeito da magia original automaticamente. |
| **Guardian Angel — 14** | B | Autocura recorrente quando abaixo de metade dos PV; redação indica 1 uso/descanso longo, registrar limite e só em combate. |

### Adivinhação (Divination)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Revealed Intentions — 1** | A | Vantagem em Intuição para detectar ocultação intencional, não leitura mental infalível; resolvido pelo Mestre. |
| **The Third Eye — 1** | B | Perceber o entorno durante sono natural/mágico anula emboscadas; limitar a sensação vaga e revisão do Mestre. |
| **Farseeing — 6** | C | Regeneração de pontos mágicos por conjuração de adivinhação é ambígua (fala “pontos de nível inferior”); risco de recurso infinito. |

### Magizoologia (Magizoology)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Biological Studies — 1** | A | Proficiência Criaturas Mágicas; respeitar benefício Folio Bruti já existente e proficiências substituídas. |
| **Way of the Wild — 6** | A | Velocidade de escalada/nado = deslocamento terrestre; registrar efeitos sem mover peça virtual automaticamente. |
| **Prowl — 1** | B | Permite terminar movimento dentro do espaço de outra criatura; quebraria posicionamento/táticas, limitar a atravessar sem encerrar ali. |
| **Outdoorswizard — 10** | A | Tenda com Capacious Extremis é excelente recompensa/objeto concedido pelo Mestre, não item de inventário gratuito sem controle. |

## 3. Novas escolas de Newt — todas as progressões e variantes

**Política geral:** criar como `escolaExpansao` ou ID de escola opcional desabilitado por padrão; escola nova deve ter escolhas válidas e não substituir nem somar à escola-base sem autorização. Árvore 1/6/10/14/18 validada pelo servidor. Para etapas incompletas, a escola fica somente como trilha narrativa, não selecionável.

### Artes das Trevas (Dark Arts)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Night Walker — 1** | A | Furtividade em penumbra + visão no escuro; avaliar sobreposição e escolha de uma opção no nível. |
| **Revive from Darkness — 1** | B | Voltar a 1 PV após chegar a zero uma vez/descanso; forte no 1º nível, deslocar para tier maior ou limitar/autorizar Mestre. |
| **Dead Strikes — 6** | B | Ignora resistência psíquica/necrótica; limita danos, mantém imunidade e classificação de corrupção. |
| **Deadly Glare — 6** | B | Reação de 2 pontos por 1d6 psíquico; custo desvantajoso ou efeito sem resistência; calibrar. |
| **Incredible Strength — 10** | C | Ignora sucesso da salvaguarda contra movimento/prone, violação direta do sistema de resistência. |
| **Intimidating Defense — 10** | B | Imunidade medo e contra-efeito na reação; rever em relação a outras proteções e resistência de criaturas. |
| **Magical Transportation — 14** | B | Teleporte em sombras de até 120 pés como bônus sem cargas; impor usos/descanso e visibilidade/limites. |
| **Command Darkness — 14** | B | Controlar mortos-vivos com CD/limite de alvo; afeta NPCs do Mestre e corrupção, 1 uso + duração e efeitos claros. |
| **Mystical Defence — 18** | C | Imunidade psíquico/necrótico e bloqueio explícito de Avada Kedavra; contradiz magia mortal e progressão base. |
| **Dark Killer — 18** | C | Avada Kedavra sempre 9º círculo sem custo visível, risco enorme e choque com corrupção e acesso. |
| **Leader of Undead — 18** | C | Controle à vontade de mortos-vivos destrói encontros e recursos; não importar como escrito. |

### Poções/Herbologia (School of Potions)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Favorite Hobby — 1** | A | Proficiência ou especialização em Preparo de Poções; respeitar limites de proficiência. |
| **Brewing Master — 1** | A | Proficiência em kit de preparo; concede kit apenas se especificado, sem frascos automáticos. |
| **Natural Healer — 1** | A | Proficiência Medicina/Herbologia e vantagem em identificação de doenças/plantas já encontradas; sem cura grátis. |
| **Plant Lover — 6** | B | Familiar vegetal com bloco próprio + turnos; pode desequilibrar Companheiro de Magizoologia, limitar ações, persistência e evolução. |
| **Careful Potioner — 6** | A | Identificar efeito/ingredientes de poção em 1 minuto; compatível com laboratório e aprovação de Mestre. |
| **Tree Stride — 6** | C | Teleporte entre árvores 30 pés TODO TURNO, sem cargas nem concentração, forte demais. |
| **Exceptional Plants — 10** | B | Multiataque de familiar e comando como bônus; só se Plant Lover e com dano/action economy recalibrados. |
| **The Tough One — 10** | B | Vantagem contra veneno + resistência a um entre veneno/ácido; salvar escolha imutável e recalcular condicionalmente. |
| **Commune with Plants — 10** | A | Diálogo com plantas em jogo; informação controlada pelo Mestre; não revela segredos no front. |
| **Resilient Explorer — 14** | B | Proficiência em salvaguarda CON após The Tough One; forte combinado a outras proteções, custo/restrição. |
| **A Vision from Past — 14** | B | Plantas testemunham até 24h no passado; depende de Comm. Plants e deve ser narrativo controlado pelo Mestre. |
| **Poisoner of Poisoners — 18** | B | Paralisia ao falhar resistência por 5+ contra veneno; poderoso, defesa e duração dependem de status; exigir salvar/limitar. |
| **Resistant Master — 18** | C | Imunidade simultânea ácido+veneno+condição envenenado com resistência a atordoamento é excessiva. |
| **Plant Familiar statblock** | B | Bloco tem `Grasping Vine` repetido e mistura PB, dano, turno, DC; corrigir antes de adotar. |

### Varinhalogia (Wandlore)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Wandmaker’s Gift — 1** | A | Ferramentas de fabricante + proficiência e memória de varinhas: boa formação narrativa/registro de ferramentas. |
| **Wandlore Mastery — 1** | C | “Outras varinhas tornam-se leais a você” sem regra de disputa, requisito ou limite: não implementável. |
| **Benefícios 6/10/14/18** | C | Suplemento NÃO apresenta progressão completa; manter trilha profissional/curso, não escola mecânica selecionável. |

### Licantropia (Lycanthropy)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Wolf Instinct — 1** | B | PV temporários em abate podem gerar loops; limitar 1 vez por turno e não empilhar PV temporários. |
| **Lycan Toughness — 1** | B | +1 PV máximo a cada nível pode ser viável mas depende do formato de licantropia, não escola por si. |
| **Feral Attack — 1** | B | Garras bônus 2d4 e atributo de conjuração em ataques; claro quando humano/lobo, sem acumular com ataques extras indevidos. |
| **Lycan Abilities — 6** | B | Ataque Extra: forte para conjurador, só com forma licantrópica e sem magia combinada. |
| **Survival Adept — 10** | A | Vantagem em testes de terreno natural; condicional na forma e sem duplicar. |
| **Magical Form — 10** | B | Permite lançar magias transformado; conflita com bloqueios de forma Animaga; licantropia ≠ animagia, manter separados. |
| **Greater Jump — 14** | B | Salto/ataque na mesma ação bônus; evitar ataque gratuito todo turno sem condição. |
| **Strong Will — 14** | C | Efeito permanente de Wolfsbane ignora maldição/custo/tempo de poção e narrativa; passar ao Mestre. |
| **Keening Howl — 18** | B | Aura de medo 60 pés com pontos/ concentração; cara e ampla, conferir controle de recursos e criaturas imunes. |
| **Greater Lycanthropic Form — 18** | C | Imunidade a praticamente todas armas não mágicas/não prata, tamanho+força+movimento+dano extras, balancear separadamente. |

### Astronomia (Astronomy)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Star Insight — 1** | B | Percepção às cegas 10 pés no nível 1 é forte; reduzir alcance ou exigir condição. |
| **Overclocking — 1** | C | Ação extra inteira já no 1º nível, poder fora da curva; não importar como escrito. |
| **Waver of Time — 6** | B | Aplicar magias a objetos + vantagem na iniciativa; restringir a lista compatível de magia e sem alvo extra indevido. |
| **Silent Night — 6** | A | Passos silenciosos e rastros não mágicos invisíveis; narrativo e sujeito ao Mestre. |
| **Persistent Effect — 10** | C | Conjurar magias a partir da posição de inimigo marcado pode contornar todos os alcances/coberturas sem custo suficiente. |
| **Mask of Darkness — 10** | A | Vantagem em Enganação/Intimidação no escuro; situacional. |
| **Invisible Spells — 14** | C | Crítico ao atacar dá invisibilidade sem duração definida; não implementável. |
| **Polaris — 14** | B | Não ser empurrado involuntariamente enquanto consciente; pode anular grandes inimigos, impor limite/tamanho. |
| **Wings of Freedom — 18** | B | Voo permanente 60 pés; alta potência, exige controles e condições. |
| **Embrace of the Cosmic — 18** | B | Imunidade a encanto/medo e resistência psíquica; forte, talvez resistência em vez de imunidade. |

### Água (Water)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Soul of the Sea — 1** | A | Respiração/nado no mar e perícias marítimas; situacional, sem criar vantagem de dano. |
| **Grasp of the Tide — 1** | B | Empurra/puxa 10 pés como ação bônus após QUALQUER magia de círculo ≥1; economia da ação toda rodada, limite. |
| **Aquatic Combatant — 6 ou 7** | B | Cabeçalho diz 6 mas texto interno diz 7; decidir nível 6, ajustar remoção automática de agarrado. |
| **Aqua Ring — 6** | B | 2 pontos para anel que reduz dano por reação, colisão com Protego e outras reações; custo/área testados. |
| **Shifting Form — 14** | B | Atravessar frestas de 3 polegadas e reduzir ataques de oportunidade; restrições físicas/inventário/narrativa. |
| **Into the Roil — 18** | B | Lança alvos 100 pés para cima com dano de queda, muita letalidade; cap, reação e área definidos. |

### Clima (Weather)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Isolated Condition — 1** | B | 3 pontos após magia de círculo ≥1 por 1 minuto, evento 1d12; NÃO gerar rolagem no Hub. Tabela tem efeitos extremamente desiguais. |
| **Weather result 1 Sunny Day** | B | Luz do sol + dano radiant; esclarecer alvos por criaturas específicas e custo. |
| **Weather result 2 Downpour** | A | Chuva sem efeito mecânico descrito; pode aplicar estético/narrativo. |
| **Weather result 3 Chilled Breeze** | B | Retira ação bônus OU ação, efeito muito forte num poder aleatório de nível 1. |
| **Weather result 4 Heat Wave** | C | Mata plantas pequenas instantaneamente, perigoso para combate/ambiente. |
| **Weather result 5 Mist** | B | Área fortemente obscurecida; cuidado com visão e duração. |
| **Weather result 6 Flash Flood** | B | Todos “submersos” sem fontes de água e duração, risco de sufocamento involuntário. |
| **Weather result 7 Sandstorm** | A | Desvantagem em Percepção visual situacional; adequado. |
| **Weather result 8 Acid Rain** | B | 1d12 ácido/rodada, requer equilíbrio por nível e salvaguarda. |
| **Weather result 9 Cyclone** | B | Dano 1d6 + puxão, bloqueios de terreno/turnos. |
| **Weather result 10 Thundercloud** | B | Raio/ruído, condição de concentração e custo de bônus; revisar. |
| **Weather result 11 Meteor Shower** | C | 2d12 automático por turno em área no 1º nível, desbalanceado. |
| **Weather result 12 Brain Storm** | C | Controle mental massivo e repetido no 1º nível, desbalanceado. |
| **Long Weather Forecast — 6** | A | Previsão meteorológica local 5 milhas e área +5 pés; útil para aventura escolar. |
| **Aura of Weather — 10** | B | Vantagem em resistências contra “magias elementais”; definir tag elemental e área de aliados. |
| **Elemental Adept — 14** | B | Barreira de bom tempo, meio abrigo e exclusão por força; equilibrar custo e colisões com cobertura. |
| **One with the Weathers — 18** | A | Altera raio de aura 10→30 pés, se aura aprovada. |

### História da Magia (History)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Ruin Bond — 1** | C | Vantagem 20 milhas e +1 ataque/CD sempre ao redor de uma ruína; quase permanente em Hogwarts, exploit óbvio. |
| **History Buff — 1** | A | Proficiência História da Magia/Estudos dos Trouxas, vantagem limitada 1 descanso curto. |
| **Warden’s Cantrip — 6** | B | Reação de truque contra ataques num raio mal definido; limitar frequência, requisitos e alvo. |
| **Archaic Understanding — 6** | B | Bônus permanente mutável: magia extra/perícia/resistência de dano, pode superpor cotas ou min-max diário; restringir/tabela Mestre. |
| **Desperate Measures — 10** | B | Conjurar sem espaço se teste CD12+círculo, falha exaustão; risco alto e altera custos; 1 uso/descanso longo e teto de círculo. |
| **Immeasurable Knowledge — 10** | B | +10 em teste/salvaguarda de INT 1 vez/descanso longo; forte e sem rerolls internos no Hub. |
| **Lore Master’s Eye — 14** | B | Mínimo 10 natural em 3 perícias INT, limites com especialização/perícias e sem efeito em salvaguardas. |
| **Perfection from History — 18** | B | Mínimo 10 História + Ajudar como bônus + bônus proficiência; multiplicidade poderosa, ajustar frequências. |
| **Immeasurable Knowledge — 18 DUPLICADA** | C | Mesma habilidade aparece nos níveis 10 e 18, sem upgrade. Não duplicar. |

### Quadribol (Quidditch)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Basic Flying Training — 1** | B | Proficiência/Especialização voar, bônus progressivo na vassoura, problema de “+5 pés por marcos” acumular indevidamente; revisar. |
| **Personal Broomstick — 3** | B | Uma vassoura própria como recompensa do Mestre, não spawn automático; marcas Nimbus/Firebolt/Cleansweep são anacrônicas em 1890. |
| **Team Player: Beater — 6** | B | Bônus contra construtos/objetos encantados, não contra todo inimigo; exige posição no time. |
| **Team Player: Chaser — 6** | B | Esquiva de ataques de oportunidade e reação de movimento; cuidado com duplo movimento. |
| **Team Player: Keeper — 6** | C | Aura passiva permanente +2 CA e salvaguardas a TODOS aliados 10 pés, quebraria escalas de defesa. |
| **Team Player: Seeker — 6** | B | Vantagem todos ataques contra alvo 10 minutos é forte; limitar a rastreamento/percepção, ou 1 ataque por turno. |
| **Useful Spells: Always Ready — 10** | A | Accio truque conhecido sem cota, invocar vassoura; não ignorar limitações de peso/alcance base sem adaptação. |
| **Useful Spells: Used to Falling — 10** | B | Arresto Momentum grátis PB vezes/descanso; limitar cenário e respeitar regra de reação. |
| **Professional Beater — 14** | C | CA 18 + resistência a TODA contundência apenas por equipamento, anula fórmula CA e economia. |
| **Professional Chaser — 14** | B | Comando de movimento em grupo por bônus com usos PB, calibrar alcance para 30 pés. |
| **Professional Keeper — 14** | C | Eleva aura a +5 CA/salvaguardas em toda equipe; acumulo absurdo. |
| **Professional Seeker — 14** | B | Troca alvo no meio de habilidade; só após revisar habilidade base Seeker. |
| **Quidditch Super Star / Team Captain — 18** | C | Texto termina na metade da frase. Sete dados d10 táticos não é especificação completa. |

## 4. Nova CLASSE Mystical Caster, livros, boons e invocações

**Decisão sobre a classe:** **C — não integrar como quarto estilo do W&W 1.4**. A progressão é quase um warlock de D&D 5e, com espaços de nível uniforme restaurados por descanso curto, carisma, Mystic Arcanum e Mystical Blast; o Hub não tem esse motor. A própria tabela de `Techniques Known` desce de 5 para 3 no 6º nível e de 6 para 3 no 8º, enquanto o texto fala em número crescente. O texto ora fala `Mystical Blast`, ora `Eldritch Blast`, `warlock`, `fighter level`, `Pact of the Chain` inexistente. Bloquear como classe até existir revisão da tabela e de todas as dependências. Podemos reaproveitar certas ideias como **talentos narrativos especiais concedidos pelo Mestre**, sem assumir a classe.

### Três Lore Books (4 marcos cada)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Book of Ghoul Studies: Ghost Savant (1)** | A | Conhecer idioma e saber de fantasmas/demônios; substituir “demonic” não canônico por conhecimentos de seres/espíritos. |
| **Book of Ghoul Studies: Undead Speaker (6)** | B | Cinco perguntas a cadáver 1 vez/descanso longo, limites e consentimento narrativo do Mestre. |
| **Book of Ghoul Studies: Ghost Walking (10)** | B | Incorporeidade por 1 turno; erro “fighter level” e “nearest occupied space”, definir dano e saída segura. |
| **Book of Ghoul Studies: Penumbra of Royalty (14)** | C | Subjuga fiends/celestials/elementais indefinidamente, puxa lore de outro RPG e destrói encontro. |
| **Book of History: Savant from History (1)** | A | Proficiência História + Caligrafia; texto aponta para livro errado, corrigir rótulo. |
| **Book of History: Knowledge from Past (6)** | B | Adicionar d10 a teste/resistência uma vez/descanso, bom porém poderoso em salvaguardas. |
| **Book of History: Divination Versatility (10)** | B | Ritual 1/dia de magia ritual fora das conhecidas; restringir catálogo e não expandir a toda magia. |
| **Book of History: Legend Lore (14)** | A | Investigação de pessoa/objeto lendário, sem automática revelação de informação secreta; resposta Mestre. |
| **Book of Ancient Magic: Mystical State (1)** | C | Permite conjurar QUALQUER magia não conhecida 2 vezes/descanso curto, quebra aprendizado e cotas. |
| **Book of Ancient Magic: Unorthodox Arcana (6)** | B | Uma magia flexível por descanso; lista predefinida/registro e limite de círculo, não qualquer magia. |
| **Book of Ancient Magic: Esoteric Resolve (10)** | B | Proteção telepática e mínimo 10 em saves INT/WIS em estado; depende de estado refeito. |
| **Book of Ancient Magic: Apotheosis (14)** | C | Concentração não quebra por dano durante estado, sem contrapartida, depende de estado não aprovado. |

### Magical Boons (nível 3)
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Mark of Knowledge** | A | Vantagem em um teste de atributo 1/descanso, sem marca corporal permanente compulsória; opção cosmética na ficha. |
| **Magical Talisman** | B | +d4 em teste fracassado PB vezes/dia, forte; vincular talismã equipado e uso, sem rolagens automáticas. |
| **Pact of the Tome / Tome of Secrets** | B | 3 truques extras sem restrição de lista quebra cotas; adaptar para 1 truque extra permitido ou ritual específico. |

### Arcane Techniques/Invocações
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Agonizing Blast** | C | Prerequisito Eldritch Blast inexistente, e não Mystical Blast; requer design da classe. |
| **Armor of Mystics** | B | CA 13 + DES sem armadura/capa é potencialmente duplicata de Força de Vontade; escolher a melhor fórmula, nunca somar. |
| **Beast Speech** | A | Conversar com animais (não magias), resolver informação com Mestre. |
| **Beguiling Influence** | A | 2 perícias sociais, com substituição se duplicadas. |
| **Cloak of Flies** | B | Dano passivo em aura sem concentração, exigir custo, limite, dano/no-turno. |
| **Aqua Research** | A | Nado e respirar submerso (nível 5); boa alternativa temática. |
| **Magical Sight** | B | Enxerga em escuridão mágica 120 pés, impacto em furtividade e ocultação. |
| **Magical Grip** | C | Requer blast não aprovado, então não aplicável sem reescrever. |
| **Sight of Mystical** | B | Specialis Revelio ilimitado pode revelar segredos e consumir magia zero; limitar uso/descanso. |
| **Witchcraft Spear** | C | 300 pés de alcance do blast inexistente na base. |
| **Eyes of the Rune Writer** | A | Ler línguas escritas, não concede compreensão de segredos protegidos. |
| **Frost Lance** | C | Depende do blast não aprovado. |
| **Immortal Mind** | B | Maximiza cura 1/descanso, avaliar concorrência com Combat Medic. |
| **Keeper of Forgotten Tongues** | A | 2 idiomas temporários por descanso, interessante em aulas. |
| **Mark of the Immortal** | B | Curar consumindo dados de vida em salvaguarda mental 1/descanso; respeitar dados disponíveis. |
| **Mark of the Unbidden** | B | Vantagem ampla contra agarrado/contido/paralisia; forte, simplificar. |
| **Visions out of Magic** | B | Conjurar Falladecept ilimitado; exige primeiro aprovar esse feitiço e limitar. |
| **One with Shadows** | B | Invisibilidade enquanto imóvel na escuridão é viável com requisitos visíveis. |
| **Mystical Leap** | A | Triplica salto, sem voo. |
| **Seer’s Eye** | B | Ver através de objetos 30 pés por 1 turno, 1 uso/descanso. |
| **Repelling Blast** | C | Depende de blast; empurrões múltiplos desbalanceados. |
| **Master of Shadow** | B | Pellucidi Pellis ilimitado, restringir a usos/dia e exigir spell conhecido. |
| **Tongue of the Forest** | A | Falar com plantas ao nível 10, decisões Mestre. |
| **Witch Sight** | B | Revelar transformações/invisibilidade automaticamente em 30 pés, limitar magia de ocultação superior. |
| **Bond of the Talisman** | B | Teleporte de longa distância via talismã PB vezes/dia, controle de planos/área e localização. |
| **Book of Ancient Secrets** | B | Dois rituais sem cota, usar apenas magias rituais do W&W e validação de escola. |
| **Eldritch Mind** | B | Vantagem para manter concentração, precisa evitar empilhamento de outros mecanismos. |
| **Eldritch Prison** | C | Pré-requisito Pact of the Chain inexistente; captura instantânea de criatura CR≤1 com aliado em combate. |

**Demais recursos da classe:** Mystical Blast (quatro rajadas d10 ao nível 17), slots todos do mesmo círculo, Mystic Arcanum 6º–9º níveis, Master of Mystical restaurando todos os slots após 1 min = **C** como sistema de jogador atual. A tabela classifica feitiços/dados com termos de D&D externos; exigiria quarta classe completa, novo tratamento de descansos/cotas e validação PvP.

## 5. Lista de TODOS os novos feitiços descritos em Newt — triagem antes de importar

### 30 entradas descritivas no fim do suplemento
| Regra/variante do suplemento | Parecer | Motivo ou adaptação necessária |
|---|---|---|
| **Ilcantem Tantem** | B | Truque 1d8 psíquico com concentração 10min e teste INT; clarificar alvo e uso de concentração. |
| **Vultutris** | B | Fogos roxos 2d4+2 projéteis, dano por consumo; custo de bônus e material/“spell slot 1st or higher” duplicado. |
| **Inevitam** | A | Truque: detectar se algo está vivo; restrição a alvos válidos. |
| **Lacarnum Inflamari** | B | Truque incendiário em área com dano escalando; reavaliar dano + risco de fogo na escola. |
| **Fulguris** | B | Maldição 1º círculo, 1d8 raio, dobrado contra vários tipos de criatura; escalonamento/inadequação a crianças. |
| **Mortalis Telum** | B | Maldição com sangramento após perfuração e concentração; adição de status e teste repetido. |
| **Alarte Ascendare** | B | Suspensão no ar + controle por 10 min de inimigo, queda potencialmente letal; limitar e comparar com Levicorpus. |
| **Cascadio** | B | Projéteis garantidos tipo magic missile e escala por círculo; ajustar dano e não conceder automaticamente. |
| **Beauty Spell** | A | Cosmética temporária vantagem Persuasão, dano zero; aceitar apenas se validada escola/círculo. |
| **Ascendio** | A | Melhora salto/subida na água; utilidade, rever círculo e choque com vassouras/queda. |
| **Falladecept** | B | Ilusão visual de 15 pés, análoga a D&D Silent Image; exigir detecção e desempenho em mesa. |
| **Baubillious** | B | Truque que ilumina e causa 1d8 radiant; necessita checar competição com Lumos e ação de ataque. |
| **Veentoosa** | A | Ar quente para secar roupas/neve, sem dano; excelente efeito de aula. |
| **Verdimilious** | C | Cegueira por orçamento de 6d10 PV sem salvaguarda, cálculo ambíguo (“9 or less”), reescrever. |
| **Flagrante** | B | Aquecimento de metal e maldição persistente; grave dano 3d8 repetível, pode multiplicar armadilhas. |
| **Hurling Hex** | B | Sabotagem de vassoura e queda; excelente para Quadribol com restrições escolares/NPCs. |
| **Protean** | C | Descrito fora da lista e “nível 4” escala a partir de 2º; ligação de objetos sem limite claro, corrigir. |
| **Siccaroube** | A | Secar até 10 galões ou dispersar neblina, efeito claro. |
| **Unbreakable Vow** | C | Condição de morte varia com PV do alvo e “upcast a partir do 2º” num feitiço do 6º, inconsistência grave. |
| **Tyrantio** | C | Anula modificadores INT/WIS/CHA em vários ataques e checks com recursão de resistência, redação vaga. |
| **Lumos Solem** | B | Linha radiante sustentada 1 min com cegueira e luz solar; muito forte como 1º círculo, rever dano e duração. |
| **Ignidere** | A | Visão remota através de fogo persistente, sem combate direto, limite de espionagem com Mestre. |
| **Avenseguim** | B | Objeto rastreia automaticamente dono em 50 pés/turno por 1 hora, cobertura e segredos narrativos. |
| **Tempemodus** | A | Proteção atmosférica cosmética local, sem imunidade a clima perigoso. |
| **Stabiturpe** | C | Desmonta metal/objeto mágico e 8d8 em construtos, desativa magia automática, alto impacto econômico. |
| **Magicae Felicis** | C | Sucesso automático em QUALQUER teste/ataque/defesa até 3 vezes, sem interação com resultados; quebra jogo. |
| **Missamemori** | B | Apagamento em massa 1 hora, CD INT e alvos voluntários; implicações narrativas, segredo e abusos. |
| **Purgarero** | B | Limpa ar até no vácuo + concede d6 em um teste; bônus incomum precisa correção. |
| **Bombarda Maxima** | C | Explosão destrói objetos como TRUQUE; sem limite suficiente, contradiz progressão e semântica de Bombarda. |
| **Clypustria** | A | Resistência necromântica/radiante por concentração até 1h; equilibrar como magia nível 3. |
| **Horcrux — bloco descritivo à parte** | C | Já há habilidade **Alma Fraturada** no nível 18 da escola Maldições; versão do suplemento difere e permite até oito Horcruxes, não importar. |
| **Everte Statum / Corpus Bombardus / Flying Destruction / Witherien / Aqua Eructo** | C | Nomes aparecem em listas/referências sem ficha completa correspondente. Não permitir em criação/evolução. |

**Nota:** a listagem acima inclui os 30 feitiços com subseção própria, o ritual Horcrux apresentado em quadro e nomes citados sem verbete completo. Existem grafias divergentes na mesma fonte (Avensequim/Avenseguim; Verdimilious/Verdimillious; Wandlore/Wandsmith). Conferir também colisões com o catálogo W&W original (ex.: `flagrate` ≠ `Flagrante`, `bombarda` ≠ `Bombarda Maxima`) antes de criar IDs.

## 6. Outros suplementos/planilhas recebidos e o que entra na ficha

| Fonte | O que tem de novo | Parecer |
|---|---|---|
| `Headmaster’s Guide v0.2` | Regras alternativas de conjuração não verbal, críticos, progressão de perícia, licantropia, mudança de escola, evolução e traços de varinha, poções completas | **B / C**: só módulos opcionais; afetam regras centrais se ativados. Não tratar Wand Advancement como bônus automático da aparência da varinha. |
| `The Spellstaff v2.0` | Classe Spellstaff vinculada à escola Ā’irī, sigilos, bastões, combate marcial, especializações dracônicas | **C** para opção inicial em Hogwarts; fora da ambientação escolar e progressão/tabela exigem reconciliar com regras W&W. **A** como folclore/NPC/artefato de uma escola distante. |
| `Wands & Wizards Monster Book v0.2` | Blocos de criaturas e monstros; raças/idades, CR e ataques | **A** no Bestiário do Mestre como conteúdo revisado, **não** progressão da ficha do jogador. |
| `Wizarding Book of Monsters` (Grimoire Games) | Criaturas, Aurores, bruxos das trevas, NPCs escolares e ações prontas, com vocabulário de 5e/2024 | **B**: material opcional de inimigos após conversão; não misturar blocos/CR automaticamente. |
| `Spells List.xlsx` | 144 magias da base | **A** auditoria de equivalência; **não** duplicar as 144 existentes. |
| `Potions list.xlsx` | 69 entradas, 50 presentes no Hub e 19 candidatas extras; receitas/ingredientes/efeitos | **A/B** para catálogo de laboratório; não conceder estoque ou conhecimento no personagem sem requisitos. |
| `Frog Cards.xlsx` | 101 cartas; raridades e biografias | **A** no Acervo após filtro histórico 1890 e créditos; não transforma em feat de personagem. |
| `Monsters.xlsx` | Matriz ampla de blocos de monstros, versões e campos incompletos | **A/B** como dados de referência do Mestre, somente fichas completas e revisadas. |

## 7. Ordem segura de integração no Hub

1. Criar branch isolada a partir do commit realmente publicado. Registrar SHA e executar testes de referência; sem alterações destrutivas.
2. Criar catálogo editorial de **fontes homebrew** (IDs, versão, origem, status A/B/C, tier, dependências, mecânica exata, exigência de Mestre) desligado por padrão; expor ao Mestre pré-visualização das opções.
3. Incluir **apenas opções adicionais** das **seis escolas atuais**, um benefício por marco de nível, sem retroceder escolhas anteriores; marcar B como `requer_aprovacao` e C indisponível.
4. Criar **História, Poções/Herbologia, Astronomia, Água, Clima, Licantropia, Artes das Trevas** como módulos de expansão separadamente; liberar escola na criação apenas quando os tiers 1/6/10/14/18 forem íntegros e equilibrados. Varinhalogia pode começar como curso/ocupação, não escola porque incompleta.
5. Adicionar 30 novos feitiços descritos em **catálogo de candidatos**, com fonte, avaliação, círculos, escola e regra; liberar somente A, depois B revisados. C permanece em revisão.
6. Recuperar os **novos itens/equipamentos/poções/cartas/criaturas** no catálogo sem repor inventário ou ganhar bônus automaticamente.
7. Implementar atualizações server-side, `calcularFicha`, pendências, validação de concessões, níveis, magias e recursos; proteger dados pré-existentes e permissão do Mestre.
8. Testar criação 1º nível por Casa e estilo, progressão completa 1–20, todos os marcos 1/3/6/10/14/18, dado offline, recarga, permissões, ocultação de segredos, outros sistemas, mobile, estilos e animações; comparar com branch-base.
9. Entrega só após relatório de regressões zero nos recursos centrais, diffs revisados e PR; se algo não passa, manter a opção homebrew desativada e documentar.

## 8. Critérios de aceite e erros que o Codex deve impedir

- **Isolamento:** nada de alterar fórmula dos três estilos do W&W base, nem atributos das Casas, nem normas de criação da campanha sem flag autorizada.
- **Fonte em cada habilidade:** `source = newt-trunk`, nome original, português, tier, pré-requisitos, variantes, alertas de risco, decisão editorial; não vender suplemento como cânone.
- **Compatibilidade de dados:** carga de ficha antiga sem extensão idêntica à atual; rollback da flag deixa dados de escolha guardados em campo separado, sem alterar cálculo-base.
- **Cotas:** magias gratuitas não consomem conhecimento regular e não ficam substituíveis; duplicadas têm um ID único; novo feitiço não é ganho por simples visita ao grimório.
- **Rolagens:** Hub **não rola dados**. Guarda bônus e usos, exige confirmação externa e não resolve iniciativa/ataques/salvaguardas automaticamente.
- **Descansos e limites:** cada recurso de habilidade tem contador server-validated e recuperação coerente, sem repetição por refazer página, reconexão ou falso comando de descanso.
- **Itens:** vassouras, varinhas, kits, frascos e tendas novos não aparecem grátis a todos; controlar concessão pelo Mestre ou escolhas explícitas previstas.
- **Tempo 1890:** bloquear marca Firebolt/Nimbus/Cleansweep até solução histórica aprovada; não usar Newt Scamander (nascido em 1897) como personagem contemporâneo em 1890.
- **NPC vs personagem:** blocos de Grimoire Games e Monstros são prioridade do bestiário do Mestre; não criar habilidades de jogador a partir de ataques de monstro.
- **Segredos:** descrição de conjuração proibida, novos bestiários e colecionáveis ocultos não devem ser enviados ao cliente jogador sem autorização.
- **Testes:** preferir testes unitários reais no `src/lib/wands-wizards`, testes da ficha e integração; preservar scripts `testar-wands-wizards*.cjs`, testes iniciativa globais, casas e itens.
- **Implementação faseada:** não prometer tudo pronto num único PR; separar opções aprovadas das pendentes e pedir ao Mestre decisão antes de desbloquear B/C.

## 9. Decisão final sugerida ao Mestre

**Aproveitar MUITA coisa, sim:** principalmente as alternativas de benefícios das seis escolas, escola de Poções/Herbologia, Escola de História, formação em Varinhalogia como profissão, Astronomia, Água, artes sombrias sob autorização, estudo de clima e práticas de Quadribol; além de feitiços utilitários e melhorias de bestiário e poções. **Não** transplantar tudo literalmente: alguns poderes são excelentes ideias mas inviabilizam a dificuldade e/ou contradizem o motor atual. A regra correta é conteúdo homebrew como expansão opt-in, uma escolha por nível/slot, e não uma camada cumulativa de bônus sobre a base.

**Limite desta auditoria:** não foram executadas simulações quantitativas de encontros com personagens reais ou cada combinação de talentos e magias no motor de batalha, portanto a classificação B exige playtest, revisão do Mestre e testes. Nenhum arquivo do GitHub foi modificado.