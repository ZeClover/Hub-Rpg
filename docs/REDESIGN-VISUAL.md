# Hub RPG — biblioteca visual e vitrine de sistemas

Implementação de 04/10/2026, baseada na comparação com <https://erpg.app/systems/> e nas preferências do Zé: mais imagens, personagens resumidos, elementos prontos, personalização e seletor lateral inspirado em emuladores.

## O que veio da análise

| Observação | Aplicação no Hub |
|---|---|
| O catálogo do eRPG é reconhecível pelas capas e pela organização em cards. | Capas, símbolos, tema, disponibilidade, favoritos e busca para os oito sistemas. |
| Recursos devem aparecer perto do sistema escolhido. | Página de cada sistema com os recursos existentes e criação de personagem, NPC e campanha com o sistema selecionado. |
| Imagens precisam ajudar a encontrar a ficha. | Retratos e banners nos personagens, painel, companheiros, campanhas e Mesa ao Vivo. |
| Resumos precisam caber numa leitura rápida. | Adaptadores de apresentação por sistema, sem calcular regras novas nem mostrar campos privados. |
| Gestão ocupava o espaço da coleção. | Abrir ficha e gerenciar em destaque; imagem, status, mover/copiar, exportar e excluir dentro de “Ações do personagem”. |
| O seletor de emulador dá identidade à escolha. | Vitrine circular: capa central, vizinhas em perspectiva, giro curto do símbolo, setas, teclado, toque e indicadores. A galeria continua abaixo. |
| Celular precisa de navegação própria. | Barra inferior com Painel, Personagens, Campanhas, Sistemas e Mais. Navegação lateral no computador. |

O fundo escuro quente, o âmbar e as fontes do Hub foram preservados. A comparação guiou a hierarquia, os recursos visuais e a organização; o Hub mantém seus próprios fluxos de campanha e fichas.

## Entrega por área

- **Sistemas:** vitrine, catálogo em galeria/lista, busca por nome/tema, favoritos e detalhes com recursos reais.
- **Personagens:** retrato, banner, classe/identidade, progressão e vida quando existem; busca sem acentos; filtros por sistema, campanha e status; categorias para personagens e NPCs/monstros; galeria/lista; criação acessível pelo botão principal. No celular, a busca fica visível e filtros/ordenação podem ser expandidos, para dar espaço aos retratos.
- **Imagens:** biblioteca pronta, arquivo do aparelho ou link; prévia; enquadramento superior/central/inferior; remoção e imagem de reserva quando o link falha.
- **Painel:** próxima sessão, acesso à mesa, personagens recentes e campanhas com imagens, atalhos para as bibliotecas.
- **Campanhas:** capas, descrição, temas, sistema, papel, quantidade de participantes/personagens e próxima sessão; busca e filtros. Elenco visual do mestre e coleção dos próprios personagens para jogadores; abas acessíveis por teclado.
- **Durante o jogo:** retratos no painel de vida, mantendo controles e dados de combate existentes.
- **Áreas relacionadas:** retratos de companheiros, inventários mais legíveis, exportação de card com imagem padrão/enquadramento, entrada pública e histórico de atualizações.

## Imagens e fontes

Há **25 imagens locais**, aproximadamente **2,9 MB** no total:

- Oito banners temáticos de domínio público, incluindo obras de acervos e imagens da NASA. The Celestials e Thrylikí Chelóna usam estes temas abrangentes, conforme pedido.
- Doze retratos: oito de domínio público e quatro de David Revoy/Pepper&Carrot sob **CC BY 4.0**, com autor, fonte e licença.
- Cinco capas/imagens de identificação: Fabula Ultima, D&D, Kaizoku no Sho, SAO e Hogwarts. Fabula, D&D e Kaizoku usam capas dos livros; SAO usa a capa de Aincrad e Hogwarts usa a arte oficial de Hogwarts Legacy para identificar as franquias, sem apresentá-las como livros oficiais dos sistemas caseiros.

O catálogo de fontes está em `src/lib/creditos-imagens.json` e é apresentado em `/creditos`. As capas de terceiros têm seus direitos identificados e ficam no catálogo; a biblioteca de imagens reutilizáveis contém as obras com licença aberta/domínio público. Recortes e conversões para WebP são indicados nos créditos. Nenhuma imagem depende de hotlink para aparecer.

## Persistência e compatibilidade

O envio do aparelho funciona nos campos já existentes (`avatarUrl`, `bannerUrl`, `capaUrl`). O navegador redimensiona JPG/PNG/WebP e comprime para WebP antes de salvar. Retratos têm até 720 px; banners, até 1280 px; a imagem final tem até cerca de 165 KB e a entrada original tem limite de 10 MB. O enquadramento é salvo junto do valor.

A implementação usa uma imagem embutida nesses campos, sem criar bucket, tabela, migração ou serviço pago. Isso conclui o envio de arquivo sem depender de configurar Supabase Storage; o espaço utilizado conta no banco existente. Imagens antigas continuam sendo usadas. Dados inválidos são recusados pela API somente quando os campos de imagem são alterados.

Resumos são extraídos no servidor a partir dos formatos atuais. Ausência de nível, classe ou vida não gera valores fictícios. `_mestre`, notas e demais dados não selecionados para apresentação ficam fora dos resumos. O elenco enviado para equipes também filtra nomes de NPCs que o jogador não pode ver.

As regras e fichas HTML de cada sistema permanecem nos módulos existentes. As APIs mantêm autenticação e autorização. O service worker é registrado em produção; no desenvolvimento isso evita guardar versões antigas dos componentes. O aviso de conexão respeita o espaço da barra inferior no celular.

## Verificação

- TypeScript e ESLint sem erros; **324 testes aprovados**; build de produção concluído.
- Testes novos de resumos dos oito formatos, dados antigos/ausentes, vida zero, proteção de campos privados e validação de imagens.
- Navegador com dados de teste: vitrine por setas/teclado/gesto, criação contextual, busca/filtros, galeria/lista, escolha de retrato, enquadramento, arquivo comprimido persistido pela API e imagem externa quebrada.
- Campanhas e Mesa ao Vivo para mestre/jogador, bloqueio de edição alheia, ausência de inimigos/segredos na resposta do jogador e redirecionamento/API sem autenticação.
- Onze páginas em 320, 390, 768 e 1440 px sem ultrapassar a largura da tela, além do menu inferior. Gesto nativo de toque, redução de movimento, aviso de conexão acima da navegação e exportação PNG com enquadramento também verificados. Nenhum erro JavaScript nas telas verificadas.

O banco real não aceitou conexão neste ambiente. A verificação visual e dos fluxos de API foi feita numa cópia isolada com dados de teste e projeção dos campos consultados; autenticação e banco do aplicativo original não foram substituídos. A integração com dados reais continua dependendo desse acesso. Depois da verificação, o Zé autorizou a publicação em 04/10/2026. A entrega usa a integração existente do repositório com a Vercel, pela branch `claude/hub-rpg-organization-x1tbpd`, no endereço `https://hub-rpg-eight.vercel.app`.
