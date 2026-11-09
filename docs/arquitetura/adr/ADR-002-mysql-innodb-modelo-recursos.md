# ADR-002 — MySQL/InnoDB e modelo central de recursos

**Estado: APROVADO** (MySQL e modelo central); **PROVISÓRIO**: Flyway e JPA/Hibernate

## Contexto
Uma reserva pode combinar sala, professor e vários materiais. É preciso um ponto estável e uniforme para serializar a concorrência.

## Decisão
- MySQL 8.4 com InnoDB. Substitui a proposta anterior de PostgreSQL registrada no README.
- Tabela-base `recursos` (id, tipo, código único, ativo, restrito) com subtipos `salas`, `professores`, `materiais` (patrimônio único por unidade).
- `reservas` ligada a `recursos` por `reserva_recursos` (N:N).
- Migrações versionadas com Flyway; acesso via Spring Data JPA/Hibernate.
- Índices em `reserva_recursos(recurso_id, reserva_id)`, `reservas(inicio_utc, fim_utc, status)` e `bloqueios_recursos(recurso_id, inicio_utc, fim_utc)`.
- Não há UNIQUE de intervalos; a garantia vem do protocolo do ADR-003.

## Consequências
Testes de integração usam MySQL em Testcontainers (Docker necessário no CI). Todo caminho que escreve ocupação deve passar pelo lock da tabela `recursos`.
