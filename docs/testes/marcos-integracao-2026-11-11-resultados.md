# Atualização das branches de Marcos — 11/11/2026

Etapa 5 e Marcos-4 revalidadas com a base remota consolidada. Os testes de navegador abaixo usam API controlada exclusivamente em isolamento; não executam Spring/MySQL real.

| Checkout | Lint/tipos | Unitários | Navegador | Duração Playwright |
|---|---|---|---|---|
| Etapa 5, 8df312e | aprovados | 57 aprovados | 190 aprovados (95 por viewport) | 2,49 min |
| Marcos-4, e33de6d + 8df312e | aprovados | 68 aprovados | 238 aprovados (119 por viewport) | 3,23 min |

Zero falhas, ignorados, flaky ou retries nas duas execuções. Comando npm run build, exit 0, PLAYWRIGHT_CHANNEL=chrome; Node 24.22.2/npm 11.19.1, Chrome 157.0.8103.39 e Playwright 1.65.0. Inícios UTC e hashes no [JSON](marcos-integracao-2026-11-11.json); data local das execuções: 11/11. [Saída da etapa 5](marcos-integracao-2026-11-11-etapa-5.txt) e [saída Marcos-4](marcos-integracao-2026-11-11-marcos-4.txt). Evidências/capturas anteriores preservadas.

## Integração preparada

- develop conferida: 3454fda; PR #19 integrado. PRs #20/#21 foram mesclados em branches intermediárias; etapa 5 ainda precisa chegar à develop.
- Etapa 5: simulação de merge com develop produziu exatamente a árvore de 8df312e, sem mudanças de conteúdo. Simulação encerrada e checkout limpo. [PR #23](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/23) criado em Draft: administração + movimentações → develop.
- Marcos-4: merge de 8df312e preserva e33de6d. Único conflito em docs/RTM.md, conciliado com matriz ampliada da equipe, evidências históricas e seções do frontend. Nenhum arquivo estático, teste, flag ou dependência alterado por esta atualização. Arquivos Java importados da equipe, sem atribuir autoria a Marcos. A incorporação da ancestralidade develop não altera o conteúdo testado.
- Pasta original e backup dos 29 arquivos preservados. Push permanece com Marcos; nenhum merge remoto executado.

## Limites e continuidade

PR #22 (leitura SQL/CT19) consultado, sem incorporação: em revisão, ainda sem controller HTTP de fila nem autorização Q9 completa. Leitura geral/detalhe, edição/cancelamento pela interface e relatórios mantêm dependências próprias.

Marcos informou que ainda não tem ambiente E2E. JDK 21 instalado e MySQL80 ativo não comprovam banco/credenciais de teste prontos; Maven ausente do PATH. Preparo E2E em branch/story separadas. Aceite visual detalhado da fila, revisão independente, CodeRabbit (indisponível), CI e E2E real não são inferidos destas execuções.
