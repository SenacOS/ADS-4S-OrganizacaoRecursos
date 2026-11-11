# Evidência JMeter — 10/11/2026, 23h19 (America/Sao_Paulo)

## Origem
- Execução: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066
- Artefato: https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/42945127066/artifacts/13823115461
- Job: **JMeter / banco isolado / métricas reais** — SUCCESS.
- Ambiente: Java 21, JMeter 5.6.3, MySQL 8.4 via Docker, Spring Boot local no runner.
- Dados: cinco salas IDs 101–105, usuários fictícios, expediente 08h–22h, container descartado.
- Data reservada: 11/11/2026 (relógio de São Paulo).

| Cenario | Requisições principais | Resultados HTTP | p95 | Verificação no banco |
|---|---:|---|---:|---|
| Consulta de recursos | 50 | 50 × 200 | 6,0 ms | Sem escrita |
| Reserva concorrente (mesmo recurso) | 8 | 1 × 201; 7 × 409 | 123,0 ms | Exatamente 1 ativa |
| Recursos distintos | 5 | 5 × 201 | 41,2 ms | Exatamente 1 por recurso |
| Manutenção vs reserva | 5 reservas, 1 manutenção | Reserva 1 × 201, 4 × 409; manutenção 1 × 409 | 32,0 ms (reserva) e 22,0 ms (manutenção) | A exclusão foi observada nos códigos HTTP; teste SQL específico da manutenção ainda pode ser ampliado |

Os testes de CSRF e login foram realizados por cada thread antes da operação.
Os conflitos HTTP 409 são esperados nos cenários de disputa, não falhas técnicas.
Os percentis referem-se aos endpoints de negócio, não à preparação da sessão.
O arquivo `resultado.json` contém p50/p95/p99, throughput por amostra e contagens;
os arquivos JTL/HTML permitem auditoria e reprocessamento.

**Limitações:** pouca carga, base pequena, runner GitHub e duração curta. Não
extrapolar essas latências para produção nem declarar capacidade máxima.
SonarCloud está pendente por falta de autorização administrativa na organização.
