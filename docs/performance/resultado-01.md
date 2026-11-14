# Resultado de desempenho 01 — JMeter

**Tipo:** índice documental de execução **histórica**, não benchmark da `v1.0.0-rc1` (tag ainda inexistente).

## Prova principal — execução de 10/11/2026

- [Execução GitHub Actions #42945127066](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066).
- [Artefato JMeter #13823115461](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066/artifacts/13823115461).
- [Relatório original, dados, ressalvas e ambiente](../qualidade/jmeter/evidencias-2026-11-10.md).
- [Planos e instruções de reprodução](../qualidade/jmeter/README.md).

| Cenário | Resultado observado | p95 do endpoint |
|---|---|---:|
| Consulta de recursos | 50 × HTTP 200 | 6,0 ms |
| Oito tentativas concorrentes no mesmo recurso | 1 × 201, 7 × 409, exatamente 1 reserva ativa | 123,0 ms |
| Cinco recursos diferentes | 5 × 201, uma reserva por recurso | 41,2 ms |
| Manutenção × reserva | 1 reserva criada, 4 recusadas; manutenção concorrente recusada | 32,0 ms (reserva), 22,0 ms (manutenção) |

Os HTTP 409 são resultados **esperados** nos cenários de contenção. Os tempos foram medidos em runner descartável com base pequena; não constituem SLA, teste de volume máximo ou prova de produção.

## Confirmação em execução posterior

No [PR #45, run #43542757976](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976), o job JMeter também terminou com sucesso, com quatro JTLs e dashboards preservados no [artefato #14092950367](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976/artifacts/14092950367). As contagens e limites dessa execução estão em [Marcos-8](../testes/marcos-8-resultados.md).

**Pendente para release:** repetir/confirmar as evidências exigidas no **SHA da tag**, ligado à CI verde na main. Não reinterpretar resultados antigos como execução de release.


## Estado atualizado da entrega — 14/11/2026

> **Esta seção substitui afirmações históricas acima sobre tag inexistente, CI não executada na main e workflow sem gatilho main.** As seções anteriores descrevem a inspeção de 13/11/2026, não o estado atual.

- **PR #50 integrado e verificação de PR aprovada:** o workflow foi corrigido para executar CI em pushes na `main` e scanner SonarCloud somente nesse evento. Maven, Testcontainers, JaCoCo e JMeter permanecem como verificações de qualidade.
- **CI da main executada, mas NÃO verde:** workflow `CI e SonarCloud` #92, commit [`5e9b9ea`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/commit/5e9b9ea671714a5aae7a0e780cdad5e6ba8e38cf), terminou em **failure** na etapa de SonarCloud: `Not authorized or project not found`. A análise foi acionada na branch `main`; a falha indica necessidade de conferir permissões do token e identificação do projeto, não prova falha de testes.
- **Pendência administrativa explícita:** revisar `SONAR_TOKEN`, `sonar.projectKey`, `sonar.organization`, organização do projeto e autorização para análise. Depois, reexecutar a CI na `main` e guardar a URL do resultado. Não declarar Quality Gate aprovado sem essa evidência.
- **Tag/release publicada:** [`v1.0.0-rc1`](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1). A publicação da release não comprova CI verde no SHA da tag; a correspondência do SHA e o gate permanecem por validar.
- **Evidências históricas preservadas:** CI do PR #45 registrou 287 testes Surefire, 79 Failsafe, JaCoCo 92,58% linhas e 76,39% branches, além de quatro cenários JMeter. Não atribuir esses números automaticamente ao commit da tag.
- **Aceite final:** mantém ressalvas de reprodução em clone limpo e aprovação individual do grupo até evidência específica. Não declarar aprovação coletiva nem execução de clone que não ocorreu.
