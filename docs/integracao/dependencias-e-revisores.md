# Dependências do módulo `reserva/` e plano de revisão

**Estado: PROPOSTO** · Autor do módulo: Gabriel Silva Gomes · Base: ADR-001 a ADR-006
**Atualizado em 11/11/2026** sobre a `develop` no commit `395ac73` (PRs #1 a #6 integrados). O que está em PR ou em branch não é tratado aqui como integrado.

O módulo `reserva/` foi escrito de modo que **tudo o que depende de outro integrante é uma porta (interface)** em `br.senac.recursos.reserva.aplicacao`. Cada responsável implementa a sua porta; o serviço não muda.

**Níveis de validação usados neste documento:** escrito · testado com fake · testado com MySQL/Testcontainers · integrado na `develop` · revisado · validado em CI · aceito pela equipe. Um item só recebe o nível que tem evidência.

## 1. O que cada integrante entregou ou ainda precisa entregar

### Gabriel Rodrigues Fausto (recursos, MySQL, movimentações)

| ID | Entrega | Porta / contrato | Estado em 11/11/2026 |
|----|---------|------------------|----------------------|
| F1 | Migração Flyway (`recursos`, `reservas`, `reserva_recursos`, índices) | esquema | **Integrada** (V1, PR #6) |
| F2 | Lock `SELECT ... FOR UPDATE` na ordem recebida | `RecursosPort` | **Integrada** (`RecursosMysql`) |
| F3 | Repositório de `Reserva` | `ReservaRepositorio` | **Integrada** (`ReservaMysql`) |
| F4 | Ocupações: reservas ativas, manutenção e retirada aberta | `OcupacoesPort` | **Integrada** (`OcupacoesMysql`) |
| F5 | Expediente configurado | `ExpedientePort` | **Integrada** (`ExpedienteMysql`) |
| F6 | Conflito evitado em transação independente | `ConflitosEvitadosPort` | **Integrada** (`ConflitosMysql`); falta a consulta dos registros para o RF12 |
| F7 | Mesma ordem crescente de IDs em manutenção, retirada e devolução | convenção ADR-003 | **Integrada**, com testes em `Item18MysqlIT` |
| F8 | Corrida real com MySQL e o `ReservaService` real | teste de integração | **Integrada** para criação (`Item18MysqlIT`); **pendente** para edição concorrente (CT19, ver F9) |
| F9 | CT19 no MySQL: edições concorrentes de reservas distintas no mesmo recurso e horário | `Item18MysqlIT` | **Pendente.** Roteiro em `ReservaEdicaoConcorrenteTest` (fake) |
| F10 | Adaptador MySQL da fila de aprovação (`ReservaFilaPort`), com filtro, ordem e paginação no banco | `ReservaFilaPort` | **Pendente.** Validar estendendo `ReservaFilaPortContrato` |
| F11 | Consulta de reservas por período, status e recurso, e de conflitos evitados | porta de leitura a definir | **Pendente** (RF12) |

### Débora dos Santos (segurança, auditoria, notificação, CI, qualidade)

Todas as entregas abaixo estão em **PRs abertos, ainda não integrados à `develop`**. Sequência indicada pela própria Débora: #8, #9, #10, #11, #12. Em 11/11/2026 nenhuma revisão por pares foi encontrada nesses PRs.

| ID | Entrega | Onde está | Observação |
|----|---------|-----------|------------|
| D1, D2 | `AtorAutenticadoProvider` (`SpringSecurityAtorProvider`), perfis, usuários, sessão, CSRF | PR #8 (`feat/session-aauth`) | O papel nunca vem do corpo da requisição |
| D3 | `AuditoriaPort` na mesma transação, tabela de auditoria | PR #9 | Rever privilégios da conta de runtime do banco (sem UPDATE/DELETE na auditoria) |
| D4 | `NotificacaoPort`, outbox, gateway simulado e WireMock | PR #10 | |
| D5 | CI no PR (Java 21, Maven, Testcontainers, JaCoCo) | PR #11 | O PR #7 (`ci/quality-gates`) diverge e deve ser conciliado ou encerrado. SonarCloud depende de autorização do administrador da organização |
| D6 | Mapeamento de exceções para HTTP com `correlationId` | `ReservaExceptionHandler` na `develop` | Global, também atende recursos e movimentações. Falta mapear `ConsultaInvalidaException` (400) com o endpoint da fila |
| D7 | RTM RF01 a RF14 | PRs #11 e #12 | Não editar `docs/RTM.md` da `develop` em paralelo. As linhas do módulo entram depois dessa integração |
| D8 | Testes de segurança (401/403, CSRF, IDOR) | PRs #11 e #12 | O teste de IDOR em GET depende de existir o endpoint |

### Marcos Boé (frontend, contratos, E2E)

| ID | Entrega | Onde está | Estado |
|----|---------|-----------|--------|
| M1 | Contrato `docs/api/reservas-contrato.md` e contrato de leitura `reservas-leitura-contrato.md` | `develop` (escrita) e `feature/marcos-base-frontend` (leitura) | O de leitura foi aceito por Marcos e **não** foi revisado por backend e segurança. A revisão está em `docs/integracao/revisao-contrato-fila-rf07.md` |
| M2, M3 | Tratamento de erros e telas | `feature/marcos-base-frontend` | Login, pesquisa, seleção e criação de reservas. Listagem, edição, cancelamento e fila dependem de leituras do backend |
| M4 | E2E | `feature/marcos-base-frontend` | Testes Playwright locais da branch, sem integração com o backend nem CI |

## 2. O que Silva já fez e o que ainda precisa fazer

| ID | Tarefa | Estado em 11/11/2026 |
|----|--------|----------------------|
| S1 | Controller REST `/api/reservas/**` e DTOs | **Integrado na `develop`**, 8 endpoints de escrita, desligado por padrão (`reservas.api.enabled=false`). A ativação depende da segurança (#8) e da auditoria e notificação reais (#9, #10) |
| S2 | `@Transactional(isolation = READ_COMMITTED)` e bean do serviço | **Integrado** por Fausto (`ReservaTransacional` e `Item18Config`). Não é mais pendência |
| S3 | Idempotência por chave de requisição | **Pendente.** Falta decisão da equipe (escopo, retenção, mesma chave com corpo diferente, resposta na repetição) |
| S4 | Consulta de disponibilidade | **Escrita no serviço** (`consultarDisponibilidade`), sem endpoint. Falta definir o dono do endpoint |
| S5 | Horas de utilização (RF12) | `UtilizacaoReservas` (cálculo puro) na `develop`. Falta a consulta persistida (F11), o serviço e a API de relatório |
| S6 | Teste de corrida real | Criação: **feito** no MySQL (`Item18MysqlIT`, Fausto). Edição: **testada com fake** (`ReservaEdicaoConcorrenteTest`, 5 cenários, em patch); MySQL pendente (F9) |
| S7 | Fila de aprovação RF07, camada de aplicação | **Feita em patch** (5 commits, ciclo RED, GREEN, REFACTOR registrado em `docs/testes/rf07-fila-tdd.md`), testada com fake. Integração na `develop` depende de PR e revisão. Sem controller nem consulta MySQL |
| S8 | Controller da fila de aprovação e DTOs de leitura | **Pendente**, depende de F10, do contrato revisado e de D1 |
| S9 | `GET /api/reservas/{id}` e reservas próprias | **Pendente**, bloqueado por Q9 |
| S10 | Consulta, serviço e API de relatório RF12 | **Pendente**, depende de F11 |

## 3. Decisões abertas que afetam o módulo (PROPOSTO no código)

| # | Pergunta | O que o código assume hoje | Quem decide |
|---|----------|----------------------------|-------------|
| Q1 | Quem dispara EM_USO, CONCLUÍDA e NÃO_COMPARECEU? | Responsável ou Administrador, ação manual | Equipe |
| Q2 | Editar reserva APROVADA reinicia a aprovação? | Não edita restrita aprovada; comum aprovada pode editar sem mudar a necessidade de aprovação | Equipe |
| Q3 | O Responsável pode aprovar a própria reserva se também for Solicitante? | Permitido (a regra é por papel) | Equipe |
| Q4 | Manutenção que colide com reserva existente | Fora do módulo; os testes do item 18 mostram o comportamento, falta formalizar | Fausto + Silva |
| Q5 | Quem cancela uma reserva APROVADA? | Dono ou Administrador | Equipe |
| Q6 | Código HTTP para fora do expediente (409 ou 422) | 409 aceito por Marcos em 10/11/2026; confirmação de Silva pendente | Marcos + Silva |
| Q6 | Código HTTP para fora do expediente (409 ou 422) | 409 no contrato (recomendação de Marcos) | Marcos + Silva, com ratificação coletiva |
| Q7 | Duração mínima/máxima e antecedência da reserva | Sem limite | Equipe |
| Q8 | Aprovação revalida conflito? | Não revalida, pois a pendente já bloqueia a agenda | Equipe |
| Q9 | Quem pode consultar uma reserva (GET)? E 403 ou 404 para reserva alheia? | Dono, Responsável e Administrador (não implementado) | Equipe + Débora |

A fila de aprovação (apenas Responsável, restritas em SOLICITADA) é uma leitura específica e **não** resolve Q9.

## 4. Revisão por pares

Regra do guia (cap. 21): o revisor é um integrante diferente do autor, e o merge exige CI verde. O plano inicial previa cinco PRs revisados por Fausto, Débora e Marcos. Os PRs #1 a #6 foram integrados, mas **a existência de revisão aprovada em cada um não foi verificada neste documento**. Conferir em cada PR (aba Reviews) antes de citar revisão como evidência.

Próximos PRs de Silva e revisores sugeridos:

| Conteúdo | Revisor principal | Segundo revisor | Motivo |
|----------|-------------------|-----------------|--------|
| Fila de aprovação RF07 (aplicação, testes, TDD, revisão do contrato) | **Fausto** | Débora | Fausto implementa o adaptador SQL; Débora revisa autorização e dados expostos |
| CT19 com fake (`ReservaEdicaoConcorrenteTest`) | **Fausto** | Débora | Fausto reproduz o cenário no MySQL; Débora confere a qualidade do teste |
| Atualização deste documento e do relatório do módulo | **Marcos** | Débora | Marcos consome o contrato; Débora integra a RTM e o relatório final |

Se o revisor sugerido estiver indisponível, qualquer outro integrante pode revisar.
