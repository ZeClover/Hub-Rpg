# Monster Core — cobertura real da integração inicial

- **411 URLs únicas** da fonte AoN 221 capturadas sem falhas; IDs e URLs Remaster preservados.
- **411 nomes editoriais em português**, mantendo nomes próprios sem tradução arbitrária. `nomeOriginal` identifica a entrada da fonte.
- Todos os registros têm nível, página, PV, CA, percepção, seis modificadores de atributos e salvaguardas básicos. Traços genéricos traduzidos; nomes de povos e categorias próprios preservados.
- **52 blocos mecânicos redigidos e revisados em português**, com ataques, ações, sentidos, imunidades, resistências, fraquezas e exceções aplicáveis.
- **359 referências pendentes de redação e revisão das habilidades**; não são blocos de combate completos. Suas exceções de valores básicos podem estar ausentes. Devem consultar a fonte, sem importação como monstro completo.
- Estado global `parcial`. Extração de HTML não equivale a tradução integral do livro.

## Blocos revisados

Aapoph escama-de-granito (3184), Crocodilo (2887), Cão de guarda (2924), Grifo (3034), Guarda esqueleto (3193), Hiena (3065), Javali (2854), Leão (2866), Lobo (3241), Rato gigante (3162), Tigre (2867), Urso-cinzento (2850), Zumbi cambaleante (3249) e Águia (2968).

As regras dessas entradas foram redigidas manualmente a partir do bloco mecânico inglês. Os resumos são explicações curtas completas; o bloco mecânico contém o funcionamento detalhado. A ambientação inglesa e as ilustrações não foram republicadas.

## Revisões críticas

- **Agarrar/Derrubar:** ação adicional de Atletismo nas versões revisadas, sem sucesso automático da versão antiga. Os testes não sofrem nem aumentam a penalidade por ataques múltiplos. Agarrar também permite prolongar o agarrão existente até o fim do próximo turno.
- **Rasante do grifo:** penalidade por ataques múltiplos cresce normalmente entre os ataques. Cada ataque escolhe alvo diferente. Não confundir com habilidades que só aumentam a penalidade após todos os ataques.
- **Crocodilo:** Giro da Morte solta a vítima quando falha, derruba quando acerta. Emboscada Aquática exige alvo que não detectou o crocodilo a até 35 pés de distância inicial.
- **Rato gigante:** enjoado e inconsciente causados pela doença não terminam nem podem ser reduzidos antes da cura. Todos os cinco estágios e durações foram incluídos.
- **Zumbi:** lento 1 permanente, sem reações; fraquezas cortante 5/vitalidade 5. Mordida exige vítima agarrada ou restringida.
- **Guarda esqueleto:** 4 PV e resistências 5 a frio, eletricidade, fogo, perfurante e cortante.
- **Cura pelo Vazio:** não recebe dano de vazio. Só efeitos de vazio que especificamente curam mortos-vivos concedem cura; dano de vazio não vira cura. Recebe dano de vitalidade e não recebe cura de vitalidade. Confirmado no MonsterAbilities ID 83.
- **Aapoph:** escamas reduzem a CA de 24 para 22 por um dia; resistência 15 somente contra o dano desencadeador. +2 de estado em Vontade apenas contra efeitos mentais.
- **Leão:** o alcance do faro não foi informado na fonte; não copiamos os 30 pés do tigre.
- **Grifo sem asas:** variante opcional; terrestre 35 pés, sem voo nem Rasante. Não muda o grifo padrão.

## Dados e unidades

O parser inclui textos de cauda dos nós HTML: valores frequentemente estão após `<b>` e seriam perdidos por `text_content()` isolado. Reexecução determinística usa o cache e preserva IDs e números. Emissão do JSON é atômica.

Validação realizada após a reconstrução: 411 IDs e URLs únicos; campos básicos presentes; 14 estados revisados; referências pendentes sem ações inglesas. Os danos e bônus de todos os ataques revisados foram comparados com a fonte capturada no workspace atual. Exemplos: Lobo CA 15/PV 24; Águia terrestre 10/voo 60 pés; Crocodilo terrestre 20/natação 25 pés; Aapoph Fortitude 16/Reflexos 14/Vontade 11; Inteligência do rato gigante −4.

Traços de cimitarra conferidos no Player Core PT: **amplitude** e **enérgica**. Herança **cambiante**; monstro *hag* **estriga**, distinto da classe Bruxa.

`ataques[].map` contém três **bônus totais**, não penalidades: mandíbulas do Lobo `[9,4,-1]`, garra ágil do Tigre `[13,9,5]`. Distâncias em **pés**, identificadas por `unidadeDeslocamento:'pes'`; não houve conversão silenciosa.

## Arquivos próprios

- `public/pathfinder/monster-core.json`: catálogo da interface.
- `nomes.json`: mapa dos 411 nomes.
- `revisados.json`: redação dos 14 blocos revisados.
- `creditos.json` e `LICENCA.md`: atribuições e ORC.
- `scripts/importar-pf2-monster-core.py`: captura reproduzível, quatro acessos concorrentes, cache e escrita atômica.
- Originais ingleses: `/workspace/artifacts/pathfinder-fontes/monster-core`, fora da leitura pública.

## Ampliação de 6 de outubro

Mais 38 blocos receberam redação individual de ataques, ações e exceções, totalizando 52. Os IDs adicionais estão preservados em revisados.json; as 359 referências restantes continuam bloqueadas para importação. Tradução de habilidades não equivale à execução automática de cada ação de monstro.
