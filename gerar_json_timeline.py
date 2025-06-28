import os
import json

BASE_DIR = "dados"
SAIDA_DIR = "dados_json"


def ler_arquivo(caminho):
    if not os.path.exists(caminho):
        return ""
    with open(caminho, encoding="utf-8") as f:
        return f.read().strip()


def listar_imagens(caminho):
    imagens = []
    if not os.path.exists(caminho):
        return imagens

    arquivos = sorted([
        arq for arq in os.listdir(caminho)
        if arq.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    ])
    return arquivos


def ler_legendas(caminho_legendas):
    if not os.path.exists(caminho_legendas):
        return {}

    legenda_dict = {}
    with open(caminho_legendas, encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if "|" in linha:
                nome_arquivo, legenda = linha.split("|", 1)
                legenda_dict[nome_arquivo.strip()] = legenda.strip()
    return legenda_dict


def processar_periodo(periodo_path):
    resultado = {}
    eixos = ["contexto_politico", "contexto_normativo", "protagonistas", "modos_de_apresentacao"]

    for eixo in eixos:
        eixo_path = os.path.join(periodo_path, eixo)
        texto = ler_arquivo(os.path.join(eixo_path, "texto.md")) or ler_arquivo(os.path.join(eixo_path, "texto.txt"))
        links = ler_arquivo(os.path.join(eixo_path, "links.md")) or ler_arquivo(os.path.join(eixo_path, "links.txt"))
        imagens = listar_imagens(os.path.join(eixo_path, "galeria"))
        legendas = ler_legendas(os.path.join(eixo_path, "galeria", "legendas.txt"))

        galeria = []
        for img in imagens:
            galeria.append({
                "arquivo": img,
                "legenda": legendas.get(img, "")
            })

        resultado[eixo] = {
            "texto": texto,
            "links": links,
            "galeria": galeria
        }

    return resultado


def main():
    if not os.path.exists(SAIDA_DIR):
        os.makedirs(SAIDA_DIR)

    for periodo in sorted(os.listdir(BASE_DIR)):
        periodo_path = os.path.join(BASE_DIR, periodo)
        if not os.path.isdir(periodo_path):
            continue

        dados = processar_periodo(periodo_path)
        saida_path = os.path.join(SAIDA_DIR, f"{periodo}.json")
        with open(saida_path, "w", encoding="utf-8") as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)

    print(f"Arquivos gerados em: {SAIDA_DIR}/")


if __name__ == "__main__":
    main()