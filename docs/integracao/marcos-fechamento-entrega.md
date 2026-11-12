# Marcos — sequência de entrega e pendências finais

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
