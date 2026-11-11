# RF11 — Notificacoes simuladas / gateway HTTP

## Comportamento e integracao
1. ReservaService grava RESERVA_CRIADA, RESERVA_APROVADA, RESERVA_REJEITADA e
   RESERVA_CANCELADA via NotificacaoPort na MESMA transacao da reserva.
2. MovimentacaoService grava MATERIAL_DEVOLVIDO na transacao da devolucao.
   Devolucao repetida nao gera evento adicional.
3. V4__notificacoes.sql cria a tabela de outbox MySQL. Eventos PENDENTE so
   ficam visiveis ao worker depois do commit. Rollback descarta evento.
4. ProcessadorNotificacoes faz claim ENVIANDO e commit em transacao curta com
   SELECT ... FOR UPDATE SKIP LOCKED. O gateway HTTP/simulado e chamado FORA
   da transacao do dominio e fora da transacao de claim. Depois marca ENVIADA
   ou ERRO/FALHA em nova transacao.
5. Erros HTTP, indisponibilidade e timeout geram ate 3 tentativas com backoff
   (30 e 60 segundos); depois status FALHA fica historico.
   Lease de 5 minutos permite recuperar status ENVIANDO apos queda.
6. Entrega **at least once**, nao exatamente uma vez: apos queda entre POST e
   gravacao do resultado, o destino pode receber novamente. A chave
   X-Idempotency-Key e o ID da notificacao para deduplicacao no gateway.

## Configuracao
- NOTIFICACOES_WORKER_ENABLED=true: ativa o agendador a cada 30 segundos.
  Padrao false para evitar envio inesperado em testes/desenvolvimento.
- NOTIFICACOES_GATEWAY_URL=: vazio = simulacao local por log, sem rede/email.
  URL HTTP(S) ativa POST JSON com id, reservaId, evento, correlacaoId, criadoEm.
- Nao ha endpoint publico que permita disparar/reexecutar notificacoes.
- Use HTTPS e endpoint confiavel no ambiente real; nao configure segredos no URL.

## Evidencias a executar
- NotificacaoMysqlIT: commit/rollback, envio apos commit, retry, falha definitiva,
  registro de devolucao, exigencia transacional.
- GatewayNotificacaoWireMockTest: HTTP 202, falha HTTP 500, chave idempotente.
- Item18MysqlIT preserva a fixture isolada para testes antigos.
- Com Java 21 e Docker: mvn -f backend/pom.xml clean verify.
- Inspecionar surefire/failsafe e JaCoCo do build; anexar resultados na RTM.

## Dependencias entre PRs
PR #8 RF01 -> PR #9 RF10 -> este PR RF11 (migração V4).
Depois dos merges, alterar base do PR para develop; exigir revisao por colega e CI.
