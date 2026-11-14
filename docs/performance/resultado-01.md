# Resultado de desempenho 01 — JMeter

**Situação em 14/11/2026:** PR #50 integrado; CI do PR aprovada. A execução da `main` no commit `5e9b9ea` ocorreu, mas terminou com falha de autorização do SonarCloud (`Not authorized or project not found`). A release [v1.0.0-rc1](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/releases/tag/v1.0.0-rc1) foi publicada; a CI verde e o Quality Gate do SHA da tag não estão comprovados. Clone limpo independente ainda não foi realizado (limitação do ambiente de verificação); o projeto usa `mvn` instalado, não `./mvnw`.


**Tipo:** índice documental de execução **histórica**, não benchmark da `v1.0.0-rc1` (tag publicada, sem validação integral do SHA marcado).

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
