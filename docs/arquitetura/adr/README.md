# Decisões de Arquitetura (ADRs)

**Estado: APROVADO** — decisões D01–D10 confirmadas pela equipe em 05/11/2026 (ver *Guia Técnico Definitivo*). Convenções marcadas como *provisórias* podem ser alteradas por ordem do grupo, via novo ADR.

| ADR | Tema | Estado |
|---|---|---|
| [ADR-001](ADR-001-monolito-modular-frontend-estatico.md) | Monólito modular, frontend estático no Spring Boot, Maven | APROVADO |
| [ADR-002](ADR-002-mysql-innodb-modelo-recursos.md) | MySQL + InnoDB, tabela central `recursos`, Flyway, JPA | APROVADO (Flyway/JPA provisórios) |
| [ADR-003](ADR-003-estrategia-de-concorrencia.md) | Locks pessimistas, ordem de aquisição, READ COMMITTED | APROVADO |
| [ADR-004](ADR-004-sessao-spring-security.md) | Sessão HttpOnly, CSRF e perfis | APROVADO |
| [ADR-005](ADR-005-politicas-de-reserva.md) | SOLICITADA, aprovação, materiais individualizados | APROVADO |
| [ADR-006](ADR-006-timezone-expediente-notificacoes.md) | Timezone, expediente e notificações simuladas | APROVADO (timezone provisório) |

| [ADR-007](ADR-007-fechamento-contratos-vinculos-rf11.md) | Contratos atuais, operação restrita dos vínculos e RF11 simulada | ADOTADO SOB DELEGAÇÃO DE MARCOS13/11/2026; execução/evidência próprias, sem assinatura individual atribuída |

Formato: contexto, decisão, alternativas, consequências. Alterar uma decisão exige novo ADR que a substitua, apontando o impacto em requisitos, testes e documentação.
