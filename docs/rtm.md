# Matriz de rastreabilidade — caminho solicitado na Aula 14

A **matriz completa e mantida pelo grupo** está em [`docs/RTM.md`](RTM.md), com os requisitos RF01–RF14, contratos, implementação e evidências por requisito. Este arquivo disponibiliza o caminho em letras minúsculas `docs/rtm.md` exigido na entrega, sem criar duas matrizes divergentes.

- [Consultar a RTM canônica](RTM.md).
- [Ver evidências por execução e por commit](evidencias/README.md).
- [Ver a avaliação de release](decisao-qualidade.md).

**Estado:** a RTM original traz referências a commits da `develop` anteriores à integração via PR #47. A presença na `main` não substitui reexecução de testes no commit de release.


## Estado atualizado da entrega — 14/11/2026

> **Esta seção substitui afirmações históricas acima sobre tag inexistente, CI não executada na main e workflow sem gatilho main.** As seções anteriores descrevem a inspeção de 13/11/2026, não o estado atual.

- **PR #50 integrado e verificação de PR aprovada:** o workflow foi corrigido para executar CI em pushes na `main` e scanner SonarCloud somente nesse evento. Maven, Testcontainers, JaCoCo e JMeter permanecem como verificações de qualidade.
- **CI da main executada, mas NÃO verde:** workflow `CI e SonarCloud` #92, commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf), terminou em **failure** na etapa de SonarCloud: `Not authorized or project not found`. A análise foi acionada na branch `main`; a falha indica necessidade de conferir permissões do token e identificação do projeto, não prova falha de testes.
- **Pendência administrativa explícita:** revisar `SONAR_TOKEN`, `sonar.projectKey`, `sonar.organization`, organização do projeto e autorização para análise. Depois, reexecutar a CI na `main` e guardar a URL do resultado. Não declarar Quality Gate aprovado sem essa evidência.
- **Tag/release publicada:** [`v1.0.0-rc1`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1). A publicação da release não comprova CI verde no SHA da tag; a correspondência do SHA e o gate permanecem por validar.
- **Evidências históricas preservadas:** CI do PR #45 registrou 287 testes Surefire, 79 Failsafe, JaCoCo 92,58% linhas e 76,39% branches, além de quatro cenários JMeter. Não atribuir esses números automaticamente ao commit da tag.
- **Aceite final:** mantém ressalvas de reprodução em clone limpo e aprovação individual do grupo até evidência específica. Não declarar aprovação coletiva nem execução de clone que não ocorreu.
