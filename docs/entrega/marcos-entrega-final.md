# Marcos — dossiê de entrega final

**Estado em13/11/2026:** etapas1–7 integradas; consolidação documental da etapa8 pronta para revisão/publicação autorizadas. [Story Marcos-8](../stories/marcos-8.md), [conferência atual](../testes/marcos-8-resultados.md) e [plano vigente](../planejamento/marcos-plano-de-acao.md).

## Entrega e versões

As interfaces de Marcos estão reunidas na árvore `468bf0e600de10682b28c9952905cdb062193315`. Etapas1–6 já integradas à develop; a etapa7, aceita pelo autor, foi publicada no [PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45), destino develop7d5480b. O PR foi aprovado por Silva (`jovemOG-Dev`) e mesclado em **4525512**, seguido de sincronização local por fast-forward com a develop. [Recibo de aprovação/merge/conferência](../testes/marcos-8/encerramento-pr45.json). A árvore executável permanece idêntica a468bf0e; a confirmação posterior substitui a situação de review aguardado da inspeção inicial, preservada como histórico.

| Área | Entrega de Marcos | Fonte principal |
|---|---|---|
| Acesso / RF01 |Login/logout, sessão/CSRF, recuperação, expiração e navegação por perfil. |`login.html`, `index.html`; [contrato frontend](../api/frontend-integracao.md). |
| Recursos / RF02/RF03/RF08 |Pesquisa/disponibilidade, seleção, gestão por tipo, expediente, manutenção e bloqueios. |`pages/recursos.html`, `pages/gestao-recursos.html`; [item18](../api/item18.md). |
| Reservas / RF04/RF07 |Criação, consulta/detalhe, edição, cancelamento, fila e decisões; compatibilidade Q5, Q9/Q1/Q3/Q8 consumidas. |`pages/reservas.html`, `pages/minhas-reservas.html`, `pages/aprovacoes.html`; [contrato](../api/reservas-contrato.md). |
| Movimentações / RF09 |Retirada/devolução/pendências, atraso e permissões por perfil. |`pages/movimentacoes.html`; [resultados](../testes/marcos-5-movimentacoes-resultados.md). |
| Relatórios / RF12 |Tela/menu ADMIN, filtros/período, totais, minutos e conflitos com rota real. |`pages/relatorios-utilizacao.html`; [contrato HTTP](../api/relatorios-utilizacao-proposta.md). |
| RF10/RF11/RF13/RF14 e E2E |Mensagens/histórico coerentes, responsividade/teclado, contratos e provas reais de sessão/permissão/persistência/trilhas; demonstração RF11 simulada. |[RTM](../RTM.md), [matriz RF/CT](../testes/marcos-7-matriz-evidencias.md) e [demonstração](../operacao/demonstracao-fechamento.md). |

Caminhos HTML relativos a `backend/src/main/resources/static/`. Backend, regras de domínio, SQL, segurança do servidor, infraestrutura e critérios globais conservam seus responsáveis. RF05/RF06 são tratados nas mensagens/testes da interface e nas provas transacionais compartilhadas; o botão não implementa a proteção contra dupla reserva.

## Referências de integração

