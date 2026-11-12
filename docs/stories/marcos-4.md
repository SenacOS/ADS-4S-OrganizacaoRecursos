# Marcos-4 — Fila de aprovação e decisão de reservas restritas

## Status

Ready for Review

Aceite visual do frontend informado por Marcos em **12/11/2026**, após revisão no Chrome da versão sincronizada `a8da77c`, com perfil Responsável e dados fictícios. Nenhum ajuste funcional foi solicitado. [Registro do aceite e limites](../testes/marcos-4-aceite-visual-2026-11-12.md). Revisão da equipe e entrega integrada continuam pendentes.

Incremento local conciliado com administração/movimentações em `feature/marcos-4-aprovacoes`, base `f7360a2`, conforme autorização de Marcos em 11/11/2026. O checkout separado reúne as etapas 4 e 5; pasta original e evidências anteriores preservadas. Regressão conjunta aprovada e reexecutada pelo autor: 68 unitários e 238 execuções de navegador. [Resultados e reprodução](../testes/marcos-4-conciliacao-resultados.md). Após os testes, Marcos solicitou explicitamente o commit em 11/11/2026. O pedido autoriza o versionamento local; não descreve separadamente a revisão visual nem aprova a entrega integrada. Push pelo usuário permanece separado.

A [Q9 comunicada por Marcos](../api/reservas-politica-leitura-q9.md) define a consulta do Responsável para recursos sob sua responsabilidade. O adaptador SQL da fila já chegou à develop pelo PR #22 e foi incorporado neste checkout em 12/11/2026. Contrato revisado, vínculo de responsabilidade, controller HTTP, autorização real e E2E integrado continuam necessários à entrega integrada. Ver [plano e contexto](../planejamento/marcos-plano-de-acao.md) e [sincronização após o PR #23](../testes/marcos-sincronizacao-2026-11-12-resultados.md).

## Story

Como Responsável, quero consultar solicitações pendentes com solicitante, período e recursos identificados, para aprovar ou rejeitar com motivo e acompanhar o resultado confirmado.

Responsável: Marcos Boé. RF07, RF13, RF14. Preparação AIOX SM e implementação AIOX Dev. Continuação do plano autorizada por Marcos nesta sessão, mantendo contratos atuais, testes automatizados, validação humana e commit somente quando solicitado.

## Fontes e dependências

