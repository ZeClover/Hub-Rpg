# Expansões seguras Wands & Wizards — relatório para revisão

Data: 15/10/2026. Branch: `feat/ww-expansoes-seguras-1890`.
Base publicada e branch padrão conferidas: `d86abb232524d1ffc11f245f59f50b0c3f59823c`.

Esta entrega implementa a ativação opcional por campanha e **23 opções**: oito alternativas das escolas originais, dez formações concedidas pelo Mestre e cinco feitiços completos. A expansão começa desligada. Não foi feito merge nem executado deploy ou migração no banco de produção.

É uma entrega faseada: escolas incompletas, propostas B, opções C e referências ainda não revisadas não se tornam opções jogáveis. A auditoria fornecida foi lida integralmente antes das alterações. Consulte a [matriz individual](MATRIZ-INDIVIDUAL.md) e a [auditoria original](AUDITORIA-FORNECIDA.md).

## 1. Conteúdo implementado

### Oito alternativas das escolas existentes

| Escola | Nível | Alternativa | Aplicação |
|---|---:|---|---|
| Encantamentos | 1 | Estudos de encantamento | Accio concedido, sem cota regular e sem duplicação |
| Maldições | 1 | Habilidades de intimidação | Proficiência ou especialização; nunca proficiência tripla |
| Transfiguração | 1 | Estudos científicos | Vera Verto concedido sem cota regular |
| Cura | 1 | Protetor dedicado | Movimento limitado como ação bônus, resolvido na mesa |
| Adivinhação | 1 | Intenções reveladas | Vantagem situacional em Intuição, sem leitura de segredos |
| Magizoologia | 1 | Estudos biológicos | Proficiência com substituição de repetições |
| Magizoologia | 6 | Caminho selvagem | Nado/escalada iguais ao deslocamento terrestre, descritos na ficha |
| Magizoologia | 10 | Bruxo explorador | Pedido de tenda ao Mestre; nenhum objeto é gerado |

Uma alternativa ocupa **o lugar** do benefício do marco. A escolha-base fica reservada no campo original; a alternativa fica em `extensoesWW.beneficiosEscola`. Intelecto continua com duas posições iniciais a partir do nível 3: a alternativa substitui uma delas, em vez de somar uma terceira. Alterar uma escolha já confirmada exige Mestre.

### Dez formações concedidas pelo Mestre

- Formação em Varinhalogia: proficiência nas ferramentas; sem kit automático e sem mudar lealdade ou poder da varinha.
- Linguagem dos animais: conversa com informações decididas pelo Mestre.
- Influência cativante: duas perícias sociais distintas; duplicações tratadas separadamente.
- Estudos aquáticos: a partir do nível 5, nado e respiração subaquática.
- Olhos do escriba rúnico: leitura de idiomas escritos, sem decifrar segredos protegidos.
- Salto místico: a partir do nível 9, salto triplicado sem voo.
- Língua da floresta: a partir do nível 10, conversa com plantas sob controle narrativo do Mestre.
- Estudos de fantasmas: formação narrativa em espíritos do mundo bruxo.
- Clube de Quadribol: posição narrativa de artilheiro, batedor, goleiro ou apanhador; nenhum bônus de CA, ataque, salvaguarda ou item.
- Quadribol · Sempre preparado: nível 10, Accio concedido dentro dos limites normais da magia.

Nove correspondem a entradas A da auditoria. O clube narrativo de Quadribol é o suporte esportivo pedido, sem importar seus benefícios mecânicos B/C. Todas dependem de concessão explícita pelo Mestre/auxiliar; jogador não pode forjar concessões em um PATCH. Repetir a concessão de uma formação não duplica registros ou itens.

### Cinco feitiços

| Feitiço | Círculo | Escola | Situação |
|---|---:|---|---|
| Inevitam | Truque | Adivinhação | Texto e componentes conferidos |
| Veentoosa | Truque | Encantamentos | Texto, componentes e concentração conferidos |
| Siccaroube | 1 | Encantamentos | Recipiente aberto/neblina, com escala especificada |
| Ascendio | 1 | Encantamentos | Uso utilitário com alvo voluntário; sem voo ou proteção contra quedas |
| Feitiço de embelezamento | 4 | Encantamentos | Alvo voluntário, duração e aumento por círculo |

Os cinco têm texto de jogo em português, tempo, alcance, componentes, duração, círculo, escola e identificação da fonte homebrew. Não substituem as 144 magias-base. O Grimório conserva seu desenho, pesquisa, filtros, Minhas Magias, checkboxes e pergaminho. Abrir uma descrição não aprende o feitiço.

