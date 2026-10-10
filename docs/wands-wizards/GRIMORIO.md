# Grimório de Feitiços — Wands & Wizards

O grimório tem um índice compacto e uma única página de consulta, substituindo a grade de efeitos expansíveis e o livro duplicado. A consulta não modifica as magias conhecidas. Os checkboxes usam os mesmos dados, cotas e regras de salvamento existentes.

No computador, índice e página têm rolagens independentes. Até 860px, a página abre em um diálogo nativo com botão Voltar, Escape, foco contido/restaurado e preservação da posição do índice. Busca e filtros de nível, escola, categoria e conhecimento não apagam a página consultada; uma indicação permite reencontrar o feitiço fora dos filtros.

Os 144 feitiços do livro principal conservam integralmente os parágrafos em português e o texto original. A página inclui metadados, livro, página e acesso à fonte. Feitiços de círculos futuros e restritos continuam consultáveis, mas a seleção respeita as permissões existentes. A biblioteca Spellstaff permanece separada.

O papel usa tinta escura, filetes, sombras, bordas irregulares, ornamentação e uma textura compartilhada WebP de 28.422 bytes. A cor de Casa afeta o índice e a moldura, sem recolorir a página. A transição de páginas dura 340–380ms e respeita a preferência por movimento reduzido. A transformação luminosa das Casas foi preservada.

## Validação

- `node scripts/testar-wands-wizards-grimorio.cjs`: integridade dos 144 textos/fontes; dimensões estáveis; filtros e estado vazio; consultar sem aprender; seleção/save/reabertura/descarte; filtro de disponibilidade depois de salvar; telas 320–1280px; texto longo; diálogo, teclado, foco e posição; movimento reduzido.
- `node scripts/testar-wands-wizards-experiencias.cjs`: contraste nos quatro temas personalizados; magia salva; inventário, consumo, conflitos, celebração, leitura e celular.
- `node scripts/testar-wands-wizards.cjs`: criação, evolução, cálculos, tema persistente, conflito e permissões.
- `node scripts/testar-wands-wizards-paletas.cjs`: cinco identidades, contraste, ausência de alteração da madeira e dados, capturas desktop/celular.
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/ww-browser-tools node scripts/testar-wands-wizards-sincronia.cjs`: linha, cores e brasões começam no mesmo quadro e continuam mudando juntos.
- 11 testes do motor de ficha, ESLint dos arquivos alterados e build Next.

As verificações de salvamento no navegador usam uma conta simulada com o motor real de validação e proteção de versão; nenhuma ficha de usuário é alterada pelos testes. `WW_PUBLIC=1` executa o mesmo teste de grimório usando os assets públicos publicados, mantendo a conta simulada.

Capturas: `artifacts/wands-wizards/grimorio/desktop.png`, `celular.png` e versões anteriores `antes-1280.png`, `antes-390.png`.

## Publicação verificada

Publicado em `https://hub-rpg-eight.vercel.app` em 09/10/2026, deployment `hub-ghj6vcghf-zezin2.vercel.app` (`dpl_BSG2CWXpj6hdHYMaTtS55rySDHXT`). Os seis assets alterados foram conferidos por SHA-256 contra os arquivos locais. O teste completo do grimório passou novamente com `WW_PUBLIC=1`, incluindo retomada de rascunho e consulta por teclado em ficha somente para leitura. As capturas finais desktop/celular usam os assets desta publicação.

## Atalhos de magias conhecidas

`Minhas Magias (N)` e `Índice Completo` ficam acima da lista e acionam o mesmo seletor `Exibir`, sem manter um segundo estado de filtro. A contagem inclui os truques e as magias conhecidas presentes no catálogo, independentemente da pesquisa ou dos demais filtros. A visão de conhecidas separa `Truques` e `Magias Regulares`, indicando o círculo de cada magia regular. Aprender/remover atualiza a contagem e os resultados; nenhuma consulta modifica os dados. Pesquisa e outros filtros permanecem ativos quando um atalho é usado. O estilo existente da página e do índice foi preservado, acrescentando apenas a linha de botões.

O teste do grimório verifica ambos os atalhos, sincronização nos dois sentidos com `Exibir`, contagem, grupos, remoção automática, preservação da pesquisa e da página, salvamento e telas de celular.

Atalhos publicados em 09/10/2026 no mesmo endereço do Hub, deployment `hub-fp7qqcrma-zezin2.vercel.app` (`dpl_7HRqiuaR1Bpq18CN2BFTjmu3M88b`). SHA-256 de JS/CSS conferidos. Teste `WW_PUBLIC=1` passou incluindo os atalhos. A automação aguarda a restauração de foco do evento nativo `close` antes de editar a busca seguinte no celular. Captura: `artifacts/wands-wizards/grimorio/indice-celular.png`.
