# Defeitos encontrados no frontend

## FE-001 — Rótulo de carregamento restaurado por submit repetido

- Estado: CORRIGIDO E VALIDADO LOCALMENTE em 10/11/2026.
- Story: Marcos-2. RF13. Severidade: baixa (feedback visual; nenhuma segunda escrita era executada).
- Reprodução: preencher o login ou acessar o painel autenticado; manter a resposta de login/logout pendente; disparar dois eventos submit consecutivos no mesmo formulário.
- Antes: guard mantinha apenas uma operação, mas o finally do segundo manipulador restaurava Entrar/Sair da conta enquanto a primeira requisição permanecia em andamento.
- Correção: restaurar o rótulo dentro do callback protegido pelo guard, preservando o estado da operação em curso.
- Regressão: tests/browser/acesso.spec.js, cenários envios simultâneos de login/logout, executados em desktop e móvel.
- Evidência: [resultado da suíte](../testes/marcos-2-resultados.md) e [saída aprovada](../testes/marcos-2-verificacao.txt). As quatro execuções passaram após a correção; suíte completa com 30 aprovações.