Conhecimento de expansão fica em `extensoesWW.magias`; magias-base que dependam da cota liberada por uma concessão da expansão também ficam ali. Dessa forma, desativar o suplemento suspende esses conhecimentos e preserva a lista-base dentro de sua cota. Uma magia concedida não consome a seleção regular. Conjuração, espaços, concentração e descansos usam os recursos existentes; nenhum dado é rolado pelo Hub.

## 2. Conteúdo recuperado e mantido em revisão privada

Foram reabertos os quatro ZIPs anteriormente enviados, além do pacote desta tarefa. Os hashes e as linhas/abas de origem estão em `src/lib/wands-wizards/suplementos-editorial.json`.

| Material | Recuperação | Resultado seguro |
|---|---|---|
| W&W Potion Spreadsheet.xlsx | 69 poções | 50 existentes identificadas; **19 novas candidatas** preservadas no painel privado, sem receita ou estoque automático |
| W&W Spells_Houses_General Spreadsheet.xlsx | 144 magias | Equivalência de nomes/IDs e níveis; `Saggitario` é alias de `sagittario`, sem duplicação |
| W&W Monster Spreadsheet.xlsx | 167 blocos | Referência exclusiva do Mestre, sem converter CR, criar NPC ou conceder ataques a jogadores |
| Headmaster’s Guide / Monster Book / Spellstaff | PDFs já existentes e fontes recuperadas | Preservados; nenhuma regra variante ou quarta classe ativada |
| Frog Cards.xlsx | Não encontrado nos arquivos disponíveis | As 101 cartas mencionadas não foram inventadas nem recriadas; o Acervo atual foi preservado |
| Wizarding Book of Monsters, Grimoire Games | Não encontrado nos arquivos disponíveis | Conversão de inimigos continua pendente; nenhuma mistura automática com a base |

As 19 poções estão listadas individualmente no final da matriz. Textos de referência das planilhas continuam identificados como originais em inglês e aguardam tradução/revisão antes de virar conteúdo de jogador. Blocos de criaturas exigem revisão de completude, regras, CR e adequação a 1890. Nenhum desses registros possui botão de concessão automática.

## 3. Adaptações realizadas e motivos

- Benefícios de Newt são alternativas no mesmo marco, com reserva da escolha-base. Isso impede somar poderes gratuitamente e permite desativar a expansão sem apagar escolhas.
- Estudos Diversos foi limitado a duas posições iniciais. Não concede todas as novas alternativas.
- Proficiências, especialização e substituições respeitam o motor existente; substituições relacionadas à expansão ficam em campo separado.
- Concessões de Accio/Vera Verto usam IDs-base e lista calculada de magias concedidas. Não criam versões duplicadas nem ocupam a cota regular.
- Formações não concedem equipamentos; tenda, ferramentas e vassouras continuam sob concessão explícita do Mestre.
- Varinhalogia permanece formação profissional; Quadribol permanece especialização esportiva, sem marcas Firebolt/Nimbus/Cleansweep ou auras defensivas.
- Ghost Savant foi tratado como estudos narrativos de fantasmas/espíritos, sem importar idioma demoníaco, patronos ou cosmologia de outro sistema.
- Ascendio foi restrito a alvo voluntário para manter sua classificação utilitária; não permite arremessar inimigos sem resistência. O aumento de 25 pés a partir do 2º círculo não foi multiplicado por círculos adicionais que o texto não especifica.
- Encontrada uma divergência técnica na base: a entrada era limitada a 50 IDs, mas Intelecto no nível 20 permite 15 truques + 40 magias, além das concessões. A guarda de tamanho passa a 100 IDs; as cotas reais continuam exatamente as calculadas pelo estilo e nível. O teste de 55 conhecimentos legítimos passa, e excessos continuam recusados. Nenhuma tabela de progressão foi alterada.
- Foi adicionada uma coluna JSON nullable de configuração à campanha. Não existia campo apropriado para expansões; não foram reutilizados tags, iniciativa, inventário ou segredos para guardar configuração.

## 4. Opções que precisam de aprovação ou especificação

A matriz cobre **195 entradas individuais**: 44 A, 105 B e 46 C. A diferença para as 191 linhas da auditoria vem de separar as cinco magias incompletas antes agrupadas em uma linha.

