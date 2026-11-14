# Changelog — Organização de Recursos

Histórico resumido do conteúdo integrado. **Pré-release ainda não publicado**: `v1.0.0-rc1` é o nome planejado, não uma tag criada.

## [Unreleased] — candidato a `v1.0.0-rc1` (13/11/2026)

**Referência:** [main `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), resultado do [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

### Recursos incluídos no snapshot

- RF01: sessão Spring Security, CSRF, perfis e autorização por escopo Q9.
- RF02–RF03 e RF08: gestão, pesquisa e disponibilidade de salas, professores e materiais, manutenção e expediente.
- RF04–RF07: criação, edição, cancelamento, conflitos, locks ordenados, fila de aprovação e proteção Q1/Q3/Q5/Q8.
- RF09–RF11: movimentações, auditoria transacional e notificações por outbox com demonstração simulada.
- RF12–RF14: relatórios de utilização, frontend responsivo, contratos HTTP, ADRs e documentação de fluxos.

### Evidências disponíveis (não equivalentes a release certificado)

- [CI do PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976): 287 testes Surefire + 79 Failsafe, JaCoCo 92,58% de linhas / 76,39% de branches, quatro cenários JMeter aprovados. O **scanner Maven SonarCloud falhou**, portanto o workflow inteiro terminou com failure.
- [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47): integração `develop` → `main` com aprovação independente, **sem CI própria de main observada**.
- [RTM](docs/RTM.md), [diagramas de sequência](docs/arquitetura/sequencia-reserva.md), [relatórios de qualidade](docs/qualidade/relatorio-evidencias.md), [índice em preparação](docs/evidencias/README.md).

### Limitações antes da primeira tag

Sem CI verde da `main` ligada ao SHA de release; sem clone limpo e `./mvnw -B verify` comprovados; scanner Sonar com erro; diagramas de contexto/componentes não identificados; assinatura/decisão coletiva não registrada. RF11 validada no modo simulado, sem comprovar envio externo.

### Política de versão

Após corrigir os bloqueadores, criar `v1.0.0-rc1` **anotada** sobre o SHA aprovado, publicar evidências do mesmo SHA e obter decisão da equipe. Se houver correção após publicar, usar `v1.0.0-rc2`. **Nunca mover ou sobrescrever tags publicadas.**


## Atualização de preparação da entrega — 14/11/2026

- A documentação dos três prompts já foi integrada à `main` pelo [PR #48](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/48); este PR #49 contém uma versão alternativa e **não deve ser mesclado sem resolver a duplicação**.
- A correção do workflow está proposta no [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50), com testes Maven/JaCoCo/JMeter nos PRs e SonarCloud na `main`. **A existência desse PR não comprova CI verde na `main`**.
- A tag anotada `v1.0.0-rc1` está **planejada para publicação após os merges e a verificação do SHA final**. URL para conferência: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tags . **Não registrar tag criada antes de confirmar que existe**.
- Evidências já verificadas no PR #45: 287 testes Surefire, 79 Failsafe, JaCoCo 92,58% linhas / 76,39% branches e quatro cenários JMeter. Essas métricas são históricas, **não equivalem à validação do SHA final**.
- Para encerrar a entrega, preencher com links reais: execução verde da `main`, SHA da tag, resultado do SonarCloud na `main`, reprodução limpa e aceite individual dos integrantes. Esses itens não são atestados automaticamente por este documento.


## Estado atualizado da entrega — 14/11/2026

> **Esta seção substitui afirmações históricas acima sobre tag inexistente, CI não executada na main e workflow sem gatilho main.** As seções anteriores descrevem a inspeção de 13/11/2026, não o estado atual.

- **PR #50 integrado e verificação de PR aprovada:** o workflow foi corrigido para executar CI em pushes na `main` e scanner SonarCloud somente nesse evento. Maven, Testcontainers, JaCoCo e JMeter permanecem como verificações de qualidade.
- **CI da main executada, mas NÃO verde:** workflow `CI e SonarCloud` #92, commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf), terminou em **failure** na etapa de SonarCloud: `Not authorized or project not found`. A análise foi acionada na branch `main`; a falha indica necessidade de conferir permissões do token e identificação do projeto, não prova falha de testes.
- **Pendência administrativa explícita:** revisar `SONAR_TOKEN`, `sonar.projectKey`, `sonar.organization`, organização do projeto e autorização para análise. Depois, reexecutar a CI na `main` e guardar a URL do resultado. Não declarar Quality Gate aprovado sem essa evidência.
- **Tag/release publicada:** [`v1.0.0-rc1`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1). A publicação da release não comprova CI verde no SHA da tag; a correspondência do SHA e o gate permanecem por validar.
- **Evidências históricas preservadas:** CI do PR #45 registrou 287 testes Surefire, 79 Failsafe, JaCoCo 92,58% linhas e 76,39% branches, além de quatro cenários JMeter. Não atribuir esses números automaticamente ao commit da tag.
- **Aceite final:** mantém ressalvas de reprodução em clone limpo e aprovação individual do grupo até evidência específica. Não declarar aprovação coletiva nem execução de clone que não ocorreu.
