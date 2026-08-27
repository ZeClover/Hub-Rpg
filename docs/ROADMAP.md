# Roadmap do Hub RPG

Reescrito em 27/08/2026 pela virada de escopo (decisões #35 a #41). O Hub é
sobre **fichas de personagem** nos sistemas do Zé.

Ritmo (decisão #26): uma etapa usável por vez.

---

## Pronto

- [x] Contas: Vercel, banco Supabase em São Paulo, login com Google
- [x] Tabelas trancadas contra acesso vindo de fora do servidor
- [x] Entrar no Hub com a conta Google
- [x] Catálogo de fichas em /fichas
- [x] Cadastro de lore removido do código e do banco (decisão #36)
- [x] **Kaizoku no Sho** — ficha completa, acessível pelo Hub
- [x] **Fabula Ultima** — chassi: atributos, classes, condições e derivados

---

## Etapa atual — Fabula Ultima completa

Fonte: os PDFs da biblioteca do Zé (Livro Básico + todos os Atlas).

**Limite técnico encontrado e contornado (27-28/08/2026):** a ferramenta de
leitura do Google Drive só extrai o começo de um PDF grande — parou na
página 193 de 360 do Livro Básico, e baixar o arquivo puro não dava (limite
de 10 MB, livro com 37 MB). O Zé recortou o PDF nas páginas com as 11
classes restantes e mandou como anexo, o que permitiu ler o livro inteiro
por página com `pdftotext` local (sem limite de tamanho). Esse caminho —
recorte por capítulo, mandado como anexo no chat — se confirmou também para
os três Atlas: High Fantasy, Techno Fantasy e Natural Fantasy vieram cada um
num PDF recortado e foram lidos inteiros.

- [x] Poderes das 15 classes do Livro Básico — **completo.** Todas com os
      cinco poderes conferidos linha a linha no livro, contador de NP e
      benefícios iniciais automáticos. Entropista, Espiritualista e
      Elementalista com catálogo de feitiços; Quimerista com aviso de que os
      dele vêm de observar criaturas em jogo, sem catálogo fixo
- [x] **Atlas High Fantasy** — Comandante, Dançarino, Simbolista e Virtuoso
      completos (poderes, benefícios iniciais, catálogos de Dança e Símbolos)
- [x] **Atlas Techno Fantasy** — Esper, Mutante e Piloto completos (poderes,
      benefícios, catálogos de Dons Psíquicos e Teriomorfose). Veículo
      Pessoal do Piloto descrito no texto do poder, sem painel próprio
      (ver "Fora de escopo por agora" abaixo)
- [x] **Atlas Natural Fantasy** — **completo.** Floralista, Gourmet, Invocador
      e Mercador (poderes, benefícios, catálogo de Magissementes, bloco de
      referência de Mananciais e Invocações). Mercador entrou depois, com um
      segundo recorte de página 158-159
- [x] ~~Herdeiros da Supernova~~ — **não é um Atlas de classes.** É uma
      campanha pronta (10 aventuras, 30 monstros novos, vilã, mascote, fichas
      de local) para o mestre narrar — sem nenhuma classe, poder ou mecânica
      de personagem nova. Livro inteiro lido (16 partes, via anexo + pdftotext)
      e conferido: zero conteúdo de ficha. Fica de fora por ser conteúdo de
      mestre/aventura, igual à decisão #36 de não guardar lore no Hub
- [ ] Feitiços e rituais, com as seis disciplinas
- [ ] Equipamento: armas, armaduras, escudos, acessórios, e o efeito nos números
- [ ] Combate: dano, tipos de dano, afinidades elementais
- [ ] Poderes Heroicos

Todas as classes de Fabula Ultima estão prontas: as 15 do Livro Básico e as
10 dos três Atlas (High Fantasy, Techno Fantasy, Natural Fantasy) — 25 no
total. Não existe uma 26ª classe faltando: Herdeiros da Supernova não traz
nenhuma.

### Fora de escopo por agora (mecânicas grandes demais para entrar de raspão)

Três poderes descrevem sistemas do tamanho de uma aba inteira — foram
codificados como texto fiel ao livro, mas sem painel interativo próprio,
para não misturar um "Inventário"/"Equipamento" inteiro dentro da aba
Poderes:

- **Engenhocas do Inventor** (Alquimia, Infusões, Tecnomagia)
- **Veículo Pessoal do Piloto** (estrutura e módulos)
- **Culinária do Gourmet** (tabela de combinação de sabores)

Ficam para quando a ficha ganhar uma aba de equipamento/inventário.

---

## Depois

### Fichas ligadas ao Hub
Tirar os personagens do navegador e colocar na conta: acessíveis de qualquer
aparelho, e compartilhados com a mesa. Vale para todas as fichas de uma vez.

- [ ] Salvar e carregar personagem pela conta
- [ ] Importar os personagens que já estão no navegador
- [ ] Campanhas: juntar mestre e jogadores numa mesa
- [ ] Mestre enxerga as fichas da mesa

### Outros sistemas
- [ ] Sistema SAO
- [ ] Thrylikí Chelóna
- [ ] Ometion

---

## Fora de escopo

- **Cadastro de lore** (#36) — cidades, NPCs, facções. Saiu do projeto
- **IA dentro do app** (#23) — a Claude constrói e ajuda por fora
- **Dungeon do Dia** (#12)
- **Qualquer coisa paga** (#5)

---

## Pendência de configuração

O app do Google está em modo "Testando": só entram contas cadastradas na lista
de até 100, em *Google Cloud → Público-alvo → Usuários de teste*. Contraria a
decisão #4 (aberto a qualquer conta Google) e trava quando os jogadores
entrarem.
