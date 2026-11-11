# RTM — Organização de Recursos (RF01–RF14)

**Atualizada em 10/11/2026.** Rastreia requisito → risco → implementação → testes → evidência.
Estados: **local** = testes anteriores executados localmente; **pendente** = sem evidência
final suficiente; **parcial** = existe código, mas falta fluxo/aceite. Nenhuma linha
deve ser interpretada como aprovação final de CI ou Sonar sem relatório publicado.

| RF | Risco crítico | Implementação / contrato | Testes relacionados | Evidência e condição |
|---|---|---|---|---|
| RF02 | Patrimônio duplicado, perda de histórico, subtipo incompatível | CadastroMysql, RecursoService, V1 | migracaoIntegridadeRollbackETipos, filtrosCompetenciasEPaginacao | testes/item18-resultados.md |
| RF03 | Disponibilidade/paginação incorreta | RecursoService.pesquisar, OcupacoesMysql, ExpedienteMysql | filtrosCompetenciasEPaginacao, retiradaMantemIndisponivelEDevolucaoRespeitaAgenda | testes/item18-resultados.md |
| RF05/06 | Sobreposição, dupla reserva, lock global, gravação parcial | ReservaTransacional, RecursosMysql, ReservaMysql, ConflitosMysql | reservasConcorrentesUmaVenceEConflitoSobreviveRollback, multirecursoAtomicoEDevolucoesConcorrentes, recursosDistintosNaoEsperamOMesmoLock | testes/item18-resultados.md |
| RF08 | Manutenção concorrente contradiz agenda | RecursoService.bloquear/cancelarBloqueio/substituirExpediente | manutencaoContraReservaUmaVence, manutencaoNaoCancelaReservasEExpedienteNaoAsInvalida, manutencaoCanceladaAdjacenciaERecursoInativo | testes/item18-resultados.md |
| RF09 | Dupla retirada, devolução perdida, atraso | MovimentacaoService, UNIQUE recurso_aberto | retiradaConcorrenteUmaVence, bancoImpedeDuplaRetiradaMesmoSemServico, retiradaMantemIndisponivelEDevolucaoRespeitaAgenda, devolucaoTardiaDepoisDoEncerramentoPreservaHistorico, pendenteForaDoHorarioEUnidadeAlheiaNaoPermitemRetirada | testes/item18-resultados.md |
| RF14 | Contrato incompatível / vazamento SQL | Controllers e ReservaExceptionHandler | Item18ApiTest e ReservaControllerTest | api/item18.md, testes/item18-resultados.md |

Os testes Item18MysqlIT usam MySQL real/Testcontainers e transações independentes. Fixtures de auditoria/notificação são somente de teste. RF01, RF10 e RF11 não são declarados validados: aguardam os provedores reais da equipe. RTM completa do projeto/CI/Sonar permanecem com Débora. Arquivo BDD: testes/item18-bdd.feature; asserções em JUnit, sem dependência Cucumber.


## Incremento de frontend Marcos-1 — 10/11/2026

Estado: VALIDADO LOCALMENTE na camada cliente. Não substitui a RTM global nem comprova o RF inteiro.
| RF | Risco / comportamento | Implementação | Testes executados | Evidência |
|---|---|---|---|---|
| RF01 | Login no formato incorreto, CSRF desatualizado, sessão expirada | static/js/api.js, auth.js | clientes.test.js: CSRF por verbo, login/204, renovação, 401 distintos | [marcos-1-resultados](testes/marcos-1-resultados.md) |
| RF04 | PATCH incompleto, campos de identidade indevidos, duplo envio | static/js/reservas.js, forms.js | clientes.test.js: PATCH completo/datas; forms.test.js: guard e restauração | [saída executada](testes/marcos-1-verificacao.txt) |
| RF07 | Oferta visual de aprovação a perfil indevido | static/js/auth.js, reservas.js | clientes.test.js: perfil e rotas de decisão/motivo | [marcos-1-resultados](testes/marcos-1-resultados.md) |
| RF13 | Erro incompreensível, resposta HTML, repetição após falha | static/js/api.js, forms.js | clientes.test.js: 400/403/404/409/rede; forms.test.js | [saída executada](testes/marcos-1-verificacao.txt) |
| RF14 | Documentação divergente e DTO incorreto | api/frontend-integracao.md, contrato de reservas, clientes JS | Testes do contrato de escrita; revisão de cliente documentada | [integração frontend](api/frontend-integracao.md), [plano](planejamento/marcos-plano-de-acao.md) |

