# Wands & Wizards — estado da integração

Atualização de 9 de outubro de 2026. Ficha em `/wands-wizards.html`; biblioteca em `/wands-wizards-biblioteca.html`. A nova chave substitui Hogwarts no catálogo, preservando as fichas e campanhas do sistema anterior sem conversão de dados.

## Guias na própria página

A criação segue oito etapas independentes, como os fluxos de The Celestials, Fabula Ultima e Kaizoku. A evolução mostra somente números alterados, aprimoramentos devidos e escolhas da formação, magias e revisão; os formulários iniciais não são repetidos. Rascunhos locais reutilizam o armazenamento existente com modo e etapa, verificam a versão ao retomar e não avançam o nível duas vezes. Fechar restaura o estado anterior; guardar rascunho permite retomar. Concluir exige escolhas completas e usa o mesmo salvamento versionado.

## Ficha nativa

- Criação guiada: Casa, compra de 27 pontos, talento inicial, estilo, escola, antecedente, perícias, substituição de proficiências repetidas, pacote de estudante, capa, varinha e magias. Escolhas parciais continuam sendo rascunhos; somente escolhas completas recebem `criacaoFinalizada` no servidor.
- Progressão dos três estilos até 20; aprimoramentos de atributo ou talento exclusivos, limite 20, benefícios de escola nos níveis 1, 6, 10, 14 e 18 e pré-requisitos. Vinte e dois talentos do capítulo 7, incluindo as oito opções de 5e citadas pelo livro. Em campanha, evolução continua reservada ao mestre.
- PV, CA pela melhor fórmula, proficiência, atributos, salvaguardas, perícias, especialização, iniciativa, conjuração, cotas e espaços calculados pelo mesmo motor no navegador e no servidor. Benefícios condicionais das Casas e escolas têm descrição em português; efeitos sobre alvos e decisões de combate continuam na mesa.
- Magias concedidas por escola e características são derivadas da formação e não consomem a cota regular. Metamagias Feroz e Resistente são concedidas a Vontade no nível 3, com custos validados; Acelerada é concedida pelo benefício apropriado. Intelecto recebe os dois benefícios iniciais, somente esses, no nível 3.
- Recursos de sessão: descansos curtos/longos, dados de vida e cura determinados fora do Hub, Fonte de Magia, gastos de conjuração/metamagia, ampliação de truques quando explicitamente permitida, rituais, Deflexão, concentração/dedicação, cargas de habilidades, presságios, assinaturas e Recuperação Arcana. Nenhuma função realiza rolagens.
- Equipamentos iniciais e objetos de antecedentes entregues uma vez, sem regenerar objetos consumidos. Moedas armazenadas em nuques e apresentadas em galeões/sicles/nuques. Capas não acumulam fórmulas de armadura.
- Receitas comuns/incomuns do capítulo de poções são escolhidas por origem e raridade; Remédios concede erva-estelar. Conhecer receita não concede frascos. Nomes e controles em português, com ligação à página original; efeitos completos das poções permanecem no livro de referência.
- Animago usa os dois blocos específicos do livro, atributos mentais conservados, PV separados e duas transformações por descanso curto/longo. Conjuração fica bloqueada na forma; dedicação termina e concentração é preservada. Dano excedente passa para os PV humanos automaticamente. Animal/categoria são escolhas permanentes depois de confirmadas; Grande exige acordo com o mestre na mesa.
- Companheiro animal: bloco original informado e conferido na mesa, fera Média ou maior de desafio até 1/4. CA, PV, atributos e dados de comando acompanham nível e proficiência; adicionais de perícias/salvaguardas/comandos têm limites. Ataques, proficiências originais e características do bloco são resolvidos na mesa; não é um bestiário automático. Empatia Dracônica é descrita, mas a exceção de dragão criado desde o ovo exige o mestre e seu bloco.
- Corrupção: pontos e efeitos declarados conforme decisões do mestre, faixa/CD calculadas e limiares de aprendizagem de magias das trevas. Uma magia já aprendida permanece conhecida quando os pontos caem. Benefícios e condições são descritos; custos condicionais de magia sombria e ritual de inferi são resolvidos na mesa.

## Persistência e visual

Salvamento usa `atualizadoEmBase`, recalcula derivados no servidor e recusa conflitos. Alterações, descarte, retomada de rascunho e leitura sem permissão foram verificados em conta simulada usando o motor real. Nenhuma ficha real foi alterada nos testes.

Brasões fornecidos pelo usuário, quatro temas, linha brilhante sincronizada com as cores/brasões, personalização por personagem, varinhas determinísticas e revelação única foram preservados. Preferências de movimento continuam independentes da seleção de magias.

Grimório mantém o índice/pergaminho aprovados. Minhas Magias e Índice Completo reutilizam Exibir; quantidades, truques/magias, busca, filtros e checkboxes atualizam sem trocar o design. Todas as 144 magias principais têm efeito traduzido em português e fonte original acessível.

## Biblioteca e limites de conteúdo

- Principal v1.4: PDF original de 118 páginas, texto extraído, 144 magias nativas em português; regras de formação/progressão traduzidas na ficha. O PDF integral não foi reescrito em português.
- Headmaster’s Guide v0.2: PDF original de 48 páginas e extração preservada para consulta. Regras de narrativa, encontros e NPCs dependem da mesa; não foram convertidas integralmente em ferramentas do mestre.
- Monster Book of Monsters v0.2: PDF original de 54 páginas e extração consultável; os blocos completos não estão todos traduzidos nem convertidos em bestiário nativo.
- Spellstaff v2.0 (Carric): 58 verbetes em português e 15 concessões de maestria. Tabela e descrições divergem em progressão, espaços, nível de maestria e dados dracônicos. Suplemento permanece opcional, consultável, sem progressão inventada.
- Resources: sete diagramas locais do castelo. A edição No Discord é idêntica ao principal por SHA-256 e não foi duplicada.

Não confundir ficha nativa funcional com tradução integral de todos os livros, automação de inimigos ou resolução de combate. Não há API paga, geração de dados ou modificação de outros sistemas nesta etapa.

## Verificação

Testes de regras em `src/lib/wands-wizards`; navegador em `scripts/testar-wands-wizards*.cjs`. O teste de formação percorre a criação completa, seis escolas, gravação/recarga, equipamento sem duplicação, controles após salvar, descarte, truques ampliados, animago/companheiro, 320 px e leitura. Os testes específicos cobrem o grimório, inventário, caixa/varinhas e sincronização das Casas. Build e TypeScript executados antes da publicação.
