# Marcos-fechamento-delegado-1 — Decisões delegadas, vínculos e demonstração RF11

## Status

Done

Em **13/11/2026**, Marcos informou ter recebido carta branca da equipe para resolver as pendências de contratos, operação de vínculos e aceite RF11 e autorizou prosseguir no fluxo do projeto. Esta story registra o recorte executável dessa delegação. Ela permite concluir decisões/procedimentos locais antes pendentes, **sem atribuir assinatura individual a Silva, Fausto ou Débora** e sem pedir novamente a confirmação que Marcos já está autorizado a dar.

O agente principal confirmou a branch `feature/marcos-fechamento-delegado` criada sobre a base do PR #35, ainda **aberto** no checkpoint recebido. Essa dependência é explícita; revalidar o estado antes de publicação, sem presumir merge. Preservar documentos/commits/evidências existentes. Mantém-se o fluxo **implementação/verificação → revisão do autor → commit solicitado**; “podemos começar” não autoriza commit, push, comentário, nova publicação ou merge automático.

## Story

Como responsável delegado pelo fechamento das etapas 1 a 5, quero formalizar os contratos atuais e o procedimento restrito dos vínculos, preparar uma demonstração isolada e comprovar RF11 no modo simulado previsto, para substituir pendências de decisão/operação por registros verificáveis sem criar APIs ou alterar produção.

Responsável: Marcos Boé, por delegação comunicada em 13/11/2026. Preparação AIOX SM; decisões de arquitetura AIOX Architect; execução AIOX Dev; veredicto independente AIOX QA. RF01/RF04/RF07/RF11/RF13/RF14 nos recortes comprovados, com referências compartilhadas a auditoria/qualidade. Não é certificação de produção nem encerramento global de todos os RFs/NFRs.

## Fontes e decisões de arquitetura

- [Pendências vigentes por responsável](../integracao/marcos-pendencias-fechamento-2026-11-13.md): registro anterior da necessidade de confirmação contratual, processo dos vínculos e modo de aceite RF11. Preservar sua data/origem e acrescentar o resultado da delegação, sem fingir que os registros anteriores já continham essas decisões.
- [Plano de fechamento](../planejamento/marcos-fechamento-etapas-1-a-5.md): frontend/cenários mínimos já implementados e integrados; foco atual documental/operacional compartilhado. Não há nova tela ou GET a implementar para encerrar esse recorte.
- [ADR-006 — notificações](../arquitetura/adr/ADR-006-timezone-expediente-notificacoes.md): outbox transacional, processamento após commit e modo simulado sem e-mail real.
- [ADR-007 registrado por AIOX Architect](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md): adotar contratos atuais por delegação de Marcos; vínculo concedido/revogado por processo CLI/SQL administrativo restrito; RF11 simulada com gateway real sem URL e outbox/processador reais. O arquiteto confirmou o arquivo pronto e o executor conferiu seus links; a story não substitui sua autoria arquitetural nem declara demonstração já executada.
- [Contrato de reservas](../api/reservas-contrato.md), [consulta](../api/reservas-consulta-contrato.md), [fila](../api/reservas-leitura-contrato.md), [Q9](../seguranca/q9-autorizacao-reservas.md), `Reserva.java`, `StatusReserva.java`, `ReservaAcessoMysql` e V6: fontes do comportamento atual; não inventar papéis/transições ou nova aprovação parcial.
- [RF11](../qualidade/rf11-notificacoes.md), `GatewayNotificacaoPadrao`, `ProcessadorNotificacoes`, `NotificacaoAgendamento` e V4: gateway vazio escreve log simulado; processador seleciona toda outbox elegível, faz claim curto e marca ENVIADA após gateway; worker existente usa intervalo de 30 segundos quando habilitado. Não existe endpoint público de disparo/reexecução.
- [Guia local](../integracao/marcos-e2e-local.md), ferramentas/auxiliares em `tests/e2e-local/`, [evidências Q8 da CI](../testes/marcos-q8-pr34-evidencias.json) e demais provas já vinculadas no plano: JDK21/MySQL isolados e mecanismos reais disponíveis; não repetir suítes já aprovadas só por ausência de nova referência.

## Critérios de aceitação

