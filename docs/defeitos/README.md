# Registro de defeitos — índice de entrega

Este índice reúne **registros existentes**, sem inventar defeitos ou afirmar nova retestagem no release. A classificação original e as tentativas RED/GREEN permanecem nas fontes.

| ID ou tema | Situação conforme evidência histórica | Registro |
|---|---|---|
| FE-001 — estado do botão em submits simultâneos | Correção documentada e regressão específica | [Defeitos do frontend](../qualidade/defeitos-frontend.md) |
| FE-002 — estado de carregamento após falha | Correção e teste descritos | [Defeitos do frontend](../qualidade/defeitos-frontend.md) |
| FE-003 — reenvio após operação incerta | Correção e teste descritos | [Defeitos do frontend](../qualidade/defeitos-frontend.md) |
| FE-004 — datas de retirada/devolução | Correção com cenário real documentada | [Defeitos do frontend](../qualidade/defeitos-frontend.md) |
| FE-005 — edição com recurso restrito indevido | Bloqueio do fluxo e regressão descritos | [Defeitos do frontend](../qualidade/defeitos-frontend.md) |
| FE-006 — intervalo submilissegundo | Comparação precisa e testes documentados | [Defeitos do frontend](../qualidade/defeitos-frontend.md) |
| FE-007 — justificativa Q5 ausente no cliente | Correção e RED/GREEN documentados | [Defeitos do frontend](../qualidade/defeitos-frontend.md), [Marcos-7](../testes/marcos-7-resultados.md) |
| DEF-01 a DEF-08 — backend/qualidade | Histórico dos erros de POM, autorização, SQL/trigger, WireMock e integração | [Relatório de qualidade preliminar](../qualidade/relatorio-evidencias.md) |
| Scanner Maven SonarCloud | **Aberto no pipeline**: `Not authorized or project not found`, embora bot externo informe Quality Gate passado em PR | [SonarCloud](../qualidade/sonarcloud.md), [run #43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) |
| Reprodutibilidade de release | **Aberto**: wrapper Maven ausente; CI não dispara na main; clone limpo não comprovado | [Checklist da aula](../entrega/checklist.md) |

**Não há evidência de nova execução no SHA da tag**, pois a tag ainda não foi criada. Antes do aceite final, conferir se os defeitos críticos e os bloqueadores acima foram resolvidos, com testes e links da mesma versão.


## Estado atualizado da entrega — 14/11/2026

> **Esta seção substitui afirmações históricas acima sobre tag inexistente, CI não executada na main e workflow sem gatilho main.** As seções anteriores descrevem a inspeção de 13/11/2026, não o estado atual.

- **PR #50 integrado e verificação de PR aprovada:** o workflow foi corrigido para executar CI em pushes na `main` e scanner SonarCloud somente nesse evento. Maven, Testcontainers, JaCoCo e JMeter permanecem como verificações de qualidade.
- **CI da main executada, mas NÃO verde:** workflow `CI e SonarCloud` #92, commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf), terminou em **failure** na etapa de SonarCloud: `Not authorized or project not found`. A análise foi acionada na branch `main`; a falha indica necessidade de conferir permissões do token e identificação do projeto, não prova falha de testes.
- **Pendência administrativa explícita:** revisar `SONAR_TOKEN`, `sonar.projectKey`, `sonar.organization`, organização do projeto e autorização para análise. Depois, reexecutar a CI na `main` e guardar a URL do resultado. Não declarar Quality Gate aprovado sem essa evidência.
- **Tag/release publicada:** [`v1.0.0-rc1`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1). A publicação da release não comprova CI verde no SHA da tag; a correspondência do SHA e o gate permanecem por validar.
- **Evidências históricas preservadas:** CI do PR #45 registrou 287 testes Surefire, 79 Failsafe, JaCoCo 92,58% linhas e 76,39% branches, além de quatro cenários JMeter. Não atribuir esses números automaticamente ao commit da tag.
- **Aceite final:** mantém ressalvas de reprodução em clone limpo e aprovação individual do grupo até evidência específica. Não declarar aprovação coletiva nem execução de clone que não ocorreu.
