# RF11 — Notificacoes simuladas / gateway HTTP


**Atualização em 13/11/2026:** a implementação da outbox, do processamento e do gateway simulado está integrada. As seções "Evidências a executar" e "Dependências entre PRs" abaixo preservam o roteiro do incremento original; não representam tarefas atuais de integração. A suíte Maven/MySQL/Testcontainers e os gates JaCoCo foram aprovados na CI do PR #43; o job JMeter também concluiu com sucesso ([execução 43525712520](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43525712520)). A demonstração operacional do modo simulado está registrada no [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md) e no [procedimento de demonstração](../operacao/demonstracao-fechamento.md).

**Limite de interpretação:** o gateway vazio registra a simulação por log. O estado `ENVIADA` nesse modo não comprova entrega de e-mail ou mensagem a um destinatário externo.


## Fechamento delegado — 13/11/2026

Marcos comunicou carta branca da equipe e adotou as decisões do [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Os contratos atuais, incluindo vínculo com todos os recursos, ficam formalizados **por decisão delegada de Marcos**, sem atribuir assinaturas individuais aos demais integrantes. Datas com offset, PATCH conjunto,409/FORA_DO_EXPEDIENTE, estados/perfis de edição/cancelamento e escopos/erros Q9 permanecem como implementados; Q1/Q3/Q8 preservadas.

Processo de vínculos definido no [runbook restrito](../operacao/vinculos-responsaveis.md), com [SQL reutilizável](../operacao/vinculos-responsaveis.sql). Administrador autoriza, operador SQL executa pares explícitos com referência/registro; concessão exige RESPONSAVEL e recurso ativos, revogação remove pares obsoletos e é idempotente.

RF11 adotada no **modo simulado real** previsto no ADR-006: base/processo exclusivos, worker e GatewayNotificacaoPadrao reais, URL vazia, log rastreável e ENVIADA na outbox. Sem envio externo. [Procedimento de demonstração](../operacao/demonstracao-fechamento.md), [story](../stories/marcos-fechamento-delegado-1.md) e [resultados/limites](../testes/marcos-fechamento-delegado-1-resultados.md). A execução local não é implantação no ambiente compartilhado.

As menções anteriores a ratificação por integrante, processo indefinido ou modo RF11 aguardando decisão são históricas e foram superadas por esta delegação. Resultados antigos conservam sua origem. Restam revisão do incremento pelo autor, commit/publicação quando solicitados e revisão/integração dos PRs; não há fechamento global de todos os RFs por inferência.


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

## Escopo dos testes e evidências — registro do incremento original
- NotificacaoMysqlIT: commit/rollback, envio apos commit, retry, falha definitiva,
  registro de devolucao, exigencia transacional.
- GatewayNotificacaoWireMockTest: HTTP 202, falha HTTP 500, chave idempotente.
- Item18MysqlIT preserva a fixture isolada para testes antigos.
- Com Java 21 e Docker: mvn -f backend/pom.xml clean verify.
- Inspecionar surefire/failsafe e JaCoCo do build; anexar resultados na RTM.

## Dependências entre PRs — sequência histórica da integração inicial
PR #8 RF01 -> PR #9 RF10 -> este PR RF11 (migração V4).
Depois dos merges, alterar base do PR para develop; exigir revisao por colega e CI.
