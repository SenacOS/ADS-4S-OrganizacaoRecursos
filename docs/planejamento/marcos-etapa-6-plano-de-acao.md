# Marcos — plano de ação da etapa 6: relatórios e mensagens

Conferência em **13/11/2026**, America/Sao_Paulo. Branch **feature/marcos-6-relatorios**, criada da develop **c4279b6**. **Estado: cliente e interface controlados implementados, QA aprovado e revisão visual aprovada por Marcos; commit/push autorizados. Integração real ainda depende do backend.**

As etapas1a5 já foram integradas e encerradas no escopo de Marcos pelo #36. Seu registro documental está no [PR #38](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/38), separado desta etapa. O merge desse PR documental não é pré-requisito para preparar a6; manter os históricos e as entregas separados.

## 1. Resultado esperado e responsabilidades

Entregar a interface RF12 para consultar utilização por recurso, carga horária alocada e conflitos evitados, com filtros de período/recurso, unidades claras e estados carregando/vazio/erro. A preparação deriva do RF12/RF13/RF14 no [contexto do projeto](../contexto-inicial-agentes.md), do [plano principal](marcos-plano-de-acao.md) e do código integrado no #37.

| Frente | Responsável / entrega |
|---|---|
| Interface e consumo | Marcos: cliente JS, formulário/resultado, mensagens, acessibilidade/responsividade, testes e evidências. |
| Serviço/agregação e contrato HTTP | Silva/Fausto: conectar porta/cálculo, decidir DTO/unidades/semântica/filtros e entregar API. |
| Autorização/dados e erros | Backend com Débora: perfis permitidos, escopo aplicado no servidor e negativas sem vazamento. |
| Revisão e integração | Autor revisa incremento; outro integrante revisa PR; checks e merge seguem fluxo. |

Não atribuir ao aceite delegado das pendências1a5 uma decisão coletiva ainda não recebida sobre RF12. A proposta de contrato desta etapa identifica suas escolhas/questões próprias.

## 2. O que existe e o que falta

| Estado conferido | Artefato / limite |
|---|---|
| Entregue no #37 | `ReservaRelatorioPort`, `ConflitoEvitadoResumo` e `ReservaRelatorioMysql`; leitura persistida e sete testes MySQL/Testcontainers do adaptador. |
| Cálculo existente | `UtilizacaoReservas`: Duration recortada ao período, total por reserva uma vez, por recurso e por status; padrão APROVADA/EM_USO/CONCLUIDA. |
| Não entregue nessa base | Serviço de agregação, DTO HTTP, controller/rota de relatório e sua autorização. Não há API RF12 pronta apenas porque a porta existe. |
| Frontend controlado implementado | [Proposta mínima adotada para desenvolvimento](../api/relatorios-utilizacao-proposta.md), [story Marcos-6](../stories/marcos-6.md), cliente JS e página autenticada por URL direta, sem novo link de menu. Testes interceptados e prévia identificada; não é integração real. |

## 3. Regras para não contar ou expor dados incorretamente

- Uma reserva de1hora com três recursos representa1hora no total de reservas e1hora em cada recurso. A soma das durações por recurso pode ser3horas; não trocar essas métricas nem apresentar uma como ocupação percentual sem denominador/contrato.
- Reservas atravessando o período são recortadas pelo cálculo. Reservas apenas adjacentes não têm duração no intervalo. Os estados padrão já existem no domínio; estados adicionais de filtro dependem de contrato.
- O filtro `recursoId` da porta seleciona a reserva, mas mantém todos os seus vínculos. Serviço/DTO devem projetar somente os recursos filtrados/autorizados; a interface não corrige uma exposição indevida já feita pelo servidor.
- Conflitos evitados são eventos filtrados pelo **momento da ocorrência**, em `[inicio,fim)`, e pelo recurso conflitante. Não são filtrados pelo horário da reserva tentada e não representam horas de uso.
- Definir transporte/unidades e arredondamento antes do cliente final. Duration não é data/hora do relógio; não interpretar como `Date`, concatenar offset ou perder frações por conversão silenciosa.
- O perfil vem da sessão. Não enviar papel/solicitante para ampliar consulta e não herdar automaticamente a política das reservas para um relatório agregado sem decisão de autorização própria.

## 4. Ordem de execução e critérios de saída

### Recorte A — preparar contrato e story

1. Conferir #37, fontes de cálculo/leitura e base de trabalho; registrar limites das evidências existentes.
2. Preparar a proposta mínima de HTTP/DTO, exemplos e perguntas objetivas de acesso, unidades e semântica. Marcar PROPOSTO; rota candidata não é endpoint publicado.
3. Preparar story e critérios dos fluxos de interface/testes, com dependências de contrato explícitas. Não marcar código, teste, aceite ou integração como executados nessa preparação.
4. Conferir documentos/links/File List e encaminhamento para revisão. Commit/publicação dessa preparação somente pelo fluxo solicitado.

**Saída deste recorte:** plano e proposta revisáveis; story preparada com os bloqueios efetivos identificados.

### Recorte B — cliente e interface com contrato definido

