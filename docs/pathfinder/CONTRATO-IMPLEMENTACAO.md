# Pathfinder 2e Remaster

Chave `pathfinder-2e-remaster`. Somente regras Remaster. PDFs fornecidos pelo usuário e Monster Core do Archives of Nethys. Originais e OCR ficam fora da pasta pública. Cada catálogo declara `fonte.estado` e `lacunas`; indexação não equivale a tradução revisada. Entradas não revisadas ficam `somenteConsulta:true` e não concedem regras automáticas.

Arquivos públicos: player-core.json, player-core-2.json, gm-core.json e monster-core.json em public/pathfinder. Estrutura `{fonte,classes,ancestralidades,biografias,talentos,magias,equipamentos,secoes,lacunas}`. IDs ASCII estáveis. Graus 0 destreinado, 1 treinado, 2 especialista, 3 mestre, 4 lendário. Atributos for/des/con/int/sab/car. Nomes exibidos Acrobatismo e Dissimulação; IDs acrobacia/enganacao preservados.

Motor puro `HubPF2Regras` no navegador, CommonJS no servidor. API criar/normalizar/calcular/validar/evoluir/incrementarAtributo/grauSucesso/bonusProficiencia. Criação e evolução trabalham em rascunho isolado. Cancelar nunca troca personagem, recursos ou versão salva. Confirmação usa PATCH com atualizadoEmBase; conflitos preservam rascunho. Dados desconhecidos ficam preservados.

Ficha: `{sistema,versaoFicha:1,nome,nivel,xp,ancestralidadeId,herancaId,biografiaId,classeId,opcaoClasseId,atributoChave,atributos,incrementos,pericias,talentos,magias,equipamentos,vida,condicoes,notas,_guiado,escolhasClasse,escolhasBiografia}`. Incrementos contém ancestralidade/biografia/classe/livres e nivel. Vida atual/maxima/temporaria. Talentos id/nivel/tipo/origem. Opções do mestre são reservadas em `_mestre` e não saem para jogadores. Jogador abre somente sua ficha; criação/evolução não consulta fichas da campanha.

Bônus de ancestralidade: `bonusTalentos:[{tipo,nivel,quantidade}]`; efeito de treinamento `{alvo:'treinamentos',tipo:'sem-tipo',valor:2}`. Extra slot tem origem `ancestralidade:ID`, aplicado só quando talento foi escolhido. Fontes incompletas não são apresentadas como completas.

Monstros ficam em fichas ehMonstro=true separadas de jogadores. Somente blocos `estadoTraducao:'revisado'` podem virar modelos jogáveis; referências incompletas continuam consultáveis. Aplicar modelo muda rascunho, salvar é explícito. Nenhuma migração destrutiva ou publicação antes da verificação.

Preparação diária: `magiasPreparadas:{truques:[],padrao:{ranque:[magiaID]},curriculo:{ranque:[magiaID]}}`; vagas, tradições, currículo e graus vêm do catálogo. Consumo de espaços é por índice preparado; repertório espontâneo, foco e Fonte Divina têm recursos separados. Campos antigos de anotações permanecem como consulta, nunca substituem o cálculo.

Equipamento resolve IDs revisados (`armaId`, `armaduraId`, `escudoId`, `runasEquipamento`), com `dados.equipamentos` como inventário da própria ficha. Quantidade ausente em entrada antiga equivale a uma unidade; consumo exige estoque e mantém campos desconhecidos. Esta estrutura não sincroniza nem duplica silenciosamente o inventário separado do Hub. Aparência fica em `_aparencia` do personagem.

Declaração de iniciativa: POST autenticado na própria ficha aceita somente `resultado`; usa o nome persistido e confirma somente nome/resultado. Nunca retorna campanha nem NPCs. Mestre recebe uma fila de declarações com UUID, incorporada sem repetir entradas e preservada por atualização atômica contra concorrência.

Automação significa que as escolhas são humanas e os cálculos são feitos pelo sistema. Fonte sem efeitos estruturados permanece explicitamente pendente; não é aceitável apresentar anotação ou soma manual como substituta da implementação.
