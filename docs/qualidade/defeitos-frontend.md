# Defeitos encontrados no frontend

## FE-007 — Justificativa administrativa Q5 não era coletada/enviada

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em13/11/2026; severidade média(P2). [Story Marcos-7](../stories/marcos-7.md), baseb73c501.
- Origem: #43, posterior à entrega/aceite da etapa6, exige motivo para Administrador cancelar reserva alheia. Cliente/tela antigos não ofereciam o campo e enviavam POST sem corpo.
- Reprodução: novos testes focais registraram1PASS/2FAIL, cobrindo ausência/branco/limite e envio do motivo. [Resumo RED](../testes/marcos-7/q5-red-resumo.json).
- Correção: justificativa com label/limite500/validação somente na hipótese obrigatória; confirmação depois de editar, corpo somente `{motivo}` e envio único. Donos continuam sem motivo; sem mudança Java/SQL ou exibição inventada do campo que o DTO não retorna.
- Regressão:3/3focais, build100unitários/350navegador e8cenários Q5 reais com SQL/trilhas e UI desktop/mobile. [Resultados/tentativas](../testes/marcos-7-resultados.md). [Aceite do autor registrado](../testes/marcos-7-verificacao.md#aceite-do-autor--13112026); revisão independente e entrega deste incremento pendentes.

## FE-006 — Intervalo submilissegundo válido recusado como vazio

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em 12/11/2026. Story: [Marcos-3-consulta-edicao](../stories/marcos-3-consulta-edicao.md). Severidade baixa (P3), fronteira apontada na revisão assistida QA.
- Reprodução: detalhe com início `.123001` e fim `.123002` no mesmo segundo/offset. `Date.parse` perde a diferença e o leitor/editor/transporte recusavam fim como não posterior.
- Correção: comparador preciso compartilhado em datas.js, reutilizado no novo leitor/filtros/editor e no corpo de reserva. ISO original e formato de envio mantidos.
- Regressão: unitário atravessa leitura, filtro e PATCH público; navegador consulta/salva sem edição em desktop/móvel. [Resultados e rodadas](../testes/marcos-3-consulta-edicao-resultados.md). Pesquisa compartilhada de recursos em intervalo menor que 1ms conserva seu limite anterior, documentado no relatório; não é anunciada como coberta por essa correção.

## FE-005 — Editor oferecia recurso restrito para reserva comum

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em 12/11/2026. Story: [Marcos-3-consulta-edicao](../stories/marcos-3-consulta-edicao.md), RF04/RF13. Severidade média (P2).
- Identificação: revisão assistida AIOX QA após a primeira regressão aprovada (80 unitários/274 navegador).
- Reprodução: abrir edição de reserva comum do dono e pesquisar recurso novo ativo/disponível que exige aprovação. A seleção era oferecida, mas o domínio proíbe mudar essa necessidade; PATCH seria recusado.
- Correção: impedir inclusão de recurso novo restrito nesse contexto, com orientação ao usuário; recursos originais continuam preservados. Não há mudança da autorização do servidor.
- Regressão: cenário específico em desktop/móvel; rodada após FE-005 com 80 unitários/276 navegador, seguida da final conjunta FE-005/FE-006 com 81/278. [Resultados, tentativas e E2E real 8/0](../testes/marcos-3-consulta-edicao-resultados.md). O novo caso restrito é controlado no navegador; E2E real cobre os demais fluxos descritos no relatório.
- Aceite visual do autor recebido em12/11, com [commit local autorizado](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Revisão da equipe e checks remotos continuam separados.

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
