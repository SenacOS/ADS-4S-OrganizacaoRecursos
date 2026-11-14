# Resultado 01 — carga JMeter (histórico, não RC)

**Status:** série de métricas históricas descrita abaixo; o job JMeter **também foi aprovado no SHA da tag publicada**, com artefato específico para essa execução.

**Atualização verificada — 14/11/2026:** o [PR #50](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/50) foi integrado. A tag/release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) **existe e aponta para o commit `5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf`**; é uma tag *lightweight* (não anotada). A [CI #92 da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142), executada nesse mesmo SHA, aprovou os passos Maven/Testcontainers/JaCoCo e o job JMeter, com artefatos [quality-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096996614) e [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). O workflow global terminou com **failure** exclusivamente porque a análise Maven SonarCloud retornou `Not authorized or project not found`. A autorização do SonarCloud e o aceite coletivo seguem pendentes; clone limpo independente ainda não foi comprovado.  
**Fonte:** [evidência JMeter original de 10/11](../qualidade/jmeter/evidencias-2026-11-10.md), [planos e procedimento](../qualidade/jmeter/README.md), [CI do PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976).

## Metodologia

Execução isolada com Java 21, Apache JMeter 5.6.3, aplicação Spring Boot e MySQL 8.4 em container descartável; contas de teste e sessão/CSRF. Os quatro planos residem em `docs/qualidade/jmeter/`. Disputas esperadas HTTP 409 não devem ser contadas como 5xx nem falhas inesperadas.

## Série com métricas detalhadas — 10/11/2026

| Plano | Volume do negócio | Resposta HTTP observada | p95 publicado | Interpretação |
|---|---|---|---:|---|
| Consulta de recursos | 50 | 50 × 200 | 6,0 ms | Sem escrita |
| Disputa mesma reserva/recurso | 8 | 1 × 201, 7 × 409 | 123,0 ms | Apenas uma reserva ativa persistida |
| Recursos diferentes | 5 | 5 × 201 | 41,2 ms | Uma por recurso |
| Manutenção × reserva | 5 reservas + 1 manutenção | Reservas: 1 × 201, 4 × 409; manutenção: 1 × 409 | 32,0 ms (reservas); 22,0 ms (manutenção) | Exclusão observada em HTTP; invariantes SQL da manutenção podem ser aprofundadas |

**Origem desses números:** [run 42945127066](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066) e arquivo `docs/qualidade/jmeter/evidencias-2026-11-10.md`. Não são resultados de 13/11 nem da `main`.

## Evidência mais recente examinada — PR #45

Na [CI 43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976), o job JMeter foi aprovado em quatro cenários (com JTL e dashboards HTML). O relatório da [etapa 8](../testes/marcos-8-resultados.md) registra totais **65 / 32 / 20 / 24 amostras** por arquivo JTL, incluindo sessões e CSRF. O [artefato JMeter](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092950367) pertence ao SHA de PR `468bf0e`; **não equivale a prova do SHA da tag**.

## Limites e liberação

- Carga curta e pequena em runner GitHub, sem base semelhante à produção ou SLA operacional;
- Percentis da amostra não garantem latência ou capacidade em produção;
- Teste de contenção aproxima concorrência, sem garantia de interleavings precisos;
- A mesma suíte já foi executada na `main`, no SHA da tag, com job **success** e artefato [jmeter-evidence da main](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43552354142/artifacts/14096008151). Os p95 publicados na tabela acima pertencem à amostra de 10/11 e não devem ser reaproveitados como métricas da CI #92 sem extrair os novos JTLs.

**Veredito para release:** evidência histórica favorável e JMeter aprovado no SHA da tag; o **aceite final permanece pendente** porque o SonarCloud falhou e o workflow global da CI #92 não ficou verde.
