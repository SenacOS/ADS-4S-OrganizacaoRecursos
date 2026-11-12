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

## Q4 — Manutenção que colide com reserva existente

**Política aplicada no item 18. Ratificação conjunta com Silva pendente.**

Ao solicitar um bloqueio de manutenção, o serviço adquire o lock do recurso conforme o ADR-003 e verifica as ocupações atuais. Se o intervalo semiaberto do bloqueio intersecta uma reserva `SOLICITADA`, `APROVADA` ou `EM_USO` do mesmo recurso, a solicitação retorna HTTP 409. A reserva permanece intacta e o bloqueio não é gravado. Para agendar a manutenção nesse período, a equipe deve resolver a reserva explicitamente pelo fluxo de reservas e então tentar novamente.

Reservas adjacentes ao intervalo de manutenção não conflitam. A mesma regra vale quando a manutenção disputa o recurso com uma nova reserva. O vencedor confirma primeiro e a segunda operação revalida sob lock.

Verificação em `Item18MysqlIT`, nos testes `manutencaoNaoCancelaReservasEExpedienteNaoAsInvalida` e `manutencaoContraReservaUmaVence`.
