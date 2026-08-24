# Roadmap do Hub RPG

Ritmo acordado (decisão #26): **fatias usáveis, uma por vez.** Cada fatia vai
pro ar funcionando e você usa de verdade antes da próxima começar.

Ordem de construção (decisão #25): cadastro base → fichas → wiki → painel de
mesa. A fatia 1 abre com o login porque você pediu que a primeira coisa no ar
fosse os jogadores conseguindo entrar (decisão da rodada 6).

---

## Fatia 0 — Preparação de contas

**Não é código. É o que só você pode fazer.**

- [x] Criar conta na Vercel e ligar no repositório — projeto `zezin2/hub-rpg`
- [ ] Criar conta no Supabase e um projeto novo
- [ ] Criar as credenciais de login Google no Google Cloud Console
- [ ] Me passar as chaves (elas vão para o cofre de variáveis da Vercel,
      nunca para dentro do código)

Eu te guio passo a passo em cada um, com print do que clicar.

---

## Fatia 1 — Fundação e porta de entrada

**Objetivo: seus jogadores logam e encontram conteúdo.**

- Login com Google funcionando
- Criar e editar universos (Darkrem primeiro)
- Criar campanhas ligando um universo a um sistema
- Convidar jogadores para uma campanha
- Cadastro base: criar, editar, listar e buscar entidades de qualquer tipo
  (NPC, lugar, facção, item, magia, criatura, divindade, evento, família)
- Campos secretos campo a campo, com a trava no servidor
- Upload de imagem com compressão automática
- Tema escuro, funcionando bem no celular

**No fim desta fatia você consegue:** entrar no Hub, cadastrar Darkrem, criar
uma mesa, chamar seus jogadores, cadastrar cidades e NPCs com segredos de
mestre, e achar tudo pela busca.

---

## Fatia 2 — Fichas e o motor de Fabula Ultima

**Objetivo: ficha de verdade, com as regras funcionando.**

- A "interface de sistema" (as sete perguntas do documento de arquitetura)
- Módulo completo de Fabula Ultima
- Assistente de criação de personagem passo a passo, com validação
- Ficha renderizada, editável pelo jogador, com derivados calculados na hora
- Condições e status alterando os números automaticamente
- Progressão: XP, nível, o que muda ao subir

**No fim desta fatia você consegue:** rodar uma mesa de Fabula Ultima inteira
com as fichas no Hub.

---

## Fatia 3 — Wiki de lore

**Objetivo: parar de perder informação do mundo.**

- Vínculos entre entidades ("mora em", "membro de", "inimigo de")
- Navegação de wiki: clicar num nome e cair na ficha dele
- Linha do tempo de eventos históricos
- Mapas com pontos clicáveis levando para a ficha do lugar
- Importador: colar texto ou subir arquivo e virar ficha
- Diários de personagem e notas de sessão escritos pelos jogadores

**No fim desta fatia você consegue:** trazer todo o conteúdo espalhado para
dentro do Hub e navegar pelo mundo.

---

## Fatia 4 — Painel de mesa ao vivo

**Objetivo: rodar a sessão online pelo Hub.**

- Estado compartilhado em tempo real (você muda, todos veem na hora)
- Ordem de iniciativa
- HP e status dos inimigos, controlados pelo mestre
- Rolagem de dados dentro do Hub, aplicando modificadores e status
- Log de rolagens visível para a mesa
- Registro da sessão no fim

**No fim desta fatia:** o Hub é a mesa. O Discord vira só a voz.

---

## Depois (sem data)

- Módulos dos outros sistemas: SAO homebrew, Thrylikí Chelóna, Ometion
- Tradução de ficha entre sistemas dentro do Hub
- Tabelas aleatórias e geradores rolando no próprio Hub
- Vitrine pública dos universos

---

## O que NÃO entra

Registrado para não voltar à discussão sem decisão nova:

- **IA dentro do app** (decisão #23) — a Claude constrói e ajuda por fora
- **Dungeon do Dia** (decisão #12) — continua nas skills e documentos
- **Qualquer coisa paga** (decisão #5) — plano gratuito é restrição de projeto
