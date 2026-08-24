# Arquitetura do Hub RPG

Escrito para ser entendido por quem não programa. Termos técnicos aparecem
explicados na primeira vez que são usados.

## Visão geral

O Hub tem três camadas empilhadas:

```
   ┌─────────────────────────────────────────────┐
   │  TELAS          o que você e os jogadores   │
   │                 veem e clicam no navegador  │
   ├─────────────────────────────────────────────┤
   │  REGRAS         permissões (quem vê o quê)  │
   │                 + motor de cada sistema     │
   ├─────────────────────────────────────────────┤
   │  DADOS          banco de dados + imagens    │
   └─────────────────────────────────────────────┘
```

A camada do meio é a mais importante: é ela que garante que um segredo de
mestre nunca chegue no celular de um jogador, e é ela que sabe as regras de
Fabula Ultima.

## As peças (stack)

Tudo em plano gratuito, conforme a decisão #5.

| Peça | Escolha | Por quê |
|------|---------|---------|
| Site | **Next.js** (React + TypeScript) | Roda a tela e o servidor no mesmo projeto. É o padrão da Vercel |
| Hospedagem | **Vercel** (plano Hobby) | Grátis, publica sozinho a cada commit, e você já tem conta |
| Banco de dados | **Supabase** (Postgres) | Grátis. Guarda todo o conteúdo do Hub |
| Imagens | **Supabase Storage** | Grátis (1 GB). Retratos, mapas, brasões — comprimidos na subida |
| Tempo real | **Supabase Realtime** | Grátis. Quando o mestre muda o HP de um inimigo, os jogadores veem na hora |
| Login | **Auth.js** com Google | Grátis. Ninguém precisa criar senha, e nós não guardamos senha nenhuma |
| Acesso ao banco | **Prisma** | Descreve as tabelas num arquivo legível, quase em português estruturado |

Uma conta Supabase cobre banco, imagens e tempo real de uma vez só — por isso
ela, e não três serviços separados.

**Aviso do plano gratuito:** o banco Supabase hiberna depois de ~7 dias sem
nenhum acesso e leva alguns segundos para acordar. Com uso semanal, isso
praticamente nunca acontece.

## Modelo de dados

O coração do Hub. Cada caixa vira uma tabela no banco.

### Identidade e organização

- **Usuário** — quem loga. Nome, email, foto (vem do Google).
- **Universo** — um mundo. Darkrem, Ometion, etc. Tem nome, descrição, imagem
  de capa e um dono.
- **Sistema** — um conjunto de regras. Fabula Ultima, SAO, Thrylikí Chelóna.
  O registro no banco é só o cadastro; as regras de verdade vivem num módulo
  de código (ver adiante).
- **Campanha** — uma mesa. Aponta para **um universo** e **um sistema**.
  Tem um mestre e vários jogadores.
- **Participação** — liga um usuário a uma campanha, dizendo se ele é mestre
  ou jogador, e qual personagem ele controla.

É a separação universo/sistema (decisão #9) que permite rodar Darkrem em
Fabula Ultima numa mesa e no seu homebrew de SAO em outra, reaproveitando
todo o lore.

### Conteúdo do mundo

- **Entidade** — a peça genérica do cadastro base. Uma entidade é *qualquer
  coisa* do mundo: um NPC, uma cidade, uma facção, um item, uma magia, uma
  criatura, uma divindade, um evento histórico, uma família. Tem tipo, nome,
  resumo, texto longo, imagem e pertence a um universo.
- **Campo de entidade** — cada informação extra de uma entidade, guardada
  como *chave + valor + visibilidade*. A visibilidade é o que faz o segredo
  campo a campo (decisão #13) funcionar: um campo pode ser `público` ou
  `mestre`.
- **Vínculo** — liga duas entidades com um rótulo: "mora em", "membro de",
  "inimigo de", "filho de". É isso que transforma o cadastro numa wiki
  navegável, sem precisar de tabela nova para cada tipo de relação.

Uma cidade pode então ter descrição pública, e um campo `mestre` dizendo quem
realmente manda lá — exatamente o formato que suas skills de rumores já usam.

### Ficha e jogo

- **Personagem** — a ficha mecânica. Pertence a uma campanha, tem um dono
  (o jogador) e guarda os números num campo flexível, validado pelo módulo
  do sistema daquela campanha. Pode opcionalmente estar ligado a uma
  Entidade, para o personagem também existir no lore.
- **Sessão** — um encontro jogado. Data, resumo público, notas do mestre.
- **Rolagem** — registro de um teste feito no Hub (fase posterior).

## Como um sistema de regras funciona

Decisão #17: cada sistema é um módulo de código sob medida. Para que isso não
vire caos, todos os módulos preenchem o **mesmo encaixe** — a mesma lista de
perguntas que o Hub faz a qualquer sistema:

```
Um módulo de sistema precisa saber responder:

  Quais atributos existem, e que forma eles têm?
      (Fabula Ultima: dados de d6 a d12. Outro sistema: números de 1 a 20.)

  Como é a criação de personagem, passo a passo?
      (E quais escolhas são inválidas — o Hub bloqueia na hora.)

  Quais valores são derivados, e de que fórmula?
      (PV, PM, Defesa, iniciativa.)

  Como se faz um teste?
      (Quais dados, quais modificadores, o que conta como crítico ou falha.)

  Quais condições/status existem, e o que cada uma altera?

  Como o personagem progride?
      (XP, nível, o que se ganha ao subir.)

  Como a ficha é desenhada na tela?
```

O Hub não sabe nada sobre Fabula Ultima. Ele sabe **fazer essas sete
perguntas**. O módulo do Fabula Ultima responde do jeito dele; o módulo do
SAO responde do jeito dele. Adicionar um sistema novo é escrever um módulo
que responda as mesmas sete perguntas — trabalho de código, mas trabalho
previsível.

## Segurança das permissões

A regra que não pode ser quebrada:

> Um campo marcado como `mestre` **nunca sai do servidor** para quem não é
> mestre daquela campanha.

Na prática: toda leitura de entidade passa por uma função única que recebe
"quem está pedindo" e devolve apenas os campos que aquela pessoa pode ver.
Não existe caminho alternativo para ler entidade. Isso é testado
automaticamente — um teste que tenta ler um segredo como jogador e precisa
falhar.

Esconder com CSS ou com um `if` na tela **não conta**: o dado já teria saído
do servidor, e qualquer pessoa consegue olhar o que o navegador recebeu.

## Sobre conteúdo de terceiros

Fabula Ultima é comercial. O módulo do sistema codifica mecânica: nomes de
atributos, fórmulas, lógica de dados, efeitos de condições. Ele **não** carrega
texto do livro — descrições de classe, texto de habilidades, arte. O que
aparecer como texto descritivo no Hub é o que Zé escrever. O acesso é aberto a
qualquer conta Google, então essa linha importa na prática.

## Nota sobre o Prisma 7

A partir da versão 7, o Prisma não aceita mais o endereço de conexão dentro
do `schema.prisma`. Ele vive em `prisma.config.ts`, lendo as variáveis que a
integração do Supabase criou na Vercel. Nenhuma senha fica no repositório.

As migrações (os comandos que criam e alteram tabelas) ficam em
`prisma/migrations/` como arquivos `.sql` legíveis. Como esta sessão não tem
acesso ao banco — e não deve ter, porque isso exigiria as senhas —, o arquivo
é gerado aqui e executado por Zé no painel, em **Storage → Query**.
