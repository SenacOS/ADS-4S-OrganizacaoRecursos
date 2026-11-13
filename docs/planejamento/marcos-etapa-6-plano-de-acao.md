# Marcos — plano de ação da etapa 6: relatórios e mensagens

**Checkpoint de13/11/2026: #40/#41 mesclados; integração HTTP real implementada e validada localmente.** Branch `feature/marcos-6-integracao-real`, sobre develop `8065626`: rota conciliada, menu ADMINISTRADOR, package277, build97/346 e **13/0 reais**. [Story atual](../stories/marcos-6-integracao-real.md), [resultados/limites](../testes/marcos-6-integracao-real-resultados.md) e [roteiro humano](../testes/marcos-6-integracao-real-verificacao.md). [Aceite humano registrado](../testes/marcos-6-integracao-real-aceite-2026-11-13.md): implementação e validação local concluídas. Sem novo commit/push; revisão independente/equipe e entrega permanecem pendentes. Etapas1–5 permanecem encerradas.

Histórico da entrega controlada: branch `feature/marcos-6-relatorios`, commits `7ff3aca` e `73e59e0`, mesclados pelo #40. Marcos aprovou a primeira interface e a adaptação ao DTO #39. Naquela adaptação houve somente inspeção do backend, sem testes Java/MySQL; suas provas97/346 não são a rodada real atual. A nova branch incorpora toda a develop, incluindo a composição Spring e o endpoint entregues no #41, sem mudança autoral de Java/SQL.

