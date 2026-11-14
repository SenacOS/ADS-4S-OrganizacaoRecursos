# Checklist final — Prompt 1 (Aula 14)

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


**Auditoria documental em 13/11/2026 (São Paulo).** Referência: [main `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), após [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47). Critérios: [aula 14](https://afonsolelis.github.io/aulas_senac/pages/qualidade2/material/material_entrega-projeto-final.html).

## Clone limpo e reprodutibilidade

- Foi tentado `git ls-remote https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos.git HEAD` a partir de um ambiente independente. O comando falhou com `Could not resolve host: github.com`. **Não foi possível clonar o projeto nem subir a aplicação.**
- O ambiente possuía `git` e `java`, mas não `mvn`, `docker` ou `gh`. Não houve execução nova de testes neste trabalho.
- Inspeção alternativa: árvore, arquivos e logs de PRs/Actions do SHA acima consultados por integração GitHub. Inspeção remota **não é clone limpo**.
- A aula exige `./mvnw -B verify`; a árvore não contém `mvnw` ou `.mvn/wrapper`, e o README usa `mvn -f backend/pom.xml clean verify` com Maven externo. **Comando da aula não reproduzível no snapshot**.
- O README tem instruções de `.env`, MySQL/Docker Compose, Spring Boot e build frontend. **Esses procedimentos não foram executados nesta conferência.**

## Checklist do snapshot (antes de produzir os documentos dos prompts 2 e 3)

| Entregável | Existe? | Atualizado/comprovado? | Caminho real |
|---|---|---|---|
| Repositório público + review por pares | Sim | PR #47 aprovado por `jovemOG-Dev` e mesclado | [repo](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos), [PR 47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) |
| Aplicação após clone limpo | Fontes sim | **Execução não comprovada** | [backend](../../backend/), [README](../../README.md) |
| README/reprodução | Sim | Maven externo, wrapper ausente; não testado | [README](../../README.md) |
| Documentação API | Sim | Contratos publicados, sem nova validação | [docs/api](../api/) |
| `docs/rtm.md` | **Não no caminho exato** | `docs/RTM.md` existe, caixa distinta no Linux | [RTM](../RTM.md) |
| Diagrama de contexto | Não identificado | Pendência | [arquitetura](../arquitetura/adr/README.md) |
| Diagrama de componentes | Não identificado | Pendência | [arquitetura](../arquitetura/adr/README.md) |
| Diagramas de sequência | Sim | Mermaid existente, não renderizado aqui | [sequencia-reserva](../arquitetura/sequencia-reserva.md) |
| Plano de testes | Parcial | Guias JMeter/E2E dispersos, sem plano final único | [JMeter](../qualidade/jmeter/README.md), [testes](../testes/) |
| Relatório de testes | Sim | Relatórios históricos com versões de origem | [relatorio-evidencias](../qualidade/relatorio-evidencias.md), [Marcos-8](../testes/marcos-8-resultados.md) |
| Pipeline CI | Sim | Dispara em `develop` e `main` após PR #50 | [ci.yml](../../.github/workflows/ci.yml) |
| CI verde da main/tag | **Não** | Run #92 executado na `main`, falhou no SonarCloud por autorização | [Actions](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions) |
| SonarCloud/Quality Gate | Parcial | Bot do PR45: gate passed; scanner Maven falhou, CI global vermelha | [sonarcloud](../qualidade/sonarcloud.md), [run PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) |
| JaCoCo | Sim, histórico | PR45: 92,58% linhas/76,39% branches; não é tag | [artifact PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092304959) |
| Plano de carga | Sim | Quatro planos JMeter | [JMeter README](../qualidade/jmeter/README.md) |
| Resultado de carga | Sim, em outro caminho | `docs/performance/resultado-01.md` incluído neste PR (não existia na inspeção de 13/11) | [evidencias JMeter](../qualidade/jmeter/evidencias-2026-11-10.md) |
| Registro de defeitos | Sim, disperso | `docs/defeitos/README.md` incluído neste PR (não existia na inspeção de 13/11) | [defeitos frontend](../qualidade/defeitos-frontend.md), [relatório](../qualidade/relatorio-evidencias.md) |
| Relatório de qualidade final | Parcial | Consolidação preliminar, sem decisão coletiva | [relatorio-evidencias](../qualidade/relatorio-evidencias.md) |
| Tag `v1.0.0-rc1` | **Sim** | Release publicada; SHA/CI ainda por conferir | [Release](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) |
| Decisão assinada por quatro integrantes | **Não** | Review de PR não equivale a aceite de release | [ADR](../arquitetura/adr/README.md), [PR47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) |

## Bloqueadores (priorizados)

1. **CI verde na main e no SHA de release:** workflow dispara em `develop` e `main`; scanner Maven SonarCloud falha com `Not authorized or project not found`. Não assumir que a causa é o plano gratuito sem comprovação.
2. **Clone limpo/comando do professor:** wrapper ausente; executar `./mvnw -B verify` após adequação, banco, app e frontend em ambiente limpo; guardar evidências.
3. **Documentação arquitetural:** contexto e componentes não encontrados como diagramas próprios; plano único de testes ainda fragmentado.
4. **Tag e cadeia de evidências:** tag `v1.0.0-rc1` já publicada; obter CI verde no SHA e registrar evidências sem mover a tag, com artefatos e links desse mesmo commit. Nunca mover uma tag já usada.
5. **Aceite coletivo e Hub:** decidir riscos, obter declaração/assinatura de cada integrante e realizar envio por uma pessoa do grupo.

**Resultado do Prompt 1:** checklist concluído sem modificar fontes ou workflow. Clone, execução e CI na main **não comprovados**.
