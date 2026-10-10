# Caixa interativa de varinha — 9 de outubro de 2026

A caixa envolve o renderizador existente, mantendo seus modelos, paletas, veios, cabos, comprimento, flexibilidade e luz do núcleo. O renderizador continua reconstruindo exatamente o mesmo modelo a partir de `dados.varinha` e do acabamento cosmético existente. O enquadramento é ajustado ao espaço físico da caixa; o corpo da varinha não é reconstruído ou simplificado.

O estojo tem base em SVG com faces, bordas metálicas, tecido trançado, dobras, encaixe e profundidade. A tampa possui frente e verso e abre por uma transformação CSS 3D em torno da dobradiça. A revelação dura até 820 ms, incluindo a ativação luminosa; fechar reverte a tampa. Não há animação contínua, biblioteca 3D ou chamada a serviço externo.

## Revelação única — comportamento final

Na ficha, a caixa abre uma única vez por personagem e permanece aberta como moldura. Não há botão para fechar ou repetir a cerimônia. O registro `varinhaRevelada` acompanha os dados existentes da ficha na conta, sem tabela ou API adicional. Rascunhos antigos não podem desfazer um registro já confirmado.

A revelação exige madeira, núcleo, comprimento e flexibilidade e começa por um clique. O salvamento deve ser confirmado antes de apresentar as cinco fases, que duram aproximadamente 4,8 segundos. Assim, fechar a página durante a apresentação não gera uma segunda abertura ao retornar. Se o salvamento falhar, a caixa continua fechada e a configuração é preservada. Há botão para pular e suporte a movimento reduzido. Depois, salvar, reabrir, trocar de Casa ou editar a varinha mantém a caixa aberta e a aparência determinística.

Personagens anteriores com os quatro detalhes já preenchidos recebem a apresentação aberta, sem cerimônia obrigatória. Essa compatibilidade é persistida no próximo salvamento normal. A demonstração sem conta não promete persistência entre dispositivos.

O componente isolado mantém abertura e fechamento para testes geométricos; a ficha usa exclusivamente o fluxo único. Os controles nativos permitem Enter e Espaço. Após a revelação, o palco deixa de ser botão.

O tema reutiliza a paleta central da Casa. A única extensão dessa paleta é `--house-case-metal`: dourado, prata ou bronze seguem o destaque existente; Lufa-Lufa usa grafite. A propriedade participa da transição central da Casa, sem sistema de tema separado. Madeira e núcleo continuam independentes da Casa. Abrir a caixa não chama a transformação de Casa.

## Validação

- `node scripts/testar-wands-wizards-varinha.cjs`: modelos, campos, animações geométricas, regra inalterada, fechar página/reabrir a ficha com a mesma aparência, rascunho, descarte, recarga, permissão e mobile.
- `node scripts/testar-wands-wizards.cjs`: criação/evolução, salvamento e conflitos, estilo individual, leitura e proteção de fichas antigas.
- `node scripts/testar-wands-wizards-visual.cjs`: Casas, fade, cancelamento e recarga.
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/ww-browser-tools node scripts/testar-wands-wizards-caixa.cjs`: tampa 3D, quatro Casas e neutra, teclado, cliques rápidos, edição sem reiniciar abertura, fechamento/reabertura, guia, movimento reduzido e limites em 320–1280 px. Contas e fontes do navegador são simuladas nos testes locais; os dados são verificados pelo motor real de regras.

Para gravar o vídeo nesta máquina, o FFmpeg do sistema foi exposto à localização esperada pelo Playwright: criar `/tmp/ww-browser-tools/ffmpeg-1011/` e o link `ffmpeg-linux` para `/usr/bin/ffmpeg`. Nenhuma dependência do projeto foi alterada.

Capturas e vídeo ficam em `artifacts/wands-wizards/caixa/`. A demonstração pública, sem dados de conta, é servida em `/wands-wizards/varinhas/demonstracao-caixa.webm`.

- `scripts/testar-wands-wizards-revelacao.cjs`: cinco fases, falha de salvamento, abertura única, caixa preservada, interrupção, outro dispositivo, personagens antigos e movimento reduzido. Contas são simuladas; o motor de validação é real.

## Correção de legibilidade da revelação

A apresentação enquadra o palco da varinha na tela antes das fases, especialmente após o clique no celular. A varinha sobe fisicamente da caixa, recebe luz percorrendo o corpo, pulsação na cor do núcleo, partículas finitas e um halo de reconhecimento. Frases em português acompanham as fases. A tampa mantém `preserve-3d`: o escurecimento é aplicado às faces, nunca à opacidade do contêiner da dobradiça. Os testes verificam a animação CSS real e a opacidade do efeito, além dos estados. Movimento reduzido continua respeitado.

## Escolha explícita de movimento

O botão principal é “Revelar com animação”. Se o dispositivo estiver reduzindo movimento, esse clique explícito autoriza a sequência completa apenas para a varinha, com a preferência cosmética `varinhaVisual.animacao`. Nesse caso também aparece “Abrir sem movimento”, que mantém a preferência do dispositivo. Nenhuma cerimônia inicia sozinha, e a flag de abertura única continua preservada. O teste cobre o clique com animação mesmo sob `prefers-reduced-motion: reduce`, além do caminho sem movimento. Ao concluir, os controles do formulário são reconstruídos para permanecerem vinculados aos dados confirmados.
