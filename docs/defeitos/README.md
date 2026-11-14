# Registro de defeitos — índice de entrega

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


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
| Reprodutibilidade de release | **Aberto**: wrapper Maven ausente; CI dispara na main, mas run #92 falhou no SonarCloud; clone limpo não comprovado | [Checklist da aula](../entrega/checklist.md) |

**Não há evidência confirmada de nova execução aprovada no SHA da tag**; a release foi publicada, mas o run #92 na `main` falhou no SonarCloud. Antes do aceite final, conferir se os defeitos críticos e os bloqueadores acima foram resolvidos, com testes e links da mesma versão.
