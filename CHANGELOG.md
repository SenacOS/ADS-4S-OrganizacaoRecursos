# CHANGELOG — Organização de Recursos

## [v1.0.0-rc1] — publicada em 14/11/2026

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.

**Snapshot histórico de 13/11/2026:** `main` em `548f8b0b95980a3e292f271b9676105473822ead`, integrada pelo [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

### Funcionalidades presentes na árvore integrada

- RF01: autenticação por sessão, autorização por papéis e proteção CSRF.
- RF02/RF03: cadastro e pesquisa de salas, professores e materiais, filtros de disponibilidade.
- RF04–RF08: criação, edição, cancelamento, aprovação/rejeição, consistência de reservas, manutenção e expediente.
- RF09: retirada e devolução de materiais.
- RF10: auditoria de operações relevantes.
- RF11: notificações baseadas em outbox transacional, com execução simulada documentada.
- RF12: relatórios de utilização e conflitos evitados.
- RF13/RF14: frontend HTML/CSS/JS responsivo, integração de API e documentação.
- Ajustes Q1, Q3, Q5, Q8 e Q9 incorporados segundo o histórico de PRs e `docs/RTM.md`.

### Qualidade e documentação

- Suítes JUnit/Spring, Testcontainers/MySQL, Playwright e quatro cenários JMeter;
- JaCoCo e workflow GitHub Actions;
- Dossiês e matrizes existentes em `docs/qualidade/`, `docs/testes/`, `docs/RTM.md`;
- Pacote documental de entrega: `docs/entrega/checklist.md`, `docs/evidencias/README.md`, `docs/decisao-qualidade.md`, `docs/relatorio-qualidade.md`, `docs/performance/resultado-01.md` e `docs/defeitos/README.md`.

### Pendências para aprovar a versão já publicada

- Comprovar clone limpo, execução da aplicação e testes; o repositório ainda não possui Maven Wrapper;
- CI global verde na `main`: Maven/JaCoCo e JMeter passaram no SHA da tag, porém o scanner SonarCloud falhou por permissão/configuração;
- Conferir e anexar os artefatos de testes e carga já emitidos no **mesmo SHA da tag**, antes do aceite;
- Revisão/aceite formal do grupo; a tag publicada é *lightweight*, embora a atividade solicite tag anotada. Registrar essa divergência e deliberar sobre a forma correta de atender à exigência sem mover a tag publicada.

**A publicação da release está comprovada; a aprovação integral de qualidade não está.** Se for preciso corrigir algo depois de publicar `v1.0.0-rc1`, criar uma nova tag `v1.0.0-rc2`, sem mover a anterior.
