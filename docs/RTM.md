# Matriz de rastreabilidade - item 18

| RF | Risco / comportamento | Implementação | Testes executáveis | Evidência |
|---|---|---|---|---|
| RF02 | Patrimônio duplicado, perda de histórico, subtipo incompatível | CadastroMysql, RecursoService, V1 | migracaoIntegridadeRollbackETipos, filtrosCompetenciasEPaginacao | testes/item18-resultados.md |
| RF03 | Disponibilidade/paginação incorreta | RecursoService.pesquisar, OcupacoesMysql, ExpedienteMysql | filtrosCompetenciasEPaginacao, retiradaMantemIndisponivelEDevolucaoRespeitaAgenda | testes/item18-resultados.md |
| RF05/06 | Sobreposição, dupla reserva, lock global, gravação parcial | ReservaTransacional, RecursosMysql, ReservaMysql, ConflitosMysql | reservasConcorrentesUmaVenceEConflitoSobreviveRollback, multirecursoAtomicoEDevolucoesConcorrentes, recursosDistintosNaoEsperamOMesmoLock | testes/item18-resultados.md |
| RF08 | Manutenção concorrente contradiz agenda | RecursoService.bloquear/cancelarBloqueio/substituirExpediente | manutencaoContraReservaUmaVence, manutencaoNaoCancelaReservasEExpedienteNaoAsInvalida, manutencaoCanceladaAdjacenciaERecursoInativo | testes/item18-resultados.md |
| RF09 | Dupla retirada, devolução perdida, atraso | MovimentacaoService, UNIQUE recurso_aberto | retiradaConcorrenteUmaVence, bancoImpedeDuplaRetiradaMesmoSemServico, retiradaMantemIndisponivelEDevolucaoRespeitaAgenda, devolucaoTardiaDepoisDoEncerramentoPreservaHistorico, pendenteForaDoHorarioEUnidadeAlheiaNaoPermitemRetirada | testes/item18-resultados.md |
| RF14 | Contrato incompatível / vazamento SQL | Controllers e ReservaExceptionHandler | Item18ApiTest e ReservaControllerTest | api/item18.md, testes/item18-resultados.md |

Os testes Item18MysqlIT usam MySQL real/Testcontainers e transações independentes. Fixtures de auditoria/notificação são somente de teste. RF01, RF10 e RF11 não são declarados validados: aguardam os provedores reais da equipe. RTM completa do projeto/CI/Sonar permanecem com Débora. Arquivo BDD: testes/item18-bdd.feature; asserções em JUnit, sem dependência Cucumber.
| RF10 | Mudança sem trilha ou auditabilidade perdida em rollback | AuditoriaJdbc, AuditoriaResumo, V3__auditoria.sql, AuditoriaController | AuditoriaMysqlIT, AuditoriaControllerTest | docs/qualidade/rf10-auditoria.md; relatorios Maven/JaCoCo apos execucao |
