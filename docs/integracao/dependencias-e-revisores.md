# Dependências do módulo `reserva/` e plano de revisão

**Estado: PROPOSTO** · Autor do módulo: Gabriel Silva Gomes · Base: ADR-001 a ADR-006

O módulo `reserva/` foi escrito de modo que **tudo o que depende de outro integrante é uma porta (interface)** em `br.senac.recursos.reserva.aplicacao`. Cada responsável implementa a sua porta; o serviço não muda.

## 1. O que cada integrante precisa entregar

### Gabriel Rodrigues Fausto (recursos, MySQL, movimentações)

| ID | Entrega | Porta / contrato | Requisitos | Bloqueia |
|---|---|---|---|---|
| F1 | Migração Flyway: `recursos`, `reservas`, `reserva_recursos` (+ índices do ADR-002) | esquema | RF02, RF06 | F2–F5, teste CT09/CT10 |
| F2 | Lock `SELECT id FROM recursos WHERE id = ? FOR UPDATE` na ordem recebida; lança `RecursoNaoEncontradoException` | `RecursosPort` | RF06 | serviço sobre MySQL |
| F3 | Repositório JPA de `Reserva` (salvar atribui id; ler dados atuais, READ COMMITTED) | `ReservaRepositorio` | RF04 | idem |
| F4 | Consulta de ocupações: reservas SOLICITADA/APROVADA/EM_USO, manutenção e retirada aberta (`Instant.MAX`) | `OcupacoesPort` | RF05, RF08, RF09 | CT15, CT16 |
| F5 | Leitura do expediente configurado pelo Administrador | `ExpedientePort` | RF02 | validação de horário |
| F6 | Gravar conflito evitado em transação independente (`REQUIRES_NEW`) | `ConflitosEvitadosPort` (com Débora) | RF12 | relatório de conflitos |
| F7 | Mesma ordem crescente de IDs nos locks de manutenção, retirada e devolução | convenção ADR-003 | RF08, RF09 | evita deadlock |
| F8 | Teste de corrida com MySQL em Testcontainers usando o `ReservaService` real | teste de integração (com Silva) | RF06 | **limitador de nota** |

### Débora dos Santos (segurança, auditoria, notificação, CI, qualidade)

| ID | Entrega | Porta / contrato | Requisitos | Bloqueia |
|---|---|---|---|---|
| D1 | Implementar `AtorAutenticadoProvider` (`reserva.api`): usuário autenticado → `AtorReserva(usuarioId, PapelAtor)`; papel nunca vem do corpo | `AtorAutenticadoProvider` | RF01 | controllers |
| D2 | Enum/entidade de perfis e usuários; confirmar o mapeamento para `PapelAtor` | `usuario/`, `seguranca/` | RF01 | D1 |
| D3 | Gravar `RegistroAuditoria` na mesma transação; tabela imutável | `AuditoriaPort` | RF10 | CT13, CT20 |
| D4 | Persistir `EventoNotificacao` pendente; envio simulado/WireMock após commit | `NotificacaoPort` | RF11 | notificações |
| D5 | CI no PR (Java 21, Maven, Testcontainers, JaCoCo, Sonar) | `.github/workflows/ci.yml` | RF-qualidade | meta 80%/70% |
| D6 | Mapear exceções de domínio para HTTP (ver contrato) com `correlationId` | `@RestControllerAdvice` | RF01, RF13 | contrato da API |
| D7 | RTM: linhas RF04–RF07 e RF12 com os testes citados no relatório | `docs/RTM.md` | todos | 100% crítica |
| D8 | Testes de segurança: 401/403, CSRF (CT18), IDOR em reservas alheias | suíte de segurança | RF01 | limitador de nota |

### Marcos Boé (frontend, contratos, E2E)

| ID | Entrega | Referência | Requisitos |
|---|---|---|---|
| M1 | Revisar e aprovar o contrato `docs/api/reservas-contrato.md` (campos, datas ISO 8601, códigos de erro) | contrato | RF14 |
| M2 | Tratar 400/401/403/404/409 com as mensagens do contrato; impedir duplo clique | `js/api.js`, `js/reservas.js` | RF13 |
| M3 | Telas de reserva, aprovação (só Responsável) e cancelamento | `pages/` | RF04, RF07 |
| M4 | E2E: reserva comum, conflito 409, restrita pendente e aprovação | `tests/e2e` | RF13 |

