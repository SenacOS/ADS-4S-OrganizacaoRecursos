# Relatório de qualidade — síntese de entrega

**Projeto:** Organização de Recursos — Senac ADS, 2026.2  
**Avaliação original:** 13/11/2026 — base `main` [`548f8b0`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/tree/548f8b0b95980a3e292f271b9676105473822ead)  
**Natureza:** consolidação documental verificável, **não é auditoria de produção nem aceite coletivo**.

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.

## Escopo

Aplicação Spring Boot Java 21, MySQL 8.4, frontend estático, autenticação, reservas/recursos, movimentações, auditoria, notificações, relatórios e documentação RF01–RF14. Ver [RTM](RTM.md) e [README](../README.md).

## Evidências consultadas

| Dimensão | Evidência | Resultado observado / limite |
|---|---|---|
| Testes Java e MySQL/Testcontainers | [CI PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) / [relatório detalhado](testes/marcos-8-resultados.md) | 287 Surefire + 79 Failsafe, sem falhas reportadas nessa execução. **Não foram rodados localmente nesta avaliação**. |
| Cobertura JaCoCo | [Artefato quality-evidence do PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092304959) | 1.523/1.645 linhas = **92,58%**; 495/648 branches = **76,39%**; mínimos do POM 80%/70% atendidos naquela versão. |
| E2E e frontend | [Fechamento de Marcos](testes/marcos-7-resultados.md), [dossiê](entrega/marcos-entrega-final.md) | 100 unitários e 350 execuções de navegador na etapa 7, sete suítes reais adicionais com origens distintas. Não somar execuções diferentes. |
| Concorrência/desempenho | [Planos JMeter](qualidade/jmeter/README.md), [resultado detalhado](performance/resultado-01.md) | Quatro cenários aprovados nas versões históricas; runner de CI, carga pequena e tempo curto. Sem SLA. |
| Segurança | [Segurança](qualidade/seguranca.md), [Q9](seguranca/q9-autorizacao-reservas.md), `backend/src/test/` | Casos de autenticação, CSRF, proteção contra IDOR e regras por perfil presentes; não substituem teste da versão tagueada. |
| Auditoria | [RF10](qualidade/rf10-auditoria.md), integração MySQL | Alterações transacionais e trilha; grants de runtime devem ser aplicados no ambiente real. |
| Notificações | [RF11](qualidade/rf11-notificacoes.md), [demonstração](operacao/demonstracao-fechamento.md) | Outbox e WireMock testados; demonstração usa gateway simulado, não entrega externa real. |
| SonarCloud | [Diagnóstico do Sonar](qualidade/sonarcloud.md) | Bot informou Quality Gate aprovado no PR #45; scanner Maven retorna `Not authorized or project not found` e workflow terminou em failure. |
| CI da main no SHA da tag | [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf) | Maven/Testcontainers/JaCoCo e job JMeter **aprovados**, artifacts [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). SonarCloud falhou por autorização; workflow global **failure**. |

## Qualidade e trade-offs

- **Consistência de reservas:** testes de transação, locks e JMeter favorecem integridade; a carga não é representativa de produção.
- **Segurança:** sessão/CSRF e controle de acesso na API reduzem exposição; configuração TLS/cookies/grants precisa ser validada no ambiente real.
- **Auditabilidade:** RF10 preserva rastreabilidade de operações; permissões administrativas precisam ser separadas das contas de runtime.
- **Notificações:** a outbox desacopla entrega, mas o fluxo simulado não comprova disponibilidade de provedor externo.
- **Reprodutibilidade:** README e testes existem, porém sem clone limpo executado nesta avaliação.
- **Rastreabilidade do release:** a tag *lightweight* `v1.0.0-rc1` aponta para o mesmo SHA da CI #92; evidências Maven/JaCoCo/JMeter estão disponíveis, mas falta Quality Gate SonarCloud aprovado, reprodução independente e aceite do grupo.

## Defeitos, bloqueadores e decisões

Ver [registro de defeitos](defeitos/README.md), [checklist](entrega/checklist.md) e [decisão fundamentada](decisao-qualidade.md).

**Recomendação técnica provisória: NÃO ATESTAR O ACEITE DE QUALIDADE da release `v1.0.0-rc1` já publicada**, sem inferir que o sistema não funcione. Maven/JaCoCo e JMeter foram aprovados no SHA da tag; a CI global falhou somente no SonarCloud. Para aprovar a entrega, resolver os bloqueadores remanescentes e obter aceite coletivo.
