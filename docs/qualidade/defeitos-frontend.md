# Defeitos encontrados no frontend

## FE-004 — Retirada persistida sem confirmação por data sem segundos zerados

- Estado: CORRIGIDO E VALIDADO LOCALMENTE, inclusive com Spring/MySQL reais, em 12/11/2026.
- Story: [Marcos-integracao-datas-1](../stories/marcos-integracao-datas-1.md). RF09/RF13/RF14. Severidade: média; uma retirada já gravada não era confirmada e a lista de pendências era recusada.
- Reprodução: executar uma retirada real cujo prazo tenha segundos zero. O servidor retorna 201 com `fimPrevisto: 2026-11-12T13:08-03:00`; consultar abertas retorna o mesmo formato. O validador exigia segundos e levantava RESPOSTA_INVALIDA.
- Causa: `DatasConfig` usa `OffsetDateTime.toString()` para Instant; a precisão de minuto com offset é uma saída válida que as fixtures anteriores não cobriam.
- Correção: segundos opcionais em `dataComOffset`, mantendo offset obrigatório, fração somente após segundos e controles de calendário/hora/instante. Formatos enviados, backend, identidade e guard de operação incerta preservados.
- Regressão: dois novos unitários (executados antes da correção com falha) e cenário de retirada/pendência/devolução em desktop/móvel; build final com 72 unitários e 240 navegador aprovado. [Resultados e RED](../testes/marcos-integracao-datas-1-resultados.md).
- Integração: JAR atualizado e fontes servidas conferidas por SHA256; retirada/devolução reais confirmadas, prazo `2026-11-12T13:15-03:00`. [Consulta real da movimentação final](../testes/marcos-e2e-local-2026-11-12/movimentacao-final.json). O registro inicial persistido foi preservado, sem exclusão ou reenvio automático.
- Limites: não encerra fila/Q9, concorrência, todas as transições, CI/CodeRabbit ou revisão humana da equipe.

## FE-001 — Rótulo de carregamento restaurado por submit repetido

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em 10/11/2026.
- Story: Marcos-2. RF13. Severidade: baixa (feedback visual; nenhuma segunda escrita era executada).
- Reprodução: preencher o login ou acessar o painel autenticado; manter a resposta de login/logout pendente; disparar dois eventos submit consecutivos no mesmo formulário.
- Antes: guard mantinha apenas uma operação, mas o finally do segundo manipulador restaurava Entrar/Sair da conta enquanto a primeira requisição permanecia em andamento.
- Correção: restaurar o rótulo dentro do callback protegido pelo guard, preservando o estado da operação em curso.
- Regressão: tests/browser/acesso.spec.js, cenários envios simultâneos de login/logout, executados em desktop e móvel.
- Evidência: [resultado da suíte](../testes/marcos-2-resultados.md) e [saída aprovada](../testes/marcos-2-verificacao.txt). As quatro execuções passaram após a correção; suíte completa com 30 aprovações.

## FE-002 — Resumo de pesquisa permanecia em carregamento após falha

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em 11/11/2026.
- Story: Marcos-5. RF13. Severidade: baixa (feedback contraditório; nenhuma escrita indevida).
- Identificação: revisão assistida AIOX QA do incremento administrativo.
- Reprodução: entrar na gestão como Administrador e receber falha de GET /api/recursos.
- Antes: feedback exibia o erro, mas o resumo da lista permanecia em Consultando recursos.
- Correção: o catch da pesquisa informa Consulta não concluída e preserva a possibilidade de nova consulta explícita; falhas de pesquisas antigas são descartadas quando os filtros mudam.
- Regressão: tests/browser/administracao-recursos.spec.js, falha de pesquisa encerra carregamento e permite recuperação explícita, aprovado em desktop e móvel.
- Evidência: [resultados e limites](../testes/marcos-5-resultados.md) e [saída de validação](../testes/marcos-5-verificacao.txt). API controlada somente nos testes.

## FE-003 — Confirmação anterior permitia reenvio após operação incerta

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em 11/11/2026.
- Story: Marcos-5-Movimentações. RF09/RF13. Severidade: média (P2; possível reenvio manual de escrita cujo resultado não foi confirmado).
- Identificação: revisão assistida AIOX QA, após a primeira suíte aprovada.
- Reprodução: confirmar retirada/devolução, receber falha de rede ou resposta incoerente e submeter novamente com a confirmação anterior, sem consultar pendências.
- Antes: o guard evitava simultaneidade, mas o checkbox e o contexto anteriores eram preservados, permitindo outra tentativa manual sem a reconsulta prevista.
- Correção: flags de operação incerta invalidam confirmação e bloqueiam POST até GET de pendências bem-sucedido e nova conferência. GET falho mantém o bloqueio. Material já encontrado entre abertas é apontado como pendência, sem atribuir sucesso à escrita cuja resposta se perdeu.
- Regressão: tests/browser/movimentacoes.spec.js, rede/incoerente nas duas escritas, tentativa de submit antes da recuperação e GET falho; aprovados em desktop e móvel.
- Evidência: [resultados](../testes/marcos-5-movimentacoes-resultados.md) e [rodada final](../testes/marcos-5-movimentacoes-verificacao.txt), com 57 unitários e 190 testes de navegador aprovados. A primeira rodada não cobria o caso e foi preservada separadamente.
