# Marcos-qualidade-1 — Ordenação explícita e fechamento das pendências de qualidade

## Status

Ready for Review

Autorização de Marcos em **12/11/2026** para mudar a base e avançar no fechamento até a etapa 5. Branch de trabalho preparada pelo agente principal: `fix/marcos-qualidade-frontend`, a partir da develop `da5881b`, após o merge do PR #24. O usuário confirmou que **não recebeu contratos ou GETs novos**; as leituras continuam com a equipe. Esta story trata as correções locais e o encaminhamento das dependências, sem prometer concluir a integração ainda indisponível. Commit somente quando solicitado; nenhum push ou novo PR está autorizado por esta preparação.

## Story

Como responsável pelo frontend, quero resolver os apontamentos das duas ordenações na confirmação das escritas administrativas e separar as pendências de CI e de integração, para entregar a correção com comportamento preservado e evidências verificáveis.

Responsável: Marcos Boé. RF02, RF08, RF13 e RF14. Preparação AIOX SM; implementação AIOX Dev. Não acrescenta funcionalidades ou contratos.

## Fontes e contexto

- [Plano de fechamento das etapas 1 a 5](../planejamento/marcos-fechamento-etapas-1-a-5.md), especialmente passo 3 (qualidade), passo 5 (contratos), passo 7 (E2E) e passo 8 (encerramento). As fotografias anteriores ao merge do #24 são históricas e devem ser reconciliadas com a base atual, sem apagar o contexto.
- [Marcos-5: administração](marcos-5.md) e [movimentações](marcos-5-movimentacoes.md): fluxos já implementados; não reimplementar.
- [Marcos-4](marcos-4.md): fila implementada no cliente e aceite visual informado por Marcos; leitura/autorização reais são dependências distintas do merge.
- [Contrato item18](../api/item18.md#cadastro-e-retorno): normalização de competências, expediente e DTOs existentes.
- [Q9 comunicada](../api/reservas-politica-leitura-q9.md): escopo por perfil decidido, com aplicação técnica/HTTP pendente.
- [Especificação de leitura da fila](../api/reservas-leitura-contrato.md): aceite do cliente não equivale a contrato ratificado nem endpoint funcionando.
- Código conferido: `backend/src/main/resources/static/js/administracao-recursos.js`, funções `criarAdministracao.salvar` e `criarAdministracao.salvarExpediente`; `tests/unit/frontend/administracao-recursos.test.js`.

## Critérios de aceitação

1. Conferir os dois apontamentos de ordenação aplicáveis à base atual, anteriormente nas linhas 113 e 162 de `administracao-recursos.js`. Substituir as duas chamadas `.sort()` sem comparador nas canonicalizações de competências e janelas por ordenação textual explícita, determinística e equivalente à comparação padrão atual das strings. Números de linha são referência histórica, não motivo para alterar outra chamada.
2. O comparador mantém igualdade somente para strings idênticas e usa a ordem textual por unidades UTF-16 já observada; não usar `localeCompare`, colação dependente do ambiente, comparação numérica ou normalização adicional que equipare strings distintas. A ordem da lista de entrada/resposta não interfere na confirmação da mesma informação.
3. Preservar as demais regras da confirmação: competências passam por minúsculas e deduplicação já existentes; janelas mantêm a representação canônica existente de dia e horários. Não mudar DTOs, caminhos HTTP, mensagens, mutabilidade das listas, precisão temporal contratada ou regras de disponibilidade. Resposta com competências/janelas materialmente diferentes continua rejeitada como RESPOSTA_INVALIDA.
4. Aproveitar os testes de API do cliente já existentes para verificar retorno com competências normalizadas, duplicatas removidas e ordem diferente, além de janelas retornadas em outra ordem. Acrescentar ou ajustar teste somente para uma lacuna de comportamento relevante: aceitação de conjuntos equivalentes e rejeição de conteúdo distinto. Asserções devem passar pelas operações públicas `salvar`/`salvarExpediente`, sem limitar a prova a inspecionar o texto do comparador ou reproduzir sua implementação.
5. Executar `npm run build`, que inclui lint, typecheck, testes unitários e de navegador. Registrar comando, SHA/base, ambiente, resultados reais e eventuais falhas/reexecuções. Se um gate falhar, investigar antes de declarar correção validada. Testes com API controlada permanecem identificados como frontend isolado, sem alegar E2E integrado, segurança do servidor ou concorrência MySQL.
6. Diagnosticar **separadamente** a falha da análise Sonar via Maven no workflow e os dois apontamentos do check de código. Conferir logs/anotações e SHA da execução quando acessíveis; registrar erro observado, etapa e limites do diagnóstico. Não afirmar que corrigir `.sort()` resolve autorização/configuração do scanner ou que testes locais aprovam o Sonar remoto. Se análise local/remota ou logs não estiverem disponíveis, registrar a pendência e o próximo passo com o responsável, sem simular aprovação.
7. O diagnóstico é somente leitura: não alterar nem expor secrets, tokens, permissões, workflows, gates, dependências, configuração do projeto ou backend Java; não remover verificações para deixar a CI verde. Causa ou correção dependente do ambiente Sonar/CI é encaminhada a Débora com evidência, sem atribuir causa a plano do serviço por suposição. Não iniciar nova análise remota/publicação por inferência desta story.
8. Atualizar o plano de fechamento com o estado efetivo dos merges #23/#24 e a base `da5881b`, distinguindo integração de código, aceite visual, revisão independente, checks e E2E. O merge do #24 encerra a pendência de merge desse PR, não comprova automaticamente aprovação remota completa nem implementação das leituras. Preservar as referências históricas necessárias.
9. Produzir handoff concreto e rastreável das pendências que impedem encerrar as etapas 1 a 5: contrato HTTP de lista geral e detalhe para editar/cancelar, fila/controller e projeções, vínculo responsável/recurso e escopo Q9, dados mínimos autorizados e convenção 403/404 fora do escopo, além do ambiente/cenários de E2E real. Registrar responsáveis de integração Silva/Fausto/Débora e o resultado necessário de cada entrega. Não enviar mensagens à equipe sem autorização.
10. Q9 permanece decidida como política: Solicitante vê próprias reservas, Responsável vê recursos sob sua responsabilidade e Administrador consulta todas; isso não amplia escritas. Não inventar GETs, novos parâmetros, ratificação coletiva, modelo de vínculo ou permissão de execução. A confirmação de que não há novos contratos impede iniciar consumo de leituras gerais fictícias; apontar o que ainda depende da equipe e o que poderá ser retomado depois.
11. Atualizar checklist, File List, plano/RTM quando afetados e relatório de evidências com o comportamento verificado e as limitações reais. Não declarar etapas 1 a 5 integralmente encerradas enquanto faltarem as condições do plano. Nenhum commit sem solicitação de Marcos; nenhum push, PR ou merge novo faz parte do incremento autorizado.

## Tasks / Subtasks

- [x] Conferir as duas canonicalizações e registrar o tratamento dos apontamentos na base atual (AC 1–3).
- [x] Acrescentar comparadores textuais explícitos preservando a semântica atual (AC 1–3).
- [x] Conferir testes existentes e cobrir lacunas relevantes de listas equivalentes/reordenadas e conteúdo diferente (AC 4).
- [x] Executar `npm run build` e registrar os resultados reais da regressão (AC 5).
- [x] Examinar separadamente os logs do scanner/check Sonar, registrando diagnóstico ou indisponibilidade e responsável (AC 6–7).
- [x] Reconciliar o plano com merges #23/#24 e preparar o handoff das leituras/Q9/E2E (AC 8–10).
- [x] Atualizar evidências, RTM quando afetada, checklist e File List, mantendo pendências explícitas (AC 11).
- [ ] Obter revisão independente e verificações remotas pertinentes antes de declarar entrega integrada.
- [x] Criar commit local após a solicitação de Marcos em 12/11/2026 e o aceite visual; sem push autorizado.
- [x] Registrar aceite visual do autor em 12/11/2026, separado da revisão da equipe e da autorização de commit.

## Dev Notes

Os dois `.sort()` atuais operam sobre strings para serializar uma representação estável, não para ordenar visualmente dados. Nas competências, o cliente já normaliza texto em `dadosCadastro`, depois canonicaliza minúsculas e remove duplicatas na confirmação. Nas janelas, a chave concatena dia e horários convertidos pelo auxiliar `hora`. Esta story preserva esses passos; não deve ampliar normalização nem reescrever a gestão temporal.

O teste existente `PUT preserva cadastro completo e tipo imutável; normalização de competências é permitida` já cobre parte do comportamento; o teste `expediente preserva frações, todas as janelas e aceita adjacência e lista vazia` verifica preservação, mas deve ser conferido quanto à resposta reordenada. Priorizar observação da API pública e rejeição de resposta divergente; não criar teste artificial só para contar cobertura.

O plano registra falha Maven/Sonar e um check separado com duas anotações. São evidências de etapas distintas: uma falha de execução do scanner pode impedir análise, enquanto um check de código pode reportar regras em execução diferente. Conferir execução/commit antes de relacioná-los. Credenciais nunca entram em saída ou documento; conservar somente trecho sanitizado necessário ao diagnóstico.

Diagnóstico confirmado pelo agente principal durante a preparação, a registrar com atribuição e sem alegar execução local: na CI run `43241249745`, job `131261917002`, passaram 239 testes unitários/HTTP e 49 integrações MySQL; JaCoCo registrou `All coverage checks have been met` e houve `BUILD SUCCESS`. Depois o scanner `5.8.0.7211` falhou com `Not authorized or project not found`, orientando conferir SONAR_TOKEN, projectKey e organization. Isso identifica a etapa/mensagem, mas não comprova qual configuração está incorreta nem uma causa ligada ao plano Free. A remediação permanece com a responsável pela CI/Sonar; nenhuma credencial precisa ser exibida.

As leituras da fila tiveram avanço SQL descrito na Marcos-4, mas SQL integrado não prova controller HTTP, projeções/contrato ratificados ou escopo Q9 aplicado. Listagem geral/detalhe continuam sem contrato novo recebido por Marcos em 12/11. O handoff deve explicar essa diferença e as condições de retomada da edição/cancelamento e E2E, sem reabrir a decisão de política já comunicada.

Na conferência do agente principal da develop `da5881b`, não havia PR aberto nem `@GetMapping` no módulo de reservas. O ambiente local tinha somente JDK 25 identificado, Maven/Docker ausentes do PATH e variáveis de conexão com banco não configuradas; preparo do ambiente integrado aguardava esclarecimento do usuário. Esses limites não impedem a correção/testes do frontend e não autorizam instalar/configurar backend ou presumir acesso ao banco por esta story.

## Validação de preparação

Checklist `story-draft-checklist`: objetivo/contexto, referências, orientação técnica, autocontenção, critérios testáveis e dependências conferidos. Recorte pronto para desenvolvimento com os contratos atuais; não depende de contratos novos para corrigir ordenação. Diagnóstico externo e integração têm limites explícitos. Preparação local AIOX SM por delegação da exclusividade de criação de stories; autorização de Marcos não equivale à revisão independente de PO/QA.

## CodeRabbit Integration

Tipo principal: Frontend; secundário: Qualidade/documentação. Execução @dev; revisão independente @qa. Gates locais: lint/checkJs/unitários/navegador via build; CodeRabbit quando disponível, com resultado ou indisponibilidade documentados. Foco: equivalência da ordenação textual, confirmação independente da ordem, ausência de mudanças contratuais e distinção entre evidência local/CI/integração. Self-healing @dev light: até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Revisão/CI remotas pendentes não são convertidas em aprovação pela correção local. Pré-PR e publicação dependem de autorização própria e @devops.

## Dev Agent Record

### Completion Notes

Após os testes e o aceite visual, Marcos solicitou “vamos fazer o commit” em 12/11/2026. Incremento preparado para commit local conjunto das correções e evidências; referência resultante consultável no histórico Git. Publicação remota permanece separada. As referências anteriores a árvore não commitada descrevem a execução dos testes e preservam seus hashes.

Incremento local pronto para revisão; nenhuma publicação/commit novo. Comparador textual explícito nos dois pontos, preservando ordem UTF-16, e duas regressões públicas. Build inicial 70/238 PASS; build posterior conjunto com a correção de datas 72/240 PASS. [Resultados, hashes e diagnóstico CI](../testes/marcos-qualidade-1-resultados.md).

Scanner da develop identificado separadamente: Maven verify 239/49 e cobertura aprovados; análise posterior falhou por autorização/projeto. Causa exata/configuração segue com Débora. CodeRabbit/WSL indisponíveis; sem aprovação presumida. Plano/RTM conciliados com merges #23/#24 e handoff preparado sem envio à equipe.

Marcos informou “revisão visual aprovada” após a revisão preparada no Chrome com backend real e três perfis. [Registro do aceite e limites](../testes/marcos-qualidade-aceite-visual-2026-11-12.md). Sem ajuste solicitado, nova execução de suíte ou alteração de produto para registrar o aceite.

DoD local: requisitos/código/contratos preservados [x]; testes/build/lint/tipos [x]; segurança básica/sem dependências novas [x]; documentação/arquivos [x]; aceite visual do autor [x]. Administração integral [ ]: commit aguarda solicitação de Marcos; revisão de outro integrante e checks remotos ainda pendem. Cobertura backend refere-se à CI, sem percentual local novo; encerramento integrado permanece aberto.

### Agent Model Used

Codex: preparação AIOX SM, implementação AIOX Dev e revisão assistida independente AIOX QA; sem alteração de modelo solicitada.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-12 | Criada story Ready for Dev para os dois apontamentos de ordenação, diagnóstico separado Sonar e handoff de leitura/Q9/E2E; base develop da5881b e autorização de Marcos registradas. |
| 2026-11-12 | Comparador e regressões implementados; builds 70/238 e conjunto 72/240 aprovados; diagnóstico scanner/handoff e planos atualizados. Incremento local Ready for Review, sem commit. |
| 2026-11-12 | Aceite visual global informado por Marcos no Chrome com backend real, registrado sem nova suíte ou autorização de commit/publicação. |
| 2026-11-12 | Marcos solicitou commit local do conjunto aprovado; checklist atualizado, sem autorização de push/PR e sem encerrar dependências externas. |

### File List

Arquivos efetivamente criados/alterados, incluindo documentação compartilhada do fechamento:

- `docs/stories/marcos-qualidade-1.md`
- `backend/src/main/resources/static/js/administracao-recursos.js`
- `tests/unit/frontend/administracao-recursos.test.js`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/RTM.md`
- `docs/testes/marcos-qualidade-1-resultados.md`
- `docs/testes/marcos-qualidade-1-verificacao.txt`
- `docs/testes/marcos-qualidade-1-ci-diagnostico.txt`
- `docs/testes/marcos-qualidade-1.json`
- `docs/testes/marcos-qualidade-aceite-visual-2026-11-12.md`
- `docs/integracao/marcos-pendencias-2026-11-12.md`

## QA Results

**PASS técnico local — AIOX QA (Quinn), revisão assistida independente em 12/11/2026.** Inspeção dos diffs, testes e evidências; sem reexecutar suítes ou operar serviços. Não foram encontrados defeitos altos/críticos neste recorte.

O comparador mantém a ordem textual UTF-16 e igualdade de strings idênticas nas duas canonicalizações. As regressões exercitam operações públicas, conjuntos equivalentes reordenados e conteúdo divergente. O [build inicial 70/238](../testes/marcos-qualidade-1-resultados.md) e o [build conjunto 72/240](../testes/marcos-integracao-datas-1-resultados.md) estão aprovados; os hashes das fontes/testes foram recalculados na revisão e correspondem aos JSONs publicados. Checklist, Completion Notes, File List, planos/RTM e handoff refletem a base da5881b e os merges #23/#24.

O diagnóstico separa corretamente os testes Maven/JaCoCo aprovados da falha posterior de autorização/projeto no scanner. A correção das ordenações não aprova o Sonar. Revisão humana da equipe, CodeRabbit indisponível, remediação/Quality Gate Sonar, GETs/Q9 no servidor e matriz E2E completa permanecem pendentes. Este veredicto não altera o estado Ready for Review, não autoriza commit/publicação e não declara entrega integrada ou etapas 1–5 encerradas.
