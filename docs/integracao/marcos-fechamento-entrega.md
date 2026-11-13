# Marcos — sequência de entrega e pendências finais

## Estado atual — 13/11/2026

**Q8 — complemento MySQL integrado:** [PR #34](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/34), de Silva, aprovado por Marcos e mesclado em **1948e69** em13/11/2026. A [CI43447037478](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43447037478) executou **9 testes Q8 com MySQL8.4/Testcontainers, zero falhas/erros/ignorados**, incluídos nos66testes de integração aprovados;261unitários/HTTP, JaCoCo e JMeter também passaram. A conclusão geral failure permanece pelo scanner compartilhado, temporariamente não bloqueante por orientação de Marcos. [Trechos de log, cenários, metadados e limites](../testes/marcos-q8-pr34-evidencias.json).

A base de trabalho agora é **1948e69** na branch `docs/marcos-fechamento-etapas`, atualizada por fast-forward após preservar/reconferir os11documentos locais. #34 acrescenta somente `ReservaAprovacaoMysqlIT`: sem mudança de produção, sem novo JAR ou reexecução local injustificada. A lacuna específica de evidência Q8 em MySQL (recusas/rollback/auditoria/outbox/conflitos/lock) foi atendida pelos cenários executados na CI da equipe. Isso não certifica toda concorrência nem entrega externa de notificações. Documentação continua sem commit/push.


Frontend das etapas 1 a 5 e complemento E2E integrados à develop. O [PR #32](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/32) foi **aprovado por jovemOG-Dev e mesclado** em **3e1a2a0**; o [PR #33](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/33), de Silva, foi **aprovado por Marcos e mesclado** em **62cd48f**. O #33 revalida disponibilidade antes de aprovar uma reserva (Q8); não publica a conciliação documental local.

Base de trabalho atualizada inicialmente para **62cd48f** na branch **docs/marcos-fechamento-etapas**, preservando por cópia/hash os dez documentos locais. Corretivo e revisão humana do #32 já concluídos; documentação desta rodada ainda sem commit/push. O Quality Gate aprovado do #32 e o erro compartilhado do scanner permanecem registrados com suas origens. Por orientação de Marcos, esse erro não bloqueia sua implementação por enquanto. CodeRabbit local segue indisponível, sem resultado aprovado presumido.

Após o #33, JAR reconstruído e **8 testes unitários Q8 + 12 cenários reais Q9/Q1/Q3 aprovados**. [Evidências da base nova](../testes/marcos-fechamento-pos-merge-32-33.json) e [estado/limites](../testes/marcos-fechamento-status-2026-11-13.md). Testes anteriores mantêm suas bases: não há nova execução de smoke16, consulta8, fechamento11 ou frontend81/278 atribuída a62cd48f. Os oito testes com AmbienteFake conservam esse limite; o complemento Q8/MySQL está agora comprovado nos9testes do #34, relacionados acima.

Faltam publicação da conciliação, ratificação contratual/processo dos vínculos e relação de evidências compartilhadas além do cliente. Nenhuma nova tela prevista até a etapa5 foi identificada.

## Publicação e confirmações

**Alinhamento para publicação:** Marcos autorizou publicar a conciliação e informou que ainda não recebeu confirmações novas. [Pendências por responsável e texto pronto para encaminhar](marcos-pendencias-fechamento-2026-11-13.md). Evidências compartilhadas RF10/RF11/segurança agora relacionadas à CI43447037478: auditoria MySQL5, auditoria de usuário1 e controller4; outbox MySQL8 com gateway Mockito; gateway HTTP WireMock5; sessão/segurança/Q9 conforme matriz. Isso comprova os recortes executados, sem transformar gateway de teste em recebimento externo ou ratificação contratual. O modo de demonstração/aceite RF11 ainda exige confirmação da responsável. Commit/push/PR documental autorizados; nenhuma mensagem externa ou merge automático.

## Próximos passos e responsáveis

| Pendência | Responsável / próximo passo |
|---|---|
| Revisão e merge do #32 | Concluídos: aprovação por jovemOG-Dev e integração3e1a2a0. CodeRabbit local indisponível, sem execução presumida. |
| Sincronização pós-merge | Concluída agora na base1948e69, branch documental própria; dez arquivos preservados antes de #33 e onze antes de #34. Q8 e provas MySQL incluídas/conferidas. |
| Ratificação de contratos e regra multirrecurso | Silva/Fausto/Débora; Marcos já aceitou o consumo atual. |
| Concessão/revogação de vínculos reais | Fausto/Silva com segurança; definir processo administrativo restrito. A autorização existe, sem nova tela presumida. |
| Evidências além da camada cliente | Q8, RF10/RF11 e segurança relacionadas à CI; responsável confirma modo/evidências de aceite RF11 e demais aspectos de implantação aplicáveis. |
| Publicação desta conciliação e encerramento | Marcos/assistente; revisão, commit e push conforme fluxo. |
| Scanner Maven compartilhado | Débora/administrador acompanha autorização/projeto; temporariamente não bloqueante da implementação por orientação de Marcos. |

Sem nova implementação de frontend pendente até a etapa 5. Consultas/Q9 e caminhos mínimos reais já entregues. Persistência de outbox/auditoria não é confirmação de entrega externa de notificação.

[Plano vigente](../planejamento/marcos-fechamento-etapas-1-a-5.md). Nenhum comentário ou mensagem externa enviado; nenhum merge, commit ou push nesta conciliação.

<details>
<summary>Histórico da sequência de entrega — PRs #28/#29 já mesclados</summary>

Checkpoint vigente13/11: os PRs#28/#29 estão mesclados na developa0c0481. Agora há **um único PR corretivo** preparado na branch `fix/marcos-qualitygate`, com correções dos auxiliares/evidências e [revalidação do backend atualizado](../testes/marcos-qualitygate-1-consolidacao-resultados.md). Commit/push/abertura desse PR foram autorizados por Marcos após validar; merge e mensagens adicionais permanecem separados. As instruções anteriores de dois PRs/ausência de merge abaixo são históricas.

Atualização em13/11: PRs#28/#29 já abertos, ambos para develop, e aguardam correções/checks. Há correções locais de auxiliares/metadados nas duas árvores e [encaminhamento pronto](marcos-qualitygate-equipe-2026-11-13.md), sem publicação automática. [Resultados](../testes/marcos-qualitygate-1-resultados.md). As menções abaixo à ausência dos PRs são da conferência original12/11; não criar PRs duplicados.

**Revisão do complemento aprovada por Marcos em12/11/2026**, sem ajuste solicitado. [Aceite](../testes/marcos-fechamento-e2e-1-aceite-2026-11-12.md). Os auxiliares/fontes/resultados permanecem preservados. A revisão do autor prevista no passo2 abaixo foi atendida; commit/push/PR e revisão/checks/merge mantêm seus próprios passos.

Marcos solicitou depois o **commit local** do complemento. O commit que inclui esse registro identifica sua entrega local em `test/marcos-fechamento-e2e`; push e PR continuam separados. As descrições abaixo de testes ainda sem commit identificam a conferência original e não reescrevem a origem das evidências.

Conferência em **12/11/2026**. Frontend e fluxos mínimos de integração previstos até a etapa5 têm evidências locais nos caminhos executados. O complemento real de fechamento está em `test/marcos-fechamento-e2e`, sobre `0775715`, ainda sem commit. [11 cenários novos aprovados e matriz](../testes/marcos-fechamento-e2e-1-resultados.md). Não há nova implementação de tela neste incremento.

## 1. Entregar o frontend aceito

`feature/marcos-reservas-consulta` foi enviada por Marcos e conferida no remoto em **0775715**. Develop conferida em **4cea177**, PR#27. A comparação contém também os ajustes de qualidade de8c21a43 e a integração f9c4912; não criar outro PR isolado para duplicá-los.

Não foi encontrado PR para esse head na consulta do conector GitHub. A consulta de workflow runs de pull request/statuses para0775715 não retornou registros; isso não equivale à aprovação de checks e não cobre todos os tipos de execução da CI.

- Base do PR: **develop**.
- Head: **feature/marcos-reservas-consulta**.
- Título sugerido: **feat(frontend): completa consulta, edição e cancelamento de reservas**.
- [Abrir comparação no GitHub](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/compare/develop...feature/marcos-reservas-consulta).

Descrição pronta para copiar:

```markdown
O frontend já permitia pesquisar recursos e criar reservas, mas faltava reabrir uma reserva existente para consultar, editar ou cancelar. Este incremento adiciona a página Reservas aos três perfis, consumindo os GETs e a autorização Q9 dos PRs #26/#27.

A listagem usa filtros e paginação do servidor. Edição/cancelamento exigem detalhe autorizado completo, permissões por dono/perfil/estado e confirmação. PATCH mantém todos os recursos e o ISO original das datas não editadas; comparações preservam precisão. Resultado incerto exige nova consulta antes de outra escrita. Cancelamento mantém histórico. Inclui os ajustes anteriores de datas e ordenação ainda ausentes da develop.

Validação: lint/typecheck aprovados, 81 unitários e 278 execuções de navegador; oito cenários reais da interface e 16 do smoke geral, sem falhas. Q9/fila mantém evidência anterior10/0. QA assistido aprovou o recorte e Marcos confirmou o aceite visual. Evidências/limites em docs/testes/marcos-3-consulta-edicao-resultados.md e no registro de aceite.

Os testes reais usam Spring/MySQL isolados, com fontes servidas pelo JAR conferidas por hash. Package local omitiu testes Maven; não é clean verify. Não altera Java, migrações, configuração persistente ou dependências. Revisão de outro integrante, checks remotos e ratificação coletiva/processo dos vínculos continuam separados.
```

As 11 verificações do complemento novo não pertencem ao commit0775715; não atribuí-las como arquivos/testes entregues pelo primeiro PR. Elas conferiram a mesma fonte preservada, mas serão publicadas pelo incremento próprio.

## 2. Registrar e entregar o complemento de testes

Revisar story/resultados/capturas do incremento novo; commit somente após solicitação de Marcos. Ele acrescenta helpers opt-in, evidências e documentação, sem mudar o produto. Push e PR seguem solicitações próprias. Após o primeiro PR chegar à develop, incorporar a develop atual na branch de testes, preservar sua evidência e conferir o diff antes do PR de testes para develop. Se a base mudar funcionalmente, executar somente as verificações justificadas pela mudança; não reatribuir os resultados antigos ao SHA novo.

## 3. O que ainda exige outra ação

| Pendência | Responsável / próximo passo |
|---|---|
| Revisão de outro integrante e merge dos incrementos | Marcos abre/acompanha PRs; equipe revisa e integra. Aceite do autor e QA assistido já têm registros próprios. |
| Checks do SHA publicado, CodeRabbit e scanner Sonar | Responsáveis pela CI/equipe conferem a execução do PR; o último scanner Maven observado da develop4cea177 falhou por autorização/projeto, após testes/cobertura aprovados. Não há correção de configuração declarada aqui. |
| Ratificação coletiva do vínculo com todos os recursos e regras ainda PROPOSTO | Equipe confirma os contratos; Marcos já aceitou consumir o comportamento atual. Não é nova ausência de GET ou falha de Q9. |
| Processo administrativo dos vínculos do Responsável | Equipe define operação de concessão/revogação fora das fixtures. A V6 e a autorização já existem; testes locais não criam endpoint de gestão. |
| Entrega externa de notificações e provas globais compartilhadas | Responsáveis de backend/infra validam ambiente/worker e demais requisitos globais. Outbox/auditoria persistidas não são entrega externa. Não exige inventar outra tela do Marcos. |

Timeout real, pesquisa real paginada/vazia/indisponível, disputa pontual, editor após estado alterado e devolução com atraso não são mais cenários locais ausentes. Corridas adicionais, carga geral e todas as combinações de estado não foram declaradas como certificadas; qualquer exigência adicional precisa apontar requisito/critério concreto do projeto.

Nenhum PR, comentário externo, push ou merge foi executado para preparar este documento.

</details>
