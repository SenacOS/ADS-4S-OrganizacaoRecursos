# Matriz de rastreabilidade - item 18

## Complemento Marcos-3 — consulta, edição e cancelamento

Aceite posterior em 12/11/2026: Marcos informou que os testes funcionaram, aprovou visualmente e autorizou commit local. [Registro e alcance](testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Sem mudança de produto/testes ou nova suíte; revisão da equipe, checks, publicação e merge continuam separados. As observações de aceite pendente abaixo descrevem a execução anterior.

12/11/2026, branch `feature/marcos-reservas-consulta` sobre f9c4912, código local ainda sem commit. Estado atual prevalece sobre diagnósticos históricos de GET ausente/UI geral pendente abaixo. [Story](stories/marcos-3-consulta-edicao.md) e [resultados, hashes, testes controlados/reais e limites](testes/marcos-3-consulta-edicao-resultados.md).

| Requisito / risco | Implementação | Evidência |
|---|---|---|
| RF01/RF03/RF04 — escopo, consulta/detalhe e reserva | consulta-reservas.js, minhas-reservas.html e navegação dos três perfis; GET antes das ações | Unitários de DTO/envelope/escopo/permissões e browser de filtros/páginas/detalhe; E2E real de lista/detalhe, dono, Responsável e Administrador |
| RF04 — perda de recursos/precisão e escrita indevida | consulta-reservas-page.js, datas.js e reservas.js; PATCH conjunto, ISO original e comparações precisas, seleção original | Unitários e browser de seleção entre páginas, próprios indisponíveis, datas inalteradas e intervalo submilissegundo; E2E de PATCH/microssegundos, inclusão e conflito409 |
| RF04/RF07 — consulta não concede decisões/escrita | Guardas por dono/estado; aprovação permanece na fila; cancelamento dono/Admin | Browser de perfis/estados; E2E de Responsável somente consulta e cancelamento dono/Admin, persistência CANCELADA |
| RF13 — reenvio, confirmação falsa, sessão, texto/foco/móvel | Guard, detalhe novo após operação incerta, CSRF/sessão e UI compartilhados | Browser controlado com rede/incoerência/409, falha pós-sucesso, duplo envio,401/texto/teclado/duas viewports; E2E de reconsulta e móvel |
| RF14 — atribuição indevida de resultados | Manifesto da árvore sem commit, logs separados, helper real e smoke geral | Regressão/E2E e tentativas preservadas, package sem testes Maven explicitado; aceite humano/checks remotos pendentes |

As provas encerram somente os caminhos executados. Revisão visual nova, revisão da equipe, ratificação coletiva/processo de vínculos, matriz integrada restante e checks remotos não são presumidos. FE-005 identificado por QA foi corrigido e coberto; fronteira de comparação temporal também recebeu regressão própria. Históricos anteriores abaixo permanecem vinculados às suas bases.

## Revalidação após PR #27 — develop4cea177

Aceite visual global do autor e solicitação de commit local recebidos em12/11, após roteiro com21solicitações reais de teste. [Registro](testes/marcos-integracao-q9-1-aceite-visual-2026-11-12.md). Não encerra os RFs inteiros nem atribui revisão de outro integrante/CI aprovada; nenhuma suíte repetida para este registro documental.

12/11/2026: merge local ainda sem commit, preservando8c21a43. [Q9/fila reais10PASS/0FAIL e smoke16/0/1](testes/marcos-integracao-q9-1-pr27-resultados.md). Acrescentadas provas de página vazia preservando total e revogação retirando leitura/decisão (404/403) sem apagar reserva; RF01/RF04/RF07/RF13/RF14 nos caminhos executados. Fontes/JAR conferidos; frontend72/240 mantido por hashes, sem nova suíte isolada. Não encerra UIgeral, matriz E2E inteira, revisão humana ou checks remotos. CI4cea177 aprovou244unitários/HTTP e57IT/cobertura, mas scanner falhou depois. Registros anteriores abaixo preservados.

## Integração Q9 / fila — PR #26

12/11/2026, branch `feature/marcos-integracao-q9`, HEAD8c21a43 + merge local sem commit de develop3f2a9a3. [Resultados reais e limites](testes/marcos-integracao-q9-1-resultados.md): **8 PASS/0 FAIL** para escopo por sessão, total/paginação autorizados, 404 de detalhe alheio, vínculos parciais/completos e fila no Chrome com aprovação/rejeição/motivo. RF01/RF04/RF07/RF13/RF14 nos caminhos executados. [Contrato conferido](api/reservas-consulta-contrato.md).

Smoke atualizado16/0/1; bloqueio é UI geral ainda ausente, não ausência de GETs/Q9. FlywayV6 aplicada e módulos servidos conferidos; produto/testesfrontend mantêm hashes do72/240 anterior, sem nova regressão completa. Ratificação coletiva multi-recurso, gestão dos vínculos, interface geral, revisão humana e checks/Sonar continuam pendentes. CI develop3f2a9a3 aprovou243unitários/HTTP e56IT, cobertura; scanner falhou depois. Registros abaixo são históricos.

## Fechamento local de Marcos — 12/11/2026, após PR #24

Base develop da5881b; branch `fix/marcos-qualidade-frontend`, alterações novas não commitadas. PRs #23/#24 mesclados; registros abaixo mantêm seus contextos históricos.

| RF | Incremento / evidência atual | Limite |
|---|---|---|
| RF02/RF08/RF13/RF14 | Comparação textual explícita para confirmação administrativa; [qualidade](testes/marcos-qualidade-1-resultados.md) e regressão posterior 72 unitários/240 navegador | CI scanner Sonar ainda depende de autorização/configuração da equipe |
| RF09/RF13/RF14 | FE-004: datas em minutos com offset aceitas; [regressão RED e build](testes/marcos-integracao-datas-1-resultados.md), JAR servido conferido e retirada/devolução reais | Não muda identidade, transições ou formatos enviados; não prova concorrência/atraso positivo |
| RF01/RF02/RF03/RF04/RF08/RF09/RF13/RF14, nos cenários exercitados | [Smoke real](testes/marcos-e2e-local-2026-11-12-resultados.md): 16 PASS/0 FAIL/1 BLOQUEADO, três perfis, Chrome/Spring/MySQL, sem mock | GETs de reservas 405; não há E2E de fila/Q9, reabertura de edição ou matriz completa do plano |
| RF10/RF11, evidência complementar | SELECTs confirmaram auditoria/outbox reais nos fluxos; worker desligado | Não prova imutabilidade por grants nem envio externo |

As contagens são por execução e não se somam. [Guia local](integracao/marcos-e2e-local.md), [handoff de dependências](integracao/marcos-pendencias-2026-11-12.md). Revisão assistida independente, revisão humana, aceite de Marcos e checks remotos são estados separados; os RFs completos não são encerrados por este incremento.

Reexecução de Marcos em 12/11/2026, 13:19 (-03:00): ambiente pronto e smoke real **16 PASS/0 FAIL/1 BLOQUEADO**; [JSON original do autor](testes/marcos-e2e-local-2026-11-12/resultados-marcos.json) preservado, com nove hashes conferidos. Confirma os cenários disponíveis, sem novo aceite visual ou encerramento de fila/lista/detalhe/Q9.

Posteriormente Marcos informou **aceite visual** do roteiro no Chrome com backend real e os três perfis. [Registro e limites](testes/marcos-qualidade-aceite-visual-2026-11-12.md). Sem ajuste solicitado ou nova suíte; revisão da equipe, contratos/GETs/Q9 e checks remotos continuam pendentes. Commit depende de solicitação própria.

| RF | Risco crítico | Implementação / contrato | Testes relacionados | Evidência e condição |
|---|---|---|---|---|
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

Conciliação em 11/11/2026: matriz ampliada da equipe preservada. Os estados de PR/CI nas evidências abaixo são registros históricos de 10/11; os PRs #8, #9, #10 e #12 já foram integrados à `develop` na base `3454fda`. Isso não equivale a aceite do frontend com servidor real.

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

## Cliente da fila e decisões — Marcos-4

Estado: VALIDADO LOCALMENTE contra a especificação aceita pelo frontend em 10/11/2026. GET/autorização/projeção no backend e integração real continuam pendentes.

| RF | Risco / comportamento | Implementação | Testes e evidência |
|---|---|---|---|
| RF07 | Ação oferecida a perfil indevido, fila/detalhes incoerentes, motivo vazio ou decisão sem confirmação | aprovacoes.js, aprovacoes-page.js, pages/aprovacoes.html, navegacao.js | aprovacoes.test.js: perfis, filtros, projeção e escritas; aprovacoes.spec.js: acesso direto negado, decisão comum de aprovação/rejeição, motivo obrigatório e 403; [resultados](testes/marcos-4-resultados.md) |
| RF13 | Resposta atrasada, duplo envio, falha de recarga confundida com falha da decisão, layout/foco inadequados | aprovacoes-page.js, datas.js, css/app.css | 24 cenários em duas viewports (48 execuções), com rede/400/401/403/404/409, página esvaziada, pós-decisão, HTML como texto, teclado e foco; [log](testes/marcos-4-verificacao.txt) |
| RF14 | Confundir cliente de especificação com GET implementado ou autorização do servidor | reservas-leitura-contrato.md, frontend-integracao.md, story/plano | DTO e estado do contrato explícitos; sem GET de detalhe, listagem geral/Q9 ou flags ativadas; [ambiente e limites](testes/marcos-4/resultados.json) |

Gates aprovados: lint, checkJs, 43 testes unitários e 124 execuções de navegador (48 novas e 76 regressões), zero falhas/ignorados/retries. A leitura da fila, a autorização no servidor e o E2E integrado ainda precisam da equipe; validação humana, revisão independente e CI pendentes. Não se marca o RF inteiro como concluído.

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

## Movimentações — complemento da etapa 5

| RF | Risco / comportamento | Implementação | Testes e evidências |
|---|---|---|---|
| RF09 | Retirada sem conferência ou DTO divergente | movimentacoes.js, movimentacoes-page.js, movimentacoes.html | Número da reserva, seleção explícita de patrimônio e POST somente IDs, confirmação coerente; [resultados](testes/marcos-5-movimentacoes-resultados.md) |
| RF09 | Pendência desaparecer por prazo/cadastro ou devolução atribuída ao operador errado | lista aberta, enriquecimento com fallback, confirmação idempotente | Prazo estimado/atraso final, recurso inacessível, operador de devolução real, confirmação/falhas e atualização sem replay; [resultados](testes/marcos-5-movimentacoes-resultados.md) |
| RF13/14 | Perfil indevido consultar/escrever, escrita duplicada ou texto inseguro | sessão/guard/api compartilhados, CSS específico e consumo documentado | Perfis antes dos GETs, Administrador em leitura, CSRF, duplo envio, erros, resposta antiga, teclado/fuso/viewports; [resultados e limites](testes/marcos-5-movimentacoes-resultados.md) |

API controlada exclusivamente nos testes; não se comprova Spring Security, MySQL, eventos, notificação ou concorrência. Q9, Marcos-4, relatórios e histórico completo permanecem fora deste recorte. Administração/PR 20 não recebe alterações desta branch.

Rodada final: lint/checkJs/build aprovados, 57 testes unitários (12 novos) e 190 de navegador (60 de movimentações, 130 regressões), zero falhas/ignorados/retries. [Saída integral](testes/marcos-5-movimentacoes-verificacao.txt) e [JSON](testes/marcos-5-movimentacoes/resultados.json). FE-003 corrigido após revisão; primeira rodada preservada. Revisão humana de outro integrante, integração e CI pendentes.

Reexecução pelo autor recebida em 11/11/2026: lint/tipos sem diagnósticos, 57 unitários e 190 testes de navegador aprovados (1,9 min). [Saída fornecida pelo Marcos](testes/marcos-5-movimentacoes-verificacao-marcos.txt), preservada integralmente. Aceite visual, revisão de outro integrante, CI e integração não são inferidos dessa execução.

Posteriormente, Marcos confirmou o teste visual no Chrome com dados fictícios e solicitou o commit em 11/11/2026. Auxiliar temporário fora do repositório, sem mudanças no produto para a prévia. Administração e movimentações encerram a implementação local da etapa 5 com aceite do autor; revisão da equipe, CodeRabbit/CI e integração real permanecem pendentes. [Registro do aceite](testes/marcos-5-movimentacoes-resultados.md#aceite-visual-e-autorização-de-commit).

## Evidências históricas da equipe — 10/11/2026


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

## Conciliação do frontend — Marcos-4 e etapa 5

Em 11/11/2026, a preparação local da Marcos-4 foi conciliada em branch própria baseada em `f7360a2`, preservando os incrementos administrativos/de movimentações e as evidências anteriores. Os testes de acesso verificam os links de Aprovações, Gestão e Movimentações por perfil; a ajuda da fila descreve o escopo de recursos do Responsável da Q9. A autorização real desse escopo ainda depende do backend.

`npm run build` final aprovado: lint/typecheck, 68 unitários e 238 execuções de navegador, 119 por viewport; zero falhas/ignorados/retries na rodada final. Uma primeira falha de preparação do contexto do Chrome e seis repetições diagnósticas aprovadas foram preservadas separadamente, sem alteração de código/timeout. [Comandos, resultados, limites e capturas](testes/marcos-4-conciliacao-resultados.md).

Reexecução automatizada apresentada por Marcos no checkout conciliado: lint/typecheck sem diagnósticos, 68 unitários e 238 de navegador aprovados em 6,3 min. [Saída integral do autor](testes/marcos-4-conciliacao-verificacao-marcos.txt), preservada com SHA-256 conferido. A execução anterior do autor na pasta original (43/124) permanece registrada separadamente.

O aceite visual da Marcos-4 foi posteriormente informado em 12/11/2026, conforme registro abaixo. Revisão independente, checks exigidos e E2E com backend real permanecem pendentes. Esse resultado não demonstra segurança Spring, persistência, concorrência, auditoria ou notificações e não encerra os RFs completos.

## Sincronização local da Marcos-4 com a develop — 12/11/2026

A pedido de Marcos, develop 23cf839 (incluindo os PRs #22/#23) foi incorporada à Marcos-4 df57063 sem conflitos. Os 45 arquivos de frontend/testes/configuração foram preservados. O adaptador SQL da fila foi importado dos commits da equipe; controller HTTP e autorização Q9 continuam pendentes.

Regressão local: npm run build exit 0, lint/typecheck aprovados, 68 unitários e 238 execuções de navegador aprovados, 119 por viewport, zero falhas/ignorados/flaky/retries. [Resultados e limites](testes/marcos-sincronizacao-2026-11-12-resultados.md), [log](testes/marcos-sincronizacao-2026-11-12-verificacao.txt) e [resumo JSON](testes/marcos-sincronizacao-2026-11-12.json).

Esta evidência não substitui aceite visual detalhado, revisão independente, Maven/CI ou E2E real. Não houve publicação remota nesta etapa. Sonar e demais dependências permanecem discriminados no [plano de fechamento](planejamento/marcos-fechamento-etapas-1-a-5.md).

## Aceite visual da Marcos-4 — 12/11/2026

Após a publicação de a8da77c, Marcos revisou a prévia de Aprovações no Chrome, perfil Responsável, com 21 solicitações fictícias, e informou “está aprovado”. O roteiro apresentado incluiu detalhes, aprovação/rejeição, motivo obrigatório, filtros/vazio, paginação e layout/teclado. [Registro do aceite](testes/marcos-4-aceite-visual-2026-11-12.md).

Interface aceita pelo autor, sem ajustes funcionais solicitados. Registro exclusivamente documental, preservando a regressão anterior de 68 unitários/238 navegador; sem nova execução, E2E real, revisão independente ou alteração do PR nesta rodada. Contrato coletivo, endpoint HTTP, autorização Q9 e checks para merge continuam acompanhados separadamente.