### Equipe (decisões ainda abertas, ver seção 3)

## 2. O que Silva ainda precisa fazer depois dessas entregas

| ID | Tarefa | Depende de |
|---|---|---|
| S1 | Controller REST `/api/reservas/**` e DTOs | **Escrito** (8 endpoints de escrita, desligado por padrão); falta ativar com D1 e integração; GET e disponibilidade pendentes (porta de leitura do Fausto) |
| S2 | Anotar o serviço com `@Transactional(isolation = READ_COMMITTED)` e criar o bean | F1–F3 |
| S3 | Idempotência por chave de requisição (duplo clique/retentativa) | contrato (M1) |
| S4 | Consulta de disponibilidade reutilizando `DetectorConflitos` (RF03/RF05) | F4 |
| S5 | Agregações de horas (RF12) | F1, F6 |
| S6 | Teste de corrida real e caso TDD/BDD documentado (RED/GREEN/REFACTOR) | F8 |

## 3. Decisões abertas que afetam o módulo (PROPOSTO no código)

| # | Pergunta | O que o código assume hoje | Quem decide |
|---|---|---|---|
| Q1 | Quem dispara EM_USO, CONCLUÍDA e NÃO_COMPARECEU? | Responsável ou Administrador, ação manual | Equipe |
| Q2 | Editar reserva APROVADA reinicia a aprovação? | Não edita restrita aprovada; comum aprovada pode editar sem mudar a necessidade de aprovação | Equipe |
| Q3 | O Responsável pode aprovar a própria reserva se também for Solicitante? | Permitido (a regra é por papel) | Equipe |
| Q4 | Manutenção que colide com reserva existente | Fora do módulo; Fausto implementa a política (ADR-005) | Fausto + Silva |
| Q5 | Quem cancela uma reserva APROVADA? | Dono ou Administrador | Equipe |
| Q6 | Código HTTP para fora do expediente (409 ou 422) | 409 no contrato | Marcos + Silva |
| Q7 | Duração mínima/máxima e antecedência da reserva | Sem limite | Equipe |
| Q8 | Aprovação revalida conflito? | Não revalida, pois a pendente já bloqueia a agenda | Equipe |
| Q9 | Quem pode consultar uma reserva (GET)? | Dono, Responsável e Administrador (não implementado) | Equipe + Débora |

## 4. Quem deve revisar cada PR

Regra do guia (cap. 21): o revisor é um integrante diferente do autor, e o merge exige CI verde. O autor de todos os PRs abaixo é **Silva**. A escolha considera quem conhece a área tocada.

| PR | Conteúdo | Revisor principal | Segundo revisor (opcional) | Motivo |
|---|---|---|---|---|
| 1 `docs/adrs-e-alinhamento` | ADR-001–006, README, contexto dos agentes, preset AIOX | **Débora** | Fausto (ADR-002/003) | Débora mantém ADR/RTM/qualidade; Fausto valida as decisões de banco e lock |
| 2 `feature/esqueleto-backend` | `pom.xml` e classe principal | **Débora** | — | Dona do build/CI; confere versões e Java 21 |
| 3 `feature/rf05-intervalo-e-estados` | Intervalo `[inicio, fim)` e matriz de estados | **Fausto** | Débora | Mesma regra vira SQL de conflito e índices; Débora confere cobertura e casos de borda |
| 4 `feature/rf04-reserva-servico` | Reserva, detector, expediente, serviço, portas, testes | **Fausto** | Débora | Fausto implementa as portas de lock/repositório/ocupações; Débora, auditoria, permissões e qualidade dos testes |
| 5 `docs/reserva-contrato-e-relatorio` | Contrato da API, sequências, dependências, relatório | **Marcos** | Débora | Marcos consome o contrato; Débora integra RTM e relatório final |

Observações:
- O PR 4 é o mais crítico (RF06, limitador de nota): peça as duas revisões e rode `mvn verify` antes.
- Se o revisor sugerido estiver indisponível, qualquer outro integrante pode revisar; Marcos cobre bem contratos e UX, Débora cobre segurança e testes.
- Não faça merge de PR 3 e 4 sem PR 2 (esqueleto), pois dependem do `pom.xml`.