1. Conferir estado do checkout/base/PR #35 e preservar alterações anteriores antes de iniciar. Registrar a referência real da execução, a delegação de Marcos em 13/11 e o ADR-007 efetivo. Distinguir autorização para decidir/concluir este recorte de autorização para publicar ou operar produção; não modificar branches/PRs fechados ou atribuir merge/review inexistente.
2. Formalizar, por decisão delegada, o **contrato já consumido/implementado**: ISO com offset São Paulo, PATCH conjunto inicio/fim/recursosIds, 409/FORA_DO_EXPEDIENTE, consultas/filtros/paginação/total e fila atuais. Q9: Solicitante próprias; Responsável com vínculo em todos os recursos; Administrador todas; detalhe fora do escopo 404, escrita sem permissão 403. Leitura não amplia escrita. Registrar a origem delegada e as referências; não continuar pedindo ratificação individual para a decisão que Marcos está autorizado a resolver, nem atribuir concordância nominal não recebida.
3. Registrar estados/perfis atuais sem implementar regra nova: dono edita SOLICITADA ou APROVADA comum, sem mudar necessidade de aprovação; dono/Administrador cancelam SOLICITADA/APROVADA; Q1/Q3/Q8 vigentes conforme os PRs/fontes integrados. A adoção por delegação não altera os comentários históricos PROPOSTO, os contratos antigos ou resultados anteriores retroativamente; conciliá-los com um checkpoint atual claro. Não criar endpoint, UI, hierarquia de permissão ou transição adicional.
4. Documentar processo administrativo restrito de vínculos conforme ADR-007: Administrador autoriza; operador de banco autorizado executa **pares explícitos** usuário/recurso por CLI/SQL, com IDs positivos validados. **Concessão** exige usuário RESPONSAVEL ativo e recurso existente/ativo, é idempotente e ocorre em transação curta com parâmetros. **Revogação** remove somente o par pedido e é idempotente; deve permitir limpar vínculo obsoleto mesmo se usuário ficou inativo/mudou de perfil ou o recurso está inativo, sem transformar isso em concessão permitida. Consultar antes/depois e fazer rollback em entrada inválida. Não fazer concessão em massa implícita, usar superusuário/SUPER como requisito de uso, trocar papel para superar Q9 ou criar nova API/tela de gestão. Registrar a operação com ator operacional, motivo, pares e resultado sem segredos; autorização administrativa de aplicação não equivale à posse de uma conta DB. Não alegar que SQL administrativo gerou auditoria da aplicação quando isso não ocorreu.
5. Preparar/executar a demonstração de concessão e revogação **somente para massa própria identificada** no ambiente isolado. Os auxiliares devem recusar base/instância divergente, IDs/códigos fora da massa autorizada, concessão a perfil inativo/indevido ou recurso inativo e execução sem alvo explícito. Verificar negativos relevantes, duplicatas/idempotência, rollback, limpeza específica de concessão obsoleta e preservação de outros pares. Depois demonstrar por HTTP real: acesso negado sem vínculo/parte dos vínculos, acesso permitido com todos, novamente negado após revogar (404 detalhe/403 decisão pertinentes), e reconcessão com aprovação 200 em estado elegível. Conferir lista/fila/total e persistência, evitando que uma negativa por transição ou autoaprovação mascare Q9. Para negativos de perfil/atividade, fixtures SQL identificadas podem preparar somente usuários/recursos novos da base exclusiva, sem alterar dados reais ou conceder papel para contornar a regra.
6. Usar identidades de aplicação reais da demonstração e dados fictícios: bootstrap/cadastro administrativo existente, recursos/reservas por HTTP autorizado, sessão/CSRF dinâmico, datas/expediente compatíveis e identificação exclusiva. Não coletar credenciais reais da equipe, alterar senhas de usuários existentes ou executar concessão em ambiente real de terceiros. Senhas/configuração/estado/SQL específico da máquina ficam ignorados; versão genérica de CLI/helper pode existir em área administrativa/de testes adequada, com escopo e identidade obrigatórios, sem virar mecanismo público de produto.
7. Para RF11, adotar explicitamente o **modo SIMULADO** já previsto no ADR-006 e formalizado pelo ADR-007: outbox real → processador/worker real → `GatewayNotificacaoPadrao` com URL efetivamente vazia → log simulado e status ENVIADA. Conferir que não há destino configurado por outro source de runtime; não usar Mockito/WireMock para representar esta demonstração, trocar bean por stub ou enviar rede/e-mail real. Envio externo e HTTPS/deploy continuam fora da prova, sem exigir gateway externo para esse aceite simulado delegado.
8. Isolar a execução RF11 em **base/instância de demonstração exclusiva nova**, ou recusar o processamento se houver outbox elegível alheia: `ProcessadorNotificacoes`/worker selecionam toda outbox elegível, não apenas o ID da fixture. Preparação definida pelo arquiteto/executor: base `qs_fechamento_<nonce>`, credencial nova local limitada a essa base e Spring temporário em loopback/porta 18082 livre, com bootstrap administrativo fictício e demais usuários pela API. Testar procedimento/Q9 e observar PENDENTE com worker desligado; habilitá-lo só na fase RF11 do processo isolado com URL vazia. Não habilitar o worker no ambiente histórico principal para consumir eventos antigos nem apagar/reclassificar pendências alheias para obter uma base “limpa”. Flyway pode provisionar o schema próprio pelo modelo existente; nenhuma migration/DDL de produto nova ou alteração de grants de produção é autorizada.
9. Provar o encadeamento RF11 com IDs/correlação e timestamps reais: ação de domínio HTTP confirmada, evento(s) efetivamente persistido(s) PENDENTE após commit, processamento real com log `Notificacao simulada` do ID/evento/reserva da massa e estado ENVIADA/enviado_em coerente no banco. Garantir uma observação de pendente antes do processamento, por sequência de runtime seguro já disponível, sem atualizar status/timestamps no banco para fabricar estados nem criar endpoint de disparo. Worker=true apenas no processo próprio da demonstração, URL vazia, espera total delimitada e consulta em blocos curtos compatíveis com o intervalo de 30 segundos; registrar falha/bloqueio se o fluxo não ocorrer. ENVIADA aqui significa processamento no modo simulado, não recebimento por serviço externo/exatamente uma vez.
10. Validar UUID/datadir/base/endereço e propriedade dos processos de demonstração, usando os controles existentes e caminhos de executáveis absolutos já corrigidos. Preservar instância/estado/dados principais, registrar PID/CreationDate/executável/JAR/cookie/porta próprios quando aplicável e encerrar somente os processos criados/identificados pelo recorte, inclusive em falha. Flags habilitadas somente no runtime da demonstração; não editar application.yml, código de produção, relógio, serviços Windows ou configuração persistente para obter o resultado.
11. Executar verificações proporcionais aos artefatos novos/alterados: sintaxe dos auxiliares/scripts e testes relevantes de validação/recusa/rollback quando houver comportamento novo necessário, mais as provas HTTP/SQL/log reais descritas. Não criar testes que apenas espelhem texto de documentação. Se produto/telas/testes frontend permanecerem iguais, conferir hashes e referenciar o build 81/278 e evidências reais anteriores sem repetir por rotina; mudança de produto só por defeito concreto rastreado exige regressões/gates apropriados. Identificar JAR/fontes efetivamente usados e qualquer package/teste Maven omitido, sem inferir clean verify, cobertura ou CI nova.
12. Atualizar documentos de contratos/Q9/RF11, processo/guia de vínculos, planos, RTM, índices e stories afetadas para distinguir: histórico anterior, decisão atual por delegação, procedimento disponível, demonstração executada e dependências reais remanescentes. Preservar origem/valores/contagens das evidências anteriores e relacionar as provas compartilhadas já existentes. Alterar status somente onde houver decisão/prova correspondente; não deixar “aguardando decisão da equipe” como estado atual daquilo que a delegação/ADR resolveu, nem apagar pendências distintas de revisão/publicação/produção.
13. Produzir relatório de resultados e inventário sanitizados, por exemplo `docs/testes/marcos-fechamento-delegado-1-resultados.md`, com base/branch, autorização/ADR, comandos, massa, camadas, hashes, tempos, logs/IDs e limites. Registrar claramente concessões/revogações e a ausência de auditoria de aplicação para operação SQL externa, além do modo RF11 sem rede. Não transformar evidência Mockito/WireMock anterior em prova de worker real ou deploy. Fonte que marque PR #35 aberto/merged só é atualizada após conferência do executor, nunca por suposição desta preparação.
14. Obter revisão independente QA dos controles, documentação/provas e da distinção entre aceite delegado, operação local e produção; disponibilizar checkpoint de revisão a Marcos antes do commit. Cenário inviável recebe bloqueio, causa e próxima ação sem contornar segurança ou exigir credenciais reais. O resultado encerra apenas as pendências delegadas efetivamente atendidas; scanner compartilhado permanece registrado conforme alinhamento vigente, sem alteração de secrets/gates para deixá-lo verde. Não declarar RFs completos, HTTPS/deploy real, envios externos ou revisão nominal de toda a equipe. Commit/push/PR/merge e mensagens externas só nos pedidos correspondentes.