- **22 das 44 entradas A** têm implementação opcional nesta fase. As outras 22 continuam registradas, sem ser descartadas nem automaticamente habilitadas.
- **29 entradas B** têm propostas detalhadas de efeito, ação, alcance, custo/recuperação e dependências para revisão. As outras 76 mantêm o parecer de risco e aguardam especificação balanceada. **Nenhuma B é habilitável**, inclusive as que já têm proposta.
- **46 entradas C** permanecem indisponíveis. Mystical Caster também está bloqueado estruturalmente como quarto estilo; não foi criado motor de warlock.
- Ignidere, Tempemodus e Clypustria, embora classificados A, não informam componentes completos na fonte; não foram completados por suposição nem colocados no Grimório selecionável.
- História da Magia não é perícia autônoma na ficha-base. Savant from History aguarda decisão sobre seu mapeamento, sem criar ou renomear perícias silenciosamente.
- Mark of Knowledge exige contador autoritativo e ação validada de uso/descanso; não foi liberado usando apenas texto ou contador editável no cliente.
- Keeper of Forgotten Tongues depende de Tome of Secrets ainda não aprovado; One with the Weathers depende de uma aura B não aprovada.

**Novas escolas preparadas:** Poções/Herbologia, História, Astronomia, Água, Clima, Artes das Trevas e Licantropia possuem IDs, marcos 1/6/10/14/18 e mapa de A/B/C. Nenhuma tem todos os marcos seguros completos; continuam fora do seletor de escolas. Não foram preenchidas lacunas com poderes inventados.

A aprovação editorial de uma proposta B/C exige outro diff com a regra corrigida, dependências e testes. O controle desta versão não permite ao Mestre habilitar B/C por engano.

## 5. Impacto e compatibilidade

- Campanhas existentes têm configuração `null`: expansão desligada. Fichas avulsas não ativam o suplemento.
- Não há migração, atualização em massa, backfill ou regravação de personagens ao ligar/desligar a flag.
- Escolhas, magias, substituições e formações de expansão ficam separadas em `extensoesWW`; com a flag desligada, não participam do cálculo. A reserva-base também é validada, para não reativar dados inválidos posteriormente.
- Toda gravação busca a configuração da campanha no servidor. Parâmetros ou cálculos enviados pelo navegador não autorizam expansões.
- Configuração usa revisão e comparação atômica no banco; concessões usam versão da ficha e vínculo de campanha. Conflitos retornam `409`.
- Catálogos completos de propostas, feitiços proibidos, poções e criaturas só saem pela API privada do Mestre. Jogadores recebem apenas configuração e opções A disponíveis, sem dados secretos de catálogo.
- Temas, cores, CSS, animações das Casas, desenhos/arquivos de varinhas, caixa, inventário, Acervo, iniciativa e outros sistemas foram preservados. Não houve rollback nem introdução de rolagens automáticas.

## 6. Testes realizados

- **623 testes unitários**, sem falhas, incluindo 15 testes novos de expansão.
- Comparação de **1.440 combinações**: quatro Casas × três estilos × seis escolas × níveis 1–20. O cálculo sem expansão é idêntico ao SHA publicado, registrado antes de modificar o motor.
- Alternativas A em todos os níveis disponíveis e três estilos; escola/tier/pré-requisitos; duas posições de Intelecto; perícias e especialização; concessões forjadas; conhecimentos e cotas; preservação após desligar/reativar.
- API real com sessão e banco isolados: Mestre, auxiliar, jogador, NPC, outra ficha/campanha, limite de nível, opções B/C, concessão idempotente, conflitos e preservação de dados.
- **97 handlers de 70 rotas**: acesso anônimo recusado antes de consultar o banco; compartilhamento e segredos verificados separadamente nos dez sistemas.
- **PostgreSQL 17 local descartável**, Prisma e schema reais: SQL da migração aplicado a uma campanha existente, configuração inicial null, disputa concorrente `200/409`, gravação versionada, concessão sem duplicação, desligamento e persistência relida por outro cliente Prisma. Somente o provedor de sessão foi isolado; participações e papéis foram consultados no banco local real.
- Navegador real: expansão ligada/desligada, cinco novas magias e 144 base preservadas, aprender/remover, fonte e texto, Minhas Magias, salvar/reabrir, descarte, Mestre, leitor, concessões, alternativa de nível 6 e larguras 320/390/1280.
- Painel real do Mestre: carregamento privado, ativação, formações, duas perícias, revisão B sem botão para aprovar, falha de revisão `409`, celular e desktop.
- Regressão de criação/evolução base, seis escolas até 18, talentos/aprimoramentos, recursos, varinha/persistência/descarte, quatro Casas/movimento reduzido, 144 textos do Grimório e **84 verificações do Acervo**.
- Iniciativa nas sete fichas HTML recuperadas e nove testes da API para todos os dez sistemas; nenhum lançamento de dados.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` e geração do cliente Prisma passaram.

Os testes de navegador usam uma conta e transporte isolados, sem escrever em personagens reais. O banco de produção não foi usado para os testes. Não foram feitas simulações quantitativas de encontros para aprovar B/C, nem foi alegado playtest de todas as combinações homebrew.

### Capturas

- [Alternativa no celular](capturas/alternativa-mobile.png).
- [Novo feitiço no pergaminho existente](capturas/magia-desktop.png).
- [Painel do Mestre no celular](capturas/mestre-mobile.png).
- [Painel do Mestre no desktop](capturas/mestre-desktop.png).

### Reprodução

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
node scripts/testar-wands-wizards-expansoes.cjs
node scripts/testar-wands-wizards-expansoes-api.cjs
node scripts/testar-wands-wizards-expansoes-mestre.cjs
```