Testes em tests/unit/frontend/ usam fetch e formulário controlados exclusivamente em isolamento. Segurança do servidor, UI responsiva, E2E real, auditoria e corrida no banco permanecem sem validação por este incremento.

## Aceite do contrato pelo frontend — Marcos-contrato-1

| RF | Risco | Artefato | Evidência / limite |
|---|---|---|---|
| RF14 | Datas, PATCH e erro de expediente ambíguos; confundir especificação com API disponível | api/reservas-contrato.md, api/reservas-leitura-contrato.md | [Revisão documental e gates](testes/marcos-contrato-1-resultados.md); aceite de Marcos, revisões de backend/segurança e implementação de leitura pendentes |

## Telas de acesso — Marcos-2

| RF | Risco / comportamento | Implementação | Testes executados / evidência |
|---|---|---|---|
| RF01 | Login, expiração e logout inconsistentes; perfil não reconhecido | login.html, index.html, login-page.js, dashboard-page.js, auth.js/api.js | tests/browser/acesso.spec.js: login por teclado, sessão expirada, sessão válida, logout sucesso/falha, perfil desconhecido; [resultados](testes/marcos-2-resultados.md) |
| RF13 | Duplo envio, erro interpretado como HTML, navegação indevida ou largura móvel inutilizável | forms.js, ui.js, navegacao.js, css/app.css | 15 cenários em desktop e móvel (30 execuções); capturas e saída em [resultados](testes/marcos-2-resultados.md) |
| RF14 | Confundir mock de navegador com autenticação real | api/frontend-integracao.md, stories/marcos-2.md | Contratos reais mantidos; testes interceptam API somente em isolamento; E2E real permanece pendente |

Esta etapa não comprova autorização no servidor, cookie HttpOnly real, CSRF real do Spring, auditoria ou concorrência MySQL. As 21 verificações unitárias existentes também passaram.

Encerramento do incremento local registrado com aceite visual de Marcos em 10/11/2026. O autor repetiu o build com lint/tipos sem diagnósticos, 21 testes unitários e 30 testes de navegador aprovados; [saída fornecida pelo autor](testes/marcos-2-verificacao-marcos.txt). Story Ready for Review; integração real, revisão de outro integrante, CodeRabbit e CI continuam pendentes antes do merge.

## Pesquisa e criação — Marcos-3

Estado: VALIDADO LOCALMENTE no primeiro recorte da etapa 3, em 10/11/2026. Não comprova os RFs inteiros nem integração real.