## Tasks / Subtasks

- [x] Conferir referências/PR #35, preservar contexto e registrar delegação de Marcos e ADR-007 efetivo (AC 1).
- [x] Conciliar contratos/estados/Q9/Q1/Q3/Q8 atuais com a decisão delegada, preservando o histórico (AC 2–3).
- [x] Documentar autorização administrativa, operação restrita de vínculos e registro operacional sem segredos (AC 4).
- [x] Preparar massa própria e demonstrar concessão idempotente/revogação e negativos relevantes com HTTP+SQL (AC 5–6).
- [x] Preparar isolamento exclusivo da RF11 e conferir modo simulado efetivo/ausência de destino externo (AC 7–8).
- [x] Demonstrar domínio/outbox após commit, processador real, log simulado e ENVIADA por IDs/tempos rastreáveis (AC 9).
- [x] Conferir isolamento e encerrar somente os processos próprios, mantendo o ambiente histórico intacto (AC 10).
- [x] Executar verificações proporcionais e registrar hashes, comandos/resultados e limites sem repetir testes sem necessidade (AC 11).
- [x] Atualizar contratos/guias/plano/RTM/stories/índices e publicar somente evidências sanitizadas no conjunto revisável (AC 12–13).
- [x] Registrar QA independente e revisão do autor: Marcos aprovou o pacote em13/11/2026 e solicitou o commit local (AC 14).
- [x] Registrar aceite e solicitação de commit local de Marcos; push/PR, merge, implantação e mensagens externas seguem solicitações próprias.

