# Player Core: corpos individuais em português

O livro enviado já está em português. O lote `entradas-nativas-pt.json` preenche 735 talentos e 361 magias que antes tinham apenas uma referência de página. Junto das entradas individuais já revisadas, todas as 884 entradas de talentos e 491 de magias do catálogo passam a ter corpo de regra. Não altera IDs nem substitui textos anteriormente revisados.

A extração acompanha blocos em ordem de coluna, continuações na página seguinte, fontes tipográficas de títulos e caixas de exemplos. Exclui índices alfabéticos de talentos e legendas de ilustrações. Três fronteiras com tabelas/falta de pontuação da fonte têm adaptações manuais em `entradas-nativas-excecoes.json`. Os testes incluem os pontos em que uma leitura ingênua misturaria a descrição de um elfo com Portal de Pedra, exemplos de personagem com Musa Multifacetada e estatísticas de uma criatura com Lentidão.

`revisao: texto-nativo-delimitado` identifica corpo nativo extraído; não significa revisão mecânica nem efeito automático implementado. `somenteConsulta: true` impede liberar escolhas inseguras na ficha. A extração não gera resumos truncados: entradas novas com necessidade de resumo editorial preservam `resumo: []`; os corpos completos permanecem disponíveis no detalhe. A automação e os resumos editoriais completos ainda precisam de revisão por entrada.

Dois IDs históricos com prefixo dromaar (`dromaar-charme-sobrenatural` e `dromaar-inspirar-imitacao`) pertencem à ancestralidade aiuvarin conforme o traço impresso na página 83. Os IDs persistidos foram preservados e o filtro de ancestralidade foi corrigido.

## Reprodução

```sh
python3 docs/pathfinder/player-core-1/extrair-entradas-nativas.py
python3 docs/pathfinder/player-core-1/verificar-entradas-nativas.py
python3 docs/pathfinder/player-core-1/compilar.py
```

O PDF precisa estar no diretório de anexos declarado pelo extrator. O compilador aplica os corpos nativos depois dos overlays anteriores, preservando registros já revisados, e aplica separadamente `passivos-gerais-revisados.json`. Ele escreve o catálogo público; somente o responsável pela integração executa essa etapa.

## Passivos

Vitalidade mantém +1 PV por nível e acrescenta efeito de −1 na CD de recuperação. Duro de Matar acrescenta +1 ao limite de morrendo. Treinamento em Perícia concede +1 treinamento, exige Inteligência +1 e é repetível para perícias diferentes. Os campos estruturados de Iniciativa Incrível, Improvisação Destreinada, Epítome da Ancestralidade, Perspicácia Astuta e Recuperação Rápida só devem ser liberados depois que as respectivas regras do motor e interface forem testadas; por isso permanecem consulta no overlay inicial.

Sem API externa de tradução ou cálculo e sem serviço pago novo.
