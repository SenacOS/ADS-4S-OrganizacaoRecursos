# Marcos-integracao-q9-1 — Sincronização e validação real das leituras Q9

## Status

Ready for Review

Marcos pediu continuar o plano de fechamento em **12/11/2026**. O agente principal confirmou o push de `8c21a43` em `fix/marcos-qualidade-frontend` e, após fetch, a nova develop `3f2a9a3`, merge do PR #26. Branch de execução prevista: `feature/marcos-integracao-q9`. Preservar o incremento aprovado de qualidade/datas e não criar novo commit, push, PR ou merge remoto sem solicitação correspondente.

Marcos respondeu **“Sim, adotar o comportamento atual do servidor”** à consulta sobre a exigência de vínculo com todos os recursos. Isso registra aceite do frontend para consumir o comportamento conservador existente; não atribui ratificação a Silva, Fausto ou outros integrantes.

## Story

Como responsável pelo frontend, quero incorporar a entrega de consultas/autorização do PR #26 e validar a fila existente com sessões e banco reais, para substituir o bloqueio anterior de GETs ausentes por evidências do comportamento efetivamente disponível e preparar o restante da etapa 3 com contrato conferido.

Responsável: Marcos Boé. RF01, RF04, RF07, RF13 e RF14 nos cenários executados. Preparação AIOX SM; implementação/integração AIOX Dev; veredicto independente AIOX QA. O incremento não encerra os RFs completos nem a matriz inteira das etapas 1 a 5.

## Fontes e contexto