- [Etapa 4 do plano](../planejamento/marcos-plano-de-acao.md#ordem-de-execução-sem-sprints-ou-prazo-inventado).
- [Especificação da fila aceita por Marcos](../api/reservas-leitura-contrato.md): GET /api/reservas com status SOLICITADA, filtro opcional de sobreposição, recurso e paginação, exclusivo de RESPONSAVEL.
- [POSTs e resposta de decisão](../api/reservas-contrato.md#endpoints).
- ADR-001/004/005/006: frontend estático, sessão/CSRF, aprovação exclusiva de Responsável, pendências sem expiração e datas em São Paulo.
- Marcos-1/2/3: clientes de escrita, guard de formulário, sessão/navegação, CSS, conversão de datas e testes Playwright disponíveis.

O contrato da fila é uma especificação do cliente, não um endpoint implementado. Controller/porta de leitura e revisão da projeção/autorização ainda pertencem a Silva/Fausto/Débora. A develop remota foi conferida e permanece em 395ac73; nenhuma dependência foi integrada por esta story. Edição/cancelamento/listagem geral da etapa 3 continuam pendentes de seus próprios contratos/Q9.

## Critérios de aceitação

1. Criar pages/aprovacoes.html com fonte única static/, CSS nativo e módulos ES. Reutilizar sessão/navegação; link disponível somente a RESPONSAVEL. Solicitante e Administrador acessando a URL diretamente recebem mensagem de acesso negado, sem consultar fila ou oferecer ações.
2. Cliente exclusivo da fila segue a especificação: status fixo SOLICITADA, início/fim opcionais juntos com offset e fim posterior, recursoId positivo, pagina >=0, tamanho 1–100 (padrão 20). Filtro temporal pode abranger vários dias. Paginação/filtros/ordem são do servidor; não obter todas as reservas e filtrar localmente.
3. Validar envelope, estado SOLICITADA/restrita=true, datas, IDs, identificação mínima do solicitante e recursos legíveis correspondentes aos recursosIds. Resposta incoerente não revela itens parciais nem libera decisão. Não acrescentar dados pessoais ou campos não contratados.
4. Exibir carregando, vazio, erro, paginação e atualização explícita. Alterar filtros invalida resultados/detalhes; resposta atrasada não substitui filtros atuais. Nova pesquisa começa na página zero.
5. Selecionar uma solicitação da página mostra solicitante, período em São Paulo, identificação/patrimônio dos recursos e estado. Não inventar GET de detalhe nem permitir entrada manual de ID para decidir.
6. Confirmar aprovação ou rejeição; motivo obrigatório e não vazio na rejeição. Reutilizar reservas.aprovar/rejeitar, CSRF dinâmico e guard de formulário. Não enviar identidade/papel/status no corpo.
7. Sucesso somente após resposta coerente com id, solicitante, período, recursos e status esperado. Após decisão confirmada, retirar detalhes antigos e refazer a leitura da página. Se a página esvaziar após remoção e houver página anterior, consultar essa página; não repetir POST.
8. Se o POST for confirmado e o GET seguinte falhar, manter o sucesso da decisão e explicar a falha de atualização separadamente. Não reapresentar a decisão como não realizada nem oferecer repetir sobre dados antigos.
9. 400/401/403/404/409, rede e resposta inválida recebem feedback textual e referência de suporte; sem retry automático de escrita. Em 409, permitir atualizar a fila. Em rede/resposta inválida após escrita, orientar conferir o resultado antes de reenviar. Preservar motivo recuperável sem afirmar sucesso.
10. Cliques simultâneos fazem um POST e não alteram o busy/rótulo do primeiro. Bloquear filtros, paginação e troca de solicitação durante decisão. Nenhuma pendência expira por regra do navegador.
11. Layout móvel/desktop, labels, teclado, foco, mensagens acessíveis e textContent. Nenhuma persistência de sessão ou dados da fila em storage.
12. API controlada somente em testes; preview não simula autenticação/fila. Não implementar Java, habilitar APIs ou declarar autorização de servidor/E2E integrado.
13. Executar lint, typecheck, testes e build. Cobrir cliente/datas, perfis, decisão, erros, resposta atrasada, recarga pós-decisão, envio único e responsividade, preservando regressões existentes. Atualizar API, plano, RTM, evidências, checklist e File List.

## Tasks / Subtasks

- [x] Sincronizar em 12/11/2026 a Marcos-4 df57063 com a develop 23cf839, sem conflitos ou mudanças no frontend; registrar regressão de 68 unitários/238 navegador e preservar o plano local.
- [x] Atualizar com backend/base consolidada em 11/11/2026; conciliar RTM e revalidar 68 unitários/238 navegador, mantendo a evidência anterior.

- [x] Implementar cliente da fila/decisão e validação com testes unitários (AC 2, 3, 6, 7, 9).
- [x] Criar página responsiva e guarda visual por perfil (AC 1, 5, 11).
- [x] Implementar filtros, paginação, detalhes, decisão e atualização segura (AC 4–10).
- [x] Executar testes de navegador e regressões completas (AC 11–13).
- [x] Registrar evidências e atualizar API/plano/RTM/checklist/File List (AC 13).
- [x] Conciliar a Marcos-4 com administração/movimentações em branch própria, preservando a pasta original e as evidências anteriores.
- [x] Validar navegação e regressão conjunta das etapas 4 e 5; registrar nova execução separadamente da evidência de 10/11/2026.
- [x] Registrar reexecução automatizada apresentada pelo Marcos no checkout conciliado: 68 unitários/238 navegador aprovados, separada do aceite visual.
- [ ] Obter revisão coletiva do contrato da fila e resolver rota/status, identidade, competências e erros antes de retomar a implementação, conforme alinhamento de 11/11/2026.
- [ ] Obter implementação/revisão de backend, integração real, revisão independente e CI.
- [x] Registrar reexecução aprovada do autor e solicitação explícita de commit em 11/11/2026.
- [x] Registrar aceite visual informado por Marcos em 12/11/2026 para a interface conciliada/sincronizada, com dados fictícios e roteiro apresentado.

## Dev Notes

Não confundir o GET especificado exclusivamente para fila com listagem geral ou GET /api/reservas/{id}. O cliente usa apenas status SOLICITADA e o envelope documentado; aprovação não é herdada por Administrador. Dados da sessão vêm de auth.me e os POSTs já existem nos clientes. Não implementar conflito de agenda, expiração de pendência ou política Q9 no navegador. O filtro de consulta admite vários dias, sem alterar a regra diária de criação de reserva. Nenhuma dependência nova.

Preparação conferida com plano, especificação e stories anteriores. Autorizações desta sessão permitem implementar o cliente dessa especificação sem declarar endpoints existentes. Revisão independente de PO não é atribuída. Greeting AIOX segue indisponível por falta de js-yaml; não alterar o framework para esta tarefa.

## CodeRabbit Integration

Tipo: Frontend/Integração. @dev executa gates e autoavaliação; revisão visual/qualidade e backend pendentes. Focos: projeção mínima, perfis, validação de resposta, envio único, datas e distinção entre decisão confirmada e falha de recarga. CLI/WSL estavam indisponíveis; registrar o limite. Nenhum parecer independente é presumido.

## Dev Agent Record

### Completion Notes

Após o aceite visual, Marcos solicitou em 12/11/2026 “vamos fazer o commit”, autorizando versionar os seis documentos do registro. Nenhuma alteração funcional ou nova execução de testes foi necessária; publicação remota e mudança do PR continuam separadas.

Em 12/11/2026 foi aberta revisão visual da fila no Chrome com perfil Responsável e 21 solicitações fictícias, permitindo filtros, paginação e decisões em memória. Auxiliar temporário fora do projeto, com aviso e restauração por F5. Após receber o roteiro de avaliação/aprovação/rejeição, motivo, filtros/vazio, paginação e layout/teclado, Marcos informou “está aprovado”. [Aceite do autor](../testes/marcos-4-aceite-visual-2026-11-12.md) registrado sem atribuir execução individual de todos os cenários, E2E real ou revisão independente. Alterações somente documentais; nenhuma nova execução de testes, commit, push ou alteração de PR nesta rodada de registro.

Em 12/11/2026, Marcos solicitou a sincronização. Plano local preservado por cópia/hash, referências atualizadas com fetch e criada a branch local acompanhando origin/feature/marcos-4-aprovacoes. Merge de develop 23cf839 sobre df57063 preparado sem commit automático e sem conflitos; 45 arquivos de frontend/testes/configuração preservados. Regressão completa aprovada: lint/typecheck, 68 unitários e 238 navegador (119 por viewport), zero falhas/ignorados/flaky/retries, 2,4 min no navegador. Registro local da incorporação após validação; sem push ou alteração do PR #24, que já aponta à develop e continua Draft. [Evidências desta sincronização](../testes/marcos-sincronizacao-2026-11-12-resultados.md). Não se atribui novo aceite visual, revisão independente, Maven ou E2E real a esta execução.

Atualização autorizada após o push de `e33de6d`: importada a base consolidada `8df312e` (etapa 5 e entregas da equipe), com conflito somente na RTM. Matriz e evidências preservadas; nenhum arquivo estático/teste/configuração do frontend mudou. Nova regressão completa aprovada: lint/tipos, 68 unitários e 238 navegador, zero falhas/ignorados/flaky/retries. [Resultados desta atualização](../testes/marcos-integracao-2026-11-11-resultados.md). A etapa 5 tem PR #23 para develop; Marcos-4 segue separadamente. Leitura HTTP/Q9 e E2E real continuam pendentes.

Autorização de versionamento recebida em 11/11/2026: após apresentar a execução aprovada de 68 unitários/238 testes de navegador no checkout conciliado, Marcos pediu "vamos fazer o commit". Registrado o pedido sem atribuir revisão visual detalhada não informada, revisão de outro integrante ou validação com backend real. Commit preparado somente para o incremento da Marcos-4 sobre a base de movimentações; sem push automático. Os registros abaixo mantêm a sequência das validações anteriores.

Preparação documental do commit: no relatório de contexto, seis quebras de linha Markdown foram convertidas de duplo espaço para barra invertida explícita, preservando o texto e a apresentação. O arquivo original integral permanece na pasta original e no backup conferido por SHA-256. Nenhum código do produto ou teste mudou após a execução aprovada do autor.

Retomada de 11/11/2026 em `feature/marcos-4-aprovacoes`, base `f7360a238ac36ea672955c421ee44557436f1c7c`. Backup de 29 arquivos locais conferido por SHA-256; pasta original em `feature/marcos-base-frontend` preservada. Esta rodada concilia navegação/testes/documentação com os incrementos já publicados da etapa 5 e não implementa portas/SQL/controllers ou novas permissões.

Conciliação concluída no recorte local: navegação preserva Aprovações, Gestão e Movimentações conforme o perfil; regressão de acesso verifica cada href e página. Texto da fila alinhado ao escopo da Q9, cuja aplicação real continua no backend. Código específico da etapa 5, Java, flags, dependências e configuração de testes preservados. `npm run build` final: exit 0, lint/checkJs sem diagnósticos, 68 unitários e 238 execuções de navegador aprovadas (119 por viewport), zero falhas/ignorados/retries. [Evidências conjuntas e reprodução](../testes/marcos-4-conciliacao-resultados.md).

Primeira execução preservada: 237 de navegador aprovados e timeout de preparação do context do Chrome em um cenário móvel, antes do corpo do teste. Diagnóstico sem alteração de código/timeout: seis execuções aprovadas; nova regressão completa passou. Não se afirma correção de produto para esse incidente de preparação. Quatro capturas novas inspecionadas pelo agente; autoavaliação e DoD registrados, sem parecer de QA independente. Marcos ainda precisa reexecutar/revisar e informar aceite antes de solicitar commit; nenhum commit/push/PR executado nesta rodada.

Recebida a saída de testes do autor em 11/11/2026: lint/typecheck aprovados, 43 unitários e 124 execuções de navegador aprovados em 2,2 min, na pasta original. Anexo preservado integralmente em `docs/testes/marcos-4-conciliacao-verificacao-marcos-pasta-original.txt`, com hash conferido. Valida o recorte anterior à conciliação; reexecução pelo Marcos do conjunto 68/238, aceite visual e solicitação de commit continuam pendentes. Nenhum teste foi reexecutado pelo assistente nem código alterado para registrar a evidência.

Posteriormente recebida a saída do autor em `.aiox-core/local/wt/m4`: lint/typecheck aprovados, 68 unitários e 238 testes de navegador aprovados em 6,3 min, com lista numerada conferida. Anexo integral em `docs/testes/marcos-4-conciliacao-verificacao-marcos.txt`, SHA-256 conferido; código preservado. Reexecução automatizada do conjunto pelo Marcos registrada; aceite visual, solicitação de commit e entrega integrada continuam pendentes. Nenhuma nova execução do assistente ou alteração do produto para esse registro.

Cliente da especificação de fila e página implementados, com guarda visual exclusiva de RESPONSAVEL e projeção mínima. Escritas reutilizadas de reservas.js; decisão só é confirmada após validação do retorno. A leitura seguinte é tratada separadamente: falha de recarga não perde o sucesso do POST, página esvaziada consulta página anterior e respostas atrasadas não substituem filtros alterados. Nenhum GET de detalhe/listagem geral, Java, flag de API ou dependência foi acrescentado.

`npm run build` aprovado: lint/checkJs sem diagnósticos, 43 testes unitários e 124 de navegador (48 da nova fila e 76 regressões), zero falhas/ignorados/retries. Suíte específica inicial também passou em 48 execuções. Capturas desktop/móvel conferidas pelo agente. [Resultados e reprodução](../testes/marcos-4-resultados.md); [saída integral](../testes/marcos-4-verificacao.txt).

Autoavaliação de código/testes/DoD: tratados perfil, identidade, campos extras, XSS, fuso, pares de datas, motivo em branco, respostas fora de ordem e falha após escrita. Configuração e regras de lint/dependências preservadas. APIs continuam desligadas; leitura/autorização real e revisão da projeção pertencem à equipe. CodeRabbit/WSL indisponíveis, revisão independente/CI e validação humana pendentes. Não se declara RF inteiro concluído, aceite do Marcos, E2E integrado ou revisão independente de QA. Sem commit/push nesta etapa.

### Agent Model Used

Codex, preparação AIOX SM e implementação AIOX Dev.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-10 | Implementado o cliente da especificação de fila com decisões e evidências locais; backend e validação humana pendentes. |
| 2026-11-11 | Comparada a lista da equipe com a implementação local e os PRs; criado status para compartilhar com a equipe. Continuidade condicionada ao contrato revisado e à integração, preservando código/evidências sem commit. |
| 2026-11-11 | Marcos autorizou conciliação isolada sobre movimentações; reaberto incremento local para regressão conjunta e posterior validação humana. |
| 2026-11-11 | Conciliação local validada: 68 unitários/238 navegador aprovados; primeira falha de setup e seis diagnósticos preservados. Ready for Review, aguardando validação humana e solicitação de commit. |
| 2026-11-11 | Registrada saída do autor na pasta original: 43 unitários/124 navegador aprovados; reexecução conjunta na branch conciliada continua pendente. |
| 2026-11-11 | Registrada reexecução do autor no checkout conciliado: 68 unitários/238 navegador aprovados em 6,3 min; aceite visual e solicitação de commit pendentes. |
| 2026-11-11 | Marcos solicitou explicitamente o commit após a reexecução aprovada; versionamento local autorizado, sem atribuir aceite visual detalhado, integração real ou push. |
| 2026-11-12 | Sincronização solicitada por Marcos: develop 23cf839 incorporada à Marcos-4 df57063 sem conflitos, frontend preservado e regressão 68/238 aprovada; plano/checklist e evidências atualizados, sem publicação remota. |
| 2026-11-12 | Marcos aprovou a interface após revisão no Chrome com dados fictícios na versão a8da77c; aceite/checklists registrados, sem alterações funcionais ou publicação. |
| 2026-11-12 | Marcos solicitou o commit documental do aceite visual; código e testes preservados, com publicação remota separada. |

### File List

Registro de aceite visual de 12/11/2026, com atualização dos planos, desta story, do relatório de conciliação e da RTM já relacionados abaixo:

- docs/testes/marcos-4-aceite-visual-2026-11-12.md

Registro da sincronização de 12/11/2026; código/documentação da equipe permanecem atribuídos aos commits importados:

- docs/planejamento/marcos-fechamento-etapas-1-a-5.md
- docs/stories/marcos-4.md
- docs/RTM.md
- docs/testes/marcos-sincronizacao-2026-11-12-resultados.md
- docs/testes/marcos-sincronizacao-2026-11-12-verificacao.txt
- docs/testes/marcos-sincronizacao-2026-11-12.json

Registro adicional desta atualização (arquivos Java/documentação da equipe são importados por merge, sem atribuição autoral a Marcos):

- docs/testes/marcos-integracao-2026-11-11-resultados.md
- docs/testes/marcos-integracao-2026-11-11.json
- docs/testes/marcos-integracao-2026-11-11-etapa-5.txt
- docs/testes/marcos-integracao-2026-11-11-marcos-4.txt

Arquivos novos/alterados neste preparo sobre a base de movimentações, incluindo os registros de contexto recebidos e as evidências da conciliação:

- README.md
- backend/src/main/resources/static/css/app.css
- backend/src/main/resources/static/js/aprovacoes-page.js
- backend/src/main/resources/static/js/aprovacoes.js
- backend/src/main/resources/static/js/datas.js
- backend/src/main/resources/static/js/navegacao.js
- backend/src/main/resources/static/pages/aprovacoes.html
- docs/README.md
- docs/RTM.md
- docs/api/frontend-integracao.md
- docs/api/reservas-contrato.md
- docs/api/reservas-leitura-contrato.md
- docs/api/reservas-politica-leitura-q9.md
- docs/planejamento/fluxo-de-trabalho-marcos.md
- docs/planejamento/marcos-pendencias-equipe-2026-11-11.md
- docs/planejamento/marcos-plano-de-acao.md
- docs/planejamento/marcos-status-equipe-2026-11-11.md
- docs/planejamento/relatorio-marcos-2026-11-11.md
- docs/stories/marcos-4.md
- docs/testes/marcos-4-conciliacao-diagnostico.txt
- docs/testes/marcos-4-conciliacao-primeira-execucao.txt
- docs/testes/marcos-4-conciliacao-resultados.md
- docs/testes/marcos-4-conciliacao-verificacao.txt
- docs/testes/marcos-4-conciliacao-verificacao-marcos-pasta-original.txt
- docs/testes/marcos-4-conciliacao-verificacao-marcos.txt
- docs/testes/marcos-4-conciliacao/autoavaliacao.json
- docs/testes/marcos-4-conciliacao/decisao-desktop.png
- docs/testes/marcos-4-conciliacao/decisao-mobile.png
- docs/testes/marcos-4-conciliacao/fila-desktop.png
- docs/testes/marcos-4-conciliacao/fila-mobile.png
- docs/testes/marcos-4-conciliacao/primeira-execucao.json
- docs/testes/marcos-4-conciliacao/primeira-falha-contexto.md
- docs/testes/marcos-4-conciliacao/resultados.json
- docs/testes/marcos-4-resultados.md
- docs/testes/marcos-4-verificacao.txt
- docs/testes/marcos-4/decisao-desktop.png
- docs/testes/marcos-4/decisao-mobile.png
- docs/testes/marcos-4/fila-desktop.png
- docs/testes/marcos-4/fila-mobile.png
- docs/testes/marcos-4/resultados.json
- tests/browser/acesso.spec.js
- tests/browser/aprovacoes.spec.js
- tests/unit/frontend/aprovacoes.test.js

## QA Results

Revisão independente e integração real pendentes.
