#!/usr/bin/env python3
"""Executa JMeter em ambiente local e DESCARTAVEL (sem tocar no banco compartilhado).

Dependencias: Docker Desktop, Java, Maven e Apache JMeter no PATH.
Saidas ficam em quality-output/jmeter e NAO sao enviadas ao GitHub automaticamente.
"""
import argparse
import datetime as dt
import http.cookiejar
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

from analisar_jtl import analisar

ROOT = Path(__file__).resolve().parents[3]
CONTAINER = "senac-jmeter-descartavel"
DB_PORT = 33316
HTTP_PORT = 18080
API = "http://127.0.0.1:" + str(HTTP_PORT)
PASTA = Path(__file__).resolve().parent


def cmd(*args, check=True, **kwargs):
    return subprocess.run(list(args), check=check, **kwargs)


def ferramenta(nome):
    if shutil.which(nome) is None:
        raise RuntimeError("Ferramenta ausente no PATH: " + nome)


def requisicao(opener, rota, method="GET", headers=None, body=None):
    dados = None
    if body is not None:
        if isinstance(body, dict):
            dados = json.dumps(body).encode("utf-8")
        elif isinstance(body, str):
            dados = body.encode("utf-8")
        else:
            dados = body
    req = urllib.request.Request(API + rota, data=dados,
                                 headers=headers or {}, method=method)
    try:
        with opener.open(req, timeout=5) as resposta:
            corpo = resposta.read().decode("utf-8")
            return resposta.status, json.loads(corpo) if corpo else {}
    except urllib.error.HTTPError as erro:
        corpo = erro.read().decode("utf-8", errors="replace")
        return erro.code, corpo


def preparar_usuario(senha_admin, senha_solicitante):
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    status, csrf = requisicao(opener, "/api/auth/csrf")
    if status != 200:
        raise RuntimeError("CSRF inicial nao respondeu 200")
    form = urllib.parse.urlencode({
        "email": "admin.jmeter@teste.local", "senha": senha_admin
    })
    status, _ = requisicao(opener, "/api/auth/login", "POST",
                           {"Content-Type": "application/x-www-form-urlencoded",
                            csrf["header"]: csrf["token"]}, form)
    if status != 204:
        raise RuntimeError("Login de administrador de TESTE falhou: HTTP " + str(status))
    status, csrf = requisicao(opener, "/api/auth/csrf")
    if status != 200:
        raise RuntimeError("CSRF depois do login falhou")
    status, resposta = requisicao(opener, "/api/usuarios", "POST", {
        "Content-Type": "application/json", csrf["header"]: csrf["token"]
    }, {"nome": "Solicitante de teste", "email": "solicitante.jmeter@teste.local",
        "senha": senha_solicitante, "perfil": "SOLICITANTE"})
    if status != 201:
        raise RuntimeError("Nao foi possivel criar Solicitante de teste: HTTP "
                           + str(status) + " " + str(resposta)[:200])


