# Marcos — conferência de fechamento em 13/11/2026

## Relação de evidências e autorização de publicação

**Alinhamento para publicação:** Marcos autorizou publicar a conciliação e informou que ainda não recebeu confirmações novas. [Pendências por responsável e texto pronto para encaminhar](../integracao/marcos-pendencias-fechamento-2026-11-13.md). Evidências compartilhadas RF10/RF11/segurança agora relacionadas à CI43447037478: auditoria MySQL5, auditoria de usuário1 e controller4; outbox MySQL8 com gateway Mockito; gateway HTTP WireMock5; sessão/segurança/Q9 conforme matriz. Isso comprova os recortes executados, sem transformar gateway de teste em recebimento externo ou ratificação contratual. O modo de demonstração/aceite RF11 ainda exige confirmação da responsável. Commit/push/PR documental autorizados; nenhuma mensagem externa ou merge automático.

As classes/contagens/trechos por suíte foram acrescentados à [evidência da CI do #34](marcos-q8-pr34-evidencias.json). A leitura de NotificacaoMysqlIT confirmou gateway Mockito e agendador desligado; GatewayNotificacaoWireMockTest usa destino HTTP WireMock. A nova relação registra provas já executadas, sem novo teste, simulação de aceite coletivo ou envio de notificação externa. Publicação autorizada pelo usuário; a efetivação será identificada pelo commit/PR documental. Os checkpoints abaixo preservam as fotografias anteriores.


## Atualização vigente — Q8/MySQL, PR #34

PR #34 aprovado por Marcos e mesclado em13/11/2026,16:05:12UTC, commit1948e6978067e23e1ee1f0f25255cb0fe8867cd4. Acrescenta somente ReservaAprovacaoMysqlIT; não altera produção. [Metadados, trecho de log, cenários e limites](marcos-q8-pr34-evidencias.json).

A CI43447037478 executou9testes Q8 com MySQL8.4/Testcontainers,0falhas/erros/ignorados; total66integrações MySQL e261unitários/HTTP aprovados, JaCoCo e JMeter aprovados. Recusas preservam SOLICITADA sem auditoria/notificação de aprovação; conflitos evitados sobrevivem ao rollback; incluem manutenção/reserva/retirada, inatividade, expediente, vínculo e aprovação após espera por lock. Essas provas compartilhadas atendem a lacuna específica registrada na fotografia anterior, sem certificar todas as corridas ou envio externo de notificação.

A CI geral continua failure pelo scanner de autorização/projeto, temporariamente não bloqueante da implementação por orientação de Marcos. Não há novo Quality Gate do #34 declarado. Evidência originada na CI do headfbd2519; nenhuma nova execução local destes testes.

Base documental atualizada por fetch/fast-forward de62cd48f para1948e69, com11documentos copiados e hashes reconferidos antes das edições desta rodada. Sem mudança de produção, sem novo JAR e sem repetir suítes locais; artefatos/provas8/12 e o JAR anterior mantêm sua origem62cd48f. Modificações autorais somente em documentos/evidências, ainda sem commit/push. Restam publicação documental, ratificação contratual/processo dos vínculos e demais referências de provas compartilhadas.


Validação documental desta atualização: **12 arquivos**, **233 links locais existentes**, JSON válido e **56 entradas únicas na File List**. Digests e históricos/pareceres QA preservados; `git diff --check` sem erros. Nenhum diff autoral em produto/testes/CI. Documentação ainda sem commit/push.

## Atualização histórica após os merges #32/#33

#32 recebeu APPROVED de jovemOG-Dev às14:13:36UTC e foi mesclado3e1a2a0 às14:13:46UTC. #33 recebeu APPROVED de Marcos às14:21:11UTC e foi integrado62cd48f às14:21:23UTC. São respectivamente o corretivo de qualidade e a revalidação de aprovação Q8, não a publicação dos documentos locais. [Metadados, digests e testes desta atualização](marcos-fechamento-pos-merge-32-33.json).

Dez documentos locais foram copiados/conferidos por SHA256 antes do fetch/switch. Comparação5569e57→62cd48f alterou somente ReservaService.java e acrescentou ReservaAprovacaoRevalidacaoTest.java, sem sobreposição documental. Branch de trabalho `docs/marcos-fechamento-etapas` criada da develop62cd48f; preservação dos dez arquivos reconferida antes das atualizações desta rodada. Nenhum commit/push foi feito.

JAR anterior preservado, processos próprios identificados/parados e Maven executado com `-Dtest=ReservaAprovacaoRevalidacaoTest -DskipITs package`: **8testes,0falhas/erros/ignorados, BUILD SUCCESS**. JAR novoSHA256 **4b8633a55e59f5f2b5d11865338cb7658eb0f943b50b35d6baa0eb2ebfb0def5**. Ambiente próprio reiniciado e `validar-q9.cjs` aprovado com **12PASS/0FAIL** sobre62cd48f, verificando fontes servidas, escopo/fila, aprovação/rejeição e Q1/Q3 reais.

Os8testes Q8 usam AmbienteFake. Os12cenários reais exercitam o fluxo de aprovação existente; não são prova de todos os novos negativos Q8, locks/rollback em MySQL. Smoke16, consulta8, fechamento11 e frontend81/278 anteriores conservam sua proveniência e não foram novamente executados. Sem alteração autoral de Java/testes/CI. O erro compartilhado do scanner e CodeRabbit indisponível continuam registrados; não se presume novo gate da develop por merge.

**Encerrados:** revisão humana/merge do #32, integração do #33 e sincronização preservada da base. **Restantes:** publicação desta conciliação; ratificação contratual/processo dos vínculos e relação de evidências compartilhadas além do cliente. Nenhuma confirmação nova desses últimos itens foi recebida.

Validação documental pós-merges: **11 arquivos**, **224 links locais existentes**, JSON válido e **55 entradas únicas na File List**. Digests da nova prova e do JAR conferidos; seções QA/históricos preservados e nenhuma credencial privada encontrada nos candidatos. `git diff --check` sem erros; nenhum diff autoral em produto/testes/CI em relação à base62cd48f. Documentação ainda sem commit/push.

## Fotografia histórica anterior aos merges — 13:58:33 UTC

Conferência remota em **13/11/2026, 13:58:33 UTC (10:58:33 em São Paulo)**. Branch local `fix/marcos-qualitygate`, HEAD `5569e574a12d85da6820d131049856df400f3948`. Esta rodada altera somente documentação e registra consultas públicas/conectadas; não executa novamente os testes de produto ou os E2Es.

## Estado confirmado e fontes

| Item | Resultado | Fonte |
|---|---|---|
| PR #28 — frontend de consulta/edição/cancelamento | Mesclado; origem0775715 | [PR #28](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/28) |
| PR #29 — complemento E2E | Mesclado; origem5537163; integra ambos em developa0c0481 | [PR #29](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/29) |
| PRs #30/#31 — Q3/Q1 | Mesclados e contidos na base revalidada | [#30](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/30), [#31](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/31) |
| PR #32 — corretivo | Aberto, Ready for review (draft=false), head5569e57 → developa0c0481; sem merge | [PR #32](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/32) |
| Revisões submetidas no #32 | Zero na consulta; não atribuir revisão de outro integrante | API de reviews via conector GitHub |
| Quality Gate do #32 | OK; confiabilidade/segurança/manutenibilidade A, duplicação nova0%, hotspots revisados100% | [API pública SonarCloud](https://sonarcloud.io/api/qualitygates/project_status?projectKey=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=32) |
| CI e SonarCloud, run43435832752 | Conclusão failure; job JMeter success; testes Java/MySQL/gates JaCoCo success; scanner Maven failure | [Execução](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43435832752) |

Consulta estruturada em [JSON](marcos-fechamento-status-2026-11-13.json). O timestamp indica a fotografia conferida, não monitoramento contínuo nem validação de um futuro commit documental. O endpoint público do gate é filtrado por PR; a associação do head foi conferida no GitHub na mesma rodada.

O log Java do job131920566107 registra **253 testes unitários/HTTP, 57 integrações MySQL, zero falhas e All coverage checks have been met**, antes do scanner retornar **Not authorized or project not found**. A API de jobs confirma o JMeter aprovado. Não foram acessados valores de tokens/secrets nem alteradas configurações, gates ou permissões.

## Orientação vigente do autor

Marcos informou que o erro do scanner Maven ocorre nos PRs de toda a equipe e pediu para desconsiderá-lo por enquanto. Para o fechamento da sua implementação, ele fica como **pendência compartilhada da CI, temporariamente não bloqueante**, com responsável Débora/administrador. O diagnóstico continua registrado e a CI completa não é declarada aprovada. O Quality Gate OK é um resultado distinto do erro de autorização desse scanner.

O PR já estava Ready for review na conferência; nenhuma transição redundante foi executada. Não houve comentário/mensagem/e-mail, solicitação de reviewer, alteração do corpo do PR, commit/push ou merge nesta conciliação. O texto de encaminhamento permanece local. CodeRabbit local continua indisponível conforme registro anterior; não há resultado aprovado presumido.

## Evidências já existentes e limites

- [Revalidação consolidada](marcos-qualitygate-1-consolidacao-resultados.md): 14 unitários de apoio; smoke16/0/0; Q9/Q1/Q3 12/0; consulta8/0; fechamento11/0, com Spring/MySQL/Chrome reais e JAR reconstruído da basea0c0481.
- [Consulta/edição e regressão](marcos-3-consulta-edicao-resultados.md): 81 unitários/278 navegador; fontes frontend/testes preservadas por hashes na consolidação. Não são novas execuções desta rodada.
- [Matriz de fechamento](marcos-fechamento-e2e-1-resultados.md): caminhos mínimos de acesso/pesquisa/reservas/edição/concorrência pontual/movimentações executados; não certifica todas as transições/corridas ou RFs globais.
- [QA da consolidação](../stories/marcos-qualitygate-1.md#qa-results): parecer anterior preservado; esta conciliação não inventa novo veredicto nem aprovação coletiva.

## Pendências que permanecem

| Pendência | Responsável | Evidência necessária |
|---|---|---|
| Revisão do #32 e tratamento da exigência de CodeRabbit | Outro integrante/equipe | Revisão registrada; indisponibilidade tratada conforme regras vigentes. |
| Merge do #32 e sincronização preservada | Equipe / Marcos | Integração autorizada e base local conferida, preservando documentação ainda sem commit. |
| Ratificação contratual | Silva/Fausto/Débora com Marcos | Registro de confirmação de listagem/detalhe/fila, regras multirrecurso e demais propostas contratuais consumidas. |
| Operação dos vínculos | Fausto/Silva com segurança | Processo restrito de concessão/revogação de vínculos reais; V6/autorização já existem. |
| Provas compartilhadas além do cliente | Responsáveis de backend/segurança/infra | Referências concretas de auditoria, notificação e demais critérios; outbox persistida não comprova envio externo. |
| Publicação da conciliação e encerramento formal | Marcos/assistente | Revisão e commit/push da documentação conforme fluxo. |

Não há confirmação nova da equipe recebida nesta rodada. Nenhuma tela, endpoint ou bateria adicional de testes foi criada por inferência. O frontend previsto até a etapa5 está implementado, aceito e integrado; o encerramento formal permanece condicionado às pendências acima. Etapa6/relatórios e certificação global da etapa7 não são declaradas concluídas.

## Validação desta conciliação

Verificação documental concluída: **10 arquivos**, **214 referências Markdown locais existentes**, JSON válido e **54 entradas únicas na File List** da story principal. Há um único checkpoint vigente no plano; os checkpoints históricos e os textos anteriores de entrega/encaminhamento foram preservados, assim como as seções QA das três stories. `git diff --check` sem erros; nenhum diff em backend, testes, dependências ou CI.

Não foram repetidas suítes de aplicação para esta mudança exclusivamente documental. O [plano vigente](../planejamento/marcos-fechamento-etapas-1-a-5.md) identifica passos concluídos e próximos responsáveis; registros históricos permanecem rotulados e resultados antigos conservam suas bases.
