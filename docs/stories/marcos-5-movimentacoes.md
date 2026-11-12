# Marcos-5-Movimentações — Retirada, pendências e devolução de materiais

## Status

Ready for Review

Recorte autorizado por Marcos em 11/11/2026 como complemento da etapa 5, implementado em `feature/marcos-movimentacoes`, baseada em `c395541`. Administração de recursos/manutenção/expediente permanece na story Marcos-5 e no PR 20. Esta story não avança para relatórios, fila de aprovação ou política Q9. Marcos confirmou o teste visual no Chrome e solicitou o commit em 11/11/2026. Implementação local da etapa 5 encerrada com esse aceite; integração real, revisão de outro integrante e CI permanecem pendentes.

## Story

Como Responsável, quero identificar a reserva e o patrimônio do material, registrar sua retirada e confirmar sua devolução entre as pendências, para acompanhar a custódia e o prazo com os dados confirmados pelo servidor. Como Administrador, quero consultar essas pendências conforme minha permissão.

Responsável: Marcos Boé. Rastreabilidade: RF09 (retirada, patrimônio, pendências, atraso e devolução), RF13 (responsividade, acessibilidade e feedback) e RF14 (clientes e documentação). Preparação AIOX SM; implementação AIOX Dev. Reutiliza os incrementos Marcos-1/2/3 para API, sessão, navegação, pesquisa e datas; a administração Marcos-5 permanece separada.

## Fontes