- [Plano de fechamento: passos 5 a 8](../planejamento/marcos-fechamento-etapas-1-a-5.md#9-passo-5--consolidar-os-contratos-e-dependências-da-leitura): conferir contratos, integrar fila e preparar reservas existentes.
- [Marcos-4](marcos-4.md), [especificação da fila](../api/reservas-leitura-contrato.md) e [política Q9](../api/reservas-politica-leitura-q9.md): cliente já implementado; GETs estavam ausentes na base anterior.
- [PR #26](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/26), merge `3f2a9a3`: origem da primeira integração/validação; resultados e parecer QA dessa base permanecem históricos.
- [PR #27](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/27), merge `4cea1772ce499ad51cb42d0563790ff1e2ca3ed3`, head `7fe9fe0`: entrega posterior informada por Marcos e confirmada pelo agente principal, passando a ser a referência da revalidação desta story. Conecta a consulta HTTP da fila ao caso de uso/adaptador integrado anteriormente e concilia escopo/contrato.
- `docs/seguranca/q9-autorizacao-reservas.md`, seção “Implementado neste PR”, e `docs/api/reservas-leitura-contrato.md`, inclusive “Listagem geral e detalhe”, na develop `4cea177`: GETs, escopo, 404, vínculo e total preservado em página além do fim. A regra conservadora e seu aceite do frontend permanecem separados da ratificação dos demais integrantes.
- `ReservaLeituraController.java`, `ReservaLeituraResponse.java`, `ReservaApiMapper.java`, `ReservaConsultaMysql.java`, `ReservaAcessoMysql.java`, `ReservaService.java`, `ConsultarFilaAprovacao.java` e `ReservaFilaMysql.java` na base `4cea177`: comportamento HTTP/SQL e decisões reais, apenas referência para este trabalho de frontend. Mudanças importadas do PR #27 não são código de produto autoral deste recorte.
- `V6__responsaveis_recursos.sql`: vínculo explícito, tabela inicialmente vazia; não existe POST público de concessão.
- [Ambiente e guia atuais](../integracao/marcos-e2e-local.md), [Marcos-e2e-1](marcos-e2e-1.md), [resultados anteriores](../testes/marcos-e2e-local-2026-11-12-resultados.md) e [qualidade/datas](marcos-integracao-datas-1.md): base isolada já preparada, build 72/240 aprovado; registros anteriores com Flyway V1–V5 e GET 405 são históricos e não devem ser sobrescritos.

## Critérios de aceitação

1. Conferir branch, árvore e referências antes de sincronizar; preservar `8c21a43` e usar a branch própria prevista. A integração inicial de `3f2a9a3` foi preparada sem commit; após a entrega do PR #27, incorporar `origin/develop` `4cea177` com merge local **sem commit automático** (`--no-commit --no-ff`). Para substituir apenas esse merge pendente, preservar antes os arquivos autorais não commitados e o estado do índice/MERGE_HEAD por cópia/hash em `.aiox-core/local/backups/`, conferir a recuperação e conciliar por conteúdo qualquer arquivo autoral que cruze a entrega nova. O agente principal confirmou backup/hash dos 17 arquivos e troca do merge pendente sem conflitos; isso não autoriza abortar outro trabalho ou reescrever commits publicados. Registrar ambas as bases/estados sem atribuir alterações não commitadas a SHA novo. Nenhum force push, rebase publicado, PR ou envio externo.
2. Conferir o contrato documental contra a implementação do PR #27 em `4cea177` e registrar exatamente: `GET /api/reservas` com `status`, `inicio/fim` juntos, `recursoId`, `pagina` padrão 0, `tamanho` padrão 20 e máximo 100; filtro de período por sobreposição; ordem início/id; envelope `{itens,pagina,tamanho,total}`; `GET /api/reservas/{id}` com detalhe completo autorizado. Página além do fim retorna itens vazios e preserva o total calculado no escopo. Confirmar que o caminho de fila para RESPONSAVEL/status SOLICITADA usa a integração de `ConsultarFilaAprovacao`/`ReservaFilaMysql`, sem mudar a rota pública ou misturar a listagem dos outros perfis. Projeção mantém campos de reserva, `solicitante` mínimo e `recursos` legíveis. Conciliar a edição local anterior do contrato com o contrato novo importado; não inventar outros filtros/campos, nem expor dados pessoais além do DTO.
3. Documentar a aplicação do escopo da sessão: Solicitante vê próprias reservas, Administrador consulta todas e não aprova/rejeita; Responsável lê/decide somente com vínculos para **todos** os recursos. Detalhe ausente/fora do escopo retorna 404 NAO_ENCONTRADO; sem autenticação 401; parâmetros inválidos 400. Distinguir erro de leitura de negativa de escrita, conferindo os códigos efetivos. Marcos aceitou consumir essa regra; ratificação coletiva e administração dos vínculos continuam identificadas separadamente.
4. Reempacotar o backend existente com as ferramentas portáteis e aplicar Flyway V6 **somente** à instância MySQL isolada já identificada de Marcos. Validar processo/UUID/datadir/portas antes de agir; parar/reiniciar apenas processos próprios, preservando dados existentes. Manter flags somente runtime, worker de notificações desligado e configuração privada ignorada. Não alterar Java, POM, migrations, application.yml, produção, dependências ou relógio do produto.
5. Preparar massa fictícia exclusiva para a rodada, com pelo menos dois Solicitantes e um Responsável, usando cadastro administrativo real e recursos/reservas próprios. Criar vínculos de teste apenas em `responsaveis_recursos` da base isolada, por operação SQL restrita aos IDs realmente criados/conferidos e ao usuário Responsável de teste. Validar identificadores/tipo/perfil antes da inserção; não conceder acesso genérico, alterar vínculos preexistentes ou criar endpoint novo. Guardar senhas, cookies, CSRF, config e logs brutos somente em `.aiox-core/local/`.
6. Validar por HTTP real os GETs: própria reserva visível ao Solicitante e de outro Solicitante invisível; filtro/paginação/total preservam o escopo; Administrador consegue ler as reservas de teste e recebe negativa ao decidir; Responsável sem vínculo tem lista/fila vazia para a massa exclusiva e detalhe 404. Depois dos vínculos pertinentes, o Responsável vê somente os recursos autorizados. Não exigir vazio global se a base já possui dados de outras rodadas; delimitar a massa por recursos/períodos/IDs de teste.
7. Cobrir a regra multi-recurso do servidor com dados de teste: vínculo parcial não libera detalhe/fila/decisão; vínculo completo permite a leitura/decisão pertinente. Identificar esse resultado como comportamento conservador atual, aceito pelo frontend, sem alegar consenso de toda a equipe. Uma negativa não deve gravar decisão indevida ou ser contornada por filtros/identidade enviados no corpo.
8. Validar a UI existente de Aprovações no Chrome servido pelo Spring real, sem interceptação de API: pendentes restritas no escopo; identificação mínima do solicitante/recursos, filtros/paginação aplicáveis à massa, detalhe exibido pela própria projeção da fila, aprovação confirmada e remoção da fila, rejeição com motivo obrigatório e estado confirmado. Usar reservas independentes para aprovação/rejeição e conferir respostas reais. Ajustar cliente/tela somente se houver divergência concreta com o contrato integrado, mantendo segurança de texto, sessão/CSRF, confirmação de identidade, guard e ausência de replay.
9. Atualizar/reexecutar o smoke de forma compatível com a base `4cea177`: reconhecer migrações efetivamente aplicadas e consultas disponíveis, sem restaurar expectativa fixa de cinco migrações/GET 405. Preservar relatórios antigos, inclusive as rodadas e parecer local referentes ao PR #26, e registrar mudanças decorrentes do PR #27. O auxiliar `tests/e2e-local/validar-q9.cjs` e o smoke existente podem receber ajustes de verificação dentro deste escopo, sem novas dependências ou código de produto: testar explicitamente por HTTP a página vazia além do fim com total preservado e a revogação de vínculo somente da massa nova da própria rodada, conferindo novamente lista/fila/detalhe/decisão pertinentes. Inserção e revogação são fixtures restritas à instância/IDs/usuário de teste já conferidos; não revogar concessões preexistentes nem relaxar o controle SELECT do inspetor.
10. Executar gates proporcionais para a entrega posterior: reempacotar o JAR com o código do PR #27 e reiniciar somente o ambiente próprio identificado, conferindo Flyway e hashes do artefato/fontes servidas. O JAR da rodada PR #26 e seu parecer anterior não aprovam automaticamente a base nova. Executar `node --check` dos auxiliares alterados/novos e novas verificações HTTP/SQL/navegador reais, incluindo fila com aprovação/rejeição, escopos e os cenários do AC 9. Se fontes/configuração frontend permanecerem idênticas às verificadas em 72 unitários/240 navegador, conferir hashes e reutilizar explicitamente essa regressão de cliente; isso não substitui a revalidação do backend/fila novos. Alterações autorais de produto exigem `npm run build` completo (lint/typecheck/unitários/navegador). Registrar package Maven e qualquer teste omitido com clareza; package com skip não é clean verify, nem prova de CI/Sonar/concorrência. Nenhuma mudança autoral de produto é necessária por inferência desta atualização.
11. Preservar `docs/testes/marcos-integracao-q9-1-resultados.md` e suas evidências como registro da execução PR #26, e produzir relatório/evidências sanitizadas da revalidação PR #27 sob `docs/testes/marcos-integracao-q9-1-pr27-*`. Registrar data/fuso, branches/bases/MERGE_HEAD, preservação/recuperação dos arquivos autorais, massa nova, camadas HTTP/SQL/navegador, comandos, hashes, tentativas e falhas reais. Atualizar contratos/consumo, plano, handoff, RTM, checklist e File List apenas conforme a entrega observada; distinguir o QA histórico de PR #26 da revisão independente que cobrir a nova base/artefato/evidência. Consultar checks remotos somente para diagnóstico, identificando a execução/SHA corretos; não alterar gates/secrets nem transportar causa/resultado do Sonar ou de teste da base anterior sem conferir os logs novos.
12. Manter fora deste recorte a nova interface geral de listagem, edição e cancelamento de reservas existentes: esses fluxos recebem story posterior com o contrato conferido. Validação dos GETs e da fila não implementa essas telas. Administração de vínculos reais, ratificações da equipe, matriz E2E restante, revisão humana/checks e eventual PR da correção anterior permanecem explícitos. Commit somente quando Marcos solicitar após validação/aceite; nenhum push ou PR autorizado por esta story.

## Tasks / Subtasks

- [x] Conferir árvore/base e sincronizar a develop em branch própria preservando 8c21a43, sem commit automático (AC 1).
- [x] Conferir/reconciliar contrato, projeção e escopo dos GETs com a implementação do PR #26 (AC 2–3).
- [x] Reempacotar, reiniciar somente o ambiente próprio e conferir Flyway V6/fontes servidas (AC 4, 10).
- [x] Preparar massa exclusiva e vínculos SQL estritos no banco isolado (AC 5).
- [x] Validar GETs dos perfis, parâmetros, paginação/total e negativas reais (AC 6–7).
- [x] Validar aprovação/rejeição pela fila real e tratar somente divergências concretas (AC 8).
- [x] Atualizar auxiliares/smoke para a base nova preservando evidências anteriores (AC 9).
- [x] Executar os gates pertinentes e registrar resultados, hashes e limitações reais (AC 10–11).
- [x] Atualizar documentos, handoff/plano/RTM, checklist e File List conforme estado observado (AC 11–12).
- [x] Obter revisão assistida QA e aceite visual de Marcos em 12/11/2026, sem presumir revisão de outro integrante/checks remotos.
- [x] Incluir o incremento no commit local solicitado por Marcos em 12/11/2026 após o aceite visual.
- [ ] Publicar por push/PR somente após autorização correspondente; o commit local não publica alterações.
- [x] Preservar arquivos/índice por cópia e hash, refazer merge sem commit com PR #27 e revalidar JAR, paginação vazia e revogação de consulta/decisão em massa exclusiva.

## Dev Notes

Esta story traduz entregas novas já integradas; não deve fabricar um backend local alternativo. A execução inicial/QA de PR #26 (`3f2a9a3`) está registrada abaixo e continua histórica. Com o merge do PR #27 (`4cea177`, head `7fe9fe0`), a referência atual passa a ser essa entrega posterior, ainda sem novo commit local. Para comparar as versões, usar referências explícitas como `git show 3f2a9a3:<caminho>` e `git show 4cea177:<caminho>`; `origin/develop` pode avançar. O SHA da referência e o hash do JAR são obrigatórios para distinguir a execução anterior da revalidação nova.

O agente principal preservou e validou cópia/hash dos 17 arquivos autorais e snapshot de índice/MERGE_HEAD em `.aiox-core/local/backups/marcos-q9-pr27-c6e27bf5`, substituiu apenas o merge pendente e preparou `--no-commit` de `4cea177` sem conflitos. O contrato de leitura que já tinha edição local foi conciliado com a versão importada do PR #27; a cópia anterior está preservada. Este registro é contexto de preservação confirmado pelo agente principal, não uma operação Git feita pela preparação SM. Tasks/Dev Agent Record e novas evidências devem refletir a execução efetiva subsequente.

`ReservaConsultaMysql` calcula escopo antes do total/paginação, usa datas com offset de São Paulo e retorna `solicitante: {usuarioId, identificacao}` e recursos conforme o DTO. Fila usa o GET geral com status SOLICITADA para o Responsável; não criar `/pendentes` ou GET exclusivo não implementado. Os campos mínimos devem ser conciliados com `aprovacoes.js`, que já filtra a projeção e confirma as escritas.

No PR #27 o controller encaminha especificamente RESPONSAVEL/status SOLICITADA a `ConsultarFilaAprovacao`, mapeando o resultado para `ReservaLeituraResponse`; outros perfis/estados seguem a consulta geral e o detalhe usa a consulta autorizada. A refatoração exige revalidar o caminho real mesmo quando o DTO público/cliente permanece igual. Página além do fim deve manter total e envelope no escopo. Revogação de fixture nova deve ser seguida de consultas/decisão reais para conferir a retirada do acesso, sem apagar recursos/reservas ou tocar vínculos de outras rodadas. Os auxiliares já permitidos podem receber essas asserções; não criar concessão/revogação pública ou política nova.

A V6 é intencionalmente vazia. Ausência de vínculo e 404 são comportamentos corretos, não falhas de infraestrutura a contornar. O auxiliar `controle.cjs` atual permite SQL de inspeção somente SELECT; não remover essa restrição para facilitar fixtures. Eventual escrita de preparação deve ter caminho específico e restrito aos vínculos/IDs de teste, com credenciais privadas de cliente fora dos argumentos, recusando base/instância divergente. Não modificar o mecanismo de autorização do produto.

O frontend mantém o comportamento conservador informado pelo servidor. O aceite de Marcos não decide como Silva/Fausto manterão vínculos reais nem encerra ratificação coletiva ou cria aprovação parcial. Só modificar mensagem de escopo/documentação quando respaldada pela fonte e pelo retorno real, sem inserir controles técnicos na experiência do produto sem necessidade.

## Validação de preparação

Checklist `story-draft-checklist`: objetivo/contexto, fontes versionadas, escopo, orientação técnica, autocontençao e testes conferidos. Reutiliza o plano existente; nenhuma nova funcionalidade fora do fechamento foi inventada. A criação desta story não valida a execução futura, não aprova o backend inteiro e não equivale a revisão independente PO/QA. O aceite do frontend para a regra de todos os recursos foi comunicado pelo agente principal após resposta explícita do usuário.

## CodeRabbit Integration

Tipo principal: Integração; secundário: frontend/documentação. Execução AIOX Dev; veredicto de qualidade AIOX QA. Focos: isolamento de banco/processos e fixtures de vínculo, escopo antes de paginar, projeção mínima, distinção entre ratificação e comportamento atual, ausência de mocks/replay e proveniência de fonte/JAR. CodeRabbit quando disponível, resultado/indisponibilidade explícitos; sem transformar ausência em aprovação. Self-healing AIOX Dev light: no máximo 2 iterações/15 minutos para CRITICAL; HIGH documentado. Gates proporcionais e regressão completa quando houver mudança de produto, conforme AC 10. Publicação/PR seguem autorização própria e AIOX DevOps.

## Dev Agent Record

### Completion Notes

Marcos informou “está aprovado. pode fazer o commit” após a revisão da fila no Chrome com a versão do PR27. [Aceite visual e autorização de commit local](../testes/marcos-integracao-q9-1-aceite-visual-2026-11-12.md). Roteiro de paginação, detalhe multi-recurso, aprovação/rejeição/motivo, filtros/vazio e negativa visual dos demais perfis apresentado com21solicitações fictícias; aceite global sem ajustes solicitados, sem inferir execução individual de cada caminho. Commit local autorizado; sem push/PR. SHA resultante consultável no histórico, preservando os hashes e referências da execução anterior ao commit.

Atualização após comunicação do merge do PR #27: GitHub/fetch confirmaram develop4cea177. Os17arquivosautorais e índice/MERGE_HEAD foram copiados/conferidos antes de abortar exclusivamente a incorporação pendente3f; hashes conferidos após abort e novo merge--no-commit sem conflitos. Contrato alterado pelo #27 preservado e conciliado com a referência de evidências. Nenhum commit publicado foi reescrito, nenhum novo commit/push/PR criado.

JAR atualizado99fontes/BUILD SUCCESS7,540s (testes Maven omitidos). Nova validação10PASS/0FAIL e smoke16PASS/0FAIL/1BLOQUEADO; inclui página vazia total1, revogação de um vínculo novo com fila0/detalhe404/decisão403 e reserva SOLICITADA preservada para o dono. Rodada anterior10/0 sem asserção explícita de decisão pós-revogação preservada. Frontend/produto/testes anteriores mantêm os6hashes72/240. [Resultado PR27](../testes/marcos-integracao-q9-1-pr27-resultados.md). QA anterior8/0 refere-se ao #26; revisão assistida complementar e aceite visual do novo incremento registrados separadamente.

Merge local sem conflitos de develop3f2a9a3 sobre8c21a43 preparado na branch própria, sem novo commit. Preservados produto e seis arquivos de teste/frontend com hashes do72/240; novos Java/SQL/testes são exclusivamente importados do PR26. JAR atualizado:99 fontes, BUILD SUCCESS7,453s, testes Maven explicitamente omitidos. FlywayV6 aplicada somente no MySQL isolado.

Helper específico:8PASS/0FAIL reais; smoke atualizado16PASS/0FAIL/1BLOQUEADO(interface geral ainda não implementada). Login/CSRF/sessões, paginação/total,404, negativa403, vínculos parciais/completos e fila com aprovação/rejeição exercitados sem mock. QA apontou duas lacunas de teste, corrigidas antes da rodada final (segunda página e aprovação multi-recurso positiva). Rodada preliminar7/0 preservada. [Resultados e limites](../testes/marcos-integracao-q9-1-resultados.md).

Contrato das consultas reconciliado com implementação. Marcos aceitou consumir TODOS os vínculos; não se atribui ratificação aos demais. Gestão administrativa dos vínculos e Sonar continuam pendentes. CI da nova develop aprovou243unitários/HTTP,56IT,cobertura; scanner falhou por autorização/projeto depois. Verificações locais: sintaxe dos auxiliares e execução real aprovadas; frontend completo não repetido pois produto/config/testes não mudaram.

Checklist DoD: escopo/fontes [x]; isolamento/segredos/sem dependências novas [x]; testes proporcionais [x]; documentação/rastreabilidade [x]. Revisão humana/aceite visual deste incremento, checks remotos e commit/publicação [ ]: aguardam fluxo de Marcos. Fila integrada não encerra toda a etapa3 nem toda a matriz de E2E.

### Agent Model Used

Codex: preparação AIOX SM, implementação AIOX Dev e revisão assistida AIOX QA.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-12 | Story Ready for Dev para integrar PR #26 à base preservando 8c21a43 e validar leituras/Q9/fila reais; aceite do frontend para vínculo com todos os recursos registrado, ratificação coletiva separada. |
| 2026-11-12 | Merge sem commit, V6/package e8/0Q9+16/0/1smoke validados; contrato/plano atualizados; duas lacunas de teste resolvidas após revisão QA. Ready for Review, aguardando aceite visual e commit solicitado. |
| 2026-11-12 | PR27 mesclado4cea177 confirmado; trabalho local preservado por hash e merge refeito sem commit. Novo package e10/0Q9+16/0/1smoke; revogação/página vazia cobertas, mantendo limites externos. |
| 2026-11-12 | Aceite visual global e solicitação de commit local recebidos de Marcos; evidência/checklist atualizados. Publicação remota e dependências externas separadas. |

### File List

Arquivos autorais efetivamente criados/alterados:

- `docs/stories/marcos-integracao-q9-1.md`
- `tests/e2e-local/validar-q9.cjs`
- `tests/e2e-local/validar.cjs`
- `docs/testes/marcos-integracao-q9-1-resultados.md`
- `docs/testes/marcos-integracao-q9-1/q9-resultados.json`
- `docs/testes/marcos-integracao-q9-1/q9-preliminar.json`
- `docs/testes/marcos-integracao-q9-1/smoke-resultados.json`
- `docs/testes/marcos-integracao-q9-1/fila-real.png`
- `docs/testes/marcos-integracao-q9-1/empacotamento.txt`
- `docs/testes/marcos-integracao-q9-1-pr27-resultados.md`
- `docs/testes/marcos-integracao-q9-1-aceite-visual-2026-11-12.md`
- `docs/testes/marcos-integracao-q9-1-pr27/q9-resultados.json`
- `docs/testes/marcos-integracao-q9-1-pr27/q9-preliminar.json`
- `docs/testes/marcos-integracao-q9-1-pr27/smoke-resultados.json`
- `docs/testes/marcos-integracao-q9-1-pr27/fila-real.png`
- `docs/testes/marcos-integracao-q9-1-pr27/empacotamento.txt`
- `docs/api/reservas-consulta-contrato.md`
- `docs/api/reservas-leitura-contrato.md`
- `docs/api/reservas-politica-leitura-q9.md`
- `docs/integracao/marcos-e2e-local.md`
- `docs/integracao/marcos-pendencias-2026-11-12.md`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/RTM.md`

Controle, produto e testes frontend permaneceram intactos; evidência 72/240 conferida por hash. Os arquivos importados dos PRs26/27 estão discriminados no diff de merge, agora com origem develop4cea177, preservando autoria da equipe. O backup da conciliação e os relatórios anteriores permanecem preservados.

Arquivos Java/migração/documento de segurança importados do PR #26 são mudanças da equipe, identificadas pelos commits de origem; não descrevê-los como implementação autoral deste recorte. Credenciais, dados, estado, caches, auxiliares específicos da máquina, logs brutos e JAR continuam ignorados sob `.aiox-core/local/` ou `backend/target`.

## QA Results

### Parecer histórico — PR #26 / develop 3f2a9a3

**PASS técnico local — AIOX QA (Quinn), revisão assistida independente em 12/11/2026.** Inspecionados story, auxiliares, contrato reconciliado, documentação e evidências sanitizadas. A revisão não executou serviços/suítes/Git nem acessou credenciais privadas. Nenhum defeito alto/crítico identificado neste recorte.

O helper mantém as fixtures de vínculo restritas a recursos novos identificados por código/ID e ao Responsável ativo de teste, na instância previamente conferida pelo controle. A restrição SELECT do auxiliar de inspeção permaneceu intacta. O fluxo usa HTTP/Chrome reais, sessão e CSRF dinâmico, sem interceptação. As duas lacunas apontadas na revisão foram resolvidas: a segunda página verifica solicitante/ausência do ID alheio, e a aprovação multi-recurso positiva foi exercitada somente após o vínculo completo, além da negativa parcial anterior.

Conferida a [rodada final de 8 PASS/0 FAIL](../testes/marcos-integracao-q9-1/q9-resultados.json), incluindo paginação/total por escopo, 404 fora do escopo, 403 na decisão indevida, fila e aprovação/rejeição com motivo, V6 e correspondência de fontes servidas. Os seis hashes publicados no JSON final foram recalculados na revisão e todos correspondem aos arquivos atuais, incluindo auxiliares, módulos e JAR. O [smoke 16 PASS/0 FAIL/1 BLOQUEADO](../testes/marcos-integracao-q9-1/smoke-resultados.json) preserva o bloqueio da interface geral futura e não mantém GET405 como diagnóstico da base nova. Package com testes Maven omitidos, regressão frontend anterior 72/240 reaproveitada por hashes e resultados remotos são distinguidos corretamente.

Checklist, Completion Notes e File List atualizados; contrato/plano/RTM identificam bases 8c21a43/3f2a9a3 e o merge ainda sem commit. O aceite de Marcos para consumir a regra de todos os recursos não presume ratificação dos demais integrantes. Gestão dos vínculos reais, revisão/aceite visual deste incremento, revisão humana da equipe, CodeRabbit/Sonar e cenários integrados restantes permanecem pendentes. O PASS se limita à sincronização e validação técnica local descritas, preservando Ready for Review; não declara Done, implementação da interface geral, encerramento das etapas 1–5 ou autorização de commit/publicação.

### Revalidação atual — PR #27 / develop 4cea177

**PASS técnico local — AIOX QA (Quinn), revisão assistida independente em 12/11/2026.** Revisão específica da base posterior, do auxiliar alterado, contrato reconciliado, documentação e novas evidências. O parecer PR #26 acima permanece histórico e não foi usado como aprovação automática do novo JAR. Nenhuma suíte, serviço, operação Git ou escrita de negócio foi executada por esta revisão; credenciais e configurações privadas não foram acessadas.

Conferido o encaminhamento RESPONSAVEL/status SOLICITADA ao caso de uso da fila e seu mapeamento para o DTO de leitura, mantendo o escopo das demais consultas. A revogação de fixture usa DELETE limitado ao par recurso/usuário novo da rodada, após validar código exclusivo/IDs e perfil ativo; não amplia a autorização do produto nem remove vínculos preexistentes. A observação de cobertura pós-revogação foi resolvida: além de fila vazia/detalhes 404, o teste agora exige decisão 403 e confirma que a reserva segue SOLICITADA para seu dono.

O [JSON final PR #27](../testes/marcos-integracao-q9-1-pr27/q9-resultados.json) registra **10 PASS/0 FAIL**, HEAD 8c21a43 e MERGE_HEAD 4cea177. Os seis hashes de auxiliares, módulos e JAR foram recalculados nesta revisão e correspondem aos arquivos atuais. A página 99 com itens vazios preserva total autorizado 1; a revogação retira o acesso do Responsável sem impedir a leitura do dono/Administrador. O [smoke repetido](../testes/marcos-integracao-q9-1-pr27/smoke-resultados.json) passou 16/0/1 com o novo JAR, mantendo como bloqueio a interface geral ainda ausente. O [relatório PR #27](../testes/marcos-integracao-q9-1-pr27-resultados.md) distingue package 99 fontes/7,540 s com testes Maven omitidos, resultados remotos, regressão frontend 72/240 reutilizada por hashes e tentativas anteriores preservadas.

Tasks, Completion Notes e File List incluem a revalidação posterior e o histórico/backups de preservação. Nenhum achado alto/crítico identificado no recorte. O PASS mantém Ready for Review técnico local; ainda dependem do fluxo correspondente o novo aceite visual de Marcos, revisão humana da equipe, ratificação coletiva multi-recurso, manutenção dos vínculos reais, Sonar/CodeRabbit, implementação da interface geral e demais cenários integrados. Não declara Done, encerramento das etapas 1–5, aprovação integral do backend/CI ou autorização de commit, push ou PR.
