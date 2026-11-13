# Marcos-6 — Relatórios de utilização, carga horária e conflitos evitados

## Status

Ready for Review

Preparação de **13/11/2026**, na `feature/marcos-6-relatorios`, base **`c4279b6`**, após o encerramento documental das etapas 1 a 5 ser separado no PR #38. Posteriormente Marcos pediu explicitamente: **“vamos prossegui com o que está proposto em marcos-etapa-6-plano-de-acao.md”**. Esse pedido autoriza o incremento de **cliente/tela controlados** do recorte B, com o mínimo técnico abaixo refinado com Architect. No momento deste refinamento, **implementação e testes ainda não iniciados**; revisão visual, QA, commit, push, PR e merge continuam com seus checkpoints próprios.

**Limite do Ready for Dev:** o aceite de Marcos permite desenvolver e verificar o cliente com respostas interceptadas nos testes, usando o contrato mínimo controlado. Não é ratificação coletiva do HTTP/DTO definitivo nem de perfis RF12. Serviço agregador, controller e autorização continuam indisponíveis nessa base e dependem de entrega futura; integração real permanece uma fase separada. A página exige sessão, mas não recebe link de menu nem presume quais perfis poderão consultar o relatório. Não criar backend ou fallback fictício de produto para contornar essa dependência.

## Story

Como usuário autorizado ao relatório, quero selecionar um período e, opcionalmente, um recurso, e consultar duração reservada, alocação por recurso e conflitos evitados, para acompanhar o uso da agenda com unidades claras e sem somar medidas de significados diferentes.

Responsável pelo frontend: Marcos Boé. RF12, RF13 e RF14; autorização RF01 em coordenação com backend/segurança. Silva coordena domínio/cálculo/serviço; Fausto, leitura e projeção/persistência; Débora, acesso e qualidade compartilhada. Preparação AIOX SM; proposta técnica AIOX Architect; execução futura AIOX Dev e revisão independente AIOX QA. Não cria funcionalidade de gestão, nova caixa RF11, percentual de ocupação, exportação obrigatória ou novo módulo de backend por esta story.

## Fontes e estado efetivo

