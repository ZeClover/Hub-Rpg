# GM Core — conteúdo de consulta do Hub

Fonte: PDF GM Core Remaster em inglês enviado pelo usuário, com 338 páginas físicas. SHA-256: `e4350a99f3295d80ecfcb15810a8a8687807ce5eb65314ee354436916c87d468`.

Arquivo público: `public/pathfinder/gm-core.json`. O gerador recompõe **93 guias em português, 41 tabelas e 286 entradas de equipamento e consulta**. O catálogo individual também inclui todas as bombas, elixires, venenos e ferramentas alquímicas das páginas 244–251, com variantes, CDs e estágios. Exemplos extensos, cenário e o restante do catálogo de tesouro ainda não são reproduzidos página a página.

Os guias são explicações próprias de consulta: CD, encontros, XP, tesouro, perigos, criação de PNJs/itens, fabricação, uso de equipamento e subsistemas. Resumos são frases completas escritas por entrada ou família; não há cortes de parágrafo ou texto truncado. Descrições detalhadas continuam disponíveis nas entradas.

O catálogo reúne versões de runas fundamentais, propriedades selecionadas, pergaminhos, varinhas e poções. Os cinco artefatos são Selo do Pai da Forja, Espelho de Sorshen, Extrator filosofal, Serithtial e Projétil do Primeiro Cofre. São identificados para consulta do mestre e não possuem preço de mercado. Acesso, raridade, consumo e limitações não são descartados.

O catálogo contém **41 tabelas de dados**. Elas abrangem CDs, raridade, encontros, XP, tesouro, perigos, construção de criaturas, subsistemas, materiais e outras referências operacionais do recorte declarado. Os nomes das 41 tabelas e as 101 chaves de coluna possuem rótulos em português dentro de `tabelasRotulos`. `xpPerigosNota` é uma observação textual adicional, não uma tabela.

`auditoria.json` registra contagens, hash, verificações e divergências impressas. A fonte imprime perigo +4 com 30/150 XP, embora sua regra textual implique 32/160; a tabela de criaturas usa 160. Elas permanecem separadas. A reforçadora maior imprime +42 de Limiar de Quebra junto de +80 PV. O pergaminho possui uma linha indevida de frequência de varinha; a descrição da seção determina consumo único. Outras notas tratam formulações antigas de atributos, fabricação e reagentes infundidos. Nenhuma divergência aplica uma mudança silenciosa às fichas.

Originais e texto inglês extraído ficam em `artifacts/pathfinder/gm-core`, fora da leitura pública padrão. O aviso ORC original foi preservado em `ORC-aviso-original.txt`; o JSON tem crédito e uma explicação portuguesa da licença, sem apresentar tradução jurídica como texto vinculante.

O gerador `reconstruir.py` recompõe **somente** o JSON deste catálogo, reunindo os módulos de ampliação do mesmo diretório. `regras-completas.py` mantém as regras operacionais e os materiais; `ampliacao-consulta.py`, `reliquias-dons.py`, `inteligentes-apice.py` e `veiculos.py` preservam as ampliações anteriores. `tabelas-rotulos.json` é incorporado ao resultado para que a interface não dependa de nomes ou colunas fixos. Não altera banco, código compartilhado, fichas ou publicação.

Pendente: exemplos extensos, cenário e entradas individuais de munição, óleos, talismãs, itens empunhados, cajados, varinhas especiais e itens vestidos. Não anunciar o catálogo inteiro como tradução integral.

## Cobertura operacional consolidada

As novas entradas completam adjudicação, modos de jogo, iniciativa, recompensas, objetos, clima, desastres, detecção e construção de perigos, construção e revisão de criaturas, criação e uso de itens e os subsistemas de Pontos de Vitória, Influência, Pesquisa, Perseguição, Infiltração, Reputação, Liderança e Hexploração.

Materiais agora incluem 19 linhas de materiais comuns, 39 combinações de material precioso por grau e forma, os três graus de fabricação e seis referências de matéria-prima. Valores de Dureza, PV e Limiar de Quebra foram transcritos das páginas 252–254. A interface recebe nomes e rótulos de todas as tabelas pelo próprio catálogo.

## Dados mecânicos para o cálculo automático

As 286 entradas declaram explicitamente o estado de sua mecânica. **25 entradas** possuem execução estruturada revisada. As 40 entradas alquímicas novas preservam seus valores para consulta, mas não simulam ataque, aflição, consumo ou duração sem executor seguro. As demais continuam legíveis, com `automatizavel:false` e motivo.

Runas usam `mecanica:{versao,tipo,categoria,familia,valor,exigeBase,exigeInvestimento,aplicacao,tipoBonus}`. Categorias arma/armadura/escudo separam as duas potências. Famílias são potencia/impactante/resiliente/reforcadora. Potência e resiliente usam valores 1–3; impactante define a quantidade **total** de dados de dano da arma, 2–4, sem somar aos dados existentes. Reforçadoras preservam aumentos e máximos em `mecanica.reforco`.

O vínculo da ficha é `runasEquipamento:{arma:{potencia,impactante},armadura:{potencia,resiliente},escudo:{reforco}}`, com IDs do catálogo, aplicado à base selecionada por armaId/armaduraId/escudoId. Referência escolhida no inventário não concede bônus solto. Runas de armadura exigem investimento. Não combinar versões da mesma família para somar bônus; propriedades não podem ultrapassar capacidade de potência.

Poções de cura usam `mecanica:{tipo:'consumivel',acao:'curar',acoes:1,consomeQuantidade:1,cura:{expressao,quantidadeDados,facesDados,fixo},alvo}`. Essas estruturas conservam 1d8, 2d8+5, 3d8+10, 6d8+20 e 8d8+30. O executor deve validar posse/quantidade, disponibilidade da ação, alvo, imunidades aplicáveis, limites de PV e consumo único antes de persistir. Dados estruturados não são um executor nem comprovam integração publicada.

Há seis itens ápice revisados para consulta, além de itens inteligentes e de companheiro, mas seus efeitos permanecem sem executor. Não foi inventado incremento de atributo a partir de descrições incompletas. Propriedades condicionais, magias em itens e poderes de artefatos continuam pendentes de executores completos.

## Ampliação editorial: construção e sombra

O gerador consolidado contém 93 guias e 41 tabelas (mais uma nota). Entre elas estão Furtividade/desativação de perigos e proficiência mínima (p.110), ofensiva de perigos (p.111), CA de criaturas (p.117), salvaguardas (p.118), PV (p.118–119), subsistemas e materiais. As tabelas de construção numéricas cobrem níveis −1 a 24; intervalos de PV/CD são preservados.

As runas sombra, sombra maior e sombra superior recebem dados mecânicos com +1, +2 e +3 de item em Furtividade, respectivamente (p.227), para armadura leve ou média investida. Ocupam propriedade, pertencem ao mesmo grupo sombra e não somam bônus. Passam a existir 25 entradas com estruturas executáveis; o motor ainda precisa validar capacidade, equipamento e investimento.

O validador isolado recompõe o catálogo sem escrever em `public/`, confere IDs, campos obrigatórios e cobertura total dos rótulos. O JSON público final é gerado por `python docs/pathfinder/gm-core/reconstruir.py`. O catálogo continua parcial: alquimia individual está coberta, mas as categorias listadas como pendentes ainda não foram traduzidas página a página.
