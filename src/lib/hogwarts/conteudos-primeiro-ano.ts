export const MATERIAS_HOGWARTS_1_ANO = [
  "Feitiços", "Transfiguração", "Poções", "Herbologia",
  "Defesa Contra as Artes das Trevas", "História da Magia", "Astronomia", "Voo",
] as const;

export type EstadoConteudoHogwarts =
  | "oculto" | "descoberto" | "bloqueado" | "disponivel"
  | "formacao-inicial" | "conhecido" | "dominado" | "assinatura";

export type ConteudoHogwarts = {
  slug: string;
  nome: string;
  categoria: "Feitiço" | "Técnica" | "Receita" | "Conhecimento Especial";
  pericia: string;
  atributo_padrao: string;
  requisito_pericia: number;
  custo: number;
  ano_normal: 1;
  descricao: string;
  efeito: string;
  tags: string[];
  fonte: "Currículo de Hogwarts — 1º Ano";
  restrito: false;
  secreto: false;
};

const BASE = { custo: 1, ano_normal: 1 as const, fonte: "Currículo de Hogwarts — 1º Ano" as const, restrito: false as const, secreto: false as const };
const item = (
  slug: string, nome: string, categoria: ConteudoHogwarts["categoria"], pericia: string,
  atributo_padrao: string, requisito_pericia: number, efeito: string, tags: string[] = [],
): ConteudoHogwarts => ({ ...BASE, slug, nome, categoria, pericia, atributo_padrao, requisito_pericia, descricao: efeito, efeito, tags });