- [Plano: RF09/RF13/RF14](../planejamento/marcos-plano-de-acao.md#escopo-completo-de-marcos), [mapa de telas](../planejamento/marcos-plano-de-acao.md#mapa-de-telas-e-fluxo) e [etapa 5](../planejamento/marcos-plano-de-acao.md#ordem-de-execução-sem-sprints-ou-prazo-inventado), incluindo a autorização atual de Marcos registrada no Status desta story.
- [Item18: ativação e rotas](../api/item18.md#rotas), [DTO e regras](../api/item18.md#cadastro-e-retorno) e [erros e eventos](../api/item18.md#erros-e-eventos).
- [Marcos-5: incremento administrativo separado e limites de integração](marcos-5.md#status).
- [Marcos-3: pesquisa paginada, fuso e dependências](marcos-3.md).
- [ADR-001: fonte única estática e módulos nativos](../arquitetura/adr/ADR-001-monolito-modular-frontend-estatico.md#decisão), [ADR-004: sessão e CSRF](../arquitetura/adr/ADR-004-sessao-spring-security.md#decisão), [ADR-006: UTC, zona operacional e erros](../arquitetura/adr/ADR-006-timezone-expediente-notificacoes.md#decisão).
- Contrato efetivo verificado em `backend/src/main/java/br/senac/recursos/movimentacao/api/MovimentacaoController.java`, `movimentacao/dominio/Movimentacao.java`, `movimentacao/aplicacao/MovimentacaoService.java` e `movimentacao/infraestrutura/MovimentacaoMysql.java`.
- Pesquisa e detalhe verificados em `backend/src/main/java/br/senac/recursos/recurso/api/RecursoController.java` e no cliente `backend/src/main/resources/static/js/recursos.js`.

## Critérios de aceitação

1. Criar `pages/movimentacoes.html`, em HTML/CSS/JS nativos na fonte única `backend/src/main/resources/static/`, integrada à sessão, navegação e mensagens existentes. Atalho visível para RESPONSAVEL e ADMINISTRADOR. RESPONSAVEL pode consultar e operar; ADMINISTRADOR somente consulta. SOLICITANTE não acessa dados ou ações. A entrada direta verifica `auth.me()` e os perfis antes de revelar controles ou fazer GET de movimentações, pesquisa ou detalhe de recursos; o GET de autenticação é a exceção necessária. A guarda visual não substitui autorização real do servidor.
2. Consultar pendências por `GET /api/movimentacoes?abertas=true`. O retorno é um array simples ordenado por ID no backend, sem envelope, paginação nem filtros adicionais. Exibir carregando, vazio, erro e lista de retiradas abertas com número do movimento, recurso, reserva, responsável da retirada, instante de retirada e fim previsto. Este recorte não lista o histórico completo nem consulta `abertas=false`.
3. Para retirar, o Responsável informa o número positivo inteiro da reserva, obtido no comprovante, pesquisa MATERIAL por patrimônio com `recursos.pesquisar({tipo:'MATERIAL',patrimonio,pagina,tamanho})`, escolhe explicitamente um material retornado e confirma os números de reserva/recurso e sua identificação. A busca é parcial conforme o servidor; não escolher automaticamente o primeiro resultado nem presumir unicidade do texto. Usar paginação do servidor, página zero-based, tamanho padrão 20/máximo 100, total real e URLSearchParams. Trocar patrimônio, página, número da reserva ou seleção invalida a confirmação anterior; respostas antigas não restauram seleção nem sobrescrevem pesquisa atual. Não inventar GET, lista ou seletor de reservas disponíveis/aprovadas, nem depender de Q9.
4. Retirada envia somente `{reservaId,recursoId}` para `POST /api/movimentacoes/retiradas`, com sucesso 201 e DTO coerente com os IDs confirmados e operador/horários fornecidos pelo servidor. Não enviar ator, prazo ou datas calculadas pelo navegador. A API revalida material ativo/MATERIAL, vínculo com a reserva, estado APROVADA/EM_USO, horário `[inicio,fim)` e manutenção/retirada aberta. A interface não declara essas condições garantidas pela pesquisa e não altera estado da reserva. Só uma resposta válida da escrita confirma sucesso, permite limpar o formulário e atualizar pendências; falha na atualização posterior é distinguida da retirada já confirmada, sem repetir o POST.
5. Enriquecer identificação/patrimônio das pendências pelo `GET /api/recursos/{id}` autenticado já contratado, reutilizando o cliente existente ou extraindo leitura comum sem duplicar fontes. Respeitar identidade do ID ao associar o detalhe. Falha, 404, recurso inativo/inacessível ao perfil ou resposta incoerente do detalhe preservam a pendência e exibem identificação de fallback pelo número do recurso; a lista não desaparece por falha de enriquecimento. Respostas de uma consulta anterior não contaminam nova lista/seleção. Não exigir cadastro ativo ou detalhe bem-sucedido para devolver um movimento aberto.
6. Reconhecer o DTO `{id,recursoId,reservaId,responsavelId,retiradoEm,devolvidoEm,devolvidoPor,fimPrevisto,atrasoSegundos}` com IDs positivos inteiros seguros no cliente, instantes ISO 8601 válidos, inclusive `Z` e fração, e atraso inteiro não negativo. Campos extras não invalidam o contrato. Movimento aberto tem `devolvidoEm` e `devolvidoPor` ambos null; movimento devolvido tem ambos preenchidos. Rejeitar combinação parcial, IDs incompatíveis com a operação, duplicatas na listagem e respostas inconsistentes que impedem confirmação segura. Exibir instantes explicitamente em America/Sao_Paulo mesmo com navegador em outra zona; não anexar offset fixo nem depender da zona do sistema.
7. Manter material com retirada aberta como pendência mesmo após `fimPrevisto`. O backend não incrementa `atrasoSegundos` das abertas: esse campo pode permanecer zero. Mostrar prazo ultrapassado calculado pelo relógio do navegador apenas como estimativa identificada; não apresentá-lo como atraso final auditado, inventar cronômetro do servidor ou liberar o material pela passagem do tempo. Após devolução, exibir o atraso final em segundos/duração a partir de `atrasoSegundos` da resposta da API. Reserva e manutenção continuam relevantes à disponibilidade, mesmo depois da devolução.
8. Cada devolução exige confirmação explícita identificando movimento, reserva e material, e envia `POST /api/movimentacoes/{id}/devolucao` sem corpo. Só RESPONSAVEL recebe controles ou dispara escrita. Sucesso 200 exige movimento devolvido (devolvidoEm/devolvidoPor preenchidos) e coerente com movimento/recurso/reserva/retirada/prazo identificados. A API é idempotente e pode devolver a devolução previamente feita por outro operador: aceitar `devolvidoPor` diferente do usuário atual e mostrar quem consta na resposta, sem atribuir falsamente a operação a quem acabou de confirmar. Remover/encerrar a pendência apenas pela confirmação válida da API. Não prometer notificação enviada nem nova auditoria com base na interface.
9. Todas as escritas usam `api.js`, CSRF com nome de cabeçalho retornado e `criarEnvioUnico` instanciado fora dos listeners por formulário/ação. Sinalizar operação em andamento, bloquear envio simultâneo e impedir que seleção ou confirmação obsoleta seja usada enquanto ocorre trabalho assíncrono; validar o contexto antes de aplicar a resposta. Falhas liberam controles e preservam entradas/pendências recuperáveis. Não repetir escrita automaticamente após 400/401/403/404/409, timeout, rede ou resposta inválida; não presumir Idempotency-Key. Operação incerta exige reconsulta/correção explícita, sem afirmar que o servidor reverteu a escrita.
10. Tratar 400/401/403/404/409, erro genérico, rede e resposta inesperada com helpers existentes; 401 segue fluxo central de sessão. Inserir mensagens e dados recebidos por textContent, mantendo correlationId como referência separada. Permitir teclado, labels, foco previsível, leitura de mensagens e confirmação acessível em móvel e desktop. Mensagens de conflito preservam contexto sem expor dados privados ou afirmar sucesso/liberação/notificação.
11. Mocks ficam exclusivamente em testes; preview serve o frontend estático e o estado real de sessão/API. Não alterar Java, flags de ativação, provedores, dependências ou contratos do backend. Não habilitar APIs com provedores vazios, criar simulador no produto, implementar relatórios, histórico completo, aprovação, Q9 ou nova consulta de reservas neste incremento. A funcionalidade real depende da ativação/sessão/CSRF/eventos pela equipe e não se presume integrada pelos testes isolados.
12. Unitários verificam cliente/DTO/rotas/corpos, instantes com Z e fração, nullable pareado, atraso, validações e falhas. Navegador em dois viewports (móvel/desktop) cobre pesquisa paginada e seleção, retirada confirmada, pendência atrasada com atrasoSegundos zero, detalhe inacessível preservando devolução, confirmação/cancelamento, devolução idempotente por outro operador, perfis antes dos GETs, CSRF, duplo envio, XSS, falhas, resposta incoerente e respostas fora de ordem. Executar com zona Asia/Tokyo e verificar exibição operacional, teclado e foco. Regressões Marcos-1/2/3/5 devem passar; evidências não comprovam MySQL, autorização Spring ou concorrência real.
13. Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. Registrar comandos, ambiente, resultados e capturas reais de retirada e pendências nos dois viewports, sem contagens/metas presumidas. Atualizar documentação de consumo, plano como complemento parcial da etapa 5, RTM, checklist e File List. Integração real, revisão independente, CodeRabbit quando indisponível e CI ficam discriminados como pendentes; commit aguarda solicitação de Marcos após testes/revisão visual.

## Tasks / Subtasks

- [x] Criar cliente de movimentações com lista aberta, retirada e devolução; validar DTO/compatibilidade de respostas (AC 2, 4, 6, 8–9).
- [x] Criar página e atalho por perfil, verificando sessão antes de consultas/ações; manter ADMINISTRADOR em leitura (AC 1).
- [x] Implementar número de reserva, pesquisa paginada MATERIAL/patrimônio, escolha e confirmação explícitas, invalidando contexto obsoleto (AC 3–4, 9).
- [x] Renderizar pendências com enriquecimento por detalhe e fallback de identificação, preservando registros em falhas (AC 2, 5–6).
- [x] Exibir prazo/estimativa e atraso final com fuso operacional; manter pendência após o prazo (AC 6–7).
- [x] Implementar devolução confirmada/idempotente e operador real da resposta, sem corpo nem retry automático (AC 8–9).
- [x] Revisar mensagens, CSRF, guard, acessibilidade, textContent, falhas e contextos assíncronos (AC 9–11).
- [x] Executar unitários, navegador móvel/desktop em Asia/Tokyo e regressões; produzir capturas/evidências reais (AC 12).
- [x] Executar gates; atualizar docs de consumo, plano, RTM, checklist e File List com limites da evidência (AC 13).
- [x] Apresentar revisão visual e aguardar solicitação de commit de Marcos após validação (AC 13).
- [ ] Obter integração real, revisão de outro integrante e CI antes da entrega integrada.

## Dev Notes

Usar `backend/src/main/resources/static/` como fonte única. Arquivos previstos: `pages/movimentacoes.html`, `js/movimentacoes.js`, `js/movimentacoes-page.js` e CSS específico se necessário, além da navegação existente. Reutilizar `api.js`, `auth.js`, `forms.js`, `sessao-page.js`, `ui.js`, `datas.js`, `recursos.js` e a leitura de detalhe já presente na administração, preservando as fronteiras de permissão na página. Testes previstos em `tests/unit/frontend/` e `tests/browser/`. File List final será preenchida pelo implementador com os arquivos realmente modificados.

GET de abertas retorna `List<Movimentacao>`, não paginação; `MovimentacaoMysql.listar` seleciona `devolvido_em IS NULL` com ordem por id. O serviço de retirada usa relógio do servidor e fim da reserva; devolver independe do estado atual da reserva e retorna o movimento já fechado quando repetido. Essa idempotência não autoriza retry automático do frontend nem exige que devolvidoPor seja o operador atual. Não acrescentar exigência de empréstimo pertencer ao responsável que devolve: o serviço exige papel RESPONSAVEL.

Preservar a diferença entre confirmação válida da escrita, erro de recarga posterior e resultado incerto por rede/resposta inválida. Não atribuir sucesso com base apenas em HTTP ou em desaparecimento do item durante recarga. A listagem de pendências é a fonte deste recorte; o número da reserva é entrada do comprovante e a decisão de elegibilidade permanece na API.

As flags `recursos.api.enabled`, `reservas.api.enabled` e `movimentacoes.api.enabled` permanecem como estão. Sessão real, CSRF, AtorAutenticadoProvider e EventosDominioPort são responsabilidade da integração com a equipe. Nenhuma evidência com mocks substitui essa integração. A documentação descreve notificação transacional pendente, mas o frontend não recebe confirmação de entrega e não anuncia envio.

## Validação de preparação

Checklist story-draft-checklist aplicado às fontes locais: objetivo/contexto, dependências, contratos, referências, autocontenção e critérios testáveis conferidos. Resultado de preparação: READY; não equivale a aprovação independente de PO/QA. A autorização de Marcos cobre este recorte e a separação da administração/PR 20. Story local, sem ClickUp configurado. O greeting por script foi tentado e está indisponível por ausência de js-yaml; a identificação textual AIOX SM foi utilizada sem instalar dependências.

## CodeRabbit Integration

Tipo principal Frontend; secundários Integração e Segurança; complexidade média. Implementação @dev, revisão visual/acessibilidade @ux-design-expert e revisão independente @qa. Gates pré-commit: lint, checkJs/typecheck, unitários, navegador/regressões e CodeRabbit quando disponível; pré-PR @devops com revisão humana e CI. Focos: perfis antes dos GETs, contratos de movimentação, campos nullable, Instant/Z, fuso, seleção obsoleta, guarda de envio, CSRF, XSS, idempotência com outro operador, preservação de pendências e ausência de APIs fictícias. Self-healing @dev light: até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Indisponibilidade do CLI será registrada sem alegar revisão aprovada. Gates não autorizam commit sem solicitação de Marcos.

## Dev Agent Record

### Completion Notes

Incremento implementado localmente em feature/marcos-movimentacoes, a partir de c395541, sem acrescentar alterações à branch do PR 20. Nova página, cliente e CSS de movimentações usam API/sessão/guard/datas/pesquisa existentes. Responsável opera, Administrador consulta e Solicitante não dispara consultas de dados. Nenhum Java, flag, provedor ou dependência foi alterado.

Retirada usa número da reserva e escolha explícita de MATERIAL/patrimônio, sem GET de reservas/Q9. Pendências abertas preservam registros após o prazo e quando a identificação falha, com devolução disponível pelo número do material. Instantes são exibidos em São Paulo; atraso de aberta é estimativa identificada, e atraso final vem da API. Confirmação de devolução aceita operador diferente em retorno idempotente e não promete nova disponibilidade/notificação.

Rodada final npm run build exit 0: lint/checkJs sem diagnósticos, 57 unitários (12 novos) e 190 execuções de navegador (60 novas/130 regressões), zero falhas/ignorados/retries. Casos de movimentações usam Asia/Tokyo em desktop/móvel. Quatro capturas conferidas visualmente. [Comandos, evidências e limites](../testes/marcos-5-movimentacoes-resultados.md).

A primeira rodada passou 57 unitários/180 navegador, mas não cobria FE-003: confirmação anterior após rede/resposta incoerente permitia reenvio manual sem reconsulta. Revisão QA apontou o caso, corrigido com flags de operação incerta, GET bem-sucedido e nova confirmação; regressões ampliadas nas duas escritas, inclusive GET falho não liberando reenvio. Evidência anterior preservada; não se afirma TDD retroativo. [Autoavaliação DoD/self-critique](../testes/marcos-5-movimentacoes/autoavaliacao.json).

Marcos forneceu em 11/11/2026 a reexecução do CMD: npm run build com lint/tipos sem diagnósticos, 57 testes unitários e 190 testes de navegador aprovados (1,9 min). Anexo preservado integralmente em docs/testes/marcos-5-movimentacoes-verificacao-marcos.txt, com hash conferido e separado das evidências anteriores. Não se atribui aceite visual ou revisão independente à execução automatizada do autor.

Após a reexecução automatizada, foi aberta a pedido de Marcos uma janela do Chrome com perfil Responsável, dados fictícios e interceptação da API nessa sessão. O auxiliar temporário ficou fora do repositório; produto, configuração e testes aprovados não foram alterados para a prévia. Marcos confirmou que testou a tela e autorizou o commit em 11/11/2026. Esse aceite não atribui teste manual de todos os cenários nem revisão independente ao autor.

Administração e movimentações completam a implementação local da etapa 5, com aceite de Marcos nos dois incrementos. A story permanece Ready for Review: revisão humana de outro integrante, CodeRabbit/CI e integração real continuam pendentes. Preview do projeto permanece estático; nenhum auxiliar temporário integra o commit. Este resultado local não comprova Spring Security, MySQL, eventos ou concorrência.

### Agent Model Used

Codex, preparação AIOX SM e implementação AIOX Dev; revisão assistida AIOX QA discriminada abaixo.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-11 | Marcos confirmou o teste visual no Chrome e solicitou o commit de movimentações. Checklist atualizado e implementação local da etapa 5 encerrada; revisão da equipe, CI e integração permanecem pendentes. |
| 2026-11-11 | Story Ready for Dev preparada como complemento da etapa 5/RF09, com contratos item18 e autorização de Marcos; administração/PR 20 e relatórios separados. |
| 2026-11-11 | Incremento implementado e validado localmente: 57 unitários/190 navegador aprovados; FE-003 corrigido após revisão. Story Ready for Review; aceite, commit e integração pendentes. |
| 2026-11-11 | Registrada saída de reexecução pelo Marcos, com lint/tipos e 57 unitários/190 navegador aprovados; aceite visual, commit e integração mantidos pendentes. |

### File List

Arquivos criados ou alterados neste incremento:

- `docs/stories/marcos-5-movimentacoes.md`
- `backend/src/main/resources/static/pages/movimentacoes.html`
- `backend/src/main/resources/static/js/movimentacoes.js`
- `backend/src/main/resources/static/js/movimentacoes-page.js`
- `backend/src/main/resources/static/css/movimentacoes.css`
- `backend/src/main/resources/static/js/navegacao.js`
- `eslint.config.js`
- `tests/unit/frontend/movimentacoes.test.js`
- `tests/browser/movimentacoes.spec.js`
- `tests/browser/acesso.spec.js`
- `docs/api/frontend-integracao.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/RTM.md`
- `docs/qualidade/defeitos-frontend.md`
- `docs/testes/marcos-5-movimentacoes-resultados.md`
- `docs/testes/marcos-5-movimentacoes-verificacao.txt`
- `docs/testes/marcos-5-movimentacoes-verificacao-marcos.txt`
- `docs/testes/marcos-5-movimentacoes-primeira-execucao.txt`
- `docs/testes/marcos-5-movimentacoes/resultados.json`
- `docs/testes/marcos-5-movimentacoes/primeira-execucao.json`
- `docs/testes/marcos-5-movimentacoes/autoavaliacao.json`
- `docs/testes/marcos-5-movimentacoes/pendencias-desktop.png`
- `docs/testes/marcos-5-movimentacoes/pendencias-mobile.png`
- `docs/testes/marcos-5-movimentacoes/retirada-desktop.png`
- `docs/testes/marcos-5-movimentacoes/retirada-mobile.png`
- `README.md`
- `docs/README.md`

## QA Results

Parecer assistido AIOX QA: PASS no recorte frontend local. FE-003 corrigido e coberto por regressões; nenhum finding material remanescente. Conferidos fonte, contratos Java/item18, documentação, checklist/File List, quatro capturas e evidências: lint/checkJs/build aprovados, 57 unitários e 190 testes de navegador sem falhas. Revisão somente leitura, sem repetir a suíte ou alterar arquivos. Marcos posteriormente confirmou o teste visual e autorizou o commit. Revisão humana de outro integrante, CodeRabbit, CI e integração real continuam pendentes; não se presume prova de segurança Spring, MySQL, eventos ou concorrência.
