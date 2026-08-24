# Decisões do Hub RPG

Registro das decisões tomadas na sessão de organização inicial (24/08/2026).
Este arquivo é a fonte da verdade. Toda decisão nova entra aqui.

## 1. O que o Hub é

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Natureza | Aplicação web interativa (não é só um repositório de arquivos) |
| 2 | Plataforma | Site na web, usável no celular e no PC |
| 3 | Público | Zé (mestre) + jogadores |
| 4 | Acesso | Login com Google, aberto a qualquer conta Google |
| 5 | Custo | Zero — apenas planos gratuitos |
| 6 | Escala | Até ~10 pessoas |
| 7 | Identidade | Nome "Hub RPG", tema escuro (dark fantasy: fundo escuro, tipografia com peso, detalhes em âmbar/dourado) |

## 2. Escopo de conteúdo

| # | Decisão | Escolha |
|---|---------|---------|
| 8 | Universos | Darkrem, Ometion, sistema SAO, Thrylikí Chelóna — **e todos os futuros** |
| 9 | Universo x Sistema | **Separados.** Universo = mundo (lore, lugares, NPCs). Sistema = regras (atributos, dados, perícias). Uma campanha combina um universo + um sistema |
| 10 | Campanhas | Várias mesas em paralelo. Cada uma com seu universo, sistema, jogadores e fichas |
| 11 | Entidades cadastráveis | Personagens, NPCs, lugares, facções, itens, magias, criaturas, divindades, eventos históricos, famílias, registros de sessão |
| 12 | Dungeon do Dia | **Fora do Hub.** Continua nas skills e documentos |

## 3. Permissões e segredos

| # | Decisão | Escolha |
|---|---------|---------|
| 13 | Segredo do mestre | **Campo a campo.** Qualquer campo de qualquer ficha pode ser marcado como "só mestre" |
| 14 | Jogadores podem | Editar a própria ficha + contribuir com lore (diários de personagem, notas de sessão, teorias) |
| 15 | Criação de personagem | Assistente passo a passo, com validação das regras do sistema |

## 4. Motor de regras

| # | Decisão | Escolha |
|---|---------|---------|
| 16 | Profundidade | **Motor de regras completo.** O Hub conhece as regras: valida criação, aplica status, calcula dano, controla progressão |
| 17 | Sistemas novos | **Cada sistema é um módulo de código sob medida.** Zé recusou o modelo híbrido (arquivo de configuração) porque quer fidelidade máxima às regras de cada sistema |
| 18 | Consequência aceita | Todo sistema novo exige uma sessão de desenvolvimento. Mitigação: uma interface de módulo bem definida, para que escrever um sistema novo seja previsível e rápido |
| 19 | Primeiro sistema | **Fabula Ultima** |
| 20 | Rolagem de dados | Dentro do Hub, com log compartilhado ao vivo — mas **sem pressa**, entra numa fase posterior |

## 5. Operação

| # | Decisão | Escolha |
|---|---------|---------|
| 21 | Mesas | **Online** (Discord). O Hub precisa de estado compartilhado ao vivo no painel de sessão |
| 22 | Imagens | Upload é importante: retratos, mapas, brasões. Compressão automática por causa do plano gratuito |
| 23 | IA dentro do app | **Não.** A Claude constrói o Hub e ajuda a popular conteúdo por fora (Claude Code). O site em si não tem IA — sem chave de API, sem custo |
| 24 | Conteúdo existente | Está espalhado. Duas frentes: (a) Zé envia os arquivos e a Claude migra; (b) o Hub ganha uma tela de importação (colar texto / subir arquivo → vira ficha) |
| 25 | Ordem de construção | Cadastro base → Fichas → Wiki de lore → Painel de mesa |
| 26 | Ritmo | Fatias usáveis, uma por vez. Cada etapa vai pro ar funcionando antes da próxima começar |
| 27 | Nível técnico do Zé | Não programa, mas **quer aprender no caminho.** Código comentado em português, explicações sem jargão |

## 6. Restrições registradas

**Fabula Ultima é um sistema comercial de terceiros.** O Hub codifica as *mecânicas* (fórmulas, nomes de atributos, lógica de dados, condições de status). O Hub **não** reproduz o texto do livro — descrições de classe, texto de habilidades, ilustrações. Conteúdo descritivo no Hub é o que Zé escrever. Isso vale especialmente porque o acesso é aberto a qualquer conta Google.

**Permissão de campo é do servidor, não da tela.** Um campo marcado como "só mestre" nunca pode ser enviado ao navegador de quem não é mestre daquela campanha. Esconder na interface não é suficiente.

**Plano gratuito é uma restrição de projeto, não um detalhe.** Imagens comprimidas na subida, banco enxuto, nada que exija processo rodando 24h.
