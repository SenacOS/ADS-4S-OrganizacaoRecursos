#!/usr/bin/env python3
"""Lê JTL CSV de JMeter sem bibliotecas externas e não inventa amostras."""
import argparse
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path


def percentil(valores, porcentagem):
    valores = sorted(valores)
    if not valores:
        return None
    posicao = (len(valores) - 1) * porcentagem / 100.0
    inferior, superior = math.floor(posicao), math.ceil(posicao)
    return round(valores[inferior] + (valores[superior] - valores[inferior]) * (posicao - inferior), 2)


def esperado(cenario, rotulo):
    if rotulo.startswith("01 CSRF") or rotulo.startswith("03 CSRF"):
        return {"200"}
    if rotulo.startswith("02 Login"):
        return {"204"}
    if rotulo.startswith("Consulta recursos"):
        return {"200"}
    if rotulo.startswith("Criacao reserva") or rotulo.startswith("Manutencao concorrente"):
        return {"201", "409"} if cenario in {"disputa", "manutencao"} else {"201"}
    return set()


def analisar(caminho, cenario):
    grupos = defaultdict(list)
    with caminho.open(encoding="utf-8-sig", newline="") as arq:
        for registro in csv.DictReader(arq):
            if not {"timeStamp", "elapsed", "label", "responseCode"}.issubset(registro):
                raise SystemExit("JTL sem colunas timeStamp, elapsed, label e responseCode")
            grupos[registro["label"]].append(registro)
    if not grupos:
        raise SystemExit("Arquivo JTL sem amostras; teste não executado.")

    resultado = {"cenario": cenario, "fonte": str(caminho), "amostras": {}}
    for rotulo, itens in sorted(grupos.items()):
        codigos = Counter(item["responseCode"] for item in itens)
        latencias = [int(item["elapsed"]) for item in itens]
        inicio = min(int(item["timeStamp"]) for item in itens)
        fim = max(int(item["timeStamp"]) + int(item["elapsed"]) for item in itens)
        duracao = max((fim - inicio) / 1000.0, 0.001)
        aceitos = esperado(cenario, rotulo)
        erros = sum(1 for item in itens if item["responseCode"] not in aceitos)
        resultado["amostras"][rotulo] = {
            "total": len(itens),
            "codigos_http": dict(codigos),
            "conflitos_409_esperados": codigos["409"] if "409" in aceitos else 0,
            "erros_inesperados": erros,
            "percentual_erros_inesperados": round(100 * erros / len(itens), 2),
            "p50_ms": percentil(latencias, 50),
            "p95_ms": percentil(latencias, 95),
            "p99_ms": percentil(latencias, 99),
            "throughput_rps": round(len(itens) / duracao, 2),
        }
    return resultado


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("jtl", type=Path)
    parser.add_argument("--cenario", required=True,
                        choices=("consultas", "disputa", "distintos", "manutencao"))
    parser.add_argument("--saida", type=Path, default=None,
                        help="opcional: gravar JSON de evidencias")
    args = parser.parse_args()
    resultado = analisar(args.jtl, args.cenario)
    texto = json.dumps(resultado, indent=2, ensure_ascii=False)
    if args.saida:
        args.saida.write_text(texto + "\n", encoding="utf-8")
    print(texto)
