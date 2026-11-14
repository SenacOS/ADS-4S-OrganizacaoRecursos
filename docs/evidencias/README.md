# Pacote de evidências — Prompt 2 (preparação do release)

**Estado:** `NÃO SELADO`: tag publicada e SHA confirmado; CI global da `main` sem aprovação por falha do SonarCloud.

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.  
**Base de inspeção:** [`548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead), `main` após [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).  
**Critério obrigatório:** cada evidência do release final deve corresponder ao **mesmo SHA do commit apontado pela tag**; provas históricas abaixo não substituem isso.

| Evidência exigida | Fonte verificável | Situação perante a tag |
|---|---|---|
| Tag e SHA | [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) / [commit `5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf) | **CONFIRMADOS**; tag *lightweight*, não anotada |
| CI verde no commit da tag | [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142) | **NÃO ATENDIDA**: Maven/JaCoCo e JMeter passaram, scanner SonarCloud falhou |
| Execução da CI integrada mais recente examinada | [Run 43546313469 — develop](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43546313469) | Maven/MySQL/JaCoCo/JMeter aprovados, scanner Sonar falhou; **outro SHA** |
| JaCoCo como artifact | [Artifact quality-evidence — PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092304959) | **Histórico:** 92,58% linhas / 76,39% branches, não da tag |
| SonarCloud / Quality Gate | [Dashboard do PR #45](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=45) e [diagnóstico](../qualidade/sonarcloud.md) | Bot relatou gate aprovado no PR; scanner Maven falhou; **sem gate comprovado da tag** |
| Resultado de carga | [Resumo](../performance/resultado-01.md) e [artifact JMeter do PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092950367) | **Histórico:** quatro cenários, não da tag |
| Matriz de rastreabilidade | [docs/rtm.md](../rtm.md) → [RTM existente](../RTM.md) | Documento versionado, precisa reconciliação com o SHA do RC |
| Registro de defeitos | [docs/defeitos/](../defeitos/README.md) | Índice consolidado; existem bloqueadores abertos |
| Relatório final de qualidade | [docs/relatorio-qualidade.md](../relatorio-qualidade.md) | Síntese auditável; **aceite coletivo pendente** |
| Decisão | [docs/decisao-qualidade.md](../decisao-qualidade.md) | **BLOQUEAR**, avaliação técnica provisória sem assinaturas |
| Checklist de reprodução/entregáveis | [docs/entrega/checklist.md](../entrega/checklist.md) | Lista de lacunas por prioridade |
| Changelog | [CHANGELOG.md](../../CHANGELOG.md) | Release publicada, aceite de qualidade ainda pendente |

## Procedimento de selagem — **a concluir**

1. Corrigir B01–B06 do [checklist](../entrega/checklist.md), obter revisão da equipe e confirmar clone limpo + testes.
2. Corrigir a autorização do SonarCloud e obter execução **totalmente verde** da CI no SHA `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf` ou, caso novo commit seja necessário, definir novo RC sem alterar a tag já publicada.
3. Vincular [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151), já gerados no SHA da tag, e confirmar o Quality Gate SonarCloud no mesmo código.
4. A tag `v1.0.0-rc1` já foi publicada como *lightweight*, embora a aula peça tag anotada: registrar a divergência e combinar adequação sem mover nem sobrescrever a tag. Se o código mudar, publicar `v1.0.0-rc2`.
5. Manter links do SHA e da tag, adicionar o resultado do SonarCloud após correção, conferir a reprodução em clone limpo e recolher o aceite coletivo. Registrar o envio no formulário do Hub.

**Já executados:** PR #50 integrado, tag publicada e CI da `main` no mesmo SHA (Maven/JaCoCo e JMeter aprovados, SonarCloud reprovado). **Não comprovados:** clone limpo independente, gate verde e envio do formulário. Não inventar evidências pendentes.
