# Marcos-6 — compatibilidade controlada com o PR #39

**13/11/2026 — implementação, build, QA e nova revisão visual de Marcos aprovados.** Branch `feature/marcos-6-relatorios`, sobre o incremento publicado `7ff3aca88196753c76d13832112f63b84adc2ee3`. Pedido inicial do autor: **“vamos usar o que foi feito na #39”**. Registro preparado para o commit/push e a abertura de PR expressamente autorizados após a nova revisão.

O [PR #39](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/39) foi conferido mesclado em `acf94fa80b90756905b6908e3a53cdc6d3369259`. A referência `origin/develop` foi atualizada para ler serviço/DTO/configuração; não houve merge na branch, alteração Java ou execução local de testes Java/MySQL. O PR entrega aplicação/DTO/classe transacional, mas não controller nem registro do bean no `Item18Config`. Não existe E2E HTTP RF12 comprovado nesta rodada.

Fontes: [story](../stories/marcos-6.md), [contrato adotado](../api/relatorios-utilizacao-proposta.md), [plano atual](../planejamento/marcos-etapa-6-plano-de-acao.md). A [versão anterior96/334](marcos-6-resultados.md), seu aceite e seus hashes pertencem ao commit7ff3aca, preservados como histórico.

## O que mudou

- DTO #39: `inicio`/`fim` no topo, `estados`, `minutosReservados`, `reservasConsideradas`, `porRecurso[{recursoId,minutos}]`, `porStatus[{status,minutos}]` e `conflitosEvitados[]`. O candidato Duration anterior não é aceito como fallback.
- Tela mostra minutos inteiros enviados e conta os eventos da lista validada. Não recupera segundos/frações ausentes. Uma reserva59s pode ter0min; totais e grupos são truncados separadamente. Duas reservas59s em grupos distintos podem dar total1min e linhas0min.
- Guarda provisória ADMINISTRADOR por URL direta, acompanhando a recusa do serviço #39. Solicitante/Responsável não recebem formulário nem geram GET de relatório, inclusive com submit programático. Não acrescenta menu nem alega substituir segurança HTTP.
- Filtro acompanha o serviço: seleciona reservas que contêm o recurso e mantém **todos** os seus vínculos. A tabela mostra as linhas recebidas e explica a abrangência; não aplica projeção exclusiva fictícia.
- Cliente valida eco por instante/recurso, IDs/números seguros, estados, coleções, minutos e coerência dos grupos com truncamento. Conferências de soma/limite usam BigInt; não confundem soma de alocações com total por reserva. `porStatus` é validado/projetado internamente, sem nova tabela/gráfico.
- Conflitos têm IDs únicos, origem do enum e instante em `[inicio,fim)`. O intervalo tentado pode estar fora do período; não é usado para excluir um evento. O frontend não expõe identificação de solicitante nem acrescenta detalhes visuais de eventos.
- Sessão/CSRF compartilhados, erros/texto literal, filtros preservados, envio único, respostas antigas, foco e layout existentes mantidos. Formato atual de data preservado, sem máscara nova. Facilitador de prévia atualizado, exclusivamente local e identificado como **Dados simulados**, sem banco/credenciais.

## Verificações reais desta rodada

| Verificação | Resultado |
|---|---|
| Unitários focais | 16/16 aprovados na primeira execução; o build final reexecutou a suíte com a fronteira por recurso adicional. |
| Primeira tentativa focal no navegador | 64aprovados/4falhos. Falhas da asserção `toBeDisabled` no fieldset: o log mostrava o atributo `disabled`, mas o matcher considerava o fieldset habilitado. Corrigido o alvo para o botão submetido ao fieldset, mantendo a tentativa programática e ausência de GET. Não foi tratado como aprovação nem como evidência de bypass do produto. |
| Build final | **PASS:** `npm.cmd run build` com Chrome: lint/typecheck sem erros, **97/97 unitários e346/346 navegador**,0falhas,0flaky,0skipped. Inclui16unitários e68execuções RF12 (34cenários × desktop/mobile), navegador em Asia/Tokyo. |
| Capturas novas | Desktop1366×900 e celular390×844, sem erros JavaScript e sem overflow horizontal. Fonte: facilitador simulado, não Spring. Inspecionadas pelo agente; não é aceite humano. |
| QA independente | **PASS técnico local**, sem bloqueantes restantes, registrado em QA Results da story. Conferidos logs/contagens/11hashes/capturas; três observações P3/P2/P3 tratadas. Não houve nova execução de suítes pelo revisor. Apto à nova revisão visual humana. |
| CodeRabbit | CLI local ausente/WSL não instalado, limitação já conferida e preservada; sem PASS inventado. |
| E2E HTTP real | Não executado: registro do bean/controller/contrato HTTP ainda ausentes. Testes Java existentes do #39 não foram reexecutados aqui. |

[Evidências/hashes](marcos-6-rf12-39-evidencias.json): base frontend/referência backend, contagens extraídas dos relatórios finais e11SHA-256 de fontes/capturas. Navegador final iniciado em `2026-11-13T19:54:32.194Z`, duração198,900s. Logs locais ignorados: `.aiox-core/local/marcos-6/build-rf12-39.log` (redirect PowerShell UTF16LE) e `test-results/frontend/results.json`. Não somar essas contagens às execuções anteriores.

A revisão intermediária também identificou a fronteira de grupos: total60min/um recurso0min é incoerente, mas total1min/dois recursos0min é válido. O limite de truncamento foi acrescentado e testado com BigInt. SM alinhou os critérios sobre `porStatus` com a proposta: validar/projetar internamente, sem exigir nova UI. Essas observações foram tratadas antes do build final; o parecer QA define suas classificações.

## Revisão visual reproduzível

Seguir o [roteiro novo](marcos-6-rf12-39-verificacao.txt). Iniciar `node tests/browser/relatorios-utilizacao-preview.mjs` e abrir `http://127.0.0.1:4174/pages/relatorios-utilizacao.html`. A identidade Admin e os dados são fictícios; não precisam de login real e não provam política HTTP. Exemplo17/11/2026,10h–11h:1reserva,60min,recursos1/2/3 e1conflito no recurso2 às10h30.

- [Desktop inicial](evidencias/marcos-6-rf12-39/desktop-inicial.png) e [resultado](evidencias/marcos-6-rf12-39/desktop-resultado.png).
- [Celular inicial](evidencias/marcos-6-rf12-39/mobile-inicial.png) e [resultado](evidencias/marcos-6-rf12-39/mobile-resultado.png).

O aceite visual anterior de7ff3aca era histórico. Marcos aprovou expressamente esta adaptação em13/11/2026: **“aprovado, como não temos mais o que avançar na etapa 6, faça o commit, push e abra o PR.”** Novo aceite registrado sem ajustes de código; commit/push/PR autorizados para o incremento controlado. Fontes/capturas e contagens97/346 permanecem as testadas; a aprovação foi atualizada no artefato sem alterar seus hashes. Integração real continua separada.

## Pendências efetivas

1. Publicar o commit/push e abrir o PR autorizados; revisão da equipe, checks remotos e merge seguem o fluxo próprio.
2. Backend entregar bean/proxy transacional e controller, fechar rota/query/erros e a política de autorização. O frontend adotou a regra ADMIN provisória do serviço; não a apresentou como decisão definitiva da equipe.
3. Integrar e testar Spring/MySQL isolados sem interceptação, com hashes/versões: autorização, minutos/recorte, múltiplos vínculos, eventos/limites, zero com reservas, filtros e comparações com dados conhecidos.

DoD do recorte controlado: código/estrutura nativos, critérios de DTO/UX, testes/gates e captura atendidos; documentação/File List e evidências atualizadas. Sem dependências novas. QA/humano/entrega e integração real têm checkpoints separados; a etapa6 global não está Done. Nenhuma CI remota foi executada ou declarada verde; a indisponibilidade compartilhada do scanner Maven mantém o tratamento orientado por Marcos.
