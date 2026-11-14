# Matriz de rastreabilidade — Organização de Recursos

**Base vigente:** branch `develop`, commit `b73c501536a275cdc89101cc7130c7b481e52396`, conferido em 13/11/2026. Esta matriz consolida os RF01–RF14 e aponta as evidências disponíveis por requisito. Registros cronológicos anteriores foram preservados em [`RTM-historica-ate-2026-11-13.md`](RTM-historica-ate-2026-11-13.md).

## Complemento local — etapa 7 — 13/11/2026

Documentação do [PR #44](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/44) incorporada em `7d5480b`, sem mudança de código em relação à base dos testes `b73c501`. Na branch `test/marcos-7-validacao-integrada`, Q5 está conciliada no cliente/tela e aceita por Marcos; o incremento tem commit/push/PR autorizados e aguarda revisão/integração da equipe. [Matriz RF/CT/camada](testes/marcos-7-matriz-evidencias.md), [resultados e tentativas](testes/marcos-7-resultados.md), [inventário](testes/marcos-7/inventario.json), [story](stories/marcos-7.md), [aceite do autor](testes/marcos-7-verificacao.md#aceite-do-autor--13112026) e [conferência do PR #44](testes/marcos-7-pr44-revisao.md).

Gates locais da etapa7: package287, build100/350 e sete suítes reais com resultados próprios. Essas provas não substituem CI, Testcontainers ou revisão independente. As referências ao cliente sem motivo nas versões históricas descrevem a base anterior ao ajuste local.

## Estado vigente dos requisitos funcionais

| RF | Requisito | Implementação integrada | Evidência principal e limite identificado |
|---|---|---|---|
| **RF01** | Autenticação e autorização por perfil | Spring Security, sessão HttpOnly, CSRF, `UsuarioDetailsService` e provedor de ator autenticado. | [`seguranca.md`](qualidade/seguranca.md), `LoginMysqlIT`, `SegurancaComplementarTest` e [`q9-autorizacao-reservas.md`](seguranca/q9-autorizacao-reservas.md). Configuração `Secure` deve acompanhar o ambiente HTTPS. |
| **RF02** | Cadastro e consulta de salas, professores e materiais | CRUD por tipo, filtros, paginação, desativação lógica, expediente e manutenção. | [`item18.md`](api/item18.md), `Item18MysqlIT` e resultados frontend Marcos-5. |
| **RF03** | Pesquisa por tipo, capacidade, localização, competência e disponibilidade | Pesquisa no servidor, paginação, filtros e cálculo de disponibilidade por período. | `Item18MysqlIT`, `GET /api/recursos` e plano JMeter `01-consultas`. |
| **RF04** | Criação, alteração e cancelamento de reservas | `ReservaService`, controller REST, consultas, edição/cancelamento, auditoria e notificação transacional. | [`reservas-contrato.md`](api/reservas-contrato.md), testes de domínio/serviço/API e E2E de edição. Backend Q5 integrado pelo #43; cliente/tela conciliados e aceitos localmente na etapa7, com [8 cenários reais Q5](testes/marcos-7/cancelamento-resultados.json), com publicação autorizada e revisão/integração pendentes. |
| **RF05** | Detecção de sobreposição de horários, inclusive de professor | `IntervaloReserva`, `DetectorConflitos`, ocupações MySQL e verificação centralizada. | `IntervaloReservaTest`, `DetectorConflitosEExpedienteTest`, `Item18MysqlIT` e JMeter `02-disputa-reserva`. |
| **RF06** | Proteção contra dupla reserva simultânea | Locks `FOR UPDATE`, ordenação de IDs, `READ_COMMITTED` e controle transacional compartilhado. | `Item18MysqlIT`, testes de concorrência/edição e JMeter `02-disputa-reserva` e `03-recursos-distintos`. Cargas são cenários controlados, não SLA. |
| **RF07** | Aprovação obrigatória para recursos restritos | Fila de aprovação, aprovação/rejeição por Responsável, prevenção de autoaprovação e revalidação Q8. | `ReservaFilaMysqlIT`, `ReservaQ9MysqlIT`, `ReservaAprovacaoMysqlIT`, PRs #26/#27, #30/#31 e #33/#34. |
| **RF08** | Bloqueio de recursos em manutenção | Bloqueios de manutenção integrados à disponibilidade e às transações de reserva. | `Item18MysqlIT`, gestão de recursos e JMeter `04-manutencao-vs-reserva`. |
| **RF09** | Retirada e devolução de materiais e equipamentos | `MovimentacaoService`, adaptador MySQL, controle de retirada aberta, devolução e atraso. | `Item18MysqlIT`, resultados Marcos-5 e [`marcos-fechamento-e2e-1-resultados.md`](testes/marcos-fechamento-e2e-1-resultados.md). |
| **RF10** | Histórico auditável de mudanças | Auditoria transacional com ator, ação, antes/depois e correlação; consulta administrativa. | [`rf10-auditoria.md`](qualidade/rf10-auditoria.md), `AuditoriaMysqlIT`, `AuditoriaControllerTest` e `UsuarioAuditoriaMysqlIT`. A restrição de privilégios SQL deve ser conferida no ambiente operacional. |
| **RF11** | Notificação simulada ou integração externa | Outbox transacional, processador, gateway simulado por log e gateway HTTP testado com WireMock. | [`rf11-notificacoes.md`](qualidade/rf11-notificacoes.md), `NotificacaoMysqlIT`, `GatewayNotificacaoWireMockTest` e [demonstração RF11](operacao/demonstracao-fechamento.md). O modo simulado não significa entrega externa. |
| **RF12** | Relatórios de utilização, carga horária e conflitos evitados | Persistência (#37), serviço/DTO (#39), endpoint/wiring (#41), interface (#40) e integração com rota real (#42). | [`relatorios-utilizacao-proposta.md`](api/relatorios-utilizacao-proposta.md) e [resultados reais](testes/marcos-6-integracao-real-resultados.md): 13 cenários reais PASS/0 FAIL. A política ADMIN do endpoint permanece provisória. |
| **RF13** | Interface responsiva e mensagens de erro compreensíveis | Interface estática responsiva, sessão/perfis, feedback de erros e prevenção de envio duplicado. | Suítes Playwright, capturas desktop/mobile e [resultados RF12](testes/marcos-6-integracao-real-resultados.md). PR #42: 97 testes unitários e 346 execuções de navegador. Nova [rodada local da etapa7](testes/marcos-7-resultados.md): 100/350, Q5/RF12 desktop/mobile e aceite do autor. Execuções separadas; frontend não integra o workflow de CI atual. |
| **RF14** | Documentação da API ou dos fluxos públicos | Contratos HTTP, DTOs, envelope de erros, ADRs, sequências e esta RTM. | [`docs/api/`](api/), [`ADR-007`](arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md), [`sequencia-reserva.md`](arquitetura/sequencia-reserva.md) e contratos do frontend. |

## Decisões complementares de reservas

| Decisão | Resumo | Estado vigente |
|---|---|---|
| **Q1** | Início, conclusão e não comparecimento são exclusivos do Responsável. | Integrada no PR #31. |
| **Q2** | Reserva restrita aprovada não é editável pelo PATCH. | Resolvida no ADR-007; sem código adicional. |
| **Q3** | Responsável não aprova a própria reserva, mesmo com vínculo completo. | Integrada no PR #30. |
| **Q5** | Administrador cancelando reserva de terceiro exige `motivo` não vazio, até 500 caracteres, persistido em `motivo_cancelamento` (V7). | Backend integrado no PR #43; integração do corpo e campo condicional implementados/testados e aceitos localmente na etapa7, com publicação autorizada e revisão/integração pendentes. |
| **Q8** | Aprovação revalida autorização, estado, ativos, expediente e conflitos dentro da transação. | Integrada nos PRs #33/#34. |
| **Q9** | A consulta e a fila respeitam a identidade da sessão e o vínculo com todos os recursos da reserva. | Integrada nos PRs #26/#27 e formalizada no ADR-007. |

> Q2 e Q5 são decisões de regra de negócio sob RF04/RF07, não requisitos funcionais novos. O ajuste Q5 do cliente está concluído localmente; o backend permanece o mesmo integrado pelo #43. A entrega remota do novo frontend conserva seu ciclo próprio.

## Evidências transversais de qualidade

| Camada | Evidência vigente | Interpretação correta |
|---|---|---|
| Backend / MySQL / JaCoCo | CI do PR #43 (run [43525712520](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43525712520)): `mvn clean verify`, Testcontainers e verificações JaCoCo concluídos com sucesso. | Os limites configurados (80% linhas e 70% branches) foram atendidos nessa execução. Não atribuir o mesmo resultado a outras versões sem seu próprio run. |
| Desempenho | Job JMeter do PR #43: quatro planos executados em banco isolado, job concluído com sucesso. | Evidência de cenários específicos; não define capacidade máxima ou SLA de produção. |
| Frontend / RF12 | PR #42: 97 testes unitários, 346 execuções de navegador, 13 cenários HTTP reais e 277 testes Maven unitários/HTTP em comandos/execuções distintos. | Não somar contagens de camadas/rodadas diferentes. A execução Maven `package -DskipITs` não substitui o `clean verify` com Testcontainers. |
| Regressão local / etapa7 | [Resultados e limites](testes/marcos-7-resultados.md): 287 Java unitários/HTTP, 100 unitários frontend, 350 navegador e sete suítes reais; [aceite informado por Marcos](testes/marcos-7-verificacao.md#aceite-do-autor--13112026). | Árvore executável e fontes conferidas por hash após incorporar somente documentação do #44; nenhuma nova execução atribuída à conferência documental. Sem CI ou revisão independente deste incremento presumidas. |
| SonarCloud | Etapa do PR #43 retornou `Not authorized or project not found`. | Não há Quality Gate SonarCloud aprovado nessa execução. JaCoCo não substitui o Sonar. |

O arquivo [`relatorio-evidencias.md`](qualidade/relatorio-evidencias.md) preserva o consolidado preliminar de 10/11/2026 e deve ser interpretado como registro histórico, não como painel de estado vigente. Para resultados posteriores, consulte os registros específicos de integração RF12, a CI do PR #43, [`sonarcloud.md`](qualidade/sonarcloud.md), [`jmeter/`](qualidade/jmeter/) e os relatórios de cada execução. Evidências locais, CI, aceite humano, revisão independente e implantação são categorias diferentes e não devem ser tratadas como equivalentes.

## Limites de interpretação

- As APIs de recursos, movimentações e reservas estão desabilitadas por padrão no `application.yml`; a execução local deve habilitar explicitamente as propriedades correspondentes.
- A política de acesso ADMINISTRADOR do RF12 é provisória, conforme o serviço integrado.
- RF11 está comprovada no modo de simulação por log e nos testes de gateway; isso não comprova entrega externa.
- O ajuste do corpo Q5 no `reservas.js` foi concluído e aceito localmente na etapa7; não altera o estado implementado do backend e tem publicação autorizada e aguarda revisão/integração da equipe.
- Os resultados apresentados comprovam os cenários e versões identificados; não são uma certificação de produção nem substituem o fechamento integrado de todos os módulos.
