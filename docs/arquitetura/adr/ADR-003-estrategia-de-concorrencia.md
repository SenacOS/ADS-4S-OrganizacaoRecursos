# ADR-003 — Estratégia de concorrência

**Estado: APROVADO** · Decisão: D05 · Requisito: RF06 (risco R1, limitador de nota)

## Decisão
Em uma única transação `@Transactional(isolation = READ_COMMITTED)`:
1. validar entrada, permissão e expediente;
2. reunir os IDs de todos os recursos, remover duplicatas e **ordenar por ID crescente**;
3. `SELECT id FROM recursos WHERE id = ? FOR UPDATE` para cada um;
4. só então consultar conflitos (reservas ativas SOLICITADA/APROVADA/EM_USO, bloqueios de manutenção e retirada aberta);
5. havendo conflito, lançar exceção de domínio (HTTP 409) e dar rollback; senão gravar reserva, vínculos, auditoria e notificação pendente.

Intervalos são semiabertos `[inicio, fim)`: conflito se `existente.inicio < novo.fim AND existente.fim > novo.inicio`.

Criação, edição, cancelamento, manutenção, retirada e devolução usam o mesmo protocolo. Na edição, bloqueia-se a união ordenada dos recursos antigos e novos.

## Alternativas descartadas
Lock na linha de `reserva` (a linha futura não existe), horários fixos com UNIQUE, locking otimista (rejeita tarde e não cobre multi-recurso).

## Consequências
- Deadlocks e timeouts do InnoDB devem virar erro previsível; retry só quando idempotente.
- **Prova obrigatória:** teste de corrida com Testcontainers/MySQL (sala, professor, material e multi-recurso): exatamente uma reserva aceita, sem gravação parcial. Mock de repositório não comprova.
- "Conflito evitado" (RF12) é registrado em transação separada, após o rollback.
