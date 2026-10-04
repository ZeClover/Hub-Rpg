# Desempenho do Hub — 04/10/2026

Pedido: reduzir a espera ao trocar páginas e abrir fichas, preservando o
visual e as permissões. Decisão #177.

## O que mudou

- Campanhas buscam seus blocos independentes em paralelo após confirmar o
  papel de quem acessa. Manual e notas privadas continuam restritos ao mestre.
- A página geral do personagem busca também os participantes em paralelo.
- A leitura da API de personagem consulta a identidade e o personagem em
  paralelo, aplicando as mesmas permissões antes de responder.
- As 11 fichas HTML iniciam a leitura dos dados no começo do documento.
  Hogwarts também inicia a leitura dos conteúdos nesse momento. Cada ficha
  consome sua própria resposta uma vez, sem cache compartilhado de dados.
  Uma falha de rede nessa leitura permite tentar novamente ao iniciar a ficha.
- Arquivos públicos de fichas, imagens e fontes dispensam a renovação de
  sessão. Páginas e APIs continuam verificando a conta no servidor.
  O proxy usa `getClaims()`; `usuarioAtual()` mantém `getUser()`.
- As 25 artes originais foram preservadas. Há 75 miniaturas WebP locais,
  de 160, 320 e 640 pixels, escolhidas conforme o espaço e a tela.
  Links externos e imagens enviadas continuam usando sua origem.
- Miniaturas e fontes com nomes derivados do conteúdo podem ficar no cache
  por um ano. Trocar seu conteúdo cria um endereço novo.
- A galeria monta a biblioteca de imagens somente ao abrir a personalização
  e libera seus elementos ao fechar. Há um indicador leve ao abrir páginas.
- Kaizoku no Sho, seu Grimório e Escudo usam fontes locais com as licenças
  SIL Open Font License, preservando a tipografia e evitando conexões externas.

`npm run imagens` gera as miniaturas; o build também executa esse passo.
Não exige serviço pago, migração de banco ou transformação em produção.

## Comparação controlada

Cópias isoladas do código anterior e do código atualizado foram compiladas
em modo de produção. A identidade demora 120 ms e cada consulta 80 ms nesta
bancada, com os mesmos dados e papéis. A tabela mostra a mediana de cinco
requisições após aquecimento, até receber a resposta inteira.

| Fluxo | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| Campanha, mestre | 704,7 ms | 378,6 ms | 46,3% |
| Campanha, jogador | 777,9 ms | 375,9 ms | 51,7% |
| Página geral do personagem | 373,9 ms | 291,8 ms | 22,0% |
| API que abre a ficha | 207,4 ms | 127,3 ms | 38,6% |
| Galeria de personagens | 247,5 ms | 211,7 ms | 14,5% |

O HTML da galeria passou de 95.784 para 62.385 bytes nesta bancada,
uma redução de aproximadamente 35%, antes da compressão de transporte.
As 25 miniaturas de 320 pixels somam 317.340 bytes, contra 1.538.790 bytes
das artes originais: aproximadamente 79% menos dados nessa resolução.

Esses números demonstram a redução de consultas em sequência e de elementos
montados antecipadamente. Não são medições do banco de produção nem uma
garantia de latência para todos os usuários. A conexão real com o banco não
estava acessível neste ambiente; autenticação e banco foram substituídos
somente na cópia isolada usada para verificar, nunca no código publicado.

## Verificação

- Build de produção, TypeScript e lint concluídos; 324 testes aprovados.
- Navegação entre páginas preserva o documento do Hub.
- Galeria sem transbordamento em 390 e 1440 pixels; miniaturas carregam e
  enquadramento funciona. Biblioteca existe somente enquanto aberta.
- Todas as 11 fichas abrem com uma leitura de personagem iniciada antes
  de o documento estar pronto, sem erros de JavaScript.
- Edição de nome envia o novo valor no salvamento; ficha de leitura
  bloqueia alterações; falha inicial de rede permite a recuperação.
- Ficha avulsa não consulta a API de personagem; Kaizoku carrega fontes locais.
- Segredos aparecem ao mestre e ficam ausentes para jogadores. A API recusa
  fichas privadas de outro dono e acesso anônimo, mantendo os testes de `_mestre`.
- O matcher real do Next mantém páginas privadas e APIs no proxy, excluindo
  HTML estático, fontes, miniaturas, service worker e arquivos do framework.
- Os 25 arquivos de arte original foram comparados byte a byte com a versão
  anterior. Os scripts inline das fichas passaram na verificação de sintaxe.

## Continuação — vitrine e atualizações automáticas

Após o pedido para continuar, a decisão #178 acrescenta três ajustes:

- A vitrine monta imagens somente na seleção e nas duas capas vizinhas de
  cada lado: cinco imagens em vez de oito. O tamanho indicado ao navegador
  corresponde aos 174 pixels no celular e 210 no computador. Setas, teclado,
  gesto lateral e a apresentação em perspectiva permanecem disponíveis.
- Atalhos do painel e dos cards para páginas do aplicativo, incluindo
  Campanha Livre, usam a navegação do Next sem recarregar o documento.
  Fichas HTML continuam usando os links nativos apropriados a esses arquivos.
- Notificações, chat, vida e iniciativa do espectador consultam somente com
  a aba visível, atualizam ao voltar e esperam a leitura terminar antes de
  agendar outra. Ao sair da tela ou ocultar a aba, a leitura pendente é
  cancelada. Falhas temporárias permitem tentar novamente; nada é escrito
  por esse mecanismo e não há cache de dados compartilhado entre usuários.

Na mesma bancada e em contextos novos de navegador, a soma dos arquivos
usados pelas capas carregadas da vitrine na primeira abertura caiu assim:

| Tela | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| 1440 pixels, densidade 1 | 285.444 bytes | 189.544 bytes | 33,6% |
| 390 pixels, densidade 2 | 514.946 bytes | 265.106 bytes | 48,5% |

Essa tabela mede imagens da vitrine, não o tráfego total da página, tempo de
renderização ou todos os aparelhos. O navegador pode reaproveitar uma versão
maior já carregada no catálogo para evitar outra transferência.

Os quatro componentes passaram na checagem com relógio controlado: uma
leitura inicial, nenhuma leitura durante 60 segundos com a aba oculta,
atualização imediata ao voltar e nova leitura no intervalo normal.
Três testes automatizados cobrem conexão lenta sem pedidos sobrepostos,
ocultar/mostrar durante uma leitura pendente, cancelamento e recuperação
de falha de rede. A suíte completa passou com 327 testes; lint, TypeScript
e build de produção concluíram. Os atalhos e todas as capas também foram
verificados no navegador, incluindo teclado e gesto lateral.
