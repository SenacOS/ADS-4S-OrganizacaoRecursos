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
