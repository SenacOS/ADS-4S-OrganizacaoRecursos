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

## Administração de recursos — Marcos-5

| RF | Risco / comportamento | Implementação | Testes e evidência |
|---|---|---|---|
| RF02 | Cadastro incorreto por tipo, edição parcial, tipo alterado ou desativação sem confirmação | administracao-recursos.js, gestao-recursos-page.js, gestao-recursos.html | administracao-recursos.test.js e administracao-recursos.spec.js: três tipos, GET de detalhe, PUT completo, whitelist, 204 e conflito; [resultados](testes/marcos-5-resultados.md) |
| RF03 | Paginação ou filtros administrativos indevidos | pesquisa compartilhada de recursos.js e lista administrativa | Filtros, paginação do servidor, inativos, falha/recuperação, sem filtro ativo inventado; [resultados](testes/marcos-5-resultados.md) |
| RF08 | Bloqueio com fuso incorreto, cancelamento indevido ou perda de expediente | administracao-recursos.js, datas.js, gestao-recursos-page.js | Multidia, snake_case, cancelamento confirmado, todas as janelas, precisão, sobreposição/fechamento e 409; [resultados](testes/marcos-5-resultados.md) |
| RF13/14 | Acesso visual indevido, repetição de escrita, XSS e confusão entre mock e integração | guarda por perfil, forms.js/api.js, administracao.css, documentação | Ausência de GET administrativo para perfil indevido, envio único, CSRF/rede/403, textos seguros, teclado e viewports; [resultados e limites](testes/marcos-5-resultados.md) |

Evidência desta etapa é da camada cliente com API controlada; não comprova autorização no servidor, persistência, auditoria ou concorrência. Movimentações, Q9, fila e integração real permanecem fora do recorte.

Rodada final da Marcos-5: lint e checkJs aprovados, 45 unitários e 130 execuções de navegador aprovados (54 administrativas e 76 regressões), zero falhas/ignorados/retries. [Saída real](testes/marcos-5-verificacao.txt) e [JSON](testes/marcos-5/resultados.json). A primeira rodada e o defeito FE-002 estão registrados separadamente; revisão humana de outro integrante, CodeRabbit, CI e integração real permanecem pendentes.

Reexecução pelo autor recebida em 11/11/2026: lint/tipos sem diagnósticos, 45 unitários e 130 testes de navegador aprovados (1,3 min), com Chrome selecionado no CMD. [Saída fornecida pelo Marcos](testes/marcos-5-verificacao-marcos.txt). Após abertura da revisão visual no Chrome com dados fictícios, Marcos deu o aceite local e solicitou o commit. Revisão de outro integrante, CodeRabbit, CI e integração continuam pendentes; movimentações ficam para outro recorte.