- [x] Confirmar publicação, revisão humana e merge do #36, Quality Gate do PR e sincronização da base; registro pós-merge preserva provas/limites sem nova implementação.

## Dev Notes

Decisões arquiteturais foram coordenadas com AIOX Architect: ADR-007 terá registro próprio, sob sua autoridade. A delegação comunicada por Marcos autoriza resolver as decisões pendentes sem outra rodada de perguntas individuais; o documento deve dizer isso, não inventar assinaturas ou aprovação de um ambiente real que ninguém executou. Procedimento restrito de administração é suficiente para o escopo atual, sem nova interface/API de concessão.

V6 permite vários responsáveis por recurso, mas a consulta/decisão exige todos os recursos de uma reserva. O processo de concessão/revogação não deve trocar essa regra. Para prova, usar solicitante diferente do aprovador e estado apropriado, com recursos próprios identificados; antes/depois do par alvo devem ser verificáveis. SQL de administração fora da aplicação não passa automaticamente pelo AuditoriaPort; registro operacional do CLI/procedimento é prova dessa ação, não uma linha inventada da trilha de domínio. Credenciais de operação real, contas/grants de produção e execução externa ficam fora deste recorte.

Gateway vazio é implementação real de simulação por log; o processador marca ENVIADA depois do retorno do gateway. Por selecionar toda outbox elegível, habilitar o worker na base histórica poderia alterar eventos de outras rodadas. A demonstração deve provisionar base/processo próprios ou recusar elegíveis alheios sem limpar dados. As transições podem ser observadas com worker inicialmente desligado e depois habilitado somente no processo isolado, ou outra sequência segura prevista pelo runtime existente, sem código/endpoint novo de disparo. O executor registra a opção concreta, o que realmente rodou e como encerrou.

