# Relatório consolidado de qualidade — preparação da entrega final

**Situação: BLOQUEADO PARA LIBERAÇÃO DE RELEASE**, com evidências de qualidade parciais e rastreáveis. Data da conferência: 13/11/2026 (São Paulo).

**Base:** `main` [`548f8b0b95980a3e292f271b9676105473822ead`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/548f8b0b95980a3e292f271b9676105473822ead), integrada pelo [PR #47](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/47).

## Resultados auditáveis já existentes

| Critério | Evidência | Limitação |
|---|---|---|
| Testes Java/MySQL | [PR #45 — CI #43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976): 287 Surefire e 79 Failsafe sem falhas, conforme [relatório](testes/marcos-8-resultados.md) | SHA de PR anterior, não de tag/CI main |
| Cobertura Java | Mesmo PR: 92,58% de linhas (1523/1645), 76,39% de branches (495/648); limites POM 80%/70% | Métrica apenas do backend, não do frontend |
| Performance | Quatro planos JMeter aprovados no job de PR #45 | Runner isolado; sem SLA; [detalhes](performance/resultado-01.md) |
| Frontend e E2E | [Marcos-7](testes/marcos-7-resultados.md) relata 100 testes unitários e 350 execuções de navegador e cenários reais separados | Evidência local em base própria, não repetida na main |
| Segurança | RF01, Q9, IDOR, CSRF e regra de responsável com testes Java/MySQL | Ambiente de produção/grants não certificados; [fonte](qualidade/seguranca.md) |
| Auditoria | RF10 transacional e testes | Conta de runtime com grants limitados exige validação operacional; [fonte](qualidade/rf10-auditoria.md) |
| Notificações | RF11 por outbox, WireMock e simulação por log | Não demonstra entrega externa; [fonte](qualidade/rf11-notificacoes.md) |
| SonarCloud | Bot no PR #45 indicou Quality Gate aprovado; [scanner Maven falhou](testes/marcos-8-resultados.md) | Workflow global da CI #43542757976 **failure** |
| Revisão por pares | PR #47 aprovado pelo integrante Silva antes de integrar | Não substitui assinatura coletiva de qualidade |

## Riscos e decisões remanescentes

1. **Reprodutibilidade alta:** clone e execução pelo comando do professor não verificados; wrapper Maven ausente.
2. **Release/CI alta:** sem pipeline verde na main e sem artefato vinculado à tag; scanner Maven SonarCloud falhou.
3. **Documentação média:** contexto/componentes e plano de testes final ainda exigem conferência.
4. **Operação alta:** grants do banco, flags de APIs, HTTPS e worker devem ser configurados e verificados no ambiente pretendido.
5. **Cobertura limitada:** suites locais e cenários de carga não equivalem a certificação de produção, acessibilidade integral ou segurança exaustiva.

## Critério de aceite

A decisão do grupo deve ficar em [`docs/decisao-qualidade.md`](decisao-qualidade.md). **Nenhuma assinatura ou aceite coletivo é presumido**. O [checklist da aula](entrega/checklist.md) documenta o que falta; o [índice de evidências](evidencias/README.md) separa resultados históricos de release.
