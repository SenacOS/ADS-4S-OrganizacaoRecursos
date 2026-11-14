# Registro consolidado de defeitos e bloqueios

Índice auditável da situação da entrega final. Este arquivo **não substitui os registros históricos**, nem altera retrospectivamente o estado de um defeito.

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
| B01 | Crítica | Sem workflow verde no SHA de `main`; workflow não possui gatilho `main` | Habilitar e executar CI completa em `main` |
| B02 | Crítica | Clone limpo não reproduzido; `./mvnw` inexistente | Validar ambiente limpo e wrapper/comando aceito pelo professor |
| B03 | Alta | Tag anotada ausente, sem SHA validado | Somente após CI e aprovação, criar `v1.0.0-rc1` |
| B04 | Alta | Evidências atuais provêm de outros SHAs | Reexecutar/anexar JaCoCo/JMeter/Sonar do SHA avaliado |
| B05 | Média | Diagramas contexto/componentes e plano global não consolidados | Completar documentos e conferir contratos/README |
| B06 | Alta | Declarações individuais e envio no Hub pendentes | Obter aceite do grupo e submeter formulário |

### Como atualizar este índice

Registrar data, SHA, evidência de reprodução, estado (aberto, mitigado, resolvido), responsável e link do PR que corrige. Não marcar resolvido baseado apenas em CI de outra branch; uma exceção de aceite deve explicitar impacto e justificativa.
