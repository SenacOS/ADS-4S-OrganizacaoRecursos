# Marcos-qualitygate-1 — Correções de qualidade e consolidação após os PRs #28 e #29

## Status

Ready for Review

Em **13/11/2026**, Marcos autorizou corrigir os apontamentos de qualidade dos PRs #28/#29 e preparar o encaminhamento correto à equipe. Referência inicial conferida: árvore limpa em `test/marcos-fechamento-e2e`, HEAD/remoto `5537163`. PR #28: head `0775715`, base develop `4cea177`; PR #29: head `5537163`, mesma base, contendo o incremento do #28 ainda não mesclado. O executor revalidará essas referências antes de agir.

A autorização inicial incluía correção, verificação e relatório/mensagem local revisável, com publicação separada. Os resultados e o parecer QA registrados adiante descrevem essa execução sobre `5537163`, antes da atualização abaixo; não aprovam automaticamente a base nova.

**Checkpoint posterior de 13/11/2026:** Marcos informou que os PRs #28/#29 foram mesclados. O agente principal confirmou a develop `a0c04814211ed12f1c7086dc454560cb8cb56fc9`, contendo `5537163` e também os PRs #30/#31: Q3 impede autoaprovação pelo Responsável solicitante; Q1 restringe início/conclusão/não comparecimento ao Responsável. Diante do plano de consolidar as correções locais numa única branch `fix/marcos-qualitygate` sobre essa develop, revalidar o backend novo e então fazer commit, push e abrir um único PR, Marcos respondeu **“vamos fazer isso”**.

Essa resposta autoriza especificamente o fluxo de commit/push e criação do novo PR após as validações pertinentes, sem necessidade de inferir autorização dos PRs antigos. Não autoriza editar/reabrir PRs fechados, reescrever histórico, publicar comentários/mensagens sociais ou fazer merge do novo PR. Preparar a descrição do novo PR faz parte da entrega autorizada; encaminhamentos adicionais à equipe permanecem locais até pedido específico. O estado volta a Ready for Dev para a consolidação/revalidação, preservando todas as provas anteriores como históricas.

## Story

Como responsável pelos auxiliares e evidências do frontend, quero corrigir os usos de executáveis dependentes de PATH e organizar os metadados de integridade sem falsos indícios de credenciais, preservando provas e comportamento, para entregar a correção consolidada sobre a develop atual e separar os apontamentos de código da falha externa do scanner Maven. Os dois recortes originais permanecem na rastreabilidade; a entrega atual será um único PR novo, pois #28/#29 já foram mesclados.

Responsável: Marcos Boé. RF13/RF14 e qualidade/segurança das ferramentas de desenvolvimento; provas complementares dos fluxos já entregues. Preparação AIOX SM; implementação AIOX Dev; veredicto independente AIOX QA. Não adiciona funcionalidade ao produto nem certifica o Quality Gate remoto antes de nova análise.

## Fontes e diagnóstico recebido

