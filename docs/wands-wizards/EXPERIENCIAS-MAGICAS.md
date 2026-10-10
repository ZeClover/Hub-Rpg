# Experiências mágicas e diversidade visual

O grimório apresenta as magias conhecidas, busca, páginas e os efeitos em português; os controles de seleção existentes continuam disponíveis. Foram traduzidos os efeitos das 144 magias do catálogo principal, mantendo o original para consulta e os dados mecânicos existentes. Isso não representa tradução integral de todos os livros. A biblioteca reúne também as 58 entradas de Spellstaff já traduzidas.

O malão usa o campo opcional `inventario` na mesma ficha, com registros manuais, busca, categorias, quantidades e inspeção. Poções têm aparência determinística. Consumir exige confirmação e salvamento bem-sucedido; falhas e conflitos preservam quantidades. Cliques repetidos são bloqueados durante o envio. Nenhum efeito mecânico é aplicado automaticamente pela animação.

Sapos de Chocolate registram quantidades e uma coleção cosmética de quatro fundadores de Hogwarts. A distribuição é determinística, sem rolagem de dados. `colecaoFigurinhas` acompanha a ficha existente. Os cartões usam brasões das Casas, não retratos históricos; a coleção é limitada aos fundadores, sem personagens posteriores a 1890.

A pena aparece ao confirmar nome ou Casa, e a cerimônia de evolução só ocorre após confirmação do salvamento de um nível maior. As animações são breves, podem ser puladas quando aplicável e respeitam movimento reduzido.

A seção Varinha mantém o renderizador e adiciona paletas, veios e perfis distintos para as doze madeiras solicitadas. Pau-brasil, pau-roxo e bétula são opções visuais adicionais explicitamente artísticas. Acabamentos natural, polido, escurecido, envelhecido e encantado são cosméticos e persistem no campo existente `varinhaVisual`. A escolha manual de cabo continua prevalecendo. A mesma configuração produz a mesma aparência.

Os testes de navegador verificam salvamento, recarga, rascunho, descarte, falhas, seleção, movimento reduzido e telas de 320 a 1280 px. Usam contas simuladas com o motor real de regras. As capturas estão em `artifacts/wands-wizards/experiencias`, `diversidade` e `revelacao`. Nenhuma API paga, rolagem de dados ou biblioteca 3D foi adicionada.

A cor de tinta é definida também no próprio cartão `pagina-feitico`, garantindo texto escuro sobre o pergaminho na consulta rápida fora do grimório. O teste verifica contraste mínimo de 4,5:1 para títulos, efeitos, metadados e fonte original nos quatro temas.

Os cartões de planejamento de magias usam um único fundo de pergaminho no estado fechado e aberto, com título, checkbox e botão de detalhes em tinta escura. O efeito expandido não cria outro bloco de cor dentro do cartão. A alteração está limitada a `#lista-magias`.
