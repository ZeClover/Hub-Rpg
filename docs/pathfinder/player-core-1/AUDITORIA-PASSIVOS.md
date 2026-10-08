# Player Core 1 — passivos selecionáveis

Esta auditoria separa texto conferido de suporte real do motor. O overlay fica em `passivos-gerais-revisados.json`; seu teste mescla os dados apenas em memória e não grava em `public/`.

## Já selecionáveis

| ID | Campos mecânicos |
| --- | --- |
| `treinamento-em-pericia` | `requisitosEstruturados.atributos.int`, `repetivel`, `efeitos[treinamentos]` |
| `carregador-robusto` | `requisitosEstruturados.pericias.atletismo`, `efeitos[limite-sobrecarga]`, `efeitos[limite-carga-maxima]` |
| `duro-de-matar` | `efeitos[limite-morrendo]` |
| `vitalidade` | `efeitos[pv].porNivel`, `efeitos[cd-recuperacao]` |
| `veloz` | `efeitos[deslocamento]` |

## Podem sair de `somenteConsulta` após suporte do motor

| ID | Contrato pronto | Condição para liberar |
| --- | --- | --- |
| `iniciativa-incrivel` | `efeitos[alvo=iniciativa]` | Somar o bônus a qualquer perícia usada na iniciativa, sem alterar testes comuns. |
| `improvisacao-destreinada` | `improvisacaoDestreinadaPorNivel` | Calcular proficiência destreinada pelos três patamares sem liberar ações treinadas. |
| `recuperacao-rapida` | `requisitosEstruturados.atributos.con`, `recuperacao` | Integrar descanso, drenado e redução de estágios comuns/virulentos. |
| `epitome-da-ancestralidade` | `bonusTalentos[].nivelMaximoTalento` | Criar escolha bônus no nível de aquisição limitada a talento ancestral de nível 1. |
| `perspicacia-astuta` | `escolhasExtras[defesa-perspicacia]` | Persistir a defesa escolhida e aplicar especialista, depois mestre no nível 17. |
| `investidura-incrivel` | `requisitosEstruturados.atributos.car`, `efeitos[limite-itens-investidos]` | Calcular o limite de itens investidos. |
| `passo-aprumado` | `requisitosEstruturados.atributos.des`, `capacidades` | O fluxo de ações precisa reconhecer Passo em terreno difícil. |
| `procurar-rapido` | `requisitosEstruturados.percepcao`, `multiplicadorVelocidadeBuscaPorGraduacao` | A exploração precisa calcular o ritmo de busca por graduação. |
| `sobrevivente-lendario` | `requisitosEstruturados.pericias.sobrevivencia`, `capacidades` | A automação ambiental precisa separar dano ambiental de dano geral de frio/fogo. |

`proficiencia-em-armaduras`, `proficiencia-com-armas` e `saber-adicional` continuam pendentes porque exigem escolhas repetíveis com progressão própria. Liberá-los somente pelo texto criaria graduações ou conhecimentos incorretos.

## Verificação isolada

Execute `python docs/pathfinder/player-core-1/verificar-passivos.py`. O teste valida IDs, requisitos, contratos, progressões e a lista de pendências sem chamar `compilar.py`.