| RF | Risco / comportamento | Implementação | Testes e evidência |
|---|---|---|---|
| RF03 | Filtros/paginação incompatíveis, recurso indisponível selecionado, resposta antiga exibida | recursos.js, recursos-page.js, pages/recursos.html | recursos-datas.test.js: filtros/envelope/expediente; recursos.spec.js: pesquisa, páginas, seleção, vazio, indisponibilidade e resposta atrasada; [resultados](testes/marcos-3-resultados.md) |
| RF04 | Fuso incorreto, DTO indevido, duplicação de POST, sucesso sem confirmação | datas.js, reservas.js, pages/reservas.html | recursos-datas.test.js: instantes/DST/intervalo e resposta; recursos.spec.js: comum/restrita, seleção multi-recurso, duplo envio, erros/rede/resposta inválida; [log aprovado](testes/marcos-3-verificacao.txt) |
| RF13 | Formulário móvel inutilizável, HTML interpretado, foco perdido, sessão expirada | css/app.css, sessao-page.js, navegacao.js, recursos-page.js | 23 cenários novos em duas viewports (46 execuções), mais 30 regressões de acesso; [capturas e limites](testes/marcos-3-resultados.md#primeira-rodada-e-capturas) |
| RF14 | Presumir GETs de reservas ou integração pronta | frontend-integracao.md, stories/marcos-3.md, plano | Clientes usam apenas contratos atuais; testes verificam ausência de GET de reservas. [Ambiente/resultados](testes/marcos-3/resultados.json) |

`npm run build` passou com 32 testes unitários e 76 execuções de navegador, zero falhas/ignorados/retries na rodada aprovada. O primeiro timeout no setup e a reexecução de quatro capturas são registrados separadamente. Integração real, revisão humana/CodeRabbit e CI pendentes. Listagem/reabertura para edição/cancelamento de reservas existentes aguardam GETs e política Q9; a etapa 3 completa permanece em execução.
| RF01 — Sessão e autorização | Usuário indevido, CSRF e IDOR | SecurityConfig, UsuarioDetailsService, SpringSecurityAtorProvider, UsuarioAdminController, ADR-004 | SecurityConfigTest, SpringSecurityAtorProviderTest, SegurancaComplementarTest, LoginMysqlIT | [RF01](qualidade/relatorio-evidencias.md); SegurancaComplementarTest (7) e LoginMysqlIT (3) aprovados na CI Java21; CT17/logout complementar aprovado na CI do PR #12; PR #8 aberto |
| RF02 — Cadastro de recursos | Patrimônio duplicado, subtipo errado | RecursoService, CadastroMysql, V1__item18.sql | Item18MysqlIT.migracaoIntegridadeRollbackETipos, filtrosCompetenciasEPaginacao | [Item18 executado em 09/11](testes/item18-resultados.md); revisar CI após integração |
| RF03 — Consulta/disponibilidade | Filtro incorreto, agenda ocupada aparece livre | RecursoService.pesquisar, OcupacoesMysql, ExpedienteMysql, GET /api/recursos | Item18MysqlIT.filtrosCompetenciasEPaginacao, retiradaMantemIndisponivelEDevolucaoRespeitaAgenda; JMeter 01-consultas | JMeter CI: 50 consultas HTTP 200, p95=6 ms (banco isolado) |
| RF04 — Criar e editar reserva | Acesso a recurso alheio, edição inválida | ReservaService.criar/editar, ReservaController, ReservaTransacional | ReservaServiceTest, ReservaControllerTest, SegurancaComplementarTest | Unitário/MVC local; E2E de edição com Marcos pendente; endpoint desligado por padrão |
| RF05 — Sobreposição | Duas reservas no mesmo recurso/horário | IntervaloReserva, DetectorConflitos, OcupacoesMysql | DetectorConflitosEExpedienteTest, ReservaConcorrenciaSimuladaTest, Item18MysqlIT.reservasConcorrentesUmaVenceEConflitoSobreviveRollback; JMeter 02-disputa | JMeter CI: 1 reserva criada, 7 conflitos HTTP 409; uma ativa no banco |
| RF06 — Atomicidade/locks | Dupla reserva, deadlock, gravação parcial | RecursosMysql FOR UPDATE, ReservaTransacional READ_COMMITTED, ReservaMysql | Item18MysqlIT.multirecursoAtomicoEDevolucoesConcorrentes, recursosDistintosNaoEsperamOMesmoLock, locksExigemTransacaoEOrdem; JMeter 02 e 03 | JMeter CI: disputa sem dupla reserva; 5 recursos distintos com 5 reservas |
| RF07 — Aprovação restrita | Perfil errado aprova ou status é ignorado | Reserva.aprovar/rejeitar, SecurityConfig, ReservaController, ADR-005 | ReservaDominioTest, ReservaServiceTest, SecurityConfigTest, SegurancaComplementarTest | 7 testes de seguranca HTTP aprovados na CI; E2E completo pendente |
| RF08 — Manutenção | Manutenção contradiz agenda | RecursoService.bloquear/cancelarBloqueio, bloqueios_recursos | Item18MysqlIT.manutencaoContraReservaUmaVence, manutencaoCanceladaAdjacenciaERecursoInativo; JMeter 04-manutencao-vs-reserva | JMeter CI: 1 reserva aceita/4 conflitos; manutencao HTTP 409 |
| RF09 — Retirada/devolução | Material retirado duas vezes ou não devolvido | MovimentacaoService, MovimentacaoMysql, UNIQUE(recurso_aberto) | Item18MysqlIT.retiradaConcorrenteUmaVence, bancoImpedeDuplaRetiradaMesmoSemServico, devolucaoTardiaDepoisDoEncerramentoPreservaHistorico | Item18/Testcontainers local; validação CI pendente |
| RF10 — Auditoria | Sem trilha, vazamento e registros órfãos | AuditoriaJdbc, AuditoriaResumo, V3__auditoria.sql, AuditoriaController | AuditoriaMysqlIT, AuditoriaControllerTest | [RF10](qualidade/rf10-auditoria.md), teste local aprovado 10/11; auditoria de cadastro administrativo adicional aprovada na CI do PR #12; PR #9 aberto; imutabilidade SQL depende de grants |
| RF11 — Notificações | Envio antes do commit, perdas, reenvio duplicado | NotificacaoJdbc, ProcessadorNotificacoes, GatewayNotificacaoPadrao, V4__notificacoes.sql | NotificacaoMysqlIT, GatewayNotificacaoWireMockTest | [RF11](qualidade/rf11-notificacoes.md), `mvn clean verify` aprovado 10/11 22:17; timeout WireMock complementar aprovado na CI do PR #12; PR #10 aberto |
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
