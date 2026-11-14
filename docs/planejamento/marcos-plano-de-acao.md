# Marcos Boé — responsabilidades e plano de ação

## Checkpoint atual — etapa 8 — 13/11/2026

**Etapas1–7 entregues à develop no escopo de Marcos; consolidação documental da etapa8 pronta para revisão/publicação autorizadas.** O #45 foi aprovado por `jovemOG-Dev` e mesclado em4525512; a branch local foi sincronizada por fast-forward com árvore executável idêntica. [Recibo de aprovação/merge/sincronização](../testes/marcos-8/encerramento-pr45.json). [Story Marcos-8](../stories/marcos-8.md), [CI45 e resultados](../testes/marcos-8-resultados.md), [dossiê preparado](../entrega/marcos-entrega-final.md). O [PR #42](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/42) foi aprovado por **jovemOG-Dev** e mesclado em **11a3a56** às20:15 de13/11 em São Paulo. Contém a integração RF12 aceita por Marcos, commit **b5d2e8a**, com package277, build97/346 e13cenários reais aprovados. [Resultados e limites](../testes/marcos-6-integracao-real-resultados.md), [aceite humano](../testes/marcos-6-integracao-real-aceite-2026-11-13.md).

A develop avançou depois para **b73c501** pelo [PR #43 — Q5](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/43): Administrador cancelando reserva de terceiro precisa de justificativa; o dono continua sem essa exigência. Essa compatibilidade e a regressão da nova base pertencem à etapa7, sem reabrir as entregas anteriores.

Após o aceite de Marcos, o [PR #44 documental](../testes/marcos-7-pr44-revisao.md) foi conferido e incorporado por fast-forward em **7d5480b**, sem mudança executável sobre b73c501. RTM/contrato conciliados e documentação histórica preservada. Nenhuma reexecução de testes atribuída a essa conferência.

Etapa7 publicada em **468bf0e**, branch `test/marcos-7-validacao-integrada`, [PR #45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45), destino develop7d5480b. Pasta principal agora na branch documental local **`docs/marcos-8-entrega-final`**, criada de468bf0e e sincronizada com a develop4525512; [story Marcos-8](../stories/marcos-8.md). A edição manual no cabeçalho de `marcos-fechamento-etapas-1-a-5.md` permanece preservada e fora do recorte autoral. Stashes/backups antigos não foram reaplicados; os outros worktrees conservam suas branches.

A [CI do PR42](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43524879086) passou nas etapas de testes Java/MySQL, JaCoCo e job JMeter, mas terminou com falha no scanner Sonar. Isso não é CI inteiramente verde. O encaminhamento compartilhado do scanner continua separado; CodeRabbit local permanece indisponível, sem aprovação presumida.

A [CI própria do PR45](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/actions/runs/43542757976) teve287Surefire/79Failsafe, JaCoCo92,58%linhas/76,39%branches e4cenários JMeter aprovados; o scanner Maven falhou em autorização/projeto, com workflow failure. O bot externo publicou [Quality Gate passed](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/45#issuecomment-6869673675). Os resultados distintos estão [relacionados com artefatos próprios](../testes/marcos-8/ci-pr45.json); nenhum aceite humano ou CI global verde é inferido.

Este é o plano vigente. A [versão anterior completa](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/b5d2e8a973afbc927b7d73dfc052a7cd02263dd4/docs/planejamento/marcos-plano-de-acao.md) conserva checkpoints e tabelas históricos. Não usar pendências antigas de GETs, Q9, telas ou publicação dos PRs já mesclados para orientar o trabalho atual.

## Escopo completo de Marcos

Marcos responde pelo frontend estático, clientes da API, navegação/feedback por perfil, responsividade/acessibilidade básica, testes da própria camada e contribuição para os E2Es, documentação e RTM. Java/SQL, regras de domínio, segurança do servidor, infraestrutura e provas globais mantêm seus responsáveis da equipe.

| Área / RF | Entrega de Marcos e validação |
|---|---|
| RF01 | Login/logout, sessão expirada, perfil e navegação; sessão/CSRF reais, sem guardar senha/token de sessão no navegador. |
| RF02 | Consulta/cadastro/manutenção administrativa de salas, docentes e materiais; formulários e estados ativo/restrito. |
| RF03 | Pesquisa/disponibilidade, filtros, paginação, carregamento, vazio e indisponível. |
| RF04 | Criação, consulta, edição e cancelamento; confirmação de retorno, PATCH conjunto, precisão das datas e compatibilidade Q5 vigente. |
| RF07 | Fila/detalhe, aprovação/rejeição, motivo da rejeição; somente RESPONSAVEL decide e o servidor aplica Q9/Q3/Q8. |
| RF08 | Interfaces administrativas de bloqueios e manutenção; consumir conflitos/expediente sem criar política local de colisão. |
| RF09 | Retirada/devolução, patrimônio, pendências e atraso; Administrador em leitura, sem liberar material só pela passagem do prazo. |
| RF10 | Preservar histórico, confirmar operações e relacionar auditoria/correlação dos próprios fluxos; persistência/grants são compartilhados. |
| RF11 | Mensagens coerentes com o resultado; modo simulado real e demonstração adotados no ADR-007, sem inventar caixa de notificações ou envio externo. |
| RF12 | Relatório por período/recurso, totais/minutos, vínculos, vazio e conflitos; API/serviço/cálculo da equipe. |
| RF13 | Desktop/celular, teclado, labels, foco, contraste, feedback, carregamento e envio único. |
| RF14 | Clientes JS, contratos/erros/datas/perfis e instruções reproduzíveis; documentação/rastreabilidade compartilhadas. |
| E2E | Navegador com Spring/MySQL reais nos fluxos previstos, evidências por cenário/camada/base e RTM com os responsáveis. |

RF05/RF06: a interface apresenta conflitos e testa os fluxos; sobreposição, locks e unicidade transacional continuam nas camadas de Silva/Fausto e nas provas compartilhadas. Botão desabilitado e resposta controlada não certificam concorrência ou autorização.

## Mapa de telas e fluxo

| Arquivo efetivo | Fluxo / situação |
|---|---|
| `login.html` | Login, recuperação explícita e entrada autenticada. |
| `index.html` | Identificação da sessão e atalhos por perfil; não promete lista de reservas embutida. |
| `pages/recursos.html` | Pesquisa/disponibilidade, filtros/paginação e seleção para reserva. |
| `pages/reservas.html` | Período/recursos, criação e comprovante do status retornado. |
| `pages/minhas-reservas.html` | Lista/detalhe autorizados, edição/cancelamento e confirmação. Justificativa administrativa Q5 é o recorte de compatibilidade atual. |
| `pages/aprovacoes.html` | Fila e decisões do Responsável, com escopo/negativas do servidor. |
| `pages/gestao-recursos.html` | Cadastros, manutenção, bloqueios e expediente do Administrador. |
| `pages/movimentacoes.html` | Retirada/devolução/pendências; Administrador somente em leitura. |
| `pages/relatorios-utilizacao.html` | Relatório RF12 real pelo menu ADMINISTRADOR. |

Fonte única: `backend/src/main/resources/static/`, HTML/CSS/JavaScript nativos. Node/Playwright são ferramentas de desenvolvimento; não há build de execução do produto nem fallback fictício. A prévia simulada de RF12 é exclusiva do servidor de teste, identificada como Dados simulados.

## Ordem de execução, sem sprints ou prazo inventado

| Ordem | Incremento | Estado vigente / saída |
|---|---|---|
| 0 | Contexto, contratos e responsabilidades | CONCLUÍDO; fontes e decisões identificadas. |
| 1 | API, sessão, CSRF e formulários | CONCLUÍDO no fechamento integrado1a5. |
| 2 | Acesso, navegação e perfis | CONCLUÍDO, com testes/aceites próprios e integração. |
| 3 | Pesquisa e reservas | CONCLUÍDO; #28/#29 e complementos, sem GET ausente. Compatibilidade Q5/#43 concluída na etapa7 e publicada no #45. |
| 4 | Fila, aprovação/rejeição e Q9 | CONCLUÍDO; #24/#26/#27, Q1/Q3/Q8 e ADR-007. |
| 5 | Administração e movimentações | CONCLUÍDO; #23 e complementos integrados. |
| 6 | Relatórios e mensagens coerentes com eventos | CONCLUÍDO no escopo de Marcos e INTEGRADO pelo #42, após #37/#39/#41. Testes e aceite humano próprios; RF11 conserva o modo adotado no fechamento1a5. |
| 7 | E2E real, regressão e acabamento | CONCLUÍDO E INTEGRADO: [Marcos-7](../stories/marcos-7.md), package287, build100/350 e sete suítes reais aprovadas; aceite do autor, aprovação independente e merge do #45 em4525512 confirmados. [Resultados locais](../testes/marcos-7-resultados.md) e [recibo integrado](../testes/marcos-8/encerramento-pr45.json). Scanner Maven e demais limites compartilhados mantêm seus resultados próprios. |
| 8 | Revisão e entrega final | CONSOLIDAÇÃO PRONTA PARA REVISÃO: aprovação/merge do #45 e sincronização confirmados; CI, dossiê/RTM e fechamento do escopo1–7 conferidos. Commit/push/PR documental autorizados. [Story](../stories/marcos-8.md); revisão/integração da própria consolidação e limites compartilhados conservam seus registros. |

A [entrega1a5](../testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json) está integrada pelos #36/#38. A [entrega6](../stories/marcos-6-integracao-real.md) foi aprovada e mesclada pelo #42. Não somar contagens históricas para declarar cobertura global ou converter aceite do autor em revisão independente.

## Etapa 7 — recorte e critérios atuais

**Execução atual:** compatibilidade Q5 e FE-007 corrigidas, gates e suítes reais aprovados; [matriz por RF/CT/camada](../testes/marcos-7-matriz-evidencias.md), [inventários/tentativas](../testes/marcos-7-resultados.md) e [roteiro e aceite do autor](../testes/marcos-7-verificacao.md). Não se somam contagens nem se atribui a esta execução aprovação de CI/produção. Os itens abaixo definem o ciclo; a parte técnica foi executada, e a revisão/entrega mantêm seus próprios critérios.

1. Conferir base/PRs/contratos, preservar alterações locais e atualizar o plano.
2. Conciliar a UI de cancelamento com Q5/#43: justificativa somente para Administrador em reserva de terceiro, máximo500, confirmação, texto seguro e nenhuma repetição automática. Dono, inclusive Administrador dono, mantém cancelamento sem justificativa.
3. Revalidar frontend e auxiliares atingidos por Q5/V7. Dados privados e JAR anterior preservados; mesmo ambiente isolado, fontes/JAR conferidos e API real sem interceptação.
4. Relacionar evidências de sessão/CSRF/perfis, pesquisa/reservas/decisões, manutenção/movimentações e RF12 por base/camada. Reutilizar provas existentes onde a fonte/cenário não mudou; executar novamente por mudança, falha ou risco concreto.
5. Registrar defeitos demonstrados, resultados/tentativas e capturas relevantes de desktop/celular; atualizar RTM/README/contratos/File List e preparar roteiro humano do incremento.
6. Apresentar o resultado a Marcos; aceite do novo recorte e revisão da equipe não são substituídos pelas capturas automatizadas. Commit/push/PR somente por solicitação própria.

A etapa7 não cria gráficos/CSV, novos relatórios, caixa de notificações, APIs de gestão de vínculos ou política de perfis. Não exige testar todas as combinações possíveis sem critério rastreável. A etapa8 conserva a revisão/entrega final, sem impedir correções proporcionais já autorizadas.

**Conferência solicitada antes do envio:** [checklist de evidências](../stories/marcos-7/qa/evidence_checklist.md) do relatório preliminar validado contra artefatos reais da CI44 e provas locais. As evidências obrigatórias Q5 estão presentes; o checklist global mantém Sonar aberto, confirmação TDD por autor e revisão/CI/entrega em seus estados próprios. Não foi declarada conclusão global nem autorizada publicação por esse pedido.

## Etapa 8 — revisão e entrega final

A liberação inicial de Marcos foi seguida pela confirmação real: Silva aprovou o #45 em2026-11-14T02:09:09Z e o PR foi mesclado em2026-11-14T02:09:17Z, commit4525512. A aprovação/integração foram relacionadas somente após constarem no GitHub; sincronização local e preservação de fontes/evidências estão no recibo.

| Tópico | Situação atual |
|---|---|
| 1. Revisão da equipe | CONCLUÍDA: aprovação efetiva de Silva confirmada e relacionada. |
| 2. Apontamentos | Conferência atual concluída: nenhum comentário humano de correção e0novos problemas informados pelo bot. Analisar novos apontamentos quando publicados. |
| 3. CI | Conferência concluída: testes/JaCoCo/JMeter aprovados; gate externo OK e scanner Maven falho registrados separadamente. |
| 4. Integração | CONCLUÍDA: merge4525512 confirmado e branch documental sincronizada por fast-forward; fontes/testes preservados. |
| 5. Consolidação | Documentação atualizada após integração; publicação autorizada por Marcos e revisão/integração do novo PR documental com ciclo próprio. |

[Story Marcos-8](../stories/marcos-8.md), [provas atuais](../testes/marcos-8-resultados.md) e [dossiê final preparado](../entrega/marcos-entrega-final.md). Sem nova execução local de testes ou código funcional: o merge integrou árvore já testada e idêntica. Publicação documental autorizada; as evidências anteriores mantêm suas origens.

## Dependências concretas para integração

- **Entregues:** autenticação/sessão, recursos/expediente, GETs e escritas de reservas, fila/Q9, administração/movimentações e RF12 HTTP.
- **Contrato atual Q5:** `POST /api/reservas/{id}/cancelamento` admite corpo opcional `{motivo}`; exige texto não branco de até500caracteres quando Administrador cancela reserva de terceiro. Coluna `motivo_cancelamento` na V7, separada de `motivo_decisao`. DTO não expõe o campo novo; não inventar exibição na tela.
- **Contratos formalizados:** [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md), [operações](../api/reservas-contrato.md), [consultas](../api/reservas-consulta-contrato.md), [fila](../api/reservas-leitura-contrato.md) e [RF12](../api/relatorios-utilizacao-proposta.md).
- **Equipe/infra:** encaminhamento do scanner Sonar e controles/demonstração no ambiente compartilhado. CodeRabbit indisponível localmente não recebe PASS presumido. Notificação simulada não comprova entrega externa.
- Acesso ADMIN do RF12 continua conforme a política provisória implementada; não alterar papéis ou abrir acesso pela interface para compensar essa decisão.

## Respostas adotadas para o contrato

ISO8601 com offset, exibição em America/Sao_Paulo e precisão preservada; PATCH substitui início/fim/recursos juntos;409/FORA_DO_EXPEDIENTE e envelope `{codigo,mensagem,correlationId}`. Solicitante consulta próprias reservas; Responsável exige todos os vínculos; Administrador consulta globalmente sem herdar decisões exclusivas do Responsável. Sem sessão401, detalhe fora do escopo404 e escrita sem permissão403.

Q1/Q3/Q8 permanecem vigentes: operações de uso exclusivas do Responsável, autoaprovação proibida e disponibilidade revalidada na aprovação. Q5 acrescenta a justificativa administrativa descrita acima. O servidor determina identidade/permissão e revalida estado/ocupação; o cliente não fabrica campos de autorização.

## Validação e evidências planejadas

| Frente | Referência existente / trabalho atual |
|---|---|
| Sessão, CSRF, expiração, pesquisa e concorrência pontual | [Complemento real1a5](../testes/marcos-fechamento-e2e-1-resultados.md), com limites e artefatos originais. |
| Q9, fila, autorização e Q8/MySQL | [Q9 integrado](../testes/marcos-integracao-q9-1-pr27-resultados.md), [evidência CI Q8](../testes/marcos-q8-pr34-evidencias.json) e novos gates pertinentes à base atual. |
| Vínculos e RF11 simulada | [Demonstração delegada](../testes/marcos-fechamento-delegado-1-resultados.md) e [procedimentos](../operacao/demonstracao-fechamento.md), sem envio externo ou implantação presumidos. |
| RF12 | [13cenários reais e277/97/346](../testes/marcos-6-integracao-real-resultados.md) pertencem à árvore anterior ao #43; novas execuções terão base/hashes próprios. |
| Regressão etapa7 | [Story atual](../stories/marcos-7.md): Q5, fixtures/V7 e matriz por RF/CT/camada, com resultados e aceite do autor registrados; PR44 documental incorporado sem mudar a árvore executável testada. |
| Entrega final | Aceite de Marcos registrado; revisão da equipe, checks e PR/merge próprios; RTM aponta as provas efetivas e suas limitações. |

CT14/17/18, CT16 e CT19 conservam os cenários existentes de segurança, retirada/devolução e disputa/edição conflitante. MySQL/Testcontainers e carga/JaCoCo são provas compartilhadas distintas dos testes de interface. As metas80%/70% do projeto não são inferidas de contagens de casos.

## Fluxo de trabalho e continuidade

Seguir [fluxo acordado](fluxo-de-trabalho-marcos.md): story/contrato antes do código, implementação do recorte, verificações proporcionais, evidências/documentação, revisão humana e commit quando solicitado. A autorização de publicar a etapa6 foi atendida pelo #42. Após aceite e conferência do checklist, Marcos autorizou expressamente commit/push/PR da etapa7 em13/11/2026; autorização atendida por468bf0e/#45. A aprovação real e o merge do #45 foram depois confirmados; Marcos autorizou commit/push/PR da consolidação8. Encerramento do escopo de Marcos não é aceite global/ATAM ou implantação de produção.

O histórico anterior, incluindo o [relatório de11/11](relatorio-marcos-2026-11-11.md) e a [versão anterior deste plano](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/b5d2e8a973afbc927b7d73dfc052a7cd02263dd4/docs/planejamento/marcos-plano-de-acao.md), permanece consultável. As descrições de endpoints/telas/publicações ausentes nesses registros pertencem àqueles momentos.
