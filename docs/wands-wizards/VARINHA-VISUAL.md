# Ateliê de varinhas — 9 de outubro de 2026

A seção Varinha, na ficha e no guia de criação, usa um SVG em camadas gerado localmente. Madeira, núcleo, comprimento e flexibilidade continuam nos quatro campos originais de `dados.varinha`. Os campos aceitam texto livre; datalists apenas sugerem escolhas do livro principal v1.4, p. 28.

`dados.varinhaVisual.cabo` registra exclusivamente o acabamento escolhido: automático, liso, espiral, gravado, orgânico ou ornamental. Nenhum número de regras é alterado. O antecedente da varinha e seus efeitos mecânicos continuam pendentes, como indicado na ficha.

Madeiras conhecidas têm famílias de cor, espessura e cabo. Madeiras próprias recebem um acabamento determinístico pelo nome, sem sorteio. O núcleo distingue uma iluminação discreta dourada, avermelhada ou perolada. A flexibilidade controla a curvatura. Comprimentos reconhecem números decimais, vírgula decimal, frações mistas e caracteres como ½ e ¾; centímetros são convertidos para a mesma escala. Medidas desconhecidas preservam o texto e usam apenas uma geometria ilustrativa. A escala visual cabe no painel e é limitada nas medidas extremas, sem restringir o registro do personagem.

Trocas fazem uma transição de 450–650 ms; não há partículas ou animação contínua. Movimento reduzido elimina a animação. A prévia usa a iluminação ambiente da Casa, mas a cor da madeira e a aura do núcleo pertencem à varinha.

Validação: `node scripts/testar-wands-wizards-varinha.cjs` exercita três formas, campos isolados, frações, conversão de unidades, persistência de cabo, invariância dos cálculos, recarga, descarte, cancelamento do guia, opções próprias, movimento reduzido, celular e permissões de leitura. Capturas estão em `artifacts/wands-wizards/varinha-*.png`. Os testes existentes de criação/evolução/salvamento e identidade visual também foram executados.

Os núcleos reconhecidos agora exibem um emblema próprio com legenda: fênix, unicórnio, dragão, kelpie, ditamno, amasso, veela, coral e trasgo. Texto personalizado continua permitido e recebe uma identificação visual de núcleo próprio; campo vazio oculta o emblema. A troca ocorre imediatamente na ficha e no guia, com revelação breve que respeita movimento reduzido.

## Refinamento da experiência — 9 de outubro de 2026

Os caminhos, cores, texturas e modelos de cabo existentes foram preservados. O enquadramento passa a centralizar a geometria sem escalar separadamente o cabo ou a ponta. No celular a composição gira 40° e usa um quadro comum para todos os comprimentos; uma varinha curta continua menor que a longa. A régua permanece paralela à varinha. O quadro desktop reduz o espaço vertical vazio. Controles locais têm altura mínima de 48 px e fonte de 16 px; descrições e notas ganham contraste e leitura no celular. A iluminação ambiente conserva um toque da Casa.

As transições agora distinguem madeira, núcleo, comprimento, flexibilidade e cabo: revelação com luz percorrendo a madeira/cabo, pulso temporário do núcleo e interpolação nativa dos caminhos do corpo, veios, sombra e régua durante mudanças geométricas. Durações de 400 a 540 ms, sem loop, sem bloquear controles. Atualizações não relacionadas à varinha não recriam a prévia nem disparam animações. Valores textuais equivalentes também não animam uma geometria que não mudou. Movimento reduzido desativa efeitos e cancela transições em andamento.

Os emblemas de traços dos núcleos foram substituídos por ilustrações originais geradas para a interface. São artes próprias, não assets oficiais de Hogwarts. Dois atlas locais WebP, convertidos sem perdas, fornecem fênix, unicórnio, dragão, kelpie, amasso, veela, ditamno, coral e trasgo. Os PNGs originais foram mantidos em `artifacts/wands-wizards/refinamento-varinha/`. Não há geração nem chamadas a APIs para exibir os símbolos no aplicativo.

Não foi adicionada estrutura de armazenamento: a aparência continua sendo reconstruída a partir dos campos existentes da varinha e do acabamento cosmético já salvo. O teste cobre fechar a página e reabrir em nova página, recarga, retomada de rascunho, descarte, cancelamento, comparação do modelo entre telas e alteração de outra seção sem animação. Também verifica estados intermediários da interpolação e limites do cabo, corpo e régua em 320, 390, 600, 768 e 1280 px.

Capturas da mesma configuração antes/depois: `refinamento-varinha/antes-{celular,desktop}.png` e `depois-{celular,desktop}.png`. Comparação curta/longa: `depois-curta.png` e `depois-longa.png`. As capturas e os testes funcionais usam transporte local com respostas de conta simuladas; a publicação recebe conferência adicional dos arquivos públicos e execução da prévia com esses arquivos reais.