Marcos pediu explicitamente seguir este plano. SM/Architect refinaram o mínimo para **cliente/tela controlados**: DTO proposto, Duration temporal H/M/S com até nove frações e apresentação exata, estados fixos e eco de filtros. Esse aceite não define perfis RF12 reais. A página exige sessão, fica disponível por URL direta para verificação controlada e não adiciona ação de menu por perfil. A integração aguarda autorização/HTTP do backend.

Cliente e tela usam sessão, tratamento de erros/datas e layout existentes. Mocks ficam nos testes ou na prévia explicitamente identificada, sem substituir a API do produto ou exibir números fictícios como resultado real. O facilitador `tests/browser/relatorios-utilizacao-preview.mjs` escuta somente em `127.0.0.1:4174` e sinaliza **Dados simulados**; não é importado pelo produto.

Roteiro previsto: período com offset, recurso opcional conforme contrato, envio único da consulta, resultado/total e detalhe por recurso, carregando/vazio/erro, filtros preservados, ausência de resposta antiga sobrescrevendo pesquisa nova, texto seguro, foco/teclado e larguras móvel/desktop. Mostrar a unidade e distinguir horas por reserva das durações por recurso. Não acrescentar CSV, gráficos, ranking ou outra métrica como requisito obrigatório.

**Saída:** testes significativos do cliente e navegador com dados controlados, lint/typecheck/build pertinentes e aceite de Marcos. API controlada comprova o cliente, não a agregação/segurança/persistência do backend.

### Recorte C — integrar com API real

Quando backend entregar serviço/DTO/HTTP/autorização, conferir divergências da proposta, versão e base; implementar o ajuste necessário e testar com sessão/CSRF compartilhados. GETs não passam a exigir CSRF por inferência. Sem sessão401 segue o fluxo de login;403/404/400 seguem os códigos efetivamente contratados, com mensagem e correlationId de suporte.

Provar no ambiente isolado: reserva com vários recursos sem duplicar total, recorte do período, filtro por recurso sem expor outros, estados/zeros, conflito contado no intervalo de ocorrência, perfil/escopo permitidos e negados. Conferir valores da API contra dados conhecidos/MySQL e cálculo, preservando precisão e hashes/versões reais.

**Saída:** evidência real distinta dos mocks e revisão do autor; backend revalida escopo. Não reutilizar execuções anteriores como se fossem da nova API.

### Recorte D — entrega

Atualizar story, File List, RTM, contrato/guia e resultados. Commit após revisão do autor; push/PR, revisão por outro integrante, checks e merge mantêm seus passos próprios. Manter scanner compartilhado/CodeRabbit com o estado efetivo, sem prometer CI aprovada por teste local.

## 5. Mensagens de eventos — limite da etapa

RF11 já tem modo simulado e procedimentos/evidência no ADR-007. A etapa6 preserva mensagens coerentes com a resposta da operação: uma reserva criada/aprovada não implica notificação recebida externamente. Só exibir status de envio se uma API desse dado for contratada. Não criar caixa de notificações, polling, endpoint de disparo ou mensagem de entrega confirmada por inferência.

## 6. Confirmações necessárias ao contrato RF12

| Pergunta | Quem precisa alinhar / efeito |
|---|---|
| Qual rota/DTO HTTP será entregue? | Silva/Fausto; cliente precisa de schema estável e exemplos de sucesso/vazio. |
| Quais perfis e recursos podem consultar agregados? | Backend/Débora; total e projeções devem respeitar o escopo no servidor. |
| Como transmitir Duration e apresentar frações? | Backend/Marcos; evitar perda de precisão e unidade ambígua. |
| Filtro de recurso projeta quais linhas/totais? | Silva/Fausto; porta devolve vínculos completos, serviço precisa delimitar resposta. |
| Quais filtros/estados, ordenação e limites operacionais realmente se aplicam? | Backend/Marcos; não inventar parâmetros, paginação ou prazo máximo. |

A proposta registra alternativas/candidatos e o estado dessas questões. Uma resposta pode indicar decisão ou contrato já existente; nenhuma mensagem externa foi enviada para elaborar este plano.

## 7. Evidências e checkpoint atual

O preparo inicial somente conferiu fontes/documentos. Após o pedido de implementação, foram produzidos cliente, página, CSS, testes unitários/navegador e facilitador de prévia local. [Resultados](../testes/marcos-6-resultados.md) e [roteiro de revisão](../testes/marcos-6-verificacao.txt) registram execução e limites; a [story](../stories/marcos-6.md) acompanha o checklist. As fontes/resultados do #37 mantêm suas versões: não foram reexecutados nem substituem E2E do relatório.

Marcos aprovou a revisão visual em13/11/2026, manteve o formato de data atual e autorizou commit/push. Próximos passos: publicar o incremento autorizado; abertura de PR e revisão da equipe por seu fluxo próprio. Para concluir a etapa 6 integrada, ainda são necessários serviço agregador, DTO/HTTP e autorização RF12, conciliação do contrato e E2E real separado. RF11 não recebeu funcionalidade nova.
