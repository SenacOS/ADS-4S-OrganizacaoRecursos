# Marcos — correções de qualidade e alinhamento da equipe

## Encaminhamento vigente — PRs #32/#33 mesclados

**Q8 — complemento MySQL integrado:** [PR #34](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/34), de Silva, aprovado por Marcos e mesclado em **1948e69** em13/11/2026. A [CI43447037478](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43447037478) executou **9 testes Q8 com MySQL8.4/Testcontainers, zero falhas/erros/ignorados**, incluídos nos66testes de integração aprovados;261unitários/HTTP, JaCoCo e JMeter também passaram. A conclusão geral failure permanece pelo scanner compartilhado, temporariamente não bloqueante por orientação de Marcos. [Trechos de log, cenários, metadados e limites](../testes/marcos-q8-pr34-evidencias.json).

A base de trabalho agora é **1948e69** na branch `docs/marcos-fechamento-etapas`, atualizada por fast-forward após preservar/reconferir os11documentos locais. #34 acrescenta somente `ReservaAprovacaoMysqlIT`: sem mudança de produção, sem novo JAR ou reexecução local injustificada. A lacuna específica de evidência Q8 em MySQL (recusas/rollback/auditoria/outbox/conflitos/lock) foi atendida pelos cenários executados na CI da equipe. Isso não certifica toda concorrência nem entrega externa de notificações. Documentação continua sem commit/push.


Frontend das etapas 1 a 5 e complemento E2E integrados à develop. O [PR #32](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/32) foi **aprovado por jovemOG-Dev e mesclado** em **3e1a2a0**; o [PR #33](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/33), de Silva, foi **aprovado por Marcos e mesclado** em **62cd48f**. O #33 revalida disponibilidade antes de aprovar uma reserva (Q8); não publica a conciliação documental local.

Base de trabalho atualizada inicialmente para **62cd48f** na branch **docs/marcos-fechamento-etapas**, preservando por cópia/hash os dez documentos locais. Corretivo e revisão humana do #32 já concluídos; documentação desta rodada ainda sem commit/push. O Quality Gate aprovado do #32 e o erro compartilhado do scanner permanecem registrados com suas origens. Por orientação de Marcos, esse erro não bloqueia sua implementação por enquanto. CodeRabbit local segue indisponível, sem resultado aprovado presumido.

Após o #33, JAR reconstruído e **8 testes unitários Q8 + 12 cenários reais Q9/Q1/Q3 aprovados**. [Evidências da base nova](../testes/marcos-fechamento-pos-merge-32-33.json) e [estado/limites](../testes/marcos-fechamento-status-2026-11-13.md). Testes anteriores mantêm suas bases: não há nova execução de smoke16, consulta8, fechamento11 ou frontend81/278 atribuída a62cd48f. Os oito testes com AmbienteFake conservam esse limite; o complemento Q8/MySQL está agora comprovado nos9testes do #34, relacionados acima.

Faltam publicação da conciliação, ratificação contratual/processo dos vínculos e relação de evidências compartilhadas além do cliente. Nenhuma nova tela prevista até a etapa5 foi identificada.

## Pendências por responsável — encaminhamento manual

Marcos confirmou nesta rodada que não recebeu decisões novas. [Texto completo pronto para enviar, por Silva, Fausto, Débora e equipe](marcos-pendencias-fechamento-2026-11-13.md), com resposta/evidência esperada em cada item.

- Silva: ratificar contratos/edição/cancelamento e confirmar leituras/fila com Fausto/Débora.
- Fausto, com Silva/segurança: aprovar operação dos vínculos reais e regra multirrecurso.
- Débora: ratificar dados/erros Q9 e confirmar modo de demonstração/aceite RF11; referenciar evidência correspondente.
- Todos: registrar decisões e revisar/integrar o PR documental.

Auditoria/outbox/gateway de teste/segurança já têm provas relacionadas na CI43447037478; não solicitar nova implementação ou execução apenas por ausência de referência. Mockito/WireMock não são prova de recebimento por destino externo da implantação; a RF11 admite modos descritos no guia, sujeitos ao aceite combinado.

A publicação do PR documental foi autorizada; esta mensagem adicional permanece local. Nenhum comentário, mensagem, e-mail, solicitação de revisão nominal ou merge foi enviado/executado.

<details>
<summary>Histórico do diagnóstico e das mensagens anteriores à aprovação do Quality Gate</summary>

## Encaminhamento vigente após os merges

PRs#28/#29 mesclados e develop em **a0c0481**, contendo também Q3/#30 e Q1/#31. O plano anterior de dois recortes foi substituído, com autorização de Marcos, por **um único PR corretivo** da branch `fix/marcos-qualitygate` para `develop`. Não reabrir nem publicar correções nas branches antigas; a worktree anterior fica preservada como origem.

[Nova validação](../testes/marcos-qualitygate-1-consolidacao-resultados.md):14unitários, smoke16/0/0, Q9/Q1/Q3 12/0, consulta8/0 e fechamento11/0, com JAR reconstruído da develop atual. As instruções seguintes de dois recortes descrevem a preparação anterior, não a entrega atual.

Mensagem atual pronta para a equipe:

> Equipe, os PRs#28/#29 já entraram na develop. Consolidamos as correções dos auxiliares e dos metadados SHA256 em um PR corretivo único, sem alterar backend, telas, gates ou configurações da CI. Revalidamos com a developa0c0481 e os PRs#30/#31:14unitários e suites reais16/0/0,12/0(Q9/Q1/Q3),8/0 e11/0. A própria aprovação do Responsável foi recusada e início/conclusão/ausência ficaram exclusivos do Responsável, conforme os novos contratos.
>
> Ainda precisamos que a responsável pela CI/administrador confira organização senacos, projeto SenacOS_ADS-4S-OrganizacaoRecursos e a autorização do SONAR_TOKEN para esse projeto. O erro anterior do scanner Maven era Not authorized or project not found; não divulgamos nem substituímos o token. O gate do novo head precisa ser conferido após a publicação. Os históricos foram preservados, inclusive as falhas e os digests originais das evidências.

A abertura do PR corretivo e seu corpo foram autorizados pelo usuário após validação. Esta mensagem adicional permanece local; nenhum comentário social/e-mail ou merge faz parte dessa autorização.

## Registro anterior — dois recortes antes dos merges

Conferência em **13/11/2026**. Correções locais preparadas para os PRs [#28](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/28) e [#29](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/29), ainda sem novos commits/push. A análise remota continua sendo a anterior; este documento não afirma Quality Gate aprovado.

## O que foi corrigido localmente

- **S4036:** Git e PowerShell usam instalações configuradas por caminho absoluto, com validação de arquivo/nome/caminho real, sem busca ou fallback no PATH. O executor mantém argumentos separados e força shell desabilitado e janela oculta.
- **S8786:** detecção de include passa a percorrer linhas sem backtracking superlinear, mantendo a recusa após CR, LF, CRLF, U+2028 e U+2029.
- **S7737:** viewport padrão é criada/copiada por chamada, sem objeto literal no parâmetro padrão nem objeto mutável compartilhado.
- **S6418 nos três JSONs:** os valores apontados eram hashes SHA256 da fonte auth.js. Agora o inventário explicita `{arquivo, algoritmo, digest}`; todos os35digests e os demais campos de cada evidência foram preservados. Originais continuam recuperáveis no commit5537163. Não foram apagadas falhas, tentativas, datas ou resultados, nem criadas exclusões/supressões Sonar.

## Validação executada

- **PR #28:** nove testes de configuração/executor/INI aprovados na sua worktree sobre0775715.
- **PR #29:**14testes de configuração, executor, INI, viewport e projeção de evidências aprovados sobre5537163.
- Reexecuções reais na árvore principal do #29: smoke16/0/0, Q9 10/0, consulta/edição8/0 e fechamento11/0; instancia temporária encerrada e principal preservada.
- Os sete arquivos comuns são idênticos entre as duas árvores. A execução real usa esses bytes comuns na árvore principal; não foi apresentada como uma segunda execução independente na worktree do #28.
- Produto/telas/testes da regressão81/278 permaneceram inalterados, com correspondência de hashes. Nenhum novo package Maven, clean verify ou scanner remoto executado para esta correção local.

## O que depende de acesso da equipe

As execuções [CI do #28](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43299128881) e [CI do #29](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43299413621) passaram244testes unitários/HTTP,57integrações MySQL, gates JaCoCo e job JMeter. O passo Maven de análise Sonar falhou depois com **Not authorized or project not found**. Isso é independente da classificação de segurança dos auxiliares/metadados.

A configuração do workflow lê o secret `SONAR_TOKEN` e as variables `SONAR_ORGANIZATION`/`SONAR_PROJECT_KEY`; a etapa preliminar só verifica se estão preenchidos. Não valida se o token está ativo/autorizado ou se pertence ao projeto esperado. A API pública confirmou:

| Configuração esperada | Valor público |
|---|---|
| Organização Sonar | `senacos` |
| Projeto Sonar | `SenacOS_ADS-4S-OrganizacaoRecursos` |

Débora/administrador responsável pela CI precisa conferir a correspondência dessas variables e a autorização do token para analisar esse projeto. O diagnóstico não determina qual valor/permissão está incorreto; não houve acesso aos valores secretos ou mudança de configuração. Não compartilhar token na resposta, nos logs ou no PR.

## Mensagem pronta para encaminhar

> Equipe, investigamos os gates dos PRs #28/#29. Os testes Java/MySQL, JaCoCo e JMeter passaram. Preparamos correções nos auxiliares para eliminar a resolução de Git/PowerShell pelo PATH, preservar a validação de include e ajustar o viewport. Nos JSONs, os três alertas de segredo eram SHA256 de auth.js; o inventário foi reprojetado com algoritmo/digest explícitos, sem perda de provas e com os originais no histórico.
>
> A validação local passou:9testes no recorte do #28,14no #29 e reexecuções reais16/0/0,10/0,8/0 e11/0. As correções ainda precisam do commit/push e de nova análise Sonar para confirmar a resolução remota.
>
> Separadamente, precisamos que a responsável pela CI/administrador confira SONAR_ORGANIZATION=senacos, SONAR_PROJECT_KEY=SenacOS_ADS-4S-OrganizacaoRecursos e se SONAR_TOKEN está ativo e autorizado para esse projeto. O scanner Maven retorna Not authorized or project not found nos dois PRs. Por favor confirmem a configuração/permissão, sem divulgar o token. Os gates não foram desabilitados nem houve alteração do backend para contornar as falhas.

## Aplicação das correções e revisão

1. Revisar os dois recortes e seus relatórios. Commit somente após a solicitação de Marcos; nenhum histórico publicado deve ser reescrito.
2. A correção comum pertence à `feature/marcos-reservas-consulta` (#28). Exclusivos de fechamento e JSONs pertencem à `test/marcos-fechamento-e2e` (#29). São correções dos PRs existentes, não motivo para criar dois novos PRs de implementação.
3. Ao publicar, manter os sete arquivos comuns iguais. Após o merge do #28, sincronizar a branch do #29 com develop e conferir o diff, preservando as evidências de cada execução.
4. Conferir a nova análise Sonar de cada head, além do scanner Maven depois da conferência administrativa. Só o resultado remoto confirma Quality Gate aprovado.

Esta mensagem foi preparada localmente; nenhum comentário, mensagem externa, push ou alteração remota foi feito para produzi-la.

</details>
