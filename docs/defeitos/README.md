# Registro consolidado de defeitos e bloqueios

Índice auditável da situação da entrega final. Este arquivo **não substitui os registros históricos**, nem altera retrospectivamente o estado de um defeito.

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.

| Fonte | Escopo | Observação |
|---|---|---|
| [Relatório histórico de qualidade](../qualidade/relatorio-evidencias.md#3-registro-de-defeitos-e-correcoes) | DEF-01 a DEF-08: POM, testes, Flyway, WireMock, CI, GET/IDOR e Sonar | É um retrato preliminar; alguns itens foram resolvidos por PRs posteriores. |
| [Defeitos frontend](../qualidade/defeitos-frontend.md) | Problemas e correções de interface, UX, integração e regressão | Usar as datas e evidências citadas no registro original. |
| [PR #26](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/26) e [PR #27](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/27) | Implementação e integração da política de acesso Q9 | PRs mesclados à `develop`; não confundir com teste de produção. |
| [Dossiê de integração](../entrega/marcos-entrega-final.md) | Ajustes Q5, regressão frontend, evidências por camada | Contextualiza correções e limites do frontend integrado. |
| [Checklist final](../entrega/checklist.md) | Bloqueadores de release B01–B06 | Fonte vigente para decidir sobre `v1.0.0-rc1`. |

## Bloqueadores da entrega (abertos na inspeção)

| ID | Severidade no release | Situação | Ação |
|---|---|---|---|
| B01 | Crítica | Workflow da main executou no SHA da tag, com Maven/JaCoCo e JMeter aprovados, mas SonarCloud falhou | Corrigir token/permissões/chaves e obter CI global verde; [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142) |
| B02 | Crítica | Clone limpo não reproduzido; `./mvnw` inexistente | Validar ambiente limpo e wrapper/comando aceito pelo professor |
| B03 | Alta | Tag `v1.0.0-rc1` publicada no SHA `5e9b9ea`, mas é lightweight, não anotada | Registrar divergência e resolver exigência sem mover a tag |
| B04 | Alta | JaCoCo/JMeter já possuem artefatos no SHA da tag; SonarCloud não concluiu análise | [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614), [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151); pendente Quality Gate no mesmo SHA |
| B05 | Média | Diagramas contexto/componentes e plano global não consolidados | Completar documentos e conferir contratos/README |
| B06 | Alta | Declarações individuais e envio no Hub pendentes | Obter aceite do grupo e submeter formulário |

### Defeitos de interface identificados

O [registro de defeitos frontend](../qualidade/defeitos-frontend.md) detalha FE-001 a FE-007 (submits simultâneos, estado de carregamento, reenvio após falha, datas de retirada/devolução, edição restrita, precisão de intervalos e justificativa Q5). As correções relatadas nesse histórico não constituem, isoladamente, reteste da tag.

### Como atualizar este índice

Registrar data, SHA, evidência de reprodução, estado (aberto, mitigado, resolvido), responsável e link do PR que corrige. Não marcar resolvido baseado apenas em CI de outra branch; uma exceção de aceite deve explicitar impacto e justificativa.
