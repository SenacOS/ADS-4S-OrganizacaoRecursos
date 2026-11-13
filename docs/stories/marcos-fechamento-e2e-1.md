# Marcos-fechamento-e2e-1 — Complemento real de E2E das etapas 1 a 5

## Status

Ready for Review

Atualização histórica de integridade em13/11: os JSONs dessa execução foram reprojetados sem perda para formato explícito de artefatos, com originais5537163 preservados. Auxiliares receberam correções próprias na [story de Quality Gate](marcos-qualitygate-1.md); provas novas e hashes corrigidos são separados. Os resultados/QA abaixo conservam a versão e o momento anteriores, sem reatribuição de testes ao código novo.

**Aceite posterior em12/11/2026:** Marcos aprovou a revisão das evidências e da sequência de entrega, sem ajuste solicitado. [Registro e alcance](../testes/marcos-fechamento-e2e-1-aceite-2026-11-12.md). Não houve mudança de produto/auxiliares ou nova execução de testes. O veredicto QA abaixo conserva o momento anterior a esse aceite; commit/publicação/revisão da equipe/checks/merge continuam separados.

Continuidade autorizada por Marcos em **12/11/2026**, após informar o push de `0775715` em `feature/marcos-reservas-consulta`. O agente principal confirmou a referência e a árvore inicialmente limpa, e criou `test/marcos-fechamento-e2e` sobre essa base, preservando commits/evidências existentes. Esta story autoriza preparação e validação locais, sem commit, push, PR ou merge automáticos.

## Story

Como responsável pelo frontend, quero executar os cenários reais ainda descobertos da matriz das etapas 1 a 5 e relacioná-los às evidências já existentes, para distinguir fluxos comprovados, falhas e dependências remanescentes antes do fechamento integrado.

Responsável: Marcos Boé. RF01, RF03, RF04, RF05, RF09, RF13 e RF14 nos cenários efetivamente exercitados; referências complementares a RF10/RF11 quando houver persistência observada. Preparação AIOX SM; execução AIOX Dev; veredicto independente AIOX QA. O incremento não declara todos os RFs, transições, NFRs, CI ou etapas integrais concluídos.

## Fontes e contexto

