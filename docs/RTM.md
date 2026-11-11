# RTM — Organização de Recursos (RF01–RF14)

**Atualizada em 10/11/2026.** Rastreia requisito → risco → implementação → testes → evidência.
Estados: **local** = testes anteriores executados localmente; **pendente** = sem evidência
final suficiente; **parcial** = existe código, mas falta fluxo/aceite. Nenhuma linha
deve ser interpretada como aprovação final de CI ou Sonar sem relatório publicado.

| RF | Risco crítico | Implementação / contrato | Testes relacionados | Evidência e condição |
|---|---|---|---|---|
| RF01 — Sessão e autorização | Usuário indevido, CSRF e IDOR | SecurityConfig, UsuarioDetailsService, SpringSecurityAtorProvider, UsuarioAdminController, ADR-004 | SecurityConfigTest, SpringSecurityAtorProviderTest, SegurancaComplementarTest, LoginMysqlIT | [RF01](qualidade/relatorio-evidencias.md); SegurancaComplementarTest (7) e LoginMysqlIT (3) aprovados na CI Java21; PR #8 aberto |
| RF02 — Cadastro de recursos | Patrimônio duplicado, subtipo errado | RecursoService, CadastroMysql, V1__item18.sql | Item18MysqlIT.migracaoIntegridadeRollbackETipos, filtrosCompetenciasEPaginacao | [Item18 executado em 09/11](testes/item18-resultados.md); revisar CI após integração |
| RF03 — Consulta/disponibilidade | Filtro incorreto, agenda ocupada aparece livre | RecursoService.pesquisar, OcupacoesMysql, ExpedienteMysql, GET /api/recursos | Item18MysqlIT.filtrosCompetenciasEPaginacao, retiradaMantemIndisponivelEDevolucaoRespeitaAgenda; JMeter 01-consultas | JMeter CI: 50 consultas HTTP 200, p95=6 ms (banco isolado) |
| RF04 — Criar e editar reserva | Acesso a recurso alheio, edição inválida | ReservaService.criar/editar, ReservaController, ReservaTransacional | ReservaServiceTest, ReservaControllerTest, SegurancaComplementarTest | Unitário/MVC local; E2E de edição com Marcos pendente; endpoint desligado por padrão |
| RF05 — Sobreposição | Duas reservas no mesmo recurso/horário | IntervaloReserva, DetectorConflitos, OcupacoesMysql | DetectorConflitosEExpedienteTest, ReservaConcorrenciaSimuladaTest, Item18MysqlIT.reservasConcorrentesUmaVenceEConflitoSobreviveRollback; JMeter 02-disputa | JMeter CI: 1 reserva criada, 7 conflitos HTTP 409; uma ativa no banco |
| RF06 — Atomicidade/locks | Dupla reserva, deadlock, gravação parcial | RecursosMysql FOR UPDATE, ReservaTransacional READ_COMMITTED, ReservaMysql | Item18MysqlIT.multirecursoAtomicoEDevolucoesConcorrentes, recursosDistintosNaoEsperamOMesmoLock, locksExigemTransacaoEOrdem; JMeter 02 e 03 | JMeter CI: disputa sem dupla reserva; 5 recursos distintos com 5 reservas |
| RF07 — Aprovação restrita | Perfil errado aprova ou status é ignorado | Reserva.aprovar/rejeitar, SecurityConfig, ReservaController, ADR-005 | ReservaDominioTest, ReservaServiceTest, SecurityConfigTest, SegurancaComplementarTest | 7 testes de seguranca HTTP aprovados na CI; E2E completo pendente |
| RF08 — Manutenção | Manutenção contradiz agenda | RecursoService.bloquear/cancelarBloqueio, bloqueios_recursos | Item18MysqlIT.manutencaoContraReservaUmaVence, manutencaoCanceladaAdjacenciaERecursoInativo; JMeter 04-manutencao-vs-reserva | JMeter CI: 1 reserva aceita/4 conflitos; manutencao HTTP 409 |
| RF09 — Retirada/devolução | Material retirado duas vezes ou não devolvido | MovimentacaoService, MovimentacaoMysql, UNIQUE(recurso_aberto) | Item18MysqlIT.retiradaConcorrenteUmaVence, bancoImpedeDuplaRetiradaMesmoSemServico, devolucaoTardiaDepoisDoEncerramentoPreservaHistorico | Item18/Testcontainers local; validação CI pendente |
| RF10 — Auditoria | Sem trilha, vazamento e registros órfãos | AuditoriaJdbc, AuditoriaResumo, V3__auditoria.sql, AuditoriaController | AuditoriaMysqlIT, AuditoriaControllerTest | [RF10](qualidade/rf10-auditoria.md), teste local aprovado 10/11; PR #9 aberto; imutabilidade SQL depende de grants |
| RF11 — Notificações | Envio antes do commit, perdas, reenvio duplicado | NotificacaoJdbc, ProcessadorNotificacoes, GatewayNotificacaoPadrao, V4__notificacoes.sql | NotificacaoMysqlIT, GatewayNotificacaoWireMockTest | [RF11](qualidade/rf11-notificacoes.md), `mvn clean verify` aprovado 10/11 22:17; PR #10 aberto |
| RF12 — Relatórios de utilização | Horas/trabalhos contados incorretamente | UtilizacaoReservas, ConflitosMysql; API/agregação integrada ainda a confirmar | UtilizacaoReservasTest, Item18MysqlIT.reservasConcorrentesUmaVenceEConflitoSobreviveRollback | **Parcial:** domínio e contagem de conflitos, sem evidência de endpoint de relatório completo |
| RF13 — UX e mensagens de erro | Erro 500 indevido, mensagens inadequadas | ReservaExceptionHandler, ErroApi, componentes JS de Marcos por integrar | ReservaControllerTest, Item18ApiTest; E2E de Marcos pendente | Backend local; E2E e experiência real pendentes |
| RF14 — Contrato/API | Divergência frontend/backend | docs/api/reservas-contrato.md, docs/api/item18.md, controllers | ReservaControllerTest, Item18ApiTest, revisão de Marcos | **Parcial:** contrato PROPOSTO, revisão e disponibilidade endpoint ainda pendentes |

