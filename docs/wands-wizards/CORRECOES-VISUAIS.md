# Correções de animação e cartões

Os cartões de magias usam um único pergaminho nos estados aberto e fechado, com tinta escura e sem outro bloco de fundo no efeito expandido.

A abertura da caixa distingue o botão explícito “Revelar com animação” da alternativa “Abrir sem movimento”. A primeira escolha executa a cerimônia completa inclusive quando o dispositivo prefere reduzir movimento. A flag de revelação única é mantida; a caixa permanece aberta nas próximas visitas. O formulário é atualizado após a cerimônia para usar os dados confirmados. A aparência continua determinística.

A troca de Casa interpola as cores atuais e mistura o brasão anterior com o novo por opacidade. O efeito não depende exclusivamente das classes de animação CSS, e cliques rápidos partem das cores já exibidas. A preferência por movimento reduzido conserva um fade breve de cor e opacidade, sem deslocamentos, partículas ou onda luminosa. Salvar ou recarregar a mesma Casa não inicia outra transformação.

Validação: `testar-wands-wizards-visual.cjs` cobre todas as 12 transições dirigidas entre Casas, cores intermediárias, mistura real dos brasões, cliques rápidos, guia, descarte, recarga e movimento reduzido. Os testes de experiências, criação/evolução, varinha e revelação também foram executados. São contas simuladas com validação real; a verificação pública utiliza o modo de demonstração sem alterar contas de jogadores.

### Linha brilhante na troca de Casa

Restaurada a faixa luminosa diagonal, com núcleo estreito e brilho suave na cor da Casa, junto às transições reais de cores e brasões. Funciona tanto na ficha quanto no guia em dialog, sem interceptar cliques. O efeito é finito e reinicia somente quando a Casa muda. Em Estilo desta ficha, Troca de Casa permite escolher Linha brilhante e fade (padrão solicitado), Somente fade suave ou Seguir meu dispositivo. A escolha explícita da linha permite sua reprodução mesmo com movimento reduzido no dispositivo; Seguir meu dispositivo respeita essa preferência. A preferência usa o objeto aparencia já existente, com validação no salvamento; trocar tema a preserva.

Verificação: transições entre as quatro Casas, guia móvel com linha visível no meio do percurso, movimento reduzido com escolha explícita, opção de dispositivo com fade de 200 ms, salvamento e recarga, descarte/cancelamento, ausência de transbordamento e testes de criação/evolução.

### Sincronização da transformação

A linha anterior só entrava na área visível após uma espera fora da tela, enquanto o brasão já concluía o fade em 900 ms. Ajustado o percurso para começar junto à borda, sem pausa inicial, com brilho reduzido. Cores, brasões e faixa passam a usar 1800 ms e a mesma curva; o início é alinhado em um único quadro após aplicar as variáveis finais do tema. Trocas rápidas cancelam o agendamento anterior. O modo reduzido continua com fade curto e sem faixa.

Teste dedicado `scripts/testar-wands-wizards-sincronia.cjs`: verifica início comum, duração/curva, amostras do início/meio/fim com cores e brasões ainda em mudança enquanto a linha está visível, quatro Casas, celular e desktop, reversões rápidas e cancelamento. `WW_PUBLIC=1` verifica os arquivos do site publicado com transporte HTTPS validado, sem gravar em contas.

### Regressão do brilho após paletas estruturais

O redesign havia mudado o padrão para seguir o dispositivo. Em aparelhos com movimento reduzido isso ocultava a linha aprovada. Restaurado o padrão magica e tratado o valor dispositivo inserido automaticamente, sem exigir ação do jogador. O seletor registra efeitoCasaEscolhido no mesmo objeto aparencia: opções explícitas permanecem após salvar e recarregar; fichas antigas com o valor automático recebem a linha na leitura, sem gravações em lote. Cores e dados existentes são preservados.

Verificado no navegador com prefers-reduced-motion ativo: ficha antiga com dispositivo automático, linha visível no celular e computador, sincronização de fundo/campo/brasão, 12 trocas, salvamento/recarga e opção explícita do dispositivo com fade curto.