- [Plano, passo 7](../planejamento/marcos-fechamento-etapas-1-a-5.md#11-passo-7--validar-com-backend-real) e [passo 8](../planejamento/marcos-fechamento-etapas-1-a-5.md#12-passo-8--revisão-merges-e-encerramento-das-etapas-1-a-5): matriz de acesso, pesquisa, concorrência/edição, movimentações e experiência real; fechamento exige distinguir revisões, checks e merge.
- [Consulta/edição, resultado final](../testes/marcos-3-consulta-edicao-resultados.md): build **81 unitários/278 navegador**, E2E específico **8/0** e smoke **16/0/0**, com limites e tentativas preservados. [Manifesto da árvore](../testes/marcos-3-consulta-edicao/arvore-testada.json), [aceite visual](../testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md) e [story](marcos-3-consulta-edicao.md): contexto da base `0775715`; não substituem cenários novos.
- [Q9 PR #27, prova real](../testes/marcos-integracao-q9-1-pr27-resultados.md): escopos, fila, página vazia e revogação já exercitados; não repetir apenas para aumentar contagem. [Contrato de consultas](../api/reservas-consulta-contrato.md).
- [Contrato de reservas: autenticação e erros](../api/reservas-contrato.md#autenticação--atualização-comunicada-em-10112026): login form-urlencoded, CSRF dinâmico, cookie HttpOnly, GET me, códigos e ausência de replay.
- [Item18: recursos e movimentações](../api/item18.md), `RecursoController`, `RecursoService` e `MovimentacaoService`: busca paginada/disponibilidade informativa, retirada em `[inicio,fim)` de material ativo em reserva APROVADA/EM_USO, atraso/retorno e permissões.
- `SecurityConfig.java`, `application.yml` e infraestrutura Spring/Tomcat existente: sessão real com fixação mitigada e CSRF em HttpSession; não há endpoint de simulação de expiração ou alteração de relógio.
- `ReservaService.java`, `ReservaTransacional.java`, `RecursosPort.java` e `Reserva.java`: locks/READ_COMMITTED, revalidação de conflito, edição pelo dono/estado e cancelamento conforme matriz. `StatusReserva.java`: transições; não inventar um 409 para qualquer alteração concorrente se o domínio atual recusar com 403.
- [Guia do ambiente isolado](../integracao/marcos-e2e-local.md), `tests/e2e-local/controle.cjs`, `validar.cjs`, `validar-q9.cjs` e `validar-consulta-reservas.cjs`: identidades de instância/processos e padrões de massa/relato seguros. Configuração, dados, credenciais e logs brutos já são ignorados em `.aiox-core/local/`.

## Critérios de aceitação

1. Conferir branch/árvore, HEAD `0775715`, referências e hashes dos artefatos antes de executar. Criar/usar branch própria definida pelo executor sem alterar commits publicados, preservar evidências anteriores e registrar se a árvore é ou não commitada. Inventariar cenários da matriz como já comprovados, previstos nesta rodada ou ainda pendentes, apontando a evidência específica e a camada HTTP/SQL/navegador. Não somar contagens de rodadas distintas nem repetir testes aprovados sem mudança ou lacuna pertinente.
2. Implementar somente auxiliares de desenvolvimento opt-in sob `tests/e2e-local/`, usando Node/Playwright já existentes e configuração privada externa. São permitidos `validar-fechamento.cjs` e um auxiliar específico de instância temporária, como `sessao-temporaria.cjs`, quando necessário. Sem novas dependências de produto, interceptação de API, `route.fulfill`, autenticação falsa, beans substitutos, acesso ao banco pelo frontend ou mecanismo de teste incluído em produção. Código do produto permanece inalterado, salvo defeito concreto reproduzido, rastreado e corrigido dentro do comportamento contratado com testes adequados.
3. Executar UI de login real com credencial inválida de usuário fictício: POST form-urlencoded/CSRF real, HTTP 401 CREDENCIAIS_INVALIDAS, mensagem compreensível e referência de suporte quando retornada, formulário utilizável e possibilidade de ação explícita posterior. Distinguir credencial inválida de sessão expirada. Exercitar também uma escrita da interface recusada pelo servidor por CSRF realmente inválido/ausente, observando HTTP 403 e mensagem, sem êxito falso ou replay; renovar por nova ação explícita conforme o cliente existente. Usar estado de sessão/token real preparado pelos mecanismos existentes, sem alterar/interceptar cabeçalhos de transporte, desabilitar CSRF ou inventar resposta do servidor. Se só for viável a negativa por requisição HTTP direta, registrar essa camada e manter o comportamento da UI não exercitado como pendência específica, sem chamar a prova de E2E visual completa.
4. Para expiração por **inatividade real**, iniciar uma instância temporária do JAR em porta livre própria e loopback, com timeout curto configurado somente no processo (`server.servlet.session.timeout` por configuração externa/env existente), mesma base de teste já identificada e worker de notificações desligado. Não editar application.yml, Java, serviços Windows, grants ou relógio. Usar cookies/contexto de navegador exclusivos para essa instância e estado/logs privados separados; cookies HTTP não isolam sessões por porta. Não sobrescrever PIDs/estado da instância principal. Conferir executável, JAR, CreationDate/PID e endereço antes de parar somente o processo temporário, inclusive após falha de teste; preservar banco/instância principal.
5. Na instância temporária, comprovar login/sessão válida antes da espera e, após período de inatividade real observado, GET protegido com 401 NAO_AUTENTICADO e redirecionamento da interface ao login na interação/recarga pertinente. Não apagar cookie/storage, executar logout, invalidar sessão por código ou bloquear uma resposta para chamar isso de timeout. Evitar polling/autoconsultas do mesmo contexto durante a janela ociosa; registrar tempo observado e parâmetro configurado sem presumir que o container honrou segundos exatos ou ignorar seu arredondamento mínimo. Fazer esperas em trechos curtos, com limite total explícito e progresso durante execução; se o timeout mínimo/ambiente impedir a prova proporcional sem alterar servidor, registrar BLOQUEADO com causa/tempo/ação necessária em vez de forçar PASS ou trocar por simulação.
6. Validar pela pesquisa real de recursos: combinação contratada de período/filtro, resultado vazio com identificação exclusiva inexistente, recurso comprovadamente ocupado retornando indisponível e sem seleção válida para nova reserva, e paginação real com itens/total coerentes. Preparar massa exclusiva suficiente para cruzar uma página ou usar tamanho contratualmente permitido; não atribuir vazio da massa a vazio global da base. Conferir expediente informado e que a disponibilidade é consultiva, revalidada na escrita. Não introduzir filtro/endpoint novo nem inferir disponibilidade se uma consulta falhar.
7. Executar disputa real de criação entre **duas sessões autenticadas independentes**, para o mesmo recurso comum e intervalo elegível exclusivos da rodada, com CSRF próprio de cada sessão. Preparar ambos os contextos antes de disparar as escritas concorrentes; registrar respostas reais esperadas de um 201 e um 409 de indisponibilidade e IDs/intervalos pertinentes, sem retry para alterar a estatística. SELECT restrito à massa deve confirmar **uma única reserva ocupante persistida** para esse recurso/intervalo e ausência de segunda reserva/associação parcial criada pela tentativa perdedora. Se a disputa for só por HTTP, identificar HTTP+SQL; somente chamar de duas UIs concorrentes quando o clique/envio de ambas tiver sido exercitado no navegador. Não apresentar uma corrida de teste como prova geral de carga, todas as transações ou eliminação de todos os deadlocks.
8. Exercitar alteração real de estado por outro ator após o GET que abriu o editor: o dono carrega uma reserva editável; outro ator autorizado muda seu estado por operação contratada; a tentativa subsequente no editor recebe recusa real, não mostra sucesso e permite reconsultar/reconciliar o detalhe conforme o comportamento do cliente. Exemplo suportado: Administrador cancela reserva APROVADA comum do Solicitante antes de seu PATCH. Conferir resposta do domínio atual (403 por estado/permissão ou 409 quando aplicável à operação), mensagem e estado persistido; não impor 409 ou ETag/versionamento inexistente. Nova ação deve usar detalhe/estado atual e confirmação pertinente, sem reenvio automático do corpo anterior nem reapresentação de ações proibidas.
9. Exercitar retirada real elegível de material ativo pertencente a reserva APROVADA/EM_USO dentro de `[inicio,fim)`, com operador vindo da sessão. Preparar um período próximo ao relógio real com margem suficiente para retirar antes do fim; registrar tempos reais, sem adiantar relógio ou modificar datas diretamente no banco. Após ultrapassar o prazo com espera curta, verificar que a retirada permanece nas abertas e o cliente a identifica como pendente com estimativa de atraso, sem liberar material por decurso de tempo. Registrar devolução pelo Responsável e conferir data/operador/atraso final positivo retornados pela API e persistidos; comparar com a regra de segundos inteiros do servidor, sem exigir igualdade exata ao relógio do navegador.
10. Na movimentação, conferir que ADMINISTRADOR consulta retiradas abertas em modo leitura sem ações de retirar/devolver. Uma tentativa HTTP real de escrita com esse perfil deve retornar 403 e preservar a movimentação; ausência do botão sozinha não prova segurança. Usar sempre IDs da massa própria. Observar após devolução que a retirada deixa a lista aberta e o material continua sujeito a reservas/manutenções existentes, sem prometer disponibilidade automática. Se o relógio/rede fizer a janela de retirada expirar antes da preparação, preservar a tentativa, registrar a causa e preparar outra massa explícita; não reescrever a evidência original nem contornar a janela no produto.
11. Nos caminhos reais efetivamente executados, conferir mensagens/correlationId, ausência de dados desnecessários de outros usuários, guarda contra envio repetido e contexto recuperável sem replay. Exercitar teclado/foco e layout móvel/desktop em pelo menos os caminhos pertinentes de login/pesquisa/edição/movimentação selecionados pelo executor, registrando quais e a viewport exata. Não chamar API falsa, erro de rede fabricado ou regressão controlada de falha real do servidor. Casos de rede/intermitência não reproduzíveis com o ambiente existente podem permanecer identificados com a prova controlada anterior e a lacuna integrada correspondente; não instalar proxy de falhas, desabilitar segurança ou interromper serviços de terceiros para criar cobertura.
12. Toda preparação cria recursos/usuários/reservas por HTTP real autorizado com identificações exclusivas e datas compatíveis com expediente/regras atuais. SQL é somente SELECT de inspeção, exceto vínculos próprios de teste quando indispensáveis e já validados por instância/IDs/código/perfil, nos limites dos auxiliares existentes. Não atualizar reservas, timestamps, usuários, senhas/grants ou estados no banco para fabricar resultados. Validar UUID/datadir/porta da base; não limpar/apagar dados de outra rodada. Armazenar credenciais, cookies, CSRF, configuração do processo e logs brutos somente nos caminhos ignorados, sem valores em argumentos, evidência pública ou console.
13. Conferir hash do JAR e das fontes efetivamente servidas em cada instância usada. Reutilizar o JAR atual somente se corresponder à árvore `0775715`; reempacotar quando necessário, parando apenas processo próprio antes de substituir artefato em uso. Registrar comandos Maven e omissões de testes explicitamente; package com skip não é clean verify nem aprovação de cobertura/CI. Executar `node --check` dos auxiliares novos/alterados e o complemento real. Se produto/configuração/testes frontend permanecerem idênticos, conferir hashes e referenciar o build anterior **81/278** sem repeti-lo por alteração apenas documental/auxiliar. Defeito concreto com mudança de produto exige regressões necessárias e build completo de lint/typecheck/unitários/navegador, com falha anterior, correção e resultados efetivos registrados.
14. Produzir `docs/testes/marcos-fechamento-e2e-1-resultados.md`, JSON/logs/capturas sanitizados pertinentes e instruções de execução/encerramento, identificando data/fuso, HEAD/base/branch/estado da árvore, hashes, versões, portas, instância, massa e camada de cada cenário. Marcar PASS, FAIL, BLOQUEADO ou não executado conforme evidência, sem impor contagem fixa. Preservar tentativas/falhas anteriores e distinguir espera real, timeout de ferramenta e expiração da sessão. Atualizar plano/RTM/handoff/checklist/File List somente para condições efetivamente atendidas; vincular às provas anteriores sem apagar seus limites.
15. Encerrar apenas o incremento verificável: cenário inviável sem mudança de servidor recebe causa, limite da tentativa, responsável/próxima ação e permanece aberto no plano; isso não vira aprovação simulada. Revisão assistida independente AIOX QA e aceite visual pertinente do autor são separados de revisão humana da equipe, ratificação coletiva/processo de vínculos, CodeRabbit/Sonar, PR e merge à develop. Não alterar backend/política/produção para tornar testes verdes. Se houver defeito fora do frontend, registrar reprodução e encaminhamento; nenhuma mensagem externa, commit, push, PR ou merge é executado por inferência desta story.

## Tasks / Subtasks

- [x] Conferir base/árvore/hashes e mapear lacunas atuais da matriz, preservando evidências já aprovadas (AC 1).
- [x] Preparar auxiliares opt-in e fixtures exclusivas com configuração privada externa e limites de execução (AC 2, 12).
- [x] Executar login inválido e negativa CSRF reais, registrando UI/HTTP e eventuais lacunas separadas (AC 3).
- [x] Iniciar instância temporária própria, conferir identidade/isolamento e verificar timeout por inatividade real (AC 4–5).
- [x] Executar pesquisa real com vazio, indisponível, filtros/período e paginação (AC 6).
- [x] Executar disputa entre duas sessões reais e confirmar persistência única por SELECT (AC 7).
- [x] Executar mudança de estado por outro ator depois do detalhe e verificar recusa/reconsulta do editor (AC 8).
- [x] Executar retirada, prazo ultrapassado, devolução e atraso final, além de Administrador somente leitura/negativa de escrita (AC 9–10).
- [x] Conferir erros/mensagens/perfis/teclado/foco/viewports nos caminhos reais escolhidos e registrar os não executados (AC 11).
- [x] Encerrar somente a instância temporária própria, preservando instância principal/dados e registrando estado final (AC 4, 12).
- [x] Executar verificações proporcionais, registrar hashes e evidências, corrigindo somente auxiliares; nenhum defeito funcional de produto demonstrado (AC 13–14).
- [x] Atualizar plano/RTM/handoff, checklist e File List sem encerrar condições externas por inferência (AC 14–15).
- [x] Registrar veredicto independente AIOX QA deste complemento.
- [x] Disponibilizar resultados/capturas e obter aceite da revisão por Marcos; nenhuma nova tela ou alteração visual, sem atribuir nova execução manual dos cenários.
- [x] Preparar commit local solicitado por Marcos após aceite; o commit que inclui este registro identifica a entrega local.
- [ ] Publicar/abrir PR ou realizar merge somente mediante solicitações correspondentes e verificações próprias.

## Dev Notes

O passo 7 é uma matriz de fechamento, não um pedido para reimplementar as telas. As implementações e os resultados 81/278, consulta/edição 8/0, smoke 16/0/0 e Q9 já existentes devem ser relacionados ao cenário correto; complementar as lacunas atuais. Nenhuma meta nova de contagem, carga ou cobertura é inferida. Se o executor escolher um cenário que a evidência anterior já cobre sem mudança, apenas referenciá-la é suficiente.

Timeout real deve ocorrer no servidor por inatividade da sessão. A propriedade externa pode ser expressa por `SERVER_SERVLET_SESSION_TIMEOUT` no processo temporário, mas o tempo efetivo depende do runtime/container; não presumir que `1s` equivale à expiração observada em um segundo. Aguardar em blocos curtos e sem requisições que renovem a sessão do contexto sob teste. Uma instância com porta diferente usa cookies do mesmo host; contextos de navegador/request separados e estado próprio são necessários para não interferir na sessão principal. `controle.cjs` identifica a instância principal: não sobrescrever seu state.json para controlar o processo temporário, nem usar seu `parar` para encerrar um PID diferente.

Preparação delimitada pelo agente principal: runtime Spring Boot 3.5.7/Tomcat, instância secundária planejada em loopback/porta 18081 livre, timeout externo `1m`, nome de cookie próprio via configuração de runtime e mesmo JAR conferido. A janela inicial planejada é de 65 segundos ociosos em blocos curtos, sem requests desse contexto, seguida de GET protegido; isso só comprova expiração se o servidor efetivamente retornar 401. O planejamento de tempo não é resultado antecipado; eventual ausência de expiração deve ser diagnosticada/limitada sem limpar cookies para forçar sucesso.

Para CSRF na UI, o estado inválido precisa ser produzido por mecanismos reais de sessão/rotação já existentes e a tentativa deve atravessar o cliente, com 403 observado do servidor. O teste HTTP sem token prova a negativa da API, mas não a mensagem/recuperação da UI. Nenhum cabeçalho/resposta deve ser adulterado por interceptação para representar essa integração como real; se a composição não for viável, separar o resultado HTTP da lacuna de UI, sem remover a verificação.

Um caminho de preparação proposto pelo agente principal é obter o token cacheado pelo cliente em login inválido e depois autenticar por requisição real `page.request` do mesmo contexto/cookie. A rotação real da sessão/token pode tornar o cache anterior inválido; então o formulário existente deve atravessar a API e receber o 403 real, seguido de nova ação explícita que obtenha CSRF atualizado. Não substituir fetch, adulterar o cabeçalho ou presumir a invalidação antes de observar o retorno. Essa preparação por HTTP é identificada no relato, separada da interação de UI testada depois.

`MovimentacaoService` exige Responsável, material ativo na reserva elegível e instante anterior ao fim; devolução independe do prazo e calcula `max(0, Duration.between(fimPrevisto, agora).getSeconds())`. A lista aberta não fecha por decurso de tempo, e a retirada não muda o estado da reserva. Usar reserva curta criada pelo contrato e esperar o relógio real avançar permite verificar atraso positivo com pequena espera, desde que a preparação termine antes do fim. O atraso do navegador é estimativa; o número final vem da API/SQL.

Na corrida de reserva, o propósito é confirmar duas sessões reais, validação/lock no servidor e persistência única em um caso exclusivo. Não usar um mock de disputa nem um teste puramente sequencial como concorrência. A criação perdedora deve conservar mensagem/contexto aplicável sem expor a identidade da vencedora. A prova pontual não substitui a suíte MySQL/Testcontainers, JMeter ou análise de todas as possíveis corridas.

No editor, o serviço verifica dono/estado e pode recusar com 403 depois de cancelamento por outro ator; a transição específica pode gerar 409. Testar a regra existente, não um protocolo de versão inexistente. O objetivo é ausência de sucesso falso, estado persistido correto e recuperação por leitura/ação explícita. Se surgir defeito de cliente, registrar FE correspondente com reprodução e só então ajustar produto/regressões; achado de backend recebe encaminhamento, sem ampliar a autorização desta story.

## Validação de preparação

Checklist `story-draft-checklist` conferido: objetivo/escopo e matriz de origem, fontes reais, isolamento, cenários e camadas, limites de tempo/falha, critérios verificáveis e dependências externas estão explícitos. A story deriva dos passos 7/8 e dos limites registrados nos resultados existentes; nenhuma regra de negócio, endpoint ou obrigação de infraestrutura compartilhada foi criada. Preparação SM não é teste executado, veredicto QA ou aceite do autor.

## CodeRabbit Integration

Tipo principal: Testes/Integração; secundário: documentação e correção apenas se defeito concreto. Execução AIOX Dev; veredicto independente AIOX QA; revisão visual pelo autor quando pertinente. Focos: expiração genuína, identidade/encerramento do processo temporário, ausência de interferência no principal, fixtures estritas, corrida real e persistência, mensageria/segredos, limites das evidências. Gates proporcionais aos auxiliares e E2E reais; build completo se produto/configuração frontend mudar. CodeRabbit com resultado/indisponibilidade explícitos, sem aprovação presumida. Self-healing AIOX Dev light: até 2 iterações/15 minutos para CRITICAL; HIGH documentado. Publicação/PR/merge seguem autorização própria e AIOX DevOps.

## Dev Agent Record

### Completion Notes

Complemento executado em12/11/2026 na branch `test/marcos-fechamento-e2e`, sobre0775715 confirmado no remoto. Dois auxiliares opt-in criados; produto, configuração persistente, dependências e testes frontend não alterados. Sintaxe Node aprovada e **11 PASS/0 FAIL** na rodada final19:51:26–19:52:44UTC. **32 fontes** servidas em cada instância e **35 hashes** (fontes/helpers/JAR) conferidos. Build81/278 anterior reutilizado por hashes, sem nova execução injustificada.

UI de login inválido401/CSRFrotacionado403/açãoexplícita204, inatividade real65.296ms com cookie mantido e401/redirecionamento,21materiais/páginas20+1/vazio/ocupado, disputa HTTP201/409 com uma persistida, editor após cancelamento externo403/reconsulta e duplo clique→umPATCH, retirada elegível/prazo ultrapassado/devolução com atraso final2s e Administrador leitura/403. Temporária18081/timeout1m/cookiepróprio encerrada por identidade, porta livre, estado principal18080 preservado e pronto. SQL somenteSELECT, massa nova porHTTP, nenhuma notificação externa.

[Resultados, matriz, tentativas e reprodução](../testes/marcos-fechamento-e2e-1-resultados.md). Primeira tentativa incompleta por seletor/espera de resposta do auxiliar e segunda9/1 por corpo descartado após navegação foram preservadas; final corrige coleta e evita imprimir valores de cookie em falhas. Não houve correção de produto nem FE novo atribuído indevidamente.

[Entrega e descrição do PR](../integracao/marcos-fechamento-entrega.md) preparadas: frontend aceito em feature/marcos-reservas-consulta, sem PR encontrado; testes deste complemento ainda sem commit, publicação ou PR. Revisão do autor sobre as evidências, commit solicitado, revisão de outro integrante, checks/CodeRabbit/Sonar, ratificação coletiva/processo de vínculos e provas globais compartilhadas permanecem separados. Ready for Review não significa etapas1–5 entregues àdevelop ou todos os RFs/cenários certificados.

Aceite posterior da revisão recebido de Marcos em12/11/2026, sem ajuste solicitado. [Registro](../testes/marcos-fechamento-e2e-1-aceite-2026-11-12.md). As observações anteriores de revisão do autor pendente descrevem o momento da execução; commit/publicação seguem separados.

Commit local solicitado posteriormente por Marcos: preparação/evidências/aceite acompanham o commit deste registro. Identidade local conferida como Marcos Boé <marcospauloboe@gmail.com>. Publicação/PR/revisão da equipe/checks/merge permanecem separados; nenhum teste ou auxiliar foi alterado para o registro documental.

### Agent Model Used

Codex, preparação AIOX SM e execução AIOX Dev; revisão independente AIOX QA em seção própria.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-12 | Story Ready for Dev para complemento real da matriz etapas 1–5 sobre 0775715, com timeout genuíno em instância temporária isolada, pesquisa, disputa/estado concorrente, movimentação com atraso e evidências sem aprovação presumida. |
| 2026-11-12 | Ready for Review: complemento real11/0, tentativa incompleta e9/1 preservadas, fontes/JAR conferidos, principal preservada. Produto inalterado; matriz/entrega e evidências atualizadas; sem commit/publicação automática. |
| 2026-11-12 | Marcos aprovou a revisão das evidências/entrega; registro documental, sem nova suíte ou alteração de produto/auxiliares. Commit/publicação e revisões/checks externos separados. |
| 2026-11-12 | Commit local solicitado por Marcos; identidade e arquivos conferidos, fontes/resultados preservados. Entrega local identificada pelo commit deste registro; push/PR/merge separados. |

### File List

Arquivos efetivamente criados/alterados:

- `docs/README.md`
- `docs/RTM.md`
- `docs/integracao/marcos-e2e-local.md`
- `docs/integracao/marcos-fechamento-entrega.md`
- `docs/integracao/marcos-pendencias-2026-11-12.md`
- `docs/planejamento/marcos-fechamento-etapas-1-a-5.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/stories/marcos-fechamento-e2e-1.md`
- `docs/testes/marcos-fechamento-e2e-1-resultados.md`
- `docs/testes/marcos-fechamento-e2e-1-aceite-2026-11-12.md`
- `docs/testes/marcos-fechamento-e2e-1/arvore-testada.json`
- `docs/testes/marcos-fechamento-e2e-1/devolucao-atrasada-mobile.png`
- `docs/testes/marcos-fechamento-e2e-1/estado-concorrente.png`
- `docs/testes/marcos-fechamento-e2e-1/login-csrf-mobile.png`
- `docs/testes/marcos-fechamento-e2e-1/pesquisa-real-mobile.png`
- `docs/testes/marcos-fechamento-e2e-1/prazo-ultrapassado-mobile.png`
- `docs/testes/marcos-fechamento-e2e-1/resultados-final.json`
- `docs/testes/marcos-fechamento-e2e-1/sessao-expirada.png`
- `docs/testes/marcos-fechamento-e2e-1/tentativa-coleta.json`
- `docs/testes/marcos-fechamento-e2e-1/tentativa-incompleta.json`
- `tests/e2e-local/sessao-temporaria.cjs`
- `tests/e2e-local/validar-fechamento.cjs`

JAR, credenciais, dados, configuração de timeout, estado dos processos, ferramentas e logs brutos continuam nos diretórios ignorados já definidos. A branch `test/marcos-fechamento-e2e` foi confirmada pelo agente principal; registrar o auxiliar efetivamente escolhido e as execuções subsequentes sem antecipar resultados.

## QA Results

**Veredicto: PASS técnico local do complemento — AIOX QA (Quinn), revisão independente em 12/11/2026.** Revisão estática dos dois auxiliares, isolamento, cenários, documentação final e evidências. Nenhum achado bloqueante permanece no recorte revisado. Story mantida em Ready for Review; este veredicto não encerra as etapas 1–5 nem substitui o aceite do autor ou da equipe.

[Resultado final](../testes/marcos-fechamento-e2e-1/resultados-final.json) conferido: **11 PASS / 0 FAIL**, entre 19:51:26.741 e 19:52:44.987 UTC, sobre `0775715d5a769d726e5cc63dc1b4125747084ff8`, na branch `test/marcos-fechamento-e2e`, com auxiliares ainda sem commit. Os **35 hashes** publicados correspondem aos arquivos atuais: 32 fontes estáticas, dois auxiliares e JAR. A prova HTTP registra as 32 fontes correspondentes em ambas as instâncias; o build anterior **81 unitários/278 navegador** permanece referenciado por hashes, sem ser apresentado como nova execução. Revisão QA não reexecutou testes, serviços ou operações Git e não acessou credenciais privadas.

As provas finais atendem aos cenários delimitados: login inválido401, CSRF realmente rotacionado403 e recuperação somente por nova ação explícita; **65.296ms** de inatividade, cookie preservado, GET protegido401/NAO_AUTENTICADO e redirecionamento real da UI; pesquisa com 21 materiais próprios, páginas20/1, vazio exclusivo e ocupado sem seleção; duas sessões HTTP independentes recebem201/409, com uma reserva/associação persistida por SELECT. Após cancelamento administrativo externo, o editor emite **um PATCH** no duplo clique, recebe403, invalida confirmação e reconsulta CANCELADA. Retirada anterior ao prazo, manutenção da pendência vencida, devolução com atraso final **2s** e operador persistido foram conferidos; Administrador consulta sem ações e a escrita403 preserva a movimentação.

O auxiliar temporário usa loopback18081, cookie/contextos e nome próprios; identifica executável, JAR, PID e CreationDate antes de encerrar exclusivamente seu processo. Cleanup final PASS comprova porta livre, bytes do estado principal preservados e prontidão do principal. A preparação usa HTTP autorizado e SQL somente SELECT restrito à massa, sem interceptação, alteração do relógio, mudança de produto/configuração persistente ou envio externo. Capturas de login e devolução móveis também foram inspecionadas nesta revisão, sem constituir aceite visual de Marcos.

Tentativas anteriores continuam separadas: [primeira incompleta](../testes/marcos-fechamento-e2e-1/tentativa-incompleta.json), com primeiro PASS e sem conclusão; [segunda9/1](../testes/marcos-fechamento-e2e-1/tentativa-coleta.json), cujo FAIL é coleta do corpo descartado pelo Chrome após navegação e cujo cleanup PASS foi preservado. Correções de seletor/espera de resposta, coleta no mesmo BrowserContext e assert booleano de cookie foram aplicadas apenas aos auxiliares. A divergência documental de horário final foi corrigida antes do veredicto. Nenhum defeito funcional de produto foi demonstrado por essas falhas dos testes.

Limites e entrega estão explícitos no [relatório](../testes/marcos-fechamento-e2e-1-resultados.md) e na [sequência de entrega](../integracao/marcos-fechamento-entrega.md): a corrida é pontual HTTP+SQL; teclado/foco/layout cobrem os caminhos e viewports registrados; falhas reais de rede após escrita, carga geral, todas as transições e entrega externa de notificações não foram certificadas. Revisão do autor sobre este complemento, revisão de outro integrante, ratificação coletiva/processo de vínculos, CodeRabbit/Sonar/checks remotos, commit, publicação, PR e merge permanecem ações separadas. Não há aprovação presumida de clean verify, Maven/Testcontainers ou CI nesta rodada.
