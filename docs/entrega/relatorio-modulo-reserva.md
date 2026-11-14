# Relatório do módulo `reserva/`

**Estado:** implementação integrada na branch `develop` — base conferida em 13/11/2026, commit `b73c501536a275cdc89101cc7130c7b481e52396` (PR #43). **Responsável pelo módulo:** Gabriel Silva Gomes.

Este documento apresenta o estado vigente do módulo de reservas, suas regras, interfaces com os demais módulos, persistência, testes e limites de integração. Os detalhes históricos das entregas estão nos PRs e nos registros de teste vinculados abaixo.

## 1. Responsabilidade e escopo

O módulo `reserva/` concentra o domínio e os casos de uso de reservas. Ele é responsável pela máquina de estados, validação temporal, autorização de operações de reserva, detecção de conflitos, coordenação transacional e exposição da API de reservas e do relatório RF12.

Caminho principal: `backend/src/main/java/br/senac/recursos/reserva/`.

| Camada | Componentes | Responsabilidade |
|---|---|---|
| `dominio/` | `Reserva`, `IntervaloReserva`, `StatusReserva`, `DetectorConflitos`, `Expediente`, exceções e atores | Regras independentes de Spring e banco. |
| `aplicacao/` | `ReservaService`, `ConsultarFilaAprovacao`, `ConsultarRelatorioUtilizacao` e portas | Orquestração dos casos de uso e contratos com outros módulos. |
| `infraestrutura/` | `ReservaTransacional`, `ReservaMysql`, `ReservaConsultaMysql`, `ReservaFilaMysql`, `ReservaRelatorioMysql`, `ConflitosMysql` | Persistência MySQL, locks e fronteiras transacionais. |
| `api/` | `ReservaController`, `ReservaLeituraController`, `RelatorioUtilizacaoController`, DTOs e `ReservaExceptionHandler` | Contratos HTTP, validação e envelope uniforme de erros. |

## 2. Regras de domínio

### 2.1 Intervalos, estados e ocupação

- Os intervalos seguem `[início, fim)`. O fim deve ser posterior ao início; a comparação é feita por instantes, não por texto formatado.
- A reserva deve caber em uma janela válida do expediente local.
- Estados: `SOLICITADA`, `APROVADA`, `EM_USO`, `CONCLUIDA`, `REJEITADA`, `CANCELADA` e `NAO_COMPARECEU`.
- `SOLICITADA`, `APROVADA` e `EM_USO` ocupam a agenda. Estados finais liberam a agenda de acordo com a matriz de transições.
- Recursos em manutenção, desativados ou com retirada de material ainda aberta também participam da verificação de disponibilidade.
- Reservas comuns são autoaprovadas; reservas restritas permanecem solicitadas e bloqueiam a agenda até a decisão do Responsável.

### 2.2 Concorrência e atomicidade

A proteção contra dupla reserva utiliza locks pessimistas (`SELECT ... FOR UPDATE`) nas linhas de `recursos`, com IDs ordenados crescentemente e transações `READ_COMMITTED`. O serviço bloqueia os recursos antes de consultar as ocupações e gravar a reserva. A edição bloqueia a união dos recursos antigos e novos e relê a reserva sob lock.

A mesma convenção de ocupação é compartilhada com manutenção e movimentações. A tentativa conflitante é registrada como conflito evitado em transação própria, pois a transação da reserva é revertida.

### 2.3 Decisões complementares integradas

| Decisão | Regra vigente | Evidência de integração |
|---|---|---|
| Q1 | Início, conclusão e registro de não comparecimento são operações exclusivas do Responsável. | PR #31. |
| Q2 | Reserva restrita já aprovada não pode ser alterada pelo fluxo de PATCH. | ADR-007; sem mudança de código adicional. |
| Q3 | O Responsável não pode aprovar a própria reserva, mesmo que acumule papéis ou possua vínculo com os recursos. | PR #30. |
| Q5 | Administrador cancelando reserva de terceiro precisa fornecer justificativa não vazia, armazenada em `motivo_cancelamento`; `motivo_decisao` permanece separado. | PR #43 e migration V7. |
| Q8 | A aprovação revalida autorização, estado, recursos ativos, expediente e ocupações sob a fronteira transacional. | PRs #33/#34. |
| Q9 | A listagem, o detalhe e a fila aplicam o escopo do usuário autenticado; Responsável precisa de vínculo com todos os recursos da reserva. | PRs #26/#27 e ADR-007. |

Q2 e Q5 são decisões de regra de negócio sob RF04/RF07, não requisitos funcionais novos.

### 2.4 Cancelamento administrativo — Q5

`POST /api/reservas/{id}/cancelamento` aceita corpo opcional `{"motivo":"..."}`. O campo admite até 500 caracteres.

- O dono pode cancelar sem justificativa. Se enviar um texto, ele é aparado e armazenado em `motivo_cancelamento`.
- O Administrador pode cancelar sem justificativa quando também é o dono da reserva.
- Quando o Administrador cancela uma reserva de terceiro, a justificativa aparada deve ser não vazia.
- Papel e usuário vêm da sessão autenticada. A validação segue a ordem: permissão, justificativa e estado.
- A falta de justificativa obrigatória produz HTTP 400, código `REQUISICAO_INVALIDA`. O handler HTTP apresenta a mensagem genérica `Requisição inválida.`; a validação de tamanho também retorna 400 no mesmo envelope.
- O registro de cancelamento preserva reserva, vínculos, auditoria e notificação. A coluna `motivo_cancelamento` foi criada pela migration `V7__reserva_motivo_cancelamento.sql` como `VARCHAR(500) NULL`.

**Integração do cliente:** no snapshot integrado `b73c501`, o cliente executava o POST sem corpo e o Administrador cancelando reserva de terceiro recebia 400. A [etapa7 do frontend](../stories/marcos-7.md) acrescenta campo condicional/limite500/confirmação e envio de `motivo`; o dono, inclusive Administrador dono, continua sem justificativa obrigatória. Ajuste validado e [aceito localmente por Marcos](../testes/marcos-7-verificacao.md#aceite-do-autor--13112026), com publicação autorizada e revisão/integração da equipe pendentes. O backend e a migration permanecem os do PR #43. [Resultados e limites](../testes/marcos-7-resultados.md) e [integração frontend](../api/frontend-integracao.md).

## 3. Integração com os demais módulos

| Módulo | Integração com `reserva/` |
|---|---|
| `recurso/` | Cadastro, estado ativo/restrito, expediente, manutenção e locks compartilhados. |
| `movimentacao/` | Retiradas abertas são ocupações; retirada e devolução usam o mesmo controle de recursos. |
| `seguranca/` | `AtorAutenticadoProvider` obtém identidade e perfil exclusivamente da sessão Spring Security; escrita usa CSRF. |
| `auditoria/` | `AuditoriaPort` registra operações na mesma transação da alteração de reserva. |
| `notificacao/` | `NotificacaoPort` grava eventos na outbox transacional; processamento ocorre depois do commit. |
| Frontend (`static/`) | Consome contratos HTTP; a validação visual não substitui as regras e permissões do backend. |

## 4. API e contratos integrados

| Operação | Método e rota | Referência |
|---|---|---|
| Criar reserva | `POST /api/reservas` | [`reservas-contrato.md`](../api/reservas-contrato.md) |
| Editar reserva | `PATCH /api/reservas/{id}` | [`reservas-contrato.md`](../api/reservas-contrato.md) |
| Cancelar reserva | `POST /api/reservas/{id}/cancelamento` | [`reservas-contrato.md`](../api/reservas-contrato.md) |
| Aprovar/rejeitar | `POST /api/reservas/{id}/aprovacao` e `/rejeicao` | [`reservas-contrato.md`](../api/reservas-contrato.md) |
| Iniciar/concluir/não comparecimento | `POST /api/reservas/{id}/inicio`, `/conclusao` e `/nao-comparecimento` | [`reservas-contrato.md`](../api/reservas-contrato.md) |
| Consultar reservas | `GET /api/reservas` e `GET /api/reservas/{id}` | [`reservas-consulta-contrato.md`](../api/reservas-consulta-contrato.md) e [`reservas-leitura-contrato.md`](../api/reservas-leitura-contrato.md) |
| Relatório RF12 | `GET /api/reservas/relatorio-utilizacao` | [`relatorios-utilizacao-proposta.md`](../api/relatorios-utilizacao-proposta.md) |

Os endpoints de escrita, leitura e relatório são condicionados pela propriedade `reservas.api.enabled`, cujo padrão no `application.yml` é `false`. A ativação deve ser explícita no ambiente de execução.

### 4.1 RF12 — cadeia de implementação

O relatório de utilização está integrado nas seguintes camadas:

1. **Persistência — PR #37:** `ReservaRelatorioPort`, `ConflitoEvitadoResumo` e `ReservaRelatorioMysql`; testes MySQL/Testcontainers em `ReservaRelatorioMysqlIT`.
2. **Serviço e DTO — PR #39:** `ConsultarRelatorioUtilizacao`, `RelatorioUtilizacaoResponse` e fronteira transacional `REPEATABLE_READ`.
3. **Endpoint e composição Spring — PR #41:** `RelatorioUtilizacaoController`, `Item18Config` e rota real `GET /api/reservas/relatorio-utilizacao`.
4. **Interface — PR #40 e integração real — PR #42:** tela e menu de Relatórios para Administrador, consumo da rota efetiva e testes HTTP/Spring/MySQL/Chrome.

A política de acesso ADMINISTRADOR do RF12 permanece **provisória**, conforme o serviço integrado; não deve ser descrita como política definitiva para todos os ambientes.

## 5. Persistência

A persistência utiliza MySQL 8.4/InnoDB, JPA/JDBC e Flyway. A migration V7 adiciona `reservas.motivo_cancelamento VARCHAR(500) NULL`, sem reutilizar `motivo_decisao`. As consultas de leitura de reservas, fila e relatório preservam os escopos autorizados no backend.

## 6. Testes e evidências

### 6.1 Testes do domínio e aplicação

Entre as classes de teste do módulo estão:

- `IntervaloReservaTest`, `StatusReservaTest`, `ReservaDominioTest` e `DetectorConflitosEExpedienteTest`;
- `ReservaServiceTest`, `ReservaDisponibilidadeTest`, `ReservaEdicaoConcorrenteTest` e testes da fila de aprovação;
- `ReservaControllerTest`, `ReservaLeituraSegurancaTest` e `RelatorioUtilizacaoControllerTest`.

### 6.2 Integração com MySQL/Testcontainers

O conjunto integrado inclui, entre outras, `ReservaQ9MysqlIT`, `ReservaFilaMysqlIT`, `ReservaAprovacaoMysqlIT`, `ReservaCancelamentoMysqlIT`, `ReservaRelatorioMysqlIT` e `Item18MysqlIT`. Os cenários cobrem filtros/escopo, revalidação da aprovação, justificativa Q5, persistência do RF12, integridade, locks e movimentações.

### 6.3 Evidências recentes — resultados separados

- **PR #43 / CI 43525712520:** `mvn -f backend/pom.xml clean verify` terminou em `BUILD SUCCESS`; os testes MySQL/Testcontainers e os limites JaCoCo foram aprovados. O job JMeter também terminou com sucesso. A etapa SonarCloud falhou com `Not authorized or project not found`; não há Quality Gate Sonar aprovado nessa execução.
- **PR #42 / RF12:** 13 cenários reais PASS/0 FAIL com Spring, MySQL e Chrome; 277 testes Maven unitários/HTTP no comando `package -DskipITs`; regressão frontend separada com 97 testes unitários e 346 execuções de navegador. As contagens pertencem a execuções/camadas diferentes e não são somadas.
- **JMeter:** quatro planos são executados em ambiente isolado: consulta, disputa por mesma reserva, recursos distintos e manutenção contra reserva. Os resultados são evidência de cenários controlados, não um SLA de produção.

Referências: [resultados da integração RF12](../testes/marcos-6-integracao-real-resultados.md), [aceite humano RF12](../testes/marcos-6-integracao-real-aceite-2026-11-13.md), [evidência JMeter](../qualidade/jmeter/evidencias-2026-11-10.md), [segurança](../qualidade/seguranca.md), [auditoria](../qualidade/rf10-auditoria.md) e [notificações](../qualidade/rf11-notificacoes.md).

## 7. Execução de testes

Na raiz do repositório:

```bash
mvn -f backend/pom.xml -Dtest=IntervaloReservaTest,StatusReservaTest,ReservaDominioTest,ReservaServiceTest test
mvn -f backend/pom.xml clean verify
```

`mvn test` executa testes unitários/API sem iniciar os testes de integração. `mvn clean verify` inclui os testes `*IT` com MySQL/Testcontainers e, portanto, exige Docker ativo. Os gates JaCoCo do projeto verificam no bundle pelo menos 80% de linhas e 70% de branches.

## 8. Limites conhecidos do recorte

- Q5 está implementada no domínio, serviço, persistência e API. O cliente/tela da etapa7 já envia `motivo` no cancelamento administrativo de reserva de terceiro e foi aceito localmente pelo autor; a publicação desse incremento foi autorizada; revisão/integração da equipe permanecem pendentes.
- A flag `reservas.api.enabled` permanece `false` por padrão. A execução local deve habilitá-la explicitamente junto às APIs de recursos e movimentações necessárias ao cenário.
- O acesso ADMINISTRADOR no RF12 é provisório. A tela real e o endpoint estão integrados, mas a decisão de acesso não é descrita como política definitiva.
- RF11 utiliza o modo simulado por log quando o gateway externo está vazio. Isso comprova a demonstração simulada, não o recebimento de e-mail ou mensagem externa.
- SonarCloud não produziu Quality Gate aprovado na CI do PR #43 por erro de autorização/projeto. JaCoCo e JMeter têm resultados próprios aprovados, sem substituir o Sonar.
- Os resultados descritos são evidências de versões e cenários identificados. Eles não equivalem a certificação de produção nem à regressão global de todos os módulos.

## 9. Glossário

- **Intervalo semiaberto:** inclui o início e exclui o fim.
- **Recurso restrito:** exige aprovação do Responsável.
- **Lock pessimista:** bloqueio de linha no banco mantido até o fim da transação.
- **Porta:** interface da camada de aplicação implementada por um adaptador.
- **Conflito evitado:** tentativa de reserva barrada por uma ocupação incompatível, registrada para o relatório RF12.
