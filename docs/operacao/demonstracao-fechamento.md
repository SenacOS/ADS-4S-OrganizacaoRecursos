# Demonstração isolada de vínculos e RF11 simulada

Decisão: [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). RF11 é demonstrada no modo simulado já previsto pelo ADR-006: domínio/outbox/worker/gateway reais, URL de gateway vazia e log local, sem e-mail ou destino HTTP externo. `ENVIADA` significa processamento bem-sucedido pelo gateway simulado, não recebimento por uma pessoa.

## Reproduzir neste computador

Requer o [ambiente local já preparado](../integracao/marcos-e2e-local.md), JDK21/MySQL8.4 portáteis, dependências Node, JAR correspondente ao backend integrado e porta18082 livre. Na raiz do repositório:

```powershell
node tests/e2e-local/controle.cjs status
node tests/e2e-local/demonstrar-fechamento.cjs
```

O auxiliar é opt-in. Ele confere UUID/datadir/portas/identidade do ambiente principal antes de criar **uma base nova** `qs_fechamento_<nonce>` no mesmo MySQL local, com conta de migração/runtime e conta operadora próprias. Usa bootstrap administrativo somente no perfil local e cadastra os demais usuários pela API real. Senhas aleatórias, arquivos do cliente, PID/CreationDate e logs brutos ficam em `.aiox-core/local/fechamento-delegado/<rodada>/`, ignorados pelo Git.

Não exige alterar `application.yml`, POM, migrações, grants de contas existentes ou PATH persistente. Não muda o banco/estado/outbox do E2E principal. Não cria endpoint de disparo ou gestão de vínculos. Preserva a base e as contas da rodada para inspeção; não apaga bancos nem dados históricos.

## Sequência que o auxiliar comprova

1. Inicializa Spring em loopback18082 na base vazia própria, APIs habilitadas apenas nesse processo, worker desligado e URL de gateway explicitamente vazia.
2. Cria perfis/recursos fictícios com sessão/CSRF reais e reserva restrita de dois recursos. Executa o [procedimento SQL](vinculos-responsaveis.sql) com conta administrativa restrita.
3. Confere recusa de parâmetros inválidos, alvo ausente, Solicitante, usuário inativo e recurso desativado; concede/revoga pares com consulta antes/depois e idempotência. A conta operadora não pode alterar perfil do usuário.
4. Demonstra Q9: dono/Administrador leem; outro Solicitante, Responsável sem vínculo ou parcial recebem404. Vínculo completo permite leitura/fila. Revogar um par remove leitura e aprovação (404/403), mantendo SOLICITADA; reconceder permite aprovação200. Revogação limpa pares obsoletos sem conceder privilégios.
5. Antes do worker, confere eventos CRIADA/APROVADA em PENDENTE com zero tentativas e auditoria real após o commit.
6. Para somente o Java temporário identificado e reinicia-o na mesma base exclusiva com worker real habilitado e `--notificacoes.gateway.url=`. O agendador existente processa a fila dessa base. Observa cada ID/Reserva/evento no log `Notificacao simulada...` e no SQL ENVIADA, uma tentativa e enviado_em preenchido.
7. Encerra somente o processo próprio por PID, executável, comando e CreationDate; confere porta livre, prontidão/estado principal e digest da outbox histórica inalterados.

A espera pelo worker é limitada e inspeciona o estado real; aguardar30segundos não é aprovação por si só. O teste não usa interceptação de API, Mockito ou WireMock. Os testes complementares anteriores de retry/rollback/HTTP controlado mantêm suas fontes na CI; esta prova não repete todos esses cenários.

## Configuração de uma demonstração mantida pela equipe

Marcos coordena a base e os vínculos da demonstração delegada; o Administrador autoriza os pares e o operador SQL aplica o runbook. Configurar o processo de demonstração com `NOTIFICACOES_WORKER_ENABLED=true` e `NOTIFICACOES_GATEWAY_URL` vazia, conferindo que não há URL efetiva sobrescrevendo esse modo. O helper usa também argumentos explícitos do Spring para fixar o modo.

O processador percorre toda outbox elegível, sem filtro por reserva. Portanto, habilitar o worker somente em base identificada e exclusiva dessa demonstração, com eventos conhecidos; não usá-lo para drenar a outbox histórica do ambiente principal. Preservar evidências/IDs e parar o processo próprio depois. Se a porta, identidade da instância ou PID não conferir, interromper e inspecionar o estado privado, sem encerrar outro processo.

HTTP loopback local não certifica implantação HTTPS, cookie Secure ou segregação de privilégios de produção. Essas configurações conservam os requisitos/guia de segurança próprios. O modo adotado não exige envio externo; uma mudança futura para gateway HTTP será configuração/aceite de ambiente correspondente.

## Resultados e revisão

[Relatório desta entrega](../testes/marcos-fechamento-delegado-1-resultados.md) identifica tentativa inicial, correção, execução final, hashes/JAR, build e limites. Manter resultados originais separados. Nenhum commit/push/merge é automático pelo auxiliar; a revisão do autor precede o commit solicitado conforme a story.
