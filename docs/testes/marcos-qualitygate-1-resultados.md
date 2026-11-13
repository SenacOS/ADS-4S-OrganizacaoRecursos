# PRs #28/#29 — correções locais de Quality Gate

**Checkpoint posterior:** após os merges dos PRs#28/#29/#30/#31, Marcos autorizou consolidar em `fix/marcos-qualitygate` sobre developa0c0481 e publicar um único PR corretivo após validar. [Revalidação da base nova e JAR novo](marcos-qualitygate-1-consolidacao-resultados.md). O relatório abaixo preserva a primeira correção sobre5537163/0775715; seus testes/hashes não foram reatribuídos à base nova.

**13/11/2026.** Árvore principal `test/marcos-fechamento-e2e`, base5537163, e worktree isolada `feature/marcos-reservas-consulta`, base0775715. Correções ainda sem commit; os arquivos e provas abaixo identificam a árvore efetivamente testada, não um SHA novo. [Story](../stories/marcos-qualitygate-1.md), [recorte #28](marcos-qualitygate-1-pr28-resultados.md) e [mensagem/encaminhamento](../integracao/marcos-qualitygate-equipe-2026-11-13.md).

## Diagnóstico e correções

| Regra / condição | Causa observada | Correção local |
|---|---|---|
| S4036 — seis chamadas no #28, mais três no #29 | execuções de Git/PowerShell pelo nome, com resolução via PATH | Instalações absolutas da configuração privada; nome/arquivo/caminho real validados; executor comum força shell:false/windowsHide e preserva erro original. |
| S8786 — controle.cjs | regex de include com custo superlinear indicado pelo analisador | Separação linear de linhas e trim/prefixo; CR/LF/CRLF/U+2028/U+2029 preservados após achado QA. |
| S7737 — validar-fechamento.cjs | objeto literal como valor padrão de viewport | Função que entrega default1366×900 ou cópia da viewport solicitada, sem compartilhamento mutável. |
| S6418 — três JSONs do fechamento | caminho auth.js usado como nome de propriedade com valor SHA256 | Formato2 com array `{arquivo,algoritmo,digest}`, serialização futura e projeção reversível dos históricos. |
| Scanner Maven | Not authorized or project not found após testes/cobertura aprovados | Configuração/token/permissão dependem da equipe; nenhuma alteração de workflow/secret/policy nesta correção. |

A consulta inicial Sonar confirmou SecurityB no#28 eE no#29, com requisitoA. As demais condições consultadas passaram, incluindo duplicação0 e hotspots100%. São valores da análise anterior, não resultado das correções. [Sonar #28](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=28), [Sonar #29](https://sonarcloud.io/dashboard?id=SenacOS_ADS-4S-OrganizacaoRecursos&pullRequest=29).

## Testes locais

| Verificação | Resultado / evidência |
|---|---|
| Sintaxe Node dos10auxiliares novos/alterados | PASS (`node --check`) |
| Configuração/executor/INI na worktree#28 |9PASS/0FAIL — [log](marcos-qualitygate-1/unitarios-pr28.txt) |
| Configuração/executor/INI, viewport e integridade no#29 |14PASS/0FAIL — [log](marcos-qualitygate-1/unitarios-pr29.txt) |
| Smoke real |16PASS/0FAIL/0BLOQUEADO — [JSON](marcos-qualitygate-1/smoke-real.json), [saída](marcos-qualitygate-1/smoke.txt) |
| Q9/fila real |10PASS/0FAIL — [JSON](marcos-qualitygate-1/q9-real.json), [saída](marcos-qualitygate-1/q9.txt) |
| Consulta/edição/cancelamento real |8PASS/0FAIL — [JSON](marcos-qualitygate-1/consulta-real.json), [saída](marcos-qualitygate-1/consulta.txt) |
| Fechamento real, incluindo inatividade/atraso |11PASS/0FAIL — [JSON](marcos-qualitygate-1/fechamento-real.json), [saída](marcos-qualitygate-1/fechamento.txt) |

Os unitários observam caminhos reais absolutos, recusa de relativos/inexistentes/diretórios/nomes incorretos, ausência de fallback mesmo com PATH alterado, argumentos em array, shell desabilitado e erro de execução propagado. INI cobre todos os terminadores anteriores e500mil espaços. Viewport verifica objetos independentes e dimensões móveis. Projeção preserva uma tentativa FAIL/incompleta, recusa digest/algoritmo/versão inválidos e arquivos duplicados.

As reexecuções reais ocorreram sequencialmente na árvore principal do#29, com Chrome/Spring/MySQL e relógio reais, recursos exclusivos e provedores atuais, sem interceptação. Execuções em UTC: smoke13:02:17, Q9 13:02:26, consulta13:02:30, fechamento13:02:37. Fim e detalhes de cada cenário constam dos JSONs. Instância temporária18081 encerrada e principal18080 preservada. Não se somam contagens para declarar todos os RFs/corridas cobertos.

Os sete arquivos comuns são byte a byte iguais nas duas árvores. A prova real exercita esses bytes na árvore principal; somente os nove unitários foram executados independentemente na worktree#28. Essa distinção está preservada nos metadados e no [manifesto corrigido](marcos-qualitygate-1/arvore-corrigida.json). Produto, configuração, dependências, testes frontend e JAR permaneceram inalterados. Regressão81/278 histórica reutilizada por hashes, sem repetir suíte ou package por alteração de auxiliares/metadados.

## Preservação das evidências históricas

Os três JSONs de `docs/testes/marcos-fechamento-e2e-1/` tiveram somente a representação do inventário alterada. Originais recuperáveis pelo commit **5537163108e3ea2c0645b04f6fd621e7208da587** e mesmo caminho. Para cada arquivo, a projeção foi restaurada e comparada integralmente ao original: todos os35pares arquivo/digest e todos os outros campos permaneceram idênticos, inclusive final11/0, segunda tentativa9/1 e primeira incompleta sem fim/resumo.

[Prova de equivalência com SHA256 original/projetado](marcos-qualitygate-1/equivalencia-evidencias.json). Algoritmo e proveniência ficaram explícitos; nenhum segredo foi substituído por hash e nenhum resultado antigo foi reapresentado como execução dos auxiliares corrigidos. Os hashes antigos continuam históricos. Os novos constam do manifesto e das reexecuções atuais, todos em registros com arquivo/algoritmo/digest.

## Preparação, limites e reprodução

O QA encontrou antes das reexecuções uma diferença para CR isolado/U+2028/U+2029 e falta de cobertura explícita do invocador/viewport. Ambos foram corrigidos e cobertos antes da rodada real final. Os primeiros unitários eram10/0 no#29 e6/0 no#28; após ampliar as fronteiras, os finais são14/0 e9/0. Tentativas iniciais do runner sob sandbox foram impedidas por EPERM antes de executar os testes/subprocessos; reexecutadas com a permissão de processos apropriada. Não são falhas do produto ou sucesso de suíte não executada.

Configuração privada `tools/paths.json` passou a conter `git` e `powershell` absolutos, validados antes de usar; não acompanha o Git. O [guia local](../integracao/marcos-e2e-local.md) explica como configurá-los em outra máquina. Os executáveis Java/MySQL já eram explícitos. A configuração é uma entrada local confiável; a correção não afirma autenticar binários de terceiros nem resolver o token Sonar.

```powershell
node --test tests/unit/e2e-local/*.test.cjs
node tests/e2e-local/controle.cjs status
node tests/e2e-local/validar.cjs
node tests/e2e-local/validar-q9.cjs
node tests/e2e-local/validar-consulta-reservas.cjs
node tests/e2e-local/validar-fechamento.cjs
```

Na árvore#28 executar somente `configuracao.test.cjs` e os auxiliares disponíveis. As execuções reais têm os controles/dados/limites de horário do guia. Estado dos processos, credenciais e logs brutos permanecem privados/ignorados. Logs publicados são UTF8/LF normalizados; novos JSONs selecionados seguem formato2 sem alterar as provas.

**Estado:** correção local validada, QA independente e revisão do autor acompanhados na story. Quality Gate remoto continua pendente de publicação autorizada e nova análise de cada head. Scanner Maven exige conferência administrativa; não houve leitura/substituição de token, mudança de gate, exclusão, marcação remota de falso positivo, comentário ou envio externo.
