"""Valida o overlay de passivos sem executar o compilador nem gravar em public/."""
import copy
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BASE = json.loads((ROOT / "public/pathfinder/player-core.json").read_text())
OVERLAY = json.loads((HERE / "passivos-gerais-revisados.json").read_text())

ids = [talento["id"] for talento in OVERLAY["talentos"]]
assert len(ids) == len(set(ids)), "IDs repetidos no overlay de passivos"

base_por_id = {talento["id"]: talento for talento in BASE["talentos"]}
assert not (set(ids) - set(base_por_id)), "Overlay contém talento ausente do catálogo-base"

# Simula exatamente a mesclagem rasa do compilador, apenas em memória.
mesclados = copy.deepcopy(base_por_id)
for talento in OVERLAY["talentos"]:
    mesclados[talento["id"]].update(talento)

assert mesclados["carregador-robusto"]["requisitosEstruturados"] == {
    "pericias": {"atletismo": 1}
}
assert {efeito["alvo"] for efeito in mesclados["carregador-robusto"]["efeitos"]} == {
    "limite-sobrecarga",
    "limite-carga-maxima",
}
assert mesclados["vitalidade"]["efeitos"] == [
    {"alvo": "pv", "tipo": "sem-tipo", "valor": 1, "porNivel": True},
    {"alvo": "cd-recuperacao", "tipo": "sem-tipo", "valor": -1},
]
assert mesclados["duro-de-matar"]["efeitos"] == [
    {"alvo": "limite-morrendo", "tipo": "sem-tipo", "valor": 1}
]
assert mesclados["iniciativa-incrivel"]["efeitos"] == [
    {"alvo": "iniciativa", "tipo": "circunstancia", "valor": 2}
]
assert mesclados["improvisacao-destreinada"]["improvisacaoDestreinadaPorNivel"] == [
    {"nivel": 1, "ajusteNivel": -2},
    {"nivel": 5, "ajusteNivel": -1},
    {"nivel": 7, "ajusteNivel": 0},
]
assert mesclados["epitome-da-ancestralidade"]["bonusTalentos"] == [
    {
        "tipo": "ancestralidade",
        "nivel": "aquisicao",
        "nivelMaximoTalento": 1,
        "quantidade": 1,
    }
]

perspicacia = mesclados["perspicacia-astuta"]["escolhasExtras"][0]
assert perspicacia["id"] == "defesa-perspicacia"
assert {opcao["id"] for opcao in perspicacia["opcoes"]} == {
    "fortitude",
    "reflexos",
    "vontade",
    "percepcao",
}
for opcao in perspicacia["opcoes"]:
    assert opcao["progressao"][0]["nivel"] == 17

assert mesclados["recuperacao-rapida"]["requisitosEstruturados"] == {
    "atributos": {"con": 2}
}
assert mesclados["investidura-incrivel"]["requisitosEstruturados"] == {
    "atributos": {"car": 3}
}
assert mesclados["passo-aprumado"]["requisitosEstruturados"] == {
    "atributos": {"des": 2}
}
assert mesclados["procurar-rapido"]["requisitosEstruturados"] == {"percepcao": 3}
assert mesclados["sobrevivente-lendario"]["requisitosEstruturados"] == {
    "pericias": {"sobrevivencia": 4}
}

liberados = {
    talento["id"] for talento in OVERLAY["talentos"] if not talento["somenteConsulta"]
}
assert {
    "treinamento-em-pericia",
    "carregador-robusto",
    "duro-de-matar",
    "vitalidade",
    "veloz",
}.issubset(liberados)

pendentes = {pendencia["id"] for pendencia in OVERLAY["pendenciasMotor"]}
assert {
    "iniciativa-incrivel",
    "improvisacao-destreinada",
    "recuperacao-rapida",
    "epitome-da-ancestralidade",
    "perspicacia-astuta",
    "investidura-incrivel",
    "passo-aprumado",
    "procurar-rapido",
    "sobrevivente-lendario",
}.issubset(pendentes)

print(
    f"OK: {len(ids)} passivos conferidos; "
    f"{len(liberados)} já selecionáveis; {len(pendentes)} integrações documentadas."
)
