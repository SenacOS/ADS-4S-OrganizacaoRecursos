# Ambiente local de integração de Marcos

Preparado em 12/11/2026 no Windows. Spring serve o frontend na mesma origem, usando MySQL próprio. O ambiente é de desenvolvimento/teste; não modifica a implantação do projeto.

## Uso neste computador

Na raiz do repositório, com Node e as dependências de desenvolvimento já disponíveis:

```powershell
node tests/e2e-local/controle.cjs status
node tests/e2e-local/controle.cjs iniciar
node tests/e2e-local/validar.cjs
```

`iniciar` reutiliza a instância **isolada já preparada**; não instala ferramentas nem inicializa um banco vazio. O endereço é **http://127.0.0.1:18080/login.html**. Credenciais fictícias dos três perfis estão no arquivo privado `.aiox-core/local/e2e/credentials.json`; abri-lo localmente para usar a tela. Não copiar valores para evidências ou Git. As contas não são as do ambiente compartilhado.

```powershell
node tests/e2e-local/controle.cjs parar
```

`parar` verifica UUID, datadir e porta do MySQL e executável, JAR e data de criação do processo Java. Se houver divergência, recusa o encerramento. Não usa `taskkill` genérico e não apaga dados. `status` informa falha quando o ambiente está parado ou sua identidade não confere; não significa que os dados foram removidos. Os auxiliares são específicos de Windows.

## O que foi preparado

| Componente | Configuração local |
|---|---|
| Java | Temurin 21.0.13+9 portátil; o JDK 25 do sistema foi preservado |
| Maven | 3.9.16 portátil; cache próprio |
| MySQL | 8.4.13 ZIP, `127.0.0.1:13307`, base `qs_marcos_e2e` |
| Backend | `127.0.0.1:18080`, perfil `local`, JAR existente do projeto |
| Banco | Flyway V1–V5; dados e usuários fictícios exclusivos |
| APIs | Recursos, reservas e movimentações habilitadas por variáveis apenas no processo local |
| Notificações | Outbox real persistida; worker desligado; nenhum envio externo |
| Navegador | Chrome instalado, headless, viewport 1440×1000 e fuso de São Paulo no smoke real |

Não foram alterados `application.yml`, POM, migrações, Java, dependências, serviços Windows ou PATH/JAVA_HOME persistentes. A conta de aplicação tem privilégios somente na base isolada; isso não reproduz a segregação de grants de produção para imutabilidade da auditoria.

## Artefatos privados e reprodução em outra máquina

Tudo abaixo é ignorado pelo Git e **não acompanha clone/pull**:

| Caminho sob `.aiox-core/local/` | Conteúdo |
|---|---|
| `tools/paths.json` | Caminhos absolutos dos diretórios `jdk`, `maven`, `mysql` e respectivas versões |
| `tools/` | ZIPs verificados e distribuições extraídas |
| `e2e/credentials.json` | `db` (host, port, name, user, password), `rootPassword`, `admin`, `solicitante`, `responsavel` (email/password fictícios) |
| `e2e/mysql.ini` | basedir/datadir próprios, bind loopback, porta 13307, mysqlx e binlog desligados, timezone +00:00 |
| `e2e/root-client.ini` | Cliente root TCP em loopback; senha privada fora dos argumentos |
| `e2e/mysql-data/` | Instância inicializada exclusivamente para este ambiente |
| `e2e/state.json` | Portas, nome/baseURL, UUID conferido e identidades dos processos locais |
| `e2e/m2/`, logs e `e2e/resultados/` | Cache Maven, logs brutos e rodadas sem sobrescrever as anteriores |

Para preparar outro computador, repetir o provisionamento em diretório novo: baixar/verificar as distribuições oficiais do [inventário](../testes/marcos-e2e-local-2026-11-12/inventario.json), extrair em `local/tools`, gerar senhas aleatórias novas e os arquivos privados acima. Inicializar **apenas** `local/e2e/mysql-data` com `mysqld --defaults-file=<mysql.ini> --initialize-insecure --console`; iniciar vinculado a loopback e definir imediatamente a senha root. Criar a base `qs_marcos_e2e` e conta própria limitada a ela, sem reutilizar ou limpar outra instância. O runtime Visual C++ já existia neste computador; conferir o requisito oficial ao preparar outro.

