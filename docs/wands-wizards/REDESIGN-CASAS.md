# Identidades estruturais das Casas — Wands & Wizards

A ficha inteira passa a assumir a Casa: vinho/ouro, esmeralda/prata, safira/bronze e castanho/grafite/âmbar. Sem Casa, mantém a identidade institucional azul-noturno de Hogwarts. Os brasões fornecidos pelo usuário continuam intactos.

## Causa do azul dominante

`aplicarEstilo` usava sempre o mesmo par de cores `#0A1523` e `#14263A` para o tema padrão, independentemente da Casa. Os campos herdavam esse fundo. As cores da Casa se limitavam principalmente a `--house-primary`, bordas e destaques. A apresentação da varinha ainda fixava `#08141f` e `#091722`; capas, malão e figurinhas também mantinham bases azuladas. Por isso o brilho mudava, mas as superfícies continuavam azuis.

## Implementação

As cinco paletas ficam na estrutura `CASAS_VISUAIS` de `identidade.js`, sem um segundo estado de Casa. Cada paleta define fundo, superfície, painel, cartão, campo, borda, destaque, texto e texto secundário. Os tokens efetivos (`--bg`, `--surface`, `--panel`, `--card`, `--input`, `--text`, `--muted`) são aplicados pela rotina de estilo já existente.

| Casa | Fundo | Painel | Campo | Destaque |
| --- | --- | --- | --- | --- |
| Hogwarts | #0A1523 | #1B3046 | #091522 | #D9BB7A |
| Grifinória | #180F15 | #44212A | #231218 | #D9A657 |
| Sonserina | #091714 | #1B392E | #0C1E1A | #BED2C9 |
| Corvinal | #0A1425 | #1D3A5B | #0B1C32 | #D1AB75 |
| Lufa-Lufa | #191710 | #393224 | #211E17 | #F0CB75 |

Cabeçalho, indicadores, painéis, navegação, inputs, opções nativas, biblioteca de madeiras e molduras usam essas superfícies. Os cartões das quatro Casas mantêm suas próprias cores e brasões; a área ao redor segue a Casa ativa. A capa do grimório e o forro/ferragens do malão também mudam. As páginas e cartões de magias continuam em pergaminho com tinta escura, como solicitado anteriormente.

O modelo físico da varinha continua determinado exclusivamente por sua configuração: madeira, núcleo, comprimento, flexibilidade, cabo e acabamento. A Casa altera apenas a apresentação, luz ambiente, caixa e controles. As cores e caminhos SVG da madeira foram comparados entre todas as Casas e permaneceram idênticos.

Os tokens de cor são registrados com `@property`. Isso permite interpolar as cores usadas nos gradientes, sem trocar imagens de fundo abruptamente. A linha luminosa aprovada, as cores e o crossfade dos brasões compartilham a mesma duração e o mesmo quadro inicial. A duração de 1,8 s da transição aprovada foi preservada. Recarregar e editar campos sem mudar a Casa não reproduzem a transformação.

A linha mágica é o padrão solicitado pelo usuário. O modo do dispositivo só reduz o movimento quando o jogador o escolhe explicitamente em Estilo desta ficha. A versão anterior havia preenchido dispositivo automaticamente, fazendo a linha desaparecer em aparelhos com movimento reduzido; esse valor antigo, sem marcador de escolha explícita, agora usa a linha mágica. O marcador visual efeitoCasaEscolhido permite guardar a opção do jogador sem confundir um padrão automático com uma escolha. O modo Somente fade suave continua preservado. Temas alternativos e cores personalizadas permanecem disponíveis e com prioridade; não foram apagados nem migrados para outro armazenamento. A validação só ajusta o padrão dessa preferência visual, sem mudar cálculos ou regras.

## Arquivos de aplicação alterados

- `public/wands-wizards/identidade.js`: paletas, tokens estruturais e captura das cores para transições rápidas.
- `public/wands-wizards/ficha.js`: aplicação das superfícies, preservação da personalização, cartões de seleção e esquema de cor nativo.
- `public/wands-wizards/ficha.css`: tokens interpoláveis, campos, painéis, indicadores, navegação e estados de foco.
- `public/wands-wizards/varinha.css`: painel de apresentação e textos temáticos.
- `public/wands-wizards/caixa-varinha.css`: iluminação/forro/capa/controles da caixa; transição centralizada na ficha.
- `public/wands-wizards/experiencias/experiencias.css`: capas, malão, coleção e marcadores; pergaminho preservado.
- `public/wands-wizards/ficha-regras.mjs`: padrão da preferência visual de movimento, sem alterações mecânicas.

## Verificação

- `testar-wands-wizards-paletas.cjs`: cinco identidades em 1280 e 390 px, cores estruturais esperadas, contraste dos textos/destaques acima de 4,5 contra as superfícies padrão, foco visível, madeira idêntica, grimório e inventário, salvamento/recarga/descarte, temas alternativos e ausência de rolagem horizontal.
- `testar-wands-wizards-sincronia.cjs`: cores de fundo/superfície/campo, brasão e linha começam no mesmo quadro e interpolam durante o percurso; trocas rápidas e cancelamento.
- `testar-wands-wizards-visual.cjs`: 12 transições entre Casas, salvamento, recarga, preview/descarte, guia, movimento reduzido e celular.
- `testar-wands-wizards-varinha.cjs`: modelos e controles, três madeiras/núcleos, comprimentos, flexibilidade, cabos, persistência/rascunho/descarte e larguras 320–1280.
- `testar-wands-wizards-revelacao.cjs`: cinco fases da primeira revelação, estado persistente, falhas, interrupção, outro dispositivo e ausência de repetição.
- `testar-wands-wizards-experiencias.cjs`: tradução/consulta legível, teclado, grimório, inventário, consumo, conflitos, coleção e movimento reduzido.
- `testar-wands-wizards.cjs`: criação/evolução guiadas, cálculos, conflitos, estilo individual e somente leitura.

As capturas usam o mesmo personagem de teste, varinha, magias e inventário. Os bônus da Casa seguem as regras existentes. Há capturas com brasão e nome da Casa ocultos para comparar apenas a aparência. Nenhum personagem real foi usado ou modificado pelos testes. As cores personalizadas pelo usuário podem ter contraste diferente das paletas padrão verificadas.

## Capturas

A pasta `artifacts/wands-wizards/paletas` contém 80 capturas das oito vistas, cinco identidades e dois tamanhos de tela. Inclui comparativos de sessão, celular, varinhas, grimórios e inventários, além do critério sem brasão. `comparativo.html` permite alternar seção e tamanho da tela, usando somente imagens locais. `contraste-e-paletas.json` registra as cores efetivas verificadas.
