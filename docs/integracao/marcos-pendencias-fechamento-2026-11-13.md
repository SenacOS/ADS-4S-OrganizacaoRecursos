# Marcos — pendências para encaminhar aos responsáveis

Conferência em **13/11/2026**, base `develop` **1948e69**. Marcos informou que ainda não recebeu confirmações novas da equipe. Este texto está preparado para encaminhamento manual; não foi enviado como comentário, mensagem ou e-mail.

O frontend previsto até a etapa 5 está implementado, aceito e integrado. Os PRs #32/#33/#34 estão mesclados; a Q8 tem nove testes MySQL/Testcontainers aprovados na CI. As pendências abaixo tratam de confirmação contratual/operação e evidências compartilhadas. Não pedem outra implementação de GET, fila ou tela de reservas.

## Texto para enviar à equipe

Pessoal, para registrar o fechamento das minhas etapas 1 a 5, preciso das confirmações abaixo. Se algum item já estiver decidido/documentado, basta indicar o PR, documento ou registro da decisão e quem confirmou.

### Gabriel Silva — contratos de reservas

- Confirmar o contrato que o frontend já consome: datas ISO com offset de São Paulo, PATCH conjunto de `inicio`, `fim` e `recursosIds`, e `409/FORA_DO_EXPEDIENTE`.
- Ratificar os estados/perfis atuais de edição e cancelamento: dono edita SOLICITADA ou APROVADA comum; dono/Administrador cancelam SOLICITADA/APROVADA. Leitura pelo Responsável não concede edição do dono.
- Confirmar com Fausto/Débora os contratos de listagem, detalhe e fila já implementados: filtros/paginação no servidor e fila do Responsável por `GET /api/reservas?status=SOLICITADA`.

**Resposta esperada:** confirmação do comportamento atual ou divergência concreta, com referência à decisão/contrato. Fontes: [reservas](../api/reservas-contrato.md), [consultas](../api/reservas-consulta-contrato.md) e [fila](../api/reservas-leitura-contrato.md). Q1/Q3/Q8 já estão implementadas e testadas; não aguardam outra entrega.

### Gabriel Fausto — operação dos vínculos

- Definir com Silva e segurança quem concede/revoga os vínculos em `responsaveis_recursos` e qual processo administrativo restrito será usado com usuários/recursos reais.
- Registrar como os vínculos serão preparados no ambiente de demonstração/uso. A V6 cria a tabela vazia; as fixtures dos testes não preparam o ambiente da equipe.
- Confirmar a regra de vínculo com **todos os recursos** de uma reserva em conjunto com Silva/Débora. Vínculo parcial mantém a negativa de consulta/decisão; revogação já é aplicada pelo servidor.

**Resposta esperada:** responsável autorizado, procedimento/documento aprovado e referência da decisão multirrecurso. Não estou solicitando um novo endpoint ou tela de gestão. Fonte: [Q9 e vínculos](../seguranca/q9-autorizacao-reservas.md).

### Débora — segurança e notificações

- Ratificar a delimitação Q9 e o contrato de dados/erros: próprias reservas do Solicitante, vínculo completo para Responsável, consulta global do Administrador; detalhe fora do escopo responde404 e escrita sem permissão responde403.
- Confirmar o modo de demonstração/aceite da RF11: simulação documentada ou gateway HTTP, conforme a implementação existente. Já temos provas de outbox/retry com MySQL e gateway simulado por Mockito, além de HTTP com WireMock. Precisamos registrar qual evidência atende ao aceite combinado e, se o ambiente com destino externo fizer parte dele, indicar a prova desse fluxo.
- Para o ambiente final, indicar a referência da configuração/validação de worker/gateway e dos controles de implantação aplicáveis, sem compartilhar credenciais. O worker permanece desligado no nosso E2E local.

**Resposta esperada:** confirmação do modo previsto e referência das evidências do ambiente correspondente. Não estamos pedindo reimplementar auditoria/notificações. Fontes: [RF10](../qualidade/rf10-auditoria.md), [RF11](../qualidade/rf11-notificacoes.md) e [segurança](../qualidade/seguranca.md).

O erro compartilhado do scanner Maven já está registrado e, por alinhamento comigo, não bloqueia minha implementação por enquanto. Não precisa ser resolvido para responder aos itens acima.

### Todos — confirmação conjunta

Registrar o aceite dos contratos/regra multirrecurso e do processo dos vínculos no repositório ou em uma decisão identificável. Eu atualizo o plano/RTM com as referências e concluo o registro da minha entrega. Sem essas respostas, manterei esses pontos explicitamente pendentes; os merges anteriores não serão usados como ratificação coletiva automática.

## Evidências já disponíveis — não solicitar nova execução por ausência de referência

Fonte atual: [CI do PR #34, run43447037478](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43447037478), head `fbd2519`, incorporado à base1948e69. [Trechos por classe e limites](../testes/marcos-q8-pr34-evidencias.json).

| Área | Suíte / testes aprovados | O que a evidência delimita |
|---|---|---|
| Auditoria | AuditoriaMysqlIT5; UsuarioAuditoriaMysqlIT1; AuditoriaControllerTest4 | Commit/rollback, resumos seguros, auditoria de cadastro e autorização HTTP do histórico. Não comprova grants de produção contra SQL privilegiado. |
| Outbox/processamento | NotificacaoMysqlIT8 | Persistência/reversão transacional, processamento após commit, retry e falha definitiva. MySQL real; gateway Mockito e agendador desligado, processador chamado pelo teste. |
| Gateway HTTP | GatewayNotificacaoWireMockTest5 | HTTP202/500, timeout, chave idempotente e modos/protocolos. Destino WireMock, não confirmação de recebimento por um serviço externo do ambiente final. |
| Sessão/segurança/Q9 | LoginMysqlIT4; SegurancaComplementarTest7; ReservaQ9MysqlIT8; ReservaFilaMysqlIT8 | Sessão/perfis/CSRF/ownership nos recortes das suítes e leitura/decisão com vínculo autorizado no banco real. |
| Q8 | ReservaAprovacaoMysqlIT9 | Disponibilidade na aprovação, negativas/rollback, auditoria/outbox e espera pelo lock no cenário executado. |

Os números por classe já integram os totais261unitários/HTTP e66MySQL; não são rodadas adicionais. Fonte revisada em leitura, sem novos testes nesta conciliação. As evidências locais do frontend e os E2Es conservam seus commits/JARs e limites originais.

**Responsabilidade de Marcos/assistente:** relacionar/publicar a conciliação documental e registrar as respostas recebidas. **Responsabilidade compartilhada:** decisões e operação acima, revisão do PR documental e posterior integração. Não há confirmação nova recebida nesta rodada.
