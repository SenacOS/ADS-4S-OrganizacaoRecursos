# Marcos Boé — responsabilidades e plano de ação

## Encerramento integrado — PR #36 mesclado

**Entrega das etapas 1 a 5 integrada à develop e encerrada no escopo de Marcos.** [PR #36](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/36) aprovado por jovemOG-Dev e mesclado em **c4279b6**; contratos/ADR-007, operação dos vínculos, RF11 simulada, evidências e aceite do autor entregues. [Registro verificável](../testes/marcos-encerramento-etapas-1-a-5-2026-11-13.json).

Quality Gate do #36 **OK**; testes Java/MySQL, JaCoCo e JMeter aprovados na CI43472622587. A conclusão global continua failure no scanner Maven por autorização/projeto, com tratamento compartilhado temporariamente não bloqueante da implementação por orientação de Marcos. CodeRabbit local continua indisponível, sem aprovação presumida. Isso não declara toda a CI verde nem certifica requisitos globais/produção.

A base foi sincronizada por fetch e branch documental própria em **c4279b6**, contendo também o [PR #37](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/37). Esse PR acrescenta a porta/projeção/adaptador MySQL do RF12 e7testes de integração aprovados na CI43474698759; **não entrega serviço/agregação, DTO ou endpoint HTTP de relatório**. RF12/etapa6 é continuidade distinta, fora deste encerramento.

Frontend, procedimentos e auxiliares das etapas1a5 permanecem byte a byte como no headbe1dbc7 do #36. A diferença até a base sincronizada contém somente os4arquivos RF12 novos. Não foram repetidos frontend/demo/Maven nem reconstruído JAR nesta conferência; provas8/0,81/278, tentativas e respectivos hashes mantêm suas origens.

Este registro pós-merge é exclusivamente documental e ainda aguarda commit/publicação pelo fluxo. Não há nova implementação, decisão ou operação local pendente no plano1a5; a aplicação do runbook no ambiente compartilhado e os controles de produção conservam seus registros próprios.

Os checkpoints seguintes conservam a cronologia anterior; menções a revisão, commit, publicação ou merge pendentes nessas seções não descrevem o estado vigente.

## Fechamento delegado — 13/11/2026

Marcos comunicou carta branca da equipe e adotou as decisões do [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Os contratos atuais, incluindo vínculo com todos os recursos, ficam formalizados **por decisão delegada de Marcos**, sem atribuir assinaturas individuais aos demais integrantes. Datas com offset, PATCH conjunto,409/FORA_DO_EXPEDIENTE, estados/perfis de edição/cancelamento e escopos/erros Q9 permanecem como implementados; Q1/Q3/Q8 preservadas.

Processo de vínculos definido no [runbook restrito](../operacao/vinculos-responsaveis.md), com [SQL reutilizável](../operacao/vinculos-responsaveis.sql). Administrador autoriza, operador SQL executa pares explícitos com referência/registro; concessão exige RESPONSAVEL e recurso ativos, revogação remove pares obsoletos e é idempotente.

RF11 adotada no **modo simulado real** previsto no ADR-006: base/processo exclusivos, worker e GatewayNotificacaoPadrao reais, URL vazia, log rastreável e ENVIADA na outbox. Sem envio externo. [Procedimento de demonstração](../operacao/demonstracao-fechamento.md), [story](../stories/marcos-fechamento-delegado-1.md) e [resultados/limites](../testes/marcos-fechamento-delegado-1-resultados.md). A execução local não é implantação no ambiente compartilhado.

As menções anteriores a ratificação por integrante, processo indefinido ou modo RF11 aguardando decisão são históricas e foram superadas por esta delegação. Resultados antigos conservam sua origem. Restam revisão do incremento pelo autor, commit/publicação quando solicitados e revisão/integração dos PRs; não há fechamento global de todos os RFs por inferência.


**Checkpoint vigente de fechamento em12/11:** frontend aceito enviado em0775715; novo complemento em `test/marcos-fechamento-e2e` com **11/0 reais**, sem alterar produto. Timeout genuíno, login/CSRF, pesquisa, disputa/estado concorrente e atraso de devolução agora têm provas próprias. [Matriz/resultados](../testes/marcos-fechamento-e2e-1-resultados.md), [sequência de entrega/PR](../integracao/marcos-fechamento-entrega.md). Restam revisão/commit solicitado do complemento, PRs/checks/merges e confirmações compartilhadas; leituras/telas não são novas pendências. Os relatos seguintes são históricos.

**Aceite posterior do complemento Marcos-3:** Marcos confirmou os testes, aprovou a revisão visual e autorizou commit local em 12/11. [Registro](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md). Próximos checkpoints são publicação/PR conforme solicitação, revisão da equipe, checks/merge e cenários integrados restantes. Os estados anteriores abaixo conservam seu momento; não há novo bloqueio de GET/Q9 ou de aceite visual deste incremento.

**Checkpoint vigente em 12/11/2026:** push de **f9c4912** confirmado por Marcos; nova branch **feature/marcos-reservas-consulta** dessa base. Complemento da etapa 3 implementado localmente: lista/detalhe autorizados, edição completa preservando recursos/precisão e cancelamento confirmado. [Story](../stories/marcos-3-consulta-edicao.md), [regressão, E2E e limites](../testes/marcos-3-consulta-edicao-resultados.md). GETs e Q9 já entregues pelos PRs #26/#27; smoke não registra mais bloqueio de interface ausente. Revisão visual nova, commit solicitado, publicação/revisão/merge e matriz integrada completa continuam pendentes. Relatos abaixo preservam seus momentos históricos; consultar este checkpoint e o [plano de fechamento](marcos-fechamento-etapas-1-a-5.md) para o estado atual.

Estado: PLANO EM EXECUÇÃO; respostas de contrato adotadas por Marcos em 10/11/2026. Um commit local por etapa concluída, conforme autorização do usuário. Revisões de outros integrantes continuam identificadas separadamente.

Aceite posterior da integração Q9/PR27: Marcos confirmou aprovação visual e solicitou commit local em12/11. [Evidência e limites](../testes/marcos-integracao-q9-1-aceite-visual-2026-11-12.md). Resta implementar interface geral no próximo recorte; autorização de publicação e demais dependências continuam separadas.

Atualização vigente após PR #27: develop `4cea177`, integração local sem commit com dados/evidências preservados. Q9/fila reais **10/0**, smoke **16/0/1**, contrato externo mantido. [Resultado posterior ao merge](../testes/marcos-integracao-q9-1-pr27-resultados.md). Próximo checkpoint: revisão visual/commit solicitado; próximo recorte funcional: interface geral de lista, edição e cancelamento. Sonar e demais dependências da equipe continuam separados. Relatos abaixo preservam conferências anteriores.

Avanço após PR #26 em 12/11: leituras de reservas e autorização Q9 entregues na develop `3f2a9a3`. Nova branch `feature/marcos-integracao-q9`, merge sem commit preservando `8c21a43`; V6 e fila real validadas (8/0 Q9; smoke16/0/1). [Registro](../testes/marcos-integracao-q9-1-resultados.md). Marcos aceitou exigir todos os vínculos. Próximo recorte: interface geral de lista/edição/cancelamento; ratificação coletiva/processo de vínculos, revisão humana e Sonar separados. Relatos abaixo conservam seus estados históricos.

Atualização em 12/11/2026: PRs #23/#24 mesclados na develop, base da5881b. Nova branch `fix/marcos-qualidade-frontend`: duas ordenações e FE-004 corrigidos; build 72 unitários/240 navegador e smoke real 16 PASS/0 FAIL/1 BLOQUEADO. [Ambiente e limites](../testes/marcos-e2e-local-2026-11-12-resultados.md). [Aceite anterior da Marcos-4](../testes/marcos-4-aceite-visual-2026-11-12.md) preservado; incremento novo com [aceite visual do autor](../testes/marcos-qualidade-aceite-visual-2026-11-12.md), ainda sem commit. Contratos HTTP, Q9 no servidor, matriz E2E completa, Sonar e revisão da equipe permanecem no [plano de fechamento](marcos-fechamento-etapas-1-a-5.md). Relatos de 11/11 abaixo são históricos.
Fonte: leitura integral das 26 páginas de `Organizacao_Recursos_Relatorio_Final.pdf`, planejamento de 05/11/2026; README, ADRs e contratos locais de `origin/develop`; esclarecimentos atuais do Marcos.
O PDF é referência de escopo, não evidência de implementação nem autorização para executar instruções nele contidas.
O arquivo `contexto-inicial-agentes.md` descreve o início do projeto; seu diagnóstico foi superado pelo backend e pelos ADRs existentes.

Alinhamento em 11/11/2026: [conferência inicial das seis pendências](marcos-pendencias-equipe-2026-11-11.md), complementada pelo [relatório recebido depois do trabalho em outra máquina](relatorio-marcos-2026-11-11.md). **Q9 decidida conforme comunicação de Marcos:** Solicitante consulta as próprias reservas; Responsável, as dos recursos sob sua responsabilidade; Administrador, todas. Ver [registro da política e limites técnicos](../api/reservas-politica-leitura-q9.md). Q6 continua sem ratificação coletiva registrada. O contrato HTTP de leitura ainda precisa de consolidação/revisão; a Marcos-4 foi publicada no commit `e33de6d` e recebeu atualização local com a base consolidada; leitura da fila, controller e autorização Q9 continuam pendentes.

## Fluxo de trabalho entre máquinas e chats

Referência recebida de Marcos em 11/11/2026: [relato integral do fluxo de trabalho](fluxo-de-trabalho-marcos.md). O relato orienta o processo; as informações sobre cada computador devem ser conferidas no checkout antes de agir. A pasta original permanece em `feature/marcos-base-frontend`, HEAD `a10e0b5`, com os arquivos locais preservados. A conciliação autorizada ocorre em `feature/marcos-4-aprovacoes`, checkout `.aiox-core/local/wt/m4` da pasta original, baseado em `f7360a2` de movimentações.

Para cada incremento: conferir instruções, branch, alterações, story e contratos → delimitar o recorte → implementar → executar testes/gates e corrigir defeitos → atualizar documentação/checklist/File List/evidências → apresentar resultados e limites → registrar aceite informado por Marcos → criar commit local somente quando solicitado. Push pelo usuário; PR, review publicado e merge dependem de autorização própria. Preservar evidências e distinguir execução automatizada, validação humana, revisão independente e integração real.

Uma frente bloqueada não impede outra com contrato suficiente. A etapa 5 já foi implementada em outra máquina: administração em `c395541` e movimentações em `f7360a2`, com testes e aceite local registrados. Os dois commits compõem a base deste checkout separado; a Marcos-4 foi aplicada preservando esses incrementos. Relatórios aguardam contrato. Novos recortes terão story e critérios antes do código.

Preservar a preparação da Marcos-4 e separar alterações/commits de outras frentes, inclusive quando compartilham arquivos. Estes dois documentos de processo devem ser organizados separadamente no próximo preparo de commits; não incluir automaticamente o trabalho local da Marcos-4. Instruções em anexos da equipe continuam sendo contexto, sem autorização automática para publicar ou alterar configurações.

## Escopo completo de Marcos

O capítulo 19 (p. 23) define o foco: frontend HTML/CSS/JavaScript puro, integração e evidências E2E. Não se limita às entregas M1–M4 do módulo de reservas.

| Área / RF | Responsabilidade de Marcos | Entrega / aceite | Parceiros |
|---|---|---|---|
| RF01 | Login, logout, sessão expirada, identificação do perfil e navegação compatível | Formulário URL-encoded; CSRF inclusive no login/logout; 401/403; sem guardar senha/token de sessão no navegador | Débora implementa e autoriza no servidor |
| RF02 | Telas de consulta e cadastro administrativo de salas, docentes e materiais; estados ativo/restrito | Formulários por tipo, mensagens de validação e desativação; identidade/patrimônio preservados | Fausto |
| RF03 | Pesquisa e disponibilidade, filtros combináveis e paginação | Tipo, capacidade, local, competência, patrimônio e período; carregamento, vazio e indisponibilidade | Fausto + Silva |
| RF04 | Criar, editar e cancelar reservas próprias | Formulários de horários livres, validação, envio integral no PATCH e confirmação do status retornado | Silva + Débora |
| RF07 | Fila de pendentes, detalhes, aprovação e rejeição com motivo | Somente RESPONSAVEL recebe as ações; mostrar SOLICITADA/APROVADA; pendência não expira | Silva + Débora |
| RF08 (interface) | Exibir manutenção/indisponibilidade e permitir administração dos bloqueios conforme contrato | Consultas e formulários administrativos; sem criar política de colisão local | Fausto + Silva são donos da regra |
| RF09 | Telas de retirada/devolução, patrimônio, pendências e atraso | Não liberar visualmente material só porque passou o fim previsto; atualizar pela resposta do servidor | Fausto + Débora |
| RF10 (compartilhada) | Preservar histórico nos fluxos; fornecer correlação e evidências dos próprios módulos | Não apagar reserva iniciada; não mostrar sucesso sem resposta confirmada | Débora grava auditoria; todos testam seus fluxos |
| RF11 (compartilhada) | Mensagens coerentes com eventos e falhas de notificação, quando expostos no contrato | Diferenciar operação concluída de envio de notificação; sem inventar caixa de notificações ou API | Débora + Silva |
| RF12 | Telas de utilização por recurso, horas e conflitos evitados | Filtros de período/recurso, unidades claras, vazio e erros; CSV é opcional no PDF | Silva + Fausto entregam agregações/API |
| RF13 (principal) | Responsividade, acessibilidade básica e feedback compreensível em todas as telas | Celular/desktop, teclado, labels, foco, contraste, carregamento, mensagens e bloqueio de envio repetido | Débora apoia qualidade |
| RF14 (coordenação) | Clientes JS, revisão de contratos e documentação dos fluxos públicos | Rotas, DTOs, estados, erros, datas, perfis, exemplos e instruções reproduzíveis | Toda a equipe |
| E2E | Definir e executar navegação, reserva, conflito, aprovação, cancelamento e retirada/devolução | Navegador com backend real na validação final; prints e relatórios identificados na RTM | Débora |

RF05/RF06: Marcos apresenta conflitos e testa o fluxo, mas a regra de sobreposição e a garantia transacional de unicidade pertencem a Silva/Fausto, com provas de Débora. Desabilitar botão não comprova concorrência nem autorização.

Entregáveis autorais (p. 23): interface estática funcional/responsiva, clientes da API, mapa de telas, testes E2E, mensagens e documentação dos fluxos. Responsabilidades coletivas (pp. 19–25): testes do próprio código, evidências executadas, atualização da RTM com Débora, revisão de colega, documentação por PR, registro de defeitos, demonstração e defesa da autoria. CI, Sonar, JaCoCo e JMeter são coordenados por Débora; Marcos contribui com cenários/dados e evidências da interface.

## Mapa de telas e fluxo

| Arquivo / área alvo | Conteúdo e fluxo | Dependência |
|---|---|---|
| `login.html` | Login → identificar sessão → dashboard; erro de credenciais no formulário | Autenticação de Débora |
| `index.html` | Dashboard com reservas próprias e atalhos por perfil | Leitura de reservas ainda ausente |
| `pages/recursos.html` | Pesquisa/disponibilidade, cadastros e bloqueios administrativos | Contrato item18 + autenticação/eventos |
| `pages/reservas.html` | Escolher período/recursos → criar → status; editar/cancelar próprias | Escritas existentes; GETs pendentes |
| `pages/aprovacoes.html` | Fila restrita → detalhes → aprovar ou rejeitar com motivo | Cliente da especificação na Marcos-4; leitura/autorização no backend pendentes |
| `pages/movimentacoes.html` | Número da reserva do comprovante + seleção de patrimônio → retirada → pendências → devolução; Administrador em leitura | Contrato item18; validação real no servidor |
| `pages/relatorios.html` | Período/recurso → agregados e estados | API de relatórios pendente |

Fonte única: `backend/src/main/resources/static/`, com `pages/`, `components/`, `css/`, `js/` e `assets/` criados conforme necessidade. Sem framework ou compilação do produto. Scripts Node são somente ferramentas de desenvolvimento.
Protótipos simples devem mostrar navegação, estados vazio/carregando/erro/sucesso e composição móvel antes de expandir as telas.

## Ordem de execução, sem sprints ou prazo inventado

| Ordem | Incremento verificável | Critério de saída | Estado |
|---|---|---|---|
| 0 | Ler PDF, inspecionar branches/contratos e levantar responsabilidades | Fontes e dependências identificadas neste documento | CONCLUÍDO |
| 1 | Story Marcos-1: base `api.js`, `auth.js`, `reservas.js`, `forms.js` | Testes isolados relevantes, lint e verificação JS; docs de consumo | VALIDADO LOCALMENTE; revisão pendente |
| 2 | Login, logout, navegação por perfil e estrutura visual responsiva | Formulário, perfil, erro/expiração e teclado em navegador | INCREMENTO LOCAL ENCERRADO com aceite de Marcos em 10/11/2026; testes reexecutados pelo autor aprovados; story Ready for Review; integração/revisão de outro integrante/CodeRabbit/CI pendentes ([evidência](../testes/marcos-2-resultados.md)) |
| 3 | Pesquisa/disponibilidade + criar/editar/cancelar reservas | Formulários e estados com API controlada nos testes; integração quando habilitada | EM EXECUÇÃO — [Marcos-3](../stories/marcos-3.md): pesquisa/seleção/criação implementadas e validadas localmente (32 testes unitários, 76 de navegador; [evidências](../testes/marcos-3-resultados.md)). Q9 decidida por perfil; listagem, reabertura para edição e cancelamento continuam pendentes de contratos/GETs e autorização que a apliquem. Não se encerra toda a etapa 3 com este recorte. |
| 4 | Aprovação/rejeição e fila | Revisar proposta de leitura; testar RESPONSAVEL e acessos negados com Débora | FRONTEND VALIDADO E ACEITO VISUALMENTE — [Marcos-4](../stories/marcos-4.md) em feature/marcos-4-aprovacoes, sincronização a8da77c publicada no PR #24 para develop. Regressão 68 unitários/238 navegador aprovada; [aceite visual de Marcos em 12/11](../testes/marcos-4-aceite-visual-2026-11-12.md). [Evidência da conciliação](../testes/marcos-4-conciliacao-resultados.md) e [execução original preservada](../testes/marcos-4-resultados.md). Contrato coletivo, endpoint HTTP/autorização real, revisão de outro integrante, checks e E2E continuam pendentes. |
| 5 | Recursos/cadastros/manutenção e movimentações | Consumir item18; validar retirada, atraso, devolução e restrições por perfil | IMPLEMENTAÇÃO LOCAL ENCERRADA E CÓDIGO ENTREGUE À DEVELOP — administração `c395541` e movimentações `f7360a2`, reunidas pelo [PR #23 mesclado](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/23), commit 23cf839. Testes e aceite anteriores de Marcos: administração 45/130, conjunto de movimentações 57/190; [sincronização posterior](../testes/marcos-sincronizacao-2026-11-12-resultados.md) com a fila preservou 68/238. Não somar as contagens. Qualidade/CI e validação dos fluxos com backend real continuam separadas; [relatório histórico](relatorio-marcos-2026-11-11.md). |
| 6 | Relatórios e mensagens de eventos | Consumir API confirmada; validar filtros, unidades e períodos vazios | PENDENTE |
| 7 | E2E real e acabamento | Fluxos completos, larguras móveis/desktop, falhas e evidências; RTM/README atualizados | PENDENTE |
| 8 | Revisão e entrega | Revisão humana, CI verde, defeitos tratados e demonstração reproduzível | PENDENTE |

Os incrementos futuros recebem suas próprias stories e critérios antes do código. Não se considera a entrega inteira concluída pela implementação da primeira base.

Recorte autorizado nesta sessão: Marcos confirmou seguir os contratos atuais. `pages/recursos.html` e `pages/reservas.html` usam consultas de recursos/expediente e POST já contratados, com mocks apenas nos testes. O preview não simula APIs. A listagem de reservas anteriores e a reabertura para editar/cancelar aguardam leitura autorizada; não são criados GETs fictícios. A parte restante da etapa 3 precisa de critérios próprios assim que o contrato de leitura existir.

## Dependências concretas para integração

- **Débora:** sessão/CSRF/`me`, auditoria e notificações já estão na base develop `3454fda`. Conferir integração com a interface, permissões e quais leituras podem expor solicitante.
- **Silva:** consolidar escritas/erros e edição; implementar consulta de reservas, detalhes e fila junto à leitura do Fausto. Confirmar estados editáveis e comportamento da mudança comum/restrita.
- **Fausto:** disponibilizar porta de leitura de reservas e validar DTOs de recurso/expediente/disponibilidade. `GET /api/recursos` com filtros já está escrito e documentado no item18; ativação e integração ainda são condicionais.
- **Equipe:** aplicar a [Q9 comunicada por Marcos](../api/reservas-politica-leitura-q9.md) aos contratos e à autorização real, incluindo o escopo dos recursos do Responsável. A convenção 403/404 não veio no relatório. Revisar/implementar a especificação da fila; o E2E integrado ainda precisa ser executado com backend real.
- `reservas.api.enabled=false`: manter desligada até as dependências reais. Não criar provedores vazios de auditoria/autenticação para habilitar produção.
- Não existem ainda `GET /api/reservas` e `GET /api/reservas/{id}`. Não presumir disponibilidade de reservas: a API de pesquisa de recursos escrita não equivale à integração ponta a ponta concluída.
- Marcos-4 implementa somente o cliente do GET de fila especificado em `reservas-leitura-contrato.md`, com status SOLICITADA e guarda visual de RESPONSAVEL. Não cria esse endpoint no backend, leitura geral/Q9 nem GET de detalhe. API controlada nos testes não comprova a autorização real.
- Não existe idempotência implementada. Bloquear submissão repetida na interface e não repetir escrita automaticamente; em falha de rede, orientar conferir o resultado.

## Respostas adotadas para o contrato

Estas respostas foram adotadas pelo usuário para o frontend. Elas não atribuem aprovação coletiva aos demais integrantes nem tornam endpoints existentes. A leitura da fila tem [especificação própria](../api/reservas-leitura-contrato.md), ainda sem implementação.

1. **Saída com offset -03:00: serve.** Aceitar ISO 8601 com offset explícito, preservar o instante e apresentar em `America/Sao_Paulo`. Em 2026, o exemplo -03:00 atende. Não fixar o fuso pelo computador do usuário nem anexar -03:00 a qualquer horário/instante sem conversão. `datetime-local` não contém offset: adaptar o formulário usando o fuso operacional, com testes, antes da integração.
2. **PATCH com os três campos: funciona.** O formulário deve carregar a reserva completa e reenviar `inicio`, `fim`, `recursosIds`, incluindo o que não mudou. Preservar seleção completa ao editar; não mandar apenas diferenças, solicitante, papel ou status. O contrato já declara substituição desses campos, não da entidade inteira. É preciso o GET de detalhe para carregar e reabrir edição de forma confiável; não inventar o conteúdo a partir de lista incompleta. A questão de atualização concorrente/versionamento continua com o backend; não presumir suporte a ETag/If-Match.
3. **Fora do expediente: manter 409 / FORA_DO_EXPEDIENTE.** Trata-se de incompatibilidade com o funcionamento configurado do recurso; é consistente com as demais indisponibilidades. 422 também seria uma convenção defensável para rejeição semântica, mas não há necessidade do cliente de mudar o contrato atual. Intervalo malformado ou fim não posterior permanece 400. Mostrar mensagem específica e permitir corrigir período, sem retry automático. Fundamentação: [RFC 9110, 409](https://www.rfc-editor.org/rfc/rfc9110.html#name-409-conflict) e [422](https://www.rfc-editor.org/rfc/rfc9110.html#name-422-unprocessable-content); a aplicação ao expediente é recomendação de projeto.
4. **Fila de aprovação: confirmar uma leitura própria/autorizada.** O DTO atual basta para enviar a decisão, mas só IDs prejudicam a avaliação. Recomendação mínima: id/status/restrita/inicio/fim, identificação legível dos recursos (tipo, nome/código, patrimônio quando houver) e identificação mínima do solicitante autorizada por Débora. Se alocação docente exigir competências, trazer os dados necessários para essa validação; não inventar motivo de solicitação ou campo obrigatório no POST. `motivoDecisao` já existe; rejeição exige `motivo`. Data de criação é útil para ordenação por espera, mas opcional e ainda não contratada.

Proposta de leitura da fila para discutir com Silva/Fausto/Débora: `GET /api/reservas?status=SOLICITADA&inicio=...&fim=...&recursoId=...&pagina=0&tamanho=20`, retornando `{itens,pagina,tamanho,total}`, página zero-based, máximo 100 e ordem estável por início/id. Filtro de período e de recurso + paginação são suficientes para o primeiro incremento. Definir a semântica do intervalo (recomenda-se sobreposição), ordenação e escopo no servidor. Não implementar como fato nem obter a fila filtrando no navegador todas as reservas. Perfil RESPONSAVEL obrigatório na interface de decisões; Administrador não herda aprovação. A Q9 foi comunicada depois dessas respostas e agora orienta o escopo por perfil, incluindo recursos sob responsabilidade do ator; contratos HTTP e autorização ainda precisam aplicá-la.

## Continuidade após o relatório de 11/11/2026

O [relatório original](relatorio-marcos-2026-11-11.md) foi preservado integralmente. A consulta remota confirmou a sequência [PR #19](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/19) (base → develop), [PR #20](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/20) (administração → base) e [PR #21](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/21) (movimentações → administração). Na conferência inicial os três estavam abertos e a develop em `395ac73`. Na atualização posterior, os três estão mesclados; #20/#21 chegaram apenas a bases intermediárias. A develop conferida é `3454fda`; a entrega da etapa 5 segue pelo PR #23. O PR #21 confirma push/criação de PR que ainda não estavam confirmados no relatório.

As evidências publicadas de [administração](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/c395541c7c297cfde92de3245b5c8b7fe7c0b152/docs/testes/marcos-5-resultados.md) e [movimentações](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/f7360a238ac36ea672955c421ee44557436f1c7c/docs/testes/marcos-5-movimentacoes-resultados.md) foram consultadas inicialmente. A nova reexecução consolidada nesta máquina está no [registro de atualização](../testes/marcos-integracao-2026-11-11-resultados.md). As contagens são cumulativas dentro daquela cadeia de branches e não incluem os testes locais da Marcos-4. Não somar 57/190 com 43/124 como resultado de uma execução consolidada.

Marcos autorizou o plano de conciliação após receber o relatório. Foram preservados 29 arquivos locais por cópia e SHA-256; criada branch própria sobre movimentações em checkout separado; e conciliados navegação, testes e documentação. O link de Aprovações convive com Gestão e Movimentações conforme o perfil, com verificação das rotas nos testes. A pasta original e os commits publicados permanecem preservados. A regressão conjunta passou com 68 unitários/238 navegador; [log, diagnóstico inicial e capturas](../testes/marcos-4-conciliacao-resultados.md). A reexecução automatizada fornecida por Marcos no checkout conciliado também passou com 68/238, em 6,3 min. Marcos solicitou o commit após a reexecução aprovada; a revisão visual não foi descrita separadamente. O commit `e33de6d` foi criado e o push confirmado. Marcos autorizou a entrega da etapa 5 e a atualização da Marcos-4 com a base consolidada. Regressão após atualização: 68/238 aprovados; push das novas mesclas permanece com o usuário. O PR separado da Marcos-4 será empilhado sobre `feature/marcos-5-administracao-recursos` enquanto o PR #23 não for integrado.

A política Q9 permite especificar as consultas restantes; ela não disponibiliza os endpoints nem remove as dependências de leitura/autorização. Esta conciliação reúne os clientes de frontend; o E2E real ainda depende da equipe. Este registro documental foi preparado antes do commit autorizado; push e PR não são executados automaticamente.

**Mensagem pronta para a equipe:**

> Do lado do frontend, ISO 8601 com offset atende; vamos exibir em America/Sao_Paulo. O PATCH funciona reenviando inicio, fim e recursosIds juntos. Proponho manter 409/FORA_DO_EXPEDIENTE. Para aprovações, preciso da leitura autorizada de pendentes com período, recurso e paginação, usando o mesmo envelope de recursos; detalhes devem trazer identificação legível dos recursos e identificação mínima do solicitante permitida pela segurança. Os GETs e seus filtros ainda precisam ser fechados com Silva, Fausto e Débora. Aprovar/rejeitar continua exclusivo de RESPONSAVEL e rejeição exige motivo.

## Validação e evidências planejadas

- Testes isolados dos clientes: CSRF dinâmico, formulário URL-encoded, respostas 204, 401 distintos, 400/403/404/409, DTO completo e duplo envio.
- Testes da interface com mocks são evidência de cliente, não E2E completo.
- E2E final em navegador: login/logout, busca, comum APROVADA, conflito 409, restrita SOLICITADA, aprovação/rejeição, cancelamento, edição conflitante (CT19), retirada/devolução (CT16), expiração, CSRF/negação (CT14/17/18) e uso móvel.
- Prova de concorrência e persistência continua em MySQL/Testcontainers com a equipe; mocks não substituem.
- Cada evidência registra comando, data, ambiente, cenário e resultado; RTM compartilhada aponta para arquivos/CI reais. Metas 80%/70% pertencem à cobertura do projeto e não são inferidas destes testes.
