# ADR-006 — Timezone, expediente e notificações

**Estado: APROVADO** (notificações); **PROVISÓRIO**: timezone e formato de erro

## Decisão
- Persistência temporal em UTC; exibição e expediente em `America/Sao_Paulo`. API usa ISO 8601 com offset.
- Erros JSON padronizados: `codigo`, `mensagem`, `correlationId`. Conflito = HTTP 409.
- Notificação desacoplada do commit: grava-se evento pendente na transação; o envio ocorre depois. Falha de envio não desfaz a reserva.
- Gateway simulado e testado com WireMock; nenhum e-mail real em testes.

## Consequências
O frontend não assume fuso pelo servidor. Eventos de notificação ficam rastreáveis (RF11).
