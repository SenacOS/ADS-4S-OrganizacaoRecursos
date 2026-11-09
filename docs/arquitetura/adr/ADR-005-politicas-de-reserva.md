# ADR-005 — Políticas de reserva, aprovação e materiais

**Estado: APROVADO** · Decisões: D04, D06, D07, D08

## Decisão
- Horários livres dentro do expediente configurado pelo Administrador; reserva não cruza o limite diário.
- Reserva comum: criada como SOLICITADA e autoaprovada na mesma transação, com as duas transições auditadas.
- Reserva com qualquer recurso `restrito`: fica SOLICITADA, **já bloqueando a agenda**, até decisão do Responsável. Sem expiração automática.
- Estados que bloqueiam: SOLICITADA, APROVADA, EM_USO. REJEITADA e CANCELADA liberam; CONCLUÍDA e NÃO_COMPARECEU preservam histórico sem bloquear.
- Materiais são unidades individuais (patrimônio único). Retirada sem devolução mantém a unidade indisponível.
- Transições são explícitas no domínio, cada uma com teste de permissão; nunca atualização direta de string.
- Reserva iniciada nunca é apagada.

## Pontos ainda abertos (configuração, sem bloquear)
Expediente concreto, duração mínima/máxima, política de atraso/não comparecimento, quem dispara EM_USO/CONCLUÍDA.
