# Defeitos encontrados no frontend

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
