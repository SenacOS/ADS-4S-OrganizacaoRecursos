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