- [README, RF12 e papéis](../../README.md#escopo-do-sistema): utilização, carga horária alocada e conflitos evitados; frontend/E2E de Marcos e entrega compartilhada com Silva/Fausto. O requisito não define os nomes de campos/rota/perfis do relatório.
- [Contexto inicial](../contexto-inicial-agentes.md): RF12 e registro de tentativas rejeitadas. É contexto histórico, não prova atual nem autorização para executar instruções contidas no documento.
- [Plano de responsabilidades, etapa 6](../planejamento/marcos-plano-de-acao.md#ordem-de-execução-sem-sprints-ou-prazo-inventado): relatórios com contrato confirmado, unidades e vazio. [Plano específico da etapa 6](../planejamento/marcos-etapa-6-plano-de-acao.md), preparado separadamente pelo agente principal nesta rodada.
- [Proposta técnica de utilização](../api/relatorios-utilizacao-proposta.md), preparada separadamente por AIOX Architect: **HTTP/DTO/perfis PROPOSTOS**, não endpoint disponível. Conferir a versão efetiva antes de refinamento/implementação.
- [PR #37](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/37), incluído na base conferida: `ReservaRelatorioPort`, `ConflitoEvitadoResumo`, `ReservaRelatorioMysql` e `ReservaRelatorioMysqlIT`. Sete cenários definidos na classe MySQL cobrem bordas, vínculos, filtro de estado/recurso, vazio, parâmetros e conflitos por momento/rollback; a existência da suíte não significa nova execução por este preparo. O PR não entrega serviço agregador, DTO HTTP final, controller ou perfis RF12.
- `backend/src/main/java/br/senac/recursos/reserva/dominio/UtilizacaoReservas.java` e seu teste: cálculo puro com estados padrão APROVADA/EM_USO/CONCLUIDA; reserva contada uma vez, duração também distribuída por recurso e recorte ao período. `Duration` mantém precisão; o nome interno `horasReservadas` não é uma medida numérica em horas pronta para serializar.
- `ReservaRelatorioPort.buscarReservas`: sobreposição `[inicio,fim)`, estado e recurso opcional, uma reserva por ID **com todos os vínculos**, mesmo quando a seleção foi filtrada por um recurso. `buscarConflitosEvitados`: usa o **momento do evento** no intervalo, não o período solicitado da tentativa.
- [ADR-001](../arquitetura/adr/ADR-001-monolito-modular-frontend-estatico.md): HTML/CSS/ES modules nativos servidos pelo Spring; Node/Playwright são ferramentas de desenvolvimento. Sessão/erros/datas/navegação existentes são padrões de consumo, não definição de permissão para o novo relatório.

## Contrato mínimo aceito para cliente controlado — API real pendente

O mínimo controlado preparado com Architect usa `GET /api/relatorios/utilizacao`, com `inicio` e `fim` obrigatórios em ISO com offset, `fim > inicio`, e `recursoId` opcional inteiro positivo seguro. O cliente poderá emitir essa requisição; testes de navegador interceptam a resposta de forma explícita. A URL continua candidata a implementação/ratificação do backend, sem endpoint real entregue por esta story. Sem interceptação, ausência/falha da API é erro, nunca relatório fictício de sucesso.

DTO controlado: `periodo:{inicio,fim}` e `recursoId` (inteiro positivo seguro ou `null`) como eco do filtro, `estadosConsiderados` com APROVADA, EM_USO e CONCLUIDA uma vez cada, `reservasConsideradas` e `conflitosEvitados` como inteiros seguros não negativos, `duracaoReservada`, `porRecurso` com `{recursoId,duracaoAlocada}`. IDs de linhas são únicos, positivos e seguros. Sem filtro, linhas representam os recursos projetados; com filtro, somente o recurso solicitado pode aparecer. Usar rótulo legível `Recurso #ID`, sem inventar nome no DTO ou consultar um recurso por linha.

**Duração no recorte controlado:** representação não negativa de `java.time.Duration.toString()`, em horas/minutos/segundos e até nove casas de fração de segundo; `PT0S` representa zero. Não aceitar anos/meses/dias de calendário, sinais negativos, componentes ausentes ou precisão acima de nove casas. Preservar a quantidade exata por aritmética inteira, sem conversão intermediária de nanos para `Number` com perda. Exibir horas totais (podem superar 24), minutos e segundos com fração necessária, em unidade explícita, **sem arredondar**. O valor bruto permanece distinto da apresentação. Essa escolha estabiliza cliente/fixtures; o backend real ainda poderá exigir conciliação explícita de contrato.

Validar o eco do período por instantes, não pela igualdade textual de offsets equivalentes. Contagem zero de reservas exige duração zero e ausência de linhas; com reservas elegíveis, total e alocações são positivos e cada alocação não supera o total. Não comparar a soma das linhas ao total como igualdade obrigatória, pois uma reserva pode envolver vários recursos. O conjunto de estados é o padrão fixo, sem seletor de estados. Não adicionar filtro de usuário, perfil, status ou paginação.

**Exemplo semântico:** uma reserva de 1h com três recursos conta **1h de duração reservada**, e 1h de alocação para cada recurso. Somar as três linhas daria 3h de alocação de recursos, que não é o total de horas das reservas. Esse exemplo orienta rótulos/testes, não é dado real do sistema nem evidência de agregação entregue.

## Critérios de aceitação do incremento controlado

1. **Recorte autorizado:** implementar somente cliente/tela controlados conforme o pedido explícito de Marcos e o contrato mínimo acima. Conferir base/branch e versão da proposta antes do código. Serviço/DTO/controller e perfis reais continuam pendentes, sem impedir este incremento controlado. Interceptações ficam nos testes ou prévia identificada como simulada; nunca no código de produto como fallback ou resultado real. Não atribuir às etapas 1 a 5 ou ao PR #38 decisões RF12 que não contêm.
2. Implementar cliente/tela nativa de relatório com filtros de período e recurso opcional conforme o mínimo controlado. Usar fuso operacional America/Sao_Paulo e conversão de instantes com offset, sem depender do timezone do navegador ou anexar -03:00 indiscriminadamente. Relatórios admitem período entre dias, sem importar a restrição diária de criação de reservas. Não inventar intervalo máximo, limite de linhas, presets obrigatórios ou filtro adicional. O recurso pode ser informado pelo ID positivo, identificado claramente, sem depender de novo catálogo/DTO não contratado.
3. Exibir período efetivo, estados considerados, quantidade de reservas, duração total das reservas, duração alocada por recurso e contagem de conflitos. Implementar parser exato da duração controlada: componentes temporais H/M/S não negativos, ao menos um componente, fração somente nos segundos com 1 a 9 dígitos. Aceitar `PT0S`, `PT1H`, `PT1H30M` e `PT0.000000001S`; recusar `PT` vazio, sinais, datas/dias/semanas, vírgula, frações de hora/minuto e mais de nove casas. Preservar bruto e calcular com inteiros exatos; formatar horas totais, minutos e segundos normalizados sem arredondamento ou perda de nanos. Não usar `Date` nem converter para horas decimais aproximadas.
4. Manter distintas as duas métricas: total conta cada reserva uma vez dentro do período recortado; linhas por recurso representam sua alocação. Não recalcular total de reservas somando as linhas por recurso, não prometer horas efetivamente trabalhadas quando o cálculo é agenda prevista/concluída e não criar taxa de ocupação sem denominador de capacidade/expediente contratado. Os estados padrão vêm da fonte/cálculo, não de uma decisão visual do cliente.
5. Conflitos evitados seguem a contagem de registros cujo **momento** atende `momento >= inicio && momento < fim`, com recurso conflitante quando filtrado. O intervalo desejado na tentativa não determina sua inclusão no relatório. Não deduplicar/reponderar registros para representar “usuários” ou “disputas” sem contrato, nem expor identidade do solicitante a partir do resumo interno. Testes futuros devem diferenciar evento ocorrido dentro do período pedindo uma reserva fora dele e a situação inversa.
6. **Segurança real pendente:** página exige sessão pelo mecanismo existente e é acessível por URL direta; não adicionar link de menu, esconder/liberar por papel presumido ou forçar perfil para demonstração. Perfis/escopo RF12 permanecem para backend/segurança, sem herdar Q9. O adaptador #37 devolve todos os vínculos; serviço/autorização/projeção precisam impedir exposição antes do HTTP. Cliente rejeita DTO incoerente/linhas fora do filtro como defesa de contrato, sem alegar que isso corrige autorização no servidor. Testar futuramente os perfis reais quando entregues.
7. Cliente valida estritamente os campos mínimos, IDs/contagens/durações, recursos únicos, conjunto exato de estados e eco do período por instantes/recurso por ID ou null. Projetar somente campos necessários; resposta de outro filtro não é sucesso. Validar coerência zero/positivo e alocações sem somar linhas para reconstruir total. Ausência de reservas com conflitos positivos é válida: métricas são independentes. Usar sessão `same-origin` e tratamento existente de 401/403; **não tornar CSRF obrigatório no GET** ou criar escrita fictícia. Escrita não está prevista.
8. Tela apresenta estados inicial, carregando, resultado, vazio/zeros, erro e consulta explícita nova, com filtros preservados e respostas atrasadas descartadas quando filtros/alvo mudarem. Distinguir “sem reservas”, “sem conflitos” e duração zero; conflitos positivos continuam visíveis sem reservas. 401 segue ao login; 403 comunica falta de autorização; 400 e eventual 409/rede/resposta incoerente exibem mensagem e correlationId de suporte conforme envelope existente, sem repetição automática ou êxito fictício. Falha/ausência da API mantém erro. Não inventar um 409 de negócio do relatório.
9. Implementar HTML/CSS/ES modules responsivos e acessíveis: labels/unidades, resumo legível, tabela por recurso adequada às larguras móvel/desktop, foco de consulta/resultado/erro, teclado e texto seguro sem interpretar HTML. Reutilizar padrões de sessão/feedback. Não acrescentar gráfico obrigatório, dependência visual ou framework. CSV, RF11 e caixa de notificações/eventos ficam fora deste incremento.
10. Acrescentar testes unitários e de navegador controlados para filtros/instantes, DTOs válidos/incoerentes, frações até nanos e durações acima de 24h, exemplo uma reserva/três recursos, filtro com apenas sua linha, zero reservas/conflitos positivos, carregando, respostas antigas, 400/401/403/409/rede, texto seguro, teclado e duas viewports. Fixtures de fronteiras semiabertas/conflitos por momento exercitam consumo/apresentação do DTO, **não comprovam SQL, agregação ou autorização reais**. Interceptações/simulação ficam explícitas nas evidências. Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`; registrar contagens e tentativas efetivas, sem antecipar PASS.
11. A integração futura só é fechada depois de serviço agregador, DTO/controller e autorização do relatório reais estarem disponíveis: executar frontend da mesma origem do Spring, JAR/fontes conferidos, dados de teste isolados e resultados comparados ao domínio/SQL/casos conhecidos, sem interceptação. Conferir perfis/recursos filtrados e ausência de exposição adicional. As sete ITs da porta/adapter são evidência do recorte persistente quando executadas, não substituem esse E2E. Ausência da API mantém bloqueio explícito; não criar backend/rota por esta story para removê-lo.
12. Registrar por fases preparação/refinamento, incremento controlado, revisão visual/QA e futura integração real/PR individual, com arquivos/resultados/hashes/status efetivos. Não misturar alterações ao PR documental #38 das etapas 1 a 5. Atualizar plano/RTM/stories/contratos pertinentes sem apagar a origem histórica ou declarar RF12 completo pelo mock. Obter QA independente e revisão visual de Marcos antes do checkpoint de commit; commit/push/PR/merge seguem pedidos próprios do usuário, sem autorização presumida deste avanço de implementação.

## Fases e dependências

| Fase planejada | Entrega verificável | Condição para avançar |
|---|---|---|
| Preparação concluída | Plano/proposta/story inicialmente Draft, com revisão documental histórica | Preservar a distinção entre porta entregue e API candidata |
| Refinamento controlado concluído | Pedido explícito de Marcos; DTO/Duration/apresentação controlados refinados com Architect; story Ready for Dev | Autoriza somente cliente/tela e testes controlados, sem definir perfis reais |
| Cliente/tela controlados — a executar | HTML/CSS/ES modules, unitários/navegador, revisão visual e QA | Mocks só nos testes/preview identificado; não declarar API ou integração pronta |
| Integração real | Serviço/HTTP/autorização reais, prova com Spring/MySQL e comparações coerentes | Backend/equipe entregam agregação/projeção/escopo antes do E2E correspondente |
| Entrega individual | Evidências/RTM/story finais, commit/PR e revisão pertinentes | Autorizações e gates efetivos, separado do PR #38 e do fechamento 1 a 5 |

Nada nessa tabela declara uma fase de código concluída. O mínimo de duração e apresentação está decidido apenas para o cliente controlado. Permanecem pendentes API/DTO definitivo, serviço agregador/autorizações e projeção segura para filtro/escopo; eventual divergência de formato será conciliada na integração real. Dados legíveis extras só entram se contratados.

## Tasks / Subtasks planejadas

- [x] Registrar o pedido explícito de Marcos para seguir o plano e refinar contrato mínimo/Duration/apresentação com Architect, mantendo perfis reais pendentes.
- [x] Refinar esta story para Ready for Dev exclusivamente no recorte cliente/tela controlados, sem inferir ratificação coletiva.
- [x] Implementar cliente/tela autenticados por URL direta, sem link de menu ou liberação presumida por perfil.
- [x] Implementar filtros, projeção, rótulos/unidades e estados de consulta sem confundir total/por recurso/conflitos.
- [x] Cobrir as fronteiras relevantes com testes unitários/navegador e gates reais do incremento autorizado.
- [x] Obter QA e revisão visual do autor, registrando mocks/limites e mantendo integração real separada.
  - [x] QA independente do incremento controlado: PASS técnico local, evidências conferidas e nenhum bloqueante restante.
  - [x] Revisão visual de Marcos aprovada em13/11/2026, sem ajustes; formato de data mantido por decisão do autor.
- [ ] Integrar e validar futuramente API/serviço/autorização reais com dados isolados, hashes e provas comparativas.
- [ ] Atualizar plano/RTM/contrato/story/evidências conforme resultados e entregar em PR individual quando solicitado.

## Dev Notes

O domínio `UtilizacaoReservas` calcula `Duration` sem definir serialização HTTP. O PR #37 busca reservas sobrepostas nos estados recebidos, uma por ID, com todos os recursos; o cálculo recorta os instantes ao período. Portanto a porta é insumo do serviço, não DTO autorizado pronto para o navegador. A consulta filtrada não pode simplesmente serializar `Reserva`/resultado bruto de todos os vínculos e esperar que o frontend resolva a exposição.

Uma reserva de uma hora com três recursos produz total de reservas uma hora e três alocações individuais de uma hora. A soma de linhas é outra medida; não usar o mesmo rótulo. Com recursoId, a proposta deve definir explicitamente quais agregados são filtrados e quais recursos podem aparecer, e a implementação de serviço precisa aplicar a projeção/escopo antes da resposta. Não pressupor que um Responsável que lê suas reservas pela Q9 tem acesso ao relatório RF12.

O campo `momento` de conflito é o instante da tentativa rejeitada. `intervaloSolicitado` é contexto interno e pode estar fora do período do relatório; não contar o evento por sobreposição desse intervalo. Os testes de adapter existentes cobrem essa distinção, mas a tela/serviço ainda precisam de contrato/asserções correspondentes. “Conflitos evitados” são registros persistidos selecionados, sem inferir estatística adicional de pessoas ou todas as tentativas possíveis.

Os métodos de leitura da porta têm transações próprias. A coordenação/consistência de um DTO agregado que combine reservas e conflitos ainda é uma decisão de serviço a confirmar com Silva/Fausto; a preparação não presume um snapshot único por haver consultas MySQL funcionais.

Duration pode representar muitas horas e frações; não tratá-la como `Date`, horário 24h ou mês/ano de calendário. O recorte controlado decide H/M/S com até nove frações nos segundos e apresentação exata sem arredondar. Não degradar o valor bruto nem usar ponto flutuante para acumular nanos. Contrato final de backend ainda exige confirmação; a decisão de cliente não altera o domínio Java.

O pedido posterior de Marcos aceita avançar do planejamento para implementação controlada. O Ready for Dev vale para o cliente/tela descritos, sem backend, permissão nova, configuração persistente ou fallback de simulação. A simulação usa interceptações dos testes/prévia identificada. Fora delas, o cliente apresenta a falha real da API. Não executar E2E real de RF12 enquanto suas dependências não forem entregues. Os documentos genéricos devLoadAlwaysFiles/fallbacks ausentes, reportados pelo principal, não autorizam inventar padrões: seguir ADR-001 e os padrões efetivos existentes.

## Validação de preparação

Checklist `story-draft-checklist` conferido no refinamento: objetivo/valor RF12, fontes, mínimo estável do cliente, métricas/precisão, exemplos e negativas, riscos de autorização/projeção, fases, tarefas e testes estão explícitos. **Ready for Dev para cliente/tela controlados**, por pedido de Marcos e mínimo coordenado com Architect. API/perfis reais continuam bloqueando a fase integrada. Não é veredicto QA de implementação, ratificação coletiva do contrato final ou código entregue.

## CodeRabbit Integration

Tipo futuro: Frontend/Integração. Execução futura AIOX Dev; decisões de proposta AIOX Architect; revisão independente AIOX QA e revisão visual do autor. Focos: unidade/precisão, distinção total versus recurso, semântica de momento, scope/projeção antes do HTTP, mocks identificados e estados de erro/acessibilidade. Gates e agentes aplicáveis serão executados apenas no recorte refinado; CodeRabbit com resultado/indisponibilidade explícitos, sem aprovação antecipada. Self-healing futuro light até 2 iterações/15 minutos para CRITICAL, HIGH documentado. Sem execução de testes, publicação ou aprovação de gate nesta preparação.

## Dev Agent Record

### Preparação documental desta rodada

- [x] PR #38 documental de encerramento aberto Ready for review, sem merge automático.
- [x] Branch própria feature/marcos-6-relatorios criada da developc4279b6, sem carregar o commit documental do #38.
- [x] Proposta técnica, plano específico e story preparados; plano principal atualizado com tabela histórica preservada.
- [x] Índice/RTM vinculados e revisão documental independente concluída sem achados bloqueantes; sem veredicto de implementação ou API real.

Nenhum código, teste, mock ou API novo foi implementado/executado neste registro de preparação/refinamento. Após essa preparação, Marcos pediu seguir o plano; SM e Architect estabilizaram o recorte controlado e a story passa a Ready for Dev. Tarefas de implementação permanecem abertas; nenhum perfil real é liberado por inferência. Autoria: proposta AIOX Architect; story AIOX SM; plano/índice/RTM e conciliação AIOX principal.

### Completion Notes

Cliente/tela controlados implementados após refinamento SM/Architect: Duration exata, DTO coerente, total por reserva distinto de alocação por recurso, estados/erros, sessão e consulta única com invalidação de respostas antigas. Sem link de menu/perfil presumido. Facilitador manual fora do produto oferece prévia identificada com sessão/dados fictícios, sem banco. [Resultados](../testes/marcos-6-resultados.md), [roteiro manual](../testes/marcos-6-verificacao.txt) e capturas registram o incremento. Marcos aprovou a revisão visual e autorizou commit/push em13/11/2026, mantendo o formato de data atual. Ready for Review refere-se ao incremento controlado; integração real/HTTP/autorização continuam tarefas futuras. Este registro é preparado para o commit autorizado, sem abertura de PR ou merge nesta rodada.

### Implementação controlada — 13/11/2026

- 14 testes unitários e56navegador focais passaram; primeiro build completo95unitários/334navegador. Após revisão, mínimo1ns/reserva coberto por teste adicional e textos da proposta alinhados; **build final aprovado: lint/typecheck,96unitários e334navegador**, incluindo15unitários/56navegador RF12. [Evidências/hashes](../testes/marcos-6-evidencias.json).
- Sem dependências/framework/configuração de produto novos. Fontes genéricas de padrões ausentes foram substituídas como referência pelo ADR-001 e pelos padrões efetivos da base, sem criar requisitos.
- CodeRabbit indisponível localmente (comando ausente, WSL não instalado); sem veredicto fictício. Revisão independente QA registrada em seção própria, distinta do aceite visual humano.
- Hash/base e origem das evidências devem acompanhar o incremento; testes interceptados/capturas não são comprovação do servidor RF12 nem reexecução de Java/MySQL do #37.
- DoD/self-critique conferidos no recorte controlado: precision/filtro/invalidação, bordas zero/1ns/horas grandes, falhas/sessão/texto, estrutura/arquivos/gates e capturas. Revisão humana, CodeRabbit e integração real/entrega mantêm seus estados efetivos, sem marcar a story Done.

### Aceite e autorização de publicação — 13/11/2026

Marcos: **“vamos deixar do jeito que está por enquanto. revisão aprovada, vamos seguir para o commit e push”**. Aceite visual do cliente/tela controlados registrado sem alteração no formato das datas. Commit e push autorizados para `feature/marcos-6-relatorios`, com identidade local conferida **Marcos Boé <marcospauloboe@gmail.com>**. A aprovação não ratifica perfis/HTTP do backend nem encerra a integração real. Fontes de código/testes e seus hashes permanecem os da execução96/334; apenas documentos de aceite foram atualizados depois dos testes.

### Agent Model Used

Codex, execução AIOX Dev; preparação/refinamento AIOX SM, proposta mínima AIOX Architect e revisão independente AIOX QA.

### Change Log

| Data | Descrição |
|---|---|
| 2026-11-13 | Story Draft de planejamento da etapa 6/RF12 na base c4279b6: porta #37 existente, HTTP/DTO/perfis propostos, métricas/Duration e projeção segura delimitados; sem início de implementação ou testes. |
| 2026-11-13 | Após pedido explícito de Marcos para seguir o plano, refinamento para Ready for Dev no cliente/tela controlados: DTO mínimo, Duration H/M/S até nanos sem arredondamento, sessão/URL direta sem menu por perfil e testes interceptados. Backend/perfis/integração real continuam pendentes; implementação não iniciada neste registro. |
| 2026-11-13 | Implementado cliente/tela controlados, testes unitários/navegador e prévia local identificada, com resultados/roteiro/capturas. Story In Progress: revisão visual humana e integração real permanecem separadas e pendentes. |
| 2026-11-13 | Marcos aprovou a revisão visual sem ajustes de data e autorizou commit/push. Incremento controlado Ready for Review; integração real continua pendente. Registros de aceite atualizados antes da publicação autorizada. |

### File List

Arquivos efetivamente criados/alterados na preparação e no incremento controlado:

- `docs/README.md`
- `docs/RTM.md`
- `docs/planejamento/marcos-plano-de-acao.md`
- `docs/planejamento/marcos-etapa-6-plano-de-acao.md`
- `docs/api/relatorios-utilizacao-proposta.md`
- `docs/stories/marcos-6.md`
- `backend/src/main/resources/static/js/relatorios-utilizacao.js`
- `backend/src/main/resources/static/js/relatorios-utilizacao-page.js`
- `backend/src/main/resources/static/pages/relatorios-utilizacao.html`
- `backend/src/main/resources/static/css/relatorios-utilizacao.css`
- `tests/unit/frontend/relatorios-utilizacao.test.js`
- `tests/browser/relatorios-utilizacao.spec.js`
- `tests/browser/relatorios-utilizacao-preview.mjs`
- `docs/testes/marcos-6-resultados.md`
- `docs/testes/marcos-6-verificacao.txt`
- `docs/testes/marcos-6-evidencias.json`
- `docs/testes/evidencias/marcos-6/desktop-inicial.png`
- `docs/testes/evidencias/marcos-6/desktop-resultado.png`
- `docs/testes/evidencias/marcos-6/mobile-inicial.png`
- `docs/testes/evidencias/marcos-6/mobile-resultado.png`

Backend Java, migrações, configurações de produto, navegação existente e dependências não foram alterados. Logs/facilitadores auxiliares locais ignorados não fazem parte da entrega. O facilitador reproduzível listado em tests/browser é exclusivo de testes/prévia, sem ativação no produto.

## QA Results

**Registro histórico anterior ao refinamento Ready for Dev:** o parecer documental abaixo foi emitido quando a story estava Draft. Preservado integralmente; não constitui aprovação antecipada do novo incremento ou de testes ainda não executados. O avanço atual decorre do pedido posterior de Marcos e do refinamento controlado SM/Architect. QA de implementação será registrado após execução.

**Preparação documental apta, sem achados bloqueantes — AIOX QA (Quinn), revisão independente em 13/11/2026.** Plano, proposta técnica, story e referências de continuidade foram confrontados com a porta/adaptador RF12, o cálculo de utilização e seus testes existentes. O status **Draft está correto**: este parecer aprova a coerência da preparação para discussão, sem aprovar contrato definitivo, autorizar implementação ou promover a story para Ready for Dev.

As métricas estão delimitadas: duração total conta cada reserva uma vez, alocação por recurso é outra medida, intervalos são recortados ao período semiaberto e conflitos são selecionados pelo momento da ocorrência. A proposta identifica que o filtro interno de recurso devolve todos os vínculos e que a porta não recebe ator; autorização/projeção precisam ocorrer no servidor antes de expor linhas, totais ou contagens. Perfis RF12 não são herdados automaticamente de Q9 ou da delegação das etapas 1 a 5.

As decisões ainda necessárias estão explícitas: HTTP/DTO e serviço agregador, perfis/escopo multirrecurso, transporte/unidade/precisão de Duration, recurso inexistente ou não autorizado, retorno vazio, limites pertinentes e consistência entre consultas. Candidatos de rota/campos e exemplos fictícios estão identificados como propostas. CSV opcional, indicadores adicionais e caixa de notificações não foram impostos como requisitos do primeiro recorte.

O conjunto contém somente documentação; cliente/tela RF12, API, mocks e novos testes **não foram implementados ou executados** nesta preparação. Não há veredicto de implementação, aceite visual, sucesso de GET RF12 ou validação real de autorização/agregação HTTP. As provas existentes mantêm sua origem. A revisão QA foi somente leitura de documentos/código/testes existentes, sem executar suítes, serviços ou Git e sem acessar credenciais; a alteração desta seção registra apenas o parecer documental. O próximo avanço depende do aceite explícito do contrato/recorte mínimo e do refinamento correspondente.

### Revisão independente do cliente e da tela controlados

**PASS técnico local do recorte controlado — AIOX QA (Quinn), revisão independente em 13/11/2026.** Cliente, página, HTML/CSS, testes, facilitador de prévia, contrato mínimo refinado e evidências finais revisados. Nenhum achado bloqueante permanece nesse recorte. Apto à revisão visual de Marcos; este parecer não marca a story Done nem encerra a integração RF12.

O cliente conserva a Duration bruta e usa BigInt para nanossegundos, limites e apresentação sem arredondamento ou ciclo de24h. Mantém total por reserva distinto da soma das alocações; valida período por instante, eco de recurso, estados fixos, IDs/contagens seguros, unicidade, zero/positivo e limites do agregado completo. Com recurso filtrado, linhas de outro recurso são recusadas; essa validação não substitui a futura projeção/autorização do servidor. Filtros/DTO são projetados sem identidade pessoal, papel ou campos adicionais. Consulta GET reutiliza sessão same-origin e não busca CSRF; logout mantém o fluxo comum de escrita com CSRF.

Guarda de envio único, invalidação dos números ao alterar/limpar filtros e descarte de sucesso/erro atrasados estão coerentes com os cenários revisados. Falhas de HTTP/rede/DTO não viram vazio ou resultado fictício; 401 segue o fluxo de sessão, mensagens usam texto literal e referências de suporte, e teclado/foco/estados permanecem verificáveis. A página não foi adicionada ao menu por presunção de perfil RF12. A prévia4174 é um facilitador isolado de testes, com sessão/dados fictícios identificados, sem acesso a banco ou importação pelo produto; ausência da API real não ativa fallback de sucesso na aplicação.

Três observações P3 foram resolvidas antes da evidência final: agregado com duas reservas e apenas1ns agora é recusado (2ns permanece válido); exemplos de duração explicitam a omissão de componentes zero; e o limite período×quantidade foi nomeado como `duracaoReservada`, sem aplicá-lo indevidamente à soma por recurso. O teste adicional cobre a fronteira matemática; os textos foram conciliados com Architect sem mudar a semântica das métricas.

Build final conferido nos artefatos: lint/typecheck aprovados, **96/96 unitários** e **334/334 execuções de navegador**, com **0 inesperadas, 0 flaky e 0 skipped**. Inclui15 unitários e56 execuções RF12 (28cenários×desktop/mobile); as rodadas iniciais14/56 e95/334 mantêm sua origem e não são somadas como cobertura adicional. Conferidos **11/11 digests** de código/testes/capturas e hashes do log final/JSON Playwright, todos correspondentes aos arquivos atuais. A suíte de navegador usa Chrome com viewports1366×900 e390×844 e timezone Asia/Tokyo. Capturas de resultado desktop/mobile foram inspecionadas nesta revisão, com aviso de simulação e conteúdo legível, sem equivaler ao aceite humano.

Todas as APIs da suíte RF12 são interceptadas: estes resultados comprovam o cliente controlado, não serviço agregador, endpoint, autorização por perfil, cálculo/seleção SQL ou E2E Spring/MySQL RF12. O facilitador manual é igualmente fictício. Backend/HTTP/perfis definitivos permanecem pendentes e exigirão conciliação/testes reais; o legado #37 conserva seu próprio escopo. CodeRabbit local indisponível não é aprovação dessa ferramenta, e nenhum resultado de CI remota foi produzido pelo build local. Revisão visual do autor, solicitação de commit, publicação/PR e integração continuam com checkpoints separados. QA não executou suítes, servidores, Git ou SQL nem acessou credenciais; registrou somente o parecer nesta seção, preservando a revisão documental histórica.