def sql_isolado(sql, senha_db, *, result=False):
    processo = cmd("docker", "exec", "-i", "-e", "MYSQL_PWD=" + senha_db,
                   CONTAINER, "mysql", "-urecursos", "--skip-column-names",
                   "organizacao_recursos", input=sql, text=True,
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return processo.stdout.strip() if result else None


def aguardar_banco(senha_db):
    for _ in range(75):
        r = cmd("docker", "exec", "-e", "MYSQL_PWD=" + senha_db,
                CONTAINER, "mysqladmin", "ping", "-h", "127.0.0.1",
                "-urecursos", "--silent",
                check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if r.returncode == 0:
            return
        time.sleep(2)
    raise RuntimeError("MySQL nao iniciou dentro do limite; ver docker logs " + CONTAINER)


def aguardar_api(processo):
    opener = urllib.request.build_opener()
    for _ in range(120):
        if processo.poll() is not None:
            raise RuntimeError("Spring Boot encerrou antes de abrir a porta")
        try:
            code, _ = requisicao(opener, "/api/auth/csrf")
            if code == 200:
                return
        except (OSError, TimeoutError):
            pass
        time.sleep(2)
    raise RuntimeError("Backend nao abriu a porta " + str(HTTP_PORT))


def preparar_recursos(senha_db):
    entradas = []
    salas = []
    for id_ in range(101, 106):
        entradas.append(f"({id_},'SALA','JMETER-{id_}',TRUE,FALSE)")
        salas.append(f"({id_},'SALA',30,'BLOCO-JMETER','LAB')")
    horarios = ",".join(
        f"({dia},'08:00:00','22:00:00')" for dia in range(1, 8))
    sql_isolado(
        "INSERT INTO recursos(id,tipo,codigo,ativo,restrito) VALUES "
        + ",".join(entradas) + ";"
        + "INSERT INTO salas(recurso_id,tipo,capacidade,localizacao,tipo_sala) VALUES "
        + ",".join(salas) + ";"
        + "INSERT INTO horarios_funcionamento(dia_semana,hora_inicio,hora_fim) VALUES "
        + horarios + ";", senha_db)


def dia_de_teste():
    agora = dt.datetime.now(ZoneInfo("America/Sao_Paulo"))
    data = (agora + dt.timedelta(days=1)).date()
    while data.weekday() >= 5:
        data += dt.timedelta(days=1)
    return data


def datas(data, hora):
    tz = ZoneInfo("America/Sao_Paulo")
    inicio = dt.datetime.combine(data, dt.time(hora, 0), tzinfo=tz)
    fim = inicio + dt.timedelta(hours=1)
    return inicio.isoformat(timespec="seconds"), fim.isoformat(timespec="seconds")


def verificar_contagem(senha_db, data, hora, recurso):
    inicio, fim = datas(data, hora)
    utc_inicio = dt.datetime.fromisoformat(inicio).astimezone(
        dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    utc_fim = dt.datetime.fromisoformat(fim).astimezone(
        dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    consulta = (
        "SELECT COUNT(*) FROM reservas r JOIN reserva_recursos rr "
        "ON r.id=rr.reserva_id WHERE rr.recurso_id=" + str(recurso)
        + " AND r.inicio_utc='" + utc_inicio + "'"
        + " AND r.fim_utc='" + utc_fim + "'"
        + " AND r.status IN ('SOLICITADA','APROVADA','EM_USO');"
    )
    return int(sql_isolado(consulta, senha_db, result=True))


def executar_plano(chave, nome, data, hora, pasta_saida, email, senha, senha_admin):
    origem = PASTA / (chave + ".jmx")
    jtl = pasta_saida / (chave + ".jtl")
    html = pasta_saida / (chave + "-html")
    log = pasta_saida / (chave + "-jmeter.log")
    inicio, fim = datas(data, hora)
    parametros = [
        "-Jhost=127.0.0.1", "-Jport=" + str(HTTP_PORT),
        "-Jemail=" + email, "-Jsenha=" + senha,
        "-JemailAdmin=admin.jmeter@teste.local", "-JsenhaAdmin=" + senha_admin,
        "-JrecursoConflito=101", "-Jthreads=8" if "02-" in chave else "-Jthreads=5",
        "-JthreadsAdmin=1", "-Jramp=1", "-Jloops=10",
        "-Jinicio=" + inicio, "-Jfim=" + fim,
        "-Jcsv=" + str(PASTA / "dados-recursos-exemplo.csv"),
    ]
    print("Executando:", chave, "- logs:", log, flush=True)
    with log.open("w", encoding="utf-8") as saida:
        resultado = cmd("jmeter", "-n", "-t", str(origem), "-l", str(jtl),
                        "-e", "-o", str(html), *parametros,
                        check=False, cwd=str(ROOT), stdout=saida,
                        stderr=subprocess.STDOUT)
    if resultado.returncode != 0:
        raise RuntimeError("JMeter retornou erro no plano " + chave
                           + "; consulte " + str(log))
    if not jtl.is_file():
        raise RuntimeError("JMeter nao produziu arquivo JTL no plano " + chave)
    cenario = {"01-consultas": "consultas", "02-disputa-reserva": "disputa",
               "03-recursos-distintos": "distintos",
               "04-manutencao-vs-reserva": "manutencao"}[chave]
    resumo = analisar(jtl, cenario)
    falhas = sum(v["erros_inesperados"] for v in resumo["amostras"].values())
    resumo["verificacao_http"] = "APROVADO" if falhas == 0 else "FALHA"
    return resumo


def main():
    for ferramenta_nome in ("docker", "mvn", "jmeter", "java"):
        ferramenta(ferramenta_nome)
    cmd("docker", "info", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if cmd("docker", "container", "inspect", CONTAINER, check=False,
           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
        raise RuntimeError("Container " + CONTAINER
                           + " ja existe; nao sera alterado. Verifique manualmente.")
    # Nunca usar um backend que ja esteja rodando na porta de teste.
    try:
        requisicao(urllib.request.build_opener(), "/api/auth/csrf")
        raise RuntimeError("Porta HTTP de teste ocupada: " + str(HTTP_PORT))
    except urllib.error.URLError:
        pass

    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = ROOT / "quality-output" / "jmeter" / stamp
    out.mkdir(parents=True, exist_ok=False)
    senha_db = "JmeterDb" + secrets.token_hex(8) + "!"
    senha_root = "JmeterRoot" + secrets.token_hex(8) + "!"
    senha_admin = "JmeterAdmin" + secrets.token_hex(8) + "!"
    senha_usuario = "JmeterUsuario" + secrets.token_hex(8) + "!"
    app = None
    banco_criado = False
    try:
        cmd("docker", "run", "--rm", "-d", "--name", CONTAINER,
            "-p", "127.0.0.1:" + str(DB_PORT) + ":3306",
            "-e", "MYSQL_ROOT_PASSWORD=" + senha_root,
            "-e", "MYSQL_DATABASE=organizacao_recursos",
            "-e", "MYSQL_USER=recursos",
            "-e", "MYSQL_PASSWORD=" + senha_db,
            "mysql:8.4", stdout=subprocess.DEVNULL)
        banco_criado = True
        aguardar_banco(senha_db)

        env = os.environ.copy()
        env.update({
            "SERVER_PORT": str(HTTP_PORT),
            "SPRING_PROFILES_ACTIVE": "local",
            "DB_URL": "jdbc:mysql://127.0.0.1:" + str(DB_PORT)
                + "/organizacao_recursos?connectionTimeZone=UTC"
                + "&forceConnectionTimeZoneToSession=true",
            "DB_USER": "recursos",
            "DB_PASSWORD": senha_db,
            "DEMO_ADMIN_EMAIL": "admin.jmeter@teste.local",
            "DEMO_ADMIN_SENHA": senha_admin,
            "RECURSOS_API_ENABLED": "true",
            "RESERVAS_API_ENABLED": "true",
            "NOTIFICACOES_WORKER_ENABLED": "false",
        })
        log_backend = (out / "backend.log").open("w", encoding="utf-8")
        try:
            app = subprocess.Popen(
                ["mvn", "-f", "backend/pom.xml", "spring-boot:run"],
                cwd=ROOT, env=env, stdout=log_backend,
                stderr=subprocess.STDOUT, start_new_session=True)
        finally:
            log_backend.close()
        aguardar_api(app)
        preparar_recursos(senha_db)
        preparar_usuario(senha_admin, senha_usuario)
        data = dia_de_teste()
        casos = [("01-consultas", 10), ("02-disputa-reserva", 10),
                 ("03-recursos-distintos", 12),
                 ("04-manutencao-vs-reserva", 14)]
        resultados = []
        for chave, hora in casos:
            try:
                resumo = executar_plano(chave, "", data, hora, out,
                                       "solicitante.jmeter@teste.local",
                                       senha_usuario, senha_admin)
                if chave == "02-disputa-reserva":
                    resumo["ativas_no_banco"] = verificar_contagem(
                        senha_db, data, hora, 101)
                    resumo["invariante_banco"] = resumo["ativas_no_banco"] == 1
                if chave == "03-recursos-distintos":
                    resumos = [verificar_contagem(senha_db, data, hora, i)
                               for i in range(101, 106)]
                    resumo["reservas_por_recurso"] = resumos
                    resumo["invariante_banco"] = all(x == 1 for x in resumos)
                resultados.append(resumo)
            except Exception as exc:
                resultados.append({"cenario": chave, "erro": str(exc)})
        documento = {
            "execucao_local": dt.datetime.now(dt.timezone.utc).isoformat(),
            "data_teste": data.isoformat(),
            "somente_local": True,
            "cenarios": resultados,
        }
        (out / "resultado.json").write_text(
            json.dumps(documento, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8")
        falhas = [i for i in resultados
                  if "erro" in i or i.get("verificacao_http") != "APROVADO"
                  or i.get("invariante_banco") is False]
        print("Evidencias em", out, flush=True)
        print("Resultado:", "FALHA" if falhas else "APROVADO", flush=True)
        if falhas:
            print("Cenarios para investigar:", [x.get("cenario") for x in falhas])
            return 1
        return 0
    finally:
        if app is not None and app.poll() is None:
            # Maven pode iniciar Java como processo filho; encerrar grupo local.
            import signal
            try:
                os.killpg(app.pid, signal.SIGTERM)
                app.wait(timeout=10)
            except (ProcessLookupError, subprocess.TimeoutExpired):
                try:
                    os.killpg(app.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
        if banco_criado:
            cmd("docker", "stop", CONTAINER, check=False,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as falha:
        print("ERRO:", falha, file=sys.stderr)
        raise SystemExit(1)
