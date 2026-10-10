# Acervo Mágico — cinco coleções da ficha

Aba Colecionáveis, exclusiva da ficha Wands & Wizards com personagem válido. Não existe acesso pelo menu principal do Hub. A demonstração sem personagem e links públicos sem autorização não abrem coleções privadas.

## Experiências

1. Sapos de Chocolate — álbum com páginas de pergaminho, figurinhas e retratos encantados quando disponíveis.
2. Criaturas Mágicas — vitrines, vidro e bases para miniaturas.
3. Biblioteca de Raridades — estante de madeira e capas de livros/manuscritos.
4. Recordações do Mundo Bruxo — álbum de recordações, postais e molduras de papel.
5. Gabinete de Curiosidades — compartimentos escuros para artefatos.

A entrada apresenta cinco grandes cartões em uma grade responsiva, com cenas originais: caixa de chocolates e cartas, vitrine de miniaturas, biblioteca antiga, álbum de recordações e armário de artefatos. A moldura, os cartões e a iluminação estrutural usam a paleta da Casa. Cada coleção tem seu suporte visual, pesquisa, filtro, inspeção e retorno à entrada. Estados vazios têm mensagens temáticas; nenhum catálogo fictício é criado. Os contadores e barras só aparecem quando há objetos reais na categoria. Coleções vazias exibem um ambiente ilustrado e convite à descoberta; pesquisa e filtros surgem quando aplicáveis. O seletor de coleção e o retorno à galeria mantêm a navegação compacta. Abrir uma coleção posiciona seu título na tela; voltar recupera o cartão escolhido, inclusive após a galeria longa no celular. As cenas são artes vetoriais locais, decorativas, em `public/wands-wizards/experiencias/colecoes/cenas`, e não itens fictícios do catálogo; as imagens dos objetos reais serão fornecidas pelo Mestre no cadastro.

Animações breves de entrada em álbum, revelação de vitrine, livro ou postal e brilho de nova aquisição respeitam movimento reduzido. Nenhum efeito é contínuo. A identidade da Casa vem das variáveis já existentes na ficha.

## Administração integrada

Mestres e auxiliares podem expandir “Mestre · administrar este acervo” dentro da própria aba. A administração é carregada sob a mesma autenticação e exige personagem Wands & Wizards válido e campanha autorizada no servidor. O catálogo também continua disponível na administração da campanha. Nenhuma entrada é adicionada à navegação principal.

Cadastro e edição: nome, categoria, descrição, imagem, raridade, versão/edição, origem já revelada, informações secretas, localização narrativa, visibilidade anterior à descoberta, repetição e retrato encantado para Sapos de Chocolate. Cadastrar não concede itens. Para novos itens, repetição é desativada e visibilidade padrão é silhueta.

Concessão e retirada indicam personagem, objeto e exemplares. Transações gravam a operação auditável e o saldo juntos, com locks do objeto e personagem. UUID da tentativa é reutilizado após falha de rede; operação repetida não duplica nem retira exemplares novamente. O tipo de operação participa da comparação. Não existe saldo negativo; ao retirar o último exemplar, a aquisição é removida e o objeto retorna ao estado de visibilidade configurado.

O jogador vê somente sua coleção. Mestres/auxiliares consultam personagens de suas campanhas. O servidor verifica todos os acessos e rejeita operações feitas por jogadores. Personagens de outros sistemas não recebem concessões. Aquisições e histórico permanecem ligados à campanha original se o personagem mudar de campanha; retirada de aquisição histórica continua possível para o Mestre autorizado.

## Segredos e atualização

Objetos desconhecidos em silhueta contêm somente ID, categoria, quantidade zero e estado bloqueado. Objetos ocultos não são enviados nem entram na contagem pública até a descoberta. Após adquirir, são enviados os campos públicos (nome, imagem, descrição, raridade, edição e origem revelada). Localização narrativa e informações secretas nunca entram na resposta do jogador.

A atualização ocorre ao entrar na aba, reativar a página, clicar Atualizar acervo, receber confirmação da administração integrada e a cada 60 segundos enquanto a aba estiver visível. Mensagens da administração exigem origem, janela e campanha correspondentes. Não há chamadas quando a aba está oculta. Respostas privadas usam `private, no-store`.

## Persistência e migração

Catálogo, acervo de cada personagem e log das operações são separados. A migração 0032 amplia a estrutura existente, sem criar objetos ou modificar fichas/inventário. Páginas Perdidas passam à Biblioteca de Raridades; antigas Relíquias passam ao Gabinete de Curiosidades. IDs, aquisições e quantidades são preservados. RLS e bloqueio de acesso direto para papéis públicos Supabase são mantidos.

O build de publicação aplica 0031 e 0032 transacionalmente com a conexão já existente do projeto. A migração é repetível. Testes de banco rodam em PostgreSQL local via PGlite; testes de interface usam dados de teste, sem alterar personagens reais.

## Verificação

- `node --test --experimental-strip-types src/lib/colecionaveis/regras.test.ts`
- `node scripts/testar-gabinete-api.cjs` — handlers reais com sessão/banco isolados e página administrativa protegida.
- `node scripts/testar-acervo-banco.cjs` — migração, preservação, constraints, RLS, rollback, retirada e reabertura do armazenamento.
- `node scripts/testar-acervo-browser.cjs` — cinco experiências, início vazio, fluxo da ficha, inspeção, filtros, novas descobertas, recarga, administração integrada, quatro Casas, movimento reduzido e celular.
- `node scripts/testar-gabinete-mestre.cjs` — componente real, cadastro/edição, metadata, ocultação, concessão/retirada e tentativa de rede.

Capturas em `artifacts/wands-wizards/acervo`.
