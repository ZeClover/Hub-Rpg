# GM Core — conteúdo de consulta do Hub

Fonte: PDF GM Core Remaster em inglês enviado pelo usuário, com 338 páginas físicas. SHA-256: `e4350a99f3295d80ecfcb15810a8a8687807ce5eb65314ee354436916c87d468`.

Arquivo público: `public/pathfinder/gm-core.json`. Fonte declarada **parcial**. A integração contém **36 guias em português, 13 tabelas reais e 120 equipamentos, incluindo 5 artefatos**. As entradas estão organizadas por IDs estáveis e páginas impressas. A tradução integral das 338 páginas e de todos os tesouros não foi concluída.

Os guias são explicações próprias de consulta: CD, encontros, XP, tesouro, perigos, criação de PNJs/itens, fabricação, uso de equipamento e subsistemas. Resumos são frases completas escritas por entrada ou família; não há cortes de parágrafo ou texto truncado. Descrições detalhadas continuam disponíveis nas entradas.

O catálogo reúne versões de runas fundamentais, propriedades selecionadas, pergaminhos, varinhas e poções. Os cinco artefatos são Selo do Pai da Forja, Espelho de Sorshen, Extrator filosofal, Serithtial e Projétil do Primeiro Cofre. São identificados para consulta do mestre e não possuem preço de mercado. Acesso, raridade, consumo e limitações não são descartados.

As 13 tabelas: CDs simples; CDs por nível; CDs por círculo; ajustes de dificuldade; ajustes de raridade; orçamento de encontros; XP de criaturas; XP de perigos; feitos; tesouro do grupo por nível; riqueza de novo personagem; alerta de infiltração; reputação. As tabelas de tesouro e riqueza cobrem níveis 1–20. `xpPerigosNota` é uma observação, não uma décima quarta tabela.

`auditoria.json` registra contagens, hash, verificações e divergências impressas. A fonte imprime perigo +4 com 30/150 XP, embora sua regra textual implique 32/160; a tabela de criaturas usa 160. Elas permanecem separadas. A reforçadora maior imprime +42 de Limiar de Quebra junto de +80 PV. O pergaminho possui uma linha indevida de frequência de varinha; a descrição da seção determina consumo único. Outras notas tratam formulações antigas de atributos, fabricação e reagentes infundidos. Nenhuma divergência aplica uma mudança silenciosa às fichas.

Originais e texto inglês extraído ficam em `artifacts/pathfinder/gm-core`, fora da leitura pública padrão. O aviso ORC original foi preservado em `ORC-aviso-original.txt`; o JSON tem crédito e uma explicação portuguesa da licença, sem apresentar tradução jurídica como texto vinculante.

O gerador `reconstruir.py` recompõe **somente** o JSON deste catálogo, com o texto editorial e tabelas mantidos no próprio script. Ele existe para recuperação após a troca do ambiente e não deve ser executado sobre futuras ampliações sem antes incorporá-las ao gerador. Não altera banco, código compartilhado, fichas ou publicação.

Pendente: tradução integral, restante dos equipamentos e tabelas completas de construção de criaturas/perigos/itens, cenário, exemplos e entradas detalhadas dos subsistemas. Não anunciar esse livro como traduzido integralmente.

## Dados mecânicos para o cálculo automático

As 120 entradas agora declaram se possuem dados mecânicos executáveis. **22 entradas** possuem dados estruturados revisados: doze runas fundamentais de arma/armadura, cinco reforçadoras sem divergência conhecida e cinco poções de cura. A reforçadora maior fica bloqueada para cálculo pela divergência impressa de seu Limiar de Quebra. As outras entradas continuam legíveis, com `automatizavel:false` e motivo; nenhuma recebe um efeito aproximado só para parecer implementada.

Runas usam `mecanica:{versao,tipo,categoria,familia,valor,exigeBase,exigeInvestimento,aplicacao,tipoBonus}`. Categorias arma/armadura/escudo separam as duas potências. Famílias são potencia/impactante/resiliente/reforcadora. Potência e resiliente usam valores 1–3; impactante define a quantidade **total** de dados de dano da arma, 2–4, sem somar aos dados existentes. Reforçadoras preservam aumentos e máximos em `mecanica.reforco`.

O vínculo da ficha é `runasEquipamento:{arma:{potencia,impactante},armadura:{potencia,resiliente},escudo:{reforco}}`, com IDs do catálogo, aplicado à base selecionada por armaId/armaduraId/escudoId. Referência escolhida no inventário não concede bônus solto. Runas de armadura exigem investimento. Não combinar versões da mesma família para somar bônus; propriedades não podem ultrapassar capacidade de potência.

Poções de cura usam `mecanica:{tipo:'consumivel',acao:'curar',acoes:1,consomeQuantidade:1,cura:{expressao,quantidadeDados,facesDados,fixo},alvo}`. Essas estruturas conservam 1d8, 2d8+5, 3d8+10, 6d8+20 e 8d8+30. O executor deve validar posse/quantidade, disponibilidade da ação, alvo, imunidades aplicáveis, limites de PV e consumo único antes de persistir. Dados estruturados não são um executor nem comprovam integração publicada.

Não há itens ápice nesse recorte: não foi inventado incremento de atributo a partir de descrições de artefatos. Propriedades condicionais, magias em itens e poderes de artefatos continuam pendentes de executores completos.
