# Relatório consolidado de qualidade — preparação da entrega final

**Situação: BLOQUEADO PARA LIBERAÇÃO DE RELEASE**, com evidências de qualidade parciais e rastreáveis. Data da conferência: 13/11/2026 (São Paulo).

**Base:** `main` [`548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), integrada pelo [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

## Resultados auditáveis já existentes

| Critério | Evidência | Limitação |
|---|---|---|
| Testes Java/MySQL | [PR #45 — CI #43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976): 287 Surefire e 79 Failsafe sem falhas, conforme [relatório](testes/marcos-8-resultados.md) | SHA de PR anterior, não de tag/CI main |
| Cobertura Java | Mesmo PR: 92,58% de linhas (1523/1645), 76,39% de branches (495/648); limites POM 80%/70% | Métrica apenas do backend, não do frontend |
| Performance | Quatro planos JMeter aprovados no job de PR #45 | Runner isolado; sem SLA; [detalhes](performance/resultado-01.md) |
| Frontend e E2E | [Marcos-7](testes/marcos-7-resultados.md) relata 100 testes unitários e 350 execuções de navegador e cenários reais separados | Evidência local em base própria, não repetida na main |
| Segurança | RF01, Q9, IDOR, CSRF e regra de responsável com testes Java/MySQL | Ambiente de produção/grants não certificados; [fonte](qualidade/seguranca.md) |
| Auditoria | RF10 transacional e testes | Conta de runtime com grants limitados exige validação operacional; [fonte](qualidade/rf10-auditoria.md) |
| Notificações | RF11 por outbox, WireMock e simulação por log | Não demonstra entrega externa; [fonte](qualidade/rf11-notificacoes.md) |
| SonarCloud | Bot no PR #45 indicou Quality Gate aprovado; [scanner Maven falhou](testes/marcos-8-resultados.md) | Workflow global da CI #43542757976 **failure** |
| Revisão por pares | PR #47 aprovado pelo integrante Silva antes de integrar | Não substitui assinatura coletiva de qualidade |

## Riscos e decisões remanescentes

1. **Reprodutibilidade alta:** clone e execução pelo comando do professor não verificados; wrapper Maven ausente.
2. **Release/CI alta:** sem pipeline verde na main e sem artefato vinculado à tag; scanner Maven SonarCloud falhou.
3. **Documentação média:** contexto/componentes e plano de testes final ainda exigem conferência.
4. **Operação alta:** grants do banco, flags de APIs, HTTPS e worker devem ser configurados e verificados no ambiente pretendido.
5. **Cobertura limitada:** suites locais e cenários de carga não equivalem a certificação de produção, acessibilidade integral ou segurança exaustiva.

## Critério de aceite

A decisão do grupo deve ficar em [`docs/decisao-qualidade.md`](decisao-qualidade.md). **Nenhuma assinatura ou aceite coletivo é presumido**. O [checklist da aula](entrega/checklist.md) documenta o que falta; o [índice de evidências](evidencias/README.md) separa resultados históricos de release.


## Estado atualizado da entrega — 14/11/2026

> **Esta seção substitui afirmações históricas acima sobre tag inexistente, CI não executada na main e workflow sem gatilho main.** As seções anteriores descrevem a inspeção de 13/11/2026, não o estado atual.

- **PR #50 integrado e verificação de PR aprovada:** o workflow foi corrigido para executar CI em pushes na `main` e scanner SonarCloud somente nesse evento. Maven, Testcontainers, JaCoCo e JMeter permanecem como verificações de qualidade.
- **CI da main executada, mas NÃO verde:** workflow `CI e SonarCloud` #92, commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf), terminou em **failure** na etapa de SonarCloud: `Not authorized or project not found`. A análise foi acionada na branch `main`; a falha indica necessidade de conferir permissões do token e identificação do projeto, não prova falha de testes.
- **Pendência administrativa explícita:** revisar `SONAR_TOKEN`, `sonar.projectKey`, `sonar.organization`, organização do projeto e autorização para análise. Depois, reexecutar a CI na `main` e guardar a URL do resultado. Não declarar Quality Gate aprovado sem essa evidência.
- **Tag/release publicada:** [`v1.0.0-rc1`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1). A publicação da release não comprova CI verde no SHA da tag; a correspondência do SHA e o gate permanecem por validar.
- **Evidências históricas preservadas:** CI do PR #45 registrou 287 testes Surefire, 79 Failsafe, JaCoCo 92,58% linhas e 76,39% branches, além de quatro cenários JMeter. Não atribuir esses números automaticamente ao commit da tag.
- **Aceite final:** mantém ressalvas de reprodução em clone limpo e aprovação individual do grupo até evidência específica. Não declarar aprovação coletiva nem execução de clone que não ocorreu.
