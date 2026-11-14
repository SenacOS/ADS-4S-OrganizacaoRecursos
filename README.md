# Organização de Recursos

> **Resumo:** Sistema para gerenciar a alocação de salas, professores e materiais, impedindo conflitos de horário e demonstrando, com evidências objetivas, a qualidade, a segurança, a rastreabilidade e o desempenho da solução.

## Contexto Acadêmico

- **Instituição:** Senac
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Semestre:** 2026.2
- **Disciplina(s):** Qualidade de Software

A especificação oficial do projeto está em:
[especificacao-projeto](https://afonsolelis.github.io/aulas_senac/pages/qualidade2/especificacao-projeto.html)

> **Convenção deste documento:** o que é exigência do professor aparece como "oficial" ou "obrigatório". O que aparece como "proposta" ou "recomendação" é sugestão da equipe, sujeita a aprovação em ADR. Nada aqui indica que um requisito já esteja implementado.

**Leitura do estado do projeto:** a convenção acima distingue exigências oficiais de propostas da equipe. O estado efetivamente implementado é apresentado separadamente nas seções seguintes, com referência ao snapshot e às evidências correspondentes.

**Snapshot de implementação documentado:** branch `develop`, commit `b73c501536a275cdc89101cc7130c7b481e52396`, conferido em 13/11/2026. Naquela conferência, `main` ainda estava no commit `33ad05fbebed8760f2a058b2e69d1e39cabc7612`, de 27/10/2026.

## Integrantes da Equipe

| Nome | GitHub | Papel/Foco |
|---|---|---|
| Gabriel Silva Gomes | [@jovemOG-Dev](https://github.com/jovemOG-Dev) | Reservas e regras de domínio |
| Gabriel Rodrigues Fausto | [@gabriel-fausto](https://github.com/gabriel-fausto) | Recursos, modelo de dados e persistência |
| Marcos Boé | [@marcosboe](https://github.com/marcosboe) | Frontend, experiência de uso e testes E2E |
| Débora dos Santos | [@debbySantos](https://github.com/debbySantos) | Segurança, auditoria, CI e qualidade transversal |

O responsável por um módulo coordena sua implementação, mas testes, revisão e documentação são compartilhados: nenhum integrante é o único a testar ou revisar o próprio código.

## Visão geral
O sistema centraliza o cadastro e a consulta de recursos, a solicitação e a aprovação de reservas, a manutenção de agendas, a retirada e devolução de materiais, a auditoria das operações e os relatórios de utilização. As regras críticas são executadas e revalidadas no backend; a interface é um cliente da API e não substitui as verificações de autorização ou concorrência do servidor.

### Perfis de acesso

| Perfil | Responsabilidades principais |
|---|---|
| **Solicitante** | Consultar recursos e disponibilidade; criar, editar e cancelar as próprias reservas, conforme o estado e as regras de negócio. |
| **Responsável** | Aprovar ou rejeitar reservas de recursos restritos; iniciar, concluir e registrar não comparecimento; realizar retiradas e devoluções autorizadas. |
| **Administrador** | Administrar salas, professores, materiais, usuários, expediente e manutenção; consultar relatórios; executar ações administrativas permitidas pelo servidor. |

### Escopo funcional integrado

| Requisito | Funcionalidade disponibilizada |
|---|---|
| RF01 | Autenticação por sessão e autorização por perfil, com proteção CSRF. |
| RF02 | Cadastro, consulta, edição e desativação lógica de salas, professores e materiais. |
| RF03 | Pesquisa por tipo, capacidade, localização, competência, patrimônio e disponibilidade por período. |
| RF04 | Criação, edição e cancelamento de reservas, com validação do estado e do ator autenticado. |
| RF05 | Detecção de sobreposição para recursos compartilhados, incluindo a agenda de professores. |
| RF06 | Proteção transacional contra dupla reserva, com bloqueio ordenado dos recursos. |
| RF07 | Fila de aprovação e rejeição de reservas que envolvem recursos restritos. |
| RF08 | Bloqueios de manutenção e configuração de expediente, integrados à verificação de disponibilidade. |
| RF09 | Registro de retirada e devolução de materiais e equipamentos, com controle de unidade em uso. |
| RF10 | Histórico de auditoria das operações relevantes, com ator, ação, estado anterior/posterior e correlação. |
| RF11 | Notificações por outbox transacional, com modo de demonstração simulado e gateway HTTP testável. |
| RF12 | Relatórios de utilização, carga horária e conflitos evitados, integrados à API real. |
| RF13 | Interface responsiva, feedback de operações e tratamento consistente de erros e sessão. |
| RF14 | Contratos da API, decisões arquiteturais e documentação dos fluxos públicos. |

## Regras de negócio centrais

- Intervalos de reserva usam a convenção semiaberta `[início, fim)`: o início pertence ao intervalo e o fim não. Reservas consecutivas podem compartilhar a fronteira sem sobreposição.
- O horário final deve ser posterior ao inicial, e a reserva deve caber no expediente aplicável.
- Reservas comuns são autoaprovadas; reservas com recurso restrito permanecem `SOLICITADA` até decisão do Responsável e já bloqueiam a agenda.
- Reservas em `SOLICITADA`, `APROVADA` ou `EM_USO` ocupam a agenda. Estados finais liberam o recurso, conforme a matriz de transições.
- A detecção de conflitos considera salas, materiais, professores, manutenção e retiradas abertas.
- A criação, edição, aprovação e operações concorrentes usam transações e locks no MySQL/InnoDB; recursos são bloqueados em ordem crescente de ID.
- A identidade e o perfil do ator vêm da sessão autenticada, nunca de campos enviados pelo navegador.
- A reserva não é apagada fisicamente ao ser cancelada; histórico, auditoria e notificação são preservados.
- A edição não altera a necessidade de aprovação. Reserva restrita já aprovada não é editável pelo fluxo de PATCH (Q2).
- No contrato da API, o cancelamento administrativo de reserva de terceiro exige justificativa de até 500 caracteres, armazenada em `motivo_cancelamento`, separada de `motivo_decisao` (Q5).

**Compatibilidade da interface no snapshot:** a regra Q5 está implementada no backend; o cliente `reservas.js` ainda envia o cancelamento sem corpo. Por isso, o cancelamento de reserva de terceiro pelo Administrador via tela retorna HTTP 400 até que a interface envie `motivo`. O contrato e o comportamento do endpoint estão descritos em [`docs/api/reservas-contrato.md`](docs/api/reservas-contrato.md).

## Arquitetura e tecnologias

A solução utiliza um **monólito modular**: uma única aplicação Spring Boot, com módulos de negócio separados por responsabilidade e frontend estático servido pela própria aplicação.

| Camada | Tecnologias e responsabilidade |
|---|---|
| Backend | Java 21, Spring Boot 3.5.7, Spring MVC, Spring Security, Jakarta Validation e Maven. |
| Persistência | MySQL 8.4 com InnoDB, Spring Data JPA/JDBC e migrações versionadas com Flyway. |
| Frontend | HTML, CSS e JavaScript; arquivos estáticos em `backend/src/main/resources/static/`. Node.js é utilizado somente nas verificações de desenvolvimento. |
| Testes | JUnit 5, Spring Security Test, Testcontainers/MySQL, WireMock e Playwright. |
| Qualidade | GitHub Actions, JaCoCo e Apache JMeter; etapa SonarCloud configurada no workflow. |

### Módulos do backend

```text
backend/src/main/java/br/senac/recursos/
├── seguranca/       # sessão, autenticação, usuários e perfis
├── recurso/         # salas, professores, materiais, expediente e manutenção
├── reserva/         # domínio, aplicação, API e persistência de reservas
├── movimentacao/    # retirada e devolução de materiais
├── auditoria/       # trilha de auditoria e consultas
├── notificacao/     # outbox, processamento e gateway
├── config/          # composição e configuração Spring
└── shared/          # contratos e componentes compartilhados
```

O frontend está em `backend/src/main/resources/static/`. As migrações SQL ficam em `backend/src/main/resources/db/migration/`; os testes backend ficam em `backend/src/test/java/`; os testes frontend e auxiliares ficam em `tests/`.

### Decisões arquiteturais

As decisões aprovadas estão registradas em [`docs/arquitetura/adr/`](docs/arquitetura/adr/README.md): monólito modular, MySQL/InnoDB, estratégia de concorrência, sessão Spring Security, política de reservas e materiais e fuso horário/notificações. O ADR-007 registra o fechamento delegado de contratos, vínculos e demonstração RF11.

## Qualidade e evidências

A suíte backend é executada com `mvn -f backend/pom.xml clean verify`. O build integra testes unitários/API, integrações MySQL com Testcontainers e verificações JaCoCo. Os limites configurados no POM são **80% de cobertura de linhas** e **70% de branches**.

O workflow também executa quatro cenários JMeter em ambiente isolado: consulta de recursos, disputa por uma mesma reserva, reservas em recursos distintos e disputa entre manutenção e reserva. Os resultados são preservados como artefatos da execução.

As evidências recentes estão separadas por camada e execução:

- [Integração RF12 real](docs/testes/marcos-6-integracao-real-resultados.md): 13 cenários HTTP com Spring, MySQL e Chrome; regressão frontend com 97 testes unitários e 346 execuções de navegador; execução Maven de package com 277 testes unitários/HTTP. Essas contagens pertencem a execuções distintas e não devem ser somadas.
- [Fechamento das etapas 1 a 5](docs/testes/marcos-fechamento-e2e-1-resultados.md): cenários E2E reais de sessão, pesquisa, concorrência pontual, edição e movimentações, com limites documentados.
- [Resultados do JMeter](docs/qualidade/jmeter/evidencias-2026-11-10.md) e [planos de carga](docs/qualidade/jmeter/README.md).
- [Testes de segurança](docs/qualidade/seguranca.md), [auditoria](docs/qualidade/rf10-auditoria.md) e [notificações](docs/qualidade/rf11-notificacoes.md).

Na execução de CI associada ao PR #43, o job Maven/Testcontainers/JaCoCo terminou com `BUILD SUCCESS` e `All coverage checks have been met`; o job JMeter também terminou com sucesso. A etapa SonarCloud, na mesma execução, retornou `Not authorized or project not found`. Portanto, não se declara um Quality Gate SonarCloud aprovado com base nessa execução.

## Executar localmente

### Pré-requisitos

- JDK 21;
- Maven 3.9 ou compatível;
- Docker com Docker Compose, para MySQL e Testcontainers;
- Node.js 24 ou compatível e npm, apenas para verificações do frontend;
- Chromium/Chrome, para os testes de navegador.

### 1. Preparar o MySQL

Na raiz do repositório, crie um arquivo `.env` (não o versione) com credenciais locais:

```dotenv
DB_PASSWORD=uma_senha_local
MYSQL_ROOT_PASSWORD=outra_senha_local
```

Inicie o banco:

```bash
docker compose up -d mysql
```

O Compose publica o MySQL somente em `127.0.0.1:3306`, cria o banco `organizacao_recursos` e o usuário `recursos`. A URL e o usuário padrão do Spring Boot já apontam para essa configuração; `DB_PASSWORD` deve ter o mesmo valor usado no Compose.

### 2. Executar testes e verificações do backend

Na raiz do repositório:

```bash
mvn -f backend/pom.xml clean verify
```

Esse comando exige Docker ativo para os testes de integração com Testcontainers e gera os relatórios Surefire, Failsafe e JaCoCo.

### 3. Iniciar a aplicação local

O `.env` é lido pelo Docker Compose, mas não é carregado automaticamente pelo processo Maven. No PowerShell, defina as variáveis necessárias no terminal antes de iniciar o Spring Boot:

```powershell
$env:DB_PASSWORD = "a_mesma_senha_configurada_no_env"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:DEMO_ADMIN_EMAIL = "admin@local.test"
$env:DEMO_ADMIN_SENHA = "uma_senha_com_12_caracteres_ou_mais"
$env:RECURSOS_API_ENABLED = "true"
$env:MOVIMENTACOES_API_ENABLED = "true"
$env:RESERVAS_API_ENABLED = "true"
$env:NOTIFICACOES_WORKER_ENABLED = "true" # opcional, para processar a outbox simulada
mvn -f backend/pom.xml spring-boot:run
```

O perfil `local` pode criar o primeiro Administrador a partir de `DEMO_ADMIN_EMAIL` e `DEMO_ADMIN_SENHA`, se o e-mail ainda não existir. A senha inicial precisa ter pelo menos 12 caracteres. Não há credenciais padrão distribuídas pelo projeto.

As APIs de recursos, movimentações e reservas ficam desabilitadas por padrão (`false`) e devem ser habilitadas explicitamente no ambiente local. O worker de notificações permanece desabilitado por padrão; habilite `NOTIFICACOES_WORKER_ENABLED=true` quando quiser processar a outbox no modo simulado por log (gateway vazio). Para ambientes HTTPS, configure `SESSION_COOKIE_SECURE=true`.

Com o Spring Boot em execução, acesse `http://localhost:8080/login.html`.

### 4. Verificar o frontend

Na raiz do repositório:

```bash
npm ci
npx playwright install chromium
npm run build
```

O script `build` executa lint, verificação de tipos, testes unitários e testes Playwright. O frontend é servido pelo Spring Boot; Node.js não é necessário para executar a aplicação em uso normal.

## Documentação de referência

| Documento | Conteúdo |
|---|---|
| [RTM](docs/RTM.md) | Rastreabilidade dos RF01–RF14 e evidências. |
| [Contratos da API](docs/api/) | Rotas, payloads, permissões, filtros e respostas. |
| [ADRs](docs/arquitetura/adr/README.md) | Decisões arquiteturais e regras adotadas. |
| [Sequência de reservas](docs/arquitetura/sequencia-reserva.md) | Fluxo transacional de criação e controle de conflitos. |
| [Qualidade](docs/qualidade/relatorio-evidencias.md) | Evidências, cobertura, segurança e decisões de qualidade. |
| [Relatório do módulo de reservas](docs/entrega/relatorio-modulo-reserva.md) | Domínio, integração, testes e manutenção do módulo `reserva/`. |
