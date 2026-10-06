# Player Core 1 — cobertura e revisão

Fonte: PDF em português fornecido pelo usuário, 470 páginas. Página impressa = página do PDF − 1. Originais ficam fora da pasta pública. A indexação por cabeçalho oferece referência à página inteira; não mistura corpos de outras colunas nem inventa pré-requisitos.

Catálogo atual: 8 classes com 20 níveis cada; 8 ancestralidades; 45 heranças; 40 biografias; 884 talentos (84 revisados individualmente); 491 magias (130 revisadas individualmente); 59 equipamentos iniciais revisados (13 defesas/armaduras, 42 armas e 4 escudos); 20 divindades e 37 domínios com seus focos iniciais revisados. Todas as 470 páginas têm seção nativa de consulta. Isso não significa que o conteúdo inteiro tenha sido revisado ou automatizado.

Entradas individuais pendentes usam `somenteConsulta:true`. Seus textos identificam a página nativa, sem pré-requisitos ou efeitos extraídos de forma frágil. Não podem ocupar escolhas da ficha. Cada classe tem pelo menos três opções de talento de nível 2 revisadas, com restrições de musa, doutrina ou capacidade quando aplicável. As entradas revisadas contêm texto de regra e resumo separado, sem corte arbitrário no meio do corpo.

## Automação com dados estruturados

Todas as classes têm PV por nível, atributos-chave, treinamentos e proficiências iniciais. Os registros de progresso fornecem mudanças de graduação, escolhas de talentos, incrementos de atributos/perícias e espaços de magia. Clérigo separa progressão por doutrina; Rufião adiciona armadura média; Guerreiro mantém graduação do grupo escolhido separada da graduação universal. Especialização de armas usa graduação de proficiência, com patamares 7/15 para marciais e 13 para conjuradores. Mago e Bruxo separam os 10 truques conhecidos dos truques preparados diariamente, recebem cinco magias iniciais à escolha e aprendem duas por nível; os extras de patrono, currículo ou teoria unificada são adicionais. Cada uma das seis escolas de currículo tem listas canônicas de truques e ranques 1–9; seu início oferece pelo menos um truque e duas magias de 1º ranque revisadas. Teoria Mágica Unificada recebe talento extra de nível 1 e não recebe benefícios de currículo. As listas de ranques superiores não tornam seus itens pendentes selecionáveis.

Humano Perito identifica a perícia escolhida e progride para especialista no nível 5. Ambição Natural e Treinamento Geral concedem escolhas adicionais com origem; Perícia Natural fornece treinamentos adicionais. Talentos de perícia revisados possuem requisitos graduados. Vitalidade adiciona PV por nível; Elfo Ligeiro e Veloz têm bônus de Velocidade. Os equipamentos fornecem campos de armadura/arma/escudo consumíveis pelo motor; consultar ou selecionar referência não duplica o inventário do Hub.

Guerreiro, Druida e Clérigo Capelão da Guerra recebem Bloqueio com Escudo automaticamente, sem gastar uma escolha de talento. Sua reação exige escudo erguido e dano físico de um ataque; a Dureza reduz o dano e tanto personagem quanto escudo sofrem todo o restante. A entrada preserva essas restrições e a fonte impressa 252/PDF253. Divindades identificam arma favorecida, perícia, atributo, fonte divina e acesso às magias concedidas; o acesso não equivale a uma magia preparada automaticamente.

## Verificação executada

`node docs/pathfinder/player-core-1/verificar-iniciais.cjs` usa o catálogo real e o motor compartilhado. Verifica criação de Guerreiro nível 1, evolução para 2 com escolhas corretas, preservação da ficha original, ganho automático de PV, criação de Bardo nível 1, unicidade de IDs, 470 páginas e rejeição de magias de consulta na criação. Esta verificação não equivale a revisão integral de todas as combinações de regras, nem substitui o teste do navegador.

## Pendências reais

- Revisão individual dos demais 800 talentos e 361 magias, incluindo opções de evolução de classes que ainda não têm talentos revisados no nível correspondente.
- Talentos/magias gratuitos iniciais de musas, patronos, ordens e escolas possuem relações estruturadas nos overlays revisados. As cinco teses são escolhas obrigatórias, com concessões iniciais e parâmetros de suas operações separados. Benefícios de domínios dependem do overlay de divindades/domínios. Algumas heranças e poderes condicionais ainda precisam de metadados adicionais.
- Benefícios avançados de domínios, revisão individual dos demais itens dos currículos, escolhas de Saber, companheiros e familiares, capacidades condicionais e efeitos situacionais. Nenhuma inferência pelo nome deve substituir dados mecânicos explícitos.
- Mais equipamentos do livro e suplementos; os 59 itens revisados não representam todo o catálogo do sistema.
- Revisão de ordem de leitura/tabelas das páginas nativas: são extraídas integralmente, sem alegação de revisão tipográfica ou tradução adicional.

## Reprodução

`python docs/pathfinder/player-core-1/compilar.py` reconstrói o catálogo a partir do PDF e das revisões manuais incluídas no próprio arquivo. O compiler grava uma única versão final por substituição atômica, evitando que a aplicação leia um estado intermediário. Exige PyMuPDF e o PDF em `/workspace/attachments/*/`.
