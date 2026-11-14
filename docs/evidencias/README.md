# Pacote de evidências — Prompt 2 (preparação do release)

**Estado:** `NÃO SELADO`. Não há prova de tag `v1.0.0-rc1` nem CI totalmente verde da `main`.  
**Base de inspeção:** [`548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead), `main` após [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).  
**Critério obrigatório:** cada evidência do release final deve corresponder ao **mesmo SHA do commit apontado pela tag**; provas históricas abaixo não substituem isso.

| Evidência exigida | Fonte verificável | Situação perante a tag |
|---|---|---|
| CI verde no commit da tag | [GitHub Actions](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions) | **PENDENTE:** workflow não dispara na `main` |
| Execução da CI integrada mais recente examinada | [Run 43546313469 — develop](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43546313469) | Maven/MySQL/JaCoCo/JMeter aprovados, scanner Sonar falhou; **outro SHA** |
| JaCoCo como artifact | [Artifact quality-evidence — PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092304959) | **Histórico:** 92,58% linhas / 76,39% branches, não da tag |
| SonarCloud / Quality Gate | [Dashboard do PR #45](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=45) e [diagnóstico](../qualidade/sonarcloud.md) | Bot relatou gate aprovado no PR; scanner Maven falhou; **sem gate comprovado da tag** |
| Resultado de carga | [Resumo](../performance/resultado-01.md) e [artifact JMeter do PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092950367) | **Histórico:** quatro cenários, não da tag |
| Matriz de rastreabilidade | [docs/rtm.md](../rtm.md) → [RTM existente](../RTM.md) | Documento versionado, precisa reconciliação com o SHA do RC |
| Registro de defeitos | [docs/defeitos/](../defeitos/README.md) | Índice consolidado; existem bloqueadores abertos |
| Relatório final de qualidade | [docs/relatorio-qualidade.md](../relatorio-qualidade.md) | Síntese auditável; **aceite coletivo pendente** |
| Decisão | [docs/decisao-qualidade.md](../decisao-qualidade.md) | **BLOQUEAR**, avaliação técnica provisória sem assinaturas |
| Checklist de reprodução/entregáveis | [docs/entrega/checklist.md](../entrega/checklist.md) | Lista de lacunas por prioridade |
| Changelog | [CHANGELOG.md](../../CHANGELOG.md) | Preparado; versão RC **ainda não lançada** |

## Procedimento de selagem, **não executado**

1. Corrigir B01–B06 do [checklist](../entrega/checklist.md), obter revisão da equipe e confirmar clone limpo + testes.
2. Obter execução **totalmente verde** do workflow em `main` no SHA definitivo **S**.
3. Comprovar que as evidências e artefatos da execução referem-se a **S** (não à execução de um PR anterior).
4. Criar e enviar **tag anotada** `v1.0.0-rc1` em **S**, somente após as etapas anteriores. Se mudanças forem necessárias após publicada, emitir `v1.0.0-rc2`, sem mover a tag anterior.
5. Atualizar este índice com as URLs concretas de S e da tag, revisar links e recolher o aceite coletivo. Registrar o envio no formulário do Hub.

**Não foram executados**: criação/envio da tag, alteração de branch principal, correção do workflow ou publicação do formulário. Não há links inventados para evidências inexistentes.
