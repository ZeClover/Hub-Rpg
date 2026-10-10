# Redesign da ficha Wands & Wizards

Identidade em azul-noturno, superfícies iluminadas pela Casa, metal envelhecido e brasões das Casas fornecidos pelo site HarryPotter.com e reprodução do brasão de Hogwarts com créditos. Nenhum recurso de Hogwarts Legacy foi copiado e não há biblioteca gráfica ou serviço pago.

`identidade.js` centraliza as quatro paletas e o estado neutro. A abertura usa a Casa persistida. Uma seleção provisória aplica imediatamente a prévia e executa revelação do brasão, partículas breves e onda luminosa durante dois segundos. Salvar confirma a identidade já exibida. Cancelar o guia restaura a prévia anterior, e Descartar alterações restaura a ficha persistida. A abertura normal e atualizações de recursos não executam a transformação. Movimento reduzido desativa esses efeitos. Escolas de origem adicionais mantêm seu nome e usam o brasão neutro.

O retrato utiliza `avatarUrl` já fornecido pelo Hub, com iniciais quando não disponível. Tema e cores de aparência existentes continuam guardados por personagem e têm prioridade. Os atalhos das etapas do guia permitem revisar escolhas sem mudar as validações existentes.

Nenhuma mudança de regras, API, campanha ou banco foi necessária para o redesign. Cálculos e conteúdos que já estavam pendentes continuam identificados.

Validação: suíte de regras, roteiro de criação/evolução/salvamento e roteiro visual com quatro Casas, neutralidade, confirmação, recarga, cancelamento, movimento reduzido e celular. Capturas em `artifacts/wands-wizards`.

## Assets dos brasões

`identidade.js` expõe o mapa `BRASOES`; trocar o arquivo não exige alterar o layout ou a animação. As quatro imagens SVG vêm do site oficial HarryPotter.com; o brasão de Hogwarts vem de Wikimedia Commons e sua autoria/licença constam no rodapé e em `brasoes/fontes.json`. Os arquivos são servidos localmente, sem dependência de rede externa para abrir a ficha. Erros de imagem apresentam identificação textual explícita, nunca um escudo improvisado. A ferramenta Hub permanece independente.

## Correção de fidelidade pendente

O usuário rejeitou os SVG minimalistas e pediu as artes ornamentadas de Hogwarts Legacy. Os cinco assets finais ainda não estão disponíveis nem validados. Consulte `BRASOES-LEGACY-PENDENTES.md`. O redesign anterior não comprova a conclusão dessa correção.

## Brasões recebidos — 09/10/2026

A pendência dos arquivos foi resolvida com os cinco PNG escolhidos e enviados pelo usuário. O manifesto agora aponta aos arquivos em `brasoes/legacy`; os emblemas minimalistas não são mais usados. A animação foi preservada. Fonte, dimensões, hashes e estado atual constam em `BRASOES-LEGACY-PENDENTES.md`.

### Fade visível ao escolher a Casa — 9 de outubro de 2026

O brasão do cabeçalho já mantinha sua transição de saída/revelação, mas o painel da escolha tinha apenas brilho. A ficha e o passo Casa do guia agora também recebem um fade de 700 ms no próprio conteúdo quando a seleção muda. A prévia da Casa permanece imediata e a animação não é disparada em recargas ou mudanças de outros campos. Movimento reduzido continua eliminando o efeito. O teste visual verifica opacidade intermediária, as quatro Casas, trocas rápidas no guia, cancelamento, descarte e recarga; a suíte da varinha permanece passando.
