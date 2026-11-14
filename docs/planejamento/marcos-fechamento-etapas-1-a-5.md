# Marcos — plano de fechamento das etapas 1 a 5

## Checkpoint vigente — encerramento integrado em13/11/2026

**Entrega das etapas 1 a 5 integrada à develop e encerrada no escopo de Marcos.** [PR #36](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/36) aprovado por jovemOG-Dev e mesclado em **c4279b6**; contratos/ADR-007, operação dos vínculos, RF11 simulada, evidências e aceite do autor entregues. [Registro verificável](../testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json).

Quality Gate do #36 **OK**; testes Java/MySQL, JaCoCo e JMeter aprovados na CI43472622587. A conclusão global continua failure no scanner Maven por autorização/projeto, com tratamento compartilhado temporariamente não bloqueante da implementação por orientação de Marcos. CodeRabbit local continua indisponível, sem aprovação presumida. Isso não declara toda a CI verde nem certifica requisitos globais/produção.

A base foi sincronizada por fetch e branch documental própria em **c4279b6**, contendo também o [PR #37](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/37). Esse PR acrescenta a porta/projeção/adaptador MySQL do RF12 e7testes de integração aprovados na CI43474698759; **não entrega serviço/agregação, DTO ou endpoint HTTP de relatório**. RF12/etapa6 é continuidade distinta, fora deste encerramento.

Frontend, procedimentos e auxiliares das etapas1a5 permanecem byte a byte como no headbe1dbc7 do #36. A diferença até a base sincronizada contém somente os4arquivos RF12 novos. Não foram repetidos frontend/demo/Maven nem reconstruído JAR nesta conferência; provas8/0,81/278, tentativas e respectivos hashes mantêm suas origens.

Este registro pós-merge é exclusivamente documental. Marcos autorizou seu commit e push; o commit que inclui este checkpoint identifica a entrega na branch `docs/marcos-encerramento-etapas-1-a-5`. A integração desse registro conserva o fluxo de revisão/PR próprio. Não há nova implementação, decisão ou operação local pendente no plano1a5; a aplicação do runbook no ambiente compartilhado e os controles de produção conservam seus registros próprios.


## Checkpoint histórico — decisões e demonstração delegadas

**Aceite do incremento em13/11/2026:** Marcos aprovou os resultados e solicitou o commit local na branch `feature/marcos-fechamento-delegado`. Revisão do autor concluída, sem ajuste solicitado. O commit que inclui este registro identifica a entrega; publicação/PR e integração mantêm seus próximos passos. Os relatos de revisão ainda pendente abaixo conservam a preparação anterior.

Marcos comunicou carta branca da equipe e adotou as decisões do [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Os contratos atuais, incluindo vínculo com todos os recursos, ficam formalizados **por decisão delegada de Marcos**, sem atribuir assinaturas individuais aos demais integrantes. Datas com offset, PATCH conjunto,409/FORA_DO_EXPEDIENTE, estados/perfis de edição/cancelamento e escopos/erros Q9 permanecem como implementados; Q1/Q3/Q8 preservadas.

Processo de vínculos definido no [runbook restrito](../operacao/vinculos-responsaveis.md), com [SQL reutilizável](../operacao/vinculos-responsaveis.sql). Administrador autoriza, operador SQL executa pares explícitos com referência/registro; concessão exige RESPONSAVEL e recurso ativos, revogação remove pares obsoletos e é idempotente.

RF11 adotada no **modo simulado real** previsto no ADR-006: base/processo exclusivos, worker e GatewayNotificacaoPadrao reais, URL vazia, log rastreável e ENVIADA na outbox. Sem envio externo. [Procedimento de demonstração](../operacao/demonstracao-fechamento.md), [story](../stories/marcos-fechamento-delegado-1.md) e [resultados/limites](../testes/marcos-fechamento-delegado-1-resultados.md). A execução local não é implantação no ambiente compartilhado.

As menções anteriores a ratificação por integrante, processo indefinido ou modo RF11 aguardando decisão são históricas e foram superadas por esta delegação. Resultados antigos conservam sua origem. Restam revisão do incremento pelo autor, commit/publicação quando solicitados e revisão/integração dos PRs; não há fechamento global de todos os RFs por inferência.


Conferência atual: **13/11/2026**, America/Sao_Paulo. Responsável: **Marcos Boé**.

**Estado histórico anterior ao merge #36: implementação/cenários mínimos concluídos; entrega ainda em revisão naquela conferência. Estado vigente: encerrado no checkpoint inicial.**

## Checkpoint histórico — publicação, Quality Gate e fechamento

**Alinhamento para publicação:** Marcos autorizou publicar a conciliação e informou que ainda não recebeu confirmações novas. [Pendências por responsável e texto pronto para encaminhar](../integracao/marcos-pendencias-fechamento-2026-11-13.md). Evidências compartilhadas RF10/RF11/segurança agora relacionadas à CI43447037478: auditoria MySQL5, auditoria de usuário1 e controller4; outbox MySQL8 com gateway Mockito; gateway HTTP WireMock5; sessão/segurança/Q9 conforme matriz. Isso comprova os recortes executados, sem transformar gateway de teste em recebimento externo ou ratificação contratual. O modo de demonstração/aceite RF11 ainda exige confirmação da responsável. Commit/push/PR documental autorizados; nenhuma mensagem externa ou merge automático.

**Q8 — complemento MySQL integrado:** [PR #34](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/34), de Silva, aprovado por Marcos e mesclado em **1948e69** em13/11/2026. A [CI43447037478](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43447037478) executou **9 testes Q8 com MySQL8.4/Testcontainers, zero falhas/erros/ignorados**, incluídos nos66testes de integração aprovados;261unitários/HTTP, JaCoCo e JMeter também passaram. A conclusão geral failure permanece pelo scanner compartilhado, temporariamente não bloqueante por orientação de Marcos. [Trechos de log, cenários, metadados e limites](../testes/marcos-q8-pr34-evidencias.json).

A base de trabalho agora é **1948e69** na branch `docs/marcos-fechamento-etapas`, atualizada por fast-forward após preservar/reconferir os11documentos locais. #34 acrescenta somente `ReservaAprovacaoMysqlIT`: sem mudança de produção, sem novo JAR ou reexecução local injustificada. A lacuna específica de evidência Q8 em MySQL (recusas/rollback/auditoria/outbox/conflitos/lock) foi atendida pelos cenários executados na CI da equipe. Isso não certifica toda concorrência nem entrega externa de notificações. Documentação continua sem commit/push.

Frontend das etapas 1 a 5 e complemento E2E integrados à develop. O [PR #32](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/32) foi **aprovado por jovemOG-Dev e mesclado** em **3e1a2a0**; o [PR #33](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/33), de Silva, foi **aprovado por Marcos e mesclado** em **62cd48f**. O #33 revalida disponibilidade antes de aprovar uma reserva (Q8); não publica a conciliação documental local.

Base de trabalho atualizada inicialmente para **62cd48f** na branch **docs/marcos-fechamento-etapas**, preservando por cópia/hash os dez documentos locais. Corretivo e revisão humana do #32 já concluídos; documentação desta rodada ainda sem commit/push. O Quality Gate aprovado do #32 e o erro compartilhado do scanner permanecem registrados com suas origens. Por orientação de Marcos, esse erro não bloqueia sua implementação por enquanto. CodeRabbit local segue indisponível, sem resultado aprovado presumido.

Após o #33, JAR reconstruído e **8 testes unitários Q8 + 12 cenários reais Q9/Q1/Q3 aprovados**. [Evidências da base nova](../testes/marcos-fechamento-pos-merge-32-33.json) e [estado/limites](../testes/marcos-fechamento-status-2026-11-13.md). Testes anteriores mantêm suas bases: não há nova execução de smoke16, consulta8, fechamento11 ou frontend81/278 atribuída a62cd48f. Os oito testes AmbienteFake não certificam MySQL; a evidência complementar agora está no #34/9testes reais da CI, conforme o checkpoint acima.

Evidências compartilhadas disponíveis já relacionadas. Faltam publicação/integração da conciliação, ratificação contratual/processo dos vínculos e confirmação do modo/evidências de aceite RF11. Nenhuma nova tela prevista até a etapa5 foi identificada.

| Passo do plano | Estado atual | Próxima ação |
|---|---|---|
| 1 — preservação/sincronização | Executado após #32/#33/#34 | Base1948e69 e11documentos preservados antes do fast-forward; branch própria de documentação. |
| 2 — regressão consolidada | Executado | Repetir somente por mudança/falha pertinente. |
| 3 — qualidade | #32 aprovado e mesclado; Quality Gate OK | Scanner compartilhado registrado e temporariamente não bloqueante para Marcos. |
| 4 — aceite visual Marcos-4 | Executado | Aceite do autor preservado. |
| 5 — contratos/leituras | HTTP/Q9 implementados e consumidos | Registrar ratificação coletiva e processo administrativo dos vínculos. |
| 6 — consulta/edição/cancelamento | Implementado, aceito e mesclado no #28 | Nenhuma nova tela pendente neste recorte. |
| 7 — backend real | Provas locais8/12 na base62cd48f e Q8/MySQL9/0 na CI do #34 | Q8/MySQL relacionada; restantes evidências compartilhadas mantêm seus responsáveis. |
| 8 — fechamento | Em andamento | Publicar documentação e registrar confirmações da equipe; #32/#33/#34 já integrados. |

Não há nova implementação de frontend prevista até a etapa 5 aguardando início. Ratificação contratual e processo dos vínculos continuam sem confirmação nova. A evidência compartilhada Q8/MySQL foi recebida e relacionada; as demais provas globais mantêm seus responsáveis e limites.

<details>
<summary>Histórico dos checkpoints de 12 e 13/11 — não é lista de pendências atuais</summary>

### Checkpoint histórico — PR corretivo único após os merges, 13/11/2026

PRs#28/#29 mesclados e develop **a0c0481**, incluindo Q3/#30 e Q1/#31. Marcos autorizou consolidar os fixes em `fix/marcos-qualitygate`, revalidar, fazer commit/push e abrir um único PR para develop. Preservadas por cópia/hash as duas árvores locais antes da troca; nenhum conteúdo da equipe foi substituído. Worktree antiga mantida como origem histórica.

JAR reconstruído da base nova e testes reexecutados: **14unitários;16/0/0smoke;12/0Q9/Q1/Q3;8/0consulta;11/0fechamento**. [Relatório/manifesto](../testes/marcos-qualitygate-1-consolidacao-resultados.md) e [encaminhamento à equipe](../integracao/marcos-qualitygate-equipe-2026-11-13.md). Produto/CI permanecem iguais à develop; o corretivo altera auxiliares, testes de desenvolvimento, inventário de evidência e documentação.

Próxima entrega é o PR corretivo, sem reabrir os PRs antigos. QA da base nova e novos checks remotos seguem separados dos pareceres/execuções anteriores. Token/permissão/organização/projeto do scanner Maven ainda exigem conferência da equipe; não se presume gate verde por resultado local. Não fazer merge automático. Checkpoints seguintes preservam o histórico.

### Checkpoint histórico — correções dos PRs #28/#29, 13/11/2026

PR#28 aberto sobre0775715 e PR#29 sobre5537163, ambos com base develop4cea177. Quality Gate anterior reprovou segurança dos auxiliares/metadados; testes Java/MySQL/JaCoCo/JMeter passaram, enquanto o scanner Maven falhou separadamente por autorização/projeto.

Correções locais preparadas nas duas árvores: caminhos absolutos validados, include linear e, no#29, viewport e inventário explícito SHA256. Unitários9/0 no#28 e14/0 no#29; reexecuções reais16/0/0,10/0,8/0 e11/0 na árvore principal, com comuns idênticos. Produto preservado. [Resultados/rastreabilidade](../testes/marcos-qualitygate-1-resultados.md), [recorte #28](../testes/marcos-qualitygate-1-pr28-resultados.md) e [mensagem pronta à equipe](../integracao/marcos-qualitygate-equipe-2026-11-13.md).

Ainda sem novos commits/push/análise remota: não declarar gate verde por testes locais. Débora/administrador confere token/permissão e variables do scanner, sem divulgação de segredo. Publicar correções e conferir novos checks somente pelo fluxo autorizado; revisão/merge e ratificações compartilhadas continuam separados. Os checkpoints seguintes são históricos.

### Checkpoint histórico — complemento real e entrega, 12/11/2026

**Revisão das evidências do complemento aprovada por Marcos**, sem ajustes. [Registro](../testes/marcos-fechamento-e2e-1-aceite-2026-11-12.md). Frontend e complemento de testes têm aceite do autor; próximo passo local é o commit quando solicitado. Publicação, PRs, revisão da equipe, checks e merge continuam separados.

**Commit local solicitado posteriormente por Marcos:** os22arquivos conferidos do complemento acompanham o commit deste registro, na branch `test/marcos-fechamento-e2e`. Identidade de autor/committer conferida como Marcos Boé. Próximo passo após commit é o push do complemento conforme o fluxo; PR do frontend e posterior entrega dos testes seguem a [sequência](../integracao/marcos-fechamento-entrega.md). As descrições anteriores de árvore sem commit conservam o momento da execução dos testes.

Push de **0775715** confirmado no remoto em `feature/marcos-reservas-consulta`; develop conferida em **4cea177**. Ainda não foi encontrado PR desse head. [Sequência de entrega e descrição pronta](../integracao/marcos-fechamento-entrega.md).

Novo incremento em **test/marcos-fechamento-e2e**, sobre0775715, ainda sem commit: **11 PASS/0 FAIL reais**, com login inválido/CSRF, inatividade de sessão, pesquisa paginada/vazia/ocupada, disputa entre sessões, editor após cancelamento externo, devolução com atraso e Administrador leitura/403. Instância temporária identificada/encerrada e principal preservada. [Story](../stories/marcos-fechamento-e2e-1.md), [resultados/matriz/tentativas](../testes/marcos-fechamento-e2e-1-resultados.md). Produto/testes frontend preservados por hashes; build81/278 anterior reutilizado, sem nova execução injustificada.

Os fluxos mínimos listados no passo7 têm evidências nos caminhos executados, relacionadas na matriz nova aos smoke16/0/0, consultas8/0 e Q9/fila10/0 anteriores. Não somar rodadas nem declarar todas as corridas/transições/RFs certificados. **Não há nova tela do Marcos ou GET de reservas aguardando implementação.** O fechamento agora depende da entrega/revisão/checks dos incrementos e das confirmações compartilhadas explicitadas, sem transformar extensões genéricas de testes em requisitos novos.

Próxima sequência: revisão do complemento concluída por Marcos; registrar commit quando solicitado, abrir/acompanhar o PR do frontend já enviado e, após merge/sincronização, entregar os testes no PR próprio. Revisão de outro integrante, CodeRabbit/CI/Sonar, ratificação coletiva e processo de vínculos permanecem com a equipe. Notificação externa e provas globais de backend mantêm responsabilidades próprias.

Os registros seguintes preservam cada momento anterior; este checkpoint define o estado atual.

### Checkpoint histórico — consulta, edição e cancelamento, 12/11/2026

Marcos confirmou push da integração **f9c4912**, que inclui develop **4cea177** e os PRs #26/#27. Nova branch **feature/marcos-reservas-consulta** criada dessa base. Marcos informou que os testes funcionaram, aprovou o incremento e autorizou commit local. [Aceite](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md), [story](../stories/marcos-3-consulta-edicao.md) e [resultados, hashes e capturas](../testes/marcos-3-consulta-edicao-resultados.md). O commit que inclui esse registro identifica a entrega local; publicação ainda separada.

- Passo 5: GETs, projeções, fila e Q9 disponíveis e testados; não há mais bloqueio de ausência dessas leituras. Ratificação coletiva das regras e processo de vínculos permanecem separados.
- Passo 6: página **Reservas** dos três perfis, filtros/paginação, detalhe autorizado, edição completa sem perda de recursos/precisão e cancelamento implementados, testados e aceitos visualmente por Marcos. Commit local solicitado; regressão81/278 e E2E8/0 preservados.
- Passo 7: complemento da interface validado com Spring/MySQL reais, além do smoke geral. Q9/fila anterior 10/0 preservado. As suítes não comprovam toda a matriz: timeout, concorrência, todos os estados/prazos e entrega externa continuam separados.
- Próximo checkpoint após o commit solicitado: publicar a branch e preparar PR próprio conforme solicitação; revisão de outro integrante e checks remotos seguem o fluxo combinado. Scanner Sonar, ratificação coletiva, gestão administrativa dos vínculos e cenários integrados restantes exigem continuidade/alinhamento da equipe.

Os relatos de base/árvore/PRs abaixo conservam o histórico. Esta seção e os resultados novos definem o estado vigente; expressões anteriores de GET ausente, PR #27 aberto ou integração ainda sem commit não descrevem a base f9c4912.

**Aceite mais recente:** Marcos aprovou visualmente a fila real posterior ao PR27 e solicitou o commit local em12/11. [Registro](../testes/marcos-integracao-q9-1-aceite-visual-2026-11-12.md). Integração10/0Q9+16/0/1smoke pronta para registro na branch própria; fontes anteriores de testes preservadas. Próximo recorte funcional: interface geral de reservas. Revisão da equipe, gestão de vínculos, ratificação coletiva e Sonar separados; nenhum push/PR autorizado por essa confirmação.

**Atualização vigente após merge do PR #27:** develop `4cea177`, incorporada sem commit à `feature/marcos-integracao-q9`, preservando `8c21a43` e o trabalho local. JAR novo e fila/Q9 revalidados: **10/0 Q9, 16/0/1 smoke**. [Preservação, provas e limites](../testes/marcos-integracao-q9-1-pr27-resultados.md). GETs e fila disponíveis; próximo recorte é a interface geral de reservas. Revisão visual deste incremento, ratificação coletiva/processo de vínculos e scanner Sonar continuam pendentes. Os estados anteriores abaixo são históricos; #27 não está mais aberto.

**Estado atual após PR #26:** push de `8c21a43` confirmado; develop avançou para `3f2a9a3`. Branch `feature/marcos-integracao-q9` com merge local preparado sem commit. GETs e fila reais agora disponíveis: 8 cenários Q9 aprovados, smoke 16/0/1 e V6 aplicada só na instância isolada. [Resultados](../testes/marcos-integracao-q9-1-resultados.md). Marcos aceitou consumir vínculo com todos os recursos; falta ratificação dos demais. O bloqueio de ausência de endpoints foi superado; passo 6 (interface geral), revisão/aceite deste incremento, processo de vínculos e Sonar continuam abertos. Os diagnósticos de endpoints ausentes abaixo preservam a conferência anterior em da5881b.

Atualização após o merge do **PR #24** em 12/11/2026: develop `da5881b`, conferida por fetch e usada na nova branch `fix/marcos-qualidade-frontend`. O #23 já havia sido mesclado em `23cf839`. Ambos não aguardam outro merge. Marcos autorizou preparar ambiente local e confirmou que não recebeu contratos novos de leitura.

Avanço local: duas ordenações explicitadas, FE-004 corrigido, build final com **72 unitários/240 navegador** e smoke real com **16 PASS/0 FAIL/1 BLOQUEADO**. [Qualidade/CI](../testes/marcos-qualidade-1-resultados.md), [datas](../testes/marcos-integracao-datas-1-resultados.md), [ambiente/E2E](../testes/marcos-e2e-local-2026-11-12-resultados.md), [handoff](../integracao/marcos-pendencias-2026-11-12.md). Marcos deu [aceite visual do incremento no Chrome com backend real](../testes/marcos-qualidade-aceite-visual-2026-11-12.md). Mudanças novas ainda sem commit; autorização de commit e aprovação remota são separadas. Passos 3 e 7 avançaram parcialmente; passos 5, 6 e encerramento integrado continuam abertos.

Este plano foi solicitado por Marcos após a conferência do repositório e dos trabalhos realizados em casa. Consolida a ordem de execução, as dependências da equipe e as condições para encerrar as responsabilidades das etapas 1 a 5. Não cria endpoints, regras de negócio, prazos ou stories de implementação por inferência.

**PR #27 comunicado depois da validação:** conferido aberto, head7fe9fe0 sobre develop3f2a9a3. Complementa o #26 conectando a fila ao caso de uso/adaptador existente e centralizando o filtro Q9, mantendo contrato externo. Ainda não foi importado à branch local. [Comparação, CI e condição de integração](../testes/marcos-integracao-q9-1-resultados.md#complemento-anunciado-pr-27-ainda-aberto). Após integração, conciliar contrato/evidências e repetir a validação real; não atribuir a ele os testes locais do #26 nem declarar resolvido o scanner Maven por seu check Sonar separado ter passado.

A preparação original deste arquivo incluiu somente leitura do checkout e consulta ao GitHub. Posteriormente Marcos pediu “vamos fazer a sincronização”: plano preservado por cópia/hash, fetch executado, branch Marcos-4 trazida para este computador e develop 23cf839 incorporada sem conflitos. Lint/typecheck e regressão 68 unitários/238 navegador aprovados; frontend/testes/configuração preservados. [Execução e limites](../testes/marcos-sincronizacao-2026-11-12-resultados.md). O usuário enviou a8da77c e o PR #24 foi conferido com esse commit e destino develop. Depois informou [aceite visual](../testes/marcos-4-aceite-visual-2026-11-12.md) da prévia com dados fictícios. Os passos 3 e 5 a 8 continuam pendentes; a publicação deste novo registro documental é separada.

</details>

## 1. Resultado que buscamos

Concluir os fluxos de acesso, pesquisa, reservas, aprovação e administração/movimentação previstos até a etapa 5, com implementação do frontend, aceite de Marcos, evidências reproduzíveis e entrega integrada revisada.

Há três estados distintos a registrar durante o trabalho:

| Estado | O que comprova |
|---|---|
| Implementado e validado localmente | Código do cliente funciona nas verificações executadas, inclusive testes com API controlada. |
| Aceito e pronto para revisão | Marcos validou o incremento; código, story, documentação e evidências estão preparados para revisão. |
| Entregue de forma integrada | Fluxos funcionam com backend real, revisões/checks exigidos foram atendidos e os PRs pertinentes chegaram à develop. |

O complemento da etapa 3 foi aceito visualmente e integrado pelo #28; o complemento E2E foi integrado pelo #29. Marcos-4 e etapa 5 também estão integradas. O corretivo #32 recebeu revisão humana e foi mesclado. A base62cd48f inclui a Q8 do #33, conferida em testes direcionados; ratificação coletiva, rastreabilidade compartilhada e publicação documental mantêm o encerramento formal em andamento.

Relatórios da etapa 6 ficam fora deste plano. O E2E aqui previsto comprova os fluxos das etapas 1 a 5 e alimenta as evidências finais do projeto; não declara toda a etapa 7 concluída antecipadamente.

## 2. Fotografia do repositório usada no planejamento

Fotografia histórica anterior à sincronização e ao merge #24. As branches/commits e a comparação abaixo identificam aquela preparação, não instruções atuais para mudar de branch. Checkout desta conciliação: `docs/marcos-fechamento-etapas` em `1948e69`, atualizado da develop após #34. Preservação por cópia/hash: dez documentos antes de #32/#33 e onze antes de #34; nenhum código autoral alterado.

| Local / branch remota | Commit conferido | Papel no trabalho |
|---|---|---|
| Checkout deste computador: feature/marcos-movimentacoes | f7360a2 | Árvore limpa antes da criação deste plano; contém o trabalho anterior feito aqui. |
| origin/feature/marcos-movimentacoes, consultada pelo GitHub | 8ad75af | Já avançou em relação ao checkout local. |
| feature/marcos-5-administracao-recursos | 8df312e | Referência da entrega de administração/movimentações já mesclada pelo PR #23. |
| feature/marcos-4-aprovacoes | df57063 | Reúne todo o frontend já implementado das etapas 1 a 5; origem do PR #24. |
| develop | 23cf839 | Inclui a base frontend, o adaptador SQL da fila (#22), administração e movimentações (#23). |

As referências `origin/*` existentes no computador ainda podem estar antigas: a conferência remota foi feita pela integração GitHub, sem executar fetch neste checkout.

Na comparação após o merge do #23, a Marcos-4 df57063 e a develop 23cf839 têm três commits exclusivos de cada lado, com base comum 8df312e. Incorporar a develop atual na Marcos-4 faz parte da preparação; o destino do PR #24 já está correto e não precisa de novo retarget neste momento.

### PRs e dependências — fotografia anterior aos #26 a #32

| PR | Situação observada | Consequência |
|---|---|---|
| [#19 — base frontend](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/19) | Mesclado na develop. | Base de comunicação, acesso, pesquisa e criação já chegou à integração. |
| [#20 — administração](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/20) | Mesclado na branch intermediária da base frontend. | Seu merge isolado não entregou a administração à develop. |
| [#21 — movimentações](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/21) | Mesclado na branch administrativa. | Movimentações foram reunidas à administração. |
| [#23 — administração e movimentações](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/23) | Mesclado na develop em 12/11/2026; commit de integração 23cf839. | Administração e movimentações chegaram à develop; conferir qualidade pós-merge e integração real. |
| [#24 — Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/24) | Mesclado na develop em 12/11/2026; da5881b. | Cliente da fila integrado; contrato HTTP/autorização e E2E ainda pendentes. |

Os PRs #23/#24 estão integrados. Aprovação, checks, validação real e merge são condições distintas; os merges não comprovam aprovação Sonar ou E2E completo. Na develop da5881b, testes Java/MySQL e cobertura passaram; o scanner falhou depois por autorização/projeto.

Conferência atual: #26/#27 entregaram leituras/Q9; #28/#29 estão mesclados; #30/#31 trouxeram Q3/Q1 e foram revalidados. #32 foi aprovado por outro integrante e mesclado; #33/Q8 e #34/testes MySQL também aprovados/mesclados. [Fotografia anterior à integração](../testes/marcos-fechamento-status-2026-11-13.json) e [evidência atual](../testes/marcos-fechamento-pos-merge-32-33.json).

### Testes já registrados

| Árvore / incremento | Unitários | Navegador | Limite da evidência |
|---|---:|---:|---|
| Administração original | 45 | 130 | Frontend isolado, com aceite visual de Marcos. |
| Administração + movimentações | 57 | 190 | Frontend isolado, com aceite visual e reexecução de Marcos. |
| Marcos-4 conciliada com os anteriores | 68 | 238 | Frontend isolado, com reexecução de Marcos; aceite visual posterior registrado em 12/11, na versão a8da77c. |

As contagens são cumulativas dentro de cada árvore, não devem ser somadas. Foram conferidas nas evidências publicadas, sem nova execução durante a preparação deste plano. São referências para a regressão, não metas fixas: novas contagens devem refletir os testes efetivamente executados e as mudanças realizadas.

## 3. O que falta em cada etapa

| Etapa | Implementação/validação efetivas | Fechamento restante |
|---|---|---|
| 1 — comunicação com a API | Sessão/CSRF, erros, correlationId e envio único integrados; contratos atuais adotados por delegação. | Revisar/publicar o incremento delegado; #32 mesclado. |
| 2 — acesso e navegação | Login/logout/me, perfis, expiração real e navegação validados; aceite registrado. | Revisão/registro final; nenhuma nova tela prevista. |
| 3 — pesquisa e reservas | Pesquisa/criação e consulta/detalhe/PATCH/cancelamento integrados pelo #28; contratos adotados no ADR-007. | Revisar/publicar o registro delegado e sua evidência. |
| 4 — fila e decisões | Interface/HTTP/Q9 integradas; regra multirrecurso adotada e operação dos vínculos demonstrada. | Revisar o procedimento/prova local e publicar o incremento; não aguardar novas assinaturas das decisões delegadas. |
| 5 — recursos e movimentações | Administração/movimentações #23 integradas; FE-004 entregue; testes de prazo/atraso/perfis realizados. | Publicar conciliação e relacionar evidências compartilhadas; corretivo mesclado. |

Q9 está decidida como política e implementada no servidor: Solicitante consulta próprias reservas, Responsável exige vínculo com todos os recursos e Administrador consulta todas. A regra multirrecurso foi adotada sob delegação de Marcos no ADR-007 e o processo administrativo dos vínculos foi definido/demonstrado. Q3 impede autoaprovação; Q1 restringe início/conclusão/ausência ao Responsável. Consulta não concede escrita.

## 4. Responsabilidades e organização das mudanças

| Frente | Marcos / assistente | Participação da equipe |
|---|---|---|
| Frontend e evidências | Clientes JS, telas, mensagens, confirmação, acessibilidade básica, testes e documentação. | Revisão de outro integrante e confirmação dos contratos. |
| Reservas e exposição HTTP | Consumir os contratos confirmados e informar o necessário para os formulários. | Silva: regras/serviço e exposição dos contratos de reservas, em coordenação com a equipe. |
| Persistência e projeções de leitura | Conferir o uso dos dados e preservar a identificação correta na interface. | Fausto: leitura SQL, paginação, vínculos e projeções, em coordenação com Silva. |
| Segurança, eventos e qualidade compartilhada | Validar comportamento do cliente e apresentar evidências dos próprios fluxos. | Débora: autorização real, sessão, auditoria/notificação e configuração/qualidade da CI, com revisão da equipe. |
| Aceite visual | Marcos testa os fluxos no Chrome; assistente prepara e registra a evidência. | Não substitui revisão de outro integrante. |

São responsabilidades de integração, não autorização para enviar mensagens à equipe ou modificar componentes de terceiros automaticamente.

### Onde cada alteração deve entrar

A referência de integração é a develop. O corretivo #32 está mesclado. A conciliação foi preservada e trazida para `docs/marcos-fechamento-etapas`, agora sobre develop1948e69, incluindo #33/#34. Não publicar nas branches/PRs já fechados. Mudanças autorais limitadas a documentos/evidências, sem commit/push automáticos. Nova implementação só se houver requisito ou defeito concreto.

## 5. Passo 1 — preservar o estado local e sincronizar a base

**Objetivo:** trazer o trabalho de casa e sincronizar a Marcos-4 diretamente com a develop que já contém administração e movimentações.

**Responsáveis:** Marcos e assistente; operações Git/GitHub pelo fluxo AIOX correspondente. Nenhuma publicação ou merge remoto está incluído na criação deste plano.

### Ações

1. Conferir branch, alterações e commits locais. A criação deste plano deixará um arquivo novo; preservá-lo, junto de qualquer outra alteração que apareça antes da execução.
2. Atualizar as referências do remoto com fetch e conferir novamente os PRs. Fetch atualiza referências; não incorpora sozinho as mudanças aos arquivos de trabalho.
3. Trazer a branch Marcos-4 para este computador, caso ainda não exista, ou sincronizá-la com sua origem remota. Se houver divergência local, examinar os commits antes de decidir a integração; preservar o trabalho existente.
4. Incorporar a develop atualizada à Marcos-4, preparando uma mudança revisável. Conciliar documentação/RTM por conteúdo e preservar as evidências anteriores. Não é mais necessário passar pela branch administrativa como etapa anterior.
5. Conferir a árvore resultante e validar as alterações relevantes. Registrar eventuais commits de integração conforme o fluxo de aceite/commit já combinado.
6. Conferir que Aprovações, Gestão e Movimentações continuam presentes e que os atalhos respeitam os perfis; confirmar que o #24 continua apontando à develop.

Comandos iniciais de referência, a executar individualmente, conferindo cada resultado:

```powershell
git status --short --branch
git branch -vv
git fetch origin
```

Para acessar a Marcos-4 depois do fetch, escolher somente a situação correspondente:

```powershell
# Se a branch ainda não existir localmente:
git switch --track origin/feature/marcos-4-aprovacoes
```

```powershell
# Se já existir localmente:
git switch feature/marcos-4-aprovacoes
```

Os comandos de switch não substituem a incorporação da develop descrita acima. Conferir estado e diferenças antes de cada merge; um merge também pode criar commit. Se houver erro ou conflito, resolver essa condição antes de continuar a sequência. Não reescrever os commits publicados como rotina de sincronização.

### Critério de saída

- [x] Plano e outras alterações locais preservados.
- [x] Referências remotas e situação dos PRs conferidas novamente.
- [x] Marcos-4 disponível localmente e sincronizada com sua origem remota antes da incorporação local.
- [x] Develop 23cf839 incorporada à Marcos-4 sem conflitos.
- [x] Comparação com a develop preserva o escopo da Marcos-4; sincronização a8da77c enviada pelo usuário e conferida no PR #24, destino develop.
- [x] Branch, commits de origem e resultados da conferência registrados nas evidências; commit resultante consultável no histórico Git.

## 6. Passo 2 — validar o conjunto consolidado

**Objetivo:** estabelecer uma base reproduzível para novas alterações, antes de investigar regressões ou ampliar os fluxos.

1. Conferir a branch e os arquivos efetivos no checkout consolidado.
2. Conferir Node/npm, dependências já instaladas e o navegador disponível. Instalar dependências somente se necessário; preservar package.json e lockfile quando não houver mudança justificada.
3. Executar o build do frontend. No package.json atual, ele já inclui lint, typecheck, testes unitários e testes de navegador; não é necessário executar todas essas suítes novamente em sequência só para repetir o mesmo resultado.
4. Comparar os cenários executados à evidência anterior de 68/238. Investigar qualquer ausência de suíte, falha ou alteração de contagem antes de atribuir sucesso ao conjunto.
5. Registrar comando, ambiente, branch/commit, resultados reais e limites da execução.

No PowerShell, com o Chrome instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run build
```

No CMD:

```bat
set "PLAYWRIGHT_CHANNEL=chrome"
npm run build
```

Se o ambiente não tiver o Chrome configurado, conferir o navegador disponível e a configuração do Playwright antes de adotar o comando. Não aumentar timeout/retries para transformar uma falha não investigada em aprovação.

### Critério de saída

- [x] Lint e typecheck aprovados.
- [x] Unitários e navegador aprovados: 68/238, zero falhas/ignorados/flaky/retries.
- [x] Administração, movimentações e fila presentes na mesma regressão.
- [x] Evidências vinculadas à árvore efetivamente testada, com origens e preservação dos 45 arquivos conferidas.

Depois disso, repetir testes somente quando alterações, falhas ou uma preocupação nova justificarem. Atualizações exclusivamente documentais exigem conferência dos documentos, não uma nova suíte completa por rotina.

## 7. Passo 3 — acompanhar a qualidade após a integração do PR #23

**Objetivo:** compreender e tratar as pendências de qualidade que permaneceram após a integração de administração/movimentações. O #23 já foi mesclado; eventuais correções seguem por novo incremento, sem aguardar outro merge desse PR.

Na conferência anterior ao merge, em 12/11:

- A etapa de unitários/integração MySQL e gates JaCoCo passou no job Java.
- O job JMeter passou.
- A etapa Maven de análise Sonar falhou.
- O check separado `SonarCloud Code Analysis` falhou com `D Reliability Rating on New Code`, exigência A, e duas anotações.
- O PR relata apontamentos de ordenação em administracao-recursos.js, nas posições 113 e 162 da versão analisada. Reabrir as anotações atuais e conferir as linhas antes de editar.

Após o merge, a [CI da develop 23cf839](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43229810267) também concluiu com falha: a etapa de unitários/integração MySQL/gates passou e o job JMeter passou, mas a etapa de análise Sonar falhou. O merge não elimina essas pendências nem substitui sua investigação.

Essas falhas precisam ser examinadas separadamente. A descrição do PR menciona erro de autorização/projeto no scanner; isso não comprova sozinho uma causa ligada ao plano do serviço. As anotações também não são, por si, prova de defeito funcional.

### Ações

1. Ler os logs da develop atual e as anotações anteriores, conferindo a versão analisada e se os apontamentos permanecem aplicáveis.
2. Revisar as funções de comparação/canonicalização afetadas. Definir a correção ou o tratamento fundamentado do apontamento sem alterar silenciosamente a semântica.
3. Executar os testes adequados à alteração e a regressão pertinente; acrescentar cenário somente se houver comportamento relevante ainda não coberto.
4. Com Débora, conferir separadamente configuração, credenciais/permissões do scanner e requisitos do projeto no Sonar.
5. Atualizar a story correspondente, File List e evidências; preparar a descrição de eventual novo PR, distinguindo testes aprovados de checks ainda pendentes.
6. Após commit/publicação pelo fluxo combinado, conferir os checks no novo SHA e obter revisão da equipe para a correção.

Não retirar gates nem mudar a base para main apenas para evitar uma verificação. Eventual alteração de CI precisa tratar a causa e ser revisada no escopo apropriado.

### Critério de saída

- [x] Duas ordenações analisadas/corrigidas preservando semântica; build 70/238 e posterior 72/240 aprovados, com hashes e limites.
- [x] Falha do scanner identificada e registrada com responsável: Débora/administrador da CI. Marcos determinou não bloquear sua implementação por esse erro compartilhado enquanto a equipe o trata.
- [x] Quality Gate do commit 5569e57 / PR #32 confirmado OK; testes Java/MySQL/JaCoCo/JMeter aprovados. CI completa failure preservada; CodeRabbit indisponível e revisão independente seguem no item seguinte.
- [x] Revisão de outro integrante do #32 confirmada: jovemOG-Dev APPROVED, seguida de merge3e1a2a0. CodeRabbit local continua indisponível; revisão humana/merge não são execução dessa ferramenta.

## 8. Passo 4 — concluir o aceite visual da Marcos-4

**Objetivo:** registrar a conferência do autor para a interface conciliada, separadamente dos testes automatizados.

Pode avançar enquanto a equipe conclui o backend e as pendências de qualidade pós-merge são tratadas.

### Roteiro no Chrome

1. Abrir Aprovações com perfil Responsável e identificar o ambiente: simulado ou real.
2. Aplicar e limpar filtros, conferir paginação, vazio, carregamento e erro.
3. Abrir uma solicitação e conferir solicitante, período e identificação dos recursos.
4. Aprovar uma solicitação com confirmação explícita.
5. Rejeitar outra com motivo obrigatório e confirmar a atualização da fila.
6. Conferir conflito ou decisão já realizada, preservação do contexto e atualização sem reenvio automático.
7. Conferir teclado, foco, mensagens e layout em desktop e móvel.
8. Conferir que Solicitante/Administrador não recebem ações de decisão e que Gestão/Movimentações mantêm seus atalhos por perfil.

Se a API real ainda não estiver pronta, a prévia controlada deve ser identificada como fictícia e permanecer fora do produto. `npm run preview` serve arquivos estáticos; não cria sessão nem fornece o GET da fila.

### Critério de saída

- [x] Marcos informou “está aprovado” após a prévia da interface conciliada/sincronizada e o roteiro apresentado.
- [x] Nenhum ajuste funcional solicitado na confirmação do aceite; produto e testes permaneceram preservados.
- [x] Aceite/contexto/limites registrados na story e nas evidências; capturas automatizadas anteriores preservadas, sem atribuir E2E ao teste simulado.

## 9. Passo 5 — consolidar os contratos e dependências da leitura

**Objetivo:** permitir a integração da fila e a implementação do restante da etapa 3 sem criar expectativas fictícias de API.

### O que já está decidido

- Solicitante consulta suas próprias reservas e estados.
- Responsável consulta reservas de recursos sob sua responsabilidade, incluindo solicitações que deve avaliar.
- Administrador consulta todas para administração e acompanhamento.
- Consulta de disponibilidade é distinta da exposição dos dados completos das reservas.
- Direito de leitura não concede novas ações de escrita.

Não reabrir essa decisão de escopo. Precisamos traduzi-la em contrato e implementação verificáveis.

### Entregas a conferir com a equipe

| Necessidade | O que precisa ficar explícito | Responsáveis pela integração |
|---|---|---|
| Listagem de reservas | Rota, filtros, ordenação, paginação/total, DTO mínimo e escopo aplicado no servidor. | Silva, Fausto e Débora; Marcos revisa o consumo. |
| Detalhe para edição | Leitura da reserva completa autorizada; período, todos os recursos, estado e campos necessários para preencher o formulário. | Silva/Fausto e Débora. |
| Fila de aprovação | Rota definitiva ou uso ratificado de status=SOLICITADA, projeções, filtros, paginação e erro de parâmetros. | Silva/Fausto, com revisão de segurança. |
| Escopo do Responsável | Origem do vínculo responsável/recurso, seleção no servidor e tratamento de reservas com múltiplos recursos. | Equipe de backend/segurança. |
| Identificação e erros | Dados mínimos do solicitante, projeção de professor/competências se necessária e convenção 403/404 fora do escopo. | Débora e responsáveis pelos contratos. |

Na fotografia original esses GETs ainda eram propostas. Agora `GET /api/reservas` e `GET /api/reservas/{id}` estão entregues, documentados em [consultas](../api/reservas-consulta-contrato.md) e testados com Q9/fila reais após #26/#27. Não aguardar novamente essa entrega. Ratificação coletiva e processo de concessão dos vínculos ainda precisam de registro da equipe.

Marcos deve fornecer exemplos de consumo, conferir DTOs e registrar o aceite do frontend. Filtros do navegador não substituem a delimitação de escopo no servidor. Nenhuma mensagem foi enviada à equipe ao elaborar este plano.

### Critério de saída

- [x] Contratos de listagem/detalhe/fila adotados por decisão delegada de Marcos no ADR-007, sem assinatura individual atribuída à equipe.
- [x] Exemplos de sucesso, vazio, parâmetros inválidos, sessão ausente e acesso fora do escopo registrados nas evidências Q9/fila.
- [x] Implementação HTTP, leitura e autorização disponíveis para os fluxos a integrar.
- [x] Consumo relaciona cada campo/ação ao contrato, sem inventar identidade ou permissão no cliente; ratificação coletiva segue na linha anterior.

Com contratos estáveis, o frontend pode avançar com testes isolados enquanto a equipe conclui a integração. O fechamento integrado permanece condicionado ao backend real.

## 10. Passo 6 — implementar o restante da etapa 3

**Objetivo:** completar a interface de reservas existentes: consultar, editar e cancelar conforme contrato.

Story [Marcos-3-consulta-edicao](../stories/marcos-3-consulta-edicao.md) preparada antes do código; implementação de origem sobre f9c4912, aceite visual registrado em 12/11 e entrega integrada pelo PR #28. [Resultados de origem](../testes/marcos-3-consulta-edicao-resultados.md) e [aceite](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). As ações abaixo são o roteiro já executado.

### Ações

1. Partir de uma base que contenha o frontend consolidado e os contratos ratificados. Se os PRs anteriores já tiverem chegado à develop, usar a develop atualizada; caso contrário, manter a dependência explícita do novo incremento.
2. Implementar a listagem com os filtros e a paginação efetivamente contratados, incluindo carregando, vazio, erro e informações mínimas por perfil.
3. Para edição, carregar a reserva completa pela leitura autorizada antes de habilitar o formulário. Preservar todos os recursos e os valores não alterados.
4. Reenviar `inicio`, `fim` e `recursosIds` juntos no PATCH, como exige o contrato existente; não enviar solicitante, papel ou estado como identidade do ator.
5. Aplicar estados editáveis e permissões confirmados no contrato, mantendo a decisão final no servidor. Receber dados de consulta não implica poder editá-los.
6. Para cancelamento, apresentar alvo e confirmação; atualizar a interface somente após resposta coerente de sucesso. Preservar histórico e não apresentar remoção física como resultado.
7. Tratar conflito, transição inválida, sessão expirada, dados alterados por outro operador e resposta incerta, sem repetição automática de escrita.
8. Manter datas em America/Sao_Paulo por conversão explícita, CSRF dinâmico, texto seguro, referência de suporte, envio único, foco e responsividade.
9. Executar verificações relevantes, regressões e revisão visual; atualizar story, File List, documentação de consumo e RTM.

### Critério de saída

- [x] Listagem usa contrato entregue e escopo aceito por Marcos; ratificação coletiva acompanhada no passo 5.
- [x] Edição inicia por detalhe autorizado completo e envia o PATCH conjunto.
- [x] Cancelamento confirmado e estados/erros coerentes com a API nos cenários executados.
- [x] Regressão preserva criação, fila, administração e movimentações.
- [x] Testes/evidências e aceite registrados; commit 0775715 publicado e integrado pelo #28. Correções dos auxiliares/evidências também integradas no #32.

## 11. Passo 7 — validar com backend real

**Objetivo:** substituir a suposição de compatibilidade por provas dos fluxos integrados das etapas 1 a 5.

Preparação autorizada/realizada em 12/11: ferramentas portáteis, MySQL novo e Spring próprios; [guia](../integracao/marcos-e2e-local.md). Smoke atualizado sem bloqueio de interface geral e complemento real de edição/cancelamento aprovados; [evidências](../testes/marcos-3-consulta-edicao-resultados.md). Os caminhos mínimos da tabela já possuem evidências na matriz do complemento E2E integrado pelo #29 e na revalidação posterior. Permanecem limites e provas compartilhadas, não novos cenários mínimos presumidos.

### Preparação

1. Conferir JDK 21, Maven ou wrapper efetivamente disponível, MySQL e a execução documentada do backend. A disponibilidade dessas ferramentas na máquina de casa não comprova a configuração deste computador.
2. Preparar banco e dados de teste isolados, com migrações e configuração reproduzíveis; usar os três perfis e o vínculo de recursos definido pela equipe.
3. Conferir provedores reais de sessão, eventos e demais dependências antes de ativar APIs no ambiente de teste. Não habilitar flags com provedores vazios nem alterar padrões de produção apenas para a demonstração.
4. Preparar reservas e recursos com horários compatíveis com o relógio real, o expediente e os estados exigidos. Os IDs e datas fixos das fixtures não são dados reais do ambiente integrado.
5. Executar o frontend na mesma origem do backend, conferindo cookies, CSRF e contratos reais. Não interceptar a API nos cenários identificados como E2E.

### Cenários mínimos de fechamento

| Área | Prova integrada esperada |
|---|---|
| Acesso | Login correto/incorreto, me, logout, sessão expirada e CSRF nas escritas. |
| Pesquisa | Filtros/período, paginação, recursos indisponíveis, vazio e expediente verdadeiro. |
| Reserva comum/restrita | Criação e estados retornados; conflito preserva contexto e informa a falha sem expor outro solicitante. |
| Consulta/Q9 | Próprias reservas do Solicitante; escopo de recursos do Responsável; consulta administrativa; negativa real fora do escopo. |
| Edição/cancelamento | Detalhe, PATCH completo, confirmação, estados permitidos e tratamento de conflito/alteração concorrente. |
| Aprovação/rejeição | Fila real no escopo autorizado, filtros/página, decisão exclusiva de Responsável, motivo e atualização. |
| Administração | Tipos de recursos, GET antes de PUT completo, desativação, manutenção e expediente com confirmação. |
| Movimentações | Retirada elegível, pendência após o prazo, devolução confirmada e atraso final da API; Administrador somente em leitura. |
| Erros e uso da interface | correlationId, ausência de sucesso falso/reenvio automático, preservação em falhas, teclado, foco e larguras móvel/desktop. |

Provas de segurança, persistência, auditoria, notificação e concorrência pertencem também às entregas da equipe. Marcos confere o comportamento do cliente e referencia as evidências apropriadas; uma mensagem de sucesso no navegador não comprova esses mecanismos sozinha.

### Critério de saída

- [x] Ambiente/dados/comandos locais documentados; credenciais e ferramentas ignoradas pelo Git.
- [x] Cenários mínimos executados com backend real nos caminhos da matriz de fechamento, separados dos controlados; provas e limites no complemento11/0.
- [x] Resultados parciais, FE-004, correção, data/ambiente e hashes da árvore sem commit registrados.
- [x] Evidência compartilhada Q8 relacionada: ReservaAprovacaoMysqlIT,9/0 na CI do #34; recusas/rollback, auditoria/outbox, conflitos e espera pelo lock nos cenários executados.
- [x] Relacionar provas compartilhadas disponíveis de auditoria, outbox/processamento, gateway HTTP controlado e segurança à CI43447037478; limites de mock, WireMock, implantação e contagens explícitos.
- [x] Modo RF11 simulado adotado sob delegação de Marcos e demonstrado com worker/gateway reais na base exclusiva; log/outbox rastreáveis, sem entrega externa.

## 12. Passo 8 — revisão, merges e encerramento das etapas 1 a 5

1. Registrar #32 aprovado/mesclado, #33/Q8 integrado e #34/9testes MySQL aprovados na CI e mesclados na develop1948e69. Não reabrir esses PRs.
2. Preservação e sincronização executadas: branch documental própria agora sobre1948e69, onze documentos íntegros antes do fast-forward. Publicar a conciliação somente após revisão/commit/push conforme fluxo.
3. Provas locais8/0Q8 e12/0Q9 mantêm base62cd48f/JAR; complemento compartilhado9/0Q8/MySQL refere-se ao headfbd2519 do #34. Relacionar as origens sem somar ou reatribuir execuções.
4. Registrar Quality Gate do #32 aprovado e scanner compartilhado temporariamente não bloqueante para Marcos; não presumir CI completa verde nem novo gate da develop. CodeRabbit permanece com indisponibilidade registrada.
5. Decisões contratuais e processo dos vínculos registrados no ADR-007 por delegação de Marcos; revisar/publicar os procedimentos e provas locais. Ambiente compartilhado aplica seu próprio registro operacional autorizado.
6. Relacionar provas compartilhadas de auditoria/notificação/segurança/concorrência às exigências concretas; persistência em outbox não comprova entrega externa.
7. Publicar documentação/RTM/stories e registrar encerramento formal sem atribuir confirmação coletiva ou cobertura global por inferência.

### Critério de encerramento

- [x] Frontend previsto até a etapa 5 implementado, aceito pelo autor e integrado à develop.
- [x] Leituras/operações e Q9 validadas nos caminhos reais registrados.
- [x] Cenários mínimos e complemento E2E entregues pelo #29; revalidação da base com Q1/Q3 registrada.
- [x] Corretivo #32 aprovado por outro integrante e integrado; Quality Gate do PR OK.
- [x] Conciliação documental local preparada; históricos/limites preservados e novas provas8/12 identificadas separadamente.
- [x] Revisão humana do #32 concluída; indisponibilidade de CodeRabbit mantida explícita, sem aprovação presumida da ferramenta.
- [x] #32/#33/#34 integrados à develop; base local1948e69 sincronizada em branch própria preservando a documentação local.
- [x] Lacuna específica Q8/MySQL atendida e referenciada pela CI do #34,9testes sem falhas; limites da concorrência/notificação preservados.
- [x] Evidências compartilhadas já disponíveis relacionadas à matriz e aos logs da CI, preservando limites e origens.
- [x] Contratos, processo dos vínculos e modo RF11 decididos sob delegação de Marcos e registrados no ADR-007/runbooks/provas próprias; sem concordâncias individuais inventadas.
- [x] Conciliação publicada/revisada/integrada pelo #35 e complemento delegado pelo #36; merge/revisão humana confirmados.
- [x] Recorte das etapas1a5 encerrado após aceite do autor, commit/push, revisão humana e merge do #36; este registro documental pós-merge não cria pendência funcional. Operação de ambiente compartilhado conserva seu registro próprio.

O erro compartilhado do scanner permanece acompanhado pela equipe sem bloquear a implementação do Marcos por ora, conforme sua orientação. Isso não elimina a revisão/merge nem declara RFs globais encerrados.

## 13. Continuidade após o encerramento

| Ação | Estado / responsabilidade |
|---|---|
| Entrega funcional e decisões das etapas1a5 | Concluídas, aceitas e integradas pelo #36. |
| Registro documental pós-merge | Preparado nesta branch; commit/publicação seguem o fluxo. |
| Uso do procedimento no ambiente compartilhado | Administrador autoriza e operador aplica o runbook com IDs/credenciais daquele ambiente; não é operação executada pela conferência documental. |
| Futuro RF12/etapa6 | #37 entregou só a leitura persistida; serviço/API/DTO e frontend exigem story/contrato próprios antes de iniciar. |

GETs, edição/cancelamento, ambiente real e cenários mínimos não aguardam nova implementação. Nenhuma nova tela/endpoint ou teste adicional é criado apenas para preencher registros históricos desatualizados.

## 14. Fluxo de execução e primeiro passo

O recorte documental anterior é rastreado na story Marcos-qualitygate-1; o incremento atual delegado inclui procedimentos SQL/runbook, auxiliar opt-in e demonstração RF11/Q9 reais, sem mudança de produto. Conferir referências/PRs, links, File List, digests e resultados; build81/278 e8cenários da demonstração aprovados. Marcos revisa o incremento; commit/push seguem solicitação própria. A delegação foi registrada como decisão de Marcos, sem assinaturas individuais inventadas, mensagem externa ou merge automático.

Próximo checkpoint: commit/publicação deste registro de encerramento integrado; #35/#36/#37 conferidos e basec4279b6 sincronizada. Decisões delegadas e demonstração já encerradas no recorte1a5. Relatórios da etapa 6 e certificação global da etapa 7 permanecem fora do fechamento do frontend até a etapa 5.

## 15. Fontes para retomar o contexto

- [Fotografia remota e pendências atuais](../testes/marcos-fechamento-status-2026-11-13.md), [consulta estruturada](../testes/marcos-fechamento-status-2026-11-13.json) e [sequência vigente de fechamento](../integracao/marcos-fechamento-entrega.md).
- [Contratos de consultas entregues](../api/reservas-consulta-contrato.md) e [revalidação consolidada com Q1/Q3](../testes/marcos-qualitygate-1-consolidacao-resultados.md).
- [Plano original de responsabilidades e etapas](marcos-plano-de-acao.md): neste checkout ainda contém estados anteriores à atualização feita em casa; consultar junto da versão remota consolidada.
- [Plano consolidado consultado na Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/planejamento/marcos-plano-de-acao.md).
- [Marcos-1](../stories/marcos-1.md), [Marcos-2](../stories/marcos-2.md), [Marcos-3](../stories/marcos-3.md), [administração](../stories/marcos-5.md) e [movimentações](../stories/marcos-5-movimentacoes.md).
- [Story Marcos-4 publicada](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/stories/marcos-4.md).
- [Política Q9 documentada](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/api/reservas-politica-leitura-q9.md).
- [Contrato local de reservas](../api/reservas-contrato.md) e [proposta de leitura da fila](../api/reservas-leitura-contrato.md): exemplos de contrato, não comprovação de disponibilidade do GET.
- [Pendências de integração da fila na develop conferida](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/9d6b56cd0cb78ed8c0f1c10fbbb8661709a4da12/docs/integracao/revisao-contrato-fila-rf07.md).
- [Evidências da conciliação Marcos-4](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/testes/marcos-4-conciliacao-resultados.md) e [revalidação após atualização da base](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/df5706327ce76aac67cec3935b9749ec96e68573/docs/testes/marcos-integracao-2026-11-11-resultados.md).
- [Execução CI do PR #23, anterior ao merge](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43137824691), [check separado Sonar](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/runs/130917502876) e [CI pós-merge da develop 23cf839](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43229810267).
- [Workflow de CI conferido](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/8df312e17e21cbf3c254fcef4cb94fabe3fa0061/.github/workflows/ci.yml).