O intervalo de 30 segundos entre execuções do agendador orienta uma espera delimitada; a primeira execução pode ser imediata, pois não há initialDelay. Esperar esse tempo não é um PASS. O teste precisa ligar a linha PENDENTE ao log e à linha ENVIADA do evento da própria massa após ação HTTP/commit. Logs brutos e configuração efetiva privada não devem vazar URLs com segredos, senha, cookie ou token; a evidência pública contém somente os campos necessários. Repetições/falhas anteriores permanecem distintas, e não há garantia exactly-once ou comprovação de entrega externa neste modo.

São esperados principalmente documentos/procedimentos e auxiliares opt-in de demonstração. Nomes concretos de helper/guia cabem ao executor e à organização real do repositório, com File List atualizada; isso não é licença para acrescentar produto, migrations ou um subsistema de administração não previsto. Um novo teste só é necessário se houver comportamento/controle a verificar; simples conciliação de texto usa conferência de referências/coerência.

Artefatos definidos pelo executor para iniciar: `docs/operacao/vinculos-responsaveis.sql` e runbook Markdown associado, além de `tests/e2e-local/demonstrar-fechamento.cjs` opt-in. O SQL reutilizável implementa o procedimento restrito descrito no ADR; a demonstração controla exclusivamente a base `qs_fechamento_<nonce>` e seu processo 18082. Seu usuário de runtime limitado, bootstrap fictício e estado/logs são privados e exclusivos; não substituir o estado principal nem apagar a base histórica. Esses nomes concretizam o escopo, não exigem novo endpoint/API ou execução já ocorrida.

## Validação de preparação

Checklist `story-draft-checklist` conferido: objetivo e autorização delegada, fontes atuais/históricas, decisões arquiteturais coordenadas, procedimento mínimo, isolamento da outbox/processos, critérios testáveis e limites de produção estão explícitos. Nome da story conferido livre. Preparação SM não é execução de demonstração, veredicto QA, confirmação do estado do PR #35 ou aceite de Marcos sobre resultados futuros.

## CodeRabbit Integration

Tipo principal: documentação/operação local e integração; secundário: controles de auxiliares. Execução AIOX Dev; arquitetura AIOX Architect; veredicto independente AIOX QA e checkpoint do autor. Focos: delegação sem atribuição indevida, concessão/revogação restritas, rollback/registro, isolamento da outbox inteira, URL vazia efetiva, encadeamento RF11 real sem rede e identidade/cleanup dos processos. Gates proporcionais e E2E/SQL/log reais; frontend completo se houver mudança abrangida de produto. CodeRabbit com resultado/indisponibilidade explícitos, sem aprovação presumida; self-healing light até 2 iterações/15 minutos para CRITICAL, HIGH documentado. Publicação e operações de PR seguem autorização própria/AIOX DevOps.

## Dev Agent Record

### Publicação autorizada do registro final — 13/11/2026

Marcos solicitou “pode fazer commit e push” após a conferência dos merges #36/#37 e do encerramento integrado. O commit que inclui este registro identifica os8arquivos documentais na branch `docs/marcos-encerramento-etapas-1-a-5`, com autor/committer Marcos Boé. Conferidos critérios encerrados, File List, digests, links e diff; nenhum produto/teste/CI alterado ou suíte repetida nesta atualização documental. A autorização cobre commit e push dessa branch, sem criação automática de PR, merge ou mensagem externa. A story continua Done pela entrega já integrada no #36; este registro não reabre sua implementação.

### Entrega integrada — PR #36

Commitbe1dbc7 publicado e revisado por jovemOG-Dev (APPROVED), integrado pelo #36 emc4279b6. QualityGate36OK; testes/gates/JMeter da CI aprovados e scanner compartilhado mantém falha/autorização conforme orientação temporariamente não bloqueante de Marcos. Basec4279b6 conferida contendo também #37, adição RF12 fora do recorte. [Metadados e limites](../testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json). Contratos/operação/RF11 simulada, testes locais, QA e aceite do autor cumpridos; nenhum resultado de produção/global ou execução nova presumido. Registro documental pós-merge ainda sem commit/publicação; não é nova pendência funcional da story.


### Aceite do autor e commit local — 13/11/2026