Registrar UUID, datadir e porta obtidos com `SELECT @@server_uuid,@@datadir,@@port`, além do processo que usa o JAR. O estado deste computador não deve ser copiado para outro. O controle exige essa identidade prévia e falha de forma conservadora se faltar. Nunca inventar UUID/PID para superar essa validação.

Os downloads vieram de [Adoptium](https://adoptium.net/en-GB/marketplace?arch=x64&os=windows&version=21), [Apache Maven](https://maven.apache.org/download.cgi) e [MySQL](https://dev.mysql.com/downloads/mysql/8.4.html?os=3). O inventário diferencia hash publicado conferido de hash SHA256 calculado localmente. No MySQL a conferência publicada foi MD5; também foram conferidas assinaturas Authenticode dos executáveis Java/MySQL. Isso não transforma MD5 em garantia criptográfica de autenticidade.

## Atualizar o JAR após mudar o frontend

Parar primeiro os processos próprios. No PowerShell, manter os argumentos `-D...` entre aspas:

```powershell
node tests/e2e-local/controle.cjs parar
$qsTools = Get-Content -Raw .aiox-core/local/tools/paths.json | ConvertFrom-Json
$env:JAVA_HOME = $qsTools.jdk
$env:Path = (Join-Path $qsTools.jdk 'bin') + ';' + $env:Path
$env:MAVEN_OPTS = '-Djavax.net.ssl.trustStoreType=Windows-ROOT'
$qsCache = (Resolve-Path .aiox-core/local/e2e/m2).Path
& (Join-Path $qsTools.maven 'bin/mvn.cmd') '-B' '--no-transfer-progress' '-f' 'backend/pom.xml' ('-Dmaven.repo.local=' + $qsCache) '-Dmaven.test.skip=true' '-DskipITs' 'package'
if ($LASTEXITCODE -ne 0) { throw 'Empacotamento falhou; conferir log antes de iniciar.' }
node tests/e2e-local/controle.cjs iniciar
node tests/e2e-local/validar.cjs
```

Essas variáveis valem para a sessão; não usam `setx` nem desabilitam TLS. O trust store Windows é usado pelo Maven para os certificados já confiados no sistema. O comando acima **omite os testes Maven**, para produzir o artefato neste computador sem Docker. Não substitui `mvn clean verify`/Testcontainers da equipe. O smoke real e a regressão frontend têm comandos e resultados próprios.

O validador compara SHA256 de `/js/datas.js` e `/js/administracao-recursos.js` servidos com as fontes locais. Se diferirem, exige novo empacotamento/reinício. Sua saída fica em uma pasta datada privada; somente as evidências sanitizadas selecionadas são copiadas para `docs/testes`.

## Alcance da validação

O smoke cria recursos com identificação única e usa o relógio atual de São Paulo, com período no mesmo dia e expediente de teste para toda a semana. Executar longe da virada do dia. Não exclui dados; uma rodada nova não deve repetir uma escrita de resultado incerto. O registro antigo da retirada que revelou FE-004 foi preservado como pendência, e os testes posteriores usaram materiais novos.

Fluxos reais: login/logout dos três perfis, CSRF e algumas negativas de autorização, cadastro/edição dos recursos, manutenção/desativação, expediente, criação comum/restrita, conflito, PATCH/cancelamento por ID conhecido, retirada e devolução. A consulta SQL é somente leitura e confere persistência/auditoria/outbox dos cenários.

GETs de lista/detalhe/fila retornaram 405 nesta base. Não há interceptação, mock de leitura ou aprovação real pela tela da fila. A prova por HTTP de PATCH/cancelamento não implementa nem valida a futura tela de reabertura. Expiração por timeout, corridas concorrentes, atrasos após o prazo, teclado/móvel e todas as negativas de escopo ainda precisam de cenários integrados complementares; os testes controlados existentes continuam separados. [Resultados, falhas anteriores e limites](../testes/marcos-e2e-local-2026-11-12-resultados.md).
