# Documentacao do Projeto

## Fechamento delegado — 13/11/2026

Marcos comunicou carta branca da equipe e adotou as decisões do [ADR-007](arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Os contratos atuais, incluindo vínculo com todos os recursos, ficam formalizados **por decisão delegada de Marcos**, sem atribuir assinaturas individuais aos demais integrantes. Datas com offset, PATCH conjunto,409/FORA_DO_EXPEDIENTE, estados/perfis de edição/cancelamento e escopos/erros Q9 permanecem como implementados; Q1/Q3/Q8 preservadas.

Processo de vínculos definido no [runbook restrito](operacao/vinculos-responsaveis.md), com [SQL reutilizável](operacao/vinculos-responsaveis.sql). Administrador autoriza, operador SQL executa pares explícitos com referência/registro; concessão exige RESPONSAVEL e recurso ativos, revogação remove pares obsoletos e é idempotente.

RF11 adotada no **modo simulado real** previsto no ADR-006: base/processo exclusivos, worker e GatewayNotificacaoPadrao reais, URL vazia, log rastreável e ENVIADA na outbox. Sem envio externo. [Procedimento de demonstração](operacao/demonstracao-fechamento.md), [story](stories/marcos-fechamento-delegado-1.md) e [resultados/limites](testes/marcos-fechamento-delegado-1-resultados.md). A execução local não é implantação no ambiente compartilhado.

As menções anteriores a ratificação por integrante, processo indefinido ou modo RF11 aguardando decisão são históricas e foram superadas por esta delegação. Resultados antigos conservam sua origem. Restam revisão do incremento pelo autor, commit/publicação quando solicitados e revisão/integração dos PRs; não há fechamento global de todos os RFs por inferência.



## Fechamento vigente de Marcos — pós-merges #32/#33

**Alinhamento para publicação:** Marcos autorizou publicar a conciliação e informou que ainda não recebeu confirmações novas. [Pendências por responsável e texto pronto para encaminhar](integracao/marcos-pendencias-fechamento-2026-11-13.md). Evidências compartilhadas RF10/RF11/segurança agora relacionadas à CI43447037478: auditoria MySQL5, auditoria de usuário1 e controller4; outbox MySQL8 com gateway Mockito; gateway HTTP WireMock5; sessão/segurança/Q9 conforme matriz. Isso comprova os recortes executados, sem transformar gateway de teste em recebimento externo ou ratificação contratual. O modo de demonstração/aceite RF11 ainda exige confirmação da responsável. Commit/push/PR documental autorizados; nenhuma mensagem externa ou merge automático.


**Atualização Q8/MySQL:** [PR #34](https://github.com/SenacOS/ADS-4S-OrganizacaoRecursos/pull/34) aprovado por Marcos e mesclado1948e69;9testes ReservaAprovacaoMysqlIT aprovados na CI43447037478 (incluídos nos66MySQL), mais261unitários/HTTP, JaCoCo/JMeter aprovados. [Evidências e limites](testes/marcos-q8-pr34-evidencias.json). Base documental atual1948e69, onze documentos preservados antes do fast-forward. Sem mudança de produção/reexecução local nesta rodada; scanner compartilhado continua com tratamento já alinhado. A lacuna específica Q8/MySQL está relacionada; ratificação contratual, operação dos vínculos, demais provas compartilhadas e publicação documental continuam separadas.

Os parágrafos seguintes registram a sincronização e os testes locais anteriores ao #34; a base vigente é1948e69.


Frontend até a etapa5 e complemento E2E integrados. Corretivo #32 aprovado por outro integrante e mesclado; #33/Q8 integrado. Base de trabalho62cd48f na branch `docs/marcos-fechamento-etapas`, com documentação local preservada. Revalidação direcionada8/0unitários Q8 e12/0reais Q9/Q1/Q3, sem repetir ou reatribuir provas anteriores.

- [Plano atual e pendências por responsável](planejamento/marcos-fechamento-etapas-1-a-5.md).
- [Estado/limites das conferências](testes/marcos-fechamento-status-2026-11-13.md) e [prova após os merges](testes/marcos-fechamento-pos-merge-32-33.json).
- [Sequência de fechamento](integracao/marcos-fechamento-entrega.md) e [texto para alinhamento manual](integracao/marcos-qualitygate-equipe-2026-11-13.md).

Faltam publicação da conciliação, ratificação contratual, operação dos vínculos e relação de evidências compartilhadas. Scanner compartilhado temporariamente não bloqueante por orientação de Marcos; CodeRabbit indisponível. Sem nova tela prevista até a etapa5 aguardando implementação.

## Registros históricos — estados de cada execução

As seções seguintes mantêm a proveniência de cada incremento. Expressões de GET ausente, aceite/publicação pendentes ou scanner/gate ainda não conferidos descrevem suas datas; o estado vigente é o checkpoint acima.


Complemento de fechamento em12/11: [11 cenários reais aprovados e matriz](testes/marcos-fechamento-e2e-1-resultados.md), [story](stories/marcos-fechamento-e2e-1.md) e [sequência de entrega/descrição do PR](integracao/marcos-fechamento-entrega.md). Produto0775715 enviado; testes novos ainda sem commit. Implementação/validação local e entrega/revisão/checks/merge permanecem estados distintos.

Checkpoint do frontend em 12/11/2026: [plano de fechamento das etapas 1 a 5](planejamento/marcos-fechamento-etapas-1-a-5.md), [story de consulta/edição/cancelamento](stories/marcos-3-consulta-edicao.md) e [resultados locais mais recentes](testes/marcos-3-consulta-edicao-resultados.md). Consulta/Q9 entregue; complemento da etapa 3 implementado/testado e [aceito visualmente por Marcos, com commit local autorizado](testes/marcos-3-consulta-edicao-aceite-visual-2026-11-12.md); publicação e entrega integrada continuam separadas. Esta referência não muda o estado dos demais artefatos acadêmicos abaixo.

**Estado: PROPOSTO**

Os documentos do projeto academico devem ficar sob `docs/`. Esta organizacao e uma proposta de trabalho, nao uma decisao arquitetural aprovada. O material do framework AIOX permanece em `.aiox-core/` e nao deve ser confundido com os entregaveis do projeto.

## Organizacao proposta

| Pasta ou arquivo | Conteudo previsto | Estado |
|---|---|---|
| `contexto-inicial-agentes.md` | Escopo, restricoes, ambiguidades e contexto inicial fornecidos pela equipe | Referencia atual; conferir com a equipe antes de substituir |
| `dominio/` | Glossario, regras de negocio, ciclo de vida e decisoes de dominio | PROPOSTO |
| `personas/` | Descricao das personas e jornadas, distinta dos perfis de autorizacao | PENDENTE de descoberta |
| `requisitos/` | Requisitos funcionais e nao funcionais refinados, criterios de aceitacao e RTM | PENDENTE de refinamento |
| `arquitetura/adr/` | ADR-001 a ADR-006 (monólito, MySQL, concorrência, sessão, políticas, timezone) | APROVADO |
| `arquitetura/` (diagramas) | C4 contexto/componentes e sequências críticas | PENDENTE |
| `qualidade/` | Plano e evidencias de testes, defeitos e relatorio de qualidade | PENDENTE de planejamento e execucao |
| `entrega/` | Instrucoes e artefatos finais de apresentacao e demonstracao | PENDENTE |

Criar subpastas quando houver um artefato real a registrar; nao criar documentos ou diretorios vazios apenas para antecipar estrutura. Requisitos, personas, arquitetura e plano de qualidade devem permanecer identificados pelos seus estados (`PROPOSTO`, `EM ANALISE`, `APROVADO`, `IMPLEMENTADO`, `VALIDADO` ou `PENDENTE`).

## Estado observado

**Estado: EM ANALISE**

Na inspecao de 2026-10-20, `docs/contexto-inicial-agentes.md` era o unico documento do projeto em `docs/`. O repositorio nao continha codigo de aplicacao nem artefatos de dominio, personas ou requisitos refinados. O scaffold e as configuracoes AIOX presentes no workspace nao comprovam que a aplicacao foi implementada ou que suas escolhas estejam aprovadas.

O desalinhamento entre o contexto (Java 21/Spring Boot 3.x) e o preset `nextjs-react` do AIOX foi resolvido: `.aiox-core/data/technical-preferences.md` agora indica o preset `java`.

## Primeiro artefato

- [Proposta de dominio e ciclo de vida das reservas](dominio/proposta-dominio-reservas.md) — **PROPOSTO**; depende de validacao da equipe e esclarecimento de ambiguidades.

## Incremento de Marcos — 10/11/2026

O diagnóstico de outubro acima é histórico. O backend e os contratos já estão na develop; este incremento acrescenta a base do cliente.
- [Responsabilidades completas, mapa de telas, plano e quatro respostas para a equipe](planejamento/marcos-plano-de-acao.md).
- [Story Marcos-1](stories/marcos-1.md).
- [Autenticação atual e consumo dos clientes JS](api/frontend-integracao.md).
- [Resultados locais e limites da validação](testes/marcos-1-resultados.md).
- [Aceite do contrato pelo cliente](stories/marcos-contrato-1.md) e [leitura da fila ainda não implementada](api/reservas-leitura-contrato.md).
- [Login/logout e entrada por perfil — Marcos-2](stories/marcos-2.md), com [evidências de navegador](testes/marcos-2-resultados.md).
- [Pesquisa e criação de reservas — Marcos-3](stories/marcos-3.md): primeiro recorte da etapa 3, com [evidências e limites](testes/marcos-3-resultados.md). Listagem/edição/cancelamento de reservas existentes continuam dependentes da leitura autorizada.
- [Fila e decisões — Marcos-4](stories/marcos-4.md): cliente da especificação aceita, com [evidências e limites](testes/marcos-4-resultados.md). Implementação/autorização da leitura no backend e integração real continuam pendentes.
- [Conciliação da Marcos-4 com a etapa 5](testes/marcos-4-conciliacao-resultados.md): checkout separado baseado em movimentações; comandos e evidência da regressão conjunta, preservando as execuções anteriores.

- [Administração de recursos — Marcos-5](stories/marcos-5.md): recorte de cadastros, manutenção e expediente, independente da fila/Q9. Movimentações possuem story própria abaixo; integração real permanece pendente. [Resultados e limites](testes/marcos-5-resultados.md).
- [Movimentações — complemento da etapa 5](stories/marcos-5-movimentacoes.md): retirada, pendências e devolução, sem consulta de reservas/Q9. Aceite visual e commit autorizados por Marcos em 11/11/2026, encerrando a implementação local da etapa 5 junto à administração. Revisão da equipe, CI e integração continuam pendentes. [Resultados e limites](testes/marcos-5-movimentacoes-resultados.md).


## Etapa6 — frontend controlado dos relatórios RF12

Primeira interface publicada em7ff3aca, com [resultados históricos96/334](testes/marcos-6-resultados.md). Após Marcos pedir adotar o #39, cliente/tela foram adaptados ao DTO de minutos/listas, guarda ADMIN provisória e filtro que mantém recursos vinculados. [Plano6](planejamento/marcos-etapa-6-plano-de-acao.md), [story](stories/marcos-6.md), [contrato adotado](api/relatorios-utilizacao-proposta.md), [resultados atuais](testes/marcos-6-rf12-39-resultados.md) e [revisão visual](testes/marcos-6-rf12-39-verificacao.txt). API controlada/prévia são simuladas. Novo build97/346, QA e revisão visual aprovados; Marcos autorizou commit/push/PR em13/11/2026. Controller, bean e E2E HTTP real continuam pendentes. Encerramento1a5 segue separado.
