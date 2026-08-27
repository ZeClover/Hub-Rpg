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
por página. Esse é o caminho para os 4 Atlas que faltam: recorte por
capítulo, mandado como anexo.

- [x] Poderes das 15 classes do Livro Básico — **completo.** Todas com os
      cinco poderes conferidos linha a linha no livro, contador de NP e
      benefícios iniciais automáticos. Entropista, Espiritualista e
      Elementalista com catálogo de feitiços; Quimerista com aviso de que os
      dele vêm de observar criaturas em jogo, sem catálogo fixo
- [ ] Feitiços e rituais, com as seis disciplinas
- [ ] Equipamento: armas, armaduras, escudos, acessórios, e o efeito nos números
- [ ] Combate: dano, tipos de dano, afinidades elementais
- [ ] Poderes Heroicos
- [ ] **Atlas High Fantasy** — classes, poderes e opções
- [ ] **Atlas Techno Fantasy** — classes, armas personalizadas, tecnosferas
- [ ] **Atlas Natural Fantasy**
- [ ] **Herdeiros da Supernova**

Zé usa todos os Atlas, então nenhum deles é opcional.

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