Marcos informou “aprovado, podemos fazer o commit” após receber o checkpoint da entrega. Aceite do incremento registrado sem ajustes solicitados. O commit que inclui este registro identifica a entrega local na branch `feature/marcos-fechamento-delegado`, com autor e committer Marcos Boé. Fontes/provas permanecem preservadas; conferência final de29arquivos/370links, manifestos/digests e diff realizada, sem nova execução injustificada de suítes. Push, PR do incremento, merge e operação no ambiente compartilhado não fazem parte desta solicitação de commit. Parecer QA abaixo preservado.

### Completion Notes

Implementação local concluída sob delegação de Marcos: ADR007/contratos atuais, SQL/runbook de vínculos e demonstração RF11 simulada real. Rodada final16:55:02UTC:8/0, incluindo conta SQL restrita por coluna, IDs inválidos, revogação efetiva/idempotência, correlação/tempos de outbox e worker/gateway reais. Falha inicial controlada confirmou cleanup e preservação; tentativas anteriores/indisponibilidade MySQL preservadas com limites. Buildlint/typecheck81unitários/278navegador aprovado uma vez. ProdutoJava/configuração persistente não alterados; JAR4b8633a55e59f5f2b5d11865338cb7658eb0f943b50b35d6baa0eb2ebfb0def5 mantido. Evidências/manifesto no relatório. QA/revisão do autor e publicação seguem seus checkpoints; sem novo commit/push/PR/merge ou mensagem externa.

### Preparação histórica

Somente preparação da story concluída. Decisões do ADR-007 foram coordenadas com AIOX Architect; o ADR e os procedimentos/auxiliares/provas têm autores/execuções próprios. Nenhum outro documento, código, operação Git, banco ou serviço foi alterado por esta preparação. Resultados de vínculos/RF11 e o fechamento documental aguardam execução e revisão efetivas.

### Agent Model Used

Codex, preparação AIOX SM, com decisões arquiteturais recebidas de AIOX Architect.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-13 | Entrega integrada pelo #36, revisão humana/QualityGate confirmados e basec4279b6 sincronizada; registro documental de encerramento, #37/RF12 fora do recorte. |
| 2026-11-13 | Implementação local e provas8/0, build81/278, falha controlada/cleanup e tentativas preservadas; contratos/procedimentos/evidências conciliados para QA e revisão do autor. |
| 2026-11-13 | Story Ready for Dev para decisões delegadas por Marcos, operação CLI/SQL restrita dos vínculos e demonstração RF11 simulada real, coordenada com ADR-007, sem nova API/UI ou publicação automática. |

### File List

Arquivos efetivamente criados/alterados neste incremento:

- `docs/README.md`
- `docs/RTM.md`
- `docs/api/reservas-consulta-contrato.md`
- `docs/api/reservas-contrato.md`
- `docs/api/reservas-leitura-contrato.md`
- `docs/api/reservas-politica-leitura-q9.md`
- `docs/arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md`
- `docs/arquitetura/adr/README.md`
- `docs/integracao/marcos-e2e-local.md`
- `docs/integracao/marcos-fechamento-entrega.md`
- `docs/integracao/marcos-pendencias-fechamento-2026-11-13.md`
- `docs/operacao/demonstracao-fechamento.md`
- `docs/operacao/vinculos-responsaveis.md`
- `docs/operacao/vinculos-responsaveis.sql`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/qualidade/rf11-notificacoes.md`
- `docs/seguranca/q9-autorizacao-reservas.md`
- `docs/stories/marcos-fechamento-delegado-1.md`
- `docs/testes/marcos-fechamento-delegado-1-resultados.md`
- `docs/testes/marcos-fechamento-delegado-1/falha-inicial-controlada.json`
- `docs/testes/marcos-fechamento-delegado-1/frontend-build.txt`
- `docs/testes/marcos-fechamento-delegado-1/manifesto.json`
- `docs/testes/marcos-fechamento-delegado-1/resultado-final.json`
- `docs/testes/marcos-fechamento-delegado-1/resultado-intermediario.json`
- `docs/testes/marcos-fechamento-delegado-1/tentativa-indisponibilidade-mysql.json`
- `docs/testes/marcos-fechamento-delegado-1/tentativa-inicial.json`
- `docs/testes/marcos-fechamento-delegado-1/tentativa-rastreabilidade.json`
- `tests/e2e-local/demonstrar-fechamento.cjs`

- `docs/testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json`

Configuração, credenciais, contas/base local, estado, logs brutos e JAR permanecem privados/ignorados. Nenhum artefato previsto mas não produzido é listado.

## QA Results

### Preparação histórica

Execução e fechamento delegados ainda pendentes. Sem comprovação antecipada de concessão/revogação, processamento RF11, isolamento/cleanup, QA ou revisão do autor. Evidências anteriores de Mockito/WireMock/outbox estão relacionadas nas fontes, mas não são esta demonstração real do modo simulado. Publicação, operação de produção e aceite externo permanecem separados.

### Parecer independente do incremento executado

**PASS técnico local — AIOX QA (Quinn), revisão independente em 13/11/2026.** SQL, auxiliar, privilégios, isolamento, ADR/contratos, relatório e evidências revisados. Nenhum achado bloqueante permanece no recorte final. Incremento apto a **Ready for Review** e ao checkpoint do autor; o parecer não equivale ao aceite humano, autorização de publicação ou certificação de produção.

A delegação comunicada por Marcos e registrada no ADR-007 formaliza o comportamento existente sem inventar assinaturas de outros integrantes. A documentação atual distingue as decisões adotadas das pendências históricas; operação local, registro operacional SQL e auditoria de domínio permanecem separados. O PR #35 mesclado foi registrado como atualização posterior: execução/digests continuam sobre **ab50d26**, na branch `feature/marcos-fechamento-delegado`, sem reatribuição ao merge posterior.

[Resultado final](../testes/marcos-fechamento-delegado-1/resultado-final.json) conferido: **8 PASS / 0 FAIL**, rodada `2026-11-13T16-55-02-031Z`, com conta operadora separada, base nova própria e HTTP/Spring/MySQL reais. Concessão exige RESPONSAVEL/recurso ativos, opera um par e é idempotente; revogação remove somente o par, inclusive usuário inativo/perfil alterado. Negativas incluem IDs0/-1, ação/referência inválidas, alvo ausente, perfil e atividade incompatíveis. SELECT da conta operadora está limitado às colunas necessárias; UPDATE(id) para locking e UPDATE(recurso_id) para o no-op idempotente não concedem alteração de perfil/atividade. Negativas reais de atualização de perfil e leitura de e-mail/hash de senha foram verificadas. O SQL reutilizável encerra recusas com ROLLBACK e usa apenas constantes no PREPARE final; não é uma API nem uma garantia contra um operador SQL privilegiado.

Q9 foi demonstrada sem confundir negativa de autorização com transição/autoaprovação: sem vínculo ou com vínculo parcial, detalhe404; com todos os recursos, detalhe/fila autorizados; revogação produz detalhe404/aprovação403 e preserva SOLICITADA; reconcessão permite aprovação200 por Responsável diferente do solicitante. O retorno de operador/base/referência/antes/depois registra a operação administrativa e não fabrica uma linha de auditoria da aplicação.

RF11 usa o **worker/processador e GatewayNotificacaoPadrao reais**, com URL explicitamente vazia somente no processo18082 da base nova. Antes do worker, os dois eventos próprios estão PENDENTE/tentativas0 e ligados à auditoria pela correlação real de domínio. Depois, ID/evento/reserva/correlação/criado_em permanecem os mesmos, log simulado é encontrado, enviado_em é coerente e estado ENVIADA/tentativa1 é confirmado. Isso comprova a simulação adotada, sem Mockito/WireMock nesta demonstração; não significa recebimento externo ou exactly-once. O intervalo configurado do agendador não é usado como critério de sucesso por simples espera.

Quatro achados P2 foram corrigidos durante a revisão: cleanup após falha precoce ou erro de liberação de contexto, ausência de negativa real para ID inválido, falta de rastreabilidade/correlação/tempos na evidência RF11 e SELECT mais amplo que o necessário na conta operadora. O auxiliar final encerra o **handle do filho criado por ele**, tenta as demais verificações de encerramento mesmo com falha e preserva o erro original. A falha controlada após spawn/antes de CIM, reexecutada na versão final, permanece **0 PASS/1 FAIL esperado** e comprova cleanup. Tanto ela quanto a rodada funcional final registram principal pronto, temporária encerrada e digests de estado/outbox antes/depois idênticos. A inspeção indisponível é diferenciada de um digest efetivamente divergente.

Conferidos **10/10 artefatos do manifesto**, **7/7 do resultado final** e **7/7 da falha controlada**, todos correspondentes aos arquivos atuais. O log publicado registra lint/typecheck e **81 unitários/278 navegador** aprovados uma vez; modificações posteriores só no auxiliar receberam a reexecução pertinente. JAR **4b8633a55e59f5f2b5d11865338cb7658eb0f943b50b35d6baa0eb2ebfb0def5** conserva sua origem. Revisão QA não executou Git, suítes, serviços ou SQL e não acessou credenciais, configurações privadas ou logs brutos; verificou código e provas sanitizadas.

Tentativas anteriores2/1,8/0 intermediário,6/1 de rastreabilidade e0/1 com MySQL indisponível continuam separadas no [relatório](../testes/marcos-fechamento-delegado-1-resultados.md). A causa da indisponibilidade MySQL permanece não determinada; não houve comparação obtida que prove alteração de outbox nessa tentativa nem isolamento aprovado retroativamente. A recuperação e a nova rodada estável não apagam seu FAIL. Não se atribuem grants/imutabilidade de produção, HTTPS/cookie Secure, entrega externa, cobertura de todas as corridas ou aprovação remota de CI/Sonar/CodeRabbit. Revisão do autor, solicitação de commit, publicação e integração conservam seus próprios checkpoints; nenhum parecer QA histórico foi alterado por este incremento.

### Encerramento integrado após o PR #36

**PASS de encerramento do recorte entregue — AIOX QA (Quinn), revisão independente em 13/11/2026. GO para Done desta story.** O aceite de Marcos, a implementação/prova local aprovada acima e a entrega integrada agora possuem seus registros próprios. O [registro pós-merge](../testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json) confirma head `be1dbc72e18b760ea2ce40a08a5677dd19bb9aa5`, revisão **APPROVED de jovemOG-Dev**, publicação e merge do **PR #36 em c4279b6**. Não resta condição de implementação ou entrega deste recorte das etapas 1 a 5 para ser satisfeita por outra tela ou repetição de testes já aprovados.

O Quality Gate consultado para o #36 está **OK**. A CI43472622587 registra sucesso dos testes Java/MySQL, gates JaCoCo e JMeter; sua conclusão global permanece **failure** pela autorização/projeto do scanner Maven. Aplica-se a orientação expressa de Marcos de tratar esse erro compartilhado como temporariamente não bloqueante da implementação. Isso não é aprovação integral de CI nem de CodeRabbit local, cuja indisponibilidade continua registrada. Nenhuma regra, segredo ou gate foi alterado para permitir este encerramento.

Plano, RTM, índice, entrega e relatório distinguem o encerramento funcional já integrado da publicação deste **novo registro exclusivamente documental**, ainda sujeita ao fluxo correspondente. O manifesto original continua **10/10 MATCH**. As provas **8/0**, o build **81/278**, a falha controlada e as tentativas históricas preservam a base/árvore de sua execução sobre ab50d26 e o JAR original; não foram atribuídos testes ou package novos à base c4279b6. A revisão QA foi somente documental/estática, sem executar Git, suítes, serviços, SQL ou acessar credenciais privadas.

A mesma base contém o #37, cuja contribuição foi conferida como porta/projeção/adaptador de leitura MySQL RF12 e testes de integração. Esse incremento aditivo não entrega serviço/agregação nem resposta/endpoint HTTP de relatório e não constitui frontend RF12 ou conclusão da etapa 6. Seu resultado de CI e o scanner compartilhado têm origem própria. Done desta story encerra contratos delegados, procedimento/demonstração local dos vínculos, RF11 **simulada** e entrega pertinente até a etapa 5; não certifica implantação, operação no ambiente compartilhado, HTTPS, grants de produção, entrega externa de mensagens ou todos os RFs/NFRs do projeto. Parecer local original preservado, sem aprovação retroativa das tentativas que falharam.
