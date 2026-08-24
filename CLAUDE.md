# Instruções para a Claude neste repositório

## O projeto

Hub RPG — aplicação web para os universos e mesas de RPG do Zé.
Leia `docs/DECISOES.md` antes de qualquer trabalho. Ele é a fonte da verdade
e as decisões são numeradas; cite o número ao se apoiar numa delas.

## Regras deste projeto

**Idioma.** Tudo em português do Brasil: interface, comentários de código,
nomes de commits, documentação. Nomes técnicos de código (variáveis, funções)
podem ficar em inglês quando for o idioma natural da ferramenta.

**O Zé não programa, mas está aprendendo.** Explique as decisões técnicas em
português comum. Comente o código explicando o *porquê*, não o *o quê*. Ao
introduzir um conceito novo, explique na primeira vez.

**Custo zero é restrição de projeto** (decisão #5). Nada que exija plano pago
ou processo rodando 24h. Se algo só funcionar pago, diga antes de construir.

**Permissão é do servidor.** Campo marcado como `mestre` nunca sai do servidor
para quem não é mestre daquela campanha (decisão #13). Esconder na tela não
conta. Toda leitura de entidade passa pela mesma função de filtragem, e existe
teste automático que tenta ler um segredo como jogador e precisa falhar.

**Sistemas de regras são módulos** (decisão #17). Todo módulo responde às
mesmas sete perguntas descritas em `docs/ARQUITETURA.md`. Não espalhe regra de
sistema específico pelo resto do código.

**Fabula Ultima é comercial.** Codifique mecânica; nunca copie texto, arte ou
descrições do livro. O Hub é aberto a qualquer conta Google, então isso é
público na prática.

**Uma fatia por vez** (decisão #26). Não comece a fatia seguinte antes da
anterior estar no ar e usável. As fatias estão em `docs/ROADMAP.md`.

**Fora de escopo:** IA dentro do app (#23) e Dungeon do Dia (#12).

## Trabalhando

- Branch de desenvolvimento: `claude/hub-rpg-organization-x1tbpd`
- Ao fechar uma decisão nova na conversa, registre em `docs/DECISOES.md`
- Ao terminar uma fatia, marque no `docs/ROADMAP.md`