Os scripts aceitam `PLAYWRIGHT_CORE` e `ESBUILD` para instalações locais dessas ferramentas. Chromium deve estar disponível em `/usr/bin/chromium` como nos testes existentes.

O teste de banco separado exige schema preparado em um PostgreSQL descartável e `WW_TEST_DATABASE_URL=postgresql://ww_test@127.0.0.1:55439/ww_expansoes`. O script recusa qualquer outro destino: ele testa a migração removendo/repondo a coluna **apenas nesse banco local de teste**. Nunca apontar esse fluxo ao banco do Hub.

## 7. Antes de integrar ou publicar

1. Revisar este relatório, as adaptações A, a matriz e os diffs. O PR permanece em rascunho; não foi integrado à branch padrão.
2. Aplicar a migração **0034** no ambiente de revisão/staging antes de testar APIs contra um banco compartilhado. A migração foi validada localmente, mas não foi executada na produção. Um preview automático conectado a um banco sem essa coluna ainda precisará dessa preparação.
3. Revisar a adaptação utilitária de Ascendio e as formações narrativas. Manter o opt-in desligado nas campanhas que não forem usá-lo.
4. Aprovar e especificar B/C em trabalho separado antes de qualquer futura habilitação. Nenhuma proposta pendente é ativada por este PR.
5. Para avançar nas cartas e no bestiário Grimoire Games, disponibilizar as fontes ausentes; não substituir por registros inventados.

A publicação de produção depende da revisão do PR e da preparação do banco. Publicar o ambiente do Codex e publicar o site são operações distintas.

## 8. Arquivos alterados nesta entrega

- `docs/wands-wizards/expansoes/AUDITORIA-FORNECIDA.md`
- `docs/wands-wizards/expansoes/MATRIZ-INDIVIDUAL.md`
- `docs/wands-wizards/expansoes/RELATORIO.md`
- `docs/wands-wizards/expansoes/VERIFICACOES.json`
- `docs/wands-wizards/expansoes/capturas/alternativa-mobile.png`
- `docs/wands-wizards/expansoes/capturas/magia-desktop.png`
- `docs/wands-wizards/expansoes/capturas/mestre-desktop.png`
- `docs/wands-wizards/expansoes/capturas/mestre-mobile.png`
- `prisma/migrations/0034_expansoes_wands_wizards/migration.sql`
- `prisma/schema.prisma`
- `public/wands-wizards/especiais-regras.mjs`
- `public/wands-wizards/expansoes/regras.mjs`
- `public/wands-wizards/expansoes/seguras.json`
- `public/wands-wizards/experiencias/grimorio.js`
- `public/wands-wizards/ficha-regras.d.mts`
- `public/wands-wizards/ficha-regras.mjs`
- `public/wands-wizards/ficha.js`
- `public/wands-wizards/formacao-regras.mjs`
- `public/wands-wizards/formacao-ui.js`
- `public/wands-wizards/recursos-regras.mjs`
- `public/wands-wizards/recursos-ui.js`
- `scripts/testar-hub-autenticacao.cjs`
- `scripts/testar-wands-wizards-expansoes-api.cjs`
- `scripts/testar-wands-wizards-expansoes-banco.cjs`
- `scripts/testar-wands-wizards-expansoes-mestre.cjs`
- `scripts/testar-wands-wizards-expansoes.cjs`
- `src/app/(hub)/campanhas/[id]/expansoes-wands-wizards.tsx`
- `src/app/(hub)/campanhas/[id]/page.tsx`
- `src/app/api/campanhas/[id]/wands-wizards-expansoes/route.ts`
- `src/app/api/personagens/[id]/route.ts`
- `src/lib/wands-wizards/expansoes-baseline.json`
- `src/lib/wands-wizards/expansoes-campanha.ts`
- `src/lib/wands-wizards/expansoes-editorial.json`
- `src/lib/wands-wizards/expansoes.test.ts`
- `src/lib/wands-wizards/suplementos-editorial.json`
