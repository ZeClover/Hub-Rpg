# Hub RPG

Aplicação web para organizar os universos e mesas de RPG do Zé — Darkrem,
Ometion, Thrylikí Chelóna, o sistema homebrew de SAO, e os que vierem.

Um lugar só para: o lore dos mundos, as fichas dos personagens, as mesas em
andamento e o que acontece durante a sessão.

## Estado

**Em planejamento.** Nada construído ainda. As decisões estão fechadas e
documentadas; a fatia 1 é a próxima.

## Ideia central

O Hub separa **universo** (o mundo: lugares, NPCs, facções, história) de
**sistema** (as regras: atributos, dados, perícias). Uma **campanha** combina
os dois. Assim, Darkrem pode rodar em Fabula Ultima numa mesa e no sistema de
SAO em outra, aproveitando exatamente o mesmo lore.

Mestre e jogadores usam o mesmo Hub: qualquer campo de qualquer ficha pode ser
marcado como "só mestre", e o servidor garante que ele nunca chegue no
navegador de um jogador.

## Documentação

| Documento | O que tem dentro |
|-----------|------------------|
| [docs/DECISOES.md](docs/DECISOES.md) | Todas as decisões tomadas, numeradas. Fonte da verdade |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Como o Hub é montado por dentro, explicado sem jargão |
| [docs/ROADMAP.md](docs/ROADMAP.md) | As fatias de construção, em ordem |

## Como vai ser feito

Next.js na Vercel, Supabase para banco de dados, imagens e tempo real, login
com Google. Tudo em plano gratuito.

## Conteúdo de terceiros

Fabula Ultima é um sistema comercial. Este projeto codifica mecânicas
(fórmulas, atributos, lógica de dados) e não reproduz texto, arte ou
descrições do livro.
