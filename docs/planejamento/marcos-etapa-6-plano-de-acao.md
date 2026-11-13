# Marcos — plano de ação da etapa 6: relatórios e mensagens

**Checkpoint de13/11/2026: compatibilidade controlada com o PR #39 implementada; build97/346, QA e nova revisão visual aprovados. Marcos autorizou commit/push/PR. Integração HTTP real pendente.**

Branch `feature/marcos-6-relatorios`, incremento anterior publicado em `7ff3aca`. Marcos aprovou a primeira interface e depois pediu **“vamos usar o que foi feito na #39”**. O #39 foi mesclado na develop em `acf94fa80b90756905b6908e3a53cdc6d3369259`; a referência `origin/develop` foi atualizada para inspeção. Não houve merge desse backend na branch do frontend, alteração Java ou execução de testes Java/MySQL por esta adaptação.

O [plano anterior](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/blob/7ff3aca88196753c76d13832112f63b84adc2ee3/docs/planejamento/marcos-etapa-6-plano-de-acao.md), o [registro96/334](../testes/marcos-6-resultados.md) e seu aceite pertencem ao incremento anterior. O registro atual é [compatibilidade #39](../testes/marcos-6-rf12-39-resultados.md), com [story](../stories/marcos-6.md), [contrato adotado/histórico](../api/relatorios-utilizacao-proposta.md) e [novo roteiro visual](../testes/marcos-6-rf12-39-verificacao.txt). As etapas1a5 e seu PR documental #38 continuam separados.

## 1. Responsabilidades e entregas efetivas

| Frente | Responsável / situação |
|---|---|
| Interface/consumo RF12 | Marcos: cliente, filtros, resumo/tabela, unidade/minutos, mensagens, guarda de perfil, testes e evidências. |
| Leitura #37 | Porta, resumo de conflitos e adaptador MySQL existentes; não são endpoint. |
| Serviço/DTO #39 | Silva/Fausto: `ConsultarRelatorioUtilizacao`, `RelatorioUtilizacaoTransacional` e `RelatorioUtilizacaoResponse` entregues com testes de serviço/DTO próprios. Reutilizam o cálculo `UtilizacaoReservas`. |
| HTTP e composição Spring | Backend: ainda faltam controller/contrato de rota e registro do serviço transacional no `Item18Config`. A anotação transacional não prova uma chamada real pelo proxy Spring. |
| Autorização | #39 recusa Solicitante/Responsável no serviço e admite ADMINISTRADOR provisoriamente. Marcos adota a mesma restrição na interface; política definitiva e prova HTTP permanecem do backend/equipe. |
| Revisão/entrega | QA independente do incremento, revisão visual nova de Marcos, commit quando solicitado, depois publicação/PR/revisão/merge conforme autorização. |

## 2. Contrato adotado no frontend

A rota `GET /api/relatorios/utilizacao` e os nomes de query continuam **candidatos**, pois #39 não entrega HTTP. A consulta controlada usa `inicio`, `fim` com offset e `recursoId` opcional. Não envia papel/solicitante, não pede CSRF no GET e não acrescenta seletor de estados, paginação ou limite de período inventado.

O corpo adotado é o DTO efetivo #39: `inicio`, `fim`, `recursoId`, `estados`, `minutosReservados`, `reservasConsideradas`, `porRecurso[{recursoId,minutos}]`, `porStatus[{status,minutos}]` e `conflitosEvitados[]` com os campos de evento descritos no contrato. A contagem visível de conflitos é o tamanho da lista validada. `porStatus` é validado/projetado internamente, sem nova tabela/gráfico.

O candidato anterior com `periodo`, `duracaoReservada`, `duracaoAlocada`, `estadosConsiderados` e contagem numérica de conflitos é histórico. Não será consumido como fallback nem imposto ao backend #39.

## 3. Semântica e validações

- Durações são **minutos inteiros truncados pelo servidor**.59s podem aparecer como0min, mesmo com uma reserva e alocações válidas. A interface informa esse comportamento e não tenta recuperar segundos/nanos ausentes do DTO.
- Total por reserva continua distinto da soma dos recursos. Uma reserva1h com3recursos:60min no total e60min em cada linha. Totais e grupos são truncados separadamente: duas reservas59s em recursos/estados distintos podem produzir total1min e linhas0min.
- Validar números/IDs representáveis com segurança no JavaScript, listas/IDs únicos, conjunto padrão de estados, eco de filtro/instantes e coerência compatível com truncamento. Somas de conferência usam BigInt; não exigir que soma das linhas seja igual ao total.
- **Filtro do #39:** seleciona reservas que contêm o recurso informado, mas mantém os demais recursos vinculados. A tabela os exibe e explica o escopo. Sob a política provisória ADMIN não é aplicado filtro visual para fingir projeção exclusiva no servidor.
- Conflitos são contados pelo momento do evento em `[inicio,fim)`. O intervalo solicitado da tentativa pode estar fora desse período; não usá-lo para excluir o evento. Validar IDs/origem/instantes, sem exibir identidade do solicitante.
- Acesso por URL direta exige sessão de ADMINISTRADOR. Sem novo item de menu até a entrega HTTP; o backend deve sempre revalidar a permissão.
- Formato atual de data preservado por decisão de Marcos. Não foi introduzida máscara dd/mm/aaaa nem alterado o transporte ISO com offset.

## 4. Sequência e critérios de saída

### A — Preparação anterior e primeira interface

Concluída e publicada em `7ff3aca`, com build96unitários/334navegador, QA e aceite visual próprios. Esse resultado não aprova antecipadamente a adaptação posterior.

### B — Compatibilidade controlada com #39

SM/Architect refinaram story/contrato após o pedido explícito de Marcos. Implementar DTO/minutos, lista de conflitos e guarda ADMIN, mantendo consulta única, filtros preservados, invalidação de resultado ao editar, descarte de respostas antigas, erros/sessão, texto seguro, foco e responsividade. Atualizar as fixtures e o facilitador manual identificado como **Dados simulados**, sem fallback de produto.

**Saída:** novo build (lint/typecheck/unitários/navegador), QA independente e nova revisão visual de Marcos. Resultados e pendências ficam no registro atual. Mocks comprovam o consumo/apresentação, não o agregador Java/SQL nem autorização HTTP.

### C — Integração real

Quando o backend entregar composição Spring e endpoint: conferir contrato HTTP, rota/parâmetros/erros, DTO e política; incorporar a base de forma rastreável e conciliar diferenças. Testar mesma origem com Spring/MySQL isolados e identidade do JAR/fontes, sem interceptações.

Provar perfis permitidos/negados, período/offset, total multirrecurso, vínculos incluídos no filtro, truncamento e zero com reservas, vazio/conflitos positivos, ocorrência semiaberta e respostas de erro. Comparar números com dados conhecidos/domínio/SQL e verificar a transação real, sem reutilizar as execuções anteriores como se fossem RF12 HTTP.

**Saída:** E2E real separado e revisão do autor. Até lá, falha/ausência da API é erro, nunca relatório fictício.

### D — Publicação de cada incremento

Atualizar File List, story, RTM, resultados e hashes. Após os gates, apresentar a prévia atual e obter o aceite de Marcos antes do próximo commit. O pedido anterior de commit/push publicou `7ff3aca`; não é autorização automática para publicar esta adaptação. PR/revisão/merge seguem seus pedidos próprios.

Marcos aprovou a nova revisão em13/11/2026 e pediu expressamente commit, push e abertura de PR. O incremento controlado está Ready for Review para essa entrega. A autorização atual contempla essas três ações; merge e conclusão do RF12 integrado continuam separados.

## 5. Limites preservados

RF11 mantém o modo simulado e procedimentos já registrados no fechamento1a5. Não criar caixa de notificações, polling, status de entrega externo ou mensagem de entrega por inferência do sucesso de reserva. CSV, gráficos, rankings, taxa de ocupação e novos filtros não integram este recorte.

CodeRabbit local permanece indisponível; registrar a limitação e o parecer QA efetivo. O scanner Maven compartilhado segue o tratamento orientado por Marcos, sem converter build local em aprovação de CI remota.
