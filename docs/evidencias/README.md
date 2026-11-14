# Índice do pacote de evidências — Prompt 2 (Aula 14)

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


**Status: pacote documental preparado; release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) publicada, com ressalvas de validação.**  
**Verificação histórica:** 13/11/2026 (America/Sao_Paulo). [main avaliada no commit `548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead).  
**Critérios da aula:** [material do professor](https://afonsolelis.github.io/aulas_senac/pages/qualidade2/material/material_entrega-projeto-final.html).

## Vínculo obrigatório entre tag, SHA e evidências

| Campo solicitado | Estado atual | Link, quando há evidência real |
|---|---|---|
| Tag `v1.0.0-rc1` | **PUBLICADA** — SHA e tipo de tag por conferir | [Release](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) |
| SHA do commit marcado pela tag | **PENDENTE DE CONFERÊNCIA** — SHA da tag não verificado neste relatório | Não inventar SHA de release |
| CI verde executada na `main` nesse mesmo SHA | **NÃO APROVADA** — run #92 da main executou e falhou no SonarCloud | [GitHub Actions](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions) |
| JaCoCo do SHA da tag | **PENDENTE** — existe histórico de PR, não do release | [Artefato histórico PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092304959) |
| Quality Gate do SHA da tag | **PENDENTE** — bot do PR45 reportou OK, mas scanner Maven falhou | [Análise histórica do PR45](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=45) |
| Desempenho no SHA da tag | **PENDENTE** — há resultados históricos válidos com origem distinta | [Resultado histórico consolidado](../performance/resultado-01.md) |

**Regra de aceite:** só trocar qualquer “PENDENTE” por “APROVADO” depois de verificar, no GitHub, a tag e uma execução **verde** cujo commit corresponda exatamente ao SHA marcado. O PR de documentação não altera esse requisito.

## Artefatos do pacote e respectivos limites

| Artefato solicitado | Arquivo existente neste PR ou na main | Evidência / proveniência |
|---|---|---|
| Checklist de clone limpo | [`docs/entrega/checklist.md`](../entrega/checklist.md) | Confere inventário e descreve tentativa de acesso impedida por DNS, sem alegar clone realizado |
| Changelog do candidato | [`CHANGELOG.md`](../../CHANGELOG.md) | Release `v1.0.0-rc1` publicada; validação do SHA ainda pendente |
| Índice de rastreabilidade | [`docs/rtm.md`](../rtm.md) → [matriz canônica](../RTM.md) | RF01–RF14 com referências históricas e limites |
| Planejamento e relatórios de testes | [relatório de qualidade](../relatorio-qualidade.md), [resultados integrados](../testes/marcos-8-resultados.md), [plano JMeter](../qualidade/jmeter/README.md) | Não representam nova execução da tag |
| JaCoCo e testes Java/MySQL | [CI de PR45 #43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976), [artifact #14092304959](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092304959) | **287 Surefire + 79 Failsafe**, sem falhas; **92,58% linhas / 76,39% branches** no PR45, não na tag |
| SonarCloud | [Relatório Sonar](../qualidade/sonarcloud.md), [dashboard do PR45](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=45), [comentário do bot](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45#issuecomment-6869673675) | Bot: Quality Gate passed para PR45; etapa **scanner Maven = failure**; não equivale à CI íntegra verde |
| Plano de desempenho | [Quatro arquivos .jmx e guia](../qualidade/jmeter/README.md) | Cenários de consulta, disputa, recursos distintos, manutenção |
| Resultado de desempenho | [`docs/performance/resultado-01.md`](../performance/resultado-01.md) | [Run histórico #42945127066](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066); [job JMeter de PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) |
| Registro de defeitos | [`docs/defeitos/README.md`](../defeitos/README.md), [detalhes frontend](../qualidade/defeitos-frontend.md) | Descreve defeitos corrigidos e lacunas abertas sem nova reexecução |
| Relatório final de qualidade | [`docs/relatorio-qualidade.md`](../relatorio-qualidade.md) | Consolidação crítica com limitações explícitas |
| Decisão de qualidade | [`docs/decisao-qualidade.md`](../decisao-qualidade.md) | **BLOQUEAR**; assinaturas individuais e liberação dependem da equipe |
| Diagramas | [Sequências críticas](../arquitetura/sequencia-reserva.md), [ADRs](../arquitetura/adr/README.md) | Diagrama específico de contexto e componentes ainda não identificado |

## Evidência da última CI de integração anterior ao merge na main

- [Última CI da develop #43546313469](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43546313469) — SHA `b33706a31b2a0ad5d69de3562a0d18de08a97023`; job Maven/JaCoCo aprovado e JMeter aprovado, mas **workflow com status final failure no scanner Maven SonarCloud**.
- A `main` incorporou a `develop` pelo [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47) no commit `548f8b0b95980a3e292f271b9676105473822ead`; essa ação **não criou uma execução verde da main**.
- Os resultados do PR45 pertencem àquele PR, não ao SHA do PR47 nem à tag.

## Procedimento para finalizar Prompt 2 depois da correção dos bloqueadores

1. Confirmar a aplicação em clone limpo segundo o README e o teste exigido `./mvnw -B verify` (corrigir wrapper/documentação antes).
2. Garantir que a CI execute na `main` e termine **verde**, incluindo os gates exigidos; obter o SHA exato e os artifacts do run.
3. Confirmar a política de release com o grupo; então executar `git switch main && git pull --ff-only origin main`, `git tag -a v1.0.0-rc1 -m "Candidato a entrega final" <SHA_VALIDADO>` e `git push origin v1.0.0-rc1`.
4. Editar este índice para que as URLs de CI, JaCoCo e Quality Gate **apontem para o mesmo SHA da tag** e conferir cada link. Não usar o run de PR como substituto.
5. Se precisar corrigir após publicar, use `v1.0.0-rc2`. Nunca recrie/mova a `rc1`.

**Resultado do Prompt 2:** changelog e pacote de evidências preparados, com links reais e pendências explícitas. **Release `v1.0.0-rc1` publicada**, embora as evidências de CI verde e Quality Gate no SHA ainda não estejam completas.