O [plano anterior](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/7ff3aca88196753c76d13832112f63b84adc2ee3/docs/planejamento/marcos-etapa-6-plano-de-acao.md), o [registro96/334](../testes/marcos-6-resultados.md) e seu aceite pertencem ao incremento anterior. O registro atual é [compatibilidade #39](../testes/marcos-6-rf12-39-resultados.md), com [story](../stories/marcos-6.md), [contrato adotado/histórico](../api/relatorios-utilizacao-proposta.md) e [novo roteiro visual](../testes/marcos-6-rf12-39-verificacao.txt). As etapas1a5 e seu PR documental #38 continuam separados.

## 1. Responsabilidades e entregas efetivas

| Frente | Responsável / situação |
|---|---|
| Interface/consumo RF12 | Marcos: cliente, filtros, resumo/tabela, unidade/minutos, mensagens, guarda de perfil, testes e evidências. |
| Leitura #37 | Porta, resumo de conflitos e adaptador MySQL existentes; não são endpoint. |
| Serviço/DTO #39 | Silva/Fausto: `ConsultarRelatorioUtilizacao`, `RelatorioUtilizacaoTransacional` e `RelatorioUtilizacaoResponse` entregues com testes de serviço/DTO próprios. Reutilizam o cálculo `UtilizacaoReservas`. |
| HTTP e composição Spring | Entregues pelo #41: controller e bean transacional no `Item18Config`. O package atual inclui os testes Java do controller/proxy; a rodada13/0 usa a API e MySQL reais, sem declarar todas as corridas/isolamentos certificados. |
| Autorização | #39 recusa Solicitante/Responsável no serviço e admite ADMINISTRADOR provisoriamente. Marcos adota a mesma restrição na interface; política definitiva e prova HTTP permanecem do backend/equipe. |
| Revisão/entrega | QA independente do incremento, revisão visual nova de Marcos, commit quando solicitado, depois publicação/PR/revisão/merge conforme autorização. |

## 2. Contrato adotado no frontend

A rota efetiva é **`GET /api/reservas/relatorio-utilizacao`**, entregue no #41; a candidata `/api/relatorios/utilizacao` foi substituída no cliente, fixtures e prévia. `inicio`/`fim` com offset obrigatórios e `recursoId` positivo opcional. O endpoint também aceita `estados`, mas a tela mantém o padrão sem acrescentar seletor. Não envia papel/solicitante, não pede CSRF no GET e não inventa paginação ou limite de período.

O corpo adotado é o DTO efetivo #39: `inicio`, `fim`, `recursoId`, `estados`, `minutosReservados`, `reservasConsideradas`, `porRecurso[{recursoId,minutos}]`, `porStatus[{status,minutos}]` e `conflitosEvitados[]` com os campos de evento descritos no contrato. A contagem visível de conflitos é o tamanho da lista validada. `porStatus` é validado/projetado internamente, sem nova tabela/gráfico.

O candidato anterior com `periodo`, `duracaoReservada`, `duracaoAlocada`, `estadosConsiderados` e contagem numérica de conflitos é histórico. Não será consumido como fallback nem imposto ao backend #39.

## 3. Semântica e validações

- Durações são **minutos inteiros truncados pelo servidor**.59s podem aparecer como0min, mesmo com uma reserva e alocações válidas. A interface informa esse comportamento e não tenta recuperar segundos/nanos ausentes do DTO.
- Total por reserva continua distinto da soma dos recursos. Uma reserva1h com3recursos:60min no total e60min em cada linha. Totais e grupos são truncados separadamente: duas reservas59s em recursos/estados distintos podem produzir total1min e linhas0min.
- Validar números/IDs representáveis com segurança no JavaScript, listas/IDs únicos, conjunto padrão de estados, eco de filtro/instantes e coerência compatível com truncamento. Somas de conferência usam BigInt; não exigir que soma das linhas seja igual ao total.
- **Filtro do #39:** seleciona reservas que contêm o recurso informado, mas mantém os demais recursos vinculados. A tabela os exibe e explica o escopo. Sob a política provisória ADMIN não é aplicado filtro visual para fingir projeção exclusiva no servidor.
- Conflitos são contados pelo momento do evento em `[inicio,fim)`. O intervalo solicitado da tentativa pode estar fora desse período; não usá-lo para excluir o evento. Validar IDs/origem/instantes, sem exibir identidade do solicitante.
- Menu e acesso por URL direta exclusivos de ADMINISTRADOR, com HTTP entregue e conciliado; o backend revalida a permissão.
- Formato atual de data preservado por decisão de Marcos. Não foi introduzida máscara dd/mm/aaaa nem alterado o transporte ISO com offset.

## 4. Sequência e critérios de saída

### A — Preparação anterior e primeira interface

Concluída e publicada em `7ff3aca`, com build96unitários/334navegador, QA e aceite visual próprios. Esse resultado não aprova antecipadamente a adaptação posterior.

### B — Compatibilidade controlada com #39

SM/Architect refinaram story/contrato após o pedido explícito de Marcos. Implementar DTO/minutos, lista de conflitos e guarda ADMIN, mantendo consulta única, filtros preservados, invalidação de resultado ao editar, descarte de respostas antigas, erros/sessão, texto seguro, foco e responsividade. Atualizar as fixtures e o facilitador manual identificado como **Dados simulados**, sem fallback de produto.

**Saída:** novo build (lint/typecheck/unitários/navegador), QA independente e nova revisão visual de Marcos. Resultados e pendências ficam no registro atual. Mocks comprovam o consumo/apresentação, não o agregador Java/SQL nem autorização HTTP.

### C — Integração real

Backend/endpoint entregues e incorporados pela base8065626. Cliente/fixtures conciliados com #41 e link de menu ADMIN habilitado. Executado `node tests/e2e-local/validar-relatorios.cjs`:13/0 reais, mesma origem, Spring/MySQL isolados e12fontes servidas correspondentes ao JAR. [Inventário](../testes/marcos-6-integracao-real/inventario.json).

Provar perfis permitidos/negados, período/offset, total multirrecurso, vínculos incluídos no filtro, truncamento e zero com reservas, vazio/conflitos positivos, ocorrência semiaberta e respostas de erro. Comparar números com dados conhecidos/domínio/SQL e verificar a transação real, sem reutilizar as execuções anteriores como se fossem RF12 HTTP.

**Saída atual:** E2E real separado concluído e roteiro humano aprovado por Marcos em13/11/2026. [Aceite](../testes/marcos-6-integracao-real-aceite-2026-11-13.md). Implementação e validação local da etapa6 concluídas no escopo implementado; revisão técnica assistida, sem independência atribuída. Revisão independente/equipe e entrega do novo recorte permanecem pendentes. Falha/ausência da API continua erro, nunca relatório fictício; etapa6 global não foi marcada Done.

### D — Publicação de cada incremento

**Autorização posterior em13/11/2026:** Marcos pediu commit, push e abertura do PR da integração real após o aceite. O commit que contém este registro identifica a entrega local; publicação e PR são confirmados pelo remoto. Revisão independente/equipe, checks e merge continuam pendentes. As descrições abaixo que aguardavam solicitação conservam a sequência anterior; não exigem nova autorização para as três ações já pedidas.

O commit/push/PR do incremento controlado já foi entregue pelo #40. O recorte real atual tem aceite próprio de Marcos, mas ainda não tem commit/push; somente seguirá após nova solicitação. As revisões/aceites anteriores conservam suas versões.

Atualizar File List, story, RTM, resultados e hashes. Após os gates, apresentar a prévia atual e obter o aceite de Marcos antes do próximo commit. O pedido anterior de commit/push publicou `7ff3aca`; não é autorização automática para publicar esta adaptação. PR/revisão/merge seguem seus pedidos próprios.

No incremento controlado anterior, Marcos aprovou a adaptação e autorizou commit/push/PR, efetivados pelo #40. Esse pedido histórico não autoriza publicar o recorte real atual; o aceite de hoje conclui sua revisão humana e mantém os próximos passos de entrega separados.

## 5. Limites preservados

RF11 mantém o modo simulado e procedimentos já registrados no fechamento1a5. Não criar caixa de notificações, polling, status de entrega externo ou mensagem de entrega por inferência do sucesso de reserva. CSV, gráficos, rankings, taxa de ocupação e novos filtros não integram este recorte.

CodeRabbit local permanece indisponível; registrar a limitação e o parecer QA efetivo. O scanner Maven compartilhado segue o tratamento orientado por Marcos, sem converter build local em aprovação de CI remota.