Os testes Item18MysqlIT usam MySQL real/Testcontainers e transações independentes. O cenário BDD está em [docs/testes/item18-bdd.feature](testes/item18-bdd.feature); as asserções são executadas em JUnit, sem dependência Cucumber.

## Evidência verificável (não confundir com planos)

- [Execução histórica do Item18](testes/item18-resultados.md): datada de 09/11/2026,
  inclui versão ambiente, 167 unitários/HTTP, 15 integração MySQL e percentuais
  anteriores de JaCoCo. Não reutilizar seus percentuais como resultado atual.
- **Executado pela equipe em 10/11/2026 22:17 (-03:00)**, branch
  `feat/rf11-notificacoes`: `mvn -f backend/pom.xml clean verify`,
  `BUILD SUCCESS`, JaCoCo analisou **90 classes** e declarou
  `All coverage checks have been met`. As metas no POM são
  **LINE ≥ 80% e BRANCH ≥ 70%**, mas **percentuais exatos não foram anexados**.
- RF01/RF10/RF11 têm branches/PRs #8/#9/#10; não há evidência de merge nem CI
  verde consolidado. SonarCloud ainda aguarda administrador; seguranca complementar e JMeter foram
  executados no PR #11 com artefatos na CI.
- Ver [relatório de qualidade](qualidade/relatorio-evidencias.md), [testes de segurança](qualidade/seguranca.md),
  [JMeter](qualidade/jmeter/README.md) e [SonarCloud](qualidade/sonarcloud.md).

## Falhas de rastreabilidade até o aceite
1. Anexar XML dos testes Surefire/Failsafe e métricas reais geradas na CI.
2. Feito: LoginMysqlIT e SegurancaComplementarTest executados na CI (run 42944280415).
3. Feito: JMeter em ambiente isolado, JTL/HTML/JSON nos artefatos do run 42945127066.
4. Criar projeto SonarCloud, configurar credenciais e aguardar Quality Gate.
5. E2E de Marcos, revisão contratual de RF14, endpoint completo RF12 e registro
   de TDD RED→GREEN→REFACTOR dependem de evidências dos respectivos responsáveis.

**JMeter:** [relatorio de execucao em CI](qualidade/jmeter/evidencias-2026-11-10.md).