- [PR #28](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/28) e [PR #29](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/29): heads/bases acima, a conferir pelo executor para associar cada apontamento à versão correta.
- Atualização confirmada pelo agente principal: develop `a0c04814211ed12f1c7086dc454560cb8cb56fc9`, após merges #28/#29 e entregas [#30](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/30)/[#31](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/31). Conferir `Reserva.aprovar`, permissões de início/conclusão/não comparecimento no domínio e `SecurityConfig` incorporados antes das novas asserções; não alterar essas regras de produto nesta story.
- Diagnóstico Sonar consultado pelo agente principal em 13/11: #28 Security B, seis `javascript:S4036`; #29 Security E, os mesmos seis mais três usos de PATH e três `json:S6418` BLOCKER. Security é a condição bloqueante informada; duplicação 0 e hotspots 100 nessa consulta não comprovam nova aprovação após mudanças.
- `tests/e2e-local/validar.cjs` linhas de referência 18/19, `validar-q9.cjs` 14/16, `validar-consulta-reservas.cjs` 10 e `controle.cjs` 67: seis chamadas de Git/PowerShell por nome simples, comuns aos dois PRs. São referências da versão analisada, não autorização para alterar chamadas diferentes só porque a numeração mudou.
- `validar-fechamento.cjs` linhas 17/18 e `sessao-temporaria.cjs` 16: três chamadas adicionais por PATH no #29. `controle.cjs` 40 tem `javascript:S8786` na detecção de include; `validar-fechamento.cjs` 40 tem `javascript:S7737` no objeto literal de viewport padrão. Esses apontamentos auxiliares também serão tratados sem modificar semântica.
- `docs/testes/marcos-fechamento-e2e-1/resultados-final.json` linha 253, `tentativa-coleta.json` 235 e `tentativa-incompleta.json` 36: os três `json:S6418` apontam valores SHA256 de `auth.js`. O agente principal recalculou os três e confirmou correspondência; são metadados de integridade da fonte, não credenciais. A transformação deve manter todos os valores e a proveniência original no commit `5537163`.
- [Fechamento E2E](marcos-fechamento-e2e-1.md), [relatório/evidências](../testes/marcos-fechamento-e2e-1-resultados.md), [consulta/edição](marcos-3-consulta-edicao.md), [Q9](marcos-integracao-q9-1.md) e [guia local](../integracao/marcos-e2e-local.md): resultados históricos e padrões de isolamento/sessão/massa/relato a preservar.
- `.github/workflows/ci.yml`: testes Maven/JaCoCo, JMeter e scanner Maven são etapas distintas. O diagnóstico remoto recebido informou Java **244 unitários/HTTP**, **57 MySQL**, JaCoCo e JMeter aprovados; scanner Maven falha depois com `Not authorized or project not found`. Ler somente configuração/logs pertinentes para confirmar referência, sem acessar, imprimir ou alterar tokens/secrets, grants, permissões, regras ou Quality Gate.

## Critérios de aceitação

1. Conferir novamente heads/bases e preparar **um único recorte** em `fix/marcos-qualitygate` a partir de `origin/develop` `a0c04814211ed12f1c7086dc454560cb8cb56fc9`. Antes da troca de base, preservar integralmente por cópia/hash e diffs os 37 candidatos autorais do checkout principal e os 18 da antiga worktree #28 informados pelo agente principal; conferir sobreposição com os arquivos alterados pela equipe e recuperar todos os bytes pretendidos. Consolidar os fixes comuns/exclusivos já preparados sem duplicá-los e sem trazer conteúdo ultrapassado sobre as regras Q1/Q3 novas. A worktree antiga fica preservada como origem histórica, sem atualizar PRs #28/#29 fechados. Registrar a migração e a base real; não rebasear/forçar histórico publicado. O commit/push e novo PR são autorizados após a revalidação, conforme checkpoint; merge continua separado.
2. Mapear cada apontamento confirmado para arquivo/chamada/regra/PR de origem e correção proposta. Separar `S4036`, regex/viewport e falsos indícios de credencial da falha de autorização/projeto do scanner Maven. Registrar fatos observados, versões e limites do diagnóstico; não afirmar que corrigir código resolve credencial do scanner ou que um gate antigo aprovado cobre a árvore nova.
3. Substituir todas as chamadas apontadas de Git e PowerShell por **caminhos absolutos validados** antes da execução, com origem de configuração confiável ou localização explícita conhecida e verificável. Não usar busca por PATH, comando `where/which` ou shell como atalho para redescobrir o executável. Rejeitar caminho relativo, inexistente, diretório, nome/tipo inesperado ou configuração inválida com erro seguro; usar os executáveis aprovados por argumento separado, `shell:false`/padrão equivalente, arrays de argumentos e `windowsHide` em helpers de fundo. Não montar comandos por concatenação de dados não validados nem introduzir dependência global de produto. O helper compartilhado fica sob `tests/e2e-local/`; preservar a equivalência das correções comuns originalmente preparadas e usar uma única implementação na árvore consolidada.
4. Preservar as operações atuais: descoberta de HEAD/branch/MERGE_HEAD, identificação segura de processo por PID/CreationDate/executável/JAR, controle de ambiente principal/temporário e execuções reais. Resultado ausente de MERGE_HEAD depois de um commit continua caso esperado, distinto de falha ao resolver o executável. Não transformar erro de configuração em valor de Git inventado ou esconder falha de processo. Os demais executáveis portáteis já usados por caminho absoluto permanecem identificados/validados; nenhuma mudança de backend, credencial ou identidade de instância para contornar os controles.
5. Reescrever a detecção de diretiva include em `controle.cjs` para comportamento equivalente com custo linear previsível em entradas longas/malformadas, preservando recusa de diretivas e aceitação das configurações locais válidas. Não afrouxar o controle de `!include`/variantes aceitas pela detecção existente nem inserir exclusão/supressão da regra. Retirar o literal de objeto como parâmetro padrão de viewport no auxiliar de fechamento sem mudar a dimensão/semântica das chamadas atuais; evitar compartilhamento mutável involuntário entre páginas/contextos.
6. Corrigir a representação dos hashes de evidência para expressar inequivocamente **integridade**, sem retirar dados ou disfarçar arquivo para escapar da análise. É permitida a projeção de mapas em array de registros `{arquivo, algoritmo: 'SHA-256', digest}`, preservando exatamente o conjunto de arquivos, algoritmo de integridade e cada digest original; chaves de caminho como `auth.js` deixam de ser nomes de propriedades associados a um suposto segredo. Aplicar a estrutura coerentemente à futura serialização dos helpers afetados e adaptar leitores/asserções/documentação pertinentes. Não trocar digest, apagar apontamento/cenário, reduzir métricas ou alterar horários/status/IDs/corpos registrados.
7. Para os três JSONs sinalizados, conferir e registrar equivalência sem perda entre a representação original em `5537163` e a projeção nova: todos os campos de prova, valores, contagens, timestamps, falhas/tentativas/cleanup e metadados originais permanecem preservados; somente a organização dos hashes muda, com proveniência documentada e original recuperável pelo commit/caminho. Comparar semanticamente o conteúdo não relacionado aos hashes e cada par arquivo/digest antes/depois. Não apresentar os hashes antigos dos auxiliares como hashes da implementação corrigida; manter rótulo histórico e inventariar separadamente os novos arquivos testados. Não marcar falso positivo remotamente ou alterar regras/exclusões Sonar sem autorização específica.
8. Acrescentar testes unitários de desenvolvimento significativos para resolução/validação e uso dos caminhos: caso válido, relativos/inexistentes/tipo ou executável inesperado, chamadas recebendo caminho absoluto e erro propagado com clareza, além das fronteiras relevantes de include/viewport e da projeção/equivalência de hashes. Pode haver módulo de funções puras testável sem ler credenciais/iniciar serviço na importação. Testes não devem apenas buscar uma string no arquivo ou replicar a implementação; devem observar comportamento público e negativos que impeçam fallback inseguro. Sem novos pacotes de produto.
9. Executar `node --check` e os testes unitários de desenvolvimento pertinentes na **árvore consolidada nova**, distinguindo os resultados anteriores 9/14 das provas posteriores à migração. Após estabilizar os helpers e reempacotar a base nova, reexecutar as suítes reais afetadas: smoke de referência **16**, Q9 de referência **10**, consulta/edição **8** e fechamento **11**, acrescendo na Q9 os dois cenários do AC 13. Os números são referências, não meta a fabricar; registrar falhas/bloqueios/alterações e identificar árvore/helper/JAR usados. Usar instâncias/massa próprias, sessão/CSRF reais, controle do temporário e ausência de mock; não relaxar isolamento para facilitar execução. As provas anteriores no JAR antigo continuam históricas e não validam o novo backend.
10. Preservar por hashes produto/telas e testes/configuração frontend da evidência **81/278**; nenhuma fonte de produto deve ser alterada pelo executor por inferência desta consolidação. Como a develop nova traz Java/regras Q1/Q3 diferentes, **reconstruir o JAR incorporado antes dos E2Es**, reiniciando somente processos próprios identificados e conferindo fontes/artefato servidos. Registrar o SHA/digest do novo JAR e dos helpers; nunca substituir digests originais de execuções antigas para fazê-los coincidir com a nova árvore. Se frontend/testes abrangidos não mudaram, reutilizar a regressão por correspondência de hashes; mudança abrangida necessária exige motivo e `npm run build` completo. Registrar testes Maven executados/omitidos sem confundir package, verify, E2E e Sonar remoto.
11. Manter `docs/testes/marcos-qualitygate-1-resultados.md` e evidências originais com seus estados históricos, acrescentando a revalidação/consolidação em seção ou relatório claramente identificado pela base `a0c0481`, novo JAR/árvore e datas. Atualizar o plano de aplicação para **um único PR novo** contra a develop atual; não propor corrigir/reabrir os PRs #28/#29 já mesclados. Preparar descrição factual do PR e encaminhamento local para a equipe: fixes, provas antigas/novas e dependência administrativa do scanner. A criação do novo PR e seu corpo fazem parte da autorização expressa após validar; comentários adicionais, mensagens/e-mails sociais e merge não estão autorizados. Se a configuração correta do Sonar não puder ser comprovada sem administração, registrar responsável/evidência/próxima ação sem pedir ou expor segredos.
12. Atualizar checklist, File List e referências conforme a consolidação real; preservar números/provas e rotular o QA anterior sobre `5537163` como histórico. Obter nova revisão assistida independente AIOX QA das correções, migração, novo JAR e reexecuções, além de revisão do autor pertinente, antes da entrega autorizada. O incremento pode ficar Ready for Review com dependência remota explícita; não marcar Quality Gate verde antes de nova análise do novo head, não atribuir revisão da equipe ou merge por inferência nem encerrar os RFs globais. Após as validações, prosseguir com commit/push e criação de **um único PR** já autorizados por “vamos fazer isso”, pelo papel AIOX correspondente; não transformar essa autorização em permissão de comentários/mensagens externas adicionais ou merge.
13. Acrescentar à verificação opt-in Q9 dois cenários HTTP reais, derivados das regras importadas, com fixtures novas e decisões por sessão: **Q3**, usuário com papel RESPONSAVEL que é também solicitante de sua própria reserva restrita, com vínculos necessários, recebe 403 ao tentar aprová-la e a reserva permanece SOLICITADA; comprovar por detalhe/SQL pertinente sem desativar a regra. **Q1**, ADMINISTRADOR recebe 403 em POST de início, conclusão e não comparecimento, e o estado de cada reserva permanece inalterado; usar estados/IDs apropriados independentes e revalidar os caminhos positivos do RESPONSAVEL já existentes/permitidos pela matriz, sem mudar papéis, regras ou backend. Não estender a proibição de autoaprovação à rejeição ou outra operação sem fonte contratual. Conferir a implementação importada antes das asserções, registrar códigos/estados observados e preservar falha se divergir; teste não passa por fabricar estado ou conceder permissão no banco.

## Tasks / Subtasks

- [x] Conferir PRs/heads/bases/árvores e definir os dois recortes/worktrees preservando dependências (AC 1).
- [x] Registrar o mapa de apontamentos e separar segurança de código/metadados da falha do scanner Maven (AC 2).
- [x] Resolver/validar executáveis por caminho absoluto e adaptar as chamadas compartilhadas sem fallback PATH (AC 3–4).
- [x] Corrigir a detecção linear de include e o default de viewport preservando semântica (AC 5).
- [x] Projetar hashes de integridade com esquema explícito e serialização futura compatível (AC 6).
- [x] Verificar equivalência integral dos JSONs migrados frente aos originais de 5537163 (AC 7).
- [x] Acrescentar testes de desenvolvimento relevantes, positivos e negativos (AC 8).
- [x] Executar sintaxe/unitários de helpers e reexecuções reais afetadas após estabilizar o código (AC 9).
- [x] Conferir preservação dos hashes de produto/testes e aplicar gates completos somente se houver mudança abrangida (AC 10).
- [x] Produzir relatório, evidências e mensagem local de encaminhamento com aplicação por PR e dependência Sonar (AC 11).
- [x] Atualizar checklist/File List e disponibilizar revisão do incremento ao autor.
- [x] Registrar veredicto independente AIOX QA da correção.
- [x] Commit/push/PR autorizados executados em 5569e57 / #32; nenhum envio adicional de mensagem ou merge realizado.

### Revalidação após a consolidação na develop a0c0481

Os checks acima descrevem a execução anterior sobre `5537163`; não se transferem automaticamente ao backend novo.

- [x] Preservar ambas as árvores por cópia/hash/diffs e consolidar os fixes em `fix/marcos-qualitygate` sobre a develop atual, mantendo a worktree antiga e sem reabrir PRs fechados (AC 1).
- [x] Reconstruir e identificar o novo JAR, registrar digests atuais e reexecutar os helpers/suítes reais na árvore consolidada (AC 9–10).
- [x] Exercitar Q3 de autoaprovação própria 403 e Q1 de início/conclusão/ausência negados ao Administrador, com positivos pertinentes do Responsável e estados preservados (AC 13).
- [x] Atualizar relatório/plano de entrega para um único PR (AC 11–12).
- [x] Registrar complemento independente de QA da consolidação na base a0c0481.
- [x] Na etapa histórica da publicação, commit/push executados e PR #32 aberto Ready for review (AC 12). Depois foi aprovado/mesclado, conforme atualização posterior; nenhuma mensagem externa adicional.
- [x] Conferir Quality Gate OK, registrar a orientação de Marcos sobre o scanner compartilhado e conciliar plano/entrega/RTM/índice/stories com evidência remota.
- [x] Confirmar aprovação humana/merge do #32 e integração Q8/#33; preservar documentos e sincronizar base62cd48f.
- [x] Reconstruir JAR e conferir os8testes Q8 entregues e12cenários reais Q9/Q1/Q3 após a mudança de backend, sem código autoral novo.
- [x] Relacionar evidência compartilhada Q8/MySQL do #34 (9/0 na CI) e atualizar base1948e69 preservando documentos, sem novo código ou execução local.
- [x] Conciliação documental conferida e commit/push/PR autorizados por Marcos nesta rodada; execução de publicação encaminhada ao DevOps.
- [x] Relacionar evidências compartilhadas RF10/RF11/segurança à CI e preparar pendências por responsável, sem confirmação coletiva presumida.
- [ ] Registrar ratificação contratual/processo dos vínculos e modo/evidências de aceite RF11 quando a equipe responder.

## Dev Notes

**Disposição atual após a migração autorizada:** o plano inicial de dois recortes terminou com os PRs #28/#29 mesclados. A execução atual será uma única árvore `fix/marcos-qualitygate` sobre develop `a0c04814211ed12f1c7086dc454560cb8cb56fc9`, mantendo as correções locais já validadas e a worktree antiga preservada como evidência de origem. Os parágrafos de recortes e o Dev Agent Record/QA abaixo descrevem a preparação/validação anterior; o executor registrará a nova migração/revalidação sem apagá-los. A autorização específica do usuário cobre commit/push e abertura do novo PR após validar, não mensagens externas ou merge.

Os PRs #30/#31 incorporados alteram regras de domínio/segurança, não telas: autoaprovação do próprio solicitante é recusada e operações de início/conclusão/ausência são exclusivas do Responsável. Verificar isso no código incorporado, reconstruir o JAR e executar os cenários do AC 13 com atores e estados válidos. Uma resposta 403 só é evidência da regra quando o ator/ID/estado e, no caso Q3, o vínculo completo foram preparados corretamente; não deixar uma negativa por falta de vínculo mascarar o teste de autoaprovação. Usar reservas separadas para decisões incompatíveis, sem forçar estado no banco. A evolução da base não autoriza modificar essas políticas nesta story.

Os unitários 9/14 e E2Es 16/10/8/11 registrados anteriormente usaram a base/JAR anteriores. Não são uma segunda execução nem uma aprovação do JAR novo; registrar o novo digest/testes com origem própria. A comparação de metadados dos três JSONs históricos contra `5537163` continua válida como equivalência desses originais, sem atribuir-lhes o novo backend. O parecer QA histórico permanece íntegro e exige complemento independente sobre a base atual antes da publicação autorizada.

Os nomes simples `git` e `powershell.exe` em `execFileSync` são o problema de PATH identificado. Uma string que pareça absoluta não basta se o executável/configuração não for validado; resolver a partir de uma fonte confiável e falhar com clareza é parte do comportamento. Não adicionar `where git` para resolver dinamicamente pelo mesmo PATH sinalizado, não usar `cmd /c` para contornar a chamada e não esconder a regra com `NOSONAR`. Um módulo puro compartilhado pode centralizar a resolução e ser importado por testes sem carregar o controle privado ou iniciar processos. Os nomes finais desse módulo/testes cabem ao executor, mantendo os limites da File List.

A correção comum precisa chegar aos dois heads; o fechamento temporário e sua evidência pertencem ao PR #29. Worktree isolada evita levar arquivos exclusivos do #29 ao #28. O agente principal confirmou a preparação de `.aiox-core/local/worktrees/marcos-sonar-pr28` sobre `feature/marcos-reservas-consulta`/`0775715`, mantendo o checkout principal do #29 em `5537163`, sem commits novos. Se configuração privada/paths ou serviços em uso impedirem a mesma execução num worktree, tratar a configuração local com os controles preservados ou registrar exatamente qual árvore equivalente executou cada teste; não rotular uma prova de outra árvore como execução independente. Nada nesta story autoriza rebase/force push ou mesclar PR sem review.

Nomes definidos para execução: módulo compartilhado `tests/e2e-local/executaveis.cjs` e testes de desenvolvimento `tests/unit/e2e-local/*.test.cjs`. Os caminhos Git/PowerShell absolutos resolvidos e validados ficam na configuração privada, nunca dependem do PATH de lançamento. A detecção de include pode ser expressa por processamento linear de linhas/trim, preservando o comportamento de rejeição. O helper de fechamento que antes comparava hashes de todos os auxiliares contra a rodada antiga deve distinguir baseline de produto/testes frontend, que continua idêntico, de auxiliares corrigidos, que recebem inventário novo; não atualizar digest antigo para fazê-lo coincidir com arquivo novo.

O diagnóstico `json:S6418` é um falso indício de segredo nos três valores já confirmados como SHA256 de fonte. A mudança de modelo de metadados é legítima se mantiver o significado, os valores e a rastreabilidade. Usar array de registros que diga o arquivo/algoritmo/digest reduz ambiguidade e melhora inventário; não renomear extensão para excluir do scanner, apagar o valor ou reescrever um resultado antigo como se tivesse sido obtido pelo helper novo. O original fica no histórico `5537163`; uma evidência de equivalência pode registrar commit/caminho e comparação dos campos. A projeção nova dos hashes não torna uma tentativa incompleta/falha em PASS.

A CI executa Maven verify antes da análise Maven, e o job JMeter tem evidências próprias. O erro de autorização/projeto do scanner exige conferência de configuração/permissão do serviço por quem tem acesso. Não é resolvido por mudar a classificação Security nem pelo novo esquema de JSON. Consultas de workflow/configuração são somente leitura; a solução local não depende de descobrir ou divulgar token e não autoriza mudar gates, permissões do GitHub, variáveis/secrets ou plano do serviço.

O sucesso local de sintaxe/unitários/E2E e a ausência de padrões conhecidos não são uma nova análise Sonar. Até os heads corrigidos serem publicados com autorização e analisados, o relatório deve indicar “correção local validada; Quality Gate remoto a conferir”. Resultados antigos de Maven/JaCoCo/JMeter, contagens e valores de integridade permanecem associados aos respectivos commits e execuções.

## Validação de preparação

Checklist `story-draft-checklist` conferido: objetivo e valor, origem dos apontamentos, recortes por PR, fontes concretas, controles de execução/evidência, testes e limites remotos estão explícitos. Escopo deriva do pedido de correção dos gates e dos achados já diagnosticados; não cria regra de produto, exigência de segredo ou endpoint. Preparação AIOX SM não é parecer QA, reexecução de suíte ou aprovação de Sonar.

## CodeRabbit Integration

Tipo principal: Qualidade/segurança de ferramentas de desenvolvimento; secundário: integridade de evidências/documentação. Execução AIOX Dev; veredicto independente AIOX QA. Focos: ausência de PATH/shell inseguro, validação de executáveis, include linear, equivalência integral dos metadados, separação dos dois PRs, identidade de processos e resultado remoto distinto do local. CodeRabbit com resultado/indisponibilidade explícitos, sem aprovação presumida; self-healing AIOX Dev light até 2 iterações/15 minutos para CRITICAL e HIGH documentado. Gates de sintaxe/unitários/E2E pertinentes e frontend completo quando aplicável, conforme AC 9–10. Publicação e operações de PR seguem autorização própria e AIOX DevOps.

## Dev Agent Record

### Entrega documental autorizada e pendências para a equipe

Marcos respondeu “vamos fazer isso” à publicação da conciliação e pediu a lista por responsável para encaminhar, informando que ainda não recebeu confirmações novas. Commit/push/PR documental autorizados nesta rodada, sem merge ou mensagens externas. [Texto pronto e respostas esperadas](../integracao/marcos-pendencias-fechamento-2026-11-13.md). Evidências disponíveis RF10/RF11/segurança relacionadas aos logs da CI do #34 e às fontes; Mockito/WireMock e controles de implantação mantêm seus limites. Nenhuma nova execução de suíte; nenhum código autoral/CI modificado. Status Ready for Review preservado para a documentação; formalização coletiva permanece pendente. O commit que inclui este registro identifica a entrega preparada; resultado da publicação será confirmado no PR.


### Complemento compartilhado Q8/MySQL — PR #34

#34 aprovado por Marcos e mesclado1948e69; adiciona somente ReservaAprovacaoMysqlIT. CI43447037478:9testes Q8/MySQL aprovados, incluídos no total66integrações;261unitários/HTTP, JaCoCo e JMeter aprovados. [Fonte, log, cenários e limites](../testes/marcos-q8-pr34-evidencias.json). Evidência da equipe relacionada à lacuna Q8/MySQL, sem nova execução local, reconstrução de JAR ou alteração autoral de código. Base documental atual1948e69 por fast-forward, onze documentos preservados antes da atualização. Scanner compartilhado mantém tratamento alinhado; sem novo Quality Gate inferido. Publicação documental e confirmações compartilhadas restantes seguem pendentes; pareceres QA e resultados anteriores conservam sua origem. Os checkpoints seguintes são históricos.


### Atualização após os merges #32/#33

#32 aprovado por jovemOG-Dev e mesclado3e1a2a0; #33/Q8 aprovado por Marcos e integrado62cd48f. Documentação local preservada por cópia/hash e trazida para `docs/marcos-fechamento-etapas` sobre62cd48f. Revalidação pertinente executada com JAR reconstruído:8/0unitários Q8 e12/0Q9/Q1/Q3 reais. [Nova prova e limites](../testes/marcos-fechamento-pos-merge-32-33.json). Suítes anteriores preservam base/hash/origem; não foram novamente executadas. Nenhum código autoral/CI modificado. CodeRabbit continua indisponível; scanner compartilhado não bloqueia a implementação por orientação de Marcos. Pareceres QA preservados, sem novo veredicto ou encerramento global. Documentação atual ainda sem commit/push; confirmações compartilhadas seguem pendentes. Os checkpoints seguintes descrevem as fotografias anteriores.


### Checkpoint documental de publicação — 13/11/2026

Commit/push concluídos em **5569e57**; [PR #32](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/32) aberto para developa0c0481 e já Ready for review, sem merge e com zero reviews submetidos. Quality Gate confirmado OK pela API pública; CI Maven failure pelo scanner, com253/57/JaCoCo/JMeter aprovados. Marcos orientou desconsiderar temporariamente o erro compartilhado como bloqueio de sua implementação, preservando o fato registrado. CodeRabbit permanece indisponível, sem aprovação presumida.

Conciliação exclusivamente documental: plano com um checkpoint vigente, históricos rotulados, entrega/RTM/índice e registros das stories alinhados; [estado remoto e limites](../testes/marcos-fechamento-status-2026-11-13.md). Nenhum novo teste executado ou código de produto/CI alterado. Pareceres QA abaixo preservados sem edição ou novo veredicto inferido. A documentação desta rodada permanece sem commit/publicação; merge/revisão coletiva não executados.

### Completion Notes

Correção local sobre5537163 em test/marcos-fechamento-e2e e recorte comum sobre0775715 na worktree feature/marcos-reservas-consulta. Sete fontes comuns idênticas, sem trazer os exclusivos do#29 ao#28. Resolução absoluta/validação e executor sem shell, include linear com todos os terminadores anteriores, viewport independente e inventário SHA256 explícito implementados.

Sintaxe dos10auxiliares aprovada; unitários9/0 na worktree#28 e14/0 na principal#29. Reexecuções reais na principal: smoke16/0/0,Q9 10/0,consulta8/0,fechamento11/0; principal preservada e temporária encerrada. Prova real usa bytes comuns iguais, sem alegar outra execução independente no#28. Produto/testes frontend/JAR preservados;81/278 anterior reutilizado por hashes, sem novo package.

Os três JSONs históricos foram reprojetados e restaurados integralmente contra originais5537163: todos35digests e demais campos preservados. Falhas/tentativas e hashes históricos não foram reapresentados como implementação nova. Novas provas e12fontes corrigidas estão em docs/testes/marcos-qualitygate-1/. QA encontrou diferença de terminadores INI e lacuna de teste de executor/viewport; ambas corrigidas antes das reexecuções reais.

Relatório principal e recorte#28, guia e mensagem local para equipe preparados. Scanner Maven continua exigindo conferência de token/permissão/organização/projeto; não houve acesso a secrets nem alteração de workflow/gate/supressão. Qualidade remota só poderá ser confirmada depois da publicação autorizada e nova análise. Revisão do autor, commits/push/atualização de PR/mensagem externa e merge permanecem separados.

**Consolidação posterior autorizada:** branch `fix/marcos-qualitygate` sobrea0c0481 criada com37arquivos locais preservados por hash; árvore principal e worktree antiga copiadas antes da troca (37/18arquivos), sem sobreposição com os seis arquivos da equipe. JAR reconstruído e serviços próprios reiniciados. Novos resultados:14unitários,16/0/0smoke,12/0Q9/Q1/Q3,8/0consulta e11/0fechamento. [Relatório e digests novos](../testes/marcos-qualitygate-1-consolidacao-resultados.md). Produto/CI iguais à develop; provas antigas abaixo e em outros relatórios mantêm suas bases.

A publicação autorizada será em um PR corretivo único, em rascunho para acompanhamento das verificações pendentes. CodeRabbit local indisponível (CLI ausente/WSL não instalado), sem alegar aprovação dessa ferramenta; o scanner Maven depende da conferência administrativa já documentada. QA independente da base nova é registrado separadamente; nenhum merge, comentário adicional ou mensagem externa faz parte dessa publicação.

### Agent Model Used

Codex, preparação AIOX SM e execução AIOX Dev; revisão independente AIOX QA em seção própria.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-13 | Conciliação documental com publicação autorizada; evidências RF10/RF11/segurança relacionadas e pendências por responsável preparadas após Marcos informar ausência de confirmações novas. |
| 2026-11-13 | #34/Q8 MySQL aprovado e integrado1948e69;9testes reais confirmados na CI, fonte/limites relacionados e base documental atualizada com11arquivos preservados; sem nova execução local ou commit/push. |
| 2026-11-13 | #32 aprovado/mesclado e #33/Q8 integrado; base62cd48f em branch documental preservada, JAR reconstruído,8unitários Q8 e12cenários reais aprovados; sem commit/push documental. |
| 2026-11-13 | Publicação5569e57/#32, Quality Gate OK e Ready for review conferidos; conciliação documental local, scanner compartilhado temporariamente não bloqueante por orientação do autor; sem merge ou nova execução de testes. |
| 2026-11-13 | Story Ready for Dev para achados Quality Gate PRs #28/#29: executáveis absolutos, regex/viewport, metadados SHA256 sem perda, dois recortes e diagnóstico do scanner separado, sem publicação automática. |

| 2026-11-13 | Correções locais preparadas e verificadas no recorte#29 e comum; fontes e evidências preservadas, sem commit/push ou confirmação de gate remoto. |
| 2026-11-13 | Após merges#28/#29/#30/#31, migração preservada para fix/marcos-qualitygate sobrea0c0481; JAR novo e revalidação14/16/12/8/11 aprovadas. Autorizados commit/push/PRcorretivo após validar, sem merge. |

### File List

Arquivos efetivamente criados/alterados na entrega consolidada:

- `docs/api/reservas-contrato.md`
- `docs/integracao/marcos-e2e-local.md`
- `docs/integracao/marcos-fechamento-entrega.md`
- `docs/integracao/marcos-qualitygate-equipe-2026-11-13.md`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/RTM.md`
- `docs/stories/marcos-fechamento-e2e-1.md`
- `docs/stories/marcos-qualitygate-1.md`
- `docs/testes/marcos-fechamento-e2e-1/resultados-final.json`
- `docs/testes/marcos-fechamento-e2e-1/tentativa-coleta.json`
- `docs/testes/marcos-fechamento-e2e-1/tentativa-incompleta.json`
- `docs/testes/marcos-fechamento-e2e-1-resultados.md`
- `docs/testes/marcos-qualitygate-1/arvore-corrigida.json`
- `docs/testes/marcos-qualitygate-1/consolidacao/arvore-testada.json`
- `docs/testes/marcos-qualitygate-1/consolidacao/consulta.txt`
- `docs/testes/marcos-qualitygate-1/consolidacao/consulta-real.json`
- `docs/testes/marcos-qualitygate-1/consolidacao/empacotamento.txt`
- `docs/testes/marcos-qualitygate-1/consolidacao/fechamento.txt`
- `docs/testes/marcos-qualitygate-1/consolidacao/fechamento-real.json`
- `docs/testes/marcos-qualitygate-1/consolidacao/q9.txt`
- `docs/testes/marcos-qualitygate-1/consolidacao/q9-real.json`
- `docs/testes/marcos-qualitygate-1/consolidacao/smoke.txt`
- `docs/testes/marcos-qualitygate-1/consolidacao/smoke-real.json`
- `docs/testes/marcos-qualitygate-1/consolidacao/unitarios.txt`
- `docs/testes/marcos-qualitygate-1/consulta.txt`
- `docs/testes/marcos-qualitygate-1/consulta-real.json`
- `docs/testes/marcos-qualitygate-1/equivalencia-evidencias.json`
- `docs/testes/marcos-qualitygate-1/fechamento.txt`
- `docs/testes/marcos-qualitygate-1/fechamento-real.json`
- `docs/testes/marcos-qualitygate-1/q9.txt`
- `docs/testes/marcos-qualitygate-1/q9-real.json`
- `docs/testes/marcos-qualitygate-1/smoke.txt`
- `docs/testes/marcos-qualitygate-1/smoke-real.json`
- `docs/testes/marcos-qualitygate-1/unitarios-pr28.txt`
- `docs/testes/marcos-qualitygate-1/unitarios-pr29.txt`
- `docs/testes/marcos-qualitygate-1-consolidacao-resultados.md`
- `docs/testes/marcos-qualitygate-1-pr28-resultados.md`
- `docs/testes/marcos-qualitygate-1-resultados.md`
- `tests/e2e-local/configuracao-local.cjs`
- `tests/e2e-local/controle.cjs`
- `tests/e2e-local/evidencias.cjs`
- `tests/e2e-local/executaveis.cjs`
- `tests/e2e-local/sessao-temporaria.cjs`
- `tests/e2e-local/validar.cjs`
- `tests/e2e-local/validar-consulta-reservas.cjs`
- `tests/e2e-local/validar-fechamento.cjs`
- `tests/e2e-local/validar-q9.cjs`
- `tests/e2e-local/viewport.cjs`
- `tests/unit/e2e-local/configuracao.test.cjs`
- `tests/unit/e2e-local/evidencias.test.cjs`

- `docs/README.md`
- `docs/stories/marcos-3-consulta-edicao.md`
- `docs/testes/marcos-fechamento-status-2026-11-13.md`
- `docs/testes/marcos-fechamento-status-2026-11-13.json`

- `docs/testes/marcos-fechamento-pos-merge-32-33.json`

- `docs/testes/marcos-q8-pr34-evidencias.json`

- `docs/integracao/marcos-pendencias-fechamento-2026-11-13.md`

Backups, worktree anterior, credenciais, ferramentas e configuração local permanecem privados/ignorados. Os arquivos históricos mantêm a proveniência; não publicar essas áreas privadas.

## QA Results

### Revisão histórica dos recortes sobre 5537163 e 0775715

**PASS técnico local — AIOX QA (Quinn), revisão independente em 13/11/2026.** Correções, testes, equivalência das evidências, separação dos recortes e documentação revisados. Nenhum achado bloqueante permanece no escopo. Ready for Review preservado; este parecer não declara Quality Gate remoto aprovado.

Os apontamentos locais foram tratados sem mudança de produto: Git/PowerShell passam pelo executor comum, com caminhos absolutos de configuração privada confiável, arquivo/nome/destino real validados, argumentos separados e `shell:false`/`windowsHide:true` forçados. Não há busca por PATH. Erros de execução propagam; a ausência esperada de MERGE_HEAD continua distinta de erro de configuração. Controles de banco/processos e encerramento da instância temporária foram preservados. A validação não autentica a origem de um binário arbitrário informado na configuração.

Dois achados P2 desta revisão foram corrigidos **antes** das reexecuções reais: perda da recusa de include após CR isolado/U+2028/U+2029 e ausência de prova explícita do uso do invocador/viewport. Os testes finais cobrem todos os terminadores anteriores, entrada longa, caminho realmente recebido pelo invocador, opções forçadas, argumento inválido e propagação do erro original. Viewport default e móvel mantêm dimensões com objetos independentes. Logs conferidos: **9/0 na worktree do #28** e **14/0 na árvore principal do #29**; sintaxe dos auxiliares registrada pelo executor. A revisão QA não executou testes, serviços ou Git nem acessou credenciais/configurações privadas.

[Evidências finais](../testes/marcos-qualitygate-1-resultados.md) conferidas: smoke **16/0/0**, Q9 **10/0**, consulta **8/0** e fechamento **11/0**, executados na árvore principal sobre `5537163`, com correções ainda sem commit. Todos os artefatos inventariados nos quatro JSONs correspondem aos arquivos atuais (**11/9/11/40** registros, respectivamente); o manifesto das **12 fontes corrigidas** e os **10 arquivos de produto/testes** do baseline anterior também conferem. Fechamento registra inatividade real de **65.345 ms**, um PATCH no duplo clique, atraso final **3 s** e encerramento exclusivo da temporária com principal preservada. O build anterior **81/278** é reutilizado por correspondência de hashes, não apresentado como nova execução.

Conferência independente dos três JSONs históricos contra os backups públicos de `5537163`: cada um preserva seus **35 pares arquivo/digest**, algoritmo SHA-256 e todos os demais campos. Final11/0, tentativa9/1 e tentativa incompleta sem fim/resumo mantêm seus estados originais. A projeção reversível para registros explícitos de integridade não apaga falhas nem atribui hashes antigos aos auxiliares corrigidos. Os sete arquivos comuns são byte a byte iguais nas duas árvores; a evidência real compartilhada identifica corretamente execução no #29, sem alegar outra E2E independente no #28. Mensagem local para a equipe também corresponde entre recortes.

Relatório, File List e encaminhamento distinguem a correção dos auxiliares/metadados da falha administrativa do scanner Maven. Autorização do token/projeto/organização exige conferência da equipe; não houve alteração de token, workflow, regra, gate ou supressão para contornar o diagnóstico. Após commits/publicação autorizados, somente nova análise de cada head confirma o Quality Gate. Revisão do autor/equipe, commits, push, atualização dos PRs, mensagem externa e merge continuam pendentes e separados deste PASS local; nenhuma certificação global de RFs, carga ou CI é inferida.

### Complemento de consolidação na develop a0c0481

**PASS técnico local da consolidação — AIOX QA (Quinn), revisão independente em 13/11/2026.** Este complemento substitui a referência de entrega em dois recortes por uma única correção em `fix/marcos-qualitygate`, sobre `a0c04814211ed12f1c7086dc454560cb8cb56fc9`. O parecer acima permanece histórico e não é usado como prova automática do novo backend. Nenhum achado bloqueante foi identificado na consolidação e nos dois cenários acrescentados; Ready for Review preservado.

[Relatório da consolidação](../testes/marcos-qualitygate-1-consolidacao-resultados.md), story refinada, inventário e novas provas conferidos. O manifesto atual tem **15 artefatos**, todos com SHA-256 correspondente ao arquivo atual, incluindo auxiliares, testes, domínio/segurança incorporados da equipe e o JAR novo **e1e620cbce823b926ec348fe4447edfdc352060b33c7dccf243cf5020c29d2e7**. O empacotamento registrado omitiu testes Maven/IT; BUILD SUCCESS não é clean verify. Produto/frontend e seus testes permanecem preservados; a regressão **81/278** continua histórica por correspondência de fontes, sem alegar nova execução.

Logs/JSONs da árvore consolidada conferidos: **14 unitários/0 falhas**, smoke **16/0/0**, Q9 **12/0**, consulta **8/0** e fechamento **11/0**. As quatro provas reais identificam a base `a0c0481`; seus **11/9/11/40 registros de integridade**, respectivamente, correspondem aos arquivos atuais. Execuções entre 13:29:16 e 13:30:55 UTC usam o JAR novo e fontes servidas conferidas. Inatividade real de **65.491 ms**, cookie mantido, 401/redirecionamento e encerramento exclusivo da temporária com principal preservada foram registrados novamente. A revisão QA não executou testes, Git ou serviços e não leu credenciais privadas.

Os dez cenários Q9 anteriores foram mantidos; os dois novos foram revisados contra `Reserva.aprovar`, operações do domínio e `SecurityConfig` atuais. **Q3:** Responsável solicitante com vínculo completo no recurso B recebe403/OPERACAO_NAO_PERMITIDA ao tentar aprovar sua reserva restrita; GET e SQL preservam SOLICITADA antes do cancelamento explícito posterior. **Q1:** Administrador recebe403 para início em APROVADA, conclusão em EM_USO e ausência em APROVADA, com estado preservado; Responsável vinculado recebe200 nas três ações e SQL confirma CONCLUIDA/NAO_COMPARECEU. Trata-se de prova HTTP+SQL dos casos delimitados, sem novas telas, alteração de relógio ou escrita SQL de estado.

Preservação das árvores anteriores, ausência de sobreposição com as alterações de Java/segurança da equipe e origem histórica da worktree antiga estão documentadas. Os JSONs históricos e seus estados FAIL/incompleta continuam preservados; hashes antigos não foram atualizados para simular correspondência com o JAR novo. A entrega atual não exige publicar novamente as branches dos PRs #28/#29 já mesclados.

**Encaminhamento de QA:** recorte local apto ao fluxo de commit/push e abertura de **um PR em rascunho** autorizado por Marcos, sujeito à conferência do diff/manifesto final pelo AIOX DevOps. Isso não aprova merge nem Quality Gate remoto. CodeRabbit local indisponível (CLI/WSL ausentes) permanece explícito; scanner Maven/organização/projeto/permissão, análise Sonar do novo head e revisão humana continuam pendentes. Nenhuma alteração de token, workflow, regra ou gate foi feita para contornar essas dependências. A autorização de publicação atual não é autorização para mensagens externas adicionais, reabrir PRs antigos ou concluir requisitos globais por inferência.