/** Catálogo canônico do pacote do 1º ano. Slug é a identidade estável do upsert. */
export const CONTEUDOS_HOGWARTS_1_ANO: readonly ConteudoHogwarts[] = [
  item("lumos-nox", "Lumos / Nox", "Feitiço", "Feitiços", "Arcano", 0, "Lumos cria luz na ponta da varinha; Nox encerra o efeito.", ["Luz", "Utilidade", "Básico"]),
  item("wingardium-leviosa", "Wingardium Leviosa", "Feitiço", "Feitiços", "Arcano", 0, "Ação 1, alcance 15 m. Levanta e move objetos até cerca de 6 m por rodada, com concentração por até 10 rodadas.", ["Levitação", "Controle", "Utilidade"]),
  item("reparo", "Reparo", "Feitiço", "Feitiços", "Arcano", 0, "Repara dano físico ordinário em alcance de 6 m; não restaura propriedades mágicas complexas.", ["Reparo", "Utilidade"]),
  item("scourgify", "Scourgify", "Feitiço", "Feitiços", "Arcano", 0, "Limpa resíduos e manchas comuns numa área de até 2 m; não remove maldições ou marcas protegidas.", ["Limpeza", "Utilidade"]),
  item("tergeo", "Tergeo", "Feitiço", "Feitiços", "Pulso", 0, "Remove líquidos e resíduos superficiais com precisão em alcance de 3 m; não cura sangramento.", ["Limpeza", "Precisão", "Utilidade"]),
  item("sonorus-quietus", "Sonorus / Quietus", "Feitiço", "Feitiços", "Arcano", 1, "Sonorus amplifica a voz; Quietus encerra o efeito.", ["Voz", "Comunicação", "Utilidade"]),
  item("colloportus", "Colloportus", "Feitiço", "Feitiços", "Arcano", 1, "Sela magicamente porta, janela ou mecanismo apropriado em alcance de 6 m.", ["Porta", "Controle", "Utilidade"]),
  item("conjuracao-sob-distracao", "Conjuração sob Distração", "Técnica", "Feitiços", "Fibra", 1, "Uma vez por cena, ignora uma Desvantagem causada apenas por barulho ou ambiente agitado ao lançar Feitiço Básico.", ["Concentração", "Básico", "Técnica"]),
  item("controle-de-intensidade", "Controle de Intensidade", "Técnica", "Feitiços", "Arcano", 1, "Permite produzir deliberadamente uma versão mais fraca de um Feitiço Básico de utilidade.", ["Controle", "Utilidade", "Técnica"]),

  item("transformacao-simples", "Transformação Simples", "Técnica", "Transfiguração", "Arcano", 0, "Transforma pequenos objetos simples em outros de tamanho e complexidade semelhantes por até 1 hora."),
  item("reversao-simples", "Reversão Simples", "Técnica", "Transfiguração", "Arcano", 0, "Desfaz com segurança uma Transformação Simples conhecida."),
  item("alteracao-de-forma", "Alteração de Forma", "Técnica", "Transfiguração", "Pulso", 1, "Muda a forma externa de objeto simples sem alterar significativamente o material."),
  item("alteracao-de-tamanho", "Alteração de Tamanho", "Técnica", "Transfiguração", "Arcano", 1, "Aumenta ou reduz modestamente um objeto durante uma Transformação; não substitui Engorgio ou Reducio."),
  item("preservar-propriedade", "Preservar Propriedade", "Técnica", "Transfiguração", "Engenho", 1, "Preserva conscientemente uma característica funcional simples durante a transformação."),
  item("reversao-de-emergencia", "Reversão de Emergência", "Técnica", "Transfiguração", "Arcano", 2, "Uma vez por cena, transforma Falha Grave em Transformação Simples em Falha comum.", ["Fim de Ano"]),

  item("wiggenweld", "Wiggenweld", "Receita", "Poções", "Engenho/Pulso conforme abordagem", 1, "Em 30 minutos produz 1 dose: recupera 1 Vida e trata sangramento superficial; causa Saturado para novas curas por poção na cena."),
  item("antidoto-venenos-comuns", "Antídoto para Venenos Comuns", "Receita", "Poções", "Engenho", 1, "Em 30 minutos produz 1 dose que remove Envenenado de veneno comum compatível."),
  item("preparacao-de-ingredientes", "Preparação de Ingredientes", "Técnica", "Poções", "Pulso", 0, "Domina corte, trituração, pesagem, separação e esmagamento de ingredientes comuns."),
  item("controle-de-caldeirao", "Controle de Caldeirão", "Técnica", "Poções", "Pulso", 0, "Uma vez por preparação, Falha Grave ligada apenas ao controle ordinário do caldeirão vira Falha comum."),
  item("conservacao-alquimica", "Conservação Alquímica", "Técnica", "Poções", "Engenho", 1, "Armazena ingredientes preparados e doses simples, reduzindo perdas por umidade ou contaminação."),
  item("reconhecer-preparo-instavel", "Reconhecer Preparo Instável", "Técnica", "Poções", "Engenho", 1, "Reconhece sinais evidentes de preparo defeituoso numa poção examinável."),

  item("colheita-segura", "Colheita Segura", "Técnica", "Herbologia", "Pulso", 1, "Falha ordinária ao colher planta perigosa conhecida não causa automaticamente a pior consequência."),
  item("preparacao-botanica", "Preparação Botânica", "Técnica", "Herbologia", "Pulso", 1, "Permite secar, cortar, moer, armazenar e preservar plantas."),
  item("ditamno-uso-medicinal", "Ditamno — Uso Medicinal", "Conhecimento Especial", "Herbologia", "Engenho", 1, "Permite uso medicinal adequado de ditamno para estabilização e tratamento; não remove Ferimento Grave instantaneamente."),
  item("knotgrass-preparacao", "Knotgrass — Preparação", "Conhecimento Especial", "Herbologia", "Engenho", 1, "Permite cultivar e preparar Knotgrass em qualidade alquímica adequada."),
  item("diagnostico-de-planta", "Diagnóstico de Planta", "Técnica", "Herbologia", "Engenho", 0, "Identifica sinais básicos de água inadequada, doença, iluminação ruim, praga e dano físico."),
  item("transplante-seguro", "Transplante Seguro", "Técnica", "Herbologia", "Pulso", 1, "Move planta mágica de baixo risco entre recipientes ou solo adequado sem teste em condições normais."),
  item("cultivo-basico", "Cultivo Básico", "Técnica", "Herbologia", "Engenho", 1, "Permite manter espécies mágicas de baixo risco e libera Cultivo para plantas simples."),

  item("rictusempra", "Rictusempra", "Feitiço", "Defesa Contra as Artes das Trevas", "Arcano", 0, "Alcance 15 m, não letal: Abalado 1 rodada; elevado Desequilibrado; excepcional Atordoado."),
  item("tarantallegra", "Tarantallegra", "Feitiço", "Defesa Contra as Artes das Trevas", "Arcano", 1, "Alcance 15 m: Desequilibrado; elevado Enredado 2; excepcional movimento 0 por 2 rodadas. Finite remove."),
  item("postura-de-duelo", "Postura de Duelo", "Técnica", "Defesa Contra as Artes das Trevas", "Pulso", 0, "Num confronto percebido, preparar a varinha não cria custo narrativo adicional e cobre distância e guarda básicas."),
  item("reconhecer-ameaca-magica", "Reconhecer Ameaça Mágica", "Conhecimento Especial", "Defesa Contra as Artes das Trevas", "Engenho", 0, "Reconhece sem teste o perigo básico de uma ameaça mágica estudada; detalhes exigem teste."),
  item("resistencia-ao-medo", "Resistência ao Medo", "Técnica", "Defesa Contra as Artes das Trevas", "Fibra", 1, "Uma vez por cena, reduz em um grau a consequência de uma falha de Fibra contra medo de criatura ou magia."),
  item("retirada-defensiva", "Retirada Defensiva", "Técnica", "Defesa Contra as Artes das Trevas", "Pulso", 1, "Uma vez por cena, após defesa bem-sucedida, move até 3 m para longe da ameaça se houver espaço."),
  item("expelliarmus", "Expelliarmus", "Feitiço", "Defesa Contra as Artes das Trevas", "Arcano", 2, "Alcance 15 m, não letal: Desarmado; elevado move o objeto até 6 m; excepcional também Desequilibrado ou destino favorável.", ["Fim de Ano", "Opcional"]),

  item("pesquisa-arquivistica", "Pesquisa Arquivística", "Técnica", "História da Magia", "Engenho", 1, "Após 10 minutos em arquivo adequado, Falha comum ainda encontra fonte relevante, com atraso ou complicação."),
  item("leitura-de-fonte-primaria", "Leitura de Fonte Primária", "Técnica", "História da Magia", "Engenho", 1, "Determina autoria provável, época, contexto e se o relato é direto ou posterior."),
  item("linha-do-tempo", "Linha do Tempo", "Técnica", "História da Magia", "Engenho", 0, "Organiza acontecimentos conhecidos cronologicamente e percebe contradições temporais."),
  item("contexto-historico", "Contexto Histórico", "Conhecimento Especial", "História da Magia", "Engenho", 1, "Reconhece o contexto geral de nome, lugar, símbolo ou instituição histórica estudada, sem revelar segredos obscuros."),
  item("genealogia-basica", "Genealogia Básica", "Técnica", "História da Magia", "Engenho", 1, "Reconhece relações conhecidas entre famílias bruxas e interpreta árvores genealógicas."),
  item("catalogacao", "Catalogação", "Técnica", "História da Magia", "Engenho", 1, "Organiza documentos para facilitar pesquisa posterior; preparação relevante pode dar Vantagem à busca."),

  item("navegacao-celeste", "Navegação Celeste", "Técnica", "Astronomia", "Engenho", 1, "Sob céu observável, determina direção, tempo aproximado e orientação por estrelas sem teste em condições normais."),
  item("calendario-lunar", "Calendário Lunar", "Conhecimento Especial", "Astronomia", "Engenho", 1, "Conhece e calcula fases lunares e janelas astronômicas comuns."),
  item("cartografia-estelar", "Cartografia Estelar", "Técnica", "Astronomia", "Pulso", 1, "Produz registros precisos do céu e compara observações de noites diferentes."),
  item("uso-de-telescopio", "Uso de Telescópio", "Técnica", "Astronomia", "Pulso", 0, "Opera e ajusta instrumentos astronômicos comuns corretamente."),
  item("identificacao-celeste", "Identificação Celeste", "Conhecimento Especial", "Astronomia", "Engenho", 0, "Reconhece constelações estudadas, planetas visíveis, Lua e movimentos celestes básicos."),
  item("registro-astronomico", "Registro Astronômico", "Técnica", "Astronomia", "Pulso", 1, "Produz observações rigorosas para uso posterior em Poções, Herbologia ou pesquisa."),

  item("recuperacao-aerea", "Recuperação Aérea", "Técnica", "Voo", "Pulso", 1, "Uma vez por cena, reduz em um grau a consequência de uma falha de Voo que causaria queda."),
  item("curva-fechada", "Curva Fechada", "Técnica", "Voo", "Pulso", 1, "Realiza curvas muito apertadas sem penalidade causada exclusivamente pela curva fechada."),
  item("montagem-pouso-seguro", "Montagem e Pouso Seguro", "Técnica", "Voo", "Pulso", 0, "Decolar e pousar normalmente não exige teste; uma Falha comum em pouso difícil não implica queda automática."),
  item("frenagem-de-emergencia", "Frenagem de Emergência", "Técnica", "Voo", "Pulso", 1, "Uma vez por cena, reduz drasticamente a velocidade antes de colisão e pode reduzir o impacto em um grau."),
  item("controle-sem-as-maos", "Controle sem as Mãos", "Técnica", "Voo", "Pulso", 1, "Em voo estável, libera uma das mãos por períodos curtos sem penalidade apenas por isso."),
  item("voo-rasante", "Voo Rasante", "Técnica", "Voo", "Pulso", 1, "Ignora a primeira penalidade leve causada exclusivamente pela proximidade do terreno.", ["Fim de Ano"]),

  item("busca-sistematica", "Busca Sistemática", "Técnica", "Investigação", "Engenho", 1, "Com tempo suficiente, encontra objetos mundanos razoavelmente escondidos sem teste; exceções ainda exigem teste.", ["Geral"]),
  item("cena-do-acontecimento", "Cena do Acontecimento", "Técnica", "Investigação", "Engenho", 1, "Ao examinar uma cena preservada, identifica algo fora do lugar, luta, entrada ou saída provável ou evidência evidente.", ["Geral"]),
  item("ocultar-objeto", "Ocultar Objeto", "Técnica", "Furtividade", "Pulso", 1, "Esconde discretamente objeto pequeno no corpo, sala ou bagagem; Investigação resolve buscas contestadas.", ["Geral"]),
  item("misturar-se-a-multidao", "Misturar-se à Multidão", "Técnica", "Furtividade", "Presença", 1, "Em ambiente cheio, permite usar Presença + Furtividade para passar despercebido sem esconder-se fisicamente.", ["Geral"]),
  item("etiqueta-formal", "Etiqueta Formal", "Técnica", "Influência", "Presença", 1, "Conhece tratamento, comportamento e apresentação adequados em ambientes formais mágicos.", ["Geral"]),
  item("negociacao", "Negociação", "Técnica", "Influência", "Presença", 1, "Permite negociar preço, favor, prazo, troca ou condição dentro do que a outra parte aceitaria.", ["Geral"]),
] as const;

export const SLUGS_CONTEUDOS_HOGWARTS_1_ANO = new Set(CONTEUDOS_HOGWARTS_1_ANO.map((c) => c.slug));
export function ehMateriaHogwarts(pericia: string): boolean {
  return (MATERIAS_HOGWARTS_1_ANO as readonly string[]).includes(pericia);
}
