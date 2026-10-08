"""Validação isolada do gerador, sem escrever em public/."""
import json
import pathlib
import re
import runpy

capturado = {}
original = pathlib.Path.write_text


def interceptar(caminho, conteudo, *args, **kwargs):
    if str(caminho).endswith("public/pathfinder/gm-core.json"):
        capturado["json"] = conteudo
        return len(conteudo)
    return original(caminho, conteudo, *args, **kwargs)


pathlib.Path.write_text = interceptar
try:
    runpy.run_path(str(pathlib.Path(__file__).with_name("reconstruir.py")), run_name="__main__")
finally:
    pathlib.Path.write_text = original

dados = json.loads(capturado["json"])
tabelas = {k: v for k, v in dados["tabelas"].items() if isinstance(v, list)}
rotulos = dados["tabelasRotulos"]
colunas = {k for linhas in tabelas.values() for linha in linhas if isinstance(linha, dict) for k in linha}

assert len(dados["secoes"]) == 97
assert len(dados["equipamentos"]) == 342
assert len(tabelas) == 41
assert len({x["id"] for x in dados["secoes"]}) == len(dados["secoes"])
assert len({x["id"] for x in dados["equipamentos"]}) == len(dados["equipamentos"])
assert set(tabelas) == set(rotulos["nomes"]) - {"xpPerigosNota"}
assert colunas == set(rotulos["colunas"])
assert all(x.get("texto") and x.get("resumo") for x in dados["secoes"])
assert all(x.get("descricao") and x.get("resumo") for x in dados["equipamentos"])
assert all(x.get("pagina") for x in dados["secoes"] + dados["equipamentos"])
assert all(re.fullmatch(r"[a-z0-9-]+", x["id"]) for x in dados["secoes"] + dados["equipamentos"])
assert all(isinstance(x["pagina"], int) and 1 <= x["pagina"] <= dados["fonte"]["paginas"] for x in dados["secoes"] + dados["equipamentos"])
assert all(isinstance(x.get("automatizavel"), bool) and x.get("mecanica", {}).get("estado") for x in dados["equipamentos"])
assert len(tabelas["materiaisComuns"]) == 19
assert len(tabelas["materiaisPreciososEstatisticas"]) == 39

# Termos de regra que indicariam um corpo ainda não traduzido. Identificadores
# internos e o aviso/licença original não entram nesta verificação editorial.
ingles_mecanico = re.compile(
    r"\b(?:critical success|critical failure|saving throw|armor class|hit points|"
    r"recall knowledge|broken threshold|hardness|bulk|requirements?|trigger|frequency|"
    r"strike|interact|trained|expert|legendary|uncommon|unique)\b",
    re.IGNORECASE,
)
corpos = [x["texto"] for x in dados["secoes"]] + [x["descricao"] for x in dados["equipamentos"]]
assert not [(i, ingles_mecanico.search(texto).group(0)) for i, texto in enumerate(corpos) if ingles_mecanico.search(texto)]

print(json.dumps({
    "secoes": len(dados["secoes"]),
    "equipamentos": len(dados["equipamentos"]),
    "tabelas": len(tabelas),
    "rotulosTabelas": len(rotulos["nomes"]),
    "rotulosColunas": len(rotulos["colunas"]),
    "automatizaveis": sum(bool(x["automatizavel"]) for x in dados["equipamentos"]),
    "inglesMecanico": 0,
    "escritaPublica": False,
}, ensure_ascii=False))
