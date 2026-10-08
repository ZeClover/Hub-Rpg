# Player Core 2 — cobertura parcial

Fonte: as quatro partes do PDF enviado, em inglês e escaneadas, 322 páginas físicas no total. Referências no catálogo usam o índice físico global: parte 1 páginas 1–100; parte 2 101–200; parte 3 201–300; parte 4 301–322. Não confundir com a paginação impressa.

O catálogo contém oito classes e progressões de proficiência, oito ancestralidades com 54 heranças, 52 opções de classe, 93 talentos selecionados e 25 magias revisadas: 23 focos iniciais e dois truques elementais. As 186 seções nativas são leitura desses registros editoriais. Isso **não** representa tradução integral das 322 páginas.

O conteúdo foi traduzido manualmente e cotejado com OCR e imagens durante a leitura original. Esta restauração conserva os IDs e as decisões mecânicas revisadas. A biblioteca marca a fonte como parcial e expõe lacunas; não serve OCR inglês como se fosse tradução.

Para reconstruir os arquivos:

```sh
python docs/pathfinder/player-core-2/editorial-manual.py
python docs/pathfinder/player-core-2/focos-linhagens.py
python docs/pathfinder/player-core-2/compilar.py
node docs/pathfinder/player-core-2/verificar-mecanicas.cjs
```

O verificador compara PV e proficiências das oito classes nos níveis 1 e 20 com valores esperados independentes e confere PV de três heranças. Ele não afirma que toda habilidade situacional está automatizada nem que uma ficha incompleta passou pela criação guiada.

As quantidades de conjuração foram cotejadas com as classes Remaster do Archives of Nethys em 6 de outubro de 2026. A redação corrigida do Oráculo concede três magias de 1ª graduação escolhidas, mais a magia de mistério; os três espaços iniciais não aumentam com essa concessão. Ele também possui cinco truques escolhidos mais o concedido. O Feiticeiro possui dois de 1ª graduação escolhidos mais o de linhagem, com três espaços, e quatro truques escolhidos mais o concedido. Ambas as progressões têm tabela de espaços e repertório por nível. As magias de 10ª graduação são tratadas separadamente: dois nomes aprendidos, um espaço especial.

`automacao.py`, `linhagens.py` e `talentos_evolucao.py` aplicam os metadados complementares ao editorial original. Distâncias numéricas do catálogo usam metros, compatíveis com o motor e o Livro do Jogador português. Proficiências, especialização de armas, movimento de Monge/Bárbaro/Espadachim e limites de recursos têm dados estruturados. Os efeitos de estado de movimento não acumulam patamares anteriores. O dado aumentado de Punho Poderoso vale somente para punho, preservando dados de outros ataques desarmados.

Todas as linhagens têm concessões até a 9ª graduação, incluindo a escolha de seis elementos e as quatro tradições dracônicas. O mistério concede magias adicionais; a linhagem ocupa vagas do repertório. Foco inicial foi referenciado por opção. A revisão individual das magias obrigatórias é integrada separadamente; referência de concessão não equivale a um bloco de magia revisado.

O compilador integra os três blocos de foco revisados de `../player-core-1/focos-pc2-fixtures.json`: Escudos do Espírito, Aura Incendiária e Halo Angelical. São regras do Player Core 2 em tradução manual, apesar da localização editorial do arquivo compartilhado. Referências de página impressa são convertidas explicitamente ao índice físico global. Auras e gatilhos desses efeitos ainda têm executor de combate pendente, sinalizado nos próprios registros.

Também integra `focos-linhagens-qa.json` (nove focos das demais linhagens e dois truques elementais) e `focos-oraculo-qa.json` (sete revelações iniciais dos demais mistérios, Imposição das Mãos e Toque do Vazio). Os blocos foram traduzidos manualmente e cotejados com o PDF e o Archives of Nethys. A paginação impressa do PDF e a indicada pelo AoN são preservadas separadamente quando divergem. `focos-qi-qa.json` inclui as duas magias iniciais oferecidas por Magias de Qi: Agitação Interior e Impulso de Qi, conferidas visualmente na página física 258. Suas ações compostas de ataque/movimento têm metadados e exigem executor próprio. O dano de Rajada de Vento e Espalhar Cascalho tem fórmulas de elevação executáveis; seus efeitos de empurrão e terreno continuam sinalizados como pendentes, assim como efeitos condicionais dos focos. Concessão válida e texto revisado não equivalem a execução integral de combate.

Foram incluídos 20 talentos adicionais para escolhas nos primeiros níveis. Campeão tem apenas dois talentos impressos de nível 2 nesse livro; pode escolher talentos de nível 1 no espaço recebido no nível 2, conforme as regras. O filtro deve aceitar nível do talento menor ou igual ao nível da escolha. Não foi inventado um terceiro talento de nível 2.

Cobertura compilada atual: 8 classes, 8 ancestralidades, 54 heranças, 24 biografias, 43 arquétipos resumidos, 130 talentos, 75 magias de foco/truques e 13 rituais. Pendências: talentos individuais dos arquétipos e talentos restantes do livro, tesouros, heranças versáteis, informações culturais e índice completos. Habilidades situacionais além das estruturas fornecidas ainda exigem execução própria; essas lacunas são trabalho de implementação, sem recorrer a cálculo manual como solução. O catálogo não declara automação integral dos talentos nem tradução integral do livro.

`focos-avancados-manual.py` conserva a tradução manual dos vinte focos avançados das dez linhagens do Feiticeiro, páginas físicas 263–266. O lote contém texto integral de cada entrada, resultados de salvaguardas, restrições, durações, elevações e resumos próprios. `focos-avancados-qa.json` é integrado pelo compilador. Esses registros permanecem `somenteConsulta: true`: possuir descrição e metadados não significa que o motor já execute auras, metamorfoses, controle, reação a conjuração ou dano condicionado. Não ampliar sua seleção executável sem executor e teste independente.

`rituais-manual.py` conserva a tradução manual integral dos 13 rituais do índice, páginas físicas 267–272. `rituais-qa.json` é integrado pelo compilador; os rituais permanecem para consulta até existir um executor específico para testes primários, secundários, custos, duração e graus de sucesso.