- Etapas1–5: [encerramento integrado #36/#38](../testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json), após as entregas de administração/movimentações, fila/Q9 e consulta/edição/cancelamento.
- Etapa6: [PR #42](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/42), integração RF12 após #37/#39/#40/#41, aceite e merge11a3a56.
- Etapa7: commit468bf0e/#45, Q5 e regressão integrada, documentação conciliada com #44. [Story/File List](../stories/marcos-7.md) e [aceite de Marcos](../testes/marcos-7-verificacao.md#aceite-do-autor--13112026).
- Etapa8: branch `docs/marcos-8-entrega-final`, sincronizada com4525512; commit/push/PR da consolidação autorizados por Marcos. Esse dossiê, a prova da CI45 e o recibo de integração constituem a entrega documental para revisão.

## Evidências para revisão

| Camada / origem | Resultado e interpretação |
|---|---|
| Frontend local da etapa7 |Lint/typecheck,100unitários/350navegador aprovados; APIs controladas nessa camada. [Manifesto58fontes](../testes/marcos-7/regressao-frontend.json). |
| Backend local da etapa7 |Maven `package -DskipITs`,287unitários/HTTP. Não é verify/Testcontainers local. |
| Suítes reais da etapa7 |Smoke16/0/0, Q5:8/0, Q9:12/0, consulta8/0, fechamento11/0, RF12:13/0 e demonstração8/0. [Resultados/origens/limites](../testes/marcos-7-resultados.md). Não somar como cobertura global. |
| CI própria do PR45 |287Surefire/79Failsafe,0falhas/erros/ignorados; JaCoCo92,58%linhas/76,39%branches e4cenários JMeter aprovados. ZIPs/XML/JTL inspecionados, com digests conferidos. [Prova estruturada](../testes/marcos-8/ci-pr45.json). |
| Sonar e resultado global da CI45 |Bot externo informa Quality Gate passed; scanner Maven falha em autorização/projeto e workflow termina failure. [Resultado e links separados](../testes/marcos-8-resultados.md). |
| Aceites |Aceite do autor registrado na etapa7; aprovação independente efetiva de Silva no #45 confirmada no recibo. CodeRabbit local indisponível, sem aprovação presumida. |

## Como reproduzir e revisar

1. Usar a versão identificada nos inventários e conferir o [guia do E2E local](../integracao/marcos-e2e-local.md), que prepara ambiente isolado e conta fictícia local. Senhas/dumps/logs brutos/ZIPs não integram a entrega pública.
2. Para a regressão frontend, seguir o guia e executar `npm.cmd run build` com Chrome/Chromium configurado. Para API real, usar Spring/MySQL com propriedades explícitas conforme o guia; o preview estático serve a interface e não substitui sessão/API.
3. Reutilizar o [roteiro humano Q5](../testes/marcos-7-verificacao.md). Os IDs das massas antigas identificam aquela execução; para novo teste, gerar massa nova pelo auxiliar indicado, sem editar estados diretamente no banco.
4. Conferir [RTM](../RTM.md), contratos, matriz e evidências por camada. RF11 da demonstração usa worker/gateway simulado reais e URL externa vazia; não é entrega externa de mensagem.

## Integração realizada e conferência

1. Aprovação de `jovemOG-Dev` confirmada em2026-11-14T02:09:09Z e merge em2026-11-14T02:09:17Z, commit4525512. O SHA `b565df3` permanece identificado como merge de teste da CI.
2. Documentos locais e cabeçalho manual preservados por backup/hashes; stashes/worktrees anteriores conservados.
3. Executados `git fetch origin` e `git merge --ff-only origin/develop` na branch documental, após conferir ancestralidade e ausência de diferenças entre árvores468bf0e/4525512.
4. Conferidos236arquivos executáveis/configurações,68fontes reais/58do manifesto frontend e17artefatos anteriores, todos preservados. Sem nova execução de testes/build porque o merge não mudou fontes/cenários.
5. Dossiê, plano, RTM e stories atualizados com os registros efetivos. Commit/push/PR da consolidação8 autorizados; a revisão/integração desse novo PR conserva seu ciclo próprio.

## Pendências e responsabilidades

| Pendência | Responsável / condição de encerramento |
|---|---|
| Review do PR45 |CONCLUÍDO: aprovação efetiva de `jovemOG-Dev` confirmada no GitHub. |
| Integração/sincronização |CONCLUÍDA: merge4525512, fast-forward e conferência de fontes/evidências documentados. |
| Scanner Maven Sonar |Débora/administração da integração: conferir token/chaves/acesso e registrar execução válida. O gate externo OK fica documentado separadamente. |
| TDD histórico RF07 |Respectivo autor/equipe: confirmar o ciclo descrito em [rf07-fila-tdd.md](../testes/rf07-fila-tdd.md). Q5 tem RED/GREEN comprovados, sem REFACTOR separado presumido. |
| Controles operacionais compartilhados |Responsáveis de banco/segurança: evidenciar grants/runtime/implantação nos ambientes aplicáveis; as provas locais não certificam produção. |
| Aceite coletivo/ATAM |Equipe: registrar a decisão coletiva contra escopo e evidências. Aceite de Marcos ou bot não substitui essa decisão. |

## Critérios para registrar o encerramento

- [x] Implementação/testes/aceite local da etapa7 e commit/push/PR publicados.
- [x] CI45 e artefatos conferidos; resultados divergentes do Sonar separados.
- [x] Dossiê, rastreabilidade e instruções preparados com provas e limites.
- [x] Aprovação independente efetiva relacionada.
- [x] Merge na develop, sincronização e conferência integrada registrados.
- [ ] Consolidação final revisada/publicada pelo fluxo e pendências compartilhadas com situação efetiva.

Essa lista registra o encerramento do escopo integrado de Marcos e mantém a revisão/integração da consolidação documental e as pendências compartilhadas identificadas. Aprovação/merge foram relacionados somente após confirmação; não se declara implantação de produção ou decisão coletiva por antecipação.
