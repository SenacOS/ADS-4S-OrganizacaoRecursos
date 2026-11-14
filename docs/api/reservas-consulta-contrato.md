# Reservas — consultas entregues no PR #26

## Fechamento delegado — 13/11/2026

Marcos comunicou carta branca da equipe e adotou as decisões do [ADR-007](../arquitetura/adr/ADR-007-fechamento-contratos-vinculos-rf11.md). Os contratos atuais, incluindo vínculo com todos os recursos, ficam formalizados **por decisão delegada de Marcos**, sem atribuir assinaturas individuais aos demais integrantes. Datas com offset, PATCH conjunto,409/FORA_DO_EXPEDIENTE, estados/perfis de edição/cancelamento e escopos/erros Q9 permanecem como implementados; Q1/Q3/Q8 preservadas.

Processo de vínculos definido no [runbook restrito](../operacao/vinculos-responsaveis.md), com [SQL reutilizável](../operacao/vinculos-responsaveis.sql). Administrador autoriza, operador SQL executa pares explícitos com referência/registro; concessão exige RESPONSAVEL e recurso ativos, revogação remove pares obsoletos e é idempotente.

RF11 adotada no **modo simulado real** previsto no ADR-006: base/processo exclusivos, worker e GatewayNotificacaoPadrao reais, URL vazia, log rastreável e ENVIADA na outbox. Sem envio externo. [Procedimento de demonstração](../operacao/demonstracao-fechamento.md), [story](../stories/marcos-fechamento-delegado-1.md) e [resultados/limites](../testes/marcos-fechamento-delegado-1-resultados.md). A execução local não é implantação no ambiente compartilhado.

As menções anteriores a ratificação por integrante, processo indefinido ou modo RF11 aguardando decisão são históricas e foram superadas por esta delegação. Resultados antigos conservam sua origem. Restam revisão do incremento pelo autor, commit/publicação quando solicitados e revisão/integração dos PRs; não há fechamento global de todos os RFs por inferência.


Conferência do frontend em 12/11/2026, develop `3f2a9a3`. GETs implementados e exercitados com Spring/MySQL reais na [integração Q9](../testes/marcos-integracao-q9-1-resultados.md). O aceite de Marcos para consumir o comportamento atual não equivale à ratificação de todos os integrantes.

Revalidação posterior na develop **4cea177**, após PR #27: contrato externo preservado, fila encaminhada ao caso de uso/adaptador existente e predicado Q9 compartilhado. [10 cenários reais aprovados](../testes/marcos-integracao-q9-1-pr27-resultados.md), incluindo paginação vazia e revogação de consulta/decisão.

## Listagem e detalhe

`GET /api/reservas` recebe `status` (estado exato opcional), `inicio`/`fim` (juntos, ISO com offset), `recursoId` positivo opcional, `pagina` >= 0 (padrão 0) e `tamanho` 1–100 (padrão 20). O período filtra por sobreposição: início da reserva < fim consultado e fim da reserva > início consultado. Ordenação por início/id crescentes, paginação e total no servidor. Retorno `{itens,pagina,tamanho,total}`; página além do total pode ter itens vazios.

`GET /api/reservas/{id}` retorna a projeção completa autorizada, sem envelope. Campos: `id`, `solicitanteId`, `status`, `restrita`, `inicio`, `fim`, `recursosIds`, `motivoDecisao`, `solicitante` e `recursos`. Datas em São Paulo com offset. `solicitante` contém `usuarioId` e identificação mínima `Solicitante <id>`. Cada recurso contém `id`, `tipo`, `identificacao` e `patrimonio` quando aplicável. Não há e-mail/contato, competência adicional ou novo campo de criação.

## Escopo da sessão

- Solicitante: próprias reservas.
- Administrador: todas, sem herdar aprovação/rejeição.
- Responsável: precisa estar vinculado a **todos** os recursos da reserva. Vínculo parcial não libera detalhe nem decisão. A consulta `status=SOLICITADA` para esse perfil limita a fila às restritas pendentes.

O ator vem da sessão; filtros não ampliam o escopo. Fora do escopo ou inexistente no detalhe: 404 `NAO_ENCONTRADO`. Sem sessão: 401; parâmetro inválido: 400 `REQUISICAO_INVALIDA`; escrita sem autorização: 403. Mantém-se o envelope de erro `{codigo,mensagem,correlationId}` e CSRF dinâmico em toda escrita.

Marcos aceitou em12/11 consumir a regra de todos os recursos e a adotou sob delegação no ADR-007 em13/11. O processo administrativo de vínculos está definido e demonstrado no recorte delegado. V6 cria `responsaveis_recursos` vazia; não há endpoint público de concessão. As provas usam bases/IDs próprios, sem provisionar automaticamente o ambiente compartilhado.

Leitura permitida não concede edição/cancelamento. A [interface geral implementada localmente](../stories/marcos-3-consulta-edicao.md) usa as regras de escrita atuais e exige GET de detalhe antes dessas ações; [provas e limites](../testes/marcos-3-consulta-edicao-resultados.md). A fila já usa a projeção suficiente para avaliar sem exigir GET de detalhe separado.

Fontes de implementação: `ReservaLeituraController`, `ReservaLeituraResponse`, `ReservaConsultaMysql`, `ReservaAcessoMysql`, V6 e [documento de segurança](../seguranca/q9-autorizacao-reservas.md). [Especificação da fila](reservas-leitura-contrato.md).
